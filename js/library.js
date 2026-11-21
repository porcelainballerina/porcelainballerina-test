// The library: scroll walks you down the aisle to the altar; the book writes itself,
// the music box plays and the porcelain dancer turns.
import { reduceMotion } from './env.js';

export function init({ sound }) {
  const sec = document.querySelector('.library'); if (!sec) return null;
  const hall = sec.querySelector('.lib-hall'), altarF = sec.querySelector('.lib-altar-frame'), hallF = sec.querySelector('.lib-hall-frame');
  const title = sec.querySelector('.lib-title'), hint = sec.querySelector('.lib-hint'), dark = sec.querySelector('.lib-dark'), scroller = sec.querySelector('.lib-scroller');
  const pages = [...sec.querySelectorAll('[data-ink]')];
  // split each page into words of letters so the ink can write them one by one
  pages.forEach((pg) => pg.querySelectorAll('p').forEach((p) => {
    const words = p.textContent.split(/(\s+)/);
    p.innerHTML = words.map((w) => (/^\s+$/.test(w) ? w : `<span class="iw">${[...w].map((c) => `<i>${c}</i>`).join('')}</span>`)).join('');
  }));
  // an illuminated initial at the start of the author's text
  pages.forEach((pg) => { if (pg.classList.contains('lib-page-r')) return; const first = [...pg.querySelectorAll('p')].find((q) => !q.classList.contains('lib-flag') && !q.classList.contains('lib-name')); const c = first && first.querySelector('i'); if (c) c.classList.add('cap'); });
  let wrote = false, arrived = false, raf = 0, alive = true;
  const writeInk = () => {
    if (wrote) return; wrote = true;
    const visible = pages.filter((p) => p.offsetParent !== null);
    let delay = 0;
    visible.forEach((pg) => pg.querySelectorAll('i').forEach((ch) => { ch.style.transitionDelay = delay + 'ms'; delay += reduceMotion ? 0 : 26; }));
    requestAnimationFrame(() => visible.forEach((pg) => pg.classList.add('is-written')));
  };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (t) => t * t * (3 - 2 * t);
  function frame() {
    raf = 0; if (!alive) return;
    const r = sec.getBoundingClientRect(); const span = sec.offsetHeight - innerHeight;
    const p = clamp(-r.top / span);
    const walk = ease(clamp(p / 0.66));
    hall.style.transform = `scale(${1 + walk * 2.6})`;
    hall.style.filter = `brightness(${0.85 + walk * 0.25})`;
    const a = ease(clamp((p - 0.5) / 0.24));
    altarF.style.opacity = a; hallF.style.opacity = 1 - clamp((p - 0.62) / 0.12);
    // after arriving, lean in over the open book until its pages fill the view
    const mob = innerWidth < 700;
    const zoom = ease(clamp((p - 0.74) / 0.2));
    const Z = mob ? 1.12 : 1.5;
    altarF.style.setProperty('--z', ((1.3 - a * 0.3) * (1 + zoom * (Z - 1))).toFixed(3));
    altarF.style.setProperty('--zoom', zoom.toFixed(3));
    sec.style.setProperty('--zoom', zoom.toFixed(3));
    title.style.opacity = 1 - clamp(p / 0.12); title.style.transform = `translateY(${-p * 120}px)`;
    if (p > 0.015) hint.classList.add('is-gone');
    scroller.style.setProperty('--p', p.toFixed(3));
    dark.style.opacity = (0.15 + Math.sin(clamp((p - 0.55) / 0.2) * Math.PI) * 0.6).toFixed(3);
    const at = p > 0.8;
    if (at !== arrived) {
      arrived = at; sec.classList.toggle('is-arrived', at);
      if (at) { writeInk(); sound && sound.musicBox(true); } else sound && sound.musicBox(false);
    }
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame); };
  // while the letter is on screen, fixed ornaments step aside so nothing covers the words
  const letter = document.querySelector('.ms-letter');
  const io = letter && 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => document.body.classList.toggle('ms-reading', e.isIntersecting), { threshold: 0.05 }) : null;
  if (io) io.observe(letter);
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
  frame();
  const unsub = sound && sound.onChange && sound.onChange(() => { if (arrived && sound.on) sound.musicBox(true); if (!sound.on) sound.musicBox(false); });
  return { destroy() { alive = false; io && io.disconnect(); document.body.classList.remove('ms-reading'); removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); sound && sound.musicBox(false); unsub && unsub(); } };
}
