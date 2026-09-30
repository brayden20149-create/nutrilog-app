// The system prompts are NOT here — they live in api/_lib/prompts.js and never
// reach the browser. Each call names the prompt it wants; the server owns the
// text. That keeps ~13KB out of every request and out of the client bundle, and
// means a caller cannot steer this endpoint with instructions of their own.

export async function fetchChat(body) {
  const ctrl = new AbortController();
  const timer = setTimeout(()=>ctrl.abort(), body?.useSearch ? 45000 : 30000);
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const e = await res.json().catch(()=>({}));
      throw new Error(e?.error?.message || "HTTP " + res.status);
    }
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") throw new Error("timed out — try again");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function estimateIngredients(ingredientNames) {
  const userText = "Ingredients:\n" + ingredientNames.map((n,i)=>`${i+1}. ${n}`).join("\n");

  const data = await fetchChat({ prompt: "ingredients", messages: [{ role:"user", content:userText }] });
  const raw = (data.content || []).map(b => b.text || "").join("").trim();
  const clean = raw.replace(/^```[\w]*\s*/,"").replace(/\s*```$/,"").trim();
  let arr;
  try { arr = JSON.parse(clean); }
  catch { const m = clean.match(/\[[\s\S]*\]/); arr = m ? JSON.parse(m[0]) : null; }
  if (!Array.isArray(arr)) throw new Error("Couldn't read the AI's response");
  // Safety net: if stated calories are wildly inconsistent with the macros
  // (off by >25%), trust the macro breakdown and recompute calories from it.
  return arr.map(it=>{
    const p=+it.protein||0, c=+it.carbs||0, f=+it.fat||0, cal=+it.calories||0;
    const fromMacros = Math.round(p*4 + c*4 + f*9);
    if (fromMacros>0 && (cal===0 || Math.abs(cal-fromMacros)/fromMacros > 0.25)) {
      return { ...it, calories:fromMacros, protein:p, carbs:c, fat:f };
    }
    return { ...it, calories:cal, protein:p, carbs:c, fat:f };
  });
}

// ── Unified assistant: one brain that detects intent and handles food, workouts,
// meal preps, and general questions in a single thread. Returns a `mode` tag.
export async function callAssistant(messages, aiStyle, useSearch=false) {
  const data = await fetchChat({ prompt: "assistant", messages, useSearch, aiStyle });
  const raw = (data.content || []).map(b => b.text || "").join("").trim();
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch {}
  if (!parsed) { const s = raw.replace(/^```[\w]*\s*/,"").replace(/\s*```$/,"").trim(); try { parsed = JSON.parse(s); } catch {} }
  if (!parsed) { const m = raw.match(/\{[\s\S]*\}/); if (m) { try { parsed = JSON.parse(m[0]); } catch {} } }
  if (!parsed) parsed = { message: raw.length>0 ? raw.slice(0,400) : "Something went wrong. Please try again.", actions: [] };
  if (!parsed.mode) parsed.mode = "general";
  if (!Array.isArray(parsed.actions)) parsed.actions = [];
  return parsed;
}

export async function findMissingNutrients(entries, keys, useSearch) {
 const data=await fetchChat({prompt:"nutrients",messages:[{role:"user",content:JSON.stringify({keys,entries})}],useSearch});
 const raw=(data.content||[]).map(b=>b.text||"").join("").trim().replace(/^\`\`\`[\w]*\s*/,"").replace(/\s*\`\`\`$/,"");
 const parsed=JSON.parse(raw);
 if(!Array.isArray(parsed.entries)) throw new Error("No nutrient results received.");
 return parsed.entries;
}
