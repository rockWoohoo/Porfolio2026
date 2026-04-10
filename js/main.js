// Rock Wu 作品集 — 互動邏輯

// ── Page Loader ───────────────────────────────
(function() {
  const loader = document.createElement('div');
  loader.id = 'page-loader';
  loader.innerHTML = `
    <div class="loader-orb loader-orb-1"></div>
    <div class="loader-orb loader-orb-2"></div>
    <div class="loader-orb loader-orb-3"></div>
  `;
  document.documentElement.appendChild(loader);

  const MIN_DISPLAY = 800; // 最短顯示時間（ms）
  const startTime = Date.now();

  window.addEventListener('load', () => {
    const elapsed = Date.now() - startTime;
    const delay = Math.max(0, MIN_DISPLAY - elapsed);
    setTimeout(() => {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 400);
    }, delay);
  });
})();

// ── 背景光暈滑鼠視差 ─────────────────────────
const orbsContainer = document.querySelector('.gradient-orbs');
if (orbsContainer) {
  let targetX = 0, targetY = 0;
  let curX = 0, curY = 0;

  document.addEventListener('mousemove', e => {
    targetX = (e.clientX - window.innerWidth  / 2) * 0.045;
    targetY = (e.clientY - window.innerHeight / 2) * 0.035;
  });

  (function tick() {
    curX += (targetX - curX) * 0.055;
    curY += (targetY - curY) * 0.055;
    orbsContainer.style.transform =
      `translate(${curX.toFixed(2)}px, ${curY.toFixed(2)}px)`;
    requestAnimationFrame(tick);
  })();
}

// ── Header 滾動透明度 + 手機下滑收合 ──────────
const headerEl = document.querySelector('header');
if (headerEl) {
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    headerEl.classList.toggle('scrolled', currentY > 0);

    // 僅手機（寬度 ≤ 600px）才做收合
    if (window.innerWidth <= 600) {
      if (currentY > lastScrollY && currentY > 60) {
        // 下滑 → 收合
        headerEl.classList.add('header-hidden');
      } else {
        // 上滑 → 展開
        headerEl.classList.remove('header-hidden');
      }
    } else {
      headerEl.classList.remove('header-hidden');
    }

    lastScrollY = currentY;
  }, { passive: true });
}

// ── Header Nav 當前錨點 active indicator ────────
const navLinks = document.querySelectorAll('.header-nav a[href^="#"]');
if (navLinks.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  navLinks.forEach(link => {
    const id = link.getAttribute('href').replace('#', '');
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });
}

// ── Scroll Fade-in（IntersectionObserver）──────
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  fadeEls.forEach(el => observer.observe(el));
}

// ── Go-to-top ────────────────────────────────
const goTopBtn = document.getElementById('go-to-top');
if (goTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      goTopBtn.classList.add('visible');
    } else {
      goTopBtn.classList.remove('visible');
    }
  });
  goTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── 語言切換（繁中 / EN）───────────────────────
function applyLang(lang) {
  const isEn = lang === 'en';
  document.documentElement.lang = isEn ? 'en' : 'zh-TW';

  // 替換所有帶 data-zh 的元素內容
  document.querySelectorAll('[data-zh]').forEach(el => {
    el.innerHTML = isEn ? (el.dataset.en || el.dataset.zh) : el.dataset.zh;
  });

  // 同步所有 toggle span（desktop + mobile）
  document.querySelectorAll('[data-lang]').forEach(s => {
    s.classList.toggle('active', s.dataset.lang === lang);
  });

  localStorage.setItem('lang', lang);
}

// 頁面載入時套用記憶的語言偏好
const _savedLang = localStorage.getItem('lang') || 'zh';
if (_savedLang === 'en') applyLang('en');

// 所有 toggle span 點擊時切換語言
document.querySelectorAll('[data-lang]').forEach(span => {
  span.addEventListener('click', () => applyLang(span.dataset.lang));
});

// ── Works Lightbox ───────────────────────────
const workCards   = document.querySelectorAll('.work-card');
const backdrop    = document.getElementById('lightboxBackdrop');
const closeBtn    = document.getElementById('lightboxClose');

