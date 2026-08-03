---
phase: 03-kontent-i-stranicy
plan: 02
subsystem: testing
tags: [check-scripts, denylist, tone, seo, a11y, aria-current, node-stdlib]

# Dependency graph
requires:
  - phase: 01-osnova-proekta
    provides: "Базовые check-скрипты: check-seo.mjs (5 страниц, sitemap-index.xml), check-tokens.mjs (W1-ассерт, правило <script>), паттерн check-prohibitions.mjs (денлист + self-test с фикстурой-нарушителем)"
  - phase: 02-vizualnaya-sistema
    provides: "W1-контракт Nav (ровно 1 aria-current на верхнеуровневых), правило 10 (голый {expr}), SYSTEM DEMO-блок на work.astro, регрессионные фикстуры self-test"
provides:
  - "scripts/check-tone.mjs (НОВЫЙ): денлист тона 22 stem-записей (R9, REQ-tone), группа INDEX_LABELS со scope только по dist/index.html (Pitfall 7/A5), REQUIRED_CONTENT (формула D-13, категория, подпись, 4 меты About, 2 меты Lab, честный статус, mailto), негативные ассерты (нет LinkedIn), отсутствие SYSTEM DEMO/фикстурных карточек в dist/work (R2 AC) — с self-test"
  - "check-tokens.mjs: правило 7 допускает 0 aria-current=\"page\" на work/{slug}/index.html (Pitfall 1); правило 9 требует ровно 1 тег <script> суммарно, только на contact/index.html (D-10, Pitfall 2) — с фикстурами W1_CASE_GOOD/BAD, SCRIPT_CONTACT_GOOD/WORK_BAD/TOTAL_BAD"
  - "check-seo.mjs: EXPECTED_PAGES/EXPECTED_SITEMAP_URLS = 5 + число записей src/content/projects (computeExpectedPages, Open Question 1) — self-test на 7 страницах/url"
  - "package.json: скрипт check-tone (verify-цепочка не тронута — добавление в 03-06)"
