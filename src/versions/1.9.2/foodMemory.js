import { MACROS } from './nutrition.js';

const valid = e => typeof e?.name === 'string' && MACROS.every(k => typeof e[k] === 'number' && Number.isFinite(e[k]) && e[k] >= 0);
const tokens = text => [...new Set(text.toLowerCase().replace(/pop[ -]?tarts?/g, 'poptart').replace(/[^a-z ]/g, ' ').split(/\s+/).filter(t => t && !new Set(['log','add','ate','eat','had','i','a','an','the','my','please','some','one','two','of','serving','servings','same','again','as','before']).has(t)))];

// Preserve each distinct recorded portion, including conflicting historical values.
// Historical entries are records, not verified label facts.
export function foodMemory(days = {}, barcodes = {}, meals = []) {
  const records = [];
  for (const [code, e] of Object.entries(barcodes)) {
    if (e.nutritionVersion === 2 && valid(e)) records.push({ entry: {...e, barcode:code}, portion:e.basis || 'one saved base serving', origin:'Saved barcode' });
  }
  for (const e of meals) if (valid({...e.perContainer,name:e.name})) records.push({entry:{...e.perContainer,name:e.name},portion:'one container',origin:'Saved meal'});
  for (const day of Object.keys(days).sort().reverse()) {
    for (const e of days[day] || []) if (valid(e)) records.push({entry:e,portion:e.quantity ? `${e.quantity} ${e.quantityUnit || 'recorded units'}` : 'same portion as this entry (size not recorded)',origin:`Logged ${day}`});
  }
  const seen = new Set();
  return records.filter(r => {
    const key = JSON.stringify([r.entry.name.toLowerCase(), ...MACROS.map(k=>r.entry[k]),r.portion]);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

export function matchingFoods(text, records) {
  const query = tokens(text);
  if (!query.length) return [];
  return records.map(r => {
    const words = tokens(r.entry.name);
    const overlap = query.filter(t=>words.includes(t)).length;
    return {r,score:overlap/query.length,overlap};
  }).filter(x=>x.score >= 0.5 && (x.overlap >= 2 || x.score === 1))
    .sort((a,b)=>b.score-a.score).slice(0,8).map(x=>x.r);
}

export function isRepeatRequest(text) {
  return /^(?:please\s+)?(?:log|add|i ate|i had)\b/i.test(text.trim()) && !/[?\n,;+]|\band\b/i.test(text);
}

export function copyFood(record) {
  if (!valid(record?.entry)) throw new Error('Saved food has incomplete nutrition.');
  // New IDs/timestamps belong to this transaction; never copy them from history.
  const {id,loggedAt,...entry} = record.entry;
  return {...entry};
}
