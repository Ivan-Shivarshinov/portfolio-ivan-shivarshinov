#!/usr/bin/env node
// scripts/check-contrast.mjs — проверка R8 (02-VALIDATION.md, Per-Task Verification Map R8):
// контраст пар токенов текст/фон ≥ 4.5:1 (WCAG AA, обычный текст).
// Перечень пар — UI-SPEC Color (20 пар); --color-line исключён (декоративный, RESEARCH).
//
// CLI:
//   node scripts/check-contrast.mjs            — аудит src/styles/tokens.css относительно корня проекта
//   node scripts/check-contrast.mjs --self-test — встроенные фикстуры и эталоны (без сети)
//
// Формула — WCAG 2.x relative luminance + contrast ratio (RESEARCH Code Example 5).
// Exit 0 — все пары ≥ 4.5:1; exit 1 — есть нарушения (включая «токен не найден»).

import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS_PATH = 'src/styles/tokens.css';
const MIN_RATIO = 4.5;

// 20 пар токенов (UI-SPEC Color): текст × фон. Имена — как в tokens.css (с префиксом --).
const PAIRS = [
  ['--color-ink', '--color-bg'],
  ['--color-ink', '--color-surface'],
  ['--color-ink-muted', '--color-bg'],
  ['--color-ink-muted', '--color-surface'],
  ['--color-accent', '--color-bg'],
  ['--color-accent', '--color-surface'],
  ['--color-accent-ink', '--color-accent'],
  ['--color-destructive', '--color-bg'],
  ['--project-clay', '--color-bg'],
  ['--project-clay', '--color-surface'],
  ['--project-olive', '--color-bg'],
  ['--project-olive', '--color-surface'],
  ['--project-slate', '--color-bg'],
  ['--project-slate', '--color-surface'],
  ['--project-plum', '--color-bg'],
  ['--project-plum', '--color-surface'],
  ['--color-accent-ink', '--project-clay'],
  ['--color-accent-ink', '--project-olive'],
  ['--color-accent-ink', '--project-slate'],
  ['--color-accent-ink', '--project-plum'],
];

/**
 * Относительная яркость по WCAG 2.x (линеаризация sRGB).
 * @param {string} hex — #RRGGBB
 */
