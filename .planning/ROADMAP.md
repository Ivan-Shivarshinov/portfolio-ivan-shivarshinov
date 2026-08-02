# Roadmap: Portfolio — Иван Шиваршинов

## Overview

Путь от пустого репозитория до опубликованного портфолио: сначала основа проекта (Astro-каркас, design tokens, схемы данных и spike-проверка рабочего цикла со Stacki), затем визуальная система «Calm Interface, Active Work», затем реальный контент всех разделов по позиционированию Product-minded Web Developer, затем центральная механика — изолированный прототип интерактивного индекса работ на Three.js с вердиктом Integrate / Move to Lab / Discard, затем production-интеграция индекса и единый выразительный переход «список → кейс», и наконец полный прогон quality gates, публикация и документация интерактивного слоя как инженерного кейса.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Основа проекта** - Astro-каркас, tokens, схемы данных, layouts, SEO и spike-проверка Stacki (completed 2026-08-02)
- [ ] **Phase 2: Визуальная система** - типографика, цвет, сетка, переиспользуемые компоненты, motion-токены
- [ ] **Phase 3: Контент и страницы** - Home, Work, Case Study, Lab, About, Contact с реальным контентом
- [ ] **Phase 4: Прототип индекса работ** - изолированный Three.js-прототип центральной механики и вердикт
- [ ] **Phase 5: Интеграция индекса и motion** - сцена в Astro island, реальные данные Work, переход «список → кейс»
- [ ] **Phase 6: Качество и запуск** - quality gates, адаптив, SEO, производительность, деплой и кейс интерактивного слоя

## Phase Details

### Phase 1: Основа проекта

**Goal**: Проект на Astro готов как единый источник истины: чистая сборка, структура папок, design tokens, схемы данных, базовые layouts и подтверждённая совместимость рабочего цикла «Astro + AI-агент + Stacki + Git» до начала визуальной сборки.
**Depends on**: Nothing (first phase)
**Requirements**: — (подготовительный этап; закладывает основу для всех требований)
**Success Criteria** (what must be TRUE):

  1. Production build (`astro build`) проходит без ошибок; preview-сборка открывается с корректным HTML на всех базовых страницах.
  2. Design tokens (цвета, шрифты, отступы, контейнеры, motion) определены в CSS-переменных и применяются в стилях проекта.
  3. Content Collections (projects, notes) и JSON-данные (services, skills, tools) валидируются схемами при сборке; включён TypeScript strict.
  4. Базовые layouts и общий SEO-компонент работают: каждая страница получает title, description, canonical, Open Graph; sitemap генерируется.
  5. Существует документ о покрытии конструкций Astro в Stacki (итог spike: открытие проекта, чтение компонентов и props, variants, scoped styles, CSS variables, JSON-коллекции, frontmatter, View Transitions) — зафиксирован в Git до визуальной сборки.

**Plans**: 7/7 plans executed

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Решения фазы: astro major, site URL, repo name/visibility, sitemap-index wording (4 чекпоинта)
- [x] 01-02-PLAN.md — Валидационный каркас Wave 0: 5 скриптов (verify-preview, check-tokens, check-collections, check-seo, check-spike-doc)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-03-PLAN.md — Tracer: каркас Astro + первая страница end-to-end (config, tokens, BaseLayout, Seo, шрифты) + lint-конфиги + check-prohibitions

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-04-PLAN.md — Контентный слой: content.config.ts (5 коллекций), JSON-данные, пустые коллекции, негативные фикстуры
- [x] 01-05-PLAN.md — Страницы-заглушки Work/Lab/About/Contact + robots.txt + SEO/preview-проверки

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-06-PLAN.md — Spike Stacki: временная страница View Transitions, живой прогон, docs/stacki-coverage.md

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 01-07-PLAN.md — CI (lint → check → build) + GitHub-remote + первый зелёный push

### Phase 2: Визуальная система

**Goal**: Единая визуальная система «Calm Interface, Active Work»: нейтральная основа, сильная типографика, строгая модульная сетка, переиспользуемые UI-компоненты с семантическими props и motion-токены; адаптивность живёт внутри компонентов.
**Depends on**: Phase 1
**Requirements**: REQ-design-implications
**Success Criteria** (what must be TRUE):

  1. Все страницы используют общую систему типографики, цвета и сетки через tokens — без случайных one-off значений.
  2. Базовые UI-компоненты (кнопки, ссылки, заголовки секций, карточки проектов, медиа, навигация, footer) переиспользуются и принимают семантические props (layout, density, theme, showMetrics), а не сырые значения отступов.
  3. В спокойном состоянии интерфейс выглядит нейтральным и профессиональным; акценты, цвета проектов и движение проявляются только во взаимодействии.
  4. Компоненты адаптивны: сетка складывается, отступы масштабируются, изображения обрабатываются — на mobile без дублирования стилей и без потери содержания.

**Plans**: TBD
**UI hint**: yes

### Phase 3: Контент и страницы

