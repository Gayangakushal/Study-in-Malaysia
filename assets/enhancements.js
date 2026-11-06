(() => {
  const loader = document.getElementById('pageLoader');
  const dismissLoader = () => {
    if (!loader) return;
    loader.classList.add('is-loaded');
    setTimeout(() => loader.remove(), 400);
  };
  // Never hold the page behind slow remote photographs or fonts.
  if (document.readyState === 'complete') dismissLoader();
  else window.addEventListener('load', dismissLoader, { once: true });
  setTimeout(dismissLoader, 1600);

  const menu = document.getElementById('menu');
  const nav = document.getElementById('nav');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.textContent = open ? '×' : '☰';
  };
  setMenu(false);
  menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !menu.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setMenu(false);
      menu.focus();
    }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', () => setMenu(false));
  const header = document.querySelector('.topbar');
  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 16);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section-heading,.path-card,.programme,.video,.step,.form-card,.faq-card,.footer-main > *').forEach(el => {
      // Long blocks should remain readable while scrolling through them.
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('reveal-ready');
      const index = Array.from(el.parentElement.children).indexOf(el);
      el.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 75}ms`);
      observer.observe(el);
    });
  }
})();
