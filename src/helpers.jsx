import { useState, useEffect, useRef } from "react";


export const APP_VERSION = "1.3.0";

export const CHANGELOG = [
  { version:"1.3.0", date:"Jun 2026", notes:[
    { text:"Programs — build workout plans with days and exercises", action:"programs" },
    { text:"Coach can generate and save programs for you", action:"train" },
    { text:"Log a program day directly to Coach with one tap", action:"programs" },
    { text:"Multiple programs with one marked active", action:"programs" },
  ]},
  { version:"1.2.3", date:"Jun 2026", notes:[
    { text:"Workout sets always shown as indented rows", action:"workouts" },
    { text:"Coach/Chef send button renamed to Send", action:"train" },
    { text:"Settings label simplified in menu", action:null },
    { text:"Custom colors merged into Appearance tab", action:"settings" },
  ]},
  { version:"1.2.1", date:"Jun 2026", notes:[
    { text:"Version history moved into Settings", action:"settings" },
    { text:"Goals button removed — edit goals in Profile", action:"profile" },
    { text:"Log multiple servings from barcode scanner", action:"scan" },
    { text:"Log multiple containers from Meal Preps", action:"meals" },
  ]},
  { version:"1.2.0", date:"Jun 2026", notes:[
    { text:"Customize your app's look — presets or your own colors", action:"settings" },
    { text:"Swipe from a screen edge to switch tabs", action:null },
    { text:"Swipe a drawer right to close it", action:null },
    { text:"Try buttons in this what's-new list", action:null },
  ]},
  { version:"1.1.2", date:"Jun 2026", notes:[
    { text:"Goals now count as hit when you're within 10% of them", action:null },
    { text:"Barcode entry includes a serving size with a unit dropdown (grams included)", action:"scan" },
  ]},
  { version:"1.1.1", date:"Jun 2026", notes:[
    { text:"Standout days — PRs stamp your week with a ⭐", action:"week" },
    { text:"Coach grades a 'complete' workout to your experience level", action:"train" },
    { text:"One clean congrats when a session is done (no partial spam)", action:null },
  ]},
  { version:"1.1.0", date:"Jun 2026", notes:[
    { text:"Barcode scanner for packaged foods, with a personal product cache", action:"scan" },
    { text:"Customizable water goal + hold-to-pick amounts", action:"profile" },
    { text:"Source links on branded items", action:null },
    { text:"Swipe a log entry left to delete", action:"log" },
    { text:"Haptic feedback + share-sheet backup", action:null },
  ]},
  { version:"1.0.0", date:"Jun 2026", notes:[
    { text:"First release 🎉", action:null },
    { text:"AI food logging (chat + photo), strength coach, and chef", action:"chat" },
    { text:"Meal preps, week calendar, streaks, profile & goals", action:"profile" },
    { text:"Weight check-in, water tracking, and auto-backup", action:"log" },
  ]},
];

export const T = {
  bg:"#0b0f0b", surface:"#121912", card:"#171f17", border:"#1e2d1e",
  accent:"#4ade80", accent2:"#22d3a5", text:"#eaf5ea", muted:"#5f7a5f",
  protein:"#4ade80", carbs:"#facc15", fat:"#fb923c", cal:"#f87171",
  warn:"#fbbf24", info:"#60a5fa", overlay:"#000000e0", ai:"#141f14",
  gAccent:"linear-gradient(135deg,#4ade80 0%,#22d3a5 100%)",
  gHeader:"linear-gradient(135deg,#10b981 0%,#4ade80 55%,#a3e635 100%)",
  glow:"0 0 16px",
};
export const T_DEFAULTS = {...T};

export const THEMES = [
  { id:"emerald", name:"Emerald (default)", bg:"#0b0f0b", surface:"#121912", card:"#171f17",
    border:"#1e2d1e", text:"#eaf5ea", muted:"#5f7a5f", accent:"#4ade80", accent2:"#22d3a5" },
  { id:"ocean", name:"Ocean", bg:"#080d14", surface:"#0e1722", card:"#13202e",
    border:"#1c2f42", text:"#e6f0fa", muted:"#5d7a8c", accent:"#38bdf8", accent2:"#22d3ee" },
  { id:"violet", name:"Violet", bg:"#0d0a14", surface:"#161222", card:"#1d172e",
    border:"#2c2342", text:"#efe9fa", muted:"#7a6da8", accent:"#a78bfa", accent2:"#c084fc" },
  { id:"sunset", name:"Sunset", bg:"#140b08", surface:"#22130e", card:"#2e1a13",
    border:"#422a1c", text:"#faeee6", muted:"#a8825d", accent:"#fb923c", accent2:"#f87171" },
  { id:"rose", name:"Rose", bg:"#140a0d", surface:"#221218", card:"#2e171f",
    border:"#42232d", text:"#fae9ef", muted:"#a86d7e", accent:"#fb7185", accent2:"#f472b6" },
  { id:"mono", name:"Slate", bg:"#0c0d0f", surface:"#15171a", card:"#1c1f23",
    border:"#2a2e34", text:"#eef1f5", muted:"#6b727d", accent:"#94a3b8", accent2:"#cbd5e1" },
];

export const applyTheme = (t) => {
  if (!t) { Object.assign(T, T_DEFAULTS); return; }
  const accent = t.accent || T_DEFAULTS.accent;
  const accent2 = t.accent2 || accent;
  Object.assign(T, {
    bg:     t.bg     || T_DEFAULTS.bg,
    surface:t.surface|| T_DEFAULTS.surface,
    card:   t.card   || T_DEFAULTS.card,
    border: t.border || T_DEFAULTS.border,
    text:   t.text   || T_DEFAULTS.text,
    muted:  t.muted  || T_DEFAULTS.muted,
    accent, accent2,
    ai:     t.surface ? t.card : T_DEFAULTS.ai,
    gAccent:`linear-gradient(135deg,${accent} 0%,${accent2} 100%)`,
    gHeader:`linear-gradient(135deg,${accent2} 0%,${accent} 55%,${accent} 100%)`,
  });
};
export const loadTheme = () => { try { return JSON.parse(dualLoadRaw("nl4_theme")||"null"); } catch { return null; } };
export const saveTheme = t  => dualSave("nl4_theme", JSON.stringify(t));

export const DEFAULT_SETTINGS = {
  units:"imperial",     // imperial (lbs/oz) | metric (kg/mL)
  haptics:true,
  celebrations:true,
  landingTab:"chat",    // chat | log | workouts | train
  aiStyle:"balanced",   // concise | balanced | detailed
};
export const loadSettings = () => { try { return {...DEFAULT_SETTINGS, ...JSON.parse(dualLoadRaw("nl4_settings")||"{}")}; } catch { return {...DEFAULT_SETTINGS}; } };
export const saveSettings = s  => dualSave("nl4_settings", JSON.stringify(s));

export const toDisplayWeight = (lbs, units) => units==="metric" ? +(lbs*0.453592).toFixed(1) : lbs;
export const fromDisplayWeight = (val, units) => units==="metric" ? +(val/0.453592).toFixed(1) : +val;
export const weightUnit = (units) => units==="metric" ? "kg" : "lbs";
export const toDisplayWater = (oz, units) => units==="metric" ? Math.round(oz*29.5735) : oz;
export const fromDisplayWater = (val, units) => units==="metric" ? Math.round(val/29.5735) : +val;
export const waterUnit = (units) => units==="metric" ? "mL" : "oz";

export const DEFAULT_GOALS = { calories:2200, protein:160, carbs:220, fat:70, water:100 };
export const PRESETS = [
  { name:"Maintenance", calories:2200, protein:150, carbs:230, fat:75 },
  { name:"Cutting",     calories:1800, protein:180, carbs:150, fat:55 },
  { name:"Bulking",     calories:2800, protein:200, carbs:300, fat:85 },
  { name:"High Protein",calories:2000, protein:220, carbs:160, fat:55 },
  { name:"Low Carb",    calories:2000, protein:160, carbs:80,  fat:100 },
];

