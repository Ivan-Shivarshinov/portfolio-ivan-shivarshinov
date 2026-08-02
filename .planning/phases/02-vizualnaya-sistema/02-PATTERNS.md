# Phase 2: Визуальная система - Pattern Map

**Mapped:** 2026-08-02
**Files analyzed:** 18 (10 новых компонентов/скриптов, 8 модифицируемых)
**Analogs found:** 16 / 18 (2 — частичные, паттерны из RESEARCH.md)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/styles/tokens.css` (ext.) | config (design tokens) | static (build-time) | сам себя, `tokens.css:1-40` | exact (self-extension) |
| `src/styles/global.css` (ext.) | config (global styles) | static (build-time) | сам себя, `global.css:84-107` | exact (self-extension) |
| `src/layouts/BaseLayout.astro` (mod.) | layout | static render | сам себя, `BaseLayout.astro:1-55` | exact (self-extension) |
| `src/components/Nav.astro` (new) | component (nav) | static render | `BaseLayout.astro:23,33-41,49-55` (inline nav + W1 + scoped active) | exact (перенос контента) |
| `src/components/Footer.astro` (new) | component (footer) | static render | `BaseLayout.astro:45` (пустой footer) + Nav-паттерн | partial |
| `src/components/Button.astro` (new) | component (control) | static render | `Seo.astro:4-12` (props) + `BaseLayout.astro:49-55` (scoped style) | role-match |
| `src/components/Link.astro` (new) | component (link) | static render | то же, что Button | role-match |
| `src/components/SectionHeading.astro` (new) | component (heading) | static render | то же, что Button | role-match |
| `src/components/Tag.astro` (new) | component (badge) | static render | то же + theme-паттерн (Pattern 2) | role-match |
| `src/components/ProjectCard.astro` (new) | component (card) | static render | `BaseLayout.astro:49-55` (scoped + var(), spike R5) + `Seo.astro:4-12` | role-match |
| `src/components/Media.astro` (new) | component (media wrapper) | static render | `BaseLayout.astro:42-44` (slot) — figure/ratio — новинка | partial (паттерн RESEARCH 3) |
| `src/components/Icon*.astro` (10+, new) | component (icon) | static render | `Seo.astro:4-23` (markup-only, без style) | exact (форма компонента) |
| `src/pages/index.astro` (mod.) | page | static render | сам себя, `index.astro:5-13` | exact (self-extension) |
| `src/pages/{work,lab,about,contact}.astro` (mod.) | page | static render | сами себя / `work.astro:4-11` (placeholder) | exact (self-extension) |
| `scripts/check-tokens.mjs` (ext.) | utility (validator) | file-I/O, batch | сам себя (структура) + `check-seo.mjs:37-51,173-197` (walk dist для W1) | exact (self-extension) |
| `scripts/check-contrast.mjs` (new) | utility (validator) | file-I/O, batch | `check-tokens.mjs:21-132` (структура: ROOT/audit/render) | exact (структура) |
| `package.json` (mod.) | config | — | сам себя, `package.json:16` (verify-цепочка) | exact (self-extension) |
| `docs/hero-concept.md` (new) | doc | — | прецедент: `docs/design_direction_*.md` | partial |

## Pattern Assignments

### `src/styles/tokens.css` (config, static — РАСШИРЕНИЕ)

**Analog:** сам себя (существующие 5 групп — контракт фазы 1)

**Структура группы** (строки 2-9, 12-19 — формат «комментарий-группа + `:root`»):
```css
/* ЕДИНСТВЕННЫЙ файл токенов (SPEC R2) — значения зафиксированы в UI-SPEC 01 */
:root {
  /* color */
  --color-bg: #FAFAF7;
  --color-surface: #F1F0EB;
  --color-ink: #1F1E1C;
  --color-ink-muted: #5C5A55;
  --color-accent: #A84B32;
  --color-accent-ink: #FFFFFF;
  --color-destructive: #B3261E;
  ...
```

**Motion-группа как образец для easing-дополнения** (строки 35-39):
```css
  /* motion */
  --motion-fast: 150ms;
  --motion-base: 250ms;
  --motion-slow: 400ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
```

**Что добавить (R1, без переименования ролей):** в color-группу — `--color-line: #DAD9D3` (1px рамки, вне шкалы отступов разрешён) и 4 `--project-*` (clay/olive/slate/plum, hex приглушённые, пары ≥4.5:1 — check-contrast); в typography — `--text-lead: 18px`, `--text-caption: 12px` (моно-слой), замена `--text-display: 32px` на `--text-display: clamp(28px, 5vw, 40px)`; в motion — `--ease-enter: cubic-bezier(0, 0, 0.2, 1)`, `--ease-exit: cubic-bezier(0.4, 0, 1, 1)`; НОВАЯ группа `/* bp */` с `--bp-md: 768px; --bp-lg: 1200px` (группа обязательна для расширенного check-tokens). Существующие имена ролей НЕ переименовывать (Pitfall 7).

---

### `src/styles/global.css` (config, static — РАСШИРЕНИЕ)

**Analog:** сам себя

**Точка вставки kill-switch reduced-motion** — рядом с `:focus-visible` (строки 104-107):
```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```
**Добавляется после него (R4, RESEARCH Pattern 4/6)**:
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

---

### `src/layouts/BaseLayout.astro` (layout — МОДИФИКАЦИЯ)

**Analog:** сам себя

**Frontmatter-каркас и импорты** (строки 1-13) — образец для всех новых компонентов:
```astro
---
import '../styles/tokens.css';
import '../styles/global.css';
import Seo from '../components/Seo.astro';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
```

**W1-нормализация pathname** (строка 23) — переносится в Nav.astro без изменений:
```astro
const pathname = Astro.url.pathname.replace(/\/+$/, '') || '/';
```

**Nav-разметка (строки 33-41) и scoped-стиль активного пункта (49-55)** — переезжают в Nav.astro целиком:
```astro
<a href="/" aria-current={pathname === '/' ? 'page' : undefined}>Home</a>
```
```css
nav a[aria-current='page'] {
  color: var(--color-accent);
}
```

**Точки замены:** строки 33-41 → `<Nav />`; строка 45 `<footer></footer>` → `<Footer />`; над `<slot />` (строки 42-44) — новый элемент моно-метки страницы «01 / HOME» (D-05; проп метки — из файла маршрута, напр. `pageLabel="01 / HOME"`).

---

### `src/components/Nav.astro` (component, static render — НОВЫЙ)

**Analog:** `BaseLayout.astro` строки 23, 33-41, 49-55 (exact — перенос существующего контента)

**Импорты + props + W1** (паттерн BaseLayout:1-13, 23):
```astro
---
interface Props { label?: string; }   // label «Work» — русские формулировки (D-06, Claude's Discretion)
const { label } = Astro.props;
const pathname = Astro.url.pathname.replace(/\/+$/, '') || '/';
const ROUTES = [
  { href: '/', label: 'Главная' },
  { href: '/work', label: 'Работы' },
  { href: '/lab', label: 'Лаборатория' },
  { href: '/about', label: 'Обо мне' },
  { href: '/contact', label: 'Контакты' },
];
---
```

**Ядро (из BaseLayout:33-41, D-01):** моно-индексы «01 / Work» — `--font-mono` + тонкие разделители; активный пункт — `var(--color-accent)` (индекс и лейбл), остальные — `var(--color-ink-muted)`, hover — `var(--color-ink)`; `aria-current={pathname === r.href ? 'page' : undefined}` — ровно один на страницу (W1).

**Scoped-адаптивность (D-01, Pattern 3):** на 320px скрыть индексы/разделители:
```css
/* Числа 768/1200 = значения --bp-md/--bp-lg (сверяет check-tokens, R8) */
@media (min-width: 768px) { ... }
```

---

### `src/components/Footer.astro` (component, static render — НОВЫЙ)

**Analog:** `BaseLayout.astro:45` (пустой `<footer>`) + Nav-паттерн (partial)

**Контент D-03:** одна моно-строка `© 2026 · Иван Шиваршинов` (`--font-mono`, `--text-caption`/`--text-label`, `--color-ink-muted`) + моно-метка раздела; тонкая верхняя граница `1px solid var(--color-line)` (1px — вне шкалы, разрешено). Проп `sectionLabel` — для метки (HOME/WORK/…). Ссылки/колонки — фаза 3, не добавлять.

---

### `src/components/Button.astro` (component, static render — НОВЫЙ)

**Analog:** `Seo.astro:4-12` (типизированные props) + `BaseLayout.astro:49-55` (scoped style) — role-match

**Props-паттерн (Seo.astro:4-12)** — типизированные enum-пропы, деструктуризация с дефолтами:
```astro
---
interface Props {
  variant?: 'primary' | 'secondary';   // R3 AC: enum, не «сырые строки»
  density?: 'md' | 'lg';
  href: string;
}
const { variant = 'primary', density = 'md', href } = Astro.props;
---
```

**Primary-hover через color-mix (RESEARCH Code Example 2)** — единственное hover-затемнение:
```css
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
Правила: длительности/кривые — только `var(--motion-*)` + `var(--ease-*)` (grep-контроль AC R4); ноль hex/px шкалы (check-tokens); ноль `<script>`.

---

### `src/components/Link.astro` (component, static render — НОВЫЙ)

**Analog:** Seo.astro props + BaseLayout scoped — как Button (role-match)

**Ядро:** `variant?: 'default' | 'muted'`; базовое состояние — `var(--color-ink)` (default) / `var(--color-ink-muted)` (muted); hover/focus — `var(--color-accent)` (accent для ссылок разрешён с фазы 2, UI-SPEC 01); `transition: color var(--motion-fast) var(--ease-standard)`. Внешние ссылки — `target="_blank" rel="noopener"` (с иконкой IconExternalLink). Нейтральный покой: accent только во взаимодействии.

---

### `src/components/SectionHeading.astro` (component, static render — НОВЫЙ)

**Analog:** как Button (role-match)

**Ядро (RESEARCH Pattern 3):** props `meta?: string; title: string; layout?: 'stacked' | 'split'`; моно-метка (`--font-mono`, `--text-caption`, `--color-ink-muted`) над заголовком (`--font-display`, `--text-heading`); split-вариант — колонки на ≥768px:
```css
.section-heading--split { flex-direction: column; }
@media (min-width: 768px) {
  .section-heading--split { flex-direction: row; justify-content: space-between; }
}
```
Адаптивность живёт в компоненте, не в страницах (ADR §5.4).

---

### `src/components/ProjectCard.astro` (component, static render — НОВЫЙ)

**Analog:** `BaseLayout.astro:49-55` (scoped style + CSS-переменная одновременно — spike R5) + `Seo.astro:4-12` — role-match

**Theme-контракт (R5, RESEARCH Pattern 2)** — inline style на корне, hex живут в tokens.css:
```astro
---
interface Props {
  title: string;
  meta?: string;
  theme?: 'terracotta' | 'clay' | 'olive' | 'slate' | 'plum';
  showMetrics?: boolean;
  layout?: 'stacked' | 'split';
}
const { title, meta, theme, ... } = Astro.props;
const ACCENTS = {
  terracotta: 'var(--color-accent)',  // системный акцент входит в enum (D-07)
  clay: 'var(--project-clay)',
  olive: 'var(--project-olive)',
  slate: 'var(--project-slate)',
  plum: 'var(--project-plum)',
};
---
<article class="card" style={theme ? { '--project-accent': ACCENTS[theme] } : undefined}>
  <slot />
</article>
```
```css
.card:hover .title { color: var(--project-accent, var(--color-ink)); } /* покой — нейтрален */
```
Почему inline style: scoped-селекторы `[data-astro-cid-*]` не пересекают компоненты (Pitfall 6), а custom property наследуется в слоты всегда. Нейтральный покой (SC3): в покое — ink/line, accent только в hover/focus. Enum-тип — единый источник для astro check (невалидный theme → сборка падает, AC R5).

---

### `src/components/Media.astro` (component, static render — НОВЫЙ)

**Analog:** `BaseLayout.astro:42-44` (slot) — частичный; каркас из RESEARCH Code Example 3

**Ядро (R7, RESEARCH 3)**:
```astro
---
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
```
```css
.media__frame {
  aspect-ratio: var(--ratio);
  overflow: hidden;
  min-height: 0;           /* контент не раздувает ratio (Pitfall 3) */
  border: 1px solid var(--color-line); /* 1px — вне шкалы, разрешено */
}
.media__caption {
  font-family: var(--font-mono);
  font-size: var(--text-caption);
  color: var(--color-ink-muted);
}
```

---

### `src/components/Tag.astro` (component, static render — НОВЫЙ)

**Analog:** как Button + theme-паттерн ProjectCard (role-match)

**Ядро:** props `label: string; theme?: ProjectTheme; size?: 'sm' | 'md'`; theme-маппинг — ровно как в ProjectCard (inline style `--project-accent` на корне); размеры — `var(--text-caption)`/`var(--text-label)`, отступы — `var(--space-xs)`/`var(--space-sm)` (только токены); рамка `1px solid var(--color-line)`; hover — accent-цвет рамки/текста через motion-токены.

---

### `src/components/Icon*.astro` (10+, component, static render — НОВЫЙ)

**Analog:** `Seo.astro:4-23` (markup-only компонент без `<style>` — exact по форме)

**Форма** (Seo.astro:1-13 — frontmatter, 15-23 — голый JSX без обёрток):
```astro
---
interface Props { size?: number; }
const { size = 24 } = Astro.props;
---
<svg width={size} height={size} viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2" stroke-linecap="square"
     aria-hidden="true">
  <!-- кастомный геометрический path: прямые линии/прямоугольники (D-11) -->
</svg>
```
Контракт (D-10/D-11): отдельные self-closing файлы (`IconArrowRight.astro`, `IconExternalLink.astro`, `IconArrowDown.astro`, `IconMail.astro`, `IconCopy.astro`, `IconGithub.astro`, `IconTelegram.astro`, `IconLinkedin.astro`, `IconCheck.astro`, `IconClose.astro` — список финализирует планировщик); без switch-контейнеров и спрайтов; сетка 24px, stroke 2, `currentColor`, `aria-hidden="true"`.

---

### `src/pages/*.astro` (5 страниц — МОДИФИКАЦИЯ)

**Analog:** сами себя — `index.astro:5-13`, `work.astro:4-11`

**Каркас композиции (index.astro:5-13)** — страница = BaseLayout + плоский список self-closing компонентов (D-04):
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout
  title="Иван Шиваршинов — веб-разработчик с продуктовым подходом"
  description="Создаю и развиваю сложные сайты, контентные системы и веб-инструменты."
>
  <h1>Иван Шиваршинов</h1>
  <p>Фаза 2 — визуальная система</p>
</BaseLayout>
```
**Изменения:** placeholder-`<p>` заменяется на empty-state (D-04: моно-подпись + тонкая рамка-контур `1px solid var(--color-line)`) + моно-метка страницы (D-05); главная — shell по концепту (D-13: метка «01 / HOME» + имя в `--font-display`/`--text-display` + `<Button href="/work">Смотреть работы</Button>`); title/description остаются уникальными парами (check-seo R4).

---

### `scripts/check-tokens.mjs` (utility, file-I/O — РАСШИРЕНИЕ)

**Analog:** сам себя (структура) + `check-seo.mjs:37-51,173-197` (walk по dist для W1)

**Константы и GROUPS — точка расширения** (строки 26-44):
```javascript
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS_PATH = 'src/styles/tokens.css';
const SCAN_DIRS = ['src/styles', 'src/components'];
const GROUPS = [
  { name: 'color (--color-*)', re: /--color-[a-z0-9-]+\s*:/i },
  ...
];
```
Добавить: группу `{ name: 'bp (--bp-*)', re: /--bp-[a-z0-9-]+\s*:/i }`; проверки наличия `--text-lead`/`--text-caption`/`--ease-enter`/`--ease-exit`.

**Сверка чисел media-query (R8)** — новая функция по образцу audit(): regex по `src/components`, каждое число равно `--bp-md` или `--bp-lg` (значения считываются из tokens.css):
```javascript
const MEDIA_PX_RE = /@media\s*\(min-width:\s*(\d+)px\)/g;
```

**W1-ассерт на dist** — паттерн walk+regex из check-seo.mjs:37-51 (walk по `dist/**/*.html`) и auditDist:173-197 (guard «dist не найден → предупреждение, не fail»); ровно один `aria-current="page"` на страницу, href соответствует маршруту файла (`/work` → `/work/`):
```javascript
const cur = [...html.matchAll(/aria-current="page"/g)];
if (cur.length !== 1) violations.push(`W1: ${rel}: ожидалось ровно 1 aria-current="page", найдено ${cur.length}`);
```
Порядок в npm verify: `build → check-tokens` (dist уже собран).

---

### `scripts/check-contrast.mjs` (utility, file-I/O — НОВЫЙ)

**Analog:** `check-tokens.mjs:21-132` (exact — вся структура) + `check-seo.mjs` walk

**Каркас копируется из check-tokens.mjs** (строки 21-24 импорты, 26-29 ROOT, 52-66 walk, 71-122 audit → render → runSelfTest с временными фикстурами → CLI-диспетчер 255-260):
```javascript
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
```

**Ядро — формула WCAG (RESEARCH Code Example 5)**:
```javascript
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
Пары — из UI-SPEC Color (ink×bg, ink-muted×bg/surface, accent×bg/surface, accent-ink×accent, destructive×bg, 4 проектных акцента×bg/×surface, accent-ink×каждый акцент); `--color-line` исключён; порог 4.5:1. **Self-test эталоны (проверены в RESEARCH):** `#000000`×`#FFFFFF` = 21:1; `#A84B32`×`#FAFAF7` = 5.40:1; худшая пара — olive×surface 4.84:1.

---

### `package.json` (config — МОДИФИКАЦИЯ)

**Analog:** сам себя, строка 16:
```json
"verify": "npm run build && npm run check-seo && npm run check-tokens && npm run check-collections && node scripts/check-prohibitions.mjs"
```
Добавить в цепочку: `npm run check-contrast` (новый npm-скрипт `"check-contrast": "node scripts/check-contrast.mjs"`) — после check-tokens. Новых пакетов НЕ устанавливать (RESEARCH Standard Stack).

---

### `docs/hero-concept.md` (doc — НОВЫЙ)

**Analog:** прецедент — `docs/design_direction_portfolio_ivan_shivarshinov.md` (структура markdown-документа решения)

**Содержание (R9, D-14/D-15):** 2–3 варианта концептов первого экрана (ссылки/скриншоты из Figma MCP) + выбор + обоснование по критериям D-14 (реализуемость в системе, «Calm Interface, Active Work», задел под фазу 3); невыбранные варианты остаются референсом. Отсутствие MCP не блокирует (D-12: дефолт — контрактная типографика).

## Shared Patterns

### Паттерн компонента (все 10 новых .astro)
**Source:** `Seo.astro:4-13` (props) + `BaseLayout.astro:49-55` (scoped style)
**Apply to:** Button, Link, SectionHeading, ProjectCard, Media, Tag, Nav, Footer, Icon*
- Frontmatter: `interface Props` + `const { ... } = Astro.props` с дефолтами; enum-пропы типизированы (astro check);
- Scoped `<style>` потребляет ТОЛЬКО `var(--token-*)`; hex/px шкалы запрещены (check-tokens), исключение — 1–2px рамки/focus;
- Ноль тегов `<script>` (AC R4); транзишены — только `var(--motion-*)` + `var(--ease-*)`;
- Адаптивность — scoped media-queries, `min-width` включительно, числа 768/1200 = bp-токенам;
- Плоская композиция: страницы рендерят self-closing компоненты, стиль не дублируется (ADR §5.4).

### W1: aria-current на маршрут
**Source:** `BaseLayout.astro:23` (нормализация pathname) + строки 33-41 (aria-current)
**Apply to:** Nav.astro (перенос), W1-ассерт в check-tokens (проверка dist)
```astro
const pathname = Astro.url.pathname.replace(/\/+$/, '') || '/';
...
<a href="/work" aria-current={pathname === '/work' ? 'page' : undefined}>...
```

### Theme-проп → inline style `--project-accent`
**Source:** RESEARCH Pattern 2 (spike R5: scoped + переменная — проверенная конструкция)
**Apply to:** ProjectCard, Tag; значения — только в tokens.css (`--project-*`)
```astro
<article style={theme ? { '--project-accent': ACCENTS[theme] } : undefined}>
```

### Скрипт верификации (каркас для check-contrast)
**Source:** `check-tokens.mjs:21-132,177-260` + `check-seo.mjs:37-51,173-197`
**Apply to:** check-contrast (новый), расширение check-tokens
- plain Node без зависимостей; `ROOT` через `fileURLToPath(import.meta.url)`;
- `walk(dir, exts)` + `audit()` (массив нарушений) + `render()` (exit 0/1);
- `runSelfTest()` с фикстурами во `mkdtempSync` и `--self-test` флагом;
- dist-проверки: guard «dist не найден» (не fail) — паттерн check-seo auditDist.

### Kill-switch reduced-motion
**Source:** RESEARCH Pattern 4/6 (RESEARCH Code Example 6)
**Apply to:** global.css (единственная точка — компоненты не «забывают» его)
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/Media.astro` | component | static render | В кодовой базе нет ни одного figure/ratio-компонента; каркас — RESEARCH Code Example 3 (aspect-ratio + overflow + min-height:0, Pitfall 3) |
| `src/components/Icon*.astro` | component | static render | В кодовой базе нет SVG; контракт — D-10/D-11 (24px, stroke 2, currentColor, геометрические paths); форма компонента — Seo.astro (markup-only) |
| `scripts/check-contrast.mjs` | utility | file-I/O, batch | Логика WCAG новая; структура — check-tokens.mjs (exact), формула + эталоны — RESEARCH Code Example 5 |
| `docs/hero-concept.md` | doc | — | Figma-артефакты (R9) — новый тип; структура markdown — прецедент docs/design_direction_*.md |

## Metadata

**Analog search scope:** `src/styles/`, `src/components/`, `src/layouts/`, `src/pages/`, `scripts/`, `package.json`
**Files scanned:** 13 (tokens.css, global.css, BaseLayout.astro, Seo.astro, index.astro, work.astro, 5 scripts, package.json)
**Pattern extraction date:** 2026-08-02
**Notes:** Все паттерны фазы 2 — расширение существующего: ни одного нового пакета; единственные «новые концепты» в кодовой базе — SVG-иконки, figure/ratio-рамка и WCAG-формула (каркасы из RESEARCH.md); новый каталог `src/components/` не имеет устоявшихся аналогов кроме Seo.astro — все новые компоненты следуют одной форме «Props + scoped style + var()».
