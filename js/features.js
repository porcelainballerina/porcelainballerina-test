import { init as greetingInit } from './greetings.js';
// Porcelain Ballerina — small fittings: release seal, daily oracle, music box, numbers room, hidden room door.
import { ROOT } from './env.js';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NOW = () => new Date(); // the clock every countdown reads; tests can move it by overriding Date
let timers = [];

// ---------- upcoming releases: countdown, 'Out now on Spotify' from the release moment, gone from the countdowns 7 days later (data-expire) ----------
function release(root) {
  // One shared clock keeps all cards in sync, and promotes the next home card as one expires.
  const cards = $$('[data-release]', root);
  const tick = () => {
    const now = NOW().getTime();
    cards.forEach((card) => {
      const at = Date.parse(card.dataset.release);
      const until = Date.parse(card.dataset.expire || '') || Infinity;
      const expired = now >= until;
      card.dataset.expired = String(expired);
      card.hidden = expired;
      if (expired) return;
      const box = $('[data-release-count]', card);
      const live = now >= at;
      card.classList.toggle('is-open', live);
      if (box) box.hidden = live;
      $$('.rl-live, .al-spot, .rl-open', card).forEach((e) => { e.hidden = !live; });
      $$('.rl-links', card).forEach((e) => { e.hidden = e.dataset.when !== (live ? 'after' : 'before'); });
      const note = $('.rl-note', card); if (note) note.hidden = live;
      // Preserve the exact Spotify date/time, including the zone, after release too.
      if (live && !$('.rl-when', card)) { const k = $('.rl-k', card); if (k) k.textContent = 'Released'; }
      if (!live && box) {
        const s = Math.max(0, Math.floor((at - now) / 1000));
        $('[data-u="d"]', box).textContent = Math.floor(s / 86400);
        $('[data-u="h"]', box).textContent = pad(Math.floor(s / 3600) % 24);
        $('[data-u="m"]', box).textContent = pad(Math.floor(s / 60) % 60);
        $('[data-u="s"]', box).textContent = pad(s % 60);
      }
    });
    $$('[data-upcoming]', root).forEach((sec) => {
      const available = $$('[data-release]', sec).filter(c => c.dataset.expired !== 'true');
      const limit = Number(sec.dataset.limit) || Infinity;
      available.forEach((c, i) => { c.hidden = i >= limit; });
      sec.hidden = !available.length;
      if (!available.length && document.body.dataset.page === 'upcoming' && !root.querySelector('.up-empty')) {
        const p = document.createElement('p'); p.className = 'up-empty';
        p.textContent = 'Every seal has opened. The records are waiting in the albums.'; sec.after(p);
      }
    });
    $$('.al-row[data-show-from]', root).forEach((r) => { r.hidden = now < Date.parse(r.dataset.showFrom); });
    $$('.al-row[data-live-from]', root).forEach((r) => {
      // The compact platform panel carries its own linked Spotify mark for these records.
      const on = !r.querySelector('.al-rel') && now >= Date.parse(r.dataset.liveFrom) && now < Date.parse(r.dataset.liveUntil);
      let b = $('.al-live', r);
      if (on && !b) { b = document.createElement('span'); b.className = 'al-live'; b.textContent = 'Out now on Spotify'; $('.al-body', r)?.prepend(b); }
      if (!on && b) b.remove();
    });
  };
  tick();
  if (cards.length) timers.push(setInterval(tick, 1000));
}

// ---------- ink-reveal lyrics: real, selectable text; the ink only spreads when motion is welcome ----------
function inkLyrics(root) {
  const lines = $$('.ly-body .ly-o, .ly-body .ly-t', root); if (!lines.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-inked'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  lines.forEach((l, i) => { if (l.getBoundingClientRect().top < innerHeight * 0.92) return; l.classList.add('ink-wait'); l.style.setProperty('--ink-d', (i % 2) * 0.12 + 's'); io.observe(l); });
  // a jump (End key, anchor, fast fling) can skip lines without them ever crossing the view: ink everything above the fold edge
  let raf = 0;
  const sweep = () => { raf = 0; const edge = innerHeight * 0.92; let left = 0; lines.forEach((l) => { if (!l.classList.contains('ink-wait') || l.classList.contains('is-inked')) return; if (l.getBoundingClientRect().top < edge) { l.classList.add('is-inked'); io.unobserve(l); } else left++; }); if (!left) removeEventListener('scroll', onScroll); };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(sweep); };
  addEventListener('scroll', onScroll, { passive: true });
  timers.push(setTimeout(() => { removeEventListener('scroll', onScroll); lines.forEach((l) => l.classList.add('is-inked')); }, 60000)); // never leave lines hidden
}

// English only: forget any language choice left from the old EN/NO toggle
try { localStorage.removeItem('pb-lang'); } catch (e) {}

