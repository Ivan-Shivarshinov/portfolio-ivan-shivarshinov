#!/usr/bin/env node
// scripts/check-collections.mjs — проверка R3 (01-VALIDATION.md, Per-Task Verification Map R3):
// негативные фикстуры: дубликат slug, отсутствие обязательного поля, дубликат id —
// каждая обязана уронить сборку; фикстуры временные и удаляются.
//
// CLI:
//   node scripts/check-collections.mjs            — полный прогон 3 негативных тестов против проекта
//   node scripts/check-collections.mjs --self-test — логика создания/удаления фикстур на временной
//                                                   директории БЕЗ запуска build
//
// Контракт 01-02-PLAN.md Task 2 (учтены схемы из 01-04-PLAN.md):
// (a) дубликат slug: два временных .mdx в src/content/projects/ с одинаковым frontmatter-полем slug;
//     имена БЕЗ ведущей точки (glob-лоадеры Astro игнорируют dot-файлы — иначе тест ложно зелёный);
//     frontmatter схемо-совместимый → ожидаемая ошибка DuplicateContentEntrySlugError;
// (b) отсутствие обязательного поля: временный .mdx в src/content/notes/ без поля title → сборка падает;
// (c) дубликат id в JSON: резервная копия src/data/services.json, добавление записи с дублирующимся id,
//     сборка падает, файл восстанавливается в finally.
// После всех тестов: рабочее дерево чисто от фикстур (нет zz-check-* файлов, services.json восстановлен).
//
// Exit 0 — все негативные тесты упали ожидаемо и фикстуры удалены; exit 1 — иначе.

import { spawnSync } from 'node:child_process';
import {
  readFileSync,
  readdirSync,
  writeFileSync,
  copyFileSync,
  existsSync,
  rmSync,
  mkdirSync,
  mkdtempSync,
} from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS_DIR = join(ROOT, 'src/content/projects');
const NOTES_DIR = join(ROOT, 'src/content/notes');
const SERVICES_FILE = join(ROOT, 'src/data/services.json');
const FIXTURE_PREFIX = 'zz-check-';
const BUILD_TIMEOUT_MS = 300_000;

// Схемо-совместимый frontmatter projects (01-04-PLAN.md + 03-01-PLAN.md: theme/featured/
// cover/coverAlt добавлены в схему фазы 3) — падение сборки должно быть именно из-за
// дубликата slug, а не из-за отсутствующего поля (Pitfall 9). theme: clay — валидное
// значение; терракота кейсам не назначается (D-06). cover — путь к временному PNG
// (zz-check-cover.png), который duplicateSlugTest пишет и удаляет.
function projectFixture(slug) {
  return `---
slug: ${slug}
title: ZZ Check Fixture
summary: временная фикстура негативного теста
role: fixture
stack: ["fixture"]
year: 2026
status: "active"
client-type: "fixture"
order: 999
theme: clay
featured: false
cover: './zz-check-cover.png'
coverAlt: fixture
---
Временная фикстура ${slug} — удаляется в finally.
`;
}

// Минимальный PNG 1×1 (base64) — файл cover для фикстур (image() в схеме требует
// существующий файл при сборке; Pitfall 9: падение строго от DuplicateContentEntrySlugError).
const COVER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);
const COVER_FIXTURE = join(PROJECTS_DIR, 'zz-check-cover.png');

// notes: схемо-совместимо, но БЕЗ обязательного поля title (date — coerce.date, summary — optional)
const NOTE_FIXTURE_NO_TITLE = `---
date: 2026-01-01
summary: временная фикстура без обязательного поля title
---
`;

const DUP_SLUG = 'zz-check-dup';

// --- Низкоуровневые помощники (общие для реального прогона и self-test) ---

const writeFixture = (absPath, content) => {
  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, content, 'utf8');
};

const rmSafe = (p) => {
  try {
    if (existsSync(p)) rmSync(p, { force: true });
  } catch {
    /* игнорируем — финальная проверка чистоты дерева покажет проблемы */
  }
};

/**
 * Резервная копия файла рядом с ним (+ '.zz-backup'), возвращает путь копии и исходное содержимое.
 */
