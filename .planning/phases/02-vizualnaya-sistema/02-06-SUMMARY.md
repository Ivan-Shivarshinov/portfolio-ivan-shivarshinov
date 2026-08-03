---
phase: 02-vizualnaya-sistema
plan: 06
subsystem: testing
tags: [astro, verify, ci, github-actions, visual-pass, reduced-motion, a11y, regression-guard, final-gate]

# Dependency graph
requires:
  - phase: 02-vizualnaya-sistema
    provides: 02-05 — work.astro SYSTEM DEMO (2 фикстурных ProjectCard), docs/hero-concept.md (вердикт D-12), первый полный зелёный verify фазы 2
  - phase: 02-vizualnaya-sistema
    provides: 02-03/02-04 — оболочка 5 страниц (Nav/Footer/метки/контейнер), hero-shell главной, компоненты Button/Link/SectionHeading/ProjectCard/Media/Tag с CSS-only состояниями и motion-токенами (prefers-reduced-motion)
  - phase: 01-osnova-proekta
    provides: verify-цепочка (check-seo, check-tokens, check-contrast, check-collections, check-prohibitions, verify-preview), CI workflow (lint → check → build)
provides:
  - .planning/phases/02-vizualnaya-sistema/02-VERIFICATION.md — полный протокол финального гейта фазы: автоматический слой (verify exit 0, 5 маршрутов 200, W1, контраст 20 пар, 0 <script>, SEO) + визуальный проход пользователя (320/375/768/1200/1920, 5 страниц, reduced-motion, нейтральный покой, hero D-12) с задокументированным циклом дефект→фикс→повторное одобрение; вход для /gsd-verify-work
  - src/components/Button.astro, src/components/Link.astro — исправленная интерполяция классов (шаблонные литералы) — CTA и ссылки получают стили кнопки/ссылки
  - scripts/check-tokens.mjs — регрессионное правило 10: запрет голых {expr} в кавычках атрибутов .astro-шаблонов (quirk Astro 7.1.6), self-test фикстуры bad-attr FAIL / ok-attr PASS
  - Зелёный CI на main после финального push (lint → check → build)
