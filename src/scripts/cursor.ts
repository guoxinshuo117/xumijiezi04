import gsap from 'gsap';

export function initCursor() {
  const dot = document.querySelector('.cursor-dot') as HTMLElement;
  const outline = document.querySelector('.cursor-outline') as HTMLElement;

  if (!dot || !outline) return;

  // 设置初始透明度为0，避免刚进页面时在左上角闪烁
  gsap.set([dot, outline], { opacity: 0 });

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let isVisible = false;

  window.addEventListener('mousemove', (e) => {
    if (!isVisible) {
      gsap.to([dot, outline], { opacity: 1, duration: 0.3 });
      isVisible = true;
    }
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Dot immediately follows
    gsap.set(dot, { x: mouseX, y: mouseY });
  });

  // Outline smoothly follows
  gsap.ticker.add(() => {
    // 阻尼系数，0.1-0.2比较顺滑
    const dt = 1.0 - Math.pow(1.0 - 0.2, gsap.ticker.deltaRatio());
    
    // 获取当前位置
    const currentX = gsap.getProperty(outline, 'x') as number || mouseX;
    const currentY = gsap.getProperty(outline, 'y') as number || mouseY;

    gsap.set(outline, {
      x: currentX + (mouseX - currentX) * dt,
      y: currentY + (mouseY - currentY) * dt,
    });
  });

  // 鼠标移出屏幕
  document.addEventListener('mouseleave', () => {
    gsap.to([dot, outline], { opacity: 0, duration: 0.3 });
    isVisible = false;
  });

  document.addEventListener('mouseenter', () => {
    gsap.to([dot, outline], { opacity: 1, duration: 0.3 });
    isVisible = true;
  });

  // 处理磁性或可点击元素
  const links = document.querySelectorAll('a, button, [data-magnetic]');
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      outline.classList.add('is-hovering');
    });
    link.addEventListener('mouseleave', () => {
      outline.classList.remove('is-hovering');
    });
  });
}
