# Deferred Items — Phase 02 (vizualnaya-sistema)

Out-of-scope discoveries logged per SCOPE BOUNDARY rule. Not fixed here — logged for later phases.

| # | Date | Item | Where | Why deferred | Suggested owner |
|---|------|------|-------|--------------|-----------------|
| 1 | 2026-08-03 | GitHub Actions annotation: «Node.js 20 is deprecated… actions/checkout@v4, actions/setup-node@v4 are being forced to run on Node.js 24» | .github/workflows/ci.yml (lint-and-build job) | Warning only — run succeeds (conclusion: success on 198ad68). Workflow inherited from phase 1 (01-07), plan 02-06 threat T-02-06 disposition = accept (no changes in phase 2). Fix = bump checkout/setup-node to v5 majors — fits phase 6 (quality/launch) or a chore plan | Phase 6 (Качество и запуск) |
