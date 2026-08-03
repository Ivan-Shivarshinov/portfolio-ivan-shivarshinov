---
phase: 3
slug: kontent-i-stranicy
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-03
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Юнит-фреймворка в проекте нет — контрактные границы проверяются самописными check-скриптами с self-test (шаблон проекта, фаза 1).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | набор `scripts/check-*.mjs` (самописные, self-test) + `astro check` (TS) + eslint 10 |
| **Config file** | `package.json` scripts; `astro.config.mjs`; `eslint.config.mjs` |
| **Quick run command** | `npm run check-seo -- --self-test` (или целевой `node scripts/check-*.mjs`) |
| **Full suite command** | `npm run verify` (build → check-seo → check-tokens → check-contrast → check-collections → check-prohibitions → check-visual) |
| **Estimated runtime** | ~60 секунд |

---

## Sampling Rate

- **After every task commit:** Run целевой check-скрипт задачи (`node scripts/check-*.mjs`)
- **After every plan wave:** Run `npm run verify`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| (заполняется при планировании) | | | REQ-{XX} | — | N/A (статик SSG, без пользовательского ввода) | check | `node scripts/check-*.mjs` | ⬜ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Ключевые маппинги (из RESEARCH.md §Validation Architecture):**

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-main-promise | Формула + категория на /, CTA последний | check (позитивный ассерт) | `node scripts/check-tone.mjs` | ❌ Wave 0 — новый |
| REQ-positioning-category | Ярлыки-клише отсутствуют на / | check (денлист по index.html) | `node scripts/check-tone.mjs` | ❌ Wave 0 |
| REQ-evidence-cases | 5–6 записей; 4 h2 в теле; дубль slug — FAIL | check + negative | `node scripts/check-collections.mjs` | ❌ Wave 0 — расширение |
| REQ-competency-architecture | About: CAPABILITIES (3 группы B/I/E) | check (позитивный ассерт) | `node scripts/check-tone.mjs` | ❌ Wave 0 |
| REQ-audience | About: AUDIENCES блок | check (позитивный ассерт) | `node scripts/check-tone.mjs` | ❌ Wave 0 |
| REQ-growth-trajectory | About: TRAJECTORY (3 ступени) | check (позитивный ассерт) | `node scripts/check-tone.mjs` | ❌ Wave 0 |
| REQ-tone | Денлист ≥10 + self-test, прогон по dist | check + self-test | `node scripts/check-tone.mjs --self-test` | ❌ Wave 0 |
| R3 (SPEC) | 10–11 страниц, уникальные пары, sitemap | check | `node scripts/check-seo.mjs` | ✅ (обновить константы + self-test) |
| R8 (SPEC) | ≥1 скриншот на кейс, без дублей файлов | check (cover обязателен) | `node scripts/check-collections.mjs` | ❌ Wave 0 — расширение |
| D-10 (JS) | Ровно 1 скрипт на /contact | check | `node scripts/check-tokens.mjs` | ✅ (обновить правило 9 + фикстуры) |
| W1-регрессия | aria-current: 1 на верхнем уровне, 0 на кейсах | check | `node scripts/check-tokens.mjs` | ✅ (обновить правило 7 + фикстуры) |
| K1–K4 | Честность фактов/NDA/роли/визуалов | manual (judgment) | при утверждении кейсов → 03-VERIFICATION.md | — |

---

## Wave 0 Requirements

- [ ] `scripts/check-tone.mjs` — НОВЫЙ: денлист ≥10 + позитивные ассерты (меты About: CAPABILITIES/AUDIENCES/TRAJECTORY, формула на /) + self-test с фикстурой-нарушителем (паттерн check-prohibitions); добавить в verify-цепочку package.json
- [ ] `scripts/check-seo.mjs` — EXPECTED_PAGES/EXPECTED_SITEMAP_URLS 5 → 10–11 + обновление goodPages/sitemap-фикстур self-test
- [ ] `scripts/check-collections.mjs` — границы: projects 5–6 (FAIL при 4/7), featured 2–3, theme ∈ enum, cover присутствует, 4 h2 в теле MDX, дублей файлов скриншотов нет; фикстуры — под новую схему
- [ ] `scripts/check-tokens.mjs` — правило 7 (W1: 0 aria-current на /work/*/index.html), правило 9 (1 script только на /contact) + self-test фикстуры
- [ ] `src/content.config.ts` — поля theme/featured/cover/coverAlt + коллекция contacts (после решения Open Questions 2/4 RESEARCH.md)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Честность кейсов (факты, NDA, разделение вклада, реальные визуалы) | K1–K4 | Судьба пользователя: реальные клиенты, NDA-допустимость, личный вклад | Черновик кейса → правки → утверждение (D-01/D-04); отметка K1–K4 при утверждении в 03-VERIFICATION.md |
| Тон текстов по спискам «использовать/избегать» (REQ-tone) | AC R9 | Семантический проход поверх механического денлиста | Ручной проход всех страниц по спискам REQ-tone при финальной верификации фазы |
| Фактические значения контактов (email/TG/GitHub) | D-12 | Значения сообщает пользователь (в PRD их нет) | Пользователь диктует значения → фиксация в contacts.json → проверка 3 каналов на /contact и в футере |
| Визуальное соответствие UI-SPEC (hero-композиция, секции, копирование) | UI-SPEC | Визуальная сверка дизайн-контракта | Проход страниц против 03-UI-SPEC.md (проверка тем, композиции, состояний кнопки копирования) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
