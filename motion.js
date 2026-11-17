/* ===== MOVIMIENTO: scroll, parallax, raíces, manifiesto, tilt ===== */
(() => {
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  /* 1. Más elementos con aparición escalonada */
  const stagger = (sel, base = 0, step = .06) => qa(sel).forEach((el, i) => {
    el.classList.add('rv'); el.style.setProperty('--d', `${base + (i % 8) * step}s`);
  });
  stagger('.color-card', .05);
  stagger('.desc-item', .1, .12);
  stagger('.stat', .05, .1);
  stagger('.typo-weights span', 0, .05);
  qa('.bb-sec-header h2').forEach(h => {
    h.innerHTML = h.textContent.split(' ').map((w, i) => `<span class="w"><span style="--wi:${i}">${w}</span></span>`).join(' ');
  });

  /* 2. Aparición que se repite cada vez que entra en pantalla */
  const io = new IntersectionObserver(es => es.forEach(e => {
    e.target.classList.toggle('in', e.isIntersecting);
    if (e.isIntersecting && e.target.matches('.stat')) count(q('b', e.target));
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  const watch = () => qa('.rv, .bb-sec-header, .bb-table tbody tr').forEach(el => io.observe(el));
  watch();
  // la matriz y las láminas se generan por JS: volver a observar
  setTimeout(watch, 300);
  addEventListener("namay:content", watch);

  /* 3. Contadores */
  function count(b) {
    if (!b) return;
    const end = +b.dataset.count, t0 = performance.now(), dur = 1400;
    const step = t => { const k = Math.min(1, (t - t0) / dur); b.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* 4. Manifiesto palabra por palabra según el scroll */
  const mt = q('#manifesto-text');
  if (mt) mt.innerHTML = mt.textContent.split(' ').map(w => `<span class="mw${/^Namay/.test(w) ? ' key' : ''}">${w}</span>`).join(' ');
  const words = qa('.mw');

  /* 5. Parallax */
  const PAR = [
    ['.bb-hero-in', -.25], ['.hero-logo', -.12], ['.section-tag', -.06],
    ['.logo-hero-box', -.05], ['.manifesto .section-tag', -.1]
  ];
  const parEls = PAR.flatMap(([s, k]) => qa(s).map(el => ({ el, k })));

  /* 6. Bucle de scroll */
  const bar = q('#progress'), track = q('.bb-track'), nav = q('#nav');
  let lastY = scrollY, vel = 0, mx = 0, marq = 0;
  function frame() {
    const y = scrollY, H = innerHeight;
    vel += ((y - lastY) - vel) * .15; lastY = y;
    bar.style.transform = `scaleX(${y / Math.max(1, document.documentElement.scrollHeight - H)})`;

    if (!reduce) {
      parEls.forEach(({ el, k }) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > H + 200) return;
        const c = r.top + r.height / 2 - H / 2;
        el.style.translate = `0 ${c * k}px`;
      });
      // cinta: se acelera y cambia de dirección con el scroll
      if (track) {
        marq -= .6 + Math.abs(vel) * .35 * (vel < 0 ? -1 : 1);
        const w = track.scrollWidth / 2;
        if (marq < -w) marq += w; if (marq > 0) marq -= w;
        track.style.transform = `translateX(${marq}px) skewX(${Math.max(-12, Math.min(12, -vel * .4))}deg)`;
      }
      // láminas y visores: zoom suave al entrar
      qa('.lamina-panel, .plan-viewer, .spec-viewer, .table-card').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > H) return;
        const k = Math.min(1, Math.max(0, (H - r.top) / (H * .6)));
        el.style.setProperty('--sc', (.94 + .06 * k).toFixed(4));
      });
    }
    // manifiesto
    if (words.length) {
      const r = mt.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (H * .85 - r.top) / (r.height + H * .35)));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('lit', i < n));
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* 7. Raíces y tallos en la portada */
  const cv = q('#roots');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d');
    let W, H, segs = [], t0 = performance.now(), pmx = 0, pmy = 0;
    const rnd = (a, b) => a + Math.random() * (b - a);
    function branch(x, y, ang, len, depth, up, start) {
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      const dur = len * 9;
      segs.push({ x, y, x2, y2, depth, up, start, dur, w: Math.max(.6, depth * (up ? .9 : .7)) });
      if (depth <= 1) { if (up) segs.push({ leaf: true, x: x2, y: y2, ang, start: start + dur, s: rnd(5, 10) }); return; }
      const n = up ? 2 : (Math.random() < .5 ? 2 : 3);
      for (let i = 0; i < n; i++) {
        const spread = up ? rnd(-.55, .55) : rnd(-.7, .7);
        branch(x2, y2, ang + spread, len * rnd(.62, .82), depth - 1, up, start + dur);
      }
    }
    function build() {
      W = cv.width = cv.offsetWidth * devicePixelRatio; H = cv.height = cv.offsetHeight * devicePixelRatio;
      segs = []; t0 = performance.now();
      const ground = H * .78, cols = Math.max(4, Math.round(W / (220 * devicePixelRatio)));
      for (let i = 0; i < cols; i++) {
        const x = (i + .5) * W / cols + rnd(-30, 30);
        const L = H * rnd(.07, .11);
        branch(x, ground, Math.PI / 2 + rnd(-.25, .25), L * .9, 6, false, rnd(0, 900));
        branch(x, ground, -Math.PI / 2 + rnd(-.2, .2), L, 6, true, rnd(300, 1400));
      }
    }
    function draw(now) {
      const t = now - t0, sc = Math.min(scrollY / innerHeight, 1.2);
      ctx.clearRect(0, 0, W, H);
      const ground = H * .78;
      ctx.strokeStyle = 'rgba(232,201,162,.18)'; ctx.lineWidth = 1 * devicePixelRatio;
      ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(W, ground); ctx.stroke();
      for (const s of segs) {
        if (t < s.start) continue;
        const k = Math.min(1, (t - s.start) / (s.dur || 400));
        const lift = s.up ? -sc * 120 * devicePixelRatio : sc * 90 * devicePixelRatio;
        const sway = s.up ? Math.sin(now / 1400 + s.x * .01) * (7 - (s.depth || 1)) * 1.6 + pmx * 18 : pmx * -6;
        if (s.leaf) {
          ctx.save(); ctx.translate(s.x + sway * 1.4, s.y + lift + pmy * 6); ctx.rotate(s.ang + Math.sin(now / 900 + s.x) * .2);
          ctx.fillStyle = `rgba(143,168,110,${.55 * k})`;
          ctx.beginPath(); ctx.ellipse(s.s * devicePixelRatio * .5, 0, s.s * devicePixelRatio * k, s.s * devicePixelRatio * .42 * k, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore(); continue;
        }
        const swayEnd = sway * 1.4, swayStart = sway * (s.depth > 5 ? 0 : 1);
        ctx.strokeStyle = s.up ? 'rgba(160,180,120,.5)' : 'rgba(208,150,100,.42)';
        ctx.lineWidth = s.w * devicePixelRatio;
        ctx.beginPath();
        ctx.moveTo(s.x + swayStart, s.y + lift);
        ctx.lineTo(s.x + swayStart + (s.x2 + swayEnd - s.x - swayStart) * k, s.y + lift + (s.y2 - s.y) * k);
        ctx.stroke();
      }
      if (scrollY < innerHeight * 1.3) requestAnimationFrame(draw); else hidden = true;
    }
    let hidden = false;
    addEventListener('scroll', () => { if (hidden && scrollY < innerHeight * 1.3) { hidden = false; requestAnimationFrame(draw); } }, { passive: true });
    addEventListener('mousemove', e => { pmx = e.clientX / innerWidth - .5; pmy = e.clientY / innerHeight - .5; }, { passive: true });
    addEventListener('resize', () => build());
    build(); requestAnimationFrame(draw);
    // volver a crecer al hacer clic en la portada
    q('.bb-hero').addEventListener('click', e => { if (!e.target.closest('a,button')) build(); });
  }

  /* 8. Brillo que sigue al cursor + tilt + botones magnéticos */
  const glow = q('#glow');
  if (fine && !reduce) {
    addEventListener('mousemove', e => { glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; glow.classList.add('on'); }, { passive: true });
    qa('.identity-card, .typo-card, .color-card, .stat, .lamina-panel').forEach(el => {
      el.classList.add('tilt');
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        const m = el.matches('.lamina-panel') ? 2 : 7;
        el.style.setProperty('--rx', `${-y * m}deg`); el.style.setProperty('--ry', `${x * m}deg`);
        el.style.setProperty('--mx', `${(x + .5) * 100}%`); el.style.setProperty('--my', `${(y + .5) * 100}%`);
      });
      el.addEventListener('mouseleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
    qa('.pill').forEach(p => {
      p.addEventListener('mousemove', e => { const r = p.getBoundingClientRect(); p.style.translate = `${(e.clientX - r.left - r.width / 2) * .25}px ${(e.clientY - r.top - r.height / 2) * .35}px`; });
      p.addEventListener('mouseleave', () => { p.style.translate = '0 0'; });
    });
  }

  /* 9. Copiar color de la paleta */
  const toast = q('#toast');
  let tt;
  const say = m => { toast.textContent = m; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 1800); };
  document.addEventListener('click', e => {
    const c = e.target.closest('.color-card, .mini-palette span'); if (!c) return;
    const hex = (c.querySelector('code')?.textContent || c.dataset.hex || '').trim();
    if (!hex) return;
    navigator.clipboard?.writeText(hex).catch(() => {});
    c.classList.remove('ping'); void c.offsetWidth; c.classList.add('ping');
    say(`Color ${hex} copiado`);
  });
})();
