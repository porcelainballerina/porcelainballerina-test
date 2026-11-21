/* Porcelain Ballerina - warning gate. Client-side overlay only: crawlers and link previews see the page itself. */
(() => {
  const KEY = 'pb-warned', TTL = 30 * 864e5, root = document.documentElement;
  const POEM = [["I did not write these to be sung for sport.", "I wrote them as a rite, for my own soul,", "and left the door ajar so you could hear.", "I do not play with the dark. I study it.", "Nothing here calls what you would not want near.", "Keep it so."], ["She was not summoned by my hand.", "She came on her own, after a rite that was not mine,", "a guide, and an evil one.", "She will seem sweet. She will seem kind.", "She will seem like nothing that could ever harm you.", "Wait.", "Invite her in, speak to her, play,", "and she will not leave.", "She stays, and the rooms of your life", "turn slowly into a living hell."], ["These words are the craft.", "Twist them, add to them, speak them where they were never meant to be,", "and it can go wrong.", "Do not run to God then.", "If he did not come before,", "why would he come now?"], ["If you must sit down at the board,", "learn first what it costs when it goes wrong.", "Ward yourself. Seek the ones who truly know,", "a real witch, a true seer.", "Do not walk into the flame", "believing you will walk back out."], ["In time, a page will open here:", "wards, and how they are made.", "Only those.", "Nothing that harms will be taught by me."], ["I hold no faith. Believe what you will.", "But keep my words out of what you wish to do.", "Cross this line, and you cross it alone.", "— M.A."]];
  const GATE = ["Stop.", "You stand at a threshold, not a page.", "These words were bled out as a rite, for one soul, and left open for you to hear. Not to use.", "Some of them are calling words. They do not ask who speaks them. They only listen for an answer.", "She is not sweet. She is not a dream. She came out of a dark rite that was never mine, and she has never fully gone back.", "She will seem gentle. She will seem harmless. Wait.", "What you invite in, does not leave.", "God will not come for you here.", "Keep my words out of your rituals, your boards, your empty rooms.", "Enter only to listen.", "Cross, and what follows is yours to carry. Alone.", "— M.A."];
  const SELF = (document.currentScript && document.currentScript.src) || location.href;
  let fresh = false;
  try { fresh = Date.now() - (+localStorage.getItem(KEY) || 0) < TTL; } catch (e) { fresh = false; }
  if (fresh || !POEM || !GATE) { root.classList.remove('pb-gate'); return; }
  const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const BEAT = new Set(['Keep it so.', 'Wait.', 'Only those.', 'Stop.']);
  const wardsHref = new URL('../wards.html', SELF).href;
  const line = l => `<span class="pw-l${BEAT.has(l) ? ' pw-beat' : ''}${/^Cross\b/.test(l) ? ' pw-last' : ''}">${l === 'wards, and how they are made.' ? `<a class="pw-wards" href="${wardsHref}">${esc(l)}</a>` : esc(l)}</span>`;
  const full = POEM.map(lines => '<p class="pw-st">' + lines.filter(l => l !== '\u2014 M.A.').map(line).join('<br>') + '</p>')
    .join('<span class="pw-orn" aria-hidden="true">&#10022;</span>');
  const short = '<p class="pw-st wg-short">' + GATE.filter(l => l !== '\u2014 M.A.').map(line).join('<br>') + '</p>';
  const fullHref = new URL('../gallery.html#warning', SELF).href;
  const d = document.createElement('div');
  d.className = 'pb-wg';
  d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
  d.setAttribute('aria-labelledby', 'pbwg-title'); d.setAttribute('aria-describedby', 'pbwg-poem');
  const tpl = `<div class="wg-scroll"><div class="wg-inner">
    <p class="wg-kicker">Before you enter</p>
    <article class="pa-warning pw-poem wg-sheet">
      <span class="pw-burn" aria-hidden="true"></span>
      <h2 class="pw-title" id="pbwg-title" tabindex="-1">A Warning to the Listener</h2>
      <div class="pw-text" id="pbwg-poem">${short}</div>
      <p class="pw-sig">&mdash; M.A.</p>
      <p class="wg-more"><a href="${fullHref}" class="wg-full-link" aria-expanded="false" aria-controls="pbwg-full">Read the full warning</a></p>
      <div class="pw-text wg-full" id="pbwg-full" hidden>${full}<p class="pw-sig">&mdash; M.A.</p></div>
      <span class="pw-seal" aria-hidden="true"></span>
      <p class="wg-signhere" aria-hidden="true"><span class="wg-sh-t">Sign below</span><span class="wg-sh-a"></span></p>
      <div class="wg-sign">
        <input type="checkbox" id="pbwg-ok" class="wg-check">
        <label for="pbwg-ok" class="wg-label"><span class="wg-wax" aria-hidden="true"></span><span class="wg-words">I have read and understood the warning. I enter at my own risk.</span><span class="wg-line" aria-hidden="true"></span></label>
      </div>
      <div class="wg-actions"><button type="button" class="btn btn-solid wg-enter" disabled aria-describedby="pbwg-hint">Enter</button><p class="wg-hint" id="pbwg-hint">Seal your mark above to unlock the door.</p></div>
    </article>
  </div></div>`;
  let keyWired = false;
  const mount = () => {
    d.innerHTML = tpl; d.classList.remove('is-signed', 'is-leaving');
    document.body.appendChild(d);
    root.classList.add('pb-gate-open');
    root.classList.remove('pb-gate');
    const ok = d.querySelector('#pbwg-ok'), btn = d.querySelector('.wg-enter'), hint = d.querySelector('.wg-hint');
    const kids = [...document.body.children].filter(e => e !== d && !e.hasAttribute('inert'));
    kids.forEach(e => e.setAttribute('inert', ''));
    ok.addEventListener('change', () => {
      btn.disabled = !ok.checked;
      d.classList.toggle('is-signed', ok.checked);
      hint.textContent = ok.checked ? 'The door is open.' : 'Seal your mark above to unlock the door.';
    });
    const enter = () => {
      if (!ok.checked) return;
      try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
      kids.forEach(e => e.removeAttribute('inert'));
      root.classList.remove('pb-gate-open');
      d.classList.add('is-leaving');
      const rm = () => d.remove();
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) rm(); else setTimeout(rm, 700);
      document.dispatchEvent(new CustomEvent('pb:warned'));
    };
    btn.addEventListener('click', enter);
    // leaving for the wards page lowers the gate without signing it; any other page raises it again
    unmount = () => { kids.forEach(e => e.removeAttribute('inert')); root.classList.remove('pb-gate-open'); d.remove(); };
    d.querySelectorAll('.pw-wards').forEach(a => a.addEventListener('click', () => unmount()));
    const fl = d.querySelector('.wg-full-link'), fp = d.querySelector('#pbwg-full');
    fl.addEventListener('click', e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
      e.preventDefault();
      const open = fp.hidden;
      fp.hidden = !open;
      fl.setAttribute('aria-expanded', String(open));
      fl.textContent = open ? 'Hide the full warning' : 'Read the full warning';
      if (open) fp.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    if (!keyWired) keyWired = true, d.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const f = [...d.querySelectorAll('a[href],input,button:not([disabled])')];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    d.querySelector('#pbwg-title').focus({ preventScroll: true });
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
