// Porcelain Ballerina — core: atmosphere layers, sound toggle, ink reveals, tilt, seamless page transitions.
import { reduceMotion, coarse, hasWebGL, ROOT } from './env.js';
import { sound } from './audio.js';
import { isSealCode } from './seal-code.js';
import { startSmoke } from './smoke.js';
import { startEmbers } from './embers.js';
import { drawSigils, inkSigil } from './sigil.js';

const CONTROLLERS = { home: './home.js', albums: './albums.js', gallery: './gallery.js', images: './gallery.js', tarot: './tarot.js', about: './library.js' };
const doc = document.documentElement;
if (reduceMotion) doc.classList.add('calm');
if (hasWebGL()) doc.classList.add('has-webgl-support');

// ---------- persistent layers ----------
const base = document.createElement('div'); base.className = 'fx-base'; base.setAttribute('aria-hidden', 'true');
document.body.prepend(base);
const sym = document.createElement('div'); sym.className = 'fx-symbol'; sym.setAttribute('aria-hidden', 'true'); base.after(sym);
let symIO = null;
let heroIO = null;
function heroCorners(root) { heroIO?.disconnect(); document.body.classList.remove('at-hero'); const h = (root || document).querySelector('.hero'); if (!h || !('IntersectionObserver' in window)) return; heroIO = new IntersectionObserver(([e]) => document.body.classList.toggle('at-hero', e.intersectionRatio > 0.6), { threshold: [0, 0.6, 1] }); heroIO.observe(h); }
function symHush(root) { heroCorners(root); symIO?.disconnect(); document.body.classList.remove('sym-hush'); const d = (root || document).querySelector('#doors'); if (!d || !('IntersectionObserver' in window)) return; symIO = new IntersectionObserver(([e]) => document.body.classList.toggle('sym-hush', e.isIntersecting), { threshold: 0.25 }); symIO.observe(d); }
const smoke = startSmoke();
const embers = startEmbers();
for (const cls of ['fx-vignette', 'fx-grain', 'fx-burn', 'fx-candles', 'fx-corner fx-corner-tl', 'fx-corner fx-corner-tr', 'fx-corner fx-corner-bl', 'fx-corner fx-corner-br', 'fx-edge fx-edge-t', 'fx-edge fx-edge-b', 'fx-frieze fx-frieze-t', 'fx-frieze fx-frieze-b']) { const d = document.createElement('div'); d.className = cls; d.setAttribute('aria-hidden', 'true'); if (cls.startsWith('fx-frieze')) d.innerHTML = '<i class="fz fz-l"></i><i class="fz fz-r"></i>'; document.body.appendChild(d); }
const veil = document.createElement('div'); veil.className = 'fx-veil'; veil.setAttribute('aria-hidden', 'true');
veil.innerHTML = '<svg class="sigil" data-seed="veil" data-static viewBox="-50 -50 100 100"></svg>';
document.body.appendChild(veil);

