---
phase: 03-kontent-i-stranicy
plan: 06
subsystem: content
tags: [astro, cases, screenshots, check-tone, final-gate, phase-journal, grid-fix]

# Dependency graph
requires:
  - phase: 03-kontent-i-stranicy
    provides: "03-03: состав из 6 кейсов (темы, именование, featured), эталонная запись skala.mdx, паттерн ProjectCard; 03-04: контакты из единого источника (3 канала, 1 script на /contact); 03-05: формула обещания на /, избранные работы, /about и /lab с метами, check-visual (5 шагов)"
provides:
  - "5 утверждённых кейсов (buzko-legal, dias, winwin, mayak, tech-law-conf) + 5 реальных скриншотов — коллекция на контрактной границе 6 записей, featured ровно 3"
  - "verify-цепочка финального состава: build → check-seo → check-tokens → check-contrast → check-collections → check-prohibitions → check-tone → check-visual (check-tone добавлен)"
  - ".planning/phases/03-kontent-i-stranicy/03-VERIFICATION.md — журнал фазы: K1–K4 по 6 кейсам, решения планов, итоги полного гейта, ручной проход тона"
  - "Фиксы гейта: grid blowout на / @768px (ProjectCard min-width: 0), failure-path check-visual (stderrRef)"
affects: [phase 4 prototip indeksa (03-PATTERNS данные кейсов), ship]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Grid-карточки с изображениями: min-width: 0 на карточке — grid-трек не тируется по min-content (intrinsic-ширина скриншота не раздувает колонку; тот же класс проблем, что Pitfall 3, но по ширине)"
    - "Check-скрипт: failure-path никогда не должен ссылаться на переменные из scope другого шага (stderrRef) — иначе ReferenceError маскирует реальные FAIL"
    - "Кейс-запись: frontmatter (slug/title/summary/role/stack/year/status/client-type/order/theme/featured/cover/coverAlt) + ровно 4 h2, «Моя зона.»/«Команда.»/«Эффект.» strong-лейблы в «Ответственности», «До: … После: …» в «Результате»"

key-files:
  created: [src/content/projects/buzko-legal.mdx, src/content/projects/dias.mdx, src/content/projects/winwin.mdx, src/content/projects/mayak.mdx, src/content/projects/tech-law-conf.mdx, src/assets/projects/{buzko-legal,dias,winwin,mayak,tech-law-conf}/cover.png, .planning/phases/03-kontent-i-stranicy/03-VERIFICATION.md (extended)]
  modified: [package.json, src/components/ProjectCard.astro, scripts/check-visual.mjs]

key-decisions:
  - "Кейсы 2–6 утверждены пользователем дословно (D-04, чекпоинт Task 2): K1–K4 по каждому — факты реальные, именование корректное, личное/командное/эффект разделены, скриншоты — реальные интерфейсы"
  - "check-tone добавлен в verify-цепочку после check-prohibitions только когда real-run по dist зелёный (T-03-16); денлист 22 записи сохранён без корректировок — ложных срабатываний нет (R9/A4)"
  - "Grid blowout на / @768px: фикс на уровне компонента (ProjectCard min-width: 0), а не сетки — общий фикс для featured-сетки и /work"
  - "Денлист check-tone сверен с финальным контентом: коррекция не потребовалась — тексты кейсов и страниц чисты по спискам «избегать» (REQ-tone)"
  - "Ремарка пользователя «будет ещё куча правок перед продакшном» — ожидаемо для черновиков (D-04), не блокирует гейт фазы"

patterns-established:
  - "Pattern: финальный гейт фазы = lint + verify (полный состав) + self-tests скриптов + ручной проход тона по спискам REQ-tone, результаты — в 03-VERIFICATION.md (по образцу 02)"
  - "Pattern: real-run check-скрипта по dist — источник истины для денлистов (сверка при финальном гейте, порог ≥10, R9)"

requirements-completed: [REQ-evidence-cases, REQ-tone]

# Metrics
duration: 50min
completed: 2026-08-04
status: complete
---

# Phase 03 Plan 06: Оставшиеся кейсы, финальный гейт фазы и журнал верификации Summary