affects: [/gsd-verify-work (вход — 02-VERIFICATION.md, паттерн фазы 1), 02-VALIDATION.md (гейт nyquist_compliant), фаза 3 (контент в hero-shell, замена фикстур; классы компонентов — шаблонные литералы)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Интерполяция классов в атрибутах Astro-компонентов — только шаблонные литералы class={`x ${v}`}: Astro 7.1.6/@astrojs/compiler 2.13.1 НЕ интерполирует {expr} внутри кавычек строкового атрибута (рендерится буквально, элемент без стиля)"
    - "Quirk компилятора → регрессионное правило в check-tokens.mjs (правило 10) с self-test фикстурами (bad-attr FAIL / ok-attr PASS) — встроено в verify-цепочку, frontmatter исключается из скана"
    - "Протокол финального гейта фазы (по паттерну 01-VERIFICATION.md): автоматический слой (Task 1, commit 5ffb231) + визуальный проход пользователя (Task 2, checkpoint:human-verify) с честной фиксацией цикла дефект→фикс→re-approval"

key-files:
  created:
    - .planning/phases/02-vizualnaya-sistema/02-VERIFICATION.md
    - .planning/phases/02-vizualnaya-sistema/02-06-SUMMARY.md
  modified:
    - src/components/Button.astro
    - src/components/Link.astro
    - scripts/check-tokens.mjs

key-decisions:
  - "[02-06 T2 FIX] Классы в атрибутах Astro — шаблонные литералы: Astro 7.1.6 не интерполирует {expr} в кавычках строкового атрибута (class=\"button button--{variant}\" → литеральные скобки в HTML, нетилизованный CTA). Переход на class={`button button--${variant}`} — эмпирически подтверждённая компилятором форма"
  - "[02-06 T2 FIX] Регрессионное правило 10 в check-tokens.mjs: запрет голых {expr} в кавычках атрибутов .astro-шаблонов src/ (regex name=\"...{...}\"); frontmatter исключается ({…} в JS-строках легитимен); фикстуры bad-attr/ok-attr в self-test"
  - "[02-06 Task 2] Финальный гейт фиксирует визуальный проход как документ с полной историей: найденный дефект, root cause, фикс, повторная верификация (dist-рендер + verify), повторное одобрение — 02-VERIFICATION.md честный вход для /gsd-verify-work"

patterns-established:
  - "Регрессионная защита от quirk компилятора Astro: правило в check-tokens с негативной/позитивной фикстурой в self-test — дефект не может вернуться без красного verify"
  - "Визуальный проход на живом preview (npm run preview) по протоколу: ширины 320/375/768/1200/1920 → 5 страниц → нейтральный покой/hover → prefers-reduced-motion → hero по docs/hero-concept.md — покрывает неавтоматизируемые слои (композиция/ритм, скриншот-база не выбрана — RESEARCH Pitfall 8)"
  - "Фаза готова к /gsd-verify-work: протокол гейта (автослой + человеческий слой) лежит в 02-VERIFICATION.md"

requirements-completed: [REQ-design-implications, R4, R6]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Полный npm run verify зелёный на финальном состоянии (build → check-seo → check-tokens c W1-ассертом и правилом 10 → check-contrast 20 пар → check-collections → check-prohibitions; 0 <script> в dist) + 5 маршрутов preview 200; push на main; GitHub Actions (lint → check → build) зелёный"
    requirement: REQ-design-implications
    verification:
      - kind: e2e
        ref: "npm run verify — exit 0 (2026-08-02 Task 1; повторный прогон 2026-08-03 после фиксов — exit 0)"
        status: pass
      - kind: e2e
        ref: "gh run list --limit 1 --json conclusion — success (lint → check → build)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Визуальный проход пользователя на preview: ширины 320 (нет горизонтального скролла, nav одной строкой, имя hero помещается, empty-state и footer влезают), 375, 768 (десктоп-навигация, gutter-desktop), 1200+ (контейнер 1200px, 2 колонки SYSTEM DEMO), 1920; все 5 страниц (hero-shell «01 / HOME»+имя+CTA, SYSTEM DEMO с 2 карточками — вторая без мета-строки, empty-state «… — раздел в разработке» + «На главную»); цикл дефект→фикс→re-approval зафиксирован в 02-VERIFICATION.md"
    requirement: R6
    verification:
      - kind: manual_procedural
        ref: "02-VERIFICATION.md — «Проверки визуального прохода пользователя (Task 2 — завершён, approved)»"
        status: pass
    human_judgment: true
    rationale: "Композиция/ритм и отсутствие скролла на живых ширинах не автоматизируются: скриншот-база не выбрана (RESEARCH Pitfall 8), проверка — живой проход пользователя + Stacki (checkpoint:human-verify, resume-signal «approved»)"
  - id: D3
    description: "prefers-reduced-motion (эмуляция DevTools reduce: переходы 0ms, цветовые отклики мгновенны) + нейтральный покой SC3 (без взаимодействия нет акцентов-заливок; accent только в hover/focus: ссылки, primary CTA, активный nav, focus-ring 2px, заголовок карточки; tab-навигация показывает focus-ring)"
    requirement: R4
    verification:
      - kind: manual_procedural
        ref: "02-VERIFICATION.md — секции «prefers-reduced-motion (R4, edge R4, Pitfall 5)» и «Нейтральный покой (SC3)»"
        status: pass
    human_judgment: true
    rationale: "Эмуляция DevTools и визуальная оценка состояний покоя/наведения — только живой проход; скриптами длительности переходов в эмуляции не проверить"
  - id: D4
    description: "Главная рендерит выбранный концепт D-12 (hero-default) по docs/hero-concept.md: метка «01 / HOME» + имя (Unbounded display) + primary CTA «Смотреть работы»; визуальное подтверждение пользователя в проходе"
    requirement: REQ-design-implications
    verification:
      - kind: manual_procedural
        ref: "02-VERIFICATION.md — «Соответствие главной docs/hero-concept.md (R9)»"
        status: pass
    human_judgment: true
    rationale: "Соответствие макету-концепту — визуальное суждение пользователя (D-15: код — источник правды, живой рендер обязателен)"
  - id: D5
    description: "Дефект интерполяции исправлен и закрыт регрессией: Button.astro/Link.astro на шаблонных литералах; правило 10 в check-tokens.mjs (голые {expr} в кавычках атрибутов запрещены, frontmatter исключён); dist рендерит class=\"button button--primary button--lg\" и class=\"link link--default\", 0 литеральных скобок; verify exit 0; пользователь повторно одобрил проход"
    verification:
      - kind: unit
        ref: "scripts/check-tokens.mjs self-test — фикстуры bad-attr (FAIL) / ok-attr (PASS)"
        status: pass
      - kind: e2e
        ref: "npm run verify — exit 0 с правилом 10 в цепочке"
        status: pass
      - kind: integration
        ref: "grep dist: class=\"button button--primary button--lg\", class=\"link link--default\", 0 литеральных { } в классах"
        status: pass
    human_judgment: false

# Metrics
duration: 8h 48m
completed: 2026-08-03
status: complete
---

# Phase 02 Plan 06: Финальный гейт фазы Summary

**Финальный гейт фазы 2 закрыт: полный verify зелёный + CI зелёный + визуальный проход пользователя (320/375/768/1200/1920, 5 страниц, reduced-motion, нейтральный покой) с циклом дефект→фикс→re-approval — дефект интерполяции `{expr}` в кавычках атрибутов Astro (нетилизованный CTA) исправлен шаблонными литералами и прикрыт регрессионным правилом 10 check-tokens**

## Performance

- **Duration:** 8h 48m (с паузой на визуальный проход пользователя: Task 1 2026-08-02 23:52Z → фиксы и одобрение 2026-08-03 08:40Z)
- **Started:** 2026-08-02T23:52:16Z (Task 1, commit 5ffb231)
- **Completed:** 2026-08-03T08:40:00Z
- **Tasks:** 2 (Task 1 auto — автоматический слой; Task 2 checkpoint:human-verify — визуальный проход)
- **Files modified:** 5 (02-VERIFICATION.md, Button.astro, Link.astro, check-tokens.mjs, 02-06-SUMMARY.md)

## Accomplishments
- Полный `npm run verify` зелёный на финальном состоянии фазы (build → check-seo → check-tokens с W1 и правилом 10 → check-contrast 20 пар → check-collections → check-prohibitions; 0 `<script>` в dist), 5 маршрутов preview 200, push на main, GitHub Actions (lint → check → build) зелёный
- Визуальный проход пользователя на живом preview зафиксирован в 02-VERIFICATION.md: 320 (нет горизонтального скролла, nav одной строкой, имя hero помещается) / 375 / 768 (десктоп-навигация) / 1200+ (контейнер фиксируется, 2 колонки SYSTEM DEMO) / 1920; все 5 страниц (hero-shell D-12, SYSTEM DEMO с карточкой без мета-строки, empty-state «На главную»)
- prefers-reduced-motion подтверждён (0ms, цветовые отклики остаются); нейтральный покой SC3 подтверждён (accent только в hover/focus, focus-ring виден при tab)
- Найден и исправлен 1 дефект визуального прохода: Astro 7.1.6 не интерполирует `{expr}` в кавычках атрибутов → CTA без стиля кнопки, ссылки без hover-подчёркивания; фикс 494fa83 (шаблонные литералы в Button/Link) + регрессионное правило 10 в check-tokens (f91d4db), повторная верификация и повторное одобрение пользователя
- Фаза готова к `/gsd-verify-work`: 02-VERIFICATION.md — полный протокол гейта (автослой + человеческий слой)

## Task Commits

Each task was committed atomically:

1. **Task 1: финальный npm run verify + push + зелёный CI** - `5ffb231` (docs: verification report — automated layer)
2. **Task 2: визуальный проход 320/375/768/1200 + reduced-motion + нейтральный покой** — чекпоинт; в ходе прохода цикл дефект→фикс:
   - `494fa83` (fix: interpolate variant classes in Button and Link attributes)
   - `f91d4db` (test: add check-tokens rule for bare {expr} in quoted attributes)
   - `af93769` (docs: checkpoint state — Task 1 complete, visual pass awaiting user)

**Plan metadata:** финальный коммит `docs(02-06): complete plan` (SUMMARY + VERIFICATION + STATE + ROADMAP)

## Files Created/Modified
- `.planning/phases/02-vizualnaya-sistema/02-VERIFICATION.md` - полный протокол финального гейта: автоматический слой (8 проверок) + визуальный проход (5 секций, approved) + задокументированный цикл дефекта Д-1; вход для /gsd-verify-work
- `src/components/Button.astro` - классы через шаблонный литерал `class={`button button--${variant} button--${density}`}` (фикс интерполяции)
- `src/components/Link.astro` - классы через шаблонный литерал `class={`link link--${variant}`}` (фикс интерполяции)
- `scripts/check-tokens.mjs` - правило 10: запрет голых `{expr}` в кавычках атрибутов .astro-шаблонов, frontmatter исключён, фикстуры bad-attr/ok-attr
- `.planning/phases/02-vizualnaya-sistema/02-06-SUMMARY.md` - данный документ

## Decisions Made
- Классы в атрибутах Astro-компонентов — только шаблонные литералы: компилятор Astro 7.1.6 (compiler 2.13.1) не интерполирует `{expr}` внутри кавычек строкового атрибута; форма `class={`x ${v}`}` — эмпирически подтверждённая
- Quirk компилятора прикрыт регрессионным правилом в check-tokens (правило 10) с self-test фикстурами — дефект не вернётся без красного verify
- Протокол гейта фиксирует полную историю прохода (включая дефект) — 02-VERIFICATION.md остаётся честным входом для /gsd-verify-work

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1/2 - Bug] Astro не интерполирует `{expr}` в кавычках атрибутов — CTA и ссылки без стилей**
- **Found during:** Task 2 (визуальный проход пользователя, первый заход)
- **Issue:** CTA «Смотреть работы» рендерился как обычный синий текст-ссылка (без кнопочной стилизации), у ссылок не было hover-подчёркивания. Root cause: `class="button button--{variant}"` — Astro 7.1.6/@astrojs/compiler 2.13.1 не интерполирует `{expr}` внутри кавычек строкового атрибута, скобки рендерились буквально, классы модификаторов не попадали в DOM
- **Fix:** Button.astro и Link.astro переведены на шаблонные литералы (`class={`button button--${variant} button--${density}`}`, `class={`link link--${variant}`}`) — компилятор интерполирует эту форму; добавлено регрессионное правило 10 в scripts/check-tokens.mjs (запрет голых `{expr}` в кавычках атрибутов, frontmatter исключён, фикстуры bad-attr FAIL / ok-attr PASS)
- **Files modified:** src/components/Button.astro, src/components/Link.astro, scripts/check-tokens.mjs
- **Verification:** dist рендерит `class="button button--primary button--lg"` и `class="link link--default"`, 0 литеральных `{`/`}` в классах dist, `npm run verify` exit 0 (правило 10 в цепочке); пользователь повторно прошёл проход и одобрил («approved»)
- **Committed in:** 494fa83 (fix), f91d4db (test)

