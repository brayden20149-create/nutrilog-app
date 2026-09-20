import {useEffect,useRef,useState} from "react";
import {muscleTrends,muscleGroup,MUSCLE_GROUPS,exerciseSessions} from "./muscleTrends.js";

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


function InsightPopup({title,onClose,children,T}) {
 const box=useRef(null);
 useEffect(()=>{
  const previous=document.activeElement;
  box.current?.querySelector("button")?.focus();
  const key=e=>{
   if(e.key==="Escape")onClose();
   if(e.key==="Tab"){
    const items=[...box.current.querySelectorAll("button,select,input,[tabindex='0']")].filter(e=>!e.disabled);
    const first=items[0],last=items[items.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
   }
  };
  document.addEventListener("keydown",key);
  return()=>{document.removeEventListener("keydown",key);previous?.focus();};
 },[]);
 return <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:570,background:T.overlay,display:"flex",alignItems:"center",justifyContent:"center",padding:"max(env(safe-area-inset-top),16px) 16px max(env(safe-area-inset-bottom),16px)"}}>
 <div ref={box} role="dialog" aria-modal="true" aria-label={title} onClick={e=>e.stopPropagation()} style={{background:T.surface,color:T.text,border:`1px solid ${T.border}`,borderRadius:16,width:"100%",maxWidth:400,maxHeight:"78dvh",overflowY:"auto",padding:14}}>
 <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:8}}><strong style={{fontSize:16}}>{title}</strong><button aria-label="Close details" onClick={onClose} style={{background:"none",border:0,color:T.text,fontSize:20,minWidth:44,minHeight:44}}>×</button></div>
 {children}</div></div>;
}
export function MuscleInsights({workouts,today,settings,onSet,T}) {
 const [view,setView]=useState(null);
 const [exercise,setExercise]=useState("");
 const [session,setSession]=useState("");
 const overrides=settings.muscleGroups||{};
 const data=muscleTrends(workouts,today,overrides);
 const max=Math.max(1,...data.groups.map(g=>g.sets));
 const chip={fontSize:11,padding:"3px 6px",borderRadius:6,background:T.bg,color:T.muted,whiteSpace:"nowrap"};
 const row={width:"100%",textAlign:"left",background:T.card,border:0,borderRadius:9,color:T.text,cursor:"pointer",padding:"9px 10px",marginBottom:5};
 const select={fontSize:16,background:T.bg,color:T.text,border:`1px solid ${T.border}`,borderRadius:8,padding:8,width:"100%",minWidth:0};
 const open=v=>{setView(v);setExercise("");setSession("");};
 const group=data.groups.find(g=>g.group===view?.group);
 const sessions=exercise?exerciseSessions(workouts,exercise,today):[];
 const chosen=sessions.find(s=>s.day===session)||sessions[0];
 const showSets=sets=><div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:7,marginTop:12}}>
  {sets.map((s,i)=><div key={s.id??i} style={{padding:10,borderRadius:9,background:T.card}}>
   <div style={{fontSize:10,color:T.muted,marginBottom:4}}>SET {i+1}</div>
   <div style={{fontSize:14,fontWeight:600,overflowWrap:"anywhere"}}>{s.detail || "No details recorded"}</div>
  </div>)}
 </div>;
 return <details style={{marginBottom:12,border:`1px solid ${T.border}`,borderRadius:12,background:T.surface}}>
 <summary style={{padding:"10px 12px",fontSize:13,color:T.accent,cursor:"pointer"}}>Muscle groups & workout trends</summary>
 <div style={{padding:"0 10px 10px"}}>
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
 <span style={{fontSize:11,color:T.muted}}>14 days · ranked by sets</span>
 <button aria-label="Explain muscle trends" onClick={()=>open({type:"info"})} style={{background:"none",border:0,color:T.muted,minWidth:32,minHeight:32}}>ⓘ</button>
 </div>
 {data.groups.length===0?<p style={{fontSize:13}}>Log strength sets to see trends.</p>:data.groups.map((g,i)=><button key={g.group} onClick={()=>open({type:"group",group:g.group})} style={row} aria-label={`View ${g.group} exercises and weights`}>
 <div style={{display:"flex",alignItems:"center",gap:6}}>
 <span style={{fontSize:10,color:T.muted,width:12}}>{i+1}</span>
 <strong style={{flex:1,fontSize:13}}>{g.group}</strong>
 <span style={chip}>{g.sets} sets</span><span style={chip}>{g.days}d</span>
 <span style={{...chip,color:T.accent,minWidth:44,textAlign:"right"}}>{g.delta===null?"—":`${g.delta>0?"+":""}${g.delta}%`}</span>
 <span style={{color:T.muted,fontSize:14}}>›</span>
 </div>
 <div aria-hidden="true" style={{height:3,background:T.border,borderRadius:4,marginTop:7}}><div style={{height:"100%",width:`${g.sets/max*100}%`,background:T.accent,borderRadius:4}}/></div>
 </button>)}
 <div style={{display:"flex",gap:12,marginTop:8}}>
 {[["days","📅 Workout days"],["edit","✎ Groups"]].map(([type,label])=><button key={type} onClick={()=>open({type})} style={{background:"none",border:0,color:T.muted,fontSize:12,padding:"8px 2px",cursor:"pointer"}}>{label}</button>)}
 </div>
 </div>
 {view && <InsightPopup title={view.type==="group"?view.group:view.type==="days"?"Workout days":view.type==="edit"?"Exercise groups":"About these trends"} onClose={()=>setView(null)} T={T}>
 {view.type==="info" && <p style={{fontSize:13,lineHeight:1.6,color:T.muted}}>Last 14 days versus the previous 14, through {today}. Bars show relative logged sets; percentages show set-count changes. These rank logged activity, not growth or workout quality. Today may be incomplete. Each row counts as one set, assigned to one estimated primary muscle group.</p>}
 {view.type==="group" && <>
 <div style={{display:"flex",gap:6,marginBottom:12}}><span style={chip}>{group?.sets??0} sets now</span><span style={chip}>{group?.previousSets??0} earlier</span><span style={chip}>{group?.days??0} days</span></div>
 {!exercise ? <>
 <p style={{fontSize:12,color:T.muted,marginBottom:10}}>Tap an exercise for weights & reps.</p>
 {(group?.exercises||[]).map(name=>{const recent=exerciseSessions(workouts,name,today)[0];return <button key={name} onClick={()=>{setExercise(name);setSession("");}} style={row}>
 <div style={{fontSize:13,fontWeight:600}}>{name} <span style={{float:"right",color:T.muted}}>›</span></div>
 <div style={{fontSize:11,color:T.muted,marginTop:4}}>{recent?.day} · {recent?.sets.length} sets</div>
 </button>;})}
 {!group?.exercises.length && <p style={{fontSize:13,color:T.muted}}>No exercises logged in this group during the current 14-day window.</p>}
 </> : <>
 <button onClick={()=>setExercise("")} style={{background:"none",border:0,color:T.accent,fontSize:12,padding:"8px 0"}}>‹ Exercises</button>
 <h3 style={{fontSize:15,marginBottom:10}}>{exercise}</h3>
 <label style={{display:"block",fontSize:12,color:T.muted}}>Workout date
 <select aria-label="Exercise workout date" value={chosen?.day||""} onChange={e=>setSession(e.target.value)} style={{...select,marginTop:5}}>
 {sessions.map(s=><option key={s.day} value={s.day}>{s.day} · {s.sets.length} sets</option>)}
 </select></label>
 {chosen && showSets(chosen.sets)}
 <p style={{fontSize:11,color:T.muted,marginTop:10}}>Exact recorded weights and reps. Dates include all available history through {today}.</p>
 </>}
 </>}
 {view.type==="days" && <>
 <select aria-label="Workout day" value={session||data.days[0]?.day||""} onChange={e=>{setSession(e.target.value);setExercise("");}} style={select}>
 {data.days.map(d=><option key={d.day} value={d.day}>{d.day} · {d.sets} sets</option>)}
 </select>
 {(()=>{const day=session||data.days[0]?.day;const entries=workouts[day]||[];const names=[...new Set(entries.map(e=>e.name))];return <>
 <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:12}}>{names.map(name=><button key={name} onClick={()=>setExercise(name)} style={{...chip,border:`1px solid ${exercise===name?T.accent:T.border}`,color:exercise===name?T.accent:T.text,cursor:"pointer",padding:8}}>{name}</button>)}</div>
 {exercise ? showSets(entries.filter(e=>e.name===exercise)):<p style={{fontSize:12,color:T.muted,marginTop:10}}>Select an exercise to see each set.</p>}
 </>;})()}
 </>}
 {view.type==="edit" && data.exercises.map(name=><label key={name} style={{display:"flex",alignItems:"center",gap:8,justifyContent:"space-between",marginBottom:10,fontSize:12}}><span>{name}</span><select aria-label={`Muscle group for ${name}`} value={muscleGroup(name,overrides)} onChange={e=>onSet("muscleGroups",{...overrides,[name]:e.target.value})} style={{...select,width:"45%"}}>{MUSCLE_GROUPS.map(g=><option key={g}>{g}</option>)}</select></label>)}
 </InsightPopup>}
 </details>;
}
