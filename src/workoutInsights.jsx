import {useEffect,useRef} from "react";
import {muscleTrends,muscleGroup,MUSCLE_GROUPS} from "./muscleTrends.js";

export function VolumeComparison({detail,onClose,T}) {
 const close=useRef(null);
 useEffect(()=>{const previous=document.activeElement;close.current?.focus();const key=e=>{if(e.key==="Escape")onClose();if(e.key==="Tab"){e.preventDefault();close.current?.focus();}};document.addEventListener("keydown",key);return()=>{document.removeEventListener("keydown",key);previous?.focus();};},[]);
 const prev=detail.comparison;
 return <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:570,background:T.overlay,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
 <div role="dialog" aria-modal="true" aria-label="Workout volume comparison" onClick={e=>e.stopPropagation()} style={{background:T.surface,color:T.text,border:`1px solid ${T.border}`,borderRadius:14,padding:16,width:"100%",maxWidth:360,maxHeight:"75dvh",overflowY:"auto"}}>
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}><strong>{detail.name} · {detail.volDelta>0?"+":""}{detail.volDelta}%</strong><button ref={close} aria-label="Close comparison" onClick={onClose} style={{background:"none",border:0,color:T.text,minHeight:44,minWidth:44,fontSize:18}}>×</button></div>
 {[[detail.day,detail.name,detail.sets,detail.volume],[prev.day,prev.name,prev.sets,prev.volume]].map(([day,name,sets,volume],i)=><div key={i} style={{padding:"10px 0",borderTop:`1px solid ${T.border}`}}>
 <div style={{fontSize:13,color:T.accent}}>{i?"Previous matching session":"Selected session"} · {day}</div>
 <div style={{fontSize:13,margin:"4px 0"}}>{name} · {volume.toLocaleString()} lb·reps</div>
 {sets.map((s,j)=><div key={j} style={{fontSize:13,color:T.muted}}>Set {j+1}: {s.detail}{s.parsed ? ` = ${s.parsed.volume.toLocaleString()}`:" · excluded from volume (unreadable)"}</div>)}
 </div>)}
 <p style={{fontSize:12,lineHeight:1.5}}>Volume = sum of weight × reps as logged. ({detail.volume.toLocaleString()} − {prev.volume.toLocaleString()}) ÷ {prev.volume.toLocaleString()} × 100 = {detail.volDelta}%.</p>
 <p style={{fontSize:12,lineHeight:1.5,color:T.muted,marginTop:8}}>Compared with the most recent earlier session with a matching exercise name. An unfinished session or different set count can lower this number; it is not a strength-loss score.</p>
 </div></div>;
}

export function MuscleInsights({workouts,today,settings,onSet,T}) {
 const overrides=settings.muscleGroups||{};
 const data=muscleTrends(workouts,today,overrides);
 return <details style={{marginBottom:12,border:`1px solid ${T.border}`,borderRadius:12,background:T.surface}}>
 <summary style={{padding:"10px 12px",fontSize:13,color:T.accent,cursor:"pointer"}}>Muscle groups & workout trends</summary>
 <div style={{padding:"0 12px 12px"}}>
 <p style={{fontSize:12,color:T.muted,marginBottom:12}}>Last 14 days vs the previous 14, through {today}. Ranked by logged sets, not muscle growth or workout quality. Today may be incomplete.</p>
 {data.groups.length===0?<p style={{fontSize:13}}>Log strength sets to see trends.</p>:data.groups.map((g,i)=><details key={g.group} style={{borderTop:`1px solid ${T.border}`}}>
 <summary style={{padding:"10px 0",fontSize:13,cursor:"pointer"}}>{i+1}. {g.group} · {g.sets} sets · {g.days} days · {g.delta===null?"No earlier baseline":`${g.delta>0?"+":""}${g.delta}% sets`}</summary>
 <p style={{fontSize:12,color:T.muted,marginBottom:10}}>{g.sets} sets now vs {g.previousSets} earlier. {g.exercises.join(", ") || "No recent exercises"}</p>
 </details>)}
 <details style={{marginTop:10}}><summary style={{fontSize:13,cursor:"pointer",padding:"8px 0"}}>Workout days · most logged sets</summary>
 {data.days.slice(0,14).map(d=><div key={d.day} style={{fontSize:12,padding:"7px 0"}}>{d.day} · {d.sets} sets<br/><span style={{color:T.muted}}>{Object.entries(d.groups).map(([g,n])=>`${g} ${n}`).join(" · ")}</span></div>)}
 </details>
 <details style={{marginTop:10}}><summary style={{fontSize:13,cursor:"pointer",padding:"8px 0"}}>Edit exercise groups</summary>
 <p style={{fontSize:12,color:T.muted,marginBottom:8}}>Automatic primary-group estimates. Compound lifts count once; secondary muscle work is not included. Each logged row counts as one set.</p>
 {data.exercises.map(name=><label key={name} style={{display:"flex",alignItems:"center",gap:8,justifyContent:"space-between",marginBottom:8,fontSize:12}}><span>{name}</span><select aria-label={`Muscle group for ${name}`} value={muscleGroup(name,overrides)} onChange={e=>onSet("muscleGroups",{...overrides,[name]:e.target.value})} style={{fontSize:16,background:T.bg,color:T.text,border:`1px solid ${T.border}`,borderRadius:6,padding:5,maxWidth:"48%"}}>{MUSCLE_GROUPS.map(g=><option key={g}>{g}</option>)}</select></label>)}
 </details>
 </div></details>;
}
