import {MACROS,DIET_FIELDS} from "./nutrition.js";
import {copyFood} from "./foodMemory.js";
export function requestedMultiplier(text) {
 const value=text.toLowerCase().replace(/three[ -]fifths|three fits/g,"3/5").replace(/one[ -]half|a half|half/g,"1/2").replace(/a quarter|one[ -]quarter/g,"1/4");
 const m=value.match(/^(?:please\s+)?(?:log|add|i ate|i had)\s+(\d+)\s*\/\s*(\d+)(?!\d)/);
 if(!m || +m[2]===0)return null;
 if(/^\s*(?:g\b|grams?\b|oz\b|ounces?\b|lbs?\b|pounds?\b|cups?\b|pieces?\b)/i.test(value.slice(m.index+m[0].length)))return null;
 return +m[1]/+m[2];
}
export function scaleSavedPortion(record,multiplier) {
 const factor=Number(multiplier);
 if(!Number.isFinite(factor)||factor<=0)throw new Error("Enter a positive portion multiplier.");
 const original=copyFood(record),entry={...original};
 for(const k of [...MACROS,...DIET_FIELDS.map(([k])=>k)])if(typeof entry[k]==="number")entry[k]=Math.round(entry[k]*factor*1000)/1000;
 if(factor!==1){
   entry.name=`${original.name} (${factor} × saved portion)`;
   if(Number(original.quantity)>0)entry.quantity=Number(original.quantity)*factor;
   else {delete entry.quantity;delete entry.quantityUnit;}
   delete entry.basisGrams;delete entry.basis;delete entry.nutritionVersion;
 }
 return entry;
}
