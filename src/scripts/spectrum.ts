// 「生活型谱」D3 增强：把 SSR 静态条升级为交互 SVG 图谱。
// - 六行 100% 堆叠条 + 0/25/50/75/100 轴；
// - 图例跨行高亮某一生活型（其余压暗）+ 趋势缎带（相邻行同类段以 S 形带相连）；
// - 段 tooltip；进视野时从左生长 + 设左轴读数；resize 重建；reduced-motion 直接终态。
// SSR 兜底始终在 DOM；成功后给 section 加 .is-ready 切到 SVG，失败则回退兜底。
import { select, scaleLinear } from 'd3';
import { SPECTRUM_ROWS, SPECTRUM_COLOR } from '../lib/spectrum';
import { LIFEFORM_ORDER, LIFEFORM_META, type Lifeform } from '../lib/lifeform';

const section = document.querySelector<HTMLElement>('[data-spectrum-section]');
const mount = section?.querySelector<HTMLElement>('[data-spectrum]');
const legend = section?.querySelector<HTMLElement>('[data-legend]');

if (section && mount) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 几何
  const ROW_H = 30;
  const LABEL_H = 22;
  const ROW_GAP = 26;
  const M = { top: 28, right: 14, bottom: 10 };
  const rowStride = LABEL_H + ROW_H + ROW_GAP;
  const HEIGHT = M.top + SPECTRUM_ROWS.length * rowStride - ROW_GAP + M.bottom;

  // 暗色段（隐芽/一年生）的百分比用浅字，其余用深字
  const DARK_SEG = new Set<Lifeform>(['cryptophyte', 'therophyte']);
  const pctInk = (lf: Lifeform) =>
    DARK_SEG.has(lf) ? 'oklch(0.95 0.012 90)' : 'oklch(0.24 0.03 60)';

  interface Seg {
    lf: Lifeform;
    x0: number;
    x1: number;
    v: number;
  }
  interface RowL {
    i: number;
    barTop: number;
    barBottom: number;
    labelBaseline: number;
    segs: Seg[];
  }

  // 可变状态
  let segRects: Array<{
    node: SVGRectElement;
    pct: SVGTextElement | null;
    lf: Lifeform;
    x0: number;
    x1: number;
  }> = [];
  let currentRows: RowL[] = [];
  let activeLf: Lifeform | null = null;
  let hoverLf: Lifeform | null = null;
  let introT = reduce ? 1 : 0;
  let introDone = reduce;
  let introStarted = reduce;

  // tooltip（JS 创建，样式见 Spectrum.astro 的 is:global 块）
  const tip = document.createElement('div');
  tip.className = 'spec-tip';
  tip.setAttribute('aria-hidden', 'true');
  tip.style.opacity = '0';
  section.appendChild(tip);

  const xScale = (width: number) =>
    scaleLinear().domain([0, 100]).range([0, Math.max(10, width - M.right)]);

  function layout(width: number): RowL[] {
    const x = xScale(width);
    return SPECTRUM_ROWS.map((row, i) => {
      const blockTop = M.top + i * rowStride;
      const barTop = blockTop + LABEL_H;
      let acc = 0;
      const segs = LIFEFORM_ORDER.map((lf) => {
        const v = row.values[lf];
        const s: Seg = { lf, x0: x(acc), x1: x(acc + v), v };
        acc += v;
        return s;
      });
      return { i, barTop, barBottom: barTop + ROW_H, labelBaseline: blockTop + 15, segs };
    });
  }

  function ribbonPath(rows: RowL[], lf: Lifeform): string {
    let d = '';
    for (let i = 0; i < rows.length - 1; i++) {
      const a = rows[i].segs.find((s) => s.lf === lf)!;
      const b = rows[i + 1].segs.find((s) => s.lf === lf)!;
      const ay = rows[i].barBottom;
      const by = rows[i + 1].barTop;
      const mid = (ay + by) / 2;
      d +=
        `M${a.x0},${ay} C${a.x0},${mid} ${b.x0},${mid} ${b.x0},${by} ` +
        `L${b.x1},${by} C${b.x1},${mid} ${a.x1},${mid} ${a.x1},${ay} Z `;
    }
    return d;
  }

  function redrawRibbons() {
    const lf = activeLf ?? hoverLf;
    const g = select(mount!).select('.spec-ribbons');
    g.selectAll('*').remove();
    if (!lf || introT < 1) return;
    g.append('path')
      .attr('d', ribbonPath(currentRows, lf))
      .attr('fill', SPECTRUM_COLOR[lf])
      .attr('fill-opacity', 0.24)
      .attr('stroke', SPECTRUM_COLOR[lf])
      .attr('stroke-opacity', 0.42)
      .attr('stroke-width', 1)
      .attr('pointer-events', 'none');
  }

  function applyHighlight() {
    const lf = activeLf ?? hoverLf;
    section!.classList.toggle('has-active', !!lf);
    legend?.querySelectorAll<HTMLElement>('.legend-item').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.lf === lf);
    });
    segRects.forEach((r) => {
      const isLf = r.lf === lf;
      r.node.style.opacity = lf && !isLf ? '0.2' : '1';
      if (r.pct) {
        r.pct.style.opacity = lf ? (isLf ? '1' : '0.2') : introT >= 1 ? '1' : '0';
        r.pct.style.fontWeight = lf && isLf ? '700' : '400';
      }
    });
    redrawRibbons();
  }

  function setHover(lf: Lifeform | null) {
    hoverLf = lf;
    applyHighlight();
  }
  function setActive(lf: Lifeform) {
    activeLf = activeLf === lf ? null : lf;
    applyHighlight();
  }

  function showTip(ev: MouseEvent, rowLabel: string, s: Seg) {
    const meta = LIFEFORM_META[s.lf];
    tip.innerHTML =
      `<b>${meta.zh}</b> <span class="t-en">${meta.en}</span><br>` +
      `<span class="t-row">${rowLabel}</span> · <b class="t-pct">${s.v}%</b>`;
    const r = section!.getBoundingClientRect();
    tip.style.left = `${ev.clientX - r.left}px`;
    tip.style.top = `${ev.clientY - r.top}px`;
    tip.style.opacity = '1';
  }
  const hideTip = () => {
    tip.style.opacity = '0';
  };

  function applyProgress(e: number) {
    introT = e;
    segRects.forEach((r) => {
      r.node.setAttribute('x', String(r.x0 * e));
      r.node.setAttribute('width', String((r.x1 - r.x0) * e));
      if (r.pct) {
        r.pct.setAttribute('x', String(((r.x0 + r.x1) / 2) * e));
        r.pct.style.opacity = e >= 1 ? '1' : String(Math.max(0, (e - 0.7) / 0.3));
      }
    });
  }
  function startGrow() {
    if (introStarted) return;
    introStarted = true;
    const t0 = performance.now();
    const dur = 850;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      applyProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(tick);
      else {
        introDone = true;
        applyHighlight();
      }
    };
    requestAnimationFrame(tick);
  }

  function build() {
    const width = mount!.clientWidth || section!.clientWidth || 720;
    const rows = layout(width);
    currentRows = rows;
    const x = xScale(width);

    select(mount!).selectAll('*').remove();
    const svg = select(mount!)
      .append('svg')
      .attr('width', width)
      .attr('height', HEIGHT)
      .attr('viewBox', `0 0 ${width} ${HEIGHT}`)
      .attr('role', 'img')
      .attr('aria-label', '各气候的生活型谱：百分比堆叠条对照');

    // 轴 0/25/50/75/100
    const axis = svg.append('g').attr('class', 'spec-axis');
    [0, 25, 50, 75, 100].forEach((t) => {
      const gx = x(t);
      axis
        .append('line')
        .attr('x1', gx)
        .attr('x2', gx)
        .attr('y1', M.top - 6)
        .attr('y2', HEIGHT - M.bottom)
        .attr('stroke', 'oklch(1 0 0 / 0.1)');
      axis
        .append('text')
        .attr('x', gx)
        .attr('y', M.top - 12)
        .attr('text-anchor', t === 0 ? 'start' : t === 100 ? 'end' : 'middle')
        .attr('class', 'spec-axis-t')
        .text(t === 100 ? '100%' : String(t));
    });

    svg.append('g').attr('class', 'spec-ribbons');
    const rowsG = svg.append('g').attr('class', 'spec-rows');
    segRects = [];

    rows.forEach((row) => {
      const data = SPECTRUM_ROWS[row.i];
      const g = rowsG.append('g');

      const label = g
        .append('text')
        .attr('x', 0)
        .attr('y', row.labelBaseline)
        .attr('class', 'spec-row-zh')
        .text(data.label);
      label
        .append('tspan')
        .attr('class', 'spec-row-sub')
        .attr('dx', 8)
        .text(data.sub + (data.note ? ' · ' + data.note : ''));

      const clipId = `spec-clip-${row.i}`;
      svg
        .append('clipPath')
        .attr('id', clipId)
        .append('rect')
        .attr('x', 0)
        .attr('y', row.barTop)
        .attr('width', x(100))
        .attr('height', ROW_H)
        .attr('rx', 6);
      const bars = g.append('g').attr('clip-path', `url(#${clipId})`);

      row.segs.forEach((s) => {
        const w0 = s.x1 - s.x0;
        const rect = bars
          .append('rect')
          .attr('x', s.x0)
          .attr('y', row.barTop)
          .attr('width', w0)
          .attr('height', ROW_H)
          .attr('fill', SPECTRUM_COLOR[s.lf])
          .attr('class', 'spec-seg')
          .style('cursor', 'pointer')
          .on('mousemove', (ev: MouseEvent) => showTip(ev, data.label, s))
          .on('mouseenter', () => setHover(s.lf))
          .on('mouseleave', () => {
            hideTip();
            setHover(null);
          });
        bars
          .append('line')
          .attr('x1', s.x1)
          .attr('x2', s.x1)
          .attr('y1', row.barTop)
          .attr('y2', row.barBottom)
          .attr('stroke', 'oklch(0.2 0.02 60 / 0.3)')
          .attr('pointer-events', 'none');
        const pct =
          w0 > 22
            ? bars
                .append('text')
                .attr('x', (s.x0 + s.x1) / 2)
                .attr('y', row.barTop + ROW_H / 2 + 4)
                .attr('text-anchor', 'middle')
                .attr('class', 'spec-pct')
                .attr('fill', pctInk(s.lf))
                .attr('pointer-events', 'none')
                .text(s.v)
            : null;
        segRects.push({
          node: rect.node() as SVGRectElement,
          pct: pct ? (pct.node() as SVGTextElement) : null,
          lf: s.lf,
          x0: s.x0,
          x1: s.x1,
        });
      });
    });

    applyProgress(introDone ? 1 : 0);
    applyHighlight();
  }

  // 图例交互（键盘可聚焦）
  legend?.querySelectorAll<HTMLElement>('.legend-item').forEach((btn) => {
    const lf = btn.dataset.lf as Lifeform | undefined;
    if (!lf) return;
    btn.addEventListener('mouseenter', () => setHover(lf));
    btn.addEventListener('mouseleave', () => setHover(null));
    btn.addEventListener('focus', () => setHover(lf));
    btn.addEventListener('blur', () => setHover(null));
    btn.addEventListener('click', () => setActive(lf));
  });

  // 入场：滚动到视野 → 生长一次 + 设左轴读数
  const readout = document.querySelector<HTMLElement>('[data-axis-readout]');
  new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        startGrow();
        if (readout && section!.dataset.depth) readout.textContent = section!.dataset.depth;
      });
    },
    { threshold: 0.35 }
  ).observe(section);

  // 首次构建（先切 is-ready 再量宽，避免 display:none 宽 0）
  try {
    section.classList.add('is-ready');
    build();
  } catch (e) {
    section.classList.remove('is-ready');
    console.warn('[spectrum] build failed, fallback kept', e);
  }

  // resize 重建（observe 会立即回调一次，无害）
  let rid = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(rid);
    rid = requestAnimationFrame(() => {
      try {
        build();
      } catch (e) {
        console.warn('[spectrum] rebuild failed', e);
      }
    });
  }).observe(mount);
}
