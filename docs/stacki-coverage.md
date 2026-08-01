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
| Компоненты | Открыть src/components/Seo.astro и src/layouts/BaseLayout.astro в Stacki — как отображаются компоненты | | |
| Props | Seo.astro: props title, description, canonical?, ogImage? — видны ли props и их типы | | |
| Variants | В фазе 1 вариантов нет (UI-SPEC Interaction NONE, компоненты без variant-логики) — что Stacki показывает для компонента без variants | | |
| Scoped styles | BaseLayout.astro: scoped `<style>` активной ссылки навигации | | |
| CSS-переменные | src/styles/tokens.css: --color-accent и остальные токены; потребление var(--color-accent) в BaseLayout (nav) и global.css (:focus-visible) | | |
| JSON-коллекции | src/data/services.json, skills.json, tools.json — отображаются ли записи коллекций | | |
| Frontmatter | src/pages/*.astro: блок --- --- (title, description) — виден ли frontmatter | | |
| View Transitions | src/pages/_spike-vt.astro: ClientRouter из astro:transitions, ссылка с transition:name="page" | | |
| Краевой случай: scoped style и CSS-переменная одновременно | BaseLayout.astro: `nav a[aria-current='page'] { color: var(--color-accent) }` — scoped-правило, потребляющее токен | | |
| Краевой случай: коллекция с 0 записей | src/content/notes — 0 записей (в папке только .gitkeep) | | |

## Ограничения

(заполняется после прогона)
