// Ambient pumpkins tucked into the edges for the Halloween theme. Decoration
// only: low opacity, behind nothing interactive, and never tappable.
const SPOTS = [
  { top: "9%",  left: "-2%",  size: 34, rot: -14, delay: 0 },
  { top: "27%", right: "-3%", size: 26, rot: 12,  delay: 1.3 },
  { top: "52%", left: "-3%",  size: 22, rot: 8,   delay: 2.1 },
  { bottom: "22%", right: "-2%", size: 32, rot: -9, delay: 0.7 },
  { bottom: "6%",  left: "4%",  size: 20, rot: 16, delay: 1.8 },
  { top: "70%", right: "6%",  size: 18, rot: -6,  delay: 2.6 },
];

export const Pumpkins = () => (
  <>
    <style>{`
      @keyframes nlPumpkinBob {
        0%,100% { transform: translateY(0) rotate(var(--nl-pumpkin-rot,0deg)); }
        50%     { transform: translateY(-7px) rotate(calc(var(--nl-pumpkin-rot,0deg) + 3deg)); }
      }
      @media (prefers-reduced-motion: reduce) {
        .nl-pumpkin { animation: none !important; }
      }
    `}</style>
    <div aria-hidden="true" style={{position:"fixed",inset:0,pointerEvents:"none",
      zIndex:1,overflow:"hidden"}}>
      {SPOTS.map((s, i) => (
        <span key={i} className="nl-pumpkin" style={{
          position:"absolute", top:s.top, bottom:s.bottom, left:s.left, right:s.right,
          fontSize:s.size, lineHeight:1, opacity:0.16, filter:"saturate(1.2)",
          "--nl-pumpkin-rot":`${s.rot}deg`,
          animation:`nlPumpkinBob ${6 + (i % 3)}s ${s.delay}s ease-in-out infinite`,
        }}>🎃</span>
      ))}
    </div>
  </>
);
