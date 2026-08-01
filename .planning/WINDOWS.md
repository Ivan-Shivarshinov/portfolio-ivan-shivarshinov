---
schema_version: 1
open_count: 2
waived_count: 0
fixed_count: 0
total_count: 2
last_updated: 2026-08-01T21:22:24.049Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | stub | src/pages/index.astro |  | Placeholder text «Фаза 2 — визуальная система» + primary CTA намеренно не рендерится (UI-SPEC: scaffolding-only, CTA с фазы 2) | open |  | 2026-08-01T21:22:23.681Z |  |
| 2 | 01 | stub | src/layouts/BaseLayout.astro |  | Пустой footer-заглушка по плану Task 1 шаг 10; визуальная сборка chrome — фаза 2 | open |  | 2026-08-01T21:22:24.049Z |  |

````json
[
  {
    "id": 1,
    "kind": "stub",
    "phase": "01",
    "file": "src/pages/index.astro",
    "line": null,
    "description": "Placeholder text «Фаза 2 — визуальная система» + primary CTA намеренно не рендерится (UI-SPEC: scaffolding-only, CTA с фазы 2)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T21:22:23.681Z",
    "resolved_at": null
  },
  {
    "id": 2,
    "kind": "stub",
    "phase": "01",
    "file": "src/layouts/BaseLayout.astro",
    "line": null,
    "description": "Пустой footer-заглушка по плану Task 1 шаг 10; визуальная сборка chrome — фаза 2",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T21:22:24.049Z",
    "resolved_at": null
  }
]
````
