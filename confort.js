/* ===== CONFORT & BIENESTAR (adaptado del módulo de Confort del diplomado) ===== */
(() => {
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  if (!q('#confort')) return;

  const ICON = {
    T: '<svg viewBox="0 0 24 24"><path d="M10 4a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 9v7"/></svg>',
    L: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    A: '<svg viewBox="0 0 24 24"><path d="M4 10v4h3l5 4V6L7 10z"/><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/></svg>',
    O: '<svg viewBox="0 0 24 24"><path d="M12 21c-4 0-6-3-6-6 0-5 6-11 6-11s6 6 6 11c0 3-2 6-6 6z"/><path d="M12 21v-8"/></svg>',
    P: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>'
  };

  const TYPES = [
    { k: 'T', name: 'Térmico', color: '#c0703f',
      def: 'Percepción del ambiente a través de la piel. El cuerpo intercambia calor con el entorno; el rango de confort del aire está entre 21 y 24 °C.',
      namay: ['Pisos y muros en arcilla y terracota: baja conductividad térmica.', 'Ventilación cruzada entre la puerta corrediza y la ventana alta.', 'Ventilador de pie como apoyo en las horas cálidas.', 'Madera en camarote, cama y puertas: material naturalmente aislante.'],
      codes: ['HAB-01', 'BAN-02', 'REC-04', 'HAB-06'] },
    { k: 'L', name: 'Lumínico', color: '#e8b33a',
      def: 'La luz es un factor determinante del confort humano. Un buen diseño aprovecha la iluminación natural en todos los espacios interiores.',
      namay: ['Puerta corrediza de vidrio de piso a techo hacia el balcón.', 'Ventana alta que lleva luz al fondo de la habitación.', 'Cortina enrollable para controlar el deslumbramiento.', 'Lámparas de fibra natural: luz cálida, difusa y sin brillo directo.'],
      codes: ['HAB-09', 'BAN-07', 'REC-07', 'HAB-07'] },
    { k: 'A', name: 'Acústico', color: '#5b6e63',
      def: 'Nivel de ruido adecuado para el descanso, la comunicación y la salud. Se logra con acondicionamiento (absorción) y aislamiento entre espacios.',
      namay: ['Absorción: textiles de lino y yute, tapete de fibra y esterilla de bambú.', 'Ratán y mimbre en lámparas y mobiliario: superficies porosas que difunden el sonido.', 'Aislamiento: muros de concreto de 15 cm con pañete entre habitaciones.'],
      codes: ['HAB-07', 'HAB-08', 'REC-01', 'HAB-02', 'REC-05'] },
    { k: 'O', name: 'Olfativo', color: '#677239',
      def: 'Percepción a través del olfato. Depende de la renovación de aire y de que los materiales no liberen sustancias al ambiente.',
      namay: ['Eucalipto y plantas vivas que perfuman y purifican.', 'Renovación de aire constante para evitar hongos y malos olores, sobre todo en el baño.', 'Preferir pinturas y acabados de baja emisión de COV.'],
      codes: ['HAB-10', 'REC-08', 'HAB-04'] },
    { k: 'P', name: 'Psicológico', color: '#96674b',
      def: 'Percepción global que hace el cerebro de toda la información sensorial que recibe: entre la satisfacción y el desagrado.',
      namay: ['Paleta de tierra y verdes tomada del paisaje.', 'Texturas hechas a mano: baldosa hidráulica, tejidos, ratán.', 'Vegetación dentro y fuera: conexión con la naturaleza.', 'Un relato propio: las raíces bajo el suelo y lo que florece hacia el cielo.'],
      codes: ['HAB-03', 'REC-02', 'REC-03', 'HAB-05'] }
  ];
  const BY = Object.fromEntries(TYPES.map(t => [t.k, t]));

  /* ---------- 1. Rueda de tipos de confort ---------- */
  const wheel = q('#cf-wheel'), panel = q('#cf-panel');
  wheel.innerHTML = TYPES.map((t, i) => `<button class="cf-type" role="tab" data-k="${t.k}" style="--c:${t.color};--i:${i}">${ICON[t.k]}<span>${t.name}</span></button>`).join('')
    + '<div class="cf-core"><b>5</b><span>tipos de<br>confort</span></div>';
  function showType(k) {
    const t = BY[k];
    qa('.cf-type', wheel).forEach(b => b.classList.toggle('on', b.dataset.k === k));
    panel.style.setProperty('--c', t.color);
    panel.innerHTML = `<div class="cf-p-head">${ICON[k]}<h3>Confort ${t.name.toLowerCase()}</h3></div>
      <p class="cf-def">${t.def}</p>
      <h4>Cómo lo resuelve Namay</h4>
      <ul>${t.namay.map((n, i) => `<li style="--i:${i}">${n}</li>`).join('')}</ul>
      <h4>Materiales relacionados</h4>
      <div class="cf-chips">${t.codes.map(c => `<button data-code="${c}">${c}</button>`).join('')}</div>`;
    panel.classList.remove('pop'); void panel.offsetWidth; panel.classList.add('pop');
  }
  wheel.addEventListener('click', e => { const b = e.target.closest('.cf-type'); if (b) { showType(b.dataset.k); clearInterval(auto); } });
  showType('T');
  // rota sola hasta que el usuario elige
  let ai = 0;
  const auto = setInterval(() => {
    const r = wheel.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) { ai = (ai + 1) % TYPES.length; showType(TYPES[ai].k); }
  }, 4500);

  // chips: buscar el material en la matriz
  document.addEventListener('click', e => {
    const c = e.target.closest('.cf-chips button, .cf-mat-codes button'); if (!c) return;
    const s = q('#matrix-search'); if (!s) return;
    q('#matrix-filters .filter-chip[data-filter="all"]')?.click();
    s.value = c.dataset.code; s.dispatchEvent(new Event('input'));
    q('#matriz').scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- 2. Diagrama bioclimático ---------- */
  const CAP = {
    sol: 'Asoleamiento y protección solar: el alero bloquea el sol alto del mediodía y deja entrar el sol bajo de la mañana y la tarde. La baldosa de arcilla guarda ese calor y lo devuelve en la noche.',
    aire: 'Ventilación natural: el aire fresco entra bajo por la puerta corrediza, recorre la habitación y el aire caliente sale arriba por la ventana alta. Renueva el aire y evita la humedad.',
    luz: 'Luz natural: la puerta de vidrio y la ventana alta iluminan de día sin luz artificial. La cortina enrollable regula el deslumbramiento.',
    verde: 'Vegetación: los árboles exteriores dan sombra y refrescan el aire que entra; las plantas interiores aportan humedad y frescura.',
    sonido: 'Acústica: los muros de concreto aíslan del exterior y de las habitaciones vecinas; los textiles, la esterilla de bambú y las fibras absorben el sonido reflejado.'
  };
  q('#cf-diagram').innerHTML = `
  <svg viewBox="0 0 900 470" class="cf-svg" role="img" aria-label="Corte bioclimático de la habitación">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdf6ea"/><stop offset="1" stop-color="#f3ece2"/></linearGradient>
      <linearGradient id="beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd978" stop-opacity=".75"/><stop offset="1" stop-color="#ffd978" stop-opacity="0"/></linearGradient>
      <marker id="ar" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#5b8fa8"/></marker>
      <marker id="arw" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#c0703f"/></marker>
    </defs>
    <rect width="900" height="380" fill="url(#sky)"/>
    <rect y="380" width="900" height="90" fill="#e6d6c0"/>
    <g class="roots" stroke="#b98a62" stroke-width="1.4" fill="none" opacity=".55">
      <path d="M840 385 q-6 30 -20 50 M840 385 q8 26 2 60 M828 410 q-14 8 -26 6"/>
      <path d="M95 385 q-8 22 -2 50 M95 385 q14 20 30 30"/>
    </g>
    <!-- capa: luz -->
    <g class="lay lay-luz">
      <polygon points="700,205 700,360 470,360" fill="url(#beam)" class="pulse"/>
      <polygon points="215,172 215,218 380,360 300,360" fill="url(#beam)" class="pulse d2"/>
    </g>
    <!-- habitación -->
    <g class="room">
      <rect x="190" y="360" width="520" height="22" fill="#9aa39a"/>
      <rect x="200" y="356" width="500" height="6" fill="#b2683f"/>
      <rect x="198" y="150" width="17" height="22" fill="#d9cdbd"/>
      <rect x="198" y="218" width="17" height="140" fill="#d9cdbd"/>
      <rect x="690" y="150" width="14" height="50" fill="#d9cdbd"/>
      <rect x="692" y="200" width="10" height="158" fill="#bfe0ea" stroke="#3e2a20" stroke-width="2"/>
      <path d="M170 152 L790 128 L790 140 L170 166 z" fill="#8a5433"/>
      <path d="M215 172 L690 154" stroke="#c9a76a" stroke-width="5" stroke-dasharray="3 3"/>
      <rect x="290" y="318" width="170" height="38" rx="4" fill="#f3e6d6" stroke="#8a5433" stroke-width="2"/>
      <rect x="290" y="300" width="40" height="20" rx="4" fill="#fff" stroke="#8a5433" stroke-width="2"/>
      <rect x="560" y="258" width="70" height="100" fill="#6e3f22" opacity=".85"/>
      <text x="450" y="146" class="lbl" text-anchor="middle">cubierta + cielo en esterilla de bambú</text>
      <text x="206" y="400" class="lbl" text-anchor="middle">ventana alta</text>
      <text x="697" y="400" class="lbl" text-anchor="middle">puerta corrediza</text>
      <text x="780" y="118" class="lbl" text-anchor="middle">alero</text>
    </g>
    <!-- capa: vegetación -->
    <g class="lay lay-verde">
      <g class="sway"><rect x="836" y="300" width="9" height="82" fill="#6e3f22"/><circle cx="840" cy="282" r="38" fill="#7f9a5c"/><circle cx="815" cy="300" r="24" fill="#8fa86e"/><circle cx="864" cy="304" r="22" fill="#6f8a4c"/></g>
      <g class="sway d2"><rect x="70" y="320" width="7" height="62" fill="#6e3f22"/><circle cx="74" cy="306" r="28" fill="#8fa86e"/></g>
      <path d="M648 358 l-8 -26 h28 l-8 26z" fill="#a8825d"/>
      <g class="sway d3"><path d="M654 332 q-18 -26 -6 -46 M654 332 q16 -30 4 -50 M654 332 q-2 -30 0 -54" stroke="#677239" stroke-width="5" fill="none" stroke-linecap="round"/></g>
    </g>
    <!-- capa: sol -->
    <g class="lay lay-sol">
      <g class="sun"><circle cx="840" cy="50" r="22" fill="#e8b33a"/><g stroke="#e8b33a" stroke-width="3" stroke-linecap="round" class="rays"><path d="M840 16v-10M840 94v-10M806 50h-10M884 50h-10M816 26l-7-7M871 81l-7-7M816 74l-7 7M871 19l-7 7"/></g></g>
      <path d="M820 70 L760 136" class="ray block"/>
      <text x="740" y="98" class="lbl warm">sol alto: bloqueado</text>
      <path d="M890 240 L520 352" class="ray enter"/>
      <text x="845" y="230" class="lbl warm" text-anchor="end">sol bajo: entra y calienta la baldosa</text>
    </g>
    <!-- capa: aire -->
    <g class="lay lay-aire">
      <path d="M890 340 L705 335 Q560 330 470 290 Q330 230 218 196 L110 180" class="flow" marker-end="url(#ar)"/>
      <path d="M880 310 L705 312 Q600 300 520 250" class="flow d2" marker-end="url(#ar)"/>
      <path d="M380 300 Q370 250 330 215" class="flow warm d3" marker-end="url(#arw)"/>
      <text x="800" y="330" class="lbl cool" text-anchor="middle">aire fresco</text>
      <text x="120" y="168" class="lbl warm" text-anchor="middle">aire caliente</text>
    </g>
    <!-- capa: sonido -->
    <g class="lay lay-sonido">
      <g class="waves" fill="none" stroke="#5b6e63" stroke-width="2.5"><path d="M60 250 a40 40 0 0 1 0 60" class="w1"/><path d="M80 235 a60 60 0 0 1 0 90" class="w2"/><path d="M100 220 a80 80 0 0 1 0 120" class="w3"/></g>
      <text x="40" y="215" class="lbl">ruido exterior</text>
      <path d="M215 260 h20" stroke="#5b6e63" stroke-width="3" stroke-dasharray="2 4"/>
      <text x="300" y="250" class="lbl">muro 15 cm aísla</text>
      <path d="M682 205 v120" stroke="#e6ddcd" stroke-width="10" stroke-linecap="round" class="curtain"/>
      <text x="610" y="242" class="lbl" text-anchor="end">textiles absorben</text>
    </g>
  </svg>`;
  const cap = q('#cf-caption'), layersBox = q('#cf-layers'), diag = q('#cf-diagram');
  function syncLayers(last) {
    qa('button', layersBox).forEach(b => diag.classList.toggle('show-' + b.dataset.layer, b.classList.contains('on')));
    const on = qa('button.on', layersBox);
    const k = last || on[on.length - 1]?.dataset.layer;
    cap.textContent = k ? CAP[k] : 'Activa una capa para ver la estrategia.';
  }
  layersBox.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    b.classList.toggle('on'); syncLayers(b.classList.contains('on') ? b.dataset.layer : null);
  });
  syncLayers('aire');

  /* ---------- 3. Simulador ---------- */
  const RANGE = { frio: [18, 25], medio: [20, 27.5], calido: [24, 30.5] };
  let clima = 'medio';
  const tI = q('#cf-t'), hI = q('#cf-h'), oI = q('#cf-o');
  const arc = q('#cf-arc'), C = 2 * Math.PI * 84;
  arc.style.strokeDasharray = C;
  function sim() {
    const t = +tI.value, h = +hI.value, o = +oI.value;
    q('#cf-tv').textContent = `${t} °C`; q('#cf-hv').textContent = `${h} %`; q('#cf-ov').textContent = o;
    const [lo, hi] = RANGE[clima], te = t + (o - 1) * .5, mid = (lo + hi) / 2;
    let s = 100;
    if (te < lo) s -= 20 + (lo - te) * 12; else if (te > hi) s -= 20 + (te - hi) * 12; else s -= Math.abs(te - mid) / ((hi - lo) / 2) * 18;
    if (h < 45) s -= (45 - h) * 1.1; else if (h > 55) s -= (h - 55) * 1.1;
    s = Math.max(0, Math.round(s));
    q('#cf-score').textContent = s;
    arc.style.strokeDashoffset = C * (1 - s / 100);
    const col = s >= 80 ? '#677239' : s >= 55 ? '#e8b33a' : '#b0452f';
    arc.style.stroke = col; q('#cf-gauge').style.setProperty('--g', col);
    const acts = [];
    let v;
    if (te > hi) { v = `Calor: la sensación (${te.toFixed(1)} °C con ${o} ocupante${o > 1 ? 's' : ''}) supera el rango de ${lo}–${hi} °C.`;
      acts.push('Abrir la puerta corrediza y la ventana alta: ventilación cruzada.', 'Encender el ventilador de pie de la habitación.', 'Bajar la cortina enrollable en las horas de sol directo.', 'Los árboles exteriores dan sombra al balcón.');
    } else if (te < lo) { v = `Frío: ${te.toFixed(1)} °C está por debajo del rango de ${lo}–${hi} °C.`;
      acts.push('Cerrar la ventana alta y la puerta corrediza.', 'Abrir la cortina de día: el sol bajo calienta la baldosa de arcilla.', 'Cortina abajo en la noche para conservar el calor.', 'Ropa de cama y tapete en fibras naturales.');
    } else v = `En confort: ${te.toFixed(1)} °C dentro del rango adaptativo de ${lo}–${hi} °C.`;
    if (h > 55) acts.push('Humedad alta: renovar el aire para evitar hongos y malos olores; ventilar el baño después de la ducha.');
    if (h < 45) acts.push('Humedad baja: las plantas interiores ayudan a humidificar el ambiente.');
    if (!acts.length) acts.push('Mantener la ventilación natural y la renovación constante de aire.');
    q('#cf-verdict').textContent = v;
    q('#cf-actions').innerHTML = acts.map((a, i) => `<li style="--i:${i}">${a}</li>`).join('');
  }
  [tI, hI, oI].forEach(i => i.addEventListener('input', sim));
  q('#cf-clima').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    clima = b.dataset.c; qa('#cf-clima button').forEach(x => x.classList.toggle('on', x === b)); sim();
  });
  sim();

  /* ---------- 4. Materiales y confort ---------- */
  const MATS = [
    { n: 'Arcilla y terracota', p: 'Buen aislante térmico por su baja conductividad.', a: 'Azulejo Mainzu Bolonia Cotto, Terre Tandoori y pared Origen terracota.', t: 'TP', c: ['HAB-01', 'BAN-02', 'REC-04'], col: '#b2683f' },
    { n: 'Madera', p: 'Recurso renovable con propiedades aislantes; como acabado genera sensación de confort.', a: 'Camarote en madera rústica, cama en teca y puertas en madera; acabados nogal en mobiliario.', t: 'TP', c: ['HAB-06', 'REC-06'], col: '#6e3f22' },
    { n: 'Fibras naturales', p: 'Lino, coco, cáñamo o algodón: aíslan y absorben el sonido.', a: 'Lino, yute, esterilla de bambú, ratán y mimbre.', t: 'ATP', c: ['HAB-07', 'REC-01', 'HAB-02', 'REC-05'], col: '#c8b59a' },
    { n: 'Textiles', p: 'Acondicionamiento acústico: absorben y reducen el sonido reflejado.', a: 'Cortinas, tapete y tapicería en fibra.', t: 'A', c: ['HAB-07', 'HAB-08'], col: '#8f4a3a' },
    { n: 'Vegetación', p: 'Refresca el interior y mejora las condiciones de confort.', a: 'Olivo, matera con planta tropical y ramas de eucalipto.', t: 'TOP', c: ['HAB-10', 'REC-08'], col: '#677239' },
    { n: 'Pinturas y acabados', p: 'Los materiales emiten sustancias al aire (COV): conviene elegir productos de baja emisión.', a: 'Pintura vinílica de muros: verificar en su ficha técnica que sea de bajo COV.', t: 'O', c: ['HAB-04'], col: '#b07a58' }
  ];
  q('#cf-mats').innerHTML = MATS.map((m, i) => `<article class="cf-mat rv" style="--d:${i * .07}s;--c:${m.col}">
      <div class="cf-mat-tags">${[...m.t].map(k => `<span title="Confort ${BY[k].name.toLowerCase()}" style="--c:${BY[k].color}">${ICON[k]}</span>`).join('')}</div>
      <h4>${m.n}</h4><p>${m.p}</p><p class="cf-mat-app"><b>En Namay:</b> ${m.a}</p>
      <div class="cf-mat-codes">${m.c.map(c => `<button data-code="${c}">${c}</button>`).join('')}</div>
    </article>`).join('');

  /* ---------- 5. Etiquetas de confort en la matriz ---------- */
  const TAGS = {};
  TYPES.forEach(t => t.codes.forEach(c => (TAGS[c] = TAGS[c] || new Set()).add(t.k)));
  MATS.forEach(m => m.c.forEach(c => [...m.t].forEach(k => (TAGS[c] = TAGS[c] || new Set()).add(k))));
  qa('#matrix-table tbody tr').forEach(tr => {
    const code = q('.code-badge', tr)?.textContent.trim(); const set = TAGS[code]; if (!set) return;
    const cell = tr.children[1];
    cell.insertAdjacentHTML('beforeend', `<span class="cf-row-tags">${'TLAOP'.split('').filter(k => set.has(k)).map(k => `<i title="Confort ${BY[k].name.toLowerCase()}" style="--c:${BY[k].color}">${ICON[k]}</i>`).join('')}</span>`);
  });
})();
