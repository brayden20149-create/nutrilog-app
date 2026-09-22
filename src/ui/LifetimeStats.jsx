import { useMemo } from "react";
import { fmtDate } from "../dates.js";
import { lifetimeStats } from "../lifetimeStats.js";
import { T } from "../theme.js";

const compact = (n) => {
  const v = Math.round(n || 0);
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
  if (Math.abs(v) >= 1e4) return (v / 1e3).toFixed(v >= 1e5 ? 0 : 1).replace(/\.0$/, "") + "k";
  return v.toLocaleString();
};

const Tile = ({ value, unit, label, tone }) => (
  <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:11,padding:"11px 12px"}}>
    <div style={{display:"flex",alignItems:"baseline",gap:3}}>
      <span style={{fontSize:21,fontWeight:800,color:tone||T.text,lineHeight:1.1}}>{value}</span>
      {unit && <span style={{fontSize:11,color:T.muted}}>{unit}</span>}
    </div>
    <div style={{fontSize:11,color:T.muted,marginTop:3,lineHeight:1.3}}>{label}</div>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{marginTop:16}}>
    <div style={{fontSize:10,color:T.muted,letterSpacing:"0.12em",marginBottom:8}}>{title}</div>
    {children}
  </div>
);

const grid = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 };

export const LifetimeStats = ({ days, workouts, goals, water, today }) => {
  const s = useMemo(() => lifetimeStats(days, workouts, goals, water, today),
    [days, workouts, goals, water, today]);

  if (!s.daysLogged && !s.workouts.sessions) return (
    <div style={{fontSize:13,color:T.muted,lineHeight:1.6,padding:"18px 2px"}}>
      Nothing logged yet. Once you have a few days in, this is where your all-time
      totals, goal streaks and recent-versus-lifetime comparison show up.
    </div>
  );

  const MACRO_TILES = [
    ["carbs", "g", "carbs ever counted", T.carbs],
    ["protein", "g", "protein ever logged", T.protein],
    ["fat", "g", "fat ever logged", T.fat],
  ];

  return (
    <div>
      <div style={{background:T.bg,border:`1px solid ${T.accent}44`,borderRadius:12,padding:"13px 14px"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:5}}>
          <span style={{fontSize:27,fontWeight:800,color:T.accent,lineHeight:1}}>{s.daysLogged}</span>
          <span style={{fontSize:13,color:T.text}}>days logged</span>
        </div>
        <div style={{fontSize:11,color:T.muted,marginTop:5}}>
          {s.firstDay ? `Since ${fmtDate(s.firstDay)} · ${s.entries.toLocaleString()} foods logged` : "No food logged yet"}
        </div>
      </div>

      <Section title="ALL TIME">
        <div style={grid}>
          <Tile value={compact(s.totals.calories)} unit="cal" label="eaten, all time" tone={T.cal}/>
          {MACRO_TILES.map(([k, unit, label, tone]) =>
            <Tile key={k} value={compact(s.totals[k])} unit={unit} label={label} tone={tone}/>)}
        </div>
      </Section>

      {s.recent.delta.calories !== null && (
        <Section title={`NOW VS ALL TIME · LAST ${s.recent.window} DAYS`}>
          {[["calories","cal"],["protein","g protein"],["carbs","g carbs"],["fat","g fat"]].map(([k, unit]) => {
            const d = s.recent.delta[k];
            const tone = d === null || d === 0 ? T.muted : d > 0 ? T.accent : T.info;
            return (
              <div key={k} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",
                borderBottom:`1px solid ${T.border}`}}>
                <span style={{flex:1,fontSize:12,color:T.text}}>
                  {s.recent.perDay[k].toLocaleString()} <span style={{color:T.muted}}>{unit}/day</span>
                </span>
                <span style={{fontSize:11,color:T.muted}}>all time {s.perDay[k].toLocaleString()}</span>
                <span style={{fontSize:12,fontWeight:700,color:tone,minWidth:48,textAlign:"right"}}>
                  {d === null ? "—" : `${d > 0 ? "+" : ""}${d}%`}
                </span>
              </div>
            );
          })}
          <div style={{fontSize:11,color:T.muted,marginTop:8,lineHeight:1.4}}>
            Your recent daily average against your lifetime daily average.
          </div>
        </Section>
      )}

      <Section title="GOALS HIT">
        <div style={grid}>
          <Tile value={s.totalGoalHits.toLocaleString()} label="goals hit, all time" tone={T.accent}/>
          <Tile value={Math.max(...Object.values(s.bestStreaks))} unit="days" label="longest goal streak"/>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:7}}>
          {Object.entries(s.goalHits).map(([cat, count]) => (
            <span key={cat} style={{fontSize:11,padding:"4px 8px",borderRadius:7,background:T.bg,
              border:`1px solid ${T.border}`,color:T.muted}}>
              {cat} <strong style={{color:T.text}}>{count}</strong>
              {s.bestStreaks[cat] > 1 && <span> · best {s.bestStreaks[cat]}d</span>}
            </span>
          ))}
        </div>
        <div style={{fontSize:11,color:T.muted,marginTop:8,lineHeight:1.4}}>
          Measured against your current goals — earlier goals are not kept, so changing a
          goal changes this history.
        </div>
      </Section>

      {(s.workouts.sessions > 0 || s.water.days > 0) && (
        <Section title="TRAINING & WATER">
          <div style={grid}>
            {s.workouts.sessions > 0 && <>
              <Tile value={s.workouts.sessions.toLocaleString()} label="workout sessions"/>
              <Tile value={compact(s.workouts.sets)} label="sets logged"/>
              <Tile value={compact(s.workouts.volume)} unit="lb·reps" label="total volume moved"/>
              <Tile value={s.workouts.exercises.toLocaleString()} label="different exercises"/>
            </>}
            {s.water.days > 0 &&
              <Tile value={compact(s.water.total)} unit="oz" label={`water over ${s.water.days} days`} tone={T.info}/>}
          </div>
        </Section>
      )}

      {s.bestDay && (
        <Section title="BIGGEST DAY">
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:11,padding:"11px 12px"}}>
            <div style={{fontSize:13,color:T.text}}>
              <strong style={{color:T.cal}}>{s.bestDay.calories.toLocaleString()}</strong> cal on {fmtDate(s.bestDay.day)}
            </div>
            <div style={{fontSize:11,color:T.muted,marginTop:4}}>
              {Math.round(s.bestDay.protein)}g protein · {Math.round(s.bestDay.carbs)}g carbs · {Math.round(s.bestDay.fat)}g fat
            </div>
          </div>
        </Section>
      )}
    </div>
  );
};
