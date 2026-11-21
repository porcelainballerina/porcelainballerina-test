// Generative chant-like ambience (Web Audio). Original synthesis, no samples.
// To layer in the band's own loop later, set AMBIENT_FILE to e.g. 'audio/ambient.mp3'.
import { ROOT } from './env.js';
const AMBIENT_FILE = null;

const KEY = 'pb-sound';
let ctx = null, master = null, wet = null, dry = null, started = false, timers = [];
const listeners = new Set();
let mbTimer = null;

export const sound = {
  get pref() { return localStorage.getItem(KEY) || 'unset'; },
  get on() { return started && ctx && ctx.state === 'running' && this.pref === 'on'; },
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  async enable() { localStorage.setItem(KEY, 'on'); await ensure(); await ctx.resume(); fadeTo(0.9, 3.5); emit(); },
  disable() { localStorage.setItem(KEY, 'off'); if (ctx) { fadeTo(0, 1.2); setTimeout(() => { if (sound.pref === 'off' && ctx) ctx.suspend(); emit(); }, 1300); } emit(); },
  async tryResume() { if (this.pref !== 'on') return false; await ensure(); try { await ctx.resume(); } catch (e) {} if (ctx.state === 'running') fadeTo(0.9, 3); emit(); return ctx.state === 'running'; },
  impact() { if (!ctx || ctx.state !== 'running') return; boom(); bell(55, 0.5); },
  bell(f = 110, v = 0.35) { if (ctx && ctx.state === 'running') bell(f, v); },
  riffle(n = 16, gap = 0.028) { if (!ctx || ctx.state !== 'running') return; const now = ctx.currentTime; for (let i = 0; i < n; i++) tick(now + i * (gap + Math.random() * 0.012), 0.10 + Math.random() * 0.06); },
  tap(v = 0.25) { if (!ctx || ctx.state !== 'running') return; tick(ctx.currentTime, v, 900); },
  whisper(v = 0.5) { if (!ctx || ctx.state !== 'running') return; whisper(v); },
  ignite() { if (!ctx || ctx.state !== 'running') return; const now = ctx.currentTime; for (let i = 0; i < 6; i++) tick(now + i * 0.018, 0.25, 4200); swoosh(0.4, 1.2, 900); },
  crack() { if (!ctx || ctx.state !== 'running') return; const now = ctx.currentTime; for (let i = 0; i < 14; i++) tick(now + i * 0.012 + Math.random() * 0.01, 0.35, 1800 + Math.random() * 2000); boom(); },
  deny() { if (!ctx || ctx.state !== 'running') return; const now = ctx.currentTime; const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(70, now); o.frequency.exponentialRampToValueAtTime(40, now + 0.8); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300; const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.35, now + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, now + 1); o.connect(lp).connect(g); g.connect(dry); g.connect(wet); o.start(now); o.stop(now + 1.1); },
  musicBox(on) { if (on) { if (!ctx || ctx.state !== 'running' || mbTimer) return; let i = 0; const MEL = [1174.7, 1396.9, 1760, 1568, 1396.9, 1318.5, 1174.7, 1108.7, 1174.7, 1318.5, 1396.9, 880, 1174.7, 0, 0, 0];
      const step = () => { if (!ctx || ctx.state !== 'running') { mbTimer = null; return; } const f = MEL[i % MEL.length]; if (f) tine(f, 0.09); if (i % 4 === 0 && f) tine(f / 2, 0.05); i++; mbTimer = setTimeout(step, 430 + (i % MEL.length === 0 ? 900 : 0) + Math.random() * 30); }; step(); }
    else { clearTimeout(mbTimer); mbTimer = null; } },
  creak(dur = 6) { if (!ctx || ctx.state !== 'running') return; creak(dur); },
  heartbeat() { if (!ctx || ctx.state !== 'running') return; const now = ctx.currentTime; [0, 0.28].forEach((dt, k) => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(58, now + dt); o.frequency.exponentialRampToValueAtTime(34, now + dt + 0.18); const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now + dt); g.gain.exponentialRampToValueAtTime(k ? 0.32 : 0.45, now + dt + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + dt + 0.3); o.connect(g); g.connect(dry); o.start(now + dt); o.stop(now + dt + 0.35); }); },
  get state() { return ctx ? ctx.state : 'none'; },
};
function emit() { listeners.forEach((f) => f(sound)); }

