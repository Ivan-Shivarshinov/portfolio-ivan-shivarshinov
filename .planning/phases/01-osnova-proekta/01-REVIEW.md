---
phase: 01-osnova-proekta
reviewed: 2026-08-02T12:00:00Z
depth: standard
files_reviewed: 21
files_reviewed_list:
  - docs/stacki-coverage.md
  - public/robots.txt
  - scripts/check-collections.mjs
  - scripts/check-prohibitions.mjs
  - scripts/check-seo.mjs
  - scripts/check-spike-doc.mjs
  - scripts/check-tokens.mjs
  - scripts/verify-preview.mjs
  - src/components/Seo.astro
  - src/content.config.ts
  - src/data/services.json
  - src/data/skills.json
  - src/data/tools.json
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
  warning: 5
  info: 6
  total: 11
status: issues_found
---

# Фаза 1: Отчёт по код-ревью

**Проверено:** 2026-08-02T12:00:00Z
**Глубина:** standard
**Файлов проверено:** 21
**Статус:** issues_found

## Сводка

Проверены все 21 файл фазы: контентный слой (`content.config.ts` со строгими лоадерами), SEO-компонент, лейаут, 5 страниц-заглушек, дизайн-токены, 6 скриптов проверки (R1–R5) и документация stacki-coverage. Боевой код (страницы, лейаут, Seo, токены, JSON-данные) написан аккуратно и контрактно: canonical/OG строятся от `Astro.site!` (site задан в astro.config.mjs — падать не будет), лоадеры действительно валидируют дубликаты, пустые коллекции проходят, placeholder-тексты страниц дословно соответствуют UI-SPEC.

Основные замечания сосредоточены в скриптах проверки: (1) негативные тесты в check-collections фиксируют только «сборка упала», а не «упала по той самой причине» — зелёная сборка возможна при полностью сломанном детекторе дубликатов; (2) у strictProjectId в dev-режиме «залипает» карта виденных slug — переименование/пересоздание файла с тем же slug даёт ложный «Duplicate slug» до рестарта dev-сервера; (3) check-spike-doc из-за пересечения ключевых слов не ловит удаление отдельных строк таблицы. Критических проблем (безопасность, потеря данных, падение сборки в штатном режиме) не обнаружено.

## Warnings

### WR-01: Негативные тесты check-collections проходят при ЛЮБОМ падении сборки, а не при ожидаемой ошибке

**Файл:** `scripts/check-collections.mjs:136-146, 157-162, 179-184`
**Проблема:** Все три негативных теста (дубликат slug, отсутствие обязательного поля, дубликат id) считают PASS при любом `status !== 0`. Если сборка сломана по посторонней причине (синтаксическая ошибка в content.config.ts, таймаут `spawnSync`, OOM, неверная зависимость), все три теста «зеленеют» — проверка R3 становится бессмысленной: детектор дубликатов можно полностью выключить, и CI всё равно пройдёт. Регулярка `/DuplicateContentEntrySlugError|same slug/i` (строка 141) призвана подтверждать конкретную ошибку, но фактический текст ошибки собственного лоадера — `Duplicate slug "..." in "..." and "..."` — под неё не подпадает (ни `DuplicateContentEntrySlugError`, ни `same slug`), и результат проверки регулярки ни на что не влияет — это лишь строка-деталь в логе. То же для дубликата id (ожидается сообщение строгого JSON-лоадера, но проверяется только exit-код).
**Фикс:** Сделать проверку причины обязательной: тест FAIL, если stderr не содержит ожидаемого маркера. Для дубликата slug — `/Duplicate slug/i` или сообщение строгого лоадера; для missing field — упоминание zod-ошибки схемы (`title`); для дубликата id — `Duplicate id`/`missing an "id"`. Например:

```js
const { status, stderr } = runBuild();
const hasExpectedError = /Duplicate slug/i.test(stderr);
if (status === 0 || !hasExpectedError) {
  report('дубликат slug (projects)', false,
    `ожидался exit != 0 и ошибка "Duplicate slug", получено: exit ${status}, stderr: ${stderr.slice(0, 300)}`);
  return;
}
```

