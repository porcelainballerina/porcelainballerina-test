// v34: share a static greeting URL, never an image or file. No data is sent until the visitor chooses a service.
const ROOT = new URL('../', import.meta.url);
function choose(xs) { if (!xs.length) return null; const a = new Uint32Array(1); const max = 0x100000000 - (0x100000000 % xs.length); do { crypto.getRandomValues(a); } while (a[0] >= max); return xs[a[0] % xs.length]; }
export function init(root = document) {
  const room = root.querySelector('[data-greeting]');
  if (room) {
    const a = room.closest('section').querySelector('[data-greeting-another]');
    if (a) { const s = choose((room.dataset.others || '').split(' ').filter(Boolean)); if (s) a.href = new URL(`greeting/${s}.html`, ROOT).href; }
  }
  root.querySelectorAll('[data-share]').forEach(box => {
    if (box.dataset.bound) return; box.dataset.bound = '1';
    const main = box.querySelector('[data-share-main]'), more = box.querySelector('[data-share-more]'), copy = box.querySelector('[data-share-copy]'), msg = box.querySelector('[role=status]');
    const reveal = () => { more.hidden = false; main.setAttribute('aria-expanded', 'true'); copy.focus(); };
    more.hidden = true;
    main.addEventListener('click', async () => {
      msg.textContent = '';
      if (typeof navigator.share === 'function') {
        try { await navigator.share({ title: box.dataset.title, text: box.dataset.text, url: box.dataset.url }); return; }
        catch (e) { if (e.name === 'AbortError') return; }
      }
      reveal();
    });
    copy.addEventListener('click', async () => {
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(box.dataset.url);
        else { const t = document.createElement('textarea'); t.value = box.dataset.url; t.style.cssText = 'position:fixed;left:-9999px'; box.append(t); t.select(); const ok = document.execCommand('copy'); t.remove(); if (!ok) throw new Error('copy'); }
        msg.textContent = 'Link copied. Let it haunt someone.';
      } catch { msg.textContent = 'Copy this link:'; let t = box.querySelector('.gr-link'); if (!t) { t = document.createElement('input'); t.className = 'gr-link'; t.readOnly = true; t.setAttribute('aria-label', 'Greeting link'); box.append(t); } t.value = box.dataset.url; t.focus(); t.select(); }
    });
  });
  root.querySelectorAll('[data-open-greeting]').forEach(a => {
    a.addEventListener('click', async e => {
      // href is a real static fallback for no JS, fetch failures and crawlers.
      e.preventDefault();
      try { const r = await fetch(new URL('greetings.json', ROOT)); if (!r.ok) throw new Error(r.status); const xs = await r.json(); const g = choose(xs); if (g) { location.href = new URL(`greeting/${g.slug}.html`, ROOT).href; return; } } catch {}
      location.href = a.href;
    });
  });
}