**Goal**: Все разделы сайта — Home, Work, Case Study, Lab, About, Contact — наполнены реальным контентом по позиционированию: формула обещания, аудитория, компетенции Build / Improve / Extend, кейсы по схеме «проблема → ответственность → решение → результат», тон без пафоса и мост к будущим продуктам.
**Depends on**: Phase 2
**Requirements**: REQ-positioning-category, REQ-main-promise, REQ-audience, REQ-competency-architecture, REQ-evidence-cases, REQ-tone, REQ-growth-trajectory
**Success Criteria** (what must be TRUE):

  1. На первом экране Home посетитель видит формулу обещания и категорию «Product-minded Web Developer» — без ярлыков-клише.
  2. Посетитель проходит путь Home → Work → Case Study → Contact; навигация Work / Lab / About доступна почти из любого состояния сайта.
  3. Каждый кейс отвечает на четыре вопроса (проблема, ответственность, решение, результат) и явно разделяет личный вклад, вклад команды и итоговый эффект.
  4. Capabilities поданы иерархией Build / Improve / Extend без длинного списка инструментов; Lab Preview показывает мост к продуктам, AI и автоматизациям.
  5. Тексты всего сайта соответствуют тону: спокойный, конкретный, технически грамотный, без хайпа и лишних англицизмов.

**Plans**: TBD
**UI hint**: yes

### Phase 4: Прототип индекса работ

**Goal**: Изолированный desktop-прототип центральной механики — интерактивного индекса Work на Three.js — проверяет гипотезу (один ключевой кадр: спокойный текстовый индекс → живая галерея) и получает вердикт Integrate / Move to Lab / Discard.
**Depends on**: Phase 2 (реальная типографика и сетка для визуальной проверки; тестовые данные вместо реальных кейсов)
**Requirements**: — (движится ограничениями brief: центральная механика, роль Three.js, бюджеты прототипа, первый milestone)
**Success Criteria** (what must be TRUE):

  1. Прототип содержит одну Three.js-сцену с 3 тестовыми проектами и 3 визуальными состояниями; переключение работает по hover и по клавиатурному фокусу.
  2. В состоянии покоя индекс выглядит спокойным редакционным списком; активность появляется только в ответ на действие пользователя.
  3. Статичный fallback и reduced-motion состояние работают одновременно с desktop-прототипом, а не после него.
  4. HTML остаётся главным уровнем интерфейса: названия, роли, тип задачи и ссылки доступны без canvas.
  5. Зафиксирован вердикт Integrate / Move to Lab / Discard с обоснованием: краткая схема архитектуры, список ассетов с оценкой веса, вывод о поддержке дизайн-направления.

**Plans**: TBD
**UI hint**: yes

### Phase 5: Интеграция индекса и motion

**Goal**: Центральная механика интегрирована в Astro как изолированный island с реальными данными Work; один выразительный переход «список → кейс» (shared-element, допустим GSAP/FLIP) и системные микроинтеракции работают в рамках бюджета интерактивности; навигация между разделами плавная через View Transitions.
**Depends on**: Phase 3 (реальные данные Work), Phase 4 (вердикт Integrate; при вердикте Move to Lab / Discard план фазы корректируется: индекс остаётся HTML/CSS с hover-preview)
**Requirements**: — (ограничения: архитектура Three.js в Astro, motion по зонам, бюджеты, совместимость со Stacki)
**Success Criteria** (what must be TRUE):

  1. Индекс Work на production-странице использует реальные данные Content Collections; внутри сцены нет дублирования контента проектов.
  2. Переход от превью проекта к обложке кейса работает как shared-element переход и естественно продолжает состояние индекса (один выразительный переход на весь сайт).
  3. Scroll reveal идёт группами (не по каждому абзацу); навигация между Work / Lab / About плавная через Astro View Transitions без дублирования render loop.
  4. Сцена лениво инициализируется, ставится на паузу вне viewport и в неактивной вкладке, ограничивает DPR, корректно освобождает геометрию, материалы и текстуры при навигации.
  5. Визуальные правки в Stacki не ломают сцену: после правок агент проверяет diff, устраняет дубли и inline-хаки; изменение зафиксировано отдельным понятным коммитом.

**Plans**: TBD
**UI hint**: yes

### Phase 6: Качество и запуск

**Goal**: Сайт проходит полный набор quality gates (код, адаптив, доступность, SEO, производительность), публикуется на preview и production-деплой, а интерактивный слой задокументирован как инженерный кейс в Lab.
**Depends on**: Phase 5
**Requirements**: — (quality gates из ADR и критерии качества/принятия из brief)
**Success Criteria** (what must be TRUE):

  1. Сайт доступен на production-URL; preview-деплой обновляется из Git; локальная сборка полностью работоспособна без Stacki.
  2. Адаптив проверен от широкого desktop до узкого mobile (включая планшеты); на touch-экранах hover-сценарии имеют работающие эквиваленты, весь контент доступен без hover.
  3. Доступность: полная навигация с клавиатуры, видимый focus, корректная иерархия заголовков, alt-тексты, достаточный контраст, корректная работа при prefers-reduced-motion.
  4. SEO и производительность: уникальные title/description, canonical, OG, sitemap, robots; изображения в реальном размере отображения с lazy-load ниже fold; canvas не блокирует LCP; клиентский JavaScript минимален и загружается только при необходимости.
  5. Интерактивный слой задокументирован как кейс в Lab: задача, концепция, архитектура, ограничения, варианты, которые не сработали, mobile fallback, производительность, что можно переиспользовать.

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Основа проекта | 7/7 | Complete    | 2026-08-02 |
| 2. Визуальная система | TBD | Not started | - |
| 3. Контент и страницы | TBD | Not started | - |
| 4. Прототип индекса работ | TBD | Not started | - |
| 5. Интеграция индекса и motion | TBD | Not started | - |
| 6. Качество и запуск | TBD | Not started | - |
