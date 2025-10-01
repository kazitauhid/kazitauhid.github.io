/* js/site.js — stable, observer-free navbar highlighter (tuned) */

(function () {
  const NAVBAR_HEIGHT = 80; // keep in sync with CSS scroll-margin-top
  const SECTION_IDS = [
    'home','about','research','publications','achievements',
    'skills','leadership-preview','courses','contact'
  ];
  const ID_TO_SECTION = {
    'home':'home',
    'about':'about',
    'research':'projects',
    'publications':'publications',
    'achievements':'achievements',
    'skills':'skills',
    'leadership-preview':'leadership',
    'courses':'courses',
    'contact':'contact'
  };

  function ready(fn){ document.readyState!=='loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

  ready(() => {
    const nav = document.querySelector('.navbar');
    if (!nav) return;

    const links = [...nav.querySelectorAll('.nav-link')];
const setActive = (key) => {
  let activated = null;
  links.forEach(a => {
    const isActive = (a.dataset.section||'').toLowerCase() === (key||'');
    a.classList.toggle('active', isActive);
    if (isActive) activated = a;
  });
  if (activated) {
    activated.classList.remove('just-activated'); // restart animation if already present
    // next frame ensures the animation restarts cleanly
    requestAnimationFrame(() => {
      activated.classList.add('just-activated');
      setTimeout(() => activated.classList.remove('just-activated'), 400);
    });
  }
};


    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const onHome = (path === '' || path === 'index.html');
    const current = (document.body.dataset.current || '').toLowerCase();
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- Subpages: just light up the page ----------
    if (!onHome && current) { setActive(current); return; }

    // ---------- Home page ----------
    const sections = SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean);

    let lockKey = null;        // while animating to a target section
    let rafId = null;
    let cancelUserHandler = null;

    function topMinusNav(el){
      return Math.round(window.pageYOffset + el.getBoundingClientRect().top - NAVBAR_HEIGHT);
    }

    // Cancel animation on user interaction (wheel/keys/touch)
    function bindUserCancel(cb){
      const stop = () => { cb(); unbind(); };
      const opts = { passive: true };
      const onWheel = () => stop();
      const onKey = (e) => (['PageUp','PageDown','Home','End','ArrowUp','ArrowDown','Space'].includes(e.code) || e.key === ' ') && stop();
      const onTouch = () => stop();

      window.addEventListener('wheel', onWheel, opts);
      window.addEventListener('keydown', onKey);
      window.addEventListener('touchstart', onTouch, opts);

      function unbind(){
        window.removeEventListener('wheel', onWheel, opts);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('touchstart', onTouch, opts);
        cancelUserHandler = null;
      }
      cancelUserHandler = unbind;
    }

    // Smooth scroll with RAF to exact Y (fast & crisp)
    function animateScrollTo(targetY, done) {
      // Reduced motion → jump
      if (prefersReduce) { window.scrollTo(0, targetY); done && done(); return; }

      // Snap tiny hops instantly
      if (Math.abs(window.pageYOffset - targetY) < 40) {
        window.scrollTo(0, targetY);
        done && done();
        return;
      }

      cancelAnimationFrame(rafId);
      const startY = window.pageYOffset;
      const delta  = Math.round(targetY - startY);
      const px     = Math.abs(delta);
      const dur    = Math.min(500, Math.max(180, px * 0.30));
      const startT = performance.now();

      // Snappier easing than cubic
      const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

      let cancelled = false;
      bindUserCancel(() => { cancelled = true; cancelAnimationFrame(rafId); done && done(); });

      function step(now){
        if (cancelled) return;
        const t = Math.min(1, (now - startT) / dur);
        const y = startY + delta * easeOutQuart(t);
        window.scrollTo(0, y);
        if (t < 1) rafId = requestAnimationFrame(step);
        else { if (cancelUserHandler) cancelUserHandler(); done && done(); }
      }
      rafId = requestAnimationFrame(step);
    }

    // Click handler: lock highlight to the intended section
    links.forEach(a => {
      const href = a.getAttribute('href') || '';
      if (!href.includes('#')) return;

      let hash = '';
      try { hash = new URL(href, location.href).hash; } catch { hash = href.slice(href.indexOf('#')); }
      if (!hash) return;

      const targetEl = document.querySelector(hash);
      if (!targetEl) return; // not on this page → let browser navigate

      a.addEventListener('click', (e) => {
        e.preventDefault();
        const key = ID_TO_SECTION[hash.slice(1)];
        if (!key) return;

        lockKey = key;
        setActive(key);
        history.pushState(null, '', hash);

        animateScrollTo(topMinusNav(targetEl), () => { lockKey = null; });
      });
    });

    // Passive scroll: when not locked, highlight the section closest to viewport center
    function updateOnScroll(){
      if (lockKey) return;

      const center = window.pageYOffset + NAVBAR_HEIGHT + (window.innerHeight - NAVBAR_HEIGHT) / 2;
      let bestKey = 'home';
      let bestDist = Infinity;

      for (const el of sections){
        const rect = el.getBoundingClientRect();
        const elCenter = window.pageYOffset + rect.top + rect.height/2;
        const dist = Math.abs(elCenter - center);
        const key = ID_TO_SECTION[el.id];
        if (key && dist < bestDist){ bestDist = dist; bestKey = key; }
      }
      setActive(bestKey);
    }

    // Throttle scroll/resize
    let ticking = false;
    function onScroll(){ if (!ticking){ ticking = true; requestAnimationFrame(() => { ticking = false; updateOnScroll(); }); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // Handle loads with a hash and back/forward
    function goToHash(hash){
      const id  = (hash || '').replace('#','');
      const el  = document.getElementById(id);
      const key = ID_TO_SECTION[id];
      if (!el || !key){ setActive('home'); updateOnScroll(); return; }

      lockKey = key; setActive(key);
      // Jump to exact offset immediately to avoid browser pre-position,
      // then release lock on next frame for snappy feel
      window.scrollTo(0, topMinusNav(el));
      requestAnimationFrame(() => { lockKey = null; updateOnScroll(); });
    }

    if (location.hash) goToHash(location.hash);
    else updateOnScroll();

    window.addEventListener('hashchange', () => goToHash(location.hash));
  });
})();
