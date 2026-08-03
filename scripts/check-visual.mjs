#!/usr/bin/env node
// scripts/check-visual.mjs — визуальный смоук фазы 2 (слой поверх живого прохода, не замена):
// механические проверки, которые человек всё равно делает глазами: отсутствие
// горизонтального скролла на ключевых ширинах, hover-отклики CTA и ссылок,
// prefers-reduced-motion (мгновенные переходы). Оценка композиции/ритма — за человеком.
//
// CLI:
//   node scripts/check-visual.mjs                    — полный прогон (порт 4321)
//   node scripts/check-visual.mjs --port 4322        — другой порт preview
//   node scripts/check-visual.mjs --self-test        — фикстуры без браузера (логика проверок)
//
// Поведение: спавнит `npx astro preview --port <N>` (--no-install, как verify-preview.mjs),
// ждёт готовности, затем playwright-core с системным Edge (Windows) или chromium (прочее).
// Exit 0 — все проверки PASS; exit 1 — любое FAIL или недоступность сервера/браузера.
// Preview-процесс и браузер всегда завершаются в finally.

import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROUTES = ['/', '/work', '/lab', '/about', '/contact'];
const WIDTHS = [320, 375, 768, 1200];
const DEFAULT_PORT = 4321;
const READY_TIMEOUT_MS = 60_000;
const READY_POLL_INTERVAL_MS = 500;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Спавн `astro preview` (тот же паттерн, что verify-preview.mjs, решение 01-02 T1):
 * на Windows .cmd-шимы (npx) запускаются через cmd.exe /d /s /c + windowsVerbatimArguments.
 */
function spawnPreview(port) {
  const cmd = 'npx';
  const args = ['--no-install', 'astro', 'preview', '--port', String(port)];
  const opts = { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] };
  const child =
    process.platform === 'win32'
      ? spawn('cmd.exe', ['/d', '/s', '/c', [cmd, ...args].join(' ')], {
          ...opts,
          windowsVerbatimArguments: true,
        })
      : spawn(cmd, args, opts);
  let stderr = '';
  child.stderr?.on('data', (d) => {
    stderr += d.toString();
  });
  return { child, stderrRef: () => stderr };
}

/** Завершение процесса preview (на Windows — дерево процессов через taskkill). */
function terminateProcess(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === 'win32') {
    try {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } catch {
      /* процесс мог уже завершиться */
    }
  } else {
    child.kill();
  }
}

/**
 * Определение работающего base URL preview. Astro preview на Windows может слушать
 * только IPv6-loopback ([::1]) — опрашиваем оба адреса, берём первый отвечающий 200.
 * @returns {Promise<string|null>} base URL (например, "http://[::1]:4321") или null.
 */
async function probeBaseUrl(port) {
  const candidates = [`http://127.0.0.1:${port}`, `http://[::1]:${port}`];
  for (const base of candidates) {
    try {
      const res = await fetch(`${base}/`);
      if (res.ok) return base;
    } catch {
      /* пробуем следующий адрес */
    }
  }
  return null;
}

/**
 * Ожидание готовности preview: если сервер уже отвечает на порту — переиспользуем его
 * (например, пользовательский preview с живым проходом); иначе спавним свой и ждём.
 * @returns {Promise<{base: string, spawned: boolean}>}
 */
async function ensurePreview(port) {
  const existing = await probeBaseUrl(port);
  if (existing) {
    console.log(`  preview уже запущен на ${existing} — переиспользуем`);
    return { base: existing, spawned: false, child: null };
  }
  const { child, stderrRef } = spawnPreview(port);
  try {
    const deadline = Date.now() + READY_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const base = await probeBaseUrl(port);
      if (base) return { base, spawned: true, child };
      await sleep(READY_POLL_INTERVAL_MS);
    }
    throw new Error(`preview не поднялся за ${READY_TIMEOUT_MS / 1000} с: ${stderrRef()}`);
  } catch (err) {
    terminateProcess(child);
    throw err;
  }
}

/** Определение executable браузера: системный Edge (Win) или chromium (прочее). */
function resolveBrowser() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/microsoft-edge',
    '/usr/bin/chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ];
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error('браузер не найден: установите Edge или chromium (проверка нуждается в браузере)');
  return found;
}

// ---------------------------------------------------------------------------
// Сами проверки (чистые функции — покрываются self-test'ом без браузера)
// ---------------------------------------------------------------------------

/** Шаг 1: на каждой ширине — отсутствие горизонтального скролла. */
function checkNoHScroll(page, route, width) {
  return page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  }).then(({ scrollWidth, clientWidth }) => ({
    ok: scrollWidth <= clientWidth,
    detail: `scrollWidth ${scrollWidth} <= clientWidth ${clientWidth}`,
  }));
}

/** Шаг 2: hover CTA на главной — background меняется. */
async function checkCtaHover(page) {
  const before = await page.getByRole('link', { name: /Смотреть работы/ }).evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  );
  await page.getByRole('link', { name: /Смотреть работы/ }).hover();
  await sleep(250);
  const after = await page.getByRole('link', { name: /Смотреть работы/ }).evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  );
  return { ok: before !== after, detail: `${before} -> ${after}` };
}

/** Шаг 3: hover текстовой ссылки — подчёркивание + accent. */
async function checkLinkHover(page) {
  const link = page.getByRole('link', { name: 'На главную' });
  const before = await link.evaluate((el) => ({
    deco: getComputedStyle(el).textDecorationLine,
    color: getComputedStyle(el).color,
  }));
  await link.hover();
  await sleep(250);
  const after = await link.evaluate((el) => ({
    deco: getComputedStyle(el).textDecorationLine,
    color: getComputedStyle(el).color,
  }));
  const ok = after.deco.includes('underline') && after.color !== before.color;
  return { ok, detail: `${before.deco}/${before.color} -> ${after.deco}/${after.color}` };
}

