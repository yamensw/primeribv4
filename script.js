(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.classList.add('in');
    }
  }, { threshold: 0.14 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Active nav link on scroll
  const sections = [...document.querySelectorAll('section[id]')];
  const navLinks = [...document.querySelectorAll('.navlinks a[href^="#"]')];

  const setActive = () => {
    const y = window.scrollY + 120;
    let current = sections[0]?.id;
    for (const s of sections) {
      if (s.offsetTop <= y) current = s.id;
    }
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
  };
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  // Button interactions: sweep + ripple + micro-bounce
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    // add sweep element once
    if (!btn.querySelector('.sweep')) {
      const s = document.createElement('span');
      s.className = 'sweep';
      btn.appendChild(s);
    }

    const doRipple = (evt) => {
      const rect = btn.getBoundingClientRect();
      const x = (evt.clientX ?? (rect.left + rect.width/2)) - rect.left;
      const y = (evt.clientY ?? (rect.top + rect.height/2)) - rect.top;

      const r = document.createElement('span');
      r.className = 'ripple';
      r.style.left = `${x}px`;
      r.style.top = `${y}px`;
      btn.appendChild(r);
      r.addEventListener('animationend', () => r.remove(), { once: true });

      btn.classList.remove('sweeping');
      // retrigger
      void btn.offsetWidth;
      btn.classList.add('sweeping');
      setTimeout(() => btn.classList.remove('sweeping'), 380);
    };

    btn.addEventListener('pointerdown', (e) => {
      if (prefersReduced) return;
      doRipple(e);
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (!prefersReduced) doRipple(e);
      }
    });
  });

  // Make sure hero video tries to play; show controls only if autoplay fails
  const v = document.querySelector('video[data-hero]');
  if (v) {
    const tryPlay = async () => {
      try {
        const p = v.play();
        if (p && typeof p.then === 'function') await p;
      } catch {
        v.controls = true;
      }
    };
    // iOS/Safari: play after metadata
    v.addEventListener('loadedmetadata', tryPlay, { once: true });
    // also attempt immediately
    tryPlay();
  }

  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });

  // Demo form -> mailto
  const form = document.querySelector('#demoForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get('name') || '').toString().trim();
      const company = (fd.get('company') || '').toString().trim();
      const email = (fd.get('email') || '').toString().trim();
      const message = (fd.get('message') || '').toString().trim();

      const subject = encodeURIComponent(`Prime Rig demo request${company ? ` — ${company}` : ''}`);
      const body = encodeURIComponent(
        `Name: ${name}\nCompany/Brand: ${company}\nEmail: ${email}\n\nWhat I want to showcase:\n${message}`
      );

      window.location.href = `mailto:contact@prime-rig.com?subject=${subject}&body=${body}`;
    });
  }
})();