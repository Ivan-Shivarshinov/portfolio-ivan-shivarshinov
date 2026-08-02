---
phase: 02-vizualnaya-sistema
plan: 04
subsystem: ui
tags: [astro, components, theme-contract, icons, svg, tokens, ts-strict]

# Dependency graph
requires:
  - phase: 02-vizualnaya-sistema
    provides: 02-03 — tokens.css (6 групп: color, project-*, typography, spacing, containers, motion, bp), global.css kill-switch reduced-motion, паттерн компонента «interface Props + деструктуризация с дефолтами + scoped style через var()» (Seo.astro/Button.astro), эталон иконки IconArrowRight.astro, Button.astro (theme-форма)
  - phase: 02-vizualnaya-sistema
    provides: 02-02 — решение палитры проектов (D-07: clay/olive/slate/plum; терракота = --color-accent), нейтральный покой D-08
  - phase: 01-osnova-proekta
    provides: check-tokens.mjs (единый файл токенов, hex/px-запрет, bp/media-сверка, transition-grep), check-theme.mjs (negative-фикстура R5, создан 02-01)
provides:
  - SectionHeading.astro — meta/title/layout ('stacked'|'split'); моно-надзаголовок D-05; split ≥768px (row, space-between, baseline, --space-lg)
  - Tag.astro — label/theme (5-enum)/size ('sm'|'md'); ACCENTS-маппинг → inline style '--project-accent' при theme; без theme — нейтральный покой; hover border→ink
  - Media.astro — ratio ('16:9'|'4:3'|'3:2'|'1:1')/caption; RATIOS-маппинг; .media__frame (aspect-ratio var(--ratio), overflow hidden, min-height 0, 1px var(--color-line)); моно-figcaption; рендерится без изображения (edge R7, контракт для <Image /> фазы 3)
  - ProjectCard.astro — title/meta/theme/showMetrics/layout; ACCENTS → '--project-accent' на корне article; слоты name='media' и дефолтный; hover border→ink-muted + title→accent; нейтральный покой SC3; split ≥768px (media | body, flex 1)
  - 9 Icon*.astro (ExternalLink, ArrowDown, Mail, Copy, Github, Telegram, Linkedin, Check, Close) — self-closing, svg 24 grid, stroke 2, linecap square, currentColor, non-scaling-stroke, aria-hidden, size default 24 (D-09/D-10/D-11); итого набор из 10 иконок (с IconArrowRight из 02-03)
  - Проверка R5 подтверждена реальным прогоном check-theme: theme="bad" падает на astro check (TS strict), фикстура удалена, дерево чисто