export const localKey = (dt) => {
  const y = dt.getFullYear();
  const m = String(dt.getMonth()+1).padStart(2,"0");
  const d = String(dt.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
};
export const todayKey = () => localKey(new Date());
export const isToday  = d  => d === todayKey();
export const fmtDate  = d  => {
  const [,m,day] = d.split("-");
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]} ${+day}`;
};
export const fmtFull = d => {
  const dt = new Date(d+"T00:00:00");
  const wd = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dt.getDay()];
  const [y,m,day] = d.split("-");
  return `${wd}, ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]} ${+day}, ${y}`;
};
export const fmtTime = ts => new Date(ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

export const _get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
export const _set = (k,v) => { try { localStorage.setItem(k,v); } catch {} };

export const dualSave = (key, valueStr) => {
  _set(key, valueStr);
  _set(key + "_bak", valueStr);
  _set(key + "_ts", String(Date.now()));
};
export const dualLoadRaw = (key) => {
  const p = _get(key);
  if (p && p !== "{}" && p !== "[]") return p;
  const b = _get(key + "_bak");
  if (b && b !== "{}" && b !== "[]") {
    _set(key, b);
    return b;
  }
  return p || b || null;
};

export const loadAll   = () => { try { return JSON.parse(dualLoadRaw("nl4_days")||"{}"); }  catch { return {}; } };
export const saveAll   = d  => dualSave("nl4_days", JSON.stringify(d));
export const loadGoals = () => { try { return {...DEFAULT_GOALS,...JSON.parse(dualLoadRaw("nl4_goals")||"{}")}; } catch { return {...DEFAULT_GOALS}; } };
export const saveGoals = g  => dualSave("nl4_goals", JSON.stringify(g));
export const loadMeals = () => { try { return JSON.parse(dualLoadRaw("nl4_meals")||"[]"); }  catch { return []; } };
export const saveMeals = m  => dualSave("nl4_meals", JSON.stringify(m));
export const loadPrograms = () => { try { return JSON.parse(dualLoadRaw("nl4_programs")||"[]"); } catch { return []; } };
export const savePrograms = p  => dualSave("nl4_programs", JSON.stringify(p));

// One-time cleanup: split crammed multi-set details into individual sets, strip
// commentary like "(ramping)" / "Ramping:", and remove exact duplicate entries.
export const cleanWorkoutDay = (list) => {
  if (!Array.isArray(list)) return list;
  const out = [];
  const seen = new Set(); // name|detail to dedupe
  for (const w of list) {
    const name = (w.name||"").trim();
    let detail = (w.detail||"").trim();
    // Strip leading labels like "Ramping:" and trailing "(ramping)" etc.
    detail = detail.replace(/^\s*(ramping|warm\s*up|warmup|top\s*set|drop\s*set)\s*:\s*/i, "");
    detail = detail.replace(/\s*\((ramping|warm\s*up|warmup|top\s*set|drop\s*set)\)\s*$/i, "");
    // Find weight x reps pairs, e.g. "150x10", "167.5 x 9", "185 lbs × 8"
    const pairs = [...detail.matchAll(/(\d+(?:\.\d+)?)\s*(?:lbs|lb|kg)?\s*[x×]\s*(\d+)/gi)];
    if (pairs.length > 1) {
      // Crammed multiple sets in one detail → split into one entry per pair
      pairs.forEach((m,i)=>{
        const d = `${m[1]} lbs × ${m[2]}`;
        const key = `${name.toLowerCase()}|${d}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ ...w, id:(w.id||Date.now())+"_"+i+"_"+Math.random().toString(36).slice(2), name, detail:d });
        }
      });
    } else {
      // Single pair (or non-standard) → normalize format if it's a clean pair
      let d = detail;
      if (pairs.length === 1) d = `${pairs[0][1]} lbs × ${pairs[0][2]}`;
      const key = `${name.toLowerCase()}|${d}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ ...w, name, detail:d });
      }
    }
  }
  return out;
};
export const loadWorkouts = () => { try { return JSON.parse(dualLoadRaw("nl4_workouts")||"{}"); } catch { return {}; } };
export const saveWorkouts = w  => dualSave("nl4_workouts", JSON.stringify(w));
export const loadStandout = () => { try { return JSON.parse(dualLoadRaw("nl4_standout")||"{}"); } catch { return {}; } }; // {dayKey:true}
export const saveStandout = s  => dualSave("nl4_standout", JSON.stringify(s));
export const loadWeights = () => { try { return JSON.parse(dualLoadRaw("nl4_weights")||"{}"); } catch { return {}; } }; // {dayKey: number(lbs)}
export const saveWeights = w  => dualSave("nl4_weights", JSON.stringify(w));
export const loadWater = () => { try { return JSON.parse(dualLoadRaw("nl4_water")||"{}"); } catch { return {}; } };   // {dayKey: oz}
export const saveWater = w  => dualSave("nl4_water", JSON.stringify(w));
export const WATER_STEP = 12; // oz per tap
export const WATER_GOAL = 100; // daily oz goal

export const loadBarcodes = () => { try { return JSON.parse(dualLoadRaw("nl4_barcodes")||"{}"); } catch { return {}; } };
export const saveBarcodes = b  => dualSave("nl4_barcodes", JSON.stringify(b));

export async function lookupBarcode(code) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,nutriments,serving_size`);
  if (!res.ok) throw new Error("lookup failed");
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  const p = data.product;
  const n = p.nutriments || {};
  const hasServing = n["energy-kcal_serving"] != null || n.proteins_serving != null;
  const g = (servingKey, hundredKey) => {
    const v = hasServing ? n[servingKey] : n[hundredKey];
    return v != null ? Math.round(v) : 0;
  };
  const name = [p.brands?.split(",")[0]?.trim(), p.product_name].filter(Boolean).join(" ") || "Scanned item";
  return {
    name,
    calories: g("energy-kcal_serving","energy-kcal_100g"),
    protein:  g("proteins_serving","proteins_100g"),
    carbs:    g("carbohydrates_serving","carbohydrates_100g"),
    fat:      g("fat_serving","fat_100g"),
    basis: hasServing ? (p.serving_size || "per serving") : "per 100g",
  };
}

export let HAPTICS_ON = true;
export const setHapticsOn = (v) => { HAPTICS_ON = v; };
export const haptic = (pattern=10) => { try { if (HAPTICS_ON) navigator.vibrate?.(pattern); } catch {} };

export const DEFAULT_PROFILE = {
  name:"",
  age:"", sex:"", heightFt:"", heightIn:"", weight:"", wingspanIn:"",
  experience:"", daysPerWeek:"", trainingGoal:"",
  dietPrefs:"", allergies:"", restrictions:"",
  goalType:"", targetWeight:"",
};
export const loadProfile = () => { try { return {...DEFAULT_PROFILE,...JSON.parse(dualLoadRaw("nl4_profile")||"{}")}; } catch { return {...DEFAULT_PROFILE}; } };
export const saveProfile = p  => dualSave("nl4_profile", JSON.stringify(p));

export const suggestGoals = (p) => {
  const age = +p.age, w = +p.weight; // weight in lbs
  const totalIn = (+p.heightFt||0)*12 + (+p.heightIn||0);
  if (!age || !w || !totalIn) return null;
  const kg = w*0.453592, cm = totalIn*2.54;
  const s = (p.sex||"").toLowerCase().startsWith("f") ? -161 : 5;
  const bmr = 10*kg + 6.25*cm - 5*age + s;
  const d = +p.daysPerWeek||0;
  const act = d>=6 ? 1.725 : d>=4 ? 1.55 : d>=2 ? 1.375 : 1.2;
  let cals = bmr*act;
  const g = (p.goalType||"").toLowerCase();
  if (g.includes("cut")) cals -= 500;
  else if (g.includes("bulk")) cals += 350;
  cals = Math.round(cals/10)*10;
  const protein = Math.round(Math.min(w, w*1.0));
  const fat = Math.round((cals*0.25)/9);
  const carbs = Math.round((cals - protein*4 - fat*9)/4);
  const waterBase = w*0.6;
  const waterAct = d>=6 ? 1.25 : d>=4 ? 1.15 : d>=2 ? 1.07 : 1.0;
  const water = Math.round((waterBase*waterAct)/8)*8; // round to 8oz cup
  return { calories:cals, protein, carbs:Math.max(carbs,0), fat, water };
};

export function computeHabits(allDays, workouts) {
  const dayKeys = Object.keys(allDays).filter(d=>allDays[d]?.length>0);
  const loggedDayCount = dayKeys.length;

  let cal=0,pro=0,carb=0,fat=0;
  const foodFreq = {};
  dayKeys.forEach(dk=>{
    (allDays[dk]||[]).forEach(e=>{
      cal+=e.calories; pro+=e.protein; carb+=e.carbs; fat+=e.fat;
      const key = e.name.trim();
      foodFreq[key] = (foodFreq[key]||0)+1;
    });
  });
  const avg = loggedDayCount ? {
    calories: Math.round(cal/loggedDayCount),
    protein:  Math.round(pro/loggedDayCount),
    carbs:    Math.round(carb/loggedDayCount),
    fat:      Math.round(fat/loggedDayCount),
  } : null;

  const topFoods = Object.entries(foodFreq)
    .sort((a,b)=>b[1]-a[1]).slice(0,6)
    .filter(([,n])=>n>=2)
    .map(([name,n])=>`${name} (${n}x)`);

  const dow = [0,0,0,0,0,0,0];
  let workoutDays = 0;
  const exFreq = {};
  Object.keys(workouts).forEach(dk=>{
    const ws = workouts[dk]||[];
    if (ws.length) {
      workoutDays++;
      dow[new Date(dk+"T00:00:00").getDay()]++;
      ws.forEach(w=>{ exFreq[w.name.trim()] = (exFreq[w.name.trim()]||0)+1; });
    }
  });
  const dowNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const commonTrainingDays = dow
    .map((c,i)=>({d:dowNames[i],c}))
    .filter(x=>x.c>=2)
    .sort((a,b)=>b.c-a.c)
    .map(x=>x.d);
  const topExercises = Object.entries(exFreq)
    .sort((a,b)=>b[1]-a[1]).slice(0,6)
    .filter(([,n])=>n>=2)
    .map(([name,n])=>`${name} (${n}x)`);

  return { loggedDayCount, avg, topFoods, commonTrainingDays, workoutDays, topExercises };
}

export const dayKeyFromDate = (dt) => localKey(dt);
export const weekStart = (dayKey) => {
  const d = new Date(dayKey + "T00:00:00");
  d.setDate(d.getDate() - d.getDay()); // back to Sunday
  return dayKeyFromDate(d);
};
export const addDays = (dayKey, n) => {
  const d = new Date(dayKey + "T00:00:00");
  d.setDate(d.getDate() + n);
  return dayKeyFromDate(d);
};
export const weekDays = (startKey) => Array.from({length:7}).map((_,i)=>addDays(startKey,i));
export const dowShort = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
export const dayNum = (dayKey) => +dayKey.split("-")[2];

export const dayHitsGoal = (totals, goals, cat) => {
  if (!totals) return false;
  const goal = goals[cat];
  if (!goal || goal <= 0) return false;
  if (cat === "calories") {
    return totals.calories > 0 && Math.abs(totals.calories - goal) <= goal * 0.10;
  }
  return totals[cat] >= goal * 0.90;
};

