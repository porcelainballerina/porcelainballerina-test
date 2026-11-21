// Shared environment flags
export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const coarse = window.matchMedia('(pointer: coarse)').matches;
export const small = window.matchMedia('(max-width: 760px)').matches;
export const lite = coarse || small || (navigator.hardwareConcurrency || 8) <= 4;
export const maxDPR = lite ? 1 : 1.5;
export const dpr = () => Math.min(window.devicePixelRatio || 1, maxDPR);
export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) { return false; }
}
export const pointer = { x: 0, y: 0, nx: 0, ny: 0, active: false };
window.addEventListener('pointermove', (e) => {
  pointer.x = e.clientX; pointer.y = e.clientY;
  pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.ny = (e.clientY / window.innerHeight) * 2 - 1;
  pointer.active = true;
}, { passive: true });
export const ROOT = new URL('../', import.meta.url);
// simple seeded RNG
export function rng(seed) {
  let h = 1779033703 ^ String(seed).length;
  for (const ch of String(seed)) { h = Math.imul(h ^ ch.charCodeAt(0), 3432918353); h = (h << 13) | (h >>> 19); }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
// visibility-aware RAF loop
export function loop(fn, { el = null, fps = 60 } = {}) {
  let raf = 0, visible = true, last = 0, stopped = false;
  const minDt = 1000 / fps;
  let io = null;
  if (el && 'IntersectionObserver' in window) {
    io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) kick(); }, { rootMargin: '100px' });
    io.observe(el);
  }
  function frame(t) {
    raf = 0;
    if (stopped || !visible || document.hidden) return;
    if (t - last >= minDt - 1) { const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t; fn(t / 1000, dt); }
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && !stopped) raf = requestAnimationFrame(frame); }
  const onVis = () => { if (!document.hidden) { last = 0; kick(); } };
  document.addEventListener('visibilitychange', onVis);
  kick();
  return { stop() { stopped = true; if (raf) cancelAnimationFrame(raf); io && io.disconnect(); document.removeEventListener('visibilitychange', onVis); }, kick };
}
