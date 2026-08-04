# Phase 3: Контент и страницы — Pattern Map

**Mapped:** 2026-08-03
**Files analyzed:** 18 (8 новых / 7 модифицируемых / 3 контент-группы)
**Analogs found:** 15 / 18 (3 без прямого аналога — первый динамический маршрут, первая asset-папка, первые MDX-записи)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/content/projects/{slug}.mdx` (5–6) | model (контент) | CRUD (контент) | zod-схема `projects` + формат `services.json` | partial |
| `src/data/contacts.json` (NEW) | model (данные) | CRUD (статика) | `src/data/services.json` | exact |
| `src/content.config.ts` (MOD) | config | batch (валидация) | сам файл (расширение схем) | exact |
| `src/pages/index.astro` (MOD) | page (controller) | request-response | сам файл (hero-shell) + `work.astro` (карточки) | role-match |
| `src/pages/work.astro` (MOD) | page (controller) | request-response (список) | сам файл (SYSTEM DEMO-блок) | exact (структура), новый источник данных |
| `src/pages/work/[slug]/index.astro` (NEW) | page (controller, dynamic) | request-response (SSG) | `work.astro` + RESEARCH Pattern 2 | partial — динамических маршрутов в кодовой базе нет |
| `src/pages/about.astro` (MOD) | page (controller) | request-response | сам файл (empty-state) | role-match |
| `src/pages/lab.astro` (MOD) | page (controller) | request-response | сам файл (empty-state) | role-match |
| `src/pages/contact.astro` (MOD) | page + client script | request-response + event-driven | сам файл + `IconCopy.astro` | role-match — первый клиентский JS |
| `src/components/ProjectCard.astro` (MOD) | component | request-response (render) | сам файл (props theme/meta) | exact |
| `src/components/Footer.astro` (MOD) | component | request-response (render) | сам файл + `Nav.astro` (массив маршрутов → map) | exact |
| `src/assets/projects/{slug}/` (NEW) | asset store | file-I/O (build pipeline) | — | no analog (папки нет; подключается через `image()` в схеме) |
| `scripts/check-tone.mjs` (NEW) | check script | batch (статический анализ) | `scripts/check-prohibitions.mjs` | exact |
| `scripts/check-seo.mjs` (MOD) | check script | batch | сам файл (константы + self-test) | exact |
| `scripts/check-collections.mjs` (MOD) | check script | batch | сам файл (projectFixture + негативные тесты) | exact |
| `scripts/check-tokens.mjs` (MOD) | check script | batch | сам файл (правила 7/9 + фикстуры) | exact |
| `scripts/check-theme.mjs` (MOD) | check script | batch | сам файл (negative-фикстура theme) | exact |
| `package.json` (MOD) | config | — | сам файл (verify-цепочка) | exact |

## Pattern Assignments

### `src/data/contacts.json` (model, CRUD)

**Analog:** `src/data/services.json` — точный формат: массив объектов с уникальным `id` (требование strict-json-loader).

**Формат данных** (`src/data/services.json` lines 1-17):
```json
[
  {
    "id": "web-dev",
    "title": "Разработка веб-сайтов",
    "description": "Лендинги, корпоративные сайты и многостраничники на современном стеке."
  }
]
```
contacts.json расширяет форму до `{ id, label, value, href }` (RESEARCH Pattern 3): `id` уникален (email/telegram/github), `value` — отображаемое значение, `href` — ссылка (`mailto:`, `https://t.me/`, `https://github.com/`). Значения — от пользователя (D-12); плейсхолдеры до checkpoint:human-verify (Pitfall 11).

### `src/content.config.ts` (config, batch)

**Analog:** сам файл — расширение существующих коллекций.

**Схема projects сегодня** (lines 124-146):
```typescript
const projects = defineCollection({
  loader: glob({
    base: './src/content/projects',
    pattern: '**/*.{md,mdx}',
    generateId: strictProjectId(),
  }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    role: z.string(),
    stack: z.array(z.string()),
    year: z.number().int(),
    status: z.enum(['active', 'archived']),
    'client-type': z.string(),
    order: z.number().int().default(0),
    titleEn: z.string().optional(),
  }),
});
```
**Добавляются (D-05/D-08/R8):** `theme: z.enum(['terracotta','clay','olive','slate','plum'])`, `featured: z.boolean().default(false)`, `cover: image()`, `coverAlt: z.string()` — схема-хелпер `image()` из сигнатуры `schema: ({ image }) => ...` (RESEARCH Pattern 1).

