// Cinematic intro: project images burning into each other (WebGL), timed lines, skippable.
import { ROOT, dpr, lite } from './env.js';

const IMAGES = ['01', '02', '03', '04', '05', '06'].map((n) => new URL(`images/intro/${n}.jpg`, ROOT).href);
const SEG = 2.7; // seconds per image
const LINES = [
  [0.6, 'In a chamber no one enters,'],
  [3.6, 'a dancer of porcelain waits under glass.'],
  [6.8, 'Ink. Wax. Fire.'],
  [9.8, 'The candles are lit for you.'],
  [12.9, 'Porcelain Ballerina', true],
];
const TOTAL = SEG * IMAGES.length + 1.2;

const VERT = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision mediump float;varying vec2 v;
uniform sampler2D A;uniform sampler2D B;uniform float k;uniform float t;uniform vec2 res;uniform vec2 ia;uniform vec2 ib;uniform float za;uniform float zb;uniform float fade;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p*=2.03;a*=.5;}return s;}
vec2 cover(vec2 uv,vec2 img,float z){float ra=res.x/res.y,ri=img.x/img.y;vec2 s=ra>ri?vec2(1.,ri/ra):vec2(ra/ri,1.);vec2 c=(uv-.5)*s/z+.5;return vec2(c.x,1.-c.y);}
void main(){
 vec2 uv=v;
 float w=fbm(uv*3.+t*.05)*.012;
 vec3 a=texture2D(A,cover(uv+w,ia,za)).rgb;
 vec3 b=texture2D(B,cover(uv-w,ib,zb)).rgb;
 float nz=fbm(uv*vec2(res.x/res.y,1.)*2.2+3.7);
 float edge=k*1.25-.12;
 float m=smoothstep(edge-.03,edge+.03,nz);
 vec3 col=mix(b,a,m);
 float burn=smoothstep(.09,0.,abs(nz-edge))*step(.001,k)*step(k,.999);
 col+=vec3(1.,.42,.12)*burn*1.6+vec3(.6,.05,.02)*smoothstep(.2,0.,abs(nz-edge))*step(.001,k)*step(k,.999);
 col*=1.-smoothstep(.4,1.05,length(uv-.5)*1.25);
 col+=(h(uv*res+t)-.5)*.06;
 col=mix(col,col*vec3(1.05,.9,.85),.3);
 gl_FragColor=vec4(col*fade,1.);
}`;

function loadImg(src) { return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }

export async function playIntro({ onEnd, sound }) {
  const layer = document.createElement('div'); layer.className = 'intro-layer'; layer.setAttribute('role', 'presentation');
  layer.innerHTML = `<canvas aria-hidden="true"></canvas><div class="intro-lines" aria-live="polite"></div><button type="button" class="intro-skip"><span>Skip intro</span><b aria-hidden="true">»</b></button><p class="intro-skip-hint" aria-hidden="true">or click anywhere &middot; Esc</p>`;
  document.body.appendChild(layer);
  const canvas = layer.querySelector('canvas'); const linesEl = layer.querySelector('.intro-lines');
  const lineEls = LINES.map(([, txt, big]) => { const p = document.createElement('p'); p.className = 'intro-line' + (big ? ' title-fraktur' : ''); p.textContent = txt; linesEl.appendChild(p); return p; });
  let done = false, raf = 0;
  const finish = () => {
    if (done) return; done = true; cancelAnimationFrame(raf);
    removeEventListener('keydown', onKey);
    layer.classList.add('is-leaving');
    setTimeout(() => layer.remove(), 1900);
    onEnd && onEnd();
  };
  const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish(); };
  addEventListener('keydown', onKey);
  layer.querySelector('.intro-skip').addEventListener('click', finish);
  layer.addEventListener('click', finish);
  layer.querySelector('.intro-skip').focus();

  const gl = canvas.getContext('webgl', { antialias: false });
  const imgs = (await Promise.all(IMAGES.map(loadImg))).filter(Boolean);
  if (!gl || imgs.length < 2) { setTimeout(finish, 600); return { skip: finish }; }
  const R = Math.min(dpr(), lite ? 1 : 1.25);
  const resize = () => { canvas.width = innerWidth * R; canvas.height = innerHeight * R; gl.viewport(0, 0, canvas.width, canvas.height); };
  resize(); addEventListener('resize', resize);
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr); gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = imgs.map((im) => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im); return t; });
  const U = (n) => gl.getUniformLocation(pr, n);
  gl.uniform1i(U('A'), 0); gl.uniform1i(U('B'), 1);
  const t0 = performance.now();
  const shown = new Set();
  const frame = (now) => {
    if (done) return;
    const t = Math.max(0, (now - t0) / 1000);
    const i = Math.min(imgs.length - 1, Math.floor(t / SEG));
    const local = t - i * SEG;
    const next = Math.min(imgs.length - 1, i + 1);
    const k = i === imgs.length - 1 ? 0 : Math.max(0, (local - (SEG - 1.1)) / 1.1);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[i]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex[next]);
    gl.uniform1f(U('k'), Math.min(1, k)); gl.uniform1f(U('t'), t);
    gl.uniform2f(U('res'), canvas.width, canvas.height);
    gl.uniform2f(U('ia'), imgs[i].width, imgs[i].height); gl.uniform2f(U('ib'), imgs[next].width, imgs[next].height);
    gl.uniform1f(U('za'), 1.0 + local * 0.035); gl.uniform1f(U('zb'), 1.0);
    gl.uniform1f(U('fade'), Math.min(1, t / 1.5) * Math.max(0, Math.min(1, (TOTAL - t) / 1.2)));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    LINES.forEach(([at], j) => {
      const end = LINES[j + 1] ? LINES[j + 1][0] - 0.4 : TOTAL;
      lineEls[j].classList.toggle('is-on', t >= at && t < end);
      if (t >= at && !shown.has(j)) { shown.add(j); if (j === LINES.length - 1) sound && sound.bell(55, 0.4); }
    });
    if (t >= TOTAL) { finish(); return; }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return { skip: finish };
}