---

**Total deviations:** 1 auto-fixed (bug + missing regression guard)
**Impact on plan:** Фикс необходим для корректности визуальной системы (правило 1) и закрывает дефект регрессионной проверкой (правило 2). Без фикса CTA остался бы без кнопочного стиля — проход не был бы одобрен. Скоупа не расширено.

## Issues Encountered
- Дефект Д-1 (см. Deviations): единственный дефект визуального прохода; root cause — специфичный quirk Astro 7.1.6 (не интерполирует `{expr}` в кавычках атрибутов), обнаружен именно живым проходом, который закрывает неавтоматизируемые слои верификации
- Ожидание чекпоинта: между Task 1 (2026-08-02 23:52Z) и завершением прохода (2026-08-03 08:40Z) — пауза на визуальный проход пользователя и раунд фикса

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Фаза 2 полностью верифицирована: автоматический слой (verify, CI) + человеческий слой (визуальный проход, approved) — вход для `/gsd-verify-work` и 02-VALIDATION.md (гейт nyquist_compliant)
- Для фазы 3: контент главной встраивается в существующий hero-shell; фикстурные карточки SYSTEM DEMO заменяются реальными кейсами (маркер `// fixture: replaced in phase 3`); классы компонентов — шаблонные литералы (правило 10 проверяет)

---
*Phase: 02-vizualnaya-sistema*
*Completed: 2026-08-03*