// ---------- held candle: warm light that follows the cursor and flickers ----------
const candle = document.createElement('div'); candle.className = 'fx-candle'; candle.setAttribute('aria-hidden', 'true');
document.body.appendChild(candle);
function inkDefs() {
  if (document.getElementById('pbInkDefs')) return;
  const d = document.createElement('div'); d.id = 'pbInkDefs'; d.setAttribute('aria-hidden', 'true');
  d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML = '<svg width="0" height="0"><filter id="pbInk" x="-5%" y="-10%" width="110%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/></filter>'
    + '<filter id="pbInkPen" x="-10%" y="-20%" width="120%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0.9" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="0.35" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="d"/></feMerge></filter>'
    + '<filter id="pbInkTitle" x="-6%" y="-20%" width="112%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="11" result="den"/><feColorMatrix in="den" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.1 0.25" result="dm"/><feComposite in="d" in2="dm" operator="in" result="ink"/><feGaussianBlur in="d" stdDeviation="1.1" result="bl"/><feComponentTransfer in="bl" result="bleed"><feFuncA type="linear" slope="0.38"/></feComponentTransfer><feMerge><feMergeNode in="bleed"/><feMergeNode in="ink"/><feMergeNode in="ink"/></feMerge></filter></svg>';
  document.body.appendChild(d);
}
inkDefs();
// ---- handwriting: every title letter sits a little off the line, like a quill wrote it ----
function handwrite(node) {
  const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT); const texts = [];
  while (walk.nextNode()) texts.push(walk.currentNode);
  texts.forEach((t) => {
    const frag = document.createDocumentFragment();
    t.textContent.split(/(\s+)/).forEach((word) => {
      if (!word) return;
      if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(word)); return; }
      const w = document.createElement('span'); w.className = 'hw';
      [...word].forEach((c) => {
        const ch = document.createElement('span'); ch.className = 'ch'; ch.textContent = c;
        if (!reduceMotion) ch.style.cssText = `rotate:${(Math.random() * 4 - 2).toFixed(2)}deg;translate:0 ${(Math.random() * 0.06 - 0.03).toFixed(3)}em;opacity:${(0.86 + Math.random() * 0.14).toFixed(2)}`;
        w.appendChild(ch);
      });
      frag.appendChild(w);
    });
    t.replaceWith(frag);
  });
}
// ---- relics: skulls, daggers, ouroboros and sigils scattered in the margins of every page ----
const RELICS = ['skull-daggers', 'ouroboros', 'corner'];
function scatterRelics(root) {
  const main = root.querySelector('main'); if (!main || main.querySelector(':scope > .relics')) return;
  const box = document.createElement('div'); box.className = 'relics'; box.setAttribute('aria-hidden', 'true');
  const H = Math.max(main.scrollHeight, innerHeight); const n = Math.max(3, Math.round(H / 620));
  let seed = (location.pathname.length * 97) % 233;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let k = 0; k < n; k++) {
    const i = document.createElement('i'); const kind = RELICS[k % 3]; const side = k % 2 ? 'r' : 'l';
    i.className = `relic relic-${kind} relic-${side}`;
    i.style.cssText = `top:${Math.round(((k + 0.35 + rnd() * 0.3) / n) * 100)}%;--s:${(0.75 + rnd() * 0.5).toFixed(2)};--rot:${Math.round(rnd() * 40 - 20)}deg;--op:${(0.13 + rnd() * 0.1).toFixed(2)}`;
    box.appendChild(i);
  }
  main.style.position = main.style.position || 'relative';
  main.prepend(box);
}
// ---- blood titles: every big blackletter title is written in blood that runs ----
function bleedTitles(root) {
  root.querySelectorAll('h1.title-fraktur, h2.title-fraktur, .section-title, .lib-h').forEach((h, n) => {
    if (h.querySelector('.bt')) return;
    const span = document.createElement('span'); span.className = 'bt';
    while (h.firstChild) span.appendChild(h.firstChild);
    h.appendChild(span);
    handwrite(span);
    // a few loose specks of ink flicked from the nib
    const nS = h.matches('h1, .lib-h') ? 6 : 0;
    for (let k = 0; k < nS; k++) {
      const sp = document.createElement('b'); sp.className = 'speck'; sp.setAttribute('aria-hidden', 'true');
      sp.style.cssText = `left:${(Math.random() * 100).toFixed(1)}%;top:${(Math.random() < 0.5 ? -8 - Math.random() * 14 : 92 + Math.random() * 18).toFixed(1)}%;--sz:${(2 + Math.random() * 4.5).toFixed(1)}px;--o:${(0.35 + Math.random() * 0.4).toFixed(2)}`;
      span.appendChild(sp);
    }
    if (reduceMotion || !h.matches('h1, .lib-h')) return;   // v44: blood drips on page titles only
    const big = true; const count = big ? 7 : 4;
    for (let k = 0; k < count; k++) {
      const d = document.createElement('b'); d.className = 'drip'; d.setAttribute('aria-hidden', 'true');
      const wd = (big ? 2.5 : 1.8) + Math.random() * (big ? 3.5 : 2);
      d.style.cssText = `left:${6 + Math.random() * 88}%;--w:${wd.toFixed(1)}px;--h:${Math.round((big ? 22 : 12) + Math.random() * (big ? 70 : 34))}px;--t:${(4 + Math.random() * 5).toFixed(1)}s;--d:${(0.6 + Math.random() * 3).toFixed(1)}s`;
      span.appendChild(d);
    }
  });
}
// ---- the forbidden layer: scratched warnings, case-file headers, flicker, glitch ----
// v44: the case-file line belongs to the archive rooms only, one folio numbering (the nav's room numbers)
const FOLIO = { gallery: 'III', wards: 'III' };
// ---- prose: illuminated initials, thorn rules and tiny skull/dagger ornaments between paragraphs ----
const ORN = ['<i class="orn-emb"></i>',
  '<svg viewBox="0 0 24 24"><path d="M12 1l1.3 4.5v9.5h-2.6V5.5zM7.5 15.2h9v1.6h-9zM11 17h2v3.2l1 1.1-2 1.7-2-1.7 1-1.1z"/></svg>'];
