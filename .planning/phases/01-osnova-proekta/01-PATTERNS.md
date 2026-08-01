# Phase 1: Основа проекта — Pattern Map

**Mapped:** 2026-08-01
**Files analyzed:** 32 (новых файлов/артефактов фазы)
**Analogs found:** 0 / 32 — GREENFIELD: репозиторий не содержит кода (только `docs/`, `.planning/`, `.docx`). Аналогов в кодовой базе нет и не может быть; каждый файл задаёт паттерн для фаз 2–6.

## File Classification

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `package.json` | config | build-time (scripts) | none — greenfield; reference: официальный гайд install-and-setup (Astro 7) | — |
| `package-lock.json` | config (generated) | build-time | none — генерируется `npm install`; коммитится (Pitfall 10) | — |
| `astro.config.mjs` | config | build-time | none; reference: `defineConfig` + интеграции (docs.astro.build/en/install-and-setup) | — |
| `tsconfig.json` | config | build-time | none; reference: `astro/tsconfigs/strict` (docs.astro.build/en/guides/typescript) | — |
| `eslint.config.mjs` | config | build-time (lint) | none; reference: eslint-plugin-astro flat config (README ota-meshi) | — |
| `.prettierrc` | config | build-time (format) | none; reference: prettier + prettier-plugin-astro (D-10) | — |
| `.gitignore` | config | — | none; reference: стандартный gitignore Astro (dist/, node_modules/, .astro/) | — |
| `.github/workflows/ci.yml` | CI | event-driven (push) | none; reference: официальный паттерн `astro check && astro build` (D-11, R6) | — |
| `public/fonts/*.woff2` | asset | static file-I/O | none; reference: классический `@font-face` (D-03, docs fonts guide) | — |
| `public/robots.txt` | asset | static file-I/O | none; reference: Allow: all + `Sitemap: /sitemap-index.xml` (Pitfall 3) | — |
| `src/content.config.ts` | data (schema) | build-time validation | none; reference: content layer API (docs content-collections guide) | — |
| `src/styles/tokens.css` | style | build-time (CSS vars) | none; reference: UI-SPEC имена токенов + ADR §5.5 (SPEC R2) | — |
| `src/styles/global.css` | style | build-time (CSS) | none; reference: @font-face + reset + focus-visible (UI-SPEC) | — |
| `src/layouts/BaseLayout.astro` | layout | static-render | none; reference: layout-композиция + парсинг-модель Stacki (D-04, README flowtricks/stacki) | — |
| `src/components/Seo.astro` | component | static-render (head) | none; reference: UI-SPEC контракт props + стандарт OG-тегов (R4) | — |
| `src/pages/index.astro` | page | static-render | none; reference: Stacki-совместимая композиция (D-04) | — |
| `src/pages/work.astro` | page | static-render | none; reference: паттерн страницы-заглушки (RESEARCH.md Pattern 2) | — |
| `src/pages/lab.astro` | page | static-render | none; reference: тот же паттерн | — |
| `src/pages/about.astro` | page | static-render | none; reference: тот же паттерн | — |
| `src/pages/contact.astro` | page | static-render | none; reference: тот же паттерн | — |
| `src/pages/_spike-vt.astro` | page (temporary) | static-render | none; reference: ClientRouter из `astro:transitions` (RESEARCH.md Code Example) | — |
| `src/content/projects/` | data (content) | build-time validation | none; reference: glob-коллекция MDX (D-05, D-06) | — |
| `src/content/notes/` | data (content) | build-time validation | none; reference: пустая glob-коллекция (D-07 edge) | — |
| `src/data/services.json` | data (JSON) | build-time validation | none; reference: file()-loader, уникальный id (D-02) | — |
| `src/data/skills.json` | data (JSON) | build-time validation | none; reference: тот же паттерн | — |
| `src/data/tools.json` | data (JSON) | build-time validation | none; reference: тот же паттерн | — |
| `scripts/verify-preview.mjs` | script (test) | CLI check | none; reference: `astro preview` + curl HTTP 200 (R1) | — |
| `scripts/check-tokens.mjs` | script (test) | CLI check | none; reference: grep-аудит токенов (R2) | — |
| `scripts/check-collections.mjs` | script (test) | CLI check | none; reference: негативные фикстуры DuplicateContentEntrySlugError (R3, Pitfall 8) | — |
| `scripts/check-seo.mjs` | script (test) | CLI check | none; reference: парсинг dist/*.html + sitemap-index.xml (R4, Pitfall 3) | — |
| `scripts/check-spike-doc.mjs` | script (test) | CLI check | none; reference: проверка docs/stacki-coverage.md (R5) | — |
| `docs/stacki-coverage.md` | doc (artifact) | — | none; reference: D-14 — 8 конструкций + 2 edge, вердикты «проверено/ограничение» | — |

## Pattern Assignments

> Все образцы ниже — из RESEARCH.md (раздел Code Examples, строки указаны) и официальных docs.astro.build (Astro 7, проверено 2026-08-01). Версии и peer-зависимости — по npm-реестру: **astro 7.1.6 ↔ @astrojs/mdx@^7; fallback astro ^5.18.2 ↔ mdx@^4** (checkpoint пользователя перед install, Open Question 1).

### `package.json` (config, build-time)

**Analog:** none — greenfield. **Reference:** RESEARCH.md lines 385-395 (официальный install-and-setup) + D-11/D-12.

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "lint": "eslint .",
    "check": "astro check",
    "verify": "npm run build && npm run check-seo && npm run check-tokens && npm run check-collections"
  },
  "engines": { "node": ">=22.22.3" }
}
```

Ключевые требования: `engines.node: ">=22.22.3"` перекрывает astro 7 (>=22.12) и eslint-plugin-astro (^22.22.3) — RESEARCH.md Pitfall 9 / Open Question 6. devDependencies: `typescript@^6.0.3` (НЕ 7 — @astrojs/check peer `^5 || ^6`), `@astrojs/check@^0.9`, `eslint@^10`, `eslint-plugin-astro@^3`, `@typescript-eslint/parser`, `prettier`, `prettier-plugin-astro` (RESEARCH.md Standard Stack lines 83-94). НЕ добавлять: Tailwind/utility-first (Prohibition P1), деплой-адаптер (D-12).

### `astro.config.mjs` (config, build-time)

**Reference:** RESEARCH.md lines 396-405 + Pitfall 4 (site обязателен для sitemap и canonical).

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://example.com', // ЧЕРНОВОЙ URL до деплоя (фаза 6) — Open Question 4
  integrations: [mdx(), sitemap()],
});
```

Паттерн: `site` задаётся сразу (иначе sitemap не генерируется, canonical пустые); `viewTransitions: true` в конфиге НЕ используется — устарел (State of the Art lines 506, 514). Если пользователь подтвердит astro 7 — Rust-компилятор строг к незакрытым тегам (line 508).

### `tsconfig.json` (config, build-time)

**Reference:** RESEARCH.md lines 406-416.

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Паттерн: официальный пресет `strict` (не свой tsconfig с нуля — RESEARCH.md Don't Hand-Roll), `include` покрывает генерируемый `.astro/types.d.ts` (Pitfall 6 — в свежем клоне типы генерируются первым sync/check).

### `eslint.config.mjs` (config, build-time lint)

**Reference:** RESEARCH.md lines 472-485 (README eslint-plugin-astro).

```js
import eslintPluginAstro from 'eslint-plugin-astro';
import tsParser from '@typescript-eslint/parser';
export default [
  {
    files: ['**/*.astro'],
    languageOptions: { parser: tsParser, parserOptions: { extraFileExtensions: ['.astro'] } },
  },
  ...eslintPluginAstro.configs.recommended,
  { ignores: ['dist/', 'node_modules/', '.astro/'] },
];
```

Паттерн: flat config + `configs.recommended`; TS-парсер обязателен для frontmatter (Standard Stack line 99); eslint-plugin-jsx-a11y — peer, в фазе 1 агрессивно не включать (line 100).

### `.github/workflows/ci.yml` (CI, event-driven)

**Reference:** RESEARCH.md lines 454-470 (D-11, R6).

```yaml
name: CI
on: [push, pull_request]
jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint        # eslint — ДО check/build (требование R6)
      - run: npm run check       # astro check
      - run: npm run build       # astro build
