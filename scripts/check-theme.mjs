#!/usr/bin/env node
// scripts/check-theme.mjs — negative-фикстура R5 (02-VALIDATION.md Wave 0 gap 4):
// невалидное значение theme-пропа ProjectCard обязано ронять `astro check`
// (TS strict: theme не входит в union-тип, Don't Hand-Roll «Валидация пропов theme»).
//
// CLI:
//   node scripts/check-theme.mjs            — реальный прогон против src/pages
//     (нужен существующий ProjectCard — план 02-04 Task 2; до этого прогон даёт ложное срабатывание)
//   node scripts/check-theme.mjs --self-test — логика создания/удаления фикстуры на временной
//     директории без запуска astro check (паттерн check-collections self-test)
//
// Поведение:
// 1. Временный src/pages/zz-check-theme.astro рендерит <ProjectCard theme="bad" />;
// 2. `npm run check` обязан вернуть exit != 0 (TS strict) — exit 0 → нарушение;
// 3. Фикстура удаляется в finally; рабочее дерево проверяется на отсутствие zz-check-* файлов;
// 4. Необязательная проверка: повторный npm run check после удаления — exit 0
//    (недоступность/отличный exit → предупреждение, не fail).
// Windows: .cmd-шимы спавнятся через cmd.exe /d /s /c + windowsVerbatimArguments (STATE 01-02 T1).
//
// Exit 0 — фикстура поймана и дерево чисто; exit 1 — любая ошибка прогона.

import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES_DIR = join(ROOT, 'src/pages');
const FIXTURE_NAME = 'zz-check-theme.astro';
const FIXTURE_PREFIX = 'zz-check-';
const CHECK_TIMEOUT_MS = 180_000;

const FIXTURE_CONTENT = `---
import ProjectCard from '../components/ProjectCard.astro';
---
<ProjectCard title="zz-check" theme="bad" />
`;

/** Запись negative-фикстуры в директорию страниц. */
function writeFixture(pagesDir) {
  const p = join(pagesDir, FIXTURE_NAME);
  mkdirSync(pagesDir, { recursive: true });
  writeFileSync(p, FIXTURE_CONTENT, 'utf8');
  return p;
}

/** Список zz-check-* файлов в директории страниц (пусто = чисто). */
function listZzCheck(pagesDir) {
  if (!existsSync(pagesDir)) return [];
  return readdirSync(pagesDir).filter((f) => f.startsWith(FIXTURE_PREFIX));
}

/** Удаление всех zz-check-* файлов (no-op на чистой директории). */
function cleanupFixture(pagesDir) {
  for (const f of listZzCheck(pagesDir)) {
    rmSync(join(pagesDir, f), { force: true });
  }
}

/**
 * Запуск npm run check. Возвращает { status, stderr };
 * status === null — процесс не запустился (spawn error).
 */
function runAstroCheck(cwd = ROOT) {
  const isWin = process.platform === 'win32';
  const res = spawnSync(
    isWin ? 'cmd.exe' : 'npm',
    isWin ? ['/d', '/s', '/c', 'npm.cmd run check'] : ['run', 'check'],
    { cwd, encoding: 'utf8', timeout: CHECK_TIMEOUT_MS, windowsVerbatimArguments: isWin }
  );
  if (res.error) return { status: null, stderr: `${res.error.message}` };
  return { status: res.status, stderr: res.stderr ?? '' };
}

function runMain() {
  let violations = 0;
  if (!existsSync(PAGES_DIR)) {
    console.error('check-theme: FAIL — src/pages не найден (нечего проверять)');
    process.exitCode = 1;
    return;
  }
  try {
    writeFixture(PAGES_DIR);
    console.log(`check-theme: фикстура src/pages/${FIXTURE_NAME} создана, запуск npm run check…`);
    const { status, stderr } = runAstroCheck();
    if (status === null) {
      console.error(`check-theme: FAIL — npm run check не запустился: ${stderr}`);
      violations++;
    } else if (status === 0) {
      console.error(
        'check-theme: FAIL — невалидное theme="bad" НЕ поймано astro check (ожидался exit != 0, TS strict)'
      );
      violations++;
    } else {
      console.log(`check-theme: OK — astro check упал ожидаемо (exit ${status}) на theme="bad"`);
    }
  } catch (err) {
    console.error(`check-theme: FAIL — ${err.message}`);
    violations++;
  } finally {
    cleanupFixture(PAGES_DIR);
    const leftovers = listZzCheck(PAGES_DIR);
    if (leftovers.length > 0) {
      console.error(`check-theme: FAIL — фикстуры не удалены: ${leftovers.join(', ')}`);
      violations++;
    } else {
      console.log(`check-theme: OK — фикстуры удалены, zz-check-* в src/pages не осталось`);
    }
  }

  // Необязательная проверка: повторный npm run check после удаления фикстуры.
  if (violations === 0) {
    try {
      const again = runAstroCheck();
      if (again.status === 0) {
        console.log('check-theme: OK — повторный npm run check после удаления фикстуры: exit 0');
      } else {
        console.warn(
          `check-theme: предупреждение — повторный npm run check дал exit ${again.status} (ожидался 0); вероятно, вне фикстуры есть другие ошибки проверки типов`
        );
      }
    } catch (err) {
      console.warn(`check-theme: предупреждение — повторный npm run check недоступен: ${err.message}`);
    }
  }

  process.exitCode = violations > 0 ? 1 : 0;
}

// --- Self-test: создание/удаление фикстуры на временной директории (без astro check) ---

function runSelfTest() {
  let failures = 0;
  const assert = (cond, msg) => {
    if (!cond) {
      console.error(`  FAIL: ${msg}`);
      failures++;
    }
  };

  const tmp = mkdtempSync(join(tmpdir(), 'check-theme-'));
  try {
    const pages = join(tmp, 'src/pages');

    // Создание фикстуры
    const p = writeFixture(pages);
    assert(existsSync(p), 'фикстура создаётся в src/pages');
    const content = readFileSync(p, 'utf8');
    assert(content.includes('theme="bad"'), 'фикстура содержит theme="bad"');
    assert(
      content.includes("import ProjectCard from '../components/ProjectCard.astro';"),
      'фикстура импортирует ProjectCard'
    );

    // cleanup удаляет ВСЕ zz-check-* (включая посторонние файлы того же префикса)
    writeFileSync(join(pages, 'zz-check-extra.astro'), '', 'utf8');
    cleanupFixture(pages);
    const leftovers = listZzCheck(pages);
    assert(leftovers.length === 0, `cleanup удаляет все zz-check-* (осталось: ${leftovers.join(', ')})`);

    // cleanup на чистой директории — no-op без исключения
    let cleanupThrew = false;
    try {
      cleanupFixture(pages);
    } catch {
      cleanupThrew = true;
    }
    assert(!cleanupThrew, 'cleanup на чистой директории не бросает');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  if (failures > 0) {
    console.error(`self-test: ${failures} сбоев логики`);
    return false;
  }
  console.log('self-test: OK — создание/удаление фикстуры работает (astro check не запускался)');
  return true;
}

if (process.argv.includes('--self-test')) {
  process.exitCode = runSelfTest() ? 0 : 1;
} else {
  runMain();
}