function prose(root) {
  const blocks = root.querySelectorAll('.diary-entry, .why-note, .note, .about-section .wrap, .codex-veiled, .lead, .tarot-reading p:first-of-type');
  blocks.forEach((b, n) => {
    if (b.dataset.prose || b.closest('.site-footer, .door, .next-step')) return; b.dataset.prose = '1';
    const ps = b.matches('p') ? [b] : [...b.querySelectorAll(':scope > p')].filter((p) => p.textContent.trim().length > 60 && !p.matches('.diary-date, .example-flag, .kicker, .case-file'));
    if (!ps.length) return;
    // an illuminated initial only where the text opens on a letter (never split '16' into '1' + '6')
    if (!b.matches('.lead') && /^[A-Za-z]/.test(ps[0].textContent.trim())) ps[0].classList.add('illum');
    ps.slice(1).forEach((p, k) => {
      const o = document.createElement('div'); o.className = 'orn'; o.setAttribute('aria-hidden', 'true');
      o.innerHTML = `<i class="thorn"></i>${ORN[k % 2]}<i class="thorn thorn-r"></i>`;
      p.before(o);
    });
  });
}
function caseFile(root) {
  const page = document.body.dataset.page;
  if (!FOLIO[page]) return;
  const host = ['.song-head-grid > div', '.album-hero-grid > div:nth-child(2)', '.circle-head', '.hero-copy', '.page-head .wrap'].map((q) => root.querySelector(q)).find(Boolean);
  if (!host || host.querySelector('.case-file')) return;
  const w = (n) => `<span class="redact" style="width:${n}em"></span>`;
  const el = document.createElement('p'); el.className = 'case-file'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<span>Case file PB-0777</span><span>Folio ${FOLIO[page] || '—'}</span>${w(4.5)}<span>Recovered ${w(2.6)}</span><span class="stamp">Restricted</span>`;
  host.insertBefore(el, host.firstChild);
}
['l'].forEach((side) => {   // v42d: the right-hand scratch is gone; it ran down into the right corners' skulls
  const sc = document.createElement('div'); sc.className = 'scratch scratch-' + side; sc.setAttribute('aria-hidden', 'true');
  sc.innerHTML = side === 'l' ? 'Not meant for the living &middot; <b>do not copy</b> &middot; close this page' : 'Sealed record PB-0777 &middot; <b>if found, burn</b> &middot; it is watching';
  document.body.appendChild(sc);
});
if (!reduceMotion) {
  const flick = () => { setTimeout(() => { doc.classList.add('flick'); setTimeout(() => { doc.classList.remove('flick'); setTimeout(() => { doc.classList.add('flick'); setTimeout(() => doc.classList.remove('flick'), 70); }, 90); }, 110); flick(); }, 11000 + Math.random() * 14000); };
  flick();
  const glitch = () => { setTimeout(() => { const ts = [...document.querySelectorAll('#swap .title-fraktur, #swap .section-title')].filter((t) => { const r = t.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }); const t = ts[Math.floor(Math.random() * ts.length)]; if (t) { t.classList.remove('glitch'); void t.offsetWidth; t.classList.add('glitch'); } glitch(); }, 9000 + Math.random() * 16000); };
  glitch();
}
const mark = document.createElement('div'); mark.className = 'ma-mark'; mark.setAttribute('aria-hidden', 'true'); mark.textContent = 'M.A';
document.body.appendChild(mark);
{
  const st = { x: innerWidth * 0.5, y: innerHeight * 0.7, tx: innerWidth * 0.5, ty: innerHeight * 0.7, f: 1 };
  addEventListener('pointermove', (e) => { st.tx = e.clientX; st.ty = e.clientY; }, { passive: true });
  let n1 = 0, n2 = 0;
  const tick = (t) => {
    if (!document.hidden) {
      st.x += (st.tx - st.x) * 0.12; st.y += (st.ty - st.y) * 0.12;
      if (!reduceMotion) { n1 += (Math.random() - 0.5) * 0.18; n1 *= 0.9; n2 = Math.sin(t / 130) * 0.04 + Math.sin(t / 47) * 0.025; }
      const f = 1 + n1 + n2;
      candle.style.setProperty('--cx', st.x.toFixed(1) + 'px'); candle.style.setProperty('--cy', st.y.toFixed(1) + 'px');
      candle.style.setProperty('--cf', f.toFixed(3));
      document.documentElement.style.setProperty('--candle', f.toFixed(3));
      litUpdate(st.x, st.y);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
// surfaces marked .lit receive local light coordinates (sheen on seals, falloff on parchment)
let litEls = [], litFrame = 0;
function litScan() { litEls = [...document.querySelectorAll('.lit')]; }
function litUpdate(x, y) {
  if ((litFrame++ & 1) || !litEls.length) return;
  for (const el of litEls) {
    const r = el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) continue;
    el.style.setProperty('--lx', ((x - r.left) / Math.max(1, r.width) * 100).toFixed(1) + '%');
    el.style.setProperty('--ly', ((y - r.top) / Math.max(1, r.height) * 100).toFixed(1) + '%');
  }
}

// ---------- sound toggle ----------
const btn = document.createElement('button');
btn.type = 'button'; btn.className = 'sound-toggle';
btn.innerHTML = '<span class="sound-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="sound-label">Sound off</span>';
document.body.appendChild(btn);
// v36: the sound controls live in the header bar, next to Search (re-docked after every page swap).
function dockSound() {
  const w = document.querySelector('.site-header .wrap');
  if (!w) return;
  let slot = w.querySelector('.hdr-sound');
  if (!slot) {
    slot = document.createElement('div'); slot.className = 'hdr-sound'; slot.setAttribute('role', 'group'); slot.setAttribute('aria-label', 'Sound');
    const st = w.querySelector('.search-toggle'); st ? w.insertBefore(slot, st) : w.appendChild(slot);
  }
  const med = window.__pbMediumBtn || document.querySelector('.medium-toggle');
  if (med && med.parentNode !== slot) slot.appendChild(med);
  if (btn.parentNode !== slot) slot.appendChild(btn);
  btn.title = btn.querySelector('.sound-label').textContent;
  if (med) med.title = med.querySelector('.mt-label').textContent;
}
window.__pbDockSound = dockSound;
dockSound();
document.addEventListener('pb:page', dockSound);
addEventListener('load', dockSound);
function syncBtn() {
  const on = sound.pref === 'on';
  const running = sound.state === 'running';
  btn.setAttribute('aria-pressed', String(on && running));
  btn.querySelector('.sound-label').textContent = on ? (running ? 'Sound on' : 'Tap for sound') : 'Sound off';
  btn.setAttribute('aria-label', on && running ? 'Mute the ambient sound' : 'Play the ambient sound');
  btn.classList.toggle('needs-tap', on && !running);
  btn.title = btn.querySelector('.sound-label').textContent;
}
sound.onChange(syncBtn); syncBtn();
btn.addEventListener('click', async () => {
  if (sound.pref === 'on' && sound.state === 'running') sound.disable(); else await sound.enable();
  syncBtn();
});
// After a full page load, browsers need a gesture before audio can resume.
if (sound.pref === 'on') {
  sound.tryResume().then(syncBtn);
  const resume = () => { sound.tryResume().then(syncBtn); removeEventListener('pointerdown', resume); removeEventListener('keydown', resume); };
  addEventListener('pointerdown', resume); addEventListener('keydown', resume);
}

// ---------- header ----------
const onScroll = () => { const h = document.querySelector('.site-header'); if (h) h.classList.toggle('is-scrolled', scrollY > 40); document.documentElement.classList.toggle('scrolled-away', scrollY > 120); };
addEventListener('scroll', onScroll, { passive: true });

// ---------- ink reveal ----------
let filterId = 0;
const svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svgDefs.setAttribute('width', '0'); svgDefs.setAttribute('height', '0'); svgDefs.setAttribute('aria-hidden', 'true');
svgDefs.style.position = 'absolute';
document.body.appendChild(svgDefs);
function inkBleed(el) {
  if (reduceMotion) { el.classList.remove('ink-pre'); return; }
  const id = 'ink' + (++filterId);
  svgDefs.insertAdjacentHTML('beforeend', `<filter id="${id}" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency="0.022 0.06" numOctaves="3" seed="${filterId}" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="60" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="3"/></filter>`);
  const f = svgDefs.querySelector('#' + id);
  const disp = f.querySelector('feDisplacementMap'); const blur = f.querySelector('feGaussianBlur');
  el.style.filter = `url(#${id})`;
  el.classList.add('ink-on'); el.classList.remove('ink-pre');
  const t0 = performance.now(), D = 2600;
  const step = (now) => {
    const k = Math.min(1, (now - t0) / D); const e = 1 - Math.pow(1 - k, 3);
    disp.setAttribute('scale', (60 * (1 - e)).toFixed(2)); blur.setAttribute('stdDeviation', (3 * (1 - e)).toFixed(2));
    if (k < 1) requestAnimationFrame(step); else { el.style.filter = ''; f.remove(); }
  };
  requestAnimationFrame(step);
}
let io = null;
function initReveals(root) {
  drawSigils(root, { animate: !reduceMotion });
  if (reduceMotion || !('IntersectionObserver' in window)) {
    root.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in'));
    return;
  }
  io && io.disconnect();
  io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const el = en.target; io.unobserve(el);
      if (el.matches('.ink')) inkBleed(el);
      else if (el.matches('svg.sigil')) inkSigil(el);
      else el.classList.add('is-in');
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
  root.querySelectorAll('.ink').forEach((el) => { el.classList.add('ink-pre'); if (!el.closest('[data-manual-ink]')) io.observe(el); });
  root.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 5) * 0.18 + 's'; if (!el.closest('[data-manual-ink]')) io.observe(el); });
  root.querySelectorAll('svg.sigil.sigil-pending').forEach((el) => io.observe(el));
}
export function revealNow(root) {
  root.querySelectorAll('.ink.ink-pre').forEach((el) => inkBleed(el));
  root.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
}

