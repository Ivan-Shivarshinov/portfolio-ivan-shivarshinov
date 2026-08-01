---
phase: 1
slug: osnova-proekta
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-01
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Источник: `01-RESEARCH.md` § Validation Architecture (зафиксировано исследователем 2026-08-01).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Нет фреймворка — plain Node.js скрипты (`node --test`/`--eval`) + CLI-проверки; фаза не содержит юнит-логики, валидация на уровне сборки/артефактов |
| **Config file** | none — скрипты в `scripts/` + npm scripts в package.json |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run verify` (build + check-seo + check-tokens + check-collections) |
| **Estimated runtime** | ~60–90 секунд |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` (быстрая проверка целостности)
- **After every plan wave:** Run `npm run verify` (build + check-seo + check-tokens + check-collections)
- **Before `/gsd-verify-work`:** Полный `npm run verify` зелёный + CI зелёный на первом push + spike-документ закоммичен
- **Max feedback latency:** ~90 секунд

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| (plan tasks TBD — rows по требованиям) | | | | | | | | | |
| R1 | — | 0 | R1 | — | N/A | smoke/CLI | `npm ci && npm run build` (exit 0) | ❌ W0 (package.json) | ⬜ pending |
| R1 | — | 0 | R1 | — | N/A | smoke/CLI | `scripts/verify-preview.mjs`: preview HTTP 200 на / /work /lab /about /contact | ❌ W0 | ⬜ pending |
| R2 | — | 0 | R2 | — | N/A | unit (node) | `scripts/check-tokens.mjs`: ровно 1 файл токенов, 5 групп, нет хардкод-значений | ❌ W0 | ⬜ pending |
| R3 | — | 0 | R3 | — | N/A | unit (CLI) | `npm run check` (`astro check`, strict, полные и пустые коллекции) exit 0 | ❌ W0 (package.json) | ⬜ pending |
| R3 | — | 0 | R3 | — | N/A | negative | `scripts/check-collections.mjs`: временная фикстура дубликата slug → build fail → restore | ❌ W0 | ⬜ pending |
| R3 | — | 0 | R3 | — | N/A | negative | `scripts/check-collections.mjs`: запись без обязательного поля → build fail | ❌ W0 | ⬜ pending |
| R3 | — | 0 | R3 | — | N/A | unit | `npm run build` при пустых коллекциях (notes = 0) | ❌ W0 | ⬜ pending |
| R4 | — | 0 | R4 | — | N/A | unit (node) | `scripts/check-seo.mjs`: 5 уникальных пар title/description в dist/*.html | ❌ W0 | ⬜ pending |
| R4 | — | 0 | R4 | — | N/A | unit (node) | `scripts/check-seo.mjs`: canonical + OG на всех 5 страницах | ❌ W0 | ⬜ pending |
| R4 | — | 0 | R4 | — | N/A | unit (node) | `scripts/check-seo.mjs`: sitemap-index.xml содержит 5 url | ❌ W0 | ⬜ pending |
| R5 | — | 0 | R5 | — | N/A | manual + grep | `scripts/check-spike-doc.mjs`: docs/stacki-coverage.md, 8 конструкций + 2 edge, вердикты; порядок коммитов — git log | ❌ W0 | ⬜ pending |
| R6 | — | 0 | R6 | — | N/A | manual + CLI | `git remote -v`; порядок шагов в .github/workflows/ci.yml; node-скрипт по engines | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*Task ID колонка заполняется планировщиком при создании планов (rows выше группированы по требованиям R1–R6 из SPEC).*

---

## Wave 0 Requirements

- [ ] `scripts/verify-preview.mjs` — HTTP 200 по 5 маршрутам preview (R1)
- [ ] `scripts/check-tokens.mjs` — единый файл токенов, 5 групп, запрет хардкода (R2)
- [ ] `scripts/check-collections.mjs` — негативные фикстуры: дубликат slug/id, отсутствие обязательного поля (R3)
- [ ] `scripts/check-seo.mjs` — уникальность title/description, canonical+OG, sitemap-index.xml (R4)
- [ ] `scripts/check-spike-doc.mjs` — покрытие 8 конструкций + 2 edge в docs/stacki-coverage.md (R5)
- [ ] `package.json` scripts: dev/build/preview/lint/check/verify + engines (R1, R6)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Проверка Stacki-покрытия против реального приложения | R5 | Stacki не установлен (0 релизов на GitHub); поведение вне README непроверяемо автоматически | Открыть проект в Stacki (или fallback из исходников по README), пройти 8 конструкций + 2 edge, зафиксировать вердикты в docs/stacki-coverage.md |
| CI зелёный на первом push | R6 | Требует реального пуша в GitHub | После создания репозитория запушить и проверить GitHub Actions (lint → build) |
| Порядок коммитов «spike до визуальной сборки» | R5 | Проверяется по git log | `git log --oneline` — commit spike-документа предшествует commits с визуальной сборкой |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
