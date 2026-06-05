import { useState, useEffect, useRef } from "react";
import { APP_VERSION, T, applyTheme, loadTheme, saveTheme, DEFAULT_SETTINGS, loadSettings, saveSettings, toDisplayWeight, fromDisplayWeight, weightUnit, toDisplayWater, waterUnit, DEFAULT_GOALS, todayKey, isToday, fmtDate, fmtFull, _get, _set, loadAll, saveAll, loadGoals, saveGoals, loadMeals, saveMeals, loadWorkouts, saveWorkouts, loadStandout, saveStandout, loadWeights, saveWeights, loadWater, saveWater, WATER_STEP, loadBarcodes, saveBarcodes, HAPTICS_ON, haptic, setHapticsOn, DEFAULT_PROFILE, loadProfile, saveProfile, weekStart, addDays, weekDays, dowShort, dayHitsGoal, sumDay, computeStreak, mealPerContainer, InfoDot, Ring, Bar, EntryRow, Bubble, HistoryDrawer, MealEditor, ProfileTab, Confetti, Toast, BarcodeScanner, ScanConfirm, SettingsModal, WelcomeModal, lookupBarcode, computeHabits, callClaude, callTrainer, callChef } from "./helpers.jsx";

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
  const [celebrate,  setCelebrate]  = useState(null); // {text, big} | null
  const [loaded,     setLoaded]     = useState(false);
  const [theme,      setTheme]      = useState(null);   // null = default; else theme object
  const [themeVersion, setThemeVersion] = useState(0);  // bump to force re-render after applyTheme
  const [settings,   setSettings]   = useState({...DEFAULT_SETTINGS});
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mealCounts,   setMealCounts]   = useState({}); // {mealId: count} for multi-container logging
  const [waterStep,  setWaterStep]  = useState(WATER_STEP);
  const [waterMenu,  setWaterMenu]  = useState(false);
  const [customWater, setCustomWater] = useState(null);
  const [barcodes,   setBarcodes]   = useState({});
  const [standout,   setStandout]   = useState({});
  const [scanning,   setScanning]   = useState(false);
  const [scanConfirm, setScanConfirm] = useState(null); // {code, data, notFound} | null
  const [scanLoading, setScanLoading] = useState(false); // null = closed, "" or string = open with value
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
    setBarcodes(loadBarcodes());
    setStandout(loadStandout());
    const savedTheme = loadTheme();
    if (savedTheme) { applyTheme(savedTheme); setTheme(savedTheme); setThemeVersion(v=>v+1); }
    const savedSettings = loadSettings();
    setSettings(savedSettings);
    setHapticsOn(savedSettings.haptics);
    if (savedSettings.landingTab && savedSettings.landingTab!=="chat") setActiveTab(savedSettings.landingTab);
    setLoaded(true);
    // Show the welcome modal once per app version
    try {
      if (_get("nl4_seen_version") !== APP_VERSION) setShowWelcome(true);
    } catch { setShowWelcome(true); }
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
      const result = await callClaude(apiMsgs, settings.aiStyle);
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

      const sources = actions
        .filter(a=>a.type==="add_entry" && a.entry?.source)
        .map(a=>({ name:a.entry.name, url:a.entry.source }));
      setChatMsgs(prev=>[...prev,{role:"assistant",content:message,actions,sources}]);
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
  // Whether each category is hit TODAY (drives the active/gray color)
  const tk = todayKey();
  const tToday = sumDay(allDays[tk]);
  const hitToday = {
    calories: dayHitsGoal(tToday, goals, "calories"),
    protein:  dayHitsGoal(tToday, goals, "protein"),
    carbs:    dayHitsGoal(tToday, goals, "carbs"),
    fat:      dayHitsGoal(tToday, goals, "fat"),
    workout:  (workouts[tk]?.length || 0) > 0,
  };

  // ── Celebration ──
  const fireCelebration = (text, big=false) => {
    if (!settings.celebrations) return;
    haptic(big ? [0,40,60,40] : 25);
    setCelebrate({ text, big });
    setTimeout(()=>setCelebrate(null), big ? 3200 : 2200);
  };
  // Track which goals we've already celebrated today so it fires on crossing only
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

  // Detect goal crossings for today and celebrate
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
    // First run after load: seed the already-hit goals silently so we don't
    // flood confetti for goals that were already met before the app opened.
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
    // Big celebration if all macro goals + water are hit
    const allHit = checks.calories && checks.protein && checks.carbs && checks.fat;
    if (newlyHit) {
      if (allHit && !cur._all) { cur._all = true; fireCelebration("All goals hit today! 🎉 Huge work.", true); }
      else fireCelebration(pick(cheerFor[newlyHit]));
    }
    if (!allHit) cur._all = false;
  // eslint-disable-next-line
  },[allDays, water, goals, selDay, loaded]);


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
      const result = await callTrainer(apiMsgs, settings.aiStyle);
      const message = typeof result === "string" ? result : (result.message || "");
      const actions = (result && result.actions) || [];
      const wkStatus = (result && result.workoutStatus) || "none";
      const isStandout = !!(result && result.standout);
      // Apply workout actions to today's log
      if (actions.length) {
        const curWk = workouts[selDay]||[];
        const { newWorkouts } = applyActions(actions, goals, allDays[selDay]||[], curWk);
        setWorkouts(prev=>{
          const out = {...prev,[selDay]:newWorkouts};
          saveWorkouts(out);
          return out;
        });
        const addedWk = actions.some(a=>a.type==="add_workout");
        // Mark a standout day (PR / big volume jump) — stamps the day with a star
        if (addedWk && isStandout && !standout[selDay]) {
          setStandout(prev=>{ const out={...prev,[selDay]:true}; saveStandout(out); return out; });
        }
        // Congratulate ONCE, only when the session becomes complete (no partial cheer)
        if (addedWk && wkStatus==="complete" && !completedRef.current[selDay]) {
          completedRef.current[selDay] = true;
          if (isStandout) fireCelebration("⭐ Standout session! A new best — logged.", true);
          else fireCelebration("Workout complete! 🎉 Great session.", true);
        }
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
      const result = await callChef(apiMsgs, settings.aiStyle);
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

  // ── Theme ──
  const applyAndSaveTheme = (t) => {
    applyTheme(t);          // t=null resets to default
    setTheme(t);
    saveTheme(t);
    setThemeVersion(v=>v+1); // force a re-render so new colors paint everywhere
    haptic(8);
  };

  // ── Settings ──
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
    // Full reload so all state resets cleanly
    setTimeout(()=>window.location.reload(), 200);
  };

  // Deep-link a "Try" action from the what's-new / version list to the actual feature
  const runFeatureAction = (action) => {
    if (!action) return;
    // Close any open info modals first
    setShowWelcome(false); setShowVersions(false); setShowSettings(false); setShowHist(false);
    switch (action) {
      case "chat":    setActiveTab("chat"); break;
      case "log":     setActiveTab("log"); break;
      case "train":   setActiveTab("train"); break;
      case "week":    setActiveTab("week"); break;
      case "profile": setActiveTab("profile"); break;
      case "scan":    setActiveTab("chat"); setTimeout(()=>setScanning(true), 250); break;
      case "settings":setTimeout(()=>setShowSettings(true), 200); break;
      default: break;
    }
  };

  // ── Barcode scanning ──
  const onBarcodeDetected = async (code) => {
    setScanning(false);
    haptic(20);
    // Check personal cache first
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
    // Save/update the personal cache for this barcode
    if (scanConfirm?.code) {
      setBarcodes(prev=>{
        const out = {...prev, [scanConfirm.code]:entry};
        saveBarcodes(out);
        return out;
      });
    }
    // Log to today
    const now = Date.now();
    mutEntries(prev=>[...prev, {...entry, id:now+Math.random(), loggedAt:now}]);
    setScanConfirm(null);
    fireCelebration(`Logged ${entry.name} 📦`);
  };


  // ── Backup: export everything to a downloadable file, import to restore ──
  const importFileRef = useRef(null);
  const holdTimer = useRef(null);

  // ── Edge-swipe between hotbar tabs (deliberate: must start at a screen edge) ──
  const TAB_ORDER = ["chat","log","workouts","train"];
  const edgeSwipe = useRef({x:0,y:0,fromEdge:false});
  const onAppTouchStart = (e)=>{
    if (e.touches.length!==1) { edgeSwipe.current.fromEdge=false; return; }
    const t=e.touches[0];
    const w=window.innerWidth;
    // Only arm the gesture if it starts within 28px of the left or right edge
    edgeSwipe.current = { x:t.clientX, y:t.clientY,
      fromEdge: t.clientX<=28 || t.clientX>=w-28 };
  };
  const onAppTouchEnd = (e)=>{
    if (!edgeSwipe.current.fromEdge) return;
    edgeSwipe.current.fromEdge=false;
    if (showHist || scanning || scanConfirm || customWater!==null || showWelcome || showVersions) return;
    const t=e.changedTouches[0];
    const dx=t.clientX-edgeSwipe.current.x, dy=t.clientY-edgeSwipe.current.y;
    // Require a long, clearly-horizontal swipe so it never fights with scrolling
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

  // Share backup via the iOS share sheet (AirDrop, Messages, Files, Notes…)
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
        // Fallback: share the data as text if file sharing isn't supported
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

  // ── Render ───────────────────────────────────────────────────────────────────
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
            // Group by normalized exercise name, preserving first-seen order
            const groups = [];
            const idx = {};
            dayWorkouts.forEach(w=>{
              const key = (w.name||"").trim().toLowerCase();
              if (idx[key]==null) { idx[key] = groups.length; groups.push({name:w.name, category:w.category, sets:[]}); }
              groups[idx[key]].sets.push(w);
            });
            return groups.map((grp,gi)=>(
              <div key={gi} style={{background:T.card,borderRadius:12,
                border:`1px solid ${T.info}33`,marginBottom:8,overflow:"hidden"}}>
                <div style={{display:"flex",alignItems:"center",
                  padding:"11px 14px",borderBottom:grp.sets.length>1?`1px solid ${T.border}`:"none"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:700}}>🏋️ {grp.name}</div>
                    <div style={{fontSize:10,color:T.info,marginTop:2,letterSpacing:"0.06em"}}>
                      {grp.sets.length} {grp.sets.length===1?"set":"sets"}
                      {grp.category?` · ${grp.category.toUpperCase()}`:""}
                    </div>
                  </div>
                  {grp.sets.length===1 && (
                    <button onClick={()=>deleteWorkout(grp.sets[0].id)}
                      style={{background:"none",border:"none",color:T.muted,cursor:"pointer",
                        fontSize:20,minWidth:44,minHeight:44,display:"flex",alignItems:"center",
                        justifyContent:"center",WebkitTapHighlightColor:"transparent",flexShrink:0}}>×</button>
                  )}
                </div>
                {grp.sets.length>1 && grp.sets.map((w,si)=>(
                  <div key={w.id} style={{display:"flex",alignItems:"center",
                    padding:"9px 14px 9px 18px",
                    borderBottom:si<grp.sets.length-1?`1px solid ${T.border}55`:"none"}}>
                    <div style={{fontSize:11,color:T.muted,minWidth:48}}>Set {si+1}</div>
                    <div style={{flex:1,minWidth:0,fontSize:13,color:T.text}}>{w.detail||"—"}</div>
                    <button onClick={()=>deleteWorkout(w.id)}
                      style={{background:"none",border:"none",color:T.muted,cursor:"pointer",
                        fontSize:18,minWidth:40,minHeight:40,display:"flex",alignItems:"center",
                        justifyContent:"center",WebkitTapHighlightColor:"transparent",flexShrink:0}}>×</button>
                  </div>
                ))}
                {grp.sets.length===1 && grp.sets[0].detail && (
                  <div style={{padding:"0 14px 11px",fontSize:13,color:T.muted}}>{grp.sets[0].detail}</div>
                )}
              </div>
            ));
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