// ---------- daily oracle ----------
let ORACLE = null;
const loadOracle = () => ORACLE || (ORACLE = fetch(new URL('oracle.json?v=' + (document.querySelector('link[href*="style.css"]')?.getAttribute('href').split('?v=')[1] || ''), ROOT)).then((r) => r.json()));
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
function oracle(root) {
  $$('[data-oracle]', root).forEach(async (sec) => {
    let lines; try { lines = await loadOracle(); } catch (e) { sec.hidden = true; return; }
    if (!lines.length) { sec.hidden = true; return; }
    let todayIdx = 0;
    const show = (i, daily) => {
      const o = lines[i];
      $('[data-oracle-en]', sec).textContent = o.en;
      const oo = $('[data-oracle-o]', sec); oo.textContent = o.o || ''; oo.hidden = !o.o; // v42: the line only, no language label
      const song = o.url ? `<a href="${new URL(o.url, ROOT).href}">${esc(o.song)}</a>` : esc(o.song);
      $('[data-oracle-src]', sec).innerHTML = `From ${song} &middot; ${esc(o.album)}`;
      $('[data-oracle-today]', sec).hidden = daily;
      $('[data-oracle-date]', sec).textContent = daily ? NOW().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'a line drawn for you';
      sec.classList.remove('is-drawn'); void sec.offsetWidth; sec.classList.add('is-drawn');
    };
    const today = () => { todayIdx = hash(dayKey(NOW())) % lines.length; show(todayIdx, true); };
    today();
    if (!sec.dataset.bound) {
      sec.dataset.bound = '1';
      $('[data-oracle-draw]', sec).addEventListener('click', () => { rite('oracle'); let i; do { i = Math.floor(Math.random() * lines.length); } while (lines.length > 1 && i === todayIdx); show(i, false); });
      $('[data-oracle-today]', sec).addEventListener('click', today);
    }
    // turn the page at midnight
    const n = NOW(); const mid = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 2) - n;
    timers.push(setTimeout(today, Math.min(mid, 2147483000)));
  });
}

// ---------- music box (only plays a local released file when one exists) ----------
function musicbox(root) {
  $$('[data-musicbox].has-audio', root).forEach((mb) => {
    const au = $('audio', mb), btn = $('.mb-play', mb), bar = $('.mb-bar i', mb), tm = $('.mb-time', mb);
    const fmt = (t) => `${Math.floor(t / 60)}:${pad(Math.floor(t % 60))}`;
    btn.addEventListener('click', () => { if (au.paused) au.play(); else au.pause(); });
    au.addEventListener('play', () => { mb.classList.add('is-playing'); $('.mb-play-t', mb).textContent = 'Stop the box'; });
    au.addEventListener('pause', () => { mb.classList.remove('is-playing'); $('.mb-play-t', mb).textContent = 'Wind the box'; });
    au.addEventListener('timeupdate', () => { bar.style.width = (au.duration ? (au.currentTime / au.duration) * 100 : 0) + '%'; tm.textContent = fmt(au.currentTime); });
  });
}

// ---------- numbers room ----------
function numbers(root) {
  const room = $('[data-numbers]', root); if (!room || room.dataset.bound) return; room.dataset.bound = '1';
  const D = JSON.parse($('#num-data', room).textContent); const M = new Set(D.masters);
  const digits = (n) => String(n).split('').reduce((a, b) => a + +b, 0);
  const reduce = (n, steps) => { while (n > 9 && !M.has(n)) { const m = digits(n); steps.push(`${String(n).split('').join(' + ')} = ${m}`); n = m; } return n; };
  const form = $('.num-form', room), out = $('.num-results', room), err = $('.num-err', room);
  const card = (kind, n, how) => { const r = D.readings[String(n)]; return `<article class="num-card"><p class="nc-k">${kind}</p><p class="nc-n">${n}${M.has(n) ? '<small>master number</small>' : ''}</p><h2 class="nc-t">${esc(r.title)}</h2><div class="nc-text">${r.text.split('\n').map((l) => `<p>${esc(l)}</p>`).join('')}</div><p class="nc-how">${how}</p></article>`; };
  form.addEventListener('submit', (e) => {
    e.preventDefault(); err.hidden = true; let html = '';
    const dv = form.date.value, nv = form.name.value.trim();
    if (!dv && !nv) { err.textContent = 'Give the room a birth date, a name, or both.'; err.hidden = false; out.innerHTML = ''; return; }
    if (dv) {
      const [y, m, d] = dv.split('-').map(Number); const st = [];
      const rd = reduce(d, st.slice()), rm = reduce(m, []), ry = reduce(y, []);
      const sum = rd + rm + ry; const steps = []; const lp = reduce(sum, steps);
      html += card('Life path', lp, `Day ${d} &rarr; ${rd}. Month ${m} &rarr; ${rm}. Year ${y} &rarr; ${ry}. Then ${rd} + ${rm} + ${ry} = ${sum}${steps.length ? ' &rarr; ' + lp : ''}.`);
    }
    if (nv) {
      const clean = nv.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/Æ/g, 'AE').replace(/Ø/g, 'O').replace(/ß/g, 'SS').replace(/[^A-Z]/g, '');
      if (!clean) { err.textContent = 'The room only counts the letters A to Z.'; err.hidden = false; }
      else { const tot = [...clean].reduce((a, c) => a + D.table[c], 0); const steps = []; const ex = reduce(tot, steps); html += card('Expression', ex, `${clean.length} letters, valued and added: ${tot}${tot !== ex ? ' &rarr; ' + ex : ''}.`); }
    }
    if (html) rite('numbers');
    out.innerHTML = html; out.classList.remove('is-drawn'); void out.offsetWidth; out.classList.add('is-drawn');
    out.firstElementChild?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  });
  form.addEventListener('reset', () => { out.innerHTML = ''; err.hidden = true; });
}

