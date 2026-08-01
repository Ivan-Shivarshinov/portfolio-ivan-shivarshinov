---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 01
current_phase_name: osnova-proekta
status: executing
stopped_at: Completed 01-02-PLAN.md (validation scaffolding)
last_updated: "2026-08-01T21:06:36.080Z"
last_activity: 2026-08-01
last_activity_desc: Phase 01 execution started
progress:
  total_phases: 1
  completed_phases: 0
  total_plans: 7
  completed_plans: 2
---

# Состояние проекта

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-31)

**Core value:** Портфолио подтверждает позиционирование «веб-разработчик с продуктовым подходом»: центральная интерактивная механика (индекс работ) — осмысленное доказательство компетенции, а не декоративный эффект
**Current focus:** Phase 01 — osnova-proekta

## Current Position

Phase: 01 (osnova-proekta) — EXECUTING
Plan: 3 of 7
Status: Ready to execute
Last activity: 2026-08-01 — Phase 01 execution started

Progress: [███░░░░░░░] 29%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| (появится после выполнения планов) | | | |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 12 | 4 tasks | 3 files |
| Phase 01 P02 | 15 | 2 tasks | 5 files |

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

Last session: 2026-08-01T21:06:36.066Z
Stopped at: Completed 01-02-PLAN.md (validation scaffolding)
Resume file: None
