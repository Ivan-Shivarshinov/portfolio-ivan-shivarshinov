#!/usr/bin/env node
// scripts/check-spike-doc.mjs — проверка R5 (01-VALIDATION.md, Per-Task Verification Map R5):
// docs/stacki-coverage.md покрывает 8 конструкций Astro + 2 краевых случая, каждый с вердиктом
// «проверено» или «ограничение».
//
// CLI:
//   node scripts/check-spike-doc.mjs            — аудит docs/stacki-coverage.md
//   node scripts/check-spike-doc.mjs --self-test — встроенные markdown-фикстуры без сети
//
// Контракт 01-02-PLAN.md Task 2 + формат документа из 01-06-PLAN.md (таблица:
// Конструкция | Как проверить | Вердикт | Наблюдение; строки с вердиктом в ячейке «Вердикт»):
// для каждого пункта ищется строка с ключевым словом конструкции; среди таких строк хотя бы одна
// обязана содержать вердикт «проверено» или «ограничение».
//
// Ключевые слова (контракт для 01-06 при написании документа):
//   Компоненты -> «компонент»; Props -> «props»; Variants -> «variant»; Scoped styles -> «scoped»;
//   CSS-переменные -> «css-переменн»; JSON-коллекции -> «json-коллекц»; Frontmatter -> «frontmatter»;
//   View Transitions -> «view transitions»;
//   edge 1 (scoped style + переменная одновременно) -> «одновременн»;
//   edge 2 (коллекция с 0 записей) -> «0 запис» / «пустая коллекц».
//
// Exit 0 — документ существует, все пункты покрыты и имеют вердикты; exit 1 — иначе.

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOC_PATH = 'docs/stacki-coverage.md';

const ITEMS = [
  { id: 'components', label: 'Компоненты', keywords: ['компонент'] },
  { id: 'props', label: 'Props', keywords: ['props'] },
  { id: 'variants', label: 'Variants', keywords: ['variant'] },
  { id: 'scoped-styles', label: 'Scoped styles', keywords: ['scoped'] },
  { id: 'css-vars', label: 'CSS-переменные', keywords: ['css-переменн', 'css переменн'] },
  { id: 'json-collections', label: 'JSON-коллекции', keywords: ['json-коллекц', 'json коллекц'] },
  { id: 'frontmatter', label: 'Frontmatter', keywords: ['frontmatter'] },
  { id: 'view-transitions', label: 'View Transitions', keywords: ['view transitions'] },
  {
    id: 'edge-scoped-var',
    label: 'Краевой случай: компонент со scoped style и CSS-переменной одновременно',
    keywords: ['одновременн'],
  },
  { id: 'edge-empty-collection', label: 'Краевой случай: коллекция с 0 записей', keywords: ['0 запис', 'пустая коллекц'] },
];

const VERDICT_RE = /проверено|ограничени/i;

/**
 * Аудит документа покрытия. Возвращает список пробелов (пусто = документ полный).
 */
function auditDoc(text) {
  const lines = text.split(/\r?\n/);
  const gaps = [];
  for (const item of ITEMS) {
    const matching = lines.filter((l) => item.keywords.some((k) => l.toLowerCase().includes(k)));
    if (matching.length === 0) {
      gaps.push(`отсутствует пункт: ${item.label}`);
      continue;
    }
    if (!matching.some((l) => VERDICT_RE.test(l))) {
      gaps.push(`нет вердикта «проверено/ограничение»: ${item.label}`);
    }
  }
  return gaps;
}

function render(gaps) {
  if (gaps.length === 0) {
    console.log('check-spike-doc: OK — 8 конструкций + 2 краевых случая покрыты, все вердикты на месте');
    return 0;
  }
  console.error(`check-spike-doc: FAIL — ${gaps.length} пробелов:`);
  for (const g of gaps) console.error(`  - ${g}`);
  return 1;
}

// --- Self-test: встроенные markdown-фикстуры без сети ---

