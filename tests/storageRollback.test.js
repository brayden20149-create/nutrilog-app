import test from 'node:test';
import assert from 'node:assert/strict';

// storage.js talks to a global localStorage, so stand one up before importing it.
const store = new Map();
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => { store.set(k, String(v)); },
  removeItem: k => { store.delete(k); },
  key: i => [...store.keys()][i] ?? null,
  get length() { return store.size; },
};
const { dualSave, dualLoadRaw, pack } = await import('../src/storage.js');

const MARK = '\u0001lz1\u0001';
const PAYLOAD = JSON.stringify({ '2026-09-22': [{ name: "Casey’s 🎃 Chicken", calories: 450 }] });

// This is the contract that keeps a downgrade safe. A pre-2.0 build reads the
// PRIMARY key and JSON.parses it directly; it never reaches the backup while the
// primary holds data. So the primary must stay plain JSON.
test('the primary copy stays plain JSON a rolled-back build can parse',()=>{
 store.clear();
 dualSave('nl4_days', PAYLOAD);
 const primary = localStorage.getItem('nl4_days');
 assert.ok(!primary.startsWith(MARK), 'primary must not be compressed');
 assert.deepEqual(JSON.parse(primary), JSON.parse(PAYLOAD));
});

test('the backup copy is compressed, so it is no longer a full-size duplicate',()=>{
 store.clear();
 const big = JSON.stringify(Object.fromEntries(
   Array.from({length:60},(_,d)=>[`2026-07-${String(d%28+1).padStart(2,'0')}`,
     Array.from({length:6},(_,i)=>({name:`Food ${i}`,calories:500,protein:40,carbs:50,fat:15}))])));
 dualSave('nl4_days', big);
 const backup = localStorage.getItem('nl4_days_bak');
 assert.ok(backup.startsWith(MARK));
 assert.ok(backup.length * 4 < big.length, 'backup should be far smaller than the primary');
});

test('reads work whichever form each copy is in',()=>{
 store.clear();
 dualSave('nl4_days', PAYLOAD);
 assert.equal(dualLoadRaw('nl4_days'), PAYLOAD);

 // A primary left compressed by the earlier 2.0 build still reads back.
 store.clear();
 localStorage.setItem('nl4_days', pack(PAYLOAD));
 assert.equal(dualLoadRaw('nl4_days'), PAYLOAD);

 // Legacy plaintext from 1.10.5 reads back untouched.
 store.clear();
 localStorage.setItem('nl4_days', PAYLOAD);
 assert.equal(dualLoadRaw('nl4_days'), PAYLOAD);
});

test('recovering from the backup restores the primary as plain JSON',()=>{
 store.clear();
 localStorage.setItem('nl4_days', '{}');            // primary effectively empty
 localStorage.setItem('nl4_days_bak', pack(PAYLOAD));
 assert.equal(dualLoadRaw('nl4_days'), PAYLOAD);
 // The rewritten primary must stay downgrade-safe too.
 const restored = localStorage.getItem('nl4_days');
 assert.ok(!restored.startsWith(MARK));
 assert.deepEqual(JSON.parse(restored), JSON.parse(PAYLOAD));
});

test('a failed write reports failure instead of losing it silently',async()=>{
 store.clear();
 const { onStorageFailure } = await import('../src/storage.js');
 let reported = null;
 onStorageFailure(r => { reported = r; });
 const real = globalThis.localStorage.setItem;
 globalThis.localStorage.setItem = () => { const e = new Error('full'); e.name = 'QuotaExceededError'; throw e; };
 const ok = dualSave('nl4_days', PAYLOAD);
 globalThis.localStorage.setItem = real;
 onStorageFailure(null);
 assert.equal(ok, false);
 assert.equal(reported, 'full');
});
