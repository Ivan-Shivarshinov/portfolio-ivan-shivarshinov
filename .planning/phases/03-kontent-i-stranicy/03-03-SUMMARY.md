---
phase: 03-kontent-i-stranicy
plan: 03
subsystem: content
tags: [mdx, content-collections, getStaticPaths, components-prop, tracer, projectcard, seo]

# Dependency graph
requires:
  - phase: 03-kontent-i-stranicy
    provides: "План 03-01: схема коллекции projects (theme/featured/cover/coverAlt, image()-хелпер cover, регэксп слага /^[a-z0-9-]+$/, строгий дубликат-слаг)"
  - phase: 03-kontent-i-stranicy
    provides: "План 03-02: check-tone.mjs (денлист + позитивные ассерты + self-test), правила 7/9 check-tokens (0 aria-current на страницах кейсов, ровно 1 script на /contact), параметризация check-seo (5 + N страниц)"
provides:
  - "Первый утверждённый кейс end-to-end: src/content/projects/skala.mdx (схема 03-01, 4 h2, strong-лейблы «Моя зона.»/«Команда.»/«Эффект.», метрика 100→600+ по правке пользователя) + скриншот src/assets/projects/skala/cover.png (PNG 1920×928)"
  - "ProjectCard.astro с новыми props summary/href: карточка-ссылка (.card__title-link — ink→accent в hover, underline), .card__summary (body-роль)"
  - "/work рендерит карточки из коллекции projects (getCollection + sort по order); фикстурный SYSTEM DEMO-блок удалён (AC R2)"
  - "Новый динамический маршрут src/pages/work/[slug]/index.astro: getStaticPaths + render(entry) + components-prop h2 → CaseSectionHeading (SECTION_META PROBLEM/RESPONSIBILITY/SOLUTION/RESULT), pageLabel 02/WORK, нижняя навигация «Все работы»/«Следующий кейс» с замыканием"
  - "CaseSectionHeading.astro — обёртка h2→SectionHeading (компонент-референс в components-мапе, текст из default-слота)"
  - "03-VERIFICATION.md: утверждённый состав 6 кейсов (темы D-07, 3 featured, реальные имена), материал интервью skala, утверждение K1–K4, результаты проверок"
