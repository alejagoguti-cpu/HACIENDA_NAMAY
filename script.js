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
  // [código, espacio, nombre, descripción, acabado, color, uso, proveedor, url, zona en lámina (coords PDF 1440x810: x1,y1,x2,y2)]
  // HABITACIÓN
  ["HAB-01","habitacion","Azulejo Mainzu Bolonia Cotto","Azulejo 20x20 cm","Cotto envejecido · satinado","#8b5a3c","Piso y muro de fondo","Domita","https://domita.it/es/p27235_azulejo-mainzu-bolonia-cotto-satinado-20x20",[648,341,960,653]],
  ["HAB-02","habitacion","Esterilla de bambú sintético","Tejido en espiga","Bambú tostado","#8a5433","Cabecero y muro de acento","OneThatch","https://onethatch.com/categoria-producto/synthetic-bamboo-matting/?lang=es",[544,487,679,690]],
  ["HAB-03","habitacion","Piso pared Fez Flores multicolor","Baldosa decorada 19.8x19.8 cm, cara única","Verde petróleo, crema y terracota","#5b6e63","Muro de acento o tapete de piso","Corona","https://corona.co/productos/revestimientos/decorados/piso-pared-fez-flores-multicolor-cara-unica-198x198/p/207301791",[489,310,734,577]],
  ["HAB-04","habitacion","Pintura ICO vinílico 2 en 1 terracota","Galón 3.79 L","Terracota · mate","#b07a58","Muros","Ferreinox","https://www.ferreinox.co/producto/pintura-ico-vinilico-2-en-1-terracota-galon-3-79-l-5890769",[677,255,835,413]],
  ["HAB-05","habitacion","Jarrón Zermatt 27 cm","Jarrón de vidrio de color","Vidriado","#677239","Decoración","Design Market","https://designmarket.com.co/products/jarron-zermatt-amarillo-27-cm",[710,226,781,321]],
  ["HAB-06","habitacion","Tablero melamina Gales Pelikano","Aglomerado melamínico estándar","Nogal oscuro","#5a3423","Mobiliario y carpintería","Madecentro","https://madecentro.com/collections/maderas-aglomerado-melaminicos/products/tablero-aglomerado-melamina-gales-estandar-pelikano",[657,209,745,378]],
  ["HAB-07","habitacion","Tejido natural claro","Ref. HMYA 5471-5474","Lino / crudo","#e6ddcd","Cortinas, tapicería y paneles","Galería Rattan","https://galeriarattan.com/products/hmya-5471-5472-5473-5474",[518,170,638,348]],
  ["HAB-08","habitacion","Tejido en fibra terracota","Ref. HMYA 5440-5443","Terracota rojiza","#8f4a3a","Tapicería, tapete y cojines","Galería Rattan","https://galeriarattan.com/products/hmya-5440-5441-5442-5443",[454,242,568,400]],
  ["HAB-09","habitacion","Lámpara colgante Sole","Pantalla en fibra natural con bombillo globo","Fibra natural","#b08a5e","Iluminación colgante","Houselab","https://houselab.com.co/products/solelamp",[691,270,1080,556]],
  ["HAB-10","habitacion","Olivo decorativo con jarrón tejido","Planta decorativa","Fibra natural y verde","#a8825d","Decoración","Galería Rattan","https://galeriarattan.com/products/olivo-2",[320,181,555,620]],
  // BAÑO
  ["BAN-01","bano","Sanitario Solare Single","Sanitario de una pieza","Blanco brillante","#f4f4f2","Batería sanitaria","Corona","https://corona.co/productos/sanitarios/sanitarios-individuales/sanitario-solare-single/p/O60721001",[394,204,615,537]],
  ["BAN-02","bano","Azulejo Terre Tandoori","Azulejo 7.5x30 cm","Terracota","#8a5433","Muro de ducha y fondo","Arqsupply","https://www.arqsupply.com/producto/azulejo-terre-tandoori-7-5x30/",[504,303,731,538]],
  ["BAN-03","bano","Piso pared Creta Flora antideslizante","Baldosa 19.8x19.8 cm ARD Pro, cara única","Blanco con decorado multicolor","#dcdcd6","Piso y muro de lavamanos","Corona","https://corona.co/productos/revestimientos/pisos/pisos-antideslizantes/piso-pared-creta-flora-antideslizante-ard-pro-multicolor-cara-unica-198x198/p/209121791",[645,331,951,637]],
  ["BAN-04","bano","Grifería lavamanos Vera alta","Grifería sencilla caño alto","Dorada","#c9b48a","Lavamanos vessel","Corona","https://corona.co/productos/griferias/griferia-para-lavamanos/griferia-para-lavamanos-sencilla-vera-alta-dorada/p/VA0075551",[739,395,799,525]],
  ["BAN-05","bano","Regadera Greta","Regadera cuadrada","Dorada","#c9b48a","Zona de ducha","Corona","https://corona.co/productos/duchas/regaderas/regadera-greta-dorada/p/PM4285551",[625,266,798,369]],
  ["BAN-06","bano","Lavamanos Vento Boreal","Lavamanos tipo vessel","Bronce / metalizado","#7b6450","Mesón de baño","Corona","https://corona.co/productos/lavamanos/lavamanos-tipo-vessel/lavamanos-vento-boreal/p/O75509271",[755,243,1072,433]],
  ["BAN-07","bano","Lámpara de techo cilindro mimbre","Colgante lineal tejido","Mimbre natural","#dc9b52","Iluminación sobre el mesón","902 Showroom","https://902showroom.com/products/lampara-de-techo-cilindro-mimbre",[538,525,818,672]],
  // RECEPCIÓN
  ["REC-01","recepcion","Lino Flex","Tela por metros","Lino natural","#c8b59a","Tapicería y paneles","Casa Textil","https://casatextil.com.co/products/lino-flex-x-metros?variant=51024374530363",[447,455,598,609]],
  ["REC-02","recepcion","Piso pared Fez Pétalos multicolor","Baldosa decorada 19.8x19.8 cm, cara única","Verde, ocre y gris sobre crema","#66705f","Piso o frente del counter","Corona","https://corona.co/productos/revestimientos/decorados/piso-pared-fez-petalos-multicolor-cara-unica-198x198/p/207291791",[487,284,757,554]],
  ["REC-03","recepcion","Baldosa Kelp Forest 2x8","Baldosa cerámica 2x8 pulg., borde artesanal","Verde oliva · brillante","#87875a","Frente del counter y muro de acento","Zia Tile","https://ziatile.com/products/kelp-forest-2x8-ceramic-tile",[641,473,781,699]],
  ["REC-04","recepcion","Pared estructurada Origen terracota","Revestimiento 20.5x20.5 cm, multitono","Terracota oscuro","#5c3a28","Muro de fondo","Corona","https://corona.co/productos/revestimientos/decorados/pared-estructurada-origen-terracota-multitono-205x205/p/203051751",[656,256,903,669]],
  ["REC-05","recepcion","Esterilla Quantum","Rejilla tejida tipo cannage","Ratán natural","#b09163","Puertas de mueble y divisiones","Galería Rattan","https://galeriarattan.com/products/quantum-sb",[850,428,982,586]],
  ["REC-06","recepcion","Tablero melamina Gales Pelikano","Aglomerado melamínico estándar","Nogal","#6e3f22","Counter y mobiliario","Madecentro","https://madecentro.com/collections/maderas-aglomerado-melaminicos/products/tablero-aglomerado-melamina-gales-estandar-pelikano",[525,203,669,419]],
  ["REC-07","recepcion","Lámparas Tanami","Pantallas orgánicas en ratán","Ratán natural","#c88a4a","Iluminación sobre el counter","Galería Rattan","https://galeriarattan.com/products/tanami",[711,162,993,473]],
  ["REC-08","recepcion","Matera cilíndrica con planta","Matera en madera","Madera y verde","#7a4b2e","Decoración y paisajismo interior","Retiro Home","https://www.retirohome.com/products/matera-cilindrica",[339,161,555,586]]
].map(([code, espacio, nombre, desc, acabado, color, uso, proveedor, url, rect]) => ({ code, espacio, nombre, desc, acabado, color, uso, proveedor, url, rect }));