```

Паттерн: один workflow, порядок lint → check → build зафиксирован (SPEC R6 edge ordering); `cache: npm` + `npm ci` требуют закоммиченный package-lock.json (Pitfall 10); node-version: 22 ставит последний 22.x (>=22.22.3 — ок, Pitfall 9).

### `src/content.config.ts` (data/schema, build-time validation)

**Reference:** RESEARCH.md lines 232-258 (docs content-collections) — **это ключевой паттерн фазы, задаёт стандарт для фаз 2–3.**

```ts
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    slug: z.string(), title: z.string(), summary: z.string(),
    role: z.string(), stack: z.array(z.string()),
    year: z.number().int(), status: z.enum(['active', 'archived']),
    'client-type': z.string(), order: z.number().int().default(0),
    // Задел на EN (D-08): поля locale необязательны
    titleEn: z.string().optional(),
  }),
});
const notes = defineCollection({  // 0 записей — edge «пустые коллекции» (D-07)
  loader: glob({ base: './src/content/notes', pattern: '**/*.md' }),
  schema: z.object({ title: z.string(), date: z.coerce.date(), summary: z.string().optional() }),
});
const services = defineCollection({  // JSON из src/data (D-02), file() требует уникальный id
  loader: file('./src/data/services.json'),
  schema: z.object({ id: z.string(), title: z.string(), description: z.string() }),
});
export const collections = { projects, notes, services };
```

Паттерны: НОВЫЙ API content layer (`src/content.config.ts`, не `src/content/config.ts`); `z` из `astro/zod` (Zod 4); MDX/MD через `glob()`, JSON через `file()` (файл остаётся в `src/data/`, валидация при сборке, типы — из схемы); сортировка проектов — по явному `order` (D-09, edge «равные даты»); четыре вопроса кейса — в MDX-теле, НЕ в frontmatter (D-05); дубликат slug → `DuplicateContentEntrySlugError`, дубликат id в file() → ошибка загрузки (Pitfall 8 — желаемое поведение для негативного теста R3).

### `src/styles/tokens.css` (style, build-time)

**Reference:** RESEARCH.md lines 419-440 (UI-SPEC имена токенов + ADR §5.5, SPEC R2). **ЕДИНСТВЕННЫЙ файл токенов.**

```css
:root {
  /* color */
  --color-bg: #FAFAF7;        --color-surface: #F1F0EB;
  --color-ink: #1F1E1C;       --color-ink-muted: #5C5A55;
  --color-accent: #A84B32;    --color-accent-ink: #FFFFFF;
  --color-destructive: #B3261E;
  /* typography */
  --font-sans: 'Space Grotesk', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --text-body: 16px; --text-label: 14px; --text-heading: 20px; --text-display: 32px;
  /* spacing */
  --space-xs: 4px; --space-sm: 8px; --space-md: 16px; --space-lg: 24px;
  --space-xl: 32px; --space-2xl: 48px; --space-3xl: 64px;
  /* containers */
  --container-max: 1200px; --gutter-mobile: 24px; --gutter-desktop: 48px;
  /* motion */
  --motion-fast: 150ms; --motion-base: 250ms; --motion-slow: 400ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
}
```

Паттерн: 5 групп (color/typography/spacing/containers/motion), имена `--group-name` по UI-SPEC; запрет хардкода значений там, где токен существует (R2, проверяется `scripts/check-tokens.mjs`); scoped styles видят переменные из :root глобально (Pitfall 7).

### `src/styles/global.css` (style, build-time)

**Reference:** RESEARCH.md lines 441-452 (D-03 локальные шрифты, UI-SPEC reset/focus-visible).

```css
@font-face {
  font-family: 'Space Grotesk';
  src: url('/fonts/space-grotesk-400.woff2') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
}
/* ... 600 для Space Grotesk, 400 для JetBrains Mono ... */
:root { color-scheme: light; }
body { font-family: var(--font-sans); font-size: var(--text-body); line-height: 1.5; color: var(--color-ink); background: var(--color-bg); }
:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
```

Паттерн: шрифты локально в `public/fonts/` (WOFF2, `font-display: swap`, без CDN — D-03); потребление только через `var(--token-*)`; подключается в BaseLayout через import (глобальные стили — официальный способ, RESEARCH.md line 61).

### `src/layouts/BaseLayout.astro` (layout, static-render)

**Reference:** RESEARCH.md lines 265-273 (Pattern 2 — Stacki-совместимая композиция) + line 61 (глобальные стили).

```astro
---
import '../styles/tokens.css';
import '../styles/global.css';
import Seo from '../components/Seo.astro';
interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="ru">
  <head><Seo title={title} description={description} /></head>
  <body>
    <slot />   <!-- страницы кладут плоский список self-closing компонентов с props (D-04) -->
    <!-- nav/footer — заглушки без стилизации (фаза 2) -->
  </body>
