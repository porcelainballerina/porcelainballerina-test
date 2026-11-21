// Tarot room: a reader lays the cards in a circle, gathers, shuffles,
// spreads them, and turns three: what has been, where you stand, what may come.
import { DECK } from './tarot-data.js';
import { composeReading } from './tarot-reading.js';
import { ROOT, reduceMotion, small } from './env.js';

const rand = (n) => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; };
const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? Math.min(ms, 60) : ms));
const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const POS = [
  { key: 'Past', turn: 'I turn the first card. This is what has been.' },
  { key: 'Present', turn: 'The second card. This is where you stand now.' },
  { key: 'Future', turn: 'And the last. This is what may come, if nothing changes.' },
];

export function init({ sound }) {
  const room = document.querySelector('.tarot-room'); if (!room) return null;
  const stage = room.querySelector('.tr-stage'), layer = room.querySelector('.tr-cards');
  const voice = room.querySelector('.tr-voice'), form = room.querySelector('.tr-ask'), input = form.querySelector('input');
  const bChoose = room.querySelector('.tr-choose'), bNext = room.querySelector('.tr-next'), bAgain = room.querySelector('.tr-again');
  const readout = room.querySelector('.tr-readout');
  const synth = document.createElement('div'); synth.className = 'tr-synthesis'; synth.hidden = true; synth.setAttribute('aria-live', 'polite'); readout.after(synth);
  const hint = document.createElement('p'); hint.className = 'room-hint'; hint.setAttribute('aria-hidden', 'true');
  stage.appendChild(hint);
  let asked = '', alive = true, phase = 'idle', order = [], picks = [], turned = 0;
  const N = small ? 16 : 22;
  const S = () => ({ w: stage.clientWidth, h: stage.clientHeight });
  const CW = () => (small ? 84 : 160);

  const setHint = (t) => { if (!t) { hint.classList.add('is-gone'); return; } hint.textContent = t; hint.classList.remove('is-gone'); };
  async function say(text, hold = 0) {
    voice.classList.add('is-out'); await wait(500); if (!alive) return;
    voice.textContent = text; voice.classList.remove('is-out');
    await wait(hold || Math.max(1800, text.length * 48));
  }

  // ---- cards ----
  const cards = [];
  for (let i = 0; i < N; i++) {
    const el = document.createElement('button'); el.type = 'button'; el.className = 'tc'; el.tabIndex = -1; el.setAttribute('aria-label', 'A face-down card');
    el.innerHTML = '<span class="tc-in"><span class="tc-face tc-back"></span><span class="tc-face tc-front"><img alt=""></span></span>';
    layer.appendChild(el);
    cards.push({ el, st: { x: 0, y: 0, r: 0, s: 1 }, i });
  }
  const T = (p) => `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) rotate(${p.r.toFixed(2)}deg) scale(${p.s})`;
  function put(c, p) { c.st = { ...c.st, ...p }; c.el.style.transform = T(c.st); }
  function move(c, p, dur = 700, delay = 0, easing = 'cubic-bezier(.3,.1,.2,1)') {
    const to = { ...c.st, ...p }; const from = c.st; c.st = to;
    if (reduceMotion) { c.el.style.transform = T(to); return Promise.resolve(); }
    const a = c.el.animate([{ transform: T(from) }, { transform: T(to) }], { duration: dur, delay, easing, fill: 'both' });
    return a.finished.then(() => { c.el.style.transform = T(to); a.cancel(); }).catch(() => {});
  }
  const z = (c, v) => { c.el.style.zIndex = v; };

  // ---- layouts ----
  function circle(animated) {
    const { w, h } = S(); const R = Math.min(w * 0.34, h * 0.29);
    return Promise.all(cards.map((c, i) => { const a = (i / N) * Math.PI * 2 - Math.PI / 2; const p = { x: Math.cos(a) * R, y: Math.sin(a) * R * 0.92, r: (a * 180) / Math.PI + 90, s: 1 }; z(c, i); return animated ? move(c, p, 900, i * 35) : (put(c, p), Promise.resolve()); }));
  }
  async function gather() {
    await Promise.all(cards.map((c, i) => { z(c, i); return move(c, { x: (Math.random() - 0.5) * 3, y: -i * 0.6, r: (Math.random() - 0.5) * 4, s: 1 }, 800, i * 45, 'cubic-bezier(.5,0,.2,1)'); }));
    sound && sound.tap(0.3);
  }
  async function riffle() {
    const half = Math.ceil(N / 2); const off = CW() * 0.95;
    await Promise.all(cards.map((c, i) => move(c, i < half ? { x: -off, y: -i * 0.5, r: -8 } : { x: off, y: -(i - half) * 0.5, r: 8 }, 420, 0, 'cubic-bezier(.4,0,.2,1)')));
    // bend & lift
    await Promise.all(cards.map((c, i) => move(c, { y: c.st.y - 10, r: c.st.r * 1.6 }, 220)));
    sound && sound.riffle(N, 0.026);
    const L = cards.slice(0, half), Rr = cards.slice(half); const merged = [];
    for (let k = 0; k < half; k++) { if (L[k]) merged.push(L[k]); if (Rr[k]) merged.push(Rr[k]); }
    await Promise.all(merged.map((c, k) => { z(c, 100 + k); return move(c, { x: (Math.random() - 0.5) * 3, y: -k * 0.6, r: (Math.random() - 0.5) * 3 }, 260, k * 26, 'cubic-bezier(.2,.6,.3,1)'); }));
    merged.forEach((c, k) => z(c, k)); cards.sort((a, b) => a.el.style.zIndex - b.el.style.zIndex);
    await wait(160);
    // square the deck
    await Promise.all(cards.map((c, i) => move(c, { x: 0, r: 0 }, 220)));
    sound && sound.tap(0.2);
  }
  async function overhand() {
    for (let pass = 0; pass < 3; pass++) {
      const n = 3 + rand(4); const top = cards.slice(-n);
      await Promise.all(top.map((c) => move(c, { y: c.st.y - CW() * 0.9, x: 6, r: -3 }, 260)));
      // drop under: move them to bottom of z order
      const rest = cards.slice(0, cards.length - n);
      const newOrder = [...top, ...rest];
      newOrder.forEach((c, k) => z(c, k));
      await Promise.all(top.map((c, k) => move(c, { y: -k * 0.6, x: 0, r: (Math.random() - 0.5) * 2 }, 300, k * 20)));
      sound && sound.riffle(4, 0.02);
      cards.splice(0, cards.length, ...newOrder);
      await Promise.all(cards.map((c, k) => move(c, { y: -k * 0.6 }, 120)));
    }
  }
  async function spread() {
    const { w, h } = S(); const span = Math.min(w * 0.84, 1080); const n = cards.length;
    await Promise.all(cards.map((c, k) => { const t = k / (n - 1) - 0.5; z(c, k); return move(c, { x: t * span, y: h * 0.2 + Math.pow(t * 2, 2) * 26, r: t * 16, s: 1 }, 700, k * 34, 'cubic-bezier(.25,.8,.25,1)'); }));
    sound && sound.riffle(n, 0.03);
  }
  const slotPos = (i) => { const { w, h } = S(); const gap = small ? w * 0.31 : Math.min(w * 0.3, 280); return { x: (i - 1) * gap, y: -h * 0.08, r: 0, s: small ? 1.3 : 1.35 }; };

  // ---- flow ----
  async function begin() {
    if (phase !== 'idle') return;
    phase = 'shuffle'; form.classList.add('is-hidden'); setHint(null); readout.innerHTML = '';
    // the real draw: the full 78-card deck, shuffled with crypto randomness
    order = DECK.map((c) => c.id); for (let i = order.length - 1; i > 0; i--) { const j = rand(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
    const q = input.value.trim(); asked = q;
    await say(q ? 'I hear your question. Keep it close while I work.' : 'Keep your question close. You need not speak it.');
    await say('I gather the cards.', 600); await gather();
    await say('Now I shuffle. The deck must forget the last hand that touched it.', 900);
    await riffle(); await overhand(); await riffle();
    await say('There. I lay them out before you.', 700); await spread();
    if (!alive) return;
    phase = 'choose';
    cards.forEach((c) => { c.el.tabIndex = 0; c.el.setAttribute('aria-label', 'A face-down card. Choose it.'); });
    await say('Touch three cards that call to you. Do not think. Let the hand choose.', 400);
    setHint('Touch three cards in the spread');
    bChoose.hidden = false;
  }
  async function pick(c) {
    if (phase !== 'choose' || picks.includes(c)) return;
    const i = picks.length; picks.push(c); setHint(i < 2 ? `${2 - i} more ${2 - i === 1 ? 'card' : 'cards'}` : null);
    c.el.tabIndex = -1; z(c, 500 + i); c.el.classList.add('is-picked'); sound && sound.tap(0.35);
    const d = { id: order[i], reversed: rand(100) < 30 }; c.draw = d; c.pos = i;
    const card = DECK.find((x) => x.id === d.id);
    c.el.classList.toggle('is-major', d.id.charAt(0) === 'm'); c.el.querySelector('img').src = new URL(`images/tarot/${d.id}.jpg`, ROOT).href; c.el.querySelector('img').alt = card.name;
    await move(c, slotPos(i), 900, 0, 'cubic-bezier(.3,.1,.2,1)');
    if (picks.length === 3) {
      phase = 'reveal'; bChoose.hidden = true;
      await Promise.all(cards.filter((x) => !picks.includes(x)).map((x, k) => { x.el.tabIndex = -1; return move(x, { x: 0, y: S().h * 0.36, r: 0, s: 0.8 }, 700, k * 18); }));
      cards.filter((x) => !picks.includes(x)).forEach((x) => x.el.classList.add('is-away'));
      await say('Three cards. Face down, still yours alone.', 600);
      setHint('Touch a card to turn it'); bNext.hidden = false; bNext.focus({ preventScroll: true });
    }
  }
  async function turn() {
    if (phase !== 'reveal' || turned >= 3) return;
    phase = 'turning'; bNext.disabled = true; setHint(null);
    const c = picks[turned]; const d = c.draw; const card = DECK.find((x) => x.id === d.id); const P = POS[turned];
    await say(P.turn, 400);
    c.el.classList.add('is-flipped'); if (d.reversed) c.el.classList.add('is-reversed');
    sound && sound.bell(110 + turned * 18, 0.16);
    // the omen: the room darkens, the turned card bleeds light and shudders
    stage.classList.remove('is-omen'); void stage.offsetWidth; stage.classList.add('is-omen');
    setTimeout(() => c.el.classList.add('is-burning'), 700);
    c.el.setAttribute('aria-label', `${P.key}: ${card.name}${d.reversed ? ', reversed' : ''}`);
    await wait(1100);
    const text = `${card.name}${d.reversed ? ', reversed' : ''}. ${d.reversed ? 'Turned against itself, it' : 'It'} speaks of ${lc(d.reversed ? card.rev : card.up)}.`;
    const li = document.createElement('li'); li.innerHTML = `<img class="ro-card${d.reversed ? ' is-rev' : ''}" src="${new URL(`images/tarot/${d.id}.jpg`, ROOT).href}" alt="" loading="lazy"><span class="ro-pos">${P.key}</span><span class="ro-name">${card.name}${d.reversed ? ' <em>(reversed)</em>' : ''}</span><span class="ro-text">${d.reversed ? card.rev : card.up}.</span>`;
    readout.appendChild(li);
    await say(text);
    turned++;
    if (turned < 3) { phase = 'reveal'; bNext.disabled = false; setHint('Touch the next card'); }
    else {
      phase = 'done'; bNext.hidden = true;
      const R = composeReading(asked, picks.map((p) => ({ card: DECK.find((x) => x.id === p.draw.id), reversed: p.draw.reversed })));
      const back = '<span class="bb-seal" aria-hidden="true"><svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="#f6d995" stroke-width="2" stroke-linecap="round" focusable="false"><path class="bb-a" d="M25.5 16.6c-3.6-.5-8.4-.4-14.6.2"/><path class="bb-a" d="M14.2 10.4c-1.7 2.2-3.6 4-6.2 5.9 2.5 1.6 4.4 3.4 6.1 5.8"/><path class="bb-f" d="M25.5 16.6c1.6-.4 2.6-1.7 2-2.9-.6-1.1-2.2-.7-2.1.6"/></svg></span>';
      synth.innerHTML = `<div class="syn-top"><button type="button" class="back-btn syn-back">${back}<span class="bb-t">Back to the deck</span></button></div><p class="kicker">The reading, whole</p>${R.html}<p class="syn-note">For reflection only. The cards show patterns, not certainties; the choices remain yours.</p>`
        + `<div class="syn-actions"><button type="button" class="back-btn syn-back">${back}<span class="bb-t">Back to the deck</span></button><a class="btn syn-leave" href="${new URL('albums.html', ROOT).href}">Leave the tarot room</a></div>`;
      synth.hidden = false; try { document.dispatchEvent(new CustomEvent('pb:rite', { detail: 'tarot' })); } catch (e) {}
      await say('Now I lay the three together. ' + R.summary, 4200);
      await say('Read it slowly, below. Sit with it a while. The cards only show what you already carry.');
      bAgain.hidden = false;
    }
  }
  async function again() {
    phase = 'reset'; bAgain.hidden = true; picks = []; turned = 0; synth.hidden = true; synth.innerHTML = ''; readout.innerHTML = '';
    stage.classList.remove('is-omen'); cards.forEach((c) => { c.el.classList.remove('is-flipped', 'is-reversed', 'is-picked', 'is-away', 'is-burning', 'is-major'); c.el.tabIndex = -1; });
    await say('Again, then. I take the cards back.', 600);
    await circle(true); phase = 'idle'; form.classList.remove('is-hidden'); input.value = ''; input.focus({ preventScroll: true });
    setHint('Ask your question, then touch the deck to begin');
  }

  // ---- events ----
  form.addEventListener('submit', (e) => { e.preventDefault(); begin(); });
  layer.addEventListener('click', (e) => {
    const el = e.target.closest('.tc'); if (!el) return; const c = cards.find((x) => x.el === el);
    if (phase === 'idle') begin(); else if (phase === 'choose') pick(c); else if (phase === 'reveal' && picks[turned] === c) turn();
  });
  bChoose.addEventListener('click', () => { const pool = cards.filter((c) => !picks.includes(c)); for (let k = picks.length; k < 3; k++) { const c = pool.splice(rand(pool.length), 1)[0]; setTimeout(() => pick(c), (k - picks.length) * 450); } });
  bNext.addEventListener('click', turn);
  bAgain.addEventListener('click', again);
  // after a reading: put the cards back and return to the deck
  synth.addEventListener('click', (e) => {
    if (!e.target.closest('.syn-back') || phase !== 'done') return;
    stage.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    again();
  });
  const onResize = () => { if (phase === 'idle') circle(false); };
  addEventListener('resize', onResize);

  circle(false);
  if (!reduceMotion) cards.forEach((c, i) => c.el.animate([{ opacity: 0, transform: T({ ...c.st, s: 0.6 }) }, { opacity: 1, transform: T(c.st) }], { duration: 900, delay: 200 + i * 60, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }));
  setHint('Ask your question, then touch the deck to begin');
  return { destroy() { alive = false; removeEventListener('resize', onResize); } };
}
