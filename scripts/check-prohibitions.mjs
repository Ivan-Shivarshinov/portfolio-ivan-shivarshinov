#!/usr/bin/env node
// scripts/check-prohibitions.mjs — проверка Prohibitions P1/P2 (01-SPEC.md):
// P1: utility-first CSS фреймворк (Tailwind и аналоги) НЕ добавляется в фазе 1
// P2: тяжёлый клиентский фреймворк НЕ становится основой всего сайта
//
// CLI:
//   node scripts/check-prohibitions.mjs             — проверка package.json (путь из GSD_PROHIB_SUBJECT, default ./package.json)
//   node scripts/check-prohibitions.mjs --self-test — встроенные фикстуры (известная-хорошая / известная-плохая)
//
// Exit 0 — запрещённых зависимостей нет; exit 1 — есть (вывод списка).

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Denylist запрещённых пакетов.
// Точные имена — одиночные пакеты (P1: utility-first CSS; P2: тяжёлые клиентские фреймворки).
// Namespace-префиксы (слеш) — скаупы организаций: @tailwindcss/*, @unocss/*, @angular/*.
const DENYLIST_EXACT = [
  // P1: utility-first CSS
  'tailwindcss',
  'windicss',
  'unocss',
  // P2: тяжёлые клиентские фреймворки
  'react',
  'react-dom',
  'vue',
  'svelte',
  'solid-js',
  'preact',
];

const DENYLIST_PREFIXES = [
  // P1: utility-first CSS — namespace-пакеты
  '@tailwindcss/',
  '@unocss/',
  // P2: тяжёлые клиентские фреймворки — namespace-пакеты
  '@angular/',
];

/**
 * Проверка списка зависимостей на запрещённые пакеты.
 * Точное совпадение для одиночных имён, префикс для namespace-пакетов —
 * похожие имена (vuepress, react-test-renderer, @sveltejs/kit) не дают ложных срабатываний.
 * @param {Record<string, string>} deps — map имя-пакет -> версия
 * @returns {string[]} найденные запрещённые пакеты (пусто = чисто)
 */
function findProhibited(deps = {}) {
  const found = [];
  for (const name of Object.keys(deps)) {
    if (DENYLIST_EXACT.includes(name) || DENYLIST_PREFIXES.some((prefix) => name.startsWith(prefix))) {
      found.push(name);
    }
  }
  return found.sort();
}

/**
 * Проверка package.json по пути. Возвращает { ok, found, errors }.
 */
function auditPackageJson(pkgPath) {
  if (!existsSync(pkgPath)) {
    return { ok: false, found: [], errors: [`package.json не найден: ${pkgPath}`] };
  }
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch (err) {
    return { ok: false, found: [], errors: [`не удалось прочитать ${pkgPath}: ${err.message}`] };
  }
  return auditPkg(pkg);
}

function auditPkg(pkg) {
  const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  const found = findProhibited(allDeps);
  return { ok: found.length === 0, found, errors: [] };
}

function render(result) {
  if (result.ok) {
    console.log('check-prohibitions: OK — запрещённых зависимостей нет (P1 utility-first CSS, P2 клиентские фреймворки)');
    return 0;
  }
  console.error('check-prohibitions: FAIL — найдены запрещённые зависимости:');
  for (const name of result.found) console.error(`  - ${name}`);
  for (const err of result.errors ?? []) console.error(`  - ${err}`);
  return 1;
}

/**
 * Self-test: известная-хорошая фикстура (текущий package.json проекта) → exit 0;
 * известная-плохая (встроенная строка JSON с tailwindcss/react/unocss/@angular/*) → exit 1;
 * пограничные похожие имена (vuepress, react-test-renderer) → НЕ детектируются.
 */
function runSelfTest() {
  let failures = 0;
  const assert = (cond, msg) => {
    if (!cond) {
      console.error(`  FAIL: ${msg}`);
      failures++;
    }
  };

  // Известная-хорошая: текущий package.json проекта (fixture по пути GSD_PROHIB_SUBJECT или default)
  const subject = process.env.GSD_PROHIB_SUBJECT ?? './package.json';
  const good = auditPackageJson(subject);
  assert(good.ok, `известная-хорошая (${subject}): должна пройти без нарушений (получено: ${JSON.stringify(good.found)})`);

  // Известная-плохая: встроенная фикстура с запрещёнными пакетами из обеих групп
  const badFixture = JSON.stringify({
    name: 'bad-fixture',
    dependencies: { astro: '^7.1.6', tailwindcss: '^4.0.0', react: '^19.0.0' },
    devDependencies: { unocss: '^0.1.0', '@angular/core': '^19.0.0', '@tailwindcss/vite': '^4.0.0' },
  });
  const bad = auditPkg(JSON.parse(badFixture));
  const expectBad = ['@angular/core', '@tailwindcss/vite', 'react', 'tailwindcss', 'unocss'];
  assert(
    !bad.ok && expectBad.every((n) => bad.found.includes(n)),
    `известная-плохая: ожидаются ${expectBad.join(', ')} (получено: ${JSON.stringify(bad.found)})`
  );

  // Пограничные случаи: похожие имена не должны ложно срабатывать
  const edgeFixture = JSON.stringify({
    name: 'edge-fixture',
    dependencies: { vuepress: '1.0.0', 'react-test-renderer': '1.0.0', '@sveltejs/kit': '2.0.0' },
  });
  const edge = auditPkg(JSON.parse(edgeFixture));
  assert(
    edge.ok,
    `пограничные: похожие имена (vuepress, react-test-renderer, @sveltejs/kit) не должны детектироваться (получено: ${JSON.stringify(edge.found)})`
  );

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
  const subject = process.env.GSD_PROHIB_SUBJECT ?? './package.json';
  process.exitCode = render(auditPackageJson(resolve(subject)));
}
