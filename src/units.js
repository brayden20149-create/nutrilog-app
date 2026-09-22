export const toDisplayWeight = (lbs, units) => units==="metric" ? +(lbs*0.453592).toFixed(1) : lbs;
export const fromDisplayWeight = (val, units) => units==="metric" ? +(val/0.453592).toFixed(1) : +val;
export const weightUnit = (units) => units==="metric" ? "kg" : "lbs";
export const toDisplayWater = (oz, units) => units==="metric" ? Math.round(oz*29.5735) : oz;
export const fromDisplayWater = (val, units) => units==="metric" ? Math.round(val/29.5735) : +val;
export const waterUnit = (units) => units==="metric" ? "mL" : "oz";
