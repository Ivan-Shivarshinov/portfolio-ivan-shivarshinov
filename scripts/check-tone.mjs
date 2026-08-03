#!/usr/bin/env node
// scripts/check-tone.mjs — проверка R9 (03-SPEC.md) и позитивных ассертов AC R1–R7:
// денлист тона (списки «избегать» REQ-tone), ярлыки позиционирования (только index.html,
// Pitfall 7/A5), обязательные тексты страниц фазы 3 (формула обещания, меты блоков,
// каналы Contact), отсутствие демонстрационных маркеров в dist/work (R2 AC).
//
// CLI:
//   node scripts/check-tone.mjs             — аудит собранного dist/ (перед прогоном: npm run build)
//   node scripts/check-tone.mjs --self-test — встроенные фикстуры (известная-хорошая / известная-плохая)
//
// Exit 0 — нарушений нет; exit 1 — есть (вывод списка).

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = join(ROOT, 'dist');

// Денлист тона (REQ-tone «избегать»): stem-подстроки русского текста — хайповый
// AI-first язык, «революционные решения», лишние англицизмы, образ гения-одиночки.
// Стартовый состав — Code Example 4 (03-RESEARCH.md, 21 запись) + «эксперт мирового класса».
// Правило: если запись встречается в легальном контексте финального контента — удалить
// при сверке в 03-06 (прогон по dist), но не опускаться ниже 10 записей (R9).
const DENYLIST = [
  'революционн', 'прорыв', 'инновационн', 'уникальн', 'невероятн', 'взрывн',
  'лучший', 'лучших', 'топовый', 'гений', 'гениальн', 'в одиночку',
  'сделал всё сам', 'ai-first', 'ии-революция', 'будущее за',
  'game changer', 'game-changer', 'полный спектр', 'безграничн', 'хайп',
  'эксперт мирового класса',
];

// Ярлыки позиционирования (REQ-positioning-category) — проверяются ТОЛЬКО по dist/index.html:
// «Product Engineer» легален в траектории /about (REQ-growth-trajectory, Pitfall 7/A5).
// «Product-minded web developer» — разрешённая категория (D-13), в список НЕ входит.
const INDEX_LABELS = [
  'product engineer',
  'ai product developer',
  'aeo/geo specialist',
  'web systems specialist',
  'ai-native developer',
];

// Позитивные ассерты (AC R1–R7): формула обещания, категория и подпись на / (D-13),
// моно-меты 4 блоков About (R5), 2 блоков Lab + честный статус (R6), канал email (R7).
// page — относительный путь от dist/; матчинг — подстрока (меты — Latin-капс моно-слоя).
const REQUIRED_CONTENT = [
  { page: 'index.html', needle: 'Создаю и развиваю сложные сайты, контентные системы и веб-инструменты' }, // формула обещания (D-13, REQ-main-promise)
  { page: 'index.html', needle: 'веб-разработчик с продуктовым подходом' }, // категория
  { page: 'index.html', needle: 'от идеи и структуры до запуска и дальнейшего развития' }, // подпись (D-13)
  { page: 'about/index.html', needle: 'PROFILE' }, // меты 4 блоков About (R5)
  { page: 'about/index.html', needle: 'AUDIENCES' },
  { page: 'about/index.html', needle: 'CAPABILITIES' },
  { page: 'about/index.html', needle: 'TRAJECTORY' },
  { page: 'lab/index.html', needle: 'DIRECTIONS' }, // меты 2 блоков Lab (R6)
  { page: 'lab/index.html', needle: 'PROCESS' },
  { page: 'lab/index.html', needle: 'Эксперименты в работе' }, // честный статус (R6 AC)
  { page: 'contact/index.html', needle: 'mailto:' }, // канал email (R7)
];

// Негативные ассерты: на /contact ровно 3 канала (email, telegram, github) — LinkedIn
// отсутствует (R7); матчинг по нижнему регистру.
const FORBIDDEN_CONTENT = [
  { page: 'contact/index.html', needle: 'linkedin' }, // R7: нет LinkedIn
];

// Маркеры, которых не должно быть в dist/work (R2 AC): демонстрационный блок SYSTEM DEMO
// и фикстурные названия карточек — заменяются реальными кейсами в 03-03.
const WORK_FORBIDDEN = [
  'system demo',
  'проект «терракота»',
  'проект «олива»',
];

