# Phase 1: Основа проекта - Research

**Researched:** 2026-08-01
**Domain:** Astro static-site foundation (scaffold, design tokens, content collections, SEO, spike Stacki, CI)
**Confidence:** HIGH

> **CORRECTION (2026-08-01, после повторной проверки первоисточников):** первоначальная версия исследования утверждала «0 релизов Stacki на GitHub, установочный канал не подтверждён». Это неверно: канал распространения — отдельный репозиторий **`flowtricks/stacki-releases`** (README главного репозитория: «Pushing a v* tag triggers CI, which uploads them to the stacki-releases repo»). **v0.1.3 существует** (тег «Latest», опубликован 2026-07-30, 10 ассетов, подпись GPG). Установка: скачать установщик (Windows — NSIS) из stacki-releases; сборка из исходников — только fallback. Утверждение ADR «Stacki v0.1.3» подтверждено в части существования релиза; функциональные заявления (визуальная работа с JSON-коллекциями и стилями) README не описывает — остаются эмпирической проверкой spike R5. Все затронутые секции ниже исправлены.

## Summary

Фаза превращает пустой репозиторий (docs/ + .planning/ только) в работающий Astro-проект. Все ключевые API подтверждены по официальной документации Astro (docs.astro.build) и npm-реестру: content layer (`src/content.config.ts` + `defineCollection` + loaders `glob`/`file`, zod через `astro/zod` — Zod 4), TypeScript strict через `astro/tsconfigs/strict` + `astro check` (@astrojs/check), scoped CSS + глобальные стили, `@astrojs/sitemap`, `@astrojs/mdx`, View Transitions через `<ClientRouter />`. Специфических «тёмных углов» для запланированного объёма нет — все конструкции SPEC R1–R6 имеют подтверждённый стандартный путь.

**Два критических расхождения с locked-решениями (требуют подтверждения пользователя до установки):**
1. **Версия Astro.** SPEC зафиксировал «latest stable (5.x)», но на 2026-07-29 npm `latest` = **7.1.6** (линия 5.x закончилась на 5.18.2). Официальные docs подтверждают «Astro v7 is here!». Интеграции жёстко привязаны к мажору: `@astrojs/mdx@^7` peer-требует `astro ^7`, для astro 5 нужен `@astrojs/mdx@^4`. Рекомендация: подтвердить **Astro 7.1.6** (соответствует смыслу «latest stable»), fallback — 5.18.2 с mdx@^4, если пользователь настаивает на букве SPEC. Планировщик обязан поставить checkpoint на подтверждение версии.
2. **Stacki — установочный канал (исправлено).** Репозиторий `flowtricks/stacki` реальный (MIT, Electron, «Visual Builder for Astro», парсинг-модель «layout wrapper + flat list of self-closing components with props», code fallback, «ничего не перезаписывается деструктивно»). У главного репозитория релизов нет — но это нормально: README подтверждает, что push тега `v*` через CI загружает артефакты в отдельный дистрибутивный репозиторий **`flowtricks/stacki-releases`**, откуда идёт автообновление через electron-updater. В нём существует **v0.1.3** («Latest», 2026-07-30, 10 ассетов, GPG-подпись) — утверждение ADR «Stacki v0.1.3» подтверждено. README не упоминает variants/scoped styles/CSS variables/JSON/frontmatter/View Transitions — эти 6 из 8 конструкций остаются эмпирической проверкой. Spike R5 обязателен: первые шаги — установить v0.1.3 из stacki-releases (Windows: NSIS), fallback — сборка из исходников по README.

**Stacki-принцип (D-04) подтверждён первоисточником:** README `flowtricks/stacki` дословно описывает парсинг-модель «optional layout wrapper + a flat list of self-closing component instances with props» и code fallback для произвольного HTML/выражений/вложенных children. Это валидирует целевую композицию страниц: `BaseLayout` + плоские компоненты с типизированными props.

**Primary recommendation:** скаффолдить вручную по официальному гайду (create-astro в непустой каталог с docs/ спровоцирует промпты; ручная установка — документированный стандарт), `astro/tsconfigs/strict`, JSON-данные валидировать через content collections (loader `file()`), SEO — один `Seo.astro` (props: title/description/canonical/ogImage) внутри `BaseLayout`, CI — один workflow lint → `astro check` → build (Node 22.22+, TS ^6, НЕ 7).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Структура проекта
- **D-01:** Стандартная плоская структура `src/`: pages, layouts, components, styles, content, data — стандарт Astro, максимально очевиден и для кодового режима, и для чтения инструментами.
- **D-02:** JSON-данные (services, skills, tools) хранятся в `src/data/*.json` — типизируются вместе с кодом, не публикуются по прямой ссылке.
- **D-03:** Шрифты (grotesk + mono из дизайн-спека) подключаются локально: WOFF2 в `public/fonts`, `font-display: swap` — лучший LCP, без внешних CDN-зависимостей, работает офлайн.
- **D-04:** **Принцип Stacki** (формулировка пользователя, подтверждена README `flowtricks/stacki`): Astro и его исходники — источник истины; Stacki — необязательный визуальный слой поверх проекта. Архитектурные решения НЕ принимаются в ущерб Astro ради ограничений Stacki. Но при равнозначных вариантах сохраняется совместимая с его визуальным режимом композиция страниц: layout + плоский список компонентов с props (парсинг-модель Stacki: «optional layout wrapper + flat list of self-closing component instances with props»). Более сложные страницы (произвольный HTML, выражения, вложенные children) редактируются через встроенный кодовый режим Stacki — ничего не перезаписывается деструктивно. — **Reversibility:** costly — принцип влияет на композицию страниц всех последующих фаз; пересмотр потребует перепроверки компонентной архитектуры.

#### Схемы коллекций
- **D-05:** Схема `projects` полная под кейсы уже в фазе 1: метаданные в frontmatter (slug, title, summary, role, stack, year, status, client-type, order), четыре вопроса кейса (проблема → ответственность → решение → результат) — разделы в MDX-теле, а не поля frontmatter.
- **D-06:** MDX-расширение (`@astrojs/mdx`) устанавливается сразу; тело кейса — MDX. — **Reversibility:** reversible — расширение можно удалить до появления контента.
- **D-07:** Коллекция `notes` существует со схемой, контент пуст — валидирует edge «пустые коллекции проходят сборку».
- **D-08:** Контент на русском; структура схем закладывает задел на EN-версии (поля локали предусмотрены, но не обязательны) — полный i18n не входит в проект.
- **D-09:** Сортировка проектов в индексе — по явному полю `order` (детерминированный порядок; закрывает edge «равные даты»).

