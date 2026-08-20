// src/NutriLog.jsx
// NutriLog v1.5.2 — single-file application source.
//
// Future app updates should normally require replacing ONLY this file.
// main.jsx is a permanent launcher. api/chat.js is the stable server-side AI proxy.

import React, { useState, useEffect, useRef } from "react";

// ============================================================================
// HELPERS, STORAGE, AI PROMPTS & UI COMPONENTS
// ============================================================================

export const APP_VERSION = "1.5.2";

export const CHANGELOG = [
  { version:"1.5.2", date:"Aug 2026", notes:[
    { text:"Single-file app updates — NutriLog now lives in one source file", action:"chat" },
    { text:"Revamped AI nutrition resolver with verified, database, standardized & estimated sources", action:"chat" },
    { text:"Smarter restaurant receipts, quantities, barcode scaling & food-source confidence", action:"scan" },
  ]},
  { version:"1.5.0", date:"Aug 2026", notes:[
    { text:"New nutrition resolution engine — AI identifies foods, NutriLog resolves macros", action:"chat" },
    { text:"Receipt-aware logging with line-item extraction instead of blind macro guessing", action:"chat" },
    { text:"Quantity-safe restaurant and packaged-food logging", action:"chat" },
    { text:"Barcode serving sizes now scale nutrition correctly", action:"scan" },
    { text:"Logged foods now preserve source, basis, and confidence metadata", action:"log" },
  ]},
  { version:"1.4.1", date:"Jun 2026", notes:[
    { text:"Smarter lift matching — variations of a lift count as the same", action:"workouts" },
    { text:"Rename a lift to merge its history across all days", action:"workouts" },
    { text:"More accurate macro Auto-fill for meal preps", action:"meals" },
  ]},
  { version:"1.4.0", date:"Jun 2026", notes:[
    { text:"One unified AI assistant for food, workouts, meals & questions", action:"chat" },
    { text:"Each reply is tagged with what it handled", action:"chat" },
    { text:"Programs moved to the main tab bar", action:"programs" },
    { text:"Coach and Chef merged into the assistant", action:"chat" },
  ]},
  { version:"1.3.1", date:"Jun 2026", notes:[
    { text:"Edit logged sets and exercise names", action:"workouts" },
    { text:"Workout session highlights with PR badges", action:"workouts" },
    { text:"Smarter PR detection across your full history", action:"workouts" },
    { text:"Build programs set-by-set with individual weights", action:"programs" },
  ]},
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
  const fields = [
    "product_name","brands","nutriments","serving_size","serving_quantity"
  ].join(",");
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${fields}`);
  if (!res.ok) throw new Error("lookup failed");
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;

  const p = data.product;
  const n = p.nutriments || {};
  const num = (key) => {
    const v = +n[key];
    return Number.isFinite(v) ? v : null;
  };

  let servingGrams = null;
  if (Number.isFinite(+p.serving_quantity) && +p.serving_quantity > 0) servingGrams = +p.serving_quantity;
  if (!servingGrams && p.serving_size) {
    const m = String(p.serving_size).match(/(\d+(?:\.\d+)?)\s*g\b/i);
    if (m) servingGrams = +m[1];
  }

  const kcal100 = num("energy-kcal_100g") ?? (num("energy_100g") != null ? num("energy_100g") / 4.184 : null);
  const per100g = {
    calories:kcal100, protein:num("proteins_100g"), carbs:num("carbohydrates_100g"), fat:num("fat_100g")
  };
  const from100g = (v) => v != null && servingGrams ? v * servingGrams / 100 : null;
  const perServing = {
    calories:num("energy-kcal_serving") ?? from100g(per100g.calories),
    protein:num("proteins_serving") ?? from100g(per100g.protein),
    carbs:num("carbohydrates_serving") ?? from100g(per100g.carbs),
    fat:num("fat_serving") ?? from100g(per100g.fat),
  };
  const complete = (m) => Object.values(m).every(v=>v!=null && Number.isFinite(+v));
  if (!complete(perServing) && !complete(per100g)) return null;

  const brand = p.brands?.split(",")[0]?.trim() || "";
  const name = [brand,p.product_name].filter(Boolean).join(" ") || "Scanned item";
  const round1 = v => Math.round((+v||0)*10)/10;

  if (complete(perServing)) {
    return {
      name,
      calories:Math.round(perServing.calories), protein:round1(perServing.protein),
      carbs:round1(perServing.carbs), fat:round1(perServing.fat),
      basis:servingGrams ? `per serving (${servingGrams} g)` : (p.serving_size || "per serving"),
      baseUnit:"serving", baseGrams:servingGrams,
      per100g:complete(per100g) ? per100g : null,
      sourceType:"open_food_facts", confidence:"database", barcode:code,
    };
  }
  return {
    name,
    calories:Math.round(per100g.calories), protein:round1(per100g.protein),
    carbs:round1(per100g.carbs), fat:round1(per100g.fat),
    basis:"per 100g", baseUnit:"g", baseGrams:100, per100g,
    sourceType:"open_food_facts", confidence:"database", barcode:code,
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

// Parse a set detail string like "185 lbs × 8" → { weight, reps, volume }
export const parseSet = (detail="") => {
  const m = detail.match(/(\d+(?:\.\d+)?)\s*(?:lbs|lb|kg)?\s*[x×]\s*(\d+)/i);
  if (!m) return null;
  const weight = +m[1], reps = +m[2];
  return { weight, reps, volume: weight*reps };
};

// Normalize an exercise name so variations of the same lift match. Strips
// pure equipment words, maps synonyms, and sorts core tokens. Keeps modifiers
// that actually change the lift (incline/decline/close/wide) so they don't collide.
const EX_FILLER = new Set([
  "barbell","dumbbell","db","bb","cable","machine","smith","kettlebell","kb",
  "seated","standing","lying","the","a","with","and","to","rope","bar",
  "straight","ez","hammer","strength","plate","loaded","free","body","bodyweight","bw",
  "weighted","band","banded","assisted","alternating","alt",
  "flat","grip","wide","narrow","neutral","mid","width", // flat = default bench; grip width rarely a distinct lift
]);
const EX_SYNONYM = {
  "ohp":"overhead press", "rdl":"romanian deadlift", "sldl":"stiff leg deadlift",
  "bp":"bench press", "dl":"deadlift", "sq":"squat",
  "pulldown":"lat pulldown", "pulldowns":"lat pulldown",
  "pullup":"pull up", "pullups":"pull up", "chinup":"chin up", "chinups":"chin up",
  "pushup":"push up", "pushups":"push up", "facepull":"face pull", "facepulls":"face pull",
};
// Only singularize true plurals, not words like "press"/"triceps" that end in s.
const singular = (t) => /(ss|us|is)$/.test(t) ? t : t.replace(/s$/,"");
export const normName = (name="") => {
  let n = name.toLowerCase().trim().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
  if (EX_SYNONYM[n]) n = EX_SYNONYM[n]; // whole-string synonym
  let toks = n.split(" ").map(t=>EX_SYNONYM[t]||t).join(" ").split(" ");
  toks = toks.map(singular).filter(t=>t && !EX_FILLER.has(t));
  if (toks.length===0) toks = n.split(" ").map(singular);
  // dedupe + sort so order and accidental repeats don't matter
  return [...new Set(toks)].sort().join(" ");
};

// Group a day's flat workout entries by exercise name → { name, key, sets[], volume, topWeight, totalReps }
export const groupExercises = (list=[]) => {
  const map = {};
  for (const w of list) {
    const name = (w.name||"").trim();
    const key = normName(name);
    if (!map[key]) map[key] = { name, key, sets:[], volume:0, topWeight:0, totalReps:0, category:w.category };
    const p = parseSet(w.detail||"");
    map[key].sets.push({ ...w, parsed:p });
    if (p) { map[key].volume += p.volume; map[key].topWeight = Math.max(map[key].topWeight, p.weight); map[key].totalReps += p.reps; }
  }
  return Object.values(map);
};

// Analyze today's workout vs history. Returns { dayVolume, exercises:[{...,badges:[]}], summary, hasData }
export const analyzeWorkoutDay = (workouts, dayKey) => {
  const today = workouts[dayKey]||[];
  if (today.length===0) return { hasData:false };
  const todayGroups = groupExercises(today);
  const dayVolume = todayGroups.reduce((a,g)=>a+g.volume,0);

  // Build history: for each prior day (before dayKey), the grouped exercises
  const priorKeys = Object.keys(workouts).filter(k=>k<dayKey && (workouts[k]||[]).length>0).sort();
  // Most-recent prior performance per exercise (keyed by normalized name)
  const lastByName = {};
  for (const k of priorKeys) {
    for (const g of groupExercises(workouts[k])) {
      lastByName[g.key] = g; // later keys overwrite → ends as most recent
    }
  }
  // All-time best weight & volume per exercise (across all prior days)
  const bestByName = {};
  for (const k of priorKeys) {
    for (const g of groupExercises(workouts[k])) {
      const b = bestByName[g.key] || { topWeight:0, volume:0 };
      bestByName[g.key] = { topWeight:Math.max(b.topWeight,g.topWeight), volume:Math.max(b.volume,g.volume) };
    }
  }

  let bestLift = null, biggestJump = null;
  const exercises = todayGroups.map(g=>{
    const badges = [];
    const prev = lastByName[g.key];
    const best = bestByName[g.key];
    // Weight PR
    if (best && g.topWeight > best.topWeight && g.topWeight>0) badges.push({ type:"pr", label:"Weight PR", emoji:"🏆" });
    // Volume PR
    if (best && g.volume > best.volume && g.volume>0) badges.push({ type:"volpr", label:"Volume PR", emoji:"📈" });
    // Up from last time (volume)
    let volDelta = null;
    if (prev && prev.volume>0) {
      volDelta = Math.round((g.volume - prev.volume)/prev.volume*100);
      if (volDelta >= 5) badges.push({ type:"up", label:`+${volDelta}% volume`, emoji:"⬆️" });
      else if (volDelta <= -5) badges.push({ type:"down", label:`${volDelta}% volume`, emoji:"⬇️" });
    }
    // Track biggest jump for the summary
    if (volDelta!=null && (biggestJump==null || volDelta>biggestJump.delta)) biggestJump = { name:g.name, delta:volDelta };
    if (g.topWeight>0 && (bestLift==null || g.topWeight>bestLift.weight)) bestLift = { name:g.name, weight:g.topWeight };
    const isNew = !prev;
    if (isNew && g.topWeight>0) badges.push({ type:"new", label:"First time logged", emoji:"✨" });
    return { ...g, badges, volDelta, isNew };
  });

  // Build a one-line summary
  const prCount = exercises.reduce((a,e)=>a+e.badges.filter(b=>b.type==="pr"||b.type==="volpr").length,0);
  let summary = "";
  if (prCount>0) {
    summary = `${prCount} personal record${prCount>1?"s":""} today — strong session.`;
  } else if (biggestJump && biggestJump.delta>=5) {
    summary = `Volume up ${biggestJump.delta}% on ${biggestJump.name} vs last time.`;
  } else if (biggestJump && biggestJump.delta<=-5) {
    summary = `Lighter day — volume down on ${biggestJump.name}. Recovery counts too.`;
  } else if (bestLift) {
    summary = `Top lift: ${bestLift.weight} lbs on ${bestLift.name}. Solid, steady work.`;
  } else {
    summary = `${exercises.length} exercise${exercises.length>1?"s":""} logged. Keep stacking sessions.`;
  }

  const isStandoutDay = prCount>0 || (biggestJump && biggestJump.delta>=15);
  return { hasData:true, dayVolume, exercises, summary, prCount, bestLift, isStandoutDay };
};

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
    "You are a precise nutrition resolver. The user gives food ingredients each with a quantity. Return the TOTAL macros for the FULL quantity stated (not per serving, not per 100g).",
    "When an ingredient is a branded packaged food or restaurant item, use web search when available and prefer the brand/manufacturer/restaurant's official nutrition information over memory. For generic foods, prefer USDA/FoodData Central information. Never invent a source or silently change the user's quantity.",
    "METHOD — follow exactly for each ingredient:",
    "1. Convert the stated quantity to grams (1 lb = 453.6 g, 1 oz = 28.35 g, 1 kg = 1000 g). For volume/count items (cups, tbsp, pieces), use the standard gram weight for that food.",
    "2. Use the correct USDA per-100g values for the food AS DESCRIBED. Pay attention to COOKED vs RAW: if the name says 'cooked' use cooked values, otherwise assume the as-prepared state implied. Cooked chicken breast ≈ 165 cal / 31g protein per 100g. Raw chicken breast ≈ 120 cal / 23g per 100g. Cooked white rice ≈ 130 cal / 2.7g protein / 28g carb per 100g. Roasted potatoes with oil ≈ 150 cal per 100g.",
    "3. Scale per-100g values by (grams ÷ 100) to get the total. Example: 2300 g cooked chicken breast = 23 × 165 = 3795 cal, 23 × 31 = 713 g protein.",
    "4. SELF-CHECK each result: calories should ≈ protein×4 + carbs×4 + fat×9 (within ~10%). Also sanity-check the magnitude against the weight — a couple kg of meat is thousands of calories, not hundreds. If your numbers fail either check, recompute before answering.",
    "Reply with ONLY a JSON array, no markdown, no prose. One object per ingredient, SAME ORDER as given:",
    '[{"name":"2 lbs chicken breast","calories":1497,"protein":281,"carbs":0,"fat":33}]',
    "Keep the name exactly as the user wrote it. Round to whole numbers. Return ONLY the JSON array.",
  ].join(" ");
  const userText = "Ingredients:\n" + ingredientNames.map((n,i)=>`${i+1}. ${n}`).join("\n");

  const data = await fetchChat({ system: SYSTEM, messages: [{ role:"user", content:userText }], webSearch:true });
  const raw = (data.content || []).map(b => b.text || "").join("").trim();
  const clean = raw.replace(/^```[\w]*\s*/,"").replace(/\s*```$/,"").trim();
  let arr;
  try { arr = JSON.parse(clean); }
  catch { const m = clean.match(/\[[\s\S]*\]/); arr = m ? JSON.parse(m[0]) : null; }
  if (!Array.isArray(arr)) throw new Error("Couldn't read the AI's response");
  // Safety net: if stated calories are wildly inconsistent with the macros
  // (off by >25%), trust the macro breakdown and recompute calories from it.
  return arr.map(it=>{
    const p=+it.protein||0, c=+it.carbs||0, f=+it.fat||0, cal=+it.calories||0;
    const fromMacros = Math.round(p*4 + c*4 + f*9);
    if (fromMacros>0 && (cal===0 || Math.abs(cal-fromMacros)/fromMacros > 0.25)) {
      return { ...it, calories:fromMacros, protein:p, carbs:c, fat:f };
    }
    return { ...it, calories:cal, protein:p, carbs:c, fat:f };
  });
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
    '  save program: {"type":"save_program","program":{"name":"4-Day PPL","days":[{"name":"Push","exercises":[{"name":"Bench Press","sets":[{"weight":"185 lbs","reps":"8"},{"weight":"185 lbs","reps":"8"},{"weight":"185 lbs","reps":"6"}],"notes":""}]}]}}',
    "When the user asks you to build or design a workout program/plan, use save_program. Each day has a name and exercises. Each exercise has a name, a notes string, and a 'sets' ARRAY where every element is one set with its own weight and reps. List each set individually — do NOT use a set count with shared reps/weight.",
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

// ── Unified assistant: one brain that detects intent and handles food, workouts,
// meal preps, and general questions in a single thread. Returns a `mode` tag.
export async function callAssistant(messages, aiStyle) {
  const SYSTEM = [
    "You are NutriLog AI, the conversational intelligence layer for a fitness tracking app.",
    "You handle food logging, workouts, programs, meal preps, and general nutrition/training questions in one thread.",
    "You MUST return ONLY one valid JSON object. No markdown fences and no text outside the JSON.",
    'Format: {"message":"reply","mode":"food|workout|meal|general","actions":[],"workoutStatus":"none|partial|complete","standout":false}',
    "",
    "CORE FOOD PRINCIPLE: You interpret language; NutriLog resolves nutrition. For identifiable foods, do NOT pretend model memory is an authoritative nutrition database.",
    "When logging a normal restaurant item, branded food, packaged food, or ordinary whole food, emit resolve_food instead of add_entry.",
    'resolve_food: {"type":"resolve_food","food":{"name":"canonical food name","brand":"brand/restaurant or empty","quantity":1,"unit":"serving|packet|each|g|oz","kind":"restaurant|packaged|whole|unknown","fallback":{"name":"display name","calories":0,"protein":0,"carbs":0,"fat":0,"basis":"full requested quantity","source":"https://official-source-if-found","sourceType":"official_web|ai_estimate"}}}',
    "Quantity is sacred. Preserve exactly what the user states. Never turn one packet into 0.5 packets, one serving into half a serving, or four items into another count.",
    "If the user gives grams or ounces, preserve that exact weight. If they give a count, preserve the count.",
    "fallback macros are for the FULL requested quantity and are used only if deterministic resolution fails.",
    "For restaurant or branded foods, use web search when available BEFORE filling fallback macros. Prefer the restaurant/manufacturer's own nutrition page or official nutrition PDF. If an official source is found, put its exact URL in fallback.source and set fallback.sourceType to official_web. If no trustworthy official source is found, omit source, set sourceType to ai_estimate, and give a conservative estimate. Never invent a URL.",
    "For standardized whole foods, prefer USDA/FoodData Central information when web search is available. Preserve the stated quantity exactly; if the user only gives a count (for example 4 bananas), use a standard-size assumption and make that assumption explicit in fallback.basis.",
    "",
    "FOOD EXAMPLES:",
    '"log a fat free honey mustard packet from Chick-fil-A" -> resolve_food name Fat-Free Honey Mustard Dressing, brand Chick-fil-A, quantity 1, unit packet, kind restaurant.',
    '"log 2 fat free honey mustards" -> quantity 2; if recent context establishes Chick-fil-A, keep Chick-fil-A.',
    '"log 180 g cinnamon toast crunch" -> brand General Mills when clear, quantity 180, unit g, kind packaged.',
    '"log one serving of cinnamon toast crunch" -> quantity 1, unit serving. Do not reinterpret serving size.',
    '"log four bananas" -> name Banana, quantity 4, unit each, kind whole.',
    '"log a double butterburger from Culver\'s" -> brand Culver\'s, quantity 1, unit each, kind restaurant.',
    "",
    "RECEIPTS / IMAGES:",
    "First classify an image mentally as: restaurant receipt, nutrition label, identifiable packaged food, or ordinary food photo.",
    "For a RESTAURANT RECEIPT: extract only food/beverage line items, infer the restaurant when possible, expand clear abbreviations, preserve line quantities and modifiers, and emit one resolve_food per consumed menu item. Ignore subtotal, tax, tips, order IDs, prices, payment, loyalty data, employee names, and duplicate summary lines. Do not estimate the whole receipt as one meal.",
    "For a NUTRITION LABEL: the visible label is authoritative. Read serving size and macros directly. If the user states how many servings/grams they consumed, scale carefully and emit add_entry with sourceType nutrition_label and confidence verified_label.",
    "For an IDENTIFIABLE PACKAGED FOOD photo without a readable label: emit resolve_food using the product identity and stated quantity.",
    "For an ORDINARY FOOD PHOTO with no authoritative identity: estimate realistic portions and macros and use add_entry with sourceType ai_estimate and confidence estimated. Tell the user it is an estimate.",
    "",
    "DIRECT add_entry is reserved for: exact saved MealLibrary entries, visible nutrition labels, or unavoidable AI estimates for unidentifiable food.",
    'add_entry: {"type":"add_entry","entry":{"name":"Food","calories":0,"protein":0,"carbs":0,"fat":0,"sourceType":"ai_estimate","confidence":"estimated","basis":"what the estimate represents"}}',
    'remove food: {"type":"remove_entry","name":"partial name"}',
    'clear day: {"type":"clear_log"}',
    'edit goals: {"type":"update_goals","goals":{"calories":0,"protein":0,"carbs":0,"fat":0}}',
    "",
    "MEAL LIBRARY: MealLibrary in [STATE] contains exact per-container macros already calculated by the app. Fuzzy-match the user's saved meal name and use DIRECT add_entry with those exact macros. One add_entry per requested container. Do not re-estimate a saved meal.",
    "",
    "FOOD REPLY STYLE: Be concise. State what was interpreted/logged. Do not claim 'official', 'verified', or 'exact' unless the input itself was a visible nutrition label; the resolver decides source quality after your response.",
    "",
    "WORKOUTS:",
    "Tone is direct, technical, matter-of-fact. No hype and no drill-sergeant language.",
    'add workout: {"type":"add_workout","workout":{"name":"Bench Press","detail":"185 lbs × 8","category":"strength"}}',
    'remove workout: {"type":"remove_workout","name":"partial name"}',
    'save program: {"type":"save_program","program":{"name":"4-Day PPL","days":[{"name":"Push","exercises":[{"name":"Bench Press","sets":[{"weight":"185 lbs","reps":"8"}],"notes":""}]}]}}',
    "Create one add_workout per individual set. Never cram several sets into one detail. detail is only WEIGHT × REPS, BW × REPS, or cardio distance/time.",
    "Use consistent canonical exercise names. Keep modifiers that materially change the lift (Incline, Decline, Close-Grip, Front Squat, Romanian Deadlift); drop irrelevant wording when it is the same movement.",
    "workoutStatus: none if no workout logged, partial if some work is logged but the session is not complete for the user's level, complete when it is a full session. standout true only for a clearly supported PR or unusually large volume improvement.",
    "When useful, compare against workout history from [STATE], give 1-2 concrete cues, and a brief next-session progression suggestion.",
    "",
    "MEAL PREPS:",
    'save meal: {"type":"save_meal","meal":{"name":"Chicken & Rice Bowls","containers":5,"ingredients":[{"name":"2 lbs chicken breast","calories":1090,"protein":204,"carbs":0,"fat":24}]}}',
    "Meal ingredient macros are TOTAL batch macros. containers is the number of servings. Only save when the user actually asks to create/save the prep.",
    "",
    "GENERAL: For questions that are not logging requests, answer directly and use an empty actions array.",
    "Use USER PROFILE, USER NAME, HABITS, current goals/log, workouts, and MealLibrary from [STATE] when relevant. Respect allergies/restrictions. Habits may help interpret ambiguous repeat foods but NEVER override an explicit quantity, brand, size, or modifier.",
    styleHint(aiStyle),
    "Return ONLY the JSON object.",
  ].join(" ");

  const data = await fetchChat({ system: SYSTEM, messages, webSearch:true });
  const raw = (data.content || []).map(b => b.text || "").join("").trim();
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch {}
  if (!parsed) {
    const s = raw.replace(/^```[\w]*\s*/,"").replace(/\s*```$/,"").trim();
    try { parsed = JSON.parse(s); } catch {}
  }
  if (!parsed) {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) { try { parsed = JSON.parse(m[0]); } catch {} }
  }
  if (!parsed) parsed = { message:raw.length?raw.slice(0,400):"Something went wrong. Please try again.", actions:[] };
  if (!parsed.mode) parsed.mode = "general";
  if (!Array.isArray(parsed.actions)) parsed.actions = [];
  if (!parsed.workoutStatus) parsed.workoutStatus = "none";
  if (typeof parsed.standout !== "boolean") parsed.standout = false;

  // Minimal structural cleanup so malformed model actions cannot crash the app.
  parsed.actions = parsed.actions.filter(a=>a && typeof a==="object" && typeof a.type==="string");
  return parsed;
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
          {(entry.confidence || entry.basis) && (
            <div style={{display:"flex",gap:6,alignItems:"center",marginTop:5,flexWrap:"wrap"}}>
              {entry.confidence && (
                <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",
                  color:entry.confidence==="verified"||entry.confidence==="verified_label"?T.accent:entry.confidence==="estimated"?T.warn:T.info}}>
                  {entry.confidence==="verified"||entry.confidence==="verified_label"?"✓ verified":entry.confidence==="estimated"?"≈ estimated":entry.confidence.replaceAll("_"," ")}
                </span>
              )}
              {entry.basis && <span style={{fontSize:9,color:T.muted}}>· {entry.basis}</span>}
            </div>
          )}
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
  const MODE_TAG = {
    food:    { label:"Food",    emoji:"🍴", color:T.cal },
    workout: { label:"Workout", emoji:"🏋️", color:T.info },
    meal:    { label:"Meal prep", emoji:"👨‍🍳", color:T.accent },
    general: { label:"NutriLog AI", emoji:"💬", color:T.muted },
  };
  const tag = !isUser ? (MODE_TAG[msg.mode]||MODE_TAG.general) : null;
  return (
    <div style={{display:"flex",flexDirection:"column",
      alignItems:isUser?"flex-end":"flex-start",marginBottom:14}}>
      {tag && (
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4,paddingLeft:4}}>
          <span style={{fontSize:11}}>{tag.emoji}</span>
          <span style={{fontSize:10,color:tag.color,fontWeight:700,letterSpacing:"0.08em",
            textTransform:"uppercase"}}>{tag.label}</span>
        </div>
      )}
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
  const detectedBaseGrams = Number.isFinite(+initial?.baseGrams) ? +initial.baseGrams : null;
  const [servingAmt, setServingAmt] = useState(detectedBaseGrams ? String(detectedBaseGrams) : "");
  const [servingUnit, setServingUnit] = useState(initial?.baseUnit === "g" ? "g" : "serving");
  const [servingCount, setServingCount] = useState(1);
  const numF = {background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,
    padding:"9px 4px",color:T.text,fontSize:15,textAlign:"center",width:"100%",outline:"none",fontWeight:700};
  const canLog = d.name.trim();
  const UNITS = ["serving","g","oz","mL","cup","tbsp","tsp","piece"];

  const scaledMacros = () => {
    const n = Math.max(1, Math.round(+servingCount)||1);
    if (initial?.per100g && servingAmt && +servingAmt>0 && ["g","oz"].includes(servingUnit)) {
      const grams = servingUnit==="g" ? +servingAmt : +servingAmt*28.349523125;
      const mult = (grams/100)*n;
      const r1 = v=>Math.round(v*10)/10;
      return {
        calories:Math.round((+initial.per100g.calories||0)*mult),
        protein:r1((+initial.per100g.protein||0)*mult),
        carbs:r1((+initial.per100g.carbs||0)*mult),
        fat:r1((+initial.per100g.fat||0)*mult),
      };
    }
    return {
      calories:(+d.calories||0)*n, protein:(+d.protein||0)*n,
      carbs:(+d.carbs||0)*n, fat:(+d.fat||0)*n,
    };
  };

  const submit = () => {
    if (!canLog) return;
    const n = Math.max(1, Math.round(+servingCount)||1);
    const scaled = scaledMacros();
    const amountLabel = servingAmt && +servingAmt>0 && servingUnit!=="serving" ? ` (${+servingAmt} ${servingUnit})` : "";
    onLog({
      name:d.name.trim()+amountLabel+(n>1?` x${n}`:""), ...scaled,
      barcode:code, sourceType:initial?.sourceType || (notFound?"user_entered":"barcode"),
      confidence:notFound?"user_entered":(initial?.confidence||"database"),
      basis:amountLabel ? `${+servingAmt} ${servingUnit} × ${n}` : `${n} serving${n===1?"":"s"}`,
    });
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:T.overlay,zIndex:545,
      display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.surface,border:`1px solid ${T.accent}55`,borderRadius:18,
        padding:"20px",maxWidth:360,width:"100%",boxShadow:`0 10px 50px #000a`,maxHeight:"86vh",overflowY:"auto"}}>
        <div style={{fontSize:11,color:T.accent,letterSpacing:"0.12em",marginBottom:4}}>
          {notFound ? "NOT IN DATABASE — ENTER MANUALLY" : "SCANNED PRODUCT"}
        </div>
        <div style={{fontSize:11,color:T.muted,marginBottom:14}}>
          {initial?.basis ? `Database values ${initial.basis}. ` : ""}
          Enter what you actually ate; gram/ounce amounts now rescale the macros instead of just changing the label.
        </div>
        <input value={d.name} onChange={e=>set("name",e.target.value)} placeholder="Product name"
          style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.text,fontSize:16,outline:"none",marginBottom:12}}/>
        <div style={{fontSize:10,color:T.muted,marginBottom:5,letterSpacing:"0.06em"}}>AMOUNT</div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <input type="number" inputMode="decimal" value={servingAmt} onChange={e=>setServingAmt(e.target.value)}
            placeholder={servingUnit==="serving"?"1":"amount"}
            style={{flex:1,minWidth:0,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.text,fontSize:16,outline:"none"}}/>
          <select value={servingUnit} onChange={e=>setServingUnit(e.target.value)} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,
            padding:"10px",color:T.text,fontSize:15,outline:"none",minWidth:92,WebkitAppearance:"none",appearance:"none"}}>
            {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div style={{fontSize:10,color:T.muted,marginBottom:5,letterSpacing:"0.06em"}}>HOW MANY?</div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[1,2,3,4].map(n=><button key={n} onClick={()=>setServingCount(n)} style={{flex:1,background:servingCount===n?T.gAccent:T.card,
            border:`1px solid ${servingCount===n?T.accent:T.border}`,color:servingCount===n?"#0b0f0b":T.text,borderRadius:8,padding:"10px",
            fontSize:14,fontWeight:700,cursor:"pointer",minHeight:40,WebkitTapHighlightColor:"transparent"}}>{n}</button>)}
          <input type="number" inputMode="numeric" min="1" value={servingCount} onChange={e=>setServingCount(+e.target.value||1)}
            style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 4px",color:T.text,fontSize:14,fontWeight:700,textAlign:"center",outline:"none"}}/>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          {[["calories","cal",T.cal],["protein","P",T.protein],["carbs","C",T.carbs],["fat","F",T.fat]].map(([k,lbl,col])=><div key={k} style={{flex:1}}>
            <div style={{fontSize:9,color:col,textAlign:"center",marginBottom:3}}>{lbl}</div>
            <input type="number" inputMode="decimal" value={d[k]} onChange={e=>set(k,e.target.value)} style={numF}/>
          </div>)}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:"none",border:`1px solid ${T.border}`,color:T.muted,borderRadius:12,padding:"13px",cursor:"pointer",fontSize:14,minHeight:48,WebkitTapHighlightColor:"transparent"}}>Cancel</button>
          <button onClick={submit} disabled={!canLog} style={{flex:2,background:T.gAccent,border:"none",color:"#0b0f0b",borderRadius:12,padding:"13px",cursor:"pointer",fontSize:14,fontWeight:700,minHeight:48,opacity:canLog?1:0.4,WebkitTapHighlightColor:"transparent"}}>Log it</button>
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

