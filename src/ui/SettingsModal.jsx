import { useMemo, useState } from "react";
import { DIET_FIELDS } from "../nutrition.js";
import { storageUsage } from "../storage.js";
import { T, THEMES } from "../theme.js";
import { LifetimeStats } from "./LifetimeStats.jsx";
import { VersionHistoryPanel } from "./VersionHistory.jsx";

export const GeneralSettings = ({ settings, onSet, barcodes, onDeleteBarcode, onClearData }) => {
  const [showCache, setShowCache] = useState(false);
  const usage = useMemo(storageUsage, []);
  const usedPct = Math.round(usage.bytes / usage.limit * 100);
  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick}
      style={{width:46,height:28,borderRadius:99,border:"none",cursor:"pointer",flexShrink:0,
        background:on?T.accent:T.border,position:"relative",transition:"background .2s",
        WebkitTapHighlightColor:"transparent"}}>
      <span style={{position:"absolute",top:3,left:on?21:3,width:22,height:22,borderRadius:"50%",
        background:"#fff",transition:"left .2s"}}/>
    </button>
  );
  const Row = ({ label, sub, children }) => (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"12px 0",borderBottom:`1px solid ${T.border}`,gap:12}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,color:T.text,fontWeight:600}}>{label}</div>
        {sub && <div style={{fontSize:11,color:T.muted,marginTop:2,lineHeight:1.4}}>{sub}</div>}
      </div>
      {children}
    </div>
  );
  const Seg = ({ value, options, onPick }) => (
    <div style={{display:"flex",gap:4,background:T.bg,border:`1px solid ${T.border}`,
      borderRadius:9,padding:3,flexShrink:0}}>
      {options.map(([val,lbl])=>(
        <button key={val} onClick={()=>onPick(val)}
          style={{background:value===val?T.accent:"none",color:value===val?"#0b0f0b":T.muted,
            border:"none",borderRadius:7,padding:"6px 10px",fontSize:12,fontWeight:700,cursor:"pointer",
            WebkitTapHighlightColor:"transparent"}}>{lbl}</button>
      ))}
    </div>
  );
  const cacheKeys = Object.keys(barcodes||{});
  return (
    <div>
      <Row label="Units" sub="Weights & water display">
        <Seg value={settings.units} options={[["imperial","lbs/oz"],["metric","kg/mL"]]}
          onPick={v=>onSet("units",v)}/>
      </Row>
      <Row label="Haptics" sub="Vibration on taps & celebrations">
        <Toggle on={settings.haptics} onClick={()=>onSet("haptics",!settings.haptics)}/>
      </Row>
      <Row label="Celebrations" sub="Confetti & cheer toasts when you hit goals">
        <Toggle on={settings.celebrations} onClick={()=>onSet("celebrations",!settings.celebrations)}/>
      </Row>
      <Row label="Theme scenery" sub="Snow, waves, stars, lasers or petals behind your theme">
        <Toggle on={settings.scenery !== false} onClick={()=>onSet("scenery", settings.scenery === false)}/>
      </Row>
      <Row label="Edge glow" sub="A line of light that drifts around the screen">
        <Seg value={settings.glow} options={[["off","Off"],["subtle","Subtle"],["vivid","Vivid"]]}
          onPick={v=>onSet("glow",v)}/>
      </Row>
      {settings.glow !== "off" && <>
        <Row label="Glow style" sub={(settings.glowStyle ?? "trail")==="ring"
          ? "The whole edge stays lit" : "A light laps around the edge"}>
          <Seg value={settings.glowStyle ?? "trail"} options={[["trail","Trail"],["ring","Ring"]]}
            onPick={v=>onSet("glowStyle",v)}/>
        </Row>
        {(settings.glowStyle ?? "trail") !== "ring" && (
          <Row label="Glow speed" sub={`One lap every ${(22/(settings.glowSpeed ?? 2)).toFixed(1)}s`}>
            <input type="range" min="1" max="10" step="1" value={settings.glowSpeed ?? 2}
              aria-label="Glow speed"
              onChange={e=>onSet("glowSpeed", +e.target.value)}
              style={{width:120,accentColor:T.accent,flexShrink:0}}/>
          </Row>
        )}
        <Row label="Glow width" sub={`Thickness of the border light — ${settings.glowWidth ?? 2}px`}>
          <input type="range" min="1" max="10" step="1" value={settings.glowWidth ?? 2}
            aria-label="Glow width in pixels"
            onChange={e=>onSet("glowWidth", +e.target.value)}
            style={{width:120,accentColor:T.accent,flexShrink:0}}/>
        </Row>
        <Row label="Glow corners" sub={`Match your screen's curve — ${settings.glowRadius ?? 44}px`}>
          <input type="range" min="0" max="80" step="2" value={settings.glowRadius ?? 44}
            aria-label="Glow corner radius in pixels"
            onChange={e=>onSet("glowRadius", +e.target.value)}
            style={{width:120,accentColor:T.accent,flexShrink:0}}/>
        </Row>
      </>}
      <Row label="Default tab" sub="Which tab opens on launch">
        <Seg value={settings.landingTab}
          options={[["chat","💬"],["log","📋"],["workouts","💪"],["train","🏋️"]]}
          onPick={v=>onSet("landingTab",v)}/>
      </Row>
      <Row label="AI style" sub="How the coaches & logger reply">
        <Seg value={settings.aiStyle}
          options={[["concise","Short"],["balanced","Balanced"],["detailed","Detailed"]]}
          onPick={v=>onSet("aiStyle",v)}/>
      </Row>
      <Row label="Web search for food" sub="Look up real menu data for restaurants — uses extra API usage on your key">
        <Toggle on={settings.webSearch} onClick={()=>onSet("webSearch",!settings.webSearch)}/>
      </Row>

      <Row label="Diet projection" sub="Show the optional summary in your food log">
        <Toggle on={settings.showDietProjection} onClick={()=>onSet("showDietProjection",!settings.showDietProjection)}/>
      </Row>
      <section style={{marginTop:18}}>
        <h3 style={{fontSize:16,marginBottom:8}}>Extra nutrients & streaks</h3>
        <p style={{fontSize:14,color:T.muted}}>Choose what to show and enter your own daily targets. Turning a nutrient off hides it without deleting its values.</p>
        {DIET_FIELDS.map(([k,label])=>{
          const c=settings.extraNutrients?.[k]||{};
          const change=patch=>onSet("extraNutrients",{...settings.extraNutrients,[k]:{mode:k==="sodium"||k==="sugar"||k==="saturatedFat"?"max":"min",...c,...patch}});
          return <div key={k} style={{padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
            <label style={{display:"flex",alignItems:"center",gap:12,minHeight:44,fontSize:14}}>
              <input type="checkbox" checked={!!c.enabled} onChange={e=>change({enabled:e.target.checked})} style={{width:22,height:22,appearance:"auto",WebkitAppearance:"checkbox"}}/>{label}
            </label>
            {c.enabled && <div style={{display:"flex",gap:8}}>
              <select aria-label={label+" goal direction"} value={c.mode || (["sodium","sugar","saturatedFat"].includes(k)?"max":"min")} onChange={e=>change({mode:e.target.value})} style={{minHeight:44,flex:1,fontSize:16,background:T.bg,color:T.text,border:`1px solid ${T.border}`,borderRadius:8}}>
                <option value="min">At least</option><option value="max">At most</option>
              </select>
              <input aria-label={label+" daily target"} placeholder="Daily target" type="number" min="0" step="any" inputMode="decimal" value={c.target??""} onChange={e=>change({target:e.target.value})} style={{minHeight:44,width:130,fontSize:16,background:T.bg,color:T.text,border:`1px solid ${T.border}`,borderRadius:8,padding:8}}/>
            </div>}
          </div>;
        })}
      </section>

      {/* Barcode cache management */}
      <div style={{marginTop:16}}>
        <button onClick={()=>setShowCache(s=>!s)}
          style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",
            background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px",
            cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
          <span style={{fontSize:14,color:T.text,fontWeight:600}}>Saved products</span>
          <span style={{fontSize:12,color:T.muted}}>{cacheKeys.length} · {showCache?"hide":"show"}</span>
        </button>
        {showCache && (
          <div style={{marginTop:8}}>
            {cacheKeys.length===0 ? (
              <div style={{fontSize:12,color:T.muted,padding:"10px 2px"}}>
                No saved barcodes yet. Scanned products you confirm get remembered here.
              </div>
            ) : cacheKeys.map(code=>(
              <div key={code} style={{display:"flex",alignItems:"center",gap:10,
                padding:"9px 12px",background:T.bg,border:`1px solid ${T.border}`,
                borderRadius:9,marginBottom:5}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,color:T.text,fontWeight:600,
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {barcodes[code].name}
                  </div>
                  <div style={{fontSize:10,color:T.muted}}>
                    {Math.round(barcodes[code].calories)}cal · {code}
                  </div>
                </div>
                <button onClick={()=>onDeleteBarcode(code)}
                  style={{background:"none",border:"none",color:T.cal,fontSize:18,cursor:"pointer",
                    minWidth:36,minHeight:36,WebkitTapHighlightColor:"transparent"}}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Storage */}
      <div style={{marginTop:18,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
        <div style={{fontSize:10,color:T.muted,letterSpacing:"0.12em",marginBottom:8}}>STORAGE</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",fontSize:12,marginBottom:6}}>
          <span style={{color:T.text}}>{(usage.bytes/1024).toFixed(0)} KB used</span>
          <span style={{color:T.muted}}>{usedPct}% of about 5 MB</span>
        </div>
        <div aria-hidden="true" style={{height:5,background:T.border,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.min(usedPct,100)}%`,
            background:usedPct>85?T.cal:T.accent,borderRadius:99}}/>
        </div>
        <div style={{fontSize:11,color:T.muted,marginTop:8,lineHeight:1.4}}>
          Backup copies are compressed instead of stored full size, leaving noticeably more room
          for history. More saved history means more repeat foods answer from your own log
          instead of the AI.
        </div>
      </div>

      {/* Danger zone */}
      <div style={{marginTop:18,paddingTop:14,borderTop:`1px solid ${T.cal}44`}}>
        <div style={{fontSize:10,color:T.cal,letterSpacing:"0.12em",marginBottom:8}}>DANGER ZONE</div>
        <button onClick={onClearData}
          style={{width:"100%",background:T.cal+"18",border:`1px solid ${T.cal}66`,color:T.cal,
            borderRadius:10,padding:"13px",fontSize:13,fontWeight:700,cursor:"pointer",minHeight:48,
            WebkitTapHighlightColor:"transparent"}}>
          Clear all data {'&'} start fresh
        </button>
        <div style={{fontSize:11,color:T.muted,marginTop:8,lineHeight:1.4}}>
          Erases all logs, workouts, meals, goals, and settings on this device. Back up first if you
          might want it later.
        </div>
      </div>
    </div>
  );
};

export const SettingsModal = ({ current, onApply, onClose, settings, onSet, barcodes, onDeleteBarcode, onClearData, onTry, allDays, workouts, goals, water, today }) => {
  const base = current || THEMES[0];
  const [custom, setCustom] = useState({
    bg: base.bg, surface: base.surface, card: base.card, border: base.border,
    text: base.text, muted: base.muted, accent: base.accent, accent2: base.accent2 || base.accent,
  });
  const [tab, setTab] = useState("general"); // general | presets | custom
  const currentId = current?.id || (current ? "custom" : "emerald");

  // Each theme is shown as a miniature of the app it produces, so the choice is
  // made by looking rather than by reading colour names.
  const Swatch = ({ t }) => {
    const selected = currentId===t.id;
    const accent2 = t.accent2 || t.accent;
    return (
      <button onClick={()=>onApply({...t})} aria-pressed={selected} aria-label={t.name}
        style={{background:t.surface,border:`2px solid ${selected?t.accent:T.border}`,
          borderRadius:14,padding:7,cursor:"pointer",textAlign:"left",
          boxShadow:selected?`0 0 0 3px ${t.accent}33`:"none",
          WebkitTapHighlightColor:"transparent"}}>
        {/* miniature screen */}
        <div style={{background:t.bg,borderRadius:9,padding:7,height:74,
          display:"flex",flexDirection:"column",gap:5,overflow:"hidden"}}>
          <div style={{height:9,borderRadius:3,
            background:`linear-gradient(135deg,${t.accent} 0%,${accent2} 100%)`}}/>
          <div style={{display:"flex",gap:4}}>
            {[t.accent,accent2,t.card].map((c,i)=>(
              <span key={i} style={{width:13,height:13,borderRadius:"50%",background:c,
                border:i===2?`1px solid ${t.border}`:"none"}}/>
            ))}
          </div>
          <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:5,
            flex:1,padding:5,display:"flex",flexDirection:"column",gap:4,justifyContent:"center"}}>
            <div style={{height:4,width:"78%",borderRadius:2,background:t.text,opacity:.75}}/>
            <div style={{height:4,width:"52%",borderRadius:2,background:t.muted}}/>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4,padding:"7px 3px 1px"}}>
          <span style={{flex:1,minWidth:0,fontSize:12,fontWeight:700,color:t.text,
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.name}</span>
          {selected && <span style={{color:t.accent,fontSize:13,fontWeight:800}}>✓</span>}
        </div>
      </button>
    );
  };

  const ColorRow = ({ k, label }) => (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
      <span style={{fontSize:13,color:T.text}}>{label}</span>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:11,color:T.muted,fontFamily:"monospace"}}>{custom[k]}</span>
        <input type="color" value={custom[k]}
          onChange={e=>setCustom(c=>({...c,[k]:e.target.value}))}
          style={{width:34,height:34,border:"none",background:"none",cursor:"pointer",
            padding:0,borderRadius:8}}/>
      </div>
    </div>
  );

  return (
    <div onClick={onClose}
      style={{position:"fixed",inset:0,background:T.overlay,zIndex:520,
        display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,
          maxWidth:380,width:"100%",maxHeight:"84vh",display:"flex",flexDirection:"column",
          boxShadow:`0 10px 50px #000a`,overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"16px 18px 12px",borderBottom:`1px solid ${T.border}`}}>
          <div>
            <div style={{fontSize:10,color:T.accent,letterSpacing:"0.12em"}}>SETTINGS</div>
            <div style={{fontSize:18,fontWeight:800}}>{{general:"General",presets:"Appearance",stats:"Your lifetime stats",history:"Version history"}[tab]}</div>
          </div>
          <button onClick={onClose}
            style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
              borderRadius:10,minWidth:38,minHeight:38,cursor:"pointer",fontSize:14,
              WebkitTapHighlightColor:"transparent"}}>✕</button>
        </div>
        {/* Tab switch */}
        <div style={{display:"flex",gap:6,padding:"12px 14px 0"}}>
          {[["general","General"],["presets","Look"],["stats","Stats"],["history","History"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{flex:1,background:tab===id?T.gAccent:T.card,
                color:tab===id?"#0b0f0b":T.text,border:`1px solid ${T.border}`,
                borderRadius:10,padding:"9px 4px",fontSize:12,fontWeight:700,cursor:"pointer",
                minHeight:40,WebkitTapHighlightColor:"transparent"}}>{lbl}</button>
          ))}
        </div>
        <div style={{overflowY:"auto",padding:"14px",WebkitOverflowScrolling:"touch"}}>
          {tab==="general" ? (
            <GeneralSettings settings={settings} onSet={onSet} barcodes={barcodes}
              onDeleteBarcode={onDeleteBarcode} onClearData={onClearData}/>
          ) : tab==="stats" ? (
            <LifetimeStats days={allDays} workouts={workouts} goals={goals} water={water} today={today}/>
          ) : tab==="presets" ? (
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:12}}>
                {THEMES.map(t=><Swatch key={t.id} t={t}/>)}
              </div>
              <button onClick={()=>onApply(null)}
                style={{width:"100%",background:"none",border:`1px solid ${T.border}`,
                  color:T.muted,borderRadius:10,padding:"11px",fontSize:13,cursor:"pointer",
                  marginTop:4,marginBottom:16,WebkitTapHighlightColor:"transparent"}}>
                Reset to default
              </button>
              <div style={{fontSize:10,color:T.accent,letterSpacing:"0.12em",marginBottom:10}}>
                CUSTOM COLORS
              </div>
              <div style={{fontSize:12,color:T.muted,marginBottom:10,lineHeight:1.5}}>
                Override any color individually.
              </div>
              <ColorRow k="accent"  label="Accent (primary)"/>
              <ColorRow k="accent2" label="Accent (secondary)"/>
              <ColorRow k="bg"      label="Background"/>
              <ColorRow k="surface" label="Panels"/>
              <ColorRow k="card"    label="Cards"/>
              <ColorRow k="border"  label="Borders"/>
              <ColorRow k="text"    label="Text"/>
              <ColorRow k="muted"   label="Muted text"/>
              <button onClick={()=>onApply({ id:"custom", ...custom })}
                style={{width:"100%",background:`linear-gradient(135deg,${custom.accent},${custom.accent2})`,
                  border:"none",color:"#0b0f0b",borderRadius:12,padding:"13px",fontSize:14,
                  fontWeight:800,cursor:"pointer",marginTop:14,minHeight:48,
                  WebkitTapHighlightColor:"transparent"}}>
                Apply custom colors
              </button>
            </>
          ) : tab==="history" ? (
            <VersionHistoryPanel onTry={onTry}/>
          ) : null}
        </div>
      </div>
    </div>
  );
};
