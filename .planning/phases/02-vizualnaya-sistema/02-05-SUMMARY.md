---
phase: 02-vizualnaya-sistema
plan: 05
subsystem: ui
tags: [astro, pages, project-card, media, tag, system-demo, hero-decision, docs, tokens]

# Dependency graph
requires:
  - phase: 02-vizualnaya-sistema
    provides: 02-04 — SectionHeading.astro (meta/title/layout split), ProjectCard.astro (theme-контракт R5, слоты media/дефолтный, showMetrics/layout), Media.astro (ratio/caption, пустая рамка edge R7), Tag.astro (theme/размеры)
  - phase: 02-vizualnaya-sistema
    provides: 02-03 — tokens.css (bp-группа, --space-*, --text-display), BaseLayout (pageLabel, nav/footer), Button/IconArrowRight (hero-shell)
  - phase: 02-vizualnaya-sistema
    provides: 02-02 — решение первого экрана hero-default D-12 (дефолт «контрактная типографика»; Figma MCP недоступен, пользователь артефакты не передал), критерии D-14, статус макета D-15, палитра D-07
  - phase: 01-osnova-proekta
    provides: check-tokens.mjs (grep-контроль использования компонентов R3, bp/медиа-сверка, W1), check-seo.mjs, check-contrast.mjs, check-collections.mjs, check-prohibitions.mjs (verify-цепочка)
provides:
  - src/pages/work.astro — SYSTEM DEMO-блок: SectionHeading (meta «SYSTEM DEMO», title «Системная демонстрация», layout split) + 2 фикстурных ProjectCard (terracotta/showMetrics=true/stacked с Media 4:3+caption и Tag Web+CMS; olive/showMetrics=false/split с Media 3:2 и Tag Astro) — последний узел grep-контроля использования: полный check-tokens зелёный (все 8 компонентов импортированы)
  - docs/hero-concept.md — документ-решение R9: вердикт hero-default D-12, секции «Выбор»/«Варианты»/«Обоснование» (D-14: реализуемость в системе, Calm Interface Active Work, задел под фазу 3)/«Статус макета» (D-15: код в Git — источник правды)
  - Первый полный зелёный прогон npm run verify фазы 2 (build + check-seo + check-tokens + check-contrast + check-collections + check-prohibitions, exit 0) — фиксация контрольной точки для 02-06