// ---------- hidden room door (only exists in a local build made with PB_HIDDEN_ROOM=1) ----------
const ROOM = () => document.body.dataset.room === '1';
const SECRET = 'sub lucerna';
const goRoom = () => { location.href = new URL('sealed-room.html', ROOT).href; };
document.addEventListener('click', (e) => { if (ROOM() && e.target.closest('.foot-sigil, .fig-sigil')) goRoom(); });
document.addEventListener('keydown', (e) => {
  if (!ROOM() || e.key !== 'Enter' || e.target.id !== 'ss-input') return;
  if (e.target.value.trim().toLowerCase().replace(/\s+/g, ' ') === SECRET) { e.preventDefault(); e.stopImmediatePropagation(); goRoom(); }
}, true);


// ---------- album search on albums.html: live filter + suggestions (reuses search-index.json) ----------
let IDX = null;
const loadIdx = () => IDX || (IDX = fetch(new URL('search-index.json?v=' + (document.querySelector('link[href*="style.css"]')?.getAttribute('href').split('?v=')[1] || ''), ROOT)).then((r) => r.json()).then((d) => d.items));
const nrm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\u0370-\u03ff\u0590-\u05ff ]+/g, ' ').replace(/\s+/g, ' ').trim();
function albumSearch(root) {
  const box = $('[data-album-search]', root); if (!box || box.dataset.bound) return; box.dataset.bound = '1';
  const input = $('#al-s-input', box), sugg = $('.al-s-sugg', box), status = $('.al-s-status', box);
  const rows = $$('.al-row', root);
  let songs = []; let hits = []; let active = -1;
  loadIdx().then((items) => { songs = items.filter((i) => i.type === 'Song'); }).catch(() => {});
  const go = (h) => { if (h) location.href = new URL(h.url, ROOT).href; };
  const render = () => {
    const q = nrm(input.value); active = -1;
    if (!q) { rows.forEach((r) => { r.hidden = false; $('.al-s-songs', r)?.remove(); }); sugg.hidden = true; input.setAttribute('aria-expanded', 'false'); status.textContent = ''; hits = []; return; }
    hits = []; let shown = 0;
    rows.forEach((r) => {
      const al = r.dataset.album; const aHit = nrm(al).includes(q);
      const sHits = songs.filter((s) => s.album === al && nrm(s.title).includes(q));
      const on = aHit || sHits.length > 0; r.hidden = !on; if (on) shown++;
      $('.al-s-songs', r)?.remove();
      const link = $('.al-link', r); if (aHit && link) hits.push({ kind: 'Album', title: al, url: link.getAttribute('href') });
      if (sHits.length) {
        const p = document.createElement('p'); p.className = 'al-s-songs';
        p.innerHTML = 'Songs: ' + sHits.map((s) => `<a href="${new URL(s.url, ROOT).href}">${esc(s.title)}</a>`).join(' &middot; ');
        const fr = $('.dr-front', r); if (fr && !r.classList.contains('is-open')) fr.click();
        $('.al-body', r)?.after(p);
        sHits.forEach((s) => hits.push({ kind: 'Song · ' + al, title: s.title, url: s.url }));
      }
    });
    hits.sort((a, b) => (nrm(b.title).startsWith(q) - nrm(a.title).startsWith(q)) || (a.kind === 'Album' ? -1 : 1));
    const top = hits.slice(0, 8);
    sugg.innerHTML = top.map((h, i) => `<li role="option" id="al-s-o${i}"><a href="${new URL(h.url, ROOT).href}"><span class="al-s-k">${esc(h.kind)}</span><span class="al-s-t">${esc(h.title)}</span></a></li>`).join('');
    sugg.hidden = !top.length; input.setAttribute('aria-expanded', String(!!top.length));
    status.textContent = shown ? `${shown} album${shown === 1 ? '' : 's'} match. Enter opens the first suggestion.` : 'Nothing here answers to that name.';
  };
  const mark = () => { $$('li', sugg).forEach((li, i) => li.classList.toggle('is-active', i === active)); input.setAttribute('aria-activedescendant', active >= 0 ? 'al-s-o' + active : ''); };
  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    const n = Math.min(hits.length, 8);
    if (e.key === 'ArrowDown' && n) { e.preventDefault(); active = (active + 1) % n; mark(); }
    else if (e.key === 'ArrowUp' && n) { e.preventDefault(); active = (active - 1 + n) % n; mark(); }
    else if (e.key === 'Enter') { e.preventDefault(); go(hits[active >= 0 ? active : 0]); }
    else if (e.key === 'Escape') { input.value = ''; render(); }
  });
  document.addEventListener('click', (e) => { if (!box.contains(e.target)) { sugg.hidden = true; input.setAttribute('aria-expanded', 'false'); } });
  input.addEventListener('focus', () => { if (sugg.children.length && input.value) { sugg.hidden = false; input.setAttribute('aria-expanded', 'true'); } });
}