/* ===== RENDER: LÁMINAS ===== */
const area = ([x1, y1, x2, y2]) => (x2 - x1) * (y2 - y1);
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
          <div class="canvas-stage">
            <canvas class="interactive-canvas"></canvas>
            ${[...mats].sort((x, y) => area(y.rect) - area(x.rect)).map(m => {
              const [x1, y1, x2, y2] = m.rect;
              return `<a class="hotspot" href="${m.url}" target="_blank" rel="noopener" data-code="${m.code}" title="${m.code} · ${m.nombre} (${m.proveedor})"
                style="left:${x1 / 14.4}%;top:${(810 - y2) / 8.1}%;width:${(x2 - x1) / 14.4}%;height:${(y2 - y1) / 8.1}%"><span>${m.code} · ${m.nombre} ↗</span></a>`;
            }).join('')}
          </div>
          <div class="loading-state">Cargando lámina ${l.num}...</div>
        </div>
        <div class="lamina-side">
          <div>
            <h4>Paleta del espacio</h4>
            <div class="mini-palette">${l.paleta.map(c => `<span style="--c:${c}" data-hex="${c.toUpperCase()}" title="${c.toUpperCase()}"></span>`).join('')}</div>
          </div>
          <div>
            <h4>Materiales (${mats.length})</h4>
            <ul class="mat-list">${mats.map(m => `<li data-code="${m.code}"><b>${m.code}</b><a href="${m.url}" target="_blank" rel="noopener"><span class="swatch" style="--c:${m.color}"></span>${m.nombre} <small>· ${m.proveedor}</small> ↗</a></li>`).join('')}</ul>
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
    <td><span class="vendor-tag prov">${m.proveedor}</span></td>
    <td class="row-actions"><a class="btn-product-url" href="${m.url}" target="_blank" rel="noopener">Ver producto ↗</a><a class="btn-lamina" href="#lamina-${m.espacio}">Lámina ↑</a></td>
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
$$('.canvas-viewport').forEach(vp => vp.addEventListener('click', e => {
  if (e.target.closest('.hotspot')) return;
  const canvas = $('canvas', vp);
  if (!canvas.width) return;
  $('img', lb).src = canvas.toDataURL('image/jpeg', .92);
  lb.classList.add('open');
}));
const closeLb = () => lb.classList.remove('open');
lb.addEventListener('click', closeLb);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

/* 6b. RESALTAR ZONA AL PASAR POR LA LISTA */
$$('.mat-list li').forEach(li => {
  const hs = () => $(`.hotspot[data-code="${li.dataset.code}"]`);
  li.addEventListener('mouseenter', () => hs()?.classList.add('lit'));
  li.addEventListener('mouseleave', () => hs()?.classList.remove('lit'));
});

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