function backupFile(src) {
  const backup = src + '.zz-backup';
  copyFileSync(src, backup);
  return { backup, content: readFileSync(src, 'utf8') };
}

function restoreFile(src, { backup, content }) {
  writeFileSync(src, content, 'utf8');
  rmSafe(backup);
}

/**
 * Запуск npm run build в заданной директории. Возвращает { status, stdout, stderr }.
 * Windows: .cmd-шимы спавнятся через cmd.exe (EINVAL при прямом spawn).
 */
function runBuild(cwd = ROOT) {
  const isWin = process.platform === 'win32';
  const res = spawnSync(isWin ? 'cmd.exe' : 'npm', isWin ? ['/d', '/s', '/c', 'npm.cmd run build'] : ['run', 'build'], {
    cwd,
    encoding: 'utf8',
    timeout: BUILD_TIMEOUT_MS,
    windowsVerbatimArguments: isWin,
  });
  if (res.error) {
    return { status: null, stdout: res.stdout ?? '', stderr: `${res.error.message}` };
  }
  return { status: res.status, stdout: res.stdout ?? '', stderr: res.stderr ?? '' };
}

// --- Негативные тесты ---

let passed = 0;
let failed = 0;

function report(name, ok, detail) {
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

function duplicateSlugTest() {
  const a = join(PROJECTS_DIR, `${FIXTURE_PREFIX}dup-a.mdx`);
  const b = join(PROJECTS_DIR, `${FIXTURE_PREFIX}dup-b.mdx`);
  try {
    // cover-файл фикстуры: image() в схеме (03-01) требует существующий файл при сборке —
    // иначе тест упадёт по zod-ошибке поля, а не от дубликата slug (Pitfall 9).
    writeFileSync(COVER_FIXTURE, COVER_PNG);
    writeFixture(a, projectFixture(DUP_SLUG));
    writeFixture(b, projectFixture(DUP_SLUG));
    const { status, stderr } = runBuild();
    if (status === 0) {
      report('дубликат slug (projects)', false, 'сборка НЕ упала (ожидался exit != 0, DuplicateContentEntrySlugError)');
      return;
    }
    const isDupError = /DuplicateContentEntrySlugError|same slug|Duplicate slug/i.test(stderr);
    report(
      'дубликат slug (projects)',
      true,
      `сборка упала ожидаемо (exit ${status})${isDupError ? ', DuplicateContentEntrySlugError подтверждён' : ''}`
    );
  } finally {
    rmSafe(a);
    rmSafe(b);
    rmSafe(COVER_FIXTURE);
  }
}

function missingFieldTest() {
  const f = join(NOTES_DIR, `${FIXTURE_PREFIX}no-title.md`);
  try {
    writeFixture(f, NOTE_FIXTURE_NO_TITLE);
    const { status } = runBuild();
    report(
      'отсутствие обязательного поля (notes, title)',
      status !== 0,
      status === 0 ? 'сборка НЕ упала (ожидался exit != 0 по zod-схеме)' : `сборка упала ожидаемо (exit ${status})`
    );
  } finally {
    rmSafe(f);
  }
}

function duplicateIdTest() {
  const backup = backupFile(SERVICES_FILE);
  try {
    const data = JSON.parse(backup.content);
    if (!Array.isArray(data) || data.length === 0) {
      report('дубликат id (services.json)', false, 'services.json пуст/не массив — нечего дублировать');
      return;
    }
    const dupId = data[0].id;
    data.push({ id: dupId, title: 'ZZ Check Fixture', description: 'временная фикстура' });
    writeFileSync(SERVICES_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    const { status } = runBuild();
    report(
      'дубликат id (services.json)',
      status !== 0,
      status === 0 ? 'сборка НЕ упала (ожидался exit != 0 по file()-loader)' : `сборка упала ожидаемо (exit ${status})`
    );
  } finally {
    restoreFile(SERVICES_FILE, backup);
  }
}

/**
 * Проверка чистоты рабочего дерева после всех тестов: нет zz-check-* файлов в src/content,
 * services.json восстановлен до исходного содержимого.
 */
function assertTreeClean(servicesContent) {
  const problems = [];
  for (const dir of [PROJECTS_DIR, NOTES_DIR]) {
    if (!existsSync(dir)) continue;
    const leftovers = collectFiles(dir).filter((p) => basename(p).startsWith(FIXTURE_PREFIX));
    for (const l of leftovers) problems.push(`осталась фикстура: ${l}`);
  }
  if (existsSync(SERVICES_FILE) && readFileSync(SERVICES_FILE, 'utf8') !== servicesContent) {
    problems.push('services.json не восстановлен после теста дубликата id');
  }
  return problems;
}

function collectFiles(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) collectFiles(p, acc);
    else acc.push(p);
  }
  return acc;
}

