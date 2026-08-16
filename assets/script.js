// ============================================
// CUSTOM CURSOR
// ============================================
(function() {
  if (window.matchMedia('(max-width: 900px)').matches) return;
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function animateCursor() {
    cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    rx += (mx - rx) * 0.14; ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
})();

// ============================================
// STARFIELD
// ============================================
(function() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  function resizeCanvas() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  }
  function initStars() {
    stars = [];
    const count = window.innerWidth < 768 ? 100 : 200;
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        speed: Math.random() * 0.12 + 0.03,
        opacity: Math.random() * 0.6 + 0.1,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const op = reduceMotion ? s.opacity : s.opacity * (0.7 + 0.3 * Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,210,255,${op})`;
      ctx.fill();
      if (!reduceMotion) {
        s.twinkle += 0.015;
        s.y += s.speed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
      }
    });
    if (!reduceMotion) requestAnimationFrame(drawStars);
  }
  resizeCanvas(); initStars(); drawStars();
  window.addEventListener('resize', () => { resizeCanvas(); initStars(); });
})();

// ============================================
// FADE-UP ON SCROLL
// ============================================
(function() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
})();

// ============================================
// MOBILE MENU
// ============================================
(function() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');
  const navLogo = document.querySelector('.nav-logo');
  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.add('open');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-label', 'Menu');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => mobileMenu.classList.contains('open') ? closeMenu() : openMenu());
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  if (navLogo) navLogo.addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
})();

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
(function() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 50 ? 'rgba(5,8,16,0.95)' : 'rgba(5,8,16,0.7)';
  });
})();

// ============================================
// COUNT-UP ANIMATION (only on index page)
// ============================================
(function() {
  function countUp(el, target, duration=1600) {
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.childNodes[0].textContent = target;
      return;
    }
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const val = Math.floor(progress * target);
      el.childNodes[0].textContent = val;
      if (progress < 1) requestAnimationFrame(step);
      else el.childNodes[0].textContent = target;
    }
    requestAnimationFrame(step);
  }
  const pubCount = document.getElementById('pub-count');
  if (!pubCount) return;

  // Derive stats from the live DOM so they never drift out of sync with content.
  // Publications: count peer-reviewed/in-press papers, excluding any still "Under Review".
  const allPubs = document.querySelectorAll('#publications .pub-item');
  const underReview = document.querySelectorAll('#publications .pub-item .pub-tag-review').length;
  const pubTotal = allPubs.length - underReview;
  const projTotal = document.querySelectorAll('#research .project-card').length;
  const awardTotal = document.querySelectorAll('#honors .honor-card').length;
  const ACADEMIC_START_YEAR = 2021; // B.Sc. Aeronautical Engineering began
  const yearTotal = new Date().getFullYear() - ACADEMIC_START_YEAR;

  const statsObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      countUp(document.getElementById('pub-count'), pubTotal);
      countUp(document.getElementById('proj-count'), projTotal);
      countUp(document.getElementById('year-count'), yearTotal);
      countUp(document.getElementById('award-count'), awardTotal);
      statsObserver.disconnect();
    }
  }, { threshold: 0.5 });
  statsObserver.observe(pubCount);
})();

// ============================================
// LIGHTBOX — click any .img-slot img to view full size
// ============================================
(function() {
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '✕';
  const lbImg = document.createElement('img');
  lbImg.alt = '';
  overlay.appendChild(closeBtn);
  overlay.appendChild(lbImg);
  document.body.appendChild(overlay);

  function openLb(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 200);
  }

  document.querySelectorAll('.img-slot img').forEach(img => {
    img.addEventListener('click', e => { e.stopPropagation(); openLb(img.src, img.alt); });
  });

  overlay.addEventListener('click', closeLb);
  lbImg.addEventListener('click', e => e.stopPropagation());
  closeBtn.addEventListener('click', e => { e.stopPropagation(); closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
})();

// ============================================
// BIBTEX — copy citation to clipboard (per-paper pages)
// ============================================
(function() {
  document.querySelectorAll('.bibtex-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.parentElement.querySelector('pre');
      if (!pre || !navigator.clipboard) return;
      navigator.clipboard.writeText(pre.textContent.trim()).then(() => {
        const prev = btn.textContent;
        btn.textContent = 'Copied ✓';
        setTimeout(() => { btn.textContent = prev; }, 1500);
      });
    });
  });
})();

// ============================================
// CONTRIBUTION TABS (for experience pages)
// ============================================
function switchTab(name) {
  document.querySelectorAll('.contrib-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ctab').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('tab-' + name);
  if (panel) panel.classList.add('active');
  if (event && event.target) event.target.classList.add('active');
}
