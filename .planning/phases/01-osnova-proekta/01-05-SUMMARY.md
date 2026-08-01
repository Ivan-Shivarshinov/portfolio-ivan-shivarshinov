---
phase: 01-osnova-proekta
plan: 05
subsystem: ui
tags: [astro, seo, sitemap, robots, static-pages]

# Dependency graph
requires:
  - phase: 01-02
    provides: scripts/check-seo.mjs и scripts/verify-preview.mjs (контракты R1/R4)
  - phase: 01-03
    provides: BaseLayout.astro, Seo.astro, index.astro, astro.config.mjs с site
provides:
  - 4 маршрута-заглушки /work /lab /about /contact на BaseLayout с уникальными парами title/description
  - public/robots.txt со ссылкой на /sitemap-index.xml
  - Проверка sitemap-цепочки в check-seo.mjs по фактическому формату @astrojs/sitemap 3.x
  - Полностью зелёный SEO-контракт R4 и preview-контракт R1 (5 маршрутов HTTP 200)
affects: [01-06 (spike), 01-07, фазы 2-3 (визуальная сборка, кейсы Work)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Stacki-совместимая композиция страницы: BaseLayout + плоские компоненты с props, без клиентского JS (D-04, Pattern 2)"
    - "SEO-контракт проверяется программно по собранному HTML (check-seo.mjs), а не глазами"

key-files:
  created:
    - src/pages/work.astro
    - src/pages/lab.astro
    - src/pages/about.astro
    - src/pages/contact.astro
    - public/robots.txt
  modified:
    - scripts/check-seo.mjs

key-decisions:
  - "Аудит sitemap в check-seo.mjs следует цепочке sitemap-index.xml → дочерние sitemap-файлы (sitemap-0.xml): индекс — sitemapindex без <url>, маршруты лежат в urlset-детях (Pitfall 3, формат @astrojs/sitemap 3.x)"

patterns-established:
  - "Страница-заглушка: import BaseLayout + <p> с placeholder-текстом из UI-SPEC Copywriting Contract; title/description — уникальная пара R4"

requirements-completed: [R1, R4]

coverage:
  - id: D1
    description: "4 страницы-заглушки (work, lab, about, contact) на BaseLayout с уникальными парами title/description и placeholder-текстом из UI-SPEC"
    requirement: R4
    verification:
      - kind: integration
        ref: "node scripts/check-seo.mjs — 5 уникальных пар title/description по dist/**/*.html (exit 0)"
        status: pass
      - kind: other
        ref: "grep placeholder «Раздел в разработке — кейсы появятся в фазе 3» в dist/work|lab|about|contact/index.html"
        status: pass
    human_judgment: false
  - id: D2
    description: "public/robots.txt: User-agent: *, Allow: /, Sitemap: https://portfolio.example.com/sitemap-index.xml (решение 01-01 T4)"
    verification:
      - kind: other
        ref: "cat public/robots.txt — 3 строки контракта (Pitfall 3: ссылка на sitemap-index.xml, не sitemap.xml)"
        status: pass
    human_judgment: false
  - id: D3
    description: "SEO-контракт R4 подтверждён программно: canonical + og:title/og:description/og:type/og:url/og:locale на всех 5 страницах; sitemap-цепочка содержит 5 url"
    requirement: R4
    verification:
      - kind: integration
        ref: "node scripts/check-seo.mjs — exit 0 (canonical + OG везде, sitemap-index.xml → sitemap-0.xml с 5 url)"
        status: pass
      - kind: integration
        ref: "node scripts/check-seo.mjs --self-test — exit 0 (формат индекса, дубли пар, отсутствие og:url/canonical)"
        status: pass
    human_judgment: false
  - id: D4
    description: "5 маршрутов (/, /work, /lab, /about, /contact) отдают HTTP 200 + text/html"
    requirement: R1
    verification:
      - kind: integration
        ref: "MSYS_NO_PATHCONV=1 node scripts/verify-preview.mjs — exit 0, все 5 маршрутов OK"
        status: pass
    human_judgment: false
  - id: D5
    description: "В собранном HTML нет client:* директив (UI-SPEC Interaction NONE)"
    verification:
      - kind: integration
        ref: "grep -r \"client:\" dist/ — exit 1 (совпадений нет)"
        status: pass
    human_judgment: false

# Metrics
duration: 5min
completed: 2026-08-01
status: complete
---

# Phase 01 Plan 05: Stub Pages + SEO Summary

**4 страницы-заглушки (work/lab/about/contact) на BaseLayout с уникальными парами title/description и robots.txt на sitemap-index.xml; SEO-контракт R4 и preview-контракт R1 закрыты программно: check-seo.mjs и verify-preview.mjs полностью зелёные**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-01T21:41:12Z
- **Completed:** 2026-08-01T21:45:41Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- 4 маршрута-заглушки (`/work`, `/lab`, `/about`, `/contact`) на BaseLayout: уникальные пары title/description (русский, D-08), placeholder дословно из UI-SPEC Copywriting Contract, без клиентского JS — закрыты R1 (5 маршрутов HTTP 200) и R4 (SEO-пары)
- `public/robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: https://portfolio.example.com/sitemap-index.xml` — техническое уточнение решения 01-01 T4 (файла sitemap.xml не существует, Pitfall 3)
- check-seo.mjs исправлен на аудит sitemap-цепочки по фактическому формату @astrojs/sitemap 3.x: индекс — `sitemapindex` со ссылками на дочерние urlset-файлы, маршруты считаются по детям (`sitemap-0.xml`); self-test обновлён под реальный формат + добавлен кейс пустого индекса
- Полный набор проверок зелёный: build exit 0, check-seo exit 0 (5 уникальных пар, canonical + OG везде, sitemap 5 url), verify-preview exit 0 (5 маршрутов 200 + text/html), `grep -r "client:" dist/` — совпадений нет

## Task Commits

Каждая задача закоммичена атомарно:

1. **Task 1: 4 страницы-заглушки + public/robots.txt** - `ae0885c` (feat)
2. **Task 2: SEO- и preview-проверки зелёные + устранение нарушений** - `a7229e6` (fix)

**Plan metadata:** (добавится финальным коммитом)

## Files Created/Modified

- `src/pages/work.astro` - маршрут /work; title «Работы — Иван Шиваршинов», placeholder из UI-SPEC
- `src/pages/lab.astro` - маршрут /lab; title «Лаборатория — Иван Шиваршинов»
- `src/pages/about.astro` - маршрут /about; title «Обо мне — Иван Шиваршинов»
- `src/pages/contact.astro` - маршрут /contact; title «Контакты — Иван Шиваршинов»
- `public/robots.txt` - User-agent: * / Allow: / / Sitemap: <site>/sitemap-index.xml
- `scripts/check-seo.mjs` - аудит sitemap-цепочки (индекс → дочерние файлы) вместо подсчёта `<url>` в самом индексе

## Decisions Made

- **Аудит sitemap по цепочке индекс → дети:** check-seo.mjs теперь парсит `sitemapindex` в sitemap-index.xml, резолвит дочерние `<loc>` в dist/ и считает `<url>` по детям. Сам индекс `<url>` не содержит — прежняя логика давала ложное срабатывание «0 url» при корректном выводе сборки (Pitfall 3). Соответствует must-have плана: «sitemap-index.xml генерируется и содержит все 5 маршрутов» — через цепочку sitemap-0.xml.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] check-seo.mjs: ложное срабатывание аудита sitemap**
- **Found during:** Task 1 (верификация)
- **Issue:** `auditSitemap` считал `<url>` элементы прямо в `sitemap-index.xml`, но фактический вывод @astrojs/sitemap 3.x — `<sitemapindex>` со ссылкой на `sitemap-0.xml`, где лежат `<url>` (5 маршрутов). Итог: «sitemap-index.xml содержит 0 url, ожидалось 5» при полностью корректной сборке — ровно тот случай «ложного срабатывания», который Task 2 плана разрешает чинить в скрипте.
- **Fix:** `auditSitemap(xmlText, readChild)` парсит дочерние `<loc>` из индекса, резолвит файлы в dist/ (отсутствующие — флаг «не найдены») и считает суммарное число `<url>`; self-test-фикстуры переведены на формат индекс→urlset, добавлен кейс пустого индекса.
- **Files modified:** scripts/check-seo.mjs
- **Verification:** `node scripts/check-seo.mjs` exit 0 против реальной сборки; `node scripts/check-seo.mjs --self-test` exit 0 (5 url pass, 4 url fail, пустой индекс fail, дубли пар, отсутствие og:url/canonical)
- **Committed in:** a7229e6 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking-ложное срабатывание скрипта)
**Impact on plan:** Исправление необходимо для корректной проверки R4; источник (страницы, Seo.astro, конфиг) не менялся — пары title/description, canonical и OG пришли из задач 01-03/01-05 без правок.