const readText = (p) => readFileSync(p, 'utf8');

/**
 * Рекурсивный обход директории; возвращает файлы с расширениями из exts.
 * Пропускает скрытые файлы и каталоги (Astro-глобы игнорируют dot-файлы).
 */
function walk(dir, exts, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc; // директория не существует — пусто
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, exts, acc);
    else if (exts.some((x) => entry.name.toLowerCase().endsWith(x))) acc.push(p);
  }
  return acc;
}

/**
 * Проверка ярлыков позиционирования по контенту первого экрана.
 * Scope — ТОЛЬКО dist/index.html (Pitfall 7/A5): прочие страницы исключаются —
 * на /about траектория законно называет роль Product Engineer (REQ-growth-trajectory).
 * @param {string} html содержимое index.html
 * @returns {string[]} найденные ярлыки (пусто = чисто)
 */
function scanIndexLabels(html) {
  const lower = html.toLowerCase();
  return INDEX_LABELS.filter((label) => lower.includes(label));
}

/**
 * Полный аудит собранного dist/ в rootDir. Возвращает список нарушений (пусто = чисто).
 */
function audit(rootDir) {
  const distDir = join(rootDir, 'dist');
  if (!existsSync(distDir)) {
    return [`dist/ не найден (${distDir}) — сначала выполните npm run build (проверка тона и позитивных ассертов работает по собранным страницам)`];
  }
  const htmlFiles = walk(distDir, ['.html']);
  if (htmlFiles.length === 0) {
    return ['в dist/ нет собранных .html страниц'];
  }
  const issues = [];
  const relDist = (p) => relative(distDir, p).replaceAll('\\', '/');

  // 1. Денлист тона по всем страницам + ярлыки позиционирования только по index.html.
  //    Матчинг stem-подстроками по нижнему регистру — учитывает морфологию русского текста.
  for (const f of htmlFiles) {
    const html = readText(f).toLowerCase();
    const r = relDist(f);
    for (const entry of DENYLIST) {
      if (html.includes(entry)) {
        issues.push(`денлист тона: «${entry}» в ${r} (R9, REQ-tone)`);
      }
    }
    if (r === 'index.html') {
      for (const label of scanIndexLabels(readText(f))) {
        issues.push(`ярлык позиционирования на первом экране: «${label}» в dist/index.html (REQ-positioning-category)`);
      }
    }
  }

  // 2. Позитивные ассерты (формула, меты блоков, каналы)
  for (const { page, needle } of REQUIRED_CONTENT) {
    const abs = join(distDir, page);
    if (!existsSync(abs)) {
      issues.push(`не найдена страница ${page} — обязательный текст «${needle}» отсутствует (R1–R7)`);
      continue;
    }
    if (!readText(abs).includes(needle)) {
      issues.push(`обязательный текст отсутствует в ${page}: «${needle}» (R1–R7)`);
    }
  }

  // 3. Негативные ассерты (LinkedIn отсутствует на /contact, R7)
  for (const { page, needle } of FORBIDDEN_CONTENT) {
    const abs = join(distDir, page);
    if (!existsSync(abs)) continue;
    if (readText(abs).toLowerCase().includes(needle)) {
      issues.push(`запрещённый текст в ${page}: «${needle}» (R7 — LinkedIn отсутствует)`);
    }
  }

  // 4. dist/work: отсутствие демонстрационного блока и фикстурных карточек (R2 AC)
  const workDir = join(distDir, 'work');
  if (existsSync(workDir)) {
    for (const f of walk(workDir, ['.html'])) {
      const html = readText(f).toLowerCase();
      const r = relDist(f);
      for (const needle of WORK_FORBIDDEN) {
        if (html.includes(needle)) {
          issues.push(`маркер/фикстурное название в dist/work: «${needle}» в ${r} (R2 AC)`);
        }
      }
    }
  }

  return issues;
}

function render(issues) {
  if (issues.length === 0) {
    console.log('check-tone: OK — денлист тона, ярлыки позиционирования (только /) и позитивные ассерты пройдены');
    return 0;
  }
  console.error(`check-tone: FAIL — ${issues.length} нарушений:`);
  for (const i of issues) console.error(`  - ${i}`);
  return 1;
}

// --- Self-test: встроенные фикстуры во временной директории (без сети) ---

