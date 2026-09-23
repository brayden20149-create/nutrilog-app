import { useMemo } from "react";
import { T } from "../theme.js";
import { Pumpkins } from "./Pumpkins.jsx";

// Ambient backdrops, one per theme. Everything here is decoration: aria-hidden,
// never tappable, sat behind the content, and still under prefers-reduced-motion.
//
// Only transform and opacity are animated so the compositor can handle them
// without relayout, and every particle list is memoised — App re-renders on each
// keystroke, and regenerating the random values would restart every animation.

const layer = { position:"fixed", inset:0, pointerEvents:"none", zIndex:1, overflow:"hidden" };
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

const KEYFRAMES = `
  @keyframes nlFall {
    0%   { transform: translate3d(0,-8vh,0) rotate(0deg); }
    100% { transform: translate3d(var(--dx,0), 108vh, 0) rotate(var(--spin,0deg)); }
  }
  @keyframes nlSway {
    0%,100% { transform: translateX(0); }
    50%     { transform: translateX(var(--sway,10px)); }
  }
  @keyframes nlTwinkle {
    0%,100% { opacity: var(--lo,.15); }
    50%     { opacity: var(--hi,.75); }
  }
  @keyframes nlComet {
    0%   { transform: translate3d(-20vw,-10vh,0) rotate(34deg); opacity:0; }
    8%   { opacity:1; }
    34%  { opacity:1; }
    50%,100% { transform: translate3d(112vw,62vh,0) rotate(34deg); opacity:0; }
  }
  @keyframes nlWave { to { transform: translateX(-50%); } }
  @keyframes nlLaser {
    0%   { transform: translateX(-60vw) scaleX(.4); opacity:0; }
    6%   { opacity:1; }
    22%  { opacity:1; }
    34%,100% { transform: translateX(120vw) scaleX(1); opacity:0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .nl-scene * { animation: none !important; }
  }
`;

const Scene = ({ children }) => (
  <>
    <style>{KEYFRAMES}</style>
    <div aria-hidden="true" className="nl-scene" style={layer}>{children}</div>
  </>
);

// ── Christmas: snow drifting down ─────────────────────────────────────────
const Snow = () => {
  // Negative delays start each flake partway through its fall, so the screen is
  // already full of snow on the first frame instead of filling from the top.
  const flakes = useMemo(() => Array.from({length:34}, (_,i) => {
    const dur = rand(9, 20);
    return { left: rand(-2, 100), size: rand(2, 6), dur, delay: -rand(0, dur),
      dx: rand(-8, 8), opacity: rand(0.25, 0.75), glyph: i % 9 === 0 };
  }), []);
  return (
    <Scene>
      {flakes.map((f, i) => (
        <div key={i} style={{position:"absolute",top:0,left:`${f.left}%`,
          animation:`nlFall ${f.dur}s ${f.delay}s linear infinite`, "--dx":`${f.dx}vw`}}>
          <div style={{animation:`nlSway ${rand(3,6).toFixed(1)}s ease-in-out infinite`,
            "--sway":`${f.dx > 0 ? 14 : -14}px`}}>
            {f.glyph
              ? <span style={{fontSize:f.size*3,lineHeight:1,opacity:f.opacity*0.7,color:"#fff"}}>❄</span>
              : <span style={{display:"block",width:f.size,height:f.size,borderRadius:"50%",
                  background:"#fff",opacity:f.opacity,boxShadow:"0 0 4px #fff6"}}/>}
          </div>
        </div>
      ))}
    </Scene>
  );
};

// ── Beach: parallax swells along the bottom ───────────────────────────────
const Waves = () => {
  // Tall enough that the swells still read above the chat bar at the bottom.
  const bands = [
    { fill:T.accent2, opacity:0.20, dur:19, height:190 },
    { fill:T.accent2, opacity:0.13, dur:27, height:230 },
    { fill:T.accent,  opacity:0.09, dur:37, height:270 },
  ];
  return (
    <Scene>
      {bands.map((b, i) => (
        <svg key={i} viewBox="0 0 720 120" preserveAspectRatio="none"
          style={{position:"absolute",left:0,bottom:0,width:"200%",height:b.height,
            opacity:b.opacity,animation:`nlWave ${b.dur}s linear infinite`}}>
          <path fill={b.fill} d="M0,60 C60,26 120,94 180,60 C240,26 300,94 360,60
            C420,26 480,94 540,60 C600,26 660,94 720,60 L720,120 L0,120 Z"/>
        </svg>
      ))}
    </Scene>
  );
};

