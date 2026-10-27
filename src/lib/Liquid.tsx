// A soft liquid gradient, drawn per frame with a WebGL fragment shader. Domain-
// warped fbm noise, sampled zoomed-out so it reads like the brand orb: mostly
// pale pink and lilac, coral pooling only at the low edge, a soft yellow patch,
// fine grain. Flat colour only (no sphere shading: never a planet). Deterministic
// in `t`, so it renders frame-accurately (needs the angle GL renderer).
import React, {useLayoutEffect, useRef} from 'react';

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 res;
uniform float time;
uniform float seed;
uniform float zoom;
uniform float yside;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++){ v += a * noise(p); p = m * p; a *= 0.45; }
  return v;
}
vec3 hex(float r, float g, float b){ return vec3(r, g, b) / 255.0; }
void main(){
  vec2 uv = gl_FragCoord.xy / res;
  vec2 p = (uv * 2.0 - 1.0) * vec2(res.x / res.y, 1.0) * zoom;
  float t = time * 0.09 + seed * 7.13;
  vec2 q = vec2(fbm(p * 0.7 + vec2(0.0, t)), fbm(p * 0.7 + vec2(5.2, 1.3) - t * 0.8));
  vec2 r = vec2(fbm(p * 0.75 + 2.1 * q + vec2(1.7, 9.2) + t * 0.5), fbm(p * 0.75 + 2.1 * q + vec2(8.3, 2.8) - t * 0.4));
  float f = fbm(p * 0.6 + 2.0 * r);

  float up = uv.y - 0.5;
  float side = uv.x - 0.5;
  // Normalised warp outputs (measured at zoom ~0.55: f 0.218 +/- 0.025, q.x 0.24 +/- 0.05, r.y 0.38 +/- 0.09).
  float zf = (f - 0.218) / 0.025;
  float zq = (q.x - 0.24) / 0.05;
  float zr = (r.y - 0.38) / 0.09;
  // Rationed colour: ~80% pale pink and lilac light, coral only pooling at the low edge,
  // a soft yellow patch to one side. (Premium reads as light, not candy.)
  vec3 col = hex(246.0, 216.0, 233.0);                                                                     // pale pink
  col = mix(col, hex(252.0, 238.0, 247.0), smoothstep(0.2, 1.4, zf + up * 2.2) * 0.9);                      // lilac light
  col = mix(col, hex(240.0, 178.0, 208.0), smoothstep(0.4, 1.8, -zf + zq * 0.6) * 0.45);                    // deeper pink fold
  col = mix(col, hex(242.0, 140.0, 124.0), smoothstep(1.0, 2.4, -up * 3.4 - zf * 0.5 + zq * 0.4) * 0.6);    // coral, low edge only
  col = mix(col, hex(236.0, 92.0, 70.0), smoothstep(2.2, 3.4, -up * 3.8 - zf * 0.7 + zq * 0.5) * 0.4);      // a touch of red, lowest
  col = mix(col, hex(248.0, 214.0, 128.0), smoothstep(0.5, 1.8, zr - side * 2.6 * yside) * 0.7);           // soft yellow patch

  float g = hash(gl_FragCoord.xy + fract(time * 13.7) * 91.0);
  col += (g - 0.5) * 0.012; // just enough dither to stop banding, no visible grain
  gl_FragColor = vec4(col, 1.0);
}`;

type GLState = {
  gl: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
  res: WebGLUniformLocation;
  time: WebGLUniformLocation;
  seed: WebGLUniformLocation;
  zoom: WebGLUniformLocation;
  yside: WebGLUniformLocation;
};

// One WebGL context for every gradient in the film: each Liquid draws into it and copies the
// pixels into its own 2D canvas. Frame blending renders a scene several times per frame, and
// 4K needs big canvases, so per-instance contexts would run into the browser's context limit.
let shared: GLState | null = null;
const getShared = (): GLState | null => {
  if (shared && !shared.gl.isContextLost()) return shared;
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', {preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false});
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  shared = {
    gl,
    canvas,
    res: gl.getUniformLocation(prog, 'res')!,
    time: gl.getUniformLocation(prog, 'time')!,
    seed: gl.getUniformLocation(prog, 'seed')!,
    zoom: gl.getUniformLocation(prog, 'zoom')!,
    yside: gl.getUniformLocation(prog, 'yside')!,
  };
  return shared;
};

export const Liquid: React.FC<{
  t: number;
  w: number;
  h: number;
  seed?: number;
  /** Lower = more zoomed out (softer, fewer folds). */
  zoom?: number;
  /** Which side the yellow patch leans to: 1 = left, -1 = right. */
  ySide?: number;
  style?: React.CSSProperties;
}> = ({t, w, h, seed = 0, zoom = 0.55, ySide = 1, style}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  // Render at the device pixel ratio (2 for the 4K master), so the gradient stays sharp.
  const dpr = typeof window === 'undefined' ? 1 : Math.min(2, window.devicePixelRatio || 1);
  const W = Math.max(2, Math.round(w * dpr));
  const H = Math.max(2, Math.round(h * dpr));

  useLayoutEffect(() => {
    const canvas = ref.current;
    const s = getShared();
    if (!canvas || !s) return;
    const {gl} = s;
    if (s.canvas.width < W || s.canvas.height < H) {
      s.canvas.width = Math.max(s.canvas.width, W);
      s.canvas.height = Math.max(s.canvas.height, H);
    }
    gl.viewport(0, 0, W, H);
    gl.uniform2f(s.res, W, H);
    gl.uniform1f(s.time, t);
    gl.uniform1f(s.seed, seed);
    gl.uniform1f(s.zoom, zoom);
    gl.uniform1f(s.yside, ySide);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // The viewport sits at the bottom-left of the shared canvas (GL origin).
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(s.canvas, 0, s.canvas.height - H, W, H, 0, 0, W, H);
  }, [t, W, H, seed, zoom, ySide]);

  return <canvas ref={ref} width={W} height={H} style={{width: w, height: h, display: 'block', ...style}} />;
};
