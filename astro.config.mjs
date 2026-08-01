// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Черновой URL до деплоя (фаза 6) — решение 01-01 T2; обязателен для sitemap и canonical/og:url (Pitfall 4)
  site: 'https://portfolio.example.com',
  integrations: [mdx(), sitemap()],
});
