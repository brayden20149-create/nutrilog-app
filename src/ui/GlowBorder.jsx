import { T } from "../theme.js";

// subtle is the default: visible in peripheral vision, never competing with content.
const LEVELS = {
  subtle: { thickness: 2, seconds: 11, opacity: 0.5, tail: 0.62 },
  vivid:  { thickness: 3, seconds: 6,  opacity: 0.9, tail: 0.42 },
};

// A light that travels around the screen edge. The ring is a full-viewport box
// masked to just its padding, so a single large spinning gradient underneath
// reads as one line of light chasing the border.
export const GlowBorder = ({ intensity = "subtle", width }) => {
  const level = LEVELS[intensity];
  if (!level) return null;
  const { seconds, opacity, tail } = level;
  // An explicit width overrides the preset thickness; clamped so the ring can
  // never grow wide enough to crowd the content it frames.
  const thickness = Number.isFinite(+width) ? Math.min(Math.max(+width, 1), 10) : level.thickness;
  const ring = "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)";

  return (
    <>
      <style>{`
        @keyframes nlGlowSpin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .nl-glow-spinner { animation: none !important; }
        }
      `}</style>
      <div aria-hidden="true" style={{
        position:"fixed", inset:0, zIndex:9998, pointerEvents:"none",
        padding:thickness, overflow:"hidden", opacity,
        WebkitMask:ring, mask:ring,
        WebkitMaskComposite:"xor", maskComposite:"exclude",
      }}>
        <div className="nl-glow-spinner" style={{
          position:"absolute", top:"50%", left:"50%",
          width:"220vmax", height:"220vmax", marginTop:"-110vmax", marginLeft:"-110vmax",
          background:`conic-gradient(from 0deg, transparent 0 ${tail * 100}%, ${T.accent2} ${(tail + 0.16) * 100}%, ${T.accent} ${(tail + 0.26) * 100}%, transparent ${(tail + 0.34) * 100}%)`,
          animation:`nlGlowSpin ${seconds}s linear infinite`,
        }}/>
      </div>
    </>
  );
};
