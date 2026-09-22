import { dietProjection } from "../dietProjection.js";
import { nutrientDay, nutrientStreak } from "../nutrientTracking.js";
import { DIET_FIELDS, dietSummary } from "../nutrition.js";
import { T } from "../theme.js";

export const DietFields = ({value,onChange}) => <details style={{margin:"10px 0",fontSize:14}}>
  <summary style={{cursor:"pointer",padding:"8px 0"}}>Extra nutrient details</summary>
  {value.dietEstimated && <p style={{color:T.warn,marginBottom:8}}>Includes AI-filled values — check against the label.{value.dietSource && /^https:\/\//.test(value.dietSource) && <a href={value.dietSource} target="_blank" rel="noopener noreferrer" style={{color:T.info,marginLeft:6}}>Source</a>}</p>}
  <p style={{color:T.muted,marginBottom:8}}>Leave unknown values blank. Enter 0 only when known. Fruit and vegetables use actual cups, not an inferred serving count.</p>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{DIET_FIELDS.map(([k,label])=><label key={k}>{label}<input type="number" min="0" step="any" inputMode="decimal" placeholder="Unknown" value={value[k] ?? ""} onChange={e=>onChange(k,e.target.value)} style={{display:"block",boxSizing:"border-box",width:"100%",minHeight:44,fontSize:16,padding:8,borderRadius:8,border:`1px solid ${T.border}`,background:T.bg,color:T.text}}/></label>)}</div>
</details>;
export const DietProjection = ({days,goals,today,streaks}) => {
  const p=dietProjection(days,goals,today,streaks);
  return <section style={{background:T.card,padding:16,borderRadius:12,marginBottom:12}}>
    <h3 style={{fontSize:18,marginBottom:8}}>Diet projection</h3>
    <strong style={{display:"block",fontSize:16,marginBottom:8,color:T.accent}}>{p.title}</strong>
    <p style={{fontSize:15,lineHeight:1.5,marginBottom:10}}>{p.explanation}</p>
    <p style={{fontSize:15,lineHeight:1.5}}><strong>Next step: </strong>{p.change}</p>
    {p.avg && <p style={{fontSize:12,lineHeight:1.4,color:T.muted,marginTop:10}}>Based on {p.days} logged days from the last two weeks, excluding today. Incomplete logs can skew this. This projects logged intake, not weight or overall health.</p>}
  </section>;
};

export const ExtraNutrients = ({days,day,today,settings,onFind,loading,error}) => {
 const enabled=DIET_FIELDS.filter(([k])=>settings.extraNutrients?.[k]?.enabled);
 if(!enabled.length) return null;
 return <section style={{background:T.card,padding:14,borderRadius:12,marginBottom:12}}>
  <h3 style={{fontSize:16,marginBottom:10}}>Extra nutrients</h3>
  {enabled.map(([k,label])=>{
    const config=settings.extraNutrients[k];
    const d=nutrientDay(days[day],k,config.target,config.mode);
    const streak=nutrientStreak(days,k,config.target,config.mode,today);
    return <div key={k} style={{padding:"10px 0",borderBottom:`1px solid ${T.border}`,fontSize:14}}>
      <strong>{label}</strong>
      <div>{d.complete?Number(d.total.toFixed(1)):d.total>0?`At least ${Number(d.total.toFixed(1))}`:"Unknown"}{Number(config.target)>0 ? ` / ${config.mode==="max"?"at most":"at least"} ${config.target}` : " · set a target in Settings"}</div>
      <div style={{color:T.muted}}>{streak} day streak{d.missing>0?` · ${d.missing} entries missing`:""}{d.estimated?" · includes AI-filled values":""}</div>
    </div>;
  })}
  <p style={{fontSize:12,color:T.muted,marginTop:10}}>Streaks need values for every logged food. Upper-limit streaks count finished days only. They reflect your logs, including any estimates.</p>
  <button disabled={loading || !(days[day]?.length)} onClick={onFind} style={{marginTop:10,minHeight:44,width:"100%",border:0,borderRadius:10,background:T.accent,color:T.bg,fontSize:14}}>{loading?"Finding nutrients…":"Find missing nutrients with AI"}</button>
  {error && <p role="status" style={{fontSize:14,marginTop:8}}>{error}</p>}
 </section>;
};

export const DietTotals = ({entries}) => {
  const summary=dietSummary(entries);
  return <div style={{background:T.card,padding:14,borderRadius:12,marginBottom:12}}>
    <h3 style={{fontSize:16,marginBottom:8}}>Diet details</h3>
    {DIET_FIELDS.map(([k,label])=>{const d=summary[k];return <div key={k} style={{fontSize:14,marginBottom:6}}>{label}: <strong>{d.known ? Number(d.total.toFixed(1)) : "Unknown"}</strong>{d.missing>0 && <span style={{color:T.muted}}> · {d.missing} entries missing</span>}</div>;})}
    <p style={{fontSize:14,color:T.muted}}>Totals include known values only and may include estimates. Tap a food to add or correct these details.</p>
  </div>;
};