function fadeTo(v, t) {
  if (!master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(v, now + t);
}

function impulse(seconds = 4.5, decay = 2.6) {
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

const VOWELS = {
  a: [[800, 1], [1150, 0.5], [2900, 0.12]],
  o: [[450, 1], [800, 0.35], [2830, 0.08]],
  u: [[325, 1], [700, 0.25], [2530, 0.05]],
  e: [[400, 1], [1600, 0.3], [2700, 0.1]],
};

function voice(freq, gain) {
  const out = ctx.createGain(); out.gain.value = 0;
  const src = ctx.createGain(); src.gain.value = 0.22;
  const oscs = [-7, 0, 6].map((det) => {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = freq; o.detune.value = det;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 4.6 + Math.random() * 0.8;
    const lg = ctx.createGain(); lg.gain.value = 3 + Math.random() * 3; lfo.connect(lg).connect(o.detune);
    o.connect(src); o.start(); lfo.start();
    return o;
  });
  const formants = VOWELS.a.map(([f, a]) => {
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 9;
    const g = ctx.createGain(); g.gain.value = a * 1.6;
    src.connect(bp).connect(g).connect(out);
    return { bp, g };
  });
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
  out.connect(lp); lp.connect(wet); lp.connect(dry);
  return { oscs, formants, out, gain,
    setVowel(v, t) { const now = ctx.currentTime; VOWELS[v].forEach(([f, a], i) => { formants[i].bp.frequency.setTargetAtTime(f, now, t); formants[i].g.gain.setTargetAtTime(a * 1.6, now, t); }); },
    setFreq(f, t) { const now = ctx.currentTime; oscs.forEach((o) => o.frequency.setTargetAtTime(f, now, t)); },
    swell(v, t) { out.gain.setTargetAtTime(v, ctx.currentTime, t); } };
}

function bell(f, v) {
  const partials = [0.56, 0.92, 1.19, 1.71, 2, 2.74, 3, 3.76, 4.07];
  const now = ctx.currentTime;
  partials.forEach((p, i) => {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * p * 2;
    const g = ctx.createGain(); const amp = v * (1 / (i + 1.4));
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(amp, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 9 / (1 + i * 0.35));
    o.connect(g); g.connect(wet); g.connect(dry); o.start(now); o.stop(now + 10);
  });
}

function tick(at, v, f = 3200) {
  const len = Math.floor(ctx.sampleRate * 0.03); const b = ctx.createBuffer(1, len, ctx.sampleRate); const d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const src = ctx.createBufferSource(); src.buffer = b; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * (0.8 + Math.random() * 0.4); bp.Q.value = 1.2;
  const g = ctx.createGain(); g.gain.value = v; src.connect(bp).connect(g); g.connect(dry); g.connect(wet); src.start(at);
}

function swoosh(v, dur, f) {
  const now = ctx.currentTime; const len = Math.floor(ctx.sampleRate * dur); const b = ctx.createBuffer(1, len, ctx.sampleRate); const d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = b; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2;
  bp.frequency.setValueAtTime(f * 0.5, now); bp.frequency.exponentialRampToValueAtTime(f * 1.6, now + dur * 0.4); bp.frequency.exponentialRampToValueAtTime(f * 0.7, now + dur);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(v, now + dur * 0.25); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  src.connect(bp).connect(g); g.connect(wet); g.connect(dry); src.start(now);
}
// breathy, wordless whisper: band-limited noise shaped into syllables, drifting between the ears
function whisper(v) {
  const now = ctx.currentTime; const dur = 2.6; const len = Math.floor(ctx.sampleRate * dur); const b = ctx.createBuffer(1, len, ctx.sampleRate); const d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = b;
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1200;
  const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 6; f1.frequency.value = 2400;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now);
  let t = now + 0.05; while (t < now + dur - 0.3) { const syl = 0.12 + Math.random() * 0.22; g.gain.linearRampToValueAtTime(v * (0.5 + Math.random() * 0.5), t + syl * 0.3); g.gain.linearRampToValueAtTime(v * 0.08, t + syl); f1.frequency.setValueAtTime(1600 + Math.random() * 2600, t); t += syl + Math.random() * 0.08; }
  g.gain.linearRampToValueAtTime(0.0001, now + dur);
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  let node = src.connect(hp).connect(f1).connect(g);
  if (pan) { pan.pan.setValueAtTime(-0.8, now); pan.pan.linearRampToValueAtTime(0.8, now + dur); node = node.connect(pan); }
  node.connect(dry); node.connect(wet); src.start(now);
}

function tine(f, v) {
  const now = ctx.currentTime;
  [[1, 1, 1.6], [2.76, 0.25, 0.4], [5.4, 0.08, 0.15]].forEach(([m, a, d]) => {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * m;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(v * a, now + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, now + d);
    o.connect(g); g.connect(dry); g.connect(wet); o.start(now); o.stop(now + d + 0.05);
  });
}
// a heavy old door: slow groaning hinge (wobbling filtered saw) under a low rumble
function creak(dur) {
  const now = ctx.currentTime;
  const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(52, now);
  const lfo = ctx.createOscillator(); lfo.frequency.value = 7; const lg = ctx.createGain(); lg.gain.value = 9; lfo.connect(lg).connect(o.frequency);
  for (let t = 0; t < dur; t += 0.5) o.frequency.linearRampToValueAtTime(44 + Math.random() * 30, now + t + 0.5);
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 6;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.22, now + 0.8); g.gain.setValueAtTime(0.22, now + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  o.connect(bp).connect(g); g.connect(wet); g.connect(dry); o.start(now); lfo.start(now); o.stop(now + dur + 0.1); lfo.stop(now + dur + 0.1);
}

function boom() {
  const now = ctx.currentTime;
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(90, now); o.frequency.exponentialRampToValueAtTime(28, now + 2.5);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.9, now + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, now + 4);
  o.connect(g); g.connect(dry); g.connect(wet); o.start(now); o.stop(now + 4.2);
  // noise crack
  const nb = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate); const d = nb.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 6);
  const n = ctx.createBufferSource(); n.buffer = nb; const hp = ctx.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 2400; hp.Q.value = 0.7;
  const ng = ctx.createGain(); ng.gain.value = 0.35; n.connect(hp).connect(ng).connect(wet); n.start(now);
}