affects: [03-03, 03-04, 03-05, 03-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Денлист русского тона: матчинг stem-подстроками по html.toLowerCase().includes(entry) — учитывает морфологию (R9)"
    - "Scope-ограниченная проверка: ярлыки позиционирования проверяются только по dist/index.html через scanIndexLabels() (Pitfall 7/A5)"
    - "Параметризация ожиданий фактом из коллекции: computeExpectedPages(rootDir) = 5 + N, без дублирования границ check-collections (Open Question 1)"
    - "Правило <script> как контракт первого клиентского JS: суммарный подсчёт по dist + требование единственной локации (D-10)"

key-files:
  created: [scripts/check-tone.mjs]
  modified: [scripts/check-tokens.mjs, scripts/check-seo.mjs, package.json]

key-decisions:
  - "Денлист тона стартует с 22 stem-записей (Code Example 4 из 03-RESEARCH + «эксперт мирового класса»); сверка с финальным контентом — прогон 03-06 по dist, порог не ниже 10 записей (R9, A4)"
  - "Ярлыки позиционирования — отдельная группа INDEX_LABELS (5 записей), scope только dist/index.html: «Product Engineer» легален в траектории /about (REQ-growth-trajectory, Pitfall 7/A5); «Product-minded web developer» — разрешённая категория, в денлист не входит (D-13)"
  - "Правило 9 check-tokens: суммарно ровно 1 тег <script> по всему dist и только в contact/index.html (D-10 — копирование email, первый клиентский JS). Следствие: сайт без copy-скрипта — нарушение; текущий dist (0 скриптов) — ожидаемый red до 03-05"
  - "Правило 7 check-tokens: страницы кейсов work/{slug}/index.html (regex ^work/[^/]+/index.html$) — ровно 0 aria-current (Pitfall 1); верхнеуровневые — прежний контракт ровно 1 с верным href"
  - "check-seo: EXPECTED_PAGES = computeExpectedPages(ROOT) = 5 фиксированных страниц + N записей проектов (факт из коллекции, Open Question 1); граница «5–6 записей» остаётся контрактом check-collections, check-seo не дублирует её, но честно ожидает фактическое число страниц"

patterns-established:
  - "Pattern: контрактная граница фазы = один check-скрипт (денлист + позитивные ассерты + self-test с фикстурой-нарушителем) по образцу check-prohibitions"
  - "Pattern: правила, устаревающие при появлении новых страниц/JS, параметризуются фактом (число страниц из коллекции; script-правило — по сумме и локации)"
  - "Pattern: scope проверки ограничивается контекстом контракта (ярлыки — только первый экран), а не всей областью dist"

requirements-completed: [REQ-positioning-category, REQ-main-promise, REQ-audience, REQ-competency-architecture, REQ-evidence-cases, REQ-tone, REQ-growth-trajectory]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "check-tone.mjs: денлист тона ≥10 stem-записей, группа INDEX_LABELS (scope только dist/index.html), позитивные ассерты REQUIRED_CONTENT (формула D-13, категория, подпись, меты About/Lab, mailto), негативные ассерты (нет LinkedIn), отсутствие SYSTEM DEMO/фикстур в dist/work — self-test классифицирует нарушителя/чистый текст/scope верно"
    requirement: REQ-tone
    verification:
      - kind: unit
        ref: "node scripts/check-tone.mjs --self-test — exit 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "check-tokens.mjs правила 7/9: страницы кейсов work/{slug}/index.html допускают ровно 0 aria-current (Pitfall 1), верхнеуровневые — ровно 1 с верным href; ровно 1 тег <script> суммарно и только на contact/index.html (D-10) — self-test с фикстурами W1_CASE_GOOD/BAD, SCRIPT_CONTACT_GOOD/WORK_BAD/TOTAL_BAD"
    requirement: REQ-evidence-cases
    verification:
      - kind: unit
        ref: "node scripts/check-tokens.mjs --self-test — exit 0"
        status: pass
    human_judgment: false
  - id: D3
    description: "check-seo.mjs параметризован фактом из коллекции: EXPECTED_PAGES/EXPECTED_SITEMAP_URLS = 5 + число записей src/content/projects (computeExpectedPages, без dot-файлов); auditPages/auditSitemap принимают expected параметром; self-test на 7 страницах/url, real-run по текущему dist (0 кейсов → 5) зелёный"
    requirement: REQ-evidence-cases
    verification:
      - kind: unit
        ref: "node scripts/check-seo.mjs --self-test — exit 0"
        status: pass
      - kind: integration
        ref: "node scripts/check-seo.mjs — exit 0 (real-run по текущему dist, ожидание 5)"
        status: pass
    human_judgment: false

# Metrics
duration: 9min
completed: 2026-08-03
status: complete
---

# Phase 3 Plan 2: Валидационный каркас фазы — check-tone, правила 7/9 check-tokens, параметризация check-seo

**Валидационный каркас фазы 3: новый check-tone.mjs (денлист тона 22 записи + ярлыки позиционирования со scope по / + позитивные ассерты + self-test), правила 7/9 check-tokens под страницы кейсов и первый клиентский JS (D-10), параметризация check-seo числом записей коллекции projects (5 + N)**

## Performance

- **Duration:** 9 min
- **Started:** 2026-08-03T16:16:00Z
- **Completed:** 2026-08-03T16:25:22Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Новый `scripts/check-tone.mjs`: денлист тона 22 stem-подстрок (R9, ≥10), группа `INDEX_LABELS` (5 ярлыков позиционирования) с проверкой scope ТОЛЬКО по `dist/index.html` через `scanIndexLabels()` (Pitfall 7/A5), позитивные ассерты (формула D-13, категория, подпись, 4 меты About, 2 меты Lab, честный статус, mailto), негативные (нет LinkedIn на /contact), отсутствие SYSTEM DEMO и фикстурных карточек в dist/work (R2 AC); self-test из 7 блоков (good, bad-tone, bad-label, about-label-scope, work-bad, contact-linkedin, no-dist)
- `scripts/check-tokens.mjs`: правило 9 переведено с «0 тегов script» на контракт D-10 — ровно 1 тег суммарно, единственный в `contact/index.html`; правило 7 допускает ровно 0 aria-current на `work/{slug}/index.html` (Pitfall 1); 5 новых фикстур и 4 новых self-test блока; good-фикстуры дополнены contact-страницей с единственным скриптом
- `scripts/check-seo.mjs`: жёсткие константы 5 заменены на `computeExpectedPages(rootDir)` — 5 фиксированных страниц + N записей `src/content/projects` (факт из коллекции, Open Question 1); auditPages/auditSitemap принимают expected параметром; self-test переведён на 7 страниц/url с временной коллекцией из 2 фикстур
- `package.json`: скрипт `"check-tone": "node scripts/check-tone.mjs"`; verify-цепочка НЕ изменена (check-tone добавит план 03-06, когда real-run зелёный)

## Task Commits

Each task was committed atomically:

1. **Task 1: Новый check-tone.mjs — денлист тона + позитивные ассерты + self-test** - `746b264` (feat)
2. **Task 2: check-tokens.mjs — правило 7 (W1 на кейсах) и правило 9 (1 script на /contact)** - `858b53a` (feat)
3. **Task 3: check-seo.mjs — параметризация числа страниц по коллекции projects** - `5863162` (feat)

**Plan metadata:** (commit follows after SUMMARY/STATE/ROADMAP update)

## Files Created/Modified
- `scripts/check-tone.mjs` - НОВЫЙ: DENYLIST (22 записи, R9), INDEX_LABELS + scanIndexLabels() (scope только index.html), REQUIRED_CONTENT (11 позитивных ассертов), FORBIDDEN_CONTENT (LinkedIn), WORK_FORBIDDEN (SYSTEM DEMO/фикстуры), audit(rootDir)/render/runSelfTest по паттерну check-prohibitions
- `scripts/check-tokens.mjs` - Правило 9: подсчёт `<script>` по dist (сумма = 1, только contact/index.html, D-10); правило 7: ветка глубоких страниц `work/{slug}/index.html` с требованием 0 aria-current (Pitfall 1); фикстуры W1_CASE_GOOD/BAD, SCRIPT_CONTACT_GOOD/WORK_BAD/TOTAL_BAD; блоки (e)/(g) обновлены, (j)-(n) добавлены
- `scripts/check-seo.mjs` - computeExpectedPages(rootDir) (5 + N, .md/.mdx без dot-файлов), auditPages/auditSitemap с параметром expected, render с фактическими числами, self-test на 7 страницах/url + проверка computeExpectedPages на временной коллекции из 2 фикстур
- `package.json` - добавлен скрипт `check-tone` (verify-цепочка не тронута)

## Decisions Made
- Денлист тона стартует с 22 stem-записей (Code Example 4 + «эксперт мирового класса»); финальная сверка с контентом — в 03-06, порог не ниже 10 (R9)
- Ярлыки позиционирования вынесены в отдельную группу INDEX_LABELS со scope по dist/index.html — траектория /about с ролью Product Engineer не блокируется (Pitfall 7/A5)
- Правило 9 трактуется как контракт первого клиентского JS: отсутствие скрипта на /contact — нарушение (0 скриптов в текущем dist — ожидаемый red до 03-05)
- check-seo не дублирует границу «5–6 записей» (контракт check-collections), а честно ожидает фактическое число страниц 5 + N

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Good-фикстуры self-test check-tokens не соответствовали новому правилу 9**
- **Found during:** Task 2 (check-tokens rules 7/9)
- **Issue:** после перевода правила 9 на контракт D-10 («ровно 1 `<script>` суммарно») старые хорошие фикстуры без скриптов (good-dist, w1-case) стали давать нарушение «всего тегов <script>: 0, ожидалось 1» — self-test падал 2 сбоями
- **Fix:** в обе фикстуры добавлена dist/contact/index.html с SCRIPT_CONTACT_GOOD (единственный скрипт, W1 с href="/contact") — семантика D-10 соблюдена, ожидание «чисто» восстановлено
- **Files modified:** scripts/check-tokens.mjs
- **Verification:** `node scripts/check-tokens.mjs --self-test` — exit 0
- **Committed in:** 858b53a (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** фикс необходим для соответствия новой семантике правила 9; расширения скоупа нет.

## Issues Encountered
- Реальный прогон check-tone и check-tokens по текущему dist даёт ожидаемый FAIL: контент страниц фазы 3 ещё не написан (03-03…03-06), а copy-скрипт /contact появится в 03-05. Это запланированное поведение (раздел verification плана): проверки станут зелёными по мере наполнения контента; полный `npm run verify` — финальный гейт фазы. `node scripts/check-seo.mjs` (real-run) зелёный уже сейчас.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Контрактные границы фазы покрыты проверками ДО написания контента: страницы кейсов не уронят W1 (Pitfall 1), copy-скрипт /contact не уронит script-правило (Pitfall 2), число страниц 10–11 не разъедется с check-seo (Pitfall 4)
- check-tone готов к добавлению в verify-цепочку в 03-06, когда real-run по наполненному dist станет зелёным
- Ожидаемые точки red в промежуточных планах: check-tone позитивные ассерты до наполнения страниц, script-правило до копирования email на /contact

---
*Phase: 03-kontent-i-stranicy*
*Completed: 2026-08-03*

## Self-Check: PASSED

- Files: scripts/check-tone.mjs, scripts/check-tokens.mjs, scripts/check-seo.mjs, package.json, 03-02-SUMMARY.md — все FOUND
- Commits: 746b264 (Task 1), 858b53a (Task 2), 5863162 (Task 3) — все FOUND