### WR-02: strictProjectId — карта `seen` не инвалидируется при удалении файлов: ложный «Duplicate slug» в dev

**Файл:** `src/content.config.ts:54-67`
**Проблема:** Карта `seen` создаётся один раз при оценке content.config.ts и живёт всю сессию dev-сервера. Записи для удалённых/переименованных файлов из неё не вычищаются. Сценарий: в dev-режиме файл `foo.md` со slug `x` удаляется, затем создаётся новый файл `bar.md` с тем же slug `x` — `prev` указывает на уже несуществующий `foo.md`, `prev !== entry`, лоадер бросает «Duplicate slug», сборка застревает до рестарта dev-сервера. То же при переименовании файла (путь меняется, slug — нет). В production-сборке (свежий процесс) проблема не проявляется, но в dev это реальный ложный отказ.
**Фикс:** Синхронизировать карту с фактическим набором entry: очищать `seen` от id, чьи пути больше не существуют на диске, либо сверять с текущим списком файлов коллекции перед генерацией. Минимальный вариант — на каждой загрузке коллекции удалять из `seen` записи, у которых `entry` отсутствует в новом наборе путей (например, передавать в `strictProjectId` текущий список entry при каждом проходе, а не хранить его в замыкании навсегда).

### WR-03: check-spike-doc — пересечение ключевых слов не ловит удаление отдельных строк таблицы

**Файл:** `scripts/check-spike-doc.mjs:56-65`
**Проблема:** Поиск по ключевым словам не привязан к строкам таблицы — ищется по всему документу, включая секцию «Ограничения» и строки краевых случаев. Из-за этого удаление целых строк остаётся незамеченным: (а) если удалить строку «Компоненты» — пункт всё равно «покрыт» словом «компонент» в строке Variants («компонент без variants»); (б) если удалить строку «Scoped styles» — пункт покрыт строкой краевого случая edge-1, содержащей «scoped» и «проверено». Self-test это не ловит: он тестирует удаление только строки View Transitions, чьё ключевое слово уникально. Проверка R5 не гарантирует наличие всех 10 строк.
**Фикс:** Ограничить поиск строками таблицы (между `|`-границами таблицы или между строками, начинающимися с `|`), а лучше — парсить ячейку «Конструкция» первой колонки и сопоставлять с пунктом по индексу строки таблицы. Как минимум — исключить из поиска секцию после `## Ограничения` и строки, уже отнесённые к другому пункту.

### WR-04: verify-preview — `--routes` без значения молча съедает следующий флаг

**Файл:** `scripts/verify-preview.mjs:46-48`
**Проблема:** При вызове `node scripts/verify-preview.mjs --routes --port 4322` значение `--routes` = `'--port'` (валидации, что следующий аргумент не начинается с `--`, нет). Дальше `buildRouteList('--port')` даёт маршрут `['--port']` — скрипт запрашивает `/--port`, получает 404 и падает с непонятной ошибкой; при этом сам `--port 4322` игнорируется (порт остаётся 4321). Для `--port` аналогичный случай обрабатывается корректно (NaN → exit 1), для `--routes` — нет.
**Фикс:** Проверять, что следующий аргумент существует и не начинается с `--`, иначе — понятная ошибка:

```js
} else if (a === '--routes') {
  const v = argv[i + 1];
  if (v === undefined || v.startsWith('--')) {
    console.error('FAIL: --routes ожидает значение (пути через запятую, например /,/work)');
    process.exit(1);
  }
  out.routesValue = v;
  i++;
}
```

### WR-05: robots.txt — sitemap указывает на заглушечный домен portfolio.example.com

**Файл:** `public/robots.txt:3`
**Проблема:** Директива `Sitemap: https://portfolio.example.com/sitemap-index.xml` захардкожена со стороны контента и не синхронизируется с реальным `site` из astro.config.mjs. При деплое на настоящий домен (фаза 6) sitemap в robots.txt останется указывать на example.com — поисковики не найдут реальную карту сайта, и это не отслеживается ни одним чек-скриптом (check-seo проверяет только наличие sitemap-index.xml в dist). Требование R4 (SEO) молча деградирует после смены домена.
**Фикс:** Сгенерировать robots.txt при сборке из конфига (`site`) — например, через Astro endpoint `src/pages/robots.txt.ts` с чтением `Astro.site` — либо добавить в check-seo проверку, что URL sitemap в `public/robots.txt` начинается с реального `site` из astro.config.mjs.

