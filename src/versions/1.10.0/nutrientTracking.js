import { number } from './nutrition.js';

export function nutrientDay(entries, key, target, mode='min') {
  const values=(entries||[]).map(e=>number(e[key]));
  const complete=values.length>0 && values.every(v=>v!==null);
  const total=values.reduce((a,v)=>a+(v??0),0);
  const goal=number(target);
  return {total,complete,missing:values.filter(v=>v===null).length,
    estimated:(entries||[]).some(e=>e.dietEstimated),
    hit:complete && goal>0 && (mode==='max' ? total<=goal : total>=goal)};
}
const previous = day => { const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-1);return d.toISOString().slice(0,10); };
export function nutrientStreak(days,key,target,mode,today) {
  let day=today, count=0;
  // Upper limits cannot be finished before the day ends.
  if(mode==='max' || !nutrientDay(days[day],key,target,mode).hit) day=previous(day);
  for(let i=0;i<400;i++) {
    if(!nutrientDay(days[day],key,target,mode).hit) break;
    count++; day=previous(day);
  }
  return count;
}
export function mergeMissingNutrients(current,snapshot,results,keys) {
  const original=new Map(snapshot.map(e=>[String(e.id),e]));
  const updates=new Map((Array.isArray(results)?results:[]).filter(r=>r && r.id!=null).map(r=>[String(r.id),r]));
  return current.map(e=>{
    const before=original.get(String(e.id)), r=updates.get(String(e.id));
    if(!before || !r || ['name','calories','protein','carbs','fat','quantity','quantityUnit'].some(k=>e[k]!==before[k])) return e;
    const patch={};
    for(const k of keys) if(number(e[k])===null && number(r[k])!==null) patch[k]=number(r[k]);
    if(!Object.keys(patch).length) return e;
    return {...e,...patch,dietEstimated:true,dietSource: typeof r.source==='string' && /^https:\/\//.test(r.source)?r.source:undefined};
  });
}
