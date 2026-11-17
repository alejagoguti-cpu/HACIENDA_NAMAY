/* ===== EL LUGAR: MAPA + CLIMA DE NAMAY ===== */
(() => {
  const q = s => document.querySelector(s);
  const LAT = 4.932766418742638, LNG = -74.44654586393877;
  // [mes, t media, t máx, t mín, humedad %, lluvia mm] · Open-Meteo ERA5, promedio 2023–2025
  const CLIMA = [[1,20.2,24.9,15.7,78,144],[2,20.4,24.8,16.5,82,266],[3,20.7,25.2,16.8,82,315],[4,20.7,25,16.9,83,343],[5,21.2,25.6,17.2,81,239],[6,21.1,25.6,16.8,77,132],[7,21.8,27.1,16.8,69,65],[8,22,27.5,16.8,67,79],[9,22.5,28.1,17.3,66,93],[10,21.2,25.9,17.1,79,220],[11,20.5,25,16.8,84,294],[12,20.6,25.4,16.6,82,216]];
  const MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const MESL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  /* Mapa satelital (se crea al entrar en pantalla) */
  const mapEl = q('#cf-map');
  if (mapEl && window.L) {
    const io = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return; io.disconnect();
      const map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([LAT, LNG], 12);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19, attribution: 'Imagen &copy; Esri, Maxar, Earthstar Geographics'
      }).addTo(map);
      const icon = L.divIcon({ className: 'cf-pin', html: '<span></span><i></i>', iconSize: [40, 40], iconAnchor: [20, 20] });
      L.marker([LAT, LNG], { icon }).addTo(map).bindPopup('<b>Hacienda Namay</b><br>Finca de descanso');
      L.circle([LAT, LNG], { radius: 180, color: '#e8b33a', weight: 2, fillOpacity: .08 }).addTo(map);
      setTimeout(() => map.flyTo([LAT, LNG], 17, { duration: 3.2 }), 600);
    }, { threshold: .3 });
    io.observe(mapEl);
  }

  /* Contador de altitud */
  const cnt = document.querySelectorAll('.cf-site-meta [data-count]');
  const io2 = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const b = e.target, end = +b.dataset.count, t0 = performance.now();
    const st = t => { const k = Math.min(1, (t - t0) / 1600); b.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString('es-CO'); if (k < 1) requestAnimationFrame(st); };
    requestAnimationFrame(st);
  }), { threshold: .5 });
  cnt.forEach(b => io2.observe(b));

  /* Gráfica de clima (SVG animado) */
  const ch = q('#cf-chart');
  if (ch) {
    const W = 640, H = 260, P = { l: 36, r: 36, t: 16, b: 30 };
    const x = i => P.l + (i + .5) * (W - P.l - P.r) / 12;
    const yT = t => P.t + (32 - t) / (32 - 12) * (H - P.t - P.b);      // 12–32 °C
    const yH = h => P.t + (100 - h) / 100 * (H - P.t - P.b);            // 0–100 %
    const rainMax = 360, bw = (W - P.l - P.r) / 12 * .5;
    const band = CLIMA.map((d, i) => `${x(i)},${yT(d[2])}`).join(' ') + ' ' + [...CLIMA].reverse().map((d, j) => `${x(11 - j)},${yT(d[3])}`).join(' ');
    const line = (arr, f) => arr.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${f(d)}`).join(' ');
    const comfortY1 = yT(24), comfortY2 = yT(21), humY1 = yH(55), humY2 = yH(45);
    ch.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="cf-chart-svg">
      <rect x="${P.l}" y="${comfortY1}" width="${W - P.l - P.r}" height="${comfortY2 - comfortY1}" class="zone"/>
      <text x="${W - P.r - 4}" y="${comfortY1 + 12}" class="zt" text-anchor="end">confort 21–24 °C</text>
      <line x1="${P.l}" x2="${W - P.r}" y1="${humY1}" y2="${humY1}" class="hz"/><line x1="${P.l}" x2="${W - P.r}" y1="${humY2}" y2="${humY2}" class="hz"/>
      <text x="${P.l + 4}" y="${humY2 + 12}" class="zt hum">humedad ideal 45–55 %</text>
      ${CLIMA.map((d, i) => { const h = d[5] / rainMax * (H - P.t - P.b) * .55; return `<rect class="rain" x="${x(i) - bw / 2}" y="${H - P.b - h}" width="${bw}" height="${h}" rx="3" style="--i:${i}"/>`; }).join('')}
      <polygon class="band" points="${band}"/>
      <path class="mean" d="${line(CLIMA, d => yT(d[1]))}"/>
      <path class="hum" d="${line(CLIMA, d => yH(d[4]))}"/>
      ${CLIMA.map((d, i) => `<circle class="dot" cx="${x(i)}" cy="${yT(d[1])}" r="3.5"/><text class="mx" x="${x(i)}" y="${H - 10}" text-anchor="middle">${MES[i]}</text>
        <rect class="hit" x="${x(i) - (W - P.l - P.r) / 24}" y="${P.t}" width="${(W - P.l - P.r) / 12}" height="${H - P.t - P.b}" data-i="${i}"/>`).join('')}
      <text x="8" y="${yT(30)}" class="ax">30°</text><text x="8" y="${yT(20)}" class="ax">20°</text>
      <text x="${W - 30}" y="${yH(80)}" class="ax hum">80%</text><text x="${W - 30}" y="${yH(60)}" class="ax hum">60%</text>
    </svg><div class="cf-tip" id="cf-tip"></div>`;
    const tip = q('#cf-tip'), svg = ch.querySelector('svg');
    svg.addEventListener('mousemove', e => {
      const r = e.target.closest('.hit'); if (!r) { tip.classList.remove('on'); return; }
      const d = CLIMA[+r.dataset.i], b = ch.getBoundingClientRect();
      tip.innerHTML = `<b>${MESL[d[0] - 1]}</b>Media ${d[1]} °C · ${d[3]}–${d[2]} °C<br>Humedad ${d[4]} % · Lluvia ${d[5]} mm`;
      tip.style.left = `${e.clientX - b.left}px`; tip.style.top = `${e.clientY - b.top}px`; tip.classList.add('on');
    });
    svg.addEventListener('mouseleave', () => tip.classList.remove('on'));
    svg.addEventListener('click', e => { const r = e.target.closest('.hit'); if (r) pickMonth(+r.dataset.i); });
    // dibujar al entrar, cada vez
    new IntersectionObserver(es => es.forEach(e => ch.classList.toggle('draw', e.isIntersecting)), { threshold: .3 }).observe(ch);
  }

  /* Simulador: mes real */
  const sel = q('#cf-mes'), tI = q('#cf-t'), hI = q('#cf-h');
  function pickMonth(i) {
    if (!sel) return;
    sel.value = String(i);
    const d = CLIMA[i];
    q('#cf-clima button[data-c="medio"]')?.click();
    tI.value = d[1]; hI.value = d[4];
    tI.dispatchEvent(new Event('input')); hI.dispatchEvent(new Event('input'));
    q('.cf-sim')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  if (sel) {
    sel.innerHTML += CLIMA.map((d, i) => `<option value="${i}">${MESL[i]} · ${d[1]} °C · ${d[4]} %</option>`).join('');
    sel.addEventListener('change', () => {
      if (sel.value === '') return;
      const d = CLIMA[+sel.value];
      q('#cf-clima button[data-c="medio"]')?.click();
      tI.value = d[1]; hI.value = d[4];
      tI.dispatchEvent(new Event('input')); hI.dispatchEvent(new Event('input'));
    });
    // arranca con el mes actual
    const now = new Date().getMonth();
    sel.value = String(now); sel.dispatchEvent(new Event('change'));
  }
})();
