// First-ever visit only: a forbidden threshold. Darkness, a whisper, a candle,
// a sealed letter with a code lock (777). Correct code breaks the seal and the door opens.
// No skip: the riddle itself gives the number, so no one is locked out.
import { reduceMotion, ROOT } from './env.js';
import { sigilMarkup } from './sigil.js';

export const WELCOME_KEY = 'pb-initiated';
export const seenWelcome = () => { try { return localStorage.getItem(WELCOME_KEY) === '1'; } catch (e) { return true; } };
const markSeen = () => { try { localStorage.setItem(WELCOME_KEY, '1'); } catch (e) {} };
import { SEAL_CODE as CODE } from './seal-code.js';
// phones get the lighter copies of the big images (made by the build, see PHONE_IMAGES)
const PHONE = matchMedia('(max-width:900px),(hover:none) and (pointer:coarse)').matches;


// ---- the dread around the code lock: a ring of heptagrams and sigils, two guttering candles, faint marks ----
function hepta(r, step) { const pts = []; for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k * step * 2 * Math.PI) / 7; pts.push(`${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`); } return 'M' + pts.join('L') + 'Z'; }
function dreadMarkup() {
  const ticks = Array.from({ length: 49 }, (_, i) => { const a = (i / 49) * 2 * Math.PI, r1 = 46, r2 = i % 7 ? 44.6 : 42.8; return `<line x1="${(Math.cos(a) * r1).toFixed(2)}" y1="${(Math.sin(a) * r1).toFixed(2)}" x2="${(Math.cos(a) * r2).toFixed(2)}" y2="${(Math.sin(a) * r2).toFixed(2)}"/>`; }).join('');
  const sig = Array.from({ length: 7 }, (_, k) => { const a = -Math.PI / 2 + (k * 2 * Math.PI) / 7; return `<g transform="translate(${(Math.cos(a) * 38).toFixed(2)} ${(Math.sin(a) * 38).toFixed(2)}) scale(.075)">${sigilMarkup('dread-' + k)}</g>`; }).join('');
  return `<div class="wd-bg"></div><div class="wd-vignette"></div>
    <svg class="wd-ring" viewBox="-50 -50 100 100"><g class="wd-spin"><circle r="47.5"/><circle r="46"/>${ticks}<circle r="31"/><path class="wd-h" d="${hepta(31, 3)}"/><path class="wd-h2" d="${hepta(20, 2)}"/><circle r="12"/>${sig}</g></svg>
    <div class="wd-candle wd-c1"><i class="wd-flame"></i><i class="wd-wax"></i></div><div class="wd-candle wd-c2"><i class="wd-flame"></i><i class="wd-wax"></i></div>
    <div class="wd-whispers"></div>`;
}
function glyphMarkup() {
  // small marks pressed into the paper around the boxes: heptagrams, a cracked seal, crossed strokes
  const h = (cls) => `<svg class="wg ${cls}" viewBox="-12 -12 24 24"><circle r="10.5"/><path d="${hepta(9, 3)}"/></svg>`;
  const crack = (cls) => `<svg class="wg ${cls}" viewBox="-12 -12 24 24"><circle r="9" class="wg-wax"/><path d="M-6 -7 L-1 -1 L-4 3 L1 8 M-1 -1 L5 -4 M-4 3 L-8 4"/></svg>`;
  const cross = (cls) => `<svg class="wg ${cls}" viewBox="-12 -12 24 24"><path d="M0 -10 V10 M-6 -4 H6 M-8 6 L8 -8"/><circle r="2.2" cy="-10"/></svg>`;
  return h('wg1') + crack('wg2') + cross('wg3') + h('wg4') + crack('wg5') + cross('wg6');
}

