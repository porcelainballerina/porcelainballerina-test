// Fullscreen smoke + living ink shader (raw WebGL, low resolution, throttled).
import { reduceMotion, lite, pointer, loop } from './env.js';

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision mediump float;
uniform vec2 res;uniform float t;uniform vec2 m;uniform float sc;uniform float heat;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*n(p);p=r*p*2.02;a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/res;vec2 p=uv;p.x*=res.x/res.y;
 vec2 mm=m;mm.x*=res.x/res.y;
 float d=length(p-mm);
 // swirl around cursor
 float sw=exp(-d*3.5)*1.4;
 vec2 dir=p-mm;p+=vec2(-dir.y,dir.x)*sw*.35;
 float tt=t*.035;
 vec2 q=vec2(fbm(p*1.6+vec2(0.,tt*2.)+sc*.15),fbm(p*1.6+vec2(5.2,1.3)-tt));
 vec2 r=vec2(fbm(p*1.8+3.*q+vec2(1.7,9.2)+tt*1.4),fbm(p*1.8+3.*q+vec2(8.3,2.8)-tt*.9));
 float f=fbm(p*1.4+3.5*r - vec2(0.,t*.02));
 // smoke rises from bottom
 float rise=smoothstep(1.15,-.1,uv.y);
 float smoke=smoothstep(.35,.95,f)*(.35+rise*.85);
 vec3 col=vec3(0.);
 col+=vec3(.42,.035,.04)*smoke*1.1;
 col+=vec3(.95,.45,.16)*pow(smoothstep(.62,1.,f),3.)*rise*.55*heat;
 // living ink veins: thin dark tendrils
 float v=abs(fbm(p*3.+r*2.-tt*3.)-.5);
 float ink=smoothstep(.035,0.,v)*smoothstep(.2,.7,length(r));
 col=mix(col,vec3(.01,.004,.006),ink*.85);
 col+=vec3(.62,.48,.25)*smoothstep(.01,0.,v)*.06;
 // cursor ember glow
 col+=vec3(.5,.08,.05)*exp(-d*6.)*.35;
 float a=clamp(max(col.r,max(col.g,col.b))*1.4+ink*.6,0.,1.);
 gl_FragColor=vec4(col,a);
}`;

export function startSmoke() {
  const canvas = document.createElement('canvas'); canvas.id = 'fx-smoke'; canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true, antialias: false, powerPreference: 'low-power' });
  if (!gl) { canvas.remove(); return null; }
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  const uRes = U('res'), uT = U('t'), uM = U('m'), uSc = U('sc'), uHeat = U('heat');
  const scale = lite ? 0.22 : 0.36;
  const resize = () => { canvas.width = Math.max(64, Math.floor(innerWidth * scale)); canvas.height = Math.max(64, Math.floor(innerHeight * scale)); gl.viewport(0, 0, canvas.width, canvas.height); };
  resize(); addEventListener('resize', resize);
  const mouse = { x: 0.5, y: 0.2 };
  const state = { heat: 1 };
  const draw = (t) => {
    const tx = pointer.active ? pointer.x / innerWidth : 0.5 + Math.sin(t * 0.1) * 0.2;
    const ty = pointer.active ? 1 - pointer.y / innerHeight : 0.25;
    mouse.x += (tx - mouse.x) * 0.04; mouse.y += (ty - mouse.y) * 0.04;
    gl.uniform2f(uRes, canvas.width, canvas.height); gl.uniform1f(uT, t + 20); gl.uniform2f(uM, mouse.x, mouse.y);
    gl.uniform1f(uSc, scrollY / innerHeight); gl.uniform1f(uHeat, state.heat);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  if (reduceMotion) { draw(30); return { state, stop() {} }; }
  const l = loop((t) => draw(t), { fps: lite ? 24 : 30 });
  return { state, stop: l.stop };
}
