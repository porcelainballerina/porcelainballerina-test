/* Porcelain Ballerina - warning gate. Client-side overlay only: crawlers and link previews see the page itself.
   Sealed letter: the visitor must break the seal (click / tap / Enter / Space) before the letter can be read;
   the sign line and the Enter button appear only after the whole letter has been written out. */
(() => {
  const KEY = 'pb-warned-c', TTL = 30 * 864e5, root = document.documentElement;
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
  const INK_STEP = 520, INK_DUR = 950;
  const fullHref = new URL('../gallery.html#warning', SELF).href;
  const d = document.createElement('div');
  d.className = 'pb-wg';
  d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
  d.setAttribute('aria-label', 'A sealed letter at the door');
  const tpl = `<div class="wg-scroll"><div class="wg-inner">
    <p class="wg-kicker">Something was left at the door</p>
    <div class="wg-stage">
      <span class="wg-candle" aria-hidden="true"></span>
      <button type="button" class="wg-env" aria-describedby="pbwg-to pbwg-cta">
        <span class="wg-env-back" aria-hidden="true"></span>
        <span class="wg-env-paper" aria-hidden="true"></span>
        <span class="wg-env-front" aria-hidden="true"><span class="wg-env-to" id="pbwg-to">Don\u2019t open this, little one.</span></span>
        <span class="wg-env-flap" aria-hidden="true"></span>
        <span class="wg-env-seal" aria-hidden="true"><i class="wg-s0"></i><i class="wg-s1"></i><i class="wg-s2"></i></span>
        <span class="wg-smoke" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
        <span class="wg-sr">Break the seal and open the letter</span>
      </button>
      <p class="wg-cta" id="pbwg-cta">Open it anyway.</p>
    </div>
    <article class="pa-warning pw-poem wg-sheet wg-her" hidden>
      <span class="pw-burn" aria-hidden="true"></span>
      <h2 class="pw-title" id="pbwg-title" tabindex="-1">A Warning to the Listener</h2>
      <div class="pw-text wg-ink" id="pbwg-poem">${short}</div>
      <span class="pw-seal" aria-hidden="true"></span>
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
      later(() => stage.classList.add('is-flap'), 520);
      later(() => stage.classList.add('is-rise'), 1180);
      later(() => stage.classList.add('is-out'), 1900);
      later(() => { showSheet(); sheet.classList.add('is-unfold'); }, 2250);
      later(startInk, 2250 + 820);
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
