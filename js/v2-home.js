// 新粗獷主義概念稿：Hero 貼紙可拖曳（桌機版；手機版貼紙改為排列在標題下方）
(() => {
  const stage = document.querySelector('.stage');
  if (!stage) return;
  let top = 10;

  stage.querySelectorAll('.sticker').forEach((el) => {
    let sx, sy, ox, oy;
    // 進場動畫只播一次，之後放開貼紙不再重播
    el.addEventListener('animationend', () => el.classList.add('settled'), { once: true });

    el.addEventListener('pointerdown', (e) => {
      if (getComputedStyle(el).position !== 'absolute') return;   // 手機版不拖曳
      const sr = stage.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      // 先把 % 定位換成 px，之後才能自由拖
      el.style.setProperty('--x', (r.left - sr.left) + 'px');
      el.style.setProperty('--y', (r.top - sr.top) + 'px');
      sx = e.clientX; sy = e.clientY;
      ox = r.left - sr.left; oy = r.top - sr.top;
      el.style.zIndex = ++top;
      el.classList.add('drag', 'settled');
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    el.addEventListener('pointermove', (e) => {
      if (!el.classList.contains('drag')) return;
      const sr = stage.getBoundingClientRect();
      // 允許拖出舞台一點點，但不要跑出畫面太遠
      const x = Math.min(sr.width - 20, Math.max(-sr.left + 8, ox + e.clientX - sx));
      const y = Math.min(sr.height + 120, Math.max(-60, oy + e.clientY - sy));
      el.style.setProperty('--x', x + 'px');
      el.style.setProperty('--y', y + 'px');
    });

    const end = () => el.classList.remove('drag');
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  });
})();
