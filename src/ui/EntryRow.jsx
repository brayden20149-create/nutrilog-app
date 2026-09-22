import { useState, useRef } from "react";
import { haptic } from "../haptics.js";
import { dietValues } from "../nutrition.js";
import { T } from "../theme.js";
import { DietFields } from "./DietViews.jsx";

export const EntryRow = ({entry,onDelete,onEdit}) => {
  const [editing, setEditing] = useState(false);
  const [d, setD] = useState({name:entry.name,calories:entry.calories,protein:entry.protein,carbs:entry.carbs,fat:entry.fat});
  const set = (k,v)=>setD(p=>({...p,[k]:v}));
  const save = () => {
    onEdit(entry.id, {
      name:d.name.trim()||entry.name,
      ...dietValues(d),
      calories:+d.calories||0, protein:+d.protein||0, carbs:+d.carbs||0, fat:+d.fat||0,
    });
    setEditing(false);
  };
  const numF = {background:T.bg,border:`1px solid ${T.border}`,borderRadius:7,
    padding:"6px 4px",color:T.text,fontSize:15,textAlign:"center",width:"100%",outline:"none"};

  const [dragX, setDragX] = useState(0);
  const startX = useRef(0);
  const dragging = useRef(false);
  const onTS = (e)=>{ startX.current = e.touches[0].clientX; dragging.current = true; };
  const onTM = (e)=>{
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx < 0) setDragX(Math.max(dx, -120)); // only allow left drag
  };
  const onTE = ()=>{
    dragging.current = false;
    if (dragX < -70) { haptic(20); onDelete(entry.id); }
    else setDragX(0);
  };

  if (editing) {
    return (
      <div style={{padding:"12px 14px",background:T.card,borderRadius:12,
        border:`1px solid ${T.accent}66`,marginBottom:8}}>
        <input value={d.name} onChange={e=>set("name",e.target.value)}
          style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,
            padding:"9px 11px",color:T.text,fontSize:16,width:"100%",outline:"none",marginBottom:10}}/>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          {[["calories","cal",T.cal],["protein","P",T.protein],["carbs","C",T.carbs],["fat","F",T.fat]].map(([k,lbl,col])=>(
            <div key={k} style={{flex:1}}>
              <div style={{fontSize:9,color:col,textAlign:"center",marginBottom:3}}>{lbl}</div>
              <input type="number" inputMode="numeric" value={d[k]} onChange={e=>set(k,e.target.value)} style={numF}/>
            </div>
          ))}
        </div>
        <DietFields value={d} onChange={set}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setEditing(false)}
            style={{flex:1,background:"none",border:`1px solid ${T.border}`,color:T.muted,
              borderRadius:9,padding:"10px",cursor:"pointer",fontSize:13,minHeight:42,
              WebkitTapHighlightColor:"transparent"}}>Cancel</button>
          <button onClick={save}
            style={{flex:2,background:T.gAccent,border:"none",color:"#0b0f0b",
              borderRadius:9,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:700,minHeight:42,
              WebkitTapHighlightColor:"transparent"}}>Save</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{position:"relative",marginBottom:8,borderRadius:12,overflow:"hidden"}}>
      {/* Red delete backing revealed on swipe */}
      <div style={{position:"absolute",inset:0,background:T.cal,
        display:"flex",alignItems:"center",justifyContent:"flex-end",
        paddingRight:20,color:"#fff",fontWeight:700,fontSize:14}}>
        Delete
      </div>
      <div
        onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
        style={{display:"flex",alignItems:"center",
          padding:"12px 14px",background:T.card,
          border:`1px solid ${T.border}`,borderRadius:12,
          transform:`translateX(${dragX}px)`,
          transition:dragging.current?"none":"transform .2s",
          position:"relative"}}>
        <button onClick={()=>{ setD({...entry}); setEditing(true); }}
          style={{flex:1,minWidth:0,background:"none",border:"none",textAlign:"left",
            cursor:"pointer",padding:0,WebkitTapHighlightColor:"transparent"}}>
          <div style={{fontSize:14,color:T.text,fontWeight:600,marginBottom:4,
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
            display:"flex",alignItems:"center",gap:5}}>
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{entry.name}</span>
            {entry.confidence==="low" && (
              <span title="Estimated — portion or macros uncertain"
                style={{fontSize:9,color:T.warn,border:`1px solid ${T.warn}66`,
                  borderRadius:99,padding:"1px 6px",flexShrink:0,fontWeight:700}}>~est</span>
            )}
          </div>
          <div style={{display:"flex",gap:12}}>
            {[["cal",entry.calories,T.cal],["P",entry.protein,T.protein],
              ["C",entry.carbs,T.carbs],["F",entry.fat,T.fat]].map(([l,v,col])=>(
              <span key={l} style={{fontSize:12}}>
                <span style={{color:col}}>{Math.round(v)}</span>
                <span style={{color:T.muted}}>{l}</span>
              </span>
            ))}
          </div>
        </button>
        <button onClick={()=>{ haptic(20); onDelete(entry.id); }}
          style={{background:"none",border:"none",color:T.muted,cursor:"pointer",
            fontSize:20,minWidth:44,minHeight:44,display:"flex",alignItems:"center",
            justifyContent:"center",borderRadius:10,WebkitTapHighlightColor:"transparent",
            flexShrink:0,transition:"color .15s"}}
          onTouchStart={e=>e.currentTarget.style.color=T.cal}
          onTouchEnd={e=>e.currentTarget.style.color=T.muted}>×</button>
      </div>
    </div>
  );
};
