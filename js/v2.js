// 新粗獷主義版：全站共用互動（語言切換、作品彈窗、閒置提示、回到頂部、數字跳動、經歷展開）
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 無痕模式等情況略過 */ } }
  };

  // ── 語言切換（繁中 / EN）──
  function applyLang(lang) {
    const en = lang === 'en';
    document.documentElement.lang = en ? 'en' : 'zh-Hant';
    $$('[data-zh]').forEach((el) => { el.innerHTML = en ? (el.dataset.en || el.dataset.zh) : el.dataset.zh; });
    $$('[data-lang]').forEach((s) => s.classList.toggle('on', s.dataset.lang === lang));
    store.set('lang', lang);
  }
  $$('[data-lang]').forEach((s) => {
    s.addEventListener('click', () => applyLang(s.dataset.lang));
    s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); applyLang(s.dataset.lang); } });
  });
  if (store.get('lang') === 'en') applyLang('en');
  const isEn = () => document.documentElement.lang === 'en';

  // ── 回到頂部 ──
  const goTop = $('#go-top');
  if (goTop) {
    addEventListener('scroll', () => goTop.classList.toggle('show', scrollY > 400), { passive: true });
    goTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ── 數字跳動（成效區）──
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((list) => {
      list.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
        const t0 = performance.now(), dur = 1100;
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('en-US') + suf;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: .6 });
    counters.forEach((el) => io.observe(el));
  }

  // ── 彈窗共用 ──
  const openModals = () => $$('.modal.open');
  const syncScroll = () => { document.body.style.overflow = openModals().length ? 'hidden' : ''; };

  // ── Works 作品彈窗 ──
  const lb = $('#lbBackdrop');
  if (lb) {
    const pick = (d, k) => (isEn() && d[k + 'En']) ? d[k + 'En'] : (d[k] || '');
    const close = () => { lb.classList.remove('open'); syncScroll(); if (lb._from) lb._from.focus(); };
    $$('.work[data-title]').forEach((card) => {
      card.addEventListener('click', () => {
        const d = card.dataset;
        $('#lbCover').src = d.image || '';
        const tags = $('#lbTags'); tags.innerHTML = '';
        pick(d, 'tags').split(',').forEach((t) => { if (!t.trim()) return; const s = document.createElement('span'); s.textContent = t.trim(); tags.appendChild(s); });
        $('#lbTitle').textContent = pick(d, 'title');
        $('#lbSub').textContent = pick(d, 'subtitle');
        $('#lbRole').textContent = d.role || '';
        $('#lbExec').textContent = pick(d, 'exec');
        $('#lbMetrics').textContent = pick(d, 'metrics');
        $('#lbDesc').textContent = pick(d, 'desc');
        const link = d.link || '';
        $('#lbLinkSec').style.display = link ? '' : 'none';
        const a = $('#lbLink'); a.href = link || '#'; a.textContent = link;
        lb._from = card;
        lb.classList.add('open'); syncScroll();
        $('#lbClose').focus({ preventScroll: true });
        if (typeof gtag === 'function') gtag('event', 'lightbox_open', { work_title: pick(d, 'title') });
      });
    });
    $('#lbClose').addEventListener('click', close);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = $$('a[href], button', lb).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
  }

  // ── 閒置提示（無互動滿 3 分鐘、5 分鐘各跳一次）──
  // GA4 事件：idle_prompt，參數 idle_stage（秒數：180 / 300）、button（view / ok / dismiss / backdrop）
  (() => {
    const STAGES = [
      { sec: 180, zh: '在AI驅動的時代\n每180秒就有3分鐘會過去', en: 'In the age of AI,\nevery 180 seconds, 3 minutes pass by.' },
      { sec: 300, zh: '朋友，五分鐘過去了\n你還在煩惱什麼呢？', en: "Hey friend, 5 minutes have passed.\nWhat's still on your mind?" }
    ];
    const wrap = document.createElement('div');
    wrap.className = 'modal'; wrap.id = 'idleBackdrop';
    wrap.innerHTML = `<div class="idle-box" role="dialog" aria-modal="true">
      <img src="${document.body.dataset.root ?? '../'}assets/images/idle-waiting.webp" alt="waiting">
      <div class="idle-content"><p class="idle-title" id="idleTitle"></p>
        <div class="idle-btns"><button class="btn btn-ink" id="idleOk">OK 👍</button><button class="btn" id="idleNo"></button></div></div></div>`;
    document.body.appendChild(wrap);
    const title = $('#idleTitle', wrap), no = $('#idleNo', wrap);
    let elapsed = 0, timer = null, stage = null;
    const text = (s) => (isEn() ? s.en : s.zh);
    const ga = (b) => { if (typeof gtag === 'function' && stage) gtag('event', 'idle_prompt', { idle_stage: stage.sec, button: b }); };
    const reset = () => { elapsed = 0; clearInterval(timer); start(); };
    const hide = (b) => { if (!wrap.classList.contains('open')) return; wrap.classList.remove('open'); syncScroll(); ga(b); reset(); };
    function start() {
      timer = setInterval(() => {
        elapsed++;
        const s = STAGES.find((x) => x.sec === elapsed);
        if (!s) return;
        stage = s; no.textContent = isEn() ? 'Mind your own business' : '管好你自己';
        if (wrap.classList.contains('open')) { title.style.opacity = 0; setTimeout(() => { title.textContent = text(s); title.style.opacity = 1; }, 350); }
        else { title.textContent = text(s); wrap.classList.add('open'); syncScroll(); }
        ga('view');
      }, 1000);
    }
    ['scroll', 'click', 'keypress', 'mousemove', 'touchstart'].forEach((ev) => document.addEventListener(ev, () => { if (!wrap.classList.contains('open')) reset(); }, { passive: true }));
    $('#idleOk', wrap).addEventListener('click', (e) => { e.stopPropagation(); hide('ok'); });
    no.addEventListener('click', (e) => { e.stopPropagation(); hide('dismiss'); });
    wrap.addEventListener('click', (e) => { if (e.target === wrap) hide('backdrop'); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && wrap.classList.contains('open')) hide('dismiss'); });
    start();
  })();

  // ── About：展開行銷經歷 ──
  const btn = $('#expBtn'), hidden = $('#expHidden');
  if (btn && hidden) btn.addEventListener('click', () => {
    const open = hidden.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.style.display = open ? 'none' : '';
  });
})();
