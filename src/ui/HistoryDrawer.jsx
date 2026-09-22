import { useState, useRef } from "react";
import { fmtDate, fmtTime, isToday } from "../dates.js";
import { _get, _set } from "../storage.js";
import { T } from "../theme.js";

export const HistoryDrawer = ({open,allDays,selectedDay,onSelectDay,onClose,onNav,onExport,onImport,onShare,onSettings}) => {
  const days=Object.keys(allDays).filter(d=>allDays[d]?.length>0).sort((a,b)=>b.localeCompare(a));
  const [expanded, setExpanded] = useState(null);
  // Section collapse state, remembered across opens
  const [histOpen, setHistOpen] = useState(()=>{ try { return _get("nl4_drawer_hist")!=="0"; } catch { return true; } });
  const [dataOpen, setDataOpen] = useState(()=>{ try { return _get("nl4_drawer_data")==="1"; } catch { return false; } });
  const toggleHist = () => setHistOpen(v=>{ const n=!v; try{_set("nl4_drawer_hist",n?"1":"0");}catch{} return n; });
  const toggleData = () => setDataOpen(v=>{ const n=!v; try{_set("nl4_drawer_data",n?"1":"0");}catch{} return n; });
  const sw = useRef({x:0,y:0,active:false});
  const onPanelTS = (e)=>{ const t=e.touches[0]; sw.current={x:t.clientX,y:t.clientY,active:true}; };
  const onPanelTE = (e)=>{
    if (!sw.current.active) return;
    sw.current.active=false;
    const t=e.changedTouches[0];
    const dx=t.clientX-sw.current.x, dy=t.clientY-sw.current.y;
    if (dx>70 && Math.abs(dx)>Math.abs(dy)*1.5) onClose();
  };
  return (<>
    {open&&<div onClick={onClose} style={{position:"fixed",inset:0,background:T.overlay,zIndex:200}}/>}
    <div onTouchStart={onPanelTS} onTouchEnd={onPanelTE}
      style={{position:"fixed",top:0,right:0,height:"100%",
      width:Math.min(300,window.innerWidth*0.85),
      background:T.surface,borderLeft:`1px solid ${T.border}`,
      zIndex:210,overflowY:"auto",
      transform:open?"translateX(0)":"translateX(110%)",
      transition:"transform .28s cubic-bezier(.4,0,.2,1)",
      paddingBottom:"env(safe-area-inset-bottom,20px)"}}>
      <div style={{padding:"env(safe-area-inset-top,14px) 15px 12px",
        borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,
        background:T.surface,zIndex:1,
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:10,color:T.accent,letterSpacing:"0.15em",marginBottom:2}}>MENU</div>
          <div style={{fontSize:18,fontWeight:700}}>NutriLog</div>
        </div>
        <button onClick={onClose}
          style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
            borderRadius:10,minWidth:44,minHeight:44,cursor:"pointer",fontSize:16,
            display:"flex",alignItems:"center",justifyContent:"center",
            WebkitTapHighlightColor:"transparent"}}>✕</button>
      </div>

      {/* Navigation */}
      <div style={{padding:"12px 13px 6px"}}>
        <div style={{fontSize:10,color:T.accent,letterSpacing:"0.15em",marginBottom:10}}>TOOLS</div>
        {[["meals","🍱  Meal preps"],["profile","👤  Profile"],["week","📅  Week view"]].map(([tab,label])=>(
          <button key={tab} onClick={()=>{ onNav(tab); onClose(); }}
            style={{display:"flex",alignItems:"center",width:"100%",
              background:T.card,border:`1px solid ${T.border}`,color:T.text,
              borderRadius:12,padding:"13px 14px",marginBottom:8,cursor:"pointer",
              fontSize:15,fontWeight:600,minHeight:50,textAlign:"left",
              WebkitTapHighlightColor:"transparent"}}>
            {label}
          </button>
        ))}
        <button onClick={()=>{ onSettings(); onClose(); }}
          style={{display:"flex",alignItems:"center",width:"100%",
            background:T.card,border:`1px solid ${T.border}`,color:T.text,
            borderRadius:12,padding:"13px 14px",marginBottom:8,cursor:"pointer",
            fontSize:15,fontWeight:600,minHeight:50,textAlign:"left",
            WebkitTapHighlightColor:"transparent"}}>
          ⚙️  Settings
        </button>
      </div>

      <div style={{padding:"6px 13px 12px"}}>
        <button onClick={toggleHist}
          style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",
            background:"none",border:"none",cursor:"pointer",padding:0,
            marginBottom:histOpen?10:0,paddingTop:12,borderTop:`1px solid ${T.border}`,
            WebkitTapHighlightColor:"transparent"}}>
          <span style={{fontSize:10,color:T.accent,letterSpacing:"0.15em"}}>HISTORY</span>
          <span style={{fontSize:13,color:T.muted,transform:histOpen?"rotate(180deg)":"none",
            transition:"transform .2s"}}>⌄</span>
        </button>
        {histOpen && (<>
        {days.length===0&&(
          <div style={{textAlign:"center",padding:"40px 0",color:T.muted,fontSize:14}}>No entries yet.</div>
        )}
        {days.map(day=>{
          const es=allDays[day]||[];
          const cal =Math.round(es.reduce((a,e)=>a+e.calories,0));
          const pro =Math.round(es.reduce((a,e)=>a+e.protein,0));
          const carb=Math.round(es.reduce((a,e)=>a+e.carbs,0));
          const fat =Math.round(es.reduce((a,e)=>a+e.fat,0));
          const sel=day===selectedDay;
          const isOpen = expanded===day;
          return (
            <div key={day} style={{marginBottom:10}}>
              <button onClick={()=>setExpanded(isOpen?null:day)}
                style={{width:"100%",background:sel?"#4ade8011":T.card,
                  border:`1px solid ${isOpen?T.accent:sel?T.accent:T.border}`,borderRadius:14,
                  padding:"12px 14px",cursor:"pointer",textAlign:"left",
                  minHeight:60,WebkitTapHighlightColor:"transparent",
                  transition:"border-color .15s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:15,color:T.text,fontWeight:700}}>{isToday(day)?"Today":fmtDate(day)}</span>
                  <span style={{fontSize:13,color:T.muted,transform:isOpen?"rotate(180deg)":"none",
                    transition:"transform .2s"}}>⌄</span>
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {[[`${cal}`,"cal",T.cal],[`${pro}`,"P",T.protein],[`${carb}`,"C",T.carbs],[`${fat}`,"F",T.fat]].map(([v,l,c])=>(
                    <span key={l} style={{fontSize:11}}>
                      <span style={{color:c,fontWeight:700}}>{v}</span>
                      <span style={{color:T.muted}}> {l}</span>
                    </span>
                  ))}
                  <span style={{fontSize:11,color:T.muted,marginLeft:"auto"}}>{es.length} items</span>
                </div>
              </button>
              {isOpen && (
                <div style={{marginTop:6}}>
                  {es.map(e=>(
                    <div key={e.id} style={{display:"flex",justifyContent:"space-between",
                      padding:"8px 12px",background:T.bg,borderRadius:10,
                      border:`1px solid ${T.border}`,marginBottom:4}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,color:T.text,fontWeight:600,marginBottom:2}}>{e.name}</div>
                        {e.loggedAt&&<div style={{fontSize:10,color:T.muted}}>logged {fmtTime(e.loggedAt)}</div>}
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:12,color:T.cal,fontWeight:700}}>{Math.round(e.calories)}cal</div>
                        <div style={{fontSize:10,color:T.muted}}>{Math.round(e.protein)}P·{Math.round(e.carbs)}C·{Math.round(e.fat)}F</div>
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>{onSelectDay(day);onClose();}}
                    style={{width:"100%",background:"none",border:`1px solid ${T.border}`,
                      color:T.accent,borderRadius:10,padding:"10px",cursor:"pointer",fontSize:13,
                      fontWeight:600,marginTop:2,WebkitTapHighlightColor:"transparent"}}>
                    Go to this day →
                  </button>
                </div>
              )}
            </div>
          );
        })}
        </>)}

        {/* Data */}
        <button onClick={toggleData}
          style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",
            background:"none",border:"none",cursor:"pointer",padding:0,
            margin:"6px 0 10px",paddingTop:14,borderTop:`1px solid ${T.border}`,
            WebkitTapHighlightColor:"transparent"}}>
          <span style={{fontSize:10,color:T.accent,letterSpacing:"0.15em"}}>DATA</span>
          <span style={{fontSize:13,color:T.muted,transform:dataOpen?"rotate(180deg)":"none",
            transition:"transform .2s"}}>⌄</span>
        </button>
        {dataOpen && (<>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <button onClick={onExport}
            style={{flex:1,background:T.gAccent,border:"none",color:"#0b0f0b",
              borderRadius:12,padding:"12px",cursor:"pointer",fontSize:13,fontWeight:700,
              minHeight:48,WebkitTapHighlightColor:"transparent"}}>
            ⬇ Backup
          </button>
          <button onClick={onImport}
            style={{flex:1,background:T.card,border:`1px solid ${T.border}`,color:T.text,
              borderRadius:12,padding:"12px",cursor:"pointer",fontSize:13,fontWeight:600,
              minHeight:48,WebkitTapHighlightColor:"transparent"}}>
            ⬆ Restore
          </button>
        </div>
        <button onClick={onShare}
          style={{width:"100%",background:T.card,border:`1px solid ${T.info}66`,color:T.info,
            borderRadius:12,padding:"12px",cursor:"pointer",fontSize:13,fontWeight:600,
            minHeight:48,WebkitTapHighlightColor:"transparent"}}>
          ⬆ Share backup (AirDrop, Files, Messages…)
        </button>
        </>)}
      </div>
    </div>
  </>);
};
