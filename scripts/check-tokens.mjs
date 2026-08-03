#!/usr/bin/env node
// scripts/check-tokens.mjs — проверка R2 (01-VALIDATION.md, Per-Task Verification Map R2)
// и контрактов фазы 2 (02-01-PLAN.md Task 1, 02-VALIDATION.md Wave 0 gaps 2/3/5):
// единый файл токенов, 6 групп CSS-переменных, запрет хардкод-значений,
// наличие токенов фазы 2, сверка чисел media-запросов с bp-токенами,
// grep-правило transition-токенов, W1-ассерт по dist, использование компонентов,
// ровно 1 <script> на /contact (D-10).
//
// CLI:
//   node scripts/check-tokens.mjs           — аудит src/ (+ dist/, если собран) относительно корня проекта
//   node scripts/check-tokens.mjs --self-test — встроенные фикстуры во временной директории (без сети)
//
// Правила (контракт 01-02-PLAN.md Task 1 + 02-01-PLAN.md Task 1):
// 1. Единый файл токенов: файлы с CSS-переменными (паттерн --имя:) допустимы ровно в одном файле —
//    src/styles/tokens.css; любой другой файл с переменными в src/styles|src/components → нарушение.
// 2. 6 групп в tokens.css: --color-*, --font-* ИЛИ --text-*, --space-*, --container-*, --motion-*,
//    --bp-* (каждая группа — не менее 1 переменной).
// 3. Запрет хардкода вне tokens.css в src/styles/** и src/components/**:
//    - hex-литералы цветов #RGB / #RRGGBB / #RRGGBBAA → нарушение;
//    - px-значения, совпадающие со шкалой отступов (4, 8, 16, 24, 32, 48, 64 px) → нарушение;
//    - НЕ нарушение: 1-2px (outline/focus, вне шкалы); сам tokens.css исключён из проверки хардкода.
// 4. Обязательные токены фазы 2 (R1): --text-lead, --text-caption, --ease-enter, --ease-exit,
//    --color-line, --project-clay, --project-olive, --project-slate, --project-plum;
//    --text-display обязан содержать clamp( (fluid).
// 5. Сверка чисел media-запросов (R1, R6): каждый @media (min-width: Npx) в src/components|layouts|pages —
//    N обязан равняться значению --bp-md или --bp-lg из tokens.css; max-width запрещён (AC R6).
// 6. Grep-правило transition (R4): в src/components переходы задаются только через
//    var(--motion-*) и var(--ease-*); литералы \d+ms / cubic-bezier( / ease-слова / linear → нарушение.
//    src/styles не сканируется (global.css владеет kill-switch 0ms).
// 7. W1-ассерт по dist/**/*.html (R2): на верхнеуровневых страницах ровно один
//    aria-current="page", href элемента соответствует маршруту файла (index.html → '/',
//    {name}/index.html → '/{name}'). На страницах кейсов (work/{slug}/index.html) ровно 0 —
//    маршруты кейсов не входят в Nav, Work не помечается активным (Pitfall 1).
//    dist отсутствует → предупреждение, не fail (guard auditDist).
// 8. Grep-контроль использования (R3): каждый из 8 компонентов (Button, Link, SectionHeading,
//    ProjectCard, Media, Tag, Nav, Footer) импортирован хотя бы в одном файле src/pages|src/layouts.
// 9. В собранных страницах dist ровно 1 тег <script> суммарно — единственный в
//    contact/index.html (D-10: копирование email — первый клиентский JS); на остальных
//    страницах 0 тегов (AC R4/R5, Pitfall 2).
// 10. Голые {expr} в кавычках атрибутов .astro-шаблонов src/ (регрессия 02-06):
//     Astro 7.x не интерполирует подстроки внутри "..." — class="x {v}" рендерится
//     буквально, элемент остаётся без стиля. Допустимо: шаблонный литерал
//     class={`x ${v}`} или статический класс. Frontmatter исключается ({…} в JS-строках легитимен).
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

