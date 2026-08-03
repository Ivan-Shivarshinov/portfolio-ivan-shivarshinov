---
phase: 03-kontent-i-stranicy
plan: 04
subsystem: content
tags: [astro, contacts, clipboard, footer, content-collections, strict-json-loader]

# Dependency graph
requires:
  - phase: 03-kontent-i-stranicy
    provides: "03-01: коллекция contacts (strict-json-loader, схема {id, label, value, href}, D-11); 03-02: check-tokens правило 9 (1 script на /contact); 03-03: проверенные паттерны компонентов"
provides:
  - "Единый источник контактов src/data/contacts.json (D-11): 3 канала с реальными значениями пользователя (D-12) — email/telegram/github, уникальные id (strict-json-loader)"
  - "Страница /contact: 3 канала из коллекции, копирование email — первый клиентский JS сайта (D-10, navigator.clipboard → execCommand fallback, состояния idle/copied/error, aria-live)"
  - "Footer: ссылки контактов из той же коллекции (AC R7 «ссылки идентичны» — источником, не проверкой), hit-area ≥44px, 2 строки <768px"
affects: [03-05, 03-06, 02-UI-SPEC consumers]

# Tech tracking
tech-stack:
  added: ["первый клиентский JS сайта — vanilla inline script (без фреймворков, ADR)"]
  patterns:
    - "Копирование email = прогрессивное улучшение поверх mailto: navigator.clipboard (secure context) → execCommand('copy') через временный textarea (position: fixed, opacity 0, readOnly); состояния через classList.toggle('is-copied') + span с aria-live='polite'; авто-сброс ≈2 с"
    - "Единый источник каналов: и /contact, и Footer читают getCollection('contacts') — AC R7 обеспечивается источником, не проверкой"
    - "Внешние ссылки (TG/GitHub) — plain <a> с контрактом Link (target=\"_blank\" rel=\"noopener\", T-03-10): Link.astro не форвардит target/rel (Props только variant/href)"
    - "Footer <768px: две строки через flex-wrap + order (контакты — первая строка, копирайт с меткой — вторая), без max-width-запросов (правило 5)"

key-files:
  created: [src/data/contacts.json]
  modified: [src/pages/contact.astro, src/components/Footer.astro]

key-decisions:
  - "Значения контактов утверждены пользователем 2026-08-03 (D-12): email ivan.shivarshinov@gmail.com, telegram @ivan_shivarshinov, github https://github.com/Ivan-Shivarshinov (новый URL — пользователь подтвердил) — без правок формулировок (по умолчанию UI-SPEC Copywriting Contract)"
  - "Внешние каналы (TG/GitHub) — plain <a> со стилями контракта Link вместо Link.astro: компонент не принимает/не форвардит target/rel (interface Props {variant, href}), а T-03-10 требует rel=noopener — отклонение от буквы плана «value как Link» в пользу безопасности (цель плана сохранена)"

patterns-established:
  - "Pattern: первый клиентский JS — единственный inline-скрипт на /contact, данные из data-copy атрибута (единый источник), TS-типизация DOM (querySelector<HTMLButtonElement>, guard на dataset.copy)"
  - "Pattern: элементы контент-коллекции Astro читаются через .data (c.data.label), а не c.label — тип CollectionEntry"
  - "Pattern: в inline-скриптах нельзя использовать return на верхнем уровне — Astro компилятор падает; guard-блоки через вложенные if"

requirements-completed: [REQ-tone]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Единый источник контактов contacts.json (3 канала, реальные значения D-12) + /contact с копированием email + Footer со ссылками из той же коллекции"
    requirement: REQ-tone
    verification:
      - kind: integration
        ref: "npm run build — exit 0"
        status: pass
      - kind: integration
        ref: "node scripts/check-tokens.mjs — exit 0 (правило 9: ровно 1 <script>, только на contact/index.html)"
        status: pass
      - kind: automated_ui
        ref: "grep dist/contact/index.html: mailto: присутствует, data-copy= присутствует, LinkedIn отсутствует, ровно 1 <script>"
        status: pass
      - kind: automated_ui
        ref: "grep dist/*/index.html: footer__link × 3 из contacts.json на всех страницах, target=_blank rel=noopener на внешних"
        status: pass
    human_judgment: false

# Metrics
duration: 15min
completed: 2026-08-03
status: complete
---

# Phase 03 Plan 04: Контакты из единого источника — contacts.json, /contact с копированием email, футер со ссылками