// ---------- moon phase (computed here, no outside service) ----------
const SYN = 29.530588853, NEW0 = Date.UTC(2000, 0, 6, 18, 14);
function moonState(d) {
  let age = ((d.getTime() - NEW0) / 86400000) % SYN; if (age < 0) age += SYN;
  const f = age / SYN, illum = (1 - Math.cos(2 * Math.PI * f)) / 2;
  const names = [[1.0, 'New moon'], [6.4, 'Waxing crescent'], [8.4, 'First quarter'], [13.8, 'Waxing gibbous'], [15.8, 'Full moon'], [21.1, 'Waning gibbous'], [23.1, 'Last quarter'], [28.5, 'Waning crescent'], [99, 'New moon']];
  return { f, illum, age, name: names.find(([a]) => age < a)[1] };
}
function moonSVG(f, r = 15) {
  const k = Math.cos(2 * Math.PI * f), rx = (Math.abs(k) * r).toFixed(2), wax = f < 0.5;
  const outer = wax ? 1 : 0, term = wax ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0);
  return `<svg viewBox="-18 -18 36 36" width="36" height="36" aria-hidden="true"><circle r="${r}" fill="#1a0d0d" stroke="#7a1a12" stroke-width="1"/><path d="M0 ${-r} A ${r} ${r} 0 0 ${outer} 0 ${r} A ${rx} ${r} 0 0 ${term} 0 ${-r} Z" fill="#e6d2b0"/><circle r="${r}" fill="none" stroke="rgba(220,170,110,.6)" stroke-width="1"/></svg>`;
}
function moon(root) {
  document.querySelectorAll('.moon-phase').forEach((m) => m.remove());
  const m = moonState(NOW());
  const el = document.createElement('p'); el.className = 'moon-phase';
  const nm = m.name, lit = `${Math.round(m.illum * 100)}% lit`;
  el.innerHTML = `${moonSVG(m.f)}<span class="mp-t"><span class="mp-n">${nm}</span><span class="mp-i">${lit}</span></span>`;
  el.title = `${nm}, ${lit}`;
  const bar = $('.backbar .wrap', root), hero = $('.hero', root);
  // v42d: the mark sits inline (home: under the hero buttons; subpages: centred in the back bar), never in the right-hand corner
  const heroRow = hero && $('.hero-copy .btn-row', root);
  if (bar) bar.appendChild(el); else if (heroRow) { el.classList.add('mp-inline'); heroRow.insertAdjacentElement('afterend', el); } else return;
  document.documentElement.classList.toggle('pb-full-moon', m.illum >= 0.97);
  fullMoonNote(root, m);
}
// ---------- v36: on full-moon nights (about +-1 day) Ballerina leaves a line; otherwise a sealed hint ----------
const FM_LINES = [
  'The moon is full. Tonight I can dance without the music.',
  'Leave the window open a little. I like to watch it with you.',
  'Every full moon I count the cracks. There is one more.',
  'Tonight the glass is thin. Do not tap on it.',
  'I put on the white slippers. The moon likes them.',
  'Under this light I remember every step.',
  'Hold still. When the moon is this bright, I can see you too.',
  'The music box wound itself again. It only does that tonight.',
  'Light one candle for me. Just one. Then go to sleep.',
  'Listen. The floorboards still know my feet.',
  'I am closest to the glass when the moon is full. Do not be afraid.',
  'Tomorrow the light thins again. Tonight, stay up with me.',
];
function fullMoonNote(root, m) {
  document.querySelectorAll('.fm-note').forEach((x) => x.remove());
  const hero = $('.hero', root); if (!hero) return;
  const full = Math.abs(m.age - SYN / 2) <= 1;
  const n = Math.floor((NOW().getTime() - NEW0) / 86400000 / SYN);
  const el = document.createElement('p'); el.className = 'fm-note' + (full ? ' is-full' : '');
  if (full) {
    const line = FM_LINES[((n % FM_LINES.length) + FM_LINES.length) % FM_LINES.length];
    el.innerHTML = `<span class="fm-k">Full moon</span><span class="fm-line">&ldquo;${esc(line)}&rdquo;</span><span class="fm-sig">&mdash; Ballerina</span>`;
  } else {
    return; // v42b: between full moons nothing is shown, the moon mark keeps only phase and percent
  }
  const copy = $('.hero-copy .btn-row', root);
  if (matchMedia('(max-width: 1100px)').matches && copy) copy.insertAdjacentElement('afterend', el); else hero.appendChild(el);
}

// ---------- the ritual path: tarot + numbers + oracle (kept in this browser only) ----------
const RITE = 'pb-rite';
function riteState() { try { return JSON.parse(localStorage.getItem(RITE) || '{}'); } catch (e) { return {}; } }
function rite(step) {
  const s = riteState(); if (s[step]) return; s[step] = 1;
  try { localStorage.setItem(RITE, JSON.stringify(s)); } catch (e) {}
  if (s.tarot && s.numbers && s.oracle) { riteLine(true); }
}
document.addEventListener('pb:rite', (e) => rite(e.detail));
function riteLine(fresh) {
  const s = riteState(); if (!(s.tarot && s.numbers && s.oracle)) return;
  const foot = $('.site-footer .wrap'); if (foot && !$('.rite-secret', foot)) {
    const p = document.createElement('p'); p.className = 'rite-secret';
    p.innerHTML = '<span class="rs-k">The rite is complete</span><span class="rs-l">Close your eyes. It still reaches you.</span>';
    const c = $('.copyright', foot); c ? c.before(p) : foot.appendChild(p);
  }
  if (fresh) {
    const t = document.createElement('div'); t.className = 'rite-toast'; t.setAttribute('role', 'status');
    t.innerHTML = '<span class="rs-k">The rite is complete</span><span class="rs-l">Close your eyes. It still reaches you.</span>';
    document.body.appendChild(t); requestAnimationFrame(() => t.classList.add('is-in'));
    setTimeout(() => { t.classList.remove('is-in'); setTimeout(() => t.remove(), 900); }, 7000);
  }
}

