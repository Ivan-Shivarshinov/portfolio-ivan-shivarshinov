---
phase: 02-vizualnaya-sistema
reviewed: 2026-08-03T08:55:00Z
depth: standard
files_reviewed: 28
files_reviewed_list:
  - scripts/check-contrast.mjs
  - scripts/check-theme.mjs
  - scripts/check-tokens.mjs
  - src/components/Button.astro
  - src/components/Footer.astro
  - src/components/IconArrowDown.astro
  - src/components/IconArrowRight.astro
  - src/components/IconCheck.astro
  - src/components/IconClose.astro
  - src/components/IconCopy.astro
  - src/components/IconExternalLink.astro
  - src/components/IconGithub.astro
  - src/components/IconLinkedin.astro
  - src/components/IconMail.astro
  - src/components/IconTelegram.astro
  - src/components/Link.astro
  - src/components/Media.astro
  - src/components/Nav.astro
  - src/components/ProjectCard.astro
  - src/components/SectionHeading.astro
  - src/components/Tag.astro
  - src/layouts/BaseLayout.astro
  - src/pages/about.astro
  - src/pages/contact.astro
  - src/pages/index.astro
  - src/pages/lab.astro
  - src/pages/work.astro
  - src/styles/global.css
  - src/styles/tokens.css
findings:
  critical: 0
  warning: 2
  info: 6
  total: 8
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-08-03T08:55:00Z
**Depth:** standard
**Files Reviewed:** 28
**Status:** issues_found

## Summary

Проверена вся визуальная система фазы 2: 28 файлов (3 check-скрипта, 21 компонент, 1 layout, 5 страниц, 2 style-файла). Дополнительно выполнены проверки окружения: `node scripts/check-contrast.mjs` (20/20 пар ≥ 4.5:1 — OK), `node scripts/check-tokens.mjs` (0 нарушений, W1 по реальному dist — OK), self-test'ы всех трёх скриптов (OK), `npx astro check` (0 ошибок, 2 hint'а), ручная сверка отрендеренного HTML (nav/aria-current/footer/inline custom properties — корректно).

Общее качество высокое: контрактная дисциплина (токены, bp-сверка, transition-токены, запрет хардкода) соблюдена, ошибок выполнения нет, безопасности-проблем нет (статический контент, без инъекций и секретов). Найдены 2 предупреждения и 6 информационных замечаний — все некритичные, код можно принимать с учётом их исправления в ближайших фазах.

## Warnings

### WR-01: На 4 из 5 страниц отсутствует h1 — нарушена структура заголовков (a11y/SEO)

**File:** `src/pages/work.astro:20`, `src/pages/about.astro:13-16`, `src/pages/contact.astro:13-16`, `src/pages/lab.astro:13-16`
**Issue:** work.astro начинается с `SectionHeading`, который рендерит `<h2>` — на странице нет h1. about/contact/lab — пустые заголовки вообще: верхний элемент — `<p class="empty-state__caption">`. Единственный h1 во всём сайте — `hero__name` на index. Для скринридеров (навигация по заголовкам) и поисковых систем страница без h1 не имеет «главного заголовка»; при этом `<title>` («Работы — Иван Шиваршинов») есть, и расхождение title↔h1 усиливает проблему. Фаза 3 добавит контент, но пустые состояния и SYSTEM DEMO останутся без h1 до тех пор, пока это не зафиксировано.
**Fix:**
```astro
<!-- src/pages/work.astro: заменить SectionHeading title на h1-вариант или добавить h1 перед ним -->
<!-- Вариант: пустые состояния получают h1 вместо caption -->
<div class="empty-state">
  <h1 class="empty-state__caption">ABOUT — раздел в разработке</h1>
  <Link href="/">На главную</Link>
</div>
```
(Либо BaseLayout принимает проп `pageTitle?: string` и рендерит `<h1>` — единая точка для всех страниц.)

### WR-02: check-theme.mjs не чистит фикстуры на старте — прерванный прогон оставляет битую страницу в src/pages