#### Инструменты и CI
- **D-10:** Линтер/форматтер: ESLint + eslint-plugin-astro + prettier — зрелая экосистема, стандарт для Astro.
- **D-11:** Один CI-workflow (GitHub Actions): checkout → setup-node (Node 22) → npm ci (с кэшем) → lint → `astro check` → build. Линт выполняется до build (требование SPEC R6). — **Reversibility:** reversible — workflow легко расширить в фазе 6.
- **D-12:** Деплой-адаптер в фазе 1 не закладывается; деплой — фаза 6.

#### Spike Stacki
- **D-13:** Гибридный прогон: агент готовит чек-лист конструкций для проверки (по README `flowtricks/stacki`), пользователь запускает Stacki (desktop-приложение) на скаффолде и проходит сценарий, агент фиксирует результаты в документ покрытия.
- **D-14:** Результат spike — один документ `docs/stacki-coverage.md`: 8 конструкций (компоненты, props, variants, scoped styles, CSS-переменные, JSON-коллекции, frontmatter, View Transitions) + 2 краевых случая (scoped styles + переменная одновременно; коллекция с 0 записей), каждая с пометкой «проверено / ограничение».

### Claude's Discretion
Точные имена CSS-переменных, структура zod-схем (набор обязательных/необязательных полей), конфиги ESLint/Prettier, имена маршрутов заглушек — на усмотрение исследователя и планировщика в рамках решений выше и требований SPEC.

### Deferred Ideas (OUT OF SCOPE)
- Полный i18n (двуязычный сайт с отдельными маршрутами) — сознательно не входит; только задел в схемах.
- Блог/публичная контент-модель — не учитывается по решению пользователя (spec-phase).
- GitHub Pages/Vercel адаптер — фаза 6.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description (SPEC) | Research Support |
|----|--------------------|------------------|
| R1 | Astro-скаффолд и сборка: 5 страниц (/, /work, /lab, /about, /contact) на общем base layout; `npm ci && npm run build` exit 0; preview HTTP 200 | Официальный гайд install-and-setup: ручная установка в существующий каталог, astro.config.mjs, tsconfig. Preview: `astro preview` после build. Node >= 22.12 для Astro 7 |
| R2 | Design tokens: ровно один файл tokens.css, 5 групп CSS-переменных, без хардкода | Подтверждено: scoped styles не «видят» хардкод-проверку; глобальные переменные в :root через import в layout. UI-SPEC зафиксировал имена токенов (--color-*, --space-*, --text-*, --container-*, --motion-*) |
| R3 | Content Collections (projects, notes) + JSON (services, skills, tools) валидируются zod при сборке; TS strict; `astro check` exit 0; падение при дубликате slug/id; проход при пустых коллекциях | Официально: content layer (src/content.config.ts, glob/file loaders, z из astro/zod — Zod 4). Дубликат slug → официальная ошибка DuplicateContentEntrySlugError; file() loader требует уникальный id на запись. @astrojs/check 0.9.10: peer typescript ^5 \|\| ^6 (не 7!) |
| R4 | Layouts и SEO: уникальные title/description, canonical + OG на всех страницах; sitemap при сборке | @astrojs/sitemap 3.7.3 (без peer-ограничений на astro): требует `site` в конфиге; выход — sitemap-index.xml + sitemap-0.xml (не sitemap.xml — нюанс AC). SEO-теги — стандартный head-паттерн, UI-SPEC зафиксировал контракт Seo.astro |
| R5 | Spike-документ покрытия Stacki: 8 конструкций + 2 краевых случая, закоммичен до визуальной сборки | Stacki VERIFIED: README (парсинг-модель, code fallback, MIT, Node 18+, git, gh) + дистрибутивный репозиторий stacki-releases (v0.1.3, 2026-07-30, 10 ассетов, GPG). README не упоминает 6 из 8 конструкций — они и есть эмпирическая проверка. Риск: совместимость установщика v0.1.3 с машиной пользователя; fallback — сборка из исходников |
| R6 | GitHub-remote + CI (lint → build, зелёный на первом push); engines: node >= 22, astro ^5 (СМ. РАСХОЖДЕНИЕ ПО ВЕРСИИ) | gh CLI 2.95.0 установлен и авторизован (аккаунт Ivan-Shivarshinov, scope repo+workflow). eslint-plugin-astro 3.0.1: нужен ESLint >= 10, Node ^22.22.3 \|\| ^24.16.0. npm ci требует закоммиченный package-lock.json |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Скаффолд (package.json, astro.config, tsconfig) | Repo root (конфигурация) | — | Astro-стандарт: конфиги в корне, код в src/ |
| Design tokens (CSS-переменные) | Global styles (`src/styles/tokens.css`) | Browser (consumption) | Переменные объявляются в :root один раз, потребляются в scoped styles компонентов |
| Схемы данных (projects, notes, services, skills, tools) | Content layer (`src/content.config.ts`) | Build (валидация при сборке) | Zod-схемы валидируются на этапе сборки; типы генерируются в .astro/types.d.ts |
| Layouts и SEO-head | Frontend render (`src/layouts/BaseLayout.astro` + `src/components/Seo.astro`) | Build (sitemap) | Head формируется при статическом рендере; sitemap — интеграция на этапе build |
| Spike Stacki | Tooling (desktop-приложение поверх проекта) | Git (документ покрытия) | Stacki читает файлы проекта как есть; документ — артефакт в Git |
| CI | GitHub Actions | — | Внешний сервис; workflow lint → check → build |

## Standard Stack

