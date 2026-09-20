import test from "node:test";
import assert from "node:assert/strict";
import {exerciseSessions} from "../src/muscleTrends.js";
test("exercise drilldown preserves individual sets and orders dates newest first",()=>{
 const rows={"2026-09-01":[{name:"Curl",detail:"40 lbs × 10"},{name:"Curl",detail:"45 lbs × 8"},{name:"Cable Curl",detail:"80 lbs × 8"}],"2026-09-19":[{name:"curl",detail:"50 lbs × 9"}],"2026-09-21":[{name:"Curl",detail:"55 lbs × 9"}]};
 const result=exerciseSessions(rows,"Curl","2026-09-20");
 assert.deepEqual(result.map(s=>s.day),["2026-09-19","2026-09-01"]);
 assert.deepEqual(result[1].sets.map(s=>s.detail),["40 lbs × 10","45 lbs × 8"]);
 assert.deepEqual(exerciseSessions(rows,"Squat","2026-09-20"),[]);
 assert.equal(rows["2026-09-01"].length,3);
});
