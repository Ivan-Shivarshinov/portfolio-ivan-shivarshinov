# Синтез ингеста документов (SYNTHESIS.md)

Дата: 2026-07-31
Режим: new (EXISTING_CONTEXT: пусто)
Точка входа для gsd-roadmapper.

## Документы (5)
- ADR: 1 — docs/Техническая стратегия портфолио Astro + AI-агент + Stacki.md
- SPEC: 2 — docs/design_direction_portfolio_ivan_shivarshinov.md (precedence 0), docs/portfolio_threejs_project_brief.md (precedence 1)
- PRD: 1 — docs/positioning_portfolio_ivan_shivarshinov.md
- DOC: 1 — docs/motion-concept-portfolio.md
- UNKNOWN / low-confidence: 0
- Циклы в cross_refs: не обнаружены (все cross_refs пусты; граф пуст, глубина 0)

## Эффективный порядок приоритета (после per-doc override)
1. design_direction (SPEC, precedence 0)
2. threejs project brief (SPEC, precedence 1)
3. Техническая стратегия (ADR, default)
4. Позиционирование (PRD, default)
5. Motion-концепция (DOC, default)

## Решения (decisions.md)
- Всего решений: 9
- locked: 0 (все proposed — ADR не locked)
- Источник: docs/Техническая стратегия портфолио Astro + AI-агент + Stacki.md
- Ключевые темы: гибридная модель Astro + AI-агент + Stacki + Git; единый источник истины — файлы Astro-проекта в Git; компонентная архитектура и design tokens; разделение данных (Content Collections / JSON / frontmatter / props); workflow из 3 этапов + цикл секции из 8 шагов; порядок технологий анимации; quality gates; baseline стека; риски Stacki.

## Требования (requirements.md)
- Всего требований: 8
- Источник: docs/positioning_portfolio_ivan_shivarshinov.md
- ID: REQ-positioning-category, REQ-main-promise, REQ-audience, REQ-competency-architecture, REQ-evidence-cases, REQ-tone, REQ-design-implications, REQ-growth-trajectory

## Ограничения (constraints.md)
- Всего ограничений: 19
- По типам: nfr — 8, protocol — 8, schema — 3, api-contract — 0
- Источники: docs/design_direction_portfolio_ivan_shivarshinov.md (9 ограничений), docs/portfolio_threejs_project_brief.md (10 ограничений)

## Контекст (context.md)
- Тем: 13
- Источник: docs/motion-concept-portfolio.md

## Конфликты
- BLOCKERS: 0
- WARNINGS (competing-variants): 0
- INFO (auto-resolved): 3
- Детали: .planning/INGEST-CONFLICTS.md
- Кратко: центральная механика — индекс работ (SPEC 0/1 > DOC); GSAP/FLIP допустим для центрального перехода; платформа — Astro, упоминания Webflow — контекст.

## Выходные файлы
- decisions.md, requirements.md, constraints.md, context.md — в этом каталоге (.planning/intel/)
- Отчёт о конфликтах: .planning/INGEST-CONFLICTS.md

## Статус
READY — безопасно передавать в gsd-roadmapper (блокеров и неразрешённых вариантов нет).
