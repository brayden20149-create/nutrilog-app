import test from 'node:test';
import assert from 'node:assert/strict';
import {dietProjection} from '../src/dietProjection.js';
const goals={calories:3000,protein:180,fat:90,carbs:350};
const meal={name:'A',calories:3000,protein:180,fat:90,carbs:350};
const days={'2026-09-10':[meal],'2026-09-11':[meal],'2026-09-12':[meal]};
test('today, future and stale days do not distort projection',()=>{
 const p=dietProjection({...days,'2026-09-13':[{...meal,calories:20}],'2026-09-14':[meal],'2026-08-01':[meal]},goals,'2026-09-13');
 assert.equal(p.days,3);assert.equal(p.avg.calories,3000);assert.equal(p.title,'Close to your current goals');
});
test('insufficient history does not manufacture projection',()=>{
 assert.equal(dietProjection({},goals,'2026-09-13').avg,undefined);
});
test('below-target projection checks for incomplete logs',()=>{
 const low=Object.fromEntries(Object.keys(days).map(d=>[d,[{...meal,calories:2000}]]));
 assert.match(dietProjection(low,goals,'2026-09-13').change,/unlogged/);
});
test('invalid macros block a misleading projection',()=>{
 assert.equal(dietProjection({...days,'2026-09-12':[{...meal,protein:null}]},goals,'2026-09-13').avg,undefined);
});