> ВАЖНО: версии ниже — по npm-реестру на 2026-08-01. Мажоры интеграций обязаны совпадать с мажором astro.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | **7.1.6** (latest) / 5.18.2 (fallback, зафиксирован в SPEC как ^5) | Фреймворк SSG | Официальный current stable; docs «Astro v7 is here!» |
| @astrojs/mdx | 7.0.5 (для astro 7) / 4.3.14 (для astro 5) | MDX для тел кейсов (D-06) | Peer-зависимость: `^7.0.0` ↔ `^5.0.0` — подбирать по мажору astro |
| @astrojs/sitemap | 3.7.3 | Sitemap при сборке | Официальная интеграция; peer-ограничений на astro нет |
| @astrojs/check | 0.9.10 | `astro check` (TS-проверка .astro файлов) | Официальный; peer typescript `^5.0.0 \|\| ^6.0.0` |
| typescript | **^6.0.3** (НЕ 7.0.2!) | Типизация | @astrojs/check не поддерживает TS 7 (native-компилятор) |
| eslint | ^10.8.0 | Линтинг JS/TS | eslint-plugin-astro 3 требует `eslint >= 10` |
| eslint-plugin-astro | 3.0.1 | Линтинг .astro | Стандарт экосистемы Astro (D-10); configs.recommended |
| prettier | ^3.9.6 | Форматтер | Стандарт (D-10) |
| prettier-plugin-astro | 0.14.1 | Форматирование .astro | Официальный (withastro) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @typescript-eslint/parser | >= 8.61.0 | TS-парсер для ESLint (frontmatter .astro) | Обязателен для eslint-plugin-astro при TS |
| eslint-plugin-jsx-a11y | >= 6.10.2 | A11Y-правила для .astro | Peer-зависимость eslint-plugin-astro; в фазе 1 не включать агрессивно |
| @astrojs/ts-plugin | (последняя) | Инлайновые типы в редакторе | Только если нет Astro VS Code extension |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Валидация JSON через content collections (`file()` loader) | Прямой `import` JSON + ручная zod-проверка | Collections: валидация при сборке + типы из схемы «бесплатно»; ручной путь — нестандартный, дублирует то, что делает Astro |
| @astrojs/check + typescript@^6 | typescript@^7 (native tsgo) | TS 7 вне peer-диапазона @astrojs/check — astro check сломается |
| astro 7.1.6 (current stable) | astro ^5.18.2 (буква SPEC) | 5.x — 2 мажора позади, EOL-линия; см. Open Questions |
| Локальные @font-face (D-03 locked) | Новый Fonts API (astro.config + `<Font />`, fontProviders.local) | Fonts API новее и удобнее, но D-03 фиксирует public/fonts + font-display: swap; классический @font-face остаётся документированной практикой |
| Ручной Seo.astro (UI-SPEC locked) | npm-пакет astro-seo | Компонент ~30 строк, полный контроль, нет лишней зависимости; UI-SPEC зафиксировал props-контракт |

**Installation (для astro 7, если подтвердят):**
```bash
npm init --yes
npm install astro@^7 @astrojs/mdx@^7 @astrojs/sitemap
npm install -D @astrojs/check@^0.9 typescript@^6 @astrojs/ts-plugin
npm install -D eslint@^10 eslint-plugin-astro@^3 @typescript-eslint/parser eslint-plugin-jsx-a11y
npm install -D prettier prettier-plugin-astro
```
**Installation (fallback astro 5, буква SPEC):** та же команда, но `astro@^5` и `@astrojs/mdx@^4`.

**Version verification (выполнено 2026-08-01, npm registry):**
- `npm view astro dist-tags.latest` → 7.1.6 (опубликован 2026-07-29); `npm view astro@5 version` → линия закончилась на 5.18.2
- `npm view astro@7.1.6 engines` → node `>=22.12.0`, npm `>=9.6.5`
- `npm view astro@5.18.2 engines` → node `18.20.8 || ^20.3.0 || >=22.0.0`
- `npm view @astrojs/mdx@4 version` → 4.3.14 (peer astro ^5); `@astrojs/mdx@7` → 7.0.5 (peer astro ^7)
- `npm view @astrojs/sitemap version` → 3.7.3 (peer-ограничений на astro нет)
- `npm view @astrojs/check peerDependencies` → typescript `^5.0.0 || ^6.0.0`
- `npm view eslint-plugin-astro engines` → node `^22.22.3 || ^24.16.0 || >=26.3.0`

## Package Legitimacy Audit

> Все 11 пакетов проверены: существование на npm ✓, официальные репозитории ✓, миллионные загрузки, отсутствие postinstall-скриптов. Seam пометил SUS по причине «too-new» — артефакт эвристики (дата последнего релиза = активный цикл разработки, а не новизна пакета); по совокупности сигналов все пакеты легитимны.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| astro | npm | 5+ лет (first publish 2021-03) | 4.1M/нед | github.com/withastro/astro | OK* | Approved |
| create-astro | npm | 4+ года | 41K/нед | github.com/withastro/astro | OK* | Approved |
| @astrojs/mdx | npm | 4+ года | 1.5M/нед | github.com/withastro/astro | OK* | Approved |
| @astrojs/sitemap | npm | 4+ года | 2.2M/нед | github.com/withastro/astro | OK | Approved |
| @astrojs/check | npm | 3+ года | 2.1M/нед | github.com/withastro/astro | OK* | Approved |
| typescript | npm | 13+ лет | 255M/нед | github.com/microsoft/TypeScript | OK* | Approved |
| eslint | npm | 12+ лет | 153M/нед | github.com/eslint/eslint | OK* | Approved |
| eslint-plugin-astro | npm | 3+ года | 589K/нед | github.com/ota-meshi/eslint-plugin-astro | OK* | Approved |
| prettier | npm | 9+ лет | 117M/нед | github.com/prettier/prettier | OK* | Approved |
| prettier-plugin-astro | npm | 3+ года | 744K/нед | github.com/withastro/prettier-plugin-astro | OK | Approved |

*Verdict по seam: SUS («too-new» — последний publish считан за «новизну»). Сигналы (официальный repo, миллионы загрузок, `postinstall: null` у всех) однозначно подтверждают легитимность; checkpoint:human-verify для этих пакетов не требуется. Единственный checkpoint, который нужен — подтверждение мажора astro (7 vs 5), см. Open Questions.

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none по существу (все 10 — артефакт эвристики «too-new», обоснование выше)

## Architecture Patterns