if (workCards.length && backdrop) {
  workCards.forEach(card => {
    card.addEventListener('click', () => {
      const isEn = document.documentElement.lang === 'en';
      const title    = (isEn && card.dataset.titleEn)    ? card.dataset.titleEn    : (card.dataset.title    || '');
      const subtitle = (isEn && card.dataset.subtitleEn) ? card.dataset.subtitleEn : (card.dataset.subtitle || '');
      const tags     = (isEn && card.dataset.tagsEn)     ? card.dataset.tagsEn     : (card.dataset.tags     || '');
      const role     = card.dataset.role     || '';
      const exec     = (isEn && card.dataset.execEn)     ? card.dataset.execEn     : (card.dataset.exec     || '');
      const metrics  = (isEn && card.dataset.metricsEn)  ? card.dataset.metricsEn  : (card.dataset.metrics  || '');
      const desc     = (isEn && card.dataset.descEn)     ? card.dataset.descEn     : (card.dataset.desc     || '');
      const image    = card.dataset.image    || '';
      const link     = card.dataset.link     || '';

      // 封面圖
      document.getElementById('lbCover').src = image;

      // Tags（疊加在封面左下角）
      const lbTags = document.getElementById('lbTags');
      lbTags.innerHTML = '';
      tags.split(',').forEach(tag => {
        const span = document.createElement('span');
        span.className = 'lightbox-tag';
        span.textContent = tag.trim();
        lbTags.appendChild(span);
      });

      document.getElementById('lbTitle').textContent    = title;
      document.getElementById('lbSubtitle').textContent = subtitle;
      document.getElementById('lbRole').textContent     = role;
      document.getElementById('lbExec').textContent     = exec;
      document.getElementById('lbMetrics').textContent  = metrics;
      document.getElementById('lbDesc').textContent     = desc;

      // 更新 lightbox 固定標籤（依語言）
      const isEnLb = document.documentElement.lang === 'en';
      const roleLabelEl = document.querySelector('.lightbox-meta-label:first-of-type');
      const execLabelEl = document.querySelectorAll('.lightbox-meta-label')[1];
      const metricsLabelEl = document.querySelectorAll('.lightbox-section-label')[0];
      const descLabelEl    = document.querySelectorAll('.lightbox-section-label')[1];
      const linkLabelEl    = document.querySelectorAll('.lightbox-section-label')[2];
      if (roleLabelEl)    roleLabelEl.textContent    = isEnLb ? 'Role'        : '角色';
      if (execLabelEl)    execLabelEl.textContent    = isEnLb ? 'Scope'       : '執行';
      if (metricsLabelEl) metricsLabelEl.textContent = isEnLb ? 'Key Metrics' : '關鍵數據';
      if (descLabelEl)    descLabelEl.textContent    = isEnLb ? 'Overview'    : '說明';
      if (linkLabelEl)    linkLabelEl.textContent    = isEnLb ? 'Link'        : '連結';

      // 連結
      const lbLinkSection = document.getElementById('lbLinkSection');
      const lbLink = document.getElementById('lbLink');
      if (link) {
        lbLink.href = link;
        lbLink.textContent = link;
        lbLinkSection.style.display = 'block';
      } else {
        lbLinkSection.style.display = 'none';
      }

      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';

      // GA4：追蹤 lightbox 開啟
      if (typeof gtag === 'function') {
        gtag('event', 'lightbox_open', { work_title: title });
      }
    });
  });

  // 關閉 lightbox
  function closeLightbox() {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeLightbox);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeLightbox();
  });

  // Focus trap：Tab 鍵在 lightbox 內循環
  const lightboxBox = document.querySelector('.lightbox-box');
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      return;
    }
    if (!backdrop.classList.contains('open') || e.key !== 'Tab') return;
    const focusable = lightboxBox.querySelectorAll(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });
}

// ── Mobile Menu ──────────────────────────────
const menuBtn       = document.getElementById('menuBtn');
const mobileMenu    = document.getElementById('mobileMenu');
const mobileClose   = document.getElementById('mobileMenuClose');

if (menuBtn && mobileMenu) {
  function openMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', openMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);

  // 點選 nav 連結後關閉
  mobileMenu.querySelectorAll('.mobile-nav a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  // 語言切換（mobile）— 由全域 applyLang 統一處理，此處無需額外邏輯

  // Focus trap：Tab 鍵在 mobile menu 內循環
  mobileMenu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeMenu(); menuBtn.focus(); return; }
    if (e.key !== 'Tab') return;
    const focusable = mobileMenu.querySelectorAll(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });
}

