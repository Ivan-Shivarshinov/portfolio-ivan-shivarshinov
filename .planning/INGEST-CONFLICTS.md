## Conflict Detection Report

### BLOCKERS (0)

Нет блокирующих конфликтов.

### WARNINGS (0)

Нет предупреждений.

### INFO (3)

[INFO] Авто-разрешение: центральная механика — интерактивный индекс работ, hero — лёгкий
  Found: docs/motion-concept-portfolio.md (DOC) предписывает построить hero вокруг одного интерактивного объекта и сделать hero-сцену центральной («Построить hero вокруг одного интерактивного объекта», «Hero на один экран, один Three.js-объект, один контролируемый переход по скроллу»).
  Expected: docs/design_direction_portfolio_ivan_shivarshinov.md (SPEC, precedence 0) и docs/portfolio_threejs_project_brief.md (SPEC, precedence 1) фиксируют центральной механикой интерактивный индекс проектов Work; «абстрактный blob или сфера в hero без связи с работами» не рекомендуются; hero — «без обязательного 3D».
  → По правилам приоритета (SPEC precedence 0/1 > DOC) в синтез включена центральная механика «интерактивный индекс работ»; требования motion-документа к fallback, reduced-motion и производительности сохранены полностью.
  source: docs/motion-concept-portfolio.md; docs/design_direction_portfolio_ivan_shivarshinov.md; docs/portfolio_threejs_project_brief.md

[INFO] Авто-разрешение: GSAP/FLIP допустим для центрального перехода при соблюдении бюджета интерактивности
  Found: docs/design_direction_portfolio_ivan_shivarshinov.md (SPEC, precedence 0, раздел 09) — «GSAP/FLIP-переходы между списком и кейсом» реалистичны для первой версии; docs/motion-concept-portfolio.md (раздел 7.3) — GSAP ScrollTrigger как один из вариантов связи со скроллом.
  Note: docs/Техническая стратегия портфолио Astro + AI-агент + Stacki.md (ADR) задаёт порядок выбора технологий «CSS transitions → vanilla JavaScript → View Transitions → island» и «не следует заранее добавлять большое количество анимационных библиотек»; прямого запрета GSAP в ADR нет, а design SPEC имеет более высокий приоритет (precedence 0). Синтез: GSAP/FLIP допустим для единственного центрального перехода «список → кейс» при соблюдении бюджета «одна центральная механика, один выразительный переход» (design SPEC, раздел 08).
  source: docs/design_direction_portfolio_ivan_shivarshinov.md; docs/motion-concept-portfolio.md; docs/Техническая стратегия портфолио Astro + AI-агент + Stacki.md

[INFO] Авто-разрешение: платформа портфолио — Astro; упоминания Webflow — контекст, а не решение
  Found: docs/design_direction_portfolio_ivan_shivarshinov.md (раздел 09) — «Что реалистично сделать с Webflow и AI-assisted coding»; docs/motion-concept-portfolio.md (раздел 7.4) — «Если основной сайт реализуется в Webflow» (условная формулировка); docs/positioning_portfolio_ivan_shivarshinov.md — «Webflow остаётся наиболее доказанной платформой, но не должен ограничивать профессиональную идентичность».
  Note: Ни один документ не утверждает, что портфолио строится в Webflow: формулировки позиционные, оценочные или условные. Решение о платформе принято в ADR: портфолио строится на Astro, Stacki — визуальная поверхность над тем же кодом, источник истины — файлы проекта в Git. docs/portfolio_threejs_project_brief.md (SPEC, раздел 2.5) подтверждает целевой стек Astro + Stacki + AI-агент + Git. Конфликта нет; в синтезе платформа зафиксирована по ADR, Webflow сохранён как компетенция и контекст позиционирования.
  source: docs/design_direction_portfolio_ivan_shivarshinov.md; docs/motion-concept-portfolio.md; docs/positioning_portfolio_ivan_shivarshinov.md; docs/Техническая стратегия портфолио Astro + AI-агент + Stacki.md; docs/portfolio_threejs_project_brief.md