### System Architecture Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │                 src/ (источник истины)        │
                    └─────────────────────────────────────────────┘
                                    │
   ┌───────────────┬───────────────┼──────────────┬───────────────┐
   ▼               ▼               ▼              ▼               ▼
 pages/         layouts/       components/     content/        data/
 5 страниц       BaseLayout     Seo.astro      projects/*.mdx  services.json
 (flat, без     (head + nav +  (title,desc,   notes/*.md      skills.json
  вложенности)   footer)        canonical,     (пустая)        tools.json
                                ogImage)
   │               │               │              │               │
   └───────────────┴───────┬───────┴──────────────┴───────────────┘
                           ▼
              src/content.config.ts  ── zod-схемы (astro/zod)
              (glob: projects, notes; file: services, skills, tools)
                           ▼
              ┌─────────────────────────── astro.config.mjs ───────────┐
              │  defineConfig({ site, integrations: [mdx(), sitemap()] }) │
              └────────────────────────────────────────────────────────┘
                           ▼
              astro build ──┬── валидация коллекций (ошибка → fail build)
                            ├── sitemap-index.xml + sitemap-0.xml
                            ├── dist/*.html (SEO-теги из Seo.astro)
                            └── CI: lint → astro check → build
```

Поток: страница (pages/*.astro) → оборачивается в BaseLayout → BaseLayout рендерит Seo.astro в `<head>` с props страницы → при сборке zod-схемы валидируют все коллекции → sitemap-интеграция собирает маршруты → dist/ + sitemap-index.xml. Stacki (desktop) читает те же файлы src/ через astro dev, пишет обратно в файлы; Git фиксирует результат.

### Recommended Project Structure

```
/ (корень репозитория)
├── .github/workflows/ci.yml   # lint → astro check → build
├── public/
│   ├── fonts/                 # Space Grotesk 400/600, JetBrains Mono 400 (WOFF2)
│   └── robots.txt             # Allow: all + Sitemap: /sitemap-index.xml
├── src/
│   ├── components/
│   │   └── Seo.astro          # props: title, description, canonical, ogImage
│   ├── content/
│   │   ├── projects/          # *.mdx (пусто в фазе 1 — контент фаза 3)
│   │   └── notes/             # *.md (0 записей — edge «пустые коллекции»)
│   ├── data/
│   │   ├── services.json      # массив объектов с id (file()-loader)
│   │   ├── skills.json
│   │   └── tools.json
│   ├── layouts/
│   │   └── BaseLayout.astro   # head (Seo) + nav + footer, без стилизации
│   ├── pages/
│   │   ├── index.astro        # Home
│   │   ├── work.astro         # заглушка
│   │   ├── lab.astro          # заглушка
│   │   ├── about.astro        # заглушка
│   │   └── contact.astro      # заглушка
│   ├── styles/
│   │   ├── tokens.css         # ЕДИНСТВЕННЫЙ файл токенов (SPEC R2)
│   │   └── global.css         # reset, @font-face, focus-visible (акцент)
│   └── content.config.ts      # defineCollection × 5
├── astro.config.mjs
├── tsconfig.json              # extends astro/tsconfigs/strict
├── eslint.config.mjs          # flat config + eslintPluginAstro.configs.recommended
├── package.json               # engines: node >= 22; scripts: dev/build/preview/lint/check
├── package-lock.json          # ОБЯЗАТЕЛЬНО коммитить (npm ci в CI)
└── docs/
    ├── stacki-coverage.md     # артефакт spike R5 (до визуальной сборки!)
    └── (существующие ADR/PRD/design docs)
```

### Pattern 1: Content Layer — коллекции и JSON-данные

**What:** `src/content.config.ts` — единая точка определения всех коллекций; markdown/MDX через `glob()`, JSON через `file()` (файл остаётся в `src/data/`, валидация при сборке, типы — из схемы). `z` импортируется из `astro/zod` (Zod 4).
**When to use:** любой типизированный контент — именно этот паттерн закрывает SPEC R3 (валидация при сборке, падение на дубликат/отсутствие поля, проход на пустых коллекциях).

```ts
// src/content.config.ts — Source: docs.astro.build/en/guides/content-collections/
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

### Pattern 2: Stacki-совместимая композиция страницы

**What:** страница = `BaseLayout`-обёртка + плоский список self-closing компонентов с props (парсинг-модель Stacki, VERIFIED по README). Без произвольного HTML/выражений/вложенных children на уровне страницы — они уходят в компоненты (код-режим Stacki для них — fallback, ничего не перезаписывается).
**When to use:** все страницы, начиная с фазы 2 (D-04); фаза 1 закладывает структуру (BaseLayout + Seo.astro с props).

```astro
---
// pages/work.astro — Source: README flowtricks/stacki (парсинг-модель) + ADR §5
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Работы — Иван Шиваршинов" description="Кейсы веб-разработки.">
  <p>Раздел в разработке — кейсы появятся в фазе 3</p>
</BaseLayout>
```

### Pattern 3: SEO через layout-композицию

**What:** `Seo.astro` принимает props и рендерит `<head>`-теги; `BaseLayout` вызывает его со props страницы. Каждая страница передаёт свои title/description/canonical — единственный источник уникальных пар (SPEC R4).
**When to use:** каждая страница; `canonical` строится из `Astro.url` + `site` из конфига.

```astro
---
// src/components/Seo.astro — Source: UI-SPEC (контракт) + стандарт head-тегов
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

### Anti-Patterns to Avoid
- **Утилитарный CSS (Tailwind и аналоги) в фазе 1:** запрещён SPEC Prohibitions P1 и ADR (обычный CSS + переменные до проверки Stacki). Проверка — node-test по dependencies в package.json.
- **Вложенный/«глубокий» HTML прямо на страницах:** ломает визуальную модель Stacki (произвольный HTML → code fallback). Секции — компоненты с props (ADR §5).
- **Дублирование значений вместо токенов:** хардкод-цвета/отступы в стилях при существующем токене — нарушение R2; проверяется grep-скриптом.
- **Установка typescript@latest (7.x):** @astrojs/check поддерживает только ^5 || ^6 — astro check молча не проверит .astro-файлы или упадёт.
- **Ручная генерация sitemap:** готовый `@astrojs/sitemap` — не изобретать.
- **Клиентский JS в фазе 1:** UI-SPEC — «Interaction NONE, static render only»; ClientRouter и прочие скрипты — только временный spike-артефакт, удаляется после прогона.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Валидация данных и типов коллекций | Собственные валидаторы/скрипты проверки JSON | Content Collections + zod (`astro/zod`) | Официальный механизм: валидация на сборке, генерируемые типы, ошибки с именами коллекций; ручной путь дублирует систему |
| Sitemap | Генерация sitemap скриптом | `@astrojs/sitemap` | Официальная интеграция: покрывает статические маршруты и getStaticPaths; ручная генерация ломается на роутах и фильтрах |
| TS-проверка .astro | `tsc` напрямую | `astro check` + `@astrojs/check` | `tsc` игнорирует .astro-файлы полностью (официальный docs) |
| TypeScript конфигурация | Собственный tsconfig с нуля | `extends: astro/tsconfigs/strict` | Официальные пресеты base/strict/strictest учитывают особенности .astro |
| Type-типы из content layer | Ручные интерфейсы под frontmatter | Автогенерация в `.astro/types.d.ts` | Схема — единственный источник типов; типы не расходятся с валидацией |
| Скоуп CSS в компонентах | Глобальные классы/БЭМ-вручную | Встроенный scoped styles | Хэш-атрибут `data-astro-cid-*` на сборке; стили не текут (официальный docs) |
| Линтинг .astro | Кастомные парсеры | eslint-plugin-astro (flat config) | Зрелая экосистема, configs.recommended; парсит frontmatter + шаблон |

**Key insight:** Astro предоставляет «батарейки» именно для этого набора задач (контент, типы, CSS-скоуп, sitemap, чек). Всё, что перечислено, имеет официальную интеграцию — самописные замены увеличивают стоимость фазы и уводят от стандарта, который затем обязан поддерживать Stacki.

## Common Pitfalls

### Pitfall 1: Несоответствие мажоров astro и интеграций
**What goes wrong:** `npm install @astrojs/mdx` без привязки версии ставит 7.0.5, который peer-требует `astro ^7`; при astro ^5 npm ci падает на peer-deps. Обратно: mdx@^4 не совместим с astro 7.
**Why it happens:** мажорные релизы Astro 6/7 (2025–2026) обновили peer-диапазоны интеграций.
**How to avoid:** определить мажор astro ДО установки (checkpoint пользователя), затем ставить интеграции под него: astro 7 ↔ mdx@^7; astro 5 ↔ mdx@^4. sitemap@^3 без ограничений.
**Warning signs:** ошибка «peer @astrojs/mdx@"^7.0.0" from...» при npm ci.

### Pitfall 2: typescript@7 ломает astro check
**What goes wrong:** `npm install -D typescript@latest` в 2026 ставит TS 7.0.2 (native-компилятор), а @astrojs/check peer-требует `^5.0.0 || ^6.0.0` — инсталляция падает или check не работает.
**How to avoid:** явно `typescript@^6.0.3` в devDependencies.
**Warning signs:** npm ERESOLVE по peer @astrojs/check; «Could not find TypeScript» от astro check.

### Pitfall 3: sitemap.xml vs sitemap-index.xml
**What goes wrong:** AC SPEC R4 говорит «sitemap.xml генерируется», но @astrojs/sitemap 3.x выдаёт `sitemap-index.xml` + `sitemap-0.xml` (сплит по entryLimit 45000).
**Why it happens:** изменение формата вывода в v3.x.
**How to avoid:** проверки ориентировать на `sitemap-index.xml` (содержит все 5 маршрутов); в robots.txt ссылаться на `/sitemap-index.xml`; поправить формулировку AC в плане.
**Warning signs:** проверка `dist/sitemap.xml` даёт 404.

### Pitfall 4: sitemap и canonical требуют `site`
**What goes wrong:** без `site: 'https://...'` в astro.config.mjs sitemap-интеграция не генерирует ничего; canonical и og:url строятся из Astro.site.
**How to avoid:** задать site в конфиге сразу (деплой фаза 6 — URL согласовать с пользователем; до деплоя допустим черновой URL, помеченный в плане).
**Warning signs:** предупреждение «Missing "site" config» при сборке.

### Pitfall 5: create-astro в непустом репозитории
**What goes wrong:** репозиторий уже содержит docs/ и .planning/ — wizard спрашивает «Directory not empty», поведение недетерминированно для агента.
**How to avoid:** ручная установка по официальному гайду (npm init --yes → npm install astro → конфиги), это документированный путь для существующих каталогов.
**Warning signs:** неожиданные промпты/создание вложенной папки.

### Pitfall 6: «Пустая коллекция» и astro check в свежем клоне
**What goes wrong:** CI на первом push: `.astro/types.d.ts` ещё не сгенерирован, astro check может ругаться на отсутствующие типы; getCollection('notes') на пустой коллекции — это валидно (glob вернёт []), но страница, которая использует `.length` без проверки, упадёт.
**How to avoid:** в CI «astro check && astro build» (check сам выполняет sync); в фазе 1 страницы не рендерят коллекции; edge «0 записей» покрыт отдельным сборочным тестом.
**Warning signs:** ошибки типов по `astro:content` в свежем окружении до первого dev/build.

### Pitfall 7: Scoped styles + CSS-переменные (краевой случай spike)
**What goes wrong:** scoped правила не «видят» переменные из :root — нет: переменные глобальны и доступны в любом scoped style. Реальная ловушка — хардкод значений вместо var() в компонентах (нарушение R2) и предположение, что scoped стили дочерних компонентов наследуют классы родителя (не наследуют).
**How to avoid:** компонент, который использует scoped style + var(--color-*) одновременно, — обязательный пункт spike (R5 edge 1); grep-скрипт по хардкоду.
**Warning signs:** магические hex в scoped styles.

### Pitfall 8: Дубликат slug в коллекции
**What goes wrong:** два .mdx с одинаковым `slug` в frontmatter — сборка падает (официальный `DuplicateContentEntrySlugError`); для file()-loader дубликат `id` в JSON — ошибка загрузки.
**Why it happens:** slug-коллизии после нормализации (например, спецсимволы).
**How to avoid:** это ЖЕЛАЕМОЕ поведение для AC R3 («сборка падает при дубликате») — оформить как негативный тест с временной фикстурой; следить, чтобы фикстуры не остались в репозитории.
**Warning signs:** «contains multiple entries with the same slug».

### Pitfall 9: node-версии в CI и engines
**What goes wrong:** eslint-plugin-astro@3 требует node `^22.22.3 || ^24.16.0 || >=26.3.0`; astro 7 требует `>=22.12.0`. setup-node с node-version: 22 ставит последний 22.x — ок, но зафиксировать `22.22.3+`; локально Node 24.18.0 — ок.
**How to avoid:** engines `node: ">=22.22.3"` (перекрывает оба требования) или node-version: 24 в CI; уточнить с пользователем (SPEC писал >=22).
**Warning signs:** engine-предупреждения npm при install.

### Pitfall 10: package-lock.json не в Git
**What goes wrong:** `npm ci` в CI падает без lockfile.
**How to avoid:** коммитить package-lock.json сразу после первой установки.
**Warning signs:** CI job «npm ci» с ошибкой lockfile.

## Code Examples

Verified patterns from official sources:

### Официальный ручной скаффолд (install-and-setup)
```json
// package.json — Source: docs.astro.build/en/install-and-setup/
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview"
  },
  "engines": { "node": ">=22.22.3" }
}
```
```js
// astro.config.mjs — Source: docs.astro.build (sitemap + mdx integrations)
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://example.com', // черновой URL до деплоя (фаза 6)
  integrations: [mdx(), sitemap()],
});
```
```json
// tsconfig.json — Source: docs.astro.build/en/guides/typescript/
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### Design tokens — единый файл (SPEC R2, UI-SPEC имена)
```css
/* src/styles/tokens.css — Source: UI-SPEC 01 (зафиксированные имена), ADR §5.5 */
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
```css
/* src/styles/global.css — локальные шрифты (D-03), reset, focus-visible (UI-SPEC) */
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

### CI workflow (D-11: lint до build)
```yaml
# .github/workflows/ci.yml — Source: D-11 + официальный паттерн astro check && astro build
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
      - run: npm run lint        # eslint (до check/build — требование R6)
      - run: npm run check       # astro check
      - run: npm run build       # astro build
