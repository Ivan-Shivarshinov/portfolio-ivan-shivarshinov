---
phase: 01-osnova-proekta
plan: 03
subsystem: ui
tags: astro, design-tokens, css-variables, seo, eslint, prettier, fonts, sitemap, scaffolding

# Dependency graph
requires:
  - phase: 01-osnova-proekta
    provides: решения 01-01 (astro@^7.1.6, site URL), скрипты валидации 01-02 (check-tokens.mjs, verify-preview.mjs)
provides:
  - Astro-каркас: package.json (engines >=22.22.3, 10 скриптов), astro.config.mjs (site + mdx + sitemap), tsconfig strict, .gitignore
  - Единый файл токенов src/styles/tokens.css (5 групп, значения UI-SPEC) + global.css с 3 @font-face (font-display: swap)
  - Seo.astro (8+ тегов head, canonical из Astro.site) + BaseLayout (nav 5 меток, без фиксированных ширин) + index.astro
  - Локальные шрифты: space-grotesk-400/600, jetbrains-mono-400 (WOFF2 из upstream-репозиториев фаундри)
  - Lint-стек: eslint.config.mjs (flat config), .prettierrc, scripts/check-prohibitions.mjs (P1/P2, GSD_PROHIB_SUBJECT, self-test)
  - npm verify: build && check-seo && check-tokens && check-collections && check-prohibitions
affects: 01-04 (коллекции), 01-05 (страницы/sitemap/robots), 01-06 (spike), 01-07 (CI), фазы 2-3 (визуальная система, контент)

# Tech tracking
tech-stack:
  added: astro@7.1.6, @astrojs/mdx@7.0.5, @astrojs/sitemap@3.7.3, @astrojs/check@0.9.10, typescript@6.0.3, @astrojs/ts-plugin@1.10.10, eslint@10.8.0, eslint-plugin-astro@3.0.1, @typescript-eslint/parser@8.65.0, prettier@3.9.6, prettier-plugin-astro@0.14.1
  patterns: layout-обёртка + Seo.astro с типизированными props (D-04); единственный файл токенов + потребление через var() (R2); локальные шрифты WOFF2 (D-03); flat ESLint config для .astro

key-files:
  created:
    - package.json
    - package-lock.json
    - astro.config.mjs
    - tsconfig.json
    - .gitignore
    - eslint.config.mjs
    - .prettierrc
    - scripts/check-prohibitions.mjs
    - src/styles/tokens.css
    - src/styles/global.css
    - src/layouts/BaseLayout.astro
    - src/components/Seo.astro
    - src/pages/index.astro
    - public/fonts/space-grotesk-400.woff2
    - public/fonts/space-grotesk-600.woff2
    - public/fonts/jetbrains-mono-400.woff2
  modified: []

key-decisions:
  - "01-03 T1: eslint-plugin-jsx-a11y не установлен — peer-диапазон ^3-^9 несовместим с eslint@^10 (требование eslint-plugin-astro); jsx-a11y — опциональный peer (peerDependenciesMeta), фаза 1 его не использует (RESEARCH: «не включать агрессивно»)"
  - "01-03 T2: источник шрифтов — upstream-репозитории фаундри (floriankarsten/space-grotesk, JetBrains/JetBrainsMono): google/fonts GitHub больше не содержит WOFF2 (только вариативные TTF)"
  - "01-03 T2: space-grotesk-600.woff2 — вариативный SpaceGrotesk[wght].woff2 (статичного SemiBold 600 нет ни в одном официальном источнике); инстанс 600 выбирается декларацией font-weight в @font-face"
  - "01-03 T3: check-prohibitions.mjs — точное совпадение для одиночных имён denylist + namespace-префиксы (@tailwindcss/, @unocss/, @angular/), чтобы похожие имена (vuepress, react-test-renderer) не давали ложных срабатываний"

