import test from 'node:test';
import assert from 'node:assert/strict';
import {foodMemory, matchingFoods, copyFood, isRepeatRequest} from '../src/foodMemory.js';
const pouch={id:1,loggedAt:123,name:'Pop-Tarts Frosted Pumpkin Pie',calories:370,protein:4,carbs:70,fat:9};
test('pumpkin spice poptart finds previous days without inventing new macros',()=>{
 const records=foodMemory({'2026-09-11':[pouch]});
 const matches=matchingFoods('log a pumpkin spice poptart',records);
 assert.equal(matches.length,1);
 const copied=copyFood(matches[0]);
 assert.equal(copied.calories,370);assert.equal(copied.fat,9);
 assert.equal(copied.id,undefined);assert.equal(copied.loggedAt,undefined);
 assert.equal(pouch.id,1);
 assert.match(matches[0].portion,/size not recorded/);
});
test('conflicting macros and portion sizes stay separate for user selection',()=>{
 const single={...pouch,name:'Pop-Tarts Frosted Pumpkin Pie (1 pastry)',calories:190,protein:2,carbs:35,fat:5};
 const matches=matchingFoods('log pumpkin poptarts',foodMemory({'2026-09-12':[single],'2026-09-11':[pouch]}));
 assert.equal(matches.length,2);assert.deepEqual(matches.map(r=>r.entry.calories),[190,370]);
});
test('only complete versioned barcode bases are available for exact reuse',()=>{
 const records=foodMemory({}, {old:pouch,incomplete:{...pouch,nutritionVersion:2,fat:null},ok:{...pouch,nutritionVersion:2,basis:'2 pastries (96g)'}});
 assert.equal(records.length,1);assert.equal(records[0].portion,'2 pastries (96g)');
 assert.equal(copyFood(records[0]).barcode,'ok');
});
test('saved meals and recent historical precision survive copying',()=>{
 const r=foodMemory({}, {},[{name:'Chicken rice',perContainer:{calories:501.25,protein:50.5,carbs:60,fat:6}}])[0];
 assert.equal(r.portion,'one container');assert.equal(copyFood(r).calories,501.25);
});
test('repeat prompt is restricted to single logging requests',()=>{
 assert.equal(isRepeatRequest('log a pumpkin spice poptart'),true);
 for(const t of ['what are poptart macros?','log cereal and milk','remove poptarts','log eggs, toast'])assert.equal(isRepeatRequest(t),false);
 assert.deepEqual(matchingFoods('log salmon',foodMemory({day:[pouch]})),[]);
});
test('an explicitly different amount is not silently scaled by matching',()=>{
 const [r]=matchingFoods('log 1 pastry pumpkin poptart',foodMemory({day:[pouch]}));
 assert.equal(copyFood(r).calories,370);assert.match(r.portion,/size not recorded/);
});
