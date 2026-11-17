/* ===== AXONOMETRÍA EXPLOTADA: se arma y se abre con el scroll ===== */
(() => {
  const sec = document.getElementById('explotada'); if (!sec) return;
  const stage = document.getElementById('explode-stage');
  const L = n => stage.querySelector('.' + n);
  const roof = L('roof'), wl = L('wallL'), wr = L('wallR'), base = L('base');
  const tags = [...stage.querySelectorAll('.xtag')];
  const steps = [...document.querySelectorAll('#explode-steps li')];
  const meter = document.getElementById('explode-meter');
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const seg = (p, a, b) => ease(Math.min(1, Math.max(0, (p - a) / (b - a))));
  let mx = 0, my = 0, sp = 0;
  stage.addEventListener('mousemove', e => {
    const r = stage.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5;
  });
  stage.addEventListener('mouseleave', () => { mx = my = 0; });

  function tick() {
    const r = sec.getBoundingClientRect();
    const target = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    sp += (target - sp) * .12; // suavizado
    const p = sp;
    if (r.bottom > 0 && r.top < innerHeight) {
      const a = seg(p, .12, .48), b = seg(p, .38, .75);
      // armado = piezas desplazadas hacia el centro; explotado = posición original
      roof.style.transform = `translate(${mx * -16}px, ${my * -16}px) translateY(${(1 - a) * 13}%)`;
      wl.style.transform = `translate(${mx * 9}px, ${my * 9}px) translate(${(1 - b) * 8.2}%, ${(1 - b) * -4.4}%)`;
      wr.style.transform = `translate(${mx * 9}px, ${my * 9}px) translate(${(1 - b) * -8.2}%, ${(1 - b) * -4.4}%)`;
      base.style.transform = `translate(${mx * 4}px, ${my * 4}px)`;
      stage.style.transform = `scale(${.88 + .12 * seg(p, 0, .6)}) rotate(${(1 - seg(p, 0, .8)) * -2.5}deg)`;
      roof.style.filter = `drop-shadow(0 ${34 * a}px ${26 * a}px rgba(62,42,32,${.28 * a}))`;
      wl.style.filter = wr.style.filter = `drop-shadow(0 ${18 * b}px ${16 * b}px rgba(62,42,32,${.22 * b}))`;
      tags.forEach(t => t.classList.toggle('on', p >= +t.dataset.at));
      let cur = 0; steps.forEach((s, i) => { if (p >= +s.dataset.at) cur = i; });
      steps.forEach((s, i) => { s.classList.toggle('on', i === cur); s.classList.toggle('done', i < cur); });
      meter.style.transform = `scaleX(${p})`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
