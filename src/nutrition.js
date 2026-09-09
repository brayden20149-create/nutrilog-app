export const MACROS = ['calories', 'protein', 'carbs', 'fat'];
const number = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;

export function barcodeNutrition(product) {
  const n = product.nutriments || {};
  // Only grams establish a mass conversion; never treat mL as grams.
  const match = (product.serving_size || '').match(/(?:^|[\s(])(\d+(?:\.\d+)?)\s*g\b/i);
  const grams = match && Number(match[1]) > 0 ? Number(match[1]) : null;
  const keys = ['energy-kcal', 'proteins', 'carbohydrates', 'fat'];
  const serving = keys.some(k => number(n[k + '_serving']) !== null);
  const values = Object.fromEntries(keys.map((k, i) => {
    let v = number(n[k + (serving ? '_serving' : '_100g')]);
    if (v === null && serving && grams) {
      const per100 = number(n[k + '_100g']);
      if (per100 !== null) v = per100 * grams / 100;
    }
    return [MACROS[i], v];
  }));
  return { ...values, name: [product.brands?.split(',')[0]?.trim(), product.product_name].filter(Boolean).join(' ') || 'Scanned item',
    basis: serving ? (product.serving_size || 'per serving') : 'per 100g',
    basisGrams: serving ? grams : 100, nutritionVersion: 2 };
}

export function scaleNutrition(base, amount, unit = 'servings') {
  const qty = number(amount);
  if (qty === null || qty <= 0) return null;
  const grams = number(base.basisGrams);
  if (unit === 'g' && (!grams || grams <= 0)) return null;
  const factor = unit === 'g' ? qty / grams : qty;
  if (MACROS.some(k => number(base[k]) === null)) return null;
  return Object.fromEntries(MACROS.map(k => [k, Number(base[k]) * factor]));
}

// Reverse only this transaction. Preserve unrelated entries added afterward.
export function undoFoodChange(current, before, after) {
  const beforeMap = new Map(before.map(e => [e.id, e]));
  const afterMap = new Map(after.map(e => [e.id, e]));
  const result = current.filter(e => beforeMap.has(e.id) || !afterMap.has(e.id)).map(e => {
    const old = beforeMap.get(e.id), changed = afterMap.get(e.id);
    return old && changed && JSON.stringify(e) === JSON.stringify(changed) ? old : e;
  });
  for (let i = 0; i < before.length; i++) {
    const entry = before[i];
    if (!afterMap.has(entry.id) && !result.some(e => e.id === entry.id)) result.splice(Math.min(i, result.length), 0, entry);
  }
  return result;
}
