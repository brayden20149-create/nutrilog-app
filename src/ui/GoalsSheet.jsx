import { useState } from "react";
import { PRESETS } from "../storage.js";
import { T } from "../theme.js";

export const GoalsSheet = ({goals,onSave,onClose}) => {
  const [g,setG] = useState({...goals});
  const set = (k,v) => setG(p=>({...p,[k]:v}));
  const total = g.protein*4+g.carbs*4+g.fat*9||1;
  const pp=Math.round(g.protein*4/total*100), cp=Math.round(g.carbs*4/total*100), fp=Math.round(g.fat*9/total*100);
  return (
    <div style={{position:"fixed",inset:0,background:T.overlay,zIndex:300,
      display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:T.surface,borderRadius:"20px 20px 0 0",
          width:"100%",maxHeight:"90vh",overflowY:"auto",
          padding:"0 18px env(safe-area-inset-bottom,20px)",
          border:`1px solid ${T.border}`,borderBottom:"none"}}>
        <div style={{width:36,height:4,background:T.border,borderRadius:2,margin:"14px auto 18px"}}/>
        <div style={{fontSize:11,color:T.accent,letterSpacing:"0.15em",marginBottom:2}}>CUSTOMIZE</div>
        <div style={{fontSize:22,fontWeight:800,marginBottom:18}}>Daily Goals</div>

        {/* Presets */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:T.muted,letterSpacing:"0.1em",marginBottom:10}}>QUICK PRESETS</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {PRESETS.map(p=>(
              <button key={p.name} onClick={()=>setG(prev=>({...prev,...p}))}
                style={{background:T.card,border:`1px solid ${T.border}`,color:T.text,
                  borderRadius:20,padding:"8px 14px",cursor:"pointer",fontSize:13,
                  minHeight:40,WebkitTapHighlightColor:"transparent"}}>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {[{k:"calories",label:"Calories",unit:"kcal",col:T.cal,min:500,max:5000,step:50},
          {k:"protein",label:"Protein",unit:"g",col:T.protein,min:20,max:400,step:5},
          {k:"carbs",label:"Carbs",unit:"g",col:T.carbs,min:20,max:600,step:5},
          {k:"fat",label:"Fat",unit:"g",col:T.fat,min:10,max:250,step:5},
        ].map(({k,label,unit,col,min,max,step})=>(
          <div key={k} style={{marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:14,color:col}}>{label}</span>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <input type="number" value={g[k]}
                  onChange={e=>set(k,Math.max(min,Math.min(max,+e.target.value)))}
                  inputMode="numeric"
                  style={{width:76,background:T.card,border:`1px solid ${T.border}`,
                    borderRadius:8,padding:"6px 8px",color:col,fontSize:16,
                    fontWeight:700,textAlign:"center",outline:"none"}}/>
                <span style={{fontSize:12,color:T.muted}}>{unit}</span>
              </div>
            </div>
            <input type="range" min={min} max={max} step={step} value={g[k]}
              onChange={e=>set(k,+e.target.value)}
              style={{width:"100%",accentColor:col,cursor:"pointer",height:6,touchAction:"pan-y"}}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
              <span style={{fontSize:10,color:T.muted}}>{min}</span>
              <span style={{fontSize:10,color:T.muted}}>{max}</span>
            </div>
          </div>
        ))}

        {/* Ratio bar */}
        <div style={{background:T.card,borderRadius:12,padding:"12px 14px",marginBottom:20,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:11,color:T.muted,letterSpacing:"0.1em",marginBottom:9}}>MACRO SPLIT</div>
          <div style={{display:"flex",height:10,borderRadius:99,overflow:"hidden",marginBottom:8,gap:2}}>
            <div style={{width:`${pp}%`,background:T.protein,transition:"width .3s",borderRadius:99}}/>
            <div style={{width:`${cp}%`,background:T.carbs,  transition:"width .3s",borderRadius:99}}/>
            <div style={{width:`${fp}%`,background:T.fat,    transition:"width .3s",borderRadius:99}}/>
          </div>
          <div style={{display:"flex",gap:14}}>
            {[[`P ${pp}%`,T.protein],[`C ${cp}%`,T.carbs],[`F ${fp}%`,T.fat]].map(([l,c])=>(
              <span key={l} style={{fontSize:12,color:c}}>{l}</span>
            ))}
            <span style={{fontSize:12,color:T.muted,marginLeft:"auto"}}>~{g.protein*4+g.carbs*4+g.fat*9} kcal</span>
          </div>
        </div>

        <div style={{display:"flex",gap:10,paddingBottom:16}}>
          <button onClick={onClose}
            style={{flex:1,background:"none",border:`1px solid ${T.border}`,color:T.muted,
              borderRadius:12,padding:"14px",cursor:"pointer",fontSize:15,minHeight:52,
              WebkitTapHighlightColor:"transparent"}}>Cancel</button>
          <button onClick={()=>{onSave(g);onClose();}}
            style={{flex:2,background:T.accent,border:"none",color:"#0b0f0b",
              borderRadius:12,padding:"14px",cursor:"pointer",fontSize:15,fontWeight:700,
              minHeight:52,WebkitTapHighlightColor:"transparent"}}>Save Goals</button>
        </div>
      </div>
    </div>
  );
};
