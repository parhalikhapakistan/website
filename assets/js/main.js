// Parha Likha Pakistan – site interactions
(function () {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const mobile = window.matchMedia('(max-width: 980px)');

  // Mobile menu
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      toggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
    });
  }

  // Sub-menus (click to open on mobile and for keyboard users)
  document.querySelectorAll('.sub-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const li = btn.parentElement;
      const open = !li.classList.contains('open');
      document.querySelectorAll('.has-sub.open').forEach((el) => {
        if (el !== li) { el.classList.remove('open'); el.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false'); }
      });
      li.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', (e) => {
    if (mobile.matches) return;
    if (!e.target.closest('.has-sub')) {
      document.querySelectorAll('.has-sub.open').forEach((el) => el.classList.remove('open'));
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.has-sub.open').forEach((el) => el.classList.remove('open'));
    if (body.classList.contains('nav-open')) toggle.click();
  });

  // Header shadow on scroll
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Reveal on scroll
  const targets = document.querySelectorAll('.section-head, .pillar, .program, .skill, .solution, .steps li, .founder-photo, .founder-copy, .empower, .principles li, .cta, .card, .value, .statement, .program-block');
  if ('IntersectionObserver' in window) {
    targets.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach((el) => io.observe(el));
  }

  // ---------- Contact page tabs ----------
  const tabs = document.querySelectorAll('[role="tab"]');
  const showTab = (id) => {
    tabs.forEach((t) => {
      const on = t.getAttribute('aria-controls') === id;
      t.setAttribute('aria-selected', String(on));
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  };
  tabs.forEach((t) => t.addEventListener('click', () => {
    const id = t.getAttribute('aria-controls');
    showTab(id);
    history.replaceState(null, '', '#' + id);
  }));
  if (tabs.length && location.hash === '#quote') showTab('quote');

  // Pre-fill forms from links such as contact.html?program=AI-03#enquiry
  const params = new URLSearchParams(location.search);
  const setVal = (sel, val) => {
    const el = document.querySelector(sel);
    if (!el || !val) return;
    const opt = [...el.options].find((o) => o.value === val || o.text === val);
    if (opt) el.value = opt.value;
  };
  setVal('#c-program', params.get('program'));
  setVal('#c-type', params.get('type'));
  if (params.get('program') && !params.get('type')) setVal('#c-type', 'individual');
  setVal('#q-package', params.get('package'));

  // ---------- Forms ----------
  // Paste your free Web3Forms access key here (https://web3forms.com).
  // Until a key is added, forms open the visitor's email app with the details filled in.
  const WEB3FORMS_KEY = '928851b7-b0e3-4215-981a-46c96f21671a';
  const TO_EMAIL = 'info@parhalikhapakistan.com';

  document.querySelectorAll('.js-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = form.querySelector('.form-status');
      status.className = 'form-status';
      if (!form.checkValidity()) {
        status.textContent = 'Please fill in the required fields marked *.';
        status.classList.add('err');
        const bad = form.querySelector(':invalid');
        if (bad) bad.focus();
        return;
      }
      const data = new FormData(form);
      if (data.get('botcheck')) return;
      data.delete('botcheck');
      const subject = form.dataset.subject || 'Website enquiry';

      if (!WEB3FORMS_KEY) {
        const lines = [];
        data.forEach((v, k) => { if (String(v).trim()) lines.push(k.replace(/_/g, ' ') + ': ' + v); });
        location.href = 'mailto:' + TO_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
        status.textContent = 'Your email app should open with your message. Just press send.';
        status.classList.add('ok');
        return;
      }

      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      status.textContent = 'Sending…';
      data.append('access_key', WEB3FORMS_KEY);
      data.append('subject', subject);
      data.append('from_name', 'PLP Website');
      try {
        const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        form.reset();
        status.textContent = 'Thank you! We have received your message and will reply soon.';
        status.classList.add('ok');
      } catch (err) {
        status.textContent = 'Sorry, something went wrong. Please WhatsApp or email us instead.';
        status.classList.add('err');
      } finally {
        btn.disabled = false;
      }
    });
  });

  // Our Work category filters
  document.querySelectorAll('.work-filters button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.work-filters button').forEach((x) => x.classList.toggle('on', x === b));
    const cat = b.dataset.cat;
    document.querySelectorAll('.work-grid > [data-cat]').forEach((card) => {
      card.hidden = !(cat === 'all' || card.dataset.cat === cat || card.dataset.cat === 'always');
    });
  }));

  // Footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
