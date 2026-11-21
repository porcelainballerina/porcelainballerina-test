// The Archive: sealed drawers, an ink line that draws itself down the years, folders that wait for their day.
const RM = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export function setDrawer(row, open) {
  const b = row.querySelector('.dr-front'); if (!b) return;
  row.classList.toggle('is-open', open); b.setAttribute('aria-expanded', String(open));
  const inner = row.querySelector('.dr-inner'); if (inner) inner.inert = !open;
}
export function init() {
  const vault = document.querySelector('.vault'); if (!vault) return null;
  const list = vault.querySelector('.al-list'), body = vault.querySelector('.vault-body');
  const rows = [...vault.querySelectorAll('.al-row')];
  const drawers = rows.filter((r) => r.querySelector('.dr-front'));
  vault.classList.add('vault-js');
  drawers.forEach((r) => setDrawer(r, false));
  const onClick = (e) => {
    const b = e.target.closest('.dr-front');
    if (b) { const r = b.closest('.al-row'); const open = !r.classList.contains('is-open'); setDrawer(r, open); if (open) { r.classList.add('was-opened'); } return; }
    const t = e.target.closest('[data-vault]');
    if (t) drawers.forEach((r) => { if (!r.hidden) setDrawer(r, t.dataset.vault === 'open'); });
  };
  vault.addEventListener('click', onClick);
  // rows rise in as they come into view
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    rows.forEach((r) => io.observe(r));
  } else rows.forEach((r) => r.classList.add('is-in'));
  // the ink line: follows the reader down the archive; every date it reaches is inked
  const ink = vault.querySelector('.vault-ink');
  let raf = 0;
  const draw = () => {
    raf = 0; if (!ink || !body) return;
    const r = body.getBoundingClientRect(); const h = Math.max(1, r.height);
    const p = RM() ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.62 - r.top) / h));
    ink.style.setProperty('--ink', p.toFixed(4));
    const y = r.top + p * h;
    rows.forEach((row) => { const n = row.querySelector('.dr-node'); if (n) n.classList.toggle('is-inked', n.getBoundingClientRect().top + 10 <= y); });
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw); };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
  const ro = 'ResizeObserver' in window ? new ResizeObserver(onScroll) : null; ro?.observe(list);
  draw();
  return { destroy() { io?.disconnect(); ro?.disconnect(); vault.removeEventListener('click', onClick); removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); } };
}
