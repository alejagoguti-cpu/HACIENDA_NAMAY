// Construye assets/namay-clima.json a partir de Open-Meteo (ERA5) y Nominatim
const fs = require('fs');
const LAT = 4.932766418742638, LNG = -74.44654586393877;
const get = async (u, h = {}) => { const r = await fetch(u, { headers: h }); if (!r.ok) throw new Error(r.status + ' ' + u); return r.json(); };

(async () => {
  const vars = 'temperature_2m,relative_humidity_2m,dew_point_2m,wind_speed_10m,wind_direction_10m,shortwave_radiation,direct_normal_irradiance,diffuse_radiation,cloud_cover,precipitation';
  const A = await get(`https://archive-api.open-meteo.com/v1/archive?latitude=${LAT}&longitude=${LNG}&start_date=2023-01-01&end_date=2025-12-31&hourly=${vars}&timezone=America%2FBogota`);
  const E = await get(`https://api.open-meteo.com/v1/elevation?latitude=${LAT}&longitude=${LNG}`);
  let place = {};
  try {
    const R = await get(`https://nominatim.openstreetmap.org/reverse?lat=${LAT}&lon=${LNG}&format=jsonv2&zoom=16&accept-language=es`, { 'User-Agent': 'site-builder/1.0' });
    const a = R.address || {};
    place = { vereda: a.hamlet || a.village || a.suburb || a.neighbourhood || '', municipio: a.town || a.city || a.municipality || a.county || '', depto: a.state || '', pais: a.country || '', display: R.display_name };
  } catch (e) { console.warn('nominatim', e.message); }
  const H = A.hourly, N = H.time.length;
  const elev = E.elevation[0];
  const Pkpa = 101.325 * Math.pow(1 - 2.25577e-5 * elev, 5.25588);

  // tiempo solar → posición del sol
  const rad = Math.PI / 180;
  function sunPos(doy, hourLocal) {
    const B = 2 * Math.PI * (doy - 81) / 364;
    const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // min
    const solar = hourLocal + (4 * (LNG - (-75)) + eot) / 60;
    const d = 23.45 * Math.sin(2 * Math.PI * (284 + doy) / 365) * rad;
    const phi = LAT * rad, Hh = 15 * (solar - 12) * rad;
    const sAlt = Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(Hh);
    const alt = Math.asin(sAlt);
    let az = Math.acos(Math.max(-1, Math.min(1, (Math.sin(d) - sAlt * Math.sin(phi)) / (Math.cos(alt) * Math.cos(phi)))));
    if (Hh > 0) az = 2 * Math.PI - az;
    return { alt, az };
  }
  const wRatio = (t, rh) => { const ps = 0.61078 * Math.exp(17.27 * t / (t + 237.3)); const pv = rh / 100 * ps; return 622 * pv / (Pkpa - pv); }; // g/kg

  // acumuladores
  const typ = Array.from({ length: 12 }, () => Array.from({ length: 24 }, () => ({ t: 0, rh: 0, wx: 0, wy: 0, ws: 0, ghi: 0, dni: 0, dif: 0, cc: 0, pr: 0, n: 0 })));
  const FACES = { N: 0, E: 90, S: 180, O: 270 };
  const fac = Array.from({ length: 12 }, () => ({ N: 0, E: 0, S: 0, O: 0, H: 0, days: new Set() }));
  const rose = Array.from({ length: 13 }, () => Array.from({ length: 16 }, () => [0, 0, 0, 0])); // 12 meses + año; bins <5, 5-10, 10-15, >15 km/h (calma aparte)
  const calm = Array(13).fill(0), tot = Array(13).fill(0);
  const psy = {}; // "t|w" -> n
  const zones = { confort: 0, ventilacion: 0, solar: 0, internas: 0, masa: 0, deshum: 0, frio: 0 };
  const zonesM = Array.from({ length: 12 }, () => ({ confort: 0, ventilacion: 0, solar: 0, internas: 0, masa: 0, deshum: 0, frio: 0, n: 0 }));
  let tMin = 99, tMax = -99, rain = 0, years = 0;

  function zone(t, rh, w) {
    if (t >= 20 && t <= 26 && rh <= 80 && w >= 4) return 'confort';
    if (t > 26 && t <= 32 && rh >= 20) return w > 14 || rh > 50 ? 'ventilacion' : 'masa';
    if (t >= 20 && t <= 26 && rh > 80) return 'deshum';
    if (t >= 17 && t < 20) return 'internas';
    if (t >= 12 && t < 17) return 'solar';
    if (t < 12) return 'frio';
    return 'ventilacion';
  }

  for (let i = 0; i < N; i++) {
    const ts = H.time[i], m = +ts.slice(5, 7) - 1, h = +ts.slice(11, 13);
    const t = H.temperature_2m[i], rh = H.relative_humidity_2m[i];
    if (t == null || rh == null) continue;
    const ws = H.wind_speed_10m[i], wd = H.wind_direction_10m[i];
    const ghi = H.shortwave_radiation[i] || 0, dni = H.direct_normal_irradiance[i] || 0, dif = H.diffuse_radiation[i] || 0;
    const c = typ[m][h];
    c.t += t; c.rh += rh; c.ws += ws; c.wx += ws * Math.sin(wd * rad); c.wy += ws * Math.cos(wd * rad);
    c.ghi += ghi; c.dni += dni; c.dif += dif; c.cc += H.cloud_cover[i] || 0; c.pr += H.precipitation[i] || 0; c.n++;
    tMin = Math.min(tMin, t); tMax = Math.max(tMax, t); rain += H.precipitation[i] || 0;
    // radiación en fachadas (Wh/m² por hora → kWh)
    const d = new Date(ts + ':00'), doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
    const s = sunPos(doy, h + .5);
    for (const [k, az] of Object.entries(FACES)) {
      const cosI = Math.cos(s.alt) * Math.cos(s.az - az * rad);
      fac[m][k] += (s.alt > 0 ? dni * Math.max(0, cosI) : 0) + dif * .5 + ghi * .2 * .5;
    }
    fac[m].H += ghi; fac[m].days.add(ts.slice(0, 10));
    // rosa de vientos
    for (const k of [m, 12]) {
      tot[k]++;
      if (ws < 2) { calm[k]++; continue; }
      const di = Math.round(wd / 22.5) % 16, sb = ws < 5 ? 0 : ws < 10 ? 1 : ws < 15 ? 2 : 3;
      rose[k][di][sb]++;
    }
    // psicrométrico
    const w = wRatio(t, rh);
    const key = `${Math.round(t * 2) / 2}|${Math.round(w * 2) / 2}`;
    psy[key] = (psy[key] || 0) + 1;
    const z = zone(t, rh, w); zones[z]++; zonesM[m][z]++; zonesM[m].n++;
  }
  years = 3;

  const r1 = x => Math.round(x * 10) / 10;
  const typical = typ.map(mo => mo.map(c => {
    let wd = Math.atan2(c.wx, c.wy) / rad; if (wd < 0) wd += 360;
    return [r1(c.t / c.n), Math.round(c.rh / c.n), r1(c.ws / c.n), Math.round(wd), Math.round(c.ghi / c.n), Math.round(c.dni / c.n), Math.round(c.dif / c.n), Math.round(c.cc / c.n), Math.round(c.pr / c.n * 100) / 100];
  }));
  const facade = fac.map(f => { const nd = f.days.size; return { N: r1(f.N / nd / 1000), E: r1(f.E / nd / 1000), S: r1(f.S / nd / 1000), O: r1(f.O / nd / 1000), H: r1(f.H / nd / 1000) }; }); // kWh/m²·día
  const nTot = Object.values(zones).reduce((a, b) => a + b, 0);
  const pct = o => Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'n').map(([k, v]) => [k, Math.round(v / (o.n || nTot) * 1000) / 10]));
  const roseOut = rose.map((r, k) => ({ calm: Math.round(calm[k] / tot[k] * 1000) / 10, d: r.map(b => b.map(v => Math.round(v / tot[k] * 1000) / 10)) }));
  const psyOut = Object.entries(psy).map(([k, n]) => { const [t, w] = k.split('|').map(Number); return [t, w, n]; });

  const out = {
    lat: LAT, lng: LNG, elevation: elev, pressure_kPa: r1(Pkpa), place,
    period: '2023-2025', hours: nTot, tMin: r1(tMin), tMax: r1(tMax), rainYear: Math.round(rain / years),
    typical, facade, rose: roseOut, psy: psyOut, zones: pct({ ...zones, n: nTot }), zonesM: zonesM.map(z => pct(z))
  };
  fs.writeFileSync('assets/namay-clima.json', JSON.stringify(out));
  console.log(JSON.stringify({ place, elev, P: out.pressure_kPa, tMin: out.tMin, tMax: out.tMax, rain: out.rainYear, zones: out.zones, facadeYear: facade.reduce((a, f) => ({ N: a.N + f.N / 12, E: a.E + f.E / 12, S: a.S + f.S / 12, O: a.O + f.O / 12, H: a.H + f.H / 12 }), { N: 0, E: 0, S: 0, O: 0, H: 0 }), roseYear: roseOut[12].calm, size: fs.statSync('assets/namay-clima.json').size }, null, 1));
  console.log('typ jul 14h', typical[6][14], 'jan 6h', typical[0][6]);
})();
