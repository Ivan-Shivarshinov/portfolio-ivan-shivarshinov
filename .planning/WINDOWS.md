---
schema_version: 1
open_count: 6
waived_count: 0
fixed_count: 0
total_count: 6
last_updated: 2026-08-02T21:45:36.540Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | stub | src/pages/index.astro |  | Placeholder text «Фаза 2 — визуальная система» + primary CTA намеренно не рендерится (UI-SPEC: scaffolding-only, CTA с фазы 2) | open |  | 2026-08-01T21:22:23.681Z |  |
| 2 | 01 | stub | src/layouts/BaseLayout.astro |  | Пустой footer-заглушка по плану Task 1 шаг 10; визуальная сборка chrome — фаза 2 | open |  | 2026-08-01T21:22:24.049Z |  |
| 3 | 01 | stub | src/pages/work.astro |  | Placeholder «Раздел в разработке — кейсы появятся в фазе 3» на work/lab/about/contact — намеренный (UI-SPEC empty static-content), резолвится фазами 2-3 | open |  | 2026-08-01T21:46:14.929Z |  |
| 4 | 02 | stub | src/pages/work.astro |  | SYSTEM DEMO с фикстурными ProjectCard (AC#7, маркер // fixture: replaced in phase 3) — реальные кейсы content collections в фазе 3 | open |  | 2026-08-02T21:45:35.794Z |  |
| 5 | 02 | stub | src/pages/work.astro |  | Media-слоты без изображения (edge R7, контракт для <Image /> фазы 3) | open |  | 2026-08-02T21:45:36.168Z |  |
| 6 | 02 | stub | src/pages/index.astro |  | hero-shell только D-13-минимум; текст формулы обещания и подписи — фаза 3 (REQ-main-promise, зафиксировано в docs/hero-concept.md) | open |  | 2026-08-02T21:45:36.540Z |  |

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
  },
  {
    "id": 3,
    "kind": "stub",
    "phase": "01",
    "file": "src/pages/work.astro",
    "line": null,
    "description": "Placeholder «Раздел в разработке — кейсы появятся в фазе 3» на work/lab/about/contact — намеренный (UI-SPEC empty static-content), резолвится фазами 2-3",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T21:46:14.929Z",
    "resolved_at": null
  },
  {
    "id": 4,
    "kind": "stub",
    "phase": "02",
    "file": "src/pages/work.astro",
    "line": null,
    "description": "SYSTEM DEMO с фикстурными ProjectCard (AC#7, маркер // fixture: replaced in phase 3) — реальные кейсы content collections в фазе 3",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-02T21:45:35.794Z",
    "resolved_at": null
  },
  {
    "id": 5,
    "kind": "stub",
    "phase": "02",
    "file": "src/pages/work.astro",
    "line": null,
    "description": "Media-слоты без изображения (edge R7, контракт для <Image /> фазы 3)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-02T21:45:36.168Z",
    "resolved_at": null
  },
  {
    "id": 6,
    "kind": "stub",
    "phase": "02",
    "file": "src/pages/index.astro",
    "line": null,
    "description": "hero-shell только D-13-минимум; текст формулы обещания и подписи — фаза 3 (REQ-main-promise, зафиксировано в docs/hero-concept.md)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-02T21:45:36.540Z",
    "resolved_at": null
  }
]
````