affects: [02-06 (визуальный проход на зелёном verify: work.astro SYSTEM DEMO на 375/768/1200), фаза 3 (замена фикстурных карточек реальными кейсами content collections — схема projects, content.config.ts не менялся; <Image /> в слот Media; контент главной в существующий hero-shell)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Страничная композиция из компонентов 02-04: SectionHeading + ProjectCard со слотами (Media через slot='media', Tag в дефолтном слоте) — Stacki-совместимая плоская композиция (D-04), все пропы фикстурные (AC#7)"
    - "Scoped-сетка страницы: grid 1 колонка → repeat(2, 1fr) на ≥768px (число = --bp-md, сверяет check-tokens); вертикальный ритм gap --space-2xl/--space-lg — только токены"
    - "Фикстуры помечаются комментарием // fixture: replaced in phase 3 — детерминированный маркер для замены в фазе 3"
    - "Документ-решение в docs/: вердикт-строка + секции «Выбор/Варианты/Обоснование/Статус макета» по критериям D-14/D-15 (прецедент формата — design_direction_*.md)"

key-files:
  created:
    - docs/hero-concept.md
  modified:
    - src/pages/work.astro

key-decisions:
  - "[02-05 T1] SYSTEM DEMO на work.astro — детерминированный fallback-узел grep-контроля (UI-SPEC Page structure): не зависит от концепта первого экрана; фикстурные формулировки «Проект «Терракота»/«Проект «Олива»» помечены // fixture: replaced in phase 3 (AC#7, честный статус D-04)"
  - "[02-05 T1] Демонстрация пары theme-состояний Tag: один Tag с theme='terracotta' (акцент карточки), один без theme (нейтральный покой D-08) — визуальное доказательство контракта R5 на живой странице"
  - "[02-05 T1] Демонстрация пропа showMetrics: карточка 1 = true (мета-строка в HTML), карточка 2 = false (мета-строка отсутствует в dist/work/index.html) — контракт-проверка verify"
  - "[02-05 T2] hero-default (D-12): index.astro НЕ изменяется — hero-shell 02-03 уже рендерит D-13-минимум; решение 02-02 зафиксировано в docs/hero-concept.md с обоснованием по D-14"

patterns-established:
  - "Закрытие grep-контроля использования: все 8 компонентов (Button, Link, SectionHeading, ProjectCard, Media, Tag, Nav, Footer) импортированы в src/pages|src/layouts — check-tokens полный зелёный"
  - "Документ-решение с вердиктом: строка-вердикт + обоснование по критериям D-14 + архивация по D-15 — удовлетворяет R9 AC#12 (отсутствие выбора не блокирует фазу)"
  - "Первый полный зелёный verify фазы: контрольная точка перед визуальным проходом 02-06"

requirements-completed: [REQ-design-implications, R3, R9]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "work.astro SYSTEM DEMO-блок: SectionHeading (meta SYSTEM DEMO, layout split) + 2 фикстурных ProjectCard с Media (4:3+caption / 3:2) и Tag (Web+theme terracotta, CMS, Astro); showMetrics=true рендерит мета-строку, showMetrics=false — нет; scoped-сетка 1→2 колонки на ≥768px; пропы-фикстуры помечены // fixture: replaced in phase 3; content.config.ts не изменён"
    requirement: R3
    verification:
      - kind: e2e
        ref: "npm run verify — exit 0 (build + check-seo + check-tokens + check-contrast + check-collections + check-prohibitions)"
        status: pass
      - kind: integration
        ref: "node -e контракт-проверка dist/work/index.html: «Системная демонстрация» и «SYSTEM DEMO» присутствуют; «дизайн · 2026» есть, «разработка · 2026» отсутствует (showMetrics)"
        status: pass
    human_judgment: false
  - id: D2
    description: "docs/hero-concept.md: вердикт hero-default D-12 (Figma-варианты не генерировались — MCP на планировании недоступен); секции «Выбор» (D-13-минимум), «Варианты» (не генерировались), «Обоснование» (критерии D-14: реализуемость в системе, Calm Interface Active Work, задел под фазу 3), «Статус макета» (D-15: код в Git — источник правды, макет — референс)"
    requirement: R9
    verification:
      - kind: integration
        ref: "test -f docs/hero-concept.md && grep -q 'Выбор' && grep -q 'D-14|реализуем'"
        status: pass
      - kind: e2e
        ref: "npm run verify после Task 2 — exit 0"
        status: pass
    human_judgment: false
  - id: D3
    description: "index.astro при hero-default не изменяется (git diff пуст): hero-shell 02-03 уже рендерит D-13-минимум (метка «01 / HOME», имя Unbounded, CTA «Смотреть работы»); уточнение в рамках системы не требуется"
    requirement: R9
    verification:
      - kind: integration
        ref: "git status --short — src/pages/index.astro не модифицирован"
        status: pass
    human_judgment: false

# Metrics
duration: 15min
completed: 2026-08-02
status: complete
---

# Phase 02, Plan 05: Страничная композиция (SYSTEM DEMO на work.astro) + фиксация решения первого экрана (docs/hero-concept.md) Summary

**work.astro получил SYSTEM DEMO-блок из компонентов 02-04 (SectionHeading + 2 фикстурных ProjectCard с Media и Tag, пропы-фикстуры AC#7) — последний узел grep-контроля использования закрыт, полный check-tokens впервые зелёный по всем правилам; docs/hero-concept.md зафиксировал вердикт hero-default D-12 (Figma-варианты не генерировались) с обоснованием по D-14 и архивацией по D-15; index.astro не изменён; завершение плана — первый полный зелёный прогон npm run verify фазы 2 (контрольная точка для визуального прохода 02-06)**

## Performance

- **Duration:** 15 min
- **Started:** 2026-08-02T21:38:00Z
- **Completed:** 2026-08-02T21:53:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- **work.astro (Task 1):** empty-state 02-03 заменён на SYSTEM DEMO-блок (детерминированный fallback UI-SPEC Page structure, не зависящий от концепта): `SectionHeading` (meta «SYSTEM DEMO», title «Системная демонстрация», layout split) + сетка из 2 фикстурных `ProjectCard`:
  - Карточка 1 «Проект «Терракота»»: meta «дизайн · 2026», theme terracotta, showMetrics=true, layout stacked; слот media — `Media ratio='4:3'` с caption «Превью проекта — фаза 3»; дефолтный слот — `Tag Web` (theme terracotta) + `Tag CMS` (без theme — нейтральный покой D-08, пара демонстрирует обе ветки контракта R5);
  - Карточка 2 «Проект «Олива»»: meta «разработка · 2026», theme olive, showMetrics=false (мета-строка НЕ рендерится — проверка пропа), layout split; слот media — `Media ratio='3:2'` без caption; дефолтный слот — `Tag Astro`;
  - Фикстурные пропы помечены комментарием `// fixture: replaced in phase 3` (AC#7); title/description и pageLabel «02 / WORK» сохранены (уникальная пара check-seo); scoped-стили минимальны: вертикальный ритм (gap `--space-2xl` между заголовком и списком, `--space-lg` между карточками), grid 1 колонка → `repeat(2, 1fr)` на ≥768px (= --bp-md, сверяет check-tokens); всё через токены, без `<script>`
- **Grep-контроль использования закрыт (R3):** все 8 компонентов (Button, Link, SectionHeading, ProjectCard, Media, Tag, Nav, Footer) импортированы в src/pages|src/layouts — check-tokens полностью зелёный впервые в фазе («использование компонентов» в выводе OK)
- **docs/hero-concept.md (Task 2):** документ-решение по 02-02: вердикт-строка «выбран дефолт D-12 (hero-default)»; секции «Выбор» (D-13-минимум: метка «01 / HOME» + имя Unbounded display + CTA «Смотреть работы»), «Варианты» (не генерировались — Figma MCP на планировании недоступен, пользователь артефакты не передал; edge R9/AC#12 — отсутствие выбора не блокирует фазу), «Обоснование» по критериям D-14 (реализуемость в системе: токены/сетка/CSS-only без JS и новых зависимостей; «Calm Interface, Active Work»: нейтральный покой, моно-слой, акценты во взаимодействии; задел под фазу 3: формула обещания ложится в существующую колонку hero без перекомпоновки), «Статус макета» (D-15: макет — референс, источник правды — файлы Astro в Git; prohibition «Figma-макет не источник правок» — resolved)
- **index.astro не изменён** (hero-default): hero-shell 02-03 уже рендерит D-13-минимум; уточнение в рамках системы не требуется (git diff пуст)
- **Первый полный зелёный verify фазы:** `npm run verify` exit 0 после Task 1 и после Task 2 (build + check-seo + check-tokens + check-contrast + check-collections + check-prohibitions) — контрольная точка для визуального прохода 02-06
- Контракт-проверка dist/work/index.html: «Системная демонстрация» и «SYSTEM DEMO» присутствуют; мета-строка карточки 1 («дизайн · 2026») в HTML есть, карточки 2 («разработка · 2026») — нет (showMetrics=false)

## Task Commits

Each task was committed atomically:

1. **Task 1: work.astro SYSTEM DEMO block with fixture ProjectCards (AC#7)** - `82c8ba7` (feat)
2. **Task 2: hero-concept decision doc — default D-12 contract typography (R9)** - `de2e134` (docs)

**Plan metadata:** `pending` (docs commit после state-обновлений)

## Files Created/Modified
- `src/pages/work.astro` - Modified: empty-state (02-03) → SYSTEM DEMO-блок; импорты SectionHeading/ProjectCard/Media/Tag; 2 фикстурных ProjectCard со слотами Media/Tag; scoped-сетка 1→2 колонки ≥768px; title/description/pageLabel сохранены
- `docs/hero-concept.md` - Created: документ-решение R9 — вердикт hero-default D-12, секции «Выбор»/«Варианты»/«Обоснование» (D-14)/«Статус макета» (D-15), потребители 02-03/02-05/фаза 3

## Decisions Made
- SYSTEM DEMO-блок размещён на work.astro как детерминированный fallback (UI-SPEC Page structure «If the selected concept excludes the strip...») — не зависит от выбора концепта, закрывает grep-контроль до фазы 3
- Фикстурные карточки демонстрируют полный контракт: обе ветви theme-состояния Tag (с theme / без theme — нейтральный покой D-08) и обе ветви showMetrics (true/false, проверка по dist)
- hero-default (D-12): index.astro не меняется; документ фиксирует вердикт, обоснование по D-14 и статус макета по D-15 — R9 закрыт без блокировки фазы (edge AC#12)

## Deviations from Plan

None - plan executed exactly as written (автофиксы не потребовались: verify-цепочка зелёная после каждого Task без правок).

## Known Stubs

Плановые состояния (не дефекты — зафиксированы в плане 02-05 key_links/AC#7 и 02-UI-SPEC, резолвятся фазой 3):
- `src/pages/work.astro` — SYSTEM DEMO с фикстурными карточками («Проект «Терракота»»/«Проект «Олива»», tag Web/CMS/Astro): рабочая версия фазы 2 (AC#7), маркер `// fixture: replaced in phase 3`; реальные кейсы из content collections — фаза 3 (схема projects, content.config.ts не менялся)
- `src/pages/work.astro` — Media-слоты без изображения (пустая рамка с ratio, edge R7): контракт для `<Image />` фазы 3
- `src/pages/index.astro` — hero-shell без текста формулы обещания и подписей: REQ-main-promise — фаза 3 (D-13 фиксирует минимум, документировано в docs/hero-concept.md)

## Issues Encountered
- Нет. Единственный известный red (4 нарушения grep-контроля использования после 02-03/02-04) закрыт Task 1 — check-tokens полностью зелёный.

## User Setup Required
None - Figma-концепты не требовались (решение 02-02 — hero-default; user_setup плана помечал Figma как «только при выборе hero-figma»).

## Next Phase Readiness
- Для 02-06 (визуальный проход): полный verify зелёный — контрольная точка; SYSTEM DEMO на work.astro проверяется на 375/768/1200 (сетка 1→2 колонки на 768px, split-состояния SectionHeading/ProjectCard); reduced-motion на собранных страницах
- Для фазы 3: замена фикстурных карточек work.astro реальными кейсами (маркер // fixture: replaced in phase 3); <Image /> в слот Media без изменения контракта; контент главной в существующий hero-shell без перекомпоновки (D-14c); при появлении Figma-концептов — дополнение docs/hero-concept.md по формату (D-15)
- Известные ограничения: на work.astro — фикстурные данные (AC#7, фаза 3); главная — только D-13-минимум (REQ-main-promise — фаза 3)

## Self-Check: PASSED

- Файлы: src/pages/work.astro и docs/hero-concept.md существуют (проверено ls/test -f)
- Коммиты: 82c8ba7 (feat), de2e134 (docs) — оба в git log
- Верификация: npm run verify exit 0 после Task 1 и после Task 2 (2 полных прогона); контракт-проверка dist/work/index.html зелёная; grep-контроль использования OK (check-tokens); index.astro не изменён (git diff пуст); content.config.ts не изменён

---
*Phase: 02-vizualnaya-sistema*
*Completed: 2026-08-02*
