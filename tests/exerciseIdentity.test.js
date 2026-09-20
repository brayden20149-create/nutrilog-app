import test from "node:test";
import assert from "node:assert/strict";
import {exerciseNameKey,uniqueExerciseNames} from "../src/exerciseIdentity.js";
import {exerciseSessions,muscleTrends} from "../src/muscleTrends.js";
test("V-bar wording merges but distinct variants stay separate",()=>{
 assert.equal(exerciseNameKey("Tricep Pushdown (V-Bar)"),exerciseNameKey("V Bar Triceps Pushdowns"));
 assert.notEqual(exerciseNameKey("Tricep Pushdown"),exerciseNameKey("V Bar Tricep Pushdown"));
 assert.notEqual(exerciseNameKey("Tricep Kickback"),exerciseNameKey("Tricep Kickback (Underhand Cable)"));
 assert.notEqual(exerciseNameKey("Dumbbell Curl"),exerciseNameKey("Barbell Curl"));
 assert.equal(uniqueExerciseNames(["Tricep Pushdown (V-Bar)","V Bar Tricep Pushdown"]).length,1);
});
test("merged histories retain both dates and all sets without editing source",()=>{
 const a={name:"Tricep Pushdown (V-Bar)",detail:"100 lbs × 10"},b={name:"V Bar Tricep Pushdown",detail:"110 lbs × 8"};
 const w={"2026-09-13":[a],"2026-09-18":[b,a]};
 assert.deepEqual(exerciseSessions(w,a.name,"2026-09-20").map(s=>s.sets.length),[2,1]);
 const groups=muscleTrends(w,"2026-09-20").groups;
 assert.equal(groups[0].sets,3);assert.equal(groups[0].exercises.length,1);
 assert.equal(b.name,"V Bar Tricep Pushdown");
});
test("manual links are reversible and preserve every set",()=>{
 const w={"2026-09-18":[{name:"Tricep Pushdown"},{name:"V Bar Tricep Pushdown"}]};
 const aliases={"Tricep Pushdown":exerciseNameKey("V Bar Tricep Pushdown")};
 assert.equal(exerciseSessions(w,"Tricep Pushdown","2026-09-20",aliases)[0].sets.length,2);
 assert.equal(exerciseSessions(w,"Tricep Pushdown","2026-09-20",{})[0].sets.length,1);
});
