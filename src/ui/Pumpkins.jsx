// Ambient Halloween scenery. Decoration only: aria-hidden, never tappable, and
// still when the viewer prefers reduced motion. Three behaviours so the screen
// keeps moving without anything crossing the middle where content lives.
//
// bob    — jack-o'-lanterns rocking, with a candle flicker on the opacity
// drift  — ghosts and bats crossing slowly, fading in and back out
// dangle — a spider lowering on its thread and climbing back up
const CAST = [
  { e:"🎃", kind:"bob",    top:"8%",   left:"-2%",  size:36, rot:-14, dur:5.5, delay:0   },
  { e:"🎃", kind:"bob",    bottom:"20%", right:"-2%", size:33, rot:11,  dur:6.5, delay:0.9 },
  { e:"🎃", kind:"bob",    top:"55%",  left:"-3%",  size:24, rot:7,   dur:7.5, delay:2.2 },
  { e:"🕸️", kind:"bob",    top:"0%",   right:"0%",  size:42, rot:0,   dur:9,   delay:0.4 },
  { e:"👻", kind:"drift",  top:"22%",  size:28, dur:17, delay:1.5 },
  { e:"👻", kind:"drift",  top:"68%",  size:22, dur:23, delay:9   },
  { e:"🦇", kind:"drift",  top:"12%",  size:20, dur:13, delay:5   },
  { e:"🦇", kind:"drift",  top:"44%",  size:16, dur:19, delay:13  },
  { e:"🕷️", kind:"dangle", top:"0%",   left:"18%",  size:22, dur:11, delay:3   },
  { e:"🕷️", kind:"dangle", top:"0%",   right:"26%", size:17, dur:14, delay:8   },
];

export const Pumpkins = () => (
  <>
    <style>{`
      @keyframes nlBob {
        0%,100% { transform: translateY(0) rotate(var(--r,0deg)); }
        25%     { transform: translateY(-6px) rotate(calc(var(--r,0deg) + 5deg)); }
        75%     { transform: translateY(4px)  rotate(calc(var(--r,0deg) - 4deg)); }
      }
      @keyframes nlFlicker {
        0%,100% { opacity:.20; } 42% { opacity:.30; } 47% { opacity:.13; }
        58% { opacity:.28; } 63% { opacity:.17; } 80% { opacity:.26; }
      }
      @keyframes nlDrift {
        0%   { transform: translateX(-16vw) translateY(0)     scale(.85); opacity:0; }
        14%  { opacity:.22; }
        50%  { transform: translateX(46vw)  translateY(-16px) scale(1); }
        86%  { opacity:.22; }
        100% { transform: translateX(116vw) translateY(10px)  scale(.85); opacity:0; }
      }
      @keyframes nlDangle {
        0%,100% { transform: translateY(-14vh); }
        45%     { transform: translateY(12vh); }
        55%     { transform: translateY(12vh); }
      }
      @keyframes nlThread {
        0%,100% { height:14vh; } 45%,55% { height:40vh; }
      }
      @media (prefers-reduced-motion: reduce) {
        .nl-pumpkin, .nl-pumpkin > *, .nl-thread { animation: none !important; }
      }
    `}</style>
    <div aria-hidden="true" style={{position:"fixed",inset:0,pointerEvents:"none",
      zIndex:1,overflow:"hidden"}}>
      {CAST.map((c, i) => {
        const at = { top:c.top, bottom:c.bottom, left:c.left, right:c.right };
        if (c.kind === "drift") return (
          <span key={i} className="nl-pumpkin" style={{position:"absolute",...at,left:0,
            fontSize:c.size,lineHeight:1,opacity:0,
            animation:`nlDrift ${c.dur}s ${c.delay}s linear infinite`}}>{c.e}</span>
        );
        if (c.kind === "dangle") return (
          <div key={i} style={{position:"absolute",...at,display:"flex",flexDirection:"column",
            alignItems:"center"}}>
            <div className="nl-thread" style={{width:1,height:"14vh",opacity:0.12,
              background:"currentColor",
              animation:`nlThread ${c.dur}s ${c.delay}s ease-in-out infinite`}}/>
            <span className="nl-pumpkin" style={{fontSize:c.size,lineHeight:1,opacity:0.2,
              marginTop:-2,
              animation:`nlDangle ${c.dur}s ${c.delay}s ease-in-out infinite`}}>{c.e}</span>
          </div>
        );
        return (
          <span key={i} className="nl-pumpkin" style={{position:"absolute",...at,
            fontSize:c.size,lineHeight:1,filter:"saturate(1.25)",
            "--r":`${c.rot}deg`,
            animation:`nlBob ${c.dur}s ${c.delay}s ease-in-out infinite, `
              + `nlFlicker ${(c.dur*0.7).toFixed(1)}s ${c.delay}s ease-in-out infinite`}}>{c.e}</span>
        );
      })}
    </div>
  </>
);
