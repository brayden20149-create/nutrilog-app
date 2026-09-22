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
      lastByName[g.key] = {...g,day:k}; // later keys overwrite → ends as most recent
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
    return { ...g, badges, volDelta, isNew, comparison:prev ? {day:prev.day,name:prev.name,volume:prev.volume,sets:prev.sets} : null };
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