// ---------- tilt ----------
function initTilt(root) {
  if (reduceMotion || coarse) return;
  root.querySelectorAll('[data-tilt]').forEach((el) => {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.classList.add('is-tilting');
      el.style.setProperty('--ry', ((x - 0.5) * 14).toFixed(2) + 'deg'); el.style.setProperty('--rx', ((0.5 - y) * 12).toFixed(2) + 'deg');
      el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
    });
    el.addEventListener('pointerleave', () => { el.classList.remove('is-tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });
  root.querySelectorAll('.btn').forEach((b) => b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.setProperty('--bx', e.clientX - r.left + 'px'); b.style.setProperty('--by', e.clientY - r.top + 'px'); }));
}

// the rite chooses: a truly random released album (crypto, uniform, never the same one twice running)
const ALBUM_ROWS = '.al-row:not(.folder) .al-link[href^="albums/"]';
function cryptoIndex(n) {
  if (n <= 1) return 0;
  const lim = Math.floor(0x100000000 / n) * n; const b = new Uint32Array(1);
  do { crypto.getRandomValues(b); } while (b[0] >= lim); // rejection sampling: no modulo bias
  return b[0] % n;
}
let riting = false;
function riteChoose() {
  if (riting) return;
  const seen = new Set(); const pool = [];
  document.querySelectorAll(ALBUM_ROWS).forEach((l) => { const h = l.getAttribute('href'); if (seen.has(h)) return; seen.add(h); pool.push({ href: h, title: l.closest('.al-row')?.dataset.album || l.textContent.trim() }); });
  if (!pool.length) return;
  let last = ''; try { last = sessionStorage.getItem('pb-rite-last') || ''; } catch (e) {}
  const cand = pool.length > 1 ? pool.filter((p) => p.href !== last) : pool;
  const pick = cand[cryptoIndex(cand.length)];
  try { sessionStorage.setItem('pb-rite-last', pick.href); } catch (e) {}
  riting = true;
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ov = document.createElement('div'); ov.className = 'rite-choose'; ov.setAttribute('role', 'status'); ov.setAttribute('aria-live', 'assertive');
  ov.innerHTML = '<div class="rc-in"><span class="rc-seal" aria-hidden="true"></span><p class="rc-k"></p><p class="rc-t"></p></div>';
  const k0 = ov.querySelector('.rc-k'); k0.textContent = 'The rite chooses\u2026';
  const t = ov.querySelector('.rc-t'); document.body.append(ov);
  requestAnimationFrame(() => ov.classList.add('is-on'));
  const land = () => { t.textContent = pick.title; ov.classList.add('is-chosen'); k0.textContent = 'The rite has chosen'; try { sound.bell(73.42, 0.3); } catch (e) {} };
  const leave = () => { const url = new URL(pick.href, location.href); riting = false; go(url); setTimeout(() => ov.remove(), 400); };
  if (rm) { land(); setTimeout(leave, 700); return; }
  let k = 0, d = 60;
  const flick = () => { if (k++ < 14) { t.textContent = pool[cryptoIndex(pool.length)].title; d *= 1.17; setTimeout(flick, d); } else { land(); setTimeout(leave, 900); } };
  flick();
}

// ---------- ritual path: remember visited steps, random altar ----------
function initPath(root) {
  let done = []; try { done = JSON.parse(localStorage.getItem('pb-path') || '[]'); } catch (e) {}
  const cur = root.querySelector('.ritual-path [aria-current="step"]');
  if (cur && !done.includes(cur.dataset.step)) { done.push(cur.dataset.step); try { localStorage.setItem('pb-path', JSON.stringify(done)); } catch (e) {} }
  root.querySelectorAll('.ritual-path li').forEach((li) => li.classList.toggle('is-done', done.includes(li.dataset.step)));
  root.querySelectorAll('[data-replay-welcome]').forEach((b) => b.addEventListener('click', () => { location.href = new URL('./?welcome=1', ROOT).href; }));
  root.querySelectorAll('[data-random-album]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); riteChoose(); }));
}


// while an album's letter is on screen, fixed ornaments step aside (same as the Morrow Ash letter)
let _lr = null;
function letterReading(root) {
  if (_lr) { _lr.disconnect(); _lr = null; document.body.classList.remove('ms-reading'); }
  const els = root.querySelectorAll('.why-letter, .lyr-sheet, .author-doc, .ms-envelope .ms-letter');
  if (!els.length || !('IntersectionObserver' in window)) return;
  const seen = new Set();
  _lr = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
    document.body.classList.toggle('ms-reading', seen.size > 0);
  }, { threshold: 0.05 });
  els.forEach((el) => _lr.observe(el));
}

