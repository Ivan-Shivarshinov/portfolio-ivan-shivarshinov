# Phase 3: Контент и страницы - Context

**Gathered:** 2026-08-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Все 6 разделов сайта (Home, Work, Case Study, About, Lab, Contact) наполняются реальным контентом по позиционированию «Product-minded Web Developer»: формула обещания на первом экране, 5–6 кейсов со страницами-разборами «проблема → ответственность → решение → результат», иерархия компетенций Build/Improve/Extend, превью Lab, контактные каналы из единого источника — в спокойном, конкретном тоне без хайпа. Скриншоты кейсов — реальные файлы в репозитории, предоставленные пользователем.

</domain>

<spec_lock>
## Requirements (locked via SPEC.md)

**9 requirements are locked.** See `03-SPEC.md` for full requirements, boundaries, and acceptance criteria.

Downstream agents MUST read `03-SPEC.md` before planning or implementing. Requirements are not duplicated here.

**In scope (from SPEC.md):**
- Контент Home: формула обещания + категория + секция «Избранные работы»
- Контент Work: 5–6 записей в коллекции projects + страницы-разборы `/work/{slug}/`
- Контент About: 4 блока (профиль, аудитории, компетенции B/I/E, траектория)
- Контент Lab: превью направлений + описание процесса
- Контент Contact: 3 канала (email/TG/GitHub) + ссылки в футере из единого источника
- Скриншоты кейсов как файлы в репозитории
- Обновление check-seo (число страниц) и новый denylist-скрипт тона
- Удаление фикстурных карточек SYSTEM DEMO

**Out of scope (from SPEC.md):**
- Реальные эксперименты Lab (LAB-01…04, v2) — отложены в v2, в фазе 3 Lab — превью и процесс
- EN-версия сайта — D-08: поля локали опциональны, EN-страницы не входят
- Контент notes (блог/заметки) — коллекция остаётся пустой (D-07)
- Формы, бэкенд, внешняя CMS, глобальный state — запрещено ADR (статик SSG)
- LinkedIn в контактах — решение пользователя (3 канала: email, Telegram, GitHub)
- Интерактивный индекс работ и переход «список → кейс» — фазы 4–5
- View Transitions и motion-слой — фаза 5
- SEO-полировка, производительность, a11y-аудит — фаза 6
- Изменение навигации (5 маршрутов и метки фиксированы) и палитры тем (5-enum)

</spec_lock>

<decisions>
## Implementation Decisions

### Материал и процесс контента (кейсы, скриншоты, утверждение)
- **D-01:** Готового текста кейсов у пользователя нет — агент пишет черновики из PRD, REQ-текстов и знаний пользователя (интервью в ходе фазы); пользователь правит и утверждает каждый кейс. Состав 5–6 кейсов предлагает агент, пользователь утверждает.
- **D-02:** Скриншоты кейсов пользователь кладёт файлами в репозиторий (PNG/JPG, реальные интерфейсы — K4); агент готовит папку `src/assets/projects/` (структура по слагам кейсов) как место для файлов. Файлы изображений подключаются через Astro pipeline (адаптер baseline стека) в карточку и/или страницу кейса. — **Reversibility:** reversible — структура папки локальна, перенос файлов не ломает контракты
- **D-03:** Именование клиентов — решение per-case при утверждении каждого кейса: реальное название, где допустимо; при NDA — тип клиента + обезличенное описание (K2). Репозиторий public — контент кейсов публикуется осознанно.
- **D-04:** Утверждение кейса — агент показывает черновик в чате (текст + куда легли данные), пользователь правит формулировки, агент коммитит файл после правок; соответствие K1–K4 отмечается при утверждении каждого кейса (в 03-VERIFICATION.md). Черновик — до коммита.

