// 「下潜」滚动引擎：Lenis 平滑滚动 + GSAP ScrollTrigger。
// 职责：左轴下沉填充 + 滑块下沉 + 活跃刻度/读数 + 卡片揭示 + Hero/装饰视差。
// 全程尊重 prefers-reduced-motion（降级为静态可读，揭示全开）。
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function revealAll() {
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    el.style.opacity = '1';
  });
}

if (reduce) {
  // 降级：不平滑滚动、不动效；内容直接可见；背景用 CSS 连续渐变随滚动联动（无自动动画）。
  revealAll();
  const onScroll = () => {
    // 降级模式不使用复杂视差
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
} else {
  gsap.registerPlugin(ScrollTrigger);

  // —— Lenis 平滑滚动，桥接 GSAP ——
  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    wheelMultiplier: 1,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const rail = document.querySelector<HTMLElement>('.rail');
  const marker = document.querySelector<HTMLElement>('[data-axis-marker]');
  const readout = document.querySelector<HTMLElement>('[data-axis-readout]');
  const axis = document.querySelector<HTMLElement>('.axis');

  // —— 全局下潜进度 → 轨道填充 + 滑块下沉 + 深区文字反相 ——
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const p = self.progress;
      rail?.style.setProperty('--progress', String(p));
      marker?.style.setProperty('--frac', String(0.03 + p * 0.94));
      axis?.classList.toggle('is-deep', p > 0.5);
    },
  });

  // —— 每区：活跃刻度高亮 + 左轴读数 + 背景渐变切换 ——
  const bgLayers = document.querySelectorAll<HTMLElement>('.landscape-layer');

  gsap.utils.toArray<HTMLElement>('.zone').forEach((zone) => {
    const lf = zone.dataset.zone ?? '';
    const depth = zone.dataset.depth ?? '';
    const tick = document.querySelector<HTMLElement>(`[data-tick="${lf}"]`);
    const bgLayer = document.querySelector<HTMLElement>(`[data-bg-layer="${lf}"]`);

    ScrollTrigger.create({
      trigger: zone,
      start: 'top 60%',
      end: 'bottom 40%',
      onToggle: (self) => {
        tick?.classList.toggle('is-active', self.isActive);
        if (self.isActive) {
          if (readout && depth) readout.textContent = depth;
          // 切换对应背景图层
          bgLayers.forEach((layer) => {
            layer.style.opacity = layer === bgLayer ? '1' : '0';
            layer.style.transform = layer === bgLayer ? 'scale(1)' : 'scale(1.05)';
          });
        }
      },
    });
  });

  // —— 卡片 / 文字揭示（错峰 fade + 上移） ——
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
  });

  // —— Hero 视差：标题随离场轻微上移淡出 ——
  const hero = document.querySelector('.hero');
  const heroTitle = document.querySelector('.hero-title');
  if (hero && heroTitle) {
    gsap.to(heroTitle, {
      yPercent: 16,
      autoAlpha: 0.15,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  // —— 装饰元素轻视差（每区/Hero 的 data-parallax 层） ——
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const host = el.closest('section, header') ?? el;
    gsap.to(el, {
      yPercent: 14,
      ease: 'none',
      scrollTrigger: {
        trigger: host,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  // —— 穿地节点：地平线在视口中线时一次性强调 ——
  const horizon = document.querySelector('.crossing .horizon');
  if (horizon) {
    gsap.fromTo(
      horizon,
      { filter: 'brightness(1)' },
      {
        filter: 'brightness(1.18)',
        ease: 'none',
        scrollTrigger: {
          trigger: '.crossing',
          start: 'top center',
          end: 'center center',
          scrub: true,
        },
      }
    );
  }

  // 图片懒加载完成后刷新触发点位置
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
