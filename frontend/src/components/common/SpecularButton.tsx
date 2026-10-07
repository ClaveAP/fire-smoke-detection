'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';
import './SpecularButton.css';

const PAD = 20;

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = shapeSDF(p);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  // Dark base stroke hugging the edge for a sense of thickness
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;

  // Symmetric specular: the edges facing toward/away from the light both
  // catch a streak. The angular window (size + fade) is measured with an
  // elliptical normal so it varies continuously along straight edges.
  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`;

export interface SpecularButtonProps {
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
}

export const SpecularButton: React.FC<SpecularButtonProps> = ({
  children = 'Get Started',
  size = 'lg',
  radius = 18,
  tint = '#ffffff',
  tintOpacity = 0,
  blur = 0,
  textColor = '#f5f5f5',
  lineColor = '#ffffff',
  baseColor = '#525252',
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  href
}) => {
  const router = useRouter();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const fxRef = useRef<HTMLSpanElement | null>(null);
  const propsRef = useRef({
    radius,
    lineColor,
    baseColor,
    intensity,
    shineSize,
    shineFade,
    thickness,
    speed,
    followMouse,
    proximity,
    autoAnimate
  });

  useEffect(() => {
    propsRef.current = {
      radius,
      lineColor,
      baseColor,
      intensity,
      shineSize,
      shineFade,
      thickness,
      speed,
      followMouse,
      proximity,
      autoAnimate
    };
  }, [
    radius,
    lineColor,
    baseColor,
    intensity,
    shineSize,
    shineFade,
    thickness,
    speed,
    followMouse,
    proximity,
    autoAnimate
  ]);

  useEffect(() => {
    const btn = btnRef.current;
    const fx = fxRef.current;
    if (!btn || !fx) return;

    let renderer: Renderer | null = null;
    let gl: Renderer["gl"] | null = null;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;
    let raf = 0;
    let initTimer: ReturnType<typeof setTimeout> | null = null;
    let isVisible = false;
    let isDisposed = false;

    const cachedRect = { left: 0, top: 0, right: 0, bottom: 0, width: 1, height: 1 };
    const updateRect = () => {
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      cachedRect.left = r.left;
      cachedRect.top = r.top;
      cachedRect.right = r.right;
      cachedRect.bottom = r.bottom;
      cachedRect.width = r.width;
      cachedRect.height = r.height;
    };

    let pointerAngle: number | null = null;
    let proximityT = 0;
    let needsFrame = false;

    const startLoop = () => {
      if (!raf && isVisible && renderer) {
        last = performance.now();
        raf = requestAnimationFrame(update);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isVisible) return;
      const cx = cachedRect.left + cachedRect.width / 2;
      const cy = cachedRect.top + cachedRect.height / 2;
      const dx = Math.max(cachedRect.left - e.clientX, 0, e.clientX - cachedRect.right);
      const dy = Math.max(cachedRect.top - e.clientY, 0, e.clientY - cachedRect.bottom);
      const dist = Math.hypot(dx, dy);

      if (dist === 0) {
        const nx = (e.clientX - cx) / Math.max(cachedRect.width / 2, 1);
        const ny = (cy - e.clientY) / Math.max(cachedRect.height / 2, 1);
        pointerAngle = Math.atan2(2 / Math.max(cachedRect.height, 1), -2 / Math.max(cachedRect.width, 1)) + nx * 0.3 + ny * 0.15;
      } else {
        pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
      }
      const t = Math.max(0, 1 - dist / Math.max(propsRef.current.proximity, 1));
      const nextProx = t * t * (3 - 2 * t);
      if (nextProx > 0.001 || proximityT > 0.001) {
        proximityT = nextProx;
        needsFrame = true;
        startLoop();
      }
    };

    let angle = 2.4;
    let idleAngle = 2.4;
    let bright = propsRef.current.autoAnimate ? 1 : 0.65;
    let last = performance.now();
    const lineC = new Color();
    const baseC = new Color();
    const sizeRef = { w: 1, h: 1 };
    let program: Program | null = null;
    let mesh: Mesh | null = null;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    const update = (now: number) => {
      raf = 0;
      if (!renderer || !program || !mesh || !isVisible) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const p = propsRef.current;

      idleAngle += p.speed * dt;
      const steer = p.followMouse && pointerAngle != null && (!p.autoAnimate || proximityT > 0);
      const target = (steer && pointerAngle !== null) ? pointerAngle : idleAngle;
      const diff = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      angle += diff * (1 - Math.exp(-dt * 7));

      const brightTarget = p.autoAnimate ? 1 : Math.max(0.55, proximityT);
      bright += (brightTarget - bright) * (1 - Math.exp(-dt * 8));

      lineC.set(p.lineColor);
      baseC.set(p.baseColor);
      program.uniforms.uAngle.value = angle;
      program.uniforms.uRadius.value = Math.min(p.radius, Math.min(sizeRef.w, sizeRef.h) / 2) * dpr;
      program.uniforms.uLineColor.value = [lineC.r, lineC.g, lineC.b];
      program.uniforms.uBaseColor.value = [baseC.r, baseC.g, baseC.b];
      program.uniforms.uIntensity.value = p.intensity * bright;
      program.uniforms.uShineSize.value = (p.shineSize * Math.PI) / 180;
      program.uniforms.uShineFade.value = (p.shineFade * Math.PI) / 180;
      program.uniforms.uThickness.value = p.thickness * dpr;
      renderer.render({ scene: mesh });

      if (p.autoAnimate || proximityT > 0.005 || Math.abs(diff) > 0.01 || needsFrame) {
        needsFrame = false;
        raf = requestAnimationFrame(update);
      }
    };

    const initWebGL = () => {
      if (isDisposed || renderer) return;
      try {
        renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, dpr });
        gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        const geometry = new Triangle(gl);
        if (geometry.attributes.uv) delete geometry.attributes.uv;

        program = new Program(gl, {
          vertex: VERT,
          fragment: FRAG,
          uniforms: {
            uCenter: { value: [0, 0] },
            uHalfSize: { value: [1, 1] },
            uRadius: { value: 0 },
            uAngle: { value: 2.4 },
            uPx: { value: dpr },
            uLineColor: { value: [1, 1, 1] },
            uBaseColor: { value: [0.32, 0.32, 0.32] },
            uIntensity: { value: 1 },
            uShineSize: { value: 0.17 },
            uShineFade: { value: 0.7 },
            uThickness: { value: 1 },
            uBaseWidth: { value: dpr }
          }
        });

        mesh = new Mesh(gl, { geometry, program });
        fx.appendChild(gl.canvas);

        const resize = () => {
          if (!btn || !renderer || !program) return;
          updateRect();
          const w = cachedRect.width;
          const h = cachedRect.height;
          sizeRef.w = w;
          sizeRef.h = h;
          renderer.setSize(w + PAD * 2, h + PAD * 2);
          program.uniforms.uCenter.value = [(PAD + w / 2) * dpr, (PAD + h / 2) * dpr];
          program.uniforms.uHalfSize.value = [(w / 2) * dpr, (h / 2) * dpr];
          needsFrame = true;
          startLoop();
        };

        ro = new ResizeObserver(resize);
        ro.observe(btn);
        resize();

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('scroll', updateRect, { passive: true });
      } catch (err) {
        console.warn('SpecularButton WebGL initialization fallback:', err);
      }
    };

    io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          updateRect();
          if (!renderer && !initTimer) {
            // Defer WebGL shader compile so initial page paint & scroll are 100% freeze-free
            initTimer = setTimeout(initWebGL, 180);
          } else {
            needsFrame = true;
            startLoop();
          }
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.05 }
    );
    io.observe(btn);

    return () => {
      isDisposed = true;
      if (initTimer) clearTimeout(initTimer);
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', updateRect);
      if (gl && gl.canvas && gl.canvas.parentNode === fx) {
        fx.removeChild(gl.canvas);
      }
      if (gl) {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (onClick) {
      onClick(e);
    }
    if (href && !e.defaultPrevented) {
      router.push(href);
    }
  };

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`specular-button specular-button--${size}${className ? ` ${className}` : ''}`}
      style={{
        '--sb-radius': `${radius}px`,
        '--sb-tint': tint,
        '--sb-tint-opacity': tintOpacity,
        '--sb-blur': `${blur}px`,
        '--sb-text-color': textColor
      } as React.CSSProperties}
    >
      <span ref={fxRef} className="specular-button__fx" aria-hidden="true" />
      <span className="specular-button__label">{children}</span>
    </button>
  );
};

export default SpecularButton;