// ---------- lyric card: pick a line, get a parchment PNG with the M.A. seal (made in the browser) ----------
const img = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = new URL(src, ROOT).href; });
// ---------- the Mirror: the lyric card is gone (nothing to download); songs and albums lead to the scrying mirror instead ----------
function mirrorLink(root) {
  const body = $('.ly-body', root); if (!body || $('.mirror-door', root)) return;
  const song = ($('.ly-title', root)?.textContent || document.title.split(' — ')[0]).trim(); const album = ($('.ly-alb', root)?.textContent || '').trim();
  const anchor = $('.song-codex .wrap', root); if (!anchor) return;
  const a = document.createElement('p'); a.className = 'mirror-door';
  const u = new URL('mirror.html', ROOT); u.searchParams.set('album', album); u.searchParams.set('song', song);
  a.innerHTML = `<a class="btn btn-solid" href="${u.href}"><span class="md-glass" aria-hidden="true"></span><span>Look into the mirror</span></a>`;
  anchor.prepend(a);
}

// ---------- no image downloads: covers, etchings and seals cannot be dragged out or right-click saved ----------
const PROTECT = '.hero-figure img, .pa-emblem img, .dr-thumb img, .cv-card img, .alb-card img, .pa-cabinet img, img[src*="images/archive/"], img[src*="images/hall/"], img[src*="images/albums/"], img[src*="images/etchings/"], img[src*="images/room/"], img[src*="images/gallery/"], img[src*="images/share/"], img[src*="seal-logo"], .lightbox img, .sp-ghost, .mirror-stage img';
function protect(root) { $$(PROTECT, root).forEach((im) => { im.draggable = false; im.setAttribute('draggable', 'false'); }); }
['contextmenu', 'dragstart'].forEach((ev) => document.addEventListener(ev, (e) => { if (e.target instanceof Element && e.target.matches(PROTECT)) e.preventDefault(); }, true));

// ---------- the card of the album: turns over the first time it is seen ----------
function albumCards(root) {
  const cs = $$('[data-album-card]', root).filter((c) => !c.closest('.mr-card')); if (!cs.length) return;
  if (RM() || !('IntersectionObserver' in window)) { cs.forEach((c) => c.classList.add('is-turned')); return; }
  cs.forEach((c) => c.classList.add('ac-wait'));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && e.intersectionRatio > 0) { const c = e.target; timers.push(setTimeout(() => c.classList.add('is-turned'), 180)); io.unobserve(c); } }), { threshold: 0.25 });
  cs.forEach((c) => io.observe(c));
}

// ---------- the Mirror ----------
const MIRROR_OPEN = ['You were not meant to find this place.', 'Sit. The candles are lit for you.', 'Ink that will not dry.'];
function mirror(root) {
  const st = $('[data-mirror]', root); if (!st || st.dataset.bound) return; st.dataset.bound = '1';
  const q = new URLSearchParams(location.search); const fromSong = (q.get('song') || '').trim(), fromAlbum = (q.get('album') || '').trim();
  const g = $('.mr-greeting', st); let lines = [];
  const pick = () => {
    const bySong = lines.filter((o) => o.song === fromSong && (!fromAlbum || o.album === fromAlbum));
    const byAlbum = lines.filter((o) => o.album === fromAlbum);
    const pool = bySong.length ? bySong : byAlbum.length ? byAlbum : lines; return pool[Math.floor(Math.random() * pool.length)];
  };
  const show = (again) => {
    const o = pick(); if (!o) return;
    $('.mr-open', g).textContent = MIRROR_OPEN[Math.floor(Math.random() * MIRROR_OPEN.length)];
    $('.mr-line', g).textContent = '\u201c' + o.en + '\u201d';
    const src = $('.mr-src', g); src.innerHTML = ''; const a = document.createElement('a'); a.href = new URL(o.url, ROOT).href; a.textContent = `${o.song} \u00b7 ${o.album}`; src.appendChild(a);
    st.classList.remove('is-clear', 'is-spoken'); void st.offsetWidth;
    st.classList.add('is-gazing');
    const box = $('[data-mr-cards]', root);
    if (box) { const cards = $$('.mr-card', box); cards.forEach((c) => { c.hidden = true; c.querySelector('.alb-card')?.classList.remove('is-turned'); });
      const c = cards.find((x) => x.dataset.acAlbum === o.album);
      if (c) { st.classList.add('has-card'); const ln = $('.ac-line p', c); if (ln) ln.textContent = '\u201c' + o.en + '\u201d'; let sr = $('.ac-src', c); if (!sr) { sr = document.createElement('p'); sr.className = 'ac-src'; ($('.ac-line', c) || $('.ac-title', c)).after(sr); } sr.innerHTML = ''; sr.append('from '); const i = document.createElement('a'); i.href = new URL(o.url, ROOT).href; i.textContent = o.song; sr.appendChild(i);
        timers.push(setTimeout(() => { c.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => c.querySelector('.alb-card')?.classList.add('is-turned'))); }, RM() ? 0 : (again ? 1600 : 3000))); }
      else st.classList.remove('has-card'); }
    const t1 = RM() ? 0 : (again ? 1400 : 2600), t2 = RM() ? 0 : (again ? 2600 : 4400);
    timers.push(setTimeout(() => st.classList.add('is-clear'), t1));
    timers.push(setTimeout(() => st.classList.add('is-spoken'), t2));
  };
  const back = $('.mr-return', st);
  if (back && (fromSong || fromAlbum)) {
    const hit = (o) => o.song === fromSong;
    back.hidden = false; back.dataset.label = fromSong ? 'Return to the song' : 'Return to the album';
  }
  loadOracle().then((L) => {
    lines = L || []; show(false);
    if (back && !back.hidden) {
      const o = lines.find((x) => x.song === fromSong && (!fromAlbum || x.album === fromAlbum)) || lines.find((x) => x.album === fromAlbum);
      if (o && fromSong) { back.href = new URL(o.url, ROOT).href; back.textContent = 'Return to the song'; }
      else if (fromAlbum) { const al = $$('[data-album-url]', st).find((e) => e.dataset.albumTitle === fromAlbum); if (al) { back.href = new URL(al.dataset.albumUrl, ROOT).href; back.textContent = 'Return to the album'; } else back.hidden = true; }
      else back.hidden = true;
    }
  }).catch(() => { st.classList.add('is-clear'); });
  $('[data-mirror-again]', st)?.addEventListener('click', () => show(true));
}