// CSS-переменная: --имя: (в определении, не в var(--имя)).
// Lookbehind (?<![\w.-]) исключает BEM-модификаторы вида .button--primary:hover
// (перед «--» стоит точка) — ложное срабатывание на классах-модификаторах (02-03 T1).
const VAR_DEF_RE = /(?<![\w.-])--[a-z0-9][a-z0-9-]*\s*:/i;
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
  { name: 'bp (--bp-*)', re: /--bp-[a-z0-9-]+\s*:/i },
];

// Обязательные токены фазы 2 (R1) — отсутствие любого → нарушение.
const REQUIRED_TOKENS = [
  '--text-lead',
  '--text-caption',
  '--ease-enter',
  '--ease-exit',
  '--color-line',
  '--project-clay',
  '--project-olive',
  '--project-slate',
  '--project-plum',
];

// Числа media-запросов (R1): min-width — единственный допустимый вариант (AC R6).
const MEDIA_MIN_PX_RE = /@media\s*\(\s*min-width\s*:\s*(\d+)px/gi;
const MEDIA_MAX_RE = /@media\s*\(\s*max-width\s*:/i;

// Grep-правило transition (R4): только src/components — global.css владеет kill-switch 0ms.
const TRANSITION_SCAN_DIRS = ['src/components'];
const TRANSITION_DECL_RE = /transition(?:-property|-duration|-timing-function)?\s*:\s*([^;{}]+)/gi;
// Литералы вне var(): \d+ms, cubic-bezier(, ease/ease-in/ease-out/ease-in-out, linear.
const TRANSITION_LITERAL_RE =
  /(?<![\w-])(?:ease(?:-in-out|-in|-out)?|linear)(?=[\s,;)]|$)|cubic-bezier\s*\(|\d+ms/gi;

// Голый {expr} в кавычках атрибута (.astro-шаблоны): name="...{...}..." — Astro 7.x
// не интерполирует внутри "..." (регрессия 02-06). Шаблонные литералы (`...`) не матчатся.
const ATTR_BARE_EXPR_RE = /\b[a-zA-Z][a-zA-Z0-9_-]*\s*=\s*(["'])[^"']*\{[^}]*\}[^"']*\1/g;

// Grep-контроль использования (R3): 8 компонентов визуальной системы.
const USAGE_COMPONENTS = ['Button', 'Link', 'SectionHeading', 'ProjectCard', 'Media', 'Tag', 'Nav', 'Footer'];

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
 * Маршрут страницы по относительному пути в dist: index.html → '/',
 * {name}/index.html → '/{name}' (без завершающего слэша — Astro сохраняет href как написан).
 */
function routeForFile(relPath) {
  const norm = relPath.replaceAll('\\', '/');
  if (norm === 'index.html') return '/';
  const m = norm.match(/^(.*)\/index\.html$/);
  if (m) return '/' + m[1];
  return '/' + norm.replace(/\.html$/, '');
}

/**
 * Убирает Astro-frontmatter (всё между первым и вторым ---): JS-строки frontmatter
 * могут содержать {…} (const label = "{n} шт.") — они не атрибуты и не должны
 * срабатывать на правило интерполяции. Шаблонная часть возвращается без изменений.
 */
function stripFrontmatter(text) {
  if (!text.startsWith('---')) return text;
  const lines = text.split('\n');
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') return lines.slice(i + 1).join('\n');
  }
  return text;
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

  // 2. Шесть групп переменных в tokens.css
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

  // 4. Обязательные токены фазы 2 (R1) + fluid --text-display
  for (const name of REQUIRED_TOKENS) {
    if (!new RegExp(`\\s*${name}\\s*:`).test(tokens)) {
      violations.push(`отсутствует обязательный токен в ${TOKENS_PATH}: ${name} (R1)`);
    }
  }
  const displayMatch = tokens.match(/\s*--text-display\s*:\s*([^;]+);/i);
  if (!displayMatch || !displayMatch[1].includes('clamp(')) {
    violations.push(`--text-display должен быть fluid через clamp() (R1)`);
  }

  // 5. Сверка чисел media-запросов с bp-токенами (R1, R6)
  const bpNumbers = new Set();
  for (const m of tokens.matchAll(/--bp-[a-z0-9-]+\s*:\s*(\d+)px/gi)) bpNumbers.add(Number(m[1]));
  const mediaFiles = ['src/components', 'src/layouts', 'src/pages'].flatMap((d) =>
    walk(join(rootDir, d), SCAN_EXTS)
  );
  for (const f of mediaFiles) {
    const r = rel(f);
    const text = readText(f);
    if (MEDIA_MAX_RE.test(text)) {
      violations.push(`max-width медиазапрос запрещён контрактом (AC R6 — только min-width): ${r}`);
    }
    for (const m of text.matchAll(MEDIA_MIN_PX_RE)) {
      const n = Number(m[1]);
      if (!bpNumbers.has(n)) {
        const allowed = [...bpNumbers].sort((a, b) => a - b);
        violations.push(
          `медиазапрос ${n}px в ${r} не соответствует bp-токенам (${allowed.length ? allowed.join(', ') : '--bp-* не найдены в tokens.css'}) (R1)`
        );
      }
    }
  }

  // 6. Grep-правило transition-токенов (R4) — только src/components
  for (const f of TRANSITION_SCAN_DIRS.flatMap((d) => walk(join(rootDir, d), SCAN_EXTS))) {
    const r = rel(f);
    const text = readText(f);
    for (const m of text.matchAll(TRANSITION_DECL_RE)) {
      const cleaned = m[1].replace(/var\(\s*--(?:motion|ease)-[a-z0-9-]+\s*\)/gi, '');
      const literals = [...new Set(cleaned.match(TRANSITION_LITERAL_RE) ?? [])];
      if (literals.length > 0) {
        violations.push(
          `литеральные значения transition в ${r}: ${literals.join(', ')} (только var(--motion-*) и var(--ease-*), R4)`
        );
      }
    }
  }

  // 7. Grep-контроль использования компонентов (R3) — src/pages + src/layouts
  const usageFiles = ['src/pages', 'src/layouts'].flatMap((d) => walk(join(rootDir, d), ['.astro']));
  if (usageFiles.length === 0) {
    console.warn('check-tokens: нет файлов в src/pages/src/layouts — grep-контроль использования компонентов пропущен');
  } else {
    const imported = new Set();
    for (const f of usageFiles) {
      const text = readText(f);
      for (const m of text.matchAll(/import\s+[A-Za-z0-9_]+\s+from\s+['"][^'"]*\/components\/([A-Za-z0-9_]+)\.astro['"]/g)) {
        imported.add(m[1]);
      }
    }
    for (const c of USAGE_COMPONENTS) {
      if (!imported.has(c)) {
        violations.push(
          `компонент ${c} не используется: нет импорта из '../components/${c}.astro' в src/pages или src/layouts (R3)`
        );
      }
    }
  }

  // 8-9. W1-ассерт и 0 <script> по dist (R2, R4) — guard «dist не найден» (не fail)
  const distDir = join(rootDir, 'dist');
  if (!existsSync(distDir)) {
    console.warn('check-tokens: dist/ не найден — W1-ассерт и проверка <script> пропущены (выполните npm run build)');
  } else {
    const distHtml = walk(distDir, ['.html']);
    if (distHtml.length === 0) {
      console.warn('check-tokens: в dist/ нет собранных .html страниц — W1-ассерт и проверка <script> пропущены');
    } else {
      let totalScripts = 0;
      for (const f of distHtml) {
        const html = readText(f);
        const r = rel(f);
        const relDist = relative(distDir, f).replaceAll('\\', '/');

        // Правило 9 (D-10, Pitfall 2): скрипт допустим только на contact/index.html —
        // копирование email, первый клиентский JS сайта.
        const scriptCount = (html.match(/<script/gi) ?? []).length;
        totalScripts += scriptCount;
        if (scriptCount > 0 && relDist !== 'contact/index.html') {
          violations.push(
            `тег <script> в собранной странице ${r} (клиентский JS разрешён только на /contact, D-10)`
          );
        }

        // Правило 7 (W1, R2): страницы кейсов work/{slug}/index.html — ровно 0 aria-current
        // (маршруты кейсов не входят в Nav, Work НЕ помечается активным, Pitfall 1);
        // верхнеуровневые страницы — ровно 1 с верным href.
        const current = [...html.matchAll(/aria-current="page"/g)];
        if (/^work\/[^/]+\/index\.html$/.test(relDist)) {
          if (current.length !== 0) {
            violations.push(
              `W1: ${r}: страница кейса не может иметь aria-current="page" (найдено ${current.length}, R2)`
            );
          }
        } else if (current.length !== 1) {
          violations.push(`W1: ${r}: ожидалось ровно 1 aria-current="page", найдено ${current.length} (R2)`);
        } else {
          const el = html.match(/<\s*[^>]*\baria-current\s*=\s*"page"[^>]*>/i);
          const hrefMatch = el ? el[0].match(/\bhref\s*=\s*["']([^"']*)["']/i) : null;
          const href = hrefMatch ? hrefMatch[1] : null;
          const route = routeForFile(relDist);
          if (!href) {
            violations.push(`W1: ${r}: у элемента с aria-current="page" нет атрибута href (R2)`);
          } else if (href !== route) {
            violations.push(`W1: ${r}: href="${href}" не соответствует маршруту ${route} (R2)`);
          }
        }
      }
      if (totalScripts !== 1) {
        violations.push(`всего тегов <script>: ${totalScripts}, ожидалось 1 (клиентский JS разрешён только на /contact, D-10)`);
      }
    }
  }

  // 10. Голые {expr} в кавычках атрибутов (регрессия 02-06): Astro 7.x не интерполирует
  //     подстроки внутри "..." — атрибут уходит в HTML буквально, элемент без стиля.
  //     Сканируются только .astro-шаблоны src/ (frontmatter вырезан).
  for (const f of walk(join(rootDir, 'src'), ['.astro'])) {
    const r = rel(f);
    let text;
    try {
      text = stripFrontmatter(readText(f));
    } catch (err) {
      violations.push(`не удалось прочитать ${r}: ${err.message}`);
      continue;
    }
    const found = [...new Set(text.match(ATTR_BARE_EXPR_RE) ?? [])];
    if (found.length > 0) {
      violations.push(
        `голый {expr} в кавычках атрибута (Astro не интерполирует внутри "..."): ${r}: ${found.join(', ')}`
      );
    }
  }

  return violations;
}

function render(violations) {
  if (violations.length === 0) {
    console.log(
      'check-tokens: OK — единый файл токенов, 6 групп, требуемые токены, bp/медиа-сверка, transition-токены, интерполяция атрибутов, W1 (0 на кейсах), использование компонентов, 1 <script> на /contact'
    );
    return 0;
  }
  console.error(`check-tokens: FAIL — ${violations.length} нарушений:`);
  for (const v of violations) console.error(`  - ${v}`);
  return 1;
}

// --- Self-test: фикстуры во временной директории (без сети) ---

// GOOD_TOKENS: 6 групп + все обязательные токены фазы 2 + fluid --text-display.
const GOOD_TOKENS = `:root {
  /* color */
  --color-bg: #f7f6f3;
  --color-text: #1f1f1f;
  --color-line: #dad9d3;
  --project-clay: #8a5a44;
  --project-olive: #6b6b3f;
  --project-slate: #55606e;
  --project-plum: #6e4a5c;
  /* typography */
  --font-base: "Inter", system-ui, sans-serif;
  --text-md: 1rem;
  --text-lead: 18px;
  --text-caption: 12px;
  --text-display: clamp(28px, 5vw, 40px);
  /* spacing */
  --space-1: 4px;
  --space-4: 32px;
  /* container */
  --container-wide: 1280px;
  --container-narrow: 720px;
  /* bp */
  --bp-md: 768px;
  --bp-lg: 1200px;
  /* motion */
  --motion-fast: 150ms;
  --motion-slow: 500ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-enter: cubic-bezier(0, 0, 0.2, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
}`;

// GOOD_COMPONENT: var()-переход + media-запрос 768px (число равно --bp-md) → чисто.
const GOOD_COMPONENT = `---
const title = "Компонент";
---
<div class="card">{title}</div>
<style>
  .card {
    color: var(--color-text);
    margin-block: var(--space-1);
    outline: 1px solid transparent; /* 1px — вне шкалы, не нарушение */
    transition: color var(--motion-fast) var(--ease-standard);
  }
  @media (min-width: 768px) {
    .card { margin-block: var(--space-4); }
  }
</style>`;

// GOOD_PAGE: импорт всех 8 компонентов визуальной системы → grep-контроль R3 чист.
const GOOD_PAGE = `---
import Button from '../components/Button.astro';
import Link from '../components/Link.astro';
import SectionHeading from '../components/SectionHeading.astro';
import ProjectCard from '../components/ProjectCard.astro';
import Media from '../components/Media.astro';
import Tag from '../components/Tag.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
---
<Nav />
<Footer />
`;

// W1-фикстуры dist (R2): по одному aria-current="page" с верным href.
const W1_INDEX_GOOD = `<!doctype html>
<html><body>
<nav><a href="/" aria-current="page">Главная</a><a href="/work">Работы</a></nav>
</body></html>`;
const W1_WORK_GOOD = `<!doctype html>
<html><body>
<nav><a href="/work" aria-current="page">Работы</a></nav>
</body></html>`;
const W1_INDEX_BAD = `<!doctype html>
<html><body>
<nav><a href="/" aria-current="page">Главная</a><a href="/work" aria-current="page">Работы</a></nav>
</body></html>`;
const W1_WORK_BAD_HREF = `<!doctype html>
<html><body>
<nav><a href="/lab" aria-current="page">Работы</a></nav>
</body></html>`;
const SCRIPT_INDEX_BAD = `<!doctype html>
<html><body>
<script>window.__x = 1;</script>
<nav><a href="/" aria-current="page">Главная</a></nav>
</body></html>`;
// Фикстуры правил 7/9 фазы 3 (Pitfall 1/2): страница кейса с 0 aria-current,
// первый клиентский JS — только на /contact (D-10).
const W1_CASE_GOOD = `<!doctype html>
<html><body>
<nav><a href="/work">Работы</a></nav>
</body></html>`;
const W1_CASE_BAD = `<!doctype html>
<html><body>
<nav><a href="/work" aria-current="page">Работы</a></nav>
</body></html>`;
const SCRIPT_CONTACT_GOOD = `<!doctype html>
<html><body>
<script>/* копирование email */</script>
<nav><a href="/contact" aria-current="page">Контакты</a></nav>
</body></html>`;
const SCRIPT_WORK_BAD = `<!doctype html>
<html><body>
<script>window.__x = 1;</script>
<nav><a href="/work" aria-current="page">Работы</a></nav>
</body></html>`;
const SCRIPT_TOTAL_BAD = `<!doctype html>
<html><body>
<script>window.__x = 1;</script>
<nav><a href="/" aria-current="page">Главная</a></nav>
</body></html>`;

function writeFixture(root, relPath, content) {
  const abs = join(root, relPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
}

/**
 * Self-test: логика аудита классифицирует фикстуры верно.
 * (a) good — 6 групп + новые токены + var()-переход + media 768px + все 8 импортов → 0 нарушений;
 *     dist отсутствует → W1/script-проверки пропущены с предупреждением, не fail.
 * (b) bad-bp — нет bp-группы; (c) bad-media — 767px + max-width;
 * (d) bad-transition — литерал 150ms ease; (e) bad-dist / good-dist — W1;
 * (f) bad-usage — нет импорта Footer; (g) bad-script — <script> вне /contact;
 * (h) bad-attr / (i) ok-attr — голый {expr} в кавычках атрибута vs шаблонный литерал;
 * (j) w1-case — кейс без aria-current → чисто (Pitfall 1); (k) w1-case-bad — кейс с aria-current → FAIL;
 * (l) script-contact — 1 скрипт на /contact → чисто (D-10); (m) script-work — скрипт на work → FAIL;
 * (n) script-total — два скрипта (contact + index) → FAIL по сумме.
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
    // (a) good: без dist — только предупреждение, 0 нарушений
    const goodRoot = join(tmp, 'good');
    writeFixture(goodRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(goodRoot, 'src/components/Card.astro', GOOD_COMPONENT);
    writeFixture(goodRoot, 'src/pages/index.astro', GOOD_PAGE);
    const good = audit(goodRoot);
    assert(good.length === 0, `good: нет нарушений (получено: ${JSON.stringify(good)})`);

    // (a2) good-dist: W1 с верными href → 0 нарушений
    const goodDistRoot = join(tmp, 'good-dist');
    writeFixture(goodDistRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(goodDistRoot, 'src/components/Card.astro', GOOD_COMPONENT);
    writeFixture(goodDistRoot, 'src/pages/index.astro', GOOD_PAGE);
    writeFixture(goodDistRoot, 'dist/index.html', W1_INDEX_GOOD);
    writeFixture(goodDistRoot, 'dist/work/index.html', W1_WORK_GOOD);
    writeFixture(goodDistRoot, 'dist/contact/index.html', SCRIPT_CONTACT_GOOD); // единственный скрипт (D-10)
    const goodDist = audit(goodDistRoot);
    assert(
      goodDist.length === 0,
      `good-dist: ровно один aria-current с верным href → чисто (получено: ${JSON.stringify(goodDist)})`
    );

    // (b) bad-bp: bp-группа отсутствует
    const badBpRoot = join(tmp, 'bad-bp');
    writeFixture(badBpRoot, 'src/styles/tokens.css', GOOD_TOKENS.replaceAll('--bp-', '--unused-'));
    writeFixture(badBpRoot, 'src/components/Card.astro', GOOD_COMPONENT);
    const badBp = audit(badBpRoot);
    assert(hasViolation(badBp, 'bp (--bp-*)'), 'bad-bp: отсутствие bp-группы детектируется');

    // (c) bad-media: 767px не равен bp-значениям; max-width запрещён
    const badMediaRoot = join(tmp, 'bad-media');
    writeFixture(badMediaRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(
      badMediaRoot,
      'src/components/Card.astro',
      GOOD_COMPONENT.replace('min-width: 768px', 'min-width: 767px') +
        '\n  @media (max-width: 768px) { .card { margin-block: var(--space-1); } }'
    );
    const badMedia = audit(badMediaRoot);
    assert(
      hasViolation(badMedia, 'медиазапрос 767px') && hasViolation(badMedia, 'max-width'),
      'bad-media: 767px и max-width детектируются'
    );

    // (d) bad-transition: литерал 150ms ease; var()-переход чист (покрыт good)
    const badTransRoot = join(tmp, 'bad-transition');
    writeFixture(badTransRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(
      badTransRoot,
      'src/components/Card.astro',
      GOOD_COMPONENT.replace('transition: color var(--motion-fast) var(--ease-standard);', 'transition: color 150ms ease;')
    );
    const badTrans = audit(badTransRoot);
    assert(
      hasViolation(badTrans, '150ms') && hasViolation(badTrans, 'ease'),
      'bad-transition: литералы 150ms/ease в transition детектируются'
    );

    // (e) bad-dist: 2 aria-current на index, неверный href на work;
    //     contact с единственным скриптом — правило 9 (D-10) не вмешивается в W1-проверку
    const badDistRoot = join(tmp, 'bad-dist');
    writeFixture(badDistRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(badDistRoot, 'src/components/Card.astro', GOOD_COMPONENT);
    writeFixture(badDistRoot, 'src/pages/index.astro', GOOD_PAGE);
    writeFixture(badDistRoot, 'dist/index.html', W1_INDEX_BAD);
    writeFixture(badDistRoot, 'dist/work/index.html', W1_WORK_BAD_HREF);
    writeFixture(badDistRoot, 'dist/contact/index.html', SCRIPT_CONTACT_GOOD);
    const badDist = audit(badDistRoot);
    assert(
      hasViolation(badDist, 'W1: dist/index.html') &&
        hasViolation(badDist, 'найдено 2') &&
        hasViolation(badDist, 'href="/lab"') &&
        !badDist.some((v) => v.includes('<script>')),
      'bad-dist: 2 aria-current и неверный href детектируются, скрипт на /contact не нарушение'
    );

    // (f) bad-usage: страница без импорта Footer
    const badUsageRoot = join(tmp, 'bad-usage');
    writeFixture(badUsageRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(badUsageRoot, 'src/components/Card.astro', GOOD_COMPONENT);
    writeFixture(
      badUsageRoot,
      'src/pages/index.astro',
      GOOD_PAGE.replace("import Footer from '../components/Footer.astro';\n", '')
    );
    const badUsage = audit(badUsageRoot);
    assert(hasViolation(badUsage, 'Footer'), 'bad-usage: неиспользуемый компонент Footer детектируется');

    // (g) bad-script: <script> на странице вне /contact → нарушение (правило 9, D-10)
    const badScriptRoot = join(tmp, 'bad-script');
    writeFixture(badScriptRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(badScriptRoot, 'src/components/Card.astro', GOOD_COMPONENT);
    writeFixture(badScriptRoot, 'src/pages/index.astro', GOOD_PAGE);
    writeFixture(badScriptRoot, 'dist/index.html', SCRIPT_INDEX_BAD);
    const badScript = audit(badScriptRoot);
    assert(
      hasViolation(badScript, 'тег <script>') && hasViolation(badScript, 'разрешён только на /contact'),
      'bad-script: <script> вне /contact детектируется (правило 9, D-10)'
    );

    // (h) bad-attr: голый {expr} в кавычках атрибута — Astro 7.x рендерит буквально (02-06)
    const badAttrRoot = join(tmp, 'bad-attr');
    writeFixture(badAttrRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(
      badAttrRoot,
      'src/components/Card.astro',
      GOOD_COMPONENT.replace('<div class="card">{title}</div>', '<a class="card card--{mod}">{title}</a>')
    );
    const badAttr = audit(badAttrRoot);
    assert(
      hasViolation(badAttr, 'в кавычках атрибута') && hasViolation(badAttr, 'card--{mod}'),
      'bad-attr: голый {expr} в кавычках атрибута детектируется'
    );

    // (i) ok-attr: шаблонный литерал, текстовая интерполяция и frontmatter-{…} → чисто
    const okAttrRoot = join(tmp, 'ok-attr');
    writeFixture(okAttrRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(
      okAttrRoot,
      'src/components/Card.astro',
      GOOD_COMPONENT.replace(
        'const title = "Компонент";',
        'const title = "Компонент";\nconst note = "{n} шт.";'
      ).replace('<div class="card">{title}</div>', '<a class={`card card--${mod}`}>{title} {note}</a>')
    );
    const okAttr = audit(okAttrRoot);
    assert(
      okAttr.length === 0,
      `ok-attr: шаблонный литерал, текстовая интерполяция и frontmatter-{…} не нарушение (получено: ${JSON.stringify(okAttr)})`
    );

    // (j) w1-case: страница кейса work/{slug}/index.html без aria-current → чисто (Pitfall 1)
    const w1CaseRoot = join(tmp, 'w1-case');
    writeFixture(w1CaseRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(w1CaseRoot, 'src/components/Card.astro', GOOD_COMPONENT);
    writeFixture(w1CaseRoot, 'src/pages/index.astro', GOOD_PAGE);
    writeFixture(w1CaseRoot, 'dist/work/zz/index.html', W1_CASE_GOOD);
    writeFixture(w1CaseRoot, 'dist/contact/index.html', SCRIPT_CONTACT_GOOD); // единственный скрипт (D-10)
    const w1Case = audit(w1CaseRoot);
    assert(
      w1Case.length === 0,
      `w1-case: кейс без aria-current → чисто (получено: ${JSON.stringify(w1Case)})`
    );

    // (k) w1-case-bad: страница кейса С aria-current → нарушение
    const w1CaseBadRoot = join(tmp, 'w1-case-bad');
    writeFixture(w1CaseBadRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(w1CaseBadRoot, 'src/components/Card.astro', GOOD_COMPONENT);
    writeFixture(w1CaseBadRoot, 'src/pages/index.astro', GOOD_PAGE);
    writeFixture(w1CaseBadRoot, 'dist/work/zz/index.html', W1_CASE_BAD);
    const w1CaseBad = audit(w1CaseBadRoot);
    assert(
      hasViolation(w1CaseBad, 'страница кейса не может иметь aria-current'),
      'w1-case-bad: aria-current на странице кейса детектируется (R2)'
    );

    // (l) script-contact: ровно 1 скрипт на /contact → чисто (D-10, первый клиентский JS)
    const scriptContactRoot = join(tmp, 'script-contact');
    writeFixture(scriptContactRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(scriptContactRoot, 'src/components/Card.astro', GOOD_COMPONENT);
    writeFixture(scriptContactRoot, 'src/pages/index.astro', GOOD_PAGE);
    writeFixture(scriptContactRoot, 'dist/contact/index.html', SCRIPT_CONTACT_GOOD);
    const scriptContact = audit(scriptContactRoot);
    assert(
      scriptContact.length === 0,
      `script-contact: скрипт на /contact → чисто (получено: ${JSON.stringify(scriptContact)})`
    );

    // (m) script-work: скрипт на work/index.html → нарушение (JS разрешён только на /contact)
    const scriptWorkRoot = join(tmp, 'script-work');
    writeFixture(scriptWorkRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(scriptWorkRoot, 'src/components/Card.astro', GOOD_COMPONENT);
    writeFixture(scriptWorkRoot, 'src/pages/index.astro', GOOD_PAGE);
    writeFixture(scriptWorkRoot, 'dist/work/index.html', SCRIPT_WORK_BAD);
    const scriptWork = audit(scriptWorkRoot);
    assert(
      hasViolation(scriptWork, 'разрешён только на /contact'),
      'script-work: скрипт на work/index.html детектируется'
    );

    // (n) script-total: два скрипта (contact + index) → нарушение по сумме (ожидалось 1)
    const scriptTotalRoot = join(tmp, 'script-total');
    writeFixture(scriptTotalRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(scriptTotalRoot, 'src/components/Card.astro', GOOD_COMPONENT);
    writeFixture(scriptTotalRoot, 'src/pages/index.astro', GOOD_PAGE);
    writeFixture(scriptTotalRoot, 'dist/contact/index.html', SCRIPT_CONTACT_GOOD);
    writeFixture(scriptTotalRoot, 'dist/index.html', SCRIPT_TOTAL_BAD);
    const scriptTotal = audit(scriptTotalRoot);
    assert(
      hasViolation(scriptTotal, 'всего тегов <script>: 2, ожидалось 1'),
      'script-total: сумма тегов ≠ 1 детектируется'
    );

    // Старые правила не сломаны
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
    assert(hasViolation(badGroup, 'motion (--motion-*)'), 'bad-group: отсутствие группы токенов детектируется');

    // 1-2px не нарушение (outline/focus вне шкалы)
    const okPxRoot = join(tmp, 'ok-px');
    writeFixture(okPxRoot, 'src/styles/tokens.css', GOOD_TOKENS);
    writeFixture(okPxRoot, 'src/components/Card.astro', GOOD_COMPONENT + '\n  .y { border-width: 2px; }');
    const okPx = audit(okPxRoot);
    assert(okPx.length === 0, `ok-px: 2px вне шкалы не нарушение (получено: ${JSON.stringify(okPx)})`);
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
