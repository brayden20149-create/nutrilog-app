import test from 'node:test';
import assert from 'node:assert/strict';
import {nutrientDay,nutrientStreak,mergeMissingNutrients} from '../src/nutrientTracking.js';
import {dietProjection} from '../src/dietProjection.js';
test('missing values do not earn extra nutrient streaks',()=>{
 assert.equal(nutrientDay([{fiber:null}],'fiber',25).hit,false);
 assert.equal(nutrientDay([{fiber:25}],'fiber',25).hit,true);
 assert.equal(nutrientDay([{fiber:25},{}],'fiber',25).hit,false);
});
test('upper limit streak waits for day to end',()=>{
 const days={'2026-09-14':[{sodium:500}],'2026-09-13':[{sodium:1200}],'2026-09-12':[{sodium:1400}]};
 assert.equal(nutrientStreak(days,'sodium',2000,'max','2026-09-14'),2);
});
test('AI fill only changes missing requested fields on unchanged records',()=>{
 const original=[{id:1,name:'Cereal',calories:100,protein:1,carbs:20,fat:2,fiber:null,sodium:20}];
 const result=mergeMissingNutrients(original,original,[{id:1,fiber:4,sodium:500,calories:900}],['fiber','sodium']);
 assert.equal(result[0].fiber,4);assert.equal(result[0].sodium,20);assert.equal(result[0].calories,100);
 const edited=[{...original[0],name:'Edited'}];
 assert.deepEqual(mergeMissingNutrients(edited,original,[{id:1,fiber:4}],['fiber']),edited);
 assert.deepEqual(mergeMissingNutrients([],original,[{id:1,fiber:4}],['fiber']),[]);
});
test('seven-day macro streaks are not described as a protein gap',()=>{
 const p=dietProjection({}, {}, '2026-09-14',{calories:7,protein:7,carbs:7,fat:5});
 assert.equal(p.title,'Your recent goal streaks are strong');
 assert.match(p.explanation,/fat streak is 5/);
});
