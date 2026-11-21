// Home hero: floating cracked porcelain moon, sigil rings, porcelain shards, dust, parallax backdrop.
import * as THREE from './vendor/three.module.min.js';
import { ROOT, dpr, lite, pointer, loop, reduceMotion } from './env.js';
import { sigilToCanvas } from './sigil.js';

const MOON_VERT = `varying vec3 vN;varying vec3 vP;varying vec3 vW;
void main(){vN=normalize(normalMatrix*normal);vP=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const MOON_FRAG = `uniform float t;uniform float glow;varying vec3 vN;varying vec3 vP;varying vec3 vW;
vec3 hash3(vec3 p){p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6)));return fract(sin(p)*43758.5453);}
vec2 worley(vec3 p){vec3 i=floor(p),f=fract(p);float d1=8.,d2=8.;
 for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++){vec3 g=vec3(x,y,z);vec3 o=hash3(i+g);vec3 r=g+o-f;float d=dot(r,r);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}
 return vec2(sqrt(d1),sqrt(d2));}
float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){
 vec3 N=normalize(vN);vec3 V=normalize(cameraPosition-vW);
 vec3 p=normalize(vP);
 vec2 w=worley(p*3.2);float e=w.y-w.x;
 vec2 w2=worley(p*7.5+2.);float e2=w2.y-w2.x;
 float mask=smoothstep(.42,.62,n3(p*2.3+1.7));
 float crack=smoothstep(.045,.0,e)*mask+smoothstep(.03,.0,e2)*mask*.6;
 float craze=smoothstep(.02,.0,abs(n3(p*24.)-.5))*.25;
 vec3 base=mix(vec3(.93,.9,.84),vec3(.82,.83,.86),n3(p*4.)*.6);
 vec3 L1=normalize(vec3(-.6,.4,.7));vec3 L2=normalize(vec3(.8,-.3,.3));
 float d1=max(dot(N,L1),0.);float d2=max(dot(N,L2),0.);
 vec3 col=base*(.06+d1*.72*vec3(1.,.9,.82)+d2*.5*vec3(.85,.22,.18));
 vec3 H=normalize(L1+V);col+=pow(max(dot(N,H),0.),70.)*.4;
 col*=1.-craze*.4;
 float pulse=.65+.35*sin(t*1.3+p.y*4.);
 vec3 ember=mix(vec3(.55,.03,.03),vec3(1.,.45,.15),smoothstep(.01,.0,e)*pulse);
 col=mix(col,vec3(.05,.01,.01),crack*.9);
 col+=ember*crack*glow*pulse*1.2;
 float fr=pow(1.-max(dot(N,V),0.),3.);
 col+=vec3(.7,.08,.06)*fr*.9;
 gl_FragColor=vec4(col,1.);
}`;

export function startMoon(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !lite, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr());
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060405, 0.035);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  // backdrop is the HTML hero image (so the dancer's position on screen is known)
  const backImg = canvas.parentElement.querySelector('.hero-fallback');
  // painted moon and the dancer's head in hero.jpg (fractions of the image)
  const IMG = { w: 1280, h: 720, moon: { x: 0.535, y: 0.298, r: 0.026 }, head: { x: 0.74, y: 0.36, r: 0.08 } };
  // the moon
  const group = new THREE.Group(); scene.add(group);
  const moonMat = new THREE.ShaderMaterial({ vertexShader: MOON_VERT, fragmentShader: MOON_FRAG, uniforms: { t: { value: 0 }, glow: { value: 1 } } });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(2.1, lite ? 64 : 128, lite ? 48 : 96), moonMat);
  group.add(moon);
  // halo
  const haloC = document.createElement('canvas'); haloC.width = haloC.height = 256;
  const hx = haloC.getContext('2d'); const hg = hx.createRadialGradient(128, 128, 40, 128, 128, 128);
  hg.addColorStop(0, 'rgba(255,120,80,.55)'); hg.addColorStop(0.45, 'rgba(160,20,20,.25)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
  hx.fillStyle = hg; hx.fillRect(0, 0, 256, 256);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(haloC), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  halo.scale.set(9, 9, 1); halo.position.z = -0.5; group.add(halo);

  // sigil rings
  const rings = [];
  const ringDefs = [['moon-a', 7.6, 0x6b7a, '#d2b47a', '#b3191f', 0.55], ['moon-b', 9.4, 0, '#8d1418', '#d2b47a', 0.45], ['moon-c', 6.2, 0, '#a8874f', '#e0662b', 0.35]];
  ringDefs.forEach(([seed, size, , col, red, op], i) => {
    const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    m.rotation.x = -1.1 + i * 0.5; m.rotation.y = 0.3 - i * 0.35;
    m.userData = { op, speed: (i % 2 ? -1 : 1) * (0.05 + i * 0.03) };
    group.add(m); rings.push(m);
    sigilToCanvas(seed, 1024, col, red, 2.4).then((c) => { mat.map = new THREE.CanvasTexture(c); mat.map.colorSpace = THREE.SRGBColorSpace; mat.needsUpdate = true; });
  });

  // shards
  scene.add(new THREE.AmbientLight(0x402020, 0.6));
  const key = new THREE.DirectionalLight(0xffe2c0, 1.6); key.position.set(-4, 3, 6); scene.add(key);
  const redL = new THREE.PointLight(0xc0201a, 30, 18, 1.6); redL.position.set(3, -2, 3); scene.add(redL);
  const shardMat = new THREE.MeshStandardMaterial({ color: 0xece3d0, roughness: 0.25, metalness: 0.05, flatShading: true });
  const shards = [];
  const SN = lite ? 14 : 30;
  for (let i = 0; i < SN; i++) {
    const g = new THREE.TetrahedronGeometry(0.08 + Math.random() * 0.22, 0); g.scale(1, 0.35 + Math.random() * 0.5, 1.4);
    const s = new THREE.Mesh(g, shardMat);
    s.userData = { r: 2.5 + Math.random() * 1.4, a: Math.random() * Math.PI * 2, y: (Math.random() - 0.5) * 3.2, sp: 0.04 + Math.random() * 0.12, spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.8) };
    group.add(s); shards.push(s);
  }

  // dust & embers
  const PN = lite ? 450 : 1400;
  const pos = new Float32Array(PN * 3), col = new Float32Array(PN * 3), spd = new Float32Array(PN);
  const cA = new THREE.Color('#d2b47a'), cB = new THREE.Color('#b3191f'), cC = new THREE.Color('#ece3d0');
  for (let i = 0; i < PN; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 30; pos[i * 3 + 1] = (Math.random() - 0.5) * 18; pos[i * 3 + 2] = -12 + Math.random() * 16;
    const c = [cA, cB, cC][i % 3]; col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; spd[i] = 0.1 + Math.random() * 0.5;
  }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const dotC = document.createElement('canvas'); dotC.width = dotC.height = 32; const dx = dotC.getContext('2d');
  const dg = dx.createRadialGradient(16, 16, 0, 16, 16, 16); dg.addColorStop(0, 'rgba(255,255,255,1)'); dg.addColorStop(0.3, 'rgba(255,255,255,.5)'); dg.addColorStop(1, 'rgba(255,255,255,0)'); dx.fillStyle = dg; dx.fillRect(0, 0, 32, 32);
  const points = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.09, map: new THREE.CanvasTexture(dotC), vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(points);

  let W = 1, H = 1; const home = { x: 0, y: 0 }; let portrait = false;
  const halfH = Math.tan((camera.fov / 2) * Math.PI / 180) * camera.position.z;
  const toWorld = (px, py) => ({ x: (px / W * 2 - 1) * halfH * (W / H), y: -(py / H * 2 - 1) * halfH });
  const layout = () => {
    W = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight;
    renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    portrait = W / H < 1.05;
    // object-fit: cover mapping of the hero image
    const posX = portrait ? 0.72 : 0.5;
    if (backImg) backImg.style.objectPosition = `${posX * 100}% 50%`;
    const sc = Math.max(W / IMG.w, H / IMG.h); const dw = IMG.w * sc, dh = IMG.h * sc;
    const ox = (W - dw) * posX, oy = (H - dh) * 0.5;
    let px, py, pr;
    if (!portrait) { // sit exactly on the painted moon, replacing it
      px = ox + IMG.moon.x * dw; py = oy + IMG.moon.y * dh; pr = IMG.moon.r * dw * 1.12;
    } else { // phones: small moon in the upper-left sky, well away from her head
      pr = Math.min(W * 0.12, 60); px = Math.max(pr + 16, W * 0.2); py = Math.max(110 + pr, H * 0.17);
    }
    // safety: keep the moon and its glow clear of the dancer's head
    const hx = ox + IMG.head.x * dw, hy = oy + IMG.head.y * dh, hr = IMG.head.r * dw;
    const need = hr + pr * 1.6; const d = Math.hypot(px - hx, py - hy);
    if (d < need) { const k = need / Math.max(1, d); px = hx + (px - hx) * k; py = hy + (py - hy) * k; }
    const w = toWorld(px, py); home.x = w.x; home.y = w.y;
    group.position.set(w.x, w.y, 0);
    group.scale.setScalar((pr / H * 2 * halfH) / 2.1);
    rings.forEach((r) => r.scale.setScalar(portrait ? 0.62 : 0.78));
  };
  layout(); addEventListener('resize', layout);

  const intro = { k: 0 }; // 0..1 assemble on enter
  const cam = { x: 0, y: 0 };
  let started = performance.now();
  const render = (t, dt) => {
    const a = Math.min(1, (performance.now() - started) / 4000); intro.k = 1 - Math.pow(1 - a, 3);
    moonMat.uniforms.t.value = t; moonMat.uniforms.glow.value = 0.6 + 0.6 * intro.k;
    const tx = pointer.active ? pointer.nx : Math.sin(t * 0.2) * 0.3, ty = pointer.active ? pointer.ny : Math.cos(t * 0.17) * 0.2;
    cam.x += (tx - cam.x) * 0.035; cam.y += (ty - cam.y) * 0.035;
    group.position.x = home.x + cam.x * 0.12; group.position.y = home.y - cam.y * 0.08 + Math.sin(t * 0.6) * 0.03;
    if (backImg) backImg.style.transform = `translate3d(${(-cam.x * 10).toFixed(1)}px, ${(-cam.y * 6).toFixed(1)}px, 0) scale(1.03)`;
    moon.rotation.y += dt * 0.06; moon.rotation.x = cam.y * 0.35; moon.rotation.z = -cam.x * 0.2;
    halo.material.opacity = 0.75 + Math.sin(t * 1.3) * 0.15;
    rings.forEach((r, i) => { r.rotation.z += dt * r.userData.speed; r.material.opacity = r.userData.op * intro.k; r.rotation.x = -1.1 + i * 0.5 + cam.y * 0.25; r.rotation.y = 0.3 - i * 0.35 + cam.x * 0.25; });
    shards.forEach((s) => { const u = s.userData; u.a += dt * u.sp; const rr = u.r * (0.4 + 0.6 * intro.k) + Math.sin(t + u.a) * 0.1; s.position.set(Math.cos(u.a) * rr, u.y + Math.sin(t * 0.5 + u.a) * 0.3, Math.sin(u.a) * rr * 0.6); s.rotation.x += u.spin.x * dt; s.rotation.y += u.spin.y * dt; });
    const p = pg.attributes.position.array;
    for (let i = 0; i < PN; i++) { p[i * 3 + 1] += spd[i] * dt * 0.4; if (p[i * 3 + 1] > 9) p[i * 3 + 1] = -9; }
    pg.attributes.position.needsUpdate = true;
    points.rotation.y = cam.x * 0.08;
    redL.intensity = 26 + Math.sin(t * 7) * 3 + Math.sin(t * 13.3) * 2;
    renderer.render(scene, camera);
  };
  let l;
  if (reduceMotion) { render(10, 0); l = { stop() {} }; }
  else l = loop(render, { el: canvas, fps: lite ? 30 : 60 });
  return {
    restart() { started = performance.now(); },
    destroy() { l.stop(); removeEventListener('resize', layout); renderer.dispose(); scene.traverse((o) => { o.geometry && o.geometry.dispose(); if (o.material) { o.material.map && o.material.map.dispose(); o.material.dispose(); } }); },
  };
}
