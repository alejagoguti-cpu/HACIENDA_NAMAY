const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ===== DATOS: LÁMINAS Y MATERIALES (identificados en assets/moodboards.pdf) ===== */
const LAMINAS = [
  { id: 'habitacion', page: 1, num: '01', titulo: 'Habitación',
    paleta: ['#7a5f4b','#5b6e63','#96674b','#a8825d','#622f22','#8b6347','#ede6da','#7a4c31','#677239','#727a5e'] },
  { id: 'bano', page: 2, num: '02', titulo: 'Baño',
    paleta: ['#8a5433','#cccccc','#dc9b52','#7b6450','#9f9a7e','#7f7a72','#ffffff'] },
  { id: 'recepcion', page: 3, num: '03', titulo: 'Recepción',
    paleta: ['#5c3a28','#66705f','#87875a','#a37144','#7a4b2e','#b09163','#cfbeab','#6a6d45'] }
];

const ESPACIO = { habitacion: ['Habitación', 'hab'], bano: ['Baño', 'ban'], recepcion: ['Recepción', 'rec'] };

const MATERIALES = [
  // HABITACIÓN
  ['HAB-01','habitacion','Baldosa rústica terracota envejecida','Gres / porcelanato efecto óxido, junta clara','Óxido y terracota · mate','#8b5a3c','Piso general y muro de fondo'],
  ['HAB-02','habitacion','Revestimiento en espiga','Panel de madera o cerámica efecto madera, chevron fino','Cobre tostado','#8a5433','Cabecero y muro de acento'],
  ['HAB-03','habitacion','Baldosa hidráulica geométrica','Patrón floral ojival','Verde petróleo, crema y terracota','#5b6e63','Muro de acento o tapete de piso en zona de estar'],
  ['HAB-04','habitacion','Baldosa terracota lisa','Formato cuadrado','Terracota clara · mate','#b07a58','Piso, zócalos y alfeizares'],
  ['HAB-05','habitacion','Cerámica vidriada verde oliva','Esmalte brillante con variación de tono','Verde oliva · brillante','#677239','Nichos y detalles de acento'],
  ['HAB-06','habitacion','Madera nogal oscuro','Veta vertical marcada','Nogal · aceite mate','#5a3423','Mobiliario, puertas y carpintería'],
  ['HAB-07','habitacion','Textil lino crudo','Tejido natural de trama abierta','Lino / crudo','#e6ddcd','Cortinas y ropa de cama'],
  ['HAB-08','habitacion','Textil grueso terracota','Tejido de fibra gruesa','Terracota rojiza','#8f4a3a','Tapete, cojines y tapicería'],
  ['HAB-09','habitacion','Lámpara colgante tipo sombrero','Pantalla en palma / rafia con bombillo globo opal','Fibra natural','#b08a5e','Iluminación colgante decorativa'],
  ['HAB-10','habitacion','Jarrón tejido con eucalipto','Ratán sobre vidrio, rama de eucalipto','Fibra natural y verde','#a8825d','Decoración'],
  // BAÑO
  ['BAN-01','bano','Sanitario de una pieza','Porcelana vitrificada, línea curva, tapa de cierre lento','Blanco brillante','#f4f4f2','Batería sanitaria'],
  ['BAN-02','bano','Revestimiento terracota liso','Formato vertical alargado','Terracota · satinado','#8a5433','Muro de ducha y fondo de lavamanos'],
  ['BAN-03','bano','Cerámica decorativa con estrellas','Fondo blanco con motivos en terracota, salvia y azul','Blanco con decorado','#dcdcd6','Muro de lavamanos'],
  ['BAN-04','bano','Grifería de lavamanos caño alto','Monocontrol, caño curvo para vessel','Oro champagne / latón cepillado','#c9b48a','Lavamanos de sobreponer'],
  ['BAN-05','bano','Ducha cuadrada con brazo de pared','Regadera cuadrada delgada y brazo curvo','Oro champagne','#c9b48a','Zona de ducha'],
  ['BAN-06','bano','Lavamanos vessel artesanal','Cuenco cerámico de sobreponer','Bronce / óxido metalizado','#7b6450','Mesón de baño'],
  ['BAN-07','bano','Lámpara lineal tejida','Colgante cilíndrico en fibra natural','Fibra dorada','#dc9b52','Iluminación sobre el mesón'],
  // RECEPCIÓN
  ['REC-01','recepcion','Textil yute / arpillera','Trama natural gruesa','Yute natural','#c8b59a','Tapicería y paneles'],
  ['REC-02','recepcion','Baldosa hidráulica ojival','Patrón ondulado','Verde, ocre y gris sobre crema','#66705f','Piso de recepción o frente del counter'],
  ['REC-03','recepcion','Cerámica tipo subway verde oliva','Pieza alargada vidriada, borde artesanal','Verde oliva · brillante','#87875a','Frente del counter y muro de acento'],
  ['REC-04','recepcion','Baldosa color cuero','Formato cuadrado, aspecto envejecido','Chocolate · mate','#5c3a28','Piso y muro de fondo'],
  ['REC-05','recepcion','Rejilla de esterilla (cannage)','Tejido de ratán natural','Ratán natural','#b09163','Puertas de mueble y divisiones'],
  ['REC-06','recepcion','Madera nogal','Veta natural','Nogal medio · mate','#6e3f22','Counter de recepción y mobiliario'],
  ['REC-07','recepcion','Lámparas colgantes orgánicas','Pantallas ovaladas en mimbre, en grupo','Mimbre natural','#c88a4a','Iluminación sobre el counter'],
  ['REC-08','recepcion','Matera de madera con planta tropical','Tronco tallado, follaje grande','Madera y verde','#7a4b2e','Decoración y paisajismo interior']
].map(([code, espacio, nombre, desc, acabado, color, uso]) => ({ code, espacio, nombre, desc, acabado, color, uso }));

