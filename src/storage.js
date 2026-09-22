import { pack, unpack } from "./packedValue.js";
import { barcodeNutrition } from "./nutrition.js";

export { pack, unpack };

// A full quota used to fail silently, losing the save with no sign to the user.
let onFailure = null;
export const onStorageFailure = (fn) => { onFailure = fn; };

export const _get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
export const _set = (k,v) => {
  try { localStorage.setItem(k,v); return true; }
  catch (e) {
    const full = e?.name === "QuotaExceededError" || e?.code === 22 || e?.code === 1014;
    onFailure?.(full ? "full" : "blocked");
    return false;
  }
};

export const dualSave = (key, valueStr) => {
  const packed = pack(valueStr);
  if (!_set(key, packed)) return false;
  _set(key + "_bak", packed);
  _set(key + "_ts", String(Date.now()));
  return true;
};
export const dualLoadRaw = (key) => {
  const p = unpack(_get(key));
  if (p && p !== "{}" && p !== "[]") return p;
  const b = unpack(_get(key + "_bak"));
  if (b && b !== "{}" && b !== "[]") {
    _set(key, pack(b));
    return b;
  }
  return p || b || null;
};

// Bytes are UTF-16 code units x2, matching how browsers charge the quota.
export const storageUsage = () => {
  let bytes = 0, entries = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      bytes += (k.length + (localStorage.getItem(k)?.length || 0)) * 2;
      entries++;
    }
  } catch {}
  return { bytes, entries, limit: 5 * 1024 * 1024 };
};

export const loadAll   = () => { try { return JSON.parse(dualLoadRaw("nl4_days")||"{}"); }  catch { return {}; } };
export const saveAll   = d  => dualSave("nl4_days", JSON.stringify(d));
export const loadGoals = () => { try { return {...DEFAULT_GOALS,...JSON.parse(dualLoadRaw("nl4_goals")||"{}")}; } catch { return {...DEFAULT_GOALS}; } };
export const saveGoals = g  => dualSave("nl4_goals", JSON.stringify(g));
export const loadMeals = () => { try { return JSON.parse(dualLoadRaw("nl4_meals")||"[]"); }  catch { return []; } };
export const saveMeals = m  => dualSave("nl4_meals", JSON.stringify(m));
export const loadPrograms = () => { try { return JSON.parse(dualLoadRaw("nl4_programs")||"[]"); } catch { return []; } };
export const savePrograms = p  => dualSave("nl4_programs", JSON.stringify(p));

export const loadWorkouts = () => { try { return JSON.parse(dualLoadRaw("nl4_workouts")||"{}"); } catch { return {}; } };
export const saveWorkouts = w  => dualSave("nl4_workouts", JSON.stringify(w));
export const loadStandout = () => { try { return JSON.parse(dualLoadRaw("nl4_standout")||"{}"); } catch { return {}; } }; // {dayKey:true}
export const saveStandout = s  => dualSave("nl4_standout", JSON.stringify(s));
export const loadWeights = () => { try { return JSON.parse(dualLoadRaw("nl4_weights")||"{}"); } catch { return {}; } }; // {dayKey: number(lbs)}
export const saveWeights = w  => dualSave("nl4_weights", JSON.stringify(w));
export const loadWater = () => { try { return JSON.parse(dualLoadRaw("nl4_water")||"{}"); } catch { return {}; } };   // {dayKey: oz}
export const saveWater = w  => dualSave("nl4_water", JSON.stringify(w));
export const WATER_STEP = 12; // oz per tap
export const WATER_GOAL = 100; // daily oz goal

export const loadBarcodes = () => { try { return JSON.parse(dualLoadRaw("nl4_barcodes")||"{}"); } catch { return {}; } };
export const saveBarcodes = b  => dualSave("nl4_barcodes", JSON.stringify(b));

export async function lookupBarcode(code) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,nutriments,serving_size`);
  if (!res.ok) throw new Error("lookup failed");
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  return barcodeNutrition(data.product);
}

export const loadTheme = () => { try { return JSON.parse(dualLoadRaw("nl4_theme")||"null"); } catch { return null; } };
export const saveTheme = t  => dualSave("nl4_theme", JSON.stringify(t));

export const DEFAULT_SETTINGS = {
  showDietProjection:false,
  extraNutrients:{},
  units:"imperial",     // imperial (lbs/oz) | metric (kg/mL)
  haptics:true,
  celebrations:true,
  landingTab:"chat",    // chat | log | workouts | train
  aiStyle:"balanced",   // concise | balanced | detailed
  webSearch:true,       // let the AI search the web for restaurant/brand nutrition data
};
export const loadSettings = () => { try { return {...DEFAULT_SETTINGS, ...JSON.parse(dualLoadRaw("nl4_settings")||"{}")}; } catch { return {...DEFAULT_SETTINGS}; } };
export const saveSettings = s  => dualSave("nl4_settings", JSON.stringify(s));

export const DEFAULT_GOALS = { calories:2200, protein:160, carbs:220, fat:70, water:100 };
export const PRESETS = [
  { name:"Maintenance", calories:2200, protein:150, carbs:230, fat:75 },
  { name:"Cutting",     calories:1800, protein:180, carbs:150, fat:55 },
  { name:"Bulking",     calories:2800, protein:200, carbs:300, fat:85 },
  { name:"High Protein",calories:2000, protein:220, carbs:160, fat:55 },
  { name:"Low Carb",    calories:2000, protein:160, carbs:80,  fat:100 },
];

export const DEFAULT_PROFILE = {
  name:"",
  age:"", sex:"", heightFt:"", heightIn:"", weight:"", wingspanIn:"",
  experience:"", daysPerWeek:"", trainingGoal:"",
  dietPrefs:"", allergies:"", restrictions:"",
  goalType:"", targetWeight:"",
};
export const loadProfile = () => { try { return {...DEFAULT_PROFILE,...JSON.parse(dualLoadRaw("nl4_profile")||"{}")}; } catch { return {...DEFAULT_PROFILE}; } };
export const saveProfile = p  => dualSave("nl4_profile", JSON.stringify(p));
