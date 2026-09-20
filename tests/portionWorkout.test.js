import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {requestedMultiplier,scaleSavedPortion} from '../src/portionReuse.js';
import {muscleGroup,muscleTrends} from '../src/muscleTrends.js';
test('three fifths of the screenshot saved portion scales all nutrients',()=>{
 const base={name:"Casey's Popcorn Chicken",calories:450,protein:28,carbs:32,fat:24,fiber:5,id:9};
 const factor=requestedMultiplier("log 3/5 casey’s popcorn chicken");
 assert.equal(factor,0.6);
 const e=scaleSavedPortion({entry:base},factor);
 assert.deepEqual([e.calories,e.protein,e.carbs,e.fat,e.fiber],[270,16.8,19.2,14.4,3]);
 assert.equal(base.calories,450);assert.equal(e.id,undefined);
 assert.equal(requestedMultiplier("log three fifths caseys chicken"),0.6);
 assert.equal(requestedMultiplier("log 3/5 oz chicken"),null);
 assert.equal(requestedMultiplier("log 3/0 chicken"),null);
 assert.throws(()=>scaleSavedPortion({entry:base},0));
});
test('muscle groups recognize compound and isolation exercises with overrides',()=>{
 for(const [n,g] of [["Lat Pulldown","Back"],["Dumbbell Curl","Biceps"],["Overhead Tricep Extension","Triceps"],["Leg Curl","Legs"],["Leg Raise","Core"],["Lateral Raise","Shoulders"],["Bench Press","Chest"]])assert.equal(muscleGroup(n),g);
 assert.equal(muscleGroup("Custom",{Custom:"Back"}),"Back");
 assert.equal(muscleGroup("Mystery lift"),"Other");
});
test('trends count equal windows, exclude future days and cardio, and rank sets',()=>{
 const row=name=>({name,detail:"40 lbs × 10",category:"strength"});
 const r=muscleTrends({"2026-09-20":[row("Row"),row("Pulldown"),row("Curl")],"2026-09-06":[row("Row")],"2026-09-21":[row("Row")],"2026-08-01":[row("Row")],"2026-09-19":[{name:"Bike",category:"cardio"}]},"2026-09-20");
 const b=r.groups.find(g=>g.group==="Back");
 assert.equal(b.sets,2);assert.equal(b.previousSets,1);assert.equal(b.delta,100);assert.equal(b.days,1);
 assert.equal(r.days[0].sets,3);
});
// Execute the actual pure workout analysis from helpers without loading JSX/React.
const src=readFileSync(new URL('../src/helpers.jsx',import.meta.url),'utf8');
const code=src.slice(src.indexOf('export const parseSet'),src.indexOf('export const computeStreak')).replace(/export /g,'');
const analyze=new Function(code+';return analyzeWorkoutDay;')();
test('volume popup retains exact latest baseline date, sets and arithmetic',()=>{
 const rows=(weight,reps)=>[{name:"Dumbbell Curl",detail:weight+" lbs × "+reps}];
 const r=analyze({"2026-09-01":rows(20,10),"2026-09-19":rows(100,45),"2026-09-20":[...rows(40,10),...rows(45,10),...rows(50,9)]},"2026-09-20").exercises[0];
 assert.equal(r.volume,1300);assert.equal(r.comparison.volume,4500);
 assert.equal(r.comparison.day,"2026-09-19");assert.equal(r.volDelta,-71);
 assert.equal(r.comparison.sets.length,1);
});
