// Shared behaviour for PLP concept sites: concept ribbon, demo forms, mobile menu.
(function () {
  const bar = document.createElement('div');
  bar.className = 'plp-concept-bar';
  bar.innerHTML = '<span><strong>Concept project</strong> · Fictional business designed by Parha Likha Pakistan</span>' +
    '<a href="../../our-work.html">← Back to PLP</a>';
  document.body.prepend(bar);

  const style = document.createElement('style');
  style.textContent = `
    .plp-concept-bar{position:relative;z-index:1000;display:flex;justify-content:center;align-items:center;gap:14px;flex-wrap:wrap;
      padding:8px 16px;background:#064B32;color:#fff;font:500 13px/1.4 Montserrat,Segoe UI,Arial,sans-serif;text-align:center}
    .plp-concept-bar strong{color:#A6CE39}
    .plp-concept-bar a{color:#fff;text-decoration:underline;text-underline-offset:3px}
    .plp-toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);opacity:0;z-index:1001;max-width:min(92vw,460px);
      background:#111;color:#fff;padding:14px 18px;border-radius:12px;font:500 14px/1.5 Montserrat,Segoe UI,Arial,sans-serif;
      box-shadow:0 12px 30px rgba(0,0,0,.3);transition:.3s;text-align:center}
    .plp-toast.show{opacity:1;transform:translate(-50%,0)}`;
  document.head.appendChild(style);

  const toast = document.createElement('div');
  toast.className = 'plp-toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  let t;
  const say = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(t);
    t = setTimeout(() => toast.classList.remove('show'), 3800);
  };

  // Demo forms and demo actions (booking, WhatsApp, calls)
  document.querySelectorAll('form').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    f.reset();
    say('Demo only: on a real client site, this form would send the details straight to the business by email or WhatsApp.');
  }));
  document.querySelectorAll('[data-demo]').forEach((el) => el.addEventListener('click', (e) => {
    e.preventDefault();
    say(el.getAttribute('data-demo') || 'Demo only: this is a concept site for a fictional business.');
  }));

  // Demo shopping cart: buttons with [data-add] increase every [data-cart-count]
  let cart = 0;
  document.querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault();
    cart += 1;
    document.querySelectorAll('[data-cart-count]').forEach((c) => { c.textContent = cart; });
    say('Added "' + (b.getAttribute('data-add') || 'item') + '" to your bag. (Demo: a real store would continue to checkout.)');
  }));

  // Mobile menu
  const btn = document.querySelector('[data-menu]');
  const nav = document.querySelector('[data-nav]');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));
  }
})();
