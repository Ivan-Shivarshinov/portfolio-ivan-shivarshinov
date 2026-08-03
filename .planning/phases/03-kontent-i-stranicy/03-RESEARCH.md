# Phase 3: Контент и страницы — Research

**Researched:** 2026-08-03
**Domain:** контентная модель (Astro Content Collections + MDX), динамические маршруты, astro:assets, SEO-метаданные, тон текстов (denylist-проверки), первый клиентский JS (копирование email)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Материал и процесс контента (кейсы, скриншоты, утверждение)
- **D-01:** Готового текста кейсов у пользователя нет — агент пишет черновики из PRD, REQ-текстов и знаний пользователя (интервью в ходе фазы); пользователь правит и утверждает каждый кейс. Состав 5–6 кейсов предлагает агент, пользователь утверждает.
- **D-02:** Скриншоты кейсов пользователь кладёт файлами в репозиторий (PNG/JPG, реальные интерфейсы — K4); агент готовит папку `src/assets/projects/` (структура по слагам кейсов) как место для файлов. Файлы изображений подключаются через Astro pipeline (адаптер baseline стека) в карточку и/или страницу кейса. — **Reversibility:** reversible — структура папки локальна, перенос файлов не ломает контракты
- **D-03:** Именование клиентов — решение per-case при утверждении каждого кейса: реальное название, где допустимо; при NDA — тип клиента + обезличенное описание (K2). Репозиторий public — контент кейсов публикуется осознанно.
- **D-04:** Утверждение кейса — агент показывает черновик в чате (текст + куда легли данные), пользователь правит формулировки, агент коммитит файл после правок; соответствие K1–K4 отмечается при утверждении каждого кейса (в 03-VERIFICATION.md). Черновик — до коммита.