// ── Idle Lightbox ─────────────────────────────
(function() {
  const STAGES = [
    {
      sec: 90,
      zh: '朋友，90秒過去了\n你還有什麼煩惱嗎？',
      en: 'Hey friend, 90 seconds have passed.\nIs there anything bothering you?'
    },
    {
      sec: 120,
      zh: '在AI驅動的時代\n每120秒就有2分鐘會過去',
      en: '120 seconds just went by.\nmeans 2 minutes has past.'
    },
    {
      sec: 180,
      zh: '朋友，泡麵都煮好了\n你加減動一下吧',
      en: 'Even the instant noodles are done by now.\nCome on, just move a little?'
    }
  ];

  // 注入 HTML
  const backdrop = document.createElement('div');
  backdrop.id = 'idle-backdrop';
  backdrop.innerHTML = `
    <div class="idle-box">
      <img class="idle-img" src="assets/images/idle-waiting.webp" alt="waiting">
      <div class="idle-content">
        <p class="idle-title" id="idleTitle"></p>
        <div class="idle-btns">
          <button class="idle-btn idle-btn-ok" id="idleBtnOk">OK 👍</button>
          <button class="idle-btn idle-btn-dismiss" id="idleBtnDismiss">管好你自己</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  let elapsed = 0;
  let interval = null;
  let currentStage = null;

  const titleEl    = document.getElementById('idleTitle');
  const btnOk      = document.getElementById('idleBtnOk');
  const btnDismiss = document.getElementById('idleBtnDismiss');

  function getLang() {
    return document.documentElement.lang === 'en' ? 'en' : 'zh';
  }

  function updateContent(stage, animate) {
    const lang = getLang();
    if (animate) {
      titleEl.style.opacity = '0';
      setTimeout(() => {
        titleEl.textContent = stage[lang];
        titleEl.style.opacity = '1';
      }, 350);
    } else {
      titleEl.textContent = stage[lang];
    }
    btnOk.textContent      = 'OK 👍';
    btnDismiss.textContent = lang === 'en' ? 'Mind your own business' : '管好你自己';
  }

  function openIdle(stage) {
    currentStage = stage;
    updateContent(stage, false);
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (typeof gtag === 'function') {
      gtag('event', 'idle_prompt', { idle_stage: stage.sec, button: 'view' });
    }
  }

  function updateIdle(stage) {
    currentStage = stage;
    updateContent(stage, true);
    if (typeof gtag === 'function') {
      gtag('event', 'idle_prompt', { idle_stage: stage.sec, button: 'view' });
    }
  }

  function closeIdle(buttonType) {
    if (!backdrop.classList.contains('open')) return;
    backdrop.classList.remove('open');
    // 若 works lightbox 未開啟才解鎖 scroll
    const worksBackdrop = document.getElementById('lightboxBackdrop');
    if (!worksBackdrop || !worksBackdrop.classList.contains('open')) {
      document.body.style.overflow = '';
    }
    if (typeof gtag === 'function' && currentStage) {
      gtag('event', 'idle_prompt', { idle_stage: currentStage.sec, button: buttonType });
    }
    resetTimer();
  }

  function resetTimer() {
    elapsed = 0;
    clearInterval(interval);
    startTimer();
  }

  function startTimer() {
    interval = setInterval(() => {
      elapsed++;
      const stage = STAGES.find(s => s.sec === elapsed);
      if (!stage) return;
      if (!backdrop.classList.contains('open')) {
        openIdle(stage);
      } else {
        updateIdle(stage);
      }
    }, 1000);
  }

  // 用戶操作 → 重置（idle lightbox 開啟中不重置）
  ['scroll', 'click', 'keypress', 'mousemove', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, () => {
      if (!backdrop.classList.contains('open')) resetTimer();
    }, { passive: true });
  });

  btnOk.addEventListener('click', (e) => { e.stopPropagation(); closeIdle('ok'); });
  btnDismiss.addEventListener('click', (e) => { e.stopPropagation(); closeIdle('dismiss'); });

  // 點擊 backdrop 外框關閉（不記錄 GA）
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      backdrop.classList.remove('open');
      const worksBackdrop = document.getElementById('lightboxBackdrop');
      if (!worksBackdrop || !worksBackdrop.classList.contains('open')) {
        document.body.style.overflow = '';
      }
      resetTimer();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) closeIdle('dismiss');
  });

  startTimer();
})();

// ── Experience 展開 / 收合 ────────────────────
const expandBtn = document.getElementById('expExpandBtn');
const expHidden = document.getElementById('expHidden');

if (expandBtn && expHidden) {
  expandBtn.addEventListener('click', () => {
    const isOpen = expHidden.classList.toggle('open');
    expandBtn.classList.toggle('open', isOpen);

    // 觸發隱藏區塊內的 fade-in
    if (isOpen) {
      const hiddenFadeEls = expHidden.querySelectorAll('.fade-in');
      hiddenFadeEls.forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 80);
      });
    }
  });
}
