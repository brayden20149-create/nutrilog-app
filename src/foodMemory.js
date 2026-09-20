import { MACROS } from './nutrition.js';

const valid = e => typeof e?.name === 'string' && MACROS.every(k => typeof e[k] === 'number' && Number.isFinite(e[k]) && e[k] >= 0);
const STOP = new Set('log add ate eat had i a an the my please some one two of serving servings same again as before can could would you me pull up those that this these macros macro nutrition values for from week weeks day days ago last previous previously history find show get remember recall what was were are is it on in to and have back yesterday today g grams'.split(' '));
const tokens = text => [...new Set(text.toLowerCase().replace(/pop[ -]?tarts?/g, 'poptart').replace(/[^a-z ]/g, ' ').split(/\s+/).filter(t => t && !STOP.has(t)))];

// Preserve each distinct recorded portion, including conflicting historical values.
// Historical entries are records, not verified label facts.
export function foodMemory(days = {}, barcodes = {}, meals = []) {
  const records = [];
  for (const [code, e] of Object.entries(barcodes)) {
    if (e.nutritionVersion === 2 && valid(e)) records.push({ entry: {...e, barcode:code}, portion:e.basis || 'one saved base serving', origin:'Saved barcode' });
  }
  for (const e of meals) if (valid({...e.perContainer,name:e.name})) records.push({entry:{...e.perContainer,name:e.name},portion:'one container',origin:'Saved meal'});
  for (const day of Object.keys(days).sort().reverse()) {
    for (const e of days[day] || []) if (valid(e)) records.push({entry:e,portion:e.quantity ? `${e.quantity} ${e.quantityUnit || 'recorded units'}` : 'same portion as this entry (size not recorded)',day,origin:`Logged ${day}`});
  }
  const seen = new Set();
  return records.filter(r => {
    const key = JSON.stringify([r.entry.name.toLowerCase(), ...MACROS.map(k=>r.entry[k]),r.portion,r.day || null]);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

export function matchingFoods(text, records, today) {
  const quoted = [...text.matchAll(/["“”']([^"“”']+)["“”']/g)].flatMap(m=>tokens(m[1]));
  const query = quoted.length ? quoted : tokens(text);
  const explicitDate = text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
  let date = explicitDate;
  if (today && /\b(?:a|one|1) week ago\b|\byesterday\b/i.test(text)) {
    const d = new Date(today+"T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - (/yesterday/i.test(text)?1:7));
    date = d.toISOString().slice(0,10);
  }
  if (date) records = records.filter(r=>r.day===date);
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

export function isHistoryLookup(text) {
  if (/\b(?:log|add|ate|eaten|remove|delete|clear|save|update)\b/i.test(text)) return false;
  return /\b(?:pull|find|show|remember|recall|look up)\b/i.test(text) ||
    (/\b(?:macros|nutrition|values|what)\b/i.test(text) && /\b(?:ago|previous|before|yesterday|last|history)\b/i.test(text));
}
export function historyReply(matches) {
  if (!matches.length) return "I couldn’t find a matching food in your saved logs. Try a short name such as “dip” or “chicken”, or the name shown on the entry.";
  return "Found in your saved foods:\n" + matches.map(r=>`• ${r.entry.name} — ${r.origin}\n${r.entry.calories} cal | ${r.entry.protein}g protein | ${r.entry.carbs}g carbs | ${r.entry.fat}g fat${r.entry.confidence==="low"?" (recorded estimate)":""}`).join("\n\n") + "\n\nThese are the recorded values. Nothing has been logged.";
}