// ---------- page controllers ----------
let current = null;
async function initPage(first) {
  const swap = document.getElementById('swap');
  caseFile(swap); bleedTitles(swap); prose(swap); scatterRelics(swap);
  initReveals(swap); initTilt(swap); onScroll(); litScan(); initPath(swap); letterReading(swap); symHush(swap);
  const page = document.body.dataset.page;
  const path = CONTROLLERS[page];
  if (path) {
    try {
      const mod = await import(path);
      current = await mod.init({ first, sound, smoke, embers, revealNow, initReveals });
    } catch (e) { console.error(e); }
  }  document.dispatchEvent(new CustomEvent('pb:page', { detail: { first } }));
}

// ---------- seamless navigation (keeps the sound alive between pages) ----------
let navigating = false;
function internal(a) {
  if (!a || a.target === '_blank' || a.hasAttribute('download')) return null;
  const href = a.getAttribute('href'); if (!href || href.startsWith('#')) return null;
  const url = new URL(href, location.href);
  if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return null;
  if (url.pathname === location.pathname && url.hash) return null;
  return url;
}
async function go(url, { push = true, x = innerWidth / 2, y = innerHeight / 2 } = {}) {
  if (navigating) return; navigating = true;
  try {
    const resP = fetch(url.href, { credentials: 'same-origin' }).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); });
    if (!reduceMotion) {
      veil.style.setProperty('--vx', (x / innerWidth) * 100 + '%'); veil.style.setProperty('--vy', (y / innerHeight) * 100 + '%');
      veil.classList.remove('is-off'); veil.classList.add('is-on');
      sound.bell(82.4, 0.18);
      await new Promise((r) => setTimeout(r, 950));
    }
    const html = await resP;
    const ndoc = new DOMParser().parseFromString(html, 'text/html');
    const nswap = ndoc.getElementById('swap'); if (!nswap) throw new Error('no swap');
    { const v = (d) => (d.querySelector('link[rel="stylesheet"][href*="style.css"]')?.getAttribute('href') || '').split('?v=')[1] || ''; if (v(ndoc) !== v(document)) throw new Error('new build'); }
    if (current && current.destroy) { try { current.destroy(); } catch (e) {} }
    current = null;
    if (push) history.pushState({}, '', url.href);
    // v51: in-page moves count as a visit to that page when the (optional, cookieless) GoatCounter is present
    try { window.goatcounter && window.goatcounter.count && window.goatcounter.count({ path: location.pathname + location.search }); } catch (_) {}
    { const ni = ndoc.querySelector('link[rel="icon"]'), oi = document.querySelector('link[rel="icon"]'); if (ni && oi) oi.href = new URL(ni.getAttribute('href'), url).href; }
    document.title = ndoc.title;
    document.body.dataset.page = ndoc.body.dataset.page || '';
    document.getElementById('swap').innerHTML = nswap.innerHTML;
    window.scrollTo(0, 0);
    await initPage(false);
    if (url.hash) { const t = document.querySelector(url.hash); t && t.scrollIntoView(); }
    if (!reduceMotion) { veil.classList.remove('is-on'); veil.classList.add('is-off'); }
    document.getElementById('main')?.focus?.({ preventScroll: true });
  } catch (e) {
    location.href = url.href; // graceful fallback
  } finally { navigating = false; }
}
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a'); const url = internal(a); if (!url) return;
  e.preventDefault(); go(url, { x: e.clientX, y: e.clientY });
});
addEventListener('popstate', (e) => { if (typeof window.__pbOverlayPop === 'function' && window.__pbOverlayPop(e)) return; go(new URL(location.href), { push: false }); });
export const navigate = (href) => go(new URL(href, location.href));
window.__pbNavigate = navigate;