**Единый источник контактов src/data/contacts.json (3 канала, реальные значения от пользователя D-12), страница /contact с первым клиентским JS сайта — копированием email через navigator.clipboard с execCommand-fallback, и футер со ссылками из той же коллекции (AC R7).**

## Performance

- **Duration:** ~15 min (включая паузу на checkpoint Task 1 до получения значений D-12)
- **Started:** 2026-08-03 (Task 1 checkpoint)
- **Completed:** 2026-08-03
- **Tasks:** 2 (1 checkpoint:human-verify — решён пользователем, 1 auto)
- **Files modified:** 3

## Accomplishments

- `src/data/contacts.json` — единый источник 3 каналов {id, label, value, href} с утверждёнными значениями (email ivan.shivarshinov@gmail.com / @ivan_shivarshinov / github.com/Ivan-Shivarshinov), уникальные id (strict-json-loader: дубль падает сборку), формат как services.json
- `/contact` — 3 строки каналов (иконка 24px + моно-лейбл + value-ссылка) из коллекции; email-строка с кнопкой «Копировать» (native button, Button secondary lg-контракт), состояния idle → «Скопировано» + IconCheck (≈2 с авто-сброс) → «Не удалось скопировать — выделите адрес вручную», статус через span aria-live="polite"; mailto работает без JS
- Первый клиентский JS сайта (D-10): один inline-скрипт только на /contact — navigator.clipboard в secure-контексте, fallback execCommand через временный textarea; правило 9 check-tokens зелёное (ровно 1 `<script>` суммарно по dist)
- Footer — ссылки контактов из той же коллекции (D-11, AC R7): EMAIL · TELEGRAM · GITHUB моно Caption 12px ink-muted → hover ink, hit-area ≥44px (padding-block --space-md), 2 строки <768px (контакты переносятся, без горизонтального скролла на 320px), 1 строка ≥768px (копирайт слева, ссылки + метка справа)
- Без формы и без LinkedIn на /contact (R7); IconLinkedin не используется (остаётся как задел по решению плана)

## Task Commits

Each task was committed atomically:

1. **Task 1: Значения контактов от пользователя (D-12)** — checkpoint:human-verify, решён пользователем 2026-08-03 (значения выше; правок формулировок нет) — без коммита
2. **Task 2: contacts.json, /contact с копированием email, футер со ссылками** - `d02fc73` (feat)

**Plan metadata:** `docs(03-04): complete contacts plan` (финальный коммит)

## Files Created/Modified

- `src/data/contacts.json` - Единый источник каналов: 3 записи {id, label, value, href} с реальными значениями (D-12); email с mailto:, telegram с https://t.me/, github с https://github.com/
- `src/pages/contact.astro` - 3 канала из getCollection('contacts') + email-кнопка копирования (data-copy={email.data.value} без кавычек — правило 10) + единственный inline-скрипт сайта (D-10); SectionHeading CONTACT/«Контакты»
- `src/components/Footer.astro` - Контакты из коллекции (D-11): ul.footer__contacts, ссылки с target/rel на внешних, uppercase через CSS, flex-wrap+order для двух строк <768px

## Decisions Made

- **Значения контактов (D-12)** — утверждены пользователем 2026-08-03 в checkpoint Task 1: email ivan.shivarshinov@gmail.com, telegram @ivan_shivarshinov, github https://github.com/Ivan-Shivarshinov (новый URL, подтверждён пользователем); формулировки кнопки — по умолчанию UI-SPEC Copywriting Contract («Копировать»/«Скопировано»/«Не удалось скопировать» + «выделите адрес вручную»)
- **Внешние каналы — plain `<a class="contact__value">` вместо Link.astro** — Link.astro не форвардит target/rel (Props = {variant, href}); T-03-10 требует target="_blank" rel="noopener"; визуальный контракт Link (ink → accent+underline) воспроизведён в scoped-стилях страницы. Email — через Link.astro (mailto не требует target)
- **Гвард копирования** — `if (status && copyText)` вместо return на верхнем уровне скрипта: Astro-компилятор падает на top-level return (SyntaxError «A 'return' statement can only be used within a function body»)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Доступ к полям записей коллекции через .data**
- **Found during:** Task 2 (frontmatter и шаблоны)
- **Issue:** План писал `c.label`/`email.value`, но типы CollectionEntry<'contacts'> хранят поля в `.data` — astro check падал ts(2339) на c.label/c.href/c.value (15 ошибок)
- **Fix:** `c.data.label`, `c.data.href`, `c.data.value`, `email.data.value` — везде в шаблонах и data-copy
- **Files modified:** src/pages/contact.astro, src/components/Footer.astro
- **Verification:** npm run build — exit 0
- **Committed in:** d02fc73 (Task 2 commit)

