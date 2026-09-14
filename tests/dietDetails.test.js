import test from 'node:test';
import assert from 'node:assert/strict';
import {dietSummary,dietPerContainer,dietValues} from '../src/nutrition.js';
test('partial totals disclose missing old entries and preserve known zeros',()=>{
 const d=dietSummary([{fiber:5,sodium:0},{fiber:null},{}]);
 assert.deepEqual(d.fiber,{total:5,known:1,missing:2});
 assert.deepEqual(d.sodium,{total:0,known:1,missing:2});
});
test('prep divides complete fields only without presenting partial sums as complete',()=>{
 const d=dietPerContainer([{fiber:20,sodium:100,fruitCups:2,vegetableCups:0},{fiber:10,sodium:null,fruitCups:0,vegetableCups:4}],10);
 assert.equal(d.fiber,3);assert.equal(d.sodium,null);assert.equal(d.fruitCups,0.2);assert.equal(d.vegetableCups,0.4);
});
test('blank and invalid manual values remain unknown',()=>{
 assert.deepEqual(dietValues({fiber:'',sodium:-1,fruitCups:'0',vegetableCups:'1.5'}),{fiber:null,sodium:null,sugar:null,saturatedFat:null,potassium:null,calcium:null,iron:null,fruitCups:0,vegetableCups:1.5});
});
