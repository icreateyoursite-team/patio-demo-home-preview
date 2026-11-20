/* Concrete patios & enclosures · homepage concept · iCreate Your Site */
(() => {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const megaBtn = nav.querySelector('.nav__toggle');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(min-width: 1181px)');
  const canHover = matchMedia('(hover: hover)');
  document.documentElement.classList.add('smooth');
  document.getElementById('yr').textContent = new Date().getFullYear();

  /* header turns solid on scroll */
  const onScroll = () => nav.classList.toggle('solid', scrollY > 60);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  /* desktop mega menu: opens on hover (real pointers) or click, closes on leave, outside click or Esc */
  let leaveT;
  const setMega = open => { nav.classList.toggle('mega-open', open); megaBtn.setAttribute('aria-expanded', open); };
  megaBtn.addEventListener('click', e => { e.stopPropagation(); setMega(!nav.classList.contains('mega-open')); });
  megaBtn.parentElement.addEventListener('mouseenter', () => { if (canHover.matches && desktop.matches) { clearTimeout(leaveT); setMega(true); } });
  nav.addEventListener('mouseleave', () => { if (canHover.matches) leaveT = setTimeout(() => setMega(false), 180); });
  nav.addEventListener('mouseenter', () => clearTimeout(leaveT));
  nav.querySelectorAll('.nav__side .nav__link:not(.nav__toggle), .brand').forEach(a => a.addEventListener('mouseenter', () => { if (canHover.matches) setMega(false); }));
  document.querySelectorAll('.mega a').forEach(a => a.addEventListener('click', () => setMega(false)));
  document.addEventListener('click', e => { if (!nav.contains(e.target)) setMega(false); });

  /* phone and tablet drawer; the Services group stays closed until tapped */
  const closeDrawer = () => {
    nav.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false); burger.setAttribute('aria-label', 'Open menu');
    document.querySelectorAll('.drawer__group.open').forEach(g => { g.classList.remove('open'); g.querySelector('.drawer__toggle').setAttribute('aria-expanded', false); });
  };
  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('menu-open');
    if (!open) return closeDrawer();
    nav.classList.add('menu-open'); burger.setAttribute('aria-expanded', true); burger.setAttribute('aria-label', 'Close menu');
  });
  document.querySelectorAll('.drawer__toggle').forEach(btn => btn.addEventListener('click', () => {
    const g = btn.closest('.drawer__group'); const open = g.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  }));
  document.querySelectorAll('.drawer a').forEach(a => a.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { setMega(false); closeDrawer(); } });
  /* crossing the breakpoint never leaves a menu open */
  desktop.addEventListener('change', () => { setMega(false); closeDrawer(); });

  /* reveal on scroll, staggered within each group */
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in'); io.unobserve(en.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    const i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i * 0.1, 0.4) + 's');
    io.observe(el);
  });

  /* gentle parallax on wide screens only */
  const layers = [...document.querySelectorAll('[data-parallax]')];
  const wide = matchMedia('(min-width: 1025px)');
  let ticking = false;
  const para = () => {
    ticking = false;
    layers.forEach(l => {
      if (!wide.matches || reduce) { l.style.transform = ''; return; }
      const r = l.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      l.style.transform = `translate3d(0, ${(-c * 5).toFixed(2)}%, 0)`;
    });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(para); } }, { passive: true });
  para();

  /* consultation pop-up: every "Book a Consultation" opens it instead of scrolling */
  const modal = document.getElementById('consult');
  let lastFocus = null;
  const POP_KEY = 'pv_consult_popup_seen';
  const markSeen = () => { try { sessionStorage.setItem(POP_KEY, '1'); } catch (e) {} };
  const openModal = auto => {
    lastFocus = document.activeElement;
    setMega(false); closeDrawer();
    modal.hidden = false; document.body.classList.add('modal-open');
    markSeen();
    /* the automatic pop-up focuses the close button, so phones don't jump to the keyboard */
    setTimeout(() => (auto === true ? modal.querySelector('.modal__x') : modal.querySelector('input[name=name]')).focus(), 60);
  };
  const closeModal = () => {
    modal.hidden = true; document.body.classList.remove('modal-open');
    if (lastFocus) lastFocus.focus();
  };
  /* automatic pop-up: once per visit, when the visitor first reaches the Finishes section */
  const popAt = document.getElementById('finishes');
  if (popAt) {
    const popIO = new IntersectionObserver(entries => {
      if (!entries.some(en => en.isIntersecting)) return;
      let seen = false; try { seen = !!sessionStorage.getItem(POP_KEY); } catch (e) {}
      if (seen) { popIO.disconnect(); return; }
      const busy = !modal.hidden || nav.classList.contains('menu-open') || nav.classList.contains('mega-open') || (document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName));
      if (busy) return;
      popIO.disconnect();
      setTimeout(() => openModal(true), 700);
    }, { threshold: 0.35 });
    popIO.observe(popAt);
  }
  document.querySelectorAll('[data-modal="consult"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openModal(); }));
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') {
      const f = [...modal.querySelectorAll('button, input, textarea, a[href]')].filter(el => !el.closest('.hp') && el.type !== 'hidden');
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* enquiry forms: honeypot + time trap here, rate limits in enquiry.php on the live host */
  const t0 = performance.now();
  document.querySelectorAll('.js-enquiry').forEach(form => {
    const msg = form.querySelector('.form__msg');
    const btn = form.querySelector('button[type=submit]');
    const say = (text, ok) => { msg.textContent = text; msg.className = 'form__msg ' + (ok ? 'ok' : 'bad'); };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      let bad = false;
      ['name', 'phone', 'email'].forEach(n => {
        const f = form.elements[n], wrap = f.closest('.f');
        const invalid = !f.value.trim() || (n === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
        wrap.classList.toggle('err', invalid); if (invalid) bad = true;
      });
      if (bad) { say('Please add your name, phone and a valid email.', false); return; }
      form.elements.ts.value = Math.round(performance.now() - t0);
      const data = Object.fromEntries(new FormData(form));
      data.interest = [...form.querySelectorAll('[name=interest]:checked')].map(i => i.value).join(', ');
      btn.disabled = true; btn.querySelector('span').textContent = 'Sending...';
      try {
        if (!/(^|\.)yourcompany\.com$/.test(location.hostname)) { await new Promise(r => setTimeout(r, 700)); throw { demo: true }; }
        const res = await fetch('enquiry.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !out.ok) throw new Error(out.error || 'Something went wrong. Please call or text (555) 555-0123.');
        form.reset();
        say('Thank you! We have your request and will be in touch soon. For anything urgent, call or text (555) 555-0123.', true);
      } catch (err) {
        if (err && err.demo) say('Preview only: on the live site this request goes straight to our team.', true);
        else say(err.message || 'Something went wrong. Please call or text (555) 555-0123.', false);
      } finally {
        btn.disabled = false; btn.querySelector('span').textContent = 'Send My Request';
      }
    });
  });

  /* AI patio designer: its booking button opens the same pop-up, with the visitor's picks in the message */
  window.RV_CONFIG = Object.assign(window.RV_CONFIG || {}, {
    onCta: picks => {
      const m = document.getElementById('m-message');
      if (m && picks && !m.value) m.value = picks;
      openModal();
    }
  });
})();