/* ===== RENDER: LÁMINAS ===== */
const grid = $('#laminas-grid');
LAMINAS.forEach((l, i) => {
  const mats = MATERIALES.filter(m => m.espacio === l.id);
  grid.insertAdjacentHTML('beforeend', `
    <article class="lamina-panel rv" id="lamina-${l.id}" style="--d:${.1 + i * .05}s">
      <div class="lamina-topbar">
        <span class="lamina-num">Lámina ${l.num}</span>
        <h3>${l.titulo}</h3>
      </div>
      <div class="lamina-body">
        <div class="canvas-viewport" data-page="${l.page}">
          <canvas class="interactive-canvas"></canvas>
          <div class="loading-state">Cargando lámina ${l.num}...</div>
        </div>
        <div class="lamina-side">
          <div>
            <h4>Paleta del espacio</h4>
            <div class="mini-palette">${l.paleta.map(c => `<span style="--c:${c}" data-hex="${c.toUpperCase()}" title="${c.toUpperCase()}"></span>`).join('')}</div>
          </div>
          <div>
            <h4>Materiales (${mats.length})</h4>
            <ul class="mat-list">${mats.map(m => `<li><b>${m.code}</b><span><span class="swatch" style="--c:${m.color}"></span>${m.nombre}</span></li>`).join('')}</ul>
          </div>
        </div>
      </div>
    </article>`);
});

/* ===== RENDER: MATRIZ ===== */
const tbody = $('#matrix-table tbody');
tbody.innerHTML = MATERIALES.map(m => {
  const [label, cls] = ESPACIO[m.espacio];
  return `<tr data-cat="${m.espacio}">
    <td><span class="code-badge">${m.code}</span></td>
    <td><strong>${m.nombre}</strong><small class="row-sub">${m.desc}</small></td>
    <td><span class="vendor-tag ${cls}">${label}</span></td>
    <td><span class="swatch" style="--c:${m.color}"></span>${m.acabado}</td>
    <td>${m.uso}</td>
    <td><span class="status-tag">Por definir</span></td>
    <td><a class="btn-product-url" href="#lamina-${m.espacio}">Ver lámina ↑</a></td>
  </tr>`;
}).join('');

const filters = $('#matrix-filters');
const count = id => MATERIALES.filter(m => id === 'all' || m.espacio === id).length;
filters.innerHTML = [['all', 'Todos'], ...Object.entries(ESPACIO).map(([k, v]) => [k, v[0]])]
  .map(([k, label], i) => `<button class="filter-chip${i ? '' : ' active'}" data-filter="${k}">${label} (${count(k)})</button>`).join('');

/* 1. LOADER */
let started = false;
function start() {
  if (started) return;
  started = true;
  $('#loader')?.classList.add('done');
  document.body.classList.add('loaded');
}
window.addEventListener('load', () => setTimeout(start, 400));
setTimeout(start, 2000);

/* 2. SCROLL REVEAL */
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
  });
}, { threshold: 0.08 });
$$('.rv').forEach(el => io.observe(el));

/* 3. NAVBAR */
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY, nav = $('#nav');
  if (nav) { nav.classList.toggle('hide', y > lastY && y > 220); nav.classList.toggle('solid', y > 100); }
  lastY = y;
}, { passive: true });

/* 4. BURGER & DRAWER */
const burger = $('#burger'), drawer = $('#drawer');
if (burger && drawer) {
  burger.onclick = () => { burger.classList.toggle('open'); drawer.classList.toggle('open'); };
  $$('#drawer a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); drawer.classList.remove('open'); }));
}

/* 5. PDF.JS: RENDER DE LÁMINAS */
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  pdfjsLib.getDocument('assets/moodboards.pdf').promise.then(async pdf => {
    for (const vp of $$('.canvas-viewport[data-page]')) {
      try {
        const page = await pdf.getPage(+vp.dataset.page);
        const canvas = $('canvas', vp);
        const viewport = page.getViewport({ scale: 2 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        $('.loading-state', vp).classList.add('hide');
      } catch (err) {
        console.warn('Error al procesar lámina', vp.dataset.page, err);
        $('.loading-state', vp).textContent = 'No se pudo cargar la lámina';
      }
    }
  }).catch(err => console.warn('Aviso PDF.js:', err));
}

/* 6. LIGHTBOX */
const lb = $('#lightbox');
$$('.canvas-viewport').forEach(vp => vp.addEventListener('click', () => {
  const canvas = $('canvas', vp);
  if (!canvas.width) return;
  $('img', lb).src = canvas.toDataURL('image/jpeg', .92);
  lb.classList.add('open');
}));
const closeLb = () => lb.classList.remove('open');
lb.addEventListener('click', closeLb);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

/* 7. MATRIZ: FILTROS & BÚSQUEDA */
(function initMatrix() {
  const chips = $$('#matrix-filters .filter-chip');
  const rows = $$('#matrix-table tbody tr');
  let cat = 'all', q = '';
  const apply = () => rows.forEach(r => {
    const ok = (cat === 'all' || r.dataset.cat === cat) && (!q || r.textContent.toLowerCase().includes(q));
    r.classList.toggle('row-hidden', !ok);
  });
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    cat = c.dataset.filter;
    apply();
  }));
  $('#matrix-search')?.addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); apply(); });
})();