#### Темы кейсов (5-enum)
- **D-05:** В схему `projects` добавляется поле `theme` (zod enum: terracotta/clay/olive/slate/plum) — расширение схемы с обоснованием: тема — свойство кейса, рендерится в трёх местах (карточка Work, карточка Home, страница кейса), AC R2 требует тему у каждой карточки; enum валидируется при сборке. — **Reversibility:** costly — схема projects — контракт (check-collections, Stacki-отображение, frontmatter 5–6 кейсов); удаление поля потребует правки всех записей и проверок
- **D-06:** Терракота (#A84B32, системный accent) кейсам НЕ назначается: accent остаётся за интерфейсом (CTA, активная навигация, focus ring); пул тем кейсов — 4 приглушённых цвета (clay/olive/slate/plum). — **Reversibility:** reversible — правило назначения, пересмотр не ломает контракты
- **D-07:** Распределение тем — по содержанию кейса (цвет как ассоциация с характером проекта), повторы допустимы при 5–6 кейсах на 4 цвета (SPEC R2 не требует уникальности); конкретный маппинг назначает план/агент при написании кейса, пользователь видит и может поменять тему в черновике утверждения.

#### Избранные работы на Home (R4)
- **D-08:** В схему `projects` добавляется поле `featured` (boolean, default false); секция на `/` фильтрует коллекцию по featured. — **Reversibility:** reversible — булев флаг со значением по умолчанию; удаление поля — правка frontmatter и страницы
- **D-09:** Секция «Избранные работы» — ровно 3 карточки. Строгая проверка: check-collections валидирует число featured в диапазоне 2–3 (иначе FAIL) — паттерн проекта (жёсткие проверки, «0 записей → FAIL»).

#### Контакты и копирование email (R7)
- **D-10:** Копирование email в буфер — один vanilla inline-скрипт только на `/contact`: navigator.clipboard с fallback на execCommand; mailto-ссылка остаётся рабочей при отключённом JS (прогрессивное улучшение). Это первый клиентский JS на сайте — без фреймворков и islands, в бюджете статики. — **Reversibility:** reversible — один скрипт в одной странице; удаление не ломает mailto
- **D-11:** Единый источник контактов — `src/data/contacts.json` (паттерн D-02 фазы 1: JSON в src/data типизируются, strict-json-loader); Contact и Footer читают один файл; AC R7 «ссылки на /contact и в футере идентичны» проверяется по этому файлу. — **Reversibility:** reversible — добавление коллекции; удаление тривиально
- **D-12:** Фактические значения каналов (email-адрес, ник Telegram, URL GitHub) пользователь сообщает при выполнении фазы (в PRD/документах их нет — проверено при обсуждении).

#### Формула обещания (R1)
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

### Deferred Ideas (OUT OF SCOPE)
- **Остальные секции главной из дизайн-направления** (Capabilities, Featured Case, How I Work, Lab Preview на Home, UX/IA-схема) — за пределами SPEC фазы 3 (Home = hero + Selected Work); при необходимости — отдельная фаза или решение
- **Реальные эксперименты Lab** (LAB-01…04) — v2, SPEC out of scope
- **EN-версия, контент notes, формы/бэкенд, LinkedIn** — вне фазы (SPEC out of scope)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-positioning-category | Категория «Product-minded Web Developer», без ярлыков Product Engineer / AI Product Developer / AEO/GEO Specialist / Web Systems Specialist / AI-native Developer | Формула и категория — locked copy D-13 (hero-композиция по 03-UI-SPEC Q5); запрет ярлыков — денлист check-tone по index.html (Pitfall 7: «Product Engineer» легален в траектории /about) |
| REQ-main-promise | Формула обещания на первом экране | Вербатим-текст D-13 (ничего исследовать — locked); позитивный ассерт в check-tone (фрагмент формулы присутствует на /); композиция hero по 03-UI-SPEC |
| REQ-audience | Аудитории + 4 ситуации клиента (запустить / привести в порядок / развивать / расширить) | Материал — PRD §3; блок AUDIENCES на /about (структурный ассерт моно-меты в check-tone); формулировки — черновик агента + утверждение (D-04) |
| REQ-competency-architecture | Иерархия Build / Improve / Extend; «понятный результат → специализация → усиление → рост»; не центр — список инструментов | Материал — PRD §4; блок CAPABILITIES (3 группы) на /about; запасной контент: существующие services.json/skills.json НЕ отражают B/I/E — не использовать как источник |
| REQ-evidence-cases | 5–6 кейсов: проблема → ответственность → решение → результат; разделение личного вклада / команды / эффекта | Модель: MDX + frontmatter (Pattern 1), 4 обязательных h2 в теле (Pattern 2, grep-проверка check-collections); практика кейсов — [CITED: webflow/greatfrontend/udit]; объём ~400–700 слов, честные метрики (K1) |
| REQ-tone | Спокойный, конкретный, без хайпа | check-tone.mjs: денлист ≥10 (стартовый список — Code Example 4, финализирует план), self-test с фикстурой-нарушителем, прогон по dist + ручной проход при UAT (AC R9) |
| REQ-growth-trajectory | 3 ступени: Product-minded Web Developer → Web Product Developer → Product Engineer | Материал — PRD §6; блок TRAJECTORY на /about (3 ступени); конфликт с денлистом ярлыков решён скоупом проверки (только /) |
</phase_requirements>

## Summary

Фаза 3 не вводит новых зависимостей: весь стек уже установлен и проверен фазами 1–2 (astro 7.1.6, @astrojs/mdx 7.0.5, @astrojs/sitemap 3.7.3, zod 4.4.3, sharp 0.35.3 как зависимость astro — Image-пайплайн astro:assets работает «из коробки»). Главные исследовательские вопросы были не «какие библиотеки», а «как уложить контент в существующие контракты» — и здесь обнаружены **четыре обязательных обновления существующих проверок**, без которых фаза не пройдёт зелёный гейт:

1. **check-tokens правило 7 (W1)** — жёстко требует ровно 1 `aria-current="page"` на страницу; страницы кейсов `/work/{slug}/` не совпадают ни с одним маршрутом nav → 0 атрибутов → FAIL. Правило нужно ослабить для «глубоких» страниц (0 допустимо) с обновлением self-test фикстур.
2. **check-tokens правило 9** — запрещает `<script>` в dist (0 тегов); кнопка копирования email (D-10) — первый клиентский JS — уронит проверку. Правило обновляется: ровно 1 скрипт, только на /contact.
3. **check-seo** — EXPECTED_PAGES и EXPECTED_SITEMAP_URLS 5 → 10–11 (5 страниц + 5–6 кейсов); **внутренние self-test фикстуры (5 страниц в goodPages, sitemap с 5 url) тоже обязаны обновиться**, иначе self-test упадёт.
4. **check-collections** — фикстура projectFixture схемо-совместима со старой схемой; при добавлении `theme`/`featured`/`cover` в схему projects фикстуры негативных тестов придётся дополнить, иначе «дубликат slug» упадёт не по задуманной причине.

Архитектурно фаза опирается на два подтверждённых по официальной документации Astro 7 механизма: `render()` из `astro:content` (всё ещё актуальный API для тел MDX в динамических маршрутах, `getStaticPaths` + `props`) и схему-хелпер `image()` для фронтматтер-полей (валидирует и импортирует файл относительно папки записи — естественный способ подключить скриншоты из `src/assets/projects/` и в карточку, и на страницу кейса). Sitemap включает маршруты из `getStaticPaths()` автоматически при статической сборке — правок в astro.config.mjs не требуется.

Тон-контракт строится по паттерну check-prohibitions.mjs (denylist + self-test с фикстурой-нарушителем), но с двумя уточнениями: (а) матчинг по строчным stem-подстрокам русского текста (морфология), (б) денлист обязан учитывать, что «Product Engineer» легально появляется в блоке «Траектория» на /about (REQ-growth-trajectory) — ярлыки из REQ-positioning-category запрещены на первом экране /, а не на всём сайте.

**Primary recommendation:** контент кейсов — MDX + frontmatter (схема projects расширяется полями `theme`, `featured`, `cover`/`coverAlt`), тела с 4 обязательными h2-заголовками («Проблема», «Ответственность», «Решение», «Результат»), страница кейса рендерит тело один раз через `<Content components={{ h2: … }} />` (маппинг h2 → SectionHeading с моно-метой); скриншоты — поле `cover: image()` в frontmatter; контакты — `src/data/contacts.json` через существующий strict-json-loader; копирование email — один vanilla inline-скрипт на /contact с `navigator.clipboard` → fallback `execCommand`, mailto остаётся рабочим без JS.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Контентная модель кейсов (5–6 записей, 4 вопроса) | Content Layer (src/content + схема zod) | Frontend Server (SSG-сборка) | Данные — в файлах (D-05): frontmatter — метаданные, MDX-тело — контент; схема валидируется при сборке (строгие лоадеры фазы 1) |
| Генерация страниц кейсов `/work/{slug}/` | Frontend Server (SSG) | — | getStaticPaths по коллекции → статические HTML; render() тел MDX на сборке |
| Скриншоты (оптимизация, форматы, alt) | Build pipeline (astro:assets + sharp) | CDN / Static (dist) | Image-компонент astro:assets обрабатывает изображения src/ на сборке; alt обязателен |
| Тон, SEO-пары, запреты | Build-time checks (CI/verify цепочка) | — | Контрактные границы фазы проверяются check-скриптами (паттерн проекта) |
| Контакты (email/TG/GitHub) | Content Layer (src/data JSON) | — | Единый источник D-11: Contact и Footer читают одну коллекцию через strict-json-loader |
| Копирование email | Browser (клиент) | — | Первый клиентский JS (D-10): прогрессивное улучшение поверх mailto; ноль фреймворков (ADR) |

## Standard Stack

### Core

Фаза **не устанавливает новых пакетов** — всё необходимое уже в package.json (проверено по node_modules):

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | 7.1.6 | SSG, маршрутизация, content layer, astro:assets | Платформа проекта (locked); `render()` из `astro:content` — актуальный API тел MDX [VERIFIED: docs.astro.build] |
| @astrojs/mdx | 7.0.5 | MDX-тела кейсов (4 вопроса, D-05) | Официальная интеграция; frontmatter валидируется zod-схемой коллекции |
| @astrojs/sitemap | 3.7.3 | sitemap-index.xml → sitemap-0.xml | Включает маршруты getStaticPaths() автоматически [VERIFIED: docs.astro.build]; правок конфига нет |
| astro:assets + sharp | sharp 0.35.3 (внутренняя зависимость astro) | `<Image />` для скриншотов | Дефолтный image-service; alt обязателен, размеры выводятся из метаданных импорта [VERIFIED: docs.astro.build + node_modules] |
| astro/zod (zod) | 4.4.3 | Схемы коллекций | Zod 4 re-export; валидация frontmatter при сборке |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `image()` хелпер схемы | — | Поле `cover` в frontmatter: валидирует и импортирует файл относительно папки записи [VERIFIED: docs.astro.build] | Для скриншотов, используемых и в карточке, и на странице кейса |
| getCollection / getStaticPaths | — | Выборка записей (projects, contacts) | Все страницы фазы: work, [slug], index (featured), contact, Footer |
| `render(entry)` → `<Content />` + `components` prop | — | Рендер MDX-тела с подменой h2 → SectionHeading | Страница кейса (один рендер тела, 4 секции) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Поле `cover: image()` в frontmatter (рекомендуется) | `import.meta.glob('../../assets/projects/**')` по слагам в коде | image() — типобезопасно, валидируется при сборке, файл обязан существовать; glob — ноль изменений схемы, но маппинг slug→файл в коде, ошибки только в runtime сборки [ASSUMED — рекомендация исследователя, решение плана] |
| `<Content components={{ h2: SectionHeadingLike }} />` | 4 × SectionHeading + разбиение тела по маркерам | components-prop — официальный документированный механизм, тело остаётся единым источником; разбиение тела — хрупкий парсинг |
| Встроенный скрипт копирования (~25 строк) | clipboard.js / navigator.clipboard только | Библиотека противоречит ADR-бюджету клиентского JS (ноль фреймворков, статик); нативный API + execCommand-fallback — стандарт отрасли [CITED: MDN] |

**Version verification:** выполнено через node_modules (astro 7.1.6, @astrojs/mdx 7.0.5, @astrojs/sitemap 3.7.3, zod 4.4.3, sharp 0.35.3) — соответствует package.json.

## Package Legitimacy Audit

> Фаза **не устанавливает внешних пакетов** (проверено: package.json не меняется). Проверка легитимности пакетов неприменима — новых зависимостей нет. Единственный «новый код» — vanilla inline-скрипт на /contact (D-10), без зависимостей.

**Packages removed due to [SLOP] verdict:** none — новых пакетов нет.
**Packages flagged as suspicious [SUS]:** none.

## Architecture Patterns

### System Architecture Diagram

```
Пользователь (файлы)                Пользователь (тексты, D-01/D-04)
    │ скриншоты PNG/JPG                  │ черновики → правки → утверждение (K1–K4)
    ▼                                    ▼
src/assets/projects/{slug}/     src/content/projects/{slug}.mdx
    │                                   │ frontmatter: slug/title/summary/role/stack/
    │                                   │   year/status/client-type/order/theme/featured/
    │                                   │   cover (image()) / coverAlt / titleEn?
    │                                   │ тело: 4 h2 + проза (4 вопроса, D-05)
    ▼                                   ▼
┌─────────────────────────────────────────────────────────────┐
│               Content Layer (src/content.config.ts)         │
│  glob + strictProjectId (дубль slug → FAIL)                 │
│  zod-схема projects (theme enum, featured, cover)           │
│  strict-json-loader: src/data/contacts.json (дубль id→FAIL) │
└─────────────────────────────────────────────────────────────┘
    │ getCollection('projects')        │ getCollection('contacts')
    ▼                                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend Server (SSG, astro 7)                 │
│  /            index.astro: hero-формула + featured 2–3      │
│  /work        work.astro: 5–6 ProjectCard                  │
│  /work/{slug} [slug]/index.astro: getStaticPaths → render() │
│  /about,/lab,/contact: блоки + копирование email (D-10)    │
│  Footer: контакты из contacts.json (D-11)                  │
└─────────────────────────────────────────────────────────────┘
    │                                                          │
    ▼                                                          ▼
dist/**/*.html                          sitemap-index.xml → sitemap-0.xml
    │                                      (все маршруты автоматически)
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Verify-цепочка (фаза 3 обновления):                        │
│  check-seo (10–11 страниц/пар/url) · check-tokens (W1-      │
│  правило 7: 0 aria-current на кейсах; правило 9: 1 script   │
│  на /contact) · check-collections (5–6, featured 2–3,       │
│  theme, cover, 4 h2 в теле) · check-tone (denylist ≥10 +    │
│  позитивные ассерты, self-test) · check-contrast · build    │
└─────────────────────────────────────────────────────────────┘
```

Путь посетителя (SC2): `/` (формула + избранные) → `/work` (5–6 карточек) → `/work/{slug}/` (4 раздела + навигация «Все работы»/«Следующий кейс») → `/contact` (3 канала). Навигация Work/Lab/About — в Nav на каждой странице (фаза 2, не меняется).

### Recommended Project Structure

```
src/
├── content/
│   ├── projects/            # 5–6 MDX: {slug}.mdx (существующая папка, 0 записей)
│   └── notes/               # остаётся пустой (D-07)
├── data/
│   └── contacts.json        # НОВЫЙ: 3 канала (email/telegram/github), D-11
├── assets/
│   └── projects/{slug}/     # НОВАЯ папка (D-02): скриншоты пользователя (cover.png + опц.)
├── pages/
│   ├── index.astro          # hero-формула (D-13) + «Избранные работы» (featured 2–3)
│   ├── work.astro           # SYSTEM DEMO → реальные карточки коллекции
│   ├── work/[slug]/index.astro  # НОВЫЙ: динамический маршрут кейса
│   ├── about.astro          # 4 блока (PROFILE/AUDIENCES/CAPABILITIES/TRAJECTORY)
│   ├── lab.astro            # 2 блока (DIRECTIONS/PROCESS) + честный статус
│   └── contact.astro        # 3 канала + кнопка копирования + inline-скрипт (D-10)
├── components/
│   ├── ProjectCard.astro    # РАСШИРЕНИЕ: props summary + href (см. Open Questions 4)
│   ├── Media.astro          # без изменений — принимает <Image /> в слот (R8)
│   └── Footer.astro         # РАСШИРЕНИЕ: ссылки контактов из коллекции (D-11)
└── content.config.ts        # РАСШИРЕНИЕ: theme/featured/cover(+coverAlt) в projects;
                             #   коллекция contacts (strict-json-loader); slug-регэксп (рек.)
scripts/
├── check-tone.mjs           # НОВЫЙ: denylist ≥10 + позитивные ассерты + self-test (R9)
├── check-seo.mjs            # ОБНОВЛЕНИЕ: EXPECTED_PAGES/URLS 10–11 + self-test фикстуры
├── check-collections.mjs    # ОБНОВЛЕНИЕ: 5–6, featured 2–3, theme enum, cover, 4 h2; фикстуры
└── check-tokens.mjs         # ОБНОВЛЕНИЕ: правило 7 (W1: 0 на кейсах), правило 9 (1 script на /contact)
```

### Pattern 1: Контентная модель кейса (MDX + frontmatter + schema-хелперы)

**What:** каждая запись — `src/content/projects/{slug}.mdx`: frontmatter — метаданные (в т.ч. `theme` из 5-enum, `featured: boolean`, `cover: image()`, `coverAlt`), тело — проза четырёх вопросов с **ровно четырьмя h2-заголовками** («Проблема», «Ответственность», «Решение», «Результат») — они становятся секциями страницы через `components`-prop (Pattern 2). `image()` валидирует существование файла при сборке — «скриншот обязателен» (AC R8) получает build-level гарантию.
**When to use:** все кейсы; схема расширяется в `src/content.config.ts` (с обоснованием — D-05/D-08-паттерн: theme — свойство кейса, рендерится в 3 местах; featured — флаг отбора; cover — обязательный визуал R8).

```typescript
// src/content.config.ts — Source: docs.astro.build/en/guides/content-collections/ + /images/
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}', generateId: strictProjectId() }),
  schema: ({ image }) =>
    z.object({
      slug: z.string().regex(/^[a-z0-9-]+$/, 'slug: только латиница, цифры и дефисы (URL-сегмент)'),
      title: z.string(),
      summary: z.string(),
      role: z.string(),
      stack: z.array(z.string()),
      year: z.number().int(),
      status: z.enum(['active', 'archived']),
      'client-type': z.string(),
      order: z.number().int().default(0),
      titleEn: z.string().optional(),
      // D-05: тема кейса (5-enum); D-06: terracotta кейсам НЕ назначается
      theme: z.enum(['terracotta', 'clay', 'olive', 'slate', 'plum']),
      // D-08/D-09: избранное для секции Home
      featured: z.boolean().default(false),
      // R8 (D-02): скриншот, используемый карточкой и/или страницей кейса
      cover: image(),
      coverAlt: z.string(),
    }),
});
```

### Pattern 2: Страница кейса — getStaticPaths + render() + components-prop

**What:** `src/pages/work/[slug]/index.astro`: `getStaticPaths()` маппит записи коллекции в `{ params: { slug }, props: { entry } }`; тело рендерится один раз через `render(entry)`; h2 подменяются на SectionHeading с моно-метой (PROBLEM/RESPONSIBILITY/SOLUTION/RESULT) через официальный `components`-prop — так 4 секции (AC R3) и единый MDX-источник (D-05) не конфликтуют.
**When to use:** единственный способ «4 × SectionHeading + 4 тела» из одного MDX-файла без хрупкого парсинга тела.

```astro
---
// src/pages/work/[slug]/index.astro — Source: docs.astro.build/en/guides/content-collections/
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import SectionHeading from '../../../components/SectionHeading.astro';
import Media from '../../../components/Media.astro';
import { Image } from 'astro:assets';

export async function getStaticPaths() {
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
  return projects.map((entry) => ({ params: { slug: entry.data.slug }, props: { entry, projects } }));
}

const { entry, projects } = Astro.props;
const { Content } = await render(entry);
const SECTION_META = { 'Проблема': 'PROBLEM', 'Ответственность': 'RESPONSIBILITY', 'Решение': 'SOLUTION', 'Результат': 'RESULT' };
const idx = projects.findIndex((p) => p.data.slug === entry.data.slug);
const next = projects[(idx + 1) % projects.length];
const { title, summary, role, stack, year, 'client-type': clientType, cover, coverAlt } = entry.data;
---
<BaseLayout
  title={`${title} — кейс · Иван Шиваршинов`}
  description={summary}
  pageLabel="02 / WORK"
>
  <!-- шапка: моно-meta role · year · stack · client-type + Media со скриншотом -->
  <Media ratio="16:9" caption={coverAlt}>
    <Image class="case-img" src={cover} alt={coverAlt} />
  </Media>
  <!-- тело: h2 → SectionHeading; проза — prose-контракт (UI-SPEC) -->
  <Content components={{
    h2: (props) => <SectionHeading meta={SECTION_META[props.children] ?? 'SECTION'} title={props.children} />,
  }} />
  <!-- нижняя навигация: «Все работы» + «Следующий кейс» (next по order, замыкание) -->
</BaseLayout>
```

### Pattern 3: Контакты — единый источник через strict-json-loader

**What:** `src/data/contacts.json` — массив каналов с уникальными id (требование strict-json-loader, фаза 1): `{ id, label, value, href }`. Contact и Footer читают одну коллекцию `getCollection('contacts')` — AC R7 «ссылки идентичны» обеспечивается источником, а не проверкой.
**When to use:** любой контент, читаемый из двух мест (паттерн D-02 фазы 1: JSON в src/data типизируется).

```json
[
  { "id": "email",   "label": "Email",    "value": "ivan@example.com",             "href": "mailto:ivan@example.com" },
  { "id": "telegram", "label": "Telegram", "value": "@ivan_shivarshinov",          "href": "https://t.me/ivan_shivarshinov" },
  { "id": "github",  "label": "GitHub",   "value": "Ivan-Shivarshinov",            "href": "https://github.com/Ivan-Shivarshinov" }
]
```
*Фактические значения — от пользователя (D-12); до их получения файл может стартовать с плейсхолдеров, заменяемых при выполнении фазы.*

### Pattern 4: Копирование email — прогрессивное улучшение (первый клиентский JS)

**What:** mailto-ссылка рендерится всегда (работает без JS); кнопка «Копировать» — `<button type="button" data-copy={email}>` + один inline-скрипт на /contact: `navigator.clipboard.writeText` в secure-контексте, fallback на `execCommand('copy')` через временный textarea; состояния idle → copied (≈2 s, IconCheck) → error (подсказка «выделите адрес вручную»), статус через `aria-live="polite"` (UI-SPEC Q2).
**When to use:** единственное место интерактива в фазе; бюджет клиентского JS — один скрипт, ноль фреймворков (ADR).

```html
<button type="button" class="copy-btn" data-copy="ivan@example.com" aria-describedby="copy-status">
  <span id="copy-status" class="copy-status" aria-live="polite">Копировать</span>
  <IconCopy />
</button>
<script>
  // Source: MDN (navigator.clipboard: secure contexts) + execCommand-fallback паттерн
  // ВНИМАНИЕ (правило 10 check-tokens): data-copy={email} — БЕЗ кавычек в шаблоне,
  // data-copy="{email}" в Astro 7 рендерится буквально (см. Pitfall 3).
  const btn = document.querySelector('[data-copy]');
  if (btn) {
    const status = btn.querySelector('.copy-status');
    const fallback = (text) => {           // execCommand: синхронно из click-обработчика
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';          // не display:none — execCommand не сработает
      ta.style.opacity = '0';
      ta.readOnly = true;                   // без клавиатуры на мобильных
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      document.body.removeChild(ta);
      return ok;
    };
    btn.addEventListener('click', async () => {
      let ok = false;
      if (window.isSecureContext && navigator.clipboard) {
        try { await navigator.clipboard.writeText(btn.dataset.copy); ok = true; }
        catch { ok = fallback(btn.dataset.copy); }
      } else { ok = fallback(btn.dataset.copy); }
      status.textContent = ok ? 'Скопировано' : 'Не удалось скопировать — выделите адрес вручную';
      if (ok) setTimeout(() => { status.textContent = 'Копировать'; }, 2000);
    });
  }
</script>
```

### Anti-Patterns to Avoid

- **Разбивать MDX-тело на 4 части по маркерам в коде страницы** — хрупкий парсинг; секции обязаны жить в теле (D-05), а страница — рендерить тело один раз (components-prop).
- **Дублировать h2 в теле И SectionHeading на странице** — два источника заголовков секций разъедутся.
- **Давать кейсам терракоту** — D-06: accent зарезервирован за интерфейсом.
- **Писать страницы кейсов «напрямую» вместо динамического маршрута** — 5–6 копипаст-страниц разъедутся; маршрут обязан быть один (AC R3: для каждой записи).
- **Хранить email в двух местах** (страница + скрипт) — единый источник contacts.json; скрипт читает `data-copy` атрибут.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Оптимизация скриншотов (форматы, размеры, CLS) | Свой pipeline | `<Image />` astro:assets (sharp 0.35.3 уже установлен) | alt обязателен, размеры из метаданных импорта, avif/webp, lazy [VERIFIED: docs.astro.build] |
| Sitemap для страниц кейсов | Свой генератор XML | @astrojs/sitemap 3.7.3 (уже подключён) | Маршруты getStaticPaths() включаются автоматически; формат sitemap-index.xml учтён в check-seo |
| Валидация frontmatter кейсов | Ручные проверки полей | zod-схема коллекции (astro/zod) | Падение сборки на невалидной записи — контракт фазы 1 |
| Копирование в буфер | Полноценная библиотека (clipboard.js и т.п.) | Vanilla-хелпер: clipboard API + execCommand fallback | ADR: бюджет клиентского JS; хелпер ~25 строк; библиотека добавит зависимость ради того же API [CITED: MDN] |
| Строгая проверка дублей slug | try/catch в рантайме | strictProjectId (существует, фаза 1) | Дубль slug падает сборку — уже реализовано |

**Key insight:** фаза 3 — «контент поверх готовых контрактов»: всё, что могло быть библиотекой, уже выбрано в фазах 1–2. Риски фазы — не выбор библиотек, а **рассинхрон обновлений существующих проверок** (см. Common Pitfalls 1–4).

## Runtime State Inventory

> Не применимо: фаза 3 — добавление контента и страниц (greenfield для src/content/projects, src/assets/projects, /work/{slug}/), не rename/refactor/migration. Проверено: `src/content/projects/` содержит только `.gitkeep` (0 записей), скриптов, реестров и внешних сервисов с «старыми строками» нет.

## Common Pitfalls

### Pitfall 1: W1-правило check-tokens упадёт на страницах кейсов (0 aria-current)
**What goes wrong:** `scripts/check-tokens.mjs` правило 7: `current.length !== 1` → FAIL «ожидалось ровно 1 aria-current="page"». Страницы `/work/{slug}/` не совпадают ни с одним href nav → 0 атрибутов.
**Why it happens:** Nav помечает активный пункт точным совпадением pathname; глубокие маршруты не входят в 5 фиксированных (D-02).
**How to avoid:** обновить правило: на «глубоких» страницах (`work/*/index.html`) допускается 0; на верхнеуровневых — ровно 1; обновить self-test фикстуры (добавить кейс-страницу с 0). НЕ помечать Work активным на кейсах — href-проверка правила всё равно упадёт (href=/work ≠ маршрут /work/slug/).
**Warning signs:** verify после добавления маршрута падает на «W1: … ожидалось ровно 1 aria-current».

### Pitfall 2: Правило 9 check-tokens запрещает `<script>` в dist — копирование email уронит verify
**What goes wrong:** `/<script/gi.test(html)` — любой тег script в любой странице → FAIL (сейчас 0 скриптов на всём сайте).
**Why it happens:** D-10 — первый клиентский JS сайта; правило фазы 1 (R4: «0 тегов script») устарело.
**How to avoid:** обновить правило 9: ровно 1 `<script>` суммарно, только на /contact; 0 на остальных страницах; обновить self-test фикстуру bad-script (script на чужой странице → FAIL; один script на contact → PASS).
**Warning signs:** verify падает на «тег <script> в собранной странице contact/index.html».

### Pitfall 3: `data-copy="{email}"` рендерится буквально (правило 10 check-tokens)
**What goes wrong:** Astro 7 не интерполирует `{expr}` внутри кавычек строкового атрибута — кнопка получит буквальную строку `{email}`, копироваться будет не адрес.
**Why it happens:** регрессия 02-06 (зафиксирована правилом 10); в JSX-подобном синтаксисе Astro кавычки «защищают» выражение.
**How to avoid:** `data-copy={email}` без кавычек (или шаблонный литерал). Правило 10 уже ловит это при verify — красный гейт.
**Warning signs:** eslint/verify-сообщение «голый {expr} в кавычках атрибута» на contact.astro.

### Pitfall 4: check-seo self-test разъедется с EXPECTED_PAGES
**What goes wrong:** `goodPages` (5 страниц), sitemap-фикстуры (5 url), `pairCounts.size !== EXPECTED_PAGES` — все завязаны на число 5.
**Why it happens:** EXPECTED_PAGES/EXPECTED_SITEMAP_URLS 5 → 10–11 меняются, а встроенные фикстуры self-test — нет.
**How to avoid:** обновить в одном коммите: константы, `goodPages` (5 → факт), sitemap-фикстуру, OK-строку render(). Число страниц = 5 + число кейсов (10 или 11).
**Warning signs:** `npm run check-seo -- --self-test` падает после обновления констант.

### Pitfall 5: URL-пути вместо импортов для src/assets скриншотов
**What goes wrong:** `<Image src="/assets/projects/x/cover.png" />` — изображения из public/ не оптимизируются, а из src/ по URL-пути не резолвятся вовсе.
**Why it happens:** astro:assets принимает импортированные объекты (или image()-поля), URL-стиль — только для public/ и remote.
**How to avoid:** фронтматтер `cover: image()` (паттерн 1) — файл валидируется и импортируется сам; в .astro — ESM-импорт.
**Warning signs:** сборка падает с «Cannot find module / not found» или Image рендерит битую ссылку.

### Pitfall 6: Пустой Media-фрейм на кейсе — FAIL фазы (AC R8)
**What goes wrong:** скриншот не подключён — Media рендерит пустую рамку; AC R8 «кейс с пустым Media-фреймом — FAIL».
**Why it happens:** пользователь кладёт файлы позже (D-02) — если карточка/страница не ссылается на cover, пропуск не заметен до визуального прохода.
**How to avoid:** `cover: image()` обязателен в схеме — сборка упадёт на кейсе без файла; порядок задач плана: папки и структура кейсов готовятся до финального verify, скриншоты пользователя — checkpoint:human-verify перед гейтом.
**Warning signs:** build FAIL «image not found» или визуальный проход показывает пустые рамки.

### Pitfall 7: «Product Engineer» в denylist конфликтует с траекторией на /about
**What goes wrong:** денлист «без ярлыков» (REQ-positioning-category) заблокирует легальный текст траектории (REQ-growth-trajectory: «Product-minded Web Developer → Web Product Developer → Product Engineer»).
**Why it happens:** запрет ярлыков относится к позиционированию первого экрана; траектория обязана называть будущую роль.
**How to avoid:** 5 ярлыков (Product Engineer / AI Product Developer / AEO/GEO Specialist / Web Systems Specialist / AI-native Developer) проверять по `/` (index.html), не по всему dist; «Product-minded web developer» — разрешённая категория (D-13), в денлист не входит.
**Warning signs:** check-tone падает на /about из-за «Product Engineer» в TRAJECTORY.

### Pitfall 8: pageLabel кейса ломает метку Footer
**What goes wrong:** `sectionLabel = pageLabel.split(' ').at(-1)` — если кейс передаст «02 / WORK / SLUG», в футере появится «SLUG» вместо «WORK».
**Why it happens:** BaseLayout выводит метку раздела из последнего сегмента pageLabel.
**How to avoid:** страницы кейсов передают `pageLabel="02 / WORK"` (как work.astro).
**Warning signs:** футер кейса показывает «SLUG» в моно-слое.

### Pitfall 9: Фикстуры check-collections разъедутся со схемой
**What goes wrong:** `projectFixture()` (дубликат-slug тест) не содержит theme/featured/cover — после расширения схемы тест упадёт по «незадуманной» причине (zod required), и негативная проверка станет ложно-зелёной.
**Why it happens:** фикстуры схемо-совместимы «намеренно» (контракт 01-02): падение должно быть именно от дубликата.
**How to avoid:** дополнить projectFixture новыми полями (theme: clay, featured: false, cover/coverAlt — с реальным временным файлом или схемой-совместимым значением; см. Open Questions 2) одновременно с расширением схемы.
**Warning signs:** check-collections «дубликат slug» даёт exit≠0, но в stderr zod-ошибка поля, а не DuplicateContentEntrySlugError.

### Pitfall 10: Порядок сортировки «Следующего кейса» и featured
**What goes wrong:** карточки и «следующий кейс» в разном порядке; featured-секция показывает не те 2–3.
**Why it happens:** D-09 — детерминированная сортировка по `order`; при равных order порядок не гарантирован.
**How to avoid:** единая сортировка `.sort((a,b) => a.data.order - b.data.order)` в getStaticPaths (work, featured, next); featured — фильтр по флагу поверх той же сортировки; check-collections: ровно 2–3 featured (D-09).
**Warning signs:** «Следующий кейс» прыгает между кейсами при пересборке.

### Pitfall 11: Плейсхолдеры контактов утекают в public-репозиторий
**What goes wrong:** contacts.json с заглушкой (например, `ivan@example.com`) закоммичен и публикуется.
**Why it happens:** значения приходят от пользователя в ходе фазы (D-12), файл создаётся раньше.
**How to avoid:** файл создаётся в задаче, где пользователь сразу сообщает значения; гейт verify перед коммитом; в противном случае — явный checkpoint:human-verify до финального коммита.
**Warning signs:** footer/contact показывают example-адрес.

### Pitfall 12: Слишком большие исходники скриншотов в public-репо
**What goes wrong:** PNG/JPG по 3–10 МБ в src/assets раздувают репозиторий (public).
**Why it happens:** пользователь кладёт «как есть» (D-02), пайплайн оптимизирует dist, но не исходники.
**How to avoid:** рекомендация пользователю: PNG/JPG до ~1–2 МБ на файл, типовые размеры 1280–1920px по ширине; полная полировка — фаза 6. Не блокер фазы.

## Code Examples

### 1. Frontmatter кейса (единый шаблон, кавычки — одинарные, репо-конвенция)

```markdown
---
slug: 'cms-architecture-for-news-portal'
title: 'CMS и мультиязычная структура для новостного портала'
summary: 'Спроектировал CMS и мультиязычную структуру для постоянно растущего контентного проекта.'
role: 'ведущий веб-разработчик'
stack: ['Webflow', 'CMS', 'i18n']
year: 2025
status: 'active'
client-type: 'медиа'
order: 1
theme: 'olive'
featured: true
cover: '../../assets/projects/cms-architecture-for-news-portal/cover.png'
coverAlt: 'Главная страница портала: сетка материалов и переключатель языков'
---

## Проблема

Контентный проект рос быстрее, чем структура: ...

## Ответственность

**Моя зона.** Спроектировал ...

**Команда.** Дизайнер отвечал за ...

**Эффект.** ...

## Решение

Выбрал CMS-архитектуру ..., потому что ...

## Результат

До: ... После: ...
```

### 2. Структурная проверка 4 секций (расширение check-collections)

```javascript
// Source: паттерн check-скриптов проекта (self-test + exit 1)
const CASE_HEADINGS = ['## Проблема', '## Ответственность', '## Решение', '## Результат'];
function auditCaseBodies(projectsDir) {
  const issues = [];
  for (const file of walk(projectsDir, ['.mdx'])) {
    const body = readText(file);
    for (const [i, h] of CASE_HEADINGS.entries()) {
      const idx = body.indexOf(h);
      if (idx === -1) issues.push(`${file}: отсутствует раздел «${h}»`);
      else if (body.indexOf(h) !== body.lastIndexOf(h)) issues.push(`${file}: раздел «${h}» повторяется`);
    }
  }
  return issues;
}
```

### 3. Подключение скриншота в карточку (work.astro / index.astro)

```astro
---
import { Image } from 'astro:assets';
import { getCollection } from 'astro:content';
import ProjectCard from '../components/ProjectCard.astro';
import Media from '../components/Media.astro';
import Tag from '../components/Tag.astro';

const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
---
{projects.map((p) => (
  <ProjectCard
    title={p.data.title}
    meta={`${p.data.role} · ${p.data.year}`}
    theme={p.data.theme}
    summary={p.data.summary}
    href={`/work/${p.data.slug}/`}
  >
    <Media slot="media" ratio="4:3">
      <Image class="card-img" src={p.data.cover} alt={p.data.coverAlt} />
    </Media>
    {p.data.stack.slice(0, 3).map((s) => <Tag label={s} theme={p.data.theme} />)}
  </ProjectCard>
))}
```

### 4. Экстракт check-tone.mjs (денлист + позитивные ассерты, self-test паттерн check-prohibitions)

```javascript
// Source: паттерн check-prohibitions.mjs (exact/prefix + self-test фикстуры)
const DENYLIST = [
  'революционн', 'прорыв', 'инновационн', 'уникальн', 'невероятн', 'взрывн',
  'лучший', 'лучших', 'топовый', 'эксперт мирового класса', 'гений', 'гениальн',
  'в одиночку', 'сделал всё сам', 'ai-first', 'ии-революция', 'будущее за',
  'game changer', 'game-changer', 'полный спектр', 'безграничн', 'хайп',
]; // ≥10 записей (R9) — состав финализирует план/пользователь (Claude's Discretion)
// Позитивные ассерты (AC R1–R6): формула на /, 4 моно-меты About, 2 меты Lab,
// 3 канала Contact, отсутствие «SYSTEM DEMO» в dist/work
const REQUIRED_CONTENT = [
  { page: 'index.html', needle: 'Создаю и развиваю сложные сайты, контентные системы и веб-инструменты' },
  { page: 'about/index.html', needle: 'TRAJECTORY' },
  { page: 'lab/index.html', needle: 'PROCESS' },
];
// Матчинг: html.toLowerCase().includes(entry) — stem-подстроки русского текста
// Self-test: BAD_TEXT с «революционные решения» → FAIL; чистый текст → PASS
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `render()` по entry из `astro:content` | Без изменений — актуальный API в Astro 7 (docs) | — | Паттерн getStaticPaths + render + Content подтверждён документацией [VERIFIED] |
| `file()`/glob с warn на дубликат | strictProjectId / strict-json-loader (фаза 1, Astro 7.1.6) | фаза 1 | Дубль slug/id падает сборку — контракт сохранён для новых полей |
| Изображения в public/ без оптимизации | astro:assets `<Image />` + `image()` в схеме | Astro 2.0+ | alt обязателен, CLS-безопасно, avif/webp [VERIFIED] |
| execCommand('copy') как основной способ | Async Clipboard API + execCommand как fallback | Chrome 66+, повсеместно 2020+ | execCommand deprecated (MDN), но остаётся рабочим fallback для HTTP [CITED] |
| Проверка тона вручную | check-скрипт denylist + ручной проход при UAT (R9) | фаза 3 | Автоматизация контрактной границы в духе check-* проекта |

**Deprecated/outdated:**
- `document.execCommand('copy')` — deprecated по MDN, но широко поддерживается; используется только как fallback для не-secure-контекстов и отказов Clipboard API [CITED: MDN].
- Дефолтные glob()/file() Astro 7 с warn на дубликатах — уже заменены строгими обёртками (фаза 1); новые коллекции (contacts) обязаны использовать strict-json-loader.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Поле `cover: image()` + `coverAlt` (обязательные) — правильный механизм скриншотов; альтернатива — import.meta.glob без изменения схемы | Standard Stack, Pattern 1 | Схема — контракт (costly-класс D-05); если план предпочтёт glob — check-collections и фикстуры не трогаются, но R8-гарантия «файл существует» слабее. Решение плана/пользователя |
| A2 | Регэксп слага `/^[a-z0-9-]+$/` в схеме projects — желательное ужесточение | Pattern 1, Open Questions | Строже текущей схемы; может отвергнуть уже выбранные пользователем слаги — согласовать на планировании |
| A3 | Страницы кейсов получают `pageLabel="02 / WORK"` (метка Footer = WORK) | Pitfall 8 | Если план захочет иной pageLabel — Footer покажет не-WORK метку; нужна правка BaseLayout |
| A4 | Denylist: предложенный список stem-ов (21 запись) — рабочий старт; состав финализируется планом/пользователем (Claude's Discretion) | Code Example 4 | Ложные срабатывания на легальных словах («уникальн» и т.п.) — требуется прогон по финальному контенту и ручная сверка |
| A5 | «Product Engineer» и др. ярлыки проверяются только по index.html, не по всему dist | Pitfall 7 | Если проверять весь dist — /about (TRAJECTORY) упадёт; трактовка AC R1 «на странице» = на / |
| A6 | ProjectCard расширяется props `summary` и `href` (карточка обязана рендерить summary и вести на кейс — AC R2/R4, а текущий компонент этого не умеет) | Open Questions 4 | Контракт компонента фазы 2; расширение обратимо, но план обязан зафиксировать |
| A7 | Проверка «4 h2 в теле» — grep-расширение check-collections | Code Example 2 | Если вместо этого рендерить SectionHeading на странице + тела без h2 — понадобится другой механизм сопоставления секций и тела |
| A8 | CI не меняется (lint → check → build); check-tone входит в локальную verify-цепочку | Validation Architecture | SPEC AC «полный гейт зелёный: lint → check (…denylist) → build» — локальный verify; CI-добавление check-tone после build — опция плана |

## Open Questions

1. **Число кейсов: 5 или 6?**
   - What we know: граница 5–6 (R2, жёсткая); состав предлагает агент, утверждает пользователь (D-01).
   - What's unclear: итоговое число и темы (зависит от материала пользователя и интервью в ходе фазы).
   - Recommendation: план строит конвейер на диапазон 5–6; check-скрипты параметризуются фактом на этапе финального verify; EXPECTED_PAGES в check-seo выставляется по фактическому числу (10 или 11).

2. **Механизм скриншотов: frontmatter `cover: image()` или import.meta.glob?**
   - What we know: image() даёт build-level гарантию файла и типобезопасность [VERIFIED: docs]; glob — ноль изменений схемы.
   - What's unclear: приемлемо ли расширение схемы сверх UI-SPEC-списка (theme/featured) — Constraints: «только при необходимости с обоснованием».
   - Recommendation: `cover`/`coverAlt` в схеме (обоснование: R8 требует файл у каждой записи, используемый карточкой и/или страницей — image() единственный механизм с гарантией на сборке); если пользователь против — glob-вариант, R8-проверка grep-ом по импортам.

3. **Значения контактов (email/TG/GitHub) и реальные названия клиентов**
   - What we know: значений нет в PRD (D-12); именование кейсов — per-case (D-03, K2).
   - What's unclear: фактические значения; какие кейсы получат реальные названия, какие — обезличены.
   - Recommendation: первые задачи плана запрашивают значения (checkpoint:human-verify); плейсхолдеры не коммитятся в финальном виде.

4. **Расширение ProjectCard: summary и href**
   - What we know: AC R2 требует summary на карточке, R4 — карточки-ссылки; текущий ProjectCard рендерит title/meta/слот-футер без summary и без ссылки.
   - What's unclear: форма ссылки (весь карточный <article> в <a> vs ссылка-заголовок) — деталь плана.
   - Recommendation: `href` — опциональный проп (title оборачивается в Link-контракт, hover-акцент уже есть); `summary` — опциональный проп (текст body-ролью под title). Оба обратимы.

5. **Сфера check-tone.mjs: только denylist или + позитивные ассерты?**
   - What we know: UI-SPEC фиксирует «денлист ≥10 + self-test»; SPEC AC R1–R6 требуют присутствия формулы/блоков (структурно).
   - What's unclear: куда ложатся позитивные ассерты (check-tone vs check-seo vs новый скрипт).
   - Recommendation: один новый скрипт check-tone (deny + require, self-test для обеих групп) — паттерн «контрактная граница = один check»; план может разделить без потери контракта.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | сборка, check-скрипты | ✓ | 24.18.0 (engines ≥22.22.3 ✓) | — |
| npm | установка/verify | ✓ | 11.16.0 | — |
| sharp | astro:assets Image-пайплайн | ✓ | 0.35.3 (зависимость astro, резолвится) | passthroughImageService (не требуется) |
| Playwright-браузер (Edge/Chromium) | check-visual (расширение маршрутов кейсов — опция) | ✓ | системный Edge (Win11) | chromium (уже используется фазой 2) |
| Git + gh CLI | коммиты, репозиторий public | ✓ | — | — |
| Внешние сервисы | нет | — | — | — |

**Missing dependencies with no fallback:** нет — фаза не требует внешних инструментов.
**Человеческие входы (не инструменты, но блокируют гейт):** скриншоты кейсов (D-02), значения контактов (D-12), утверждение текстов каждого кейса (D-01/D-04). План обязан расставить checkpoint:human-verify перед финальным verify-прогоном.

## Validation Architecture

> `workflow.nyquist_validation` в .planning/config.json не задан — трактуется как включённый. Инфраструктура фазы: собранная сеть check-скриптов + `astro check` + eslint (шаблон проекта; юнит-фреймворка нет — контрактные границы проверяются check-скриптами с self-test).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | набор scripts/check-*.mjs (самописные, self-test) + astro check (TS) + eslint 10 |
| Config file | package.json scripts; astro.config.mjs; eslint.config.mjs |
| Quick run command | `npm run check-seo -- --self-test` (или целевой check) |
| Full suite command | `npm run verify` (build → check-seo → check-tokens → check-contrast → check-collections → check-prohibitions → check-visual) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-main-promise | Формула + категория на /, CTA последний | check (позитивный ассерт) | `node scripts/check-tone.mjs` | ❌ Wave 0 — новый check-tone.mjs |
| REQ-positioning-category | Ярлыки-клише отсутствуют на / | check (денлист по index.html) | `node scripts/check-tone.mjs` | ❌ Wave 0 |
| REQ-evidence-cases | 5–6 записей; 4 h2 в теле; дубль slug — FAIL | check + negative | `node scripts/check-collections.mjs` | ❌ Wave 0 — расширение |
| REQ-competency-architecture | About: CAPABILITIES (3 группы) | check (позитивный ассерт мет) | `node scripts/check-tone.mjs` | ❌ Wave 0 |
| REQ-audience | About: AUDIENCES блок | check (позитивный ассерт) | `node scripts/check-tone.mjs` | ❌ Wave 0 |
| REQ-growth-trajectory | About: TRAJECTORY (3 ступени) | check (позитивный ассерт) | `node scripts/check-tone.mjs` | ❌ Wave 0 |
| REQ-tone | Денлист ≥10 + self-test, прогон по dist | check + self-test | `node scripts/check-tone.mjs --self-test` | ❌ Wave 0 |
| R3 (SPEC) | 10–11 страниц, уникальные пары, sitemap | check | `node scripts/check-seo.mjs` | ✅ (обновить константы + self-test) |
| R8 (SPEC) | ≥1 скриншот на кейс, без дублей файлов | check (cover обязателен) | `node scripts/check-collections.mjs` | ❌ Wave 0 — расширение |
| D-10 (JS) | Ровно 1 скрипт на /contact | check | `node scripts/check-tokens.mjs` | ✅ (обновить правило 9 + фикстуры) |
| W1-регрессия | aria-current: 1 на верхнем уровне, 0 на кейсах | check | `node scripts/check-tokens.mjs` | ✅ (обновить правило 7 + фикстуры) |
| K1–K4 | Честность фактов/NDA/роли/визуалов | manual (judgment) | при утверждении кейсов → 03-VERIFICATION.md | — |

### Sampling Rate
- **Per task commit:** целевой check-скрипт соответствующей задачи (`node scripts/check-*.mjs`).
- **Per wave merge:** `npm run verify`.
- **Phase gate:** полный verify зелёный (build + все check-скрипты) + ручной проход тона по спискам «использовать/избегать» (зафиксирован в верификации, AC R9).

### Wave 0 Gaps
- [ ] `scripts/check-tone.mjs` — НОВЫЙ: денлист ≥10 + позитивные ассерты + self-test (R9); добавить в verify-цепочку package.json
- [ ] `scripts/check-seo.mjs` — EXPECTED_PAGES/EXPECTED_SITEMAP_URLS 5 → 10–11 + обновление goodPages/sitemap-фикстур self-test
- [ ] `scripts/check-collections.mjs` — границы: projects 5–6 (FAIL при 4/7), featured 2–3, theme ∈ enum, cover присутствует, 4 h2 в теле, дублей файлов скриншотов нет; фикстуры — под новую схему
- [ ] `scripts/check-tokens.mjs` — правило 7 (W1: 0 aria-current на /work/*/index.html), правило 9 (1 script только на /contact) + self-test фикстуры
- [ ] `src/content.config.ts` — поля theme/featured/cover/coverAlt (после решения Open Questions 2/4) + коллекция contacts

## Security Domain

> `security_enforcement` в config.json не задан (absent = enabled). Поверхность атаки фазы минимальна: статик SSG, единственный клиентский JS — кнопка копирования (без пользовательского ввода и сети).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — (нет сессий/входа; статик SSG) |
| V3 Session Management | no | — (нет состояния на сервере) |
| V4 Access Control | no | — (публичный контент; robots/sitemap открыты намеренно) |
| V5 Input Validation | no | — (нет пользовательского ввода; frontmatter/JSON валидируются zod-схемами на сборке — trust boundary, не input) |
| V6 Cryptography | no | — (нет шифрования/секретов; контакты — публичные ссылки) |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Инъекция через контент MDX | Tampering | Контент авторский (агент + пользователь, D-01/D-04), компилируется на сборке в статику; пользовательский ввод отсутствует |
| Случайная публикация чувствительных данных в public-репо | Information Disclosure | K1–K4 при утверждении каждого кейса (скриншоты без личных данных клиентов, NDA-анонимизация D-03); контакты — публичные каналы по выбору пользователя |
| Ссылки на внешние ресурсы (TG/GitHub) | — | `target="_blank"` + `rel="noopener"` на внешних ссылках (паттерн Link.astro: caller передаёт атрибуты) |
| Clipboard API | — | Не чувствительные данные (публичный email); отказ API → fallback/ошибка с подсказкой — UI-уровень, не security |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: docs.astro.build/en/guides/content-collections/] — render()/getStaticPaths/Content, zod-схемы, glob-лоадер, дубликаты
- [VERIFIED: docs.astro.build/en/guides/images/] — Image, image() хелпер схемы, ESM-импорты, sharp, форматы, alt
- [VERIFIED: docs.astro.build/en/guides/integrations-guide/sitemap/] — авто-включение getStaticPaths-маршрутов, sitemap-index.xml
- [VERIFIED: docs.astro.build/en/guides/integrations-guide/mdx/] — frontmatter, components-prop, коллекции
- [VERIFIED: node_modules] — версии: astro 7.1.6, @astrojs/mdx 7.0.5, @astrojs/sitemap 3.7.3, zod 4.4.3, sharp 0.35.3
- [VERIFIED: локальный код] — scripts/check-seo.mjs, check-tokens.mjs (правила 7/9/10), check-collections.mjs, check-prohibitions.mjs, content.config.ts, ProjectCard/Media/Seo/BaseLayout/Footer/Nav, 03-SPEC.md, 03-CONTEXT.md, 03-UI-SPEC.md

### Secondary (MEDIUM confidence)
- [CITED: developer.mozilla.org (Interact with the clipboard, clipboard.writeText)] — secure context, execCommand deprecated, fallback-паттерн (кросс-проверен Stack Overflow + PR-обсуждениями)
- [CITED: webflow.com/blog/write-the-perfect-case-study] — структура кейса для веб-специалистов
- [CITED: greatfrontend.com + udit.es] — разделение личного вклада/команды, честные метрики, NDA-анонимизация

### Tertiary (LOW confidence)
- [ASSUMED] — конкретный состав денлиста (A4), трактовка «на странице» для ярлыков (A5), состав тем кейсов (D-07 — назначает план/агент)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — ноль новых пакетов; версии подтверждены node_modules; API подтверждены официальными docs
- Architecture: HIGH — контентные паттерны (render/components-prop/image()) документированы; обязательные обновления check-скриптов прочитаны в коде
- Pitfalls: HIGH — 12 из 12 выведены из реального кода проекта (check-tokens правила 7/9/10, check-seo self-test, check-collections фикстуры) и официальных docs
- Контентная практика кейсов и тон: MEDIUM — лучшие практики из веб-источников (не официальных docs); финальный денлист и тексты утверждает пользователь (D-01/D-04)

**Research date:** 2026-08-03
**Valid until:** 2026-09-02 (стек стабилен: Astro 7 — текущий мажор; фаза не вводит новых зависимостей)
