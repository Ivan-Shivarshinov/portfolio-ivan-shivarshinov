# Phase 2: Визуальная система - Research

**Researched:** 2026-08-02
**Domain:** CSS design-token architecture, fluid typography, motion tokens, semantic component props, WCAG contrast verification, Astro scoped styles
**Confidence:** HIGH (stack) / MEDIUM (patterns, pitfalls)

## Summary

Фаза 2 реализует визуальную систему «Calm Interface, Active Work» в коде поверх готового каркаса фазы 1. Ключевой вывод исследования: **фаза не требует ни одного нового npm-пакета** — все зафиксированные контракты (UI-SPEC 02) реализуемы стандартными CSS-возможностями, поддержанными во всех современных браузерах: `clamp()` для fluid display, `color-mix()` для hover-затемнения акцента, `aspect-ratio` для медиа-рамок, custom properties для theme-контракта, scoped media-queries для адаптивности внутри компонентов. Это соответствует ADR (plain CSS + переменные, запрет utility-first) и ограничению «0 тегов `<script>`» (AC R4) — интерактивность только CSS.

Критическое архитектурное решение, выявленное исследованием: **hex-значения палитры проектов (clay/olive/slate/plum) обязаны жить в `tokens.css` как токены** (`--project-clay` и т.д.), а не в компоненте — иначе сработает `check-tokens` (запрет hex вне tokens.css). Компонент маппит типизированный theme-проп на `var(--project-*)` и выставляет `--project-accent` на корне через inline style — это самый надёжный механизм в Astro (не зависит от scoped-атрибутов, каскадно наследуется в слоты). Все пары контраста из UI-SPEC численно верифицированы: проходят ≥4.5:1 (accent×bg 5.40:1, худшая пара — olive×surface 4.84:1).

Верификационная инфраструктура подтверждена как расширение существующей: `check-tokens` (bp-группа + сверка чисел media-query + W1-ассерт на собранном dist по паттерну `check-seo.mjs`) и новый `check-contrast` (формула WCAG 2.x, перечень пар из UI-SPEC, self-tests на известных значениях — чёрный/белый 21:1).

**Primary recommendation:** планировать фазу как «расширение существующего, без новых зависимостей»: 9 требований покрываются 3 волнами — (1) токены + оболочка + Nav/Footer + W1, (2) компоненты + theme-контракт + медиа, (3) motion-состояния + верификация + Figma-концепты. Единственная внешняя зависимость — Figma MCP (R9), подключается на планировании; её отсутствие не блокирует фазу (D-12).