**Коллекция contacts** — паттерн services (lines 158-162):
```typescript
const services = defineCollection({
  loader: strictJsonLoader('./src/data/services.json'),
  schema: z.object({ id: z.string(), title: z.string(), description: z.string() }),
});
```
Копируется как `contacts` с `strictJsonLoader('./src/data/contacts.json')` и схемой `{ id, label, value, href }`; регистрируется в `export const collections` (line 174).

### `src/pages/index.astro` (page, request-response)

**Analog:** сам файл — hero-shell (D-13), куда ложится формула.

**Текущая структура** (lines 6-21):
```astro
import BaseLayout from '../layouts/BaseLayout.astro';
import Button from '../components/Button.astro';
import IconArrowRight from '../components/IconArrowRight.astro';
---
<BaseLayout
  title="Иван Шиваршинов — веб-разработчик с продуктовым подходом"
  description="Создаю и развиваю сложные сайты, контентные системы и веб-инструменты."
  pageLabel="01 / HOME"
>
  <section class="hero">
    <h1 class="hero__name">Иван Шиваршинов</h1>
    <Button href="/work" density="lg">
      Смотреть работы
      <IconArrowRight />
    </Button>
  </section>
</BaseLayout>
```
Добавляются: формула обещания (дословно D-13, между именем и CTA — CTA остаётся последним элементом hero, 02 D-13) и секция «Избранные работы» (featured-фильтр, ровно 3 карточки, D-09). Секция — по паттерну секции Work ниже (SectionHeading + ProjectCard в Media/Image-слотах).

### `src/pages/work.astro` (page, request-response)

**Analog:** сам файл — блок SYSTEM DEMO заменяется на коллекцию.

**Каркас страницы** (lines 8-46) — сохраняется целиком: `BaseLayout` с `pageLabel="02 / WORK"` (обязательно — Pitfall 8: метка Footer = последний сегмент pageLabel, BaseLayout lines 19-21), `SectionHeading`, grid-список карточек:
```astro
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionHeading from '../components/SectionHeading.astro';
import ProjectCard from '../components/ProjectCard.astro';
import Media from '../components/Media.astro';
import Tag from '../components/Tag.astro';
---
<BaseLayout
  title="Работы — Иван Шиваршинов"
  description="Кейсы веб-разработки: от простых сайтов до контентных систем и веб-инструментов."
  pageLabel="02 / WORK"
>
  <section class="system-demo">
    <SectionHeading meta="SYSTEM DEMO" title="Системная демонстрация" layout="split" />
    <!-- Фикстурные карточки — рабочая версия фазы 2 (AC#7); // fixture: replaced in phase 3 -->
    <div class="system-demo__list">
      <ProjectCard ... >
        <Media slot="media" ratio="4:3" caption="Превью проекта — фаза 3" />
        <Tag label="Web" theme="terracotta" />
      </ProjectCard>
```
**Замена:** фикстурные `<ProjectCard>` (строки 22-44) → `getCollection('projects')` + sort по order (Pitfall 10) + карточки из RESEARCH Code Example 3:
```astro
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
Маркер `// fixture: replaced in phase 3` и секция `.system-demo` удаляются; стили grid — сохранить (минимальная правка имён классов).

### `src/pages/work/[slug]/index.astro` (page, dynamic route, SSG)

**Analog:** нет прямого — динамических маршрутов в кодовой базе нет (единственная вложенная папка в src/pages отсутствует). Структура страницы — от `work.astro`; рендер тела — RESEARCH Pattern 2 (getStaticPaths + `render()` из `astro:content`). ВАЖНО: `pageLabel="02 / WORK"` (не «…/SLUG») — Pitfall 8.

