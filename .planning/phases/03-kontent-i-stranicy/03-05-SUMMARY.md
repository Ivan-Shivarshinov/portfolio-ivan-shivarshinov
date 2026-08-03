---
phase: 03-kontent-i-stranicy
plan: 05
subsystem: content
tags: [astro, content-pages, about, lab, hero-formula, featured-works, check-visual, playwright]

# Dependency graph
requires:
  - phase: 03-kontent-i-stranicy
    provides: "03-03: ProjectCard с summary/href, первый кейс skala (featured, order, cover), паттерн карточек work.astro; 03-04: контакты из единого источника — футер-ссылка GitHub (цель hover), кнопка копирования на /contact (состояния, aria-live)"
provides:
  - "/about: 4 блока PROFILE / AUDIENCES (4 ситуации клиента) / CAPABILITIES (Build/Improve/Extend) / TRAJECTORY (3 ступени) — тексты утверждены пользователем (D-04)"
  - "/lab: 2 блока DIRECTIONS / PROCESS + честный статус «Эксперименты в работе — появятся в следующих релизах» (R6) — утверждены пользователем"
  - "/: формула обещания дословно (D-13, композиция 03-UI-SPEC Q5: имя → Lead → моно → Body → категория → подпись → CTA последним) + секция «Избранные работы» (featured-фильтр + sort по order, 3 колонки ≥768px, ссылки /work/{slug}/)"
  - "check-visual.mjs: hover футер-ссылки (смена цвета, без underline), маршрут первого кейса в скролл-проверке (минимальный order; пустая коллекция — skip), Шаг 5 «копирование email» (state machine кнопки)"
