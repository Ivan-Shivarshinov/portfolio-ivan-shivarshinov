# Stacki Coverage — Astro scaffold

Дата: 2026-08-01 · Версия Stacki: v0.1.3 · Дистрибутив: flowtricks/stacki-releases (NSIS, Windows)

Цель (SPEC R5, решение D-14): эмпирически зафиксировать, какие конструкции Astro-проекта
Stacki понимает и как отображает. Гибридный прогон (D-13): агент подготовил чек-лист,
пользователь проходит сценарий в desktop-приложении, агент фиксирует вердикты.

Процедура прогона:

1. Установить Stacki v0.1.3 (NSIS-установщик) с https://github.com/flowtricks/stacki-releases/releases/tag/v0.1.3
   (fallback при невозможности — сборка из исходников flowtricks/stacki: `git clone` + `npm install` + `npm run dist:win`, выполняет агент по запросу).
2. Запустить `npm run dev` в корне проекта (astro dev).
3. Открыть проект в Stacki.
4. Пройти строки таблицы ниже; для каждой строки записать, что реально видно в Stacki:
   работает визуально / доступно только через кодовый режим / недоступно (ограничение).

## Чек-лист конструкций

| Конструкция | Как проверить (путь в проекте) | Вердикт (проверено/ограничение) | Наблюдение |
| --- | --- | --- | --- |
| Компоненты | Открыть src/components/Seo.astro и src/layouts/BaseLayout.astro в Stacki — как отображаются компоненты | проверено | Оба компонента (Seo.astro и BaseLayout.astro) видны как компоненты в визуальном редакторе |
| Props | Seo.astro: props title, description, canonical?, ogImage? — видны ли props и их типы | проверено | Props Seo видны (title, description) |
| Variants | В фазе 1 вариантов нет (UI-SPEC Interaction NONE, компоненты без variant-логики) — что Stacki показывает для компонента без variants | проверено | У Seo (компонент без variants) секции вариантов нет; у BaseLayout в списке вариантов есть запись «baselayout» — по наблюдению это сам лейаут, а не variants-конструкция (интерпретация списка требует осторожности) |
| Scoped styles | BaseLayout.astro: scoped `<style>` активной ссылки навигации | проверено | Внутри baselayout виден кодовый элемент styles с точным содержимым: `nav a[aria-current='page'] { color: var(--color-accent); }` (включая комментарий про spike R5) |
| CSS-переменные | src/styles/tokens.css: --color-accent и остальные токены; потребление var(--color-accent) в BaseLayout (nav) и global.css (:focus-visible) | ограничение | Визуальной панели переменных (как в Webflow) нет; CSS-переменные видны только внутри кодового элемента styles (см. Scoped styles). Отдельного визуального отображения токенов нет |
| JSON-коллекции | src/data/services.json, skills.json, tools.json — отображаются ли записи коллекций | проверено | Видны 3 коллекции с данными: Services, Skills, Tools |
| Frontmatter | src/pages/*.astro: блок --- --- (title, description) — виден ли frontmatter | проверено | Блок кода в верху дерева виден |
| View Transitions | src/pages/_spike-vt.astro: ClientRouter из astro:transitions, ссылка с transition:name="page" | ограничение | Элемента spike-vt и какого-либо отображения transition в визуальном редакторе не найдено |
| Краевой случай: scoped style и CSS-переменная одновременно | BaseLayout.astro: `nav a[aria-current='page'] { color: var(--color-accent) }` — scoped-правило, потребляющее токен | проверено | Правило `nav a[aria-current='page'] { color: var(--color-accent) }` видно целиком (то же наблюдение, что и в Scoped styles) |
| Краевой случай: коллекция с 0 записей | src/content/notes — 0 записей (в папке только .gitkeep) | ограничение | Пустая Notes не отображается; в списке коллекций только 3 с данными (Services, Skills, Tools) |

## Ограничения

- Нет визуальной панели CSS-переменных (аналог Webflow): токены видны только внутри кодового элемента styles компонента; отдельного визуального представления дизайн-токенов нет.
- View Transitions не отображаются в визуальном редакторе: spike-страница (_spike-vt.astro, ClientRouter, transition:name) в редакторе не найдена — конструкция остаётся кодовым режимом.
- Пустые коллекции (0 записей) скрыты из списка коллекций: Notes не отображается, пока в коллекции нет данных.
- Список вариантов может содержать запись, не являющуюся variants-конструкцией: у BaseLayout в списке вариантов есть «baselayout» (сам лейаут) — интерпретация секции вариантов требует осторожности.