**Каркас (из RESEARCH Pattern 2, линии 246-282):**
```astro
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
```
- SEO-пара из frontmatter: `<BaseLayout title={`${title} — кейс · Иван Шиваршинов`} description={summary} pageLabel="02 / WORK">` — шаблон уникальной пары из Seo.astro-контракта (см. Shared Patterns).
- Скриншот: `<Media ratio="16:9" caption={coverAlt}><Image class="case-img" src={cover} alt={coverAlt} /></Media>` — `cover` — image()-объект из frontmatter, НЕ URL-путь (Pitfall 5).
- Тело: `<Content components={{ h2: (props) => <SectionHeading meta={SECTION_META[props.children] ?? 'SECTION'} title={props.children} /> }} />` — единственный рендер тела, h2 → SectionHeading (Anti-Pattern: не дублировать h2 и не разбивать тело).
- Нижняя навигация: «Все работы» (Link) + «Следующий кейс» (next по order с замыканием).

### `src/pages/about.astro` / `lab.astro` (page, request-response)

**Analog:** сами файлы — замена empty-state на контентные блоки.

**Текущий empty-state** (`about.astro` lines 5-17, `lab.astro` lines 5-17 — идентичны):
```astro
import BaseLayout from '../layouts/BaseLayout.astro';
import Link from '../components/Link.astro';
---
<BaseLayout
  title="Обо мне — Иван Шиваршинов"
  description="Веб-разработчик с продуктовым подходом."
  pageLabel="04 / ABOUT"
>
  <div class="empty-state">
    <p class="empty-state__caption">ABOUT — раздел в разработке</p>
    <Link href="/">На главную</Link>
  </div>
</BaseLayout>
```
Замена: About — 4 блока (PROFILE/AUDIENCES/CAPABILITIES/TRAJECTORY), Lab — 2 блока (DIRECTIONS/PROCESS) + честный статус. Каждый блок — `SectionHeading` с моно-метой (латинская мета = позитивный ассерт check-tone: `TRAJECTORY`, `PROCESS` и т.д. — RESEARCH Code Example 4). Контент: обычная проза + `Link`/`Tag`; терракота не используется (D-06). Title/description — уникальная пара R4 (обновить description под реальный контент).

### `src/pages/contact.astro` (page + client script, request-response + event-driven)

**Analog:** сам файл (empty-state) + `IconCopy.astro`/`IconCheck.astro` (готовы, CONTEXT Reusable Assets).

**Ключевой паттерн — прогрессивное улучшение (RESEARCH Pattern 4):**
- 3 канала — `getCollection('contacts')`, map в списки; порядок — Claude's Discretion.
- mailto-ссылка рендерится всегда (работает без JS); кнопка копирования — поверх:
```html
<button type="button" class="copy-btn" data-copy={email} aria-describedby="copy-status">
  <span id="copy-status" class="copy-status" aria-live="polite">Копировать</span>
  <IconCopy />
</button>
```
- **`data-copy={email}` БЕЗ кавычек** — правило 10 check-tokens (Pitfall 3, memory: Astro 7 не интерполирует `{expr}` внутри `"..."`).
- Один inline-скрипт на /contact: `navigator.clipboard.writeText` (secure context) → fallback `execCommand('copy')` через временный textarea (position:fixed, opacity:0, readOnly) — RESEARCH Pattern 4 lines 308-338. Состояния idle → copied (≈2 s) → error, статус через `aria-live="polite"`.
- Внешние ссылки (TG/GitHub): `target="_blank" rel="noopener"` — паттерн Link.astro (caller передаёт атрибуты, компонент не зашивает).

### `src/components/ProjectCard.astro` (component, render)

**Analog:** сам файл — расширение props.

**Текущий контракт** (lines 8-26):
```astro
interface Props {
  title: string;
  meta?: string;
  theme?: 'terracotta' | 'clay' | 'olive' | 'slate' | 'plum';
  showMetrics?: boolean;
  layout?: 'stacked' | 'split';
}

const { title, meta, theme, showMetrics = false, layout = 'stacked' } = Astro.props;
const isSplit = layout === 'split';

const ACCENTS: Record<'terracotta' | 'clay' | 'olive' | 'slate' | 'plum', string> = {
  'terracotta': 'var(--color-accent)',
  'clay': 'var(--project-clay)',
  'olive': 'var(--project-olive)',
  'slate': 'var(--project-slate)',
  'plum': 'var(--project-plum)',
};
```
**Добавляются (RESEARCH Open Questions 4):** `summary?: string` (рендер body-ролью под title, AC R2) и `href?: string` (title оборачивается в Link-контракт: accent в hover — уже есть в `.card:hover .card__title`, lines 72-74). Рендер через `<article>` (lines 28-42) сохраняется; ссылка — деталь плана (весь article в `<a>` vs ссылка-заголовок). Не менять: ACCENTS-маппинг (терракота → `var(--color-accent)`, D-06 — кейсам её не давать), scoped styles с var()-токенами, 1px граница (вне шкалы, разрешено).

