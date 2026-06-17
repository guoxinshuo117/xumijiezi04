// 五型 Raunkiær 生活型的共享元数据。
// 纵轴 / 类型段 / 植物卡共用，保证「芽位 → 视觉位置」全站一致。
//
// axisFrac：在土壤剖面上的纵向位置，0 = 最底（种子库），1 = 冠层顶。
// 地面线（0cm 地表）固定在 0.5。

export const LIFEFORM_ORDER = [
  'phanerophyte',
  'chamaephyte',
  'hemicryptophyte',
  'cryptophyte',
  'therophyte',
] as const;

export type Lifeform = (typeof LIFEFORM_ORDER)[number];

export interface LifeformMeta {
  zh: string; // 中文名
  en: string; // 学名（属名）
  budRange: string; // 芽位区间（文案）
  blurb: string; // 一句策略概述
  axisFrac: number; // 纵轴位置 0–1
  tint: string; // 照片占位色块色（低彩度大地色，沿剖面深度，≠ 芽绿）
  depthLabel: string; // 左轴深度核读数（近似深度 / 位置）

  // —— 沉浸式「下潜」场景配色（每型一个空气感场景）——
  // 地上区走绿（明亮、有光），穿过 0cm 后转入土壤暖褐（变暗、内敛）。
  // 低彩度雾感色，与高彩度芽绿 --bud 拉开；纪律：唯一春绿仍只给芽。
  sceneBg: string; // 场景主色（区背景顶部）
  sceneDeep: string; // 场景深色（区背景底部 / 过渡到下一区）
  sceneInk: string; // 该场景上的文字基调（区头 / 装饰）
  dark: boolean; // 该区是否为暗场景（地下，用浅色文字）
}

export const LIFEFORM_META: Record<Lifeform, LifeformMeta> = {
  phanerophyte: {
    zh: '高位芽',
    en: 'Phanerophyte',
    budRange: '芽位 > 25 cm',
    blurb: '把更新芽高举过 25 cm、直入冠层——以木质主干和层层芽鳞的双重投资，换取对光的垄断。',
    axisFrac: 0.9,
    tint: 'oklch(0.7 0.05 150)',
    depthLabel: '冠层 · 离地数米',
    sceneBg: 'oklch(0.945 0.025 152)',
    sceneDeep: 'oklch(0.9 0.04 150)',
    sceneInk: 'oklch(0.34 0.06 155)',
    dark: false,
  },
  chamaephyte: {
    zh: '地上芽',
    en: 'Chamaephyte',
    budRange: '芽位 0–25 cm',
    blurb: '把芽压到近地 0–25 cm 的暖层，借地表辐射与常绿株丛，以低姿态熬过寒冬。',
    axisFrac: 0.66,
    tint: 'oklch(0.74 0.04 135)',
    depthLabel: '近地 · 0–25 cm',
    sceneBg: 'oklch(0.925 0.042 142)',
    sceneDeep: 'oklch(0.87 0.055 132)',
    sceneInk: 'oklch(0.32 0.06 148)',
    dark: false,
  },
  hemicryptophyte: {
    zh: '地面芽',
    en: 'Hemicryptophyte',
    budRange: '芽位贴地表',
    blurb: '把芽收回地表那一线，藏进枯叶与叶基之间——失了地上部，也失不掉来年的芽。',
    axisFrac: 0.5,
    tint: 'oklch(0.72 0.05 75)',
    depthLabel: '地表 · 0 cm',
    sceneBg: 'oklch(0.9 0.052 118)',
    sceneDeep: 'oklch(0.8 0.06 98)',
    sceneInk: 'oklch(0.33 0.05 92)',
    dark: false,
  },
  cryptophyte: {
    zh: '隐芽',
    en: 'Cryptophyte',
    budRange: '芽位埋于地下',
    blurb: '把芽埋进土里，让大地的热惯性代为御寒抗旱，待时再从地下萌发。',
    axisFrac: 0.3,
    tint: 'oklch(0.6 0.05 60)',
    depthLabel: '地下 · −5～−15 cm',
    sceneBg: 'oklch(0.56 0.058 68)',
    sceneDeep: 'oklch(0.44 0.05 60)',
    sceneInk: 'oklch(0.96 0.018 82)',
    dark: true,
  },
  therophyte: {
    zh: '一年生',
    en: 'Therophyte',
    budRange: '以种子越冬',
    blurb: '索性放弃整株，把全部赌注压进种子，以「种子越冬」赌过无常的坏年景。',
    axisFrac: 0.12,
    tint: 'oklch(0.7 0.05 70)',
    depthLabel: '种子库 · 最深处',
    sceneBg: 'oklch(0.4 0.05 64)',
    sceneDeep: 'oklch(0.29 0.04 58)',
    sceneInk: 'oklch(0.95 0.018 82)',
    dark: true,
  },
};

/** 按 Raunkiær 顺序返回某型的序号（0–4），用于排序与刻度。 */
export function lifeformIndex(lf: Lifeform): number {
  return LIFEFORM_ORDER.indexOf(lf);
}