export function playWelcome({ sound }) {
  return new Promise((resolve) => {
    const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? Math.min(ms, 250) : ms));
    let done = false, phase = 'dark';
    const el = document.createElement('div');
    el.className = 'wel'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'A sealed threshold');
    el.innerHTML = `
      <div class="wel-room" aria-hidden="true"></div>
      <svg class="wel-circle" viewBox="-50 -50 100 100" aria-hidden="true"><g>${sigilMarkup('threshold-777')}</g></svg>
      <div class="wel-dust" aria-hidden="true">${Array.from({ length: 26 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--y:${(i * 61) % 100}%;--d:${(i % 7) * 1.3}s;--s:${0.6 + (i % 4) * 0.35}"></i>`).join('')}</div>
      <div class="wel-candle" aria-hidden="true"><img src="${new URL(PHONE ? 'images/ritual/candles-m.jpg' : 'images/ritual/candles.jpg', ROOT).href}" alt=""><span class="wel-flame"></span><span class="wel-ember"></span></div>
      <div class="wel-shadows" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="wel-glow" aria-hidden="true"></div>
      <div class="wel-ghost" aria-hidden="true"><i></i><i></i></div>
      <div class="wel-figure" aria-hidden="true"><span class="fig-sigil" aria-hidden="true"><i class="fs-carve"></i><i class="fs-glow"></i><i class="fs-core"></i><i class="fs-flare"></i></span><video muted loop playsinline preload="auto" poster="${new URL(PHONE ? 'images/figurine/figurine-poster-m.jpg' : 'images/figurine/figurine-poster.jpg', ROOT).href}"><source src="${new URL('video/figurine-turn.webm', ROOT).href}" type="video/webm"><source src="${new URL('video/figurine-turn.mp4', ROOT).href}" type="video/mp4"></video></div>
      <svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="welBleed" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.09" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4"/></filter></svg>
      <div class="wel-crypt" aria-hidden="true"><div class="wc-floor"></div><div class="wc-smoke"><i></i><i></i><i></i></div><div class="wc-scratch"></div><div class="wc-blood">${Array.from({ length: 14 }, (_, i) => `<i style="--x:${(i * 7.3 + (i % 3) * 2.1) % 100}%;--h:${40 + ((i * 53) % 160)}px;--w:${3 + (i % 4) * 2}px;--d:${(i % 5) * 0.9}s"></i>`).join('')}</div><div class="wc-skull wc-skull-l"></div><div class="wc-skull wc-skull-r"></div><div class="wc-flicker"></div></div>
      <div class="wel-grain" aria-hidden="true"></div>
      <button type="button" class="wel-touch"><span class="wel-warn" aria-hidden="true"><span class="wel-warn-t">You should not be here</span></span><span class="wel-touch-dot" aria-hidden="true"></span><span class="wel-touch-t">Touch the dark. It has been waiting.</span><small>Sound stays off unless you turn it on</small></button>
      <div class="wel-lines" aria-live="polite"></div>
      <section class="wel-warnstep" hidden aria-live="polite"><p class="ws-kicker">Ultima monitio &middot; the last warning</p><div class="ws-lines"></div><button type="button" class="ws-go" hidden>I have been warned &middot; go to the seal</button></section>
      <button type="button" class="wel-wick" aria-label="Light the candle" hidden><span class="wel-wick-hint">Touch the wick. Give the dark a light to find you by.</span></button>
      <div class="wel-dread" aria-hidden="true">${dreadMarkup()}</div>
      <form class="wel-letter" autocomplete="off" hidden>
        <div class="wel-seal" aria-hidden="true"><div class="wel-seal-whole"></div><span class="wel-seal-sheen"></span><svg class="wel-cracks" viewBox="0 0 100 100" preserveAspectRatio="none"></svg></div>
        <p class="wel-kicker">Sigillum &middot; the sealed word</p>
        <p class="wel-riddle">What sleeps behind this seal was shut with the number of perfection.<br><em>Seven days of making, seven seals unbroken, seven candles that never went out. Three sevens, side by side, and it wakes.</em></p>
        <p class="wel-margin" aria-hidden="true">Seven seals &middot; VII</p>
        <p class="wel-forbid" aria-hidden="true">Do not write it. It hears the numbers.</p>
        <label class="wel-label" for="wel-d0">Write the number</label>
        <div class="wel-digits">
          <input id="wel-d0" inputmode="numeric" pattern="[0-9]" maxlength="1" aria-label="First digit">
          <input inputmode="numeric" pattern="[0-9]" maxlength="1" aria-label="Second digit">
          <input inputmode="numeric" pattern="[0-9]" maxlength="1" aria-label="Third digit">
          <span class="wel-blot" aria-hidden="true"></span>
          <span class="wel-glyphs" aria-hidden="true">${glyphMarkup()}</span>
        </div>
        <p class="wel-msg" aria-live="assertive"></p>
      </form>`;
    document.body.appendChild(el);
    document.body.style.overflow = 'hidden';
    const $ = (s) => el.querySelector(s);
    const lines = $('.wel-lines'), touch = $('.wel-touch'), wick = $('.wel-wick'), letter = $('.wel-letter');
    const digits = [...el.querySelectorAll('.wel-digits input')], msg = $('.wel-msg'), seal = $('.wel-seal');
    setTimeout(() => touch.focus({ preventScroll: true }), 60);
    if (!reduceMotion) { const wt = el.querySelector('.wel-warn-t'); for (let k = 0; k < 9; k++) { const d = document.createElement('b'); d.className = 'drip'; const wd = 3 + Math.random() * 4; d.style.cssText = `left:${5 + Math.random() * 90}%;--w:${wd.toFixed(1)}px;--h:${Math.round(40 + Math.random() * 160)}px;--t:${(5 + Math.random() * 6).toFixed(1)}s;--d:${(0.8 + Math.random() * 3).toFixed(1)}s`; wt.appendChild(d); } }

    // candlelight follows the hand
    const onMove = (e) => { el.style.setProperty('--mx', (e.clientX / innerWidth * 100).toFixed(1) + '%'); el.style.setProperty('--my', (e.clientY / innerHeight * 100).toFixed(1) + '%');
      letter.style.setProperty('--tx', ((e.clientX / innerWidth - 0.5) * 4).toFixed(2) + 'deg'); letter.style.setProperty('--ty', ((0.5 - e.clientY / innerHeight) * 4).toFixed(2) + 'deg'); const r = seal.getBoundingClientRect(); if (r.width) { seal.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); seal.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); } };
    addEventListener('pointermove', onMove, { passive: true });

    const ghost = $('.wel-ghost'); const creep = [];
    function haunt() {
      if (done || reduceMotion) return;
      creep.push(setTimeout(() => {
        if (done) return;
        if (phase === 'whisper' || phase === 'wick' || phase === 'lit') { // never while the number is asked: the letter stays calm
          if (Math.random() < 0.55) sound.whisper(0.16 + Math.random() * 0.12);
          if (Math.random() < 0.45) {
            const left = Math.random() < 0.5; ghost.style.setProperty('--gx', left ? (4 + Math.random() * 14) + '%' : (70 + Math.random() * 16) + '%');
            ghost.style.setProperty('--gy', (8 + Math.random() * 20) + '%'); ghost.style.setProperty('--gs', (0.8 + Math.random() * 0.5).toFixed(2));
            ghost.classList.remove('is-on'); void ghost.offsetWidth; ghost.classList.add('is-on');
          }
          if (Math.random() < 0.35) { el.classList.add('is-gutter'); setTimeout(() => el.classList.remove('is-gutter'), 700 + Math.random() * 600); }
        }
        haunt();
      }, 4200 + Math.random() * 5200));
    }
    haunt();
    // the bleed in the ink shifts now and then
    const turb = el.querySelector('#welBleed feTurbulence'); let tseed = 3;
    // the bleed stays still: shifting it made the words flicker (calm, steady text is easier to read)
    if (turb) turb.setAttribute('seed', String(tseed));

    async function say(text, { hold = 2600, cls = '' } = {}) {
      if (done) return;
      const p = document.createElement('p'); p.className = 'wel-line ' + cls;
      p.innerHTML = text.split(' ').map((w, i) => `<span style="--i:${i};rotate:${(Math.random() * 3.2 - 1.6).toFixed(2)}deg;translate:0 ${(Math.random() * 6 - 3).toFixed(1)}px;--ink:${(0.82 + Math.random() * 0.18).toFixed(2)}">${w}</span>`).join(' ');
      lines.appendChild(p);
      sound.whisper(0.55);
      requestAnimationFrame(() => p.classList.add('is-in'));
      // blood gathers under the letters and runs down
      if (!reduceMotion) {
        const ws = [...p.children]; const n = cls ? 6 : Math.min(5, 2 + Math.floor(ws.length / 2));
        for (let k = 0; k < n; k++) {
          const w = ws[Math.floor(Math.random() * ws.length)];
          const d = document.createElement('b'); d.className = 'drip';
          const wd = 2 + Math.random() * 3.5;
          d.style.cssText = `left:${8 + Math.random() * 80}%;--w:${wd.toFixed(1)}px;--h:${Math.round(18 + Math.random() * (cls ? 120 : 80))}px;--t:${(3.5 + Math.random() * 4).toFixed(1)}s;--d:${(1.4 + w.style.getPropertyValue('--i') * 0.24 + Math.random() * 2.2).toFixed(1)}s`;
          w.appendChild(d);
        }
      }
      await wait(hold);
      p.classList.add('is-out'); setTimeout(() => p.remove(), 2200);
      await wait(1100);
    }

    function finish(mode) {
      if (done) return; done = true; markSeen(); creep.forEach((t) => { clearTimeout(t); clearInterval(t); });
      removeEventListener('pointermove', onMove); removeEventListener('keydown', onKey);
      el.classList.add('is-leaving');
      setTimeout(() => { el.remove(); }, reduceMotion ? 300 : 1400);
      resolve(mode);
    }
    const onKey = () => {};
    addEventListener('keydown', onKey);

    // 1. touch the dark (also unlocks sound)
    touch.addEventListener('click', async () => {
      if (phase !== 'dark') return; phase = 'whisper';
      touch.classList.add('is-gone'); el.classList.add('is-woken');
      const hb = () => { if (done || phase === 'lock' || phase === 'open') return; sound.heartbeat && sound.heartbeat(); creep.push(setTimeout(hb, 1500)); }; hb();
      await wait(1200);
      await say('You were not meant to find this place.', { hold: 3600 });
      // she rises out of the dark for a moment: whole, centred, just the start of her turn
      const fig = el.querySelector('.wel-figure'); const fv = fig.querySelector('video');
      try { fv.currentTime = 0; fv.play().catch(() => {}); } catch (e) {}
      fig.classList.add('is-on');
      await new Promise((r) => creep.push(setTimeout(r, reduceMotion ? 900 : 3000)));
      fig.classList.remove('is-on'); setTimeout(() => { try { fv.pause(); } catch (e) {} }, 2500);
      if (done) return;
      await wait(500);
      await say('Turn back.', { hold: 2600, cls: 'is-red' });
      await say('Or light the candle, and let the dark see your face.', { hold: 3400 });
      if (done) return;
      phase = 'wick'; wick.hidden = false; el.classList.add('show-wick'); wick.focus({ preventScroll: true });
    });

    // 2. light the candle
    wick.addEventListener('click', async () => {
      if (phase !== 'wick') return; phase = 'lit';
      sound.ignite(); el.classList.add('is-lit'); wick.hidden = true;
      await wait(1800);
      await say('Then you have chosen. The house will remember you.', { hold: 3200 });
      if (done) return;
      phase = 'lock'; el.classList.add('show-crypt'); startDread(); sound.deny && sound.whisper(0.8); letter.hidden = false;
      requestAnimationFrame(() => el.classList.add('show-letter'));
      setTimeout(() => !done && digits[0].focus({ preventScroll: true }), reduceMotion ? 50 : 1400);
    });

    // 2b. a separate page of warnings, written slowly in blood, before the seal
    const WARN = ['Beyond this seal the songs are kept.', 'They were not written for the living.', 'Whoever breaks it carries what is inside.', 'What you hear cannot be unheard.', 'If you still wish to pass, give the number.'];
    async function lastWarning() {
      phase = 'warn';
      const ws = $('.wel-warnstep'), box = ws.querySelector('.ws-lines'), go = ws.querySelector('.ws-go');
      ws.hidden = false; el.classList.add('show-warnstep');
      await wait(1600);
      for (const t of WARN) {
        if (done) return;
        const p = document.createElement('p'); p.className = 'ws-line';
        p.innerHTML = t.split(' ').map((w, i) => `<span style="--i:${i};rotate:${(Math.random() * 2.4 - 1.2).toFixed(2)}deg;translate:0 ${(Math.random() * 4 - 2).toFixed(1)}px">${w}</span>`).join(' ');
        box.appendChild(p); sound.whisper(0.45);
        requestAnimationFrame(() => p.classList.add('is-in'));
        await wait(4200);
      }
      go.hidden = false; requestAnimationFrame(() => go.classList.add('is-in'));
      go.focus({ preventScroll: true });
      await new Promise((r) => go.addEventListener('click', r, { once: true }));
      el.classList.add('hide-warnstep'); await wait(1400); ws.hidden = true; el.classList.remove('show-warnstep');
    }

    // 2c. while the number is asked, the room turns against you: whispers at the edges, a tremor, a guttering flame
    const WHISPER = ['Turn back.', 'It hears the numbers.', 'Do not write it.', 'Leave it sealed.', 'It is listening.', 'Not this door.', 'You were warned.', 'Close the letter.'];
    const dread = $('.wel-dread'), wbox = dread.querySelector('.wd-whispers'); let wi = 0;
    function whisperAt() {
      const p = document.createElement('span'); p.className = 'wd-w';
      const narrow = innerWidth < 760;
      const x = narrow ? 8 + Math.random() * 60 : (Math.random() < 0.5 ? 3 + Math.random() * 17 : 74 + Math.random() * 14);
      const y = narrow ? (Math.random() < 0.5 ? 1.5 + Math.random() * 5 : 87 + Math.random() * 6) : 10 + Math.random() * 76;
      p.style.cssText = `left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;--r:${(Math.random() * 8 - 4).toFixed(1)}deg`;
      p.textContent = WHISPER[wi++ % WHISPER.length];
      wbox.appendChild(p); setTimeout(() => p.remove(), 5200);
    }
    function shudder(hard) {
      if (reduceMotion) return;
      el.classList.remove('is-shudder', 'is-shudder-hard'); void el.offsetWidth; el.classList.add(hard ? 'is-shudder-hard' : 'is-shudder');
      setTimeout(() => el.classList.remove('is-shudder', 'is-shudder-hard'), hard ? 900 : 600);
    }
    function startDread() {
      el.classList.add('dread-on');
      if (reduceMotion) { whisperAt(); return; }
      const loop = () => { if (done || phase === 'open') return; whisperAt(); /* v53: no idle tremor - shaking the letter every few seconds read as constant flicker on phones */ creep.push(setTimeout(loop, 2600 + Math.random() * 2400)); };
      creep.push(setTimeout(loop, 1800));
      digits.forEach((d) => d.addEventListener('input', () => { if (d.value && phase === 'lock') { el.classList.remove('is-heard'); void el.offsetWidth; el.classList.add('is-heard'); } }));
    }

    // 3. the code lock
    let tries = 0;
    digits.forEach((d, i) => {
      d.addEventListener('input', () => { d.value = d.value.replace(/\D/g, '').slice(-1); if (d.value && i < 2) digits[i + 1].focus(); check(); });
      d.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !d.value && i > 0) { digits[i - 1].focus(); digits[i - 1].value = ''; } if (e.key === 'ArrowLeft' && i > 0) digits[i - 1].focus(); if (e.key === 'ArrowRight' && i < 2) digits[i + 1].focus(); });
      d.addEventListener('paste', (e) => { const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 3); if (t) { e.preventDefault(); t.split('').forEach((c, k) => digits[k] && (digits[k].value = c)); check(); } });
    });
    letter.addEventListener('submit', (e) => { e.preventDefault(); check(true); });
    async function check(force) {
      const v = digits.map((d) => d.value).join(''); if (v.length < 3) { if (force) digits[v.length].focus(); return; }
      if (phase !== 'lock') return;
      if (v === CODE) { phase = 'open'; await open(); return; }
      tries++; phase = 'deny'; shudder(true);
      sound.deny(); letter.classList.remove('is-denied'); void letter.offsetWidth; letter.classList.add('is-denied');
      msg.textContent = tries >= 2 ? 'The wax refuses you. Count the sevens.' : 'The wax refuses you. That number means nothing here.';
      await wait(1100);
      digits.forEach((d) => (d.value = '')); digits[0].focus(); phase = 'lock';
    }

    // 4. the seal cracks and splits along real fracture lines
    async function open() {
      digits.forEach((d) => (d.disabled = true)); el.classList.add('dread-off'); letter.classList.add('is-accepted'); msg.textContent = 'So be it. Your name is in the record now.';
      const shards = buildShards(seal);
      sound.crack(); seal.classList.add('is-cracking');
      await wait(900);
      seal.classList.add('is-broken');
      shards.forEach((s, i) => {
        if (reduceMotion) { s.style.opacity = '0'; return; }
        const a = s._dir; const dist = 70 + Math.random() * 60;
        s.animate([
          { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
          { transform: `translate(${Math.cos(a) * dist * 0.4}px, ${Math.sin(a) * dist * 0.4 - 6}px) rotate(${(Math.random() - 0.5) * 20}deg)`, opacity: 1, offset: 0.25 },
          { transform: `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist * 0.5 + 340}px) rotate(${(Math.random() - 0.5) * 120}deg) rotateX(${40 + Math.random() * 40}deg)`, opacity: 0 },
        ], { duration: 1500 + Math.random() * 400, easing: 'cubic-bezier(.35,0,.7,.4)', fill: 'forwards' });
      });
      crumbs(seal);
      await wait(1300);
      if (!done) finish('opened');
    }
  });
}

// jagged crack lines from an off-centre impact point to the seal's edge, then polygons between them
function buildShards(seal) {
  const C = [46 + Math.random() * 8, 44 + Math.random() * 8];
  const n = 5; const base = Math.random() * Math.PI * 2;
  const rays = [];
  for (let i = 0; i < n; i++) {
    const ang = base + (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const pts = []; let [x, y] = C; let a = ang;
    while (x > 0 && x < 100 && y > 0 && y < 100) { a += (Math.random() - 0.5) * 0.7; const step = 6 + Math.random() * 7; x += Math.cos(a) * step; y += Math.sin(a) * step; pts.push([x, y]); }
    const last = pts[pts.length - 1]; last[0] = Math.max(0, Math.min(100, last[0])); last[1] = Math.max(0, Math.min(100, last[1]));
    rays.push({ ang, pts });
  }
  rays.sort((p, q) => perim(p.pts[p.pts.length - 1]) - perim(q.pts[q.pts.length - 1]));
  // crack lines (dark fissure + thin lit edge)
  const svg = seal.querySelector('.wel-cracks');
  svg.innerHTML = rays.map((r) => { const d = 'M' + [C, ...r.pts].map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L'); return `<path class="ck-shadow" d="${d}"/><path class="ck-line" d="${d}"/><path class="ck-edge" d="${d}"/>`; }).join('');
  svg.querySelectorAll('path').forEach((p) => { const L = p.getTotalLength ? p.getTotalLength() : 200; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  const shards = [];
  for (let i = 0; i < n; i++) {
    const A = rays[i].pts, B = rays[(i + 1) % n].pts;
    const ea = perim(A[A.length - 1]); let eb = perim(B[B.length - 1]); if (eb <= ea) eb += 4;
    const corners = []; for (let k = Math.ceil(ea); k < eb; k++) corners.push(corner(k % 4));
    const poly = [C, ...A, ...corners, ...B.slice().reverse()];
    const s = document.createElement('div'); s.className = 'wel-shard';
    s.style.clipPath = `polygon(${poly.map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(',')})`;
    const mid = (Math.atan2(A[A.length - 1][1] - C[1], A[A.length - 1][0] - C[0]) + Math.atan2(B[B.length - 1][1] - C[1], B[B.length - 1][0] - C[0])) / 2;
    s._dir = mid;
    seal.appendChild(s); shards.push(s);
  }
  return shards;
}
// position along the square's perimeter: 0 top-left → 1 top-right → 2 bottom-right → 3 bottom-left
function perim([x, y]) { const e = 0.5; if (y <= e) return x / 100; if (x >= 100 - e) return 1 + y / 100; if (y >= 100 - e) return 2 + (100 - x) / 100; return 3 + (100 - y) / 100; }
function corner(k) { return [[0, 0], [100, 0], [100, 100], [0, 100]][k]; }
function crumbs(seal) {
  if (reduceMotion) return;
  for (let i = 0; i < 14; i++) {
    const c = document.createElement('span'); c.className = 'wel-crumb';
    const sz = 3 + Math.random() * 7; c.style.width = c.style.height = sz + 'px';
    c.style.left = 35 + Math.random() * 30 + '%'; c.style.top = 35 + Math.random() * 30 + '%';
    c.style.backgroundPosition = `${Math.random() * 100}% ${Math.random() * 100}%`;
    seal.appendChild(c);
    const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 120;
    c.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d * 0.4 + 260}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }], { duration: 1000 + Math.random() * 700, easing: 'cubic-bezier(.3,0,.7,.5)', fill: 'forwards' });
  }
}
