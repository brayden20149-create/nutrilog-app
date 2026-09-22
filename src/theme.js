export const T = {
  bg:"#0b0f0b", surface:"#121912", card:"#171f17", border:"#1e2d1e",
  accent:"#4ade80", accent2:"#22d3a5", text:"#eaf5ea", muted:"#5f7a5f",
  protein:"#4ade80", carbs:"#facc15", fat:"#fb923c", cal:"#f87171",
  warn:"#fbbf24", info:"#60a5fa", overlay:"#000000e0", ai:"#141f14",
  gAccent:"linear-gradient(135deg,#4ade80 0%,#22d3a5 100%)",
  gHeader:"linear-gradient(135deg,#10b981 0%,#4ade80 55%,#a3e635 100%)",
  glow:"0 0 16px",
};
export const T_DEFAULTS = {...T};

export const THEMES = [
  { id:"emerald", name:"Emerald (default)", bg:"#0b0f0b", surface:"#121912", card:"#171f17",
    border:"#1e2d1e", text:"#eaf5ea", muted:"#5f7a5f", accent:"#4ade80", accent2:"#22d3a5" },
  { id:"ocean", name:"Ocean", bg:"#080d14", surface:"#0e1722", card:"#13202e",
    border:"#1c2f42", text:"#e6f0fa", muted:"#5d7a8c", accent:"#38bdf8", accent2:"#22d3ee" },
  { id:"violet", name:"Violet", bg:"#0d0a14", surface:"#161222", card:"#1d172e",
    border:"#2c2342", text:"#efe9fa", muted:"#7a6da8", accent:"#a78bfa", accent2:"#c084fc" },
  { id:"sunset", name:"Sunset", bg:"#140b08", surface:"#22130e", card:"#2e1a13",
    border:"#422a1c", text:"#faeee6", muted:"#a8825d", accent:"#fb923c", accent2:"#f87171" },
  { id:"rose", name:"Rose", bg:"#140a0d", surface:"#221218", card:"#2e171f",
    border:"#42232d", text:"#fae9ef", muted:"#a86d7e", accent:"#fb7185", accent2:"#f472b6" },
  { id:"mono", name:"Slate", bg:"#0c0d0f", surface:"#15171a", card:"#1c1f23",
    border:"#2a2e34", text:"#eef1f5", muted:"#6b727d", accent:"#94a3b8", accent2:"#cbd5e1" },
  { id:"halloween", name:"Halloween 🎃", bg:"#0b0710", surface:"#16101f", card:"#1e1529",
    border:"#33203f", text:"#f7ecf7", muted:"#8a6f96", accent:"#ff7518", accent2:"#a855f7" },
];

export const applyTheme = (t) => {
  if (!t) { Object.assign(T, T_DEFAULTS); return; }
  const accent = t.accent || T_DEFAULTS.accent;
  const accent2 = t.accent2 || accent;
  Object.assign(T, {
    bg:     t.bg     || T_DEFAULTS.bg,
    surface:t.surface|| T_DEFAULTS.surface,
    card:   t.card   || T_DEFAULTS.card,
    border: t.border || T_DEFAULTS.border,
    text:   t.text   || T_DEFAULTS.text,
    muted:  t.muted  || T_DEFAULTS.muted,
    accent, accent2,
    ai:     t.surface ? t.card : T_DEFAULTS.ai,
    gAccent:`linear-gradient(135deg,${accent} 0%,${accent2} 100%)`,
    gHeader:`linear-gradient(135deg,${accent2} 0%,${accent} 55%,${accent} 100%)`,
  });
};
