import { useState } from "react";
import { T } from "../theme.js";

export const InfoDot = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={(e)=>{ e.stopPropagation(); setOpen(true); }}
        aria-label="More info"
        style={{display:"inline-flex",alignItems:"center",justifyContent:"center",
          width:18,height:18,borderRadius:"50%",border:`1px solid ${T.muted}`,
          background:"none",color:T.muted,fontSize:11,fontWeight:700,cursor:"pointer",
          marginLeft:6,padding:0,lineHeight:1,flexShrink:0,fontStyle:"italic",
          WebkitTapHighlightColor:"transparent",verticalAlign:"middle"}}>i</button>
      {open && (
        <div onClick={(e)=>{ e.stopPropagation(); setOpen(false); }}
          style={{position:"fixed",inset:0,background:T.overlay,zIndex:400,
            display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div onClick={(e)=>e.stopPropagation()}
            style={{background:T.surface,border:`1px solid ${T.accent}55`,borderRadius:16,
              padding:"18px 18px 16px",maxWidth:340,width:"100%",
              boxShadow:`0 8px 40px #000a`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{fontSize:15,fontWeight:800,color:T.accent,paddingRight:10}}>{title}</div>
              <button onClick={()=>setOpen(false)}
                style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
                  borderRadius:8,minWidth:32,minHeight:32,cursor:"pointer",fontSize:14,flexShrink:0,
                  WebkitTapHighlightColor:"transparent"}}>✕</button>
            </div>
            <div style={{fontSize:13,color:T.text,lineHeight:1.6}}>{children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export const Ring = ({value,max,color,label}) => {
  const r=34, c=2*Math.PI*r, pct=Math.min(value/max,1);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <svg width={84} height={84} style={{transform:"rotate(-90deg)"}}>
        <circle cx={42} cy={42} r={r} fill="none" stroke={T.border} strokeWidth={6}/>
        <circle cx={42} cy={42} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${pct*c} ${c}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray .6s cubic-bezier(.4,0,.2,1)"}}/>
        <text x={42} y={47} textAnchor="middle" fill={T.text} fontSize={13} fontWeight={700}
          style={{transform:"rotate(90deg)",transformOrigin:"42px 42px"}}>
          {Math.round(value)}
        </text>
      </svg>
      <span style={{fontSize:11,color:T.muted,letterSpacing:"0.08em"}}>{label}</span>
    </div>
  );
};

export const Bar = ({label,value,max,color,unit="g"}) => {
  const over=value>max, pct=Math.min(value/max*100,100);
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:13,color:T.muted,letterSpacing:"0.04em"}}>{label}</span>
        <span style={{fontSize:13,color:over?T.cal:color,fontWeight:700}}>
          {Math.round(value)}<span style={{color:T.muted,fontWeight:400}}>/{max}{unit}</span>
          {over&&" ▲"}
        </span>
      </div>
      <div style={{height:6,background:T.border,borderRadius:99}}>
        <div style={{height:"100%",width:`${pct}%`,background:over?T.cal:color,
          borderRadius:99,transition:"width .5s cubic-bezier(.4,0,.2,1)",
          boxShadow:`0 0 6px ${over?T.cal:color}88`}}/>
      </div>
    </div>
  );
};

export const Confetti = ({ big }) => {
  const colors = [T.accent, T.carbs, T.fat, T.info, "#a3e635", "#f472b6"];
  const count = big ? 80 : 28;
  const pieces = Array.from({length:count}).map((_,i)=>{
    const left = Math.random()*100;
    const delay = Math.random()*0.3;
    const dur = 1.6 + Math.random()*1.2;
    const size = 6 + Math.random()*6;
    const color = colors[i%colors.length];
    const rot = Math.random()*360;
    return (
      <div key={i} style={{position:"absolute",top:"-20px",left:`${left}%`,
        width:size,height:size*0.6,background:color,borderRadius:2,
        transform:`rotate(${rot}deg)`,
        animation:`confettiFall ${dur}s ${delay}s cubic-bezier(.3,.6,.5,1) forwards`}}/>
    );
  });
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:500,overflow:"hidden"}}>
      {pieces}
    </div>
  );
};

export const Toast = ({ text }) => (
  <div style={{position:"fixed",left:"50%",bottom:"22%",transform:"translateX(-50%)",
    background:T.gAccent,color:"#0b0f0b",fontWeight:800,fontSize:15,
    padding:"12px 20px",borderRadius:99,zIndex:510,maxWidth:"86%",textAlign:"center",
    boxShadow:`0 6px 24px ${T.accent}66`,animation:"toastPop .35s ease",pointerEvents:"none"}}>
    {text}
  </div>
);