affects: [03-04, 03-05, 03-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "components-prop рендера MDX требует компонент-референс, не инлайн-функцию: инлайн-функция без метаданных рендера → NoMatchingRenderer (Unable to render 'h2')"
    - "Текст MDX-заголовка в подменённом h2 приходит default-слотом, НЕ Astro.props.children: renderJSXVNode (astro/dist/runtime/server/jsx.js) выносит children в слоты — читать через Astro.slots.render('default')"
    - "Динамический маршрут кейса: getStaticPaths по коллекции (sort по order) → params.slug + props {entry, projects}; следующий кейс — замыкание (idx+1) % N"
    - "Скриншот через image()-объект cover из frontmatter (Pitfall 5), сортировка карточек по order (Pitfall 10)"

key-files:
  created: [src/content/projects/skala.mdx, src/pages/work/[slug]/index.astro, src/components/CaseSectionHeading.astro, src/assets/projects/skala/cover.png, src/assets/projects/skala/.gitkeep]
  modified: [src/components/ProjectCard.astro, src/pages/work.astro, .planning/phases/03-kontent-i-stranicy/03-VERIFICATION.md]

key-decisions:
  - "Состав кейсов фазы утверждён 2026-08-03: 6 реальных проектов — skala, buzko-legal, dias, winwin, mayak, tech-law-conf (темы D-07: slate/plum/clay/olive/clay/slate)"
  - "Featured ровно 3: skala, buzko-legal, winwin (D-09); tracer-кейс — skala (D-01)"
  - "Именование — реальные названия клиентов, NDA-анонимизация не требуется (D-03/K2); слаги по /^[a-z0-9-]+$/"
  - "Правка пользователя в «Результат» кейса skala: метрика роста команд со ~100 до 600+ (публичная цифра skala.io «600+ команд», узкая — платформа, не сайт)"
  - "Галерея кейсов (2–4 скриншота) отложена — gap-план после верификации фазы (deferred-items.md)"

patterns-established:
  - "Pattern: подмена MDX-элемента на компонент = обёртка с SECTION_META-маппингом по тексту заголовка; в components-мапе — ссылка на компонент, текст читается из default-слота"
  - "Pattern: страница кейса как вертикальный срез схемы → контента → карточки → страницы разбора (tracer-first: архитектура проверена до массового наполнения)"
  - "Pattern: D-04 — черновики кейсов коммитятся только после утверждения K1–K4 (checkpoint:human-verify)"

requirements-completed: [REQ-evidence-cases]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Первый утверждённый кейс skala: src/content/projects/skala.mdx по схеме 03-01 (theme slate, featured, cover/coverAlt, роль, стек, order 1) — тело ровно с 4 h2 («Проблема», «Ответственность», «Решение», «Результат»), strong-лейблы «Моя зона.»/«Команда.»/«Эффект.», ~500 слов, факты только из интервью (K1), метрика 100→600+ (правка пользователя)"
    requirement: REQ-evidence-cases
    verification:
      - kind: other
        ref: "checkpoint:human-verify 03-03 Task 3 — утверждено 2026-08-03 (K1–K4), скриншот cover.png (PNG 1920×928)"
        status: pass
      - kind: other
        ref: "npm run build — exit 0 (image() валидирует существование cover.png, Pitfall 6)"
        status: pass
    human_judgment: true
    rationale: "Достоверность фактов кейса (K1), именование (K2) и разделение вклада (K3) подтверждает только пользователь — проверка 03-06 прогоняет текст по денлисту тона, но не по истинности"
  - id: D2
    description: "/work рендерит карточки из коллекции projects (getCollection + sort по order): ProjectCard с props summary/href/theme, Media ratio 4:3 + Image(cover), теги стека (slice 0..3); фикстурный SYSTEM DEMO-блок удалён — в dist нет фикстурных названий (AC R2)"
    requirement: REQ-evidence-cases
    verification:
      - kind: other
        ref: "npm run build — exit 0; grep dist/work/index.html: ровно 1 ссылка href=\"/work/skala/\"; grep -rl \"SYSTEM DEMO\" dist/ — пусто"
        status: pass
    human_judgment: false
  - id: D3
    description: "Маршрут /work/skala/: getStaticPaths по коллекции, render(entry) рендерит MDX один раз, components-prop h2 → CaseSectionHeading (меты PROBLEM/RESPONSIBILITY/SOLUTION/RESULT), уникальная SEO-пара, pageLabel 02/WORK, нижняя навигация «Все работы»/«Следующий кейс» с замыканием"
    requirement: REQ-evidence-cases
    verification:
      - kind: other
        ref: "npm run build — exit 0; dist/work/skala/index.html содержит 4 section-heading с метами PROBLEM/RESPONSIBILITY/SOLUTION/RESULT и h2 «Проблема/Ответственность/Решение/Результат»; node scripts/check-seo.mjs — exit 0 (6 пар title/description, sitemap); 0 aria-current на странице кейса, ровно 1 на верхнеуровневых"
        status: pass
    human_judgment: false

# Metrics
duration: 25min
completed: 2026-08-03
status: complete
---

# Phase 3 Plan 3: Первый утверждённый кейс end-to-end — skala (tracer)

**Кейс Skala Inc. прошёл весь вертикальный срез «схема → MDX-контент → карточка на /work → страница разбора /work/skala/» и утверждён пользователем (K1–K4, скриншот в репозитории); состав из 6 кейсов, темы и 3 избранных зафиксированы в 03-VERIFICATION.md**

## Performance

- **Duration:** ~25 min (продолжение сессии: Task 1–2 выполнены ранее, утверждение Task 3 от 2026-08-03)
- **Started:** 2026-08-03T18:36:00Z (продолжение; план начат 2026-08-03)
- **Completed:** 2026-08-03T18:53:30Z
- **Tasks:** 3 (1 decision — утверждён; 1 tracer — выполнен и утверждён; 1 human-verify — approved)
- **Files modified:** 7

## Accomplishments
- Первый кейс `skala` (Skala Inc., legal-tech, тема slate, featured) утверждён пользователем: текст K1–K3, скриншот K4 (PNG 1920×928), правка пользователя — метрика роста команд со ~100 до 600+ в «Результат» (публичная цифра skala.io «600+ команд», узкая и честная)
- ProjectCard.astro: новые опциональные props `summary`/`href` — карточка-ссылка на кейс (контракт Link: ink → accent + underline в hover/focus), summary в body-роли (--text-body, muted)
- /work рендерит карточки из коллекции `projects` (sort по order); фикстурный SYSTEM DEMO-блок удалён целиком — в dist фикстурных названий нет (AC R2)
- Новый динамический маршрут `src/pages/work/[slug]/index.astro`: getStaticPaths + render(entry) (тело рендерится один раз) + components-prop h2 → CaseSectionHeading с моно-метами PROBLEM/RESPONSIBILITY/SOLUTION/RESULT; уникальная SEO-пара (check-seo: 6 страниц, sitemap OK)
- Сборка зелёная: `npm run build` exit 0 (astro check + 6 страниц + оптимизация cover.png → webp 66 кБ), `npm run lint` exit 0, self-tests check-tokens/check-tone exit 0

## Task Commits

Каждая задача закоммичена атомарно:

1. **Task 1: Состав кейсов, темы и именование (D-01/D-03/D-07)** — `b111aac` (docs, запись утверждённого состава + K1–K4 в 03-VERIFICATION.md)
2. **Task 2: Первый кейс end-to-end — MDX, ProjectCard summary/href, /work из коллекции, маршрут /work/{slug}/** — `6a8f159` (feat)
3. **Task 3: Утверждение первого кейса + скриншот (K1–K4)** — утверждён пользователем 2026-08-03; файлы кейса в коммите Task 2

**Plan metadata:** (финальный docs-коммит выполняется после создания SUMMARY)

## Files Created/Modified
- `src/content/projects/skala.mdx` - Первая запись кейса по схеме 03-01: frontmatter (slug/title/summary/role/stack/year/status/client-type/order/theme/featured/cover/coverAlt) + 4 h2; ~500 слов; «Моя зона.»/«Команда.»/«Эффект.»; метрика 100→600+
- `src/pages/work/[slug]/index.astro` - Динамический маршрут кейса: getStaticPaths по коллекции, render(entry), components-prop h2 → CaseSectionHeading, шапка-мета role · year · stack · client-type, Media 16:9, нижняя навигация
- `src/components/CaseSectionHeading.astro` - Обёртка h2 → SectionHeading: SECTION_META-маппинг по тексту заголовка из default-слота
- `src/components/ProjectCard.astro` - Props summary/href; .card__title-link (Link-контракт); .card__summary; ACCENTS-маппинг и split/stacked не тронуты
- `src/pages/work.astro` - Карточки из коллекции projects вместо демо-блока: SectionHeading «CASE STUDIES / Работы» + grid 2 колонки ≥768px
- `src/assets/projects/skala/cover.png` + `.gitkeep` - Скриншот пользователя (PNG 1920×928, ~2,1 МБ) + место для активов
- `.planning/phases/03-kontent-i-stranicy/03-VERIFICATION.md` - Утверждённый состав 6 кейсов (темы, featured, именование), материал интервью skala, утверждение K1–K4, результаты проверок 03-03

## Decisions Made
- Состав 6 кейсов (реальные проекты): skala, buzko-legal, dias, winwin, mayak, tech-law-conf; темы D-07: slate/plum/clay/olive/clay/slate (утверждено 2026-08-03)
- Ровно 3 featured: skala, buzko-legal, winwin (D-09)
- Реальные имена клиентов — NDA-анонимизация не требуется (D-03/K2); слаги по регэкспу схемы
- Правка пользователя: метрика «~100 → 600+ команд» в «Результат» — принята в текст кейса
- Галерея кейсов (2–4 скриншота) — отложена: gap-план после верификации фазы (deferred-items.md)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Инлайн-функция в components-мапе рендера MDX падает сборкой (NoMatchingRenderer)**
- **Found during:** Task 2/3 верификация (полный build после утверждения)
- **Issue:** План предписывал `components={{ h2: (props) => <SectionHeading ... /> }}`. На Astro 7.1.6/@astrojs/mdx 7.0.5 (Sätteri-процессор) инлайн-функция в components-мапе не имеет метаданных рендера — Astro бросает `NoMatchingRenderer: Unable to render 'h2'`, build exit 1
- **Fix:** Выделена обёртка `CaseSectionHeading.astro` (SECTION_META-маппинг внутри), в components-мапу передаётся ссылка на компонент: `<Content components={{ h2: CaseSectionHeading }} />`
- **Files modified:** src/components/CaseSectionHeading.astro (новый), src/pages/work/[slug]/index.astro
- **Verification:** npm run build exit 0; dist/work/skala/index.html содержит 4 section-heading с верными метами и h2
- **Committed in:** 6a8f159 (коммит Task 2)

**2. [Rule 1 - Bug] Текст MDX-заголовка не приходит в Astro.props.children — пустые h2 и меты SECTION**
- **Found during:** Task 2/3 верификация (после фикса №1: TS-ошибки ушли, но меты рендерились как SECTION, h2 — пустые)
- **Issue:** renderJSXVNode (astro/dist/runtime/server/jsx.js, ветка isAstroComponentFactory) выносит `children` из props в default-слот — `Astro.props.children` у компонента-подмены h2 равен undefined; `Astro.slots.render('default')` возвращает текст заголовка. Плюс первичные TS-ошибки (ts(7053)/ts(7006) на инлайн-колбэке) — устранены тем же фиксом
- **Fix:** CaseSectionHeading читает `await Astro.slots.render('default')` → trim → SECTION_META[text] (мета PROBLEM/RESPONSIBILITY/SOLUTION/RESULT); SECTION_META типизирован как Record<string, string>
- **Files modified:** src/components/CaseSectionHeading.astro, src/pages/work/[slug]/index.astro
- **Verification:** dist/work/skala/index.html: меты PROBLEM/RESPONSIBILITY/SOLUTION/RESULT + h2 «Проблема/Ответственность/Решение/Результат»
- **Committed in:** 6a8f159 (коммит Task 2)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Оба фикса необходимы для рабочей сборки; архитектурный паттерн фазы (components-prop) теперь проверен на реальной версии Astro и зафиксирован в patterns-established. Новый файл — только CaseSectionHeading.astro. Отклонение от буквы плана (инлайн-функция → компонент-обёртка) не меняет контракт UI (SectionHeading с моно-метами остаётся).

## Issues Encountered
- Полный build после утверждения Task 3 выявил две проблемы components-prop (см. Deviations): план 03-03 явно откладывал полный build до Task 3 (cover: image() валидирует файл скриншота, Pitfall 6) — обе проблемы найдены в предусмотренном месте
- Pre-existing planned-red (не из этого плана, зафиксированы в STATE.md): check-tokens правило 9 (0 `<script>` в dist, ожидается 1 на /contact — red до 03-05); check-tone позитивные ассерты страниц 03-04/03-05 (about PROFILE/AUDIENCES/CAPABILITIES/TRAJECTORY, lab DIRECTIONS/PROCESS/«Эксперименты в работе», index-фраза, contact mailto). Все проверки, относящиеся к контенту 03-03, зелёные: денлист тона — ноль попаданий в новом контенте; aria-current: 0 на странице кейса, ровно 1 на верхнеуровневых
- contacts.json «File not found» в логе сборки — pre-existing (strict-json-loader 01-04, файл появится в планах контента фазы), build exit 0

## User Setup Required
None - скриншот предоставлен пользователем в рамках Task 3 (src/assets/projects/skala/cover.png).

## Self-Check: PASSED

- Files: skala.mdx, cover.png, .gitkeep, ProjectCard.astro, CaseSectionHeading.astro, work.astro, work/[slug]/index.astro, 03-VERIFICATION.md, 03-03-SUMMARY.md — все существуют
- Commits: 6a8f159 (feat Task 2), b111aac (docs Task 1) — присутствуют в git log

## Next Phase Readiness
- Архитектурный паттерн страницы кейса проверен и зафиксирован — 03-04 наполняет оставшиеся 5 кейсов по образцу skala (D-04: черновики → утверждение K1–K4)
- Состав/темы/featured утверждены и лежат в 03-VERIFICATION.md — 03-04 берёт их без нового интервью
- check-tokens красный по правилу 9 до 03-05 (contact copy-скрипт); check-tone красный по позитивным ассертам до 03-04/03-05 — ожидаемо
- Финальные гейты: 03-06 (check-collections в диапазоне 5–6, сверка денлиста тона по dist, verify-цепочка)

---
*Phase: 03-kontent-i-stranicy*
*Completed: 2026-08-03*
