// eslint.config.mjs — flat config (D-10): ESLint + eslint-plugin-astro + @typescript-eslint/parser
import eslintPluginAstro from 'eslint-plugin-astro';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.astro'],
    languageOptions: { parser: tsParser, parserOptions: { extraFileExtensions: ['.astro'] } },
  },
  ...eslintPluginAstro.configs.recommended,
  { ignores: ['dist/', 'node_modules/', '.astro/'] },
];