// ── Galaxy: a twinkling field with the occasional comet ───────────────────
const Stars = () => {
  const stars = useMemo(() => Array.from({length:46}, () => ({
    left: rand(0, 100), top: rand(0, 100), size: rand(1, 2.8),
    dur: rand(2.5, 7), delay: rand(0, 6), lo: rand(0.08, 0.2), hi: rand(0.5, 0.95),
  })), []);
  const comets = useMemo(() => Array.from({length:3}, (_,i) => ({
    dur: rand(14, 22), delay: i * 7 + rand(0, 4), len: rand(90, 160),
  })), []);
  return (
    <Scene>
      {stars.map((s, i) => (
        <span key={i} style={{position:"absolute",left:`${s.left}%`,top:`${s.top}%`,
          width:s.size,height:s.size,borderRadius:"50%",background:"#fff",
          animation:`nlTwinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          "--lo":s.lo, "--hi":s.hi}}/>
      ))}
      {comets.map((c, i) => (
        <span key={`c${i}`} style={{position:"absolute",top:0,left:0,height:2,width:c.len,
          borderRadius:2,transformOrigin:"left center",
          background:`linear-gradient(90deg, transparent, ${T.accent2}, #fff)`,
          filter:`drop-shadow(0 0 5px ${T.accent2})`,
          animation:`nlComet ${c.dur}s ${c.delay}s linear infinite`}}/>
      ))}
    </Scene>
  );
};

// ── Neon: lasers cutting across the dark ──────────────────────────────────
const Lasers = () => {
  const beams = useMemo(() => Array.from({length:8}, (_,i) => ({
    top: rand(6, 94), dur: rand(4.5, 8), delay: i * 1.5 + rand(0, 1.5),
    color: i % 2 ? T.accent2 : T.accent, thickness: rand(1, 2.5), len: rand(22, 46),
  })), []);
  return (
    <Scene>
      {beams.map((b, i) => (
        <span key={i} style={{position:"absolute",top:`${b.top}%`,left:0,
          height:b.thickness,width:`${b.len}vw`,borderRadius:99,
          background:`linear-gradient(90deg, transparent, ${b.color} 55%, #fff)`,
          filter:`drop-shadow(0 0 6px ${b.color})`,opacity:0,
          animation:`nlLaser ${b.dur}s ${b.delay}s cubic-bezier(.25,.6,.3,1) infinite`}}/>
      ))}
    </Scene>
  );
};

// ── Sakura: petals tumbling down ──────────────────────────────────────────
const Petals = () => {
  const petals = useMemo(() => Array.from({length:24}, () => {
    const dur = rand(11, 22);
    return { left: rand(-2, 100), size: rand(6, 13), dur, delay: -rand(0, dur),
      dx: rand(-14, 14), spin: rand(220, 640), opacity: rand(0.3, 0.7),
      tone: Math.random() > 0.5 };
  }), []);
  return (
    <Scene>
      {petals.map((p, i) => (
        <div key={i} style={{position:"absolute",top:0,left:`${p.left}%`,
          animation:`nlFall ${p.dur}s ${p.delay}s linear infinite`,
          "--dx":`${p.dx}vw`, "--spin":`${p.spin}deg`}}>
          <span style={{display:"block",width:p.size,height:p.size*0.72,
            background:p.tone ? T.accent : T.accent2, opacity:p.opacity,
            borderRadius:"100% 0 100% 0",
            animation:`nlSway ${rand(3.5,7).toFixed(1)}s ease-in-out infinite`,
            "--sway":`${p.dx > 0 ? 16 : -16}px`}}/>
        </div>
      ))}
    </Scene>
  );
};

const SCENES = {
  halloween: Pumpkins,
  christmas: Snow,
  beach: Waves,
  galaxy: Stars,
  neon: Lasers,
  sakura: Petals,
};

export const ThemeScenery = ({ themeId, enabled = true }) => {
  const Chosen = enabled ? SCENES[themeId] : null;
  return Chosen ? <Chosen/> : null;
};
