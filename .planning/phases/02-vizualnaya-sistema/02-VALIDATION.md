---
phase: 2
slug: vizualnaya-sistema
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-02
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Паттерн фазы 1: нет тест-фреймворка — plain Node-скрипты с self-tests + CLI-проверки. Фаза 2 продолжает его (никакие новые devDependencies не вводятся).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Нет фреймворка — plain Node.js скрипты с self-tests (`--self-test`) + CLI-проверки (паттерн фазы 1) |
| **Config file** | none — скрипты в `scripts/`, npm scripts в package.json |
| **Quick run command** | `npm run build` (~30–60 сек) |
| **Full suite command** | `npm run verify` — расширяется: build + check-seo + check-tokens (расширенный, включает W1-ассерт) + check-contrast (новый) + check-collections + check-prohibitions |
| **Estimated runtime** | ~60–120 сек |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run verify` (полный набор, включая check-contrast)
- **Before `/gsd-verify-work`:** полный `npm run verify` зелёный + CI зелёный + визуальный проход 375/768/1200 зафиксирован в VERIFICATION
- **Max feedback latency:** ~120 секунд

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| (заполняется на этапе выполнения) | 01 | 1 | R1 | — | N/A | unit (node) | `node scripts/check-tokens.mjs` (+ `--self-test`) | ⚠️ существует — расширяется | ⬜ pending |
| | 01 | 1 | R2 | — | N/A | smoke/CLI + unit (dist) | `node scripts/verify-preview.mjs --routes / /work /lab /about /contact`; W1-ассерт в check-tokens (после build) | ⚠️ verify-preview есть; W1-ассерт — Wave 0 | ⬜ pending |
| | 01 | 1 | R3 | — | N/A | grep + build | grep-контроль использования; `npm run build` (пустые пропы — дефолты) | ❌ grep-контроль — Wave 0 | ⬜ pending |
| | 01 | 1 | R4 | — | N/A | grep + unit (dist) | grep transition-токенов в check-tokens; grep `<script` по dist; reduced-motion — manual | ❌ grep-правило — Wave 0 | ⬜ pending |
| | 01 | 1 | R5 | — | N/A | unit (CLI) + negative | `npm run check` (TS strict); negative-фикстура theme="bad" → astro check exit 1 → restore | ❌ negative-фикстура — Wave 0 | ⬜ pending |
| | 01 | 1 | R6 | — | N/A | manual | проход 320/375/768/1200 зафиксирован в VERIFICATION | manual-only | ⬜ pending |
| | 01 | 1 | R7 | — | N/A | build + manual | `npm run build` (дефолты Media); визуальная проверка | manual-only | ⬜ pending |
| | 01 | 1 | R8 | — | N/A | unit (node) | `node scripts/check-contrast.mjs` (+ `--self-test` с эталонами 21:1, 5.40:1) | ❌ — Wave 0 (новый скрипт) | ⬜ pending |
| | 01 | 1 | R9 | — | N/A | manual + doc | проверка docs/hero-concept.md (наличие, критерии D-14) | manual-only | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/check-contrast.mjs` — новый: пары UI-SPEC ≥ 4.5:1, self-tests с эталонами (R8)
- [ ] `scripts/check-tokens.mjs` — расширение: bp-группа, токены lead/caption/easing, сверка чисел media-query, grep-правило transition-токенов (R1, R4)
- [ ] W1-ассерт по dist-html (внутри check-tokens или отдельным шагом; порядок build → проверка) (R2)
- [ ] negative-фикстура невалидного theme → astro check exit 1 → restore (R5)
- [ ] grep-контроль использования компонентов на страницах (R3)
- [ ] обновление npm-скрипта `verify` (порядок: build → проверки)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Адаптивность без горизонтального скролла на 320px; визуальный проход 375/768/1200 | R6 | Сетка адаптивности — визуальное суждение, не ассерт | Проход пользователя в браузере на 320/375/768/1200, фиксация в VERIFICATION |
| Media без изображения рендерит рамку с ratio; слот обрезается | R7 | Визуальная проверка рендера | Проход в проходе верификации |
| 2–3 артефакта концептов + docs/hero-concept.md с выбором и обоснованием D-14 | R9 | Выбор пользователя, критерии реализуемости | Проверка наличия документа и обоснования |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
