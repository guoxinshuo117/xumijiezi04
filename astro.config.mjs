// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// 部署目标：GitHub Pages。
export default defineConfig({
  site: 'https://guoxinshuo117.github.io',
  base: '/xumijiezi04',
  output: 'static',
  // astro:assets 图片优化默认开启
});
