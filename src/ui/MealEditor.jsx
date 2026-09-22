import { useState, useEffect, useRef } from "react";
import { estimateIngredients } from "../assistant.js";
import { MACROS, dietValues } from "../nutrition.js";
import { lookupBarcode } from "../storage.js";
import { T } from "../theme.js";
import { BarcodeScanner } from "./BarcodeScanner.jsx";
import { DietFields, DietTotals } from "./DietViews.jsx";
import { InfoDot } from "./primitives.jsx";
import { ScanConfirm } from "./ScanConfirm.jsx";

export const MealEditor = ({ meal, onSave, onDelete, onClose, barcodes = {}, onRememberBarcode }) => {
  const isNew = meal === "new";
  const [name, setName] = useState(isNew ? "" : meal.name);
  const [containers, setContainers] = useState(isNew ? 1 : meal.containers || 1);
  const [ings, setIngs] = useState(
    isNew ? [{ name:"", calories:"", protein:"", carbs:"", fat:"" }] : [...meal.ingredients]
  );

  const [ingredientScan, setIngredientScan] = useState(false);
  const [ingredientLookup, setIngredientLookup] = useState(false);
  const [ingredientConfirm, setIngredientConfirm] = useState(null);
  const lookupToken = useRef(0);
  useEffect(()=>()=>{ lookupToken.current++; },[]);
  const detectIngredient = async code => {
    setIngredientScan(false);
    const token = ++lookupToken.current;
    if (barcodes[code]) {
      setIngredientConfirm({code,data:barcodes[code]});
      return;
    }
    setIngredientLookup(true);
    try {
      const data = await lookupBarcode(code);
      if (token === lookupToken.current) setIngredientConfirm({code,data});
    } catch {
      if (token === lookupToken.current) setIngredientConfirm({code,data:null});
    } finally {
      if (token === lookupToken.current) setIngredientLookup(false);
    }
  };
  const addScannedIngredient = (entry, base) => {
    setIngs(prev=>[...prev.filter(row=>row.name.trim() || MACROS.some(k=>row[k] !== "" && row[k] != null)), {...entry}]);
    onRememberBarcode?.(ingredientConfirm.code, base);
    setIngredientConfirm(null);
  };

  const setIng = (i, k, v) => setIngs(prev => prev.map((row, idx) => idx === i ? { ...row, [k]: v } : row));
  const addIng = () => setIngs(prev => [...prev, { name:"", calories:"", protein:"", carbs:"", fat:"" }]);
  const delIng = (i) => setIngs(prev => prev.filter((_, idx) => idx !== i));

  const [filling, setFilling] = useState(false);
  const [fillErr, setFillErr] = useState("");

  const autoFill = async () => {
    const named = ings.map((ing,idx)=>({idx, name:ing.name.trim(), barcode:ing.barcode})).filter(x=>x.name && !x.barcode);
    if (named.length===0) { setFillErr("Add an unscanned ingredient name first. Scanned nutrition is already filled in."); return; }
    setFilling(true); setFillErr("");
    try {
      const results = await estimateIngredients(named.map(x=>x.name));
      setIngs(prev => {
        const next = [...prev];
        named.forEach((x, j) => {
          const r = results[j];
          if (r && next[x.idx] && !next[x.idx].barcode && next[x.idx].name.trim() === x.name) next[x.idx] = {
            ...next[x.idx], name: next[x.idx].name,
            calories: Math.round(+r.calories||0),
            protein:  Math.round(+r.protein||0),
            carbs:    Math.round(+r.carbs||0),
            fat:      Math.round(+r.fat||0),
          };
        });
        return next;
      });
    } catch (e) {
      setFillErr("Couldn't auto-fill — you can enter macros manually.");
    } finally {
      setFilling(false);
    }
  };

  const totals = ings.reduce(
    (a,i)=>({calories:a.calories+(+i.calories||0),protein:a.protein+(+i.protein||0),carbs:a.carbs+(+i.carbs||0),fat:a.fat+(+i.fat||0)}),
    {calories:0,protein:0,carbs:0,fat:0}
  );
  const c = Math.max(1, +containers||1);
  const per = {
    calories: Math.round(totals.calories/c), protein: Math.round(totals.protein/c),
    carbs: Math.round(totals.carbs/c), fat: Math.round(totals.fat/c),
  };

  const canSave = name.trim() && ings.some(i=>i.name.trim());

  const handleSave = () => {
    const cleanIngs = ings
      .filter(i=>i.name.trim())
      .map(i=>({ ...i, ...dietValues(i), name:i.name.trim(), calories:+i.calories||0, protein:+i.protein||0, carbs:+i.carbs||0, fat:+i.fat||0 }));
    onSave({
      id: isNew ? Date.now()+Math.random() : meal.id,
      name: name.trim(),
      containers: c,
      ingredients: cleanIngs,
      createdAt: isNew ? Date.now() : (meal.createdAt || Date.now()),
    });
  };

  const inputStyle = {
    background:T.card, border:`1px solid ${T.border}`, borderRadius:8,
    padding:"8px 10px", color:T.text, fontSize:16, outline:"none", width:"100%",
  };
  const numStyle = { ...inputStyle, fontSize:15, textAlign:"center", padding:"8px 4px" };

  return (<>
    <div style={{position:"fixed",inset:0,background:T.overlay,zIndex:300,
      display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:T.surface,borderRadius:"20px 20px 0 0",
          width:"100%",maxHeight:"92vh",overflowY:"auto",
          padding:"0 16px env(safe-area-inset-bottom,20px)",
          border:`1px solid ${T.border}`,borderBottom:"none"}}>
        <div style={{width:36,height:4,background:T.border,borderRadius:2,margin:"14px auto 16px"}}/>
        <div style={{fontSize:10,color:T.accent,letterSpacing:"0.15em",marginBottom:2}}>
          {isNew ? "NEW MEAL PREP" : "EDIT MEAL PREP"}
        </div>
        <div style={{fontSize:22,fontWeight:800,marginBottom:16}}>
          {isNew ? "Create a Meal" : name}
        </div>

        {/* Meal name */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Meal name (what you'll say to log it)</div>
          <input value={name} onChange={e=>setName(e.target.value)}
            placeholder="e.g. Chicken and Rice" style={inputStyle}/>
        </div>

        {/* Containers */}
        <div style={{marginBottom:18}}>
          <div style={{fontSize:12,color:T.muted,marginBottom:6}}>
            How many containers does this whole prep make?
            <InfoDot title="Containers & per-serving macros">
              Enter the total ingredients for the whole batch you cook, then how many
              containers (servings) you split it into.
              <br/><br/>
              The app divides the batch macros by the container count, so when you log
              "one container" later it adds the right per-serving amount — no need to
              recalculate each time you eat one.
            </InfoDot>
          </div>
          <input type="number" inputMode="numeric" value={containers}
            onChange={e=>setContainers(e.target.value)}
            style={{...inputStyle,width:100,textAlign:"center"}}/>
        </div>

        {/* Ingredients */}
        <div style={{fontSize:12,color:T.muted,marginBottom:8}}>
          Scan packaged ingredients and enter the amount used for the whole batch. You can also type ingredients and use Auto-fill for unscanned items.
        </div>
        <button onClick={()=>setIngredientScan(true)} disabled={filling}
          style={{width:"100%",minHeight:48,padding:12,marginBottom:12,borderRadius:10,border:`1px solid ${T.accent}`,background:T.accent,color:T.bg,fontSize:16,fontWeight:700,cursor:"pointer"}}>
          Scan ingredient barcode
        </button>
        {ings.map((ing,i)=>(
          <div key={i} style={{background:T.card,borderRadius:12,padding:"10px",
            marginBottom:8,border:`1px solid ${T.border}`}}>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input value={ing.name} onChange={e=>setIng(i,"name",e.target.value)}
                placeholder="Ingredient (e.g. 2 lbs chicken breast)"
                style={{...inputStyle,flex:1}}/>
              <button onClick={()=>delIng(i)}
                style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
                  borderRadius:8,minWidth:40,fontSize:18,cursor:"pointer",
                  WebkitTapHighlightColor:"transparent"}}>×</button>
            </div>
            <div style={{display:"flex",gap:6}}>
              {[["calories","cal",T.cal],["protein","P",T.protein],["carbs","C",T.carbs],["fat","F",T.fat]].map(([k,lbl,col])=>(
                <div key={k} style={{flex:1}}>
                  <div style={{fontSize:9,color:col,textAlign:"center",marginBottom:3}}>{lbl}</div>
                  <input type="number" inputMode="decimal" step="any" value={ing[k]}
                    onChange={e=>setIng(i,k,e.target.value)} placeholder="0" style={numStyle}/>
                </div>
              ))}
            </div>
            <DietFields value={ing} onChange={(k,v)=>setIng(i,k,v)}/>
          </div>
        ))}
        <div style={{marginBottom:12}}><DietTotals entries={ings}/></div>
        <button onClick={addIng}
          style={{width:"100%",background:"none",border:`1px dashed ${T.border}`,
            color:T.accent,borderRadius:10,padding:"11px",cursor:"pointer",fontSize:13,
            marginBottom:10,WebkitTapHighlightColor:"transparent"}}>
          + Add ingredient
        </button>

        {/* AI auto-fill */}
        <button onClick={autoFill} disabled={filling}
          style={{width:"100%",background:filling?T.card:T.info+"22",
            border:`1px solid ${T.info}66`,color:T.info,borderRadius:10,
            padding:"12px",cursor:filling?"default":"pointer",fontSize:14,fontWeight:700,
            marginBottom:fillErr?6:16,WebkitTapHighlightColor:"transparent",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {filling ? (<>
            <span style={{display:"inline-flex",gap:3}}>
              {[0,1,2].map(i=>(
                <span key={i} style={{width:6,height:6,borderRadius:"50%",background:T.info,
                  animation:`pulse 1.2s ${i*0.2}s infinite`}}/>
              ))}
            </span>
            Estimating macros…
          </>) : "✨ Auto-fill macros with AI"}
        </button>
        {fillErr && (
          <div style={{color:T.cal,fontSize:12,marginBottom:14,textAlign:"center"}}>{fillErr}</div>
        )}

        {/* Per-container preview */}
        <div style={{background:T.card,borderRadius:12,padding:"12px 14px",
          marginBottom:16,border:`1px solid ${T.accent}55`}}>
          <div style={{fontSize:10,color:T.accent,letterSpacing:"0.1em",marginBottom:8}}>
            PER CONTAINER (÷ {c})
          </div>
          <div style={{display:"flex",gap:16}}>
            {[[`${per.calories}`,"cal",T.cal],[`${per.protein}g`,"P",T.protein],
              [`${per.carbs}g`,"C",T.carbs],[`${per.fat}g`,"F",T.fat]].map(([v,lbl,col])=>(
              <div key={lbl}>
                <span style={{fontSize:17,fontWeight:700,color:col}}>{v}</span>
                <span style={{fontSize:11,color:T.muted,marginLeft:2}}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{display:"flex",gap:10,paddingBottom:16}}>
          {!isNew && (
            <button onClick={()=>onDelete(meal.id)}
              style={{background:"none",border:`1px solid ${T.cal}55`,color:T.cal,
                borderRadius:12,padding:"14px",cursor:"pointer",fontSize:14,minHeight:52,
                WebkitTapHighlightColor:"transparent"}}>Delete</button>
          )}
          <button onClick={onClose}
            style={{flex:1,background:"none",border:`1px solid ${T.border}`,color:T.muted,
              borderRadius:12,padding:"14px",cursor:"pointer",fontSize:14,minHeight:52,
              WebkitTapHighlightColor:"transparent"}}>Cancel</button>
          <button onClick={handleSave} disabled={!canSave}
            style={{flex:2,background:T.accent,border:"none",color:"#0b0f0b",
              borderRadius:12,padding:"14px",cursor:canSave?"pointer":"not-allowed",
              fontSize:14,fontWeight:700,minHeight:52,opacity:canSave?1:0.4,
              WebkitTapHighlightColor:"transparent"}}>
            {isNew ? "Save Meal" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
    {ingredientScan && <BarcodeScanner onDetected={detectIngredient} onClose={()=>setIngredientScan(false)}/>}
    {ingredientLookup && <div role="status" style={{position:"fixed",inset:0,zIndex:545,background:T.overlay,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:T.surface,color:T.text,padding:24,borderRadius:16}}>
        <p>Looking up ingredient…</p>
        <button onClick={()=>{lookupToken.current++;setIngredientLookup(false);}} style={{minHeight:44,marginTop:12,padding:12}}>Cancel</button>
      </div>
    </div>}
    {ingredientConfirm && <ScanConfirm initial={ingredientConfirm.data} code={ingredientConfirm.code} notFound={!ingredientConfirm.data}
      onLog={addScannedIngredient} onClose={()=>setIngredientConfirm(null)} destination="prep"/>}
  </>);
};