**Пять утверждённых кейсов (buzko-legal, dias, winwin, mayak, tech-law-conf) с реальными скриншотами пользователя — коллекция на контрактной границе 6 записей; verify-цепочка с check-tone; полный гейт фазы зелёный (lint → verify, 11 страниц); журнал 03-VERIFICATION.md с K1–K4 по каждому кейсу и ручным проходом тона**

## Performance

- **Duration:** 50 min
- **Started:** 2026-08-04T10:45:00Z
- **Completed:** 2026-08-04T11:35:00Z
- **Tasks:** 3 (1 выполнен ранее — черновики; Task 2 — чекпоинт утверждения, решён пользователем; Task 3 — финальный гейт + журнал)
- **Files modified:** 15 (+2 фикс)

## Accomplishments
- Кейсы 2–6 утверждены пользователем (2026-08-04, чекпоинт Task 2, K1–K4 по каждому): 5 MDX-записей по эталону skala.mdx — frontmatter по схеме 03-01 (theme/featured/cover/coverAlt, order 2–6), тело с 4 h2, «Моя зона.»/«Команда.»/«Эффект.», «До: … После: …»; скриншоты пользователя — cover.png 1920×928 PNG в папках по слагам, дублей нет (md5)
- verify-цепочка финального состава: `npm run check-tone` добавлен после check-prohibitions (T-03-16); полный прогон зелёный
- Полный гейт фазы: `npm run lint` exit 0; `npm run verify` exit 0 — build 11 страниц, check-seo 11 уникальных пар + sitemap 11 url, check-tokens (W1: 0 на кейсах; ровно 1 script на /contact), check-contrast 20/20, check-collections (6 записей, featured 3, theme ≠ terracotta, cover-файлы, 4 h2, notes 0, 3 негативных теста упали ожидаемо), check-prohibitions, check-tone real-run зелёный без ложных срабатываний (денлист 22 записи без корректировок), check-visual полный браузерный прогон (14 скролл-проверок, hover CTA/футер, reduced-motion, копирование email); self-tests 4 скриптов — exit 0
- Исправлены 2 дефекта гейта: grid blowout на / @768px (ProjectCard `min-width: 0`) и ReferenceError failure-path check-visual (`stderrRef`) — закоммичены отдельно, гейт перепрогнан до зелёного
- 03-VERIFICATION.md — журнал фазы: состав кейсов (решение 03-03), K1–K4 по 6 кейсам, решения планов (темы, порядок каналов, IconLinkedin-задел, денлист), итоги полного гейта, ручной проход тона, дефекты/фиксы, итог фазы

## Task Commits

Each task was committed atomically:

1. **Task 1: Черновики кейсов 2–6 + папки активов** - `3ea2361` (feat) — 5 MDX + 5 папок со скриншотами (коммит после утверждения Task 2)
2. **Task 3: финальный гейт** - `2b2186c` (fix) — ProjectCard min-width: 0 + failure-path check-visual; `a93c1c8` (feat) — verify-цепочка с check-tone + журнал 03-VERIFICATION.md (см. ниже)
3. **Summary + state** - `…` (docs) — 03-06-SUMMARY.md, STATE.md, ROADMAP.md

**Plan metadata:** `f27002c` (docs: create phase plan) — план; финальный docs-коммит SUMMARY см. ниже

_Note: Task 2 — чекпоинт утверждения кейсов (K1–K4) + скриншоты, решён в чате 2026-08-04: все 5 кейсов утверждены, скриншоты положены пользователем_

## Files Created/Modified
- `src/content/projects/buzko-legal.mdx` - кейс 2 (plum, featured): перезапуск сайта юрфирмы — 30+ статических и 8+ шаблонных страниц, двуязычная CMS, SEO/GTM/GA4; поддержка до сих пор
- `src/content/projects/dias.mdx` - кейс 3 (clay): B2B-поставщик — 12 направлений через CMS, посадочные страницы, формы расчёта/заявок; разовая работа 1–2 месяца
- `src/content/projects/winwin.mdx` - кейс 4 (olive, featured): поддержка и доработка 20+ страниц, формы → n8n → amoCRM, два зеркала «Антифраншизы»
- `src/content/projects/mayak.mdx` - кейс 5 (clay): перенос архитектурного бюро с WordPress — 9 страниц, 33 проекта в коллекции, двуязычие, сложные анимации
- `src/content/projects/tech-law-conf.mdx` - кейс 6 (slate): сайт конференции по этапам — Webflow → TapTop, предрегистрация → архив
- `src/assets/projects/{buzko-legal,dias,winwin,mayak,tech-law-conf}/cover.png` - реальные скриншоты пользователя (PNG 1920×928, ~0.9–1.0 МБ) + .gitkeep
- `package.json` - verify-цепочка: `… && node scripts/check-prohibitions.mjs && npm run check-tone && npm run check-visual`
- `src/components/ProjectCard.astro` - `min-width: 0` на .card (фикс grid blowout, Д-1)
- `scripts/check-visual.mjs` - failure-path без `stderrRef` (фикс Д-2)
- `.planning/phases/03-kontent-i-stranicy/03-VERIFICATION.md` - журнал фазы расширен: утверждения K1–K4, решения, полный гейт, ручной проход тона, дефекты/фиксы, итог