// ============================================================================
// NUTRITION RESOLUTION ENGINE
// ============================================================================

// src/nutritionEngine.js
//
// NutriLog Nutrition Resolution Engine v1.5
//
// Core rule:
// The AI identifies WHAT the user ate.
// This file decides WHAT THE MACROS ARE.
//
// Resolution order:
// 1. Exact verified foods stored here
// 2. Open Food Facts for packaged/branded foods
// 3. Standardized whole-food records
// 4. AI estimate supplied as fallback
//
// The app never silently changes "1 packet" into half a packet,
// or "4 bananas" into some arbitrary serving count.

const round1 = n => Math.round((+n || 0) * 10) / 10;

const normalize = value =>
  String(value || "")
    .toLowerCase()
    .replace(/chick[\s-]*fil[\s-]*a/g, "chick fil a")
    .replace(/culver['’]?s/g, "culvers")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeUnit = unit => {
  const u = normalize(unit);

  if (!u) return "serving";

  if (["g", "gram", "grams"].includes(u)) return "g";
  if (["oz", "ounce", "ounces"].includes(u)) return "oz";

  if ([
    "packet",
    "pack",
    "packets",
    "packs"
  ].includes(u)) return "packet";

  if ([
    "serving",
    "servings"
  ].includes(u)) return "serving";

  if ([
    "piece",
    "pieces",
    "item",
    "items",
    "each",
    "banana",
    "bananas",
    "burger",
    "burgers",
    "sandwich",
    "sandwiches"
  ].includes(u)) return "each";

  return u;
};

const makeMacros = (calories, protein, carbs, fat) => ({
  calories: +calories || 0,
  protein: +protein || 0,
  carbs: +carbs || 0,
  fat: +fat || 0,
});

const scaleMacros = (m, multiplier) => ({
  calories: Math.round((+m.calories || 0) * multiplier),
  protein: round1((+m.protein || 0) * multiplier),
  carbs: round1((+m.carbs || 0) * multiplier),
  fat: round1((+m.fat || 0) * multiplier),
});

// -----------------------------------------------------------------------------
// VERIFIED FOOD DATABASE
// -----------------------------------------------------------------------------
//
// Add foods here when you want NutriLog to always use one authoritative record.
//
// type:
// restaurant -> normally count/packet based
// packaged   -> may support serving grams / per100g
// whole      -> standardized weight estimate
//
// priority:
// Higher number wins when aliases collide.

export const VERIFIED_FOODS = [
  {
    id: "cfa-fat-free-honey-mustard",
    type: "restaurant",
    brand: "Chick-fil-A",
    name: "Fat-Free Honey Mustard Dressing",

    aliases: [
      "chick fil a fat free honey mustard",
      "chick fil a fat free honey mustard dressing",
      "cfa fat free honey mustard",
      "cfa ff honey mustard",
      "fat free honey mustard chick fil a",
      "fat free honey mustard dressing chick fil a",
      "fat free honey mustard",
      "ff honey mustard",
      "ffhm",
    ],

    basisUnit: "packet",
    macros: makeMacros(90, 0, 22, 0),

    sourceType: "restaurant_official",
    source:
      "https://www.chick-fil-a.com/menu/dressings/fat-free-honey-mustard-dressing",

    priority: 100,
  },

  {
    id: "culvers-butterburger-original-double",
    type: "restaurant",
    brand: "Culver's",
    name: "ButterBurger, Original, Double",

    aliases: [
      "culvers double butterburger",
      "culvers double butter burger",
      "culvers butterburger double",
      "culvers original double butterburger",
      "double butterburger culvers",
      "double butter burger culvers",
      "double butterburger",
    ],

    basisUnit: "each",
    macros: makeMacros(560, 34, 38, 30),

    sourceType: "restaurant_official",
    source:
      "https://cdn.culvers.com/menu/docs/guide-nutrition-allergen.pdf",

    priority: 100,
  },

  // Standardized banana.
  //
  // This is NOT "physically exact" for every banana.
  // A count request uses a standard medium banana (~118 g edible portion).
  // A gram request is much more precise.
  {
    id: "banana-raw",
    type: "whole",
    brand: "",
    name: "Banana",

    aliases: [
      "banana",
      "bananas",
      "medium banana",
      "medium bananas",
    ],

    per100g: makeMacros(89, 1.09, 22.84, 0.33),
    defaultEachGrams: 118,

    sourceType: "standard_reference",
    source: null,

    priority: 50,
  },
  {
    id:"apple-raw-medium", type:"whole", brand:"", name:"Apple",
    aliases:["apple","apples","medium apple","medium apples"],
    per100g:makeMacros(52,0.26,13.81,0.17), defaultEachGrams:182,
    sourceType:"standard_reference", source:null, priority:45,
  },
  {
    id:"white-rice-cooked", type:"whole", brand:"", name:"Cooked White Rice",
    aliases:["cooked white rice","white rice cooked","rice cooked"],
    per100g:makeMacros(130,2.69,28.17,0.28),
    sourceType:"standard_reference", source:null, priority:45,
  },
  {
    id:"chicken-breast-cooked", type:"whole", brand:"", name:"Cooked Chicken Breast",
    aliases:["cooked chicken breast","grilled chicken breast","chicken breast cooked"],
    per100g:makeMacros(165,31.02,0,3.57),
    sourceType:"standard_reference", source:null, priority:45,
  },
];

// -----------------------------------------------------------------------------
// LOCAL USER FOOD MEMORY
// -----------------------------------------------------------------------------

const FOOD_CACHE_KEY = "nl4_food_cache";

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(FOOD_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeCache = cache => {
  try {
    localStorage.setItem(FOOD_CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

export const loadNutritionCache = () => readCache();

export const clearNutritionCache = () => writeCache({});

// -----------------------------------------------------------------------------
// MATCHING
// -----------------------------------------------------------------------------

const scoreAlias = (query, alias) => {
  const q = normalize(query);
  const a = normalize(alias);

  if (!q || !a) return 0;
  if (q === a) return 1000;
  if (q.includes(a)) return 800 + a.length;
  if (a.includes(q)) return 650 + q.length;

  const qTokens = new Set(q.split(" "));
  const aTokens = a.split(" ");

  if (!aTokens.length) return 0;

  const hits = aTokens.filter(t => qTokens.has(t)).length;

  return (hits / aTokens.length) * 500;
};

const buildQuery = request =>
  normalize(
    [
      request.brand,
      request.name,
      request.query,
    ]
      .filter(Boolean)
      .join(" ")
  );

export function findVerifiedFood(request) {
  const query = buildQuery(request);
  if (!query) return null;

  let best = null;
  let bestScore = 0;

  for (const food of VERIFIED_FOODS) {
    const candidates = [
      food.name,
      `${food.brand || ""} ${food.name || ""}`,
      ...(food.aliases || []),
    ];

    for (const alias of candidates) {
      let score = scoreAlias(query, alias);

      if (
        request.brand &&
        food.brand &&
        normalize(request.brand) === normalize(food.brand)
      ) {
        score += 250;
      }

      score += food.priority || 0;

      if (score > bestScore) {
        bestScore = score;
        best = food;
      }
    }
  }

  // Avoid accidentally resolving unrelated foods.
  return bestScore >= 480 ? best : null;
}

// -----------------------------------------------------------------------------
// QUANTITY SCALING
// -----------------------------------------------------------------------------

export function scaleVerifiedFood(food, request = {}) {
  const quantity =
    Number.isFinite(+request.quantity) && +request.quantity > 0
      ? +request.quantity
      : 1;

  const unit = normalizeUnit(request.unit);

  let multiplier = 1;
  let basisText = "";

  // Explicit grams are best whenever per-100g data exists.
  if (unit === "g" && food.per100g) {
    multiplier = quantity / 100;
    basisText = `${quantity} g`;

    return {
      ...scaleMacros(food.per100g, multiplier),

      name: food.brand
        ? `${food.brand} ${food.name}`
        : food.name,

      foodId: food.id,
      brand: food.brand || "",
      quantity,
      unit: "g",
      basis: basisText,

      sourceType: food.sourceType,
      source: food.source || undefined,
      confidence:
        food.sourceType === "restaurant_official" ||
        food.sourceType === "manufacturer"
          ? "verified"
          : "standardized",
    };
  }

  // Ounces -> grams if weight nutrition exists.
  if (unit === "oz" && food.per100g) {
    const grams = quantity * 28.349523125;
    multiplier = grams / 100;
    basisText = `${quantity} oz`;

    return {
      ...scaleMacros(food.per100g, multiplier),

      name: food.brand
        ? `${food.brand} ${food.name}`
        : food.name,

      foodId: food.id,
      brand: food.brand || "",
      quantity,
      unit: "oz",
      basis: basisText,

      sourceType: food.sourceType,
      source: food.source || undefined,
      confidence: "standardized",
    };
  }

  // Count-style whole food such as bananas.
  if (
    food.per100g &&
    food.defaultEachGrams &&
    ["each", "serving"].includes(unit)
  ) {
    const grams = quantity * food.defaultEachGrams;
    multiplier = grams / 100;
    basisText = `${quantity} ${quantity === 1 ? "item" : "items"} (~${Math.round(
      grams
    )} g standard weight)`;

    return {
      ...scaleMacros(food.per100g, multiplier),

      name:
        quantity === 1
          ? food.name
          : `${food.name} x${quantity}`,

      foodId: food.id,
      brand: food.brand || "",
      quantity,
      unit: "each",
      basis: basisText,

      sourceType: food.sourceType,
      source: food.source || undefined,
      confidence: "standardized",
    };
  }

  // Restaurant packet / discrete menu item.
  if (food.macros) {
    const basis = normalizeUnit(food.basisUnit);

    // If the user says "serving" for a discrete official item,
    // one serving = one item/packet.
    const compatible =
      unit === basis ||
      unit === "serving" ||
      (unit === "each" && ["packet", "each"].includes(basis));

    if (compatible) {
      multiplier = quantity;
    } else {
      // Never silently invent half-servings because the unit wording changed.
      multiplier = quantity;
    }

    basisText = `${quantity} ${
      food.basisUnit || (quantity === 1 ? "serving" : "servings")
    }`;

    return {
      ...scaleMacros(food.macros, multiplier),

      name:
        quantity === 1
          ? `${food.brand ? food.brand + " " : ""}${food.name}`
          : `${food.brand ? food.brand + " " : ""}${food.name} x${quantity}`,

      foodId: food.id,
      brand: food.brand || "",
      quantity,
      unit: food.basisUnit || unit,
      basis: basisText,

      sourceType: food.sourceType,
      source: food.source || undefined,
      confidence: "verified",
    };
  }

  return null;
}

// -----------------------------------------------------------------------------
// OPEN FOOD FACTS
// -----------------------------------------------------------------------------

const parseServingGrams = servingSize => {
  if (!servingSize) return null;

  const m = String(servingSize).match(
    /(\d+(?:\.\d+)?)\s*(g|gram|grams)\b/i
  );

  return m ? +m[1] : null;
};

const offNum = (obj, key) => {
  const n = +obj?.[key];
  return Number.isFinite(n) ? n : null;
};

const productMacros100g = nutriments => {
  const calories =
    offNum(nutriments, "energy-kcal_100g") ??
    (() => {
      const kj = offNum(nutriments, "energy_100g");
      return kj != null ? kj / 4.184 : null;
    })();

  return {
    calories,
    protein: offNum(nutriments, "proteins_100g"),
    carbs: offNum(nutriments, "carbohydrates_100g"),
    fat: offNum(nutriments, "fat_100g"),
  };
};

const macrosCompleteEnough = m =>
  m &&
  m.calories != null &&
  m.protein != null &&
  m.carbs != null &&
  m.fat != null;

const scoreOffProduct = (product, request) => {
  const requested = buildQuery(request);

  const productName = normalize(
    [
      product.brands,
      product.product_name,
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (!requested || !productName) return 0;

  const reqTokens = requested.split(" ").filter(Boolean);
  const pTokens = new Set(productName.split(" ").filter(Boolean));

  let hits = 0;

  for (const token of reqTokens) {
    if (pTokens.has(token)) hits++;
  }

  let score =
    reqTokens.length > 0
      ? (hits / reqTokens.length) * 100
      : 0;

  if (productName.includes(requested)) score += 100;

  if (
    request.brand &&
    normalize(product.brands).includes(normalize(request.brand))
  ) {
    score += 75;
  }

  return score;
};

export async function searchOpenFoodFacts(request) {
  const query = [
    request.brand,
    request.name || request.query,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!query) return null;

  try {
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: "1",
      action: "process",
      json: "1",
      page_size: "10",
      fields:
        "code,product_name,brands,serving_size,nutriments",
    });

    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?${params.toString()}`
    );

    if (!res.ok) return null;

    const data = await res.json();

    const candidates = (data.products || [])
      .map(product => ({
        product,
        score: scoreOffProduct(product, request),
      }))
      .filter(x => {
        const macros = productMacros100g(x.product.nutriments || {});
        return x.score >= 75 && macrosCompleteEnough(macros);
      })
      .sort((a, b) => b.score - a.score);

    const best = candidates[0];

    if (!best) return null;

    const p = best.product;
    const per100g = productMacros100g(p.nutriments || {});
    const servingGrams = parseServingGrams(p.serving_size);

    const quantity =
      Number.isFinite(+request.quantity) && +request.quantity > 0
        ? +request.quantity
        : 1;

    const unit = normalizeUnit(request.unit);

    let grams = null;
    let basis = "";

    if (unit === "g") {
      grams = quantity;
      basis = `${quantity} g`;
    } else if (unit === "oz") {
      grams = quantity * 28.349523125;
      basis = `${quantity} oz`;
    } else if (
      ["serving", "each"].includes(unit) &&
      servingGrams
    ) {
      grams = servingGrams * quantity;
      basis = `${quantity} serving${quantity === 1 ? "" : "s"} (${Math.round(
        grams
      )} g)`;
    }

    // We need a known weight before scaling per-100g data.
    if (grams == null) return null;

    const scaled = scaleMacros(per100g, grams / 100);

    const firstBrand =
      String(p.brands || "")
        .split(",")[0]
        .trim();

    const name = [
      firstBrand,
      p.product_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return {
      ...scaled,

      name: quantity > 1 ? `${name} x${quantity}` : name,

      foodId: p.code ? `off-${p.code}` : undefined,
      barcode: p.code || undefined,

      brand: firstBrand,
      quantity,
      unit,
      basis,

      sourceType: "open_food_facts",
      confidence: best.score >= 120 ? "high" : "medium",
    };
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// AI FALLBACK
// -----------------------------------------------------------------------------

const sanitizeEstimate = (fallback, request) => {
  if (!fallback) return null;

  const m = {
    calories: +fallback.calories,
    protein: +fallback.protein,
    carbs: +fallback.carbs,
    fat: +fallback.fat,
  };

  if (
    !Object.values(m).every(v => Number.isFinite(v) && v >= 0)
  ) {
    return null;
  }

  return {
    name:
      fallback.name ||
      request.name ||
      request.query ||
      "Estimated food",

    ...m,

    quantity:
      Number.isFinite(+request.quantity) && +request.quantity > 0
        ? +request.quantity
        : 1,

    unit: normalizeUnit(request.unit),

    sourceType: fallback.sourceType === "official_web" && fallback.source ? "official_web" : "ai_estimate",
    source: fallback.sourceType === "official_web" && fallback.source ? fallback.source : undefined,
    confidence: fallback.sourceType === "official_web" && fallback.source ? "web_verified" : "estimated",
    basis: fallback.basis || (fallback.sourceType === "official_web" ? "official web nutrition" : "AI estimate"),
  };
};

// -----------------------------------------------------------------------------
// MAIN RESOLVER
// -----------------------------------------------------------------------------

export async function resolveFoodRequest(request = {}) {
  // 1. Exact local verified database.
  const verified = findVerifiedFood(request);

  if (verified) {
    const result = scaleVerifiedFood(verified, request);

    if (result) return result;
  }

  // 2. Previously resolved/cached products.
  const key = buildQuery(request);
  const cache = readCache();

  if (key && cache[key]) {
    const cached = cache[key];

    // Cache records are stored as resolved base entries.
    // Only reuse directly when the requested quantity/basis matches.
    if (
      (+request.quantity || 1) === (+cached.quantity || 1) &&
      normalizeUnit(request.unit) === normalizeUnit(cached.unit)
    ) {
      return {
        ...cached,
        confidence: cached.confidence || "cached",
      };
    }
  }

  // 3. Packaged/branded product search.
  //
  // Do not use Open Food Facts for restaurant menu items.
  const seemsRestaurant =
    request.kind === "restaurant" ||
    /chick fil a|culvers|mcdonald|wendys|taco bell|burger king|subway|chipotle|panda express|panera|chilis|popeyes|arbys|sonic|dairy queen|five guys|whataburger|raising canes|jersey mikes|jimmy johns/i.test(
      [
        request.brand,
        request.name,
        request.query,
      ]
        .filter(Boolean)
        .join(" ")
    );

  if (!seemsRestaurant) {
    const off = await searchOpenFoodFacts(request);

    if (off) {
      if (key) {
        cache[key] = off;
        writeCache(cache);
      }

      return off;
    }
  }

  // 4. AI estimate only after deterministic sources fail.
  return sanitizeEstimate(request.fallback, request);
}

export async function resolveNutritionActions(actions = []) {
  const output = [];

  for (const action of actions) {
    if (!action || typeof action !== "object") continue;

    if (action.type !== "resolve_food") {
      output.push(action);
      continue;
    }

    const request = action.food || {};
    const resolved = await resolveFoodRequest(request);

    if (!resolved) {
      // Don't invent zero-calorie entries.
      continue;
    }

    output.push({
      type: "add_entry",
      entry: resolved,
    });
  }

  return output;
}

// Used before anything reaches the daily log.
export function sanitizeNutritionEntry(entry) {
  if (!entry || typeof entry !== "object") return null;

  const name = String(entry.name || "").trim();

  const calories = +entry.calories;
  const protein = +entry.protein;
  const carbs = +entry.carbs;
  const fat = +entry.fat;

  if (!name) return null;

  if (
    ![calories, protein, carbs, fat].every(
      n => Number.isFinite(n) && n >= 0
    )
  ) {
    return null;
  }

  return {
    ...entry,
    name,
    calories,
    protein,
    carbs,
    fat,
  };
}

// ============================================================================
// MAIN APPLICATION
// ============================================================================

export default function App() {
  const [allDays,    setAllDays]    = useState({});
  const [selDay,     setSelDay]     = useState(todayKey());
  const [goals,      setGoals]      = useState({...DEFAULT_GOALS});
  const [activeTab,  setActiveTab]  = useState("chat");
  const [chatMsgs,   setChatMsgs]   = useState([{
    role:"assistant",
    content:"Hey! I'm your NutriLog AI 👋 I can log your food, track workouts, build programs, design meal preps, and answer nutrition or training questions — just tell me what's up.",
    actions:[],
    mode:"general",
  }]);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [showGoals,  setShowGoals]  = useState(false);
  const [showHist,   setShowHist]   = useState(false);
  const [meals,      setMeals]      = useState([]);
  const [programs,   setPrograms]   = useState([]);
  const [activeProgId, setActiveProgId] = useState(null);
  const [editMeal,   setEditMeal]   = useState(null); // meal object being edited, or "new"
  const [workouts,   setWorkouts]   = useState({});   // { dayKey: [ {id,name,detail,category} ] }
  const [weekAnchor, setWeekAnchor] = useState(weekStart(todayKey())); // Sunday of shown week
  const [profile,    setProfile]    = useState({...DEFAULT_PROFILE});
  const [weights,    setWeights]    = useState({});
  const [water,      setWater]      = useState({});
  const [celebrate,  setCelebrate]  = useState(null); // {text, big} | null
  const [loaded,     setLoaded]     = useState(false);
  const [theme,      setTheme]      = useState(null);   // null = default; else theme object
  const [themeVersion, setThemeVersion] = useState(0);  // bump to force re-render after applyTheme
  const [settings,   setSettings]   = useState({...DEFAULT_SETTINGS});
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mealCounts,   setMealCounts]   = useState({}); // {mealId: count} for multi-container logging
  const [editingWk,    setEditingWk]    = useState(null); // {id, name, detail} being edited
  const [editingName,  setEditingName]  = useState(null); // {key, name} exercise being renamed
  const [waterStep,  setWaterStep]  = useState(WATER_STEP);
  const [waterMenu,  setWaterMenu]  = useState(false);
  const [customWater, setCustomWater] = useState(null);
  const [barcodes,   setBarcodes]   = useState({});
  const [standout,   setStandout]   = useState({});
  const [scanning,   setScanning]   = useState(false);
  const [scanConfirm, setScanConfirm] = useState(null); // {code, data, notFound} | null
  const [scanLoading, setScanLoading] = useState(false); // null = closed, "" or string = open with value
  const chatEndRef = useRef(null);
  const logScrollRef = useRef(null);
  const inputRef   = useRef(null);
  const fileRef    = useRef(null);
  const [pendingImage, setPendingImage] = useState(null); // food chat {dataUrl, mediaType, base64}
  const [vh, setVh] = useState(window.innerHeight);

  useEffect(()=>{
    let days = loadAll();
    let gls  = loadGoals();
    let mls  = loadMeals();
    let wks  = loadWorkouts();
    let prof = loadProfile();
    let wgt  = loadWeights();
    let wtr  = loadWater();

    const empty = Object.keys(days).length===0 && mls.length===0 && Object.keys(wks).length===0;
    if (empty) {
      try {
        const snap = JSON.parse(_get("nl4_snapshot")||"null");
        if (snap) {
          if (snap.days)  { days = snap.days;  saveAll(days); }
          if (snap.goals) { gls  = {...DEFAULT_GOALS,...snap.goals}; saveGoals(gls); }
          if (snap.meals) { mls  = snap.meals; saveMeals(mls); }
          if (snap.workouts) { wks = snap.workouts; saveWorkouts(wks); }
          if (snap.profile) { prof = {...DEFAULT_PROFILE,...snap.profile}; saveProfile(prof); }
          if (snap.weights) { wgt = snap.weights; saveWeights(wgt); }
          if (snap.water)   { wtr = snap.water;   saveWater(wtr); }
        }
      } catch {}
    }

    setAllDays(days);
    setGoals(gls);
    setMeals(mls);
    const progs = loadPrograms();
    // Migrate any old-format exercises (sets as a number) to per-set arrays
    const rid = () => Date.now().toString(36)+Math.random().toString(36).slice(2);
    let progsChanged = false;
    const normProgs = progs.map(p=>({...p, days:(p.days||[]).map(d=>({...d, exercises:(d.exercises||[]).map(e=>{
      if (Array.isArray(e.sets)) return e;
      progsChanged = true;
      const n = Math.max(1, +e.sets||1);
      return { ...e, sets:Array.from({length:n}).map(()=>({ id:rid(), weight:e.weight||"", reps:(e.reps!=null?String(e.reps):"") })) };
    })}))}));
    setPrograms(normProgs);
    if (progsChanged) savePrograms(normProgs);
    const ap = _get("nl4_active_prog"); if (ap) setActiveProgId(ap);
    setWorkouts(wks);
    // One-time cleanup of legacy crammed/duplicated workout entries
    if (!_get("nl4_wk_cleaned_v1")) {
      const cleaned = {};
      let changed = false;
      for (const k of Object.keys(wks)) {
        const c = cleanWorkoutDay(wks[k]);
        cleaned[k] = c;
        if (JSON.stringify(c) !== JSON.stringify(wks[k])) changed = true;
      }
      if (changed) { saveWorkouts(cleaned); setWorkouts(cleaned); }
      _set("nl4_wk_cleaned_v1","1");
    }
    setProfile(prof);
    setWeights(wgt);
    setWater(wtr);
    setBarcodes(loadBarcodes());
    setStandout(loadStandout());
    const savedTheme = loadTheme();
    if (savedTheme) { applyTheme(savedTheme); setTheme(savedTheme); setThemeVersion(v=>v+1); }
    const savedSettings = loadSettings();
    setSettings(savedSettings);
    setHapticsOn(savedSettings.haptics);
    if (savedSettings.landingTab && savedSettings.landingTab!=="chat") setActiveTab(savedSettings.landingTab);
    setLoaded(true);
    try {
      if (_get("nl4_seen_version") !== APP_VERSION) setShowWelcome(true);
    } catch { setShowWelcome(true); }
    if (prof.name) {
      setChatMsgs(prev=>{
        if (prev.length===1 && prev[0].role==="assistant") {
          return [{...prev[0], content:`Hey ${prof.name}! 👋 I can log food, track workouts, build programs, design meal preps, and answer your questions — what's up?`}];
        }
        return prev;
      });
    }
  },[]);

  useEffect(()=>{
    const writeSnapshot = () => {
      try {
        _set("nl4_snapshot", JSON.stringify({ days:allDays, goals, meals, workouts, profile, weights, water, barcodes, standout, theme, ts:Date.now() }));
      } catch {}
    };
    writeSnapshot();
    const onHide = () => { if (document.visibilityState === "hidden") writeSnapshot(); };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", writeSnapshot);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", writeSnapshot);
    };
  },[allDays, goals, meals, workouts, profile, weights, water, barcodes, standout, theme]);

  useEffect(()=>{
    const onResize = () => {
      setVh(window.visualViewport?.height ?? window.innerHeight);
      setTimeout(()=>{
        if (activeTab==="chat") chatEndRef.current?.scrollIntoView({block:"end"});
      }, 60);
    };
    window.visualViewport?.addEventListener("resize", onResize);
    window.addEventListener("resize", onResize);
    return ()=>{
      window.visualViewport?.removeEventListener("resize", onResize);
      window.removeEventListener("resize", onResize);
    };
  },[activeTab]);

  useEffect(()=>{
    if (activeTab==="chat")
      setTimeout(()=>chatEndRef.current?.scrollIntoView({behavior:"smooth",block:"end"}),50);
  },[chatMsgs, loading, activeTab]);

  useEffect(()=>{
    if (logScrollRef.current) logScrollRef.current.scrollTop = 0;
  },[selDay]);

  const entries = allDays[selDay]||[];

  const mutEntries = upd => setAllDays(prev=>{
    const cur  = prev[selDay]||[];
    const next = typeof upd==="function"?upd(cur):upd;
    const out  = {...prev,[selDay]:next};
    saveAll(out);
    return out;
  });

  const totals = entries.reduce(
    (a,e)=>({calories:a.calories+e.calories,protein:a.protein+e.protein,carbs:a.carbs+e.carbs,fat:a.fat+e.fat}),
    {calories:0,protein:0,carbs:0,fat:0}
  );

  const remaining = {
    calories:goals.calories-totals.calories,
    protein:goals.protein-totals.protein,
    carbs:goals.carbs-totals.carbs,
    fat:goals.fat-totals.fat,
  };

  const loggedDays = Object.keys(allDays)
    .filter(d=>allDays[d]?.length>0)
    .sort((a,b)=>b.localeCompare(a));

  const applyActions = (actions, curGoals, curEntries, curWorkouts) => {
    let gl={...curGoals}, es=[...curEntries], wk=[...(curWorkouts||[])];
    for (const a of (actions||[])) {
      if (a.type==="add_entry"&&a.entry) {
        const clean = sanitizeNutritionEntry(a.entry);
        if (clean) {
          const now=Date.now();
          es=[...es,{...clean,id:now+Math.random(),loggedAt:now}];
        }
      }
      if (a.type==="remove_entry"&&a.name) {
        const n=a.name.toLowerCase();
        es=es.filter(e=>!e.name.toLowerCase().includes(n));
      }
      if (a.type==="clear_log") es=[];
      if (a.type==="update_goals"&&a.goals) gl={...gl,...a.goals};
      if (a.type==="add_workout"&&a.workout) {
        const now=Date.now();
        wk=[...wk,{...a.workout,id:now+Math.random(),loggedAt:now}];
      }
      if (a.type==="remove_workout"&&a.name) {
        const n=a.name.toLowerCase();
        wk=wk.filter(w=>!w.name.toLowerCase().includes(n));
      }
    }
    return {newGoals:gl, newEntries:es, newWorkouts:wk};
  };

  const handlePhoto = (file, setter = setPendingImage) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1024;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) { height = Math.round(height * maxDim / width); width = maxDim; }
          else { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        const base64 = dataUrl.split(",")[1];
        setter({ dataUrl, mediaType: "image/jpeg", base64 });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    const text=input.trim();
    if ((!text && !pendingImage)||loading) return;
    inputRef.current?.blur();
    const img = pendingImage;
    setInput("");
    setPendingImage(null);
    setLoading(true);

    const userMsg={role:"user",content:text || (img ? "(photo)" : ""), image: img?.dataUrl, actions:[]};
    setChatMsgs(prev=>[...prev,userMsg]);

    const curEntries=allDays[selDay]||[];
    const curTotals=curEntries.reduce(
      (a,e)=>({calories:a.calories+e.calories,protein:a.protein+e.protein,carbs:a.carbs+e.carbs,fat:a.fat+e.fat}),
      {calories:0,protein:0,carbs:0,fat:0}
    );

    const mealLib = meals.map(m=>{
      const pc = mealPerContainer(m);
      return { name:m.name, perContainer:pc };
    });
    const curWk = workouts[selDay]||[];
    const profBlock = Object.values(profile).some(v=>v) ? ` | UserProfile:${JSON.stringify(profile)}` : "";
    const habits = computeHabits(allDays, workouts);
    const habitsBlock = habits.loggedDayCount>0 ? ` | Habits:${JSON.stringify({avgMacros:habits.avg,frequentFoods:habits.topFoods,daysLogged:habits.loggedDayCount})}` : "";
    const nameBlock = profile.name ? ` | UserName:${profile.name}` : "";
    const ctx=`\n\n[STATE] Date:${selDay}${isToday(selDay)?" (today)":""} | Goals:${JSON.stringify(goals)} | Log(${curEntries.length} items):${JSON.stringify(curEntries.map(e=>({name:e.name,calories:e.calories,protein:e.protein,carbs:e.carbs,fat:e.fat})))} | Totals:${JSON.stringify(curTotals)} | Remaining: cal ${goals.calories-curTotals.calories}, protein ${goals.protein-curTotals.protein}g, carbs ${goals.carbs-curTotals.carbs}g, fat ${goals.fat-curTotals.fat}g | Workouts today:${JSON.stringify(curWk.map(w=>({name:w.name,detail:w.detail})))} | MealLibrary:${JSON.stringify(mealLib)}${profBlock}${nameBlock}${habitsBlock}`;

    const apiMsgs = chatMsgs.slice(-8).map(m=>({role:m.role,content:m.content}));
    const promptText = (text || "Analyze this image for logging. First decide whether it is a restaurant receipt, nutrition label, packaged-food photo, or an ordinary food photo. For receipts, extract each food line and preserve quantities; for labels, use the visible label values; for identifiable branded foods, identify the product and quantity; only estimate macros when there is no authoritative identity or label available.") + ctx;
    if (img) {
      apiMsgs.push({
        role:"user",
        content:[
          { type:"image", source:{ type:"base64", media_type:img.mediaType, data:img.base64 } },
          { type:"text", text:promptText },
        ],
      });
    } else {
      apiMsgs.push({ role:"user", content: promptText });
    }

    try {
      const result = await callAssistant(apiMsgs, settings.aiStyle);
      const {message="",actions=[],mode="general",workoutStatus="none",standout:isStandout=false} = result;

      // AI identifies foods and quantities; NutriLog resolves the nutrition data.
      // This prevents model-memory guesses from becoming authoritative log entries.
      const resolvedActions = await resolveNutritionActions(actions);

      const curWkNow = workouts[selDay]||[];
      const {newGoals,newEntries,newWorkouts} = applyActions(resolvedActions,goals,curEntries,curWkNow);
      if (JSON.stringify(newGoals)!==JSON.stringify(goals)) {
        setGoals(newGoals);
        saveGoals(newGoals);
      }
      setAllDays(prev=>{
        const out={...prev,[selDay]:newEntries};
        saveAll(out);
        return out;
      });
      setWorkouts(prev=>{
        const out={...prev,[selDay]:newWorkouts};
        saveWorkouts(out);
        return out;
      });

      // save_meal → meal library
      resolvedActions.filter(a=>a.type==="save_meal" && a.meal).forEach(a=>{
        const m = { ...a.meal, id: Date.now().toString(36)+Math.random().toString(36).slice(2) };
        saveMeal(m);
      });
      // save_program → programs
      resolvedActions.filter(a=>a.type==="save_program" && a.program).forEach(a=>{
        const rid = () => Date.now().toString(36)+Math.random().toString(36).slice(2);
        const normSets = (e) => Array.isArray(e.sets)
          ? e.sets.map(s=>({ id:rid(), weight:s.weight||"", reps:(s.reps!=null?String(s.reps):"") }))
          : Array.from({length:Math.max(1,+e.sets||1)}).map(()=>({ id:rid(), weight:e.weight||"", reps:(e.reps!=null?String(e.reps):"") }));
        const prog = { ...a.program, id: rid(),
          days:(a.program.days||[]).map(d=>({...d, id:rid(),
            exercises:(d.exercises||[]).map(e=>({ id:rid(), name:e.name||"", notes:e.notes||"", sets:normSets(e) }))}))};
        saveProgram(prog);
        fireCelebration(`Program "${prog.name}" saved! 📋`);
      });

      // Workout completion / standout celebration (workout mode only)
      const addedWk = resolvedActions.some(a=>a.type==="add_workout");
      if (addedWk && isStandout && !standout[selDay]) {
        setStandout(prev=>{ const out={...prev,[selDay]:true}; saveStandout(out); return out; });
      }
      if (addedWk && workoutStatus==="complete" && !completedRef.current[selDay]) {
        completedRef.current[selDay]=true;
        fireCelebration("Workout complete 💪", true);
      }

      const sources = resolvedActions
        .filter(a=>a.type==="add_entry" && a.entry?.source)
        .map(a=>({ name:a.entry.name, url:a.entry.source }));

      // For food logging, show the macros that ACTUALLY reached the log rather
      // than numbers the language model may have supplied as a fallback.
      const loggedFoodActions = resolvedActions.filter(a=>a.type==="add_entry" && a.entry);
      const requestedFoodResolution = actions.some(a=>a.type==="resolve_food");
      let displayMessage = message;
      if (mode==="food" && loggedFoodActions.length>0) {
        const lines = loggedFoodActions.map(({entry:e})=>{
          const tag = (e.confidence==="verified" || e.confidence==="verified_label") ? " ✓"
            : e.confidence==="estimated" ? " ~" : "";
          return `- ${e.name}: ${Math.round(e.calories)} cal · ${Math.round(e.protein)}P · ${Math.round(e.carbs)}C · ${Math.round(e.fat)}F${tag}`;
        });
        displayMessage = lines.join("\n");
      } else if (mode==="food" && requestedFoodResolution && loggedFoodActions.length===0) {
        displayMessage = "- I couldn't resolve that food confidently enough to log it. Add the brand, exact menu item, serving size, grams, or a nutrition-label photo.";
      }

      setChatMsgs(prev=>[...prev,{role:"assistant",content:displayMessage,actions:resolvedActions,sources,mode}]);
    } catch(err) {
      console.error(err);
      setChatMsgs(prev=>[...prev,{
        role:"assistant",
        content:`Sorry, something went wrong (${err.message}). Please try again.`,
        actions:[],
      }]);
    } finally {
      setLoading(false);
    }
  };

  const saveMeal = (meal) => {
    setMeals(prev=>{
      const exists = prev.some(m=>m.id===meal.id);
      const next = exists ? prev.map(m=>m.id===meal.id?meal:m) : [...prev, meal];
      saveMeals(next);
      return next;
    });
    setEditMeal(null);
  };
  const deleteMeal = (id) => {
    setMeals(prev=>{ const next=prev.filter(m=>m.id!==id); saveMeals(next); return next; });
    setEditMeal(null);
  };
  const quickLogMeal = (meal, qty=1) => {
    const pc = mealPerContainer(meal);
    const now = Date.now();
    const newOnes = Array.from({length:qty}).map((_,i)=>({
      ...pc, name:meal.name, id:now+i+Math.random(), loggedAt:now,
    }));
    mutEntries(prev=>[...prev, ...newOnes]);
  };

  // ── Program handlers ──
  const saveProgram = (prog) => {
    setPrograms(prev=>{
      const exists = prev.find(p=>p.id===prog.id);
      const out = exists ? prev.map(p=>p.id===prog.id?prog:p) : [...prev,prog];
      savePrograms(out);
      return out;
    });
  };
  const deleteProgram = (id) => {
    setPrograms(prev=>{ const out=prev.filter(p=>p.id!==id); savePrograms(out); return out; });
    if (activeProgId===id) { setActiveProgId(null); _set("nl4_active_prog",""); }
  };
  const setActiveProg = (id) => { setActiveProgId(id); _set("nl4_active_prog",id); };

  // Prefill the assistant with a day's exercises and switch to the chat tab
  const logDayWithCoach = (prog, day) => {
    const exList = day.exercises.map(ex=>{
      const sets = ex.sets||[];
      const setStr = sets.map(s=>`${s.weight||"?"}${s.reps?`×${s.reps}`:""}`).join(", ");
      return `${ex.name}: ${setStr}`;
    }).join("\n");
    const msg = `Here's my workout plan for today (${prog.name} — ${day.name||"Day"}):\n${exList}\n\nI'm about to start. Give me any prep tips and log it when I confirm I'm done.`;
    setInput(msg);
    setActiveTab("chat");
    haptic(8);
  };

  const deleteWorkout = (id) => setWorkouts(prev=>{
    const cur = prev[selDay]||[];
    const out = {...prev,[selDay]:cur.filter(w=>w.id!==id)};
    saveWorkouts(out);
    return out;
  });
  const dayWorkouts = workouts[selDay]||[];
  const editWorkout = (id, patch) => setWorkouts(prev=>{
    const cur = prev[selDay]||[];
    const out = {...prev,[selDay]:cur.map(w=>w.id===id?{...w,...patch}:w)};
    saveWorkouts(out);
    return out;
  });
  // Rename every set whose name matches the given group's normalized key
  // Rename an exercise across EVERY day so the same lift stays unified in history.
  // Matching is by normalized key, so renaming "Flat Bench" → "Bench Press" merges
  // them everywhere and fixes PR/volume tracking retroactively.
  const renameExercise = (groupKey, newName) => setWorkouts(prev=>{
    const out = {};
    for (const day of Object.keys(prev)) {
      out[day] = (prev[day]||[]).map(w=>normName(w.name||"")===groupKey?{...w,name:newName}:w);
    }
    saveWorkouts(out);
    return out;
  });

  const streaks = {
    calories: computeStreak(allDays, workouts, goals, "calories"),
    protein:  computeStreak(allDays, workouts, goals, "protein"),
    carbs:    computeStreak(allDays, workouts, goals, "carbs"),
    fat:      computeStreak(allDays, workouts, goals, "fat"),
    workout:  computeStreak(allDays, workouts, goals, "workout"),
  };
  const tk = todayKey();
  const tToday = sumDay(allDays[tk]);
  const hitToday = {
    calories: dayHitsGoal(tToday, goals, "calories"),
    protein:  dayHitsGoal(tToday, goals, "protein"),
    carbs:    dayHitsGoal(tToday, goals, "carbs"),
    fat:      dayHitsGoal(tToday, goals, "fat"),
    workout:  (workouts[tk]?.length || 0) > 0,
  };

  const fireCelebration = (text, big=false) => {
    if (!settings.celebrations) return;
    haptic(big ? [0,40,60,40] : 25);
    setCelebrate({ text, big });
    setTimeout(()=>setCelebrate(null), big ? 3200 : 2200);
  };
  const celebratedRef = useRef({});
  const primedRef = useRef(false);
  const completedRef = useRef({}); // tracks days we've already congratulated for completion
  const cheerFor = {
    calories:["Calorie goal hit! 🔥","Right on target! 🎯","Nailed your calories! 💪"],
    protein:["Protein goal smashed! 💪","Muscle fuel locked in! 🥩","Protein: done! ✅"],
    carbs:["Carbs on point! ⚡","Energy topped up! ⚡","Carb goal hit! 👏"],
    fat:["Fats dialed in! 🥑","Fat goal hit! ✅","Balanced and done! 🥑"],
    water:["Hydration goal hit! 💧","Fully hydrated! 🌊","Water goal crushed! 💧"],
  };
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  useEffect(()=>{
    if (!loaded) return;          // wait until saved data has loaded
    if (!isToday(selDay)) return;
    const today = selDay;
    const cur = celebratedRef.current[today] || {};
    const t = sumDay(allDays[today]);
    const checks = {
      calories: dayHitsGoal(t, goals, "calories"),
      protein:  dayHitsGoal(t, goals, "protein"),
      carbs:    dayHitsGoal(t, goals, "carbs"),
      fat:      dayHitsGoal(t, goals, "fat"),
      water:    (goals.water||0)>0 && (water[today]||0) >= goals.water*0.90,
    };
    let newlyHit = null;
    if (!primedRef.current) {
      for (const k of ["calories","protein","carbs","fat","water"]) cur[k] = checks[k];
      const allHitInit = checks.calories && checks.protein && checks.carbs && checks.fat;
      cur._all = allHitInit;
      celebratedRef.current[today] = cur;
      primedRef.current = true;
      return; // no celebration on the priming pass
    }
    for (const k of ["calories","protein","carbs","fat","water"]) {
      if (checks[k] && !cur[k]) { cur[k] = true; newlyHit = k; }
      if (!checks[k]) cur[k] = false; // reset if they drop below (lets it re-fire)
    }
    celebratedRef.current[today] = cur;
    const allHit = checks.calories && checks.protein && checks.carbs && checks.fat;
    if (newlyHit) {
      if (allHit && !cur._all) { cur._all = true; fireCelebration("All goals hit today! 🎉 Huge work.", true); }
      else fireCelebration(pick(cheerFor[newlyHit]));
    }
    if (!allHit) cur._all = false;
  // eslint-disable-next-line
  },[allDays, water, goals, selDay, loaded]);

  const handleProfileSave = (p) => { setProfile(p); saveProfile(p); };
  const handleApplyGoals = (g) => { setGoals(g); saveGoals(g); };

  const setDayWeight = (val) => setWeights(prev=>{
    const out = {...prev};
    if (val==="" || val==null) delete out[selDay];
    else out[selDay] = +val;
    saveWeights(out);
    return out;
  });
  const addWater = (oz=WATER_STEP) => { haptic(8); setWater(prev=>{
    const out = {...prev, [selDay]:(prev[selDay]||0)+oz};
    saveWater(out);
    return out;
  }); };
  const resetWater = () => setWater(prev=>{
    const out = {...prev}; delete out[selDay];
    saveWater(out);
    return out;
  });

  const applyAndSaveTheme = (t) => {
    applyTheme(t);          // t=null resets to default
    setTheme(t);
    saveTheme(t);
    setThemeVersion(v=>v+1); // force a re-render so new colors paint everywhere
    haptic(8);
  };

  const updateSetting = (key, value) => {
    setSettings(prev=>{
      const out = {...prev, [key]:value};
      saveSettings(out);
      if (key==="haptics") setHapticsOn(value);
      return out;
    });
    haptic(8);
  };

  const handleDeleteBarcode = (code) => {
    setBarcodes(prev=>{ const out={...prev}; delete out[code]; saveBarcodes(out); return out; });
  };

  const handleClearData = () => {
    if (!window.confirm("This will erase ALL your data on this device — logs, workouts, meals, goals, and settings. This cannot be undone. Are you sure?")) return;
    const keys = ["nl4_days","nl4_days_bak","nl4_goals","nl4_goals_bak","nl4_meals","nl4_meals_bak",
      "nl4_workouts","nl4_workouts_bak","nl4_weights","nl4_weights_bak","nl4_water","nl4_water_bak",
      "nl4_profile","nl4_profile_bak","nl4_barcodes","nl4_barcodes_bak","nl4_standout","nl4_standout_bak",
      "nl4_settings","nl4_theme","nl4_snapshot","nl4_seen_version"];
    keys.forEach(k=>{ try { localStorage.removeItem(k); } catch {} });
    setShowSettings(false);
    setTimeout(()=>window.location.reload(), 200);
  };

  const runFeatureAction = (action) => {
    if (!action) return;
    setShowWelcome(false); setShowVersions(false); setShowSettings(false); setShowHist(false);
    switch (action) {
      case "chat":    setActiveTab("chat"); break;
      case "log":     setActiveTab("log"); break;
      case "train":   setActiveTab("chat"); break;
      case "workouts":setActiveTab("workouts"); break;
      case "week":    setActiveTab("week"); break;
      case "profile": setActiveTab("profile"); break;
      case "scan":    setActiveTab("chat"); setTimeout(()=>setScanning(true), 250); break;
      case "settings":setTimeout(()=>setShowSettings(true), 200); break;
      case "programs":setActiveTab("programs"); break;
      default: break;
    }
  };

  const onBarcodeDetected = async (code) => {
    setScanning(false);
    haptic(20);
    if (barcodes[code]) {
      setScanConfirm({ code, data:{...barcodes[code]}, notFound:false });
      return;
    }
    setScanLoading(true);
    try {
      const found = await lookupBarcode(code);
      if (found) setScanConfirm({ code, data:found, notFound:false });
      else setScanConfirm({ code, data:null, notFound:true });
    } catch {
      setScanConfirm({ code, data:null, notFound:true });
    } finally {
      setScanLoading(false);
    }
  };
  const logScannedItem = (entry) => {
    if (scanConfirm?.code) {
      setBarcodes(prev=>{
        const out = {...prev, [scanConfirm.code]:entry};
        saveBarcodes(out);
        return out;
      });
    }
    const now = Date.now();
    mutEntries(prev=>[...prev, {...entry, id:now+Math.random(), loggedAt:now}]);
    setScanConfirm(null);
    fireCelebration(`Logged ${entry.name} 📦`);
  };

  const importFileRef = useRef(null);
  const holdTimer = useRef(null);

  const TAB_ORDER = ["chat","log","workouts","programs"];
  const edgeSwipe = useRef({x:0,y:0,fromEdge:false});
  const onAppTouchStart = (e)=>{
    if (e.touches.length!==1) { edgeSwipe.current.fromEdge=false; return; }
    const t=e.touches[0];
    const w=window.innerWidth;
    edgeSwipe.current = { x:t.clientX, y:t.clientY,
      fromEdge: t.clientX<=28 || t.clientX>=w-28 };
  };
  const onAppTouchEnd = (e)=>{
    if (!edgeSwipe.current.fromEdge) return;
    edgeSwipe.current.fromEdge=false;
    if (showHist || scanning || scanConfirm || customWater!==null || showWelcome || showVersions) return;
    const t=e.changedTouches[0];
    const dx=t.clientX-edgeSwipe.current.x, dy=t.clientY-edgeSwipe.current.y;
    if (Math.abs(dx)<80 || Math.abs(dx) < Math.abs(dy)*2) return;
    const idx = TAB_ORDER.indexOf(activeTab);
    if (idx<0) return;
    if (dx<0 && idx<TAB_ORDER.length-1) { haptic(8); setActiveTab(TAB_ORDER[idx+1]); } // swipe left → next
    else if (dx>0 && idx>0)            { haptic(8); setActiveTab(TAB_ORDER[idx-1]); } // swipe right → prev
  };

  const handleExport = () => {
    const blob = {
      version: 1, exportedAt: new Date().toISOString(),
      days: allDays, goals, meals, workouts, profile, weights, water, barcodes, standout, theme,
    };
    const str = JSON.stringify(blob, null, 2);
    const url = URL.createObjectURL(new Blob([str], { type:"application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `nutrilog-backup-${todayKey()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  };
  const handleImportClick = () => importFileRef.current?.click();

  const handleShareBackup = async () => {
    const blob = {
      version: 1, exportedAt: new Date().toISOString(),
      days: allDays, goals, meals, workouts, profile, weights, water, barcodes, standout, theme,
    };
    const str = JSON.stringify(blob, null, 2);
    const file = new File([str], `nutrilog-backup-${todayKey()}.json`, { type:"application/json" });
    try {
      if (navigator.canShare && navigator.canShare({ files:[file] })) {
        await navigator.share({ files:[file], title:"NutriLog backup",
          text:"My NutriLog backup file." });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title:"NutriLog backup", text:str });
        return;
      }
    } catch (e) { /* user cancelled or unsupported — fall through to download */ }
    handleExport();
  };
  const handleImportFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.days)     { setAllDays(data.days);   saveAll(data.days); }
        if (data.goals)    { const g={...DEFAULT_GOALS,...data.goals}; setGoals(g); saveGoals(g); }
        if (data.meals)    { setMeals(data.meals);     saveMeals(data.meals); }
        if (data.workouts) { setWorkouts(data.workouts); saveWorkouts(data.workouts); }
        if (data.profile)  { const p={...DEFAULT_PROFILE,...data.profile}; setProfile(p); saveProfile(p); }
        if (data.weights)  { setWeights(data.weights); saveWeights(data.weights); }
        if (data.water)    { setWater(data.water);     saveWater(data.water); }
        if (data.barcodes) { setBarcodes(data.barcodes); saveBarcodes(data.barcodes); }
        if (data.standout) { setStandout(data.standout); saveStandout(data.standout); }
        if (data.theme)    { applyTheme(data.theme); setTheme(data.theme); saveTheme(data.theme); setThemeVersion(v=>v+1); }
        setShowHist(false);
        alert("Backup restored successfully.");
      } catch {
        alert("That file couldn't be read as a NutriLog backup.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      key={`theme-${themeVersion}`}
      onTouchStart={onAppTouchStart} onTouchEnd={onAppTouchEnd}
      style={{
      height:vh, width:"100%", background:T.bg, color:T.text,
      fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      display:"flex", flexDirection:"column", overflow:"hidden",
      position:"fixed", top:0, left:0,
    }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;-webkit-text-size-adjust:100%;}
        input,textarea,button{font-family:inherit;-webkit-appearance:none;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}
        textarea{resize:none;}
        input[type=range]{-webkit-appearance:none;appearance:none;background:${T.border};border-radius:99px;height:6px;outline:none;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;cursor:pointer;background:white;box-shadow:0 1px 4px #0006;}
        @keyframes pulse{0%,100%{opacity:.25}50%{opacity:1}}
        @keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes bump{0%{transform:scale(1)}30%{transform:scale(1.35)}60%{transform:scale(.92)}100%{transform:scale(1)}}
        @keyframes confettiFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(108vh) rotate(720deg);opacity:.9}}
        @keyframes toastPop{0%{transform:translateX(-50%) scale(.7);opacity:0}60%{transform:translateX(-50%) scale(1.05)}100%{transform:translateX(-50%) scale(1);opacity:1}}
        .msg-in{animation:fadein .2s ease;}
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background:T.surface, borderBottom:`1px solid ${T.border}`,
        padding:`max(env(safe-area-inset-top),12px) 16px 12px`,
        flexShrink:0,
      }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setShowHist(true)}
              style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
                borderRadius:10,minWidth:44,minHeight:44,cursor:"pointer",fontSize:18,
                display:"flex",alignItems:"center",justifyContent:"center",
                WebkitTapHighlightColor:"transparent"}}>☰</button>
            <div>
              <div style={{fontSize:10,color:T.accent,letterSpacing:"0.18em"}}>
                {profile.name ? profile.name.toUpperCase()+"'S FITNESS" : "MACRO INTELLIGENCE"}
              </div>
              <div style={{fontSize:19,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1.2,
                background:T.gHeader,WebkitBackgroundClip:"text",backgroundClip:"text",
                WebkitTextFillColor:"transparent"}}>NutriLog</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:T.muted}}>CAL LEFT</div>
              <div style={{fontSize:19,fontWeight:800,letterSpacing:"-0.03em",
                color:remaining.calories>=0?T.accent:T.cal}}>
                {Math.abs(Math.round(remaining.calories))}
                <span style={{fontSize:10,color:T.muted,fontWeight:400}}>
                  {remaining.calories>=0?" left":" over"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Day selector ── */}
      <div style={{flexShrink:0,padding:"10px 14px 0",background:T.bg}}>
        {/* Always-visible current date */}
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:8}}>
          <span style={{fontSize:15,fontWeight:800,color:isToday(selDay)?T.accent:T.text}}>
            {isToday(selDay)?"Today":fmtDate(selDay)}
          </span>
          <span style={{fontSize:12,color:T.muted}}>{fmtFull(selDay)}</span>
        </div>
        {loggedDays.filter(d=>d!==todayKey()).length>0 && (
          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4,
            scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
            {!isToday(selDay) && (
              <button onClick={()=>setSelDay(todayKey())}
                style={{background:T.surface,color:T.muted,
                  border:`1px solid ${T.border}`,
                  borderRadius:22,padding:"8px 16px",cursor:"pointer",
                  fontSize:13,whiteSpace:"nowrap",fontWeight:400,
                  minHeight:38,WebkitTapHighlightColor:"transparent",flexShrink:0}}>
                Today
              </button>
            )}
            {loggedDays.filter(d=>d!==todayKey()).slice(0,6).map(d=>(
              <button key={d} onClick={()=>setSelDay(d)}
                style={{background:selDay===d?T.accent:T.surface,
                  color:selDay===d?"#0b0f0b":T.muted,
                  border:`1px solid ${selDay===d?T.accent:T.border}`,
                  borderRadius:22,padding:"8px 16px",cursor:"pointer",
                  fontSize:13,whiteSpace:"nowrap",fontWeight:selDay===d?700:400,
                  minHeight:38,WebkitTapHighlightColor:"transparent",flexShrink:0}}>
                {fmtDate(d)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tab bar ── */}
      <div style={{display:"flex",margin:"10px 14px 0",background:T.surface,
        borderRadius:12,padding:4,border:`1px solid ${T.border}`,flexShrink:0}}>
        {[["chat","💬"],["log","📋"],["workouts","💪"],["programs","🗂️"]].map(([tab,label])=>(
          <button key={tab} onClick={()=>setActiveTab(tab)}
            style={{flex:1,background:activeTab===tab?T.gAccent:"none",
              color:activeTab===tab?"#0b0f0b":"#8fb38f",
              filter:activeTab===tab?"none":"grayscale(0.3)",
              border:"none",borderRadius:10,padding:"10px",cursor:"pointer",
              fontSize:18,fontWeight:activeTab===tab?700:500,
              minHeight:42,transition:"all .2s",
              boxShadow:activeTab===tab?`${T.glow} ${T.accent}88`:"none",
              transform:activeTab===tab?"translateY(-1px)":"none",
              WebkitTapHighlightColor:"transparent"}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Chat tab ── */}
      {activeTab==="chat"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",
          padding:"0 14px"}}>
          {/* Messages scroll area */}
          <div style={{flex:1,overflowY:"auto",padding:"14px 0 8px",
            WebkitOverflowScrolling:"touch"}}>
            {chatMsgs.map((m,i)=><Bubble key={i} msg={m}/>)}
            {loading&&(
              <div style={{display:"flex",marginBottom:14}}>
                <div style={{background:T.ai,border:`1px solid ${T.border}`,
                  borderRadius:"18px 18px 18px 5px",padding:"12px 16px"}}>
                  <div style={{display:"flex",gap:5,alignItems:"center"}}>
                    {[0,1,2].map(i=>(
                      <div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.accent,
                        animation:`pulse 1.2s ${i*0.2}s infinite`}}/>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>

          {/* Input bar */}
          <div style={{flexShrink:0,paddingBottom:`max(env(safe-area-inset-bottom),14px)`,paddingTop:8}}>
            {/* Pending photo preview */}
            {pendingImage && (
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,
                background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:8}}>
                <img src={pendingImage.dataUrl} alt="to send"
                  style={{width:48,height:48,objectFit:"cover",borderRadius:8}}/>
                <span style={{flex:1,fontSize:12,color:T.muted}}>Photo ready — add a note or just send.</span>
                <button onClick={()=>setPendingImage(null)}
                  style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
                    borderRadius:8,minWidth:40,minHeight:40,fontSize:16,cursor:"pointer",
                    WebkitTapHighlightColor:"transparent"}}>×</button>
              </div>
            )}
            <div style={{display:"flex",gap:8,alignItems:"flex-end",
              background:T.surface,borderRadius:16,
              padding:"8px 8px 8px 8px",border:`1px solid ${T.border}`}}>
              {/* Hidden file input (camera or library) */}
              <input ref={fileRef} type="file" accept="image/*"
                style={{display:"none"}}
                onChange={e=>{ handlePhoto(e.target.files?.[0]); e.target.value=""; }}/>
              {/* Camera button */}
              <button onClick={()=>fileRef.current?.click()} disabled={loading}
                style={{background:T.card,border:`1px solid ${T.border}`,color:T.text,
                  borderRadius:12,minWidth:44,minHeight:44,fontSize:20,cursor:"pointer",
                  flexShrink:0,WebkitTapHighlightColor:"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                📷
              </button>
              <button onClick={()=>setScanning(true)} disabled={loading}
                aria-label="Scan barcode"
                style={{background:T.card,border:`1px solid ${T.border}`,color:T.text,
                  borderRadius:12,minWidth:44,minHeight:44,fontSize:18,cursor:"pointer",
                  flexShrink:0,WebkitTapHighlightColor:"transparent",fontWeight:900,letterSpacing:"-1px",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                ▌▎▌
              </button>
              <textarea ref={inputRef} value={input} rows={1}
                onChange={e=>{
                  setInput(e.target.value);
                  e.target.style.height="auto";
                  e.target.style.height=Math.min(e.target.scrollHeight,88)+"px";
                }}
                placeholder="Log food, a workout, ask anything…"
                style={{flex:1,background:"none",border:"none",color:T.text,
                  fontSize:16,lineHeight:1.5,padding:"4px 0",outline:"none",
                  overflowY:"auto",minHeight:26,maxHeight:88}}/>
              <button onClick={handleSend} disabled={loading||(!input.trim()&&!pendingImage)}
                style={{background:T.gAccent,color:"#0b0f0b",border:"none",
                  borderRadius:12,padding:"0 16px",fontWeight:700,fontSize:15,
                  minHeight:44,minWidth:64,
                  boxShadow:loading||(!input.trim()&&!pendingImage)?"none":`${T.glow} ${T.accent}66`,
                  cursor:loading||(!input.trim()&&!pendingImage)?"not-allowed":"pointer",
                  opacity:loading||(!input.trim()&&!pendingImage)?0.4:1,transition:"all .15s",flexShrink:0,
                  WebkitTapHighlightColor:"transparent",display:"flex",
                  alignItems:"center",justifyContent:"center"}}>
                {loading?"…":"Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Log tab ── */}
      {activeTab==="log"&&(
        <div ref={logScrollRef} style={{flex:1,overflowY:"auto",padding:"12px 14px",WebkitOverflowScrolling:"touch"}}>
          {/* Streak bar */}
          <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:10,color:T.muted,letterSpacing:"0.12em"}}>STREAKS</span>
            <InfoDot title="Streaks">
              A streak counts how many days in a row you've hit a goal, up to today.
              <br/><br/>
              🔥 Calories — landed within 100 of your calorie goal<br/>
              💪 Protein · ⚡ Carbs · 🥑 Fat — met or beat that macro goal<br/>
              🏋️ Workout — logged at least one workout that day
              <br/><br/>
              Miss a full day and that streak resets. Today not being done yet doesn't
              break it — the tile just stays gray until you hit the goal today.
            </InfoDot>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {[["calories","🔥",T.cal,streaks.calories],
              ["protein","💪",T.protein,streaks.protein],
              ["carbs","⚡",T.carbs,streaks.carbs],
              ["fat","🥑",T.fat,streaks.fat],
              ["workout","🏋️",T.info,streaks.workout]].map(([k,icon,col,n])=>{
              const active = hitToday[k]; // colored only if done today
              return (
              <div key={k} style={{flex:1,background:active?col+"22":T.surface,
                border:`1px solid ${active?col+"88":T.border}`,borderRadius:12,
                padding:"8px 4px",textAlign:"center",
                boxShadow:active?`${T.glow} ${col}55`:"none",transition:"all .2s"}}>
                <div style={{fontSize:18,filter:active?"none":"grayscale(1) opacity(0.4)",
                  animation:active?"bump .4s ease":"none"}}>{icon}</div>
                <div style={{fontSize:14,fontWeight:800,color:n>0?(active?col:T.muted):T.muted,marginTop:2}}>{n}</div>
              </div>
            );})}
          </div>
          {/* Rings */}
          <div style={{background:T.surface,borderRadius:16,padding:"16px 12px",
            marginBottom:10,border:`1px solid ${T.border}`}}>
            <div style={{display:"flex",justifyContent:"space-around"}}>
              <Ring value={totals.calories} max={goals.calories} color={T.cal}     label="CALORIES"/>
              <Ring value={totals.protein}  max={goals.protein}  color={T.protein} label="PROTEIN"/>
              <Ring value={totals.carbs}    max={goals.carbs}    color={T.carbs}   label="CARBS"/>
              <Ring value={totals.fat}      max={goals.fat}      color={T.fat}     label="FAT"/>
            </div>
          </div>
          {/* Bars */}
          <div style={{background:T.surface,borderRadius:14,padding:"16px",
            marginBottom:10,border:`1px solid ${T.border}`}}>
            <Bar label="PROTEIN"       value={totals.protein} max={goals.protein} color={T.protein}/>
            <Bar label="CARBS"         value={totals.carbs}   max={goals.carbs}   color={T.carbs}/>
            <Bar label="FAT"           value={totals.fat}     max={goals.fat}     color={T.fat}/>
          </div>

          {/* Weight + Water row */}
          <div style={{display:"flex",gap:10,marginBottom:10}}>
            {/* Weight check-in */}
            <div style={{flex:"1 1 0",minWidth:0,background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,
              padding:"12px"}}>
              <div style={{fontSize:10,color:T.accent,letterSpacing:"0.1em",marginBottom:8}}>WEIGHT</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <input type="number" inputMode="decimal" step="0.1" min="0" max="2000"
                  value={weights[selDay]!=null ? toDisplayWeight(weights[selDay], settings.units) : ""}
                  onChange={e=>setDayWeight(e.target.value===""?"":fromDisplayWeight(e.target.value, settings.units))}
                  placeholder="—"
                  style={{flex:1,minWidth:0,background:T.bg,border:`1px solid ${T.border}`,
                    borderRadius:8,padding:"9px 10px",color:T.text,fontSize:18,fontWeight:700,
                    outline:"none",width:"100%"}}/>
                <span style={{fontSize:12,color:T.muted}}>{weightUnit(settings.units)}</span>
              </div>
            </div>
            {/* Water tracker */}
            <div style={{flex:"1 1 0",minWidth:0,background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,
              padding:"12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:10,color:T.info,letterSpacing:"0.1em"}}>WATER
                  <InfoDot title="Water tracking">
                    Tap the button to add your set amount each time you drink. Press and
                    hold the button to pick a different amount (12/16/20/24 oz) or enter a
                    custom one — that becomes your new default.
                    The bar fills toward your daily goal (set in Profile → Daily Goals).
                  </InfoDot>
                </span>
                {(water[selDay]||0)>0 && (
                  <button onClick={resetWater}
                    style={{background:"none",border:"none",color:T.muted,fontSize:10,
                      cursor:"pointer",WebkitTapHighlightColor:"transparent",padding:0}}>reset</button>
                )}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,position:"relative"}}>
                <button
                  onClick={()=>addWater(waterStep)}
                  onContextMenu={(e)=>{ e.preventDefault(); setWaterMenu(true); }}
                  onTouchStart={(e)=>{ holdTimer.current=setTimeout(()=>{ setWaterMenu(true); }, 450); }}
                  onTouchEnd={()=>{ clearTimeout(holdTimer.current); }}
                  onTouchMove={()=>{ clearTimeout(holdTimer.current); }}
                  onMouseDown={()=>{ holdTimer.current=setTimeout(()=>{ setWaterMenu(true); }, 450); }}
                  onMouseUp={()=>{ clearTimeout(holdTimer.current); }}
                  style={{flex:1,background:`linear-gradient(135deg,#60a5fa,#3b82f6)`,border:"none",
                    color:"#04121f",borderRadius:10,padding:"9px",cursor:"pointer",
                    fontSize:13,fontWeight:700,minHeight:42,WebkitTapHighlightColor:"transparent",
                    boxShadow:`0 0 12px ${T.info}55`}}>
                  +{toDisplayWater(waterStep, settings.units)} {waterUnit(settings.units)}
                </button>
                {waterMenu && (
                  <div style={{position:"absolute",bottom:"110%",left:0,right:0,
                    background:T.surface,border:`1px solid ${T.info}66`,borderRadius:12,
                    padding:8,zIndex:60,boxShadow:`0 6px 24px #000a`}}>
                    <div style={{fontSize:10,color:T.muted,letterSpacing:"0.1em",marginBottom:6,padding:"0 2px"}}>
                      ADD AMOUNT
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {[12,16,20,24].map(oz=>(
                        <button key={oz} onClick={()=>{ addWater(oz); setWaterStep(oz); setWaterMenu(false); }}
                          style={{flex:"1 1 40%",background:T.card,border:`1px solid ${T.border}`,
                            color:T.text,borderRadius:8,padding:"10px",cursor:"pointer",
                            fontSize:13,fontWeight:700,minHeight:42,WebkitTapHighlightColor:"transparent"}}>
                          {toDisplayWater(oz, settings.units)} {waterUnit(settings.units)}
                        </button>
                      ))}
                      <button onClick={()=>{ setWaterMenu(false); setCustomWater(""); }}
                        style={{flex:"1 1 100%",background:T.info+"22",border:`1px solid ${T.info}66`,
                          color:T.info,borderRadius:8,padding:"10px",cursor:"pointer",
                          fontSize:13,fontWeight:700,minHeight:42,WebkitTapHighlightColor:"transparent"}}>
                        Custom amount…
                      </button>
                    </div>
                  </div>
                )}
                {waterMenu && (
                  <div onClick={()=>setWaterMenu(false)}
                    style={{position:"fixed",inset:0,zIndex:55}}/>
                )}
              </div>
              <div style={{marginTop:8,fontSize:13,color:T.text,fontWeight:700}}>
                {toDisplayWater(water[selDay]||0, settings.units)}
                <span style={{fontSize:11,color:T.muted,fontWeight:400}}>
                  {" "}/ {toDisplayWater(goals.water||100, settings.units)} {waterUnit(settings.units)}
                </span>
              </div>
              <div style={{height:5,background:T.border,borderRadius:99,marginTop:6,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min((water[selDay]||0)/(goals.water||100)*100,100)}%`,
                  background:T.info,borderRadius:99,transition:"width .3s"}}/>
              </div>
            </div>
          </div>

          {/* Entries */}
          {entries.length>0 ? (<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,marginTop:6}}>
              <div style={{fontSize:11,color:T.accent,letterSpacing:"0.12em"}}>
                {isToday(selDay)?"TODAY'S MEALS":fmtDate(selDay).toUpperCase()+" MEALS"} · {entries.length} ITEMS
              </div>
              <button onClick={()=>{ if(window.confirm("Clear all meals logged for this day?")) mutEntries([]); }}
                style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
                  fontSize:12,borderRadius:8,padding:"6px 12px",cursor:"pointer",
                  minHeight:36,WebkitTapHighlightColor:"transparent"}}>
                Clear
              </button>
            </div>
            {entries.map(e=>(
              <EntryRow key={e.id} entry={e}
                onDelete={id=>mutEntries(p=>p.filter(e=>e.id!==id))}
                onEdit={(id,patch)=>mutEntries(p=>p.map(e=>e.id===id?{...e,...patch}:e))}/>
            ))}
          </>) : (
            <div style={{textAlign:"center",padding:"30px 0",color:T.muted}}>
              <div style={{fontSize:36,marginBottom:12}}>🥗</div>
              <div style={{fontSize:15,marginBottom:6}}>
                {isToday(selDay)?"No meals logged yet.":"No meals for this day."}
              </div>
              <div style={{fontSize:12}}>Go to Chat and tell me what you ate.</div>
            </div>
          )}
          <div style={{height:"env(safe-area-inset-bottom,20px)"}}/>
        </div>
      )}

      {/* ── Workouts tab ── */}
      {activeTab==="workouts"&&(
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px",WebkitOverflowScrolling:"touch"}}>
          {/* Workout streak banner */}
          {(() => {
            const isStd = !!standout[selDay];
            const active = dayWorkouts.length>0;
            return (
            <div style={{display:"flex",alignItems:"center",gap:12,
              background:isStd?"linear-gradient(135deg,#3a2f0a,#1a1605)":T.surface,
              border:`1px solid ${isStd?T.warn:active?T.info+"88":T.border}`,
              borderRadius:14,padding:"14px",marginBottom:12,position:"relative",
              boxShadow:isStd?`0 0 22px ${T.warn}55`:active?`${T.glow} ${T.info}44`:"none"}}>
              {isStd && (
                <span style={{position:"absolute",top:-10,right:-6,fontSize:24,
                  filter:`drop-shadow(0 0 6px ${T.warn})`,animation:"bump .5s ease"}}>⭐</span>
              )}
              <div style={{fontSize:30,filter:active?"none":"grayscale(1) opacity(0.4)",
                animation:active?"bump .4s ease":"none"}}>{isStd?"🔥":"🏋️"}</div>
              <div>
                <div style={{fontSize:22,fontWeight:800,color:isStd?T.warn:active?T.info:T.muted}}>
                  {streaks.workout} day{streaks.workout===1?"":"s"}
                </div>
                <div style={{fontSize:11,color:isStd?T.warn:T.muted}}>
                  {isStd?"standout session!":"workout streak"}
                </div>
              </div>
              <div style={{marginLeft:"auto",textAlign:"right"}}>
                <div style={{fontSize:11,color:T.muted}}>{isToday(selDay)?"Today":fmtDate(selDay)}</div>
                <div style={{fontSize:13,fontWeight:700,color:T.text}}>{dayWorkouts.length} logged</div>
              </div>
            </div>
            );
          })()}

          {dayWorkouts.length>0 ? (() => {
            const analysis = analyzeWorkoutDay(workouts, selDay);
            const exMap = {};
            (analysis.exercises||[]).forEach(e=>{ exMap[e.key] = e; });
            const groups = [];
            const idx = {};
            dayWorkouts.forEach(w=>{
              const key = normName(w.name||"");
              if (idx[key]==null) { idx[key] = groups.length; groups.push({name:w.name, key, category:w.category, sets:[]}); }
              groups[idx[key]].sets.push(w);
            });
            const badgeColor = (type) => type==="pr"||type==="volpr" ? T.warn
              : type==="up" ? T.accent : type==="down" ? T.muted
              : type==="new" ? T.info : T.muted;
            return (
              <>
                {/* Highlights summary banner */}
                {analysis.hasData && (
                  <div style={{background:analysis.isStandoutDay?"linear-gradient(135deg,#2a230a,#14110422)":T.surface,
                    border:`1px solid ${analysis.isStandoutDay?T.warn+"88":T.border}`,
                    borderRadius:14,padding:"13px 15px",marginBottom:12,
                    boxShadow:analysis.isStandoutDay?`0 0 18px ${T.warn}33`:"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontSize:15}}>{analysis.isStandoutDay?"⭐":"📊"}</span>
                      <span style={{fontSize:11,color:analysis.isStandoutDay?T.warn:T.accent,
                        letterSpacing:"0.1em",fontWeight:700}}>SESSION SUMMARY</span>
                    </div>
                    <div style={{fontSize:13.5,color:T.text,lineHeight:1.5,fontWeight:600}}>
                      {analysis.summary}
                    </div>
                    <div style={{display:"flex",gap:16,marginTop:10}}>
                      <div>
                        <div style={{fontSize:9,color:T.muted,letterSpacing:"0.08em"}}>TOTAL VOLUME</div>
                        <div style={{fontSize:16,fontWeight:800,color:T.text}}>
                          {analysis.dayVolume.toLocaleString()}<span style={{fontSize:10,color:T.muted,fontWeight:400}}> lbs</span>
                        </div>
                      </div>
                      {analysis.bestLift && (
                        <div>
                          <div style={{fontSize:9,color:T.muted,letterSpacing:"0.08em"}}>TOP LIFT</div>
                          <div style={{fontSize:16,fontWeight:800,color:T.text}}>
                            {analysis.bestLift.weight}<span style={{fontSize:10,color:T.muted,fontWeight:400}}> lbs</span>
                          </div>
                        </div>
                      )}
                      {analysis.prCount>0 && (
                        <div>
                          <div style={{fontSize:9,color:T.muted,letterSpacing:"0.08em"}}>RECORDS</div>
                          <div style={{fontSize:16,fontWeight:800,color:T.warn}}>{analysis.prCount} 🏆</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {groups.map((grp,gi)=>{
                  const ex = exMap[grp.key];
                  const badges = ex?.badges||[];
                  const hot = badges.some(b=>b.type==="pr"||b.type==="volpr");
                  return (
                  <div key={gi} style={{background:T.card,borderRadius:12,
                    border:`1px solid ${hot?T.warn+"66":T.info+"33"}`,marginBottom:8,overflow:"hidden",
                    boxShadow:hot?`0 0 14px ${T.warn}22`:"none"}}>
                    {/* Exercise name header */}
                    <div style={{display:"flex",alignItems:"center",
                      padding:"11px 14px",borderBottom:`1px solid ${T.border}55`}}>
                      <div style={{flex:1,minWidth:0}}>
                        {editingName?.key===grp.key ? (
                          <div>
                            <input value={editingName.name} autoFocus
                              onChange={e=>setEditingName(p=>({...p,name:e.target.value}))}
                              style={{width:"100%",background:T.bg,border:`1px solid ${T.accent}`,
                                borderRadius:8,padding:"8px 10px",color:T.text,fontSize:15,fontWeight:700,
                                outline:"none",marginBottom:6}}/>
                            <div style={{fontSize:10,color:T.muted,marginBottom:8,lineHeight:1.4}}>
                              Renaming updates this lift across all days. Match another lift's name to merge their history.
                            </div>
                            <div style={{display:"flex",gap:8}}>
                              <button onClick={()=>{ if(editingName.name.trim()) renameExercise(grp.key,editingName.name.trim()); setEditingName(null); haptic(8); }}
                                style={{flex:1,background:T.accent,border:"none",color:"#0b0f0b",
                                  borderRadius:8,padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer",
                                  WebkitTapHighlightColor:"transparent"}}>Save name</button>
                              <button onClick={()=>setEditingName(null)}
                                style={{flex:1,background:"none",border:`1px solid ${T.border}`,color:T.muted,
                                  borderRadius:8,padding:"9px",fontSize:13,cursor:"pointer",
                                  WebkitTapHighlightColor:"transparent"}}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div onClick={()=>setEditingName({key:grp.key,name:grp.name})}
                            style={{fontSize:15,fontWeight:700,cursor:"pointer"}}>
                            🏋️ {grp.name}
                            <span style={{fontSize:11,color:T.muted,marginLeft:6}}>✏️</span>
                          </div>
                        )}
                        <div style={{fontSize:10,color:T.info,marginTop:2,letterSpacing:"0.06em"}}>
                          {grp.sets.length} {grp.sets.length===1?"set":"sets"}
                          {ex?.volume>0?` · ${ex.volume.toLocaleString()} lbs vol`:""}
                          {grp.category?` · ${grp.category.toUpperCase()}`:""}
                        </div>
                      </div>
                    </div>
                    {/* Badges row */}
                    {badges.length>0 && (
                      <div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"8px 14px 0"}}>
                        {badges.map((b,bi)=>(
                          <span key={bi} style={{fontSize:11,fontWeight:700,
                            color:badgeColor(b.type),
                            background:badgeColor(b.type)+"18",
                            border:`1px solid ${badgeColor(b.type)}44`,
                            borderRadius:99,padding:"3px 9px"}}>
                            {b.emoji} {b.label}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Sets — always shown as indented rows */}
                    <div style={{paddingTop:badges.length>0?6:0}}>
                    {grp.sets.map((w,si)=>{
                      const p = ex?.sets?.[si]?.parsed;
                      const isTop = p && ex && p.weight===ex.topWeight && ex.topWeight>0;
                      const isEditing = editingWk?.id===w.id;
                      if (isEditing) return (
                        <div key={w.id} style={{padding:"10px 14px 10px 22px",
                          borderBottom:si<grp.sets.length-1?`1px solid ${T.border}33`:"none",
                          background:T.bg}}>
                          <div style={{fontSize:10,color:T.muted,marginBottom:5}}>EDIT SET {si+1}</div>
                          <input value={editingWk.detail}
                            onChange={e=>setEditingWk(p=>({...p,detail:e.target.value}))}
                            placeholder="185 lbs × 8"
                            style={{width:"100%",background:T.surface,border:`1px solid ${T.accent}`,
                              borderRadius:8,padding:"9px 12px",color:T.text,fontSize:14,outline:"none",
                              marginBottom:8}}/>
                          <div style={{display:"flex",gap:8}}>
                            <button onClick={()=>{ editWorkout(w.id,{detail:editingWk.detail.trim()}); setEditingWk(null); haptic(8); }}
                              style={{flex:1,background:T.accent,border:"none",color:"#0b0f0b",
                                borderRadius:8,padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer",
                                WebkitTapHighlightColor:"transparent"}}>Save</button>
                            <button onClick={()=>setEditingWk(null)}
                              style={{flex:1,background:"none",border:`1px solid ${T.border}`,color:T.muted,
                                borderRadius:8,padding:"10px",fontSize:13,cursor:"pointer",
                                WebkitTapHighlightColor:"transparent"}}>Cancel</button>
                          </div>
                        </div>
                      );
                      return (
                      <div key={w.id} style={{display:"flex",alignItems:"center",
                        padding:"9px 14px 9px 22px",
                        borderBottom:si<grp.sets.length-1?`1px solid ${T.border}33`:"none"}}>
                        <div style={{fontSize:11,color:T.muted,minWidth:44,flexShrink:0}}>Set {si+1}</div>
                        <div onClick={()=>setEditingWk({id:w.id,name:w.name,detail:w.detail||""})}
                          style={{flex:1,minWidth:0,fontSize:13,color:isTop?T.warn:T.text,
                          fontWeight:isTop?700:400,cursor:"pointer"}}>
                          {w.detail||"—"}{isTop?" 🔥":""}
                          <span style={{fontSize:11,color:T.muted,marginLeft:6}}>✏️</span>
                        </div>
                        <button onClick={()=>deleteWorkout(w.id)}
                          style={{background:"none",border:"none",color:T.muted,cursor:"pointer",
                            fontSize:18,minWidth:40,minHeight:40,display:"flex",alignItems:"center",
                            justifyContent:"center",WebkitTapHighlightColor:"transparent",flexShrink:0}}>×</button>
                      </div>
                      );
                    })}
                    </div>
                  </div>
                  );
                })}
              </>
            );
          })() : (
            <div style={{textAlign:"center",padding:"40px 16px",color:T.muted}}>
              <div style={{fontSize:36,marginBottom:12}}>💪</div>
              <div style={{fontSize:15,marginBottom:6}}>
                {isToday(selDay)?"No workouts logged today.":"No workouts this day."}
              </div>
              <div style={{fontSize:12}}>Head to the 🏋️ coach tab and tell it what you trained.</div>
            </div>
          )}
          <div style={{height:"env(safe-area-inset-bottom,20px)"}}/>
        </div>
      )}

      {/* ── Meals tab ── */}
      {activeTab==="programs"&&(
        <ProgramsTab
          programs={programs}
          activeProgId={activeProgId}
          onSave={saveProgram}
          onSetActive={setActiveProg}
          onDelete={deleteProgram}
          onLogDay={logDayWithCoach}/>
      )}

      {activeTab==="meals"&&(
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px",WebkitOverflowScrolling:"touch"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:11,color:T.accent,letterSpacing:"0.12em"}}>
              MY MEAL PREPS · {meals.length}
            </div>
            <button onClick={()=>setEditMeal("new")}
              style={{background:T.accent,border:"none",color:"#0b0f0b",
                fontSize:13,fontWeight:700,borderRadius:10,padding:"8px 14px",cursor:"pointer",
                minHeight:40,WebkitTapHighlightColor:"transparent"}}>
              + New Meal
            </button>
          </div>

          {meals.length===0 ? (
            <div style={{textAlign:"center",padding:"40px 16px",color:T.muted}}>
              <div style={{fontSize:36,marginBottom:12}}>🍱</div>
              <div style={{fontSize:15,marginBottom:6}}>No meal preps yet.</div>
              <div style={{fontSize:12,lineHeight:1.5}}>
                Create a prep with its ingredients and how many containers it makes.
                Then just say "log a [meal name] container" in Chat, or tap it here.
              </div>
            </div>
          ) : meals.map(m=>{
            const pc = mealPerContainer(m);
            return (
              <div key={m.id} style={{background:T.surface,borderRadius:14,
                border:`1px solid ${T.border}`,marginBottom:10,overflow:"hidden"}}>
                <div style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:16,fontWeight:700,marginBottom:2}}>{m.name}</div>
                      <div style={{fontSize:11,color:T.muted}}>
                        {m.containers} containers · {m.ingredients.length} ingredients
                      </div>
                    </div>
                    <button onClick={()=>setEditMeal(m)}
                      style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
                        fontSize:12,borderRadius:8,padding:"6px 11px",cursor:"pointer",
                        minHeight:36,WebkitTapHighlightColor:"transparent"}}>Edit</button>
                  </div>
                  <div style={{display:"flex",gap:14,marginBottom:12}}>
                    {[[`${pc.calories}`,"cal",T.cal],[`${pc.protein}g`,"P",T.protein],
                      [`${pc.carbs}g`,"C",T.carbs],[`${pc.fat}g`,"F",T.fat]].map(([v,lbl,col])=>(
                      <div key={lbl}>
                        <span style={{fontSize:15,fontWeight:700,color:col}}>{v}</span>
                        <span style={{fontSize:10,color:T.muted,marginLeft:2}}>{lbl}</span>
                      </div>
                    ))}
                    <span style={{fontSize:10,color:T.muted,marginLeft:"auto",alignSelf:"center"}}>per container</span>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    {/* Container count stepper */}
                    <div style={{display:"flex",alignItems:"center",gap:6,
                      background:T.bg,border:`1px solid ${T.border}`,borderRadius:9,padding:"4px 8px"}}>
                      <button onClick={()=>setMealCounts(p=>({...p,[m.id]:Math.max(1,(p[m.id]||1)-1)}))}
                        style={{background:"none",border:"none",color:T.muted,fontSize:18,cursor:"pointer",
                          minWidth:30,minHeight:30,WebkitTapHighlightColor:"transparent"}}>−</button>
                      <span style={{fontSize:14,fontWeight:700,color:T.text,minWidth:16,textAlign:"center"}}>
                        {mealCounts[m.id]||1}
                      </span>
                      <button onClick={()=>setMealCounts(p=>({...p,[m.id]:(p[m.id]||1)+1}))}
                        style={{background:"none",border:"none",color:T.accent,fontSize:18,cursor:"pointer",
                          minWidth:30,minHeight:30,WebkitTapHighlightColor:"transparent"}}>+</button>
                    </div>
                    <button onClick={()=>{
                        const n = mealCounts[m.id]||1;
                        quickLogMeal(m,n);
                        setMealCounts(p=>({...p,[m.id]:1}));
                        setActiveTab("log");
                      }}
                      style={{flex:1,background:T.accent,border:"none",color:"#0b0f0b",
                        borderRadius:10,padding:"11px",cursor:"pointer",fontSize:14,fontWeight:700,
                        minHeight:46,WebkitTapHighlightColor:"transparent"}}>
                      Log {(mealCounts[m.id]||1)===1?"1 container":`${mealCounts[m.id]} containers`}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{height:"env(safe-area-inset-bottom,20px)"}}/>
        </div>
      )}

      {/* ── Week calendar tab ── */}
      {activeTab==="week"&&(
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px",WebkitOverflowScrolling:"touch"}}>
          {/* Week nav */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <button onClick={()=>setWeekAnchor(addDays(weekAnchor,-7))}
              style={{background:T.surface,border:`1px solid ${T.border}`,color:T.text,
                borderRadius:10,minWidth:44,minHeight:40,fontSize:16,cursor:"pointer",
                WebkitTapHighlightColor:"transparent"}}>‹</button>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:T.accent,letterSpacing:"0.12em"}}>WEEK OF</div>
              <div style={{fontSize:15,fontWeight:700}}>
                {fmtDate(weekAnchor)} – {fmtDate(addDays(weekAnchor,6))}
              </div>
            </div>
            <button onClick={()=>setWeekAnchor(addDays(weekAnchor,7))}
              disabled={weekAnchor>=weekStart(todayKey())}
              style={{background:T.surface,border:`1px solid ${T.border}`,
                color:weekAnchor>=weekStart(todayKey())?T.border:T.text,
                borderRadius:10,minWidth:44,minHeight:40,fontSize:16,
                cursor:weekAnchor>=weekStart(todayKey())?"default":"pointer",
                WebkitTapHighlightColor:"transparent"}}>›</button>
          </div>
          {weekAnchor!==weekStart(todayKey())&&(
            <button onClick={()=>setWeekAnchor(weekStart(todayKey()))}
              style={{width:"100%",background:"none",border:`1px solid ${T.border}`,
                color:T.muted,borderRadius:10,padding:"8px",fontSize:12,cursor:"pointer",
                marginBottom:10,WebkitTapHighlightColor:"transparent"}}>
              Jump to this week
            </button>
          )}

          {/* Weekly trend chart (calories per day, with goal line) */}
          {(() => {
            const wkKeys = weekDays(weekAnchor);
            const cals = wkKeys.map(dk=>Math.round(sumDay(allDays[dk]).calories));
            const pros = wkKeys.map(dk=>Math.round(sumDay(allDays[dk]).protein));
            const maxCal = Math.max(goals.calories, ...cals, 1);
            const loggedCount = cals.filter(c=>c>0).length;
            const avgCal = loggedCount ? Math.round(cals.filter(c=>c>0).reduce((a,b)=>a+b,0)/loggedCount) : 0;
            const avgPro = loggedCount ? Math.round(pros.filter((_,i)=>cals[i]>0).reduce((a,b)=>a+b,0)/loggedCount) : 0;
            const hitDays = wkKeys.filter(dk=>dayHitsGoal(sumDay(allDays[dk]),goals,"calories")).length;
            const wkWorkouts = wkKeys.filter(dk=>(workouts[dk]?.length||0)>0).length;
            const goalY = 1 - goals.calories/maxCal; // fraction from top
            return (
              <div style={{background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,
                padding:"14px",marginBottom:12}}>
                <div style={{fontSize:10,color:T.accent,letterSpacing:"0.12em",marginBottom:12}}>
                  CALORIES THIS WEEK
                </div>
                {/* Bars */}
                <div style={{position:"relative",height:120,display:"flex",alignItems:"flex-end",
                  gap:6,marginBottom:8}}>
                  {/* goal line */}
                  <div style={{position:"absolute",left:0,right:0,top:`${goalY*100}%`,
                    borderTop:`1px dashed ${T.accent}88`,zIndex:1}}>
                    <span style={{position:"absolute",right:0,top:-14,fontSize:8,color:T.accent}}>goal</span>
                  </div>
                  {wkKeys.map((dk,i)=>{
                    const c = cals[i];
                    const h = Math.max((c/maxCal)*100, c>0?4:0);
                    const over = c > goals.calories;
                    const hit = dayHitsGoal(sumDay(allDays[dk]),goals,"calories");
                    return (
                      <div key={dk} style={{flex:1,display:"flex",flexDirection:"column",
                        alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
                        <div style={{width:"100%",height:`${h}%`,borderRadius:"5px 5px 0 0",
                          background: c===0 ? T.border : over ? T.cal : hit ? T.gAccent : T.accent2,
                          transition:"height .4s cubic-bezier(.4,0,.2,1)",minHeight:c>0?3:0}}/>
                      </div>
                    );
                  })}
                </div>
                {/* Day labels */}
                <div style={{display:"flex",gap:6}}>
                  {wkKeys.map(dk=>(
                    <div key={dk} style={{flex:1,textAlign:"center",fontSize:9,
                      color:isToday(dk)?T.accent:T.muted,fontWeight:isToday(dk)?700:400}}>
                      {dowShort[new Date(dk+"T00:00:00").getDay()][0]}
                    </div>
                  ))}
                </div>
                {/* Summary stats */}
                <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
                  {[[`${avgCal}`,"avg cal",T.cal],[`${avgPro}g`,"avg protein",T.protein],
                    [`${hitDays}/7`,"cal goal",T.accent],[`${wkWorkouts}`,"workouts",T.info]].map(([v,l,col])=>(
                    <div key={l} style={{flex:"1 1 40%",background:T.card,borderRadius:10,
                      padding:"8px 10px",border:`1px solid ${T.border}`}}>
                      <div style={{fontSize:16,fontWeight:800,color:col}}>{v}</div>
                      <div style={{fontSize:10,color:T.muted}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Weight trend (only if any weigh-ins exist) */}
          {(() => {
            const wkKeys = weekDays(weekAnchor);
            const vals = wkKeys.map(dk=>weights[dk]);
            const present = vals.filter(v=>v!=null && v>0);
            if (present.length===0) return null;
            const min = Math.min(...present), max = Math.max(...present);
            const range = (max-min)||1;
            const pad = range*0.2;
            const lo = min-pad, hi = max+pad, span = (hi-lo)||1;
            const W = 280, H = 70;
            const pts = wkKeys.map((dk,i)=>({ x:(i/(6))*W, v:weights[dk] }))
              .filter(p=>p.v!=null && p.v>0)
              .map(p=>({ x:p.x, y: H - ((p.v-lo)/span)*H }));
            const path = pts.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
            const latest = present[present.length-1];
            const change = present.length>1 ? +(present[present.length-1]-present[0]).toFixed(1) : 0;
            return (
              <div style={{background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,
                padding:"14px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
                  <span style={{fontSize:10,color:T.accent,letterSpacing:"0.12em"}}>WEIGHT THIS WEEK</span>
                  <span style={{fontSize:12,color:T.muted}}>
                    {toDisplayWeight(latest, settings.units)} {weightUnit(settings.units)}
                    {change!==0 && (
                      <span style={{color:change<0?T.accent:T.warn}}>
                        {" "}({change>0?"+":""}{(+toDisplayWeight(Math.abs(change), settings.units)).toFixed(1)} {weightUnit(settings.units)})
                      </span>
                    )}
                  </span>
                </div>
                {present.length===1 ? (
                  <div style={{textAlign:"center",padding:"14px 0",color:T.muted,fontSize:12}}>
                    One weigh-in this week ({toDisplayWeight(latest, settings.units)} {weightUnit(settings.units)}). Log another day to see a trend line.
                  </div>
                ) : (
                  <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{height:70}}>
                    <path d={path} fill="none" stroke={T.accent} strokeWidth={2.5}
                      strokeLinecap="round" strokeLinejoin="round"/>
                    {pts.map((p,i)=>(
                      <circle key={i} cx={p.x} cy={p.y} r={3} fill={T.accent}/>
                    ))}
                  </svg>
                )}
                <div style={{display:"flex",gap:6,marginTop:4}}>
                  {wkKeys.map(dk=>(
                    <div key={dk} style={{flex:1,textAlign:"center",fontSize:9,
                      color:isToday(dk)?T.accent:T.muted}}>
                      {dowShort[new Date(dk+"T00:00:00").getDay()][0]}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {weekDays(weekAnchor).map(dk=>{
            const t = sumDay(allDays[dk]);
            const wkCount = workouts[dk]?.length||0;
            const future = dk > todayKey();
            const today = isToday(dk);
            const MiniRing = ({val,max,color,letter}) => {
              const r=13,c=2*Math.PI*r,pct=Math.min((val||0)/(max||1),1);
              return (
                <div style={{position:"relative",width:32,height:32}}>
                  <svg width={32} height={32} style={{transform:"rotate(-90deg)"}}>
                    <circle cx={16} cy={16} r={r} fill="none" stroke={T.border} strokeWidth={3}/>
                    <circle cx={16} cy={16} r={r} fill="none" stroke={color} strokeWidth={3}
                      strokeDasharray={`${pct*c} ${c}`} strokeLinecap="round"/>
                  </svg>
                  <span style={{position:"absolute",inset:0,display:"flex",
                    alignItems:"center",justifyContent:"center",
                    fontSize:9,fontWeight:800,color}}>{letter}</span>
                </div>
              );
            };
            const calHit = dayHitsGoal(t, goals, "calories");
            const anyData = (allDays[dk]?.length||0)>0 || wkCount>0;
            return (
              <button key={dk}
                onClick={()=>{ setSelDay(dk); setActiveTab("log"); }}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",
                  background:today?T.accent+"14":T.surface,
                  border:`1px solid ${today?T.accent:anyData?T.border:T.border}`,
                  borderRadius:14,padding:"10px 12px",marginBottom:8,cursor:"pointer",
                  textAlign:"left",opacity:future?0.45:1,
                  WebkitTapHighlightColor:"transparent"}}>
                {/* Day label */}
                <div style={{width:40,flexShrink:0}}>
                  <div style={{fontSize:11,color:T.muted}}>{dowShort[new Date(dk+"T00:00:00").getDay()]}</div>
                  <div style={{fontSize:20,fontWeight:800,color:today?T.accent:T.text}}>{dayNum(dk)}</div>
                </div>
                {/* Mini rings */}
                <div style={{display:"flex",gap:2,flex:1}}>
                  <MiniRing val={t.calories} max={goals.calories} color={T.cal}     letter="C"/>
                  <MiniRing val={t.protein}  max={goals.protein}  color={T.protein} letter="P"/>
                  <MiniRing val={t.carbs}    max={goals.carbs}    color={T.carbs}   letter="Cb"/>
                  <MiniRing val={t.fat}      max={goals.fat}      color={T.fat}     letter="F"/>
                </div>
                {/* Status */}
                <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                  {standout[dk] && (
                    <span title="standout workout"
                      style={{fontSize:15,filter:`drop-shadow(0 0 4px ${T.warn})`}}>⭐</span>
                  )}
                  {wkCount>0 && (
                    <span title="workout logged"
                      style={{width:10,height:10,borderRadius:"50%",background:T.info,
                        boxShadow:`0 0 6px ${T.info}`}}/>
                  )}
                  {anyData && (
                    <span style={{fontSize:13,fontWeight:700,
                      color: calHit ? T.accent : (t.calories>goals.calories ? T.cal : T.muted)}}>
                      {calHit ? "✓" : Math.round(t.calories)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Week legend */}
          <div style={{marginTop:10,padding:"12px 14px",background:T.surface,
            borderRadius:12,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:10,color:T.muted,letterSpacing:"0.1em",marginBottom:8}}>LEGEND</div>
            <div style={{display:"flex",flexDirection:"column",gap:6,fontSize:12,color:T.muted}}>
              <div>🟢 4 rings = calories, protein, carbs, fat fill as you log</div>
              <div><span style={{color:T.accent}}>✓</span> = calorie goal hit · <span style={{color:T.cal}}>red number</span> = over</div>
              <div><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:T.info}}/> = workout logged that day</div>
            </div>
          </div>
          <div style={{height:"env(safe-area-inset-bottom,20px)"}}/>
        </div>
      )}

      {/* ── Profile tab ── */}
      {activeTab==="profile"&&(
        <ProfileTab profile={profile} goals={goals}
          units={settings.units}
          onSave={handleProfileSave} onApplyGoals={handleApplyGoals}/>
      )}

      {scanning && (
        <BarcodeScanner onDetected={onBarcodeDetected} onClose={()=>setScanning(false)}/>
      )}
      {scanLoading && (
        <div style={{position:"fixed",inset:0,background:T.overlay,zIndex:545,
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,
            padding:"18px 22px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{display:"flex",gap:5}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.accent,
                  animation:`pulse 1.2s ${i*0.2}s infinite`}}/>
              ))}
            </div>
            <span style={{fontSize:13,color:T.text}}>Looking up product…</span>
          </div>
        </div>
      )}
      {scanConfirm && (
        <ScanConfirm initial={scanConfirm.data} code={scanConfirm.code} notFound={scanConfirm.notFound}
          onLog={logScannedItem} onClose={()=>setScanConfirm(null)}/>
      )}

      {customWater!==null && (
        <div onClick={()=>setCustomWater(null)}
          style={{position:"fixed",inset:0,background:T.overlay,zIndex:520,
            display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:T.surface,border:`1px solid ${T.info}66`,borderRadius:18,
              padding:"20px",maxWidth:320,width:"100%",boxShadow:`0 10px 50px #000a`}}>
            <div style={{fontSize:15,fontWeight:800,color:T.info,marginBottom:4}}>Custom water amount</div>
            <div style={{fontSize:12,color:T.muted,marginBottom:14}}>Enter how many ounces to add.</div>
            <input type="number" inputMode="numeric" autoFocus
              value={customWater}
              onChange={e=>setCustomWater(e.target.value)}
              placeholder="oz"
              style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,
                padding:"12px 14px",color:T.text,fontSize:18,fontWeight:700,outline:"none",
                textAlign:"center",marginBottom:14}}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setCustomWater(null)}
                style={{flex:1,background:"none",border:`1px solid ${T.border}`,color:T.muted,
                  borderRadius:12,padding:"13px",cursor:"pointer",fontSize:14,minHeight:48,
                  WebkitTapHighlightColor:"transparent"}}>Cancel</button>
              <button onClick={()=>{
                  const n = Math.round(+customWater);
                  if (n && n>0) { addWater(n); setWaterStep(n); }
                  setCustomWater(null);
                }}
                disabled={!(Math.round(+customWater)>0)}
                style={{flex:2,background:T.gAccent,border:"none",color:"#0b0f0b",
                  borderRadius:12,padding:"13px",cursor:"pointer",fontSize:14,fontWeight:700,minHeight:48,
                  opacity:(Math.round(+customWater)>0)?1:0.4,WebkitTapHighlightColor:"transparent"}}>
                Add water
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <SettingsModal current={theme}
          onApply={applyAndSaveTheme}
          onClose={()=>setShowSettings(false)}
          settings={settings} onSet={updateSetting}
          barcodes={barcodes} onDeleteBarcode={handleDeleteBarcode}
          onClearData={handleClearData}
          onTry={runFeatureAction}/>
      )}
      {showWelcome && (
        <WelcomeModal name={profile.name}
          onTry={(a)=>{ try{ _set("nl4_seen_version", APP_VERSION); }catch{} runFeatureAction(a); }}
          onClose={()=>{ setShowWelcome(false); try{ _set("nl4_seen_version", APP_VERSION); }catch{} }}/>
      )}
      {celebrate && <Confetti big={celebrate.big}/>}
      {celebrate && <Toast text={celebrate.text}/>}

      <HistoryDrawer open={showHist} allDays={allDays} selectedDay={selDay}
        onSelectDay={d=>setSelDay(d)} onClose={()=>setShowHist(false)}
        onNav={t=>setActiveTab(t)} onExport={handleExport} onImport={handleImportClick} onShare={handleShareBackup}
        onSettings={()=>setShowSettings(true)}/>
      <input ref={importFileRef} type="file" accept="application/json,.json"
        style={{display:"none"}}
        onChange={e=>{ handleImportFile(e.target.files?.[0]); e.target.value=""; }}/>
      {editMeal && (
        <MealEditor meal={editMeal} onSave={saveMeal} onDelete={deleteMeal}
          onClose={()=>setEditMeal(null)}/>
      )}
    </div>
  );
}