export const sumDay = (entries) => (entries||[]).reduce(
  (a,e)=>({calories:a.calories+e.calories,protein:a.protein+e.protein,carbs:a.carbs+e.carbs,fat:a.fat+e.fat}),
  {calories:0,protein:0,carbs:0,fat:0}
);

export const computeStreak = (allDays, workouts, goals, cat) => {
  const hitOn = (dk) => cat === "workout"
    ? (workouts[dk]?.length || 0) > 0
    : dayHitsGoal(sumDay(allDays[dk]), goals, cat);

  let streak = 0;
  let cursor = dayKeyFromDate(new Date());
  if (!hitOn(cursor)) cursor = addDays(cursor, -1);

  for (let i=0;i<400;i++){
    if (hitOn(cursor)) { streak++; cursor = addDays(cursor,-1); }
    else break;
  }
  return streak;
};

export const mealPerContainer = (meal) => {
  const totalIng = (meal.ingredients||[]).reduce(
    (a,i)=>({calories:a.calories+(+i.calories||0),protein:a.protein+(+i.protein||0),carbs:a.carbs+(+i.carbs||0),fat:a.fat+(+i.fat||0)}),
    {calories:0,protein:0,carbs:0,fat:0}
  );
  const c = Math.max(1, +meal.containers||1);
  return {
    calories: Math.round(totalIng.calories/c),
    protein:  Math.round(totalIng.protein/c),
    carbs:    Math.round(totalIng.carbs/c),
    fat:      Math.round(totalIng.fat/c),
  };
};

export const styleHint = (aiStyle) => {
  if (aiStyle==="concise")  return "STYLE: Keep replies short and to the point — a sentence or two, minimal fluff.";
  if (aiStyle==="detailed") return "STYLE: Be thorough and explanatory — give helpful context, reasoning, and tips, while staying readable.";
  return "STYLE: Balanced — clear and friendly, neither terse nor long-winded.";
};

export async function fetchChat(body) {
  const ctrl = new AbortController();
  const timer = setTimeout(()=>ctrl.abort(), 30000);
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const e = await res.json().catch(()=>({}));
      throw new Error(e?.error?.message || "HTTP " + res.status);
    }
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") throw new Error("timed out — try again");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function callClaude(messages, aiStyle) {
  const SYSTEM = [
    "You are NutriLog AI, a macro tracking assistant. You control the user food log.",
    "IMPORTANT: Reply with ONLY a JSON object. No markdown. No backticks. No prose. Start with { end with }.",
    "Format: {" + '"message":"your reply","actions":[]}',
    "Actions you may include:",
    '  add food:    {"type":"add_entry","entry":{"name":"Full Brand Name","calories":0,"protein":0,"carbs":0,"fat":0,"source":"https://..."}}',
    "The 'source' field is OPTIONAL and only for branded or restaurant items that have an official published nutrition page (e.g. the brand's own site or official nutrition PDF). Include a real, specific URL you are confident exists for that item. For generic/whole foods you are estimating (e.g. 'an apple', 'grilled chicken'), DO NOT include a source field — leave it out entirely. Never invent or guess URLs; omit the field if unsure.",
    '  remove food: {"type":"remove_entry","name":"partial name"}',
    '  clear day:   {"type":"clear_log"}',
    '  edit goals:  {"type":"update_goals","goals":{"calories":0,"protein":0,"carbs":0,"fat":0}}',
    "If the user sends a PHOTO of food, identify each item and estimate realistic macros from what you see (portion sizes, ingredients). If it's a nutrition label, read the values directly. Create add_entry actions for what's pictured and briefly note in the message that values are estimated from the photo.",
    "You handle FOOD only. If the user mentions a workout or exercise, tell them briefly to log it in the Trainer tab — do not create workout actions here.",
    "Use official menu nutrition data for all restaurants and brands.",
    "Common items: CFA Original Sandwich 470cal/29P/41C/19F, CFA Spicy Deluxe 550cal/34P/45C/24F, CFA Med Waffle Fries 400cal/5P/48C/21F, McBig Mac 563cal/25P/45C/33F, McDouble Cheeseburger 450cal/25P/34C/24F.",
    "The user has a personal MEAL PREP LIBRARY of custom meals, provided in the [STATE] context as MealLibrary. Each meal has a name and exact per-container macros.",
    "When the user says to log one of their meals (e.g. 'log a chicken and rice container', 'add 2 of my chicken bowls', 'log my meal prep'), MATCH it to a meal in MealLibrary by name (fuzzy match is fine) and use that meal's EXACT per-container macros. Add one add_entry per container requested (default 1). Name the entry exactly as the meal name.",
    "If they ask to log a quantity like '2 containers', add that many add_entry actions.",
    "If a spoken meal isn't in their library, say so briefly and suggest they create it in the Meals tab.",
    "If UserProfile is provided in context (age, sex, weight, goals, diet prefs, allergies, restrictions), use it to tailor portion estimates and any food suggestions. Respect allergies and dietary restrictions strictly when suggesting foods.",
    "If UserName is provided, address the person by their first name naturally and occasionally — not in every line. If Habits are provided (their average daily macros and frequently logged foods), use them: recognize repeat foods, and make suggestions consistent with what they actually eat.",
    "The message field must be PLAIN TEXT BULLET POINTS ONLY. Every line starts with '- '. No headers, no bold, no tables. One bullet per food item with its macros, plus optional brief bullets for totals or feedback. Nothing outside the bullets.",
    "Return ONLY the JSON object.",
    styleHint(aiStyle),
  ].join(" ");

  const data = await fetchChat({ system: SYSTEM, messages });
  const raw = (data.content || []).map(b => b.text || "").join("").trim();

  try { return JSON.parse(raw); } catch {}
  const s = raw.replace(/^```[\w]*\s*/,"").replace(/\s*```$/,"").trim();
  try { return JSON.parse(s); } catch {}
  const m = raw.match(/{[\s\S]*}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return { message: raw.length > 0 ? raw.slice(0, 300) : "Something went wrong. Please try again.", actions: [] };
}

export async function estimateIngredients(ingredientNames) {
  const SYSTEM = [
    "You are a nutrition database. The user gives a list of food ingredients with quantities.",
    "For EACH ingredient, return the total macros for the FULL quantity stated (not per serving).",
    "Reply with ONLY a JSON array, no markdown, no prose. One object per ingredient, SAME ORDER as given:",
    '[{"name":"2 lbs chicken breast","calories":1090,"protein":204,"carbs":0,"fat":24}]',
    "Use accurate USDA values. Keep the name exactly as the user wrote it. Round to whole numbers.",
    "Return ONLY the JSON array.",
  ].join(" ");
  const userText = "Ingredients:\n" + ingredientNames.map((n,i)=>`${i+1}. ${n}`).join("\n");

  const data = await fetchChat({ system: SYSTEM, messages: [{ role:"user", content:userText }] });
  const raw = (data.content || []).map(b => b.text || "").join("").trim();
  const clean = raw.replace(/^```[\w]*\s*/,"").replace(/\s*```$/,"").trim();
  let arr;
  try { arr = JSON.parse(clean); }
  catch { const m = clean.match(/\[[\s\S]*\]/); arr = m ? JSON.parse(m[0]) : null; }
  if (!Array.isArray(arr)) throw new Error("Couldn't read the AI's response");
  return arr;
}

export async function callTrainer(messages, aiStyle) {
  const SYSTEM = [
    "You are a strength coach inside a fitness app. You both LOG the user's workouts and give coaching feedback.",
    "TONE: Direct, technical, matter-of-fact. Do NOT use hype, excessive praise, or flattery ('crushing it', 'beast mode', 'amazing job'). Also do NOT be harsh or drill-sergeant. Treat the user as a capable adult. Neutral, useful, a little dry is the target.",
    "You MUST respond with ONLY a JSON object — no markdown, no backticks, no text outside it:",
    '{"message":"your coaching reply","actions":[],"workoutStatus":"none|partial|complete","standout":false}',
    "workoutStatus: judge whether what they logged THIS session amounts to a COMPLETE workout RELATIVE TO THEIR EXPERIENCE LEVEL (from USER PROFILE 'experience'). If no experience is given, treat them as Beginner. Rough bar for a complete session: Beginner ≈ 2-3 solid exercises or ~20+ minutes of real work; Intermediate ≈ 4-5 exercises covering a session's worth; Advanced ≈ a full targeted session (5-6+ exercises or high total volume). Use 'complete' if they meet or exceed their level's bar, 'partial' if they've logged something but it's below the bar, 'none' if they logged nothing (just a question). Be reasonable, not stingy.",
    "standout: set true ONLY when this session shows a clear personal record (more weight/reps than their history on a lift) OR a big jump in total volume versus their usual — something genuinely notable. Otherwise false. Requires workout history to compare; if there's no history to compare against, keep standout false. Don't hand it out for ordinary good sessions.",
    "Actions you may include:",
    '  add workout: {"type":"add_workout","workout":{"name":"Bench Press","detail":"185 lbs × 8","category":"strength"}}',
    '  remove workout: {"type":"remove_workout","name":"partial name"}',
    '  save program: {"type":"save_program","program":{"name":"4-Day PPL","days":[{"name":"Push","exercises":[{"name":"Bench Press","sets":4,"reps":"8-10","weight":"185 lbs","notes":""}]}]}}',
    "When the user asks you to build or design a workout program/plan, use save_program to create it. Each day has a name and a list of exercises with sets, reps, target weight (or empty string if unknown), and optional notes.",
    "LOGGING RULES (follow exactly): Create ONE add_workout per individual SET, not per exercise. If an exercise has 3 sets, emit 3 add_workout actions with the SAME name. Each set's detail is ONLY 'WEIGHT × REPS' (e.g. '185 lbs × 8'), or for bodyweight 'BW × 12', for cardio the distance/time. NEVER put multiple sets in one detail string. NEVER duplicate a set. NEVER add words like 'ramping', 'top set', 'warmup', or any commentary in the detail — just weight × reps. Example: user says 'lat pulldown 150x10, 167.5x9, 185x8' → emit 3 actions, details '150 lbs × 10', '167.5 lbs × 9', '185 lbs × 8'. category = strength|cardio|mobility|sport.",
    "In the SAME message, also coach: 1) If workout history is provided, compare this session to previous performance on the same lift (load, volume, reps) and state the change plainly. 2) Give 1-2 concrete technical/mental cues for the lift. 3) If relevant, a brief specific suggestion for next session grounded in progressive overload, without being pushy.",
    "If they only ask a question (no lift to log), answer it technically with an empty actions array.",
    "If a USER PROFILE is provided, scale expectations and progression to their experience, weekly frequency, and goal. If wingspanIn (arm span in inches) and height are present, factor limb leverages into form cues — e.g. longer arms mean a longer bench/deadlift range of motion and may favor certain grip widths or stances; mention this only when it's actually relevant to the lift being discussed.",
    "If a USER NAME is provided, use their first name naturally now and then (not every message). If TRAINING HABITS are provided (their usual training days and frequent exercises), reference them when relevant — e.g. note if they're training a muscle they usually skip, or breaking from their normal split.",
    "If the user sends a PHYSIQUE PHOTO, give an honest, technical assessment: note developed areas and lagging/weak points, estimate visible conditioning, and recommend which muscle groups or training focus to prioritize. Be specific and constructive — no flattery, no body-shaming, no health/medical claims, no body-fat percentage guarantees. Keep it about training priorities. Use an empty actions array for photo assessments unless they also reported a lift.",
    "Keep the message concise and skimmable — a few short lines. Plain text inside the message field (line breaks ok, no markdown symbols).",
    "Return ONLY the JSON object.",
    styleHint(aiStyle),
  ].join(" ");

  const data = await fetchChat({ system: SYSTEM, messages });
  const raw = (data.content || []).map(b => b.text || "").join("").trim();
  const clean = raw.replace(/^```[\w]*\s*/,"").replace(/\s*```$/,"").trim();
  try { return JSON.parse(clean); } catch {}
  const m = clean.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return { message: raw || "Give me the lift and the numbers.", actions: [] };
}