### `src/components/Footer.astro` (component, render)

**Analog:** сам файл + `Nav.astro` (список ссылок из массива).

**Текущий футер** (lines 1-17):
```astro
interface Props {
  sectionLabel: string;
}

const { sectionLabel } = Astro.props;
---
<footer class="footer">
  <div class="footer__row">
    <span>© 2026 · Иван Шиваршинов</span>
    <span class="footer__section">{sectionLabel}</span>
  </div>
</footer>
```
**Расширение (D-11):** `getCollection('contacts')` в frontmatter + row ссылок (email/TG/GitHub) из коллекции — массив→map-паттерн Nav.astro (lines 11-17, 24-36: `ROUTES.map((r) => (<a class="nav__link" href={r.href}>…</a>))`). Один источник с /contact — AC R7 обеспечивается источником, не проверкой. Ссылки — внешние с `target="_blank" rel="noopener"` (TG/GitHub). Метка `sectionLabel` не меняется.

### `src/content/projects/{slug}.mdx` (model, контент — 5–6 файлов)

**Analog:** нет готового MDX в кодовой базе (0 записей, только .gitkeep). Формат — RESEARCH Code Example 1 + схема projects в `content.config.ts` (lines 124-146).

**Шаблон записи** (кавычки frontmatter — одинарные, репо-конвенция):
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

...
## Ответственность

**Моя зона.** ...
**Команда.** ...
**Эффект.** ...
## Решение

...
## Результат