// Хорошие фикстуры страниц: формула/категория/подпись на /, меты 4 блоков About,
// 2 меты Lab + честный статус, email-канал без LinkedIn; текст чист по денлисту.
const PAGE_INDEX_GOOD = `<!doctype html>
<html><body>
<p>Создаю и развиваю сложные сайты, контентные системы и веб-инструменты.</p>
<p>Категория: веб-разработчик с продуктовым подходом</p>
<p>Работаю от идеи и структуры до запуска и дальнейшего развития.</p>
</body></html>`;
const PAGE_ABOUT_GOOD = `<!doctype html>
<html><body>
<p>PROFILE</p><p>AUDIENCES</p><p>CAPABILITIES</p><p>TRAJECTORY</p>
</body></html>`;
const PAGE_LAB_GOOD = `<!doctype html>
<html><body>
<p>DIRECTIONS</p><p>PROCESS</p>
<p>Эксперименты в работе</p>
</body></html>`;
const PAGE_CONTACT_GOOD = `<!doctype html>
<html><body>
<a href="mailto:hello@example.com">Email</a>
</body></html>`;

// Известная-плохая (тон): хайповый AI-first текст со «революционные решения»,
// «безграничные возможности» и «сделал всё в одиночку» — нарушитель денлиста.
const PAGE_INDEX_BAD_TONE = `<!doctype html>
<html><body>
<p>Наши революционные решения открывают безграничные возможности. Я всё сделал в одиночку.</p>
</body></html>`;

// Известная-плохая (ярлык): «Product Engineer» на первом экране — нарушение scope /.
const PAGE_INDEX_BAD_LABEL = `<!doctype html>
<html><body>
<p>Product Engineer</p>
</body></html>`;

// Известная-плохая (work): демонстрационный блок и фикстурная карточка в dist/work.
const PAGE_WORK_BAD = `<!doctype html>
<html><body>
<p>SYSTEM DEMO</p>
<h3>Проект «Терракота»</h3>
</body></html>`;

