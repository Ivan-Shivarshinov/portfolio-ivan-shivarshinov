#!/usr/bin/env node
// scripts/check-seo.mjs — проверка R4 (01-VALIDATION.md, Per-Task Verification Map R4):
// 5 уникальных пар title/description, canonical + Open Graph на каждой странице,
// sitemap-index.xml содержит все 5 маршрутов.
//
// CLI:
//   node scripts/check-seo.mjs            — аудит собранного dist/ (перед прогоном: npm run build)
//   node scripts/check-seo.mjs --self-test — встроенные HTML/XML-фикстуры без сети
//
// Правила (контракт 01-02-PLAN.md Task 2):
// 1. Ровно 5 уникальных пар (title, description) по всем собранным страницам dist/**/*.html;
//    дубль пары или количество страниц != 5 → exit 1 с перечислением дублей.
// 2. Каждая страница содержит: link rel="canonical", meta property="og:title",
//    og:description, og:type, og:url, og:locale — отсутствие любого → exit 1.
// 3. dist/sitemap-index.xml содержит 5 элементов url (НЕ sitemap.xml — фактический вывод
//    @astrojs/sitemap 3.x, Pitfall 3) — иначе exit 1.
//
// Exit 0 — все проверки зелёные.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = join(ROOT, 'dist');
const SITEMAP_INDEX = 'sitemap-index.xml'; // Pitfall 3: НЕ sitemap.xml
const EXPECTED_PAGES = 5;
const EXPECTED_SITEMAP_URLS = 5;

const REQUIRED_OG_TAGS = ['og:title', 'og:description', 'og:type', 'og:url', 'og:locale'];

const readText = (p) => readFileSync(p, 'utf8');

/**
 * Рекурсивный обход директории; возвращает файлы с расширениями из exts.
 */