drawSigils(veil, { animate: false });
initPage(true);

// ---------- v16: guide menu, sealed letter, graveyard lamp (delegated, survives seamless navigation) ----------
function setNav(open) {
  const b = document.querySelector('.nav-toggle'); if (!b) return;
  b.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.classList.toggle('nav-open', open);
  if (open) { const a = document.querySelector('#primary-nav a'); a && a.focus({ preventScroll: true }); }
}
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('.nav-toggle')) { setNav(document.body.classList.contains('nav-open') ? false : true); return; }
  if (document.body.classList.contains('nav-open') && (t.closest('#primary-nav a') || !t.closest('#primary-nav'))) setNav(false);
  const keep = t.closest('.pk-keep');
  if (keep) { const env = keep.closest('[data-envelope]'); env.classList.remove('is-warned'); env.querySelector('.pk-warning').hidden = true; const p0 = env.querySelector('.ms-packet'); p0.setAttribute('aria-expanded', 'false'); p0.focus({ preventScroll: true }); return; }
  const leave = t.closest('.sl-leave');
  if (leave) { const env = leave.closest('[data-envelope]'); closeLock(env); return; }
  const brk = t.closest('.pk-break');
  const pk = brk || t.closest('.ms-packet');
  if (pk) {
    const env = pk.closest('[data-envelope]'); if (!env || env.classList.contains('is-open') || env.classList.contains('is-breaking')) return;
    // the second leaf carries a warning: the first touch only shows it
    if (env.hasAttribute('data-warn') && !brk && !env.classList.contains('is-asking')) {
      if (!env.classList.contains('is-warned')) { env.classList.add('is-warned'); const w = env.querySelector('.pk-warning'); w.hidden = false; try { sound && sound.bell && sound.bell(70, 0.1); } catch (_) {} const b = w.querySelector('.pk-break'); b && b.focus({ preventScroll: true }); }
      return;
    }
    askCode(env);
  }
});