function writeFixture(root, relPath, content) {
  const abs = join(root, relPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
}

/**
 * Self-test: логика аудита классифицирует фикстуры верно.
 * (a) good — чистый текст + все позитивные ассерты → 0 нарушений;
 * (b) bad-tone — хайповый текст → денлист детектирует;
 * (c) bad-label — ярлык на index.html → FAIL; (d) about-label — тот же ярлык на /about → PASS (scope);
 * (e) work-bad — SYSTEM DEMO/фикстурные карточки в dist/work → FAIL;
 * (f) contact-linkedin — LinkedIn на /contact → FAIL; (g) no-dist — dist отсутствует → понятное сообщение.
 */
function runSelfTest() {
  let failures = 0;
  const assert = (cond, msg) => {
    if (!cond) {
      console.error(`  FAIL: ${msg}`);
      failures++;
    }
  };
  const hasIssue = (list, needle) => list.some((i) => i.includes(needle));

  const tmp = mkdtempSync(join(tmpdir(), 'check-tone-'));
  try {
    // (a) good: все страницы с формулой/метами/каналами, чистый текст → 0 нарушений
    const goodRoot = join(tmp, 'good');
    writeFixture(goodRoot, 'dist/index.html', PAGE_INDEX_GOOD);
    writeFixture(goodRoot, 'dist/about/index.html', PAGE_ABOUT_GOOD);
    writeFixture(goodRoot, 'dist/lab/index.html', PAGE_LAB_GOOD);
    writeFixture(goodRoot, 'dist/contact/index.html', PAGE_CONTACT_GOOD);
    const good = audit(goodRoot);
    assert(good.length === 0, `good: чистый контент + все ассерты → без нарушений (получено: ${JSON.stringify(good)})`);

    // (b) bad-tone: хайповый текст → денлист детектирует stem-подстроки
    const badToneRoot = join(tmp, 'bad-tone');
    writeFixture(badToneRoot, 'dist/index.html', PAGE_INDEX_BAD_TONE);
    writeFixture(badToneRoot, 'dist/about/index.html', PAGE_ABOUT_GOOD);
    writeFixture(badToneRoot, 'dist/lab/index.html', PAGE_LAB_GOOD);
    writeFixture(badToneRoot, 'dist/contact/index.html', PAGE_CONTACT_GOOD);
    const badTone = audit(badToneRoot);
    assert(
      hasIssue(badTone, '«революционн»') && hasIssue(badTone, '«безграничн»') && hasIssue(badTone, '«в одиночку»'),
      'bad-tone: «революционные решения», «безграничные», «в одиночку» детектируются'
    );

    // (c) bad-label: ярлык позиционирования на index.html → FAIL
    const badLabelRoot = join(tmp, 'bad-label');
    writeFixture(badLabelRoot, 'dist/index.html', PAGE_INDEX_BAD_LABEL);
    writeFixture(badLabelRoot, 'dist/about/index.html', PAGE_ABOUT_GOOD);
    writeFixture(badLabelRoot, 'dist/lab/index.html', PAGE_LAB_GOOD);
    writeFixture(badLabelRoot, 'dist/contact/index.html', PAGE_CONTACT_GOOD);
    const badLabel = audit(badLabelRoot);
    assert(hasIssue(badLabel, '«product engineer»'), 'bad-label: ярлык «Product Engineer» на / детектируется');

    // (d) about-label: тот же ярлык на /about → PASS (scope — только index.html, Pitfall 7)
    const aboutLabelRoot = join(tmp, 'about-label');
    writeFixture(aboutLabelRoot, 'dist/index.html', PAGE_INDEX_GOOD);
    writeFixture(
      aboutLabelRoot,
      'dist/about/index.html',
      PAGE_ABOUT_GOOD + '\n<p>Product Engineer</p>\n'
    );
    writeFixture(aboutLabelRoot, 'dist/lab/index.html', PAGE_LAB_GOOD);
    writeFixture(aboutLabelRoot, 'dist/contact/index.html', PAGE_CONTACT_GOOD);
    const aboutLabel = audit(aboutLabelRoot);
    assert(
      aboutLabel.length === 0,
      `about-label: ярлык на /about не нарушение (scope) (получено: ${JSON.stringify(aboutLabel)})`
    );

    // (e) work-bad: SYSTEM DEMO и фикстурная карточка в dist/work → FAIL (R2 AC)
    const workBadRoot = join(tmp, 'work-bad');
    writeFixture(workBadRoot, 'dist/index.html', PAGE_INDEX_GOOD);
    writeFixture(workBadRoot, 'dist/about/index.html', PAGE_ABOUT_GOOD);
    writeFixture(workBadRoot, 'dist/lab/index.html', PAGE_LAB_GOOD);
    writeFixture(workBadRoot, 'dist/contact/index.html', PAGE_CONTACT_GOOD);
    writeFixture(workBadRoot, 'dist/work/zz/index.html', PAGE_WORK_BAD);
    const workBad = audit(workBadRoot);
    assert(
      hasIssue(workBad, '«system demo»') && hasIssue(workBad, '«проект «терракота»»'),
      'work-bad: SYSTEM DEMO и фикстурное название в dist/work детектируются'
    );

    // (f) contact-linkedin: LinkedIn на /contact → FAIL (R7)
    const linkedInRoot = join(tmp, 'contact-linkedin');
    writeFixture(linkedInRoot, 'dist/index.html', PAGE_INDEX_GOOD);
    writeFixture(linkedInRoot, 'dist/about/index.html', PAGE_ABOUT_GOOD);
    writeFixture(linkedInRoot, 'dist/lab/index.html', PAGE_LAB_GOOD);
    writeFixture(linkedInRoot, 'dist/contact/index.html', PAGE_CONTACT_GOOD + '\n<p>LinkedIn</p>\n');
    const linkedIn = audit(linkedInRoot);
    assert(hasIssue(linkedIn, '«linkedin»'), 'contact-linkedin: LinkedIn на /contact детектируется (R7)');

    // (g) no-dist: dist отсутствует → понятное сообщение (exit 1)
    const noDistRoot = join(tmp, 'no-dist');
    const noDist = audit(noDistRoot);
    assert(hasIssue(noDist, 'dist/ не найден'), 'no-dist: отсутствие dist/ даёт понятное сообщение');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  if (failures > 0) {
    console.error(`self-test: ${failures} сбоев логики`);
    return false;
  }
  console.log('self-test: OK — денлист, scope ярлыков и позитивные ассерты классифицируются верно');
  return true;
}

if (process.argv.includes('--self-test')) {
  process.exitCode = runSelfTest() ? 0 : 1;
} else {
  process.exitCode = render(audit(ROOT));
}
