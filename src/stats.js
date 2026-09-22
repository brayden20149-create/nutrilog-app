import { addDays, dayKeyFromDate } from "./dates.js";
import { dietPerContainer } from "./nutrition.js";

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
    ...dietPerContainer(meal.ingredients||[],c),
  };
};
