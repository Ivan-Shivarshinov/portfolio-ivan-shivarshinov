---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 3
current_phase_name: Контент и страницы
status: executing
stopped_at: Phase 3 UI-SPEC approved
last_updated: "2026-08-03T15:48:13.423Z"
last_activity: 2026-08-03
last_activity_desc: Phase 02 complete, transitioned to Phase 3
progress:
  total_phases: 3
  completed_phases: 2
  total_plans: 19
  completed_plans: 13
---

# Состояние проекта

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-31)

**Core value:** Портфолио подтверждает позиционирование «веб-разработчик с продуктовым подходом»: центральная интерактивная механика (индекс работ) — осмысленное доказательство компетенции, а не декоративный эффект
**Current focus:** Phase 02 — vizualnaya-sistema

## Current Position

Phase: 3 — Контент и страницы
Plan: Not started
Status: Ready to execute
Last activity: 2026-08-03 — Phase 02 complete, transitioned to Phase 3

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**

- Total plans completed: 13
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| (появится после выполнения планов) | | | |
| 01 | 7 | - | - |
| 02 | 6 | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 12 | 4 tasks | 3 files |
| Phase 01 P02 | 15 | 2 tasks | 5 files |
| Phase 01 P03 | 12 | 3 tasks | 16 files |
| Phase 01-osnova-proekta P04 | 20 | 1 tasks | 6 files |
| Phase 01-osnova-proekta P05 | 5 | 2 tasks | 6 files |
| Phase 01-osnova-proekta P06 | 9h26m | 3 tasks | 3 files |
| Phase 01-osnova-proekta P01-07 | 11 | 2 tasks | 2 files |
| Phase 02 P01 | 18 | 2 tasks | 4 files |
| Phase 02 P02 | 10 | 2 tasks | 1 files |
| Phase 02-vizualnaya-sistema P03 | 14 | 2 tasks | 14 files |
| Phase 02-vizualnaya-sistema P04 | 10 | 3 tasks | 13 files |
| Phase 02-vizualnaya-sistema P05 | 15 | 2 tasks | 2 files |
| Phase 02-vizualnaya-sistema P06 | 8h 48m | 2 tasks | 5 files |

## Accumulated Context

### Decisions

Все 9 решений ADR — proposed (не locked), зафиксированы в PROJECT.md Key Decisions. Платформа Astro (static SSG + islands) — locked через вводные данные пользователя.

