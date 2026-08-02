# Phase 2: Визуальная система - Context

**Gathered:** 2026-08-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Единая визуальная система «Calm Interface, Active Work» реализована в коде: tokens.css расширен (bp-токены, шаги шкалы lead/caption, fluid display через clamp(), easing-набор) без переименования ролей; все 5 страниц используют оболочку системы (контейнер, типографика, nav, структурный footer); переиспользуемые компоненты с семантическими пропами; интерактивные состояния только CSS в рамках бюджета motion; контракт проектных цветов (theme-проп); адаптивность внутри компонентов; медиа-оболочка; скрипты верификации; концепты первого экрана (2–3 варианта) генерируются в Figma через MCP как референс-выбор для главной.

</domain>

<spec_lock>
## Requirements (locked via SPEC.md)

**9 requirements are locked.** See `02-SPEC.md` for full requirements, boundaries, and acceptance criteria.

Downstream agents MUST read `02-SPEC.md` before planning or implementing. Requirements are not duplicated here.

**In scope (from SPEC.md):**
- Расширение tokens.css: bp-токены (md/lg), шаги шкалы (lead, caption), fluid display (clamp), easing-набор — без переименования существующих ролей
- Стилизация оболочки всех 5 страниц (контейнер, gutter, типографика, nav, структурный footer, placeholder-состояния)
- Компоненты: Button, Link, SectionHeading, ProjectCard, Media, Tag/Badge, Nav, Footer + минимальный набор инлайн-SVG иконок (24px, единый stroke)
- CSS-интерактивные состояния (hover/focus/active) + prefers-reduced-motion baseline
- Контракт theme-пропа (custom property --project-accent), нейтральный покой
- Фикс W1 (aria-current на всех маршрутах)
- Медиа-оболочка (figure + ratio + рамка + caption + слот)
- Генерация 2–3 концептов первого экрана в Figma через MCP + фиксация выбора в docs/hero-concept.md
- Верификация: расширение check-tokens (bp-группа, сверка media-query), check-contrast, ассерт W1

**Out of scope (from SPEC.md):**
- Реальный контент страниц (тексты, кейсы, контакты, ссылки footer) — фаза 3
- Изображения кейсов и их обработка через Astro Image — фаза 3 (в фазе 2 — только контракт Media); превью кейсов — реальные скриншоты, не генерация
- Поле цвета в схеме projects — фаза 3 (данные проектов)
- JS-движение (scroll reveal, View Transitions, hover-preview индекса, микроинтеракции) — фаза 5 (порядок ADR: CSS → vanilla JS → View Transitions → island)
- Индекс Work с hover-preview — фаза 5
- Тёмная тема — вне v1 (UI-SPEC 01: light only)
- Utility-first CSS (Tailwind и аналоги) — запрещено ADR и P1 фазы 1
- Codex в workflow — не подключается (решение пользователя 2026-08-02)
- Скриншот-база для верификации — не выбранный контракт (скрипты + живой прогон)

</spec_lock>

<decisions>
## Implementation Decisions

