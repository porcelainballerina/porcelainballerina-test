// Scroll-driven porcelain fracture: cracks spread from an impact, then shards fall away.
import { dpr, lite, loop, rng } from './env.js';
import { sigilToCanvas } from './sigil.js';

export function startCrack(section, { sound } = {}) {
  const canvas = section.querySelector('.crack-canvas');
  const hint = section.querySelector('.crack-hint');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, R = 1, surface = null, edges = [], shards = [], C = { x: 0, y: 0 }, maxD = 1;
  let sigilImg = null;
  sigilToCanvas('porcelain-seal', 1024, '#8a6a3a', '#9c1418', 2.2).then((c) => { sigilImg = c; build(); draw(true); });

  function paintSurface() {
    surface = document.createElement('canvas'); surface.width = W * R; surface.height = H * R;
    const s = surface.getContext('2d'); s.scale(R, R);
    const g = s.createRadialGradient(W * 0.45, H * 0.35, 0, W * 0.5, H * 0.5, Math.hypot(W, H) * 0.7);
    g.addColorStop(0, '#f6f1e6'); g.addColorStop(0.55, '#e4dccb'); g.addColorStop(1, '#a99d86');
    s.fillStyle = g; s.fillRect(0, 0, W, H);
    // glaze sheen
    const sh = s.createLinearGradient(0, 0, W, H); sh.addColorStop(0.3, 'rgba(255,255,255,0)'); sh.addColorStop(0.45, 'rgba(255,255,255,.35)'); sh.addColorStop(0.55, 'rgba(255,255,255,0)');
    s.fillStyle = sh; s.fillRect(0, 0, W, H);
    // fine crazing
    const r = rng('craze'); s.strokeStyle = 'rgba(90,80,70,.10)'; s.lineWidth = 0.6;
    for (let i = 0; i < 160; i++) { let x = r() * W, y = r() * H; s.beginPath(); s.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (r() - 0.5) * 60; y += (r() - 0.5) * 60; s.lineTo(x, y); } s.stroke(); }
    // painted blue-grey ornament border
    s.strokeStyle = 'rgba(120,20,22,.35)'; s.lineWidth = 1.2; const m = Math.min(W, H) * 0.05;
    s.strokeRect(m, m, W - 2 * m, H - 2 * m); s.strokeRect(m + 8, m + 8, W - 2 * m - 16, H - 2 * m - 16);
    if (sigilImg) { const sz = Math.min(W, H) * 0.62; s.globalAlpha = 0.85; s.drawImage(sigilImg, C.x - sz / 2, C.y - sz / 2, sz, sz); s.globalAlpha = 1; }
    s.fillStyle = 'rgba(80,14,16,.82)'; s.textAlign = 'center';
    s.font = `${Math.min(W * 0.075, 74)}px Unifraktur, serif`; s.fillText('Porcelain Ballerina', C.x, H * 0.86);
    s.font = `${Math.min(W * 0.022, 17)}px "Fell SC", serif`; s.fillStyle = 'rgba(80,50,30,.75)';
    s.fillText('F R A G I L E   ·   H A N D L E   W I T H   R E V E R E N C E', C.x, H * 0.86 + Math.min(W * 0.04, 34));
  }

  function build() {
    R = Math.min(dpr(), 1.5); W = section.clientWidth; H = innerHeight;
    canvas.width = W * R; canvas.height = H * R; ctx.setTransform(R, 0, 0, R, 0, 0);
    C = { x: W * 0.5, y: H * 0.46 };
    paintSurface();
    const r = rng('fracture');
    const M = lite ? 11 : 15; const diag = Math.hypot(W, H);
    const radii = [0.05, 0.12, 0.21, 0.33, 0.48, 0.66, 0.9].map((v) => v * diag * 0.62);
    const ang = []; for (let m = 0; m < M; m++) ang.push((m / M) * Math.PI * 2 + (r() - 0.5) * 0.25);
    const P = radii.map((rad) => ang.map((a) => { const j = rad * (1 + (r() - 0.5) * 0.32); const aa = a + (r() - 0.5) * 0.22; return { x: C.x + Math.cos(aa) * j, y: C.y + Math.sin(aa) * j }; }));
    const jag = (a, b, n = 3, amt = 0.22) => { const pts = [a]; for (let i = 1; i <= n; i++) { const t = i / (n + 1); const dx = b.x - a.x, dy = b.y - a.y; const len = Math.hypot(dx, dy); const off = (r() - 0.5) * len * amt; pts.push({ x: a.x + dx * t - (dy / len) * off, y: a.y + dy * t + (dx / len) * off }); } pts.push(b); return pts; };
    const center = { x: C.x, y: C.y };
    const radial = [], ring = [];
    for (let m = 0; m < M; m++) { radial.push([jag(center, P[0][m], 1, 0.2)]); for (let k = 0; k < radii.length - 1; k++) radial[m].push(jag(P[k][m], P[k + 1][m], 3, 0.26)); }
    for (let k = 0; k < radii.length; k++) { ring.push([]); for (let m = 0; m < M; m++) ring[k].push(jag(P[k][m], P[k][(m + 1) % M], 3, 0.3)); }
    edges = []; const addE = (pts) => { const mid = pts[Math.floor(pts.length / 2)]; const d0 = Math.hypot(pts[0].x - C.x, pts[0].y - C.y), d1 = Math.hypot(pts[pts.length - 1].x - C.x, pts[pts.length - 1].y - C.y); edges.push({ pts, d: Math.min(d0, d1), d2: Math.max(d0, d1), rev: d1 < d0 }); };
    radial.forEach((arr) => arr.forEach(addE)); ring.forEach((arr, k) => { if (k < radii.length - 1) arr.forEach(addE); });
    shards = [];
    const rev = (a) => a.slice().reverse();
    for (let m = 0; m < M; m++) {
      const m2 = (m + 1) % M;
      shards.push(mk([...radial[m][0], ...ring[0][m].slice(1), ...rev(radial[m2][0]).slice(1)]));
      for (let k = 0; k < radii.length - 1; k++) {
        const poly = [...radial[m][k + 1], ...ring[k + 1][m].slice(1), ...rev(radial[m2][k + 1]).slice(1), ...rev(ring[k][m]).slice(1)];
        if (r() < 0.45) { // split along the diagonal P[k][m] -> P[k+1][m2]
          shards.push(mk([...radial[m][k + 1], ...ring[k + 1][m].slice(1)]));
          shards.push(mk([...ring[k][m], ...radial[m2][k + 1].slice(1)]));
        } else shards.push(mk(poly));
      }
    }
    maxD = Math.max(...shards.map((s) => s.d)) || 1;
    function mk(poly) {
      let cx = 0, cy = 0; poly.forEach((p) => { cx += p.x; cy += p.y; }); cx /= poly.length; cy /= poly.length;
      const d = Math.hypot(cx - C.x, cy - C.y);
      return { poly, cx, cy, d, rot: (r() - 0.5) * 2.4, vx: (cx - C.x) / (W * 0.5) * (0.4 + r() * 0.8), vz: 0.75 + r() * 0.5, jitter: r() * 0.12, shade: 0.75 + r() * 0.35 };
    }
  }

  let lastP = -1, cracked = false;
  function progress() { const r = section.getBoundingClientRect(); const total = section.offsetHeight - innerHeight; return Math.max(0, Math.min(1, -r.top / Math.max(1, total))); }

  function draw(force) {
    const p = progress();
    if (!force && Math.abs(p - lastP) < 0.0004) return;
    lastP = p;
    section.style.setProperty('--p', p.toFixed(3));
    hint && hint.classList.toggle('is-gone', p > 0.06);
    if (sound) { if (p > 0.1 && !cracked) { cracked = true; sound.impact(); } else if (p < 0.04) cracked = false; }
    ctx.clearRect(0, 0, W, H);
    const crackP = Math.max(0, Math.min(1, (p - 0.06) / 0.38));
    const fallP = Math.max(0, (p - 0.42) / 0.5);
    const front = crackP * Math.hypot(W, H) * 0.62;
    if (fallP <= 0) {
      ctx.drawImage(surface, 0, 0, W, H);
    } else {
      for (const s of shards) {
        const t = Math.max(0, Math.min(1, (fallP - (s.d / maxD) * 0.45 - s.jitter) / 0.45));
        if (t >= 1) continue;
        const e = t * t;
        ctx.save();
        ctx.globalAlpha = 1 - Math.pow(t, 4);
        ctx.translate(s.cx + s.vx * t * W * 0.18, s.cy + e * H * 1.25);
        ctx.rotate(s.rot * t);
        ctx.scale(1 - t * 0.25 * s.vz, 1 - t * 0.25 * s.vz);
        ctx.translate(-s.cx, -s.cy);
        ctx.beginPath(); s.poly.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath();
        ctx.save(); ctx.clip(); ctx.drawImage(surface, 0, 0, W, H);
        if (t > 0) { ctx.fillStyle = `rgba(20,6,6,${(t * 0.5 * s.shade).toFixed(3)})`; ctx.fill(); }
        ctx.restore();
        ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(255,250,240,.55)'; ctx.stroke();
        ctx.restore();
      }
    }
    if (crackP > 0 && fallP < 0.35) {
      const glow = Math.min(1, crackP * 1.4) * (1 - fallP / 0.35);
      for (const pass of [0, 1]) {
        ctx.beginPath();
        for (const e of edges) {
          if (front <= e.d) continue;
          const pts = e.rev ? e.pts.slice().reverse() : e.pts;
          const k = Math.min(1, (front - e.d) / Math.max(1, e.d2 - e.d));
          const n = pts.length - 1; const upto = k * n;
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i <= Math.ceil(upto); i++) { const f = Math.min(1, upto - (i - 1)); ctx.lineTo(pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f, pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f); }
        }
        if (pass === 0) { ctx.strokeStyle = `rgba(200,40,24,${(0.45 * glow).toFixed(3)})`; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.strokeStyle = `rgba(255,150,70,${(0.45 * glow).toFixed(3)})`; ctx.lineWidth = 2; ctx.stroke(); }
        else { ctx.strokeStyle = `rgba(25,8,6,${(0.95 * glow).toFixed(3)})`; ctx.lineWidth = 1.1; ctx.stroke(); }
      }
      // impact bloom
      const b = ctx.createRadialGradient(C.x, C.y, 0, C.x, C.y, 90); b.addColorStop(0, `rgba(255,170,90,${(0.5 * glow).toFixed(3)})`); b.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = b; ctx.fillRect(C.x - 90, C.y - 90, 180, 180);
    }
  }

  build();
  const onResize = () => { build(); draw(true); };
  addEventListener('resize', onResize);
  document.fonts && document.fonts.ready.then(() => { paintSurface(); draw(true); });
  const l = loop(() => draw(false), { el: section, fps: 60 });
  draw(true);
  return { destroy() { l.stop(); removeEventListener('resize', onResize); } };
}
