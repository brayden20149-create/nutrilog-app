import test from 'node:test';
import assert from 'node:assert/strict';
import {ASSISTANT_STABLE, INGREDIENTS_SYSTEM, NUTRIENTS_SYSTEM, buildSystem} from '../api/_lib/prompts.js';
import {checkPayload, clientIp, createRateLimiter, isAllowedOrigin} from '../api/_lib/guard.js';

// ── prompts ──────────────────────────────────────────────────────────────
test('the assistant prompt is split at a cache breakpoint',()=>{
 const sys=buildSystem({prompt:'assistant',aiStyle:'balanced',useSearch:false});
 assert.equal(sys.length,2);
 assert.deepEqual(sys[0].cache_control,{type:'ephemeral'});
 assert.equal(sys[0].text,ASSISTANT_STABLE);
 assert.equal(sys[1].cache_control,undefined,'the varying block must not be a breakpoint');
});

// The whole point of the split: one cached prefix, not one per combination.
test('the cached block is identical across every search and style combination',()=>{
 const seen=new Set();
 for(const useSearch of [true,false])
  for(const aiStyle of ['concise','balanced','detailed'])
   seen.add(buildSystem({prompt:'assistant',aiStyle,useSearch})[0].text);
 assert.equal(seen.size,1,'stable block must not vary');
});

test('search mode and style land after the breakpoint',()=>{
 const on=buildSystem({prompt:'assistant',aiStyle:'concise',useSearch:true})[1].text;
 const off=buildSystem({prompt:'assistant',aiStyle:'detailed',useSearch:false})[1].text;
 assert.match(on,/WEB SEARCH is available/);
 assert.match(off,/Web search is OFF/);
 assert.match(on,/short and to the point/);
 assert.match(off,/thorough and explanatory/);
 assert.doesNotMatch(ASSISTANT_STABLE,/WEB SEARCH is available|Web search is OFF|^STYLE:/m);
});

test('the prompt text itself survived the move to the server',()=>{
 // Spot-check landmarks from each section rather than the whole 12KB.
 for(const needle of ['You are NutriLog AI','ANCHOR MENUS','Chick-fil-A','Big Mac',
   'add_workout','save_program','save_meal','ESTIMATION METHOD','PACKAGED FOOD',
   'Return ONLY the JSON object'])
  assert.match(ASSISTANT_STABLE,new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),`missing: ${needle}`);
 assert.ok(ASSISTANT_STABLE.length>12000,`stable prompt shrank to ${ASSISTANT_STABLE.length}`);
});

test('the small prompts stay plain strings, below the cacheable minimum',()=>{
 assert.equal(buildSystem({prompt:'ingredients'}),INGREDIENTS_SYSTEM);
 assert.equal(buildSystem({prompt:'nutrients'}),NUTRIENTS_SYSTEM);
 assert.equal(typeof INGREDIENTS_SYSTEM,'string');
 assert.match(INGREDIENTS_SYSTEM,/precise nutrition database/);
 assert.match(NUTRIENTS_SYSTEM,/Return ONLY JSON/);
});

test('an unknown prompt yields null so the handler can fall back to legacy',()=>{
 assert.equal(buildSystem({prompt:'nope'}),null);
 assert.equal(buildSystem({}),null);
});

// ── origin ───────────────────────────────────────────────────────────────
test('only same-origin requests are accepted',()=>{
 assert.ok(isAllowedOrigin({host:'nutrilog.app',origin:'https://nutrilog.app'}));
 assert.ok(isAllowedOrigin({host:'nutrilog.app',referer:'https://nutrilog.app/log'}),'referer is a fallback');
 assert.ok(!isAllowedOrigin({host:'nutrilog.app',origin:'https://evil.test'}));
 assert.ok(!isAllowedOrigin({host:'nutrilog.app'}),'a bare curl sends neither header');
 assert.ok(!isAllowedOrigin({origin:'https://nutrilog.app'}),'no host');
 assert.ok(!isAllowedOrigin({host:'nutrilog.app',origin:'not a url'}));
});

test('extra origins can be allowed explicitly',()=>{
 const h={host:'nutrilog.app',origin:'https://preview.vercel.app'};
 assert.ok(!isAllowedOrigin(h));
 assert.ok(isAllowedOrigin(h,{allow:['preview.vercel.app']}));
});

// ── rate limit ───────────────────────────────────────────────────────────
test('the rate limiter caps a burst and recovers after the window',()=>{
 let now=1000;
 const take=createRateLimiter({max:3,windowMs:1000,now:()=>now});
 assert.ok(take('a').ok); assert.ok(take('a').ok); assert.ok(take('a').ok);
 const blocked=take('a');
 assert.equal(blocked.ok,false);
 assert.ok(blocked.retryAfter>=1);
 assert.ok(take('b').ok,'limits are per key');
 now+=1001;
 assert.ok(take('a').ok,'window slid');
});

test('client ip prefers the first forwarded hop',()=>{
 assert.equal(clientIp({'x-forwarded-for':'1.2.3.4, 5.6.7.8'}),'1.2.3.4');
 assert.equal(clientIp({'x-real-ip':'9.9.9.9'}),'9.9.9.9');
 assert.equal(clientIp({}),'unknown');
});

// ── payload caps ─────────────────────────────────────────────────────────
test('payload caps bound what one request can cost',()=>{
 const ok=[{role:'user',content:'log a banana'}];
 assert.equal(checkPayload({messages:ok}),null);
 assert.match(checkPayload({messages:[]}),/non-empty/);
 assert.match(checkPayload({messages:'nope'}),/non-empty/);
 assert.match(checkPayload({messages:Array(41).fill({role:'user',content:'x'})}),/too many/);
 assert.match(checkPayload({messages:[{role:'user',content:'x'.repeat(200000)}]}),/too large/);
 assert.match(checkPayload({messages:[null]}),/malformed/);
});

test('a legacy system string is accepted but bounded',()=>{
 const messages=[{role:'user',content:'hi'}];
 assert.equal(checkPayload({messages,legacySystem:'short prompt'}),null);
 assert.match(checkPayload({messages,legacySystem:'x'.repeat(20001)}),/too large/);
 assert.match(checkPayload({messages,legacySystem:{}}),/must be a string/);
});

test('non-string message content still counts toward the size cap',()=>{
 const big=[{role:'user',content:[{type:'image',source:{data:'x'.repeat(130000)}}]}];
 assert.match(checkPayload({messages:big}),/too large/);
});