// ---------- installable app: the service worker always follows the newest build ----------
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  addEventListener('load', () => { navigator.serviceWorker.register(new URL('sw.js', ROOT).href, { scope: ROOT.href, updateViaCache: 'none' }).then((r) => r.update()).catch(() => {}); });
}

// ---------- the séance parlour: smoke, candle light, ectoplasm, the spirit board, channelled headings ----------
const RM = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function parlour() {
  if (document.querySelector('.seance-fx')) return;
  const fx = document.createElement('div'); fx.className = 'seance-fx'; fx.setAttribute('aria-hidden', 'true');
  fx.innerHTML = '<i class="fx-smoke fx-s1"></i><i class="fx-smoke fx-s2"></i><i class="fx-ecto fx-e1"></i><i class="fx-ecto fx-e2"></i><i class="fx-candle fx-c1"></i><i class="fx-candle fx-c2"></i><i class="fx-plate"></i>';
  document.body.appendChild(fx);
}
function channel(root) {
  $$('h1 .bt, .lib-h .bt', root).forEach((bt) => {
    if (bt.dataset.channel) return; bt.dataset.channel = '1';
    const g = document.createElement('span'); g.className = 'h-ghost'; g.setAttribute('aria-hidden', 'true'); g.textContent = $$('.ch', bt).map((c) => c.textContent).join('') ? bt.textContent.replace(/\s+/g, ' ').trim() : ''; bt.appendChild(g);
    if (RM()) return;
    const letters = $$('.ch', bt); letters.forEach((c, i) => c.style.setProperty('--cd', (0.15 + i * 0.07 + Math.random() * 0.25).toFixed(2) + 's'));
    bt.classList.add('is-channeling'); setTimeout(() => bt.classList.remove('is-channeling'), 1600 + letters.length * 90);
    const twitch = () => { if (!bt.isConnected) return; const c = letters[Math.floor(Math.random() * letters.length)]; if (c) { c.classList.add('ch-twitch'); setTimeout(() => c.classList.remove('ch-twitch'), 700); } timers.push(setTimeout(twitch, 6000 + Math.random() * 9000)); };
    timers.push(setTimeout(twitch, 4000 + letters.length * 90));
  });
}
function spiritPhoto(root) {
  $$('.album-hero img, .rq-frame img', root).forEach((img) => {
    const box = img.closest('picture.phone-picture')?.parentElement || img.parentElement; if (!box || box.querySelector('.sp-ghost')) return;
    const g = img.cloneNode(); g.removeAttribute('loading'); g.removeAttribute('srcset'); const ps = img.closest('picture.phone-picture')?.querySelector('source'); if (ps && matchMedia(ps.media).matches) g.src = new URL(ps.getAttribute('srcset'), location.href).href; g.className = 'sp-ghost'; g.alt = ''; g.setAttribute('aria-hidden', 'true'); box.classList.add('spirit-plate'); box.appendChild(g);
  });
}
// ---------- whisper in the dark: after a long stillness, one real line drifts in at the edge, then leaves ----------
const WH = { idle: 26000, gap: 90000, max: 4, el: null, t: 0, last: 0, out: 0 };
function whisperShow() {
  if (document.hidden || document.querySelector('.lightbox.is-open, .site-search:not([hidden]), .wel, .intro-overlay')) return;
  const a = document.activeElement; if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
  let n = 0; try { n = +sessionStorage.getItem('pb-whispers') || 0; } catch (e) {}
  if (n >= WH.max || Date.now() - WH.last < WH.gap) return;
  loadOracle().then((lines) => {
    if (!lines || !lines.length) return;
    const o = lines[Math.floor(Math.random() * lines.length)];
    if (!WH.el) { WH.el = document.createElement('div'); WH.el.className = 'whisper-dark'; WH.el.setAttribute('aria-hidden', 'true'); document.body.appendChild(WH.el); }
    WH.el.innerHTML = `<p class="wd-line">\u201c${o.en.replace(/[<>&]/g, '')}\u201d</p><p class="wd-src">${o.song.replace(/[<>&]/g, '')} &middot; ${o.album.replace(/[<>&]/g, '')}</p>`;
    // find a quiet place: never on top of anything readable or clickable
    const TEXT = 'p, li, h1, h2, h3, h4, blockquote, figcaption, label, input, textarea, select, button, a, img, video, canvas, .ly-t, .ly-o, .ms-l, .tr-stage, .ms-letter, .jr-ledger, .rl-doc, .oracle-sheet, .vr-doc, .num-card, .sign-plate, .musicbox, .ly-body';
    const busy = $$(TEXT, document.getElementById('swap') || document).filter((e) => !e.closest('.whisper-dark, .seance-fx, .hero-stage') && (e.matches('.tr-stage, .ms-letter') || !e.closest('[aria-hidden="true"]')) && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > 0.05).map((e) => e.getBoundingClientRect()).filter((r) => r.width && r.height && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth);
    const clear = (x, y, w, h) => !busy.some((r) => r.left < x + w && r.right > x && r.top < y + h && r.bottom > y);
    const ww = Math.min(260, innerWidth * 0.8), hh = 130, spots = [];
    for (let y = innerHeight * 0.3; y < innerHeight * 0.75; y += 40) { spots.push([innerWidth - ww - innerWidth * 0.02, y]); spots.push([innerWidth * 0.02 + 56, y]); }
    for (let y = innerHeight * 0.18; y < innerHeight - hh - 80; y += 36) spots.push([(innerWidth - ww) / 2, y]);
    const spot = spots.find(([x, y]) => x > 0 && clear(x, y, ww, hh));
    if (!spot) { whisperArm(); return; }
    Object.assign(WH.el.style, { left: spot[0] + 'px', top: spot[1] + 'px', width: ww + 'px' });
    requestAnimationFrame(() => WH.el.classList.add('is-in'));
    WH.last = Date.now(); try { sessionStorage.setItem('pb-whispers', String(n + 1)); } catch (e) {}
    clearTimeout(WH.out); WH.out = setTimeout(whisperHide, 9000);
  }).catch(() => {});
}
function whisperHide() { if (WH.el) WH.el.classList.remove('is-in'); }
function whisperArm() { clearTimeout(WH.t); WH.t = setTimeout(whisperShow, WH.idle); }
['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach((ev) => addEventListener(ev, () => { if (WH.el && WH.el.classList.contains('is-in') && ev !== 'pointermove') whisperHide(); whisperArm(); }, { passive: true, capture: true }));
whisperArm();
// the medium's sound (opt-in, off by default)
import(new URL('medium.js?v=' + (document.querySelector('link[href*="style.css"]')?.getAttribute('href').split('?v=')[1] || ''), import.meta.url).href).catch(() => {});
function mount() { greetingInit(document.getElementById('swap') || document); timers.forEach((t) => { clearInterval(t); clearTimeout(t); }); timers = []; const r = document.getElementById('swap') || document; release(r); oracle(r); musicbox(r); numbers(r); albumSearch(r); moon(r); mirrorLink(r); protect(r); mirror(r); albumCards(r); spotifyGate(r); paLetters(r); graveRest(r); coverWall(r); riteLine(false); inkLyrics(r); parlour(); channel(r); spiritPhoto(r); }
document.addEventListener('pb:page', mount);
mount();

// ---------- v34: "Listen on Spotify" appears by itself once the album's Spotify date has passed ----------
function spotifyGate(root) {
  const gs = [...(root || document).querySelectorAll('[data-spotify-at]')]; if (!gs.length) return;
  const p2 = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const now = Date.now();
    gs.forEach((g) => {
      const t = Date.parse(g.dataset.spotifyAt); if (isNaN(t)) return;
      const real = g.querySelector('[data-sp-real]'), wait = g.querySelector('[data-sp-wait]');
      if (now >= t) { if (real) real.hidden = false; if (wait) wait.hidden = true; g.classList.add('is-live'); return; }
      let s = Math.floor((t - now) / 1000); const d = Math.floor(s / 86400); s %= 86400;
      const c = g.querySelector('[data-sp-count]'); if (c) c.textContent = `${d}d ${p2(Math.floor(s / 3600))}:${p2(Math.floor((s % 3600) / 60))}:${p2(s % 60)}`;
    });
  };
  tick(); const id = setInterval(tick, 1000); try { timers.push(id); } catch (_) {}
}