### Характер оболочки («лицо» системы)
- **D-01:** Навигация — моно-индексы «01 / Work»: JetBrains Mono номера + тонкие разделители между пунктами; активный пункт — accent (индекс и лейбл), остальные — muted, hover — графит; на 320px индексы скрываются, пункты — одна строка (label 14px). — **Reversibility:** reversible — содержится в Nav-компоненте
- **D-02:** Имя в header — моно-подпись JetBrains Mono, графит; не конкурирует с навигацией.
- **D-03:** Footer-оболочка — одна моно-строка «© 2026 · Иван Шиваршинов» + моно-метка раздела, тонкая верхняя граница; контент колонок (email, social, ссылки) — фаза 3. — **Reversibility:** reversible — расширение footer в фазе 3 не ломает каркас
- **D-04:** Страницы-заглушки — empty-state в системе: моно-подпись «WORK — раздел в разработке» + тонкая рамка-контур; честный статус, легко заменяется в фазе 3.
- **D-05:** Моно-метка страницы «01 / HOME» над контентом на каждой из 5 страниц — системный признак моно-слоя в оболочке.
- **D-06:** Метки nav и footer — русские (точные формулировки — Claude's Discretion; сайт русскоязычный, D-08).

### Палитра акцентов проектов (theme-проп, R5)
- **D-07:** Палитра — ровно 5 приглушённых цветов, семантические имена (типа clay/olive/slate/plum/brass — точные имена и hex — Claude's Discretion); системный accent #A84B32 (терракота) входит в enum как один из пяти. — **Reversibility:** costly — enum-контракт потребляется схемой projects (фаза 3) и Stacki-вариантами; переименование/удаление значений затронет данные кейсов
- **D-08:** Характер акцентов — приглушённые («цвет появляется локально и временно»); каждая пара текст/фон должна проходить check-contrast ≥4.5:1 на нейтральной основе; насыщенные тона не входят (граница «неоновой AI-эстетики», REQ-design-implications).

### Набор иконок (R3)
- **D-09:** Расширенный набор (10+): базовые (arrow-right, external-link, arrow-down, mail, copy) + социальные (github, telegram, linkedin) + состояния (check, close); точный список финализирует планировщик.
- **D-10:** Хранение — отдельные self-closing компоненты `Icon*.astro` (плоский список из D-04, естественный рендер в Stacki); без switch-контейнеров и спрайтов.
- **D-11:** Контракт стиля — сетка 24px, stroke 2px, `currentColor`, кастомные геометрические paths (прямые линии, прямоугольники — язык «прямоугольные плоскости, тонкие линии»).

### Концепты первого экрана (R9)
- **D-12:** Момент выбора — на этапе планирования (Figma MCP подключается там, constraint SPEC): варианты сгенерированы до выполнения, план главной учитывает выбранный вариант; отсутствие выбора не блокирует фазу (дефолт — контрактная типографика).
- **D-13:** Главная в фазе 2 рендерит shell по выбранному концепту: моно-метка «01 / HOME» + имя (Unbounded, display) + primary CTA Button «Смотреть работы»; текст формулы обещания и подписи — фаза 3 (REQ-main-promise).
- **D-14:** Критерии выбора (входят в docs/hero-concept.md как обоснование): реализуемость в системе (токены/сетка/CSS-only), соответствие «Calm Interface, Active Work», задел под контент фазы 3 без перекомпоновки.
- **D-15:** Все 2–3 варианта архивируются: ссылки/скриншоты + обоснование выбора в docs/hero-concept.md; невыбранные остаются в Figma как референс (макет — не источник правды).

### Lumos Framework (решение пользователя 2026-08-02, проверено по первоисточникам)
- **D-16:** Lumos (Timothy Ricks, MIT, utility-class CSS для Webflow: color.css/layout.css/spacing.css, классы-утилиты с `[class*="..."]`, bp 480/768/992) НЕ импортируется в проект: это utility-class система, конфликтующая с locked-запретом P1 фазы 1 (utility-first CSS), контрактом bp 768/1200 (R1/R8) и единым файлом токенов (check-tokens). Используется как референс принципов: организация токенов группами (color/layout/spacing) и component-first мышление переносятся в tokens.css без кода. — **Reversibility:** costly — обратное (импорт) требует пересмотра ADR и контрактов скриптов; зафиксировано в Deferred Ideas как возможный пересмотр в фазе 6
- **Примечание:** утверждение «Lumos разработал тот же автор, что и Stacki» по первоисточникам не подтверждается (flowtricks/stacki не упоминает ни Timothy Ricks, ни Lumos); в решения не переносится.

### Claude's Discretion
Точные русские формулировки меток nav/footer; точные имена и hex 4 приглушённых цветов (5-й — терракота; все пары проходят контраст); финальный список иконок; формат моно-метки страницы и разделителей; hover-детали ссылок/карточек (только через motion/ease-токены); значения пропов layout/density/theme/showMetrics; разбиение работы на планы.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Locked requirements
- `.planning/phases/02-vizualnaya-sistema/02-SPEC.md` — Locked requirements — MUST read before planning (9 требований, 14 AC, границы, constraints)
- `.planning/phases/01-osnova-proekta/01-UI-SPEC.md` — UI-контракт фазы 1: accent только для active nav + focus-ring в фазе 1, с фазы 2 — ссылки и primary CTA; light-only; типографика 4 роли; контейнер 1200px, gutter 24/48

### Контекстные документы
- `docs/design_direction_portfolio_ivan_shivarshinov.md` — дизайн-направление (SPEC, precedence 0): визуальный язык «Calm Interface, Active Work», моно-слой для индексов/ролей/дат/статусов, «номера и подписи», «цвета проектов появляются локально и временно», §08 бюджет интерактивности
- `docs/Техническая стратегия портфолио Astro + AI-агент + Stacki.md` — ADR: порядок анимаций (CSS → vanilla JS → View Transitions → island), запрет utility-first CSS (P1), единый источник истины — Astro в Git, quality gates
- `docs/stacki-coverage.md` — spike: scoped styles + CSS-переменные одновременно — проверенная конструкция (краевой случай 1); CSS-переменные и View Transitions — только кодовый режим Stacki
- `docs/positioning_portfolio_ivan_shivarshinov.md` — PRD: структура разделов, формула обещания (REQ-main-promise — фаза 3), тон
- `.planning/phases/01-osnova-proekta/01-CONTEXT.md` — решения фазы 1: D-04 (плоская композиция компонентов для Stacki), структура, шрифты

### Внешние референсы
- `https://github.com/lumosframework/lumos` — Lumos Framework (MIT, Timothy Ricks): РЕФЕРЕНС ПРИНЦИПОВ ТОЛЬКО (D-16), НЕ импортировать; организация токенов color/layout/spacing
- `https://github.com/flowtricks/stacki` (README) — парсинг-модель Stacki; авторство Timothy Ricks не подтверждается

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/styles/tokens.css` — 5 групп токенов (color/typography/spacing/containers/motion): расширяется bp-группой (--bp-md 768px, --bp-lg 1200px), шагами --text-lead/~18px и --text-caption/~12px (моно), fluid --text-display (clamp), easing-набором; роли не переименовывать
- `src/styles/global.css` — @font-face Manrope/Unbounded/JetBrains Mono (локальные WOFF2, кириллица, swap), body-база, :focus-visible ring (2px accent) — сюда добавляется prefers-reduced-motion baseline
- `src/layouts/BaseLayout.astro` — nav из 5 ссылок с нормализацией pathname (фикс W1 уже применён), пустой footer; Nav/Footer компоненты заменяют inline-разметку
- `src/components/Seo.astro` — единственный существующий компонент; паттерн компонентов фазы 2 — рядом
- `scripts/check-tokens.mjs` — контракт токен-дисциплины (единый файл, 5 групп, запрет hex/px-шкалы вне tokens.css) — расширяется bp-группой и сверкой media-query; новый `scripts/check-contrast.mjs`
- `public/fonts/*.woff2` — 8 файлов Manrope/Unbounded + JetBrains Mono, полная кириллица

### Established Patterns
- Scoped styles + CSS-переменные в одном компоненте — проверенная конструкция (spike R5), эталон — scoped-стиль active nav в BaseLayout
- Композиция страниц: layout + плоский список self-closing компонентов с пропами (D-04) — страницы фазы 2 строятся так же
- Статический SSG без клиентского JS: 0 тегов `<script>` в собранных страницах (AC R4)
- Всё потребляется через var(); хардкод значений шкалы вне tokens.css запрещён (check-tokens)

### Integration Points
- `BaseLayout.astro` — точка замены nav/footer на компоненты; метка страницы — новый элемент над `<slot />`
- 5 страниц (`index/work/lab/about/contact.astro`) — placeholder-контент заменяется empty-state + метка страницы; главная — shell по выбранному концепту (метка + имя + CTA)
- `tokens.css` — единственная точка добавления токенов; числа медиазапросов в компонентах сверяются с bp-значениями (R8)
- `content.config.ts` — НЕ изменять (поле цвета проектов — фаза 3)
- Figma MCP — подключается на планировании фазы 2 (remote-сервер) для генерации концептов

</code_context>

<specifics>
## Specific Ideas

- «Крупные реальные интерфейсы и схемы вместо мокапов» (дизайн-направление) — при выборе концептов первого экрана отдавать предпочтение композициям, не имитирующим контент
- Моно-слой как системный признак: индексы в nav, метка страницы, подписи footer — единый язык «номеров и подписей»
- Lumos: пользователь предложил импорт как «набор правил для работы с кодом»; проверка по первоисточникам показала utility-class систему под Webflow — решение D-16 (референс принципов, без кода)

</specifics>

<deferred>
## Deferred Ideas

- **Пересмотр запрета utility-first CSS (и возможный импорт Lumos)** — фаза 6 при пересмотре ADR; в фазе 2 запрет действует (D-16, P1 фазы 1)
- **Точные русские формулировки меток nav и подписей страниц** — вместе с контентом (фаза 3); в фазе 2 — рабочие формулировки по тону

</deferred>

---

*Phase: 02-vizualnaya-sistema*
*Context gathered: 2026-08-02*
