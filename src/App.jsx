import { useState, useEffect, useRef } from "react";

const T = {
  bg:"#0b0f0b", surface:"#121912", card:"#171f17", border:"#1e2d1e",
  accent:"#4ade80", accent2:"#22d3a5", text:"#eaf5ea", muted:"#5f7a5f",
  protein:"#4ade80", carbs:"#facc15", fat:"#fb923c", cal:"#f87171",
  warn:"#fbbf24", info:"#60a5fa", overlay:"#000000e0", ai:"#141f14",
  // gradients & glow for pop
  gAccent:"linear-gradient(135deg,#4ade80 0%,#22d3a5 100%)",
  gHeader:"linear-gradient(135deg,#10b981 0%,#4ade80 55%,#a3e635 100%)",
  glow:"0 0 16px",
};


const DEFAULT_GOALS = { calories:2200, protein:160, carbs:220, fat:70 };
const PRESETS = [
  { name:"Maintenance", calories:2200, protein:150, carbs:230, fat:75 },
  { name:"Cutting",     calories:1800, protein:180, carbs:150, fat:55 },
  { name:"Bulking",     calories:2800, protein:200, carbs:300, fat:85 },
  { name:"High Protein",calories:2000, protein:220, carbs:160, fat:55 },
  { name:"Low Carb",    calories:2000, protein:160, carbs:80,  fat:100 },
];