function walk(dir, exts, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
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
 * Декодирование базовых HTML-сущностей (чтобы пары title/description сравнивались по смыслу).
 */
function decodeEntities(s) {
  return s
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
}

/**
 * Извлечение SEO-метаданных из HTML страницы.
 * @returns {{ title: string, description: string|null, canonical: boolean, og: Record<string, boolean> }}
 */
function extractMeta(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : '';

  const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const descTag = metaTags.find((t) => /(?:^|\s)name\s*=\s*["']description["']/i.test(t));
  let description = null;
  if (descTag) {
    const content = descTag.match(/\bcontent\s*=\s*["']([^"']*)["']/i);
    description = content ? decodeEntities(content[1].trim()) : '';
  }

  const canonical = /<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*>/i.test(html);
  const og = {};
  for (const prop of REQUIRED_OG_TAGS) {
    og[prop] = metaTags.some((t) => new RegExp(`(?:^|\\s)property\\s*=\\s*["']${prop}["']`, 'i').test(t));
  }
  return { title, description, canonical, og };
}

/**
 * Аудит набора страниц [{ file, html }]. Возвращает список проблем (пусто = чисто).
 */
function auditPages(pages) {
  const issues = [];
  const audited = pages.map(({ file, html }) => {
    const meta = extractMeta(html);
    const pageIssues = [];
    if (!meta.title) pageIssues.push('нет <title>');
    if (meta.description === null || meta.description === '') pageIssues.push('нет meta name="description"');
    if (!meta.canonical) pageIssues.push('нет link rel="canonical"');
    for (const prop of REQUIRED_OG_TAGS) {
      if (!meta.og[prop]) pageIssues.push(`нет meta property="${prop}"`);
    }
    return { file, meta, pageIssues };
  });

  if (pages.length !== EXPECTED_PAGES) {
    issues.push(`найдено страниц: ${pages.length}, ожидалось ${EXPECTED_PAGES}`);
  }

  const pairCounts = new Map();
  for (const p of audited) {
    const key = `${p.meta.title}||${p.meta.description}`;
    pairCounts.set(key, (pairCounts.get(key) ?? []).concat(p.file));
  }
  for (const [pair, files] of pairCounts) {
    if (files.length > 1) {
      const [title, desc] = pair.split('||');
      issues.push(
        `дубль пары title/description (${files.length} страниц): «${title}» / «${desc}» — ${files.join(', ')}`
      );
    }
  }
  if (audited.every((p) => p.pageIssues.length === 0) && pairCounts.size !== EXPECTED_PAGES) {
    issues.push(`уникальных пар title/description: ${pairCounts.size}, ожидалось ${EXPECTED_PAGES}`);
  }

  for (const p of audited) {
    for (const i of p.pageIssues) issues.push(`${relative(DIST_DIR, p.file)}: ${i}`);
  }
  return issues;
}

/**
 * Аудит sitemap-вывода: парсит sitemap-index.xml (sitemapindex → дочерние <loc>),
 * резолвит дочерние sitemap-файлы через readChild и считает суммарное число <url>.
 * Фактический вывод @astrojs/sitemap 3.x (Pitfall 3): сам индекс <url> не содержит —
 * маршруты лежат в sitemap-0.xml, на который индекс ссылается.
 * @param {string} indexXml текст sitemap-index.xml
 * @param {(fileName: string) => string|null} readChild читает дочерний sitemap по имени файла; null — файл отсутствует
 */
function auditSitemap(indexXml, readChild) {
  const childLocs = [...indexXml.matchAll(/<\s*sitemap\s*>\s*<loc>([^<]+)<\/loc>\s*<\/sitemap>/g)].map((m) => m[1]);
  if (childLocs.length === 0) {
    return [`${SITEMAP_INDEX} не ссылается ни на один дочерний sitemap`];
  }
  const missing = [];
  let total = 0;
  for (const loc of childLocs) {
    const fileName = loc.split('/').pop();
    const text = readChild(fileName);
    if (text === null) {
      missing.push(fileName);
      continue;
    }
    total += (text.match(/<url(?:\s|>)/g) ?? []).length;
  }
  const issues = [];
  if (missing.length > 0) {
    issues.push(`дочерние sitemap-файлы не найдены в dist/: ${missing.join(', ')}`);
  }
  if (total !== EXPECTED_SITEMAP_URLS) {
    issues.push(`дочерние sitemap-файлы содержат ${total} url, ожидалось ${EXPECTED_SITEMAP_URLS}`);
  }
  return issues;
}

/**
 * Полный аудит собранного dist/. Возвращает список проблем.
 */
function auditDist() {
  if (!existsSync(DIST_DIR)) {
    return ['dist/ не найден — сначала выполните npm run build'];
  }
  const htmlFiles = walk(DIST_DIR, ['.html']);
  if (htmlFiles.length === 0) {
    return ['в dist/ нет собранных .html страниц'];
  }
  const pages = htmlFiles.map((f) => ({ file: f, html: readText(f) }));
  const issues = auditPages(pages);

  const sitemapAbs = join(DIST_DIR, SITEMAP_INDEX);
  if (!existsSync(sitemapAbs)) {
    issues.push(
      `${SITEMAP_INDEX} не найден в dist/ (проверка ориентируется на sitemap-index.xml — фактический вывод @astrojs/sitemap 3.x, файла sitemap.xml нет)`
    );
  } else {
    const readChild = (fileName) => {
      const p = join(DIST_DIR, fileName);
      return existsSync(p) ? readText(p) : null;
    };
    issues.push(...auditSitemap(readText(sitemapAbs), readChild));
  }
  return issues;
}

function render(issues) {
  if (issues.length === 0) {
    console.log('check-seo: OK — 5 уникальных пар title/description, canonical + OG везде, sitemap-index.xml → sitemap-0.xml с 5 url');
    return 0;
  }
  console.error(`check-seo: FAIL — ${issues.length} проблем:`);
  for (const i of issues) console.error(`  - ${i}`);
  return 1;
}

// --- Self-test: встроенные HTML/XML-фикстуры без сети ---

function makePage(title, desc, opts = {}) {
  const og = (prop, content) => `<meta property="${prop}" content="${content}" />`;
  const path = opts.path ?? '/';
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <link rel="canonical" href="https://portfolio.example.com${path}" />
  ${og('og:title', opts.ogTitle ?? title)}
  ${og('og:description', opts.ogDesc ?? desc)}
  ${og('og:type', 'website')}
  ${opts.skipOgUrl ? '' : og('og:url', `https://portfolio.example.com${path}`)}
  ${og('og:locale', 'ru_RU')}
</head>
<body></body>
</html>`;
}

// Фикстуры формата @astrojs/sitemap 3.x (Pitfall 3): sitemap-index.xml — sitemapindex,
// ссылающийся на дочерний sitemap-0.xml (urlset) с маршрутами.
const GOOD_SITEMAP_INDEX = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://portfolio.example.com/sitemap-0.xml</loc></sitemap></sitemapindex>`;
const GOOD_SITEMAP_CHILD = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://portfolio.example.com/</loc></url>
  <url><loc>https://portfolio.example.com/work/</loc></url>
  <url><loc>https://portfolio.example.com/lab/</loc></url>
  <url><loc>https://portfolio.example.com/about/</loc></url>
  <url><loc>https://portfolio.example.com/contact/</loc></url>
</urlset>`;
const makeSitemapFixtures = (childText) => (fileName) => (fileName === 'sitemap-0.xml' ? childText : null);

function runSelfTest() {
  let failures = 0;
  const assert = (cond, msg) => {
    if (!cond) {
      console.error(`  FAIL: ${msg}`);
      failures++;
    }
  };
  const hasIssue = (list, needle) => list.some((i) => i.includes(needle));

  // good: 5 уникальных пар + все OG-теги → без проблем
  const goodPages = ['Главная', 'Работы', 'Лаборатория', 'Обо мне', 'Контакты'].map((t, idx) => ({
    file: `p${idx + 1}.html`,
    html: makePage(t, `Описание: ${t}`, { path: ['/', '/work/', '/lab/', '/about/', '/contact/'][idx] }),
  }));
  const good = auditPages(goodPages);
  assert(good.length === 0, `good: 5 уникальных пар + OG → без проблем (получено: ${JSON.stringify(good)})`);

  // дубль пары → детект
  const dupPages = [
    ...goodPages.slice(0, 4),
    { file: 'p5.html', html: makePage('Главная', 'Описание: Главная', { path: '/work/' }) },
  ];
  const dup = auditPages(dupPages);
  assert(
    hasIssue(dup, 'дубль пары title/description'),
    'дубль: повтор пары title/description детектируется'
  );

  // отсутствие og:url → детект
  const noOgUrl = [
    ...goodPages.slice(0, 4),
    { file: 'p5.html', html: makePage('Контакты', 'Описание: Контакты', { path: '/contact/', skipOgUrl: true }) },
  ];
  const missingOg = auditPages(noOgUrl);
  assert(
    hasIssue(missingOg, 'og:url'),
    'missing-og: отсутствие meta property="og:url" детектируется'
  );

  // sitemap-фикстура (индекс → дочерний urlset): 5 url → pass; 4 url → fail; пустой индекс → fail
  const sitemapOk = auditSitemap(GOOD_SITEMAP_INDEX, makeSitemapFixtures(GOOD_SITEMAP_CHILD));
  assert(sitemapOk.length === 0, `sitemap: 5 url → pass (получено: ${JSON.stringify(sitemapOk)})`);
  const sitemapBad = auditSitemap(GOOD_SITEMAP_INDEX, makeSitemapFixtures(GOOD_SITEMAP_CHILD.replace('<url>', '')));
  assert(hasIssue(sitemapBad, 'содержат 4 url'), 'sitemap: 4 url → fail детектируется');
  const sitemapEmpty = auditSitemap('<sitemapindex></sitemapindex>', makeSitemapFixtures(GOOD_SITEMAP_CHILD));
  assert(hasIssue(sitemapEmpty, 'не ссылается ни на один дочерний sitemap'), 'sitemap: пустой индекс → fail детектируется');

  // отсутствие canonical → детект
  const noCanonical = [
    { file: 'p1.html', html: makePage('Главная', 'Описание', { path: '/' }).replace(/<link rel="canonical"[^>]*\/>/, '') },
  ];
  assert(hasIssue(auditPages(noCanonical), 'canonical'), 'no-canonical: отсутствие rel="canonical" детектируется');

  if (failures > 0) {
    console.error(`self-test: ${failures} сбоев логики`);
    return false;
  }
  console.log('self-test: OK — пары, SEO-теги и sitemap классифицируются верно');
  return true;
}

if (process.argv.includes('--self-test')) {
  process.exitCode = runSelfTest() ? 0 : 1;
} else {
  try {
    process.exitCode = render(auditDist());
  } catch (err) {
    console.error(`FAIL: непредвиденная ошибка: ${err.message}`);
    process.exitCode = 1;
  }
}
