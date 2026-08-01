---
phase: 01-osnova-proekta
plan: 01
subsystem: planning
tags: [decisions, astro, sitemap, github, state]

# Dependency graph
requires: []
provides:
  - "Зафиксированы 4 решения фазы: мажор Astro (astro@^7.1.6), черновой site URL, имя/видимость GitHub-репозитория, формулировка AC R4 (sitemap-index.xml)"
affects: [01-03, 01-07, 01-02, 01-05]

# Tech tracking
tech-stack:
  added: []  # план не устанавливает зависимостей — блок решений
  patterns:
    - "Decision-first gating: решения пользователя фиксируются в STATE.md до любых side-effecting шагов (npm install, git remote)"
    - "Техническое уточнение формулировок AC (wording) отделяется от изменения требований — AC корректируется, требование остаётся"

key-files:
  created: []
  modified:
    - ".planning/STATE.md — 4 решения фазы в секции Decisions (потребители: планы 01-03, 01-07)"

key-decisions:
  - "Мажор Astro: astro@^7.1.6 (вариант astro-7) — npm dist-tags.latest, docs v7, mdx@^7; AC R6 «astro ^5» скорректирован (техническая корректировка, не изменение требования)"
  - "Черновой site URL: https://portfolio.example.com для astro.config.mjs `site`; заменяется реальным доменом в фазе 6"
  - "GitHub-репозиторий: portfolio-ivan-shivarshinov, public; docs/ (PRD, стратегия) станут публичными — принято пользователем явно"
  - "AC R4: проверки и robots.txt ориентируются на sitemap-index.xml (фактический вывод @astrojs/sitemap 3.x); требование R4 (5 маршрутов) не изменено"

patterns-established:
  - "Микро-решения фазы подаются батчем чекпоинтов в одном плане, результаты — в Decisions секции STATE.md с тегом [01-01 T<n>], ссылкой на research и указанием плана-потребителя"
  - "Research Checkpoint → user decision → STATE.md record: исследования фазы закрывают Open Questions через чекпоинты, а не через допущения исполнителя"

requirements-completed: []
# R4/R6 во frontmatter плана — номера AC из 01-SPEC.md, а не REQ-ID из REQUIREMENTS.md.
# Данный план их НЕ завершает (только фиксирует решения, разблокирующие их проверку):
# R4 проверяется планами 01-02/01-05, R6 — планом 01-07. Отметка complete здесь была бы ложной.

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Решение о мажоре Astro: astro@^7.1.6 (вариант astro-7) зафиксировано в STATE.md с обоснованием и ссылкой на 01-RESEARCH.md Open Question 1"
    verification: []
    human_judgment: true
    rationale: "Решение пользователя по варианту чекпоинта (astro-7 / astro-5) — не автоматизируется"
  - id: D2
    description: "Решение о черновом site URL: https://portfolio.example.com (вариант site-draft) зафиксировано в STATE.md"
    verification: []
    human_judgment: true
    rationale: "Решение пользователя по варианту чекпоинта (site-draft / site-custom) — не автоматизируется"
  - id: D3
    description: "Решение об имени и видимости GitHub-репозитория: portfolio-ivan-shivarshinov, public (вариант repo-public) зафиксировано в STATE.md"
    verification: []
    human_judgment: true
    rationale: "Решение пользователя с явным принятием последствия публичности docs/ — не автоматизируется"
  - id: D4
    description: "Решение о формулировке AC R4: проверки и robots.txt ориентируются на sitemap-index.xml (вариант sitemap-index) зафиксировано в STATE.md; требование R4 не изменено"
    verification: []
    human_judgment: true
    rationale: "Решение пользователя по варианту чекпоинта (sitemap-index / sitemap-flat) — не автоматизируется"

# Metrics
duration: 12min
completed: 2026-08-01
status: complete
---

# Phase 01 Plan 01: Решения фазы (decisions) — Summary

**4 решения фазы зафиксированы в STATE.md до каких-либо side-effecting шагов: astro@^7.1.6, черновой site URL portfolio.example.com, GitHub-репозиторий portfolio-ivan-shivarshinov public, формулировка AC R4 sitemap-index.xml — планы 01-03 и 01-07 читают их без повторного вопроса**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-01T20:43:00Z
- **Completed:** 2026-08-01T20:55:00Z
- **Tasks:** 4 (все — checkpoint:decision, закрыты ответами пользователя батчем)
- **Files modified:** 3 (STATE.md, ROADMAP.md; создан SUMMARY.md)

