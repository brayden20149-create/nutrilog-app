import test from 'node:test';
import assert from 'node:assert/strict';
import {pack,unpack,MARK} from '../src/packedValue.js';

test('packed values round-trip, including emoji and typographic quotes',()=>{
 const payload=JSON.stringify({name:"Casey’s 🎃 Popcorn Chicken",sets:["65 lbs × 9"],calories:450});
 const packed=pack(payload);
 assert.ok(packed.startsWith(MARK));
 assert.equal(unpack(packed),payload);
});

test('plain JSON written by earlier versions is returned untouched',()=>{
 const legacy='{"2026-09-20":[{"name":"Banana","calories":105}]}';
 assert.equal(unpack(legacy),legacy);
 assert.equal(unpack('{}'),'{}');
 assert.equal(unpack(null),null);
 assert.equal(unpack(undefined),undefined);
});

test('compression meaningfully shrinks a realistic food log',()=>{
 const day=Array.from({length:40},(_,i)=>({name:`Food ${i}`,calories:400,protein:30,carbs:40,fat:12,fiber:null}));
 const payload=JSON.stringify(Object.fromEntries(Array.from({length:30},(_,d)=>[`2026-09-${d+1}`,day])));
 const packed=pack(payload);
 assert.equal(unpack(packed),payload);
 assert.ok(packed.length*4 < payload.length, `expected >4x shrink, got ${(payload.length/packed.length).toFixed(1)}x`);
});

test('a corrupt packed value reports empty rather than throwing',()=>{
 assert.equal(unpack(MARK+'not real compressed data'),null);
});
