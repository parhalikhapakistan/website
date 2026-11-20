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
        form.dispatchEvent(new CustomEvent('plp:sent', { detail: Object.fromEntries(data) }));
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

  // ---------- Public programs ----------
  // Enrolment closes at the end of the "enrol by" day; a batch disappears from lists after it ends.
  const endOfDay = (iso) => new Date(iso + 'T23:59:59');
  const now = new Date();
  const pkr = (n) => 'PKR ' + n.toLocaleString('en-PK');

  document.querySelectorAll('.program-card').forEach((c) => {
    if (now > endOfDay(c.dataset.ends)) { c.hidden = true; return; }
    if (now > endOfDay(c.dataset.enrolBy)) {
      const s = c.querySelector('.status');
      s.textContent = 'Enrolment closed'; s.className = 'status soon';
    }
  });
  const grid = document.querySelector('.pp-grid:not(.pp-others)');
  if (grid && ![...grid.children].some((c) => !c.hidden)) {
    grid.hidden = true;
    const none = document.querySelector('.pp-none');
    if (none) none.hidden = false;
  }

  const cd = document.querySelector('.pp-countdown');
  if (cd) {
    const days = Math.ceil((new Date(cd.dataset.start + 'T14:00:00') - now) / 86400000);
    if (days > 1) cd.textContent = 'Starts in ' + days + ' days';
    else if (days === 1) cd.textContent = 'Starts tomorrow';
  }

  document.querySelectorAll('.enrol-form').forEach((form) => {
    const fee = Number(form.dataset.fee);
    const seats = form.querySelector('[name="participants"]');
    const freeRow = form.querySelector('.enrol-free');
    const totalOut = form.querySelector('.enrol-total strong');
    const totalField = form.querySelector('[name="total_fee"]');
    const box = form.closest('section');
    let total = fee;

    const update = () => {
      const n = Number(seats.value) || 1;
      const free = Math.floor(n / 6);          // 5 + 1 free, 10 + 2 free ...
      total = (n - free) * fee;
      freeRow.hidden = !free;
      if (free) freeRow.querySelector('strong').textContent = free + ' free seat' + (free > 1 ? 's' : '') + ' (− ' + pkr(free * fee) + ')';
      totalOut.textContent = pkr(total) + (n > 1 ? ' for ' + n + ' participants' : '');
      totalField.value = pkr(total) + ' (' + n + ' participant' + (n > 1 ? 's' : '') + (free ? ', ' + free + ' free' : '') + ')';
    };
    seats.addEventListener('change', update);
    update();

    // closed batch: replace the form with a "notify me" box
    const enrolBy = document.querySelector('.pp-countdown');
    if (enrolBy && now > endOfDay(enrolBy.dataset.start)) {
      form.hidden = true;
      box.querySelector('.enrol-closed').hidden = false;
      document.querySelectorAll('.pp-open').forEach((s) => { s.textContent = 'Enrolment closed'; s.className = 'status soon'; });
      enrolBy.textContent = '';
    }

    form.addEventListener('plp:sent', (ev) => {
      const pay = JSON.parse(form.dataset.payment);
      const d = ev.detail;
      const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      const msg = 'Assalam-o-Alaikum! I have enrolled in ' + form.dataset.program + '. Name: ' + d.name +
        '. Participants: ' + d.participants + '. Amount paid: ' + pkr(total) + '. Here is my payment screenshot.';
      const bank = pay.bank
        ? '<div class="pay-box"><h4>Bank transfer</h4><p>' + esc(pay.bank).replace(/\n/g, '<br>') + '</p></div>'
        : '<div class="pay-box"><h4>Bank transfer</h4><p>Message us on WhatsApp and we will send you the bank account details.</p></div>';
      const done = box.querySelector('.enrol-done');
      done.innerHTML =
        '<p class="kicker">Seat requested</p><h3>Thank you, ' + esc(d.name) + '!</h3>' +
        '<p>We have received your enrolment for <strong>' + esc(form.dataset.program) + '</strong>. Please pay <strong>' + pkr(total) +
        '</strong> to confirm your seat.</p>' +
        '<div class="pay-grid"><div class="pay-box"><h4>Easypaisa</h4><p>Account title: <strong>' + esc(pay.easypaisa_title) +
        '</strong><br>Number: <strong>' + esc(pay.easypaisa_number) + '</strong></p></div>' + bank + '</div>' +
        '<p>After paying, send the payment screenshot on WhatsApp. We will confirm your seat and send the class link.</p>' +
        '<div class="btn-row"><a class="btn btn-whatsapp btn-lg" target="_blank" rel="noopener" href="https://wa.me/' + pay.whatsapp +
        '?text=' + encodeURIComponent(msg) + '"><svg class="ic"><use href="#i-whatsapp"/></svg> Send payment screenshot</a></div>' +
        '<p class="small muted" style="margin-top:14px">Fees are non-refundable once paid, unless PLP cancels the program.</p>';
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
  });

  // Footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