- [Phase 1]: Проверить покрытие конструкций Astro в Stacki (spike) до начала визуальной сборки
- [Phase 4]: Вердикт прототипа Three.js (Integrate / Move to Lab / Discard) определяет объём Phase 5
- [Весь проект]: Порядок анимаций CSS → vanilla JS → View Transitions → island; GSAP/FLIP — только для центрального перехода «список → кейс»
- [Phase 01]: [01-01 T1] Мажор Astro: astro@^7.1.6 (вариант astro-7, рекомендация исследования). Основание: npm dist-tags.latest = 7.1.6, официальные docs подтверждают v7, @astrojs/mdx@^7 peer-привязан к astro ^7. AC R6 "astro ^5" скорректирован на фактический мажор — техническая корректировка, не изменение требования. Research: 01-RESEARCH.md Open Question 1. Потребитель: план 01-03 (npm install, engines.node >= 22.12).
- [Phase 01]: [01-01 T2] Черновой site URL: https://portfolio.example.com (вариант site-draft) для `site` в astro.config.mjs — обязателен для sitemap и canonical/og:url; заменяется на реальный домен в фазе 6. Research: 01-RESEARCH.md Open Question 4, Pitfall 4. Потребитель: план 01-03.
- [Phase 01]: [01-01 T3] GitHub-репозиторий: portfolio-ivan-shivarshinov, видимость public (вариант repo-public). Следствие: docs/ (PRD, стратегия позиционирования) станут публичными — принято пользователем явно. gh CLI авторизован (Ivan-Shivarshinov, scopes repo+workflow). Research: 01-RESEARCH.md Open Question 5, Environment Availability. Потребитель: план 01-07 (создание remote).
- [Phase 01]: [01-01 T4] AC R4: проверки и robots.txt ориентируются на sitemap-index.xml (вариант sitemap-index) — фактический вывод @astrojs/sitemap 3.x (sitemap-index.xml + sitemap-0.xml, сплит по entryLimit 45000; файла sitemap.xml нет). Требование R4 не изменено: sitemap генерируется и содержит все 5 маршрутов. Research: 01-RESEARCH.md Open Question 3, Pitfall 3. Потребители: планы 01-02 (check-seo.mjs), 01-05 (robots.txt).
- [Phase 01]: [01-02 T1] verify-preview.mjs спавнит `npx --no-install astro preview` — честный fail-fast при отсутствии установленных зависимостей вместо недетерминированного интерактивного промпта npx в non-TTY. Потребитель: план 01-03 (прогон `--routes /`).
- [Phase 01]: [01-02 T1] Windows-спавн .cmd-шимов (npx/npm) через `cmd.exe /d /s /c` + windowsVerbatimArguments: прямой `spawn('npx.cmd')` на Node 24 (win32) бросает EINVAL. Применено: verify-preview.mjs, check-collections.mjs (runBuild).
- [Phase 01]: [01-02 T2] check-spike-doc.mjs задаёт контракт ключевых слов для docs/stacki-coverage.md (edge 1 — «одновременн», edge 2 — «0 запис»/«пустая коллекц»; строка пункта обязана содержать вердикт «проверено/ограничение»). Потребитель: план 01-06 (пишет документ под этот контракт).
- [Phase 01]: [01-02 T2] Фикстуры check-collections.mjs схемо-совместимы со схемами 01-04 (projects: полный frontmatter; notes: без title; services: {id,title,description}) — негативные тесты падают по задуманной причине (DuplicateContentEntrySlugError / zod required / duplicate id). Потребитель: план 01-04.
- [Phase 01]: [01-03 T1] eslint-plugin-jsx-a11y не установлен: peer-диапазон ^3-^9 несовместим с eslint@^10 (требование eslint-plugin-astro@3); jsx-a11y — опциональный peer (peerDependenciesMeta.optional), RESEARCH: «в фазе 1 не включать агрессивно». Потребитель: фаза 2+ при включении a11y-правил.
- [Phase 01]: [01-03 T2] Источник шрифтов — upstream-репозитории фаундри (floriankarsten/space-grotesk, JetBrains/JetBrainsMono): google/fonts GitHub больше не содержит WOFF2 (только вариативные TTF, подтверждено GitHub API). Все 3 файла валидны (wOF2). Потребители: фазы 2-3 (визуальная система).
- [Phase 01]: [01-03 T2] space-grotesk-600.woff2 — вариативный SpaceGrotesk[wght].woff2: статичного SemiBold 600 нет ни в одном официальном источнике; инстанс 600 выбирается декларацией font-weight в @font-face (CSS Fonts 4).
- [Phase 01]: [01-03 FIX] Замена Space Grotesk на Manrope + Unbounded (решение пользователя 2026-08-02, отменяет D-03 от 2026-08-01). Почему: у Space Grotesk НЕТ кириллицы — официальные метаданные Google Fonts: subsets latin/latin-ext/vietnamese, 0 cyrillic; сайт русскоязычный (D-08), весь кириллический текст падал на системные шрифты (Segoe UI). Что: Manrope 400–800 variable (body, --font-sans) + Unbounded 400–900 variable (display/headings, новый токен --font-display); локальные WOFF2-подмножества latin/latin-ext/cyrillic/cyrillic-ext (8 файлов, источники fonts.gstatic.com); JetBrains Mono не тронут (полная кириллица подтверждена fontTools cmap: А, я, Ё, ё, №). Проверка: fontTools cmap на новых файлах — кириллица А-я/Ё/ё/№ присутствует. Потребитель: фазы 2-3 (визуальная система, типографика).
- [Phase 01]: [01-03 T3] check-prohibitions.mjs: точное совпадение для одиночных имён denylist + namespace-префиксы (@tailwindcss/, @unocss/, @angular/) — похожие имена (vuepress, react-test-renderer) не дают ложных срабатываний; пограничная фикстура в self-test. Потребитель: 01-07 (CI).
- [Phase 01]: [01-04 T1] Дубликат slug/id обязан падать сборку (AC R3): в Astro 7.1.6 дефолтные glob()/file() только предупреждают (logger.warn + перезапись) — добавлены generateId для projects и strict-json-loader вместо file() (опровергнута RESEARCH A5). Потребители: фазы 2-3 (целостность коллекций).
- [Phase 01]: [01-05 T1] Аудит sitemap в check-seo.mjs следует цепочке sitemap-index.xml → дочерние sitemap-файлы (sitemap-0.xml): индекс — sitemapindex без <url>, маршруты лежат в urlset-детях (Pitfall 3, формат @astrojs/sitemap 3.x). Потребители: фазы 2-3 (обновление EXPECTED_PAGES при добавлении страниц).
- [Phase ?]: Stacki v0.1.3: компоненты, props, scoped styles, JSON-коллекции, frontmatter отображаются визуально; CSS-переменные и View Transitions — только кодовый режим; пустые коллекции скрыты; у компонентов без variants секции вариантов нет, но в списке вариантов BaseLayout присутствует запись «baselayout» (сам лейаут — интерпретация требует осторожности)
- [Phase ?]: Scoped-стиль активной навигации (nav a[aria-current='page'] { color: var(--color-accent) }) в BaseLayout.astro сохранён: UI-SPEC резервирует accent под active nav state и :focus-visible ring в фазе 1 — эталонная реализация краевого случая 1 чек-листа
- [Phase ?]: Правка Stacki в src/pages/index.astro (переформатирование) откачена: строка 271 симв. против printWidth 80 prettier — нарушение контракта форматирования проекта (T-01-06)
- [Phase ?]: 01-07 T1: GitHub-remote создан как public (portfolio-ivan-shivarshinov) по решению 01-01 T3; первый push из main зелёный на GitHub Actions (lint -> check -> build)
- [Phase ?]: 01-07 T2: CI workflow использует node-version 22 (LTS) + cache npm; engines.node >= 22.22.3 подтверждены зелёным прогоном на Node 22
- [Phase ?]: 02-01 T1: W1-маршрут вычисляется относительно dist/, а не корня проекта (иначе routeForFile даёт dist/index.html вместо /)
- [Phase ?]: 02-01 T1: grep-контроль использования компонентов пропускается с предупреждением при отсутствии файлов в src/pages|src/layouts (guard-паттерн как для dist)
- [Phase ?]: 02-01 T2: check-theme не включён в verify-цепочку — требует собранного ProjectCard и дублирует astro check; реальный прогон в 02-04 Task 2
- [Phase ?]: 02-02: Принята палитра проектов (вариант palette-research, D-07/D-08): clay #8A5A44, olive #6B6B3F, slate #55606E, plum #6E4A5C; терракота #A84B32 — системный accent (locked, не переопределяется); enum-имена terracotta/clay/olive/slate/plum не пересматриваются (costly-контракт D-07, схема projects фазы 3). Потребитель: 02-03 Task 1 — значения --project-* в tokens.css; контраст ≥ 4.5:1 на bg/surface проверяется check-contrast (02-03).
- [Phase ?]: 02-02: Первый экран (index.astro) — дефолт D-12 «контрактная типографика» (вариант hero-default; Figma MCP в сессии планирования недоступен — RESEARCH A2, пользователь не передал ссылки/скриншоты): моно-метка «01 / HOME» + имя (Unbounded display) + primary CTA Button «Смотреть работы» (D-13-минимум). Фиксируется в docs/hero-concept.md (02-05 Task 2) с обоснованием по критериям D-14; задел под фазу 3 без перекомпоновки (D-12). Потребитель: 02-05 Task 2 (docs/hero-concept.md), 02-03 Task 1 (рендер дефолта на главной).
- [Phase ?]: 02-03 T1: Nav рендерит имя-ссылку и меню (D-02): на <768px имя и навигация — колонкой, на ≥768px — одна строка space-between; гарантирует отсутствие горизонтального скролла на 320px (UI-SPEC overflow nav)
- [Phase ?]: 02-03 T1: check-tokens VAR_DEF_RE дополнен lookbehind (?<![\w.-]) — исключение BEM-модификаторов .class--mod: из правила «единый файл токенов» (Rule 1, ложные срабатывания на .button--primary:hover)
- [Phase ?]: 02-03 T1: sectionLabel Footer выводится из pageLabel (split(' ').at(-1)) — единый источник Latin-метки раздела без дублирования
- [Phase ?]: 02-03 T1: Footer держит собственный контейнер (max-width + gutter-токены + media 768px) — компонент сам отвечает за свою сетку (ADR §5.4)
- [Phase ?]: [02-04 T1] Кавычки frontmatter в новых .astro — одинарные (repo-конвенция Nav/Button/IconArrowRight); prettier --write на .astro не применяется: prettier --check падает на всех существующих файлах, CI его не запускает (только eslint+check+build)
- [Phase ?]: [02-04 T2] ProjectCard: добавлена обёртка .card__body (title+meta+footer) — CSS плана для split («текстовая часть — flex: 1») требует контейнера текстовой части; без обёртки flex-row split разложил бы 4 дочерних элемента в 4 колонки
- [Phase ?]: [02-04 T2] ACCENTS в ProjectCard с кавыченными ключами ('terracotta': ...) — verify-строка плана проверяет буквально «'terracotta': 'var(--color-accent)'»; значения идентичны маппингу Tag (семантически тот же контракт, оформление ключей разное)
- [Phase ?]: [02-05 T1] SYSTEM DEMO на work.astro — детерминированный fallback-узел grep-контроля использования (UI-SPEC Page structure); фикстурные карточки с маркером // fixture: replaced in phase 3 (AC#7)
- [Phase ?]: [02-05 T2] hero-default (D-12) зафиксирован в docs/hero-concept.md: index.astro не изменяется (hero-shell 02-03 = D-13-минимум), обоснование по D-14, статус макета по D-15
- [Phase ?]: [02-06 T2 FIX] Классы в атрибутах Astro — шаблонные литералы class={`button button--${variant}`}: Astro 7.1.6/@astrojs/compiler 2.13.1 НЕ интерполирует {expr} внутри кавычек строкового атрибута (class="button button--{variant}" рендерится буквально — CTA без стиля кнопки, дефект визуального прохода 02-06). Форма шаблонного литерала интерполируется — закреплена как конвенция
- [Phase ?]: [02-06 T2 FIX] Регрессионное правило 10 в check-tokens.mjs: запрет голых {expr} в кавычках атрибутов .astro-шаблонов src/ (regex name="...{...}"); frontmatter исключается; self-test фикстуры bad-attr FAIL / ok-attr PASS — quirk компилятора не вернётся без красного verify
- [Phase ?]: [02-06 Task 2] Протокол финального гейта фиксирует полную историю визуального прохода (дефект → root cause → фикс → повторная верификация → re-approval) в 02-VERIFICATION.md — честный вход для /gsd-verify-work (паттерн 01-VERIFICATION.md)

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Scope | Lab Three.js-эксперимент (вторичная сцена, LAB-01) | v2 | 2026-07-31 |
| Scope | Собственная motion-библиотека (LAB-02) | v2 | 2026-07-31 |
| Scope | Полировка сцены: шейдеры, видео-текстуры (LAB-03) | v2 | 2026-07-31 |
| Scope | Мобильная WebGL-версия сцены (LAB-04) | v2 | 2026-07-31 |

## Session Continuity

Last session: 2026-08-03T14:51:31.605Z
Stopped at: Phase 3 UI-SPEC approved
Resume file: .planning/phases/03-kontent-i-stranicy/03-UI-SPEC.md