### Темы кейсов (5-enum)
- **D-05:** В схему `projects` добавляется поле `theme` (zod enum: terracotta/clay/olive/slate/plum) — расширение схемы с обоснованием: тема — свойство кейса, рендерится в трёх местах (карточка Work, карточка Home, страница кейса), AC R2 требует тему у каждой карточки; enum валидируется при сборке. — **Reversibility:** costly — схема projects — контракт (check-collections, Stacki-отображение, frontmatter 5–6 кейсов); удаление поля потребует правки всех записей и проверок
- **D-06:** Терракота (#A84B32, системный accent) кейсам НЕ назначается: accent остаётся за интерфейсом (CTA, активная навигация, focus ring); пул тем кейсов — 4 приглушённых цвета (clay/olive/slate/plum). — **Reversibility:** reversible — правило назначения, пересмотр не ломает контракты
- **D-07:** Распределение тем — по содержанию кейса (цвет как ассоциация с характером проекта), повторы допустимы при 5–6 кейсах на 4 цвета (SPEC R2 не требует уникальности); конкретный маппинг назначает план/агент при написании кейса, пользователь видит и может поменять тему в черновике утверждения.

### Избранные работы на Home (R4)
- **D-08:** В схему `projects` добавляется поле `featured` (boolean, default false); секция на `/` фильтрует коллекцию по featured. — **Reversibility:** reversible — булев флаг со значением по умолчанию; удаление поля — правка frontmatter и страницы
- **D-09:** Секция «Избранные работы» — ровно 3 карточки. Строгая проверка: check-collections валидирует число featured в диапазоне 2–3 (иначе FAIL) — паттерн проекта (жёсткие проверки, «0 записей → FAIL»).

### Контакты и копирование email (R7)
- **D-10:** Копирование email в буфер — один vanilla inline-скрипт только на `/contact`: navigator.clipboard с fallback на execCommand; mailto-ссылка остаётся рабочей при отключённом JS (прогрессивное улучшение). Это первый клиентский JS на сайте — без фреймворков и islands, в бюджете статики. — **Reversibility:** reversible — один скрипт в одной странице; удаление не ломает mailto
- **D-11:** Единый источник контактов — `src/data/contacts.json` (паттерн D-02 фазы 1: JSON в src/data типизируются, strict-json-loader); Contact и Footer читают один файл; AC R7 «ссылки на /contact и в футере идентичны» проверяется по этому файлу. — **Reversibility:** reversible — добавление коллекции; удаление тривиально
- **D-12:** Фактические значения каналов (email-адрес, ник Telegram, URL GitHub) пользователь сообщает при выполнении фазы (в PRD/документах их нет — проверено при обсуждении).

### Формула обещания (R1)
- **D-13:** Текст формулы — дословно рекомендуемый REQ-main-promise: «Создаю и развиваю сложные сайты, контентные системы и веб-инструменты. Product-minded web developer. Соединяю Webflow, код, SEO/AEO и возможности ИИ» + категория «веб-разработчик с продуктовым подходом» / «Product-minded web developer»; подпись «от идеи и структуры до запуска и дальнейшего развития». CTA «Смотреть работы» — последний элемент hero (02 D-13). Точная композиция (какие части в моно-слое, какие в display) — Claude's Discretion в рамках hero-concept. — **Reversibility:** reversible — контент, правка текста ничего не ломает

### Claude's Discretion
- Точные формулировки текстов About (4 блока), Lab (2 блока), Home (заголовки секций) — агент пишет из PRD / REQ-audience / REQ-competency-architecture / REQ-growth-trajectory, пользователь утверждает (тот же процесс, что для кейсов)
- Состав denylist тона (≥10 записей) из списков «избегать» REQ-tone (хайповый AI-first язык, «революционные решения», лишние англицизмы, образ гения-одиночки); паттерн self-test с фикстурой-нарушителем — из check-prohibitions.mjs
- Обновление check-seo.mjs (EXPECTED_PAGES и EXPECTED_SITEMAP_URLS 5 → факт 10–11: 5 страниц + 5–6 кейсов), check-collections.mjs (projects 5–6, notes 0, featured 2–3, theme enum), check-theme.mjs под новые темы
- Формат страницы кейса: шапка с meta (role · year · stack · client-type), Media-скриншот, 4 раздела по D-05 фазы 1, моно-подписи, навигация к остальным кейсам; SEO title/description из frontmatter (title + summary)
- Структура секции «Избранные» на Home: SectionHeading + моно-индекс секции (язык «номеров и подписей»)
- Порядок 3 каналов на /contact; поведение кнопки копирования (состояния copied/error)
- Уточнение формулировок меток nav/footer по тону (deferred 02)
- Судьба IconLinkedin (не используется — LinkedIn вне контактов): удалить или оставить как задел — решает план
- Удаление фикстурных карточек SYSTEM DEMO и маркера `// fixture: replaced in phase 3`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Locked requirements
- `.planning/phases/03-kontent-i-stranicy/03-SPEC.md` — Locked requirements — MUST read before planning (9 требований, 14 AC, границы, constraints, K1–K4, edge-покрытие)

### Контекстные документы (источники контента)
- `docs/positioning_portfolio_ivan_shivarshinov.md` — PRD: позиционирование, формула обещания (REQ-main-promise — текст дословно, D-13), аудитории и ситуации клиента (REQ-audience), тон (REQ-tone — списки «использовать/избегать»)
- `.planning/REQUIREMENTS.md` — REQ-main-promise, REQ-tone, REQ-audience, REQ-competency-architecture (Build/Improve/Extend), REQ-evidence-cases (4 вопроса кейса), REQ-growth-trajectory (3 ступени)
- `.planning/intel/SYNTHESIS.md` — синтез 5 исходных документов (точка входа контекста)
- `docs/hero-concept.md` — концепт первого экрана (02 D-15): куда ложится формула под именем, CTA — последний элемент
- `docs/design_direction_portfolio_ivan_shivarshinov.md` — дизайн-направление (SPEC, precedence 0): моно-слой «номера и подписи», «крупные реальные интерфейсы и схемы вместо мокапов», §08 бюджет интерактивности
- `docs/Техническая стратегия портфолио Astro + AI-агент + Stacki.md` — ADR: статика SSG, порядок анимаций, quality gates, правила компонентной архитектуры для Stacki

### Решения прошлых фаз
- `.planning/phases/02-vizualnaya-sistema/02-CONTEXT.md` — решения фазы 2: D-03 (footer-оболочка, контент — фаза 3), D-07 (палитра 5-enum, терракота — системный accent, costly), D-08 (приглушённые акценты, контраст), D-12/D-13 (hero: формула — фаза 3, CTA последний), D-16 (Lumos — референс принципов)
- `.planning/phases/01-osnova-proekta/01-CONTEXT.md` — решения фазы 1: D-02 (JSON в src/data типизируются), D-04 (Stacki-композиция страниц), D-05 (схема projects: 4 вопроса в MDX-теле), D-07 (notes пуста намеренно), D-08 (русский контент, задел EN), D-09 (сортировка по order)
- `.planning/phases/01-osnova-proekta/01-UI-SPEC.md` — UI-контракт фазы 1: типографика 4 роли, accent для активной навигации, light-only

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ProjectCard.astro` — карточка готова под контент: theme-проп (5-enum, ACCENTS-маппинг), слоты media/дефолтный, meta (role · year), showMetrics; терракота маппится на var(--color-accent)
- `src/components/Media.astro` — медиа-оболочка figure + ratio + слот — принимает `<Image />` фазы 3
- `src/components/Tag.astro`, `SectionHeading.astro`, `Button.astro`, `Link.astro` — готовы; иконки IconMail/IconCopy/IconGithub/IconTelegram (IconLinkedin — не используется, LinkedIn вне контактов)
- `src/layouts/BaseLayout.astro` — nav (5 маршрутов, русские метки, W1-фикс), footer-оболочка без ссылок контента (02 D-03)
- `src/components/Seo.astro` — SEO-компонент (title/description/canonical/OG) — для уникальных пар страниц кейсов
- `src/content.config.ts` — strictProjectId (дубль slug падает сборку), strict-json-loader (для contacts.json), схемы проектов/ноутов/сервисов
- `scripts/check-*.mjs` — набор строгих проверок с self-test (паттерн для check-tone.mjs denylist)

### Established Patterns
- Данные — в файлах, не в коде: frontmatter/MDX для кейсов, JSON в src/data (D-02) — решения D-05/D-08/D-11 следуют этому
- Stacki-совместимая композиция страниц: layout + плоский список self-closing компонентов с props (01 D-04)
- Строгие проверки: каждая контрактная граница (5–6 записей, featured 2–3, theme enum, отсутствие SYSTEM DEMO) — check-скрипт с self-test, FAIL на нарушение
- Scoped styles + CSS-переменные в компонентах; всё потребляется через var() (check-tokens); кавычки frontmatter — одинарные
- Контент кейсов — MDX: 4 вопроса в теле (D-05), frontmatter — метаданные

### Integration Points
- `src/content.config.ts` — добавляются: поле theme (D-05), поле featured (D-08) в схему projects; коллекция contacts (D-11)
- `src/pages/index.astro` — формула обещания под именем (D-13) + секция «Избранные работы» (3 карточки, D-09)
- `src/pages/work.astro` — замена SYSTEM DEMO на карточки из коллекции; `src/pages/work/[slug]/index.astro` — новый динамический маршрут (getStaticPaths по коллекции)
- `src/pages/about.astro`, `lab.astro`, `contact.astro` — замена empty-state на контент; contact.astro — vanilla inline-скрипт копирования (D-10)
- `src/components/Footer.astro` — ссылки контактов из contacts.json (D-11)
- `src/assets/projects/` — новая папка для скриншотов пользователя (D-02), подключение через Astro Image
- `scripts/check-seo.mjs` — EXPECTED_PAGES/EXPECTED_SITEMAP_URLS: 5 → 10–11; `scripts/check-collections.mjs` — 0 записей → 5–6, notes 0; новый `scripts/check-tone.mjs` — denylist ≥10 + self-test

</code_context>

<specifics>
## Specific Ideas

- «Агент черновит, я правлю» — пользователь не поставляет готовых текстов кейсов; процесс: черновик в чате → правки → коммит → K1–K4 в верификации
- «Положу файлы в репозиторий» — скриншоты поставляет пользователь файлами; агент готовит структуру папки заранее
- «Текст PRD дословно» — формула обещания без редактирования (D-13)
- «Терракота — только интерфейс» — accent не конкурирует с контентом (SC3 «нейтральный покой»)
- Крупные реальные интерфейсы вместо мокапов (дизайн-направление) — скриншоты реальных проектов, не заглушки и не стоки (K4)

</specifics>

<deferred>
## Deferred Ideas

- **Остальные секции главной из дизайн-направления** (Capabilities, Featured Case, How I Work, Lab Preview на Home, UX/IA-схема) — за пределами SPEC фазы 3 (Home = hero + Selected Work); при необходимости — отдельная фаза или решение
- **Реальные эксперименты Lab** (LAB-01…04) — v2, SPEC out of scope
- **EN-версия, контент notes, формы/бэкенд, LinkedIn** — вне фазы (SPEC out of scope)

</deferred>

---

*Phase: 03-kontent-i-stranicy*
*Context gathered: 2026-08-03*