// --- Аудит границ коллекций (03-01-PLAN.md Task 2): чистые функции + реальный прогон ---

const THEME_ENUM = ['terracotta', 'clay', 'olive', 'slate', 'plum'];
// Четыре раздела тела кейса (D-05): ровно по одному разу в MDX-теле (RESEARCH Code Example 2)
const BODY_HEADINGS = ['## Проблема', '## Ответственность', '## Решение', '## Результат'];

// Значение frontmatter-поля простым regex-матчем строки (стиль проекта, без YAML-библиотеки);
// кавычки снимаются. Пустая строка — поле отсутствует.
function frontmatterField(content, field) {
  const m = content.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  if (!m) return '';
  return m[1].trim().replace(/^['"]|['"]$/g, '');
}

// Тело MDX — всё после закрывающего `---` frontmatter
function mdxBody(content) {
  const lines = content.split('\n');
  let fences = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') fences++;
    if (fences === 2) return lines.slice(i + 1).join('\n');
  }
  return content;
}

// Граница числа записей projects: [5, 6] (SPEC edge R2 — падает при 4 и при 7, «0 записей = FAIL»)
function countBoundaries(count) {
  return count >= 5 && count <= 6 ? null : `записей: ${count}, ожидалось 5–6`;
}

// Граница featured-записей: [2, 3] (D-09)
function featuredBoundaries(n) {
  return n >= 2 && n <= 3 ? null : `featured-записей: ${n}, ожидалось 2–3`;
}

// Тема: enum из 5 значений (D-05); terracotta кейсам не назначается (D-06)
function themeBoundary(theme) {
  if (!THEME_ENUM.includes(theme)) return `theme «${theme}» вне enum (D-05)`;
  if (theme === 'terracotta') return 'theme terracotta запрещена кейсам (D-06)';
  return null;
}

// Тело кейса: 4 раздела, каждый ровно один раз (indexOf === -1 → отсутствует,
// indexOf !== lastIndexOf → повторяется)
function bodyAudit(body) {
  const problems = [];
  for (const h of BODY_HEADINGS) {
    const first = body.indexOf(h);
    if (first === -1) problems.push(`раздел «${h}» отсутствует в теле`);
    else if (body.indexOf(h, first + h.length) !== -1) problems.push(`раздел «${h}» повторяется в теле`);
  }
  return problems;
}

// Дубль файла cover между кейсами (SPEC edge R8 adjacency): нормализованные пути уникальны
function coverDupAudit(coverPaths) {
  return new Set(coverPaths).size === coverPaths.length ? null : 'дубль файла cover между кейсами';
}

// notes: 0 записей .md (D-07, контракт 01-04)
function notesBoundary(n) {
  return n === 0 ? null : `notes: ${n} записей, ожидалось 0 (D-07)`;
}

// Реальный прогон по src/content/projects: все границы разом, без сборки (паттерн walk())
function auditCaseBoundaries() {
  const problems = [];
  const files = collectFiles(PROJECTS_DIR).filter((p) => p.endsWith('.mdx'));
  const countProblem = countBoundaries(files.length);
  if (countProblem) problems.push(countProblem);
  const coverPaths = [];
  let featured = 0;
  for (const f of files) {
    const content = readFileSync(f, 'utf8');
    const theme = themeBoundary(frontmatterField(content, 'theme'));
    if (theme) problems.push(`${basename(f)}: ${theme}`);
    if (frontmatterField(content, 'featured') === 'true') featured++;
    const cover = frontmatterField(content, 'cover');
    if (!cover) {
      problems.push(`${basename(f)}: cover не задан (R8)`);
    } else {
      // cover резолвится относительно директории записи (как image() в схеме)
      const abs = resolve(dirname(f), cover);
      if (!existsSync(abs)) problems.push(`${basename(f)}: файл cover не существует (${cover})`);
      coverPaths.push(abs);
    }
    for (const bp of bodyAudit(mdxBody(content))) problems.push(`${basename(f)}: ${bp}`);
  }
  const featuredProblem = featuredBoundaries(featured);
  if (featuredProblem) problems.push(featuredProblem);
  const dupProblem = coverDupAudit(coverPaths);
  if (dupProblem) problems.push(dupProblem);
  return problems;
}

// Реальный прогон по src/content/notes: 0 записей .md
function auditNotesBoundary() {
  if (!existsSync(NOTES_DIR)) return [];
  const noteCount = collectFiles(NOTES_DIR).filter((p) => p.endsWith('.md')).length;
  const problem = notesBoundary(noteCount);
  return problem ? [problem] : [];
}

// --- Self-test: фикстуры на временной директории БЕЗ запуска build ---

function runSelfTest() {
  let failures = 0;
  const assert = (cond, msg) => {
    if (!cond) {
      console.error(`  FAIL: ${msg}`);
      failures++;
    }
  };
  const tmp = mkdtempSync(join(tmpdir(), 'check-collections-'));
  try {
    const proj = join(tmp, 'src/content/projects');
    const a = join(proj, `${FIXTURE_PREFIX}dup-a.mdx`);
    const b = join(proj, `${FIXTURE_PREFIX}dup-b.mdx`);
    const svc = join(tmp, 'src/data/services.json');

    // создание фикстур
    writeFixture(a, 'a');
    writeFixture(b, 'b');
    assert(existsSync(a) && existsSync(b), 'создание фикстур-дубликатов работает');
    // удаление фикстур
    rmSafe(a);
    rmSafe(b);
    assert(!existsSync(a) && !existsSync(b), 'удаление фикстур в finally работает');

    // резервная копия + восстановление services.json
    writeFixture(svc, '{"records":[{"id":"a"}]}');
    const backup = backupFile(svc);
    writeFixture(svc, '{"records":[{"id":"a"},{"id":"a"}]}');
    restoreFile(svc, backup);
    assert(
      readFileSync(svc, 'utf8') === '{"records":[{"id":"a"}]}' && !existsSync(svc + '.zz-backup'),
      'backup/restore services.json возвращает исходное содержимое и убирает копию'
    );

    // rmSafe на несуществующем файле не бросает
    rmSafe(join(tmp, 'нет-такого-файла.mdx'));

    // --- новые аудиты границ (03-01-PLAN.md Task 2): чистые функции на inline-фикстурах ---

    // countBoundaries: 5 и 6 → PASS, 4 / 7 / 0 → FAIL
    assert(countBoundaries(5) === null && countBoundaries(6) === null, 'countBoundaries: 5 и 6 → PASS');
    assert(countBoundaries(4) !== null, 'countBoundaries: 4 → FAIL');
    assert(countBoundaries(7) !== null, 'countBoundaries: 7 → FAIL');
    assert(countBoundaries(0) !== null, 'countBoundaries: 0 → FAIL');

    // featuredBoundaries: 2 и 3 → PASS, 1 / 4 → FAIL
    assert(featuredBoundaries(2) === null && featuredBoundaries(3) === null, 'featuredBoundaries: 2 и 3 → PASS');
    assert(featuredBoundaries(1) !== null, 'featuredBoundaries: 1 → FAIL');
    assert(featuredBoundaries(4) !== null, 'featuredBoundaries: 4 → FAIL');

    // themeBoundary: plum → PASS, terracotta → FAIL (D-06), невалидное → FAIL
    assert(themeBoundary('plum') === null, 'themeBoundary: plum → PASS');
    assert(themeBoundary('terracotta') !== null, 'themeBoundary: terracotta → FAIL (D-06)');
    assert(themeBoundary('невалидное') !== null, 'themeBoundary: невалидное → FAIL');

    // bodyAudit: 4 раздела по одному разу → PASS
    const goodBody = '## Проблема\nтекст\n## Ответственность\nтекст\n## Решение\nтекст\n## Результат\nтекст';
    assert(bodyAudit(goodBody).length === 0, 'bodyAudit: 4 раздела по одному разу → PASS');
    // без «## Решение» → FAIL
    assert(
      bodyAudit('## Проблема\n## Ответственность\n## Результат').some((p) => p.includes('«## Решение»')),
      'bodyAudit: без «## Решение» → FAIL'
    );
    // повторённый «## Проблема» → FAIL
    assert(
      bodyAudit('## Проблема\n## Проблема\n## Ответственность\n## Решение\n## Результат').some((p) => p.includes('повторяется')),
      'bodyAudit: повторённый «## Проблема» → FAIL'
    );

    // coverDupAudit: разные файлы → PASS, одинаковый cover → FAIL
    assert(coverDupAudit(['a.png', 'b.png']) === null, 'coverDupAudit: разные файлы → PASS');
    assert(coverDupAudit(['a.png', 'a.png']) !== null, 'coverDupAudit: одинаковый cover между кейсами → FAIL');

    // notesBoundary: 0 → PASS, 1 запись → FAIL
    assert(notesBoundary(0) === null, 'notesBoundary: 0 → PASS');
    assert(notesBoundary(1) !== null, 'notesBoundary: 1 запись → FAIL');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  if (failures > 0) {
    console.error(`self-test: ${failures} сбоев логики`);
    return false;
  }
  console.log('self-test: OK — фикстуры, backup/restore и аудиты границ работают');
  return true;
}

// --- Точка входа ---

if (process.argv.includes('--self-test')) {
  process.exitCode = runSelfTest() ? 0 : 1;
} else {
  // Предусловия: структуры проекта должны существовать (создаются планом 01-04).
  const missing = [];
  if (!existsSync(PROJECTS_DIR)) missing.push(`src/content/projects (${PROJECTS_DIR})`);
  if (!existsSync(NOTES_DIR)) missing.push(`src/content/notes (${NOTES_DIR})`);
  if (!existsSync(SERVICES_FILE)) missing.push(`src/data/services.json (${SERVICES_FILE})`);
  if (missing.length > 0) {
    console.error(`check-collections: PREREQ_MISSING — контентный слой ещё не создан: ${missing.join(', ')}`);
    console.error('  Полный прогон выполняется после плана 01-04 (content.config.ts + JSON-данные).');
    process.exitCode = 1;
    process.exit();
  }

  const servicesContent = readFileSync(SERVICES_FILE, 'utf8');
  console.log('check-collections: прогон негативных тестов (3 сборки, ~60-90 c)...');
  duplicateSlugTest();
  missingFieldTest();
  duplicateIdTest();

  const leftover = assertTreeClean(servicesContent);
  for (const p of leftover) {
    failed++;
    console.error(`FAIL  чистота дерева — ${p}`);
  }
  if (leftover.length === 0) console.log('OK    рабочее дерево чисто от фикстур');

  console.log('check-collections: аудит границ коллекций...');
  const boundaryProblems = [...auditCaseBoundaries(), ...auditNotesBoundary()];
  for (const p of boundaryProblems) {
    failed++;
    console.error(`FAIL  аудит границ — ${p}`);
  }
  if (boundaryProblems.length === 0) {
    console.log('OK    границы коллекций соблюдены (projects 5–6, featured 2–3, theme без terracotta, cover-файлы, 4 h2, notes 0)');
  }

  if (failed > 0) {
    console.error(`check-collections: FAIL — ${failed} из ${passed + failed} проверок провалены`);
    process.exitCode = 1;
  } else {
    console.log(`check-collections: OK — все ${passed} негативные проверки упали ожидаемо, фикстуры удалены`);
    process.exitCode = 0;
  }
}
