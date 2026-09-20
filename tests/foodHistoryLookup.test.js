import test from 'node:test';
import assert from 'node:assert/strict';
import {foodMemory,matchingFoods,isHistoryLookup,historyReply,copyFood} from '../src/foodMemory.js';
const dip={name:'Dip (300g)',calories:405,protein:51,carbs:9,fat:17,confidence:'low'};
const small={...dip,name:'Dip (100g)',calories:135,protein:17,carbs:3,fat:6};
test('screenshot request retrieves both dip portions from a week ago',()=>{
 const records=foodMemory({'2026-09-13':[dip,small],'2026-09-19':[dip]});
 const text='can you pull those “dip” macros from a week ago';
 const matches=matchingFoods(text,records,'2026-09-20');
 assert.equal(isHistoryLookup(text),true);
 assert.equal(matches.length,2);
 assert.ok(matches.every(r=>r.day==='2026-09-13'));
 assert.deepEqual(matches.map(r=>r.entry.calories),[405,135]);
 assert.match(historyReply(matches),/Nothing has been logged/);
 assert.match(historyReply(matches),/recorded estimate/);
});
test('unquoted conversational lookups find short food names',()=>{
 const records=foodMemory({'2026-09-13':[dip]});
 for(const q of ['pull up dip from last week','show me the dip macros','find dip','what were my dip macros before'])
 assert.equal(matchingFoods(q,records,'2026-09-20').length,1,q);
 assert.equal(matchingFoods('find salmon',records).length,0);
});
test('same food on different dates remains available for date lookup',()=>{
 const records=foodMemory({'2026-09-13':[dip],'2026-09-19':[dip]});
 assert.equal(matchingFoods('dip yesterday',records,'2026-09-20')[0].day,'2026-09-19');
 assert.equal(matchingFoods('dip 2026-09-13',records,'2026-09-20')[0].day,'2026-09-13');
 assert.equal(matchingFoods('dip 2026-09-12',records,'2026-09-20').length,0);
});
test('lookups do not intercept logging or destructive commands',()=>{
 for(const q of ['log dip from last week','add dip','remove dip','delete previous dip','save dip','update dip'])
 assert.equal(isHistoryLookup(q),false,q);
 assert.equal(isHistoryLookup('how can I improve my diet?'),false);
 const original={...dip,id:42,loggedAt:123};
 assert.deepEqual(copyFood({entry:original}),dip);
 assert.equal(original.id,42);
});