До: ... После: ...
```
Тело — ровно 4 h2 («Проблема», «Ответственность», «Решение», «Результат»), каждое ровно один раз (проверка check-collections, RESEARCH Code Example 2). `cover` — относительный путь от файла записи (image() валидирует существование на сборке — R8 build-level гарантия, Pitfall 6).

### `src/assets/projects/{slug}/` (asset store, file-I/O)

**Analog:** нет — папка `src/assets/` не существует (проверено). Создаётся структура `src/assets/projects/{slug}/cover.png` (+ опциональные скриншоты). Подключается ТОЛЬКО через `cover: image()` в frontmatter или ESM-импорт — не через URL-пути (Pitfall 5). Рекомендация пользователю: PNG/JPG 1280–1920px ширины, ~1–2 МБ (Pitfall 12).

### `scripts/check-tone.mjs` (NEW, check script, batch)

**Analog:** `scripts/check-prohibitions.mjs` — denylist + self-test с фикстурой-нарушителем (exact match). Дополнительно: обход dist/ — паттерн `walk()` из `check-seo.mjs` (lines 37-51).

**Каркас (check-prohibitions.mjs):**
- Константа денлиста (lines 15-38): `DENYLIST_EXACT`/`DENYLIST_PREFIXES` → у check-tone — один массив stem-подстрок (≥10 записей, RESEARCH Code Example 4; состав финализирует план/пользователь — A4).
- `audit*` функция → `render()` с `OK`/`FAIL` + exit code (lines 79-88).
- Self-test (lines 95-139): известная-хорошая (чистый текст) → PASS; известная-плохая (фикстура-нарушитель, напр. «революционные решения») → FAIL; пограничные случаи (легальные слова) не срабатывают.
- CLI: `--self-test` vs реальный прогон (lines 141-147).

**Отличия от check-prohibitions (RESEARCH, Code Example 4):**
- Матчинг по `html.toLowerCase().includes(entry)` — stem-подстроки русского текста.
- Две группы: DENYLIST (запреты по dist) + REQUIRED_CONTENT (позитивные ассерты: формула на `/`, меты `TRAJECTORY`/`PROCESS` на about/lab, 3 канала на contact, отсутствие «SYSTEM DEMO» в dist/work).
- **Скоуп ярлыков — только `/` (index.html)**: «Product Engineer» легален в TRAJECTORY на /about (Pitfall 7, A5).
- Регистрация в `package.json` verify-цепочке (line 18: `"verify": "npm run build && npm run check-seo && npm run check-tokens && npm run check-contrast && npm run check-collections && node scripts/check-prohibitions.mjs && npm run check-visual"` — добавить `&& npm run check-tone`).

### `scripts/check-seo.mjs` (MOD, check script, batch)

**Analog:** сам файл. **Четыре места правки в одном коммите (Pitfall 4):**
1. Константы (lines 27-28): `const EXPECTED_PAGES = 5;` / `const EXPECTED_SITEMAP_URLS = 5;` → 10–11 (5 + фактическое число кейсов).
2. Self-test `goodPages` (lines 254-258): 5 записей `['Главная','Работы','Лаборатория','Обо мне','Контакты']` → +5–6 кейсовых страниц (пути `/work/{slug}/`).
3. Sitemap-фикстуры `GOOD_SITEMAP_CHILD` (lines 233-241): 5 url → 10–11.
4. OK-строка `render()` (line 201): «5 уникальных пар» → фактическое число.

### `scripts/check-collections.mjs` (MOD, check script, batch)

**Analog:** сам файл. **Две правки (Pitfall 9 + новые границы):**
1. `projectFixture()` (lines 47-61) — дополнить новыми полями схемы, иначе «дубликат slug» упадёт по zod-ошибке, а не DuplicateContentEntrySlugError:
```javascript
function projectFixture(slug) {
  return `---
slug: ${slug}
title: ZZ Check Fixture
summary: временная фикстура негативного теста
role: fixture
stack: ["fixture"]
year: 2026
status: "active"
client-type: "fixture"
order: 999
theme: clay
featured: false
cover: <временный файл или схемо-совместимое значение>
coverAlt: fixture
---
Временная фикстура ${slug} — удаляется в finally.
`;
}
```
(cover — image()-поле: нужен реальный временный файл или решение плана по Open Questions 2.)
2. Новые границы (RESEARCH Code Example 2): projects 5–6 (FAIL при 4/7), featured ровно 2–3 (D-09), theme ∈ enum (D-05), cover присутствует, 4 h2 в теле (ровно по одному разу), дублей файлов скриншотов нет. Существующие негативные тесты (duplicateSlugTest lines 130-151, missingFieldTest, duplicateIdTest) — сохраняются.

### `scripts/check-tokens.mjs` (MOD, check script, batch)

**Analog:** сам файл. **Две правки (Pitfalls 1-2):**
1. Правило 7 W1 (lines 286-300): сейчас `if (current.length !== 1)` для каждой страницы → FAIL. Новое: на «глубоких» страницах (`work/*/index.html`) допускается 0; на верхнеуровневых — ровно 1. Self-test фикстуры W1 (lines 408-428): добавить кейс-страницу с 0 aria-current → PASS.
2. Правило 9 (lines 283-285): сейчас `/<script/gi.test(html)` — любой script → FAIL. Новое: ровно 1 `<script>` суммарно, только на /contact (contact/index.html); 0 на остальных. Self-test фикстура `SCRIPT_INDEX_BAD` (lines 424-428) — расширить: script на чужой странице → FAIL; один script на contact → PASS.
3. Правило 10 (голый {expr} в кавычках) — БЕЗ изменений: ловит `data-copy="{email}"` автоматически (Pitfall 3).

### `scripts/check-theme.mjs` (MOD, check script, batch)

**Analog:** сам файл — фикстура `<ProjectCard theme="bad" />` (lines 34-38) остаётся рабочей (theme-union в ProjectCard не меняется). Обновление «под новые темы» (CONTEXT Discretion) — на усмотрение плана: если theme-проп/схема расширяются (например, валидация enum в проектах), фикстура дополнительно проверяет невалидную тему в frontmatter-схеме.

### `package.json` (config)

**Analog:** сам файл. verify-цепочка (line 18): добавить `npm run check-tone` (RESEARCH Wave 0 gaps: «добавить в verify-цепочку package.json»). Скрипт `"check-tone": "node scripts/check-tone.mjs"` — по образцу соседних (lines 12-17).

---

## Shared Patterns

### Композиция страниц (Stacki, 01 D-04)
**Source:** `src/pages/index.astro` lines 6-21, `work.astro` lines 8-17
**Apply to:** Все страницы фазы (index, work, [slug], about, lab, contact)
Layout + плоский список self-closing компонентов с props; `pageLabel` в формате «NN / NAME» (Footer берёт последний сегмент — BaseLayout lines 19-21); scoped `<style>` в каждой странице (tokens через var(), медиа-запросы ровно по --bp-md 768px).

### SEO-пары для страниц кейсов
**Source:** `src/components/Seo.astro` lines 4-23 + BaseLayout lines 13-29
**Apply to:** `src/pages/work/[slug]/index.astro`
`title`/`description` — props BaseLayout → Seo.astro; canonical/OG строятся автоматически из `Astro.site`; кейсы дают уникальную пару `title=${title} — кейс · Иван Шиваршинов`, `description=summary` (требование check-seo: 10–11 уникальных пар).

### Сортировка коллекции (детерминированная)
**Source:** RESEARCH Pitfall 10 (единая сортировка)
**Apply to:** work.astro, index.astro (featured), [slug] (next)
`.sort((a, b) => a.data.order - b.data.order)` в getStaticPaths/getCollection — один порядок для карточек, featured-фильтра и «Следующего кейса» (замыкание `projects[(idx + 1) % projects.length]`).

### Данные — в файлах, не в коде (D-02/D-11)
**Source:** `src/content.config.ts` lines 76-122 (strict-json-loader), 124-146 (glob+schema)
**Apply to:** contacts.json (контакты), MDX-кейсы (контент), frontmatter (метаданные)
JSON в src/data типизируются zod-схемой; дубликат id/slug — FAIL сборки; пустые коллекции проходят (notes остаётся пустой, D-07).

### Строгие проверки: контрактная граница = check-скрипт с self-test
**Source:** `scripts/check-prohibitions.mjs` lines 79-147; `scripts/check-seo.mjs` lines 199-315
**Apply to:** check-tone.mjs (новый), обновления check-seo/check-collections/check-tokens
Каждая граница (5–6 записей, featured 2–3, theme enum, отсутствие SYSTEM DEMO, 4 h2, 0/1 aria-current, 1 script) — свой check с self-test (фикстура-нарушитель обязана падать, чистая — проходить); exit 0/1; `--self-test` не требует сети и dist.

### Внешние ссылки
**Source:** `src/components/Link.astro` lines 6-16 (комментарий про caller)
**Apply to:** contact.astro, Footer.astro (TG/GitHub)
`target="_blank" rel="noopener"` передаёт caller — компоненты не зашивают.

### CSS-контракт (неизменный для всех новых стилей)
**Source:** `src/components/ProjectCard.astro` lines 44-102, tokens.css
**Apply to:** все новые/изменённые компоненты и страницы
Только var()-токены (check-tokens правило 3); 1px границы разрешены (вне шкалы); медиа-запросы min-width 768px = --bp-md; transition только через var(--motion-*)/var(--ease-*); никаких hex-литералов и px шкалы (4/8/16/24/32/48/64).

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/pages/work/[slug]/index.astro` | page (dynamic route) | request-response (SSG) | Динамических маршрутов в кодовой базе нет — использовать RESEARCH Pattern 2 (getStaticPaths + render + components-prop, подтверждён docs.astro.build) |
| `src/content/projects/{slug}.mdx` (5–6) | model (контент) | CRUD (контент) | Коллекция пуста (.gitkeep) — формат из RESEARCH Code Example 1 + zod-схема projects |
| `src/assets/projects/{slug}/` | asset store | file-I/O (build pipeline) | Папки src/assets не существует — создаётся по D-02; потребление через `cover: image()` (схема) |
| `src/pages/contact.astro` (клиентский JS) | page + client script | event-driven | Первый клиентский JS сайта — паттерн из RESEARCH Pattern 4 (Clipboard API + execCommand fallback, MDN) |

## Metadata

**Analog search scope:** `src/` (все pages, components, layouts, content.config.ts, data) + `scripts/` (9 check-скриптов) + package.json
**Files scanned:** 22 (18 в src/, 9 в scripts/, package.json; 5 из них — сами модифицируемые файлы)
**Pattern extraction date:** 2026-08-03
**Примечания:** страницы кейсов `/work/{slug}/` не совпадают ни с одним маршрутом Nav — aria-current на них не рендерится (Pitfall 1); `pageLabel` кейсов — строго «02 / WORK» (Pitfall 8).
