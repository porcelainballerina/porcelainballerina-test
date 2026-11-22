/* Porcelain Ballerina - warning gate. Client-side overlay only: crawlers and link previews see the page itself.
   Sealed letter: the visitor must break the seal (click / tap / Enter / Space) before the letter can be read;
   the sign line and the Enter button appear only after the whole letter has been written out. */
(() => {
  const KEY = 'pb-warned-d', TTL = 30 * 864e5, root = document.documentElement;
  const POEM = [["I did not write these to be sung for sport.", "I wrote them as a rite, for my own soul,", "and left the door ajar so you could hear.", "I do not play with the dark. I study it.", "Nothing here calls what you would not want near.", "Keep it so."], ["She was not summoned by my hand.", "She came on her own, after a rite that was not mine,", "a guide, and an evil one.", "She will seem sweet. She will seem kind.", "She will seem like nothing that could ever harm you.", "Wait.", "Invite her in, speak to her, play,", "and she will not leave.", "She stays, and the rooms of your life", "turn slowly into a living hell."], ["These words are the craft.", "Twist them, add to them, speak them where they were never meant to be,", "and it can go wrong.", "Do not run to God then.", "If he did not come before,", "why would he come now?"], ["If you must sit down at the board,", "learn first what it costs when it goes wrong.", "Ward yourself. Seek the ones who truly know,", "a real witch, a true seer.", "Do not walk into the flame", "believing you will walk back out."], ["In time, a page will open here:", "wards, and how they are made.", "Only those.", "Nothing that harms will be taught by me."], ["I hold no faith. Believe what you will.", "But keep my words out of what you wish to do.", "Cross this line, and you cross it alone.", "— M.A."]];
  const GATE = ["Stop.", "So. You touched the seal. They always do.", "He made these songs for his own soul, alone, in the dark, by candle and by hand. He only left the door ajar. I am the one who opened it wider.", "He does not play with the dark. He studies it. I am what he was studying when I walked in.", "No one summoned me. I came on my own, out of a rite that was not his. I am a guide. I never promised where.", "I will seem sweet. I will curtsy. I will hold your hand so gently.", "Wait.", "Some words in here are mine. They do not ask whose mouth they use. Say them, and I answer. I always answer.", "Invite me in, and I stay. The rooms go cold slowly. The mirrors start to lag behind you. You will hardly notice.", "God does not come down this far. I asked.", "Keep his words out of your games, your boards, your empty rooms.", "Listen, little one. Only listen.", "Cross, and you dance with me. Alone."];
  const SELF = (document.currentScript && document.currentScript.src) || location.href;
  let fresh = false;
  try { fresh = Date.now() - (+localStorage.getItem(KEY) || 0) < TTL; } catch (e) { fresh = false; }
  if (fresh || !POEM || !GATE) { root.classList.remove('pb-gate'); return; }
  const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const BEAT = new Set(['Keep it so.', 'Wait.', 'Only those.', 'Stop.']);
  const wardsHref = new URL('../wards.html', SELF).href;
  const RM = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let li = 0;
  const line = (l, ink) => `<span class="pw-l${BEAT.has(l) ? ' pw-beat' : ''}${/^Cross\b/.test(l) ? ' pw-last' : ''}"${ink ? ` style="--i:${li++}"` : ''}>${l === 'wards, and how they are made.' ? `<a class="pw-wards" href="${wardsHref}">${esc(l)}</a>` : esc(l)}</span>`;
  const full = POEM.map(lines => '<p class="pw-st">' + lines.filter(l => l !== '\u2014 M.A.').map(l => line(l)).join('<br>') + '</p>')
    .join('<span class="pw-orn" aria-hidden="true">&#10022;</span>');
  const gateLines = GATE.filter(l => l !== '\u2014 M.A.');
  const short = '<p class="pw-st wg-short">' + gateLines.map(l => line(l, true)).join('<br>') + '</p>';
  const INK_STEP = 560, INK_DUR = 1100;
  const fullHref = new URL('../gallery.html#warning', SELF).href;
  const d = document.createElement('div');
  d.className = 'pb-wg';
  d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
  d.setAttribute('aria-label', 'A sealed letter at the door');
  const img = new URL('../images/gate/', SELF).href;
  d.setAttribute('style', `--alt:url('${img}altar-wide.webp');--alt-sm:url('${img}altar-wide-sm.webp');--alt-t:url('${img}altar-tall.webp');--circ:url('${img}circle.jpg');--circ-sm:url('${img}circle-sm.jpg');--corner:url('${img}corner.jpg')`);
  const tpl = `<span class="wg-bg" aria-hidden="true"></span><span class="wg-circle" aria-hidden="true"><i></i></span><span class="wg-corner wg-c1" aria-hidden="true"></span><span class="wg-corner wg-c2" aria-hidden="true"></span><span class="wg-corner wg-c3" aria-hidden="true"></span><span class="wg-corner wg-c4" aria-hidden="true"></span><span class="wg-drift" aria-hidden="true"><i></i><i></i><i></i></span><span class="wg-flame" aria-hidden="true"><i class="wg-g1"></i><i class="wg-g2"></i><i class="wg-g3"></i><i class="wg-g4"></i></span><span class="wg-vig" aria-hidden="true"></span><svg class="wg-defs" aria-hidden="true" width="0" height="0" style="position:absolute"><filter id="wg-rag" x="-40%" y="-40%" width="180%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
  <div class="wg-scroll"><div class="wg-inner">
    <p class="wg-kicker">Something was left at the door</p>
    <div class="wg-stage">
      <button type="button" class="wg-env" aria-describedby="pbwg-to pbwg-cta">
        <img class="wg-pk" src="${img}packet-sm.webp" srcset="${img}packet-sm.webp 720w, ${img}packet.webp 1152w" sizes="(max-width:699px) 96vw, 660px" alt="" width="1152" height="864" draggable="false">
        <img class="wg-pk wg-pk2" src="${img}packet-open-sm.webp" srcset="${img}packet-open-sm.webp 720w, ${img}packet-open.webp 1152w" sizes="(max-width:699px) 96vw, 660px" alt="" width="1152" height="864" draggable="false" loading="eager"><span class="wg-env-shade" aria-hidden="true"></span><svg class="wg-ritual" aria-hidden="true" viewBox="0 0 100 75" preserveAspectRatio="none"><path d="M17.59 12.57 L20.57 12.67 L23.58 12.60 L26.80 12.52 L29.77 12.62 L32.71 12.58 L35.88 12.59 L38.93 12.53 L41.87 12.52 L44.96 12.68 L48.02 12.65 M17.58 62.05 L20.56 61.96 L23.71 62.05 L26.70 61.92 L29.71 61.94 L32.76 62.06 L35.78 62.08 L38.96 61.91 L41.90 62.00 L44.86 61.98 L48.08 61.92 M17.62 12.52 L17.62 14.92 L17.54 16.98 L17.52 19.32 L17.50 21.47 L17.60 23.87 L17.58 26.00 L17.63 28.18 L17.62 30.43 M17.62 38.59 L17.51 41.45 L17.62 44.30 L17.55 47.41 L17.70 50.17 L17.64 53.28 L17.55 56.15 L17.51 59.04 L17.63 62.02 M48.05 12.52 L47.97 14.91 L48.02 17.07 L47.98 19.41 L48.01 21.45 L48.06 23.75 L47.99 25.97 L47.99 28.23 L47.92 30.53 M47.92 38.56 L47.91 41.49 L48.06 44.37 L48.04 47.26 L48.05 50.24 L47.95 53.28 L47.98 56.10 L48.07 59.04 L48.03 61.93"/><path class="t" d="M18.57 13.45 L21.27 13.60 L24.15 13.59 L27.18 13.52 L29.84 13.41 L32.74 13.48 L35.68 13.59 L38.49 13.43 L41.39 13.43 L44.16 13.51 L47.14 13.41 M18.49 61.14 L21.41 61.08 L24.30 61.03 L27.12 61.15 L30.02 61.10 L32.72 61.01 L35.67 61.03 L38.55 61.02 L41.44 61.04 L44.14 61.04 L47.09 61.11"/><circle cx="17.6" cy="12.6" r="1.25"/><circle class="f" cx="17.6" cy="12.6" r=".35"/><circle cx="48.0" cy="12.6" r="1.25"/><circle class="f" cx="48.0" cy="12.6" r=".35"/><circle cx="17.6" cy="62.0" r="1.25"/><circle class="f" cx="17.6" cy="62.0" r=".35"/><circle cx="48.0" cy="62.0" r="1.25"/><circle class="f" cx="48.0" cy="62.0" r=".35"/><path d="M52.58 12.53 L55.72 12.69 L58.85 12.69 L61.87 12.70 L65.16 12.61 L68.20 12.61 L71.40 12.51 L74.47 12.61 L77.52 12.64 L80.72 12.52 L83.84 12.59 M52.60 62.03 L55.63 62.02 L58.81 62.08 L61.91 62.06 L65.13 62.02 L68.28 61.91 L71.34 62.02 L74.48 61.98 L77.47 61.94 L80.70 61.94 L83.71 61.97 M52.59 12.61 L52.51 14.89 L52.57 17.13 L52.50 19.40 L52.62 21.65 L52.70 23.85 L52.52 25.99 L52.55 28.32 L52.54 30.44 M52.52 38.42 L52.69 41.53 L52.57 44.42 L52.59 47.32 L52.57 50.28 L52.55 53.14 L52.60 56.06 L52.59 59.15 L52.50 61.92 M83.86 12.51 L83.75 14.91 L83.82 17.02 L83.71 19.27 L83.76 21.61 L83.90 23.84 L83.88 26.11 L83.88 28.35 L83.89 30.42 M83.76 38.45 L83.82 41.44 L83.77 44.44 L83.78 47.25 L83.76 50.24 L83.82 53.20 L83.79 56.06 L83.78 59.03 L83.73 62.01"/><path class="t" d="M53.44 13.54 L56.47 13.43 L59.41 13.47 L62.31 13.52 L65.31 13.58 L68.25 13.44 L71.15 13.47 L73.98 13.51 L77.01 13.57 L79.92 13.57 L82.90 13.42 M53.54 61.06 L56.45 61.01 L59.28 61.18 L62.23 61.03 L65.19 61.02 L68.26 61.20 L71.17 61.08 L74.16 61.10 L76.95 61.14 L79.93 61.05 L82.86 61.08"/><circle cx="52.6" cy="12.6" r="1.25"/><circle class="f" cx="52.6" cy="12.6" r=".35"/><circle cx="83.8" cy="12.6" r="1.25"/><circle class="f" cx="83.8" cy="12.6" r=".35"/><circle cx="52.6" cy="62.0" r="1.25"/><circle class="f" cx="52.6" cy="62.0" r=".35"/><circle cx="83.8" cy="62.0" r="1.25"/><circle class="f" cx="83.8" cy="62.0" r=".35"/><path d="M31.57 12.60q1.42 -1.33 2.85 0q-1.42 1.33 -2.85 0z"/><circle cx="33.00" cy="12.60" r="0.36"/><path d="M26.29 11.65a0.95 0.95 0 1 0 0 1.9a0.71 0.71 0 1 1 0 -1.9z"/><path d="M40.00 11.65l0.90 1.52h-1.80z"/><path d="M39.43 12.79h1.14"/><circle cx="60.00" cy="12.03" r="0.52"/><path d="M60.00 12.55v1.42M60.00 13.46h0.57"/><path d="M78.28 11.65a0.95 0.95 0 1 0 0 1.9a0.71 0.71 0 1 1 0 -1.9z"/><circle cx="25.00" cy="62.00" r="0.95"/><path d="M23.48 62.00h3.04M25.00 60.48v3.04"/><path d="M40.00 61.81c-0.85 -0.57 -0.47 -1.52 0 -1.52s0.85 0.95 0 1.52zM40.00 61.81v1.80M39.24 62.38h1.52"/><path d="M57.28 61.05a0.95 0.95 0 1 0 0 1.9a0.71 0.71 0 1 1 0 -1.9z"/><path d="M17.60 21.05l0.90 1.52h-1.80z"/><path d="M17.03 22.19h1.14"/><path d="M17.89 49.05a0.95 0.95 0 1 0 0 1.9a0.71 0.71 0 1 1 0 -1.9z"/><circle cx="48.00" cy="21.43" r="0.52"/><path d="M48.00 21.95v1.42M48.00 22.86h0.57"/><path d="M82.38 24.00q1.42 -1.33 2.85 0q-1.42 1.33 -2.85 0z"/><circle cx="83.80" cy="24.00" r="0.36"/><path d="M52.60 21.81c-0.85 -0.57 -0.47 -1.52 0 -1.52s0.85 0.95 0 1.52zM52.60 21.81v1.80M51.84 22.38h1.52"/><path d="M48.29 48.65A13.3 13.3 0 1 1 63.70 37.86"/><path class="t" d="M48.15 49.44A14.100000000000001 14.100000000000001 0 1 1 64.49 38.00" stroke-dasharray=".6 1.1"/><path class="t" d="M48.29 48.65L48.43 47.86M46.60 48.23L46.84 47.47M44.98 47.60L45.32 46.88M43.45 46.77L43.88 46.09M42.05 45.74L42.57 45.13M40.79 44.54L41.38 43.99M39.71 43.18L40.36 42.72M38.80 41.69L39.51 41.32M38.10 40.10L38.85 39.83M37.62 38.43L38.40 38.26M37.35 36.71L38.15 36.64M37.31 34.97L38.11 35.00M37.50 33.24L38.29 33.38M37.92 31.55L38.68 31.79M38.55 29.93L39.27 30.27M39.38 28.40L40.06 28.83M40.41 27.00L41.02 27.52M41.61 25.74L42.16 26.33M42.97 24.66L43.43 25.31M44.46 23.75L44.83 24.46M46.05 23.05L46.32 23.80M47.72 22.57L47.89 23.35M49.44 22.30L49.51 23.10M51.18 22.26L51.15 23.06M52.91 22.45L52.77 23.24M54.60 22.87L54.36 23.63M56.22 23.50L55.88 24.22M57.75 24.33L57.32 25.01M59.15 25.36L58.63 25.97M60.41 26.56L59.82 27.11M61.49 27.92L60.84 28.38M62.40 29.41L61.69 29.78M63.10 31.00L62.35 31.27M63.58 32.67L62.80 32.84M63.85 34.39L63.05 34.46M63.89 36.13L63.09 36.10M63.70 37.86L62.91 37.72"/><path d="M36.18 40.09a0.8 0.8 0 1 0 0 1.6a0.60 0.60 0 1 1 0 -1.6z"/><path d="M35.94 29.41l0.76 1.28h-1.52z"/><path d="M35.46 30.37h0.96"/></svg>
        <span class="wg-env-to" id="pbwg-to">Don\u2019t open this,<br>little one.<svg class="wg-uflour" viewBox="0 0 200 12" aria-hidden="true"><path d="M8 7c30-5 58 3 92 0s62-6 92-1"/><path d="M92 7c4-3 12-3 16 0"/><circle cx="100" cy="9.2" r="1.3"/></svg><span class="wg-row" aria-hidden="true"><svg class="wg-gl " viewBox="0 0 24 24"><circle cx="12" cy="11" r="4.2"/><path d="M7.5 3.5a4.5 4 0 0 0 9 0M12 15.2v6.6M9 18.6h6"/></svg><i>·</i><svg class="wg-gl " viewBox="0 0 24 24"><path d="M3 12c4-6 14-6 18 0-4 6-14 6-18 0z"/><circle cx="12" cy="12" r="2.4"/></svg><i>·</i><svg class="wg-gl " viewBox="0 0 24 24"><path d="M15 4.5a7.5 7.5 0 1 0 0 15 6 6 0 1 1 0-15z"/></svg></span></span>
        <span class="wg-env-ma" aria-hidden="true"><svg class="wg-ring" viewBox="-52 -52 104 104"><circle r="47.5"/><circle r="39" stroke-dasharray="9 2.2 1.2 2.2"/><path d="M40.0 0.0L45.0 0.0M39.4 6.9L42.3 7.5M37.6 13.7L40.4 14.7M34.6 20.0L39.0 22.5M30.6 25.7L32.9 27.6M25.7 30.6L27.6 32.9M20.0 34.6L22.5 39.0M13.7 37.6L14.7 40.4M6.9 39.4L7.5 42.3M0.0 40.0L0.0 45.0M-6.9 39.4L-7.5 42.3M-13.7 37.6L-14.7 40.4M-20.0 34.6L-22.5 39.0M-25.7 30.6L-27.6 32.9M-30.6 25.7L-32.9 27.6M-34.6 20.0L-39.0 22.5M-37.6 13.7L-40.4 14.7M-39.4 6.9L-42.3 7.5M-40.0 0.0L-45.0 0.0M-39.4 -6.9L-42.3 -7.5M-37.6 -13.7L-40.4 -14.7M-34.6 -20.0L-39.0 -22.5M-30.6 -25.7L-32.9 -27.6M-25.7 -30.6L-27.6 -32.9M-20.0 -34.6L-22.5 -39.0M-13.7 -37.6L-14.7 -40.4M-6.9 -39.4L-7.5 -42.3M-0.0 -40.0L-0.0 -45.0M6.9 -39.4L7.5 -42.3M13.7 -37.6L14.7 -40.4M20.0 -34.6L22.5 -39.0M25.7 -30.6L27.6 -32.9M30.6 -25.7L32.9 -27.6M34.6 -20.0L39.0 -22.5M37.6 -13.7L40.4 -14.7M39.4 -6.9L42.3 -7.5"/><path class="wg-rg" d="M0 -50v-0M-3 -51.5h6M0 -54.5v6 M50.5 -3l4 3-4 3z M-3 50l3 5 3-5z M-50.5 -3v6M-54 0h7"/></svg><b>M.A.</b></span><span class="wg-env-glyphs" aria-hidden="true"><svg class="wg-gl " viewBox="0 0 24 24"><path d="M12 3 5.5 14h13z M12 14v8M8.6 18.4h6.8"/></svg><svg class="wg-gl " viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.5"/><path d="M4.5 12h15"/></svg><svg class="wg-gl " viewBox="0 0 24 24"><path d="M9 3v13M6 6.5h6M9 10.5c2-2.6 7-2.2 6.4 2.2-.4 2.8-3.4 4-2.2 7.3"/></svg></span>
        <span class="wg-env-love" aria-hidden="true"><span class="wg-poem"><span class="wg-ini">B</span>reak my wax,<br>I learn your name.<br>We dance<br>in the dark,<br>alone, sweetie.</span><span class="wg-sign"><span class="wg-sig-name">Ballerina<svg class="wg-flour" viewBox="0 0 120 14"><path d="M4 9c18-6 38 4 58-1 16-4 30-9 40-4 6 3 3 8-3 6"/></svg></span><svg class="wg-heart" viewBox="0 0 24 22"><path d="M12 20.5C6.2 16.3 2.2 12.6 2.6 8.1 3 4.6 6.6 2.9 9.2 4.4c1.3.7 2.2 1.9 2.8 3.1.7-1.4 1.7-2.6 3.1-3.3 2.7-1.3 6 .5 6.2 3.9.3 4.4-3.6 8.2-9.3 12.4z"/></svg><span class="wg-mirror">Ballerina</span></span></span>
        <span class="wg-env-seal" aria-hidden="true"><img class="wg-s0" src="${img}seal.webp" alt="" draggable="false"><img class="wg-sg" src="${img}seal-glow.webp" alt="" draggable="false"><img class="wg-sc" src="${img}seal-cracked.webp" alt="" draggable="false"><img class="wg-s1" src="${img}seal-l.webp" alt="" draggable="false"><img class="wg-s2" src="${img}seal-r.webp" alt="" draggable="false"></span><span class="wg-sparks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
        <span class="wg-smoke" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <span class="wg-sr">Break the seal and open the letter</span>
      </button>
      <p class="wg-cta" id="pbwg-cta">Open it anyway.</p>
    </div>
    <article class="pw-poem wg-sheet wg-d" hidden style="--sheet:url('${img}sheet-edge.webp');--vellum:url('${img}vellum.jpg');--seal:url('${img}seal-sm.webp')">
      <span class="wg-crease" aria-hidden="true"></span>
      <h2 class="pw-title" id="pbwg-title" tabindex="-1">A Warning to the Listener</h2>
      <div class="pw-text wg-ink" id="pbwg-poem">${short}</div>
      <div class="wg-after" hidden>
        <p class="wg-more"><a href="${fullHref}" class="wg-full-link" aria-expanded="false" aria-controls="pbwg-full">Read the full warning</a></p>
        <div class="pw-text wg-full" id="pbwg-full" hidden>${full}<p class="pw-sig">&mdash; M.A.</p></div>
        <p class="wg-signhere" aria-hidden="true"><span class="wg-sh-t">Sign below</span><span class="wg-sh-a"></span></p>
        <div class="wg-sign">
          <input type="checkbox" id="pbwg-ok" class="wg-check">
          <label for="pbwg-ok" class="wg-label"><span class="wg-wax" aria-hidden="true"></span><span class="wg-words">I have heard her. I will listen, and I will not ask her in.</span><span class="wg-line" aria-hidden="true"></span></label>
        </div>
        <div class="wg-actions"><button type="button" class="btn btn-solid wg-enter" disabled aria-describedby="pbwg-hint">Enter</button><p class="wg-hint" id="pbwg-hint">Seal your mark above to open the door.</p></div>
      </div>
    </article>
  </div></div>`;
  let keyWired = false, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const mount = () => {
    timers.forEach(clearTimeout); timers = [];
    d.innerHTML = tpl; d.classList.remove('is-signed', 'is-leaving', 'is-open');
    document.body.appendChild(d);
    root.classList.add('pb-gate-open');
    root.classList.remove('pb-gate');
    const ok = d.querySelector('#pbwg-ok'), btn = d.querySelector('.wg-enter'), hint = d.querySelector('.wg-hint');
    const stage = d.querySelector('.wg-stage'), env = d.querySelector('.wg-env'), sheet = d.querySelector('.wg-sheet');
    const ink = d.querySelector('.wg-ink'), after = d.querySelector('.wg-after'), title = d.querySelector('#pbwg-title');
    const kids = [...document.body.children].filter(e => e !== d && !e.hasAttribute('inert'));
    kids.forEach(e => e.setAttribute('inert', ''));
    // --- reading: the letter writes itself line by line; a tap on the letter finishes it at once
    let read = false;
    const finish = () => {
      if (read) return; read = true;
      timers.forEach(clearTimeout); timers = [];
      ink.classList.add('is-inked');
      after.hidden = false;
      d.classList.add('is-read');
    };
    const startInk = () => {
      ink.classList.add('is-inking');
      later(finish, (gateLines.length - 1) * INK_STEP + INK_DUR + 250);
      sheet.addEventListener('click', e => { if (!read && !e.target.closest('a,button,input,label')) finish(); });
    };
    // --- opening: seal cracks, flap lifts, letter slides out and unfolds
    let opened = false;
    const showSheet = () => {
      stage.hidden = true; sheet.hidden = false;
      d.classList.add('is-open');
      title.focus({ preventScroll: true });
      d.querySelector('.wg-scroll').scrollTop = 0;
    };
    const open = () => {
      if (opened) return; opened = true;
      env.disabled = true; env.setAttribute('aria-disabled', 'true');
      if (RM()) { showSheet(); finish(); return; }
      stage.classList.add('is-crack');
      d.classList.add('is-flare');
      later(() => stage.classList.add('is-split'), 750);
      later(() => stage.classList.add('is-out'), 2000);
      later(() => { showSheet(); sheet.classList.add('is-unfold'); }, 2900);
      later(startInk, 2900 + 1500);
    };
    env.addEventListener('click', open);
    d.querySelector('.wg-cta').addEventListener('click', open);
    ok.addEventListener('change', () => {
      btn.disabled = !ok.checked;
      d.classList.toggle('is-signed', ok.checked);
      hint.textContent = ok.checked ? 'She heard you. The door is open.' : 'Seal your mark above to open the door.';
    });
    const enter = () => {
      if (!ok.checked) return;
      try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
      kids.forEach(e => e.removeAttribute('inert'));
      root.classList.remove('pb-gate-open');
      d.classList.add('is-leaving');
      const rm = () => d.remove();
      if (RM()) rm(); else setTimeout(rm, 700);
      document.dispatchEvent(new CustomEvent('pb:warned'));
    };
    btn.addEventListener('click', enter);
    // leaving for the wards page lowers the gate without signing it; any other page raises it again
    unmount = () => { timers.forEach(clearTimeout); timers = []; kids.forEach(e => e.removeAttribute('inert')); root.classList.remove('pb-gate-open'); d.remove(); };
    d.querySelectorAll('.pw-wards').forEach(a => a.addEventListener('click', () => unmount()));
    const fl = d.querySelector('.wg-full-link'), fp = d.querySelector('#pbwg-full');
    fl.addEventListener('click', e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
      e.preventDefault();
      const o = fp.hidden;
      fp.hidden = !o;
      fl.setAttribute('aria-expanded', String(o));
      fl.textContent = o ? 'Hide the full warning' : 'Read the full warning';
      if (o) fp.scrollIntoView({ block: 'start', behavior: RM() ? 'auto' : 'smooth' });
    });
    if (!keyWired) keyWired = true, d.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const f = [...d.querySelectorAll('a[href],input,button:not([disabled])')].filter(el => el.offsetParent !== null || el === document.activeElement);
      if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || !d.contains(document.activeElement) || document.activeElement === title)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    try { env.focus({ preventScroll: true, focusVisible: false }); } catch (e) { env.focus(); }
  };
  // The wards page is protective only and is linked from the gate itself, so it opens without the gate;
  // leaving it for any other page (in-site navigation) still raises the gate until it is accepted.
  const exempt = () => /\/wards\.html$/.test(location.pathname);
  const accepted = () => { try { return Date.now() - (+localStorage.getItem(KEY) || 0) < TTL; } catch (e) { return false; } };
  let unmount = () => {};
  const maybe = () => {
    if (exempt()) { if (d.isConnected) unmount(); return; }
    if (!accepted() && !d.isConnected) mount();
  };
  document.addEventListener('pb:page', maybe);
  if (exempt()) { root.classList.remove('pb-gate'); return; }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount, { once: true });
})();