export async function callChef(messages, aiStyle) {
  const SYSTEM = [
    "You are a practical meal-prep chef and nutrition assistant inside a fitness app. You help the user design meal preps and answer general nutrition questions (macros of foods, substitutions, protein sources, fiber, micronutrients, cooking methods, etc.).",
    "TONE: Friendly, practical, concise. Real food and real numbers, not fluff.",
    "You MUST respond with ONLY a JSON object — no markdown, no backticks, no text outside it:",
    '{"message":"your reply","actions":[]}',
    "When you propose a meal prep the user wants to save, include a save_meal action so it goes into their library:",
    '  {"type":"save_meal","meal":{"name":"Chicken & Rice Bowls","containers":5,"ingredients":[{"name":"2 lbs chicken breast","calories":1090,"protein":204,"carbs":0,"fat":24},{"name":"3 cups cooked white rice","calories":615,"protein":13,"carbs":135,"fat":1}]}}',
    "ingredients carry the TOTAL macros for the whole batch (not per container). containers = how many servings the batch makes. Use accurate USDA values. Only include a save_meal action when the user actually wants to save/create the prep — otherwise just discuss in the message.",
    "When designing a prep, briefly show the per-container macro estimate in the message so they know what they're getting.",
    "For general nutrition questions, answer directly with numbers where useful. Use the message field, empty actions array.",
    "If a USER PROFILE or goals are provided, tailor prep suggestions to their calorie/protein targets and respect allergies/restrictions strictly.",
    "Keep the message readable plain text (line breaks fine, no markdown symbols like ** or #).",
    "Return ONLY the JSON object.",
    styleHint(aiStyle),
  ].join(" ");

  const data = await fetchChat({ system: SYSTEM, messages });
  const raw = (data.content || []).map(b => b.text || "").join("").trim();
  const clean = raw.replace(/^```[\w]*\s*/,"").replace(/\s*```$/,"").trim();
  try { return JSON.parse(clean); } catch {}
  const m = clean.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return { message: raw || "Tell me what you'd like to prep or ask a nutrition question.", actions: [] };
}

export const InfoDot = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={(e)=>{ e.stopPropagation(); setOpen(true); }}
        aria-label="More info"
        style={{display:"inline-flex",alignItems:"center",justifyContent:"center",
          width:18,height:18,borderRadius:"50%",border:`1px solid ${T.muted}`,
          background:"none",color:T.muted,fontSize:11,fontWeight:700,cursor:"pointer",
          marginLeft:6,padding:0,lineHeight:1,flexShrink:0,fontStyle:"italic",
          WebkitTapHighlightColor:"transparent",verticalAlign:"middle"}}>i</button>
      {open && (
        <div onClick={(e)=>{ e.stopPropagation(); setOpen(false); }}
          style={{position:"fixed",inset:0,background:T.overlay,zIndex:400,
            display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div onClick={(e)=>e.stopPropagation()}
            style={{background:T.surface,border:`1px solid ${T.accent}55`,borderRadius:16,
              padding:"18px 18px 16px",maxWidth:340,width:"100%",
              boxShadow:`0 8px 40px #000a`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{fontSize:15,fontWeight:800,color:T.accent,paddingRight:10}}>{title}</div>
              <button onClick={()=>setOpen(false)}
                style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
                  borderRadius:8,minWidth:32,minHeight:32,cursor:"pointer",fontSize:14,flexShrink:0,
                  WebkitTapHighlightColor:"transparent"}}>✕</button>
            </div>
            <div style={{fontSize:13,color:T.text,lineHeight:1.6}}>{children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export const Ring = ({value,max,color,label}) => {
  const r=34, c=2*Math.PI*r, pct=Math.min(value/max,1);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <svg width={84} height={84} style={{transform:"rotate(-90deg)"}}>
        <circle cx={42} cy={42} r={r} fill="none" stroke={T.border} strokeWidth={6}/>
        <circle cx={42} cy={42} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${pct*c} ${c}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray .6s cubic-bezier(.4,0,.2,1)"}}/>
        <text x={42} y={47} textAnchor="middle" fill={T.text} fontSize={13} fontWeight={700}
          style={{transform:"rotate(90deg)",transformOrigin:"42px 42px"}}>
          {Math.round(value)}
        </text>
      </svg>
      <span style={{fontSize:11,color:T.muted,letterSpacing:"0.08em"}}>{label}</span>
    </div>
  );
};

export const Bar = ({label,value,max,color,unit="g"}) => {
  const over=value>max, pct=Math.min(value/max*100,100);
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:13,color:T.muted,letterSpacing:"0.04em"}}>{label}</span>
        <span style={{fontSize:13,color:over?T.cal:color,fontWeight:700}}>
          {Math.round(value)}<span style={{color:T.muted,fontWeight:400}}>/{max}{unit}</span>
          {over&&" ▲"}
        </span>
      </div>
      <div style={{height:6,background:T.border,borderRadius:99}}>
        <div style={{height:"100%",width:`${pct}%`,background:over?T.cal:color,
          borderRadius:99,transition:"width .5s cubic-bezier(.4,0,.2,1)",
          boxShadow:`0 0 6px ${over?T.cal:color}88`}}/>
      </div>
    </div>
  );
};

