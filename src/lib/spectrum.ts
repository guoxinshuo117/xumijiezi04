// 生活型谱（Raunkiær life-form spectrum）数据与配色。
// 一地植物在五型中的百分比构成，与全球「正常谱」对照即可读出气候特征：
// 热带雨林＝高位芽气候、苔原/高山＝地面芽气候、荒漠＝一年生气候。
// 这是本站「深度＝芽位＝策略」的统计学收束。
//
// 注：数值为示意——据 Raunkiær (1934) 及植物地理学经典整理，待按引文核实
// （与全站占位内容同口径）。各行合计 100。SSR 与客户端共享本模块。
import { LIFEFORM_ORDER, LIFEFORM_META, type Lifeform } from './lifeform';

export interface SpectrumRow {
  key: string; // 唯一 id
  label: string; // 谱名（中文）
  sub: string; // 气候/性质副标
  note?: string; // 备注（如占位说明）
  placeholder?: boolean; // 是否本站占位行
  values: Record<Lifeform, number>; // 五型百分比，合计 100
}

export const SPECTRUM_ROWS: SpectrumRow[] = [
  {
    key: 'tropical',
    label: '热带雨林',
    sub: '高位芽气候',
    values: { phanerophyte: 80, chamaephyte: 5, hemicryptophyte: 8, cryptophyte: 4, therophyte: 3 },
  },
  {
    key: 'normal',
    label: 'Raunkiær 正常谱',
    sub: '全球参照',
    values: { phanerophyte: 46, chamaephyte: 9, hemicryptophyte: 26, cryptophyte: 6, therophyte: 13 },
  },
  {
    key: 'temperate',
    label: '温带落叶林',
    sub: '地面芽偏多',
    values: { phanerophyte: 34, chamaephyte: 8, hemicryptophyte: 38, cryptophyte: 14, therophyte: 6 },
  },
  {
    key: 'tundra',
    label: '北极苔原 · 高山',
    sub: '地面 / 地上芽气候',
    values: { phanerophyte: 1, chamaephyte: 22, hemicryptophyte: 60, cryptophyte: 12, therophyte: 5 },
  },
  {
    key: 'desert',
    label: '荒漠 · 地中海',
    sub: '一年生气候',
    values: { phanerophyte: 9, chamaephyte: 13, hemicryptophyte: 20, cryptophyte: 8, therophyte: 50 },
  },
  {
    key: 'site',
    label: '本站收录',
    sub: '15 株 · 占位均匀',
    note: '待换本地样地实测',
    placeholder: true,
    values: { phanerophyte: 20, chamaephyte: 20, hemicryptophyte: 20, cryptophyte: 20, therophyte: 20 },
  },
];

// 堆叠条段色：绿→褐（冠层→种子），低彩度。
// 纪律：唯一高彩度春绿 --bud 仍只给「芽」，绝不入此处的类目色。
export const SPECTRUM_COLOR: Record<Lifeform, string> = {
  phanerophyte: 'oklch(0.72 0.07 150)',
  chamaephyte: 'oklch(0.78 0.075 130)',
  hemicryptophyte: 'oklch(0.76 0.08 95)',
  cryptophyte: 'oklch(0.58 0.06 65)',
  therophyte: 'oklch(0.45 0.05 55)',
};

// 五型类目（按 Raunkiær 顺序）：标签复用 LIFEFORM_META，配色取上表。
export const SPECTRUM_CLASSES = LIFEFORM_ORDER.map((lf) => ({
  lf,
  zh: LIFEFORM_META[lf].zh,
  en: LIFEFORM_META[lf].en,
  color: SPECTRUM_COLOR[lf],
}));
