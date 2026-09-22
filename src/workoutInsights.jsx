import {createPortal} from "react-dom";
import {exerciseNameKey,exerciseKey,uniqueExerciseNames} from "./exerciseIdentity.js";
import {useEffect,useRef,useState} from "react";
import {muscleTrends,muscleGroup,MUSCLE_GROUPS,exerciseSessions} from "./muscleTrends.js";

export function VolumeComparison({detail,onClose,T}) {
 const close=useRef(null);
 useEffect(()=>{const previous=document.activeElement;close.current?.focus();const key=e=>{if(e.key==="Escape")onClose();if(e.key==="Tab"){e.preventDefault();close.current?.focus();}};document.addEventListener("keydown",key);return()=>{document.removeEventListener("keydown",key);previous?.focus();};},[]);
 const prev=detail.comparison;
 const up=detail.volDelta>0;
 const tone=detail.volDelta===0?T.muted:up?T.accent:T.cal;
 const peak=Math.max(detail.volume,prev.volume,1);
 const unreadable=[...detail.sets,...prev.sets].some(s=>!s.parsed);
 const session=(label,day,sets,volume,bar)=><div style={{padding:"12px 0",borderTop:`1px solid ${T.border}`}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8}}>
   <span style={{fontSize:10,letterSpacing:".07em",color:T.muted}}>{label}</span>
   <span style={{fontSize:11,color:T.muted}}>{day}</span>
  </div>
  <div style={{display:"flex",alignItems:"baseline",gap:5,margin:"5px 0 7px"}}>
   <strong style={{fontSize:21,color:bar}}>{volume.toLocaleString()}</strong>
   <span style={{fontSize:11,color:T.muted}}>lb·reps</span>
  </div>
  <div aria-hidden="true" style={{height:5,background:T.border,borderRadius:99,overflow:"hidden"}}>
   <div style={{height:"100%",width:`${volume/peak*100}%`,background:bar,borderRadius:99}}/>
  </div>
  <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:9}}>
   {sets.map((s,j)=><span key={j} style={{fontSize:11,padding:"4px 8px",borderRadius:7,background:T.card,color:s.parsed?T.text:T.muted,opacity:s.parsed?1:.55}}>
    {s.detail||"—"}{s.parsed&&<span style={{color:T.muted}}> · {s.parsed.volume.toLocaleString()}</span>}
   </span>)}
  </div>
 </div>;
 return createPortal(<div onTouchStart={e=>e.stopPropagation()} onTouchEnd={e=>e.stopPropagation()} onClick={onClose} style={{position:"fixed",inset:0,zIndex:10000,fontFamily:"-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif",background:T.overlay,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
 <div role="dialog" aria-modal="true" aria-label="Workout volume comparison" onClick={e=>e.stopPropagation()} style={{background:T.surface,color:T.text,border:`1px solid ${T.border}`,borderRadius:14,padding:16,width:"100%",maxWidth:360,maxHeight:"75dvh",overflowY:"auto"}}>
 <div style={{display:"flex",alignItems:"center",gap:8}}>
  <div style={{flex:1,minWidth:0}}>
   <div style={{fontSize:15,fontWeight:700,overflowWrap:"anywhere"}}>{detail.name}</div>
   <div style={{fontSize:11,color:T.muted,marginTop:2}}>volume vs {prev.day}</div>
  </div>
  <span style={{fontSize:17,fontWeight:800,color:tone,background:`${tone}1a`,border:`1px solid ${tone}44`,borderRadius:9,padding:"5px 9px",whiteSpace:"nowrap"}}>{up?"+":""}{detail.volDelta}%</span>
  <button ref={close} aria-label="Close comparison" onClick={onClose} style={{background:"none",border:0,color:T.muted,minHeight:44,minWidth:36,fontSize:20}}>×</button>
 </div>
 {session("THIS SESSION",detail.day,detail.sets,detail.volume,tone)}
 {session("PREVIOUS",prev.day,prev.sets,prev.volume,T.muted)}
 {unreadable&&<p style={{fontSize:11,color:T.muted,marginTop:2}}>Faded sets could not be read and are excluded from volume.</p>}
 <details style={{marginTop:10,borderTop:`1px solid ${T.border}`,paddingTop:8}}>
  <summary style={{fontSize:12,color:T.muted,cursor:"pointer",padding:"4px 0"}}>How this is calculated</summary>
  <p style={{fontSize:12,lineHeight:1.5,marginTop:6}}>Volume is the sum of weight × reps as logged. ({detail.volume.toLocaleString()} − {prev.volume.toLocaleString()}) ÷ {prev.volume.toLocaleString()} × 100 = {detail.volDelta}%.</p>
  <p style={{fontSize:12,lineHeight:1.5,color:T.muted,marginTop:8}}>Compared with the most recent earlier session with a matching exercise name. An unfinished session or a different set count can lower this number; it is not a strength-loss score.</p>
 </details>
 </div></div>,document.body);
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
 return createPortal(<div onTouchStart={e=>e.stopPropagation()} onTouchEnd={e=>e.stopPropagation()} onClick={onClose} style={{position:"fixed",inset:0,zIndex:10000,fontFamily:"-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif",background:T.overlay,display:"flex",alignItems:"center",justifyContent:"center",padding:"max(env(safe-area-inset-top),16px) 16px max(env(safe-area-inset-bottom),16px)"}}>
 <div ref={box} role="dialog" aria-modal="true" aria-label={title} onClick={e=>e.stopPropagation()} style={{background:T.surface,color:T.text,border:`1px solid ${T.border}`,borderRadius:16,width:"100%",maxWidth:400,maxHeight:"78dvh",overflowY:"auto",padding:14}}>
 <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:8,position:"sticky",top:-14,background:T.surface,zIndex:1}}><strong style={{fontSize:16}}>{title}</strong><button aria-label="Close details" onClick={onClose} style={{background:"none",border:0,color:T.text,fontSize:20,minWidth:44,minHeight:44}}>×</button></div>
 {children}</div></div>,document.body);
}
export function MuscleInsights({workouts,today,settings,onSet,T}) {
 const [view,setView]=useState(null);
 const [exercise,setExercise]=useState("");
 const [session,setSession]=useState("");
 const overrides=settings.muscleGroups||{};
 const aliases=settings.exerciseAliases||{};
 const data=muscleTrends(workouts,today,overrides,aliases);
 const max=Math.max(1,...data.groups.map(g=>g.sets));
 const chip={fontSize:11,padding:"3px 6px",borderRadius:6,background:T.bg,color:T.muted,whiteSpace:"nowrap"};
 const row={width:"100%",textAlign:"left",background:T.card,border:0,borderRadius:9,color:T.text,cursor:"pointer",padding:"9px 10px",marginBottom:5};
 const select={fontSize:16,background:T.bg,color:T.text,border:`1px solid ${T.border}`,borderRadius:8,padding:8,width:"100%",minWidth:0};
 const open=v=>{setView(v);setExercise("");setSession("");};
 const group=data.groups.find(g=>g.group===view?.group);
 const sessions=exercise?exerciseSessions(workouts,exercise,today,aliases):[];
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
 {view.type==="info" && <>
 {[["Window",`Last 14 days vs the previous 14, through ${today}`],["Bars","Logged sets, relative to your top group"],["Percentages","Change in set count between the two windows"],["Each row","One set, assigned to one estimated primary muscle group"]].map(([k,v])=><div key={k} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
  <span style={{fontSize:12,color:T.accent,width:88,flexShrink:0}}>{k}</span>
  <span style={{fontSize:12,lineHeight:1.45}}>{v}</span>
 </div>)}
 <p style={{fontSize:11,lineHeight:1.5,color:T.muted,marginTop:10}}>This ranks logged activity — not growth, strength or workout quality. Today may still be incomplete.</p>
 </>}
 {view.type==="group" && <>
 <div style={{display:"flex",gap:6,marginBottom:12}}><span style={chip}>{group?.sets??0} sets now</span><span style={chip}>{group?.previousSets??0} earlier</span><span style={chip}>{group?.days??0} days</span></div>
 {!exercise ? <>
 <p style={{fontSize:12,color:T.muted,marginBottom:10}}>Tap an exercise for weights & reps.</p>
 {(group?.exercises||[]).map(name=>{const recent=exerciseSessions(workouts,name,today,aliases)[0];return <button key={name} onClick={()=>{setExercise(name);setSession("");}} style={row}>
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
 {(()=>{const day=session||data.days[0]?.day;const entries=workouts[day]||[];const names=uniqueExerciseNames(entries.map(e=>e.name),aliases);return <>
 <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:12}}>{names.map(name=><button key={name} onClick={()=>setExercise(name)} style={{...chip,border:`1px solid ${exercise===name?T.accent:T.border}`,color:exercise===name?T.accent:T.text,cursor:"pointer",padding:8}}>{name}</button>)}</div>
 {exercise ? showSets(entries.filter(e=>exerciseKey(e.name,aliases)===exerciseKey(exercise,aliases))):<p style={{fontSize:12,color:T.muted,marginTop:10}}>Select an exercise to see each set.</p>}
 </>;})()}
 </>}
 {view.type==="edit" && <>
 <details style={{marginBottom:16}}><summary style={{fontSize:13,color:T.accent,cursor:"pointer",padding:"8px 0"}}>Combine exercise names</summary>
 <p style={{fontSize:12,color:T.muted,marginBottom:10}}>Choose the same history for names you consider equivalent. Original logs and all sets are preserved. Choose “Keep separate” to undo a manual link.</p>
 {data.exercises.map(name=><label key={name} style={{display:"block",fontSize:12,marginBottom:12}}>{name}<select aria-label={`History for ${name}`} value={aliases[name]||""} onChange={e=>{const next={...aliases};if(e.target.value)next[name]=e.target.value;else delete next[name];onSet("exerciseAliases",next);}} style={{...select,marginTop:4}}><option value="">Keep separate (automatic wording matches still apply)</option>{uniqueExerciseNames(data.exercises).map(target=><option key={target} value={exerciseNameKey(target)}>{target}</option>)}</select></label>)}
 </details>
 {data.exercises.map(name=><label key={name} style={{display:"flex",alignItems:"center",gap:8,justifyContent:"space-between",marginBottom:10,fontSize:12}}><span>{name}</span><select aria-label={`Muscle group for ${name}`} value={muscleGroup(name,overrides)} onChange={e=>onSet("muscleGroups",{...overrides,[name]:e.target.value})} style={{...select,width:"45%"}}>{MUSCLE_GROUPS.map(g=><option key={g}>{g}</option>)}</select></label>)}
 </>}
 </InsightPopup>}
 </details>;
}
