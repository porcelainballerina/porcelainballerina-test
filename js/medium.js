// Medium sound: an opt-in séance layer, made live with the Web Audio API (no samples, no recordings).
// Faint crackle of an old wax cylinder, slow breathing, and a far-off sung vowel lost in echoes.
// Off by default; the choice is remembered in localStorage under 'pb-medium'.
const KEY = 'pb-medium';
let ctx = null, out = null, verb = null, timers = [];
const pref = () => { try { return localStorage.getItem(KEY) === 'on'; } catch (e) { return false; } };
const store = (on) => { try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {} };

function noiseBuffer(sec, fn) { const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * sec), ctx.sampleRate); const d = b.getChannelData(0); fn(d, ctx.sampleRate); return b; }
function impulse(sec = 5.5, decay = 3) { const n = Math.floor(ctx.sampleRate * sec); const b = ctx.createBuffer(2, n, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); } return b; }

function crackle() {
  // 6 s loop: sparse clicks and pops on a thin hiss
  const buf = noiseBuffer(6, (d, sr) => { for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.02; let i = 0; while (i < d.length) { i += Math.floor(sr * (0.02 + Math.random() * 0.25)); const amp = Math.random() < 0.08 ? 0.9 : 0.25 + Math.random() * 0.35; const len = 8 + Math.floor(Math.random() * 40); for (let k = 0; k < len && i + k < d.length; k++) d[i + k] += amp * (Math.random() * 2 - 1) * Math.exp(-k / 6); } });
  const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true;
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
  const g = ctx.createGain(); g.gain.value = 0.055;
  s.connect(hp).connect(lp).connect(g).connect(out); s.start();
}
function breath() {
  const now = ctx.currentTime;
  const buf = noiseBuffer(4.5, (d) => { let l = 0; for (let i = 0; i < d.length; i++) { l = (l + 0.08 * (Math.random() * 2 - 1)) / 1.08; d[i] = l * 2.2 + (Math.random() * 2 - 1) * 0.15; } });
  const s = ctx.createBufferSource(); s.buffer = buf;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(1300, now); bp.frequency.linearRampToValueAtTime(1700, now + 1.6); bp.frequency.setValueAtTime(900, now + 1.9); bp.frequency.linearRampToValueAtTime(600, now + 4.2);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(0.06, now + 1.3); g.gain.linearRampToValueAtTime(0.0001, now + 1.8);      // in
  g.gain.linearRampToValueAtTime(0.075, now + 2.4); g.gain.linearRampToValueAtTime(0.0001, now + 4.3);     // out
  const pan = ctx.createStereoPanner(); pan.pan.value = Math.random() * 1.2 - 0.6;
  const toVerb = ctx.createGain(); toVerb.gain.value = 0.5;
  s.connect(bp).connect(g).connect(pan); pan.connect(out); pan.connect(toVerb).connect(verb); s.start(now); s.stop(now + 4.5);
}
function echoVoice() {
  // a far-off sung vowel: two detuned saws through vowel formants, then a dark feedback delay and a long hall
  const now = ctx.currentTime, dur = 3.6;
  const notes = [392, 349.2, 466.2, 440, 311.1]; const f0 = notes[Math.floor(Math.random() * notes.length)];
  const mix = ctx.createGain(); mix.gain.value = 0.5;
  [0, 7].forEach((cents) => {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f0; o.detune.value = cents;
    const vib = ctx.createOscillator(); vib.frequency.value = 5.2; const vg = ctx.createGain(); vg.gain.value = 5; vib.connect(vg).connect(o.frequency);
    o.frequency.setValueAtTime(f0 * 0.985, now); o.frequency.linearRampToValueAtTime(f0, now + 0.5); o.frequency.linearRampToValueAtTime(f0 * 0.97, now + dur);
    o.connect(mix); o.start(now); vib.start(now); o.stop(now + dur + 0.1); vib.stop(now + dur + 0.1);
  });
  const vowel = Math.random() < 0.5 ? [[320, 10], [870, 8], [2500, 12]] : [[700, 9], [1150, 9], [2800, 12]];   // "oo" / "ah"
  const env = ctx.createGain(); env.gain.setValueAtTime(0.0001, now); env.gain.exponentialRampToValueAtTime(0.05, now + 1.2); env.gain.setValueAtTime(0.05, now + dur - 1.2); env.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  vowel.forEach(([f, q]) => { const b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = q; mix.connect(b).connect(env); });
  const far = ctx.createBiquadFilter(); far.type = 'lowpass'; far.frequency.value = 1500;   // distance
  const dl = ctx.createDelay(2); dl.delayTime.value = 0.62; const fb = ctx.createGain(); fb.gain.value = 0.55; const dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 1100;
  const pan = ctx.createStereoPanner(); pan.pan.value = Math.random() < 0.5 ? -0.55 : 0.55;
  env.connect(far); far.connect(dl); dl.connect(dlp).connect(fb).connect(dl);
  const dry = ctx.createGain(); dry.gain.value = 0.12; const wetG = ctx.createGain(); wetG.gain.value = 0.9;
  far.connect(dry).connect(pan); dlp.connect(wetG).connect(pan); pan.connect(verb); pan.connect(out);
  setTimeout(() => { try { fb.disconnect(); } catch (e) {} }, (dur + 9) * 1000);
}
function loop(fn, min, max, first) { const t = () => { if (ctx && ctx.state === 'running') fn(); timers.push(setTimeout(t, min + Math.random() * (max - min))); }; timers.push(setTimeout(t, first)); }
async function start() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    out = ctx.createGain(); out.gain.value = 0;
    const comp = ctx.createDynamicsCompressor(); out.connect(comp).connect(ctx.destination);
    const conv = ctx.createConvolver(); conv.buffer = impulse(); verb = ctx.createGain(); verb.gain.value = 0.7; verb.connect(conv).connect(out);
    crackle(); loop(breath, 9000, 16000, 2500); loop(echoVoice, 22000, 38000, 7000);
  }
  try { await ctx.resume(); } catch (e) {}
  out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(0.9, ctx.currentTime, 1.2);
  return ctx.state === 'running';
}
function stop() { if (!ctx) return; out.gain.setTargetAtTime(0, ctx.currentTime, 0.35); setTimeout(() => { if (!pref() && ctx) ctx.suspend(); }, 1500); }