/** Шаг 4: prefers-reduced-motion — длительности переходов 0s. */
async function checkReducedMotion(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const link = page.getByRole('link', { name: 'На главную' });
  await link.hover();
  await sleep(50);
  const transition = await link.evaluate((el) => getComputedStyle(el).transitionDuration);
  const ok = /^0s(,0s)*$/.test(transition.trim());
  return { ok, detail: `transition-duration ${transition}` };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = { port: DEFAULT_PORT, selfTest: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--port') {
      const v = Number(argv[i + 1]);
      if (!Number.isInteger(v) || v <= 0) {
        console.error(`FAIL: --port ожидает число > 0, получено "${argv[i + 1]}"`);
        process.exit(1);
      }
      out.port = v;
      i++;
    } else if (argv[i] === '--self-test') {
      out.selfTest = true;
    }
  }
  return out;
}

function selfTest() {
  let failures = 0;
  const assert = (name, cond) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}`);
    if (!cond) failures++;
  };
  assert('self-test: URL маршрутов валидны', DEFAULT_ROUTES.every((r) => r.startsWith('/')));
  assert('self-test: ширины в порядке', WIDTHS.every((w) => Number.isInteger(w) && w > 0));
  const f = (deco, color) => ({ deco, color });
  assert(
    'self-test: hover подчёркивает ссылку',
    checkLinkHoverLogic(f('none', 'rgb(31, 30, 28)'), f('underline', 'rgb(168, 75, 50)')),
  );
  assert('self-test: transition 0s распознаётся', /^0s(,0s)*$/.test('0s'));
  assert('self-test: transition 0.15s НЕ 0s', !/^0s(,0s)*$/.test('0.15s'));
  if (failures > 0) {
    console.error(`\nFAIL: self-test — ${failures} провал(ов)`);
    process.exit(1);
  }
  console.log('\nOK self-test');
}

/** Логика hover-ссылки вынесена для self-test (без браузера). */
function checkLinkHoverLogic(before, after) {
  return after.deco.includes('underline') && after.color !== before.color;
}

async function main() {
  const { port, selfTest: st } = parseArgs(process.argv.slice(2));
  if (st) {
    selfTest();
    return;
  }

  const { chromium } = await import('playwright-core');
  let failures = 0;

  // 1. preview (переиспользуем уже запущенный, если есть)
  const { base, spawned, child } = await ensurePreview(port);
  try {
    // 2. браузер
    const executablePath = resolveBrowser();
    const browser = await chromium.launch({ executablePath, headless: true });
    try {
      const page = await browser.newPage();

      // Шаг 1: скролл по ширинам x маршрутам (главная — все ширины, остальные — 320 и 1200)
      console.log('Шаг 1: отсутствие горизонтального скролла');
      for (const route of DEFAULT_ROUTES) {
        const widths = route === '/' ? WIDTHS : [320, 1200];
        for (const width of widths) {
          await page.setViewportSize({ width, height: 800 });
          await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
          const r = await checkNoHScroll(page, route, width);
          const tag = r.ok ? 'PASS' : 'FAIL';
          if (!r.ok) failures++;
          console.log(`  ${tag} ${route} @${width}px (${r.detail})`);
        }
      }

      // Шаг 2: hover CTA
      console.log('Шаг 2: hover CTA меняет фон');
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto(`${base}/`, { waitUntil: 'networkidle' });
      const cta = await checkCtaHover(page);
      const ctaTag = cta.ok ? 'PASS' : 'FAIL';
      if (!cta.ok) failures++;
      console.log(`  ${ctaTag} CTA hover (${cta.detail})`);

      // Шаг 3: hover текстовой ссылки (страница с «На главную»)
      console.log('Шаг 3: hover ссылки — подчёркивание + accent');
      await page.goto(`${base}/lab`, { waitUntil: 'networkidle' });
      const link = await checkLinkHover(page);
      const linkTag = link.ok ? 'PASS' : 'FAIL';
      if (!link.ok) failures++;
      console.log(`  ${linkTag} link hover (${link.detail})`);

      // Шаг 4: reduced-motion
      console.log('Шаг 4: prefers-reduced-motion — переходы 0s');
      await page.goto(`${base}/lab`, { waitUntil: 'networkidle' });
      const rm = await checkReducedMotion(page);
      const rmTag = rm.ok ? 'PASS' : 'FAIL';
      if (!rm.ok) failures++;
      console.log(`  ${rmTag} reduced-motion (${rm.detail})`);

      await browser.close();
    } finally {
      // гарантированное завершение браузера даже при ошибке
      try {
        await browser.close();
      } catch {
        /* уже закрыт */
      }
    }
  } finally {
    // завершаем только свой preview; чужой (переиспользованный) не трогаем
    if (spawned) terminateProcess(child);
  }

  if (failures > 0) {
    console.error(`\nFAIL: ${failures} визуальн(ый/ых) проверк(а/и) не прошли — см. лог. Сервер: ${stderrRef()}`);
    process.exit(1);
  }
  console.log('\nOK: визуальный смоук пройден — скролла нет, hover-отклики и reduced-motion в норме');
}

main().catch((err) => {
  console.error(`\nFAIL: ${err.message}`);
  process.exit(1);
});