**CLAUDE.md:** в корне проекта файла нет — проектные директивы задаются только документами `docs/*` (дизайн-направление, ADR, spike) и locked-контрактами `.planning/phases/02-*`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Характер оболочки («лицо» системы)
- **D-01:** Навигация — моно-индексы «01 / Work»: JetBrains Mono номера + тонкие разделители между пунктами; активный пункт — accent (индекс и лейбл), остальные — muted, hover — графит; на 320px индексы скрываются, пункты — одна строка (label 14px). — **Reversibility:** reversible — содержится в Nav-компоненте
- **D-02:** Имя в header — моно-подпись JetBrains Mono, графит; не конкурирует с навигацией.
- **D-03:** Footer-оболочка — одна моно-строка «© 2026 · Иван Шиваршинов» + моно-метка раздела, тонкая верхняя граница; контент колонок (email, social, ссылки) — фаза 3. — **Reversibility:** reversible — расширение footer в фазе 3 не ломает каркас
- **D-04:** Страницы-заглушки — empty-state в системе: моно-подпись «WORK — раздел в разработке» + тонкая рамка-контур; честный статус, легко заменяется в фазе 3.
- **D-05:** Моно-метка страницы «01 / HOME» над контентом на каждой из 5 страниц — системный признак моно-слоя в оболочке.
- **D-06:** Метки nav и footer — русские (точные формулировки — Claude's Discretion; сайт русскоязычный, D-08).

#### Палитра акцентов проектов (theme-проп, R5)
- **D-07:** Палитра — ровно 5 приглушённых цветов, семантические имена (типа clay/olive/slate/plum/brass — точные имена и hex — Claude's Discretion); системный accent #A84B32 (терракота) входит в enum как один из пяти. — **Reversibility:** costly — enum-контракт потребляется схемой projects (фаза 3) и Stacki-вариантами; переименование/удаление значений затронет данные кейсов
- **D-08:** Характер акцентов — приглушённые («цвет появляется локально и временно»); каждая пара текст/фон должна проходить check-contrast ≥4.5:1 на нейтральной основе; насыщенные тона не входят (граница «неоновой AI-эстетики», REQ-design-implications).

#### Набор иконок (R3)
- **D-09:** Расширенный набор (10+): базовые (arrow-right, external-link, arrow-down, mail, copy) + социальные (github, telegram, linkedin) + состояния (check, close); точный список финализирует планировщик.
- **D-10:** Хранение — отдельные self-closing компоненты `Icon*.astro` (плоский список из D-04, естественный рендер в Stacki); без switch-контейнеров и спрайтов.
- **D-11:** Контракт стиля — сетка 24px, stroke 2px, `currentColor`, кастомные геометрические paths (прямые линии, прямоугольники — язык «прямоугольные плоскости, тонкие линии»).

#### Концепты первого экрана (R9)
- **D-12:** Момент выбора — на этапе планирования (Figma MCP подключается там, constraint SPEC): варианты сгенерированы до выполнения, план главной учитывает выбранный вариант; отсутствие выбора не блокирует фазу (дефолт — контрактная типографика).
- **D-13:** Главная в фазе 2 рендерит shell по выбранному концепту: моно-метка «01 / HOME» + имя (Unbounded, display) + primary CTA Button «Смотреть работы»; текст формулы обещания и подписи — фаза 3 (REQ-main-promise).
- **D-14:** Критерии выбора (входят в docs/hero-concept.md как обоснование): реализуемость в системе (токены/сетка/CSS-only), соответствие «Calm Interface, Active Work», задел под контент фазы 3 без перекомпоновки.
- **D-15:** Все 2–3 варианта архивируются: ссылки/скриншоты + обоснование выбора в docs/hero-concept.md; невыбранные остаются в Figma как референс (макет — не источник правды).

#### Lumos Framework (решение пользователя 2026-08-02, проверено по первоисточникам)
- **D-16:** Lumos (Timothy Ricks, MIT, utility-class CSS для Webflow: color.css/layout.css/spacing.css, классы-утилиты с `[class*="..."]`, bp 480/768/992) НЕ импортируется в проект: это utility-class система, конфликтующая с locked-запретом P1 фазы 1 (utility-first CSS), контрактом bp 768/1200 (R1/R8) и единым файлом токенов (check-tokens). Используется как референс принципов: организация токенов группами (color/layout/spacing) и component-first мышление переносятся в tokens.css без кода. — **Reversibility:** costly — обратное (импорт) требует пересмотра ADR и контрактов скриптов; зафиксировано в Deferred Ideas как возможный пересмотр в фазе 6
- **Примечание:** утверждение «Lumos разработал тот же автор, что и Stacki» по первоисточникам не подтверждается (flowtricks/stacki не упоминает ни Timothy Ricks, ни Lumos); в решения не переносится.

### Claude's Discretion
Точные русские формулировки меток nav/footer; точные имена и hex 4 приглушённых цветов (5-й — терракота; все пары проходят контраст); финальный список иконок; формат моно-метки страницы и разделителей; hover-детали ссылок/карточек (только через motion/ease-токены); значения пропов layout/density/theme/showMetrics; разбиение работы на планы.

### Deferred Ideas (OUT OF SCOPE)
- **Пересмотр запрета utility-first CSS (и возможный импорт Lumos)** — фаза 6 при пересмотре ADR; в фазе 2 запрет действует (D-16, P1 фазы 1)
- **Точные русские формулировки меток nav и подписей страниц** — вместе с контентом (фаза 3); в фазе 2 — рабочие формулировки по тону
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-design-implications | Дизайн поддерживает образ системного разработчика: содержание важнее декора, системность видна, без клише и неоновой AI-эстетики | Токен-дисциплина (один файл, семантические роли) + нейтральный покой с локальными акцентами (SC3) + приглушённая палитра (D-08) — все контракты UI-SPEC 02 реализуемы на чистом CSS; среда проверки контраста подтверждена |
| R1 | Расширение токенов без переименования: bp-токены, lead/caption, fluid display (clamp), easing-набор | clamp-формула и типовые шкалы (см. Fluid Typography); easing-набор UI-SPEC совпадает со стандартом индустрии; расширение check-tokens (bp-группа + сверка media-query чисел) |
| R2 | Оболочка системы на 5 страницах + фикс W1 | Паттерн Nav/Footer/метка страницы; W1 — уже применённая нормализация pathname в BaseLayout переносится в Nav; ассерт на dist-HTML по паттерну check-seo.mjs |
| R3 | Компоненты с семантическими пропами | Паттерн «проп → CSS-переменная» через inline style; Stacki-совместимая плоская композиция (spike R5); типизация enum-пропов (astro check, TS strict) |
| R4 | Интерактивные состояния только CSS + reduced-motion | Токены motion (fast 150/base 250/slow 400 + 3 кривые) соответствуют стандарту; kill-switch 0ms — стандартный паттерн global.css; color-mix() для hover-затемнения |
| R5 | Контракт theme-пропа → `--project-accent` | hex палитры обязаны жить в tokens.css (check-tokens); inline style на корне — самый надёжный механизм в Astro; все пары ≥4.5:1 численно подтверждены |
| R6 | Адаптивность внутри компонентов | Scoped media-queries на bp-значениях (min-width, включительно); числа равны токенам (скрипт-контракт, media-query не потребляет var()); pitfall aspect-ratio/grid |
| R7 | Медиа-оболочка (figure, ratio, рамка, caption, слот) | aspect-ratio (поддержка с 2021) + overflow hidden + min-height:0 (pitfall blow-out); 1px рамка — вне шкалы, разрешена |
| R8 | Верификация скриптами | check-contrast: формула WCAG (L1+0.05)/(L2+0.05), перечень пар из UI-SPEC, self-tests; check-tokens расширение: bp-группа, media-query сверка, W1 |
| R9 | Концепты первого экрана (Figma MCP) | Внешняя зависимость: MCP-сервер Figma подключается на планировании; fallback D-12 (контрактная типографика); критерии D-14/D-15 |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Design tokens (bp/типографика/motion/проектные цвета) | Global styles (`src/styles/tokens.css`) | Scripts (`check-tokens`, `check-contrast`) | Единый файл — источник истины (R1/R2 фазы 1); значения верифицируются скриптами, т.к. визуальной панели переменных в Stacki нет (spike) |
| Fluid display (clamp) | tokens.css (значение токена) | Компоненты (потребление через var()) | Fluid-типографика живёт в токене, а не в медиазапросах (стандартная практика: fluid шкала как custom properties) |
| Оболочка страниц (контейнер, gutter, метка) | Компоненты Nav/Footer + BaseLayout | tokens.css (--container-*, --gutter-*) | Адаптивность внутри компонентов (ADR §5.4); контейнер — общий класс/правило в оболочке |
| Theme-контракт (`--project-accent`) | Компоненты ProjectCard/Tag (inline style на корне) | tokens.css (значения `--project-*`) | Enum-тип в TS-пропах (astro check валидирует), значения — в единственном файле токенов (check-tokens) |
| Интерактивные состояния (hover/focus/active) | Компоненты (scoped CSS) | tokens.css (--motion-*, --ease-*) + global.css (reduced-motion) | Только CSS (порядок анимаций ADR); длительности/кривые только через токены (grep-контроль AC R4) |
| Адаптивность | Компоненты (scoped media-queries) | check-tokens (сверка чисел с bp-токенами) | Медиазапросы не могут потреблять var() — числа дублируются и сверяются скриптом (constraint SPEC) |
| Верификация (W1, контраст, токены) | scripts/ (check-tokens ext., check-contrast, W1-ассерт) | CI (lint → check → build) | Node-скрипты с self-tests — установленный паттерн фазы 1; проверки на src + собранный dist |
| Концепты первого экрана | Figma (внешний сервис, MCP) | docs/hero-concept.md | Макет — референс, не источник правды (D-15, ADR); код — единственный источник истины |

## Standard Stack

> Фаза НЕ устанавливает ни одного нового пакета. Весь стек уже установлен в фазе 1 и подтверждён (`npm ls`: astro 7.1.6, @astrojs/check 0.9.10, typescript 6.0.3, eslint 10.8.0).

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | 7.1.6 (установлен) | SSG, компоненты, scoped styles | Официальный current stable; единственный источник истины (ADR) |
| Plain CSS + CSS custom properties | — | Вся визуальная система | Зафиксировано ADR + UI-SPEC (P1: utility-first запрещён); Stacki-проверенная конструкция (spike R5) |
| Node.js скрипты (no-deps) | node >=22.22.3 (на машине 24.18.0) | check-tokens (расширение), check-contrast (новый) | Установленный паттерн фазы 1: 6 скриптов с self-tests, без внешних зависимостей |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@astrojs/check` + TS strict | 0.9.10 / 6.0.3 | Валидация типизированных пропов (theme-enum) | Каждая сборка (npm run check); невалидный theme → падение (AC R5) |
| eslint-plugin-astro | 3.0.1 | Линт .astro | CI lint; a11y-правила jsx-a11y намеренно НЕ включаются (решение 01-03 T1) |
| Figma MCP (remote-сервер) | — | Генерация 2–3 концептов первого экрана (R9) | Только планирование фазы 2; не входит в build/CI |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| plain CSS + переменные (зафиксировано) | Style Dictionary / DTCG (JSON-токены) | DTCG — стандарт для мультиплатформенных систем; для единственного CSS-файла это лишний слой генерации и новая зависимость — проект уже имеет проверенную схему «tokens.css + скрипты» |
| plain CSS + переменные (зафиксировано) | Tailwind / Lumos | Запрещено P1 фазы 1 + D-16 (utility-first конфликтует с единым файлом токенов и bp-контрактом 768/1200) |
| Кастомный check-contrast (зафиксировано R8) | npm-пакет (chroma-js, color-contrast-ratio) | Формула WCAG — 10 строк чистого Node; зависимость ради 10 строк противоречит паттерну фазы 1 (6 скриптов без deps) и добавляет поверхность атаки |
| Кастомные инлайн-SVG иконки (D-11) | lucide / phosphor (npm) | Контракт стиля «24px, stroke 2, currentColor, геометрические paths» — свой набор из 10–12 компонентов ≈ 60 строк; чужой набор добавит лицензионный слой и не совпадёт по геометрическому языку |
| color-mix() (hover-затемнение) | SCSS darken() / предкомпиляция | Предпроцессор — новая зависимость и слой сборки; color-mix() поддерживается всеми современными браузерами с 2023 |

**Installation:** нет — новых пакетов фаза не требует. (`npm install` не запускается.)

**Version verification:** выполнен 2026-08-02: `npm ls astro @astrojs/check typescript` — 7.1.6 / 0.9.10 / 6.0.3, всё установлено, `node --version` = 24.18.0 (engines >=22.22.3 удовлетворён).

## Package Legitimacy Audit

> Gate не применим: фаза не устанавливает внешних пакетов (UI-SPEC: «component library none», «icon library none»; ADR: plain CSS). Все зависимости — установленные в фазе 1, неизменные. Пакеты, отклонённые исследованиями: **Lumos** (SLOP-аналог для этого стека — utility-class система под Webflow, конфликт D-16, REMOVED), **tailwindcss** (запрещён P1 фазы 1, REMOVED), **chroma-js** (замена 10-строчного скрипта, REMOVED).

**Packages removed due to [SLOP]/prohibition verdict:** Lumos (D-16, не импортируется), tailwindcss (P1 ADR), chroma-js (лишняя зависимость).
**Packages flagged as suspicious [SUS]:** none.

## Architecture Patterns

### System Architecture Diagram

```
                      ┌─────────────────────────────────────────────┐
                      │  src/styles/tokens.css  (ЕДИНСТВЕННЫЙ файл)  │
                      │  color │ typography │ spacing │ containers   │
                      │  motion │ bp (md 768 / lg 1200) │ project-*  │
                      └──────────────┬──────────────────────────────┘
                                     │ var() — потребление (хардкод запрещён)
        ┌────────────────────────────┼──────────────────────────────┐
        ▼                            ▼                              ▼
┌───────────────┐         ┌────────────────────┐          ┌─────────────────────┐
│ global.css    │         │ BaseLayout.astro   │          │ Компоненты          │
│ body-база     │         │ tokens+global import│          │ Button/Link/Heading │
│ :focus-visible│         │ Nav + Footer +     │          │ ProjectCard/Media/  │
│ reduced-motion│         │ mono-метка страницы │          │ Tag/Nav/Footer/Icon*│
│ kill-switch   │         │ (W1: aria-current) │          │ scoped styles +     │
└───────────────┘         └─────────┬──────────┘          │ media-queries (bp)  │
                                     │                     └──────────┬──────────┘
                                     ▼                                ▼
                           ┌──────────────────────────────────────────────┐
                           │  5 страниц: index / work / lab / about /     │
                           │  contact (плоский список self-closing props)  │
                           └──────────────────────────────────────────────┘
                                     │ astro build
                                     ▼
                    ┌───────────────────────────────────────────┐
                    │ dist/**/*.html (0 <script> тегов, AC R4)  │
                    └───────────────────────────────────────────┘
                                     │
          ┌──────────────────────────┼───────────────────────────┐
          ▼                          ▼                           ▼
┌──────────────────┐   ┌──────────────────────┐   ┌──────────────────────────┐
│ check-tokens ext.│   │ check-contrast (new) │   │ W1-ассерт (dist HTML):   │
│ bp-группа +      │   │ пары из UI-SPEC      │   │ ровно 1 aria-current=    │
│ сверка чисел     │   │ ≥ 4.5:1 (WCAG AA)    │   │ page на страницу,        │
│ media-query      │   │ + self-tests         │   │ соответствует маршруту   │
└──────────────────┘   └──────────────────────┘   └──────────────────────────┘
```

Поток: токены (единственный источник) → var() во всех стилях → статический HTML → скрипты верифицируют и токены (src), и результат (dist). Пользовательский визуальный проход (375/768/1200) — финальный слой верификации (AC R6/R11).

### Recommended Project Structure

```
src/
├── components/
│   ├── Button.astro          # variant (primary|secondary), density (md|lg), href
│   ├── Link.astro            # variant (default|muted)
│   ├── SectionHeading.astro  # meta?, title, layout (stacked|split)
│   ├── ProjectCard.astro     # title, meta?, theme?, showMetrics?, layout
│   ├── Media.astro           # ratio?, caption?, слот
│   ├── Tag.astro             # label, theme?, size (sm|md)
│   ├── Nav.astro             # 5 маршрутов, aria-current (W1)
│   ├── Footer.astro          # section-метка (HOME/WORK/…)
│   ├── Seo.astro             # (существует, не трогаем)
│   └── IconArrowRight.astro / IconExternalLink.astro / … # 10+ self-closing, D-10
├── layouts/BaseLayout.astro  # Nav/Footer замена inline-разметки; метка над <slot/>
├── pages/{index,work,lab,about,contact}.astro
└── styles/{tokens.css, global.css}
scripts/
├── check-tokens.mjs          # РАСШИРЯЕТСЯ: bp-группа, media-query сверка, W1
├── check-contrast.mjs        # НОВЫЙ: пары токенов ≥ 4.5:1
└── (check-seo, check-collections, check-prohibitions, verify-preview, check-spike-doc — без изменений)
docs/hero-concept.md          # R9: выбор концепта + обоснование (D-14/D-15)
```

Плоская композиция (D-04): страница = `BaseLayout` + список self-closing компонентов с пропами — проверенная парсинг-модель Stacki (spike R5). Иконки — отдельные файлы `Icon*.astro`, без switch-контейнеров и спрайтов (D-10).

### Pattern 1: Токен-архитектура «один файл, семантические роли»

**What:** Вся шкала значений — в `tokens.css` в `:root`, сгруппирована по доменам; имена — по роли (что делает), не по значению (как выглядит). Компоненты потребляют только `var()`; роли не переименовываются (UI-SPEC 01/02), значения уточняются в этом файле.

**When to use:** Всегда в этом проекте — это locked-контракт R1/R2 фазы 1 + check-tokens.

**Ключевые правила расширения в фазе 2 (без переименования ролей):**
- bp-группа: `--bp-md: 768px; --bp-lg: 1200px` — значения используются ТОЛЬКО как контракт для чисел в media-запросах (сами запросы var() не потребляют — constraint SPEC);
- шкала: `--text-lead: 18px; --text-caption: 12px` (caption — моно-слой);
- fluid display: `--text-display: clamp(28px, 5vw, 40px)` — 32px-baseline сохраняется на ~640px, мин. 28px влезает в колонку 272px на 320px (верифицировано: «Шиваршинов» ≈ 231px);
- motion: `--ease-enter: cubic-bezier(0, 0, 0.2, 1)`, `--ease-exit: cubic-bezier(0.4, 0, 1, 1)` (дополняют `--ease-standard: cubic-bezier(0.4, 0, 0.2, 1)`) — в точности стандартный набор индустрии (enter/standard/exit);
- новые цветовые токены: `--color-line: #DAD9D3` (1px рамки) + 4 `--project-*` токена для палитры проектов (см. Pattern 2);
- 1–2px (рамки/focus) — вне шкалы отступов, разрешены (прецедент фазы 1).

**Проверка дрейфа токенов:** контракт check-tokens (единый файл, группы, запрет hex/px-шкалы вне tokens.css) — именно тот механизм «audit var() против определений», который рекомендуют практики дизайн-систем; расширение добавляет bp-группу в список обязательных групп и сверку чисел media-запросов.

### Pattern 2: Семантический проп → CSS-переменная (theme-контракт)

**What:** Типизированный enum-проп (`theme?: 'terracotta' | 'clay' | 'olive' | 'slate' | 'plum'`) маппится на токен значения, который выставляется `--project-accent` на корне элемента через inline style. Значения hex живут в tokens.css; компонент содержит только маппинг enum → var().

**When to use:** ProjectCard и Tag (R5). Проп `theme` обязателен для полного нейтрального покоя: без theme — ноль акцента на карточке.

**Почему inline style:** scoped-стили Astro компилируются в атрибутные селекторы `[data-astro-cid-*]`; inline style применяется всегда, независимо от scoping, и — главное — CSS custom property наследуется в слоты и дочерние компоненты (наследование — runtime-каскад, не селекторное правило), так что Media внутри ProjectCard получает accent без дополнительных правил. Это подтверждено spike R5 (scoped + переменная одновременно — проверенная конструкция).

```typescript
// тип enum — единый источник для astro check (невалидное значение → ошибка сборки, AC R5)
export type ProjectTheme = 'terracotta' | 'clay' | 'olive' | 'slate' | 'plum';
// значения — ТОЛЬКО в tokens.css (check-tokens: hex вне tokens.css = нарушение):
//   --project-clay: #8A5A44; --project-olive: #6B6B3F;
//   --project-slate: #55606E; --project-plum: #6E4A5C;
//   (terracotta = var(--color-accent) — системный акцент, D-07)
```

```astro
---
// Source: паттерн — официальные docs Astro (inline style attribute, кастомные свойства) + D-07/D-08
interface Props { theme?: 'terracotta' | 'clay' | 'olive' | 'slate' | 'plum'; }
const { theme } = Astro.props;
const ACCENTS: Record<'terracotta' | 'clay' | 'olive' | 'slate' | 'plum', string> = {
  terracotta: 'var(--color-accent)',
  clay: 'var(--project-clay)',
  olive: 'var(--project-olive)',
  slate: 'var(--project-slate)',
  plum: 'var(--project-plum)',
};
---
<article class="card" style={theme ? { '--project-accent': ACCENTS[theme] } : undefined}>
  <slot />
</article>

<style>
  .card:hover .title { color: var(--project-accent, var(--color-ink)); } /* покой — нейтрален */
</style>
```

**Нейтральный покой (SC3):** accent появляется только в hover/focus — в покое карточка использует ink/line. Для ссылок/CTA accent применяется с фазы 2 по UI-SPEC 01 (links + primary CTA), но ProjectCard/Tag — только во взаимодействии (D-08, «цвет появляется локально и временно»).

### Pattern 3: Адаптивность внутри компонентов (без дублирования)

**What:** Медиазапросы — только в scoped-стилях компонента, на значениях bp-токенов, `min-width` включительно (на значении bp включается следующий уровень — AC R6). Отступы масштабируются через токены (`--space-*`, `--gutter-*`), а не числа.

**When to use:** Каждый компонент сам отвечает за своё поведение на 320 / <768 / ≥768 / ≥1200 (ADR §5.4: «компонент должен сам знать, когда менять сетку»).

```css
/* Source: паттерн — ADR §5.4 + UI-SPEC Containers (min-width inclusive) */
/* Числа 768/1200 = значения --bp-md/--bp-lg (сверяет check-tokens, R8) */
.section-heading--split { flex-direction: column; }
@media (min-width: 768px) {
  .section-heading--split { flex-direction: row; justify-content: space-between; }
}
```

Правила:
- дублирования стилей между страницами нет — стиль живёт в компоненте, страница только композирует;
- gutter-переключение — один токен-контейнер: `padding-inline: var(--gutter-mobile)` → `var(--gutter-desktop)` на `≥768px` (или значение bp-lg, если контейнер переключается на 1200 — контракт UI-SPEC фиксирует десктопный gutter 48px);
- проверка диапазона 320–1200+: визуальный проход 375/768/1200 (AC R11) + отсутствие горизонтального скролла на 320 (AC R10);
- навигация на 320: скрыть индексы и разделители, «Главная» — в имени в header, «Лаборатория»→«Лаб» (4 лейбла ≈ 226px < 272px — верифицировано в UI-SPEC Copywriting).

### Pattern 4: Motion-токены и reduced-motion baseline

**What:** Длительности и кривые — только токены; все transition-свойства в компонентах через `var(--motion-*)` + `var(--ease-*)` (grep-контроль AC R4); при `prefers-reduced-motion` — все переходы 0ms (полное статичное состояние, SPEC §08 и AC R6-спец).

**When to use:** Все hover/focus/active состояния (UI-SPEC Motion: ссылки, кнопки, nav, теги, карточки, медиа).

```css
/* Source: стандартный паттерн kill-switch (AC R4: «длительности переходов становятся 0ms») */
/* Добавляется в global.css — рядом с :focus-visible */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

Тонкость: обнуляется ТОЛЬКО длительность — мгновенная смена состояния (цвет hover) остаётся, иначе пропадёт обратная связь; при этом не появляется никакой анимации. Hover-затемнение primary Button — через `color-mix(in oklab, var(--color-accent), var(--color-ink) 8%)` (UI-SPEC ≈8%; oklab — самый предсказуемый цветовой пространство для смешения; `currentColor` в color-mix не поддерживается — не использовать).

### Pattern 5: Верификация — расширение check-tokens + check-contrast

**What:** Оба скрипта — plain Node, без зависимостей, с self-tests на временных фикстурах (паттерн фазы 1).

**check-tokens (расширение):**
- новая обязательная группа `bp (--bp-*)` (и, по контракту UI-SPEC inventory, наличие `--text-lead`/`--text-caption`/easing-токенов);
- сверка чисел media-запросов: regex `@media\s*\(min-width:\s*(\d+)px\)` по src/components — каждое число обязано совпасть со значением `--bp-md` или `--bp-lg` (считывается из tokens.css);
- W1-ассерт по dist-HTML (после build): на каждой из 5 страниц ровно один `aria-current="page"`, и его href соответствует маршруту файла (паттерн walk+regex из check-seo.mjs; маршруты с trailing slash — `/work/` и т.д.);
- существующие проверки (единый файл, 5→7 групп, hex/px-запрет) остаются.

**check-contrast (новый):**
- читает tokens.css, извлекает `--token: #hex` по имени;
- перечень пар текст/фон — из UI-SPEC Color (инк×bg, инк×surface, инк-muted×bg, инк-muted×surface, accent×bg, accent×surface, accent-ink×accent, destructive×bg, 4 проектных акцента×bg, ×surface, accent-ink×каждый проектный акцент); `--color-line` исключён (декоративный);
- формула WCAG 2.x: `(L1+0.05)/(L2+0.05)`, относительная яркость через линеаризацию sRGB (код в Code Examples);
- порог 4.5:1 для обычного текста (AA); все пары перечня — текст, не UI-компоненты (порог 3:1 не используется);
- self-test на эталонных значениях: чёрный/белый = 21:1, `#A84B32`×`#FAFAF7` = 5.40:1 (все пары перечня численно верифицированы в этом исследовании — таблица в Code Examples).

### Anti-Patterns to Avoid
- **Хардкод значений шкалы/цветов в компонентах:** hex или px шкалы (4/8/16/24/32/48/64) вне tokens.css — падение check-tokens; 1–2px рамки — единственное разрешённое исключение.
- **Литеральные длительности/кривые в transition:** `transition: color 150ms ease` вместо `var(--motion-fast) var(--ease-standard)` — grep-контроль AC R4.
- **Дублирование адаптивности по страницам:** media-запросы в pages/*.astro вместо компонентов — адаптивность живёт в компоненте (ADR §5.4), иначе страницы рассинхронизируются.
- **theme как массив чисел/строк без enum:** «сырые значения» в пропах (paddingTop: string) запрещены (ADR §5.3, R3 AC); пропы layout/density/theme/showMetrics — типизированные enum/boolean.
- **Проп-маппинг в классы-варианты с десятками классов:** для 5 значений enum — один inline style с `--project-accent`, а не 5 классов с дублированием правил.
- **JS-решения для hover (mouseenter и т.п.):** клиентский JS запрещён (AC R5, порядок анимаций ADR); всё — CSS.
- **Спрайты/switch-контейнеры иконок:** нарушает D-10 и парсинг-модель Stacki.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Контраст текста ≥ 4.5:1 | Ручная визуальная проверка пар | `scripts/check-contrast.mjs` (формула WCAG, self-tests) | 20 пар × глаза = ошибки; скрипт детерминирован и переиспользуется при каждом изменении токенов; формула — 10 строк (не нужен npm-пакет) |
| Сверка чисел media-query с bp-токенами | «Помнить» про 768/1200 при написании медиазапросов | Расширение `check-tokens.mjs` (regex-сверка) | Media-запросы не могут потреблять var() (constraint SPEC) — единственный механизм защиты — скрипт |
| Reduced-motion baseline | Индивидуальные `@media (prefers-reduced-motion)` в каждом компоненте | Один глобальный kill-switch в global.css | Один источник; компоненты не могут «забыть» его; обновление в одном месте |
| Hover-затемнение акцента | Ручной подбор второго hex + ещё токены | `color-mix(in oklab, var(--color-accent), var(--color-ink) 8%)` | Один токен акцента остаётся источником; без предпроцессора и дополнительных цветов |
| Медиа-рамка с ratio | padding-top hack / фиксированные высоты | `aspect-ratio` + `overflow: hidden` + `min-height: 0` | Нативная поддержка с 2021; нет магических процентов; CLS-free |
| Валидация пропов theme | Ручная проверка в рантайме | TS union-тип + `astro check` | Невалидное значение падает сборкой (AC R5), а не молчит в проде |
| Иконки | Поиск/копирование чужих SVG | Свои `Icon*.astro` (24px, stroke 2, currentColor) | Контракт стиля D-11; лицензионная чистота; геометрический язык «прямоугольные плоскости» |
| Fluid display | Медиазапросы на каждый размер заголовка | `clamp(28px, 5vw, 40px)` в токене | Одна строка вместо N запросов; плавная шкала без скачков |

**Key insight:** «Тяжёлые» задачи этого домена уже решены браузером (clamp, color-mix, aspect-ratio, custom properties) и стандартами (WCAG formula); ручная работа остаётся только в двух местах — дисциплина потребления токенов (скрипты) и дисциплина нейтрального покоя (дизайн-контракт). Всё, что можно проверить скриптом, — проверяется скриптом; всё, что нельзя (вкус, композиция) — визуальный проход пользователя (AC R11).

## Common Pitfalls

### Pitfall 1: Дрейф токенов («один-раз» значения)
**What goes wrong:** В компонент просачивается `color: #A84B32` или `padding: 16px` — система рассыпается на исключения (риск ADR «накопление случайных CSS-значений»).
**Why it happens:** Визуальные правки без сверки с контрактом; Stacki не показывает панель переменных (spike: «визуальной панели CSS-переменных нет»).
**How to avoid:** check-tokens расширяется (bp-группа) и уже покрывает hex/px; прогон после каждого коммита (npm run verify).
**Warning signs:** fail в CI на hex/px; «копипаста» значений из Figma-концептов в компоненты.

### Pitfall 2: Числа media-запросов ≠ bp-токенам
**What goes wrong:** `@media (min-width: 767px)` вместо 768 — сдвиг адаптивных уровней на 1px; `min-width` vs `max-width` путаница (маленькие экраны получают десктоп-макет).
**Why it happens:** Media-запросы не потребляют var() (constraint SPEC); числа дублируются вручную.
**How to avoid:** Контракт check-tokens: числа в src/components обязаны равняться значениям `--bp-md`/`--bp-lg`; использовать только `min-width` (включительно — AC R6).
**Warning signs:** любой `px` внутри `@media` в компонентах, отличный от 768/1200.

### Pitfall 3: aspect-ratio «раздувается» контентом слота
**What goes wrong:** Изображение/содержимое слота больше вычисленной высоты — рамка Media растягивается, ratio ломается, карточки в сетке разъезжаются.
**Why it happens:** В flex/grid-контекстах контент расширяет высоту блока; ratio игнорируется, если обе размерности заданы явно.
**How to avoid:** `aspect-ratio: 4 / 3` + `overflow: hidden` + `min-height: 0` на рамке; ширина 100%, высота auto (одна размерность автоматическая — иначе ratio игнорируется); `align-items: flex-start` в родительском flex, если stretch ломает.
**Warning signs:** Media с картинкой выше расчётной пропорции; горизонтальный скролл от широкого содержимого слота.

### Pitfall 4: color-mix в неподдерживаемом браузере
**What goes wrong:** В старых браузерах hover-затемнение не работает; fallback custom property хранит функцию как есть (значение fallback в var() не подставляется).
**Why it happens:** color-mix() — Color 5; поддержка с 2023 (Chrome 111+, Safari 16.2+, Firefox 113+); `currentColor` как аргумент не поддерживается.
**How to avoid:** Для портфолио (современные браузеры) — использовать напрямую; при желании — `@supports (color: color-mix(...))` с fallback; не передавать `currentColor` в color-mix.
**Warning signs:** hover-состояния кнопки без изменения цвета в Safari 16.0/Chrome 110.

### Pitfall 5: Reduced-motion «убивает» обратную связь или ломает hover
**What goes wrong:** Если kill-switch удаляет и состояние (transition: none вместо duration 0ms) — цвет hover перестаёт применяться вовсе; если не задан — анимации продолжаются.
**Why it happens:** `transition: none` отменяет переход и мгновенно применяет новое значение — на самом деле это валидно, но `!important` на длительностях — стандарт; ошибка — обнулять не то свойство.
**How to avoid:** Обнулять `transition-duration`/`animation-duration` (не `transition` целиком); hover-цвет остаётся применимым мгновенно (AC R4: «переходы становятся 0ms», а не «состояния отключаются»).
**Warning signs:** в DevTools emulation prefers-reduced-motion hover не работает.

### Pitfall 6: Scoped-стили не применяются к дочерним компонентам
**What goes wrong:** Стиль из ProjectCard не действует на внутренний Media/Tag (scoped-селекторы `[data-astro-cid]` не пересекаются); `class`-проп не прокидывается автоматически.
**Why it happens:** Scoping Astro изолирует селекторы по компонентам (официальные docs: «scoped styles won't apply to other Astro components contained inside of your template»).
**How to avoid:** Стилизовать только собственные элементы компонента; для влияния на детей — custom properties (наследование работает всегда) или обёртка `<div>`; для className passthrough — принимать `class` и `...rest` (только если реально нужно).
**Warning signs:** правила «не цепляются» к вложенным компонентам при одинаковых именах классов.

### Pitfall 7: Изменение контракта токенов (переименование ролей)
**What goes wrong:** Переименование `--text-display` → `--text-hero` ломает потребляющие компоненты и контракт check-tokens/UI-SPEC; меняет публичный API системы.
**Why it happens:** Соблазн «улучшить» имя при уточнении значений.
**How to avoid:** Роли не переименовываются (locked UI-SPEC 01/02, R1); значения уточняются только в tokens.css; новый токен — только при новой роли.
**Warning signs:** диффы, меняющие имена токенов.

### Pitfall 8: «Скриншотная» верификация вместо скриптов
**What goes wrong:** Попытка добавить скриншот-базу для проверки визуальных состояний — тяжёлая инфраструктура (обновление эталонов, флейки).
**Why it happens:** Привычная практика из других проектов.
**How to avoid:** Скриншот-база явно НЕ выбрана контрактом (CONTEXT: «не выбранный контракт — скрипты + живой прогон»); визуальная проверка — живой проход пользователя 375/768/1200 (AC R11) + Stacki как визуальная поверхность (ADR).
**Warning signs:** планы, добавляющие playwright/puppeteer для визуальных состояний.

## Code Examples

Verified patterns из официальных источников (источники в тексте каждого примера):

### 1. Fluid-токен display (clamp)
```css
/* Source: стандартная формула fluid type (30-seconds-of-code / REI Cedar; UI-SPEC 02 locked значение) */
/* preferred = calc(Vmin + (Vmax − Vmin) × (100vw − BPmin) / (BPmax − BPmin))  →  здесь упрощено до 5vw */
--text-display: clamp(28px, 5vw, 40px);
/* поведение: 28px при ≤560px, 40px при ≥800px, 32px (baseline фазы 1) на ~640px */
```
Минимум в `rem` предпочтителен для доступности (уважает настройки шрифта браузера); здесь locked-контракт — px (фиксированные границы допустимы; UI-SPEC проверил 320px-кейс).

### 2. Hover-затемнение через color-mix (Button primary)
```css
/* Source: MDN color-mix + Chrome for Developers (паттерн darken); UI-SPEC Motion: «accent darkened via color-mix with ink ≈8%» */
.button--primary {
  background: var(--color-accent);
  color: var(--color-accent-ink);
  transition: background-color var(--motion-fast) var(--ease-standard);
}
.button--primary:hover {
  background: color-mix(in oklab, var(--color-accent), var(--color-ink) 8%);
}
.button--primary:active {
  translate: 0 1px; /* compositor-only; без layout-свойств */
}
```

### 3. Медиа-рамка (Media.astro)
```astro
---
// Source: web.dev aspect-ratio + MDN (overflow/min-height для ratio-боксов); UI-SPEC Component Contracts Media
interface Props { ratio?: '16:9' | '4:3' | '3:2' | '1:1'; caption?: string; }
const { ratio = '4:3', caption } = Astro.props;
const RATIOS = { '16:9': '16 / 9', '4:3': '4 / 3', '3:2': '3 / 2', '1:1': '1 / 1' };
---
<figure class="media">
  <div class="media__frame" style={{ '--ratio': RATIOS[ratio] }}>
    <slot /> <!-- фаза 3: <Image />; сейчас — пустая рамка -->
  </div>
  {caption && <figcaption class="media__caption">{caption}</figcaption>}
</figure>

<style>
  .media__frame {
    aspect-ratio: var(--ratio);
    overflow: hidden;
    min-height: 0;           /* контент не раздувает ratio (flex/grid pitfall) */
    border: 1px solid var(--color-line); /* 1px — вне шкалы, разрешено */
  }
  .media__caption {
    font-family: var(--font-mono);
    font-size: var(--text-caption);
    color: var(--color-ink-muted);
  }
</style>
```

### 4. W1-ассерт на dist-HTML (в расширении check-tokens)
```javascript
// Source: паттерн check-seo.mjs (walk dist/**/*.html + regex) — established 01-05
const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const cur = [...html.matchAll(/aria-current="page"/g)];
// ровно один на страницу; href элемента совпадает с маршрутом файла (/ → '/', work → '/work/'…)
if (cur.length !== 1) violations.push(`W1: ${rel}: ожидалось ровно 1 aria-current="page", найдено ${cur.length}`);
```

### 5. Формула WCAG для check-contrast
```javascript
// Source: WCAG 2.x relative luminance + contrast ratio (формула из спецификации)
function luminance(hex) {
  const c = hex.replace('#', '');
  const rgb = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const lin = rgb.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
const ratio = (a, b) => {
  const [la, lb] = [luminance(a), luminance(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};
```
**Верифицированные эталоны для self-test** (рассчитаны в этом исследовании, 2026-08-02): `#000000`×`#FFFFFF` = 21:1; ink×bg = 15.93; ink-muted×bg = 6.59; accent×bg = 5.40; accent×surface = 4.95; white×accent = 5.65; destructive×bg = 6.25; худшая пара палитры проектов — olive×surface = 4.84 (все ≥ 4.5:1). Линия `#DAD9D3`×bg = 1.35 — вне перечня (декоративная, не текст).

### 6. Kill-switch reduced-motion (global.css)
```css
/* Source: AC R4 + design SPEC §08; обнуляем длительности, не состояния */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| padding-top hack (56.25%) для ratio-боксов | `aspect-ratio` (нативно) | 2021 (все браузеры) | Media-рамки — одна строка; CLS-free; фаза 2 использует нативно |
| SCSS `darken()` / ручные hover-hex | `color-mix()` (Color 5) | 2023 (Chrome 111, Safari 16.2, FF 113) | Один токен акцента без дублирующих цветов |
| Медиазапросная типографика (скачки на bp) | Fluid шкала через clamp() в токенах | середина 2010-х → стандарт | Плавное масштабирование; display-токен — clamp (R1) |
| Utility-first CSS как «быстрый путь» | Токенизированный plain CSS + скрипты | проект: ADR P1 (запрет) | Прямо зафиксировано: D-16, P1 фазы 1, check-prohibitions |
| JSON-токены + Style Dictionary (мультиплатформа) | Один CSS-файл токенов (веб-only) | — | Для веб-only проекта CSS-файл — достаточный и проверяемый формат |
| Viewport-юниты (vw) в fluid | Container query units (cqw/cqi) | 2023 (Chrome 105+) | Может понадобиться в фазе 3+ для контейнерозависимых секций; в фазе 2 не требуется (bp-контракт + 5vW зафиксирован UI-SPEC) |
| WCAG 2.x (4.5:1 формула) | APCA (WCAG 3, Lc-значения) | в процессе стандартизации | Для соответствия сегодня — WCAG 2.x формула (зафиксирована в check-contrast); APCA — будущий задел, не блокер |

**Deprecated/outdated:**
- padding-top hack — заменён aspect-ratio (не использовать в Media);
- предпроцессорное затемнение (SCSS/LESS) — заменено color-mix();
- max-width-подход для мобильных — проект фиксирует min-width inclusive (AC R6);
- спрайты/icon-fonts — инлайн-SVG компоненты (D-10/D-11).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | color-mix() доступен в целевых браузерах (Chrome 111+, Safari 16.2+, Firefox 113+) | Code Examples 2 | [ASSUMED] — подтверждено множеством веб-источников (MDN, Chrome Dev, Smashing), но не прогоном в браузерной матрице проекта; портфолио-аудитория — современные браузеры, риск низкий; fallback — `@supports` или токен `--color-accent-hover` |
| A2 | Figma MCP remote-сервер будет доступен на планировании | Environment Availability | [ASSUMED] — заявлено в constraint SPEC («доступен на всех планах»), но в этой исследовательской сессии MCP-инструмент отсутствует; блокирует только R9-концепты, не фазу (D-12: дефолт — контрактная типографика) |
| A3 | W1-ассерт размещается в расширенном check-tokens и требует собранный dist | Pattern 5 | [ASSUMED] — соответствует UI-SPEC inventory («check-tokens ... W1 assert»); если ассерт выделить в отдельный скрипт, контракт UI-SPEC inventory нужно поправить; порядок в npm verify: build → check-tokens |
| A4 | Пропы layout/density/showMetrics мапятся на var(--space-*)/классы-модификаторы без новых токенов | Pattern 2 | [ASSUMED] — значения за Claude's Discretion; если потребуются новые шаги шкалы — добавить в tokens.css (роли не трогать) |
| A5 | Stacki корректно отображает новые компоненты (плоский список self-closing) | Patterns | [CITED: docs/stacki-coverage.md] — проверено на Seo/BaseLayout (компоненты, props, scoped styles); новые компоненты следуют той же модели; варианты-списки в Stacki интерпретировать осторожно (запись «baselayout» в списке вариантов) |
| A6 | eslint a11y-правила не включаются в фазе 2 | Security Domain | [CITED: STATE 01-03 T1] — jsx-a11y не установлен (peer-несовместимость eslint 10); a11y-качество держится на контрактах (aria-current, focus-visible, контраст) и quality gates фазы 6 |

## Open Questions (RESOLVED)

1. **Доступность Figma MCP на этапе планирования**
   - What we know: SPEC требует подключение remote-сервера на планировании (R9); в этой сессии MCP-инструмент не был доступен.
   - What's unclear: наличие токена/авторизации Figma у планировщика.
   - Recommendation: планировщик проверяет доступность MCP первым шагом; при отсутствии — фиксирует дефолт D-12 (контрактная типографика главной) и продолжает планирование без блокировки; выбор пользователя фиксируется в docs/hero-concept.md.
   - **RESOLVED:** дефолт D-12 фиксируется решением 02-02 (выбор варианта первого экрана), применение и фиксация в docs/hero-concept.md — в 02-05; отсутствие MCP не блокирует фазу (см. Assumptions A2).

2. **Где живёт W1-ассерт: в check-tokens или отдельным скриптом**
   - What we know: UI-SPEC inventory относит его к check-tokens («W1 assert»); ассерт требует dist (собранный HTML) — сейчас check-tokens работает только по src.
   - What's unclear: чистота разделения «токены (src)» vs «HTML (dist)» в одном скрипте.
   - Recommendation: по контракту UI-SPEC — расширение check-tokens: при отсутствии dist — проверка пропускается с предупреждением (не fail), в npm verify порядок build → check-tokens уже гарантирует dist.
   - **RESOLVED:** W1-ассерт реализован внутри check-tokens (расширение по контракту UI-SPEC inventory) в 02-01 Task 1, реальный прогон по dist — в 02-03 Task 1 (см. Assumptions A3).

3. **Точные значения пропов layout/density/showMetrics (Claude's Discretion)**
   - What we know: enum-множества заданы (stacked|split; md|lg; boolean), маппинг на токены обязателен (R3 AC).
   - What's unclear: детальные стили каждого варианта (density lg = padding sm/md — уже зафиксировано в UI-SPEC Component Contracts; остальное — реализация).
   - Recommendation: UI-SPEC Component Contracts уже фиксирует все пропсы и их значения — планировщик переносит их в планы как есть.
   - **RESOLVED:** значения перенесены из UI-SPEC Component Contracts в планы как есть: SectionHeading layout (stacked|split, bp 768) — 02-04 Task 1, Button density (md|lg) — 02-03 Task 1, ProjectCard showMetrics — 02-04 Task 2 (см. Assumptions A4).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | scripts, astro build | ✓ (проверено 2026-08-02) | 24.18.0 (engines >=22.22.3 ✓) | — |
| npm | scripts | ✓ | 11.16.0 | — |
| Astro + интеграции | build/check | ✓ (установлены, npm ls чист) | astro 7.1.6, @astrojs/check 0.9.10, typescript 6.0.3, @astrojs/mdx 7.0.5, @astrojs/sitemap 3.7.3 | — |
| ESLint/Prettier | CI lint | ✓ | eslint 10.8.0, prettier 3.9.6 | — |
| gh CLI | CI (не меняется в фазе 2) | ✓ | 2.95.0 | — |
| Шрифты (WOFF2) | вся типографика | ✓ (public/fonts, 8 файлов, кириллица подтверждена) | — | — |
| Современный браузер | clamp/color-mix/aspect-ratio | ✓ (целевая аудитория; DevTools для reduced-motion эмуляции) | — | @supports для color-mix |
| Figma MCP (R9) | генерация концептов | ✗ (не в этой сессии) | — | D-12: дефолт — контрактная типографика; подключение на планировании |
| Stacki v0.1.3 | визуальный проход | ✓ (установлен у пользователя, spike R5 пройден) | v0.1.3 | кодовый режим |

**Missing dependencies with no fallback:** нет — единственная внешняя зависимость (Figma MCP) имеет зафиксированный fallback (D-12), не блокирующий фазу.

**Missing dependencies with fallback:**
- Figma MCP — отсутствие не блокирует: главная остаётся на контрактной типографике; концепты добавляются при доступности сервера.

## Validation Architecture

> `.planning/config.json` не содержит `workflow.nyquist_validation: false` — трактуется как включённый. Конфигурация фазы 1 задала паттерн: «нет тест-фреймворка — plain Node-скрипты с self-tests + CLI-проверки» — фаза 2 продолжает его (никакие новые devDependencies не вводятся).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Нет фреймворка — plain Node.js скрипты с self-tests (`--self-test`) + CLI-проверки (паттерн фазы 1: 6 скриптов) |
| Config file | none — скрипты в `scripts/`, npm scripts в package.json |
| Quick run command | `npm run build` (~30–60 сек) |
| Full suite command | `npm run verify` — расширяется: build + check-seo + check-tokens (расширенный, включает W1-ассерт) + check-contrast (новый) + check-collections + check-prohibitions |
| Estimated runtime | ~60–120 сек |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| R1 | bp-группа, lead/caption, clamp-display, easing-набор в tokens.css; числа media-query = bp-значениям; нет хардкода | unit (node) | `node scripts/check-tokens.mjs` (+ `--self-test`) | ⚠️ существует — РАСШИРЯЕТСЯ (bp-группа + сверка + W1) |
| R2 | 5 маршрутов 200 + HTML; ровно 1 `aria-current="page"` на страницу, соответствует маршруту (W1) | smoke/CLI + unit (dist) | `node scripts/verify-preview.mjs --routes / /work /lab /about /contact`; W1-ассерт внутри check-tokens (после build) | ✅ verify-preview; ❌ W1-ассерт — Wave 0 |
| R3 | Компоненты существуют и используются на страницах; рендер без пропов не ломает сборку | grep + build | grep-контроль использования (в check-tokens или отдельном шаге плана); `npm run build` (пустые пропы — дефолты) | ❌ grep-контроль — Wave 0 |
| R4 | transition только через --motion-*/--ease-*; reduced-motion 0ms; 0 `<script>` в dist | grep + unit (dist) | grep по src/components (в расширении check-tokens); grep `<script` по dist (паттерн check-seo); ручная эмуляция reduced-motion — manual | ❌ grep-правило — Wave 0 |
| R5 | theme-проп типизирован; невалидное значение → astro check fail; фикстура: theme рендерит --project-accent, без theme — нейтрален | unit (CLI) + negative | `npm run check` (TS strict); negative-фикстура: временная страница с theme="bad" → astro check exit 1 → restore (паттерн check-collections) | ❌ negative-фикстура — Wave 0 |
| R6 | 320px без горизонтального скролла; визуальный проход 375/768/1200 | manual | проход пользователя зафиксирован в VERIFICATION | manual-only (сетка адаптивности — суждение) |
| R7 | Media без изображения рендерит рамку с ratio; слот обрезается | build + manual | `npm run build` (компонент с дефолтами); визуальная проверка в проходе | manual-only |
| R8 | check-contrast: все пары перечня ≥ 4.5:1; self-tests зелёные | unit (node) | `node scripts/check-contrast.mjs` (+ `--self-test` с эталонами 21:1, 5.40:1) | ❌ — Wave 0 (новый скрипт) |
| R9 | 2–3 артефакта концептов + docs/hero-concept.md с выбором | manual + doc | проверка документа (наличие, критерии D-14); выбор пользователя | manual-only |
| — | CI (lint → check → build) зелёный | CI | GitHub Actions ci.yml (существует) | ✅ |

### Sampling Rate
- **Per task commit:** `npm run build` (быстрая целостность; astro check в составе build)
- **Per wave merge:** `npm run verify` (полный набор, включая check-contrast)
- **Phase gate:** полный `npm run verify` зелёный + CI зелёный + визуальный проход 375/768/1200 зафиксирован в VERIFICATION перед `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `scripts/check-contrast.mjs` — новый: пары UI-SPEC ≥ 4.5:1, self-tests (R8)
- [ ] `scripts/check-tokens.mjs` — расширение: bp-группа, токены lead/caption/easing, сверка чисел media-query, grep-правило transition-токенов (R1, R4)
- [ ] W1-ассерт по dist-html (внутри check-tokens или отдельным шагом; порядок build → проверка) (R2)
- [ ] negative-фикстура невалидного theme → astro check exit 1 → restore (R5)
- [ ] grep-контроль использования компонентов на страницах (R3)
- [ ] `package.json` verify-скрипт: добавить check-contrast в цепочку (R8)

### Manual-Only Verifications
| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Визуальный проход 375 / 768 / 1200 | R6 | Суждение о композиции/ритме не автоматизируется (скриншот-база отклонена контрактом) | DevTools responsive mode на 3 ширинах; зафиксировать в VERIFICATION; проверить отсутствие горизонтального скролла на 320 |
| prefers-reduced-motion: 0ms во всех состояниях | R4 | Требует эмуляции ОС/DevTools | DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce; hover-проверка всех компонентов |
| Нейтральный покой и акценты только во взаимодействии (SC3) | R5 | Дизайн-суждение | Проход без взаимодействия — интерфейс нейтрален; hover/focus — акценты появляются |
| Выбор концепта первого экрана | R9 | Решение пользователя | 2–3 варианта в Figma; выбор + обоснование в docs/hero-concept.md; отсутствие выбора не блокирует |

## Security Domain

> `security_enforcement`: ключ отсутствует в .planning/config.json — трактуется как включённый. Фаза — статический SSG без клиентского JS, без форм, без пользовательского ввода и внешних API: поверхность атаки минимальна.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Статический сайт, аутентификации нет |
| V3 Session Management | no | Нет сессий/куки-состояния (SSG) |
| V4 Access Control | no | Нет авторизованных ресурсов |
| V5 Input Validation | partial | Единственный «вход» — build-time пропы компонентов: TS strict (`astro/tsconfigs/strict`) + типизированные enum-пропы (theme) — невалидные значения падают сборкой (AC R5); JSON-данные валидируются zod (фаза 1, content.config.ts — не изменяется) |
| V6 Cryptography | no | Нет шифрования/секретов (только локальные шрифты и статика) |
| V11 Business Logic | no | Нет бизнес-логики в рантайме |

### Known Threat Patterns for {stack}
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Нежелательный контент в собранном HTML (инъекция через props) | Tampering | Статический рендер + TS strict + zod на контенте; пропы — enum/boolean, а не произвольные строки-разметка |
| Атаки на цепочку зависимостей | Tampering | Ноль новых зависимостей в фазе (gate Package Legitimacy не применим); существующие — из официального реестра (проверено фазой 1) |
| А11y-риски как «безопасность восприятия» (контраст < 4.5:1, пропавший aria-current) | (не STRIDE; WCAG) | check-contrast (≥4.5:1 все пары), W1-ассерт (ровно один aria-current на маршрут), :focus-visible ring, reduced-motion baseline — всё автоматизировано или зафиксировано контрактом; eslint a11y-правила намеренно не включаются (решение 01-03 T1 — peer-несовместимость), a11y-гейты — фаза 6 |

## Sources

### Primary (HIGH/MEDIUM confidence)
- [docs.astro.build/en/guides/styling/](https://docs.astro.build/en/guides/styling/) — scoped styles, `[data-astro-cid-*]`, `:global`, порядок каскада (link < imported < scoped), наследование переменных — fetched 2026-08-02 [CITED]
- [web.dev/articles/aspect-ratio](https://web.dev/articles/aspect-ratio) — aspect-ratio, CLS, object-fit [CITED]
- [MDN: color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) + [Chrome for Developers: CSS color-mix](https://developer.chrome.com/docs/css-ui/css-color-mix) — синтаксис, поддержка, паттерн darken [CITED]
- [WCAG 2.2 contrast ratio formula](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) — (L1+0.05)/(L2+0.05), пороги 4.5:1 [CITED]
- [colorarchive.org: Color Contrast and Accessibility](https://colorarchive.org/guides/color-contrast-accessibility-guide/) — формула + APCA сравнение [VERIFIED: численный расчёт всех пар выполнен в этой сессии]
- Собственный численный расчёт контраста всех пар UI-SPEC (Node, формула WCAG) — эталоны для self-test [VERIFIED]

### Secondary (MEDIUM confidence)
- [dev.to: Motion Design Tokens That Actually Compose](https://dev.to/raxxostudios/motion-design-tokens-that-actually-compose-durations-easings-choreography-12e4) — трёхслойные motion-токены, шкалы длительностей, prefer-reduced-motion override
- [Smashing Magazine: Simplify Your Color Palette With CSS Color-Mix()](https://www.smashingmagazine.com/2022/06/simplify-color-palette-css-color-mix/) — color-mix + @supports fallback нюанс
- [colorarchive.org: Design Token Systems for SaaS](https://colorarchive.org/guides/saas-design-token-system/) — примитивные/семантические слои, анти-дрейф
- [30-seconds-of-code: fluid-typography](https://github.com/Chalarangelo/30-seconds-of-code/blob/master/content/snippets/css/s/fluid-typography.md) — формула clamp
- [Cedar Design System (REI Co-op): fluid](https://cedar.rei.com/guidelines/fluid) — fluid шкала как custom properties, cqw
- [colorarchive.org: Accessible Color Palette Ideas](https://colorarchive.org/guides/accessible-color-palette/) — приглушённые акценты и WCAG
- [UX Collective: enterprise UI color palettes](https://uxdesign.cc/a-systematic-approach-to-generating-enterprise-ui-color-palettes-ecaf0c164c17) — системная генерация палитр с AA
- [codetv.dev: CSS overrides without important using layers in Astro](https://codetv.dev/blog/astro-css-overrides-layers) — каскадные слои в Astro-компонентах

### Tertiary (LOW confidence)
- [SitePoint: fluid text sizes](https://www.sitepoint.com/community/t/fluid-text-sizes/407967/11) — дискуссия, только контекст
- [github.com/lumosframework/lumos](https://github.com/lumosframework/lumos) — референс принципов (D-16), не импортируется
- [github.com/flowtricks/stacki](https://github.com/flowtricks/stacki) — README (парсинг-модель), spike R5

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — новых пакетов нет; существующий стек верифицирован в этой сессии (npm ls, node --version)
- Architecture: MEDIUM — паттерны (проп→CSS-переменная, kill-switch, scoped media-queries) — стандартная практика, подтверждённая официальными docs (Astro, web.dev, MDN) и численными расчётами; экзотики нет
- Pitfalls: MEDIUM — аспект-ratio/grid, color-mix fallback, scoped-стили — документированы первоисточниками; часть нюансов (Stacki-отображение новых компонентов) — по spike R5

**Research date:** 2026-08-02
**Valid until:** 2026-09-01 (30 дней; CSS-фичи и Astro 7 — стабильные, Stacki остаётся v0.1.3)
