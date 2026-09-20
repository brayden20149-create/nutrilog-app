// Conservative identity: wording changes merge; equipment, grip and angle stay distinct.
export function exerciseNameKey(name="") {
 const text=name.toLowerCase().replace(/push[ -]?downs?/g,"pushdown").replace(/press[ -]?downs?/g,"pushdown").replace(/kick[ -]?backs?/g,"kickback")
 .replace(/\btriceps\b/g,"tricep").replace(/\bbiceps\b/g,"bicep")
 .replace(/\bdumbbells?\b|\bdb\b/g,"dumbbell").replace(/\bbarbells?\b|\bbb\b/g,"barbell")
 .replace(/v[ -]?bar/g,"vbar").replace(/[^a-z0-9 ]/g," ");
 return [...new Set(text.split(/\s+/).filter(Boolean))].sort().join(" ");
}
export const exerciseKey=(name,aliases={})=>aliases[name] || exerciseNameKey(name);
export function uniqueExerciseNames(names,aliases={}) {
 const seen=new Set();
 return names.filter(name=>{const key=exerciseKey(name,aliases);if(seen.has(key))return false;seen.add(key);return true;});
}
