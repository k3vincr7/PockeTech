/* ============================================================
   LOS CARNALES — MAIN JS
   ============================================================ */

(function () {
  'use strict';

  /* -- Nav: scroll solidify ----------------------------------- */

  const nav = document.getElementById('nav');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* -- Nav: mobile toggle ------------------------------------- */

  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    });
  });

  /* -- Menu tabs ---------------------------------------------- */

  const tabBtns  = document.querySelectorAll('.tab-btn');
  const panels   = document.querySelectorAll('.menu-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  /* -- Reveal on scroll (Intersection Observer) --------------- */

  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach(el => observer.observe(el));

  /* -- Contact form (front-end only) -------------------------- */

  const form = document.getElementById('contactForm');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const required = form.querySelectorAll('[required]');
      let valid = true;

      required.forEach(field => {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#c0392b';
          valid = false;
        }
      });

      if (!valid) return;

      /* Swap form for a success message */
      form.innerHTML = `
        <div style="text-align:center; padding: 3rem 1rem;">
          <p style="font-family:var(--font-serif); font-size:1.5rem; color:var(--gold); margin-bottom:.75rem;">
            Thank you!
          </p>
          <p style="color:var(--text-muted); font-size:.9rem;">
            We've received your request and will confirm within 24 hours.<br />
            We look forward to seeing you.
          </p>
        </div>
      `;
    });
  }

  /* -- Footer year -------------------------------------------- */

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
