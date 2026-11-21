// Original abstract sigils: concentric circles, star polygons {n/k}, ticks and glyph marks.
import { rng } from './env.js';
const NS = 'http://www.w3.org/2000/svg';
export function sigilMarkup(seed) {
  const r = rng(seed);
  const parts = [];
  const n = [7, 9, 11, 13][Math.floor(r() * 4)];
  const k = n === 7 ? 3 : n === 9 ? 4 : n === 11 ? 4 : 5;
  const R = 40;
  parts.push(`<circle r="${R + 6}"/>`, `<circle r="${R + 2}" class="s-red"/>`);
  // ticks between rings
  let ticks = '';
  const tn = n * 3;
  for (let i = 0; i < tn; i++) {
    const a = (i / tn) * Math.PI * 2; const l = i % 3 === 0 ? 5 : 2.5;
    ticks += `M${(Math.cos(a) * (R + 2)).toFixed(2)} ${(Math.sin(a) * (R + 2)).toFixed(2)}L${(Math.cos(a) * (R + 2 + l)).toFixed(2)} ${(Math.sin(a) * (R + 2 + l)).toFixed(2)}`;
  }
  parts.push(`<path d="${ticks}"/>`);
  // star polygon
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = ((i * k) / n) * Math.PI * 2 - Math.PI / 2;
    d += (i ? 'L' : 'M') + (Math.cos(a) * R).toFixed(2) + ' ' + (Math.sin(a) * R).toFixed(2);
  }
  parts.push(`<path d="${d}"/>`);
  const r2 = R * (0.38 + r() * 0.12);
  parts.push(`<circle r="${r2.toFixed(2)}"/>`);
  // inner glyph: random strokes from center lattice
  let g = '';
  const pts = [];
  for (let i = 0; i < 6; i++) { const a = r() * Math.PI * 2; const rr = r() * r2 * 0.85; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
  g += `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) g += (r() < 0.25 ? 'M' : 'L') + pts[i][0].toFixed(2) + ' ' + pts[i][1].toFixed(2);
  g += `M0 ${(-r2).toFixed(2)}L0 ${r2.toFixed(2)}`;
  parts.push(`<path d="${g}" class="s-red"/>`);
  // nodes at star points
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    if (r() < 0.5) parts.push(`<circle class="s-dot" cx="${(Math.cos(a) * R).toFixed(2)}" cy="${(Math.sin(a) * R).toFixed(2)}" r="1.6"/>`);
  }
  return parts.join('');
}
export function drawSigils(root = document, { animate = true } = {}) {
  root.querySelectorAll('svg.sigil[data-seed]:not([data-drawn])').forEach((svg) => {
    svg.innerHTML = sigilMarkup(svg.dataset.seed);
    svg.setAttribute('data-drawn', '');
    if (!animate || svg.hasAttribute('data-static')) return;
    const els = svg.querySelectorAll('path,circle:not(.s-dot)');
    els.forEach((el) => {
      let len = 300;
      try { len = el.getTotalLength(); } catch (e) {}
      el.style.strokeDasharray = len; el.style.strokeDashoffset = len;
      el.style.transition = 'none';
    });
    svg.classList.add('sigil-pending');
  });
}
export function inkSigil(svg) {
  if (!svg.classList.contains('sigil-pending')) return;
  svg.classList.remove('sigil-pending');
  const els = svg.querySelectorAll('path,circle:not(.s-dot)');
  els.forEach((el, i) => {
    el.style.transition = `stroke-dashoffset ${2.4 + i * 0.25}s cubic-bezier(.4,.1,.2,1) ${i * 0.18}s`;
    requestAnimationFrame(() => { el.style.strokeDashoffset = 0; });
  });
}
// draw a sigil onto a 2D canvas context (for WebGL textures)
export function sigilToCanvas(seed, size = 512, color = '#c9a868', red = '#b3191f', lw = 2) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const svg = `<svg xmlns="${NS}" viewBox="-50 -50 100 100" width="${size}" height="${size}"><g fill="none" stroke="${color}" stroke-width="${lw * 100 / size}">${sigilMarkup(seed).replace(/class="s-red"/g, `stroke="${red}"`).replace(/class="s-dot"/g, `fill="${color}" stroke="none"`)}</g></svg>`;
  const img = new Image();
  const p = new Promise((res) => { img.onload = () => { c.getContext('2d').drawImage(img, 0, 0, size, size); res(c); }; img.onerror = () => res(c); });
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return p;
}