## Known Stubs

- `src/pages/work.astro`, `src/pages/lab.astro`, `src/pages/about.astro`, `src/pages/contact.astro` — placeholder «Раздел в разработке — кейсы появятся в фазе 3» — **намеренный** (UI-SPEC Copywriting Contract, empty static-content; обязательное требование must-have плана); резолвится фазой 2 (визуальная система) и фазой 3 (кейсы Work)

## Issues Encountered

- Само-тест check-seo.mjs после фикса падал на фикстуре «4 url» из-за несовпадения подстроки: сообщение «содержат 4 url» (множественное), needle «содержит 4 url» (единственное). Поправлен needle в self-test — тест зелёный.
- verify-preview в Git Bash требует `MSYS_NO_PATHCONV=1` (известный gotcha плана 01-03) — применён, все 5 маршрутов OK.

## User Setup Required

None - внешние сервисы не задействованы.

## Next Phase Readiness

- 5 маршрутов отдают валидный HTML (R1 закрыт), SEO-контракт подтверждён программно (R4 закрыт)
- Страницы задают Stacki-совместимый паттерн композиции (layout + плоские компоненты с props) для фаз 2-3
- sitemap-проверка в check-seo.mjs теперь соответствует реальному формату вывода — при добавлении страниц в фазе 2-3 EXPECTED_PAGES/EXPECTED_SITEMAP_URLS потребуют обновления

## Self-Check: PASSED

- FOUND: src/pages/work.astro, src/pages/lab.astro, src/pages/about.astro, src/pages/contact.astro, public/robots.txt
- FOUND: .planning/phases/01-osnova-proekta/01-05-SUMMARY.md
- FOUND: commits ae0885c (Task 1), a7229e6 (Task 2)

---
*Phase: 01-osnova-proekta*
*Completed: 2026-08-01*
