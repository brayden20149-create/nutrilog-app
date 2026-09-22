import { useState } from "react";
import { MACROS, dietValues, scaleNutrition } from "../nutrition.js";
import { T } from "../theme.js";
import { DietFields } from "./DietViews.jsx";

export const ScanConfirm = ({ initial, code, notFound, onLog, onClose, destination = "log" }) => {
  const isPrep = destination === "prep";
  const [d, setD] = useState(() => ({...initial, name:initial?.name || "", basisGrams:initial?.basisGrams || "",
    ...Object.fromEntries(MACROS.map(k => [k, initial?.nutritionVersion === 2 ? (initial?.[k] ?? "") : ""]))}));
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState("servings");
  const set = (k,v) => setD(p=>({...p,[k]:v}));
  const total = scaleNutrition(d, amount, unit);
  const valid = Boolean(d.name.trim() && total);
  const field = {boxSizing:"border-box",width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:10,color:T.text,fontSize:16};
  const label = {display:"block",fontSize:14,marginBottom:12};
  const submit = () => {
    if (!valid) return;
    const base = {...d, ...dietValues(d), ...Object.fromEntries(MACROS.map(k=>[k,Number(d[k])])),
      name:d.name.trim(), basisGrams:Number(d.basisGrams)>0?Number(d.basisGrams):null, nutritionVersion:2};
    const portion = `${Number(amount)} ${unit}`;
    onLog({...total,name:`${base.name} (${portion})`,quantity:Number(amount),quantityUnit:unit,barcode:code}, base);
  };
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:T.overlay,zIndex:545,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div role="dialog" aria-modal="true" aria-label={isPrep ? "Scanned ingredient" : "Scanned food"} onClick={e=>e.stopPropagation()} style={{boxSizing:"border-box",background:T.surface,color:T.text,border:`1px solid ${T.border}`,borderRadius:18,padding:20,maxWidth:380,width:"100%",maxHeight:"86vh",overflowY:"auto"}}>
      <h2 style={{fontSize:20,margin:"0 0 12px"}}>{isPrep ? "Scanned ingredient" : "Scanned food"}</h2>
      <p style={{fontSize:14,color:T.muted}}>Nutrition for one base serving{initial?.basis ? ` (${initial.basis})` : ""}. Check these values against the label.</p>
      <div style={{marginBottom:12}}>
        <label htmlFor="scan-amount" style={label}>{isPrep ? "Amount used in whole batch" : "Amount eaten"}</label>
        <div style={{display:"grid",gridTemplateColumns:"52px minmax(0,1fr) 52px",gap:10}}>
          <button type="button" aria-label={unit === "g" ? "Decrease grams" : "Decrease servings"} disabled={!(Number(amount)>0)} onClick={()=>setAmount(current=>String(Math.max(0,Number((Number(current)-1).toFixed(3)))))} style={{...field,minHeight:52,fontSize:26,padding:0,touchAction:"manipulation",cursor:"pointer",opacity:Number(amount)>0?1:0.4}}>−</button>
          <input id="scan-amount" style={{...field,minHeight:52,textAlign:"center",fontSize:22,fontWeight:700}} type="number" min="0" step="any" inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)}/>
          <button type="button" aria-label={unit === "g" ? "Increase grams" : "Increase servings"} onClick={()=>setAmount(current=>String(Number(((Number.isFinite(Number(current)) ? Math.max(0,Number(current)) : 0)+1).toFixed(3))))} style={{...field,minHeight:52,fontSize:26,padding:0,background:T.accent,color:T.bg,touchAction:"manipulation",cursor:"pointer"}}>+</button>
        </div>
      </div>
      <label style={label}>Measure in<select style={field} value={unit} onChange={e=>setUnit(e.target.value)}><option value="servings">Base servings</option><option value="g">Grams</option></select></label>
      {unit === "g" && !(Number(d.basisGrams)>0) && <p style={{fontSize:14,color:T.cal}}>Enter the grams in one base serving to calculate by weight.</p>}
      <div aria-live="polite" style={{padding:12,background:T.bg,borderRadius:10,marginBottom:16,fontSize:14}}>{total ? `${Math.round(total.calories)} kcal · ${total.protein.toFixed(1)} g protein · ${total.carbs.toFixed(1)} g carbs · ${total.fat.toFixed(1)} g fat` : "Complete the nutrition and amount to see your total."}</div>
      {initial && initial.nutritionVersion !== 2 && <p role="status" style={{fontSize:14,color:T.cal}}>Previously saved barcode: re-enter one serving from the label. Older saved values may include multiple servings.</p>}
      {MACROS.some(k=>d[k]==="") && <p role="status" style={{fontSize:14,color:T.cal}}>Some nutrition values are missing. Enter them from the label, including any zeros.</p>}
      <DietFields value={d} onChange={set}/>
      <label style={label}>Product name<input style={field} value={d.name} onChange={e=>set("name",e.target.value)}/></label>
      <label style={label}>Grams in one base serving (optional)<input style={field} type="number" min="0.001" step="any" inputMode="decimal" value={d.basisGrams} onChange={e=>set("basisGrams",e.target.value)}/></label>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{MACROS.map(k=><label key={k} style={label}>{k === "calories" ? "Calories (kcal)" : `${k[0].toUpperCase()+k.slice(1)} (g)`}<input style={field} type="number" min="0" step="any" inputMode="decimal" value={d[k]} onChange={e=>set(k,e.target.value)}/></label>)}</div>
      {isPrep && <p style={{fontSize:14,marginBottom:12}}>Enter the total amount used in the whole batch. For pasta and rice, use the dry weight when the label is for the dry product.</p>}
      {notFound && <p style={{fontSize:14,color:T.cal,marginBottom:12}}>Barcode not found. Enter the label values once to remember this ingredient.</p>}
      <div style={{display:"flex",gap:10}}><button onClick={onClose} style={{...field,cursor:"pointer"}}>Cancel</button><button disabled={!valid} onClick={submit} style={{...field,background:T.accent,color:T.bg,opacity:valid?1:0.4,cursor:"pointer"}}>{isPrep ? "Add to prep" : "Log food"}</button></div>
    </div>
  </div>;
};
