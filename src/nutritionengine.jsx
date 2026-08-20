// src/nutritionEngine.js
//
// NutriLog Nutrition Resolution Engine
//
// Core rule:
// The AI identifies WHAT the user ate.
// This file decides WHAT THE MACROS ARE.
//
// Resolution order:
// 1. Exact verified foods stored here
// 2. Open Food Facts for packaged/branded foods
// 3. Standardized whole-food records
// 4. AI estimate supplied as fallback
//
// The app never silently changes "1 packet" into half a packet,
// or "4 bananas" into some arbitrary serving count.

const round1 = n => Math.round((+n || 0) * 10) / 10;

const normalize = value =>
  String(value || "")
    .toLowerCase()
    .replace(/chick[\s-]*fil[\s-]*a/g, "chick fil a")
    .replace(/culver['’]?s/g, "culvers")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeUnit = unit => {
  const u = normalize(unit);

  if (!u) return "serving";

  if (["g", "gram", "grams"].includes(u)) return "g";
  if (["oz", "ounce", "ounces"].includes(u)) return "oz";

  if ([
    "packet",
    "pack",
    "packets",
    "packs"
  ].includes(u)) return "packet";

  if ([
    "serving",
    "servings"
  ].includes(u)) return "serving";

  if ([
    "piece",
    "pieces",
    "item",
    "items",
    "each",
    "banana",
    "bananas",
    "burger",
    "burgers",
    "sandwich",
    "sandwiches"
  ].includes(u)) return "each";

  return u;
};

const makeMacros = (calories, protein, carbs, fat) => ({
  calories: +calories || 0,
  protein: +protein || 0,
  carbs: +carbs || 0,
  fat: +fat || 0,
});

const scaleMacros = (m, multiplier) => ({
  calories: Math.round((+m.calories || 0) * multiplier),
  protein: round1((+m.protein || 0) * multiplier),
  carbs: round1((+m.carbs || 0) * multiplier),
  fat: round1((+m.fat || 0) * multiplier),
});

// -----------------------------------------------------------------------------
// VERIFIED FOOD DATABASE
// -----------------------------------------------------------------------------
//
// Add foods here when you want NutriLog to always use one authoritative record.
//
// type:
// restaurant -> normally count/packet based
// packaged   -> may support serving grams / per100g
// whole      -> standardized weight estimate
//
// priority:
// Higher number wins when aliases collide.

export const VERIFIED_FOODS = [
  {
    id: "cfa-fat-free-honey-mustard",
    type: "restaurant",
    brand: "Chick-fil-A",
    name: "Fat-Free Honey Mustard Dressing",

    aliases: [
      "chick fil a fat free honey mustard",
      "chick fil a fat free honey mustard dressing",
      "cfa fat free honey mustard",
      "cfa ff honey mustard",
      "fat free honey mustard chick fil a",
      "fat free honey mustard dressing chick fil a",
      "fat free honey mustard",
      "ff honey mustard",
      "ffhm",
    ],

    basisUnit: "packet",
    macros: makeMacros(90, 0, 22, 0),

    sourceType: "restaurant_official",
    source:
      "https://www.chick-fil-a.com/menu/dressings/fat-free-honey-mustard-dressing",

    priority: 100,
  },

  {
    id: "culvers-butterburger-original-double",
    type: "restaurant",
    brand: "Culver's",
    name: "ButterBurger, Original, Double",

    aliases: [
      "culvers double butterburger",
      "culvers double butter burger",
      "culvers butterburger double",
      "culvers original double butterburger",
      "double butterburger culvers",
      "double butter burger culvers",
      "double butterburger",
    ],

    basisUnit: "each",
    macros: makeMacros(560, 34, 38, 30),

    sourceType: "restaurant_official",
    source:
      "https://cdn.culvers.com/menu/docs/guide-nutrition-allergen.pdf",

    priority: 100,
  },

  // Standardized banana.
  //
  // This is NOT "physically exact" for every banana.
  // A count request uses a standard medium banana (~118 g edible portion).
  // A gram request is much more precise.
  {
    id: "banana-raw",
    type: "whole",
    brand: "",
    name: "Banana",

    aliases: [
      "banana",
      "bananas",
      "medium banana",
      "medium bananas",
    ],

    per100g: makeMacros(89, 1.09, 22.84, 0.33),
    defaultEachGrams: 118,

    sourceType: "standard_reference",
    source: null,

    priority: 50,
  },
];

// -----------------------------------------------------------------------------
// LOCAL USER FOOD MEMORY
// -----------------------------------------------------------------------------

const FOOD_CACHE_KEY = "nl4_food_cache";

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(FOOD_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeCache = cache => {
  try {
    localStorage.setItem(FOOD_CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

export const loadNutritionCache = () => readCache();

export const clearNutritionCache = () => writeCache({});

// -----------------------------------------------------------------------------
// MATCHING
// -----------------------------------------------------------------------------

const scoreAlias = (query, alias) => {
  const q = normalize(query);
  const a = normalize(alias);

  if (!q || !a) return 0;
  if (q === a) return 1000;
  if (q.includes(a)) return 800 + a.length;
  if (a.includes(q)) return 650 + q.length;

  const qTokens = new Set(q.split(" "));
  const aTokens = a.split(" ");

  if (!aTokens.length) return 0;

  const hits = aTokens.filter(t => qTokens.has(t)).length;

  return (hits / aTokens.length) * 500;
};

const buildQuery = request =>
  normalize(
    [
      request.brand,
      request.name,
      request.query,
    ]
      .filter(Boolean)
      .join(" ")
  );

export function findVerifiedFood(request) {
  const query = buildQuery(request);
  if (!query) return null;

  let best = null;
  let bestScore = 0;

  for (const food of VERIFIED_FOODS) {
    const candidates = [
      food.name,
      `${food.brand || ""} ${food.name || ""}`,
      ...(food.aliases || []),
    ];

    for (const alias of candidates) {
      let score = scoreAlias(query, alias);

      if (
        request.brand &&
        food.brand &&
        normalize(request.brand) === normalize(food.brand)
      ) {
        score += 250;
      }

      score += food.priority || 0;

      if (score > bestScore) {
        bestScore = score;
        best = food;
      }
    }
  }

  // Avoid accidentally resolving unrelated foods.
  return bestScore >= 480 ? best : null;
}

// -----------------------------------------------------------------------------
// QUANTITY SCALING
// -----------------------------------------------------------------------------

export function scaleVerifiedFood(food, request = {}) {
  const quantity =
    Number.isFinite(+request.quantity) && +request.quantity > 0
      ? +request.quantity
      : 1;

  const unit = normalizeUnit(request.unit);

  let multiplier = 1;
  let basisText = "";

  // Explicit grams are best whenever per-100g data exists.
  if (unit === "g" && food.per100g) {
    multiplier = quantity / 100;
    basisText = `${quantity} g`;

    return {
      ...scaleMacros(food.per100g, multiplier),

      name: food.brand
        ? `${food.brand} ${food.name}`
        : food.name,

      foodId: food.id,
      brand: food.brand || "",
      quantity,
      unit: "g",
      basis: basisText,

      sourceType: food.sourceType,
      source: food.source || undefined,
      confidence:
        food.sourceType === "restaurant_official" ||
        food.sourceType === "manufacturer"
          ? "verified"
          : "standardized",
    };
  }

  // Ounces -> grams if weight nutrition exists.
  if (unit === "oz" && food.per100g) {
    const grams = quantity * 28.349523125;
    multiplier = grams / 100;
    basisText = `${quantity} oz`;

    return {
      ...scaleMacros(food.per100g, multiplier),

      name: food.brand
        ? `${food.brand} ${food.name}`
        : food.name,

      foodId: food.id,
      brand: food.brand || "",
      quantity,
      unit: "oz",
      basis: basisText,

      sourceType: food.sourceType,
      source: food.source || undefined,
      confidence: "standardized",
    };
  }

  // Count-style whole food such as bananas.
  if (
    food.per100g &&
    food.defaultEachGrams &&
    ["each", "serving"].includes(unit)
  ) {
    const grams = quantity * food.defaultEachGrams;
    multiplier = grams / 100;
    basisText = `${quantity} ${quantity === 1 ? "item" : "items"} (~${Math.round(
      grams
    )} g standard weight)`;

    return {
      ...scaleMacros(food.per100g, multiplier),

      name:
        quantity === 1
          ? food.name
          : `${food.name} x${quantity}`,

      foodId: food.id,
      brand: food.brand || "",
      quantity,
      unit: "each",
      basis: basisText,

      sourceType: food.sourceType,
      source: food.source || undefined,
      confidence: "standardized",
    };
  }

  // Restaurant packet / discrete menu item.
  if (food.macros) {
    const basis = normalizeUnit(food.basisUnit);

    // If the user says "serving" for a discrete official item,
    // one serving = one item/packet.
    const compatible =
      unit === basis ||
      unit === "serving" ||
      (unit === "each" && ["packet", "each"].includes(basis));

    if (compatible) {
      multiplier = quantity;
    } else {
      // Never silently invent half-servings because the unit wording changed.
      multiplier = quantity;
    }

    basisText = `${quantity} ${
      food.basisUnit || (quantity === 1 ? "serving" : "servings")
    }`;

    return {
      ...scaleMacros(food.macros, multiplier),

      name:
        quantity === 1
          ? `${food.brand ? food.brand + " " : ""}${food.name}`
          : `${food.brand ? food.brand + " " : ""}${food.name} x${quantity}`,

      foodId: food.id,
      brand: food.brand || "",
      quantity,
      unit: food.basisUnit || unit,
      basis: basisText,

      sourceType: food.sourceType,
      source: food.source || undefined,
      confidence: "verified",
    };
  }

  return null;
}

// -----------------------------------------------------------------------------
// OPEN FOOD FACTS
// -----------------------------------------------------------------------------

const parseServingGrams = servingSize => {
  if (!servingSize) return null;

  const m = String(servingSize).match(
    /(\d+(?:\.\d+)?)\s*(g|gram|grams)\b/i
  );

  return m ? +m[1] : null;
};

const offNum = (obj, key) => {
  const n = +obj?.[key];
  return Number.isFinite(n) ? n : null;
};

const productMacros100g = nutriments => {
  const calories =
    offNum(nutriments, "energy-kcal_100g") ??
    (() => {
      const kj = offNum(nutriments, "energy_100g");
      return kj != null ? kj / 4.184 : null;
    })();

  return {
    calories,
    protein: offNum(nutriments, "proteins_100g"),
    carbs: offNum(nutriments, "carbohydrates_100g"),
    fat: offNum(nutriments, "fat_100g"),
  };
};

const macrosCompleteEnough = m =>
  m &&
  m.calories != null &&
  m.protein != null &&
  m.carbs != null &&
  m.fat != null;

const scoreOffProduct = (product, request) => {
  const requested = buildQuery(request);

  const productName = normalize(
    [
      product.brands,
      product.product_name,
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (!requested || !productName) return 0;

  const reqTokens = requested.split(" ").filter(Boolean);
  const pTokens = new Set(productName.split(" ").filter(Boolean));

  let hits = 0;

  for (const token of reqTokens) {
    if (pTokens.has(token)) hits++;
  }

  let score =
    reqTokens.length > 0
      ? (hits / reqTokens.length) * 100
      : 0;

  if (productName.includes(requested)) score += 100;

  if (
    request.brand &&
    normalize(product.brands).includes(normalize(request.brand))
  ) {
    score += 75;
  }

  return score;
};

export async function searchOpenFoodFacts(request) {
  const query = [
    request.brand,
    request.name || request.query,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!query) return null;

  try {
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: "1",
      action: "process",
      json: "1",
      page_size: "10",
      fields:
        "code,product_name,brands,serving_size,nutriments",
    });

    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?${params.toString()}`
    );

    if (!res.ok) return null;

    const data = await res.json();

    const candidates = (data.products || [])
      .map(product => ({
        product,
        score: scoreOffProduct(product, request),
      }))
      .filter(x => {
        const macros = productMacros100g(x.product.nutriments || {});
        return x.score >= 55 && macrosCompleteEnough(macros);
      })
      .sort((a, b) => b.score - a.score);

    const best = candidates[0];

    if (!best) return null;

    const p = best.product;
    const per100g = productMacros100g(p.nutriments || {});
    const servingGrams = parseServingGrams(p.serving_size);

    const quantity =
      Number.isFinite(+request.quantity) && +request.quantity > 0
        ? +request.quantity
        : 1;

    const unit = normalizeUnit(request.unit);

    let grams = null;
    let basis = "";

    if (unit === "g") {
      grams = quantity;
      basis = `${quantity} g`;
    } else if (unit === "oz") {
      grams = quantity * 28.349523125;
      basis = `${quantity} oz`;
    } else if (
      ["serving", "each"].includes(unit) &&
      servingGrams
    ) {
      grams = servingGrams * quantity;
      basis = `${quantity} serving${quantity === 1 ? "" : "s"} (${Math.round(
        grams
      )} g)`;
    }

    // We need a known weight before scaling per-100g data.
    if (grams == null) return null;

    const scaled = scaleMacros(per100g, grams / 100);

    const firstBrand =
      String(p.brands || "")
        .split(",")[0]
        .trim();

    const name = [
      firstBrand,
      p.product_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return {
      ...scaled,

      name: quantity > 1 ? `${name} x${quantity}` : name,

      foodId: p.code ? `off-${p.code}` : undefined,
      barcode: p.code || undefined,

      brand: firstBrand,
      quantity,
      unit,
      basis,

      sourceType: "open_food_facts",
      confidence: best.score >= 120 ? "high" : "medium",
    };
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// AI FALLBACK
// -----------------------------------------------------------------------------

const sanitizeEstimate = (fallback, request) => {
  if (!fallback) return null;

  const m = {
    calories: +fallback.calories,
    protein: +fallback.protein,
    carbs: +fallback.carbs,
    fat: +fallback.fat,
  };

  if (
    !Object.values(m).every(v => Number.isFinite(v) && v >= 0)
  ) {
    return null;
  }

  return {
    name:
      fallback.name ||
      request.name ||
      request.query ||
      "Estimated food",

    ...m,

    quantity:
      Number.isFinite(+request.quantity) && +request.quantity > 0
        ? +request.quantity
        : 1,

    unit: normalizeUnit(request.unit),

    sourceType: "ai_estimate",
    confidence: "estimated",
    basis: fallback.basis || "AI estimate",
  };
};

// -----------------------------------------------------------------------------
// MAIN RESOLVER
// -----------------------------------------------------------------------------

export async function resolveFoodRequest(request = {}) {
  // 1. Exact local verified database.
  const verified = findVerifiedFood(request);

  if (verified) {
    const result = scaleVerifiedFood(verified, request);

    if (result) return result;
  }

  // 2. Previously resolved/cached products.
  const key = buildQuery(request);
  const cache = readCache();

  if (key && cache[key]) {
    const cached = cache[key];

    // Cache records are stored as resolved base entries.
    // Only reuse directly when the requested quantity/basis matches.
    if (
      (+request.quantity || 1) === (+cached.quantity || 1) &&
      normalizeUnit(request.unit) === normalizeUnit(cached.unit)
    ) {
      return {
        ...cached,
        confidence: cached.confidence || "cached",
      };
    }
  }

  // 3. Packaged/branded product search.
  //
  // Do not use Open Food Facts for restaurant menu items.
  const seemsRestaurant =
    request.kind === "restaurant" ||
    /chick fil a|culvers|mcdonald|wendys|taco bell|burger king|subway|chipotle|panda express|panera|chilis/i.test(
      [
        request.brand,
        request.name,
        request.query,
      ]
        .filter(Boolean)
        .join(" ")
    );

  if (!seemsRestaurant) {
    const off = await searchOpenFoodFacts(request);

    if (off) {
      if (key) {
        cache[key] = off;
        writeCache(cache);
      }

      return off;
    }
  }

  // 4. AI estimate only after deterministic sources fail.
  return sanitizeEstimate(request.fallback, request);
}

export async function resolveNutritionActions(actions = []) {
  const output = [];

  for (const action of actions) {
    if (!action || typeof action !== "object") continue;

    if (action.type !== "resolve_food") {
      output.push(action);
      continue;
    }

    const request = action.food || {};
    const resolved = await resolveFoodRequest(request);

    if (!resolved) {
      // Don't invent zero-calorie entries.
      continue;
    }

    output.push({
      type: "add_entry",
      entry: resolved,
    });
  }

  return output;
}

// Used before anything reaches the daily log.
export function sanitizeNutritionEntry(entry) {
  if (!entry || typeof entry !== "object") return null;

  const name = String(entry.name || "").trim();

  const calories = +entry.calories;
  const protein = +entry.protein;
  const carbs = +entry.carbs;
  const fat = +entry.fat;

  if (!name) return null;

  if (
    ![calories, protein, carbs, fat].every(
      n => Number.isFinite(n) && n >= 0
    )
  ) {
    return null;
  }

  return {
    ...entry,
    name,
    calories,
    protein,
    carbs,
    fat,
  };
}