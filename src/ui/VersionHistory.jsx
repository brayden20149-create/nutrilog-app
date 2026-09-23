import { useState } from "react";
import VersionPicker from "../VersionPicker.jsx";
import { APP_VERSION, CHANGELOG } from "../changelog.js";
import { T } from "../theme.js";

export const VersionHistoryPanel = ({ onTry }) => {
  const [open, setOpen] = useState(CHANGELOG[0]?.version || null);
  return (
    <div>
      <VersionPicker current="current" theme={T}/>
      {CHANGELOG.map(rel=>{
        const isOpen = open===rel.version;
        const isCurrent = rel.version===APP_VERSION;
        return (
          <div key={rel.version} style={{marginBottom:8}}>
            <button onClick={()=>setOpen(isOpen?null:rel.version)}
              style={{width:"100%",background:isCurrent?"#4ade8011":T.card,
                border:`1px solid ${isOpen?T.accent:isCurrent?T.accent+"88":T.border}`,
                borderRadius:12,padding:"12px 14px",cursor:"pointer",textAlign:"left",
                WebkitTapHighlightColor:"transparent"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                  <span style={{fontSize:16,fontWeight:800,color:isCurrent?T.accent:T.text}}>
                    v{rel.version}
                  </span>
                  {isCurrent && (
                    <span style={{fontSize:9,color:T.accent,letterSpacing:"0.1em",
                      border:`1px solid ${T.accent}66`,borderRadius:99,padding:"1px 7px"}}>CURRENT</span>
                  )}
                  <span style={{fontSize:11,color:T.muted}}>{rel.date}</span>
                </div>
                <span style={{fontSize:13,color:T.muted,transform:isOpen?"rotate(180deg)":"none",
                  transition:"transform .2s"}}>⌄</span>
              </div>
            </button>
            {isOpen && (
              <div style={{padding:"10px 14px 4px"}}>
                {rel.notes.map((note,i)=>{
                  const text = typeof note==="string"?note:note.text;
                  const action = typeof note==="string"?null:note.action;
                  return (
                    <div key={i} style={{display:"flex",gap:8,marginBottom:8,fontSize:13,
                      color:T.text,lineHeight:1.5,alignItems:"flex-start"}}>
                      <span style={{color:T.accent,flexShrink:0}}>•</span>
                      <span style={{flex:1}}>{text}</span>
                      {action && onTry && (
                        <button onClick={()=>onTry(action)}
                          style={{flexShrink:0,background:T.accent+"22",border:`1px solid ${T.accent}66`,
                            color:T.accent,borderRadius:99,padding:"3px 12px",fontSize:11,fontWeight:700,
                            cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                          Try
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const VersionHistoryModal = ({ onClose, onTry }) => {
  const [open, setOpen] = useState(CHANGELOG[0]?.version || null);
  return (
    <div onClick={onClose}
      style={{position:"fixed",inset:0,background:T.overlay,zIndex:520,
        display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,
          maxWidth:380,width:"100%",maxHeight:"80vh",display:"flex",flexDirection:"column",
          boxShadow:`0 10px 50px #000a`,overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"16px 18px 12px",borderBottom:`1px solid ${T.border}`}}>
          <div>
            <div style={{fontSize:10,color:T.accent,letterSpacing:"0.12em"}}>VERSION HISTORY</div>
            <div style={{fontSize:18,fontWeight:800}}>What's changed</div>
          </div>
          <button onClick={onClose}
            style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
              borderRadius:10,minWidth:38,minHeight:38,cursor:"pointer",fontSize:14,
              WebkitTapHighlightColor:"transparent"}}>✕</button>
        </div>
        <div style={{overflowY:"auto",padding:"12px 14px",WebkitOverflowScrolling:"touch"}}>
          {CHANGELOG.map(rel=>{
            const isOpen = open===rel.version;
            const isCurrent = rel.version===APP_VERSION;
            return (
              <div key={rel.version} style={{marginBottom:8}}>
                <button onClick={()=>setOpen(isOpen?null:rel.version)}
                  style={{width:"100%",background:isCurrent?"#4ade8011":T.card,
                    border:`1px solid ${isOpen?T.accent:isCurrent?T.accent+"88":T.border}`,
                    borderRadius:12,padding:"12px 14px",cursor:"pointer",textAlign:"left",
                    WebkitTapHighlightColor:"transparent"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                      <span style={{fontSize:16,fontWeight:800,color:isCurrent?T.accent:T.text}}>
                        v{rel.version}
                      </span>
                      {isCurrent && (
                        <span style={{fontSize:9,color:T.accent,letterSpacing:"0.1em",
                          border:`1px solid ${T.accent}66`,borderRadius:99,padding:"1px 7px"}}>CURRENT</span>
                      )}
                      <span style={{fontSize:11,color:T.muted}}>{rel.date}</span>
                    </div>
                    <span style={{fontSize:13,color:T.muted,transform:isOpen?"rotate(180deg)":"none",
                      transition:"transform .2s"}}>⌄</span>
                  </div>
                </button>
                {isOpen && (
                  <div style={{padding:"10px 14px 4px"}}>
                    {rel.notes.map((note,i)=>{
                      const text = typeof note==="string" ? note : note.text;
                      const action = typeof note==="string" ? null : note.action;
                      return (
                      <div key={i} style={{display:"flex",gap:8,marginBottom:8,fontSize:13,
                        color:T.text,lineHeight:1.5,alignItems:"flex-start"}}>
                        <span style={{color:T.accent,flexShrink:0}}>•</span>
                        <span style={{flex:1}}>{text}</span>
                        {action && onTry && (
                          <button onClick={()=>onTry(action)}
                            style={{flexShrink:0,background:T.accent+"22",border:`1px solid ${T.accent}66`,
                              color:T.accent,borderRadius:99,padding:"3px 12px",fontSize:11,fontWeight:700,
                              cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                            Try
                          </button>
                        )}
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const WelcomeModal = ({ name, onClose, onTry }) => {
  const latest = CHANGELOG[0];
  return (
  <div onClick={onClose}
    style={{position:"fixed",inset:0,background:T.overlay,zIndex:520,
      display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
    <div onClick={e=>e.stopPropagation()}
      style={{background:T.surface,border:`1px solid ${T.accent}55`,borderRadius:20,
        padding:"26px 22px 22px",maxWidth:360,width:"100%",textAlign:"center",
        boxShadow:`0 10px 50px #000a`,animation:"toastPop .35s ease",
        maxHeight:"86vh",overflowY:"auto"}}>
      <div style={{fontSize:40,marginBottom:10}}>👋</div>
      <div style={{fontSize:24,fontWeight:800,marginBottom:6,
        backgroundImage:T.gHeader,WebkitBackgroundClip:"text",backgroundClip:"text",
        WebkitTextFillColor:"transparent"}}>
        Welcome{name?` back, ${name}`:""}!
      </div>
      <div style={{fontSize:13,color:T.muted,marginBottom:16,lineHeight:1.6}}>
        NutriLog — your AI fitness companion for logging food, workouts, and progress.
      </div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,
        padding:"12px 14px",marginBottom:18,textAlign:"left"}}>
        <div style={{fontSize:10,color:T.accent,letterSpacing:"0.12em",marginBottom:10}}>
          NEW IN {APP_VERSION}
        </div>
        {latest.notes.map((note,i)=>{
          const text = typeof note==="string" ? note : note.text;
          const action = typeof note==="string" ? null : note.action;
          return (
            <div key={i} style={{display:"flex",gap:8,marginBottom:9,fontSize:12.5,
              color:T.text,lineHeight:1.5,alignItems:"flex-start"}}>
              <span style={{color:T.accent,flexShrink:0}}>•</span>
              <span style={{flex:1}}>{text}</span>
              {action && onTry && (
                <button onClick={()=>onTry(action)}
                  style={{flexShrink:0,background:T.accent+"22",border:`1px solid ${T.accent}66`,
                    color:T.accent,borderRadius:99,padding:"3px 12px",fontSize:11,fontWeight:700,
                    cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                  Try
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div style={{display:"inline-block",background:T.card,border:`1px solid ${T.border}`,
        borderRadius:99,padding:"5px 14px",fontSize:12,color:T.accent,fontWeight:700,
        letterSpacing:"0.08em",marginBottom:20}}>
        VERSION {APP_VERSION}
      </div>
      <button onClick={onClose}
        style={{width:"100%",background:T.gAccent,border:"none",color:"#0b0f0b",
          borderRadius:12,padding:"14px",fontWeight:800,fontSize:15,cursor:"pointer",
          minHeight:52,WebkitTapHighlightColor:"transparent"}}>
        Let's go
      </button>
    </div>
  </div>
  );
};
