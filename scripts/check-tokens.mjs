#!/usr/bin/env node
// scripts/check-tokens.mjs — проверка R2 (01-VALIDATION.md, Per-Task Verification Map R2):
// единый файл токенов, 5 групп CSS-переменных, запрет хардкод-значений.
//
// CLI:
//   node scripts/check-tokens.mjs           — аудит src/styles + src/components относительно корня проекта
//   node scripts/check-tokens.mjs --self-test — встроенные фикстуры во временной директории (без сети)
//
// Правила (контракт 01-02-PLAN.md Task 1):
// 1. Единый файл токенов: файлы с CSS-переменными (паттерн --имя:) допустимы ровно в одном файле —
//    src/styles/tokens.css; любой другой файл с переменными в src/styles|src/components → нарушение.
// 2. 5 групп в tokens.css: --color-*, --font-* ИЛИ --text-*, --space-*, --container-*, --motion-*
//    (каждая группа — не менее 1 переменной).
// 3. Запрет хардкода вне tokens.css в src/styles/** и src/components/**:
//    - hex-литералы цветов #RGB / #RRGGBB / #RRGGBBAA → нарушение;
//    - px-значения, совпадающие со шкалой отступов (4, 8, 16, 24, 32, 48, 64 px) → нарушение;
//    - НЕ нарушение: 1-2px (outline/focus, вне шкалы); сам tokens.css исключён из проверки хардкода.
//
// Exit 0 — нарушений нет; exit 1 — есть нарушения (вывод списка).

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS_PATH = 'src/styles/tokens.css';
const SCAN_DIRS = ['src/styles', 'src/components'];
const SCAN_EXTS = ['.css', '.astro'];

// CSS-переменная: --имя: (в определении, не в var(--имя))
const VAR_DEF_RE = /--[a-z0-9][a-z0-9-]*\s*:/i;
// hex-литералы цветов: #RGB / #RRGGBB / #RRGGBBAA с границами по word-символам
const HEX_RE = /(?<![\w-])#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\w-])/;
// px-значения шкалы отступов (1-2px вне шкалы — не нарушение)
const SPACING_PX_RE = /\b(?:4|8|16|24|32|48|64)px\b/i;

