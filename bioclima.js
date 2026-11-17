/* ===== ANÁLISIS BIOCLIMÁTICO DEL SITIO (datos horarios Open-Meteo ERA5) ===== */
window.NAMAY_CLIMA = fetch('assets/namay-clima.json').then(r => r.json());
(() => {
  const root = document.getElementById('bio'); if (!root) return;
  const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)];
  const MES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const MESL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'];
  const ZN = {
    confort: { n: 'Confort sin ayuda', c: '#8fb36a', d: 'Temperatura de 20 a 26 °C y humedad aceptable.' },
    internas: { n: 'Ganancias internas + inercia', c: '#e8b33a', d: '17–20 °C: basta con la masa térmica, los ocupantes y cerrar bien.' },
    solar: { n: 'Calentamiento solar pasivo', c: '#c0703f', d: '12–17 °C: aprovechar el sol del día guardado en pisos y muros.' },
    deshum: { n: 'Control de humedad', c: '#7fb2cc', d: 'Temperatura buena pero humedad sobre 80 %: ventilar y usar materiales transpirables.' },
    ventilacion: { n: 'Ventilación natural', c: '#4f8fb0', d: 'Más de 26 °C con humedad: ventilación cruzada y movimiento de aire.' },
    masa: { n: 'Masa térmica + ventilación nocturna', c: '#96674b', d: 'Más de 26 °C en aire seco: muros y pisos pesados amortiguan el calor.' },
    frio: { n: 'Calefacción', c: '#6fa3c7', d: 'Menos de 12 °C.' }
  };
  const ORDER = ['confort', 'internas', 'solar', 'deshum', 'ventilacion', 'masa', 'frio'];

  window.NAMAY_CLIMA.then(D => {
    const P = D.place || {};
    const avg = (f) => D.typical.flat().reduce((s, r) => s + f(r), 0) / 288;
    q('#bio-intro').innerHTML = `Vereda <b>${P.vereda || '—'}</b>, ${P.municipio || ''} (${P.depto || ''}) · ${D.elevation.toLocaleString('es-CO')} m s.n.m. · presión ${D.pressure_kPa} kPa.
      Analizamos <b>${D.hours.toLocaleString('es-CO')} horas</b> reales (${D.period}): temperatura entre ${D.tMin} y ${D.tMax} °C, humedad media de ${Math.round(avg(r => r[1]))} % y ${D.rainYear.toLocaleString('es-CO')} mm de lluvia al año.`;
    const vEl = document.querySelector('.cf-site-meta [data-count]');
    if (vEl) vEl.closest('span').insertAdjacentHTML('afterend', '');
    const coord = document.querySelector('.cf-site-meta span');
    if (coord && P.vereda) coord.innerHTML = `<b>Vereda ${P.vereda}, ${P.municipio}</b>4.9328° N · 74.4465° O`;

    /* ---- 1. Carpeta: día típico por mes ---- */
    const SC = {
      t: { i: 0, min: 14, max: 30, u: '°C', col: v => v < 18 ? mix('#6fa3c7', '#9cc3a0', (v - 14) / 4) : v < 21 ? mix('#9cc3a0', '#8fb36a', (v - 18) / 3) : v <= 24 ? '#8fb36a' : v <= 27 ? mix('#8fb36a', '#e8b33a', (v - 24) / 3) : mix('#e8b33a', '#d0603a', (v - 27) / 3) },
      rh: { i: 1, min: 40, max: 100, u: '%', col: v => mix('#f3ece2', '#2e5f78', (v - 40) / 60) },
      ghi: { i: 4, min: 0, max: 900, u: 'W/m²', col: v => v < 450 ? mix('#3e2a20', '#e8b33a', v / 450) : mix('#e8b33a', '#fff3c4', (v - 450) / 450) },
      cc: { i: 7, min: 0, max: 100, u: '%', col: v => mix('#e8f1f6', '#6b7780', v / 100) }
    };
    function mix(a, b, k) { k = Math.max(0, Math.min(1, k)); const A = a.match(/\w\w/g).map(x => parseInt(x, 16)), B = b.match(/\w\w/g).map(x => parseInt(x, 16)); return '#' + A.map((x, i) => Math.round(x + (B[i] - x) * k).toString(16).padStart(2, '0')).join(''); }
    const carpet = q('#bio-carpet');
    function drawCarpet(v) {
      const s = SC[v];
      carpet.innerHTML = `<div class="cp-grid">${D.typical.map((row, m) => `<span class="cp-m">${MES[m]}</span>` + row.map((r, h) => `<i style="--c:${s.col(r[s.i])};--k:${(m * 24 + h) % 37}" data-m="${m}" data-h="${h}"></i>`).join('')).join('')}
        <span></span>${Array.from({ length: 24 }, (_, h) => `<b>${h % 3 === 0 ? h : ''}</b>`).join('')}</div><div class="cf-tip" id="cp-tip"></div>`;
      q('#bio-scale').innerHTML = `<span>${s.min} ${s.u}</span><div style="background:linear-gradient(90deg,${[0, .25, .5, .75, 1].map(k => s.col(s.min + (s.max - s.min) * k)).join(',')})"></div><span>${s.max} ${s.u}</span>`;
      carpet.classList.remove('in'); void carpet.offsetWidth; carpet.classList.add('in');
    }
    carpet.addEventListener('mousemove', e => {
      const c = e.target.closest('i'), tip = q('#cp-tip'); if (!c) { tip.classList.remove('on'); return; }
      const r = D.typical[c.dataset.m][c.dataset.h], b = carpet.getBoundingClientRect();
      tip.innerHTML = `<b>${MESL[c.dataset.m]} · ${c.dataset.h}:00</b>${r[0]} °C · ${r[1]} % HR<br>Viento ${DIRS[Math.round(r[3] / 22.5) % 16]} ${r[2]} km/h · Sol ${r[4]} W/m²<br>Nubosidad ${r[7]} %`;
      tip.style.left = `${e.clientX - b.left}px`; tip.style.top = `${e.clientY - b.top}px`; tip.classList.add('on');
    });
    carpet.addEventListener('mouseleave', () => q('#cp-tip')?.classList.remove('on'));
    q('#bio-carpet-var').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; qa('#bio-carpet-var button').forEach(x => x.classList.toggle('on', x === b)); drawCarpet(b.dataset.v); });
    drawCarpet('t');

    /* ---- 2. Carta psicrométrica con zonas de Givoni ---- */
    const Pk = D.pressure_kPa, wR = (t, rh) => { const ps = .61078 * Math.exp(17.27 * t / (t + 237.3)), pv = rh / 100 * ps; return 622 * pv / (Pk - pv); };
    const W = 620, H = 360, L = 44, R = 20, T = 14, B = 34, tx0 = 10, tx1 = 34, wy1 = 24;
    const X = t => L + (t - tx0) / (tx1 - tx0) * (W - L - R), Y = w => H - B - w / wy1 * (H - T - B);
    const curve = (rh, a, b2) => { const p = []; for (let t = a; t <= b2 + 1e-9; t += .5) p.push([X(t), Y(Math.min(wy1, wR(t, rh)))]); return p; };
    const poly = p => p.map(x => x.map(n => n.toFixed(1)).join(',')).join(' ');
    const Zp = {
      solar: [...curve(100, 12, 17), [X(17), Y(0)], [X(12), Y(0)]],
      internas: [...curve(100, 17, 20), [X(20), Y(0)], [X(17), Y(0)]],
      confort: [[X(20), Y(4)], [X(26), Y(4)], ...curve(80, 20, 26).reverse()],
      deshum: [...curve(80, 20, 26), ...curve(100, 20, 26).reverse()],
      ventilacion: [...curve(50, 26, 32), ...curve(100, 26, 32).reverse()],
      masa: [...curve(20, 26, 32), ...curve(50, 26, 32).reverse()]
    };
    const maxN = Math.max(...D.psy.map(p => p[2]));
    q('#bio-psy').innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="psy">
      ${Object.entries(Zp).map(([k, p]) => `<polygon class="pz" data-z="${k}" points="${poly(p)}" style="--c:${ZN[k].c}"/>`).join('')}
      ${[20, 40, 60, 80, 100].map(rh => `<polyline class="rhc${rh === 100 ? ' sat' : ''}" points="${poly(curve(rh, tx0, tx1))}"/><text class="rht" x="${X(Math.min(33, 14 + rh / 8))}" y="${Y(wR(Math.min(33, 14 + rh / 8), rh)) - 4}">${rh}%</text>`).join('')}
      ${D.psy.map(([t, w, n], i) => `<circle class="pp" cx="${X(t).toFixed(1)}" cy="${Y(w).toFixed(1)}" r="${(1.2 + Math.sqrt(n / maxN) * 6).toFixed(1)}" style="--i:${i % 40}"/>`).join('')}
      ${[10, 15, 20, 25, 30].map(t => `<text class="ax" x="${X(t)}" y="${H - 14}" text-anchor="middle">${t}°</text>`).join('')}
      ${[5, 10, 15, 20].map(w => `<text class="ax" x="${L - 8}" y="${Y(w) + 3}" text-anchor="end">${w}</text>`).join('')}
      <text class="ax" x="${W / 2}" y="${H - 1}" text-anchor="middle">temperatura del aire (°C)</text>
      <text class="ax" transform="translate(11 ${H / 2}) rotate(-90)" text-anchor="middle">humedad absoluta (g/kg)</text>
    </svg>`;
    q('#bio-zones').innerHTML = ORDER.filter(k => D.zones[k] > 0).map(k => `<button data-z="${k}" style="--c:${ZN[k].c}"><b>${D.zones[k]} %</b><span>${ZN[k].n}</span></button>`).join('');
    const hl = k => { qa('.pz').forEach(p => p.classList.toggle('dim', k && p.dataset.z !== k)); qa('#bio-zones button').forEach(b => b.classList.toggle('on', b.dataset.z === k)); };
    q('#bio-zones').addEventListener('mouseover', e => { const b = e.target.closest('button'); if (b) hl(b.dataset.z); });
    q('#bio-zones').addEventListener('mouseleave', () => hl(null));
    q('#bio-psy').addEventListener('mouseover', e => { const p = e.target.closest('.pz'); hl(p ? p.dataset.z : null); });

    /* ---- 3. Rosa de vientos ---- */
    const rs = q('#bio-rose-m');
    if (rs) rs.innerHTML = '<option value="12">Todo el año</option>' + MESL.map((m, i) => `<option value="${i}">${m}</option>`).join('');
    const COLS = ['#b9d6e4', '#7fb2cc', '#4f8fb0', '#2e5f78'];
    function drawRose(k) {
      const r = D.rose[k], max = Math.max(...r.d.map(b => b.reduce((a, c) => a + c, 0))) || 1;
      const S = 300, C = S / 2, Rr = 120;
      let petals = '';
      r.d.forEach((b, i) => {
        let acc = 0; const a = (i * 22.5 - 90) * Math.PI / 180, w = 9 * Math.PI / 180;
        b.forEach((v, j) => {
          if (!v) return; const r0 = acc / max * Rr, r1 = (acc + v) / max * Rr; acc += v;
          const p = [[a - w, r0], [a + w, r0], [a + w, r1], [a - w, r1]].map(([an, rr]) => [C + Math.cos(an) * rr, C + Math.sin(an) * rr]);
          petals += `<path d="M${p[0]} L${p[1]} L${p[2]} L${p[3]}z" fill="${COLS[j]}" style="--i:${i}"><title>${DIRS[i]}: ${v} %</title></path>`;
        });
      });
      q('#bio-rose').innerHTML = `<svg viewBox="0 0 ${S} ${S}" class="rose">${[.33, .66, 1].map(f => `<circle cx="${C}" cy="${C}" r="${Rr * f}" class="rr"/>`).join('')}
        ${['N', 'E', 'S', 'O'].map((n, i) => { const an = (i * 90 - 90) * Math.PI / 180; return `<text x="${C + Math.cos(an) * (Rr + 16)}" y="${C + Math.sin(an) * (Rr + 16) + 4}" text-anchor="middle" class="rl">${n}</text>`; }).join('')}
        <g class="petals">${petals}</g><text x="${C + 4}" y="${C - Rr * .66 - 3}" class="rp">${(max * .66).toFixed(1)} %</text></svg>`;
      q('#bio-calm').textContent = `Calma: ${r.calm} %`;
    }
    if (rs) { rs.addEventListener('change', () => drawRose(+rs.value)); drawRose(12); }

    /* ---- 4. Radiación por fachada ---- */
    const fs = q('#bio-fac-m');
    if (fs) fs.innerHTML = '<option value="-1">Promedio anual</option>' + MESL.map((m, i) => `<option value="${i}">${m}</option>`).join('');
    const year = ['N', 'E', 'S', 'O', 'H'].reduce((o, k) => (o[k] = +(D.facade.reduce((s, f) => s + f[k], 0) / 12).toFixed(2), o), {});
    function drawFac(m) {
      const f = m < 0 ? year : D.facade[m], mx = 6;
      const S = 300, C = 150, box = 46, len = v => 18 + v / mx * 82;
      const bar = (k, v, x, y, dx, dy) => `<g class="fb" style="--c:${v === Math.max(f.N, f.E, f.S, f.O) ? '#d0603a' : '#e8b33a'}"><rect x="${dx < 0 ? x - len(v) : dx > 0 ? x : x - 18}" y="${dy < 0 ? y - len(v) : dy > 0 ? y : y - 18}" width="${dx ? len(v) : 36}" height="${dy ? len(v) : 36}" rx="6"/>
        <text x="${x + dx * (len(v) + 26)}" y="${y + dy * (len(v) + 18) + 4}" text-anchor="middle"><tspan class="fk">${k}</tspan> ${v.toFixed(1)}</text></g>`;
      q('#bio-fac').innerHTML = `<svg viewBox="0 0 ${S} ${S}" class="fac">
        ${bar('N', f.N, C, C - box, 0, -1)}${bar('S', f.S, C, C + box, 0, 1)}${bar('E', f.E, C + box, C, 1, 0)}${bar('O', f.O, C - box, C, -1, 0)}
        <rect x="${C - box}" y="${C - box}" width="${box * 2}" height="${box * 2}" rx="8" class="froof" style="--k:${Math.min(1, f.H / 7)}"/>
        <text x="${C}" y="${C - 4}" text-anchor="middle" class="fr1">Cubierta</text><text x="${C}" y="${C + 14}" text-anchor="middle" class="fr2">${f.H.toFixed(1)}</text></svg>`;
      const worst = ['N', 'E', 'S', 'O'].sort((a, b) => f[b] - f[a])[0], nm = { N: 'norte', E: 'oriente', S: 'sur', O: 'occidente' };
      q('#bio-fac-note').innerHTML = `kWh/m² por día. ${m < 0 ? 'En el año' : 'En ' + MESL[m].toLowerCase()} la fachada <b>${nm[worst]}</b> es la más expuesta (${f[worst].toFixed(1)}); la cubierta recibe ${f.H.toFixed(1)}, ${(f.H / f[worst]).toFixed(1)} veces más que cualquier muro.`;
    }
    if (fs) { fs.addEventListener('change', () => drawFac(+fs.value)); drawFac(-1); }

    /* ---- 5. Estrategias calculadas para Namay ---- */
    const Z = D.zones;
    const coldHours = []; for (let h = 0; h < 24; h++) { const t = D.typical.reduce((s, m) => s + m[h][0], 0) / 12; if (t < 20) coldHours.push(h); }
    const hotMonths = D.typical.map((m, i) => [i, Math.max(...m.map(r => r[0]))]).filter(x => x[1] > 26).map(x => MES[x[0]]);
    const wetMonths = D.typical.map((m, i) => [i, m.reduce((s, r) => s + r[8], 0) * 30]).sort((a, b) => b[1] - a[1]).slice(0, 4).map(x => MES[x[0]]);
    const rangeTxt = coldHours.length ? `de ${coldHours.find(h => h > 12) ?? coldHours[0]}:00 a ${[...coldHours].filter(h => h < 12).pop() ?? coldHours.at(-1)}:00` : '';
    const ST = [
      { z: ['internas', 'solar'], t: 'Guardar el calor del día', v: (Z.internas + Z.solar).toFixed(0), d: `Es la necesidad principal: el ${(Z.internas + Z.solar).toFixed(0)} % de las horas están bajo 20 °C, típicamente ${rangeTxt}. Pisos de arcilla y terracota y muros de concreto acumulan el sol de la tarde; al anochecer se cierran la puerta corrediza, la ventana y la cortina. Textiles de lana o lino en la cama.` },
      { z: ['confort'], t: 'Confort natural', v: Z.confort.toFixed(0), d: `El ${Z.confort.toFixed(0)} % de las horas ya son confortables sin ningún sistema, sobre todo entre media mañana y la tarde. El diseño solo debe evitar arruinarlas: sombra al occidente y ventilación.` },
      { z: ['deshum'], t: 'Controlar la humedad', v: Z.deshum.toFixed(0), d: `El ${Z.deshum.toFixed(0)} % de las horas tienen buena temperatura pero humedad sobre 80 %. Ventilación permanente (rejillas o ventana alta abierta), materiales que respiran (arcilla, cal, madera, fibras) y ventilar el baño después de la ducha. Evitar acabados plásticos o vinílicos que atrapan condensación.` },
      { z: ['ventilacion', 'masa'], t: 'Ventilar en las tardes cálidas', v: (Z.ventilacion + Z.masa).toFixed(0), d: `Solo el ${(Z.ventilacion + Z.masa).toFixed(0)} % de las horas pasa de 26 °C, concentradas en ${hotMonths.join(', ') || 'pocos meses'} al mediodía y la tarde. Basta la ventilación cruzada con el viento dominante del occidente, el ventilador de pie y la masa térmica del piso.` },
      { z: [], t: 'Proteger la fachada occidente', v: year.O.toFixed(1), u: 'kWh/m²·día', d: `La fachada occidente es la que más radiación recibe (${year.O.toFixed(1)} kWh/m²·día frente a ${year.N.toFixed(1)} al norte). Si la puerta corrediza mira al occidente: alero o pérgola, celosía de madera, vegetación caducifolia y cortina enrollable en la tarde.` },
      { z: [], t: 'Cubierta y agua lluvia', v: D.rainYear.toLocaleString('es-CO'), u: 'mm/año', d: `La cubierta recibe ${year.H.toFixed(1)} kWh/m²·día: aislarla (cámara de aire bajo la esterilla de bambú) y aprovecharla para calentador solar. Con ${D.rainYear.toLocaleString('es-CO')} mm al año, cada m² de techo puede recoger unos ${Math.round(D.rainYear * .8).toLocaleString('es-CO')} litros: riego y sanitarios, más intensamente en ${wetMonths.join(', ')}.` }
    ];
    q('#bio-strat').innerHTML = `<h3 class="subsection-title">Estrategias calculadas para Namay</h3><div class="bs-grid">${ST.map((s, i) => `<article class="bs rv" style="--d:${i * .07}s;--c:${s.z.length ? ZN[s.z[0]].c : '#d0603a'}"><b class="bs-v">${s.v}<small>${s.u || '% horas'}</small></b><h4>${s.t}</h4><p>${s.d}</p></article>`).join('')}</div>`;
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { root.classList.remove('go'); void root.offsetWidth; root.classList.add('go'); } }), { threshold: .15 }).observe(q('#bio-psy'));
    // que motion.js observe lo nuevo
    setTimeout(() => window.dispatchEvent(new Event('namay:content')), 50);
  }).catch(err => { q('#bio-intro').textContent = 'No se pudieron cargar los datos climáticos.'; console.warn(err); });
})();