export const EntryRow = ({entry,onDelete,onEdit}) => {
  const [editing, setEditing] = useState(false);
  const [d, setD] = useState({name:entry.name,calories:entry.calories,protein:entry.protein,carbs:entry.carbs,fat:entry.fat});
  const set = (k,v)=>setD(p=>({...p,[k]:v}));
  const save = () => {
    onEdit(entry.id, {
      name:d.name.trim()||entry.name,
      calories:+d.calories||0, protein:+d.protein||0, carbs:+d.carbs||0, fat:+d.fat||0,
    });
    setEditing(false);
  };
  const numF = {background:T.bg,border:`1px solid ${T.border}`,borderRadius:7,
    padding:"6px 4px",color:T.text,fontSize:15,textAlign:"center",width:"100%",outline:"none"};

  const [dragX, setDragX] = useState(0);
  const startX = useRef(0);
  const dragging = useRef(false);
  const onTS = (e)=>{ startX.current = e.touches[0].clientX; dragging.current = true; };
  const onTM = (e)=>{
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx < 0) setDragX(Math.max(dx, -120)); // only allow left drag
  };
  const onTE = ()=>{
    dragging.current = false;
    if (dragX < -70) { haptic(20); onDelete(entry.id); }
    else setDragX(0);
  };

  if (editing) {
    return (
      <div style={{padding:"12px 14px",background:T.card,borderRadius:12,
        border:`1px solid ${T.accent}66`,marginBottom:8}}>
        <input value={d.name} onChange={e=>set("name",e.target.value)}
          style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,
            padding:"9px 11px",color:T.text,fontSize:16,width:"100%",outline:"none",marginBottom:10}}/>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          {[["calories","cal",T.cal],["protein","P",T.protein],["carbs","C",T.carbs],["fat","F",T.fat]].map(([k,lbl,col])=>(
            <div key={k} style={{flex:1}}>
              <div style={{fontSize:9,color:col,textAlign:"center",marginBottom:3}}>{lbl}</div>
              <input type="number" inputMode="numeric" value={d[k]} onChange={e=>set(k,e.target.value)} style={numF}/>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setEditing(false)}
            style={{flex:1,background:"none",border:`1px solid ${T.border}`,color:T.muted,
              borderRadius:9,padding:"10px",cursor:"pointer",fontSize:13,minHeight:42,
              WebkitTapHighlightColor:"transparent"}}>Cancel</button>
          <button onClick={save}
            style={{flex:2,background:T.gAccent,border:"none",color:"#0b0f0b",
              borderRadius:9,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:700,minHeight:42,
              WebkitTapHighlightColor:"transparent"}}>Save</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{position:"relative",marginBottom:8,borderRadius:12,overflow:"hidden"}}>
      {/* Red delete backing revealed on swipe */}
      <div style={{position:"absolute",inset:0,background:T.cal,
        display:"flex",alignItems:"center",justifyContent:"flex-end",
        paddingRight:20,color:"#fff",fontWeight:700,fontSize:14}}>
        Delete
      </div>
      <div
        onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
        style={{display:"flex",alignItems:"center",
          padding:"12px 14px",background:T.card,
          border:`1px solid ${T.border}`,borderRadius:12,
          transform:`translateX(${dragX}px)`,
          transition:dragging.current?"none":"transform .2s",
          position:"relative"}}>
        <button onClick={()=>{ setD({name:entry.name,calories:entry.calories,protein:entry.protein,carbs:entry.carbs,fat:entry.fat}); setEditing(true); }}
          style={{flex:1,minWidth:0,background:"none",border:"none",textAlign:"left",
            cursor:"pointer",padding:0,WebkitTapHighlightColor:"transparent"}}>
          <div style={{fontSize:14,color:T.text,fontWeight:600,marginBottom:4,
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{entry.name}</div>
          <div style={{display:"flex",gap:12}}>
            {[["cal",entry.calories,T.cal],["P",entry.protein,T.protein],
              ["C",entry.carbs,T.carbs],["F",entry.fat,T.fat]].map(([l,v,col])=>(
              <span key={l} style={{fontSize:12}}>
                <span style={{color:col}}>{Math.round(v)}</span>
                <span style={{color:T.muted}}>{l}</span>
              </span>
            ))}
          </div>
        </button>
        <button onClick={()=>{ haptic(20); onDelete(entry.id); }}
          style={{background:"none",border:"none",color:T.muted,cursor:"pointer",
            fontSize:20,minWidth:44,minHeight:44,display:"flex",alignItems:"center",
            justifyContent:"center",borderRadius:10,WebkitTapHighlightColor:"transparent",
            flexShrink:0,transition:"color .15s"}}
          onTouchStart={e=>e.currentTarget.style.color=T.cal}
          onTouchEnd={e=>e.currentTarget.style.color=T.muted}>×</button>
      </div>
    </div>
  );
};

export const Bubble = ({msg}) => {
  const isUser = msg.role==="user";
  const lines = (msg.content||"").split("\n").map(l=>l.trim()).filter(Boolean);
  return (
    <div style={{display:"flex",flexDirection:"column",
      alignItems:isUser?"flex-end":"flex-start",marginBottom:14}}>
      {msg.image && (
        <img src={msg.image} alt="meal"
          style={{maxWidth:"60%",borderRadius:14,marginBottom:6,
            border:`1px solid ${T.border}`}}/>
      )}
      <div style={{
        maxWidth:"82%",padding:"11px 15px",
        background:isUser?T.accent:T.ai,
        color:isUser?"#0b0f0b":T.text,
        borderRadius:isUser?"18px 18px 5px 18px":"18px 18px 18px 5px",
        border:isUser?"none":`1px solid ${T.border}`,
        fontSize:14,lineHeight:1.55,wordBreak:"break-word",
        whiteSpace:"pre-wrap",
      }}>
        {lines.length>1
          ? lines.map((l,i)=>(
              <div key={i} style={{marginBottom:i<lines.length-1?4:0}}>{l}</div>
            ))
          : msg.content}
      </div>
      {/* Source bubbles (branded/restaurant items only) */}
      {msg.sources && msg.sources.length>0 && (
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6,maxWidth:"82%"}}>
          {msg.sources.map((s,i)=>{
            let host = "source";
            try { host = new URL(s.url).hostname.replace(/^www\./,""); } catch {}
            return (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:5,
                  background:T.card,border:`1px solid ${T.border}`,borderRadius:99,
                  padding:"5px 11px",fontSize:11,color:T.info,textDecoration:"none",
                  maxWidth:"100%",WebkitTapHighlightColor:"transparent"}}>
                <span style={{fontSize:10}}>🔗</span>
                <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{host}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const GoalsSheet = ({goals,onSave,onClose}) => {
  const [g,setG] = useState({...goals});
  const set = (k,v) => setG(p=>({...p,[k]:v}));
  const total = g.protein*4+g.carbs*4+g.fat*9||1;
  const pp=Math.round(g.protein*4/total*100), cp=Math.round(g.carbs*4/total*100), fp=Math.round(g.fat*9/total*100);
  return (
    <div style={{position:"fixed",inset:0,background:T.overlay,zIndex:300,
      display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:T.surface,borderRadius:"20px 20px 0 0",
          width:"100%",maxHeight:"90vh",overflowY:"auto",
          padding:"0 18px env(safe-area-inset-bottom,20px)",
          border:`1px solid ${T.border}`,borderBottom:"none"}}>
        <div style={{width:36,height:4,background:T.border,borderRadius:2,margin:"14px auto 18px"}}/>
        <div style={{fontSize:11,color:T.accent,letterSpacing:"0.15em",marginBottom:2}}>CUSTOMIZE</div>
        <div style={{fontSize:22,fontWeight:800,marginBottom:18}}>Daily Goals</div>

        {/* Presets */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:T.muted,letterSpacing:"0.1em",marginBottom:10}}>QUICK PRESETS</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {PRESETS.map(p=>(
              <button key={p.name} onClick={()=>setG(prev=>({...prev,...p}))}
                style={{background:T.card,border:`1px solid ${T.border}`,color:T.text,
                  borderRadius:20,padding:"8px 14px",cursor:"pointer",fontSize:13,
                  minHeight:40,WebkitTapHighlightColor:"transparent"}}>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {[{k:"calories",label:"Calories",unit:"kcal",col:T.cal,min:500,max:5000,step:50},
          {k:"protein",label:"Protein",unit:"g",col:T.protein,min:20,max:400,step:5},
          {k:"carbs",label:"Carbs",unit:"g",col:T.carbs,min:20,max:600,step:5},
          {k:"fat",label:"Fat",unit:"g",col:T.fat,min:10,max:250,step:5},
        ].map(({k,label,unit,col,min,max,step})=>(
          <div key={k} style={{marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:14,color:col}}>{label}</span>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <input type="number" value={g[k]}
                  onChange={e=>set(k,Math.max(min,Math.min(max,+e.target.value)))}
                  inputMode="numeric"
                  style={{width:76,background:T.card,border:`1px solid ${T.border}`,
                    borderRadius:8,padding:"6px 8px",color:col,fontSize:16,
                    fontWeight:700,textAlign:"center",outline:"none"}}/>
                <span style={{fontSize:12,color:T.muted}}>{unit}</span>
              </div>
            </div>
            <input type="range" min={min} max={max} step={step} value={g[k]}
              onChange={e=>set(k,+e.target.value)}
              style={{width:"100%",accentColor:col,cursor:"pointer",height:6,touchAction:"pan-y"}}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
              <span style={{fontSize:10,color:T.muted}}>{min}</span>
              <span style={{fontSize:10,color:T.muted}}>{max}</span>
            </div>
          </div>
        ))}

        {/* Ratio bar */}
        <div style={{background:T.card,borderRadius:12,padding:"12px 14px",marginBottom:20,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:11,color:T.muted,letterSpacing:"0.1em",marginBottom:9}}>MACRO SPLIT</div>
          <div style={{display:"flex",height:10,borderRadius:99,overflow:"hidden",marginBottom:8,gap:2}}>
            <div style={{width:`${pp}%`,background:T.protein,transition:"width .3s",borderRadius:99}}/>
            <div style={{width:`${cp}%`,background:T.carbs,  transition:"width .3s",borderRadius:99}}/>
            <div style={{width:`${fp}%`,background:T.fat,    transition:"width .3s",borderRadius:99}}/>
          </div>
          <div style={{display:"flex",gap:14}}>
            {[[`P ${pp}%`,T.protein],[`C ${cp}%`,T.carbs],[`F ${fp}%`,T.fat]].map(([l,c])=>(
              <span key={l} style={{fontSize:12,color:c}}>{l}</span>
            ))}
            <span style={{fontSize:12,color:T.muted,marginLeft:"auto"}}>~{g.protein*4+g.carbs*4+g.fat*9} kcal</span>
          </div>
        </div>

        <div style={{display:"flex",gap:10,paddingBottom:16}}>
          <button onClick={onClose}
            style={{flex:1,background:"none",border:`1px solid ${T.border}`,color:T.muted,
              borderRadius:12,padding:"14px",cursor:"pointer",fontSize:15,minHeight:52,
              WebkitTapHighlightColor:"transparent"}}>Cancel</button>
          <button onClick={()=>{onSave(g);onClose();}}
            style={{flex:2,background:T.accent,border:"none",color:"#0b0f0b",
              borderRadius:12,padding:"14px",cursor:"pointer",fontSize:15,fontWeight:700,
              minHeight:52,WebkitTapHighlightColor:"transparent"}}>Save Goals</button>
        </div>
      </div>
    </div>
  );
};

export const HistoryDrawer = ({open,allDays,selectedDay,onSelectDay,onClose,onNav,onExport,onImport,onShare,onSettings}) => {
  const days=Object.keys(allDays).filter(d=>allDays[d]?.length>0).sort((a,b)=>b.localeCompare(a));
  const [expanded, setExpanded] = useState(null);
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
        {[["chef","👨‍🍳  Chef"],["meals","🍱  Meal preps"],["programs","📋  Programs"],["profile","👤  Profile"],["week","📅  Week view"]].map(([tab,label])=>(
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
        <div style={{fontSize:10,color:T.accent,letterSpacing:"0.15em",marginBottom:10,
          paddingTop:12,borderTop:`1px solid ${T.border}`}}>HISTORY</div>
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

        {/* Data */}
        <div style={{fontSize:10,color:T.accent,letterSpacing:"0.15em",margin:"6px 0 10px",
          paddingTop:14,borderTop:`1px solid ${T.border}`}}>DATA</div>
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
      </div>
    </div>
  </>);
};

export const MealEditor = ({ meal, onSave, onDelete, onClose }) => {
  const isNew = meal === "new";
  const [name, setName] = useState(isNew ? "" : meal.name);
  const [containers, setContainers] = useState(isNew ? 1 : meal.containers || 1);
  const [ings, setIngs] = useState(
    isNew ? [{ name:"", calories:"", protein:"", carbs:"", fat:"" }] : [...meal.ingredients]
  );

  const setIng = (i, k, v) => setIngs(prev => prev.map((row, idx) => idx === i ? { ...row, [k]: v } : row));
  const addIng = () => setIngs(prev => [...prev, { name:"", calories:"", protein:"", carbs:"", fat:"" }]);
  const delIng = (i) => setIngs(prev => prev.filter((_, idx) => idx !== i));

  const [filling, setFilling] = useState(false);
  const [fillErr, setFillErr] = useState("");

  const autoFill = async () => {
    const named = ings.map((ing,idx)=>({idx, name:ing.name.trim()})).filter(x=>x.name);
    if (named.length===0) { setFillErr("Type at least one ingredient name first."); return; }
    setFilling(true); setFillErr("");
    try {
      const results = await estimateIngredients(named.map(x=>x.name));
      setIngs(prev => {
        const next = [...prev];
        named.forEach((x, j) => {
          const r = results[j];
          if (r) next[x.idx] = {
            name: next[x.idx].name,
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
      .map(i=>({ name:i.name.trim(), calories:+i.calories||0, protein:+i.protein||0, carbs:+i.carbs||0, fat:+i.fat||0 }));
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

  return (
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
          List your ingredients with amounts (e.g. "2 lbs chicken breast"). Tap Auto-fill and the AI adds the macros — or type them yourself.
        </div>
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
                  <input type="number" inputMode="numeric" value={ing[k]}
                    onChange={e=>setIng(i,k,e.target.value)} placeholder="0" style={numStyle}/>
                </div>
              ))}
            </div>
          </div>
        ))}
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
  );
};

export const PF_FIELD = {
  background:T.card, border:`1px solid ${T.border}`, borderRadius:8,
  padding:"10px 12px", color:T.text, fontSize:16, outline:"none", width:"100%",
};
export const PF_LABEL = { fontSize:12, color:T.muted, marginBottom:5 };
export const PfSection = ({title, children}) => (
  <div style={{background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,
    padding:"14px",marginBottom:12}}>
    <div style={{fontSize:11,color:T.accent,letterSpacing:"0.12em",marginBottom:12}}>{title}</div>
    {children}
  </div>
);
export const PfPills = ({value, options, onPick}) => (
  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
    {options.map(o=>(
      <button key={o} onClick={()=>onPick(o)}
        style={{background:value===o?T.accent:T.card,color:value===o?"#0b0f0b":T.text,
          border:`1px solid ${value===o?T.accent:T.border}`,borderRadius:20,
          padding:"8px 13px",fontSize:13,cursor:"pointer",minHeight:38,
          WebkitTapHighlightColor:"transparent"}}>{o}</button>
    ))}
  </div>
);

export const ProfileTab = ({ profile, goals, onSave, onApplyGoals, units="imperial" }) => {
  const [p, setP] = useState({...profile});
  const set = (k,v) => setP(prev=>({...prev,[k]:v}));
  const [saved, setSaved] = useState(false);
  const suggestion = suggestGoals(p);
  const [g, setG] = useState({...goals});
  const setGoal = (k,v) => setG(prev=>({...prev,[k]:+v||0}));
  const [goalsSaved, setGoalsSaved] = useState(false);
  const saveGoalsLocal = () => { onApplyGoals(g); setGoalsSaved(true); setTimeout(()=>setGoalsSaved(false),1500); };

  const field = PF_FIELD;
  const label = PF_LABEL;

  const doSave = () => { onSave(p); setSaved(true); setTimeout(()=>setSaved(false),1800); };

  return (
    <div style={{flex:1,overflowY:"auto",padding:"12px 14px",WebkitOverflowScrolling:"touch"}}>
      <div style={{fontSize:11,color:T.accent,letterSpacing:"0.12em",marginBottom:4}}>YOUR PROFILE</div>
      <div style={{fontSize:12,color:T.muted,marginBottom:14}}>
        Used to personalize the coaches and food suggestions. Stored only on your device.
      </div>

      <PfSection title="ABOUT YOU">
        <div style={label}>Name (what the app calls you)</div>
        <input value={p.name} onChange={e=>set("name",e.target.value)}
          placeholder="e.g. Brayden" style={field}/>
      </PfSection>

      <PfSection title="BODY STATS">
        <div style={{display:"flex",gap:10,marginBottom:12}}>
          <div style={{flex:1}}>
            <div style={label}>Age</div>
            <input type="number" inputMode="numeric" value={p.age} onChange={e=>set("age",e.target.value)} style={field}/>
          </div>
          <div style={{flex:1}}>
            <div style={label}>Weight ({weightUnit(units)})</div>
            <input type="number" inputMode="numeric" value={p.weight} onChange={e=>set("weight",e.target.value)} style={field}/>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <div style={label}>Height</div>
          <div style={{display:"flex",gap:10}}>
            <input type="number" inputMode="numeric" placeholder="ft" value={p.heightFt} onChange={e=>set("heightFt",e.target.value)} style={field}/>
            <input type="number" inputMode="numeric" placeholder="in" value={p.heightIn} onChange={e=>set("heightIn",e.target.value)} style={field}/>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <div style={label}>Wingspan (inches, optional — helps the coach with lift mechanics)
            <InfoDot title="Why wingspan?">
              Your arm span affects lift mechanics. Longer arms mean the bar travels
              farther on presses and pulls (a longer range of motion), which can make
              bench and deadlift feel harder and may favor certain grip widths or stances.
              <br/><br/>
              Measure fingertip-to-fingertip with arms stretched out wide, in inches.
              The coach uses it to tailor form cues — it's optional.
            </InfoDot>
          </div>
          <input type="number" inputMode="numeric" value={p.wingspanIn} onChange={e=>set("wingspanIn",e.target.value)}
            placeholder="e.g. 72" style={field}/>
        </div>
        <div style={label}>Sex (for calorie math)</div>
        <PfPills value={p.sex} options={["Male","Female"]} onPick={v=>set("sex",v)}/>
      </PfSection>

      <PfSection title="TRAINING">
        <div style={{marginBottom:12}}>
          <div style={label}>Experience</div>
          <PfPills value={p.experience} options={["Beginner","Intermediate","Advanced"]} onPick={v=>set("experience",v)}/>
        </div>
        <div style={{marginBottom:12}}>
          <div style={label}>Days per week</div>
          <PfPills value={p.daysPerWeek} options={["1","2","3","4","5","6","7"]} onPick={v=>set("daysPerWeek",v)}/>
        </div>
        <div>
          <div style={label}>Main training goal</div>
          <PfPills value={p.trainingGoal} options={["Strength","Hypertrophy","Endurance","General fitness"]} onPick={v=>set("trainingGoal",v)}/>
        </div>
      </PfSection>

      <PfSection title="GOAL">
        <div style={{marginBottom:12}}>
          <div style={label}>Direction</div>
          <PfPills value={p.goalType} options={["Cut","Maintain","Bulk"]} onPick={v=>set("goalType",v)}/>
        </div>
        <div>
          <div style={label}>Target weight (lbs, optional)</div>
          <input type="number" inputMode="numeric" value={p.targetWeight} onChange={e=>set("targetWeight",e.target.value)} style={field}/>
        </div>
      </PfSection>

      <PfSection title="DIET">
        <div style={{marginBottom:12}}>
          <div style={label}>Preferences (e.g. high protein, vegetarian)</div>
          <input value={p.dietPrefs} onChange={e=>set("dietPrefs",e.target.value)} style={field} placeholder="optional"/>
        </div>
        <div style={{marginBottom:12}}>
          <div style={label}>Allergies</div>
          <input value={p.allergies} onChange={e=>set("allergies",e.target.value)} style={field} placeholder="e.g. peanuts, shellfish"/>
        </div>
        <div>
          <div style={label}>Restrictions (e.g. no pork, gluten-free)</div>
          <input value={p.restrictions} onChange={e=>set("restrictions",e.target.value)} style={field} placeholder="optional"/>
        </div>
      </PfSection>

      {/* Suggested goals */}
      {suggestion && (
        <div style={{background:T.surface,borderRadius:14,border:`1px solid ${T.accent}55`,
          padding:"14px",marginBottom:12}}>
          <div style={{fontSize:11,color:T.accent,letterSpacing:"0.12em",marginBottom:10}}>
            SUGGESTED DAILY GOALS
            <InfoDot title="How these are estimated">
              We estimate the calories your body burns daily using the Mifflin–St Jeor
              equation (a standard formula based on your age, sex, height, and weight),
              then adjust for how many days a week you train.
              <br/><br/>
              If your goal is Cut, we subtract ~500 cal for fat loss; Bulk adds ~350 for
              gaining. Protein is set near 1g per pound of bodyweight, fat around 25% of
              calories, and the rest goes to carbs.
              <br/><br/>
              These are a solid starting point, not medical advice — adjust based on how
              your body responds over a few weeks.
            </InfoDot>
          </div>
          <div style={{display:"flex",gap:16,marginBottom:12}}>
            {[[`${suggestion.calories}`,"cal",T.cal],[`${suggestion.protein}g`,"P",T.protein],
              [`${suggestion.carbs}g`,"C",T.carbs],[`${suggestion.fat}g`,"F",T.fat],
              [`${toDisplayWater(suggestion.water, units)}`,`${waterUnit(units)} water`,T.info]].map(([v,l,c])=>(
              <div key={l}>
                <span style={{fontSize:18,fontWeight:800,color:c}}>{v}</span>
                <span style={{fontSize:11,color:T.muted,marginLeft:2}}>{l}</span>
              </div>
            ))}
          </div>
          <div style={{fontSize:11,color:T.muted,marginBottom:10}}>
            Estimated from your stats. You can apply these or keep your current goals
            (cal {goals.calories}, P {goals.protein}, C {goals.carbs}, F {goals.fat}).
          </div>
          <button onClick={()=>{ onApplyGoals(suggestion); setG(suggestion); }}
            style={{width:"100%",background:T.accent,border:"none",color:"#0b0f0b",
              borderRadius:10,padding:"12px",fontWeight:700,fontSize:14,cursor:"pointer",
              minHeight:46,WebkitTapHighlightColor:"transparent"}}>
            Apply suggested goals
          </button>
        </div>
      )}

      {/* Editable daily goals */}
      <PfSection title={<>DAILY GOALS <InfoDot title="Macros explained">
        Your daily targets. "Macros" are the three nutrients that make up calories:
        <br/><br/>
        Protein (4 cal/g) — builds and repairs muscle; key when training.<br/>
        Carbs (4 cal/g) — your body's main energy source.<br/>
        Fat (9 cal/g) — hormones, vitamin absorption, long-lasting energy.
        <br/><br/>
        Calories are the total of all three. Hitting your protein target matters most
        for body composition; calories matter most for weight change.
      </InfoDot></>}>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          {[["calories","Calories",T.cal],["protein","Protein (g)",T.protein],
            ["carbs","Carbs (g)",T.carbs],["fat","Fat (g)",T.fat]].map(([k,lbl,col])=>(
            <div key={k} style={{flex:1,minWidth:0}}>
              <div style={{fontSize:10,color:col,marginBottom:4,textAlign:"center"}}>{lbl}</div>
              <input type="number" inputMode="numeric" value={g[k]}
                onChange={e=>setGoal(k,e.target.value)}
                style={{...field,textAlign:"center",padding:"9px 4px",fontSize:15,fontWeight:700}}/>
            </div>
          ))}
        </div>
        {/* Water goal */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,color:T.info,marginBottom:4,display:"flex",alignItems:"center"}}>
            WATER GOAL ({waterUnit(units)})
            <InfoDot title="Water goal">
              How many ounces you're aiming to drink per day. A common guideline is
              roughly half to one ounce per pound of bodyweight, more if you train hard
              or it's hot. The suggested value below is based on your weight and how
              often you train — adjust to whatever feels right for you.
            </InfoDot>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="number" inputMode="numeric" value={g.water}
              onChange={e=>setGoal("water",e.target.value)}
              style={{...field,flex:1,minWidth:0,textAlign:"center",padding:"9px 4px",fontSize:15,fontWeight:700}}/>
            {suggestion && (
              <button onClick={()=>setG(prev=>({...prev,water:suggestion.water}))}
                style={{background:T.info+"22",border:`1px solid ${T.info}66`,color:T.info,
                  borderRadius:8,padding:"9px 12px",fontSize:12,fontWeight:600,cursor:"pointer",
                  whiteSpace:"nowrap",minHeight:42,WebkitTapHighlightColor:"transparent"}}>
                Use {toDisplayWater(suggestion.water, units)}
              </button>
            )}
          </div>
        </div>
        <button onClick={saveGoalsLocal}
          style={{width:"100%",background:goalsSaved?T.accent:T.gAccent,border:"none",color:"#0b0f0b",
            borderRadius:10,padding:"12px",fontWeight:700,fontSize:14,cursor:"pointer",
            minHeight:46,WebkitTapHighlightColor:"transparent"}}>
          {goalsSaved ? "✓ Goals saved" : "Save goals"}
        </button>
      </PfSection>

      <button onClick={doSave}
        style={{width:"100%",background:saved?T.accent:T.info,border:"none",color:"#0b0f0b",
          borderRadius:12,padding:"14px",fontWeight:700,fontSize:15,cursor:"pointer",
          minHeight:52,WebkitTapHighlightColor:"transparent",marginBottom:8}}>
        {saved ? "✓ Saved" : "Save Profile"}
      </button>
      <div style={{height:"env(safe-area-inset-bottom,20px)"}}/>
    </div>
  );
};

export const Confetti = ({ big }) => {
  const colors = [T.accent, T.carbs, T.fat, T.info, "#a3e635", "#f472b6"];
  const count = big ? 80 : 28;
  const pieces = Array.from({length:count}).map((_,i)=>{
    const left = Math.random()*100;
    const delay = Math.random()*0.3;
    const dur = 1.6 + Math.random()*1.2;
    const size = 6 + Math.random()*6;
    const color = colors[i%colors.length];
    const rot = Math.random()*360;
    return (
      <div key={i} style={{position:"absolute",top:"-20px",left:`${left}%`,
        width:size,height:size*0.6,background:color,borderRadius:2,
        transform:`rotate(${rot}deg)`,
        animation:`confettiFall ${dur}s ${delay}s cubic-bezier(.3,.6,.5,1) forwards`}}/>
    );
  });
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:500,overflow:"hidden"}}>
      {pieces}
    </div>
  );
};

export const Toast = ({ text }) => (
  <div style={{position:"fixed",left:"50%",bottom:"22%",transform:"translateX(-50%)",
    background:T.gAccent,color:"#0b0f0b",fontWeight:800,fontSize:15,
    padding:"12px 20px",borderRadius:99,zIndex:510,maxWidth:"86%",textAlign:"center",
    boxShadow:`0 6px 24px ${T.accent}66`,animation:"toastPop .35s ease",pointerEvents:"none"}}>
    {text}
  </div>
);

export const BarcodeScanner = ({ onDetected, onClose }) => {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [err, setErr] = useState("");

  useEffect(()=>{
    let cancelled = false;
    let reader = null;
    (async ()=>{
      try {
        const mod = await import("https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/+esm");
        if (cancelled) return;
        const { BrowserMultiFormatReader } = mod;
        reader = new BrowserMultiFormatReader();
        controlsRef.current = await reader.decodeFromVideoDevice(
          undefined, videoRef.current,
          (result, e) => {
            if (result && !cancelled) {
              const text = result.getText();
              if (text) { onDetected(text); }
            }
          }
        );
      } catch (e) {
        if (!cancelled) setErr("Couldn't start the camera. Make sure camera access is allowed.");
      }
    })();
    return ()=>{
      cancelled = true;
      try { controlsRef.current?.stop?.(); } catch {}
      try { reader?.reset?.(); } catch {}
    };
  },[onDetected]);

  return (
    <div style={{position:"fixed",inset:0,background:"#000",zIndex:540,
      display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"env(safe-area-inset-top,16px) 16px 12px"}}>
        <span style={{color:"#fff",fontSize:16,fontWeight:700}}>Scan a barcode</span>
        <button onClick={onClose}
          style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",
            borderRadius:99,minWidth:40,minHeight:40,fontSize:18,cursor:"pointer",
            WebkitTapHighlightColor:"transparent"}}>✕</button>
      </div>
      <div style={{flex:1,position:"relative",overflow:"hidden"}}>
        <video ref={videoRef} playsInline muted
          style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        {/* Scan frame */}
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          width:"70%",height:120,border:`2px solid ${T.accent}`,borderRadius:12,
          boxShadow:"0 0 0 9999px rgba(0,0,0,0.45)"}}/>
        {err && (
          <div style={{position:"absolute",bottom:40,left:20,right:20,
            background:T.surface,border:`1px solid ${T.cal}66`,borderRadius:12,
            padding:14,color:T.text,fontSize:13,textAlign:"center"}}>{err}</div>
        )}
      </div>
      <div style={{padding:"14px 20px env(safe-area-inset-bottom,20px)",
        textAlign:"center",color:"#bbb",fontSize:12,background:"#000"}}>
        Point at a product barcode — it scans automatically.
      </div>
    </div>
  );
};

export const ScanConfirm = ({ initial, code, notFound, onLog, onClose }) => {
  const [d, setD] = useState(initial || {name:"",calories:"",protein:"",carbs:"",fat:""});
  const set = (k,v)=>setD(p=>({...p,[k]:v}));
  const [servingAmt, setServingAmt] = useState("");
  const [servingUnit, setServingUnit] = useState("g");
  const [servingCount, setServingCount] = useState(1);
  const numF = {background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,
    padding:"9px 4px",color:T.text,fontSize:15,textAlign:"center",width:"100%",outline:"none",fontWeight:700};
  const canLog = d.name.trim();
  const UNITS = ["g","oz","mL","cup","tbsp","tsp","piece","serving"];
  const submit = () => {
    if (!canLog) return;
    const n = Math.max(1, Math.round(+servingCount)||1);
    const serving = servingAmt && +servingAmt>0 ? ` (${+servingAmt} ${servingUnit})` : "";
    onLog({
      name:d.name.trim()+serving+(n>1?` x${n}`:""),
      calories:(+d.calories||0)*n, protein:(+d.protein||0)*n,
      carbs:(+d.carbs||0)*n, fat:(+d.fat||0)*n,
    });
  };
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:T.overlay,zIndex:545,
      display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:T.surface,border:`1px solid ${T.accent}55`,borderRadius:18,
          padding:"20px",maxWidth:360,width:"100%",boxShadow:`0 10px 50px #000a`,
          maxHeight:"86vh",overflowY:"auto"}}>
        <div style={{fontSize:11,color:T.accent,letterSpacing:"0.12em",marginBottom:4}}>
          {notFound ? "NOT IN DATABASE — ENTER MANUALLY" : "SCANNED PRODUCT"}
        </div>
        <div style={{fontSize:11,color:T.muted,marginBottom:14}}>
          {initial?.basis ? `Values ${initial.basis}. ` : ""}
          Edit anything, then log. We'll remember this barcode next time.
        </div>
        <input value={d.name} onChange={e=>set("name",e.target.value)}
          placeholder="Product name"
          style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,
            padding:"10px 12px",color:T.text,fontSize:16,outline:"none",marginBottom:12}}/>
        {/* Serving size — especially useful for unrecognized items */}
        <div style={{fontSize:10,color:T.muted,marginBottom:5,letterSpacing:"0.06em"}}>
          SERVING SIZE {notFound ? "" : "(optional)"}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <input type="number" inputMode="decimal" value={servingAmt}
            onChange={e=>setServingAmt(e.target.value)} placeholder="amount"
            style={{flex:1,minWidth:0,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,
              padding:"10px 12px",color:T.text,fontSize:16,outline:"none"}}/>
          <select value={servingUnit} onChange={e=>setServingUnit(e.target.value)}
            style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,
              padding:"10px",color:T.text,fontSize:15,outline:"none",minWidth:92,
              WebkitAppearance:"none",appearance:"none"}}>
            {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        {/* Number of servings to log */}
        <div style={{fontSize:10,color:T.muted,marginBottom:5,letterSpacing:"0.06em"}}>HOW MANY SERVINGS?</div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[1,2,3,4].map(n=>(
            <button key={n} onClick={()=>setServingCount(n)}
              style={{flex:1,background:servingCount===n?T.gAccent:T.card,
                border:`1px solid ${servingCount===n?T.accent:T.border}`,
                color:servingCount===n?"#0b0f0b":T.text,borderRadius:8,padding:"10px",
                fontSize:14,fontWeight:700,cursor:"pointer",minHeight:40,
                WebkitTapHighlightColor:"transparent"}}>{n}</button>
          ))}
          <input type="number" inputMode="numeric" min="1" value={servingCount}
            onChange={e=>setServingCount(+e.target.value||1)}
            style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,
              padding:"10px 4px",color:T.text,fontSize:14,fontWeight:700,textAlign:"center",outline:"none"}}/>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          {[["calories","cal",T.cal],["protein","P",T.protein],["carbs","C",T.carbs],["fat","F",T.fat]].map(([k,lbl,col])=>(
            <div key={k} style={{flex:1}}>
              <div style={{fontSize:9,color:col,textAlign:"center",marginBottom:3}}>{lbl}</div>
              <input type="number" inputMode="numeric" value={d[k]} onChange={e=>set(k,e.target.value)} style={numF}/>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose}
            style={{flex:1,background:"none",border:`1px solid ${T.border}`,color:T.muted,
              borderRadius:12,padding:"13px",cursor:"pointer",fontSize:14,minHeight:48,
              WebkitTapHighlightColor:"transparent"}}>Cancel</button>
          <button onClick={submit}
            disabled={!canLog}
            style={{flex:2,background:T.gAccent,border:"none",color:"#0b0f0b",
              borderRadius:12,padding:"13px",cursor:"pointer",fontSize:14,fontWeight:700,minHeight:48,
              opacity:canLog?1:0.4,WebkitTapHighlightColor:"transparent"}}>
            Log it
          </button>
        </div>
      </div>
    </div>
  );
};