**File:** `scripts/check-theme.mjs:83-86` (в `runMain`)
**Issue:** Фикстура `src/pages/zz-check-theme.astro` пишется в реальное дерево и удаляется только в `finally` (строка 102). Если процесс прерван (CI-timeout 180s, Ctrl+C, kill), файл остаётся в `src/pages`. Оставшаяся фикстура с `theme="bad"` роняет `astro check`, а `npm run build` = `astro check && astro build` (package.json) — то есть ломает весь verify до тех пор, пока check-theme не прогонится снова (и то только если следующий прогон дойдёт до finally). Оставшаяся страница также попадёт в sitemap.
**Fix:**
```js
function runMain() {
  let violations = 0;
  if (!existsSync(PAGES_DIR)) { /* ... */ }
  cleanupFixture(PAGES_DIR); // стартовая очистка — самовосстановление после прерванного прогона
  try {
    writeFixture(PAGES_DIR);
    // ...
```

## Info

### IN-01: 10 из 12 иконок не используются; grep-контроль R3 их не покрывает

**File:** `src/components/IconArrowDown.astro`, `IconCheck.astro`, `IconClose.astro`, `IconCopy.astro`, `IconExternalLink.astro`, `IconGithub.astro`, `IconLinkedin.astro`, `IconMail.astro`, `IconTelegram.astro`
**Issue:** В `src/` импортируется только `IconArrowRight` (index.astro). Остальные 10 иконок — мёртвый код фазы 2 (по плану — фаза 3: контакты, копирование и т.д.), но `USAGE_COMPONENTS` в check-tokens.mjs:99 покрывает только 8 «оболочечных» компонентов — иконки не контролируются и могут рассинхронизироваться с дизайном незаметно.
**Fix:** Добавить иконки в `USAGE_COMPONENTS` check-tokens.mjs (с known-red состоянием до фазы 3) или убрать неиспользуемые до фазы 3.

### IN-02: Дублирование карты ACCENTS в ProjectCard.astro и Tag.astro

**File:** `src/components/ProjectCard.astro:19-25`, `src/components/Tag.astro:15-21`
**Issue:** Один и тот же маппинг theme enum → `var(--project-*)` продублирован в двух компонентах (различается только формат ключей — кавычки). При добавлении значения в enum (например, новый project-акцент) обе карты должны меняться синхронно; check-theme проверяет только ProjectCard, расхождение в Tag не детектируется.
**Fix:** Вынести в общий модуль, например `src/utils/accents.ts` с `export const ACCENTS = {...}` и импортировать в оба компонента.

### IN-03: Неиспользуемые импорты в check-contrast.mjs

**File:** `scripts/check-contrast.mjs:13`
**Issue:** `writeFileSync` и `mkdirSync` импортированы из `node:fs`, но не используются (подтверждено `astro check`: ts(6133) hints). Код работает, но импорты — мёртвый груз и шум в типизации.
**Fix:** `import { readFileSync, existsSync, rmSync, mkdtempSync } from 'node:fs';`

### IN-04: Незащищённые readFileSync в правилах 5 и 6 check-tokens.mjs

**File:** `scripts/check-tokens.mjs:221` и `scripts/check-tokens.mjs:240`
**Issue:** `const text = readText(f);` в циклах медиа-сверки и transition-правила без try/catch — в отличие от остальных правил (hex-проверка строка 189-194, правило 10 строка 312-315), где чтение обёрнуто и даёт аккуратное violation. Если файл недоступен (удалён между проходами, права), audit упадёт с необработанным исключением и stack trace вместо списка нарушений.
**Fix:** Обернуть чтение в try/catch по образцу правила 3 и добавить violation `не удалось прочитать ${r}: ${err.message}`.

### IN-05: Мёртвое правило `.nav__name:hover` в Nav.astro

**File:** `src/components/Nav.astro:57-59`
**Issue:** Базовый цвет `.nav__name` — `var(--color-ink)`, hover задаёт тот же `var(--color-ink)` — правило не меняет состояние. Вероятно, задумывался hover-эффект (accent, как у остальных ссылок), но остался no-op.
**Fix:** Удалить правило или задать осмысленный hover (например, `color: var(--color-accent)`).

### IN-06: Жёстко зашитый год в Footer

**File:** `src/components/Footer.astro:14`
**Issue:** `© 2026 · Иван Шиваршинов` — год придётся править вручную. Для статического сайта приемлемо, но стоит зафиксировать как известную точку обслуживания (фаза 3 всё равно затронет футер — контакты/ссылки).
**Fix:** Оставить с комментарием-напоминанием или вынести в проп `year` с дефолтом.

---

_Reviewed: 2026-08-03T08:55:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