```

### ESLint flat config
```js
// eslint.config.mjs — Source: github.com/ota-meshi/eslint-plugin-astro (README)
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

### View Transitions (только временный spike-артефакт)
```astro
---
// src/pages/_spike-vt.astro — ВРЕМЕННО, для spike R5; удалить после прогона.
// Source: docs.astro.build/en/guides/view-transitions/
import { ClientRouter } from 'astro:transitions';
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Spike VT" description="временная страница проверки View Transitions">
  <ClientRouter />
  <a href="/work" transition:name="page">к работе (проверка перехода в Stacki)</a>
</BaseLayout>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Legacy content collections: `src/content/config.ts`, `defineCollection` из 'astro:content', zod 3 | Content layer: `src/content.config.ts`, loaders `glob()`/`file()`, `z` из 'astro/zod' (Zod 4) | Astro 5 (2024) | Схемы и структура фазы 1 пишутся по новому API; id из имени файла, slug-оверрайд в frontmatter |
| `viewTransitions: true` в astro.config | `<ClientRouter />` из 'astro:transitions' в layout; браузерные cross-document VT покрывают базовые случаи без JS | Astro 5–7 | Spike проверяет именно ClientRouter; фаза 1 не включает VT в сайт |
| Markdown-рендер через remark/rehype (`@astrojs/markdown-remark`) | Процессор Sätteri по умолчанию (Astro 7); unified() — опция | Astro 7 | Для фазы 1 (MDX в коллекциях) прозрачно; если понадобятся remark-плагины — ставить `@astrojs/markdown-remark` + `markdown.processor` |
| Go-компилятор .astro | Rust-компилятор (строже: незакрытые теги = ошибка, некорректный HTML не «чинится») | Astro 7 | Писать строго валидный HTML в компонентах — иначе сборка падает |
| TS 5.x как актуальный | TS 6.x + нативный TS 7 (tsgo) | 2025–2026 | @astrojs/check принимает ^5\|\|^6 — типизацию проекта держать на ^6 |
| @astrojs/sitemap: один `sitemap.xml` | `sitemap-index.xml` + `sitemap-0.xml`, опции `chunks`/`filenameBase` | v3.x | AC R4 проверяется по sitemap-index.xml |

**Deprecated/outdated:**
- `@astrojs/db`: удалён в Astro 7 (не используется проектом).
- `viewTransitions: true` config: устарел в пользу `<ClientRouter />`.
- `TRANSITION_*` константы из 'astro:transitions': удалены в v7 — только имена событий (`astro:before-preparation` и т.д.).
- Ручная генерация типов коллекций: не нужна — `.astro/types.d.ts` генерируется.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | «Stacki v0.1.3 добавляет визуальную работу с JSON-коллекциями и стилями» (из ADR-документа) | Summary, Stacki | [RESOLVED в части релиза: v0.1.3 существует (stacki-releases, 2026-07-30, 10 ассетов); [ASSUMED] в части функций — README не упоминает JSON/стили. Если JSON/стили не видны в Stacki — spike фиксирует «ограничение», workflow не меняется (код-режим). Не влияет на решения фазы 1 |
| A2 | zod-синтаксис `astro/zod` идентичен на astro 5 (zod 3.23) и 7 (zod 4) для используемых конструкций (z.object/string/array/enum/coerce/optional/default) | Standard Stack | [ASSUMED] — документация проверена только для текущей (7) версии. Если пользователь подтвердит 5.x, схемы фазы 1 проверяются `astro check` — миграция тривиальна |
| A3 | Канонический набор OG-тегов (og:title/description/type/url/image/locale) и canonical — стандарт | Code Examples | [CITED: ogp.me, w3.org canonical] — UI-SPEC зафиксировал контракт Seo.astro; риск минимален |
| A4 | `astro check` выполняет sync типов коллекций перед проверкой | Pitfall 6 | [ASSUMED] — в свежем CI-окружении check на несуществующем `.astro/types.d.ts` поведёт себя корректно. Проверяется первым же зелёным CI |
| A5 | Дубликат `id` в file()-loader для JSON вызывает ошибку сборки | Pitfall 8 | [CITED: docs (unique id required)] — точная форма ошибки фиксируется негативным тестом фазы |
| A6 | Черновой `site` URL до деплоя не ломает ничего, кроме абсолютных canonical (временный URL) | Pitfall 4 | [ASSUMED] — canonical с черновым доменом перезапишется в фазе 6; согласовать URL с пользователем |
| A7 | View Transitions в spike проверяется на временной странице с ClientRouter (не в BaseLayout) | Anti-Patterns | [ASSUMED] — моя рекомендация; UI-SPEC запрещает клиентский JS в фазе 1, AC R5 требует проверку конструкции |

## Open Questions

1. **Версия Astro: 7.1.6 (current stable) или ^5.18.2 (буква SPEC)?**
   - What we know: SPEC (2026-07-31) зафиксировал «latest stable 5.x», но npm `latest` = 7.1.6 (опубликован 2026-07-29), docs подтверждают «Astro v7 is here!»; 5.x закончился на 5.18.2. Интеграции peer-привязаны к мажору (mdx@7↔astro7, mdx@4↔astro5). Оба пути валидны для всех API фазы (content layer, strict, sitemap, mdx, ClientRouter).
   - Recommendation: **подтвердить astro@^7.1.6** (соответствует намерению «latest stable» в SPEC); fallback — буквальное ^5 + mdx@^4. Планировщик: checkpoint перед npm install; AC R6 «astro ^5» скорректировать по решению.
2. **Установка Stacki (исправлено: канал подтверждён).**
   - What we know: репозиторий реальный, MIT; дистрибуция — `flowtricks/stacki-releases` (README: «Pushing a v* tag triggers CI, which uploads them to the stacki-releases repo»; автообновление через electron-updater); **v0.1.3 существует** («Latest», 2026-07-30, 10 ассетов, GPG). README описывает `npm run dev`/`npm start` и сборку `npm run dist:win`/`dist:mac:unsigned`.
   - Recommendation: шаг 1 spike — скачать установщик v0.1.3 из stacki-releases (Windows: NSIS) и установить; если установка невозможна — сборка из исходников `npm install && npm run dist:win`; если и это не работает — зафиксировать в `docs/stacki-coverage.md` как ограничение окружения и перейти к кодовой проверке конструкций; решение о продолжении фазы с живым прогоном — за пользователем.
3. **Формулировка AC R4 «sitemap.xml» vs фактический вывод `sitemap-index.xml`.**
   - Recommendation: проверки и robots.txt ссылаются на `/sitemap-index.xml`; поправить AC в плане (отметить как техническое уточнение, не изменение решения).
4. **Доменное имя для `site` в astro.config.**
   - Recommendation: черновой URL (например, https://portfolio.example.com) с пометкой «заменить в фазе 6»; окончательный — по решению пользователя.
5. **Имя и видимость GitHub-репозитория.**
   - What we know: CONTEXT Specifics — «публичный/приватный не зафиксировано»; gh CLI авторизован (Ivan-Shivarshinov, scopes repo+workflow).
   - Recommendation: планировщик предлагает имя (например, portfolio-ivan-shivarshinov) и приватность; решение за пользователем при настройке remote.
6. **Node engines: `>=22` (SPEC) vs `>=22.22.3` (eslint-plugin-astro) vs `>=22.12` (astro 7).**
   - Recommendation: `engines.node: ">=22.22.3"` — покрывает все требования; CI node-version: 22 (последний патч).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Astro, сборка | ✓ | 24.18.0 (>= 22.12 ✓, >= 22.22.3 ✓) | — |
| npm | Установка пакетов | ✓ | 11.16.0 | — |
| git | Весь workflow, remote | ✓ | 2.45.2.windows.1 | — |
| gh CLI | GitHub remote, publish | ✓ | 2.95.0 (авторизован: Ivan-Shivarshinov, repo+workflow) | — |
| curl | Проверка preview (HTTP 200) | ✓ | 8.8.0 | — |
| Stacki (desktop) | Spike R5 | ✗ | v0.1.3 доступен | Установщик из stacki-releases (NSIS, Windows); fallback — сборка из исходников (npm install && npm run dist:win); иначе spike-ограничение в coverage-документе |
| GitHub Actions | CI R6 | ✓ (сервис; remote создаётся в фазе) | — | Локальный прогон lint/check/build как fallback-проверка |

**Missing dependencies with no fallback:**
- Stacki desktop-приложение — не установлено локально; установочный канал подтверждён (v0.1.3 в stacki-releases, 2026-07-30, 10 ассетов). Блокирует только «живой» прогон spike — НЕ блокирует остальную часть фазы (спайк-документ фиксирует фактическое состояние).

**Missing dependencies with fallback:**
- Stacki: установщик v0.1.3 из stacki-releases (Windows: NSIS); fallback — сборка из исходников по README (`npm run dist:win`); крайний случай — документирование ограничения.

## Validation Architecture

> `workflow.nyquist_validation`: ключ отсутствует в .planning/config.json → считаем включённым.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Нет фреймворка — plain Node.js скрипты (node --test/--eval) + CLI-проверки; фаза 1 не содержит юнит-логики, валидация — на уровне сборки/артефактов |
| Config file | none — скрипты в `scripts/` + npm scripts в package.json |
| Quick run command | `npm run build` |
| Full suite command | `npm run verify` (build + check-seo + check-tokens + check-collections) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| R1 | `npm ci && npm run build` exit 0 | smoke/CLI | `npm run build` | ❌ Wave 0 (package.json) |
| R1 | Preview HTTP 200 на 5 маршрутах | smoke/CLI | `npm run preview & curl -sf -o /dev/null -w "%{http_code}"` по / /work /lab /about /contact | ❌ Wave 0 (скрипт verify-preview) |
| R2 | Ровно 1 файл токенов; 5 групп; нет хардкод-значений где есть токен | unit (node) | `scripts/check-tokens.mjs` (grep-аудит src/styles + src/components) | ❌ Wave 0 |
| R3 | `astro check` exit 0 (strict, полные и пустые коллекции) | unit (CLI) | `npm run check` | ❌ Wave 0 (package.json) |
| R3 | Падение при дубликате slug/id | negative | `scripts/check-collections.mjs`: временная фикстура дубликата → build fail → restore (DuplicateContentEntrySlugError / duplicate id) | ❌ Wave 0 |
| R3 | Падение при отсутствии обязательного поля | negative | та же фикстура-скрипт (запись без title) → build fail | ❌ Wave 0 |
| R3 | Проход при пустых коллекциях (notes = 0) | unit | `npm run build` (штатная сборка) | ❌ Wave 0 |
| R4 | 5 уникальных пар title/description | unit (node) | `scripts/check-seo.mjs`: парсинг dist/*.html → Set по паре, assert 5 уникальных | ❌ Wave 0 |
| R4 | canonical + OG на каждой странице | unit (node) | тот же скрипт: regex `rel="canonical"`, `property="og:title"` и др. на всех 5 страницах | ❌ Wave 0 |
| R4 | sitemap содержит 5 маршрутов | unit (node) | `scripts/check-seo.mjs`: parse dist/sitemap-index.xml → 5 url | ❌ Wave 0 |
| R5 | spike-документ в Git, 8 конструкций + 2 edge, вердикты | manual + grep | `scripts/check-spike-doc.mjs`: наличие docs/stacki-coverage.md, 8 пунктов, пометки «проверено/ограничение»; порядок коммитов (spike до визуальной сборки) — git log | ❌ Wave 0 |
| R6 | remote, workflow lint→build, engines | manual + CLI | `git remote -v`; содержимое .github/workflows/ci.yml (порядок шагов); node-скрипт по engines | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build` (быстрая проверка целостности)
- **Per wave merge:** `npm run verify` (build + check-seo + check-tokens + check-collections)
- **Phase gate:** полный `npm run verify` зелёный + CI зелёный на первом push + spike-документ закоммичен → `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `scripts/verify-preview.mjs` — HTTP 200 по 5 маршрутам preview (R1)
- [ ] `scripts/check-tokens.mjs` — единый файл, 5 групп, запрет хардкода (R2)
- [ ] `scripts/check-collections.mjs` — негативные фикстуры: дубликат slug/id, отсутствие обязательного поля (R3)
- [ ] `scripts/check-seo.mjs` — уникальность title/description, canonical+OG, sitemap-index.xml (R4)
- [ ] `scripts/check-spike-doc.mjs` — покрытие 8 конструкций + 2 edge в docs/stacki-coverage.md (R5)
- [ ] package.json scripts: dev/build/preview/lint/check/verify + engines (R1, R6)

## Security Domain

> `security_enforcement` в config.json отсутствует → считаем включённым. Фаза — статическая сборка без рантайма: домен минимален, но фиксируем стандартные контроли.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — нет пользователей/входов (статический сайт) |
| V3 Session Management | no | — нет сессий |
| V4 Access Control | no | — нет авторизации |
| V5 Input Validation | yes | zod-схемы коллекций (валидация контента при сборке) + auto-escaping Astro в шаблонах |
| V6 Cryptography | no | — нет шифрования (HTTPS на хостинге, фаза 6) |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Supply chain (зависимости) | Tampering | npm ci + закоммиченный package-lock.json; пакеты — официальные (аудит выше); engines-ограничения |
| XSS через контент коллекций (MDX) | Tampering | Astro auto-escapes в шаблонах; контент — собственный (не пользовательский ввод); MDX-компоненты — только свои |
| SEO/head-инъекция через frontmatter | Spoofing | Astro экранирует атрибуты; title/description — строки из zod-схем |
| Нежелательный клиентский JS | Elevation | Фаза 1: ноль клиентского JS (UI-SPEC); проверка: нет client:* директив в собранном HTML |

## Sources

### Primary (HIGH confidence)
- [docs.astro.build/en/install-and-setup/] — ручная установка, astro.config.mjs, tsconfig base/strict/strictest, Node >= 22.12
- [docs.astro.build/en/guides/content-collections/] — content layer: defineCollection, glob/file loaders, astro/zod (Zod 4), getCollection/getEntry, недетерминированный порядок
- [docs.astro.build/en/guides/typescript/] — astro/tsconfigs/strict, astro check, @astrojs/ts-plugin, path aliases
- [docs.astro.build/en/guides/styling/] — scoped styles (data-astro-cid), global CSS, define:vars
- [docs.astro.build/en/guides/integrations-guide/sitemap/] — site required, sitemap-index.xml, filter/customPages/serialize
- [docs.astro.build/en/guides/integrations-guide/mdx/] — установка, MDX в коллекциях, render()/<Content />
- [docs.astro.build/en/guides/view-transitions/] — ClientRouter, transition:persist/name, prefers-reduced-motion
- [docs.astro.build/en/guides/fonts/] — локальные шрифты, Fonts API, preload (классический @font-face — устоявшаяся практика)
- [docs.astro.build/en/guides/upgrade-to/v7/] — Vite 8, Rust-компилятор, Sätteri, удалённые TRANSITION_* константы
- [docs.astro.build/en/reference/errors/duplicate-content-entry-slug-error/] — официальная ошибка дубликата slug
- [npm registry (npm view)] — версии, engines, peerDependencies всех пакетов (2026-08-01)
- [github.com/flowtricks/stacki README (raw)] — парсинг-модель, code fallback, MIT, требования Node 18+/npm/git/gh
- [GitHub flowtricks/stacki-releases/releases/tag/v0.1.3] — v0.1.3 «Latest» (2026-07-30, 10 ассетов, GPG-подпись; notes: «Add initial README with project title»)
- [GitHub API flowtricks/stacki/releases] — 0 релизов в основном репо (артефакты публикуются в stacki-releases по README)

### Secondary (MEDIUM confidence)
- [github.com/ota-meshi/eslint-plugin-astro (README)] — flat config, версии ESLint/Node
- [moonrepo.dev/docs/guides/examples/astro] — паттерн «astro check && astro build» в CI (вторичное подтверждение)
- [WebSearch: duplicate slug] — перекрёстное подтверждение DuplicateContentEntrySlugError

### Tertiary (LOW confidence)
- [WebSearch: SEO-паттерны Astro] — перекрёстно подтверждено UI-SPEC и стандартом OG; отдельный официальный гайд Astro отсутствует (docs.astro.build/en/guides/seo/ → 404)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — все версии/engines/peer-зависимости проверены по npm registry + официальным docs 2026-08-01
- Architecture: HIGH — content layer, layout-композиция, sitemap — официальные паттерны; структура — из locked D-01/D-02 и UI-SPEC
- Pitfalls: MEDIUM-HIGH — версионные ловушки (7/5, TS 7, sitemap-index) проверены по реестру; функциональное поведение Stacki вне README (A1) — непроверяемо (это и есть цель spike)
- Stacki claims: MEDIUM-HIGH — README проверен дословно (HIGH для того, что README утверждает); релиз v0.1.3 и канал дистрибуции подтверждены по stacki-releases (HIGH); возможности вне README — LOW, эмпирика spike

**Research date:** 2026-08-01
**Valid until:** 2026-08-31 (30 дней; стек Astro обновляется быстро — перед установкой перепроверить `npm view astro dist-tags.latest` и мажорные peer-диапазоны интеграций)
