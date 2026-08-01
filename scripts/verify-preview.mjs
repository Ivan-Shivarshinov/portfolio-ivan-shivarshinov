#!/usr/bin/env node
// scripts/verify-preview.mjs — проверка R1 (01-VALIDATION.md, строка Per-Task Verification Map R1):
// `astro preview` отдаёт HTTP 200 + text/html на маршрутах /, /work, /lab, /about, /contact.
//
// CLI:
//   node scripts/verify-preview.mjs                     — полный прогон по 5 маршрутам (порт 4321)
//   node scripts/verify-preview.mjs --port 4322         — другой порт preview
//   node scripts/verify-preview.mjs --routes /          — ограничить список маршрутов (для 01-03: существует только /)
//   node scripts/verify-preview.mjs --routes /,/work    — несколько маршрутов через запятую
//   node scripts/verify-preview.mjs --self-test         — встроенные фикстуры без сети (логика маршрутов и статусов)
//
// Поведение: спавнит `npx astro preview --port <N>` (--no-install — честный fail-fast,
// если зависимости проекта не установлены; без TTY npx не должен интерактивно ставить пакет),
// ждёт готовности (polling GET / до 200, таймаут 60 с), затем GET по маршрутам списка.
// Exit 0 — все маршруты 200 + text/html; exit 1 — любое отличие или недоступность сервера.
// Preview-процесс всегда завершается в finally.

import { spawn, spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROUTES = ['/', '/work', '/lab', '/about', '/contact'];
const DEFAULT_PORT = 4321;
const READY_TIMEOUT_MS = 60_000;
const READY_POLL_INTERVAL_MS = 500;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Разбор аргументов CLI.
 * @returns {{ port: number, routesValue: string|null, selfTest: boolean }}
 */
function parseArgs(argv) {
  const out = { port: DEFAULT_PORT, routesValue: null, selfTest: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--port') {
      const v = Number(argv[i + 1]);
      if (!Number.isInteger(v) || v <= 0) {
        console.error(`FAIL: --port ожидает число > 0, получено "${argv[i + 1]}"`);
        process.exit(1);
      }
      out.port = v;
      i++;
    } else if (a === '--routes') {
      out.routesValue = argv[i + 1] ?? null;
      i++;
    } else if (a === '--self-test') {
      out.selfTest = true;
    } else {
      console.error(`FAIL: неизвестный флаг "${a}" (допустимы: --port N, --routes r1,r2, --self-test)`);
      process.exit(1);
    }
  }
  return out;
}

/**
 * Построение списка маршрутов из значения --routes.
 * Без флага или с пустым значением — полный массив из 5 маршрутов (default).
 */
function buildRouteList(routesValue) {
  if (!routesValue) return [...DEFAULT_ROUTES];
  const list = routesValue
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length > 0 ? list : [...DEFAULT_ROUTES];
}

/**
 * Запуск команды с учётом Windows: .cmd-шимы (npx/npm) нельзя спавнить напрямую
 * с shell:false (EINVAL/ENOENT) — оборачиваем в cmd.exe с windowsVerbatimArguments.
 */
function spawnCommand(cmd, args, opts = {}) {
  if (process.platform === 'win32') {
    return spawn(
      'cmd.exe',
      ['/d', '/s', '/c', [cmd, ...args].join(' ')],
      { ...opts, windowsVerbatimArguments: true }
    );
  }
  return spawn(cmd, args, opts);
}

/**
 * Завершение процесса preview (на Windows — дерево процессов через taskkill).
 */
function terminateProcess(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === 'win32') {
    try {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } catch {
      /* процесс мог уже завершиться */
    }
  } else {
    try {
      child.kill('SIGTERM');
    } catch {
      /* процесс мог уже завершиться */
    }
  }
}

/**
 * Ожидание готовности preview-сервера: polling GET / до 200 или таймаут.
 */
async function waitForServer(baseUrl, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError = 'нет ответа';
  while (Date.now() < deadline) {
    try {
      const res = await fetch(baseUrl);
      if (res.ok) return true;
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err.message;
    }
    await sleep(READY_POLL_INTERVAL_MS);
  }
  throw new Error(
    `preview-сервер не ответил 200 на ${baseUrl} за ${Math.round(timeoutMs / 1000)} с (последняя ошибка: ${lastError})`
  );
}

/**
 * Проверка маршрутов: для каждого — HTTP-статус 200 и content-type text/html.
 * fetchFn инжектируется для self-test (без сети).
 */
async function probeRoutes(baseUrl, routes, fetchFn = fetch) {
  const results = [];
  for (const route of routes) {
    const url = new URL(route, baseUrl.endsWith('/') ? baseUrl : baseUrl + '/').href;
    try {
      const res = await fetchFn(url);
      const ct = String(res.headers.get('content-type') || '');
      results.push({
        route,
        status: res.status,
        contentType: ct,
        ok: res.status === 200 && ct.includes('text/html'),
      });
    } catch (err) {
      results.push({ route, status: 0, contentType: '', ok: false, error: err.message });
    }
  }
  return results;
}