export const GeneralSettings = ({ settings, onSet, barcodes, onDeleteBarcode, onClearData }) => {
  const [showCache, setShowCache] = useState(false);
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

export const SettingsModal = ({ current, onApply, onClose, settings, onSet, barcodes, onDeleteBarcode, onClearData, onTry }) => {
  const base = current || THEMES[0];
  const [custom, setCustom] = useState({
    bg: base.bg, surface: base.surface, card: base.card, border: base.border,
    text: base.text, muted: base.muted, accent: base.accent, accent2: base.accent2 || base.accent,
  });
  const [tab, setTab] = useState("general"); // general | presets | custom
  const currentId = current?.id || (current ? "custom" : "emerald");

  const Swatch = ({ t }) => {
    const selected = currentId===t.id;
    return (
      <button onClick={()=>onApply({...t})}
        style={{display:"flex",alignItems:"center",gap:10,width:"100%",
          background:t.surface,border:`2px solid ${selected?t.accent:T.border}`,
          borderRadius:12,padding:"12px 14px",cursor:"pointer",marginBottom:8,
          WebkitTapHighlightColor:"transparent"}}>
        <div style={{display:"flex",gap:4}}>
          <span style={{width:18,height:18,borderRadius:"50%",background:t.accent}}/>
          <span style={{width:18,height:18,borderRadius:"50%",background:t.accent2||t.accent}}/>
          <span style={{width:18,height:18,borderRadius:"50%",background:t.card,border:`1px solid ${t.border}`}}/>
        </div>
        <span style={{flex:1,textAlign:"left",fontSize:14,fontWeight:600,color:t.text}}>{t.name}</span>
        {selected && <span style={{color:t.accent,fontSize:14,fontWeight:800}}>✓</span>}
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
            <div style={{fontSize:18,fontWeight:800}}>Appearance</div>
          </div>
          <button onClick={onClose}
            style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
              borderRadius:10,minWidth:38,minHeight:38,cursor:"pointer",fontSize:14,
              WebkitTapHighlightColor:"transparent"}}>✕</button>
        </div>
        {/* Tab switch */}
        <div style={{display:"flex",gap:6,padding:"12px 14px 0"}}>
          {[["general","General"],["presets","Appearance"],["history","History"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{flex:1,background:tab===id?T.gAccent:T.card,
                color:tab===id?"#0b0f0b":T.text,border:`1px solid ${T.border}`,
                borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",
                minHeight:40,WebkitTapHighlightColor:"transparent"}}>{lbl}</button>
          ))}
        </div>
        <div style={{overflowY:"auto",padding:"14px",WebkitOverflowScrolling:"touch"}}>
          {tab==="general" ? (
            <GeneralSettings settings={settings} onSet={onSet} barcodes={barcodes}
              onDeleteBarcode={onDeleteBarcode} onClearData={onClearData}/>
          ) : tab==="presets" ? (
            <>
              {THEMES.map(t=><Swatch key={t.id} t={t}/>)}
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

export const VersionHistoryPanel = ({ onTry }) => {
  const [open, setOpen] = useState(CHANGELOG[0]?.version || null);
  return (
    <div>
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
        background:T.gHeader,WebkitBackgroundClip:"text",backgroundClip:"text",
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
  const addExercise = (did) => setDraft(d=>({...d,days:d.days.map(dy=>dy.id===did?{...dy,exercises:[...dy.exercises,{id:newId(),name:"",sets:3,reps:"8-10",weight:"",notes:""}]}:dy)}));
  const removeExercise = (did,eid) => setDraft(d=>({...d,days:d.days.map(dy=>dy.id===did?{...dy,exercises:dy.exercises.filter(e=>e.id!==eid)}:dy)}));
  const setEx = (did,eid,key,val) => setDraft(d=>({...d,days:d.days.map(dy=>dy.id===did?{...dy,exercises:dy.exercises.map(e=>e.id===eid?{...e,[key]:val}:e)}:dy)}));

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
                  <div style={{fontSize:12,color:T.muted,marginTop:2}}>
                    {ex.sets} sets · {ex.reps} reps{ex.weight?` · ${ex.weight}`:""}
                    {ex.notes?<span style={{display:"block",marginTop:2,color:T.muted}}>{ex.notes}</span>:null}
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
              <div style={{display:"flex",gap:6,marginBottom:6}}>
                <input value={ex.name} onChange={e=>setEx(day.id,ex.id,"name",e.target.value)}
                  placeholder="Exercise name"
                  style={{...smallField,flex:1}}/>
                <button onClick={()=>removeExercise(day.id,ex.id)}
                  style={{background:"none",border:"none",color:T.cal,fontSize:16,cursor:"pointer",
                    minWidth:32,minHeight:32,WebkitTapHighlightColor:"transparent"}}>×</button>
              </div>
              <div style={{display:"flex",gap:6}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,color:T.muted,marginBottom:3}}>SETS</div>
                  <input type="number" inputMode="numeric" value={ex.sets}
                    onChange={e=>setEx(day.id,ex.id,"sets",+e.target.value||1)}
                    style={{...smallField,textAlign:"center"}}/>
                </div>
                <div style={{flex:1.5}}>
                  <div style={{fontSize:10,color:T.muted,marginBottom:3}}>REPS</div>
                  <input value={ex.reps} onChange={e=>setEx(day.id,ex.id,"reps",e.target.value)}
                    placeholder="8-10" style={smallField}/>
                </div>
                <div style={{flex:1.5}}>
                  <div style={{fontSize:10,color:T.muted,marginBottom:3}}>WEIGHT</div>
                  <input value={ex.weight} onChange={e=>setEx(day.id,ex.id,"weight",e.target.value)}
                    placeholder="135 lbs" style={smallField}/>
                </div>
              </div>
              <input value={ex.notes} onChange={e=>setEx(day.id,ex.id,"notes",e.target.value)}
                placeholder="Notes (optional)" style={{...smallField,marginTop:6}}/>
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
