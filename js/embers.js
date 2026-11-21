// Drifting embers (2D canvas, additive). Off in reduced motion.
import { reduceMotion, lite, pointer, loop, dpr } from './env.js';
export function startEmbers() {
  if (reduceMotion) return null;
  const c = document.createElement('canvas'); c.id = 'fx-embers'; c.setAttribute('aria-hidden', 'true');
  document.body.appendChild(c);
  const ctx = c.getContext('2d');
  let W = 0, H = 0, R = 1;
  const resize = () => { R = Math.min(dpr(), 1.25); W = innerWidth; H = innerHeight; c.width = W * R; c.height = H * R; ctx.setTransform(R, 0, 0, R, 0, 0); };
  resize(); addEventListener('resize', resize);
  const sprite = document.createElement('canvas'); sprite.width = sprite.height = 32;
  const sx = sprite.getContext('2d'); const g = sx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,230,180,1)'); g.addColorStop(0.25, 'rgba(255,140,60,.9)'); g.addColorStop(0.6, 'rgba(180,30,20,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  sx.fillStyle = g; sx.fillRect(0, 0, 32, 32);
  const N = lite ? 26 : 70;
  const ps = [];
  const spawn = (p, init) => { p.x = Math.random() * W; p.y = init ? Math.random() * H : H + 20; p.vy = -(12 + Math.random() * 38); p.vx = (Math.random() - 0.5) * 10; p.s = 2 + Math.random() * 7; p.life = 0; p.max = 6 + Math.random() * 10; p.ph = Math.random() * 6.28; p.f = 1 + Math.random() * 3; return p; };
  for (let i = 0; i < N; i++) ps.push(spawn({}, true));
  const api = { boost: 1 };
  const l = loop((t, dt) => {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of ps) {
      p.life += dt;
      const dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy;
      if (pointer.active && d2 < 18000) { const f = (1 - d2 / 18000) * 60; p.vx += (dx / Math.sqrt(d2 + 1)) * f * dt; }
      p.x += (p.vx + Math.sin(t * p.f + p.ph) * 14) * dt; p.y += p.vy * dt * api.boost; p.vx *= 0.99;
      const a = Math.min(1, p.life / 1.5) * Math.max(0, 1 - p.life / p.max) * (0.55 + 0.45 * Math.sin(t * 7 * p.f + p.ph));
      if (p.y < -30 || p.life > p.max) spawn(p);
      ctx.globalAlpha = Math.max(0, a);
      ctx.drawImage(sprite, p.x - p.s, p.y - p.s, p.s * 2, p.s * 2);
    }
    ctx.globalAlpha = 1;
  }, { fps: lite ? 30 : 60 });
  return { api, stop() { l.stop(); c.remove(); } };
}
