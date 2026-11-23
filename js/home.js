// Home: enter gate -> cinematic intro -> 3D hero; scroll fracture section.
import { reduceMotion, hasWebGL } from './env.js';
import { playWelcome, seenWelcome } from './welcome.js';

export async function init({ sound, smoke, embers, revealNow }) {
  const hero = document.querySelector('.hero');
  const heroCopy = hero.querySelector('.hero-copy');
  const parts = [];
  let moon = null;

  const startHero = async () => {
    // v17: the 3D porcelain moon and its rings are retired; the blood moon now lives in the belfry painting itself
    if (true) return;
    if (!hasWebGL()) return;
    try {
      const { startMoon } = await import('./moon.js');
      moon = startMoon(hero.querySelector('.hero-canvas'));
      document.documentElement.classList.add('has-webgl');
      parts.push(moon);
    } catch (e) { console.error(e); }
  };
  const startCrackFx = async () => {
    if (reduceMotion) return;
    const sec = document.querySelector('.crack-section'); if (!sec) return;
    const { startCrack } = await import('./crack.js');
    parts.push(startCrack(sec, { sound }));
  };

  const reveal = () => { revealNow(heroCopy); };
  const params = new URLSearchParams(location.search);
  const first = !seenWelcome() || params.has('welcome');

  if (!first) {
    // returning visitor: straight into the home page
    await startHero(); reveal();
  } else {
    if (params.has('welcome')) history.replaceState(history.state, '', location.pathname + location.hash);
    const heroReady = startHero();
    await playWelcome({ sound });
    document.body.style.overflow = '';
    await heroReady;
    moon && moon.restart();
    reveal();
  }
  startCrackFx();
  return { destroy() { parts.forEach((p) => p && p.destroy && p.destroy()); document.querySelectorAll('.gate,.intro-layer,.wel').forEach((n) => n.remove()); document.body.style.overflow = ''; } };
}
