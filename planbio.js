/* ===== ANÁLISIS BIOCLIMÁTICO DIBUJADO SOBRE LOS PLANOS DE PLANTA ===== */
(() => {
  const svg = document.getElementById('pb-svg'); if (!svg || !window.NAMAY_CLIMA) return;
  const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)];
  const LAT = 4.9328, rad = Math.PI / 180;
  const MESL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'];
  const dn = a => DIRS[Math.round(((a % 360) + 360) % 360 / 22.5) % 16];

  // Geometría del plano (coordenadas de la lámina renderizada 1316 x 921; norte hacia arriba)
  const C = [643, 415], R_OUT = 398, R_SUN = 370;
  const ARC = [115, 330];               // tramo del anillo construido (azimut, en sentido horario por S y O)
  const SPACES = {
    1: [['Aparta Estudio', 450, 230], ['Zona de Almacenamiento', 597, 690], ['Parqueadero', 775, 605]],
    2: [['Habitación 1', 395, 190], ['Habitación 2', 370, 320], ['Habitación 3', 350, 430], ['Cocineta', 345, 500], ['Habitación 4', 411, 600],
        ['Habitación 5', 505, 650], ['Habitación 6', 595, 735], ['Zona de Estar', 730, 770], ['Oficina - Bodega', 850, 720], ['Restaurante', 800, 610], ['Cocina', 909, 655]],
    3: []
  };
  const azOf = (x, y) => (Math.atan2(x - C[0], -(y - C[1])) / rad + 360) % 360;
  const pol = (az, r) => [C[0] + Math.sin(az * rad) * r, C[1] - Math.cos(az * rad) * r];

  let D, month = new Date().getMonth(), hour = 9, playing = true, page = 1;
  const L = { sol: true, viento: true, rad: false, esp: false };

  function sun(m, h) {
    const n = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349][m];
    const d = 23.45 * Math.sin(2 * Math.PI * (284 + n) / 365) * rad, phi = LAT * rad, H = 15 * (h - 12) * rad;
    const sa = Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H), alt = Math.asin(sa);
    let az = Math.acos(Math.max(-1, Math.min(1, (Math.sin(d) - sa * Math.sin(phi)) / (Math.cos(alt) * Math.cos(phi)))));
    if (H > 0) az = 2 * Math.PI - az;
    return { alt: alt / rad, az: az / rad };
  }
  function sunN(doy, h) {
    const d = 23.45 * Math.sin(2 * Math.PI * (284 + doy) / 365) * rad, phi = LAT * rad, H = 15 * (h - 12) * rad;
    const sa = Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H), alt = Math.asin(sa);
    let az = Math.acos(Math.max(-1, Math.min(1, (Math.sin(d) - sa * Math.sin(phi)) / (Math.cos(alt) * Math.cos(phi)))));
    if (H > 0) az = 2 * Math.PI - az;
    return { alt: alt / rad, az: az / rad };
  }
  const sp = (s) => pol(s.az, R_SUN * (90 - Math.max(0, s.alt)) / 90);
  const radAt = (az, f) => { // interpolación lineal N-E-S-O (kWh/m²·día)
    const pts = [[0, f.N], [90, f.E], [180, f.S], [270, f.O], [360, f.N]];
    for (let i = 0; i < 4; i++) if (az >= pts[i][0] && az <= pts[i + 1][0]) { const k = (az - pts[i][0]) / 90; return pts[i][1] * (1 - k) + pts[i + 1][1] * k; }
    return f.N;
  };
  const heat = v => { const k = Math.max(0, Math.min(1, (v - 1.6) / 1.6)); const A = [232, 179, 58], B = [176, 58, 36]; return `rgb(${A.map((a, i) => Math.round(a + (B[i] - a) * k)).join(',')})`; };

  /* Análisis por espacio (con los datos horarios reales) */
  const CACHE = new Map();
  function analyze(az) {
    const key = az.toFixed(1); if (CACHE.has(key)) return CACHE.get(key);
    const yearF = ['N', 'E', 'S', 'O', 'H'].reduce((o, k) => (o[k] = D.facade.reduce((s, f) => s + f[k], 0) / 12, o), {});
    let am = 0, pm = 0;
    D.typical.forEach((mo, m) => mo.forEach((r, h) => {
      if (h < 6 || h > 18 || r[5] < 120) return;
      const s = sun(m, h + .5); if (s.alt < 5) return;
      if (Math.cos((s.az - az) * rad) > .3) { if (h < 12) am++; else pm++; }
    }));
    am /= 12; pm /= 12;
    const rose = D.rose[12].d.map(b => b.reduce((a, c) => a + c, 0));
    const front = rose.reduce((s, v, i) => s + (Math.cos((i * 22.5 - az) * rad) > .7 ? v : 0), 0);
    const kwh = radAt(az, yearF);
    const rec = [];
    if (pm >= 2) rec.push('Sol directo de tarde: alero, celosía o vegetación al exterior y cortina después de las 2 pm.');
    else if (am >= 2) rec.push('Sol de mañana: aprovecharlo para calentar el piso después de noches frescas.');
    else rec.push('Poco sol directo en fachada: luz difusa estable, cuidar la humedad.');
    if (front >= 12) rec.push(`Recibe la brisa de frente el ${front.toFixed(0)} % del tiempo: buena ventilación cruzada.`);
    else rec.push(`Brisa de frente solo el ${front.toFixed(0)} % del tiempo: abrir también hacia la plaza central para ventilar.`);
    const res = { az, kwh, am, pm, front, rec }; CACHE.set(key, res); return res;
  }

  /* Dibujo */
  function draw() {
    if (!D) return;
    const s = sun(month, hour), up = s.alt > 0;
    const r = D.typical[month][Math.round(hour) % 24];
    const wd = r[3], ws = r[2];
    let html = '';

    // radiación en fachadas: banda alrededor del anillo construido
    if (L.rad) {
      const f = D.facade[month];
      for (let a = ARC[0]; a < ARC[1]; a += 3) {
        const p0 = pol(a, R_OUT), p1 = pol(a + 3.2, R_OUT), v = radAt(a + 1.5, f);
        html += `<path d="M${p0} A${R_OUT},${R_OUT} 0 0 1 ${p1}" class="pb-rad" stroke="${heat(v)}"/>`;
      }
      [135, 180, 225, 270, 315].forEach(a => { const p = pol(a, R_OUT + 34); html += `<text x="${p[0]}" y="${p[1] + 5}" class="pb-radt">${radAt(a, f).toFixed(1)}</text>`; });
      // tramo iluminado ahora
      if (up) { const a0 = Math.max(ARC[0], s.az - 80), a1 = Math.min(ARC[1], s.az + 80);
        if (a1 > a0) html += `<path d="M${pol(a0, R_OUT + 14)} A${R_OUT + 14},${R_OUT + 14} 0 0 1 ${pol(a1, R_OUT + 14)}" class="pb-lit"/>`; }
    }

    // trayectoria solar
    if (L.sol) {
      html += `<circle cx="${C[0]}" cy="${C[1]}" r="${R_SUN}" class="pb-ring"/><circle cx="${C[0]}" cy="${C[1]}" r="${R_SUN * 2 / 3}" class="pb-ring thin"/><circle cx="${C[0]}" cy="${C[1]}" r="${R_SUN / 3}" class="pb-ring thin"/>`;
      [['N', 0], ['E', 90], ['S', 180], ['O', 270]].forEach(([t, a]) => { const p = pol(a, R_SUN + 20); html += `<text x="${p[0]}" y="${p[1] + 6}" class="pb-card">${t}</text>`; });
      [[172, '#d0603a', 'jun 21'], [80, '#e8b33a', 'mar/sep 21'], [355, '#f0c96a', 'dic 21']].forEach(([doy, col, lb]) => {
        const p = []; for (let h = 5.9; h <= 18.1; h += .1) { const x = sunN(doy, h); if (x.alt >= 0) p.push(sp(x)); }
        html += `<polyline points="${p.map(x => x.join(',')).join(' ')}" class="pb-path" stroke="${col}"/>`;
        const lp = p[Math.floor(p.length * .18)]; if (lp) html += `<text x="${lp[0]}" y="${lp[1] - 8}" class="pb-pl" fill="${col}">${lb}</text>`;
        [8, 10, 12, 14, 16].forEach(h => { const x = sunN(doy, h); if (x.alt > 0) { const q2 = sp(x); html += `<circle cx="${q2[0]}" cy="${q2[1]}" r="4" fill="${col}" class="pb-hdot"/>`; if (doy === 80) html += `<text x="${q2[0]}" y="${q2[1] + 18}" class="pb-ht">${h}h</text>`; } });
      });
      // trayectoria del mes elegido + sol actual
      const pm = []; for (let h = 5.9; h <= 18.1; h += .1) { const x = sun(month, h); if (x.alt >= 0) pm.push(sp(x)); }
      html += `<polyline points="${pm.map(x => x.join(',')).join(' ')}" class="pb-month"/>`;
      if (up) {
        const p = sp(s), sh = Math.min(260, 60 / Math.tan(Math.max(8, s.alt) * rad)), sa = pol(s.az + 180, sh);
        html += `<line x1="${p[0]}" y1="${p[1]}" x2="${C[0]}" y2="${C[1]}" class="pb-ray"/>
          <line x1="${C[0]}" y1="${C[1]}" x2="${sa[0]}" y2="${sa[1]}" class="pb-shadow"/>
          <g transform="translate(${p[0]},${p[1]})"><circle r="34" class="pb-halo"/><circle r="15" class="pb-sun"/></g>`;
      }
    }

    // viento: líneas de corriente sobre toda la planta
    if (L.viento && ws > .5) {
      const to = (wd + 180) % 360, dx = Math.sin(to * rad), dy = -Math.cos(to * rad), nx = -dy, ny = dx;
      const dur = (60 / Math.max(2, ws)).toFixed(1);
      for (let k = -7; k <= 7; k++) {
        const ox = C[0] + nx * k * 62, oy = C[1] + ny * k * 62;
        const x0 = ox - dx * 900, y0 = oy - dy * 900, x1 = ox + dx * 900, y1 = oy + dy * 900;
        const wav = 14 * Math.sin(k);
        html += `<path d="M${x0},${y0} Q${ox + nx * wav},${oy + ny * wav} ${x1},${y1}" class="pb-wind" style="animation-duration:${dur}s;animation-delay:${-k * .7}s"/>`;
      }
    }

    // análisis por espacio
    if (L.esp && SPACES[page]) {
      SPACES[page].forEach(([n, x, y]) => {
        const a = analyze(azOf(x, y)), o = pol(a.az, 0), col = a.pm >= 2 ? '#d0603a' : a.am >= 2 ? '#e8b33a' : '#7fb2cc';
        const e = [x + Math.sin(a.az * rad) * 70, y - Math.cos(a.az * rad) * 70];
        html += `<line x1="${x}" y1="${y}" x2="${e[0]}" y2="${e[1]}" class="pb-orient" stroke="${col}" marker-end="url(#pbArr)"/>
          <circle cx="${x}" cy="${y}" r="20" class="pb-esp" fill="${col}"/><text x="${x}" y="${y + 4}" class="pb-espt">${dn(a.az)}</text>`;
      });
    }
    svg.innerHTML = `<defs><marker id="pbArr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#3e2a20"/></marker></defs>` + html;

    // leyenda
    const hh = Math.floor(hour), mm = Math.round((hour - hh) * 60) % 60;
    q('#pb-clock').textContent = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    q('#pb-legend').innerHTML = `<b>${MESL[month]} · ${q('#pb-clock').textContent}</b>
      <span>☀ ${up ? `altura ${s.alt.toFixed(0)}° · ${dn(s.az)}` : 'bajo el horizonte'}</span>
      <span>≋ viento del ${dn(wd)} · ${ws} km/h</span>
      <span>🌡 ${r[0]} °C · ${r[1]} % HR · nubes ${r[7]} %</span>
      ${L.rad ? `<span class="pb-scale"><i></i>kWh/m²·día en fachada</span>` : ''}`;
    q('#pb-hora').value = hour;
  }

  let panelKey = '';
  function drawPanel() {
    const k = page + '|' + L.esp + '|' + !!D; if (k === panelKey) return; panelKey = k;
    const pnl = q('#pb-panel');
    if (!L.esp || !SPACES[page] || !SPACES[page].length) { pnl.innerHTML = ''; pnl.classList.remove('on'); return; }
    pnl.classList.add('on');
    pnl.innerHTML = `<h4>Cómo le va a cada espacio según su orientación en la planta</h4><div class="pb-cards">${SPACES[page].map(([n, x, y], i) => {
      const a = analyze(azOf(x, y)), col = a.pm >= 2 ? '#d0603a' : a.am >= 2 ? '#e8b33a' : '#7fb2cc';
      return `<article class="pb-c" style="--c:${col};--i:${i}"><div class="pb-c-h"><b>${n}</b><span>mira al ${dn(a.az)} · ${a.az.toFixed(0)}°</span></div>
        <div class="pb-c-m"><span><b>${a.kwh.toFixed(1)}</b>kWh/m²·día</span><span><b>${a.am.toFixed(1)}</b>h sol mañana</span><span><b>${a.pm.toFixed(1)}</b>h sol tarde</span><span><b>${a.front.toFixed(0)} %</b>brisa de frente</span></div>
        <ul>${a.rec.map(t => `<li>${t}</li>`).join('')}</ul></article>`;
    }).join('')}</div>`;
  }

  /* Controles */
  const sel = q('#pb-mes');
  sel.innerHTML = MESL.map((m, i) => `<option value="${i}">${m}</option>`).join(''); sel.value = month;
  sel.addEventListener('change', () => { month = +sel.value; draw(); });
  q('#pb-hora').addEventListener('input', e => { hour = +e.target.value; playing = false; q('#pb-play').classList.remove('on'); draw(); });
  q('#pb-play').addEventListener('click', e => { playing = !playing; e.currentTarget.classList.toggle('on', playing); });
  qa('.pb-layers button').forEach(b => b.addEventListener('click', () => { L[b.dataset.l] = !L[b.dataset.l]; b.classList.toggle('on', L[b.dataset.l]); draw(); drawPanel(); }));
  qa('.plan-tab').forEach(t => t.addEventListener('click', () => { page = +t.dataset.page; if (page === 2 && !L.esp) { L.esp = true; q('.pb-layers [data-l="esp"]').classList.add('on'); } draw(); drawPanel(); }));

  // al tocar un punto del plano, sumar su análisis
  document.getElementById('plan-hotspots').addEventListener('click', e => {
    const b = e.target.closest('.pspot'); if (!b || !D) return;
    const name = b.querySelector('span').textContent, sp2 = (SPACES[page] || []).find(s => s[0] === name); if (!sp2) return;
    setTimeout(() => {
      const a = analyze(azOf(sp2[1], sp2[2])), info = document.getElementById('plan-info');
      info.querySelector('.pb-ia')?.remove();
      info.querySelector('span')?.insertAdjacentHTML('afterend', `<div class="pb-ia">Mira al <b>${dn(a.az)}</b> · ${a.kwh.toFixed(1)} kWh/m²·día · sol ${a.am.toFixed(1)} h mañana / ${a.pm.toFixed(1)} h tarde · brisa de frente ${a.front.toFixed(0)} %<br>${a.rec[0]}</div>`);
    }, 0);
  });

  let visible = false, last = 0;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: .2 }).observe(document.getElementById('plan-frame'));
  function loop(t) { if (visible && playing && t - last > 90) { hour += .1; if (hour > 18.5) hour = 5.5; last = t; draw(); } requestAnimationFrame(loop); }
  window.NAMAY_CLIMA.then(d => { D = d; draw(); drawPanel(); requestAnimationFrame(loop); });
  window.NAMAY_PLAN_AZ = { 'Habitación 5': azOf(505, 650) };
})();