patterns-established:
  - "Страница = BaseLayout + плоские self-closing компоненты с props (D-04); head-контракт делегируется Seo.astro"
  - "Единый файл токенов (tokens.css) + потребление только через var() (проверяется check-tokens.mjs)"
  - "Локальные шрифты: WOFF2 в public/fonts, @font-face с font-display: swap, без CDN (D-03)"
  - "canonical/og:url строятся из Astro.url.pathname + Astro.site (Pitfall 4) — site в конфиге обязателен"

requirements-completed: [R1, R2, R4, R6]

coverage:
  - id: D1
    description: "Astro-каркас собирается с чистого lockfile; index рендерится end-to-end (tokens → global.css → BaseLayout → Seo.astro) с canonical/OG в HTML"
    requirement: R1
    verification:
      - kind: other
        ref: "npm ci && npm run build (astro check 0 errors + astro build) — exit 0"
        status: pass
      - kind: other
        ref: "node scripts/verify-preview.mjs --routes / — HTTP 200 + text/html на /"
        status: pass
      - kind: other
        ref: "grep -q 'rel=\"canonical\"' dist/index.html — canonical найден"
        status: pass
    human_judgment: false
  - id: D2
    description: "Единый файл токенов с 5 группами (color/typography/spacing/containers/motion), точные значения UI-SPEC; отсутствие хардкода в src/styles и src/components"
    requirement: R2
    verification:
      - kind: other
        ref: "node scripts/check-tokens.mjs — exit 0"
        status: pass
    human_judgment: false
  - id: D3
    description: "Три локальных WOFF2 (Space Grotesk 400/600, JetBrains Mono 400) в public/fonts, подключены через @font-face с font-display: swap"
    requirement: R1
    verification:
      - kind: other
        ref: "node -e wOF2 magic check для space-grotesk-400/600, jetbrains-mono-400 — exit 0"
        status: pass
      - kind: other
        ref: "npm run build — без предупреждений о неразрешённых шрифтах"
        status: pass
    human_judgment: false
  - id: D4
    description: "Lint-стек (eslint flat config + eslint-plugin-astro recommended + prettier), check-prohibitions.mjs (P1/P2) с self-test, полный набор npm-скриптов + verify"
    requirement: R6
    verification:
      - kind: other
        ref: "npm run lint — exit 0"
        status: pass
      - kind: other
        ref: "node scripts/check-prohibitions.mjs && node scripts/check-prohibitions.mjs --self-test — exit 0"
        status: pass
    human_judgment: false
  - id: D5
    description: "Навигация из 5 коротких меток (Home/Work/Lab/About/Contact) без фиксированных ширин — перенос без горизонтального скролла на узких экранах (UI-SPEC long-text/overflow nav)"
    verification:
      - kind: other
        ref: "инспекция BaseLayout.astro: только текстовые <a> без width/min-width; метки <= 8 символов"
        status: pass
    human_judgment: false

# Metrics
duration: 12min
completed: 2026-08-01
status: complete
---

# Phase 01-osnova-proekta Plan 03: Tracer — каркас Astro Summary

**Рабочий Astro-каркас с единым файлом токенов (5 групп), локальными шрифтами WOFF2, SEO-компонентом, lint-стеком и npm verify: сборка, check-tokens и preview на / зелёные end-to-end**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-01T21:09:39Z
- **Completed:** 2026-08-01T21:21:36Z
- **Tasks:** 3 (tracer + 2 auto)
- **Files modified:** 16

## Accomplishments