// ---------- v40/v48: project archive · sealed letters. Every letter is under wax and opens with the threshold's number.
// Keys live only as salted SHA-256 hashes; the ink is XOR-sealed with a keystream from the key. Opened keys are remembered in this browser.
var SHA_K, SHA_H;
function sha256(bytes) {
  if (!SHA_K) { SHA_K = []; SHA_H = []; let n = 2, c = 0;
  const frac = (x) => ((x - Math.floor(x)) * 4294967296) | 0;
    while (c < 64) { let p = true; for (let d = 2; d * d <= n; d++) if (n % d === 0) { p = false; break; } if (p) { if (c < 8) SHA_H[c] = frac(Math.sqrt(n)); SHA_K[c] = frac(Math.cbrt(n)); c++; } n++; } }
  const K = SHA_K, H0 = SHA_H;
  {
    const l = bytes.length, len = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(len); m.set(bytes); m[l] = 0x80;
    const dv = new DataView(m.buffer); dv.setUint32(len - 4, (l * 8) >>> 0); dv.setUint32(len - 8, Math.floor(l / 536870912));
    const h = H0.slice(), w = new Int32Array(64), r = (x, y) => (x >>> y) | (x << (32 - y));
    for (let o = 0; o < len; o += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getInt32(o + i * 4);
      for (let i = 16; i < 64; i++) { const a = w[i - 15], b = w[i - 2]; w[i] = (w[i - 16] + (r(a, 7) ^ r(a, 18) ^ (a >>> 3)) + w[i - 7] + (r(b, 17) ^ r(b, 19) ^ (b >>> 10))) | 0; }
      let [A, B, C, D, E, F, G, Hh] = h;
      for (let i = 0; i < 64; i++) {
        const t1 = (Hh + (r(E, 6) ^ r(E, 11) ^ r(E, 25)) + ((E & F) ^ (~E & G)) + K[i] + w[i]) | 0, t2 = ((r(A, 2) ^ r(A, 13) ^ r(A, 22)) + ((A & B) ^ (A & C) ^ (B & C))) | 0;
        Hh = G; G = F; F = E; E = (D + t1) | 0; D = C; C = B; B = A; A = (t1 + t2) | 0;
      }
      [A, B, C, D, E, F, G, Hh].forEach((v, i) => { h[i] = (h[i] + v) | 0; });
    }
    const out = new Uint8Array(32); const ov = new DataView(out.buffer); h.forEach((v, i) => ov.setInt32(i * 4, v)); return out;
  }
}
var LNUM = { 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve' };
function letterNorm(s) { s = String(s).toLowerCase().replace(/[^a-z0-9]/g, ''); if (Object.prototype.hasOwnProperty.call(LNUM, s)) s = LNUM[s]; if (s.length > 3 && s.endsWith('s')) s = s.slice(0, -1); return s; }
function u8(s) { return new TextEncoder().encode(s); }
function hex(b) { return [...b].map((x) => x.toString(16).padStart(2, '0')).join(''); }
function letterInk(n, k, b64) {
  const data = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)), out = new Uint8Array(data.length);
  for (let i = 0, blk = 0; i < data.length; blk++) { const s = sha256(u8(`pb-ink|${n}|${k}|${blk}`)); for (let j = 0; j < 32 && i < data.length; j++, i++) out[i] = data[i] ^ s[j]; }
  return new TextDecoder().decode(out);
}
function paLetters(root) {
  const ls = [...(root || document).querySelectorAll('.pa-letter[data-lock]')]; if (!ls.length) return;
  let keys = {}; try { keys = JSON.parse(localStorage.getItem('pb-letters-keys') || '{}') || {}; } catch (_) {}
  const save = () => { try { localStorage.setItem('pb-letters-keys', JSON.stringify(keys)); } catch (_) {} };
  ls.forEach((l) => {
    const n = l.dataset.letter, page = l.querySelector('.pl-page'), form = l.querySelector('.pl-lock'), inp = l.querySelector('.pl-key');
    const fits = (k) => k && hex(sha256(u8(`pb-letter|${n}|${k}`))) === l.dataset.lock;
    const open = (k, anim) => {
      page.innerHTML = letterInk(n, k, l.dataset.ink);
      const show = () => { l.classList.remove('is-locked', 'is-breaking'); l.classList.add('is-read'); page.hidden = false; };
      if (anim && !RM()) { l.classList.add('is-breaking'); setTimeout(() => { show(); l.classList.add('is-unfolding'); setTimeout(() => l.classList.remove('is-unfolding'), 1500); }, 1100); } else show();
    };
    if (fits(keys[n])) { open(keys[n], false); return; }
    if (l.dataset.bound) return; l.dataset.bound = '1';
    form.hidden = false;
    form.addEventListener('submit', (e) => {
      e.preventDefault(); if (l.classList.contains('is-breaking')) return;
      const k = letterNorm(inp.value);
      if (fits(k)) { keys[n] = k; save(); inp.blur(); const m = l.querySelector('.pl-msg'); if (m) m.textContent = 'The seal gives.'; open(k, true); return; }
      l.classList.remove('is-wrong'); void l.offsetWidth; l.classList.add('is-wrong'); inp.setAttribute('aria-invalid', 'true'); inp.select();
      const msg = l.querySelector('.pl-msg'); l._tries = (l._tries || 0) + 1;
      if (msg) msg.textContent = l._tries > 1 ? 'Only the number that opened the house will break it.' : 'The wax holds. That is not its number.';
      setTimeout(() => { l.classList.remove('is-wrong'); inp.removeAttribute('aria-invalid'); }, 600);
    });
  });
}

// ---------- v35: a grave that 'rests until' its Spotify day reads 'Risen …' once the day has come ----------
function graveRest(root) { const now = +NOW(); (root || document).querySelectorAll('[data-rest-until]').forEach((e) => { const t = Date.parse(e.dataset.restUntil); if (!isNaN(t) && now >= t) e.textContent = e.dataset.risen; }); }

// ---------- v35: the cover wall · on touch screens the veil lifts from the cover nearest the middle of the screen ----------
function coverWall(root) {
  const cs = [...(root || document).querySelectorAll('.cv-card')]; if (!cs.length || !('IntersectionObserver' in window)) return;
  if (!matchMedia('(hover: none)').matches) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-lit', e.isIntersecting)), { rootMargin: '-38% 0px -38% 0px' });
  cs.forEach((c) => io.observe(c));
}
