// Static site search: index built from the public pages at build time (search-index.json).
const ROOT = new URL('../', import.meta.url);
const V = new URL(import.meta.url).searchParams.get('v') || '';
let INDEX = null, loading = null, last = [];
const norm = (s) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function load() {
  if (INDEX) return Promise.resolve(INDEX);
  return loading || (loading = fetch(new URL('search-index.json' + (V ? '?v=' + V : ''), ROOT)).then((r) => r.json()).then((d) => {
    INDEX = d.items.map((it) => ({ ...it, nt: norm(it.title), na: norm(it.album || ''), nl: (it.lines || []).map(norm) }));
    return INDEX;
  }));
}
function mark(text, q) {
  const n = norm(text), i = n.indexOf(q);
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
}
function search(raw) {
  const q = norm(raw.trim()); if (q.length < 2) return [];
  const words = q.split(/\s+/);
  const res = [];
  const rank = { Album: 0, Song: 1, Page: 2, 'Tarot card': 3 };
  for (const it of INDEX) {
    let score = -1, line = null;
    if (it.nt === q) score = 100; else if (it.nt.startsWith(q)) score = 80; else if (it.nt.includes(q)) score = 60;
    else if (words.length > 1 && words.every((w) => it.nt.includes(w))) score = 50;
    if (score < 0 && it.nl.length) {
      const k = it.nl.findIndex((l) => l.includes(q));
      if (k >= 0) { score = 30; line = it.lines[k]; }
      else if (words.length > 1) { const k2 = it.nl.findIndex((l) => words.every((w) => l.includes(w))); if (k2 >= 0) { score = 20; line = it.lines[k2]; } }
    }
    if (score >= 0) res.push({ it, score: score - rank[it.type], line });
  }
  return res.sort((a, b) => b.score - a.score || a.it.title.localeCompare(b.it.title)).slice(0, 40);
}
const box = () => document.getElementById('site-search');
function render(raw) {
  const el = document.getElementById('ss-results'), st = document.getElementById('ss-status');
  const q = norm(raw.trim());
  if (q.length < 2) { el.innerHTML = ''; last = []; st.textContent = 'Type to search albums, songs, lyric lines, tarot cards and pages.'; return; }
  last = search(raw);
  st.textContent = last.length ? `${last.length}${last.length === 40 ? '+' : ''} found` : 'Nothing answers to that. Try another word.';
  el.innerHTML = last.map((r, i) => {
    const it = r.it, href = new URL(it.url, ROOT).href;
    const sub = it.type === 'Song' && it.album ? `Song · ${esc(it.album)}` : esc(it.type);
    const snip = r.line ? `<span class="ss-snip">&ldquo;${mark(r.line, q.length >= 2 && norm(r.line).includes(q) ? q : '')}&rdquo;</span>` : '';
    return `<li><a class="ss-hit${i === 0 ? ' is-first' : ''}" href="${href}"><span class="ss-type">${sub}</span><span class="ss-name">${mark(it.title, q)}</span>${snip}</a></li>`;
  }).join('');
}
function open() {
  const b = box(); if (!b) return;
  b.hidden = false; document.body.classList.add('search-open');
  document.querySelectorAll('.search-toggle').forEach((t) => t.setAttribute('aria-expanded', 'true'));
  const inp = document.getElementById('ss-input'); setTimeout(() => inp.focus(), 30);
  load().then(() => render(inp.value)).catch(() => { document.getElementById('ss-status').textContent = 'The index could not be opened.'; });
}
function close(back = true) {
  const b = box(); if (!b || b.hidden) return;
  b.hidden = true; document.body.classList.remove('search-open');
  document.querySelectorAll('.search-toggle').forEach((t) => t.setAttribute('aria-expanded', 'false'));
  if (back) { const t = document.querySelector('.search-toggle'); t && t.focus({ preventScroll: true }); }
}
document.addEventListener('click', (e) => {
  if (e.target.closest('.search-toggle')) { e.preventDefault(); open(); return; }
  if (e.target.closest('[data-search-close]')) { close(); return; }
  if (e.target.closest('.ss-hit')) close(false);
});
document.addEventListener('input', (e) => { if (e.target.id === 'ss-input') { if (INDEX) render(e.target.value); else load().then(() => render(e.target.value)); } });
document.addEventListener('keydown', (e) => {
  const b = box(); const isOpen = b && !b.hidden;
  if (isOpen && e.key === 'Escape') { e.preventDefault(); close(); return; }
  if (isOpen && e.key === 'Enter' && e.target.id === 'ss-input') { e.preventDefault(); const a = document.querySelector('#ss-results .ss-hit'); if (a) { close(false); a.click(); } return; }
  if (isOpen && e.key === 'Tab') { // keep focus inside the dialog
    const f = [...b.querySelectorAll('input,button,a[href]')].filter((x) => x.offsetParent !== null);
    if (f.length) { const first = f[0], lastEl = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); } else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); } }
  }
  if (!isOpen && e.key === '/' && !/input|textarea|select/i.test(e.target.tagName)) { e.preventDefault(); open(); }
});
