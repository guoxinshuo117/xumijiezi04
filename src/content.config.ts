// 内容集合（Astro Content Layer API）。
// 每株植物 = 一个带 frontmatter 的 .md，受 Zod schema 约束。
// 加一株植物 = 新增一个文件；字段类型不对 → 构建直接报错；照片自动优化。

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { LIFEFORM_ORDER } from './lib/lifeform';

// 五型 Raunkiær 分类（已补全标准的「地上芽 chamaephyte」）。
const lifeform = z.enum(LIFEFORM_ORDER);

const plants = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/plants' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(), // 中文名，如「香樟」
      latin: z.string(), // 拉丁学名，如 Cinnamomum camphora
      family: z.string(), // 科，如「樟科」
      lifeform, // 五型之一
      budHeight: z.string(), // 芽位文案：">25cm" / "0–25cm" / "贴地表" / "地下" / "种子"
      budPos: z.number(), // 芽位（cm，地表=0，正上负下），用于数据读数
      height: z.string(), // 株高
      stem: z.string(), // 茎质地
      light: z.string(), // 光照需求
      soil: z.string(), // 土壤偏好
      companions: z.array(z.string()), // 伴生物种
      distribution: z.string(), // 分布
      layer: z.string(), // 群落层次
      phenology: z.string(), // 物候
      photos: z.array(image()).default([]), // 实拍照片（自动优化）；未到位时为空 → 占位框
      order: z.number(), // 同型内排序
    }),
});

export const collections = { plants };