**2. [Rule 3 - Blocking] TS-типизация клиентского скрипта**
- **Found during:** Task 2 (inline-скрипт)
- **Issue:** astro check падал: `btn.dataset` на типе Element (ts2339 ×3), `status` possibly null (ts18047 ×2), implicit any у параметра fallback (ts7006), `btn.dataset.copy` — string | undefined (ts2345 ×3)
- **Fix:** `document.querySelector<HTMLButtonElement>`, guard `if (status && copyText)` (копия текста захвачена в const), тип параметра (text: string)
- **Files modified:** src/pages/contact.astro
- **Verification:** npm run build — exit 0
- **Committed in:** d02fc73 (Task 2 commit)

**3. [Rule 3 - Blocking] Top-level return в inline-скрипте ломает компилятор**
- **Found during:** Task 2 (сборка)
- **Issue:** Первый вариант guard'а `if (!status || !copyText) return;` — Astro/rolldown падает: «A 'return' statement can only be used within a function body» (top-level return в скрипте недопустим)
- **Fix:** Вложенный `if (status && copyText) { ... }` вместо раннего return
- **Files modified:** src/pages/contact.astro
- **Verification:** npm run build — exit 0
- **Committed in:** d02fc73 (Task 2 commit)

**4. [Rule 1 - Bug] Собственный комментарий нарушал правило 10 check-tokens**
- **Found during:** Task 2 (check-tokens прогон)
- **Issue:** Комментарий в шаблоне содержал литерал `data-copy="{email.data.value}"` — правило 10 ловит голый {expr} в кавычках по всем .astro-шаблонам, включая комментарии
- **Fix:** Переформулирован комментарий (без образца с кавычками)
- **Files modified:** src/pages/contact.astro
- **Verification:** node scripts/check-tokens.mjs — exit 0
- **Committed in:** d02fc73 (Task 2 commit)

---

**Total deviations:** 4 auto-fixed (3 blocking, 1 bug)
**Impact on plan:** Все фиксы — необходимые для зелёной сборки и типажей; цель и контракты плана не менялись.

## Issues Encountered

- **libuv/rolldown assertion на Windows** — при первом прогоне сборка упала с «Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)» — это вторичный симптом реальной ошибки компиляции скрипта (top-level return, см. Deviation 3); после фикса скрипта сборка зелёная, assertion не повторяется
- **Правило 9 check-tokens** — до этого плана dist содержал 0 скриптов (ожидаемый red, зафиксирован в STATE.md); после /contact с inline-скриптом правило зелёное: ровно 1 `<script>` суммарно, только на contact/index.html — запланированный green закрыт в этом плане

## User Setup Required

None - внешние сервисы не требуются; контакты публичные по выбору пользователя (D-12, T-03-09 accept).

## Next Phase Readiness

- Контактный слой готов: 3 канала из единого источника, копирование email с состояниями и fallback, футер с идентичными ссылками (R7)
- Правило 9 check-tokens зелёное — 03-05/03-06 могут опираться на «1 script на /contact» как на зафиксированный контракт
- Визуальная сверка /contact и футера — финальный визуальный проход 03-06 (human-check по плану)
- Ожидаемые предупреждения не влияют на сборку: ts6387 (execCommand deprecated — намеренный fallback, D-10) и ts6196 в Footer.astro (Props — предупреждение astro check, не ошибка); ts6133 в work/[slug]/index.astro — вне скоупа (03-03)

## Self-Check: PASSED

- [x] src/data/contacts.json существует, 3 записи с уникальными id email/telegram/github, href email начинается с mailto:, telegram — https://t.me/, github — https://github.com/, без плейсхолдеров
- [x] src/pages/contact.astro существует, содержит getCollection('contacts'), button[data-copy] без кавычек, span#copy-status с aria-live="polite", mailto в разметке; без LinkedIn и без <form>
- [x] src/components/Footer.astro существует, содержит getCollection('contacts') и ссылки контактов
- [x] npm run build — exit 0; node scripts/check-tokens.mjs — exit 0; check-tokens --self-test — exit 0; check-tone --self-test — exit 0
- [x] dist/contact/index.html: ровно 1 <script> (только на /contact), mailto: присутствует, data-copy="ivan.shivarshinov@gmail.com" присутствует, LinkedIn отсутствует; footer__link × 3 на всех страницах, target="_blank" rel="noopener" на внешних
- [x] Коммит d02fc73 найден в git log

---
*Phase: 03-kontent-i-stranicy*
*Completed: 2026-08-03*
