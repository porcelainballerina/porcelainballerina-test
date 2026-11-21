// Archive lightbox
export function init() {
  const figures = Array.from(document.querySelectorAll('[data-gallery] figure a'));
  const box = document.getElementById('lightbox');
  if (!figures.length || !box) return null;
  // the viewer lives above everything (the header too), so it is lifted out of the page's stacking layer
  if (box.parentNode !== document.body) document.body.appendChild(box);
  const img = box.querySelector('img'), cap = box.querySelector('.lightbox-cap');
  const closeBtn = box.querySelector('.lightbox-close'), prevBtn = box.querySelector('.lightbox-prev'), nextBtn = box.querySelector('.lightbox-next');
  const items = figures.map((a) => ({ href: a.dataset.full || a.getAttribute('href'), caption: (a.closest('figure').querySelector('figcaption') || {}).textContent || '' }));
  let index = 0, lastFocus = null;
  const show = (i) => { document.querySelector('.hint-gallery')?.classList.add('is-gone'); index = (i + items.length) % items.length; const it = items[index]; img.src = it.href; img.alt = it.caption; cap.textContent = it.caption; if (!box.classList.contains('is-open')) { try { history.pushState({ pbLightbox: 1 }, '', location.href); } catch (_) {} } if (!box.classList.contains('is-open')) lastFocus = document.activeElement; box.classList.add('is-open'); box.setAttribute('aria-hidden', 'false'); document.body.classList.add('lb-lock'); closeBtn.focus(); };
  const close = () => { if (history.state && history.state.pbLightbox) history.back(); else hide(); };
  const hide = () => { box.classList.remove('is-open'); box.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lb-lock'); img.removeAttribute('src'); lastFocus && lastFocus.focus(); };
  const clicks = figures.map((a, i) => { const f = (e) => { e.preventDefault(); e.stopPropagation(); show(i); }; a.addEventListener('click', f); return f; });
  closeBtn.addEventListener('click', close); prevBtn.addEventListener('click', () => show(index - 1)); nextBtn.addEventListener('click', () => show(index + 1));
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  const key = (e) => { if (!box.classList.contains('is-open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(index - 1); if (e.key === 'ArrowRight') show(index + 1); };
  document.addEventListener('keydown', key);
  // the browser's Back closes the viewer instead of leaving the page
  window.__pbOverlayPop = (e) => { if (box.classList.contains('is-open')) { hide(); return true; } return !!(e && e.state && e.state.pbLightbox); };
  return { destroy() { box.remove(); if (window.__pbOverlayPop) window.__pbOverlayPop = null; document.removeEventListener('keydown', key); document.body.classList.remove('lb-lock'); } };
}