// the sealed letters ask for the same number as the threshold; a wrong one is refused gently and the seal holds
function closeLock(env) {
  const lock = env.querySelector('.seal-lock'); if (lock) lock.hidden = true;
  env.classList.remove('is-asking', 'is-warned'); const wp = env.querySelector('.pk-warning'); if (wp) wp.hidden = true;
  const p0 = env.querySelector('.ms-packet'); p0.setAttribute('aria-expanded', 'false'); p0.focus({ preventScroll: true });
}
function askCode(env) {
  const wp = env.querySelector('.pk-warning'); if (wp) wp.hidden = true; env.classList.remove('is-warned');
  let lock = env.querySelector('.seal-lock');
  if (!lock) {
    const id = (env.querySelector('.ms-open')?.id || 'letter') + '-lock';
    lock = document.createElement('form'); lock.className = 'seal-lock'; lock.autocomplete = 'off'; lock.setAttribute('aria-label', 'The letter is sealed');
    lock.innerHTML = `<p class="sl-kicker">Sigillum &middot; the sealed word</p>
      <p class="sl-riddle">This place is sealed with the number of perfection: three sevens, side by side.</p>
      <label class="sl-label" for="${id}-0">Write the number</label>
      <div class="sl-digits"><input id="${id}-0" inputmode="numeric" pattern="[0-9]" maxlength="1" aria-label="First digit"><input inputmode="numeric" pattern="[0-9]" maxlength="1" aria-label="Second digit"><input inputmode="numeric" pattern="[0-9]" maxlength="1" aria-label="Third digit"></div>
      <div class="sl-btns"><button type="submit" class="btn btn-solid sl-go">Open the letter</button><button type="button" class="sl-leave">Leave it sealed</button></div>
      <p class="sl-msg" role="status" aria-live="polite"></p>`;
    env.querySelector('.ms-packet').after(lock);
    const ds = [...lock.querySelectorAll('.sl-digits input')], msg = lock.querySelector('.sl-msg');
    const check = (force) => {
      const v = ds.map((d) => d.value).join('');
      if (v.length < 3) { if (force) ds[v.length].focus(); return; }
      if (isSealCode(v)) {
        lock.classList.add('is-accepted'); lock.classList.remove('is-refused'); msg.textContent = 'So be it.';
        ds.forEach((d) => (d.disabled = true));
        setTimeout(() => { lock.hidden = true; env.classList.remove('is-asking'); breakSeal(env); }, 500);
        return;
      }
      lock.classList.add('is-refused'); msg.textContent = 'The wax holds. The letter stays sealed.';
      try { sound && sound.bell && sound.bell(55, 0.06); } catch (_) {}
      setTimeout(() => { ds.forEach((d) => (d.value = '')); ds[0].focus({ preventScroll: true }); }, 700);
    };
    ds.forEach((d, i) => {
      d.addEventListener('input', () => { d.value = d.value.replace(/\D/g, '').slice(-1); lock.classList.remove('is-refused'); if (d.value && i < 2) ds[i + 1].focus(); if (ds.every((x) => x.value)) check(); });
      d.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !d.value && i > 0) { ds[i - 1].focus(); ds[i - 1].value = ''; } if (e.key === 'ArrowLeft' && i > 0) ds[i - 1].focus(); if (e.key === 'ArrowRight' && i < 2) ds[i + 1].focus(); if (e.key === 'Escape') closeLock(env); });
      d.addEventListener('paste', (e) => { const v = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 3); if (v) { e.preventDefault(); v.split('').forEach((c, k) => ds[k] && (ds[k].value = c)); if (v.length === 3) check(); } });
    });
    lock.addEventListener('submit', (e) => { e.preventDefault(); check(true); });
  }
  lock.hidden = false; env.classList.add('is-asking'); env.querySelector('.ms-packet').setAttribute('aria-expanded', 'false');
  const first = lock.querySelector('.sl-digits input'); first && first.focus({ preventScroll: true });
}
function breakSeal(env) {
  const packet = env.querySelector('.ms-packet');
  env.classList.add('is-breaking'); packet.setAttribute('aria-expanded', 'true');
  try { sound && sound.bell && sound.bell(92, 0.12); } catch (_) {}
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => {
    env.classList.add('is-open'); env.classList.remove('is-breaking');
    const h = env.querySelector('.ms-title'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    const top = env.getBoundingClientRect().top + scrollY - 90; scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }, reduce ? 0 : 1250);
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { setNav(false); const b = document.querySelector('.nav-toggle'); b && b.focus(); } });
document.addEventListener('pointermove', (e) => {
  const g = e.target.closest && e.target.closest('.graveyard'); if (!g) return;
  const r = g.getBoundingClientRect(); g.style.setProperty('--mx', `${e.clientX - r.left}px`); g.style.setProperty('--my', `${e.clientY - r.top}px`); g.classList.add('has-lamp');
}, { passive: true });
// Back on top-level rooms: return to the previous page on this site, otherwise go to the threshold.
const trail = () => { try { return JSON.parse(sessionStorage.getItem('pb-trail') || '[]'); } catch (_) { return []; } };
const noteTrail = () => { try { const t = trail(); if (t[t.length - 1] !== location.href) { t.push(location.href); sessionStorage.setItem('pb-trail', JSON.stringify(t.slice(-30))); } } catch (_) {} };
addEventListener('popstate', () => { try { const t = trail(); const i = t.lastIndexOf(location.href); if (i >= 0) sessionStorage.setItem('pb-trail', JSON.stringify(t.slice(0, i + 1))); } catch (_) {} });
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a[data-history-back]'); if (!a) return;
  const t = trail();
  if (t.length > 1 && history.length > 1) { e.preventDefault(); e.stopImmediatePropagation(); history.back(); }
}, true);
// Seat the Back button just below the fixed header, whatever its height on this screen.
const seatBack = () => {
  const bar = document.querySelector('.backbar'), hd = document.querySelector('.site-header'), main = document.getElementById('main');
  if (!bar || !hd || !main) return;
  bar.style.setProperty('--bb-top', Math.max(0, Math.round(hd.offsetHeight + hd.offsetTop - main.offsetTop)) + 'px');
};
addEventListener('resize', seatBack, { passive: true });
new MutationObserver(() => { seatBack(); noteTrail(); }).observe(document.getElementById('swap') || document.body, { childList: true });
seatBack(); noteTrail(); setTimeout(seatBack, 400);

// v44: on phones the rite pill and the M.A mark appear only when the visitor scrolls back up (never over the first screen or the end)
(() => {
  const mq = matchMedia('(max-width:700px)'); let lastY = scrollY, tick = false;
  const upd = () => {
    tick = false; const y = scrollY, dy = y - lastY; lastY = y;
    const nearEnd = innerHeight + y >= document.documentElement.scrollHeight - 4;
    if (!mq.matches) { doc.classList.remove('rp-away'); return; }
    if (nearEnd || y < 200) { doc.classList.add('rp-away'); return; }   // never over the first screen or the last lines
    if (dy > 6) doc.classList.add('rp-away'); else if (dy < -6) doc.classList.remove('rp-away');
  };
  if (mq.matches) doc.classList.add('rp-away');   // it comes back when the visitor scrolls up
  mq.addEventListener('change', upd);
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
})();
