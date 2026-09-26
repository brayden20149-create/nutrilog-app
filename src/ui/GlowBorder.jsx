import { useEffect, useRef, useState } from "react";
import { T } from "../theme.js";

// subtle is the default: visible in peripheral vision, never competing with content.
const LEVELS = {
  subtle: { thickness: 2, speed: 2, opacity: 0.55, tail: 0.17 },
  vivid:  { thickness: 3, speed: 4, opacity: 0.95, tail: 0.27 },
};

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
// Slider 1-10 reads as "faster to the right"; 2 keeps the long-standing 11s lap.
const lapSeconds = (speed) => 22 / clamp(speed, 1, 10);

// A light that runs around the screen edge. It is drawn as the stroke of a
// rounded rectangle and moved with a travelling dash, so it follows the phone's
// corner curves exactly — a masked box could only ever give square corners.
export const GlowBorder = ({ intensity = "subtle", width, radius, speed, style = "trail" }) => {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const boxRef = useRef(null);

  // Measure the fixed box itself rather than window.innerHeight. With
  // viewport-fit=cover the two disagree on iPhone, and trusting the window left
  // the ring's bottom arc floating above the real screen edge.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize(prev => (Math.round(prev.w) === Math.round(r.width) && Math.round(prev.h) === Math.round(r.height)
        ? prev : { w: r.width, h: r.height }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("orientationchange", measure);
    return () => { ro.disconnect(); window.removeEventListener("orientationchange", measure); };
  }, []);

  const level = LEVELS[intensity];
  if (!level) return null;
  const { opacity, tail } = level;
  const ring = style === "ring";
  const seconds = lapSeconds(Number.isFinite(+speed) ? +speed : level.speed);

  const stroke = Number.isFinite(+width) ? clamp(+width, 1, 10) : level.thickness;
  const { w, h } = size;
  // The stroke straddles the path, so inset the rect by half of it to keep the
  // whole ring on screen.
  const inset = stroke / 2;
  const rectW = w - stroke;
  const rectH = h - stroke;
  const wanted = Number.isFinite(+radius) ? clamp(+radius, 0, 80) : 44;
  const r = clamp(wanted - inset, 0, Math.min(rectW, rectH) / 2);

  // Straight runs plus the four corner quarter-circles.
  const perimeter = 2 * (rectW - 2 * r) + 2 * (rectH - 2 * r) + 2 * Math.PI * r;
  const lit = perimeter * tail;

  return (
    <>
      <style>{`
        @keyframes nlGlowRun { to { stroke-dashoffset: ${-perimeter}px; } }
        @media (prefers-reduced-motion: reduce) {
          .nl-glow-spinner { animation: none !important; }
        }
      `}</style>
      <div ref={boxRef} aria-hidden="true"
        style={{position:"fixed",inset:0,zIndex:9998,pointerEvents:"none",opacity}}>
      {w > 0 && h > 0 && (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:"block"}}>
        <defs>
          <linearGradient id="nlGlowGrad" x1="0" y1="0" x2={w} y2={h} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={T.accent2}/>
            <stop offset="100%" stopColor={T.accent}/>
          </linearGradient>
        </defs>
        {/* ring mode lights the whole perimeter and holds still */}
        <rect className="nl-glow-spinner"
          x={inset} y={inset} width={rectW} height={rectH} rx={r} ry={r}
          fill="none" stroke="url(#nlGlowGrad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={ring ? undefined : `${lit} ${perimeter - lit}`}
          style={{
            animation: ring ? "none" : `nlGlowRun ${seconds}s linear infinite`,
            filter:`drop-shadow(0 0 ${Math.max(4, stroke * 2)}px ${T.accent})`,
          }}/>
      </svg>
      )}
      </div>
    </>
  );
};
