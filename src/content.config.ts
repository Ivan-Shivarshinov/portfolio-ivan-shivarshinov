// src/content.config.ts — контентный слой фазы (SPEC R3): единый источник
// типов и валидации коллекций. Pattern 1 (01-RESEARCH.md lines 229-260):
// MDX/MD через glob(), JSON из src/data/, z из astro/zod (Zod 4).
// Валидация при сборке: невалидная запись, дубликат slug и дубликат id
// падают сборку; пустые коллекции проходят.
//
// Отклонение от RESEARCH A5 (зафиксировано при выполнении плана): в Astro
// 7.1.6 дефолтные glob()/file() при дубликате id/slug только предупреждают
// (logger.warn + перезапись записи), сборка НЕ падает. Чтобы выполнялся
// AC R3 «сборка падает при дубликате», используются строгие обёртки:
// generateId для glob() (projects) и собственный JSON-лоадер вместо file().
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import type { Loader, LoaderContext } from 'astro/loaders';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';

interface GlobIdOptions {
  /** Путь к файлу записи, относительный базовой директории */
  entry: string;
  /** URL базовой директории */
  base: URL;
  /** Сырые (невалидированные) данные frontmatter записи */
  data: Record<string, unknown>;
}

/** Slug из пути файла — fallback, повторяющий дефолтную генерацию Astro
 * (github-slugger): сегменты пути без расширения, в нижнем регистре. */
function slugFromPath(entry: string): string {
  return entry
    .split('/')
    .map((segment) => segment.replace(/\.[^.]*$/, '').replace(/index$/, ''))
    .map((segment) =>
      segment
        .toLowerCase()
        .replace(/[^a-z0-9а-яё_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    )
    .join('/')
    .replace(/\/index$/, '');
}

/**
 * Строгий generateId для glob(): дубликат slug (frontmatter) между файлами —
 * ошибка сборки. Дефолтный glob() в Astro 7 при дубликате только
 * предупреждает и перезаписывает запись — это противоречит AC R3.
 * Id повторяет дефолт: data.slug, либо slug из пути файла (fallback —
 * файлы без slug всё равно падают по zod-схеме, где slug обязателен).
 * Повторная генерация для ТОГО ЖЕ файла (dev-watcher) не считается
 * дубликатом.
 */
function strictProjectId() {
  const seen = new Map<string, string>(); // id -> относительный путь файла
  return ({ entry, data }: GlobIdOptions): string => {
    const id = typeof data.slug === 'string' && data.slug.length > 0 ? data.slug : slugFromPath(entry);
    const prev = seen.get(id);
    if (prev && prev !== entry) {
      throw new Error(
        `Duplicate slug "${id}" in "${prev}" and "${entry}": slugs must be unique within the projects collection.`
      );
    }
    seen.set(id, entry);
    return id;
  };
}

/**
 * Строгий JSON-лоадер для src/data/*.json: отсутствие id или дубликат id —
 * ошибка сборки (AC R3 «сборка падает при дубликате»). file() из
 * astro/loaders в Astro 7 при дубликате только предупреждает и
 * перезаписывает запись. Поведение повторяет file(): валидация схемы через
 * parseData, пересинк по watch в dev.
 */
function strictJsonLoader(fileName: string): Loader {
  const syncData = async (context: LoaderContext) => {
    const { config, logger, parseData, store } = context;
    const url = new URL(fileName, config.root);
    if (!existsSync(url)) {
      logger.error(`File not found: ${fileName}`);
      return;
    }
    const filePath = fileURLToPath(url);
    const contents = await readFile(filePath, 'utf-8');
    const data: unknown = JSON.parse(contents);
    if (!Array.isArray(data)) {
      throw new Error(`Invalid data in ${fileName}: must be an array of entries with unique ids.`);
    }
    const ids = new Set<string>();
    for (const item of data) {
      const id = (item as { id?: unknown }).id;
      if (typeof id !== 'string' || id.length === 0) {
        throw new Error(`Item in ${fileName} is missing an "id" field (string required).`);
      }
      if (ids.has(id)) {
        throw new Error(`Duplicate id "${id}" found in ${fileName}: ids must be unique.`);
      }
      ids.add(id);
    }
    for (const item of data) {
      const record = item as { id: string };
      const parsed = await parseData({ id: record.id, data: item, filePath });
      store.set({ id: record.id, data: parsed, filePath: fileName });
    }
  };
  return {
    name: 'strict-json-loader',
    async load(context: LoaderContext) {
      const { config, watcher } = context;
      const filePath = fileURLToPath(new URL(fileName, config.root));
      await syncData(context);
      watcher?.add(filePath);
      watcher?.on('change', (changedPath) => {
        if (changedPath === filePath) {
          context.logger.info(`Reloading data from ${fileName}`);
          syncData(context);
        }
      });
    },
  };
}

const projects = defineCollection({
  // Кейсы: метаданные в frontmatter, четыре вопроса (проблема → ответственность →
  // решение → результат) — в MDX-теле (D-05). 0 записей до фазы 3.
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
    // Детерминированная сортировка при равных датах (D-09)
    order: z.number().int().default(0),
    // Задел на EN (D-08): поля локали необязательны
    titleEn: z.string().optional(),
  }),
});

const notes = defineCollection({
  // 0 записей намеренно — edge «пустые коллекции проходят сборку» (D-07)
  loader: glob({ base: './src/content/notes', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
  }),
});

const services = defineCollection({
  // JSON из src/data (D-02); строгий лоадер: дубликат id — ошибка сборки
  loader: strictJsonLoader('./src/data/services.json'),
  schema: z.object({ id: z.string(), title: z.string(), description: z.string() }),
});

const skills = defineCollection({
  loader: strictJsonLoader('./src/data/skills.json'),
  schema: z.object({ id: z.string(), title: z.string(), description: z.string() }),
});

const tools = defineCollection({
  loader: strictJsonLoader('./src/data/tools.json'),
  schema: z.object({ id: z.string(), title: z.string(), description: z.string() }),
});

export const collections = { projects, notes, services, skills, tools };
