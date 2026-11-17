/* ===== PLANOS (PDF.js + zoom/arrastre) Y ESPECIFICACIONES HAB. 05 ===== */
(() => {
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- PLANOS ---------- */
  // Puntos en % sobre la lámina (1417 x 992 pt)
  const PLAN_SPOTS = {
    1: [
      { x: 34.2, y: 25, t: 'Aparta Estudio', d: 'N.P.T. ±0.00' },
      { x: 34.2, y: 38.5, t: 'Escalera', d: '17 contrahuellas de 0.176 m · huella 0.275 m' },
      { x: 45.4, y: 74.9, t: 'Zona de Almacenamiento', d: 'Nivel de acceso' },
      { x: 58.9, y: 65.7, t: 'Parqueadero', d: 'N.P.T. -0.05' },
      { x: 79.8, y: 78.2, t: 'Piscina', d: 'Zona húmeda exterior' },
      { x: 49.2, y: 45.5, t: 'Plaza central', d: 'Patio circular que organiza todo el proyecto' }
    ],
    2: [
      { x: 30, y: 20.6, t: 'Habitación 1', d: 'N.P.T. +3.00' },
      { x: 28.1, y: 34.7, t: 'Habitación 2', d: 'N.P.T. +3.00' },
      { x: 26.6, y: 46.7, t: 'Habitación 3', d: 'N.P.T. +3.00' },
      { x: 26.2, y: 54.3, t: 'Cocineta', d: 'N.P.T. +3.00' },
      { x: 31.2, y: 65.1, t: 'Habitación 4', d: 'N.P.T. +3.00' },
      { x: 38.4, y: 70.6, t: 'Habitación 5', d: 'Ver especificaciones de materiales →', go: '#hab05', star: true },
      { x: 45.2, y: 79.8, t: 'Habitación 6', d: 'N.P.T. +3.00' },
      { x: 60.8, y: 66.2, t: 'Restaurante', d: 'N.P.T. +2.00' },
      { x: 69.1, y: 71.1, t: 'Cocina', d: 'Servicio del restaurante' },
      { x: 64.6, y: 78.2, t: 'Oficina - Bodega', d: 'Apoyo administrativo' },
      { x: 55.5, y: 83.6, t: 'Zona de Estar', d: 'Terraza social' },
      { x: 79.8, y: 78.2, t: 'Piscina', d: 'N.P.T. +0.60' }
    ],
    3: [
      { x: 30, y: 25, t: 'Cubierta ala norte', d: 'Pendiente 7%' },
      { x: 25, y: 55, t: 'Cubierta ala oeste', d: 'Pendiente 7%' },
      { x: 37, y: 72, t: 'Cubierta habitaciones', d: 'Pendiente 7%' },
      { x: 67, y: 62, t: 'Cubierta restaurante', d: 'Pendiente 7%' }
    ]
  };

  const frame = q('#plan-frame'), stage = q('#plan-stage'), canvas = q('#plan-canvas');
  const spotsEl = q('#plan-hotspots'), info = q('#plan-info'), loading = q('#plan-loading');
  let pdfDoc = null, page = 1, z = 1, tx = 0, ty = 0;
  const cache = {};

  const apply = (anim) => {
    stage.style.transition = anim ? 'transform .45s cubic-bezier(.2,.8,.2,1)' : 'none';
    stage.style.transform = `translate(${tx}px,${ty}px) scale(${z})`;
    stage.style.setProperty('--inv', 1 / z);
  };
  const clamp = () => {
    const w = frame.clientWidth, h = frame.clientHeight;
    const sw = stage.offsetWidth * z, sh = stage.offsetHeight * z;
    tx = Math.min(0, Math.max(w - sw, tx));
    ty = sh <= h ? (h - sh) / 2 : Math.min(0, Math.max(h - sh, ty));
    if (sw <= w) tx = (w - sw) / 2;
  };
  const zoomAt = (f, cx, cy, anim) => {
    const nz = Math.min(6, Math.max(1, z * f));
    tx = cx - (cx - tx) * (nz / z); ty = cy - (cy - ty) * (nz / z); z = nz;
    clamp(); apply(anim);
  };
  const fit = () => {
    const ar = canvas.width / canvas.height || 1.43;
    stage.style.width = Math.min(frame.clientWidth, frame.clientHeight * ar) + 'px';
  };
  const focus = (xp, yp, nz) => {
    z = nz; tx = frame.clientWidth / 2 - stage.offsetWidth * xp / 100 * z; ty = frame.clientHeight / 2 - stage.offsetHeight * yp / 100 * z;
    clamp(); apply(true);
  };
  const reset = (anim) => { z = 1; tx = 0; ty = 0; clamp(); apply(anim); };

  async function renderPlan(n) {
    page = n;
    loading.classList.remove('hide');
    stage.classList.add('swap');
    if (!cache[n]) {
      const p = await pdfDoc.getPage(n);
      const vp = p.getViewport({ scale: 2.6 });
      const c = document.createElement('canvas');
      c.width = vp.width; c.height = vp.height;
      await p.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
      cache[n] = c;
    }
    canvas.width = cache[n].width; canvas.height = cache[n].height;
    canvas.getContext('2d').drawImage(cache[n], 0, 0);
    spotsEl.innerHTML = PLAN_SPOTS[n].map((s, i) =>
      `<button class="pspot${s.star ? ' star' : ''}" style="left:${s.x}%;top:${s.y}%;--i:${i}" data-i="${i}"><i></i><span>${s.t}</span></button>`).join('');
    info.classList.remove('show');
    loading.classList.add('hide');
    requestAnimationFrame(() => { fit(); reset(false); stage.classList.remove('swap'); });
  }

  spotsEl.addEventListener('click', e => {
    const b = e.target.closest('.pspot'); if (!b) return;
    e.stopPropagation();
    const s = PLAN_SPOTS[page][b.dataset.i];
    info.innerHTML = `<b>${s.t}</b><span>${s.d}</span>${s.go ? `<a href="${s.go}" class="pill ink sm"><em>Ver Habitación 05</em><em>Ver Habitación 05</em></a>` : ''}<button aria-label="Cerrar">×</button>`;
    info.classList.add('show');
    qa('.pspot', spotsEl).forEach(x => x.classList.toggle('on', x === b));
    if (s.go) {
      focus(s.x, s.y, 2.6);
    }
  });
  info.addEventListener('click', e => { if (e.target.tagName === 'BUTTON') info.classList.remove('show'); });

  qa('.plan-tab').forEach(t => t.addEventListener('click', () => {
    qa('.plan-tab').forEach(x => x.classList.toggle('active', x === t));
    if (pdfDoc) renderPlan(+t.dataset.page);
  }));
  qa('[data-zoom]').forEach(b => b.addEventListener('click', () => {
    const w = frame.clientWidth / 2, h = frame.clientHeight / 2;
    if (b.dataset.zoom === 'in') zoomAt(1.5, w, h, true);
    else if (b.dataset.zoom === 'out') zoomAt(1 / 1.5, w, h, true);
    else reset(true);
  }));

  // Rueda: zoom (solo con el cursor sobre el plano)
  frame.addEventListener('wheel', e => {
    e.preventDefault();
    const r = frame.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top, false);
  }, { passive: false });

  // Arrastre y pellizco
  const pts = new Map(); let last = null, pinch = null;
  frame.addEventListener('pointerdown', e => {
    if (e.target.closest('.pspot,.plan-info')) return;
    frame.setPointerCapture(e.pointerId); pts.set(e.pointerId, e);
    frame.classList.add('grab');
    last = { x: e.clientX, y: e.clientY };
  });
  frame.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, e);
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const r = frame.getBoundingClientRect();
      const cx = (a.clientX + b.clientX) / 2 - r.left, cy = (a.clientY + b.clientY) / 2 - r.top;
      if (pinch) zoomAt(d / pinch, cx, cy, false);
      pinch = d; return;
    }
    if (z > 1 && last) { tx += e.clientX - last.x; ty += e.clientY - last.y; clamp(); apply(false); }
    last = { x: e.clientX, y: e.clientY };
  });
  const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) { last = null; frame.classList.remove('grab'); } };
  frame.addEventListener('pointerup', up); frame.addEventListener('pointercancel', up);
  frame.addEventListener('dblclick', e => { const r = frame.getBoundingClientRect(); zoomAt(2, e.clientX - r.left, e.clientY - r.top, true); });
  window.addEventListener('resize', () => { fit(); clamp(); apply(false); });

  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.getDocument('assets/planos.pdf').promise.then(d => { pdfDoc = d; renderPlan(1); })
      .catch(err => { loading.textContent = 'No se pudieron cargar los planos'; console.warn(err); });
  }

  /* ---------- ESPECIFICACIONES HAB. 05 ---------- */
  const SPECS = {
    hab: {
      img: 'assets/spec-hab05.webp', alt: 'Corte axonométrico Habitación 05', tone: 'light',
      items: [
        { x: 27, y: 46, t: 'Baño privado', d: 'Piso porcelanato negro 40 x 40 cm · enchape de ducha en mosaico gris · sanitario y lavamanos en porcelana.', go: 'ban' },
        { x: 50.5, y: 31, t: 'Ventana alta', d: 'Vidrio transparente con marco en aluminio.' },
        { x: 63, y: 33, t: 'Cortina enrollable', d: 'Tela, tubo en aluminio blanco, tapas y cadena gris.' },
        { x: 64, y: 44, t: 'Puerta corrediza a balcón', d: 'Vidrio transparente, marco en aluminio negro. 2.40 x 2.10 m.' },
        { x: 31, y: 62, t: 'Muros divisorios e = 15 cm', d: 'Núcleo en concreto gris vaciado in situ, pañete 1.5 cm por cara + pintura blanco hueso.' },
        { x: 39.5, y: 49, t: 'Puerta batiente a ras · baño', d: 'Hoja y marco en madera. 0.80 x 2.10 m.' },
        { x: 43, y: 45, t: 'Clóset en melamina', d: '2.00 x 0.60 x 2.20 m con zócalo.' },
        { x: 57.5, y: 54, t: 'Cama sencilla / semidoble', d: 'Estructura en madera teca, colchón 1.20 x 1.90 m, textil a cuadros azul.' },
        { x: 50, y: 59, t: 'Camarote doble', d: 'Madera rústica, colchones 1.40 x 1.90 m.' },
        { x: 68, y: 59, t: 'Ventilador de pie', d: 'Acabado negro y cromo.' },
        { x: 59, y: 68, t: 'Televisor 50"', d: 'Soporte de pared con brazo, acabado negro.' },
        { x: 65, y: 71, t: 'Piso habitación', d: 'Piso laminado color gris 8 mm sobre losa.' },
        { x: 45, y: 77, t: 'Losa de piso', d: 'Concreto gris vaciado in situ, espesor 30 cm.' }
      ]
    },
    ban: {
      img: 'assets/spec-ban05.webp?v=2', alt: 'Corte axonométrico Baño Habitación 05', tone: 'light',
      items: [
        { x: 46.5, y: 33, t: 'Espejo rectangular', d: 'Luna de espejo, marco en MDF. 1.20 x 0.80 m.' },
        { x: 59, y: 26, t: 'Muro divisorio e = 15 cm', d: 'Núcleo en concreto gris vaciado in situ, pañete 1.5 cm por cara + pintura blanco hueso.' },
        { x: 52, y: 38, t: 'Mueble lavamanos suspendido', d: 'Lavamanos en porcelana blanca, mueble negro brillante, grifería monocontrol cromada. 0.62 x 0.45 m.' },
        { x: 41, y: 43, t: 'Mampara corrediza de ducha', d: 'Vidrio transparente, perfilería y riel negro mate. 1.50 x 2.00 m.' },
        { x: 38, y: 54, t: 'Regadera de pared Ø 200 mm', d: 'Con brazo y mezclador, acabado negro mate.' },
        { x: 35, y: 63, t: 'Enchape muros de ducha', d: 'Mosaico cerámico gris, espesor 8 mm, altura 2.50 m.' },
        { x: 47, y: 61, t: 'Sanitario una pieza', d: 'Porcelana blanca, accesorios cromados.' },
        { x: 58.5, y: 66, t: 'Piso baño', d: 'Porcelanato negro brillante 40 x 40 cm, e = 10 mm, junta gris.' },
        { x: 33, y: 79, t: 'Losa de piso', d: 'Concreto gris vaciado in situ, espesor 30 cm.' }
      ]
    }
  };

  const viewer = q('#spec-viewer'), img = q('#spec-img'), sHot = q('#spec-hotspots');
  const detail = q('#spec-detail'), list = q('#spec-list');
  let cur = 'hab';

  function selectSpec(i) {
    const it = SPECS[cur].items[i];
    qa('.sspot', sHot).forEach((b, j) => b.classList.toggle('on', j === i));
    qa('li', list).forEach((li, j) => li.classList.toggle('on', j === i));
    detail.innerHTML = `<span class="spec-num">${String(i + 1).padStart(2, '0')}</span><h3>${it.t}</h3><p>${it.d}</p>${it.go ? `<button class="pill ink sm" data-go="${it.go}"><em>Ver detalle del baño</em><em>Ver detalle del baño</em></button>` : ''}`;
    detail.classList.remove('pop'); void detail.offsetWidth; detail.classList.add('pop');
  }

  function loadSpec(k) {
    cur = k;
    const s = SPECS[k];
    viewer.classList.add('swap');
    setTimeout(() => {
      img.src = s.img; img.alt = s.alt;
      viewer.dataset.tone = s.tone;
      sHot.innerHTML = s.items.map((it, i) => `<button class="sspot" style="left:${it.x}%;top:${it.y}%;--i:${i}" data-i="${i}" aria-label="${it.t}"><i>${i + 1}</i></button>`).join('');
      list.innerHTML = s.items.map((it, i) => `<li data-i="${i}"><b>${String(i + 1).padStart(2, '0')}</b>${it.t}</li>`).join('');
      qa('.spec-tab').forEach(t => t.classList.toggle('active', t.dataset.spec === k));
      selectSpec(0);
      viewer.classList.remove('swap');
    }, 250);
  }

  sHot.addEventListener('click', e => { const b = e.target.closest('.sspot'); if (b) selectSpec(+b.dataset.i); });
  sHot.addEventListener('mouseover', e => { const b = e.target.closest('.sspot'); if (b) selectSpec(+b.dataset.i); });
  list.addEventListener('click', e => { const li = e.target.closest('li'); if (li) selectSpec(+li.dataset.i); });
  detail.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) loadSpec(b.dataset.go); });
  qa('.spec-tab').forEach(t => t.addEventListener('click', () => loadSpec(t.dataset.spec)));
  loadSpec('hab');
})();
