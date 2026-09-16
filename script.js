(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const mobile = window.matchMedia('(max-width: 760px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  header.classList.add('js-nav');
  const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
  });
  document.addEventListener('click', e => { if (!header.contains(e.target)) closeMenu(); });
  mobile.addEventListener('change', closeMenu);

  // Native details support keyboard and remain usable with JavaScript disabled.
  document.querySelectorAll('.service').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (detail.open) document.querySelectorAll('.service').forEach(other => { if (other !== detail) other.open = false; });
    });
  });

  let revealObserver;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target);
      }
    }, { threshold: .08 });
    if (!reduced.matches) document.querySelectorAll('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('reveal-pending'); revealObserver.observe(el);
      }
    });
  }

  const photos = [...document.querySelectorAll('.parallax-image')];
  const progress = document.querySelector('.reading-progress');
  let scheduled = false;
  function renderScroll() {
    scheduled = false;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0})`;
    for (const img of photos) {
      if (mobile.matches || reduced.matches) { img.style.removeProperty('transform'); continue; }
      const box = img.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) continue;
      const distance = (box.top + box.height / 2 - window.innerHeight / 2) * -.06;
      const limit = box.height * .05;
      img.style.transform = `translate3d(0,${Math.max(-limit, Math.min(limit, distance)).toFixed(2)}px,0)`;
    }
  }
  function scheduleScroll() { if (!scheduled) { scheduled = true; requestAnimationFrame(renderScroll); } }
  window.addEventListener('scroll', scheduleScroll, { passive:true });
  window.addEventListener('resize', scheduleScroll, { passive:true });
  reduced.addEventListener('change', () => {
    if (reduced.matches) document.querySelectorAll('.reveal-pending').forEach(el => el.classList.add('is-visible'));
    scheduleScroll();
  });
  renderScroll();

  const config = window.MICHELLE_CONFIG || {};
  const whatsapp = String(config.whatsapp || '').replace(/\D/g, '');
  const email = String(config.email || '').trim();
  function activateContact(type, href, label) {
    const old = document.querySelector(`[data-contact="${type}"]`);
    const a = document.createElement('a');
    a.className = old.className; a.href = href; a.textContent = label;
    if (type === 'whatsapp') { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    old.replaceWith(a);
  }
  let active = 0;
  if (/^55\d{10,11}$/.test(whatsapp)) {
    activateContact('whatsapp', `https://wa.me/${whatsapp}?text=${encodeURIComponent(config.whatsappMessage || 'Olá. Gostaria de informações sobre a atuação médico-pericial.')}`, 'Conversar pelo WhatsApp');
    active++;
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    activateContact('email', `mailto:${email}`, 'Enviar e-mail'); active++;
  }
  document.querySelector('#contact-status').textContent = active ? 'No primeiro contato, apresente apenas uma breve descrição da demanda.' : 'Canais de contato em breve.';
  for (const key of ['crm','region']) if (String(config[key] || '').trim()) {
    document.querySelectorAll(`[data-${key}]`).forEach(el => { el.textContent = String(config[key]).trim(); el.hidden = false; });
  }
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