## Accomplishments
- Все 4 чекпоинта-решения закрыты ответами пользователя за один батч; каждый выбор записан с обоснованием, ссылкой на research-checkpoint и планом-потребителем
- AC R6 «astro ^5» в 01-SPEC.md скорректирован на фактический мажор (7.1.6) — оформлено как техническая корректировка формулировки, не изменение требования
- Требование R4 сохранено без изменений: проверки sitemap ориентируются на фактический вывод @astrojs/sitemap 3.x (sitemap-index.xml), смысл «5 маршрутов в sitemap» не тронут
- Решения записаны в секцию Decisions STATE.md с тегами [01-01 T1..T4] — читаемы планами 01-03 (astro major, site URL), 01-07 (repo name/visibility), 01-02/01-05 (sitemap wording) без повторных вопросов
- Ни один npm install не выполнен, ни один git remote не создан — side-effecting шаги остались за блокировкой решений

## Task Commits

Задачи 1–4 — чекпоинты решений, отдельного кода не производят; фиксация решений выполнена одним коммитом:

1. **Задачи 1–4 (checkpoint:decision, все закрыты)** - `71e88ea` (docs: запись 4 решений в STATE.md)

**Plan metadata:** (см. ниже — финальный коммит плана)

## Files Created/Modified
- `.planning/STATE.md` — секция Decisions: 4 записи [01-01 T1..T4] с обоснованием, ссылками на 01-RESEARCH.md (Open Questions 1/3/4/5, Pitfalls 3/4) и указанием планов-потребителей; позиция (Plan 2 of 7), метрики, сессия
- `.planning/ROADMAP.md` — прогресс фазы 01 (1/7 планов)
- `.planning/phases/01-osnova-proekta/01-01-SUMMARY.md` — данный файл

## Decisions Made
1. **Мажор Astro: `astro@^7.1.6`** (вариант astro-7, рекомендация исследования). Основание: npm `latest` = 7.1.6, официальные docs «Astro v7 is here!», @astrojs/mdx@^7 peer-привязан к astro ^7; линия 5.x (5.18.2) — 2 мажора позади. Следствие: AC R6 «astro ^5» корректируется на фактический мажор (техническая корректировка). Research: Open Question 1. Потребитель: 01-03.
2. **Черновой site URL: `https://portfolio.example.com`** (вариант site-draft). Обязателен для sitemap и canonical/og:url; заменяется реальным доменом в фазе 6. Research: Open Question 4, Pitfall 4. Потребитель: 01-03.
3. **GitHub-репозиторий: `portfolio-ivan-shivarshinov`, видимость public** (вариант repo-public). Принято явно: docs/ (PRD, стратегия позиционирования) станут публичными. gh CLI авторизован (Ivan-Shivarshinov, repo+workflow). Research: Open Question 5, Environment Availability. Потребитель: 01-07.
4. **AC R4: проверки и robots.txt ориентируются на `sitemap-index.xml`** (вариант sitemap-index) — фактический вывод @astrojs/sitemap 3.x (sitemap-index.xml + sitemap-0.xml, сплит по entryLimit 45000; файла sitemap.xml нет). Требование R4 не изменено: «sitemap генерируется и содержит все 5 маршрутов» проверяется как раньше. Research: Open Question 3, Pitfall 3. Потребители: 01-02 (check-seo.mjs), 01-05 (robots.txt).

## Deviations from Plan

None - план выполнен точно по тексту: 4 чекпоинта закрыты ответами пользователя, решения записаны, side-effecting шаги не выполнялись.

## Issues Encountered
- SDK `state.add-decision` записал первую запись с плейсхолдером `[Phase ?]` вместо номера фазы — исправлено вручную на `[Phase 01]`, остальные записи добавлены напрямую в едином формате. Внутренняя деталь инструмента, на результат не повлияла.
- `requirements mark-complete` не выполнялся: `requirements: [R4, R6]` во frontmatter плана — номера AC из 01-SPEC.md, а не REQ-ID из REQUIREMENTS.md; кроме того, план их не завершает (проверки R4 — планы 01-02/01-05, R6 — план 01-07). Отметка complete была бы ложной трассировкой.

## User Setup Required

None - внешние сервисы не требуют ручной настройки; gh CLI уже авторизован (repo+workflow).

## Next Phase Readiness
- План 01-02 (валидационный каркас) разблокирован: check-seo.mjs ориентируется на `dist/sitemap-index.xml` согласно решению T4
- План 01-03 (tracer) разблокирован: npm install с astro@^7.1.6 + @astrojs/mdx@^7, `site: "https://portfolio.example.com"` в astro.config.mjs, engines.node >= 22.12
- План 01-07 (CI + remote) разблокирован: имя portfolio-ivan-shivarshinov, видимость public, осознанная публичность docs/
- Блокеров и отложенных пунктов нет

---
*Phase: 01-osnova-proekta*
*Completed: 2026-08-01*
