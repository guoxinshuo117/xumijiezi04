# 生活型剖面 · Raunkiær Life-form Profile

把土壤剖面立起来读：**深度，就是芽位**。向下滚动，沿 Raunkiær 更新芽高度轴下潜——从高举入空的乔木，到埋在土里的根状茎，再到只剩种子越冬的一年生草。

一个内容驱动的植物生活型导览站。**简约是设计决定，重型是工程决定**——丰富度来自数据建模、排版精度与（后续）动效精度，而非视觉堆料。

---

## 技术栈

| 角色 | 选型 |
|---|---|
| 框架 | **Astro 6**（内容驱动、默认零 JS、岛屿架构） |
| 语言 | **TypeScript (Strict)** |
| 内容 | **Content Layer + Zod schema**（每株植物一个 `.md`，类型受校验） |
| 字体 | 自托管 **Noto Serif/Sans SC**（按 `unicode-range` 自动分包）+ **Fraunces** 变体 + **IBM Plex Mono** |
| 图片 | **astro:assets**（sharp：WebP/AVIF + `srcset` + 懒加载） |
| 部署 | **Vercel**（静态，根路径） |

> 平滑滚动（Lenis）与滚动动效（GSAP ScrollTrigger）已装依赖，将在 P4 阶段接入；当前为**无动效静态版**，DOM 已预埋 `data-axis-marker / data-plant-id / data-bud-pos / data-crossing` 锚点。

## 设计系统

- **配色纪律**：全场低彩度大地色（土壤剖面深度渐变），**唯一高彩度春绿 `--bud` 只给「芽」**——把视线精确引导到再生芽位。色彩用 OKLCH 管理（`src/styles/tokens.css`）。
- **排版**：Fraunces 启用光学尺寸 `opsz` 与旧式数字；中文 Noto Serif SC 微调字距行高；8pt 间距栅格。
- 设计系统验收页：`/styleguide`。

## 数据模型（五型 Raunkiær）

`src/content/plants/*.md`，frontmatter 受 `src/content.config.ts` 的 Zod schema 约束。生活型为标准五型：

`phanerophyte` 高位芽 · `chamaephyte` 地上芽 · `hemicryptophyte` 地面芽 · `cryptophyte` 隐芽 · `therophyte` 一年生

**加一株植物 = 新增一个 `.md` 文件**；字段类型不对 → 构建直接报错；照片放入并引用后自动优化。五型的共享元数据（标签、芽位区间、纵轴位置）集中在 `src/lib/lifeform.ts`。

> **占位说明（预览阶段）**：当前每型 3 株共 15 株，frontmatter 内容与"全株"配图均为**临时占位**——文字数据据植物学概述填写、标注「待核实」，配图取自 **Wikimedia Commons**（CC/PD），仅作版式与配色评估之用，后续将整体替换为实拍照片与实测数据。每株仅"全株"位有图，"中景/特写"位按生活型显示**大地色占位色块**（色值见 `src/lib/lifeform.ts` 的 `tint`，沿土壤剖面深度分色，绝不动唯一的春绿 `--bud`）。

## 目录结构

```
src/
├─ content.config.ts        # Zod schema（五型）
├─ content/plants/*.md       # 每株一个文件
├─ lib/lifeform.ts           # 五型共享元数据
├─ components/               # Hero / ProfileAxis / TypeBand / PlantCard / Crossing / PhotoFrame
├─ layouts/Base.astro        # 字体 + 设计系统加载
├─ styles/{tokens,global}.css
└─ pages/{index,styleguide}.astro
```

## 终端命令

```bash
pnpm install     # 安装依赖
pnpm dev         # 本地热更新预览（默认 http://localhost:4321）
pnpm build       # 构建到 ./dist/
pnpm preview     # 本地预览构建产物
```

## 部署（Vercel）

1. 推送到 GitHub 仓库。
2. Vercel 导入仓库——自动识别 Astro，`pnpm build` 产出 `dist/` 并发布，根路径部署、自动 HTTPS。
3. 部署后把真实域名回填到 `astro.config.mjs` 的 `site`（用于 sitemap / canonical）。

## 进度（路线图）

- [x] **P0** 脚手架：Astro + TS + 依赖 + Git
- [x] **P1** 设计系统：设计令牌 + 自托管中文字体子集化 + 全局样式
- [x] **P2** 数据层：五型 Zod schema + 5 株代表植物
- [x] **P3** 静态版式：双栏栅格（根治轴线压字）+ 组件 + 组装
- [x] **P3.5** 预览充实：扩到每型 3 株（15 株）+ 占位图 + 色块占位
- [x] **P4** 沉浸式下潜：五区场景配色旅程 + Lenis 平滑滚动 + GSAP 下沉左轴「深度核」/ 揭示 / 穿地反转；高反差编辑字体；全屏版式
- [x] **P4.5** 活体背景：固定全屏 WebGL2 连续色带（OKLab，根治「分区拼接缝」）+ 自适应磨砂玻璃卡
- [x] **P4.6** 背景重做「晨光下潜」：真实天空蓝→明亮地平线→暖金→赭土→深土→种子库的清晰色彩叙事（随深度明确变色）+ 可见暖阳/体积光束/呼吸芽辉 + 卡片明显通透
- [x] **生活型谱**：D3 交互式五型谱终章（五气候对照 + 图例跨行高亮 + 趋势缎带）
- [ ] **P5** 图片：补拍 / 替换占位图 + 全部照片进 astro:assets 管线
- [ ] **P6** 打磨：无障碍 / 性能 / 打印 / 响应式细修（Lighthouse ≥ 95）
- [ ] **P7** 部署：上线公开链接

> 分类依 C. Raunkiær (1934) 更新芽高度系统五型。
