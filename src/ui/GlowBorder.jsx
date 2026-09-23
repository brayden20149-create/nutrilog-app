import { useEffect, useState } from "react";
import { T } from "../theme.js";

// subtle is the default: visible in peripheral vision, never competing with content.
const LEVELS = {
  subtle: { thickness: 2, seconds: 11, opacity: 0.55, tail: 0.17 },
  vivid:  { thickness: 3, seconds: 6,  opacity: 0.95, tail: 0.27 },
};

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// A light that runs around the screen edge. It is drawn as the stroke of a
// rounded rectangle and moved with a travelling dash, so it follows the phone's
// corner curves exactly — a masked box could only ever give square corners.
export const GlowBorder = ({ intensity = "subtle", width, radius }) => {
  const [size, setSize] = useState(() => ({
    w: typeof window === "undefined" ? 0 : window.innerWidth,
    h: typeof window === "undefined" ? 0 : window.innerHeight,
  }));

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  const level = LEVELS[intensity];
  if (!level || !size.w || !size.h) return null;
  const { seconds, opacity, tail } = level;

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
      <svg aria-hidden="true" width={w} height={h} viewBox={`0 0 ${w} ${h}`}
        style={{position:"fixed",top:0,left:0,zIndex:9998,pointerEvents:"none",opacity}}>
        <defs>
          <linearGradient id="nlGlowGrad" x1="0" y1="0" x2={w} y2={h} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={T.accent2}/>
            <stop offset="100%" stopColor={T.accent}/>
          </linearGradient>
        </defs>
        <rect className="nl-glow-spinner"
          x={inset} y={inset} width={rectW} height={rectH} rx={r} ry={r}
          fill="none" stroke="url(#nlGlowGrad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${lit} ${perimeter - lit}`}
          style={{
            animation:`nlGlowRun ${seconds}s linear infinite`,
            filter:`drop-shadow(0 0 ${Math.max(4, stroke * 2)}px ${T.accent})`,
          }}/>
      </svg>
    </>
  );
};