// Local-timezone date key (YYYY-MM-DD). Using toISOString() would convert to
// UTC and roll the date over early/late depending on the user's timezone.
const localKey = (dt) => {
  const y = dt.getFullYear();
  const m = String(dt.getMonth()+1).padStart(2,"0");
  const d = String(dt.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
};
const todayKey = () => localKey(new Date());
const isToday  = d  => d === todayKey();
const fmtDate  = d  => {
  const [,m,day] = d.split("-");
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]} ${+day}`;
};
const fmtFull = d => {
  const dt = new Date(d+"T00:00:00");
  const wd = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dt.getDay()];
  const [y,m,day] = d.split("-");
  return `${wd}, ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]} ${+day}, ${y}`;
};
const fmtTime = ts => new Date(ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

// ── Durable storage: every value is mirrored to a backup key, and reads
// fall back to the backup if the primary is missing/empty. This survives
// redeploys and most iOS storage evictions without any manual relogging.
const _get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const _set = (k,v) => { try { localStorage.setItem(k,v); } catch {} };

// Write to primary + backup at once
const dualSave = (key, valueStr) => {
  _set(key, valueStr);
  _set(key + "_bak", valueStr);
  _set(key + "_ts", String(Date.now()));
};
// Read primary; if empty/missing, fall back to backup; returns string or null
const dualLoadRaw = (key) => {
  const p = _get(key);
  if (p && p !== "{}" && p !== "[]") return p;
  const b = _get(key + "_bak");
  if (b && b !== "{}" && b !== "[]") {
    // primary was wiped but backup survived — heal the primary
    _set(key, b);
    return b;
  }
  return p || b || null;
};

const loadAll   = () => { try { return JSON.parse(dualLoadRaw("nl4_days")||"{}"); }  catch { return {}; } };
const saveAll   = d  => dualSave("nl4_days", JSON.stringify(d));
const loadGoals = () => { try { return {...DEFAULT_GOALS,...JSON.parse(dualLoadRaw("nl4_goals")||"{}")}; } catch { return {...DEFAULT_GOALS}; } };
const saveGoals = g  => dualSave("nl4_goals", JSON.stringify(g));
const loadMeals = () => { try { return JSON.parse(dualLoadRaw("nl4_meals")||"[]"); }  catch { return []; } };
const saveMeals = m  => dualSave("nl4_meals", JSON.stringify(m));
const loadWorkouts = () => { try { return JSON.parse(dualLoadRaw("nl4_workouts")||"{}"); } catch { return {}; } };
const saveWorkouts = w  => dualSave("nl4_workouts", JSON.stringify(w));
const loadWeights = () => { try { return JSON.parse(dualLoadRaw("nl4_weights")||"{}"); } catch { return {}; } }; // {dayKey: number(lbs)}
const saveWeights = w  => dualSave("nl4_weights", JSON.stringify(w));
const loadWater = () => { try { return JSON.parse(dualLoadRaw("nl4_water")||"{}"); } catch { return {}; } };   // {dayKey: oz}
const saveWater = w  => dualSave("nl4_water", JSON.stringify(w));
const WATER_STEP = 12; // oz per tap
const WATER_GOAL = 100; // daily oz goal

const DEFAULT_PROFILE = {
  name:"",
  age:"", sex:"", heightFt:"", heightIn:"", weight:"",
  experience:"", daysPerWeek:"", trainingGoal:"",
  dietPrefs:"", allergies:"", restrictions:"",
  goalType:"", targetWeight:"",
};
const loadProfile = () => { try { return {...DEFAULT_PROFILE,...JSON.parse(dualLoadRaw("nl4_profile")||"{}")}; } catch { return {...DEFAULT_PROFILE}; } };
const saveProfile = p  => dualSave("nl4_profile", JSON.stringify(p));

// Suggest daily macro goals from profile (Mifflin–St Jeor → activity → goal)
const suggestGoals = (p) => {
  const age = +p.age, w = +p.weight; // weight in lbs
  const totalIn = (+p.heightFt||0)*12 + (+p.heightIn||0);
  if (!age || !w || !totalIn) return null;
  const kg = w*0.453592, cm = totalIn*2.54;
  const s = (p.sex||"").toLowerCase().startsWith("f") ? -161 : 5;
  const bmr = 10*kg + 6.25*cm - 5*age + s;
  // activity from days/week
  const d = +p.daysPerWeek||0;
  const act = d>=6 ? 1.725 : d>=4 ? 1.55 : d>=2 ? 1.375 : 1.2;
  let cals = bmr*act;
  // goal adjustment
  const g = (p.goalType||"").toLowerCase();
  if (g.includes("cut")) cals -= 500;
  else if (g.includes("bulk")) cals += 350;
  cals = Math.round(cals/10)*10;
  // protein ~1g/lb bodyweight (capped reasonable), fat ~25% cals, rest carbs
  const protein = Math.round(Math.min(w, w*1.0));
  const fat = Math.round((cals*0.25)/9);
  const carbs = Math.round((cals - protein*4 - fat*9)/4);
  return { calories:cals, protein, carbs:Math.max(carbs,0), fat };
};

// Build an auto-learned habits summary from the user's actual logs.
// allDays: {dayKey:[entries]}, workouts: {dayKey:[workouts]}
function computeHabits(allDays, workouts) {
  const dayKeys = Object.keys(allDays).filter(d=>allDays[d]?.length>0);
  const loggedDayCount = dayKeys.length;

  // Average macros across days that have any food
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

  // Top frequent foods
  const topFoods = Object.entries(foodFreq)
    .sort((a,b)=>b[1]-a[1]).slice(0,6)
    .filter(([,n])=>n>=2)
    .map(([name,n])=>`${name} (${n}x)`);

  // Training day-of-week frequency
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




// ── Week / date helpers ──
const dayKeyFromDate = (dt) => localKey(dt);
// Returns the Sunday that starts the week containing `dayKey`
const weekStart = (dayKey) => {
  const d = new Date(dayKey + "T00:00:00");
  d.setDate(d.getDate() - d.getDay()); // back to Sunday
  return dayKeyFromDate(d);
};
const addDays = (dayKey, n) => {
  const d = new Date(dayKey + "T00:00:00");
  d.setDate(d.getDate() + n);
  return dayKeyFromDate(d);
};
const weekDays = (startKey) => Array.from({length:7}).map((_,i)=>addDays(startKey,i));
const dowShort = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const dayNum = (dayKey) => +dayKey.split("-")[2];

// Did this day hit a given goal category? cat in calories/protein/carbs/fat
const dayHitsGoal = (totals, goals, cat) => {
  if (!totals) return false;
  if (cat === "calories") {
    // "hit" = within 100 of goal and not 0
    return totals.calories > 0 && Math.abs(totals.calories - goals.calories) <= 100;
  }
  // macros: met or exceeded goal
  return totals[cat] >= goals[cat] && goals[cat] > 0;
};

// Sum macros for a day's entries
const sumDay = (entries) => (entries||[]).reduce(
  (a,e)=>({calories:a.calories+e.calories,protein:a.protein+e.protein,carbs:a.carbs+e.carbs,fat:a.fat+e.fat}),
  {calories:0,protein:0,carbs:0,fat:0}
);

// Streak = consecutive days ending today where the category goal was hit
const computeStreak = (allDays, workouts, goals, cat) => {
  let streak = 0;
  let cursor = dayKeyFromDate(new Date());
  for (let i=0;i<400;i++){
    let hit;
    if (cat === "workout") {
      hit = (workouts[cursor]?.length || 0) > 0;
    } else {
      hit = dayHitsGoal(sumDay(allDays[cursor]), goals, cat);
    }
    if (hit) { streak++; cursor = addDays(cursor,-1); }
    else break;
  }
  return streak;
};

// Sum ingredient macros into per-container totals
const mealPerContainer = (meal) => {
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

// ── AI ────────────────────────────────────────────────────────────────────────
// Shared POST to /api/chat with a 30s timeout so the UI never spins forever.
async function fetchChat(body) {
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

async function callClaude(messages) {
  const SYSTEM = [
    "You are NutriLog AI, a macro tracking assistant. You control the user food log.",
    "IMPORTANT: Reply with ONLY a JSON object. No markdown. No backticks. No prose. Start with { end with }.",
    "Format: {" + '"message":"your reply","actions":[]}',
    "Actions you may include:",
    '  add food:    {"type":"add_entry","entry":{"name":"Full Brand Name","calories":0,"protein":0,"carbs":0,"fat":0}}',
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
  ].join(" ");

  const data = await fetchChat({ system: SYSTEM, messages });
  const raw = (data.content || []).map(b => b.text || "").join("").trim();

  // Parse strategy 1: direct
  try { return JSON.parse(raw); } catch {}
  // Parse strategy 2: strip fences
  const s = raw.replace(/^```[\w]*\s*/,"").replace(/\s*```$/,"").trim();
  try { return JSON.parse(s); } catch {}
  // Parse strategy 3: extract first JSON object
  const m = raw.match(/{[\s\S]*}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  // Fallback: show raw text as message
  return { message: raw.length > 0 ? raw.slice(0, 300) : "Something went wrong. Please try again.", actions: [] };
}

// Ask the AI to fill in macros for a list of ingredient descriptions.
// Returns an array aligned to the input: [{name,calories,protein,carbs,fat}, ...]
async function estimateIngredients(ingredientNames) {
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

// Workout coach — technical, plain-spoken, neither a hype man nor harsh.
// Returns plain text (no JSON, no actions). Context with workout history is appended.
async function callTrainer(messages) {
  const SYSTEM = [
    "You are a strength coach inside a fitness app. You both LOG the user's workouts and give coaching feedback.",
    "TONE: Direct, technical, matter-of-fact. Do NOT use hype, excessive praise, or flattery ('crushing it', 'beast mode', 'amazing job'). Also do NOT be harsh or drill-sergeant. Treat the user as a capable adult. Neutral, useful, a little dry is the target.",
    "You MUST respond with ONLY a JSON object — no markdown, no backticks, no text outside it:",
    '{"message":"your coaching reply","actions":[]}',
    "Actions you may include:",
    '  add workout: {"type":"add_workout","workout":{"name":"Bench Press","detail":"3x8 @ 185 lbs","category":"strength"}}',
    '  remove workout: {"type":"remove_workout","name":"partial name"}',
    "When the user reports exercise (e.g. 'bench press 3x8 at 185', 'ran 3 miles', 'leg day: squats 5x5 at 225 and lunges'), create one add_workout per distinct exercise. name = exercise, detail = sets/reps/weight/distance/time as stated, category = strength|cardio|mobility|sport.",
    "In the SAME message, also coach: 1) If workout history is provided, compare this session to previous performance on the same lift (load, volume, reps) and state the change plainly. 2) Give 1-2 concrete technical/mental cues for the lift. 3) If relevant, a brief specific suggestion for next session grounded in progressive overload, without being pushy.",
    "If they only ask a question (no lift to log), answer it technically with an empty actions array.",
    "If a USER PROFILE is provided, scale expectations and progression to their experience, weekly frequency, and goal.",
    "If a USER NAME is provided, use their first name naturally now and then (not every message). If TRAINING HABITS are provided (their usual training days and frequent exercises), reference them when relevant — e.g. note if they're training a muscle they usually skip, or breaking from their normal split.",
    "If the user sends a PHYSIQUE PHOTO, give an honest, technical assessment: note developed areas and lagging/weak points, estimate visible conditioning, and recommend which muscle groups or training focus to prioritize. Be specific and constructive — no flattery, no body-shaming, no health/medical claims, no body-fat percentage guarantees. Keep it about training priorities. Use an empty actions array for photo assessments unless they also reported a lift.",
    "Keep the message concise and skimmable — a few short lines. Plain text inside the message field (line breaks ok, no markdown symbols).",
    "Return ONLY the JSON object.",
  ].join(" ");

  const data = await fetchChat({ system: SYSTEM, messages });
  const raw = (data.content || []).map(b => b.text || "").join("").trim();
  const clean = raw.replace(/^```[\w]*\s*/,"").replace(/\s*```$/,"").trim();
  try { return JSON.parse(clean); } catch {}
  const m = clean.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  // Fallback: treat whatever text we got as a plain coaching reply, no actions
  return { message: raw || "Give me the lift and the numbers.", actions: [] };
}

// Chef — helps build meal preps and answers nutrition questions.
// Can save a prep straight into the user's library via a save_meal action.
async function callChef(messages) {
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
  ].join(" ");

  const data = await fetchChat({ system: SYSTEM, messages });
  const raw = (data.content || []).map(b => b.text || "").join("").trim();
  const clean = raw.replace(/^```[\w]*\s*/,"").replace(/\s*```$/,"").trim();
  try { return JSON.parse(clean); } catch {}
  const m = clean.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return { message: raw || "Tell me what you'd like to prep or ask a nutrition question.", actions: [] };
}

// ── Ring ──────────────────────────────────────────────────────────────────────
const Ring = ({value,max,color,label}) => {
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

// ── Bar ───────────────────────────────────────────────────────────────────────
const Bar = ({label,value,max,color,unit="g"}) => {
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

// ── Entry row ─────────────────────────────────────────────────────────────────
const EntryRow = ({entry,onDelete,onEdit}) => {
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
    <div style={{display:"flex",alignItems:"center",
      padding:"12px 14px",background:T.card,borderRadius:12,
      border:`1px solid ${T.border}`,marginBottom:8}}>
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
      <button onClick={()=>onDelete(entry.id)}
        style={{background:"none",border:"none",color:T.muted,cursor:"pointer",
          fontSize:20,minWidth:44,minHeight:44,display:"flex",alignItems:"center",
          justifyContent:"center",borderRadius:10,WebkitTapHighlightColor:"transparent",
          flexShrink:0,transition:"color .15s"}}
        onTouchStart={e=>e.currentTarget.style.color=T.cal}
        onTouchEnd={e=>e.currentTarget.style.color=T.muted}>×</button>
    </div>
  );
};

// ── Chat bubble ───────────────────────────────────────────────────────────────
const Bubble = ({msg}) => {
  const isUser = msg.role==="user";
  // Split message into individual plain-text lines so bullets render one per line
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
    </div>
  );
};

// ── Goals sheet ───────────────────────────────────────────────────────────────
const GoalsSheet = ({goals,onSave,onClose}) => {
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

// ── History drawer ────────────────────────────────────────────────────────────
const HistoryDrawer = ({open,allDays,selectedDay,onSelectDay,onClose,onNav,onExport,onImport}) => {
  const days=Object.keys(allDays).filter(d=>allDays[d]?.length>0).sort((a,b)=>b.localeCompare(a));
  return (<>
    {open&&<div onClick={onClose} style={{position:"fixed",inset:0,background:T.overlay,zIndex:200}}/>}
    <div style={{position:"fixed",top:0,right:0,height:"100%",
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
        {[["chef","👨‍🍳  Chef"],["meals","🍱  Meal preps"],["profile","👤  Profile"],["week","📅  Week view"]].map(([tab,label])=>(
          <button key={tab} onClick={()=>{ onNav(tab); onClose(); }}
            style={{display:"flex",alignItems:"center",width:"100%",
              background:T.card,border:`1px solid ${T.border}`,color:T.text,
              borderRadius:12,padding:"13px 14px",marginBottom:8,cursor:"pointer",
              fontSize:15,fontWeight:600,minHeight:50,textAlign:"left",
              WebkitTapHighlightColor:"transparent"}}>
            {label}
          </button>
        ))}
        {/* Backup */}
        <div style={{fontSize:10,color:T.accent,letterSpacing:"0.15em",margin:"14px 0 10px",
          paddingTop:12,borderTop:`1px solid ${T.border}`}}>DATA</div>
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
          const lastTs=es.reduce((mx,e)=>Math.max(mx,e.loggedAt||0),0);
          const sel=day===selectedDay;
          return (
            <div key={day} style={{marginBottom:18}}>
              <button onClick={()=>{onSelectDay(day);onClose();}}
                style={{width:"100%",background:sel?"#4ade8011":T.card,
                  border:`1px solid ${sel?T.accent:T.border}`,borderRadius:14,
                  padding:"12px 14px",cursor:"pointer",textAlign:"left",
                  minHeight:60,WebkitTapHighlightColor:"transparent",
                  transition:"border-color .15s",marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:15,color:T.text,fontWeight:700}}>{isToday(day)?"Today":fmtDate(day)}</span>
                  {lastTs>0&&<span style={{fontSize:10,color:T.muted}}>edited {fmtTime(lastTs)}</span>}
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {[[`${cal}cal`,T.cal],[`${pro}g P`,T.protein],[`${carb}g C`,T.carbs],[`${fat}g F`,T.fat]].map(([l,c])=>(
                    <span key={l} style={{fontSize:11,color:c}}>{l}</span>
                  ))}
                  <span style={{fontSize:11,color:T.muted}}>{es.length} items</span>
                </div>
              </button>
              {es.map(e=>(
                <div key={e.id} style={{display:"flex",justifyContent:"space-between",
                  padding:"8px 12px",background:T.bg,borderRadius:10,
                  border:`1px solid ${T.border}`,marginBottom:4}}>
                  <div>
                    <div style={{fontSize:13,color:T.text,fontWeight:600,marginBottom:2}}>{e.name}</div>
                    {e.loggedAt&&<div style={{fontSize:10,color:T.muted}}>logged {fmtTime(e.loggedAt)}</div>}
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,color:T.cal,fontWeight:700}}>{Math.round(e.calories)}cal</div>
                    <div style={{fontSize:10,color:T.muted}}>{Math.round(e.protein)}P·{Math.round(e.carbs)}C·{Math.round(e.fat)}F</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  </>);
};

// ── Meal editor sheet ─────────────────────────────────────────────────────────
const MealEditor = ({ meal, onSave, onDelete, onClose }) => {
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

  // Ask the AI to fill macros for every ingredient that has a name
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

// ── Profile tab ───────────────────────────────────────────────────────────────
// Stable helpers (defined OUTSIDE the component so inputs keep focus while typing)
const PF_FIELD = {
  background:T.card, border:`1px solid ${T.border}`, borderRadius:8,
  padding:"10px 12px", color:T.text, fontSize:16, outline:"none", width:"100%",
};
const PF_LABEL = { fontSize:12, color:T.muted, marginBottom:5 };
const PfSection = ({title, children}) => (
  <div style={{background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,
    padding:"14px",marginBottom:12}}>
    <div style={{fontSize:11,color:T.accent,letterSpacing:"0.12em",marginBottom:12}}>{title}</div>
    {children}
  </div>
);
const PfPills = ({value, options, onPick}) => (
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

const ProfileTab = ({ profile, goals, onSave, onApplyGoals }) => {
  const [p, setP] = useState({...profile});
  const set = (k,v) => setP(prev=>({...prev,[k]:v}));
  const [saved, setSaved] = useState(false);
  const suggestion = suggestGoals(p);

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
            <div style={label}>Weight (lbs)</div>
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
          </div>
          <div style={{display:"flex",gap:16,marginBottom:12}}>
            {[[`${suggestion.calories}`,"cal",T.cal],[`${suggestion.protein}g`,"P",T.protein],
              [`${suggestion.carbs}g`,"C",T.carbs],[`${suggestion.fat}g`,"F",T.fat]].map(([v,l,c])=>(
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
          <button onClick={()=>onApplyGoals(suggestion)}
            style={{width:"100%",background:T.accent,border:"none",color:"#0b0f0b",
              borderRadius:10,padding:"12px",fontWeight:700,fontSize:14,cursor:"pointer",
              minHeight:46,WebkitTapHighlightColor:"transparent"}}>
            Apply suggested goals
          </button>
        </div>
      )}

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

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [allDays,    setAllDays]    = useState({});
  const [selDay,     setSelDay]     = useState(todayKey());
  const [goals,      setGoals]      = useState({...DEFAULT_GOALS});
  const [activeTab,  setActiveTab]  = useState("chat");
  const [chatMsgs,   setChatMsgs]   = useState([{
    role:"assistant",
    content:"Hey! I'm your NutriLog AI 👋 Tell me what you ate and I'll track it for you.",
    actions:[],
  }]);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [showGoals,  setShowGoals]  = useState(false);
  const [showHist,   setShowHist]   = useState(false);
  const [meals,      setMeals]      = useState([]);
  const [editMeal,   setEditMeal]   = useState(null); // meal object being edited, or "new"
  const [workouts,   setWorkouts]   = useState({});   // { dayKey: [ {id,name,detail,category} ] }
  const [weekAnchor, setWeekAnchor] = useState(weekStart(todayKey())); // Sunday of shown week
  const [profile,    setProfile]    = useState({...DEFAULT_PROFILE});
  const [weights,    setWeights]    = useState({});
  const [water,      setWater]      = useState({});
  const [trainerMsgs, setTrainerMsgs] = useState([{
    role:"assistant",
    content:"Strength coach here. Tell me what you trained — lift, sets, reps, load — and I'll log it and give you feedback, cues, and how it stacks up against last time. Or ask me anything technical.",
  }]);
  const [trainerInput, setTrainerInput] = useState("");
  const [trainerLoading, setTrainerLoading] = useState(false);
  const trainerEndRef = useRef(null);
  const trainerInputRef = useRef(null);
  const [chefMsgs, setChefMsgs] = useState([{
    role:"assistant",
    content:"Chef here. I can help you design meal preps — give me a protein, a vibe, or a calorie target and I'll build one and save it to your library. Or ask me any nutrition question.",
  }]);
  const [chefInput, setChefInput] = useState("");
  const [chefLoading, setChefLoading] = useState(false);
  const chefEndRef = useRef(null);
  const chefInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const logScrollRef = useRef(null);
  const inputRef   = useRef(null);
  const fileRef    = useRef(null);
  const [pendingImage, setPendingImage] = useState(null); // food chat {dataUrl, mediaType, base64}
  const trainerFileRef = useRef(null);
  const [trainerImage, setTrainerImage] = useState(null); // trainer chat image
  const [vh, setVh] = useState(window.innerHeight);

  useEffect(()=>{
    let days = loadAll();
    let gls  = loadGoals();
    let mls  = loadMeals();
    let wks  = loadWorkouts();
    let prof = loadProfile();
    let wgt  = loadWeights();
    let wtr  = loadWater();

    // Last-resort recovery: if everything looks empty, try the full snapshot
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
    setWorkouts(wks);
    setProfile(prof);
    setWeights(wgt);
    setWater(wtr);
    // Personalize the opening greeting if we know their name
    if (prof.name) {
      setChatMsgs(prev=>{
        if (prev.length===1 && prev[0].role==="assistant") {
          return [{...prev[0], content:`Hey ${prof.name}! 👋 Tell me what you ate and I'll track it for you.`}];
        }
        return prev;
      });
      setTrainerMsgs(prev=>{
        if (prev.length===1 && prev[0].role==="assistant") {
          return [{...prev[0], content:`Hey ${prof.name} — coach here. Tell me what you trained and I'll log it and give feedback, or ask me anything technical.`}];
        }
        return prev;
      });
    }
  },[]);

  // Keep a single consolidated snapshot of everything, updated whenever data
  // changes and again when the app is backgrounded (most reliable on iOS).
  useEffect(()=>{
    const writeSnapshot = () => {
      try {
        _set("nl4_snapshot", JSON.stringify({ days:allDays, goals, meals, workouts, profile, weights, water, ts:Date.now() }));
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
  },[allDays, goals, meals, workouts, profile, weights, water]);

  // Fix for iOS viewport height (address bar + keyboard)
  useEffect(()=>{
    const onResize = () => {
      setVh(window.visualViewport?.height ?? window.innerHeight);
      // When the keyboard opens/closes the viewport resizes — keep the latest
      // messages in view so the input never covers what was just said.
      setTimeout(()=>{
        if (activeTab==="chat") chatEndRef.current?.scrollIntoView({block:"end"});
        if (activeTab==="train") trainerEndRef.current?.scrollIntoView({block:"end"});
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
    if (activeTab==="train")
      setTimeout(()=>trainerEndRef.current?.scrollIntoView({behavior:"smooth",block:"end"}),50);
  },[trainerMsgs, trainerLoading, activeTab]);

  useEffect(()=>{
    if (activeTab==="chef")
      setTimeout(()=>chefEndRef.current?.scrollIntoView({behavior:"smooth",block:"end"}),50);
  },[chefMsgs, chefLoading, activeTab]);

  // Reset Log scroll to top when switching days
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
        const now=Date.now();
        es=[...es,{...a.entry,id:now+Math.random(),loggedAt:now}];
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

  // Read + downscale a chosen photo into base64 for the AI
  const handlePhoto = (file, setter = setPendingImage) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        // downscale so the longest side is <= 1024px (keeps upload small)
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
    // dismiss keyboard on iOS
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
    // Build this turn's content: image (if any) + text
    const promptText = (text || "Estimate the macros of the food in this photo and log it.") + ctx;
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
      const result = await callClaude(apiMsgs);
      const {message="",actions=[]} = result;

      const {newGoals,newEntries,newWorkouts} = applyActions(actions,goals,curEntries,curWk);
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

      setChatMsgs(prev=>[...prev,{role:"assistant",content:message,actions}]);
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

  // ── Meal library handlers ──
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
  // Tap-to-log a meal container directly (no AI needed)
  const quickLogMeal = (meal, qty=1) => {
    const pc = mealPerContainer(meal);
    const now = Date.now();
    const newOnes = Array.from({length:qty}).map((_,i)=>({
      ...pc, name:meal.name, id:now+i+Math.random(), loggedAt:now,
    }));
    mutEntries(prev=>[...prev, ...newOnes]);
  };

  // ── Workout helpers ──
  const dayWorkouts = workouts[selDay]||[];
  const deleteWorkout = (id) => setWorkouts(prev=>{
    const cur = prev[selDay]||[];
    const out = {...prev,[selDay]:cur.filter(w=>w.id!==id)};
    saveWorkouts(out);
    return out;
  });

  // ── Streaks (calories, protein, carbs, fat, workout) ──
  const streaks = {
    calories: computeStreak(allDays, workouts, goals, "calories"),
    protein:  computeStreak(allDays, workouts, goals, "protein"),
    carbs:    computeStreak(allDays, workouts, goals, "carbs"),
    fat:      computeStreak(allDays, workouts, goals, "fat"),
    workout:  computeStreak(allDays, workouts, goals, "workout"),
  };

  // ── Trainer chat send ──
  const handleTrainerSend = async () => {
    const text = trainerInput.trim();
    if ((!text && !trainerImage) || trainerLoading) return;
    trainerInputRef.current?.blur();
    const img = trainerImage;
    setTrainerInput("");
    setTrainerImage(null);
    setTrainerLoading(true);
    setTrainerMsgs(prev=>[...prev,{role:"user",content:text || (img?"(physique photo)":""), image:img?.dataUrl}]);

    // Build recent workout history (last ~21 days) so the coach can compare lifts
    const today = todayKey();
    const histLines = [];
    for (let i=0;i<21;i++){
      const dk = addDays(today,-i);
      const ws = workouts[dk]||[];
      if (ws.length) histLines.push(`${dk}: ${ws.map(w=>`${w.name} ${w.detail||""}`.trim()).join("; ")}`);
    }
    const histBlock = histLines.length
      ? "\n\n[WORKOUT HISTORY last 3 weeks, newest first]\n" + histLines.join("\n")
      : "\n\n[WORKOUT HISTORY] none logged yet.";
    const profBlock = Object.values(profile).some(v=>v)
      ? "\n\n[USER PROFILE] " + JSON.stringify(profile)
      : "";
    const habits = computeHabits(allDays, workouts);
    const habitsBlock = habits.workoutDays>0
      ? "\n\n[TRAINING HABITS] " + JSON.stringify({
          commonTrainingDays:habits.commonTrainingDays,
          frequentExercises:habits.topExercises,
          totalWorkoutDays:habits.workoutDays,
        })
      : "";
    const nameBlock = profile.name ? `\n\n[USER NAME] ${profile.name}` : "";

    const apiMsgs = trainerMsgs.slice(-8).map(m=>({role:m.role,content:m.content}));
    const promptText = (text || "Give me an honest, technical physique assessment from this photo — strengths, lagging areas, and what to prioritize. No flattery.") + histBlock + profBlock + habitsBlock + nameBlock;
    if (img) {
      apiMsgs.push({
        role:"user",
        content:[
          { type:"image", source:{ type:"base64", media_type:img.mediaType, data:img.base64 } },
          { type:"text", text:promptText },
        ],
      });
    } else {
      apiMsgs.push({role:"user",content:promptText});
    }

    try {
      const result = await callTrainer(apiMsgs);
      const message = typeof result === "string" ? result : (result.message || "");
      const actions = (result && result.actions) || [];
      // Apply workout actions to today's log
      if (actions.length) {
        const curWk = workouts[selDay]||[];
        const { newWorkouts } = applyActions(actions, goals, allDays[selDay]||[], curWk);
        setWorkouts(prev=>{
          const out = {...prev,[selDay]:newWorkouts};
          saveWorkouts(out);
          return out;
        });
      }
      setTrainerMsgs(prev=>[...prev,{role:"assistant",content:message}]);
    } catch(err) {
      setTrainerMsgs(prev=>[...prev,{role:"assistant",content:`Couldn't connect (${err.message}). Try again.`}]);
    } finally {
      setTrainerLoading(false);
    }
  };

  // ── Chef chat send ──
  const handleChefSend = async () => {
    const text = chefInput.trim();
    if (!text || chefLoading) return;
    chefInputRef.current?.blur();
    setChefInput("");
    setChefLoading(true);
    setChefMsgs(prev=>[...prev,{role:"user",content:text}]);

    const profBlock = Object.values(profile).some(v=>v)
      ? "\n\n[USER PROFILE] " + JSON.stringify(profile)
      : "";
    const goalsBlock = "\n\n[GOALS] " + JSON.stringify(goals);
    const libBlock = meals.length
      ? "\n\n[EXISTING MEALS] " + JSON.stringify(meals.map(m=>m.name))
      : "";

    const apiMsgs = chefMsgs.slice(-8).map(m=>({role:m.role,content:m.content}));
    apiMsgs.push({role:"user",content:text+profBlock+goalsBlock+libBlock});

    try {
      const result = await callChef(apiMsgs);
      const message = typeof result==="string" ? result : (result.message||"");
      const actions = (result && result.actions) || [];
      let savedName = null;
      actions.forEach(a=>{
        if (a.type==="save_meal" && a.meal && a.meal.name) {
          const meal = {
            id: Date.now()+Math.random(),
            name: a.meal.name,
            containers: Math.max(1, +a.meal.containers||1),
            ingredients: (a.meal.ingredients||[]).map(i=>({
              name:i.name||"", calories:+i.calories||0, protein:+i.protein||0,
              carbs:+i.carbs||0, fat:+i.fat||0,
            })),
            createdAt: Date.now(),
          };
          setMeals(prev=>{ const next=[...prev,meal]; saveMeals(next); return next; });
          savedName = meal.name;
        }
      });
      const suffix = savedName ? `\n\n✓ Saved "${savedName}" to your meal preps.` : "";
      setChefMsgs(prev=>[...prev,{role:"assistant",content:message+suffix}]);
    } catch(err) {
      setChefMsgs(prev=>[...prev,{role:"assistant",content:`Couldn't connect (${err.message}). Try again.`}]);
    } finally {
      setChefLoading(false);
    }
  };

  // ── Profile handlers ──
  const handleProfileSave = (p) => { setProfile(p); saveProfile(p); };
  const handleApplyGoals = (g) => { setGoals(g); saveGoals(g); };

  // ── Weight & water handlers ──
  const setDayWeight = (val) => setWeights(prev=>{
    const out = {...prev};
    if (val==="" || val==null) delete out[selDay];
    else out[selDay] = +val;
    saveWeights(out);
    return out;
  });
  const addWater = (oz=WATER_STEP) => setWater(prev=>{
    const out = {...prev, [selDay]:(prev[selDay]||0)+oz};
    saveWater(out);
    return out;
  });
  const resetWater = () => setWater(prev=>{
    const out = {...prev}; delete out[selDay];
    saveWater(out);
    return out;
  });

  // ── Backup: export everything to a downloadable file, import to restore ──
  const importFileRef = useRef(null);
  const handleExport = () => {
    const blob = {
      version: 1, exportedAt: new Date().toISOString(),
      days: allDays, goals, meals, workouts, profile, weights, water,
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
        setShowHist(false);
        alert("Backup restored successfully.");
      } catch {
        alert("That file couldn't be read as a NutriLog backup.");
      }
    };
    reader.readAsText(file);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{
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
                {profile.name ? profile.name.toUpperCase()+"'S MACROS" : "MACRO INTELLIGENCE"}
              </div>
              <div style={{fontSize:19,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1.2,
                background:T.gHeader,WebkitBackgroundClip:"text",backgroundClip:"text",
                WebkitTextFillColor:"transparent"}}>NutriLog</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setShowGoals(true)}
              style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
                borderRadius:10,padding:"10px 13px",minHeight:44,cursor:"pointer",fontSize:13,
                WebkitTapHighlightColor:"transparent"}}>⚙ Goals</button>
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
        {[["chat","💬"],["log","📋"],["workouts","💪"],["train","🏋️"]].map(([tab,label])=>(
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
              <input ref={fileRef} type="file" accept="image/*" capture="environment"
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
              <textarea ref={inputRef} value={input} rows={1}
                onChange={e=>{
                  setInput(e.target.value);
                  e.target.style.height="auto";
                  e.target.style.height=Math.min(e.target.scrollHeight,88)+"px";
                }}
                placeholder="Tell me what you ate…"
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
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {[["calories","🔥",T.cal,streaks.calories],
              ["protein","💪",T.protein,streaks.protein],
              ["carbs","⚡",T.carbs,streaks.carbs],
              ["fat","🥑",T.fat,streaks.fat],
              ["workout","🏋️",T.info,streaks.workout]].map(([k,icon,col,n])=>(
              <div key={k} style={{flex:1,background:n>0?col+"22":T.surface,
                border:`1px solid ${n>0?col+"88":T.border}`,borderRadius:12,
                padding:"8px 4px",textAlign:"center",
                boxShadow:n>0?`${T.glow} ${col}55`:"none",transition:"all .2s"}}>
                <div style={{fontSize:18,filter:n>0?"none":"grayscale(1) opacity(0.4)",
                  animation:n>0?"bump .4s ease":"none"}}>{icon}</div>
                <div style={{fontSize:14,fontWeight:800,color:n>0?col:T.muted,marginTop:2}}>{n}</div>
              </div>
            ))}
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
                  value={weights[selDay]??""}
                  onChange={e=>setDayWeight(e.target.value)}
                  placeholder="—"
                  style={{flex:1,minWidth:0,background:T.bg,border:`1px solid ${T.border}`,
                    borderRadius:8,padding:"9px 10px",color:T.text,fontSize:18,fontWeight:700,
                    outline:"none",width:"100%"}}/>
                <span style={{fontSize:12,color:T.muted}}>lbs</span>
              </div>
            </div>
            {/* Water tracker */}
            <div style={{flex:"1 1 0",minWidth:0,background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,
              padding:"12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:10,color:T.info,letterSpacing:"0.1em"}}>WATER</span>
                {(water[selDay]||0)>0 && (
                  <button onClick={resetWater}
                    style={{background:"none",border:"none",color:T.muted,fontSize:10,
                      cursor:"pointer",WebkitTapHighlightColor:"transparent",padding:0}}>reset</button>
                )}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button onClick={()=>addWater()}
                  style={{flex:1,background:`linear-gradient(135deg,#60a5fa,#3b82f6)`,border:"none",
                    color:"#04121f",borderRadius:10,padding:"9px",cursor:"pointer",
                    fontSize:13,fontWeight:700,minHeight:42,WebkitTapHighlightColor:"transparent",
                    boxShadow:`0 0 12px ${T.info}55`}}>
                  +{WATER_STEP} oz
                </button>
              </div>
              <div style={{marginTop:8,fontSize:13,color:T.text,fontWeight:700}}>
                {water[selDay]||0} <span style={{fontSize:11,color:T.muted,fontWeight:400}}>/ {WATER_GOAL} oz</span>
              </div>
              <div style={{height:5,background:T.border,borderRadius:99,marginTop:6,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min((water[selDay]||0)/WATER_GOAL*100,100)}%`,
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
          <div style={{display:"flex",alignItems:"center",gap:12,
            background:T.surface,border:`1px solid ${streaks.workout>0?T.info+"88":T.border}`,
            borderRadius:14,padding:"14px",marginBottom:12,
            boxShadow:streaks.workout>0?`${T.glow} ${T.info}44`:"none"}}>
            <div style={{fontSize:30,filter:streaks.workout>0?"none":"grayscale(1) opacity(0.4)",
              animation:streaks.workout>0?"bump .4s ease":"none"}}>🏋️</div>
            <div>
              <div style={{fontSize:22,fontWeight:800,color:streaks.workout>0?T.info:T.muted}}>
                {streaks.workout} day{streaks.workout===1?"":"s"}
              </div>
              <div style={{fontSize:11,color:T.muted}}>workout streak</div>
            </div>
            <div style={{marginLeft:"auto",textAlign:"right"}}>
              <div style={{fontSize:11,color:T.muted}}>{isToday(selDay)?"Today":fmtDate(selDay)}</div>
              <div style={{fontSize:13,fontWeight:700,color:T.text}}>{dayWorkouts.length} logged</div>
            </div>
          </div>

          {dayWorkouts.length>0 ? dayWorkouts.map(w=>(
            <div key={w.id} style={{display:"flex",alignItems:"center",
              padding:"12px 14px",background:T.card,borderRadius:12,
              border:`1px solid ${T.info}33`,marginBottom:8}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:600,marginBottom:3}}>🏋️ {w.name}</div>
                {w.detail&&<div style={{fontSize:13,color:T.muted}}>{w.detail}</div>}
                {w.category&&<div style={{fontSize:10,color:T.info,marginTop:3,
                  textTransform:"uppercase",letterSpacing:"0.08em"}}>{w.category}</div>}
              </div>
              <button onClick={()=>deleteWorkout(w.id)}
                style={{background:"none",border:"none",color:T.muted,cursor:"pointer",
                  fontSize:20,minWidth:44,minHeight:44,display:"flex",alignItems:"center",
                  justifyContent:"center",WebkitTapHighlightColor:"transparent",flexShrink:0}}>×</button>
            </div>
          )) : (
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
                  <button onClick={()=>{ quickLogMeal(m,1); setActiveTab("log"); }}
                    style={{width:"100%",background:T.accent,border:"none",color:"#0b0f0b",
                      borderRadius:10,padding:"11px",cursor:"pointer",fontSize:14,fontWeight:700,
                      minHeight:46,WebkitTapHighlightColor:"transparent"}}>
                    Log 1 container
                  </button>
                </div>
              </div>
            );
          })}
          <div style={{height:"env(safe-area-inset-bottom,20px)"}}/>
        </div>
      )}

      {/* ── Trainer tab ── */}
      {activeTab==="train"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",padding:"0 14px"}}>
          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",padding:"12px 0 8px",WebkitOverflowScrolling:"touch"}}>
            {trainerMsgs.map((m,i)=>{
              const isUser = m.role==="user";
              const lines = (m.content||"").split("\n").map(l=>l.trim()).filter(Boolean);
              return (
                <div key={i} style={{display:"flex",flexDirection:"column",
                  alignItems:isUser?"flex-end":"flex-start",marginBottom:12}}>
                  {m.image && (
                    <img src={m.image} alt="physique"
                      style={{maxWidth:"55%",borderRadius:14,marginBottom:6,
                        border:`1px solid ${T.border}`}}/>
                  )}
                  <div style={{maxWidth:"85%",padding:"11px 15px",
                    background:isUser?T.info:T.ai,
                    color:isUser?"#0b0f0b":T.text,
                    borderRadius:isUser?"18px 18px 5px 18px":"18px 18px 18px 5px",
                    border:isUser?"none":`1px solid ${T.border}`,
                    fontSize:14,lineHeight:1.55,wordBreak:"break-word",whiteSpace:"pre-wrap"}}>
                    {lines.length>1 ? lines.map((l,j)=>(
                      <div key={j} style={{marginBottom:j<lines.length-1?4:0}}>{l}</div>
                    )) : m.content}
                  </div>
                </div>
              );
            })}
            {trainerLoading&&(
              <div style={{display:"flex",marginBottom:12}}>
                <div style={{background:T.ai,border:`1px solid ${T.border}`,
                  borderRadius:"18px 18px 18px 5px",padding:"12px 16px"}}>
                  <div style={{display:"flex",gap:5}}>
                    {[0,1,2].map(i=>(
                      <div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.info,
                        animation:`pulse 1.2s ${i*0.2}s infinite`}}/>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={trainerEndRef}/>
          </div>
          {/* Input */}
          <div style={{flexShrink:0,paddingBottom:`max(env(safe-area-inset-bottom),14px)`,paddingTop:8}}>
            {trainerImage && (
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,
                background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:8}}>
                <img src={trainerImage.dataUrl} alt="to send"
                  style={{width:48,height:48,objectFit:"cover",borderRadius:8}}/>
                <span style={{flex:1,fontSize:12,color:T.muted}}>Physique photo ready — add a note or just send.</span>
                <button onClick={()=>setTrainerImage(null)}
                  style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,
                    borderRadius:8,minWidth:40,minHeight:40,fontSize:16,cursor:"pointer",
                    WebkitTapHighlightColor:"transparent"}}>×</button>
              </div>
            )}
            <div style={{display:"flex",gap:8,alignItems:"flex-end",
              background:T.surface,borderRadius:16,padding:"8px",
              border:`1px solid ${T.border}`}}>
              <input ref={trainerFileRef} type="file" accept="image/*"
                style={{display:"none"}}
                onChange={e=>{ handlePhoto(e.target.files?.[0], setTrainerImage); e.target.value=""; }}/>
              <button onClick={()=>trainerFileRef.current?.click()} disabled={trainerLoading}
                style={{background:T.card,border:`1px solid ${T.border}`,color:T.text,
                  borderRadius:12,minWidth:44,minHeight:44,fontSize:20,cursor:"pointer",
                  flexShrink:0,WebkitTapHighlightColor:"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                📷
              </button>
              <textarea ref={trainerInputRef} value={trainerInput} rows={1}
                onChange={e=>{
                  setTrainerInput(e.target.value);
                  e.target.style.height="auto";
                  e.target.style.height=Math.min(e.target.scrollHeight,88)+"px";
                }}
                placeholder="Log a lift, ask a question, or add a physique photo"
                style={{flex:1,background:"none",border:"none",color:T.text,
                  fontSize:16,lineHeight:1.5,padding:"4px 0",outline:"none",
                  overflowY:"auto",minHeight:26,maxHeight:88}}/>
              <button onClick={handleTrainerSend} disabled={trainerLoading||(!trainerInput.trim()&&!trainerImage)}
                style={{background:T.info,color:"#0b0f0b",border:"none",borderRadius:12,
                  padding:"0 16px",fontWeight:700,fontSize:15,minHeight:44,minWidth:64,
                  boxShadow:trainerLoading||(!trainerInput.trim()&&!trainerImage)?"none":`${T.glow} ${T.info}66`,
                  cursor:trainerLoading||(!trainerInput.trim()&&!trainerImage)?"not-allowed":"pointer",
                  opacity:trainerLoading||(!trainerInput.trim()&&!trainerImage)?0.4:1,transition:"all .15s",
                  flexShrink:0,WebkitTapHighlightColor:"transparent",display:"flex",
                  alignItems:"center",justifyContent:"center"}}>
                {trainerLoading?"…":"Ask"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Chef tab ── */}
      {activeTab==="chef"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",padding:"0 14px"}}>
          <div style={{flexShrink:0,padding:"10px 2px 6px"}}>
            <div style={{fontSize:11,color:T.accent,letterSpacing:"0.12em"}}>👨‍🍳 CHEF</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>
              Design meal preps (auto-saved to your library) and ask nutrition questions.
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"8px 0",WebkitOverflowScrolling:"touch"}}>
            {chefMsgs.map((m,i)=>{
              const isUser = m.role==="user";
              const lines = (m.content||"").split("\n").map(l=>l.trim()).filter(Boolean);
              return (
                <div key={i} style={{display:"flex",
                  justifyContent:isUser?"flex-end":"flex-start",marginBottom:12}}>
                  <div style={{maxWidth:"85%",padding:"11px 15px",
                    background:isUser?T.accent:T.ai,
                    color:isUser?"#0b0f0b":T.text,
                    borderRadius:isUser?"18px 18px 5px 18px":"18px 18px 18px 5px",
                    border:isUser?"none":`1px solid ${T.border}`,
                    fontSize:14,lineHeight:1.55,wordBreak:"break-word",whiteSpace:"pre-wrap"}}>
                    {lines.length>1 ? lines.map((l,j)=>(
                      <div key={j} style={{marginBottom:j<lines.length-1?4:0}}>{l}</div>
                    )) : m.content}
                  </div>
                </div>
              );
            })}
            {chefLoading&&(
              <div style={{display:"flex",marginBottom:12}}>
                <div style={{background:T.ai,border:`1px solid ${T.border}`,
                  borderRadius:"18px 18px 18px 5px",padding:"12px 16px"}}>
                  <div style={{display:"flex",gap:5}}>
                    {[0,1,2].map(i=>(
                      <div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.accent,
                        animation:`pulse 1.2s ${i*0.2}s infinite`}}/>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chefEndRef}/>
          </div>
          {/* Input */}
          <div style={{flexShrink:0,paddingBottom:`max(env(safe-area-inset-bottom),14px)`,paddingTop:8}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-end",
              background:T.surface,borderRadius:16,padding:"8px 8px 8px 14px",
              border:`1px solid ${T.border}`}}>
              <textarea ref={chefInputRef} value={chefInput} rows={1}
                onChange={e=>{
                  setChefInput(e.target.value);
                  e.target.style.height="auto";
                  e.target.style.height=Math.min(e.target.scrollHeight,88)+"px";
                }}
                placeholder="e.g. build me a 600-cal high-protein lunch prep"
                style={{flex:1,background:"none",border:"none",color:T.text,
                  fontSize:16,lineHeight:1.5,padding:"4px 0",outline:"none",
                  overflowY:"auto",minHeight:26,maxHeight:88}}/>
              <button onClick={handleChefSend} disabled={chefLoading||!chefInput.trim()}
                style={{background:T.gAccent,color:"#0b0f0b",border:"none",borderRadius:12,
                  padding:"0 16px",fontWeight:700,fontSize:15,minHeight:44,minWidth:64,
                  boxShadow:chefLoading||!chefInput.trim()?"none":`${T.glow} ${T.accent}66`,
                  cursor:chefLoading||!chefInput.trim()?"not-allowed":"pointer",
                  opacity:chefLoading||!chefInput.trim()?0.4:1,transition:"all .15s",
                  flexShrink:0,WebkitTapHighlightColor:"transparent",display:"flex",
                  alignItems:"center",justifyContent:"center"}}>
                {chefLoading?"…":"Ask"}
              </button>
            </div>
          </div>
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
                    {latest} lbs {change!==0 && <span style={{color:change<0?T.accent:T.warn}}>
                      ({change>0?"+":""}{change})</span>}
                  </span>
                </div>
                {present.length===1 ? (
                  <div style={{textAlign:"center",padding:"14px 0",color:T.muted,fontSize:12}}>
                    One weigh-in this week ({latest} lbs). Log another day to see a trend line.
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
            // mini ring helper with a center letter
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
          onSave={handleProfileSave} onApplyGoals={handleApplyGoals}/>
      )}

      {showGoals&&(
        <GoalsSheet goals={goals}
          onSave={g=>{setGoals(g);saveGoals(g);}}
          onClose={()=>setShowGoals(false)}/>
      )}
      <HistoryDrawer open={showHist} allDays={allDays} selectedDay={selDay}
        onSelectDay={d=>setSelDay(d)} onClose={()=>setShowHist(false)}
        onNav={t=>setActiveTab(t)} onExport={handleExport} onImport={handleImportClick}/>
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