## Decisions Made
- Кейсы 2–6 утверждены пользователем дословно (D-04) — правок формулировок не вносилось (тексты утверждены вербатим на чекпоинте)
- check-tone в verify-цепочке — после зелёного real-run; денлист не корректировался (ложных срабатываний нет, 22 ≥ 10, R9)
- Фикс blowout — на уровне компонента (ProjectCard), а не сетки: единый фикс для featured-сетки и /work
- Ремарка «будет ещё куча правок перед продакшном» — принята к сведению: черновики D-04, правки до публикации — вне гейта фазы

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Grid blowout: горизонтальный скролл на / @768px**
- **Found during:** Task 3 (первый прогон verify)
- **Issue:** секция «Избранные работы» с 3 карточками: grid-трек раздувался до min-content (intrinsic-ширина скриншота 1920px через Media/Image) — scrollWidth 829 > 768; карточка winwin 279px против колонки ~245px
- **Fix:** `min-width: 0` на `.card` в ProjectCard.astro (общий фикс для обоих grid)
- **Files modified:** src/components/ProjectCard.astro
- **Commit:** 2b2186c

**2. [Rule 1 - Bug] check-visual падал с ReferenceError на failure-path**
- **Found during:** Task 3 (первый прогон verify)
- **Issue:** `stderrRef is not defined` — сообщение об ошибке ссылалось на переменную из scope `ensurePreview`; ReferenceError маскировал реальные FAIL
- **Fix:** сообщение failure-path больше не ссылается на stderrRef (stderr выводится в таймауте ensurePreview)
- **Files modified:** scripts/check-visual.mjs
- **Commit:** 2b2186c

## Issues Encountered
- Два дефекта гейта (выше) — оба исправлены, гейт перепрогнан до зелёного
- Ожидаемое поведение: preview-сервер 4321 переиспользовался прогонами check-visual (уже был запущен) — штатный режим скрипта

## Known Stubs

None — все тексты утверждены пользователем; честный статус lab («Эксперименты в работе») — осознанное состояние, не заглушка; отложенная галерея кейсов зафиксирована в deferred-items.md.

## User Setup Required

None - скриншоты предоставлены пользователем на чекпоинте Task 2 (5 файлов cover.png).

## Next Phase Readiness
- Коллекция кейсов закрыта: 6 записей, featured 3, скриншоты реальные; контракт R2 (5–6) и R8 (без дублей) соблюдён
- Все 6 разделов наполнены (Home/Work/Case/Lab/About/Contact); check-seo ожидает 11 страниц — факт
- Фаза 03 завершена: полный гейт зелёный (lint → verify → self-tests), журнал 03-VERIFICATION.md закрыт; deferred-items.md — галерея кейсов (gap-план после верификации)
- Вход в фазу 4 (прототип индекса работ): данные кейсов из src/content/projects — источник для сцены Three.js

## Self-Check: PASSED

- Файлы: 5 MDX созданы (buzko-legal/dias/winwin/mayak/tech-law-conf), 5 cover.png 1920×928 присутствуют, 03-VERIFICATION.md расширен
- Коммиты в git log: `3ea2361` (feat: five case studies), `2b2186c` (fix: grid blowout + stderrRef)
- Гейт: `npm run lint` exit 0; `npm run verify` exit 0 (build 11 страниц, check-seo 11 пар, check-tone OK, check-visual 14 PASS + 4 шага); self-tests 4 скриптов exit 0

---
*Phase: 03-kontent-i-stranicy*
*Completed: 2026-08-04*