function renderResults(results) {
  const width = Math.max(...results.map((r) => r.route.length), 10);
  console.log('Маршрут' + ' '.repeat(width - 7) + ' Статус  Content-Type       Итог');
  for (const r of results) {
    const ct = r.contentType || '(нет)';
    console.log(
      r.route.padEnd(width) +
        `  ${String(r.status).padEnd(6)} ${ct.padEnd(17)} ` +
        (r.ok ? 'OK' : r.error ? `FAIL — ${r.error}` : 'FAIL')
    );
  }
}

async function runMain(args) {
  const routes = buildRouteList(args.routesValue);
  const baseUrl = `http://localhost:${args.port}`;
  console.log(`verify-preview: запуск astro preview на порту ${args.port}, маршруты: ${routes.join(', ')}`);

  const preview = spawnCommand(
    'npx',
    ['--no-install', 'astro', 'preview', '--port', String(args.port)],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }
  );
  let previewErr = '';
  preview.stderr.on('data', (d) => {
    previewErr += d;
  });

  try {
    await waitForServer(baseUrl, READY_TIMEOUT_MS);
  } catch (err) {
    if (preview.exitCode !== null) {
      console.error(`FAIL: preview-процесс завершился с кодом ${preview.exitCode}`);
      console.error(previewErr.trim() || '(без вывода stderr)');
    }
    console.error(`FAIL: ${err.message}`);
    terminateProcess(preview);
    return 1;
  }

  const results = await probeRoutes(baseUrl, routes);
  renderResults(results);

  const failed = results.filter((r) => !r.ok);
  terminateProcess(preview);

  if (failed.length > 0) {
    console.error(`FAIL: ${failed.length} из ${results.length} маршрутов не отвечают 200 + text/html`);
    return 1;
  }
  console.log(`OK: все ${results.length} маршрутов отвечают 200 + text/html`);
  return 0;
}

/**
 * Self-test: встроенные фикстуры без сети.
 * - построение списка маршрутов (default 5, --routes ограничивает)
 * - сравнение статусов: good = 5 маршрутов 200 → pass; bad = один маршрут 404 → fail фиксируется;
 *   bad-ct = content-type не text/html → fail фиксируется.
 * Exit 0 при корректной работе логики.
 */
async function runSelfTest() {
  let failures = 0;
  const assert = (cond, msg) => {
    if (!cond) {
      console.error(`  FAIL: ${msg}`);
      failures++;
    }
  };

  // 1. Построение списка маршрутов
  const def = buildRouteList(null);
  assert(
    def.length === 5 && def[0] === '/' && def[4] === '/contact',
    'default список маршрутов должен содержать 5 элементов: / /work /lab /about /contact'
  );
  const one = buildRouteList('/');
  assert(one.length === 1 && one[0] === '/', '--routes / → ровно 1 маршрут');
  const two = buildRouteList('/,/work');
  assert(two.length === 2 && two[1] === '/work', '--routes /,/work → ровно 2 маршрута');

  // 2. Сравнение статусов на фикстурах
  const fakeFetch = (statusByRoute, contentType = 'text/html; charset=utf-8') => async (url) => {
    const route = new URL(url).pathname;
    return { status: statusByRoute[route] ?? 404, headers: { get: (h) => (h === 'content-type' ? contentType : '') } };
  };

  const good = await probeRoutes('http://localhost:4321', DEFAULT_ROUTES, fakeFetch({
    '/': 200, '/work': 200, '/lab': 200, '/about': 200, '/contact': 200,
  }));
  assert(good.every((r) => r.ok), 'фикстура good: 5 маршрутов 200 + text/html → все OK');

  const bad = await probeRoutes('http://localhost:4321', DEFAULT_ROUTES, fakeFetch({
    '/': 200, '/work': 200, '/lab': 404, '/about': 200, '/contact': 200,
  }));
  const badRoute = bad.find((r) => !r.ok);
  assert(
    bad.filter((r) => !r.ok).length === 1 && badRoute && badRoute.route === '/lab' && badRoute.status === 404,
    'фикстура bad: маршрут 404 → ровно 1 fail с кодом 404'
  );

  const badCt = await probeRoutes('http://localhost:4321', ['/'], fakeFetch({ '/': 200 }, 'application/json'));
  assert(
    badCt.length === 1 && !badCt[0].ok && badCt[0].contentType === 'application/json',
    'фикстура bad-ct: 200 без text/html → fail'
  );

  if (failures > 0) {
    console.error(`self-test: ${failures} сбоев логики`);
    return false;
  }
  console.log('self-test: OK — построение маршрутов и сравнение статусов работают');
  return true;
}

const args = parseArgs(process.argv.slice(2));
if (args.selfTest) {
  const ok = await runSelfTest();
  process.exitCode = ok ? 0 : 1;
} else {
  try {
    process.exitCode = await runMain(args);
  } catch (err) {
    console.error(`FAIL: непредвиденная ошибка: ${err.message}`);
    process.exitCode = 1;
  }
}