## Info

### IN-01: strictJsonLoader — незахваченная промиса в watcher-хендлере

**Файл:** `src/content.config.ts:114-119`
**Проблема:** В `watcher.on('change', ...)` вызывается `syncData(context)` без `await`. Если в момент изменения JSON временно невалиден (промежуточное сохранение редактора), `syncData` отклонится — unhandled rejection в dev-режиме, потенциальный крэш dev-сервера.
**Фикс:** `watcher?.on('change', (changedPath) => { if (changedPath === filePath) { void syncData(context).catch((err) => context.logger.error(...)); } });` — либо сделать колбэк async и обернуть в try/catch.

### IN-02: strictJsonLoader — рассогласование filePath в store.set

**Файл:** `src/content.config.ts:101-105`
**Проблема:** В `parseData` передаётся абсолютный `filePath`, а в `store.set` — относительный `fileName` (`'./src/data/services.json'`). Для HMR-маппинга записи на файл в dev это рассинхронизированные пути; поведение сейчас рабочее, но при обновлениях Astro может сломаться, и это не задокументировано.
**Фикс:** Передавать в `store.set` тот же абсолютный путь: `store.set({ id: record.id, data: parsed, filePath: filePath })`.

### IN-03: check-seo — `String.fromCodePoint` может бросить RangeError на битых сущностях

**Файл:** `scripts/check-seo.mjs:64-65`
**Проблема:** `String.fromCodePoint(parseInt(h, 16))` бросает RangeError на кодовых точках > 0x10FFFF (например, `&#x110000;`). Сейчас страницы генерируются самим сайтом, риск низкий, но злонамеренно/случайно повреждённый HTML в dist роняет весь аудит.
**Фикс:** Проверять диапазон перед вызовом либо оборачивать в try/catch и возвращать исходную последовательность.

### IN-04: check-prohibitions — крэш на корневом `null` в package.json

**Файл:** `scripts/check-prohibitions.mjs:73-77`
**Проблема:** `JSON.parse` пакетного файла со значением `null` (или строкой) проходит, а `auditPkg(null)` падает с TypeError на `pkg.dependencies` — `auditPackageJson` ловит только ошибки парсинга. Нереалистично для настоящего package.json, но хрупко для утилиты, у которой есть self-test.
**Фикс:** В начале `auditPkg` проверять `typeof pkg === 'object' && pkg !== null && !Array.isArray(pkg)`, иначе возвращать `{ ok: false, found: [], errors: [...] }`.

### IN-05: verify-preview — нет таймаута на запрос маршрута

**Файл:** `scripts/verify-preview.mjs:132-150`
**Проблема:** `fetch` в `probeRoutes` без лимита: если preview-сервер примет соединение и не ответит на один из маршрутов, скрипт зависнет навсегда (таймаут готовности сервера срабатывает, а запросы — нет).
**Фикс:** Использовать `AbortSignal.timeout(...)` (например, 10 c) в `fetchFn` — в self-test фикстура сигнал игнорирует, реальный прогон получает защиту.

### IN-06: check-seo — split('||') ломается, если title/description содержат «||»

**Файл:** `scripts/check-seo.mjs:113-125`
**Проблема:** Ключ пары собирается как `title + '||' + description`, а при выводе дубля разбирается обратно `pair.split('||')`. Если текст title или description когда-либо будет содержать «||», сообщение об ошибке исказится. Теоретический случай, но дешёвая защита есть.
**Фикс:** Хранить пары структурно: `pairCounts: Map<string, { title, description, files }>` вместо склейки строк.

---

_Проверено: 2026-08-02T12:00:00Z_
_Ревьюер: Claude (gsd-code-reviewer)_
_Глубина: standard_
