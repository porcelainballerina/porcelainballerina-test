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
    const mode = await playWelcome({ sound });
    if (mode === 'opened') {
      // the threshold: the door swings open into the house
      const gate = document.createElement('div');
      gate.className = 'gate gate-auto'; gate.setAttribute('aria-hidden', 'true');
      gate.innerHTML = `<div class="gate-stage">
          <div class="gate-img"></div><div class="gate-light"></div>
          <div class="gate-leaf gate-leaf-l"></div><div class="gate-leaf gate-leaf-r"></div>
          ${[[5,62],[13,73],[21,76],[8,86],[18,60],[82,62],[91,57],[95,72],[86,83],[78,76]].map(([x,y],i)=>`<span class="gate-flame" style="left:${x}%;top:${y}%;--d:${i}"></span>`).join('')}
        </div><div class="gate-shade"></div>`;
      document.body.appendChild(gate);
      const skipDoor = new Promise((r) => { const k = (e) => { if (e.key === 'Escape') r(); }; addEventListener('keydown', k, { once: true }); gate.addEventListener('click', r, { once: true }); });
      await new Promise((r) => setTimeout(r, reduceMotion ? 200 : 900));
      sound.impact(); sound.creak(7.5); gate.classList.add('is-opening');
      if (smoke) smoke.state.heat = 1.8;
      await Promise.race([new Promise((r) => setTimeout(r, reduceMotion ? 300 : 8600)), skipDoor]);
      gate.classList.add('is-leaving'); setTimeout(() => gate.remove(), 2600);
      if (smoke) smoke.state.heat = 1;
      if (embers) { embers.api.boost = 4; setTimeout(() => (embers.api.boost = 1), 2500); }
    }
    document.body.style.overflow = '';
    await heroReady;
    moon && moon.restart();
    reveal();
  }
  startCrackFx();
  return { destroy() { parts.forEach((p) => p && p.destroy && p.destroy()); document.querySelectorAll('.gate,.intro-layer,.wel').forEach((n) => n.remove()); document.body.style.overflow = ''; } };
}
