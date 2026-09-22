import { useState } from "react";
import { T } from "../theme.js";

// ── Programs tab ──────────────────────────────────────────────────────────────
export const ProgramsTab = ({ programs, activeProgId, onSave, onSetActive, onDelete, onLogDay }) => {
  const [view, setView] = useState("list");      // list | program | day
  const [selProg, setSelProg] = useState(null);
  const [selDay,  setSelDay]  = useState(null);
  const [openDay, setOpenDay] = useState(null);  // expanded day id in program view
  const [editing, setEditing] = useState(false); // editing a program
  const [draft,   setDraft]   = useState(null);  // draft program being built/edited

  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

  // ── Draft helpers ──
  const startNew = () => {
    setDraft({ id:newId(), name:"", days:[], active:false });
    setEditing(true);
    setView("edit");
  };
  const editProg = (p) => {
    setDraft(JSON.parse(JSON.stringify(p))); // deep copy
    setEditing(true);
    setView("edit");
  };
  const saveDraft = () => {
    if (!draft.name.trim()) return;
    onSave(draft);
    setView("list");
    setDraft(null);
  };
  const addDay = () => setDraft(d=>({...d, days:[...d.days,{id:newId(),name:"",exercises:[]}]}));
  const removeDay = (did) => setDraft(d=>({...d,days:d.days.filter(dy=>dy.id!==did)}));
  const setDayName = (did,v) => setDraft(d=>({...d,days:d.days.map(dy=>dy.id===did?{...dy,name:v}:dy)}));
  const addExercise = (did) => setDraft(d=>({...d,days:d.days.map(dy=>dy.id===did?{...dy,exercises:[...dy.exercises,{id:newId(),name:"",sets:[{id:newId(),reps:"",weight:""}],notes:""}]}:dy)}));
  const removeExercise = (did,eid) => setDraft(d=>({...d,days:d.days.map(dy=>dy.id===did?{...dy,exercises:dy.exercises.filter(e=>e.id!==eid)}:dy)}));
  const setExField = (did,eid,key,val) => setDraft(d=>({...d,days:d.days.map(dy=>dy.id===did?{...dy,exercises:dy.exercises.map(e=>e.id===eid?{...e,[key]:val}:e)}:dy)}));
  const addSet = (did,eid) => setDraft(d=>({...d,days:d.days.map(dy=>dy.id===did?{...dy,exercises:dy.exercises.map(e=>{
    if (e.id!==eid) return e;
    const sets = e.sets||[];
    const last = sets[sets.length-1];
    // New set copies the previous set's weight/reps as a starting point
    return {...e, sets:[...sets, {id:newId(), reps:last?.reps||"", weight:last?.weight||""}]};
  })}:dy)}));
  const removeSet = (did,eid,sid) => setDraft(d=>({...d,days:d.days.map(dy=>dy.id===did?{...dy,exercises:dy.exercises.map(e=>e.id===eid?{...e,sets:e.sets.filter(s=>s.id!==sid)}:e)}:dy)}));
  const setSetField = (did,eid,sid,key,val) => setDraft(d=>({...d,days:d.days.map(dy=>dy.id===did?{...dy,exercises:dy.exercises.map(e=>e.id===eid?{...e,sets:e.sets.map(s=>s.id===sid?{...s,[key]:val}:s)}:e)}:dy)}));

  const field = {background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,
    padding:"9px 12px",color:T.text,fontSize:14,outline:"none",width:"100%"};
  const smallField = {...field, fontSize:13, padding:"7px 10px"};

  // ── LIST VIEW ──
  if (view==="list") return (
    <div style={{flex:1,overflowY:"auto",padding:"12px 14px",WebkitOverflowScrolling:"touch"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:18,fontWeight:800}}>Programs</div>
          <div style={{fontSize:12,color:T.muted}}>Your saved workout plans</div>
        </div>
        <button onClick={startNew}
          style={{background:T.gAccent,border:"none",color:"#0b0f0b",borderRadius:12,
            padding:"10px 16px",fontWeight:700,fontSize:14,cursor:"pointer",
            WebkitTapHighlightColor:"transparent"}}>+ New</button>
      </div>
      {programs.length===0 ? (
        <div style={{textAlign:"center",padding:"60px 20px",color:T.muted}}>
          <div style={{fontSize:40,marginBottom:12}}>📋</div>
          <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>No programs yet</div>
          <div style={{fontSize:13,marginBottom:20}}>Create one manually or ask the Coach to build you a plan.</div>
          <button onClick={startNew}
            style={{background:T.gAccent,border:"none",color:"#0b0f0b",borderRadius:12,
              padding:"12px 24px",fontWeight:700,fontSize:14,cursor:"pointer",
              WebkitTapHighlightColor:"transparent"}}>Create a program</button>
        </div>
      ) : programs.map(p=>(
        <div key={p.id} style={{background:T.card,border:`1px solid ${p.id===activeProgId?T.accent:T.border}`,
          borderRadius:14,padding:"14px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:16,fontWeight:700,color:T.text}}>{p.name}</div>
              <div style={{fontSize:12,color:T.muted,marginTop:2}}>
                {p.days.length} {p.days.length===1?"day":"days"}
                {p.id===activeProgId && <span style={{color:T.accent,marginLeft:8,fontWeight:700}}>● ACTIVE</span>}
              </div>
            </div>
            <button onClick={()=>editProg(p)}
              style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
                borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer",
                WebkitTapHighlightColor:"transparent"}}>Edit</button>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{ setSelProg(p); setView("program"); }}
              style={{flex:1,background:T.surface,border:`1px solid ${T.border}`,color:T.text,
                borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer",
                WebkitTapHighlightColor:"transparent"}}>View days</button>
            {p.id!==activeProgId && (
              <button onClick={()=>onSetActive(p.id)}
                style={{flex:1,background:T.accent+"22",border:`1px solid ${T.accent}66`,color:T.accent,
                  borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer",
                  WebkitTapHighlightColor:"transparent"}}>Set active</button>
            )}
            <button onClick={()=>{ if(window.confirm(`Delete "${p.name}"?`)) onDelete(p.id); }}
              style={{background:T.cal+"18",border:`1px solid ${T.cal}44`,color:T.cal,
                borderRadius:10,padding:"10px 12px",fontSize:13,cursor:"pointer",
                WebkitTapHighlightColor:"transparent"}}>🗑</button>
          </div>
        </div>
      ))}
      <div style={{height:"env(safe-area-inset-bottom,20px)"}}/>
    </div>
  );

  // ── PROGRAM VIEW (days list) ──
  if (view==="program" && selProg) return (
    <div style={{flex:1,overflowY:"auto",padding:"12px 14px",WebkitOverflowScrolling:"touch"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button onClick={()=>setView("list")}
          style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
            borderRadius:10,minWidth:40,minHeight:40,fontSize:18,cursor:"pointer",
            WebkitTapHighlightColor:"transparent"}}>‹</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:800}}>{selProg.name}</div>
          <div style={{fontSize:12,color:T.muted}}>{selProg.days.length} days</div>
        </div>
      </div>
      {selProg.days.length===0 ? (
        <div style={{textAlign:"center",padding:"40px 0",color:T.muted,fontSize:14}}>
          No days in this program yet. Tap Edit to add some.
        </div>
      ) : selProg.days.map((day,di)=>(
        <div key={day.id} style={{background:T.card,border:`1px solid ${T.border}`,
          borderRadius:14,marginBottom:10,overflow:"hidden"}}>
          <button onClick={()=>setOpenDay(openDay===day.id?null:day.id)}
            style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"14px",background:"none",border:"none",cursor:"pointer",textAlign:"left",
              WebkitTapHighlightColor:"transparent"}}>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:T.text}}>
                Day {di+1}{day.name?`: ${day.name}`:""}
              </div>
              <div style={{fontSize:12,color:T.muted,marginTop:2}}>
                {day.exercises.length} {day.exercises.length===1?"exercise":"exercises"}
              </div>
            </div>
            <span style={{color:T.muted,fontSize:13,transform:openDay===day.id?"rotate(180deg)":"none",
              transition:"transform .2s"}}>⌄</span>
          </button>
          {openDay===day.id && (
            <div style={{borderTop:`1px solid ${T.border}`}}>
              {day.exercises.map((ex,ei)=>(
                <div key={ex.id} style={{padding:"10px 14px",
                  borderBottom:ei<day.exercises.length-1?`1px solid ${T.border}33`:"none"}}>
                  <div style={{fontSize:14,fontWeight:600,color:T.text}}>{ex.name||"Unnamed"}</div>
                  <div style={{marginTop:4}}>
                    {(ex.sets||[]).map((s,si)=>(
                      <div key={s.id||si} style={{fontSize:12.5,color:T.muted,padding:"2px 0",
                        display:"flex",gap:10}}>
                        <span style={{minWidth:42,color:T.muted}}>Set {si+1}</span>
                        <span style={{color:T.text}}>
                          {s.weight||"—"}{s.reps?` × ${s.reps}`:""}
                        </span>
                      </div>
                    ))}
                    {ex.notes?<div style={{marginTop:3,fontSize:11,color:T.muted,fontStyle:"italic"}}>{ex.notes}</div>:null}
                  </div>
                </div>
              ))}
              <div style={{padding:"12px 14px"}}>
                <button onClick={()=>onLogDay(selProg, day)}
                  style={{width:"100%",background:T.gAccent,border:"none",color:"#0b0f0b",
                    borderRadius:10,padding:"12px",fontWeight:700,fontSize:14,cursor:"pointer",
                    minHeight:46,WebkitTapHighlightColor:"transparent"}}>
                  🏋️ Log this workout with Coach
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      <div style={{height:"env(safe-area-inset-bottom,20px)"}}/>
    </div>
  );

  // ── EDIT / BUILD VIEW ──
  if (view==="edit" && draft) return (
    <div style={{flex:1,overflowY:"auto",padding:"12px 14px",WebkitOverflowScrolling:"touch"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button onClick={()=>{ setView("list"); setDraft(null); }}
          style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
            borderRadius:10,minWidth:40,minHeight:40,fontSize:18,cursor:"pointer",
            WebkitTapHighlightColor:"transparent"}}>✕</button>
        <div style={{flex:1,fontSize:17,fontWeight:800}}>
          {editing && programs.find(p=>p.id===draft.id)?"Edit program":"New program"}
        </div>
        <button onClick={saveDraft} disabled={!draft.name.trim()}
          style={{background:draft.name.trim()?T.gAccent:"none",
            border:`1px solid ${draft.name.trim()?T.accent:T.border}`,
            color:draft.name.trim()?"#0b0f0b":T.muted,
            borderRadius:10,padding:"9px 16px",fontWeight:700,fontSize:14,cursor:"pointer",
            WebkitTapHighlightColor:"transparent"}}>Save</button>
      </div>
      <input value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))}
        placeholder="Program name (e.g. 4-Day PPL)"
        style={{...field,fontSize:16,fontWeight:600,marginBottom:16}}/>
      {draft.days.map((day,di)=>(
        <div key={day.id} style={{background:T.card,border:`1px solid ${T.border}`,
          borderRadius:14,marginBottom:12,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 14px",
            borderBottom:`1px solid ${T.border}55`}}>
            <div style={{fontSize:12,color:T.muted,minWidth:40}}>Day {di+1}</div>
            <input value={day.name} onChange={e=>setDayName(day.id,e.target.value)}
              placeholder="Name (e.g. Push, Legs…)"
              style={{...smallField,flex:1}}/>
            <button onClick={()=>removeDay(day.id)}
              style={{background:"none",border:"none",color:T.cal,fontSize:18,cursor:"pointer",
                minWidth:36,minHeight:36,WebkitTapHighlightColor:"transparent"}}>×</button>
          </div>
          {day.exercises.map((ex,ei)=>(
            <div key={ex.id} style={{padding:"10px 14px",
              borderBottom:ei<day.exercises.length-1?`1px solid ${T.border}33`:"none"}}>
              <div style={{display:"flex",gap:6,marginBottom:8}}>
                <input value={ex.name} onChange={e=>setExField(day.id,ex.id,"name",e.target.value)}
                  placeholder="Exercise name"
                  style={{...smallField,flex:1,fontWeight:600}}/>
                <button onClick={()=>removeExercise(day.id,ex.id)}
                  style={{background:"none",border:"none",color:T.cal,fontSize:16,cursor:"pointer",
                    minWidth:32,minHeight:32,WebkitTapHighlightColor:"transparent"}}>×</button>
              </div>
              {/* Column headers */}
              <div style={{display:"flex",gap:6,padding:"0 2px",marginBottom:4}}>
                <div style={{minWidth:44,fontSize:10,color:T.muted}}>SET</div>
                <div style={{flex:1,fontSize:10,color:T.muted}}>WEIGHT</div>
                <div style={{flex:1,fontSize:10,color:T.muted}}>REPS</div>
                <div style={{minWidth:32}}/>
              </div>
              {/* One row per set */}
              {(ex.sets||[]).map((s,si)=>(
                <div key={s.id} style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
                  <div style={{minWidth:44,fontSize:13,color:T.muted,fontWeight:600}}>{si+1}</div>
                  <input value={s.weight} onChange={e=>setSetField(day.id,ex.id,s.id,"weight",e.target.value)}
                    placeholder="135 lbs" style={{...smallField,flex:1}}/>
                  <input value={s.reps} onChange={e=>setSetField(day.id,ex.id,s.id,"reps",e.target.value)}
                    placeholder="8" inputMode="numeric" style={{...smallField,flex:1}}/>
                  <button onClick={()=>removeSet(day.id,ex.id,s.id)}
                    style={{background:"none",border:"none",color:T.muted,fontSize:15,cursor:"pointer",
                      minWidth:32,minHeight:32,WebkitTapHighlightColor:"transparent"}}>×</button>
                </div>
              ))}
              <button onClick={()=>addSet(day.id,ex.id)}
                style={{width:"100%",background:T.accent+"18",border:`1px solid ${T.accent}44`,
                  color:T.accent,borderRadius:8,padding:"8px",fontSize:12,fontWeight:700,cursor:"pointer",
                  marginTop:2,marginBottom:6,WebkitTapHighlightColor:"transparent"}}>
                + Add set
              </button>
              <input value={ex.notes} onChange={e=>setExField(day.id,ex.id,"notes",e.target.value)}
                placeholder="Notes (optional)" style={smallField}/>
            </div>
          ))}
          <button onClick={()=>addExercise(day.id)}
            style={{width:"100%",background:"none",border:"none",color:T.accent,
              padding:"11px",fontSize:13,fontWeight:600,cursor:"pointer",
              WebkitTapHighlightColor:"transparent"}}>+ Add exercise</button>
        </div>
      ))}
      <button onClick={addDay}
        style={{width:"100%",background:T.surface,border:`1px dashed ${T.border}`,color:T.muted,
          borderRadius:14,padding:"14px",fontSize:14,cursor:"pointer",marginBottom:20,
          WebkitTapHighlightColor:"transparent"}}>+ Add day</button>
      <div style={{height:"env(safe-area-inset-bottom,20px)"}}/>
    </div>
  );

  return null;
};
