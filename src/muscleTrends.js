import {exerciseKey,uniqueExerciseNames} from "./exerciseIdentity.js";
export const MUSCLE_GROUPS=["Back","Chest","Legs","Shoulders","Biceps","Triceps","Core","Other"];
export function muscleGroup(name,overrides={}) {
 if(MUSCLE_GROUPS.includes(overrides[name]))return overrides[name];
 const n=name.toLowerCase();
 if(/tricep|push\s*down|skull\s*crusher|overhead.*extension/.test(n))return "Triceps";
 if(/crunch|plank|sit.?up|ab wheel|leg raise|knee raise|abdominal/.test(n))return "Core";
 if(/leg|squat|lunge|deadlift|rdl|hamstring|calf|calves|hip thrust|glute|adduct|abduct/.test(n))return "Legs";
 if(/rear.*delt|lateral.*rais|front.*rais|shoulder|military press|overhead press|face pull/.test(n))return "Shoulders";
 if(/pulldown|pull.?up|chin.?up|row|lat pull|pullover/.test(n))return "Back";
 if(/chest|bench|pec|push.?up|fly|flies/.test(n))return "Chest";
 if(/bicep|curl/.test(n))return "Biceps";
 return "Other";
}
export function muscleTrends(workouts,today,overrides={},aliases={}) {
 const end=Date.parse(today+"T12:00:00Z");
 const rows=Object.fromEntries(MUSCLE_GROUPS.map(group=>[group,{group,sets:0,previousSets:0,days:new Set(),exercises:new Set()}]));
 const days=[];
 for(const [day,entries] of Object.entries(workouts)){
  const age=Math.round((end-Date.parse(day+"T12:00:00Z"))/86400000);
  if(!Number.isFinite(age)||age<0||age>=28)continue;
  const counts={};
  for(const entry of entries||[]){
   if(/cardio|run|walk|cycle|cycling|bike|treadmill|elliptical/i.test(entry.category||"") || /^(run|walk|cycling|bike|treadmill|elliptical)\b/i.test(entry.name||""))continue;
   const group=muscleGroup(entry.name||"",overrides),row=rows[group];
   if(age<14){row.sets++;row.days.add(day);row.exercises.add(entry.name);counts[group]=(counts[group]||0)+1;}
   else row.previousSets++;
  }
  if(age<14 && Object.keys(counts).length)days.push({day,sets:Object.values(counts).reduce((a,b)=>a+b,0),groups:counts});
 }
 return {groups:Object.values(rows).map(r=>({...r,days:r.days.size,exercises:uniqueExerciseNames([...r.exercises],aliases),delta:r.previousSets?Math.round((r.sets-r.previousSets)/r.previousSets*100):null})).filter(r=>r.sets||r.previousSets).sort((a,b)=>b.sets-a.sets),
 days:days.sort((a,b)=>b.sets-a.sets||b.day.localeCompare(a.day)),
 exercises:[...new Set(Object.values(workouts).flatMap(es=>(es||[]).map(e=>e.name)).filter(Boolean))].sort()};
}

export function exerciseSessions(workouts,name,through,aliases={}) {
 return Object.keys(workouts).filter(day=>day<=through).sort().reverse().map(day=>({
  day,sets:(workouts[day]||[]).filter(e=>exerciseKey(e.name||"",aliases)===exerciseKey(name,aliases))
 })).filter(s=>s.sets.length);
}