const btn = document.createElement('button');
btn.type = 'button'; btn.className = 'medium-toggle';
btn.innerHTML = '<span class="mt-flame" aria-hidden="true"></span><span class="mt-label">Medium off</span>';
document.body.appendChild(btn);
window.__pbMediumBtn = btn; if (window.__pbDockSound) window.__pbDockSound();
const paint = (running) => { const on = pref(); btn.setAttribute('aria-pressed', String(on)); btn.classList.toggle('is-on', on); btn.classList.toggle('needs-tap', on && !running);
  btn.querySelector('.mt-label').textContent = on ? (running ? 'Medium on' : 'Tap for the medium') : 'Medium off'; btn.title = btn.querySelector('.mt-label').textContent;
  btn.setAttribute('aria-label', on ? 'Séance sound is on: crackle, breath and a distant voice. Turn it off' : 'Turn on séance sound: crackle, breath and a distant voice'); };
btn.addEventListener('click', async () => { if (pref() && ctx && ctx.state === 'running') { store(false); stop(); paint(false); } else { store(true); paint(await start()); } });
paint(false);
if (pref()) {   // remembered: browsers need one touch before sound may play
  const wake = async () => { if (!pref()) return; paint(await start()); };
  ['pointerdown', 'keydown'].forEach((ev) => addEventListener(ev, function once(e) { if (e.target.closest && e.target.closest('.medium-toggle')) return; removeEventListener(ev, once, true); wake(); }, true));
}