- Astro 7.1.6 каркас: package.json (engines.node >=22.22.3, 10 скриптов), astro.config.mjs (site https://portfolio.example.com — черновой, 01-01 T2), tsconfig strict, .gitignore; package-lock.json закоммичен (Pitfall 10)
- Единый файл токенов src/styles/tokens.css — 5 групп, точные значения UI-SPEC; global.css — 3 @font-face (Space Grotesk 400/600, JetBrains Mono 400, font-display: swap), body, :focus-visible
- Seo.astro (title/description/canonical/og:title/og:description/og:type/og:url/og:locale ru_RU/og:image) + BaseLayout (nav Home/Work/Lab/About/Contact без фиксированных ширин, без ClientRouter) + index.astro с уникальной парой title/description
- Локальные шрифты: 3 валидных WOFF2 (магия wOF2) из официальных upstream-репозиториев фаундри — отдельным коммитом от tracer (внешняя загрузка изолирована)
- eslint.config.mjs (flat config), .prettierrc, scripts/check-prohibitions.mjs (P1/P2 denylist, GSD_PROHIB_SUBJECT, известная-хорошая/плохая/пограничные фикстуры), verify-скрипт в package.json — закрывает последний пункт Wave 0 gap 6 (01-VALIDATION.md)
- Tracer-гейт пройден: повторный end-to-end прогон verify после коммита tracer — build, check-tokens, preview / (200 + text/html), canonical

## Task Commits

Каждая задача закоммичена атомарно:

1. **Task 1 (tracer): каркас Astro + первая страница end-to-end** — `6675490` (feat)
2. **Task 2: скачивание и валидация локальных шрифтов (WOFF2)** — `d9abad0` (feat)
3. **Task 3: lint-конфиги + check-prohibitions.mjs + wiring npm verify** — `6ccb0fe` (feat)

**Plan metadata:** (в финальном docs-коммите)

## Files Created/Modified

- `package.json` — scripts dev/build/preview/lint/check/check-seo/check-tokens/check-collections/check-spike-doc/verify; engines.node ">=22.22.3"; deps astro@^7.1.6, @astrojs/mdx@^7.0.5, @astrojs/sitemap@^3.7.3
- `package-lock.json` — закоммичен сразу (Pitfall 10); npm ci проходит на чистой установке
- `astro.config.mjs` — defineConfig({ site: 'https://portfolio.example.com', integrations: [mdx(), sitemap()] })
- `tsconfig.json` — extends astro/tsconfigs/strict, include [".astro/types.d.ts", "**/*"], paths @/* → ./src/*
- `.gitignore` — node_modules/, dist/, .astro/, *.local, .DS_Store, .env*
- `eslint.config.mjs` — flat config: tsParser + extraFileExtensions, configs.recommended, ignores dist/node_modules/.astro
- `.prettierrc` — prettier-plugin-astro, parser astro для *.astro
- `scripts/check-prohibitions.mjs` — denylist P1/P2, GSD_PROHIB_SUBJECT (default ./package.json), --self-test
- `src/styles/tokens.css` — единственный файл токенов, 5 групп, значения UI-SPEC
- `src/styles/global.css` — 3 @font-face (font-display: swap), :root color-scheme, body, :focus-visible (только var()-значения, кроме 2px outline)
- `src/layouts/BaseLayout.astro` — html lang="ru", Seo в head, nav (5 меток без фиксированных ширин), slot, footer-заглушка
- `src/components/Seo.astro` — Props {title, description, canonical?, ogImage?}, canonical из Astro.site
- `src/pages/index.astro` — маршрут /, уникальные title/description, статичный контент без клиентского JS
- `public/fonts/space-grotesk-400.woff2`, `space-grotesk-600.woff2`, `jetbrains-mono-400.woff2` — валидные WOFF2 (wOF2)

## Decisions Made

- **eslint-plugin-jsx-a11y не установлен:** peer-диапазон `^3–^9` несовместим с `eslint@^10`, который требует eslint-plugin-astro@3 (peer `>=10.0.0`); jsx-a11y помечен в eslint-plugin-astro как опциональный peer (`peerDependenciesMeta.optional`), RESEARCH.md прямо рекомендует «в фазе 1 не включать агрессивно». Пакет легитимен — это разрешимый конфликт версий, не легитимности. Возврат: фаза 2+ при реальной потребности в a11y-правилах (тогда пересмотреть и eslint, или jsx-a11y версию).
- **Источник шрифтов:** google/fonts GitHub (первичный источник по плану) больше не публикует WOFF2 — репозиторий содержит только вариативные TTF (подтверждено GitHub API: ofl/spacegrotesk, ofl/jetbrainsmono). Использованы официальные upstream-репозитории фаундри: floriankarsten/space-grotesk (fonts/woff2) и JetBrains/JetBrainsMono (fonts/webfonts) — полные глифы, не сабсеты.
- **space-grotesk-600.woff2 — вариативный файл:** статичного SemiBold (600) нет ни в одном официальном источнике (у фаундри статичные только Light/Regular/Medium/Bold; gstatic отдаёт для 400 и 600 один и тот же файл — фактически вариативный). Скачан SpaceGrotesk[wght].woff2; декларация `font-weight: 600` в @font-face выбирает именованный инстанс 600.
- **check-prohibitions.mjs:** точное совпадение для одиночных имён denylist + namespace-префиксы для @tailwindcss/, @unocss/, @angular/ — предотвращает ложные срабатывания (vuepress, react-test-renderer, @sveltejs/kit).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] npm init не работает из-за кириллицы в имени каталога**
- **Found during:** Task 1 (шаг 1 — npm init --yes)
- **Issue:** имя каталога «Моё портфолио» содержит кириллицу — npm отклоняет его как invalid name пакета
- **Fix:** package.json создан вручную с валидным именем `portfolio-ivan-shivarshinov` (имя репозитория из решения 01-01 T3), `private: true`, `type: module`, скрипты и engines по паттерну
- **Files modified:** package.json
- **Verification:** npm install/npm ci работают; build exit 0
- **Committed in:** 6675490 (Task 1)

**2. [Rule 3 - Blocking] eslint-plugin-jsx-a11y несовместим с eslint@^10 (ERESOLVE)**
- **Found during:** Task 1 (шаг 2 — установка dev-зависимостей)
- **Issue:** `eslint-plugin-jsx-a11y@6.10.2` (latest) имеет peer `eslint ^3–^9`, а eslint-plugin-astro@3 требует `eslint >=10`; npm install падает с Conflicting peer dependency
- **Fix:** пакет не установлен — он опциональный peer eslint-plugin-astro (подтверждено `npm view eslint-plugin-astro peerDependenciesMeta`); RESEARCH.md: «в фазе 1 не включать агрессивно»; a11y-правила не используются в фазе 1 (UI-SPEC Interaction NONE)
- **Files modified:** — (пакет отсутствует в devDependencies)
- **Verification:** npm run lint exit 0; зафиксировано в Decisions
- **Committed in:** 6675490 (Task 1, состав devDeps)

**3. [Rule 3 - Blocking] google/fonts GitHub не содержит статичных WOFF2**
- **Found during:** Task 2 (скачивание шрифтов)
- **Issue:** план предполагал WOFF2 в ofl/spacegrotesk и ofl/jetbrainsmono (статические экземпляры); GitHub API подтверждает: только `SpaceGrotesk[wght].ttf` и `JetBrainsMono[wght].ttf`; jsdelivr-зеркало отдаёт те же TTF; fallback-лимитация «оба источника недоступны» неприменима — источники доступны, но нужного формата нет
- **Fix:** официальные upstream-репозитории фаундри: floriankarsten/space-grotesk (fonts/woff2/static/SpaceGrotesk-Regular.woff2, fonts/woff2/SpaceGrotesk[wght].woff2) и JetBrains/JetBrainsMono (fonts/webfonts/JetBrainsMono-Regular.woff2)
- **Files modified:** public/fonts/*.woff2
- **Verification:** магия wOF2 у всех 3 файлов; build без предупреждений
- **Committed in:** d9abad0 (Task 2)

**4. [Rule 3 - Blocking] Статичного Space Grotesk 600 нет — вариативный файл для слота 600**
- **Found during:** Task 2 (проверка доступных статичных инстансов)
- **Issue:** у фаундри статичные woff2 только Light/Regular/Medium/Bold; gstatic для 400 и 600 отдаёт одинаковый URL (тоже вариативный файл)
- **Fix:** в space-grotesk-600.woff2 положен вариативный SpaceGrotesk[wght].woff2 (полные глифы); @font-face `font-weight: 600` выбирает именованный инстанс — стандартное поведение CSS Fonts 4
- **Files modified:** public/fonts/space-grotesk-600.woff2
- **Verification:** wOF2 валиден, build exit 0, preview / 200
- **Committed in:** d9abad0 (Task 2)

**5. [Rule 1 - Bug] check-prohibitions.mjs: наивный префикс-матч даёт ложные срабатывания**
- **Found during:** Task 3 (проектирование denylist-логики до первого прогона)
- **Issue:** префикс-матч `vue` ловит `vuepress`, `react` ловит `react-test-renderer`/`react-router` и т.п. — план требует denylist конкретных пакетов
- **Fix:** точное совпадение (DENYLIST_EXACT) для одиночных имён + namespace-префиксы (DENYLIST_PREFIXES: @tailwindcss/, @unocss/, @angular/); добавлена пограничная фикстура в self-test (vuepress, react-test-renderer, @sveltejs/kit → не детектируются)
- **Files modified:** scripts/check-prohibitions.mjs
- **Verification:** node scripts/check-prohibitions.mjs --self-test exit 0
- **Committed in:** 6ccb0fe (Task 3)

---

**Total deviations:** 5 auto-fixed (4 Rule 3 blocking, 1 Rule 1 bug)
**Impact on plan:** Все авто-фиксы необходимы для прохождения задач при изменившейся внешней реальности (структура google/fonts, peer-конфликт eslint). Scope creep отсутствует: состав зависимостей совпадает с решением 01-01 минус несовместимый опциональный peer.

## Known Stubs

| Файл | Строка | Причина |
|------|--------|---------|
| src/pages/index.astro | h1 + «Фаза 2 — визуальная система» | Намеренный стаб фазы 1 (scaffolding-only): план Task 1 шаг 11. Primary CTA «Смотреть работы» (Home → /work) НЕ рендерится намеренно — UI-SPEC Color: акцент и primary CTA только с фазы 2 визуальной сборки; контент — фаза 3 |
| src/layouts/BaseLayout.astro | `<footer></footer>` | Намеренная заглушка footer по плану Task 1 шаг 10; визуальная сборка chrome — фаза 2 |

## Threat Flags

Новых поверхностей вне threat_model плана нет: файлы (Seo.astro, BaseLayout.astro, страницы) рендерят только статичные props-строки (Astro экранирует), клиентского JS нет (UI-SPEC Interaction NONE). Источник шрифтов отличается от указанного в T-01-03 (не google/fonts GitHub, а upstream-репозитории фаундри) — митигация сохранена: официальный источник + валидация WOFF2-заголовка при приёмке.

## Issues Encountered

- **MSYS path conversion (Windows/Git Bash):** `node scripts/verify-preview.mjs --routes /` в Git Bash конвертирует `/` в `C:/Program Files/Git/`. Не дефект скрипта (в cmd/PowerShell работает): запуск с `MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*'`. Зафиксировано для последующих прогонов (01-05 полный 5-маршрутный прогон).
- **esbuild postinstall заблокирован allow-scripts (npm 11):** предупреждение при установке; на сборку не влияет (build exit 0 после npm ci) — зафиксировано как наблюдение.
- **npm init:** отклоняет кириллическое имя каталога (см. отклонение 1).

## TDD Gate Compliance

Не применимо — план `type: execute`, задачи `tdd="false"`.

## Next Phase Readiness

- Каркас готов к расширению: 01-04 (коллекции/JSON-схемы — content.config.ts), 01-05 (4 страницы-заглушки, sitemap-проверка check-seo.mjs с 5 маршрутами, robots.txt на sitemap-index.xml), 01-06 (spike Stacki), 01-07 (CI workflow lint → check → build, engines уже в package.json)
- Wave 0 gaps 1-6 закрыты полностью (последний пункт — полный набор скриптов + engines — закрыт здесь)
- Внимание 01-05: verify-preview --routes запускать с отключённой MSYS path conversion
- Внимание 01-07: CI setup-node Node 22 ставит >=22.22.3 (engines), npm ci работает с закоммиченным lockfile

---
*Phase: 01-osnova-proekta*
*Completed: 2026-08-01*

## Self-Check: PASSED

- Все 16 файлов плана существуют (включая 3 WOFF2 и SUMMARY)
- Все 3 task-коммита в git: 6675490, d9abad0, 6ccb0fe