affects: [02-05 (страничные композиции закрывают grep-контроль использования SectionHeading/ProjectCard/Media/Tag; SYSTEM DEMO на work.astro с Media/Tag/ProjectCard + IconExternalLink), 02-06 (визуальный проход), фаза 3 (Media-слот для <Image />, реальные кейсы в ProjectCard, Tag на карточках)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Theme-контракт R5: enum-проп → inline style с кавыченным ключом { '--project-accent': ACCENTS[theme] } — custom property наследуется в слоты (Pitfall 6 обходится runtime-каскадом), а кавычки не ловятся VAR_DEF_RE check-tokens (единый файл токенов)"
    - "Нейтральный покой SC3: свойство --project-accent выставляется ТОЛЬКО при переданном theme (style={theme ? {...} : undefined}); в покое ink/line, accent — только hover/focus"
    - "Fallback-форма: color: var(--project-accent, var(--color-ink-muted)) — один CSS-паттерн обслуживает оба состояния (с theme / без theme) без классов-модификаторов"
    - "Адаптивность внутри компонентов: числа media-запросов 768 = --bp-md (сверяет check-tokens); split-состояния SectionHeading/ProjectCard — flex column в базе, row на ≥768px"
    - "Icon-контракт D-11 продолжен: viewBox 24, stroke 2, linecap square, геометрические paths из прямых отрезков; комментарии без px-слов шкалы («сетка 24 единиц viewBox») — защита от SPACING_PX_RE"
    - "Кавычки frontmatter: repo-конвенция — одинарные (Nav/Button/IconArrowRight); prettier --write не применяется (существующие файлы не prettier-чисты, CI его не проверяет)"

key-files:
  created:
    - src/components/SectionHeading.astro
    - src/components/Tag.astro
    - src/components/Media.astro
    - src/components/ProjectCard.astro
    - src/components/IconExternalLink.astro
    - src/components/IconArrowDown.astro
    - src/components/IconMail.astro
    - src/components/IconCopy.astro
    - src/components/IconGithub.astro
    - src/components/IconTelegram.astro
    - src/components/IconLinkedin.astro
    - src/components/IconCheck.astro
    - src/components/IconClose.astro
  modified: []

key-decisions:
  - "[02-04 T1] Кавычки frontmatter в новых .astro — одинарные (repo-конвенция Nav/Button/IconArrowRight); prettier --write на .astro не применяется: prettier --check падает на ВСЕХ существующих файлах репозитория, CI его не запускает (только eslint+check+build)"
  - "[02-04 T2] ProjectCard: добавлена обёртка .card__body (title+meta+footer) — CSS плана для split («текстовая часть — flex: 1») требует контейнера текстовой части; без обёртки flex-row split разложил бы 4 дочерних элемента в 4 колонки"
  - "[02-04 T2] ACCENTS в ProjectCard с кавыченными ключами ('terracotta': ...) — verify-строка плана проверяет буквально «'terracotta': 'var(--color-accent)'»; значения идентичны маппингу Tag (семантически тот же контракт, оформление ключей разное)"

patterns-established:
  - "Theme-проп → inline style '--project-accent' (ProjectCard и Tag): enum 5 значений (D-07), значения только в tokens.css, акцент появляется только во взаимодействии (D-08)"
  - "Медиа-оболочка R7: figure > .media__frame (aspect-ratio/overflow hidden/min-height 0/1px border) + слот + моно-figcaption — пустая рамка с ratio без изображения, контракт для <Image /> фазы 3"
  - "Заголовок раздела: моно-метка (--font-mono, --text-label, ink-muted) над Unbounded-заголовком (--font-display, --text-heading, 600, 1.2, overflow-wrap: break-word) — перенос без обрезания"
  - "Ноль <script>/<style> в иконках; отдельные self-closing файлы, без switch-контейнеров и спрайтов (D-10)"

requirements-completed: [REQ-design-implications, R3, R5, R7, R8]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "SectionHeading (meta/title/layout, split ≥768px row space-between, overflow-wrap), Tag (label/theme/size, ACCENTS → '--project-accent' при theme, neutral rest, hover border→ink), Media (ratio/caption, RATIOS, frame aspect-ratio/overflow hidden/min-height 0/1px line border, mono caption, рендер пустой рамки без изображения) — все на токенах 02-03, переходы только motion/ease-токены"
    requirement: R3
    verification:
      - kind: e2e
        ref: "npm run build (astro check + astro build) — exit 0"
        status: pass
      - kind: integration
        ref: "node -e контракт-проверка (interface Props, Media frame contract, Tag '--project-accent')"
        status: pass
      - kind: integration
        ref: "node scripts/check-tokens.mjs — ровно 4 known-red нарушений grep-контроля использования (SectionHeading/ProjectCard/Media/Tag), новых нарушений нет"
        status: pass
    human_judgment: false
  - id: D2
    description: "ProjectCard с theme-контрактом R5: props title/meta/theme/showMetrics/layout, ACCENTS 5 значений → inline style '--project-accent' на корне article (кавыченные ключи), слоты name='media' + дефолтный, .card__body для split (≥768px media|body flex 1), нейтральный покой (accent только в hover title), hover border→ink-muted; negative-фикстура check-theme подтверждает TS strict"
    requirement: R5
    verification:
      - kind: e2e
        ref: "node scripts/check-theme.mjs — theme='bad' падает на astro check (exit 1), фикстура удалена, повторный check exit 0"
        status: pass
      - kind: e2e
        ref: "npm run build — exit 0 (ProjectCard без пропов/с дефолтами, edge R3)"
        status: pass
      - kind: integration
        ref: "node -e контракт-проверка ('--project-accent', «'terracotta': 'var(--color-accent)'») + test -z zz-check в git status"
        status: pass
      - kind: integration
        ref: "spot-grep: ни одного hex-литерала и литеральных длительностей в ProjectCard.astro"
        status: pass
    human_judgment: false
  - id: D3
    description: "9 оставшихся Icon*.astro (ExternalLink, ArrowDown, Mail, Copy, Github, Telegram, Linkedin, Check, Close): self-closing файлы, svg viewBox 24, stroke 2, linecap square, currentColor, vector-effect non-scaling-stroke, aria-hidden, size default 24, геометрические paths из прямых отрезков, без <style>/<script> — полный набор 10 иконок (с IconArrowRight из 02-03)"
    requirement: R3
    verification:
      - kind: e2e
        ref: "npm run build — exit 0"
        status: pass
      - kind: integration
        ref: "node -e контракт-проверка по 9 файлам (viewBox/stroke/width/linecap/aria-hidden/size default, отсутствие style/script)"
        status: pass
      - kind: integration
        ref: "ls src/components — 10 Icon*.astro, switch-контейнеров и спрайтов нет"
        status: pass
    human_judgment: false

# Metrics
duration: 10min
completed: 2026-08-02
status: complete
---

# Phase 02, Plan 04: Компонентная библиотека визуальной системы (SectionHeading, Tag, Media, ProjectCard, 9 иконок) Summary

**Горизонтальный слой компонентов по паттерну 02-03 «Props + scoped style + var()»: SectionHeading (split ≥768px), Tag и ProjectCard с theme-контрактом R5 (enum 5 значений → inline style '--project-accent', нейтральный покой, fallback-форма var(--project-accent, ...)), Media-оболочка R7 (aspect-ratio/overflow hidden/min-height 0, пустая рамка без изображения), 9 Icon*.astro по контракту D-09/D-10/D-11 — 13 файлов на токенах 02-03; build exit 0, negative-фикстура check-theme зелёная (theme='bad' → TS strict exit 1), check-tokens без новых нарушений (известный red только по grep-контролю использования до 02-05)**

## Performance

- **Duration:** 10 min
- **Started:** 2026-08-02T23:28:00Z
- **Completed:** 2026-08-02T23:38:00Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments
- SectionHeading.astro: `meta?` (моно-надзаголовок D-05: --font-mono, --text-label, ink-muted), `title` (--font-display, --text-heading, 600, line-height 1.2, `overflow-wrap: break-word`), `layout?: 'stacked'|'split'`; split — flex column в базе (meta над title), на ≥768px (число = --bp-md, сверяет check-tokens) — row + space-between + baseline + gap `--space-lg`
- Tag.astro: `label`, `theme?:` 5-enum (D-07), `size?: 'sm'|'md'`; ACCENTS-маппинг → inline style `{ '--project-accent': ACCENTS[theme] }` только при theme (нейтральный покой D-08: без theme ноль акцента); fallback-форма `color: var(--project-accent, var(--color-ink-muted))`, `border: 1px solid var(--project-accent, var(--color-line))`; hover border→ink; размеры sm/md через `--space-xs/sm/md`; переходы только motion/ease-токены
- Media.astro (R7): `ratio?:` 4 значения (дефолт '4:3'), `caption?`; RATIOS-маппинг '16 / 9'-стиля; `.media__frame` — `aspect-ratio: var(--ratio)`, `overflow: hidden`, `min-height: 0` (Pitfall 3: контент не раздувает ratio), `width: 100%`, рамка 1px `var(--color-line)`; без изображения рендерится пустая рамка с ratio (edge R7 — контракт для `<Image />` фазы 3); hover рамки border→ink-muted; моно-figcaption (--text-caption, ink-muted, margin-top `--space-xs`)
- ProjectCard.astro (R5): props `title/meta?/theme?/showMetrics?/layout?`; ACCENTS 5 значений (терракота = `var(--color-accent)`, системный акцент входит в enum D-07) → inline style `'--project-accent'` на корне article (кавыченные ключи — не ловятся VAR_DEF_RE); custom property наследуется в слоты (Media/Tag внутри карточки получают accent, Pitfall 6 обходится runtime-каскадом); нейтральный покой SC3: в покое ink/line, accent только в hover (`.card:hover .card__title`); hover border→ink-muted; слоты `name="media"` (для Media.astro) и дефолтный (для Tag); split ≥768px — media | текстовая часть (обе flex: 1)
- 9 Icon*.astro: ExternalLink (рамка + стрелка из верхнего правого угла), ArrowDown (зеркало IconArrowRight), Mail (конверт + клапан из нижних углов к верхнему центру), Copy (два прямоугольника со сдвигом), Github (рамка + «канавка»), Telegram (контур + наклонная «ракета»), Linkedin (рамка + 3 «строки» + точка), Check, Close — все по контракту D-11: viewBox 24, stroke 2, linecap square, currentColor, non-scaling-stroke, aria-hidden, size default 24, геометрические paths из прямых отрезков; без `<style>`/`<script>`; итого набор 10 иконок (с IconArrowRight 02-03)
- **R5 подтверждён реальным прогоном:** `node scripts/check-theme.mjs` — фикстура `<ProjectCard theme="bad" />` падает на astro check (exit 1, TS strict), фикстура удалена, повторный `npm run check` exit 0, zz-check-* в дереве нет
- Верификация: `npm run build` exit 0 после каждого Task (astro check типизирует компоненты, включая нерендерящиеся); eslint чист; spot-grep по 13 файлам — ноль hex-литералов, переходы только через `var(--motion-*)/var(--ease-*)`; check-tokens — единственные нарушения это 4 known-red grep-контроля использования (SectionHeading/ProjectCard/Media/Tag не импортированы на страницы) — плановое состояние до 02-05 (см. key_links плана), новых нарушений нет
- **known-red до 02-05:** полный check-tokens по src возвращает ровно 4 нарушения grep-контроля использования (те же, что после 02-03) — закрываются в 02-05 (SYSTEM DEMO на work.astro; ProjectCard с фикстурными пропами AC#7)

## Task Commits

Each task was committed atomically:

1. **Task 1: SectionHeading.astro + Tag.astro + Media.astro** - `7631fb1` (feat)
2. **Task 1 (style): выравнивание кавычек с repo-конвенцией** - `9a17619` (style)
3. **Task 2: ProjectCard.astro (theme-контракт R5) + реальный прогон negative-фикстуры check-theme** - `c944616` (feat)
4. **Task 3: 9 оставшихся Icon*.astro (D-09/D-10/D-11)** - `47422a0` (feat)

**Plan metadata:** `pending` (docs commit после state-обновлений)

## Files Created/Modified
- `src/components/SectionHeading.astro` - Новый: props meta?/title/layout? ('stacked'|'split'); моно-метка + Unbounded-заголовок; split ≥768px row space-between (число = --bp-md)
- `src/components/Tag.astro` - Новый: props label/theme?/size?; ACCENTS 5-enum → inline style '--project-accent' при theme; fallback-форма color/border; hover border→ink; sm/md через --space-*
- `src/components/Media.astro` - Новый: props ratio?/caption?; RATIOS-маппинг; .media__frame (aspect-ratio var(--ratio), overflow hidden, min-height 0, 1px var(--color-line)); моно-caption; пустая рамка без изображения (edge R7)
- `src/components/ProjectCard.astro` - Новый: props title/meta?/theme?/showMetrics?/layout?; ACCENTS 5 значений → '--project-accent' на корне article; слоты name='media' + дефолтный; .card__body (текстовая часть split); hover border→ink-muted + title→accent; нейтральный покой SC3
- `src/components/IconExternalLink.astro` - Новый: рамка + стрелка из угла (вертикальный + горизонтальный отрезки)
- `src/components/IconArrowDown.astro` - Новый: вертикаль + стрелка с квадратным углом (зеркало IconArrowRight)
- `src/components/IconMail.astro` - Новый: конверт-рамка + V-клапан из нижних углов к верхнему центру
- `src/components/IconCopy.astro` - Новый: два прямоугольника (оригинал + копия со сдвигом)
- `src/components/IconGithub.astro` - Новый: рамка + внутренняя «канавка» (без заливки)
- `src/components/IconTelegram.astro` - Новый: контур + наклонная ломаная «ракета»
- `src/components/IconLinkedin.astro` - Новый: рамка + 3 горизонтальных «строки» + квадрат-точка
- `src/components/IconCheck.astro` - Новый: галочка из двух прямых с квадратным углом
- `src/components/IconClose.astro` - Новый: два диагональных отрезка (крест)

## Decisions Made
- Кавычки frontmatter в новых .astro — одинарные, по repo-конвенции существующих компонентов (Nav/Button/IconArrowRight) и буквальным ожиданиям verify-строк плана; `prettier --write` на .astro не применяется (prettier --check падает на всех существующих файлах репозитория, CI запускает только eslint + check + build)
- ProjectCard: обёртка `.card__body` вокруг title/meta/footer — CSS плана для split требует «текстовую часть — flex: 1», контейнер обязателен (без него flex-row split разложил бы 4 прямых дочерних элемента в 4 колонки)
- ACCENTS в ProjectCard — кавыченные ключи (`'terracotta': ...`): verify-строка плана Task 2 проверяет буквально `'terracotta': 'var(--color-accent)'`; значения идентичны маппингу Tag (семантический контракт один, разница только в оформлении ключей)
- Media-рамка hover (border→ink-muted) применён через `.media__frame:hover` — «когда интерактивна» реализуется в фазе 3 при появлении контента в слоте; на пустой рамке hover безвреден
- IconGeometry: координаты — на усмотрение исполнителя в рамках контракта D-11 (прямые отрезки, квадратные углы, вписанность в 24×24) — все 9 иконок используют stroke-геометрию без заливок

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] prettier --write переформатировал кавычки новых компонентов в двойные — противоречит repo-конвенции и verify-строкам плана**
- **Found during:** Task 1 (после создания SectionHeading/Tag/Media)
- **Issue:** `npx prettier --write` (проверка форматирования) переписал одинарные кавычки frontmatter в двойные (`layout?: "stacked"`), тогда как все существующие компоненты репозитория (Nav/Button/IconArrowRight/BaseLayout) используют одинарные кавычки, а verify-проверки плана Task 2 ищут буквально `'terracotta': 'var(--color-accent)'`; при этом prettier --check падает на ВСЕХ существующих .astro репозитория (включая Nav.astro и IconArrowRight.astro) и в CI не запускается — конвенция репозитория, а не prettier-дефолт
- **Fix:** кавычки возвращены к одинарным во всех трёх файлах (и во всех последующих новых файлах использованы одинарные); prettier --write на .astro-файлы больше не применялся
- **Files modified:** src/components/SectionHeading.astro, src/components/Tag.astro, src/components/Media.astro
- **Verification:** `npm run build` exit 0, контракт-проверки Task 1 зелёные, eslint чист
- **Committed in:** 9a17619 (style-коммит, часть Task 1)

**Total deviations:** 1 auto-fixed (1 bug — конфликт форматтера с конвенцией репозитория и verify-контрактом плана)
**Impact on plan:** Фикс необходим для прохождения verify-строк плана (Task 2 проверяет одинарные кавычки буквально) и согласованности с существующим кодом. Расширения объёма нет.

## Known Stubs

Плановые состояния (не дефекты — зафиксированы в key_links плана 02-04, резолвятся следующими планами):
- `src/components/{SectionHeading,ProjectCard,Media,Tag}.astro` — не импортированы в src/pages|src/layouts: grep-контроль использования check-tokens остаётся known-red (4 нарушения) до 02-05 (SYSTEM DEMO на work.astro и композиции страниц)
- `src/components/Media.astro` — слот пуст: рендерится рамка с ratio без изображения (edge R7, контракт для `<Image />` фазы 3); hover-состояние «когда интерактивна» активируется в фазе 3
- `src/components/ProjectCard.astro` — рендерится только с фикстурными пропами (AC#7, 02-05); реальные кейсы — фаза 3
- `src/components/Icon{...}.astro` (9 новых) — не используются на страницах: библиотечный контракт D-09/D-10/D-11; IconExternalLink участвует в SYSTEM DEMO 02-05

По прецеденту 02-03 записи в WINDOWS.md не добавлялись: состояния плановые, внутрифазовые (резолвятся планом 02-05 той же фазы), документально зафиксированы в плане и этом SUMMARY.

## Issues Encountered
- Конфликт форматера и конвенции репозитория (см. Deviation 1): prettier --check исторически красный на всех существующих .astro-файлах — перед запуском prettier --write на новых файлах стоит сверять конвенцию кавычек с ближайшими существующими компонентами
- Известный red: check-tokens возвращает 4 нарушения grep-контроля использования (SectionHeading/ProjectCard/Media/Tag) — плановое состояние до 02-05 (key_links плана), не дефект

## User Setup Required
None - внешние сервисы не задействованы.

## Next Phase Readiness
- Для 02-05: страничные композиции (SYSTEM DEMO на work.astro) с Media/Tag/ProjectCard + IconExternalLink закроют grep-контроль использования — полный check-tokens станет зелёным; ProjectCard с фикстурными пропами (AC#7), SectionHeading на страницах (layout split для заголовков разделов)
- Для 02-06: визуальный проход (375/768/1200, reduced-motion) на собранной системе — компоненты с адаптивностью внутри (split-состояния проверяются на 768px)
- Для фазы 3: Media-слот принимает `<Image />` без изменения контракта; ProjectCard/Tag с реальными данными коллекций; иконки на страницах (контакты — Mail/Telegram/Linkedin/Github, копирование — Copy/Check, закрытие — Close)
- Известные ограничения: компоненты пока не используются на страницах (known-red, закрывается 02-05); реальные данные карточек — фаза 3

## Self-Check: PASSED

- Файлы: все 13 созданных .astro существуют в src/components (проверено ls)
- Коммиты: 7631fb1, 9a17619, c944616, 47422a0 — все в git log
- Верификация: build exit 0 после каждого Task (3 прогона), check-theme exit 0 (negative-фикстура), eslint чист, check-tokens — ровно 4 known-red, spot-grep без hex/литеральных переходов

---
*Phase: 02-vizualnaya-sistema*
*Completed: 2026-08-02*