const GROUPS = [
  { name: 'color (--color-*)', re: /--color-[a-z0-9-]+\s*:/i },
  { name: 'typography (--font-* или --text-*)', re: /--(?:font|text)-[a-z0-9-]+\s*:/i },
  { name: 'spacing (--space-*)', re: /--space-[a-z0-9-]+\s*:/i },
  { name: 'container (--container-*)', re: /--container-[a-z0-9-]+\s*:/i },
  { name: 'motion (--motion-*)', re: /--motion-[a-z0-9-]+\s*:/i },
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
 * Полный аудит токенов в rootDir. Возвращает массив нарушений (пусто = чисто).
 */
function audit(rootDir) {
  const violations = [];
  const tokensAbs = join(rootDir, TOKENS_PATH);
  if (!existsSync(tokensAbs)) {
    violations.push(`tokens-файл не найден: ${TOKENS_PATH}`);
    return violations; // без токенов дальше проверять нечего
  }

  const files = SCAN_DIRS.flatMap((d) => walk(join(rootDir, d), SCAN_EXTS));
  const rel = (p) => relative(rootDir, p).replaceAll('\\', '/');

  // 1. Единый файл токенов
  const variableFiles = files.filter((f) => {
    try {
      return VAR_DEF_RE.test(readText(f));
    } catch {
      return false;
    }
  });
  for (const f of variableFiles) {
    if (rel(f) !== TOKENS_PATH) {
      violations.push(
        `нарушение единого файла токенов: CSS-переменные найдены в ${rel(f)} (допустим только ${TOKENS_PATH})`
      );
    }
  }

  // 2. Пять групп переменных в tokens.css
  const tokens = readText(tokensAbs);
  for (const g of GROUPS) {
    if (!g.re.test(tokens)) violations.push(`отсутствует группа токенов в ${TOKENS_PATH}: ${g.name}`);
  }

  // 3. Запрет хардкода вне tokens.css
  for (const f of files) {
    const r = rel(f);
    if (r === TOKENS_PATH) continue;
    let text;
    try {
      text = readText(f);
    } catch (err) {
      violations.push(`не удалось прочитать ${r}: ${err.message}`);
      continue;
    }
    const hex = [...new Set(text.match(new RegExp(HEX_RE.source, 'g')) ?? [])];
    if (hex.length > 0) violations.push(`хардкод цвета в ${r}: ${hex.join(', ')}`);
    const px = [...new Set(text.match(new RegExp(SPACING_PX_RE.source, 'gi')) ?? [])];
    if (px.length > 0) violations.push(`хардкод отступа (шкала ${SPACING_PX_RE.source}) в ${r}: ${px.join(', ')}`);
  }

  return violations;
}

function render(violations) {
  if (violations.length === 0) {
    console.log('check-tokens: OK — единый файл токенов, 5 групп, нет хардкод-значений');
    return 0;
  }
  console.error(`check-tokens: FAIL — ${violations.length} нарушений:`);
  for (const v of violations) console.error(`  - ${v}`);
  return 1;
}

// --- Self-test: фикстуры во временной директории (без сети) ---

const GOOD_TOKENS = `:root {
  /* color */
  --color-bg: #f7f6f3;
  --color-text: #1f1f1f;
  /* typography */
  --font-base: "Inter", system-ui, sans-serif;
  --text-md: 1rem;
  /* spacing */
  --space-1: 4px;
  --space-4: 32px;
  /* container */
  --container-wide: 1280px;
  --container-narrow: 720px;
  /* motion */
  --motion-fast: 150ms ease-out;
  --motion-slow: 500ms ease-in-out;
}`;

const GOOD_COMPONENT = `---
const title = "Компонент";
---
<div class="card">{title}</div>
<style>
  .card {
    color: var(--color-text);
    margin-block: var(--space-1);
    outline: 1px solid transparent; /* 1px — вне шкалы, не нарушение */
  }
</style>`;

function writeFixture(root, relPath, content) {
  const abs = join(root, relPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
}

/**
 * Self-test: логика аудита классифицирует фикстуры верно.
 * good — 1 файл токенов с 5 группами, нет hex/px вне; bad-hex — hex в компоненте;
 * bad-var — второй файл с переменными; bad-px — px шкалы в компоненте; bad-group — отсутствует группа.
 */
function runSelfTest() {
  let failures = 0;
  const assert = (cond, msg) => {
    if (!cond) {
      console.error(`  FAIL: ${msg}`);
      failures++;
    }
  };
  const hasViolation = (list, needle) => list.some((v) => v.includes(needle));

  const tmp = mkdtempSync(join(tmpdir(), 'check-tokens-'));
  try {
    const goodRoot = join(tmp, 'good');
    writeFixture(goodRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(goodRoot, 'src/components/Card.astro', GOOD_COMPONENT);
    const good = audit(goodRoot);
    assert(good.length === 0, `good: нет нарушений (получено: ${JSON.stringify(good)})`);

    const badHexRoot = join(tmp, 'bad-hex');
    writeFixture(badHexRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(badHexRoot, 'src/components/Card.astro', GOOD_COMPONENT + '\n  .x { color: #ff0000; }');
    const badHex = audit(badHexRoot);
    assert(
      hasViolation(badHex, 'хардкод цвета') && hasViolation(badHex, '#ff0000') && hasViolation(badHex, 'Card.astro'),
      'bad-hex: hex в компоненте детектируется с именем файла и значением'
    );

    const badVarRoot = join(tmp, 'bad-var');
    writeFixture(badVarRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(badVarRoot, 'src/components/extra.css', ':root { --local-token: 4px; }');
    const badVar = audit(badVarRoot);
    assert(
      hasViolation(badVar, 'нарушение единого файла токенов') && hasViolation(badVar, 'extra.css'),
      'bad-var: второй файл с переменными детектируется как нарушение единого файла'
    );

    const badPxRoot = join(tmp, 'bad-px');
    writeFixture(badPxRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(badPxRoot, 'src/components/Card.astro', GOOD_COMPONENT + '\n  .x { padding: 16px; }');
    const badPx = audit(badPxRoot);
    assert(
      hasViolation(badPx, 'хардкод отступа') && hasViolation(badPx, '16px'),
      'bad-px: px-значение шкалы (16px) в компоненте детектируется'
    );

    const badGroupRoot = join(tmp, 'bad-group');
    writeFixture(
      badGroupRoot,
      'src/styles/tokens.css',
      GOOD_TOKENS.replaceAll('--motion-', '--unused-') // убираем всю группу motion
    );
    const badGroup = audit(badGroupRoot);
    assert(
      hasViolation(badGroup, 'motion (--motion-*)'),
      'bad-group: отсутствие группы токенов детектируется'
    );

    // 1-2px не нарушение (outline/focus вне шкалы)
    const okPxRoot = join(tmp, 'ok-px');
    writeFixture(okPxRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(okPxRoot, 'src/components/Card.astro', GOOD_COMPONENT + '\n  .y { border-width: 2px; }');
    const okPx = audit(okPxRoot);
    assert(
      okPx.length === 0,
      `ok-px: 2px вне шкалы не нарушение (получено: ${JSON.stringify(okPx)})`
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  if (failures > 0) {
    console.error(`self-test: ${failures} сбоев логики`);
    return false;
  }
  console.log('self-test: OK — классификация фикстур работает');
  return true;
}

const selfTest = process.argv.includes('--self-test');
if (selfTest) {
  process.exitCode = runSelfTest() ? 0 : 1;
} else {
  process.exitCode = render(audit(ROOT));
}
