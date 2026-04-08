// Rock Wu 作品集 — 互動邏輯

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
const langToggle = document.getElementById('langToggle');
if (langToggle) {
  const spans = langToggle.querySelectorAll('span');
  spans.forEach(span => {
    span.addEventListener('click', () => {
      spans.forEach(s => s.classList.remove('active'));
      span.classList.add('active');
      // 切換語言屬性（預留擴充）
      document.documentElement.lang = span.dataset.lang === 'en' ? 'en' : 'zh-TW';
    });
  });
}

// ── Works Lightbox ───────────────────────────
const workCards   = document.querySelectorAll('.work-card');
const backdrop    = document.getElementById('lightboxBackdrop');
const closeBtn    = document.getElementById('lightboxClose');

if (workCards.length && backdrop) {
  workCards.forEach(card => {
    card.addEventListener('click', () => {
      const title    = card.dataset.title    || '';
      const subtitle = card.dataset.subtitle || '';
      const tags     = card.dataset.tags     || '';
      const role     = card.dataset.role     || '';
      const exec     = card.dataset.exec     || '';
      const metrics  = card.dataset.metrics  || '';
      const desc     = card.dataset.desc     || '';
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
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

  // 語言切換（mobile）
  const mobileLangToggle = document.getElementById('langToggleMobile');
  if (mobileLangToggle) {
    const mSpans = mobileLangToggle.querySelectorAll('span');
    mSpans.forEach(span => {
      span.addEventListener('click', () => {
        mSpans.forEach(s => s.classList.remove('active'));
        span.classList.add('active');
        document.documentElement.lang = span.dataset.lang === 'en' ? 'en' : 'zh-TW';
      });
    });
  }
}

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