</html>
```

Паттерн: layout-обёртка + `<slot />`; head-контракт делегируется `Seo.astro`; страницы не содержат произвольного HTML/выражений/вложенных children (D-04 — парсинг-модель Stacki «layout wrapper + flat list of self-closing component instances with props»). ClientRouter в BaseLayout НЕ включается (A7 — только в `_spike-vt.astro`).

### `src/components/Seo.astro` (component, static-render head)

**Reference:** RESEARCH.md lines 280-301 (UI-SPEC контракт + стандарт OG). Полный код — единственный источник SEO-тегов (R4):

```astro
---
interface Props {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
}
const { title, description, canonical, ogImage } = Astro.props;
const url = canonical ?? new URL(Astro.url.pathname, Astro.site!);
---
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={url} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content="website" />
<meta property="og:url" content={url} />
<meta property="og:locale" content="ru_RU" />
{ogImage && <meta property="og:image" content={new URL(ogImage, Astro.site!)} />}
```

Паттерн: типизированные props, canonical строится из `Astro.url` + `Astro.site`; замена npm-пакету astro-seo (~30 строк, полный контроль — Standard Stack lines 109-110).

### `src/pages/*.astro` (5 страниц + spike, static-render)

**Analog:** none. **Reference:** RESEARCH.md lines 265-273 (Pattern 2). Каждая страница-заглушка (work/lab/about/contact) повторяет:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Работы — Иван Шиваршинов" description="Кейсы веб-разработки.">
  <p>Раздел в разработке — кейсы появятся в фазе 3</p>
</BaseLayout>
```

Паттерн: 5 уникальных пар title/description (R4 adjacency edge), `lang="ru"`, никакого клиентского JS (UI-SPEC «Interaction NONE»). `_spike-vt.astro` — ВРЕМЕННАЯ страница с `<ClientRouter />` из `astro:transitions` (RESEARCH.md lines 487-499), удаляется после spike R5 (A7).

### `src/content/projects/`, `src/content/notes/` (content collections, build-time validation)

- `projects/` — пустая директория в фазе 1; формат — `*.mdx` (D-06: `@astrojs/mdx` устанавливается сразу); frontmatter-поля из схемы D-05, тело — 4 вопроса кейса в MDX.
- `notes/` — 0 записей намеренно: edge «пустые коллекции проходят сборку» (D-07, R3). `glob()` на пустой директории валиден, вернёт `[]` (Pitfall 6 — страницы фазы 1 не рендерят коллекции).

### `src/data/*.json` (services, skills, tools — data, build-time validation)

**Reference:** RESEARCH.md lines 253-256. Паттерн (D-02): JSON лежит в `src/data/` (не в public/ — не публикуется по прямой ссылке), валидируется `file()`-loader в content.config.ts; каждая запись обязана иметь уникальный `id` (поле `id` в zod-схеме); структура записей: `{ id, title, description, ... }` — точный набор полей на усмотрение планировщика (Claude's Discretion), но все поля — из zod-схемы.

### `scripts/*.mjs` (5 скриптов валидации, CLI check)

**Reference:** RESEARCH.md Validation Architecture lines 566-605. Паттерн: plain Node.js ESM (node --test/--eval, БЕЗ фреймворка — фаза 1 не содержит юнит-логики), npm-скрипт `verify` собирает их; все скрипты — grep/CLI-проверки артефактов сборки:

| Скрипт | Проверяет | Ключевой паттерн |
|--------|-----------|------------------|
| `verify-preview.mjs` | HTTP 200 на / /work /lab /about /contact (R1) | `astro preview` + fetch/curl по 5 маршрутам |
| `check-tokens.mjs` | 1 файл токенов, 5 групп, нет хардкода (R2) | grep-аудит src/styles + src/components на hex-значения при существующем токене |
| `check-collections.mjs` | негативные фикстуры (R3) | временная фикстура дубликата slug/id и записи без обязательного поля → build fail → restore (Pitfall 8); фикстуры НЕ остаются в репозитории |
| `check-seo.mjs` | 5 уникальных пар title/description, canonical+OG, sitemap (R4) | парсинг `dist/*.html` (Set по паре), regex `rel="canonical"` / `property="og:*"`; sitemap проверять по **`dist/sitemap-index.xml`** (НЕ sitemap.xml — Pitfall 3), 5 url |
| `check-spike-doc.mjs` | docs/stacki-coverage.md (R5) | наличие файла, 8 конструкций + 2 edge, пометки «проверено/ограничение»; порядок коммитов — git log |

### `docs/stacki-coverage.md` (doc/artifact, spike R5)

**Reference:** D-14 (CONTEXT lines 61-62). Структура: 8 конструкций (компоненты, props, variants, scoped styles, CSS-переменные, JSON-коллекции, frontmatter, View Transitions) + 2 краевых случая (scoped styles + переменная одновременно; коллекция с 0 записей), каждая с вердиктом «проверено / ограничение». Файл коммитится ДО начала визуальной сборки (Prohibition P3). Установка: установщик v0.1.3 из `flowtricks/stacki-releases` (NSIS, Windows; Research Open Question 2 — канал подтверждён); если установка невозможна — fallback сборка из исходников или фиксация ограничения окружения, продолжение — по решению пользователя.

## Shared Patterns

### 1. Stacki-совместимая композиция страниц (D-04)
**Source:** README `flowtricks/stacki` (парсинг-модель) + ADR §5 (RESEARCH.md Pattern 2, lines 260-273)
**Apply to:** BaseLayout, все 5 страниц, Seo.astro
Страница = layout-обёртка + плоский список self-closing компонентов с props. Без произвольного HTML/выражений/вложенных children на уровне страницы — они уходят в компоненты (код-режим Stacki — fallback, ничего не перезаписывается). Анти-паттерн: глубокий вложенный HTML прямо в страницах.

### 2. Content layer как единственный источник типов и валидации (R3)
**Source:** RESEARCH.md Pattern 1 (lines 227-258) + Don't Hand-Roll (lines 311-323)
**Apply to:** content.config.ts, все JSON-данные, коллекции
Схема zod — единственный источник типов (`.astro/types.d.ts` генерируется); дубликаты и отсутствие полей — ошибка сборки (это желаемое поведение R3); пустые коллекции валидны. НЕ писать собственные валидаторы JSON.

### 3. SEO-контракт через layout-композицию (R4)
**Source:** RESEARCH.md Pattern 3 (lines 275-301)
**Apply to:** BaseLayout, Seo.astro, все 5 страниц
Каждая страница передаёт свои title/description в BaseLayout → Seo.astro рендерит head (title, description, canonical, OG). Уникальные пары — обязанность страниц; sitemap — `@astrojs/sitemap` (не руками).

### 4. Токен-дисциплина (R2)
**Source:** RESEARCH.md tokens.css lines 419-440 + Pitfall 7
**Apply to:** tokens.css, global.css, все будущие компоненты (фаза 2+)
Один файл токенов, 5 групп, имена `--group-name`; запрет хардкода значений при существующем токене (grep-проверка); scoped styles используют `var(--token)` — переменные глобальны.

### 5. Версионная дисциплина (Pitfalls 1, 2, 9, 10)
**Source:** RESEARCH.md Pitfalls 1-2, 9-10 (lines 327-378)
**Apply to:** package.json, CI, все npm install
Мажор astro ↔ мажоры интеграций (astro 7 ↔ mdx@^7; astro 5 ↔ mdx@^4); `typescript@^6` (НЕ 7 — peer @astrojs/check); `engines.node: ">=22.22.3"`; package-lock.json коммитится сразу.

### 6. Ноль клиентского JS в фазе 1
**Source:** UI-SPEC (Interaction NONE) + RESEARCH.md Anti-Patterns line 309
**Apply to:** все страницы и компоненты
Единственное исключение — `_spike-vt.astro` с `<ClientRouter />` для spike R5, удаляется после прогона. В собранном HTML не должно быть `client:*` директив.

## No Analog Found

Все 32 файла — без аналогов: репозиторий greenfield (только `docs/` + `.planning/` + docx). Полный список и канонические референсы — в таблице File Classification выше. Планировщику НЕ искать аналоги в кодовой базе; использовать RESEARCH.md Code Examples (строки указаны в каждой секции) как первоисточник паттернов.

## Metadata

**Analog search scope:** корень репозитория (рекурсивно), включая docs/ и .planning/ — подтверждено Glob `**/*.{astro,ts,mjs,js,css,json,yaml,yml}` и ls: исходного кода нет
**Files scanned:** 0 исходных (только .planning/intel JSON-классификации и manifest.yaml — не относятся к приложению)
**Pattern extraction date:** 2026-08-01
**Canonical reference sources:** RESEARCH.md (Code Examples, Standard Stack, Architecture Patterns, Pitfalls) · docs.astro.build (install-and-setup, content-collections, typescript, styling, sitemap, mdx, view-transitions, fonts, upgrade-to/v7) · README flowtricks/stacki · npm registry (2026-08-01)

**Checkpoints для планировщика (из Research Open Questions):**
1. Мажор astro: 7.1.6 (рекомендация) vs ^5.18.2 (буква SPEC) — checkpoint ДО npm install; AC R6 «astro ^5» скорректировать по решению
2. Установка Stacki (канал подтверждён: v0.1.3 в stacki-releases) — шаг 1 spike; установщик NSIS, fallback — сборка из исходников или фиксация ограничения
3. AC R4: проверять `sitemap-index.xml`, не `sitemap.xml` (техническое уточнение)
4. Черновой `site` URL до фазы 6
5. Имя/видимость GitHub-репозитория — решение пользователя при настройке remote