async function ensure() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
  master.connect(comp).connect(ctx.destination);
  const conv = ctx.createConvolver(); conv.buffer = impulse();
  wet = ctx.createGain(); wet.gain.value = 0.55; dry = ctx.createGain(); dry.gain.value = 0.25;
  wet.connect(conv).connect(master); dry.connect(master);

  // sub drone
  const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = 36.71;
  const sg = ctx.createGain(); sg.gain.value = 0.22; sub.connect(sg).connect(dry); sub.start();
  const sub2 = ctx.createOscillator(); sub2.type = 'triangle'; sub2.frequency.value = 73.42;
  const sg2 = ctx.createGain(); sg2.gain.value = 0.05; sub2.connect(sg2).connect(wet); sub2.start();

  // wind / breath
  const nb = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate); const nd = nb.getChannelData(0);
  let last = 0; for (let i = 0; i < nd.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; nd[i] = last * 3.5; }
  const wind = ctx.createBufferSource(); wind.buffer = nb; wind.loop = true;
  const wbp = ctx.createBiquadFilter(); wbp.type = 'bandpass'; wbp.frequency.value = 500; wbp.Q.value = 0.8;
  const wg = ctx.createGain(); wg.gain.value = 0.35;
  const wl = ctx.createOscillator(); wl.frequency.value = 0.05; const wlg = ctx.createGain(); wlg.gain.value = 300; wl.connect(wlg).connect(wbp.frequency); wl.start();
  wind.connect(wbp).connect(wg).connect(wet); wind.start();

  // choir: D minor modal progression, low male-choir register
  const D = 73.42;
  const chords = [[1, 1.5, 2, 2.4], [1, 1.5, 2, 2.67], [0.89, 1.33, 1.78, 2.4], [1, 1.5, 1.78, 2.25]];
  const voices = chords[0].map((m, i) => voice(D * m, 0.0));
  const vowels = ['a', 'o', 'u', 'o', 'e', 'a'];
  let step = 0;
  function advance() {
    const ch = chords[step % chords.length];
    voices.forEach((v, i) => { v.setFreq(D * ch[i], 2.5); v.setVowel(vowels[(step + i) % vowels.length], 3); v.swell(i === 3 ? 0.18 : 0.32, 3.5); });
    if (step % 2 === 1) setTimeout(() => voices.forEach((v, i) => v.swell(i === 0 ? 0.3 : 0.12, 3)), 7000);
    step++;
  }
  advance();
  timers.push(setInterval(advance, 13000));
  // occasional distant bell
  const ring = () => { if (ctx.state === 'running') bell([55, 73.42, 82.4][Math.floor(Math.random() * 3)], 0.22); timers.push(setTimeout(ring, 14000 + Math.random() * 12000)); };
  timers.push(setTimeout(ring, 6000));

  // optional local file loop
  try {
    if (AMBIENT_FILE) {
      const url = new URL(AMBIENT_FILE, ROOT);
      const el = new Audio(url.href); el.loop = true; el.crossOrigin = 'anonymous';
      const src = ctx.createMediaElementSource(el); const fg = ctx.createGain(); fg.gain.value = 0.7;
      src.connect(fg).connect(master); el.play().catch(() => {});
      voices.forEach((v) => v.swell(0.08, 2));
    }
  } catch (e) {}
  started = true;
}
