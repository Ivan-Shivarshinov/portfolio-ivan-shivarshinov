---
phase: 02-vizualnaya-sistema
plan: 03
subsystem: ui
tags: [tokens, astro, components, nav, footer, button, link, wcag, reduced-motion, hero]

# Dependency graph
requires:
  - phase: 02-vizualnaya-sistema
    provides: 02-01 — расширенный check-tokens.mjs (bp-группа, медиа-сверка, transition-grep, W1-ассерт, grep-контроль использования) + check-contrast.mjs (20 пар)
  - phase: 02-vizualnaya-sistema
    provides: 02-02 — решение палитры проектов (clay #8A5A44, olive #6B6B3F, slate #55606E, plum #6E4A5C; терракота = системный accent) и дефолт первого экрана D-12/D-13
  - phase: 01-osnova-proekta
    provides: tokens.css (5 групп), global.css (@font-face, :focus-visible), BaseLayout с W1-нормализацией pathname, Seo.astro (форма компонента), 5 страниц-заглушек
provides:
  - tokens.css расширен до 6 групп: bp-группа (--bp-md 768px, --bp-lg 1200px), --color-line, 4 --project-* (D-07), --text-lead/--text-caption, fluid --text-display clamp(28px, 5vw, 40px), --ease-enter/--ease-exit
  - global.css: prefers-reduced-motion kill-switch (длительности 0ms, состояния остаются)
  - Компоненты оболочки: Nav (моно-индексы 01-05, русские метки, W1, адаптив <768px), Footer (моно-строка + Latin-метка), Button (primary/secondary, md/lg), Link (default/muted), IconArrowRight
  - BaseLayout: Nav/Footer вместо inline-разметки, моно-метка страницы (D-05), контейнер R6 (gutter 24→48 на ≥768px)
  - index: hero-shell D-13 (метка «01 / HOME», имя Unbounded display, primary CTA «Смотреть работы» + IconArrowRight)
  - work/lab/about/contact: метки «02 / WORK»…«05 / CONTACT» + empty-state D-04 (моно-подпись «… — раздел в разработке» + Link «На главную»)
  - W1 зелёный на всех 5 dist-страницах; check-contrast 20/20 пар ≥ 4.5:1; 0 <script> в dist
affects: [02-04 (SectionHeading/ProjectCard/Media/Tag — известный red grep-контроля использования до 02-05), 02-05 (grep-контроль использования зелёный, страничные композиции), 02-06 (визуальный проход оболочки), фаза 3 (контент в empty-states, hero-текст)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Оболочка как вертикальный срез: один путь tokens → global → компоненты → layout → страница → build → dist-ассерты (tracer-план)"
    - "BEM-модификаторы (.button--primary) не конфликтуют с проверкой «единый файл токенов» — lookbehind (?<![\w.-]) в VAR_DEF_RE"
    - "Адаптивность внутри компонента: min-width 768px = значению --bp-md (сверка check-tokens); «Главная» скрыта <768px (имя в header несёт маршрут /)"
    - "Icon-контракт D-11: grid 24, stroke 2, currentColor, vector-effect non-scaling-stroke, aria-hidden, геометрический path"

key-files:
  created:
    - src/components/Nav.astro
    - src/components/Footer.astro
    - src/components/Button.astro
    - src/components/Link.astro
    - src/components/IconArrowRight.astro
  modified:
    - src/styles/tokens.css
    - src/styles/global.css
    - src/layouts/BaseLayout.astro
    - src/pages/index.astro
    - src/pages/work.astro
    - src/pages/lab.astro
    - src/pages/about.astro
    - src/pages/contact.astro
    - scripts/check-tokens.mjs

key-decisions:
  - "[02-03 T1] Nav рендерит и имя-ссылку, и меню (D-02): на <768px имя и навигация — колонкой (имя над строкой пунктов), на ≥768px — одна строка space-between; это гарантирует отсутствие горизонтального скролла на 320px при полном наборе из 5 пунктов"
  - "[02-03 T1] check-tokens VAR_DEF_RE дополнен lookbehind (?<![\w.-]) — исключение BEM-модификаторов .class--mod: из правила «единый файл токенов» (Rule 1)"
  - "[02-03 T1] Разделители Nav — ::before у соседних пунктов (1px, var(--color-line)), включая первый пункт; скрыты на мобильном состоянии"
  - "[02-03 T1] sectionLabel Footer = последний сегмент pageLabel («01 / HOME» → 'HOME') — единый источник метки, без дублирования"
  - "[02-03 T1] Footer контейнер внутри компонента (max-width + gutter-токены + media 768px) — компонент сам отвечает за свою сетку (ADR §5.4)"

patterns-established:
  - "Empty-state D-04: рамка 1px var(--color-line) + padding var(--space-lg) + моно-подпись + Link «На главную» — воспроизводится на всех 4 страницах, замена в фазе 3"
  - "Слот Button несёт и текст, и иконку (<Button>Смотреть работы<IconArrowRight /></Button>) — плоская композиция D-04"
  - "Hero-shell D-13: метка → имя (Unbounded display clamp) → primary CTA — единственное место первичного действия"
  - "known-red контракт: check-tokens по src падает только на grep-контроле использования SectionHeading/ProjectCard/Media/Tag до 02-05 — документируется в SUMMARY каждого плана"

requirements-completed: [REQ-design-implications, R1, R2, R3, R4, R6]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Оболочка системы end-to-end (tracer): tokens.css расширен до 6 групп (bp, --color-line, 4 --project-* по решению 02-02, lead/caption, fluid display, ease-enter/exit; роли не переименованы), global.css kill-switch reduced-motion (0ms длительности), компоненты Nav/Footer/Button/IconArrowRight, BaseLayout с <Nav />/<Footer />/меткой страницы и контейнером R6, index hero-shell D-13 (имя Unbounded + primary CTA); build exit 0, preview 200, W1 ровно один aria-current на 5 dist-страниц, 0 <script>, grep-правила зелёные"
    requirement: R2
    verification:
      - kind: e2e
        ref: "npm run build"
        status: pass
      - kind: e2e
        ref: "node scripts/verify-preview.mjs --routes /"
        status: pass
      - kind: integration
        ref: "node scripts/check-contrast.mjs (20 пар ≥ 4.5:1)"
        status: pass
      - kind: integration
        ref: "W1 spot-check: ровно 1 aria-current=\"page\" на dist/index, work, lab, about, contact"
        status: pass
      - kind: integration
        ref: "grep 'prefers-reduced-motion: reduce' / '--bp-md: 768px' / 'clamp(28px, 5vw, 40px)' / 'aria-hidden'"
        status: pass
    human_judgment: false
  - id: D2
    description: "Link.astro (default/muted, hover accent + underline offset 2px) + оболочка 4 страниц work/lab/about/contact: метки «02 / WORK»…«05 / CONTACT» (D-05) и empty-state D-04 (рамка 1px var(--color-line), моно-подпись «WORK/LAB/ABOUT/CONTACT — раздел в разработке», Link «На главную»); build exit 0, preview 200 на 5 маршрутах, dist-спот-проверка подписей, 0 <script>"
    requirement: R4
    verification:
      - kind: e2e
        ref: "npm run build"
        status: pass
      - kind: e2e
        ref: "node scripts/verify-preview.mjs (5 маршрутов)"
        status: pass
      - kind: integration
        ref: "dist spot-check: подписи разделов + «На главную» + «01 / HOME» + «Смотреть работы»"
        status: pass
      - kind: integration
        ref: "grep '<script' dist/ → 0 совпадений"
        status: pass
    human_judgment: false

# Metrics
duration: 14min
completed: 2026-08-02
status: complete
---

# Phase 02, Plan 03: Оболочка визуальной системы end-to-end (tracer) Summary

**Оболочка «Calm Interface, Active Work» одним вертикальным срезом: tokens.css расширен до 6 групп (bp, --color-line, 4 проектных акцента по решению 02-02, lead/caption, fluid display, easing-набор), kill-switch reduced-motion в global.css, компоненты Nav/Footer/Button/Link/IconArrowRight, BaseLayout с моно-меткой страницы, hero-shell «01 / HOME» на index и empty-state оболочка на work/lab/about/contact — build exit 0, preview 200 на 5 маршрутах, W1 зелёный, контраст 20/20 пар ≥ 4.5:1**

## Performance

- **Duration:** 14 min
- **Started:** 2026-08-02T21:08:00Z
- **Completed:** 2026-08-02T21:22:07Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- tokens.css расширен без переименования ролей: color-группа дополнена `--color-line: #DAD9D3` и блоком проектных цветов (clay #8A5A44, olive #6B6B3F, slate #55606E, plum #6E4A5C — ровно решение 02-02, D-07; терракота = `var(--color-accent)`, отдельный токен не создавался); typography — `--text-lead: 18px`, `--text-caption: 12px`, `--text-display` заменён на `clamp(28px, 5vw, 40px)`; motion — `--ease-enter`/`--ease-exit`; новая группа `/* bp */` (`--bp-md: 768px`, `--bp-lg: 1200px`) — итого 6 групп по контракту check-tokens
- global.css: kill-switch `@media (prefers-reduced-motion: reduce)` после `:focus-visible` — обнуляются только `transition-duration`/`animation-duration`/`animation-iteration-count` (0ms !important), состояния остаются мгновенно применимыми (Pitfall 5)
- Nav.astro: ROUTES из 5 записей {href, label, short, index}, pathname-нормализация W1 (`replace(/\/+$/, '') || '/'`), ровно один `aria-current='page'`; моно-слой 14px; <768px — без индексов/разделителей, «Главная» скрыта (имя в header — ссылка на /), «Лаборатория»→«Лаб», одна строка, gap `--space-sm`, hit area ≥44px (`padding-block: var(--space-md)`); ≥768px — индексы, разделители 1px `var(--color-line)`, полные лейблы; активный пункт — accent для индекса и лейбла (D-01)
- Footer.astro: `sectionLabel` проп, одна моно-строка 12px «© 2026 · Иван Шиваршинов» + Latin-метка раздела, `border-top: 1px solid var(--color-line)`, отступы только токены; ссылок/колонок нет (D-03)
- Button.astro: variant primary/secondary + density md/lg с дефолтами, слот для иконки; primary hover — `color-mix(in oklab, var(--color-accent), var(--color-ink) 8%)`, active — `translate: 0 1px` (compositor-only); secondary — прозрачный + рамка `var(--color-line)`, hover — рамка ink + текст accent; переходы — только `var(--motion-fast)` + `var(--ease-standard)`
- Link.astro: variant default/muted; покой нейтрален (ink/ink-muted), hover/focus — accent + underline с `text-underline-offset: 2px`; внешние ссылки не зашиваются в компонент (решает caller)
- IconArrowRight.astro: grid 24, stroke 2, `vector-effect="non-scaling-stroke"`, `aria-hidden="true"`, геометрический path (горизонтальный отрезок + ломаная с квадратным углом, язык D-11); без `<style>`
- BaseLayout.astro: `<Nav />` + `<Footer sectionLabel={pageLabel?.split(' ').at(-1)} />` вместо inline-разметки; `pageLabel?` проп → моно-метка `.page-label` над `<slot />` (D-05); контейнер оболочки `max-width: var(--container-max)` + `padding-inline: var(--gutter-mobile)` → `var(--gutter-desktop)` на `@media (min-width: 768px)` (R6); старый scoped-стиль nav удалён (переехал в Nav.astro)
- index.astro: hero-shell D-13 — `pageLabel="01 / HOME"`, `<h1 class="hero__name">Иван Шиваршинов</h1>` (Unbounded, `var(--text-display)`, 600, line-height 1.2), `<Button href="/work" density="lg">Смотреть работы<IconArrowRight /></Button>`; текста формулы обещания нет (фаза 3, REQ-main-promise)
- work/lab/about/contact: метки «02 / WORK»…«05 / CONTACT» + empty-state D-04: рамка 1px `var(--color-line)`, padding `var(--space-lg)`, моно-подпись «WORK/LAB/ABOUT/CONTACT — раздел в разработке» + `<Link href="/">На главную</Link>`; реальный контент не добавлен
- Верификация: `npm run build` exit 0; check-contrast 20/20 пар ≥ 4.5:1; preview 200 + text/html на 5 маршрутах; W1 — ровно один `aria-current="page"` на каждой из 5 dist-страниц; 0 тегов `<script>` в dist; все grep-правила зелёные
- **known-red до 02-05:** полный аудит check-tokens по src возвращает только 4 нарушения grep-контроля использования — SectionHeading/ProjectCard/Media/Tag не импортированы (появляются на страницах в 02-04/02-05); остальные правила (единый файл токенов, группы, обязательные токены, media-сверка, transition-grep, W1, 0 `<script>`) зелёные

## Task Commits

Each task was committed atomically:

1. **Task 1: tracer — оболочка системы end-to-end на index (tokens → global → Nav/Footer/Button/IconArrowRight → BaseLayout → index → build → W1 → contrast)** - `39bb6e6` (feat)
2. **Task 2: Link.astro + оболочка страниц work/lab/about/contact (метки D-05 + empty-state D-04)** - `6795f62` (feat)

**Plan metadata:** `pending` (docs commit после state-обновлений)

## Files Created/Modified
- `src/styles/tokens.css` - 6 групп: +`--color-line`, +4 `--project-*` (решение 02-02), +`--text-lead`/`--text-caption`, `--text-display` → `clamp(28px, 5vw, 40px)`, +`--ease-enter`/`--ease-exit`, +группа `/* bp */` (768/1200); роли не переименованы
- `src/styles/global.css` - +kill-switch `@media (prefers-reduced-motion: reduce)` (0ms !important длительности; состояния остаются)
- `src/components/Nav.astro` - Новый: имя-ссылка + 5 пунктов {href, label, short, index}, W1-нормализация, aria-current на активный маршрут; компактное состояние <768px, десктоп ≥768px с индексами и разделителями
- `src/components/Footer.astro` - Новый: `sectionLabel` проп, моно-строка «© 2026 · Иван Шиваршинов» + Latin-метка, border-top 1px `var(--color-line)`
- `src/components/Button.astro` - Новый: variant/density enum-пропы, слот; color-mix hover, translate active; отступы только `var(--space-*)`
- `src/components/Link.astro` - Новый: variant default/muted, hover accent + underline (offset 2px), transition через motion-токены
- `src/components/IconArrowRight.astro` - Новый: svg 24 grid, stroke 2, currentColor, non-scaling-stroke, aria-hidden, геометрический path
- `src/layouts/BaseLayout.astro` - `<Nav />`/`<Footer />`, `pageLabel?` → моно-метка над слотом, контейнер R6 (gutter 24→48 на 768px)
- `src/pages/index.astro` - hero-shell D-13: метка «01 / HOME», имя Unbounded display, primary CTA с иконкой
- `src/pages/{work,lab,about,contact}.astro` - метки «02 / WORK»…«05 / CONTACT», empty-state D-04 с моно-подписью и Link «На главную»
- `scripts/check-tokens.mjs` - VAR_DEF_RE дополнен lookbehind `(?<![\w.-])` (Rule 1, см. Deviations)

## Decisions Made
- Nav рендерит и имя-ссылку, и меню (D-02): на <768px имя и навигация — колонкой (имя над строкой пунктов), на ≥768px — одна строка space-between; гарантирует отсутствие горизонтального скролла на 320px (UI-SPEC overflow nav, AC R10)
- Разделители Nav — `::before` у соседних пунктов (1px, `var(--color-line)`), скрыты на мобильном состоянии; первый пункт тоже с разделителем (контракт «тонкие разделители между пунктами»)
- `sectionLabel` Footer выводится из `pageLabel` (`split(' ').at(-1)`) — единый источник метки раздела без дублирования контента
- Footer держит собственный контейнер (max-width + gutter-токены + media 768px) — компонент сам отвечает за свою сетку (ADR §5.4); check-tokens media-сверка зелёная
- Иконка в CTA — прямой слот `<Button>Смотреть работы<IconArrowRight /></Button>` (плоская композиция D-04), без обёрток

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Ложное срабатывание check-tokens «нарушение единого файла токенов» на BEM-модификаторах**
- **Found during:** Task 1 (полный аудит check-tokens после build)
- **Issue:** VAR_DEF_RE (`/--[a-z0-9][a-z0-9-]*\s*:/i`) ловил классы-модификаторы `.button--primary:hover`, `.button--secondary:hover`, `.link--muted` как определение CSS-переменной (`--primary:`), хотя это BEM-классы — проверка «единый файл токенов» ложно падала на конвенции PATTERNS фазы 2 (`.button--primary`)
- **Fix:** добавлен lookbehind `(?<![\w.-])` — перед «--» не должно быть буквы/цифры/точки/дефиса; настоящие определения переменных в tokens.css (после пробела/новой строки) не затронуты
- **Files modified:** scripts/check-tokens.mjs
- **Verification:** `node scripts/check-tokens.mjs --self-test` exit 0 (все фикстуры классифицируются верно); полный аудит — ложные срабатывания исчезли
- **Committed in:** 39bb6e6 (Task 1 commit)

**2. [Rule 1 - Bug] Ложное срабатывание check-tokens «хардкод отступа» на слове «24px» в комментарии**
- **Found during:** Task 1 (полный аудит check-tokens после build)
- **Issue:** комментарий-описание IconArrowRight.astro содержал «сетка 24px» — SPACING_PX_RE (шкала 4|8|16|24|32|48|64px) ловил слово в комментарии как хардкод отступа
- **Fix:** комментарий переформулирован («сетка 24 единиц viewBox») — код не менялся, scale-литералы в коде отсутствуют
- **Files modified:** src/components/IconArrowRight.astro
- **Verification:** полный аудит check-tokens — нарушение исчезло
- **Committed in:** 39bb6e6 (Task 1 commit)

**Total deviations:** 2 auto-fixed (2 bugs — ложные срабатывания проверки на легитимном коде)
**Impact on plan:** Оба фикса необходимы, чтобы полный check-tokens (контракт verify-цепочки) не падал на корректном коде; логика проверок и все фикстуры сохранены. Расширения объёма нет.

## Issues Encountered
- Git Bash конвертирует аргумент `/` в Windows-путь (`C:/Program Files/Git/`) при запуске `node scripts/verify-preview.mjs --routes /` — решается `MSYS_NO_PATHCONV=1` (среда, не код; контракт скрипта не менялся)
- known-red: check-tokens по src возвращает 4 нарушения grep-контроля использования (SectionHeading/ProjectCard/Media/Tag) — плановое состояние до 02-05 (см. key_links плана), не дефект

## User Setup Required
None - внешние сервисы не задействованы.

## Next Phase Readiness
- Оболочка системы доказана end-to-end: все 5 страниц рендерят Nav (W1), метку D-05, Footer, контейнер R6; index — hero-shell D-13; 4 страницы — empty-state D-04
- Для 02-04: каркас компонентов (SectionHeading/ProjectCard/Media/Tag) строится на тех же токенах и паттернах; check-theme (02-04 Task 2) — реальный прогон negative-фикстуры против ProjectCard
- Для 02-05: grep-контроль использования компонентов закроется при композиции страниц; `npm run verify` полный зелёный после 02-05
- Для 02-06: визуальный проход оболочки (375/768/1200, reduced-motion) на собранной системе
- Известные ограничения: реальные страницы пока пусты по контракту (D-04) — контент фазы 3; hero-текст формулы обещания — фаза 3 (REQ-main-promise)

## Self-Check: PASSED

- Файлы: src/styles/tokens.css, src/styles/global.css, src/components/{Nav,Footer,Button,Link,IconArrowRight}.astro, src/layouts/BaseLayout.astro, src/pages/{index,work,lab,about,contact}.astro, 02-03-SUMMARY.md — все существуют
- Коммиты: 39bb6e6 (Task 1), 6795f62 (Task 2) — оба в истории git
- Верификация: build exit 0 (после обоих тасков), check-contrast 20/20, preview 200 на 5 маршрутах, W1 на 5 dist-страницах, 0 `<script>` в dist

---
*Phase: 02-vizualnaya-sistema*
*Completed: 2026-08-02*
