/* ===== ANÁLISIS CLIMÁTICO ANIMADO SOBRE LA HABITACIÓN ===== */
(() => {
  const root = document.getElementById('clima-hab'); if (!root) return;
  const q = s => root.querySelector(s), qa = s => [...root.querySelectorAll(s)];
  const LAT = 4.9328;
  // Clima Namay (Open-Meteo ERA5, 2023–2025): [t media, t máx, t mín, HR %]
  const CL = [[20.2,24.9,15.7,78],[20.4,24.8,16.5,82],[20.7,25.2,16.8,82],[20.7,25,16.9,83],[21.2,25.6,17.2,81],[21.1,25.6,16.8,77],[21.8,27.1,16.8,69],[22,27.5,16.8,67],[22.5,28.1,17.3,66],[21.2,25.9,17.1,79],[20.5,25,16.8,84],[20.6,25.4,16.6,82]];
  // Viento diurno dominante: [dirección de procedencia °, km/h]
  const WIND = [[339,5.8],[338,5.5],[343,5.5],[326,4.9],[288,4.9],[263,6.1],[245,6.7],[270,5.9],[271,6],[312,5.5],[341,5.5],[344,5.6]];
  const MESL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'];
  const dirName = a => DIRS[Math.round(((a % 360) + 360) % 360 / 22.5) % 16];

  /* Geometría isométrica de la imagen (viewBox 1862 x 1981) */
  const O = [880, 930], U = [310, 270], V = [-310, 270], Z = [0, -394];
  const P = (a, b, h = 0) => [O[0] + a * U[0] + b * V[0] + h * Z[0], O[1] + a * U[1] + b * V[1] + h * Z[1]];
  const pts = arr => arr.map(p => P(...p).map(n => n.toFixed(1)).join(',')).join(' ');
  // Aberturas (coordenadas de la habitación: a,b en 0..1; h = fracción de la altura)
  const DOOR = { face: 'a', b0: .32, b1: .80, h0: 0, h1: .5 };     // puerta corrediza en el muro a = 1
  const WIN = { face: 'b', a0: .32, a1: .71, h0: .15, h1: .55 };   // ventana en el muro b = 1
  const doorQuad = [[1, DOOR.b0, DOOR.h0], [1, DOOR.b1, DOOR.h0], [1, DOOR.b1, DOOR.h1], [1, DOOR.b0, DOOR.h1]];
  const winQuad = [[WIN.a0, 1, WIN.h0], [WIN.a1, 1, WIN.h0], [WIN.a1, 1, WIN.h1], [WIN.a0, 1, WIN.h1]];

  // Aberturas tal como se ven dibujadas en los muros explotados (pantalla)
  const DOOR_S = [[1460,1436],[1254,1560],[1250,1364],[1460,1240]]; // b0-abajo, b1-abajo, b1-arriba, b0-arriba
  const WIN_S = [[310,1400],[480,1510],[480,1336],[310,1244]];        // a0-abajo, a1-abajo, a1-arriba, a0-arriba
  const DOOR_C = [1356,1400], WIN_C = [395,1372];
  const DOOR_N = [0.75,0.66], WIN_N = [-0.75,0.66];

  /* Estado */
  let month = new Date().getMonth(), hour = 9, doorAz = 210, open = true, playing = true;
  const layers = { sol: true, viento: true, temp: true, hum: false };

  /* SVG */
  const svg = q('#ch-svg');
  svg.innerHTML = `
    <defs>
      <radialGradient id="chSun"><stop offset="0" stop-color="#fff3c4"/><stop offset=".45" stop-color="#ffd25a"/><stop offset="1" stop-color="#ffb300" stop-opacity="0"/></radialGradient>
      <linearGradient id="chRay" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd978" stop-opacity=".0"/><stop offset="1" stop-color="#ffd978" stop-opacity=".55"/></linearGradient>
      <marker id="chAr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10z" fill="#4f8fb0"/></marker>
      <filter id="chBlur"><feGaussianBlur stdDeviation="10"/></filter>
    </defs>
    <polygon id="ch-heat" points="${pts([[0,0],[1,0],[1,1],[0,1]])}" filter="url(#chBlur)"/>
    <g id="ch-ghost">
      <polygon points="${DOOR_S.map(p=>p.join(',')).join(' ')}" class="opening door"/>
      <polygon points="${WIN_S.map(p=>p.join(',')).join(' ')}" class="opening win"/>
      <text class="olbl" x="1356" y="1220">puerta corrediza</text>
      <text class="olbl" x="395" y="1215">ventana</text>
    </g>
    <g id="ch-sunlayer"><path id="ch-arc" class="arc"/><g id="ch-rays"></g><g id="ch-patch"></g><g id="ch-sun"><circle r="90" fill="url(#chSun)"/><circle r="30" fill="#ffc53d"/></g></g>
    <g id="ch-wind"></g>
    <g id="ch-hum"></g>
    <g id="ch-waves"></g>
    <g id="ch-compass"></g>`;

  const $ = id => svg.querySelector('#' + id);

  /* Sol: posición para latitud, mes (día 15) y hora solar */
  function sun(m, h) {
    const n = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349][m];
    const d = 23.44 * Math.sin((2 * Math.PI / 365) * (284 + n)) * Math.PI / 180;
    const phi = LAT * Math.PI / 180, H = (15 * (h - 12)) * Math.PI / 180;
    const sa = Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H);
    const alt = Math.asin(sa);
    let az = Math.acos(Math.max(-1, Math.min(1, (Math.sin(d) - sa * Math.sin(phi)) / (Math.cos(alt) * Math.cos(phi)))));
    if (H > 0) az = 2 * Math.PI - az;
    return { alt, az };
  }
  // Componentes en ejes de la habitación (a = normal de la puerta, b = a girado 90° horario)
  const axes = () => {
    const d = doorAz * Math.PI / 180, d2 = (doorAz + 90) * Math.PI / 180;
    return { a: [Math.sin(d), Math.cos(d)], b: [Math.sin(d2), Math.cos(d2)] };
  };
  const toRoom = (east, north) => { const x = axes(); return [east * x.a[0] + north * x.a[1], east * x.b[0] + north * x.b[1]]; };

  /* Recorte de polígono al piso [0,1]² */
  function clip(poly) {
    const edges = [[p => p[0] >= 0, (p, q) => { const t = (0 - p[0]) / (q[0] - p[0]); return [0, p[1] + t * (q[1] - p[1])]; }],
      [p => p[0] <= 1, (p, q) => { const t = (1 - p[0]) / (q[0] - p[0]); return [1, p[1] + t * (q[1] - p[1])]; }],
      [p => p[1] >= 0, (p, q) => { const t = (0 - p[1]) / (q[1] - p[1]); return [p[0] + t * (q[0] - p[0]), 0]; }],
      [p => p[1] <= 1, (p, q) => { const t = (1 - p[1]) / (q[1] - p[1]); return [p[0] + t * (q[0] - p[0]), 1]; }]];
    let out = poly;
    for (const [inside, inter] of edges) {
      const inp = out; out = [];
      inp.forEach((cur, i) => {
        const prev = inp[(i + inp.length - 1) % inp.length];
        if (inside(cur)) { if (!inside(prev)) out.push(inter(prev, cur)); out.push(cur); }
        else if (inside(prev)) out.push(inter(prev, cur));
      });
      if (!out.length) break;
    }
    return out;
  }
  const area = p => Math.abs(p.reduce((s, c, i) => { const n = p[(i + 1) % p.length]; return s + c[0] * n[1] - n[0] * c[1]; }, 0) / 2);

  /* Clima por hora */
  let TYP = null; // día típico real por mes y hora (assets/namay-clima.json)
  if (window.NAMAY_CLIMA) window.NAMAY_CLIMA.then(D => { TYP = D.typical; draw(); });
  const hourly = (m, h, i) => { const h0 = Math.floor(h) % 24, h1 = (h0 + 1) % 24, k = h - Math.floor(h); return TYP[m][h0][i] * (1 - k) + TYP[m][h1][i] * k; };
  function weather(m, h) {
    if (TYP) {
      const t = hourly(m, h, 0), hr = hourly(m, h, 1);
      const tx = Math.max(...TYP[m].map(r => r[0])), tn = Math.min(...TYP[m].map(r => r[0]));
      return { t, hr, f: (t - tn) / (tx - tn || 1), dni: hourly(m, h, 5), cc: hourly(m, h, 7), ws: hourly(m, h, 2), wd: TYP[m][Math.round(h) % 24][3] };
    }
    const [, tx, tn, rh] = CL[m];
    const f = h >= 5 && h <= 14 ? .5 - .5 * Math.cos(Math.PI * (h - 5) / 9) : .5 + .5 * Math.cos(Math.PI * (((h - 14) + 24) % 24) / 15);
    const t = tn + (tx - tn) * f;
    const hr = Math.max(40, Math.min(98, rh + (0.5 - f) * 30));
    return { t, hr, f };
  }

  /* Dibujo */
  const C = P(.5, .5, .45);
  function draw() {
    const s = sun(month, hour), up = s.alt > 0;
    const se = Math.sin(s.az) * Math.cos(s.alt), sn = Math.cos(s.az) * Math.cos(s.alt), sh = Math.sin(s.alt);
    const [sa, sb] = toRoom(se, sn);
    const w = weather(month, hour);

    // trayectoria del día
    const arc = [];
    for (let hh = 5.5; hh <= 18.5; hh += .25) { const p = sunScreen(sun(month, hh)); if (p) arc.push(p); }
    $('ch-arc').setAttribute('d', arc.length ? 'M' + arc.map(p => p.join(',')).join(' L') : '');
    const sp = sunScreen(s);
    $('ch-sun').style.display = up ? '' : 'none';
    if (sp) $('ch-sun').setAttribute('transform', `translate(${sp[0]},${sp[1]})`);

    // mancha de sol en el piso
    let patchArea = 0, rays = '', patch = '';
    if (up && sh > .05) {
      const proj = ([a, b, h]) => [a - h * sa / sh, b - h * sb / sh];
      const add = (quad, ok, scr) => {
        if (!ok) return;
        const poly = clip(quad.map(proj)); if (poly.length < 3) return;
        patchArea += area(poly);
        const inten = w.dni != null ? Math.max(.12, Math.min(1, w.dni / 650)) : 1;
        patch += `<polygon class="patch" style="opacity:${(.25 + .45 * inten).toFixed(2)}" points="${pts(poly.map(p => [p[0], p[1], 0]))}"/>`;
        quad.forEach((c, i) => { const f = proj(c), e = P(Math.max(0, Math.min(1, f[0])), Math.max(0, Math.min(1, f[1]))); const st = scr[i]; rays += `<line class="ray" x1="${st[0]}" y1="${st[1]}" x2="${e[0]}" y2="${e[1]}"/>`; });
      };
      add(doorQuad, sa > 0, [DOOR_S[0], DOOR_S[1], DOOR_S[2], DOOR_S[3]]); add(winQuad, sb > 0, [WIN_S[0], WIN_S[1], WIN_S[2], WIN_S[3]]);
    }
    $('ch-patch').innerHTML = patch; $('ch-rays').innerHTML = rays;

    // viento
    let [wd, ws] = WIND[month];
    if (w.wd != null) { wd = w.wd; ws = +w.ws.toFixed(1); }
    const fromE = Math.sin(wd * Math.PI / 180), fromN = Math.cos(wd * Math.PI / 180);
    const [fa, fb] = toRoom(fromE, fromN);         // hacia dónde está la fuente, en ejes de la habitación
    const dIn = fa > .2, wIn = fb > .2;            // abertura que mira al viento
    let windTxt, windHTML = '';
    if (!open) windTxt = 'Aberturas cerradas: sin ventilación.';
    else if (dIn || wIn) {
      const [iC, iN, oC, oN] = dIn ? [DOOR_C, DOOR_N, WIN_C, WIN_N] : [WIN_C, WIN_N, DOOR_C, DOOR_N];
      for (let k = 0; k < 3; k++) {
        const off = (k - 1) * 46;
        const start = [iC[0] + iN[0] * 260 + off * .6, iC[1] + iN[1] * 260 + off];
        const inP = [iC[0], iC[1] + off * .5];
        const mid = P(.5 + (k - 1) * .08, .5 - (k - 1) * .08, .25 + k * .06);
        const outP = [oC[0], oC[1] + off * .5];
        const end = [oC[0] + oN[0] * 240, oC[1] + oN[1] * 240 + off];
        const d = `M${start.join(',')} L${inP.join(',')} Q${mid.join(',')} ${outP.join(',')} L${end.join(',')}`;
        windHTML += `<path class="wind" style="animation-duration:${(9 / Math.max(ws, 2)).toFixed(2)}s;animation-delay:${-k * .4}s" d="${d}" marker-end="url(#chAr)"/>`;
      }
      windTxt = `Viento del ${dirName(wd)} a ${ws} km/h: entra por la ${dIn ? 'puerta corrediza' : 'ventana'} y sale por la ${dIn ? 'ventana' : 'puerta'}. Ventilación cruzada.`;
    } else {
      const m = P(.5, .5, .55);
      windHTML = `<path class="wind soft" d="M${DOOR_C.join(',')} Q${m.join(',')} ${WIN_C[0]},${WIN_C[1] - 120}" marker-end="url(#chAr)"/>`;
      windTxt = `Viento del ${dirName(wd)} a ${ws} km/h: llega por la espalda del edificio; la ventilación es débil (por diferencia de temperatura).`;
    }
    $('ch-wind').innerHTML = layers.viento ? windHTML : '';

    // temperatura interior (estimación simplificada) y mapa de calor
    const gain = patchArea * 6 * (w.dni != null ? Math.min(1, w.dni / 650) : 1) + .6 - (open && (dIn || wIn) ? 1.2 : 0);
    const tin = w.t + Math.max(-1, gain);
    const col = tin < 18 ? '#6fa3c7' : tin < 21 ? '#9cc3a0' : tin <= 24 ? '#8fb36a' : tin <= 27 ? '#e8b33a' : '#d0603a';
    const heat = $('ch-heat'); heat.setAttribute('fill', col); heat.style.opacity = layers.temp ? .5 : 0;
    // calor que devuelve la baldosa de terracota en la tarde/noche
    let waves = '';
    if (layers.temp && (hour >= 16 || hour <= 7)) {
      for (let k = 0; k < 5; k++) { const a = .2 + k * .15, b = .65 - k * .08; const p0 = P(a, b, 0), p1 = P(a, b, .35);
        waves += `<path class="hwave" style="animation-delay:${-k * .5}s" d="M${p0[0]},${p0[1]} q20,-${(p0[1] - p1[1]) / 3} 0,-${(p0[1] - p1[1]) / 1.6} t0,-${(p0[1] - p1[1]) / 1.6}"/>`; }
    }
    $('ch-waves').innerHTML = waves;

    // humedad
    let hum = '';
    if (layers.hum) {
      const n = Math.round((w.hr - 40) / 3);
      for (let k = 0; k < n; k++) { const a = ((k * 37) % 100) / 100, b = ((k * 61) % 100) / 100, h = ((k * 23) % 80) / 100; const p = P(a, b, h);
        hum += `<circle class="drop" cx="${p[0]}" cy="${p[1]}" r="${5 + (k % 3) * 2}" style="animation-delay:${-(k % 7) * .45}s"/>`; }
      const v = P(.42, .2, .1); // ducha / baño detrás de la celosía
      hum += `<g class="vapor"><path d="M${v[0]},${v[1]} q-20,-60 0,-120 t0,-120"/><path d="M${v[0] + 40},${v[1]} q-20,-60 0,-120 t0,-120"/></g>`;
    }
    $('ch-hum').innerHTML = hum;

    // brújula
    const north = toRoom(0, 1), cpos = [1560, 1720];
    const nx = 310 * (north[0] - north[1]), ny = 270 * (north[0] + north[1]), L = Math.hypot(nx, ny) || 1;
    $('ch-compass').innerHTML = `<circle cx="${cpos[0]}" cy="${cpos[1]}" r="70" class="cmp"/><line x1="${cpos[0]}" y1="${cpos[1]}" x2="${cpos[0] + nx / L * 60}" y2="${cpos[1] + ny / L * 60}" class="cmpN"/><text x="${cpos[0] + nx / L * 92}" y="${cpos[1] + ny / L * 92 + 12}" class="cmpT" text-anchor="middle">N</text>`;

    $('ch-sunlayer').style.opacity = layers.sol ? 1 : 0;

    // panel
    const hh = Math.floor(hour), mm = Math.round((hour - hh) * 60);
    q('#ch-clock').textContent = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    q('#ch-month').textContent = MESL[month];
    q('#ch-sunv').textContent = up ? `${(s.alt * 180 / Math.PI).toFixed(0)}° · ${dirName(s.az * 180 / Math.PI)}${w.cc != null ? ' · nubes ' + Math.round(w.cc) + ' %' : ''}` : 'bajo el horizonte';
    q('#ch-tout').textContent = `${w.t.toFixed(1)} °C`;
    q('#ch-tin').textContent = `${tin.toFixed(1)} °C`;
    q('#ch-tin').style.color = col;
    q('#ch-hr').textContent = `${Math.round(w.hr)} %`;
    q('#ch-patchv').textContent = patchArea > .005 ? `${Math.round(patchArea * 100)} % del piso` : 'sin sol directo';
    q('#ch-windtxt').textContent = windTxt;
    const rec = [];
    if (patchArea > .06 && tin > 24) rec.push('Bajar la cortina enrollable: el sol directo calienta el piso.');
    if (patchArea > .02 && tin < 21) rec.push('Dejar entrar el sol: la baldosa de terracota guarda el calor para la noche.');
    if (tin > 24 && !open) rec.push('Abrir la puerta corrediza y la ventana para ventilar.');
    if (tin > 24 && open) rec.push('Encender el ventilador de pie si no hay brisa.');
    if (w.hr > 80) rec.push('Humedad alta: renovar aire y ventilar el baño después de la ducha.');
    if (tin < 19) rec.push('Cerrar aberturas y bajar la cortina: conservar el calor del día.');
    if (!rec.length) rec.push('Condiciones de confort: mantener ventilación natural.');
    q('#ch-rec').innerHTML = rec.map(r => `<li>${r}</li>`).join('');
    q('#ch-hour').value = hour;
  }
  function sunScreen(s) {
    if (s.alt < -0.05) return null;
    const se = Math.sin(s.az) * Math.cos(s.alt), sn = Math.cos(s.az) * Math.cos(s.alt), sh = Math.sin(s.alt);
    const [sa, sb] = toRoom(se, sn);
    const dx = 310 * (sa - sb), dy = 270 * (sa + sb) - 394 * sh * 1.6;
    const L = Math.hypot(dx, dy) || 1, R = 760;
    return [Math.max(80, Math.min(1780, C[0] + dx / L * R)), Math.max(80, Math.min(1900, C[1] + dy / L * R * .95))];
  }

  /* Controles */
  const sel = q('#ch-mes');
  sel.innerHTML = MESL.map((m, i) => `<option value="${i}">${m}</option>`).join('');
  sel.value = month;
  sel.addEventListener('change', () => { month = +sel.value; draw(); });
  q('#ch-hour').addEventListener('input', e => { hour = +e.target.value; playing = false; q('#ch-play').classList.remove('on'); draw(); });
  q('#ch-play').addEventListener('click', e => { playing = !playing; e.currentTarget.classList.toggle('on', playing); });
  qa('.ch-orient button').forEach(b => b.addEventListener('click', () => {
    doorAz = +b.dataset.az; qa('.ch-orient button').forEach(x => x.classList.toggle('on', x === b)); draw();
  }));
  qa('.ch-layers button').forEach(b => b.addEventListener('click', () => {
    layers[b.dataset.l] = !layers[b.dataset.l]; b.classList.toggle('on', layers[b.dataset.l]); draw();
  }));
  q('#ch-open').addEventListener('change', e => { open = e.target.checked; draw(); });

  /* Animación: el día pasa solo mientras la sección está en pantalla */
  let visible = false, last = 0;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: .2 }).observe(root);
  function loop(t) {
    if (visible && playing && t - last > 60) { hour += .1; if (hour > 18.5) hour = 5.5; last = t; draw(); }
    requestAnimationFrame(loop);
  }
  draw(); requestAnimationFrame(loop);
})();