function fullDoc() {
  return `# Stacki Coverage — Astro scaffold

Дата: 2026-08-01 · Версия Stacki: v0.1.3 (flowtricks/stacki-releases)

| Конструкция | Как проверить | Вердикт | Наблюдение |
| --- | --- | --- | --- |
| Компоненты | src/components/Seo.astro | проверено | Компонент читается и редактируется |
| Props | src/components/Seo.astro (title/description) | проверено | Props видны в редакторе |
| Variants | отсутствуют в фазе 1 | ограничение | Variants не представлены в проекте |
| Scoped styles | src/components/*.astro <style> | проверено | Стили изолированы по классам |
| CSS-переменные | src/styles/tokens.css | проверено | Переменные отображаются |
| JSON-коллекции | src/data/services.json | ограничение | JSON виден только в кодовом режиме |
| Frontmatter | src/pages/*.astro | проверено | Frontmatter редактируется |
| View Transitions | src/pages/_spike-vt.astro | проверено | ClientRouter работает |
| scoped style и CSS-переменная одновременно | BaseLayout (nav, var(--color-accent)) | проверено | Scoped-правило видит глобальную переменную |
| коллекция с 0 записей | src/content/notes (0 записей) | проверено | Пустая коллекция открывается без ошибок |

## Ограничения

- JSON-коллекции не имеют визуального редактора (кодовый режим).
`;
}

function runSelfTest() {
  let failures = 0;
  const assert = (cond, msg) => {
    if (!cond) {
      console.error(`  FAIL: ${msg}`);
      failures++;
    }
  };
  const hasGap = (list, needle) => list.some((g) => g.includes(needle));

  // полный документ → pass
  const full = auditDoc(fullDoc());
  assert(full.length === 0, `full: полный документ без пробелов (получено: ${JSON.stringify(full)})`);

  // документ без View Transitions → детект (строка удалена целиком, ключевое слово отсутствует)
  const vtRow = '| View Transitions | src/pages/_spike-vt.astro | проверено | ClientRouter работает |';
  const noVt = auditDoc(fullDoc().replace(vtRow, '| N/A | N/A | N/A | N/A |'));
  assert(hasGap(noVt, 'отсутствует пункт: View Transitions'), 'no-vt: отсутствие View Transitions детектируется');

  // пункт без вердикта → детект
  const noVerdict = auditDoc(
    fullDoc().replace('| View Transitions | src/pages/_spike-vt.astro | проверено | ClientRouter работает |', '| View Transitions | src/pages/_spike-vt.astro |  | ClientRouter работает |')
  );
  assert(hasGap(noVerdict, 'нет вердикта') && hasGap(noVerdict, 'View Transitions'), 'no-verdict: пункт без вердикта детектируется');

  // краевой случай без вердикта → детект
  const edgeNoVerdict = auditDoc(
    fullDoc().replace('| scoped style и CSS-переменная одновременно | BaseLayout (nav, var(--color-accent)) | проверено |', '| scoped style и CSS-переменная одновременно | BaseLayout (nav, var(--color-accent)) |  |')
  );
  assert(hasGap(edgeNoVerdict, 'нет вердикта') && hasGap(edgeNoVerdict, 'scoped style'), 'edge-no-verdict: краевой случай без вердикта детектируется');

  if (failures > 0) {
    console.error(`self-test: ${failures} сбоев логики`);
    return false;
  }
  console.log('self-test: OK — пункты и вердикты классифицируются верно');
  return true;
}

if (process.argv.includes('--self-test')) {
  process.exitCode = runSelfTest() ? 0 : 1;
} else {
  const abs = resolve(ROOT, DOC_PATH);
  if (!existsSync(abs)) {
    console.error(`check-spike-doc: FAIL — ${DOC_PATH} не найден (документ создаётся планом 01-06)`);
    process.exitCode = 1;
  } else {
    try {
      process.exitCode = render(auditDoc(readFileSync(abs, 'utf8')));
    } catch (err) {
      console.error(`check-spike-doc: FAIL — не удалось прочитать ${DOC_PATH}: ${err.message}`);
      process.exitCode = 1;
    }
  }
}