affects: [03-06, 02-UI-SPEC consumers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hero-композиция Q5: имя (display) → формула обещания (группа с ритмом --space-md: Lead 18px → моно Label → Body ink-muted ×2 → моно подпись Caption) → CTA последним (ритм секции --space-lg)"
    - "Featured-секция: SectionHeading meta='SELECTED WORK' + проекции карточек work.astro (ProjectCard + Media/Image 4:3 + Tags stack.slice(0,3)); grid 3 колонки ≥768px (--bp-md)"
    - "check-visual: маршрут первого кейса читается из frontmatter коллекции (минимальный order) — единая сортировка Pitfall 10 переносится в проверку; пустая коллекция → warning + skip (совместимость с фазой 2)"
    - "Проверка копирования email = state machine, не результат clipboard: headless clipboard может быть недоступен — важен факт смены статуса (idle → copied/error)"
    - "Контракт футер-ссылок: hover = смена цвета ink-muted → ink; underline — контракт Link-компонента, не футера (логика checkLinkHoverLogic обновлена)"

key-files:
  created: []
  modified: [src/pages/about.astro, src/pages/lab.astro, src/pages/index.astro, scripts/check-visual.mjs]

key-decisions:
  - "Тексты /about и /lab утверждены пользователем 2026-08-03 (D-04, чекпоинт Task 2, ответ «Тексты утверждены») — коммит без правок формулировок"
  - "Формула обещания на / — дословно REQ-main-promise (D-13): Lead «Создаю и развиваю…» → моно «Product-minded web developer.» → Body «Соединяю Webflow…» → категория → подпись; CTA «Смотреть работы» — последний элемент hero"
  - "SEO-пара главной сохранена как есть (title «…веб-разработчик с продуктовым подходом», description — формула): уникальная пара по check-seo"
  - "checkLinkHoverLogic: ok = изменился цвет (before.color !== after.color); требование underline убрано (футер-ссылки не подчёркиваются)"
  - "Шаг 5 check-visual проверяет срабатывание state machine кнопки копирования («Копировать» → иное значение), а не успех clipboard — headless-окружение может не дать clipboard"

patterns-established:
  - "Pattern: контентные страницы (about/lab/index) — BaseLayout + плоский список self-closing компонентов + scoped стили только var()-токены; ритм секций --space-2xl; проза — prose-контракт (16px/1.5, ~65ch, слева)"
  - "Pattern: check-visual self-test покрывает чистые функции с фикстурами из временных каталогов (mkdtempSync), как check-seo"

requirements-completed: [REQ-positioning-category, REQ-main-promise, REQ-audience, REQ-competency-architecture, REQ-tone, REQ-growth-trajectory]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "/about с 4 блоками (PROFILE/AUDIENCES/CAPABILITIES Build-Improve-Extend/TRAJECTORY 3 ступени) и /lab с 2 блоками (DIRECTIONS/PROCESS) + честной статусной строкой; тексты утверждены пользователем"
    requirement: REQ-audience
    verification:
      - kind: integration
        ref: "npm run build — exit 0 (6 страниц)"
        status: pass
      - kind: automated_ui
        ref: "grep dist/about/index.html: PROFILE/AUDIENCES/CAPABILITIES/TRAJECTORY; dist/lab/index.html: DIRECTIONS/PROCESS + статусная строка; .empty-state отсутствует"
        status: pass
      - kind: manual_procedural
        ref: "checkpoint Task 2 — пользователь: «Тексты утверждены» (2026-08-03)"
        status: pass
    human_judgment: true
    rationale: "Тексты — авторский контент: утверждение пользователем обязано быть (D-04, checkpoint Task 2); автоматика подтверждает сборку и меты-ассерты, но не формулировки"
  - id: D2
    description: "/ с формулой обещания (дословно D-13, композиция Q5, CTA последним) и секцией «Избранные работы» (featured-фильтр, sort по order, карточки → /work/{slug}/)"
    requirement: REQ-main-promise
    verification:
      - kind: integration
        ref: "npm run build — exit 0 (6 страниц)"
        status: pass
      - kind: automated_ui
        ref: "dist/index.html: 5 текстов формулы присутствуют, порядок имя → формула → CTA, SELECTED WORK → Избранные работы, href=/work/skala/ (проверка позиций в собранном HTML)"
        status: pass
      - kind: integration
        ref: "node scripts/check-seo.mjs — exit 0 (6 уникальных пар)"
        status: pass
    human_judgment: false
  - id: D3
    description: "check-visual.mjs адаптирован: hover футер-ссылки (смена цвета), маршрут первого кейса в скролл-проверке (skip при пустой коллекции), Шаг 5 копирование email на /contact"
    verification:
      - kind: integration
        ref: "node scripts/check-visual.mjs --self-test — exit 0 (8 PASS, включая новые ассерты)"
        status: pass
      - kind: automated_ui
        ref: "node scripts/check-visual.mjs — полный браузерный прогон exit 0: 14 скролл-проверок (вкл. /work/skala/ @320/@1200), hover футер-ссылки (смена цвета), reduced-motion 0s, копирование «Копировать» → «Скопировано»"
        status: pass
    human_judgment: false

# Metrics
duration: 6min
completed: 2026-08-03
status: complete
---

# Phase 03 Plan 05: Контентные страницы и формула обещания Summary

**/about (4 блока) и /lab (2 блока + честный статус) с утверждёнными текстами, / с формулой обещания (дословно D-13, CTA последним) и секцией «Избранные работы»; check-visual адаптирован под новые страницы (hover футер-ссылки, маршрут кейса, копирование email)**

## Performance

- **Duration:** 6 min
- **Started:** 2026-08-03T21:35:00Z
- **Completed:** 2026-08-03T21:40:31Z
- **Tasks:** 3 (2 выполнены, 1 чекпоинт утверждения — решён пользователем)
- **Files modified:** 4

## Accomplishments
- /about и /lab: замена empty-state на контентные блоки по UI-SPEC R5/R6 — 4 блока (PROFILE/AUDIENCES/CAPABILITIES/TRAJECTORY) и 2 блока (DIRECTIONS/PROCESS) + честная статусная строка; тексты утверждены пользователем (D-04, чекпоинт Task 2)
- /: формула обещания дословно (D-13) по композиции Q5 — Lead → моно-слой → Body → категория → подпись → CTA «Смотреть работы» последним; ниже — секция «Избранные работы» (SELECTED WORK, featured-фильтр + sort по order, 3 колонки ≥768px, карточки → /work/{slug}/)
- check-visual.mjs: hover-цель → футер-ссылка GitHub на /lab (логика — смена цвета, underline убран), маршрут первого кейса в скролл-проверке (минимальный order из frontmatter projects; пустая коллекция — skip), новый Шаг 5 «копирование email» на /contact (смена статуса «Копировать» → «Скопировано»); self-test расширен (8 ассертов)
- Верификация: build exit 0 (6 страниц), check-visual self-test exit 0, полный браузерный прогон check-visual exit 0 (все 5 шагов PASS), check-seo exit 0 (6 уникальных пар), check-tokens exit 0, check-prohibitions exit 0

## Task Commits

Each task was committed atomically:

1. **Task 1: /about и /lab — черновики контента по UI-SPEC** - `4b23ca5` (feat) — коммит после утверждения пользователем (Task 2)
2. **Task 3: / — формула обещания (D-13) + «Избранные работы»; обновление check-visual.mjs** - `4d0ede9` (feat)

**Plan metadata:** `f27002c` (docs: create phase plan) — план; финальный docs-коммит SUMMARY см. ниже

_Note: Task 2 — чекпоинт утверждения текстов (без кода, решён в чате: «Тексты утверждены»)_

## Files Created/Modified
- `src/pages/about.astro` - 4 блока: PROFILE (путь и границы), AUDIENCES (4 ситуации клиента + типы команд), CAPABILITIES (Build/Improve/Extend — иерархия, без списка инструментов), TRAJECTORY (3 ступени дословно); prose-контракт, ритм --space-2xl
- `src/pages/lab.astro` - 2 блока: DIRECTIONS (AI-воркфлоу/автоматизации/внутренние инструменты) + PROCESS (гипотеза → прототип → решение) + статусная строка (моно, caption, muted); без карточек и ссылок на несуществующие эксперименты
- `src/pages/index.astro` - hero: имя + формула (Q5, дословно D-13, CTA последним); секция «Избранные работы»: SectionHeading SELECTED WORK + grid featured (1→3 колонки ≥768px), карточки по паттерну work.astro
- `scripts/check-visual.mjs` - Шаг 1: маршрут первого кейса (getFirstCaseRoute — минимальный order из frontmatter, skip при пустой коллекции); Шаг 3/4: цель — футер-ссылка /github/i на /lab, логика смены цвета; Шаг 5: копирование email на /contact (state machine); self-test: обновлённый assert hover + ассерты маршрута кейса (пусто → skip, минимальный order → маршрут)

## Decisions Made
- Тексты /about и /lab утверждены пользователем дословно (D-04) — правок не вносилось
- Формула на / — только дословные тексты D-13 (без префиксов/подписей к категории), композиция и роли по UI-SPEC Q5; CTA — последний элемент hero
- SEO-пара главной оставлена (title + description-формула) — уникальная пара сохранена (check-seo 6 пар)
- checkLinkHoverLogic: только смена цвета (underline — контракт Link-компонента, не футер-ссылок)
- Шаг 5 проверяет факт срабатывания state machine, а не успех clipboard (headless-ограничение)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `npm run check-prohibitions` не существует как npm-скрипт (в verify-цепочке скрипт вызывается напрямую: `node scripts/check-prohibitions.mjs`) — выполнен напрямую, exit 0; не является дефектом плана

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- /about, /lab, / с реальным контентом утверждены; /work и /contact готовы (03-03/03-04)
- check-visual покрывает все страницы (включая маршрут кейса и копирование); полный браузерный прогон зелёный
- Готово к финальному гейту 03-06: check-tone real-run (денлист + позитивные ассерты: формула, меты, статусная строка), полный `npm run verify`, визуальный проход человека

---
*Phase: 03-kontent-i-stranicy*
*Completed: 2026-08-03*
