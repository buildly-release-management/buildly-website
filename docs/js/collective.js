(function () {
  'use strict';
  const menu = document.getElementById('collective-mobile');
  const button = document.querySelector('.collective-menu-button');
  function closeMenu() { if (menu && button) { menu.hidden = true; button.setAttribute('aria-expanded', 'false'); } }
  if (menu && button) {
    button.addEventListener('click', function () { menu.hidden = !menu.hidden; button.setAttribute('aria-expanded', String(!menu.hidden)); });
    menu.addEventListener('click', function (event) { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !menu.hidden) { closeMenu(); button.focus(); } });
    window.matchMedia('(min-width: 1101px)').addEventListener('change', function (event) { if (event.matches) closeMenu(); });
  }
  const toggles = document.querySelectorAll('[data-collective-theme]');
  function syncTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    toggles.forEach(function (toggle) { toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); });
  }
  syncTheme(document.documentElement.getAttribute('data-theme') || 'dark');
  toggles.forEach(function (toggle) { toggle.addEventListener('click', function () {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    syncTheme(theme); try { localStorage.setItem('buildly-theme', theme); } catch (_) {}
  }); });
  document.querySelectorAll('.collective-nav a').forEach(function (anchor) {
    if (anchor.origin === location.origin && anchor.pathname === location.pathname) anchor.setAttribute('aria-current', 'page');
  });
  document.addEventListener('click', function (event) {
    const anchor = event.target.closest('a[href]');
    if (!anchor || typeof window.gtag !== 'function') return;
    const url = new URL(anchor.href, location.href);
    if (!['collab.buildly.io', 'firstcityfoundry.com', 'www.firstcityfoundry.com'].includes(url.hostname)) return;
    window.gtag('event', 'community_referral', { destination: url.hostname, link_path: url.pathname, page_path: location.pathname, placement: anchor.closest('nav') ? 'navigation' : anchor.closest('footer') ? 'footer' : 'content' });
  });
})();