function luminance(hex) {
  const c = hex.replace('#', '');
  const rgb = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const lin = rgb.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** Контрастное отношение WCAG 2.x: (hi + 0.05) / (lo + 0.05). */
function ratio(a, b) {
  const [la, lb] = [luminance(a), luminance(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Извлечение значений токенов из tokens.css: --имя: #RRGGBB.
 * @returns {Map<string, string>} имя токена (с '--') → hex
 */
function extractTokens(tokensCss) {
  const map = new Map();
  for (const m of tokensCss.matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g)) {
    map.set(m[1], m[2]);
  }
  return map;
}

/**
 * Аудит контраста 20 пар по тексту tokens.css.
 * @returns {{ violations: string[], results: Array<{fg, bg, ratio|null, missing: boolean}> }}
 */
function auditContrast(tokensCss) {
  const violations = [];
  const tokens = extractTokens(tokensCss);
  const results = [];
  for (const [fg, bg] of PAIRS) {
    const fgHex = tokens.get(fg);
    const bgHex = tokens.get(bg);
    if (!fgHex || !bgHex) {
      const missing = !fgHex ? fg : bg;
      violations.push(`токен не найден: ${missing}`);
      results.push({ fg, bg, ratio: null, missing: true });
      continue;
    }
    const r = ratio(fgHex, bgHex);
    results.push({ fg, bg, ratio: r, missing: false });
    if (r < MIN_RATIO) {
      violations.push(`${fg} × ${bg}: ${r.toFixed(2)}:1 < ${MIN_RATIO}:1 (WCAG AA)`);
    }
  }
  return { violations, results };
}

function render(results, violations) {
  console.log(`check-contrast: пары токенов текст/фон (порог ${MIN_RATIO}:1, WCAG AA):`);
  for (const r of results) {
    if (r.missing) console.log(`  ${r.fg} × ${r.bg}: токен не найден [FAIL]`);
    else console.log(`  ${r.fg} × ${r.bg}: ${r.ratio.toFixed(2)}:1 ${r.ratio >= MIN_RATIO ? '[OK]' : '[FAIL]'}`);
  }
  if (violations.length === 0) {
    console.log(`check-contrast: OK — все ${PAIRS.length} пар ≥ ${MIN_RATIO}:1`);
    return 0;
  }
  console.error(`check-contrast: FAIL — ${violations.length} нарушений:`);
  for (const v of violations) console.error(`  - ${v}`);
  return 1;
}

// --- Self-test: эталоны (RESEARCH строки 471) + фикстуры токенов во временной директории ---

// Полный набор токенов — реальная палитра UI-SPEC (все пары ≥ 4.5:1, худшая olive×surface 4.84).
const GOOD_TOKENS_FIXTURE = `:root {
  --color-bg: #FAFAF7;
  --color-surface: #F1F0EB;
  --color-ink: #1F1E1C;
  --color-ink-muted: #5C5A55;
  --color-accent: #A84B32;
  --color-accent-ink: #FFFFFF;
  --color-destructive: #B3261E;
  --color-line: #DAD9D3;
  --project-clay: #8A5A44;
  --project-olive: #6B6B3F;
  --project-slate: #55606E;
  --project-plum: #6E4A5C;
}`;

function runSelfTest() {
  let failures = 0;
  const assert = (cond, msg) => {
    if (!cond) {
      console.error(`  FAIL: ${msg}`);
      failures++;
    }
  };
  const hasViolation = (list, needle) => list.some((v) => v.includes(needle));

  // Эталон 1: чёрный × белый = 21:1
  const r21 = ratio('#000000', '#FFFFFF');
  assert(Math.abs(r21 - 21) < 0.01, `эталон чёрный×белый = 21:1 (получено ${r21.toFixed(2)}:1)`);

  // Эталон 2: accent × bg = 5.40:1 (pass)
  const r54 = ratio('#A84B32', '#FAFAF7');
  assert(Math.abs(r54 - 5.4) < 0.01, `эталон #A84B32×#FAFAF7 = 5.40:1 (получено ${r54.toFixed(2)}:1)`);

  // Эталон 3: линия × bg = 1.35:1 (fail-path — нарушение обязано детектироваться)
  const r135 = ratio('#DAD9D3', '#FAFAF7');
  assert(Math.abs(r135 - 1.35) < 0.01, `эталон #DAD9D3×#FAFAF7 = 1.35:1 (получено ${r135.toFixed(2)}:1)`);
  assert(r135 < MIN_RATIO, `fail-path: 1.35:1 < ${MIN_RATIO}:1 — нарушение детектируется`);

  const tmp = mkdtempSync(join(tmpdir(), 'check-contrast-'));
  try {
    // good: полный набор токенов UI-SPEC → 0 нарушений
    const good = auditContrast(GOOD_TOKENS_FIXTURE);
    assert(good.violations.length === 0, `good: полный набор токенов → 0 нарушений (получено: ${JSON.stringify(good.violations)})`);
    assert(good.results.length === PAIRS.length, `good: проверены все ${PAIRS.length} пар`);

    // missing: без --project-plum → «токен не найден: --project-plum»
    const missing = auditContrast(GOOD_TOKENS_FIXTURE.replace('--project-plum: #6E4A5C;\n', ''));
    assert(
      hasViolation(missing.violations, 'токен не найден: --project-plum'),
      'missing: отсутствующий --project-plum детектируется'
    );

    // bad-ratio: пара с низким контрастом в перечне → нарушение с ratio
    const badTokens = GOOD_TOKENS_FIXTURE.replace('--color-ink: #1F1E1C;', '--color-ink: #A9A7A0;');
    const bad = auditContrast(badTokens);
    assert(hasViolation(bad.violations, '--color-ink × --color-bg'), 'bad-ratio: пара < 4.5:1 детектируется');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  if (failures > 0) {
    console.error(`self-test: ${failures} сбоев логики`);
    return false;
  }
  console.log('self-test: OK — эталоны 21:1 / 5.40:1 / 1.35:1 и классификация фикстур работают');
  return true;
}

if (process.argv.includes('--self-test')) {
  process.exitCode = runSelfTest() ? 0 : 1;
} else {
  const tokensAbs = join(ROOT, TOKENS_PATH);
  if (!existsSync(tokensAbs)) {
    console.error(`check-contrast: FAIL — ${TOKENS_PATH} не найден`);
    process.exitCode = 1;
  } else {
    const { violations, results } = auditContrast(readFileSync(tokensAbs, 'utf8'));
    process.exitCode = render(results, violations);
  }
}
