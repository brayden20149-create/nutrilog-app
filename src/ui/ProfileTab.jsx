import { useState } from "react";
import { suggestGoals } from "../stats.js";
import { T } from "../theme.js";
import { InfoDot } from "./primitives.jsx";
import { toDisplayWater, waterUnit, weightUnit } from "../units.js";

export const PF_FIELD = {
  background:T.card, border:`1px solid ${T.border}`, borderRadius:8,
  padding:"10px 12px", color:T.text, fontSize:16, outline:"none", width:"100%",
};
export const PF_LABEL = { fontSize:12, color:T.muted, marginBottom:5 };
export const PfSection = ({title, children}) => (
  <div style={{background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,
    padding:"14px",marginBottom:12}}>
    <div style={{fontSize:11,color:T.accent,letterSpacing:"0.12em",marginBottom:12}}>{title}</div>
    {children}
  </div>
);
export const PfPills = ({value, options, onPick}) => (
  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
    {options.map(o=>(
      <button key={o} onClick={()=>onPick(o)}
        style={{background:value===o?T.accent:T.card,color:value===o?"#0b0f0b":T.text,
          border:`1px solid ${value===o?T.accent:T.border}`,borderRadius:20,
          padding:"8px 13px",fontSize:13,cursor:"pointer",minHeight:38,
          WebkitTapHighlightColor:"transparent"}}>{o}</button>
    ))}
  </div>
);

export const ProfileTab = ({ profile, goals, onSave, onApplyGoals, units="imperial" }) => {
  const [p, setP] = useState({...profile});
  const set = (k,v) => setP(prev=>({...prev,[k]:v}));
  const [saved, setSaved] = useState(false);
  const suggestion = suggestGoals(p);
  const [g, setG] = useState({...goals});
  const setGoal = (k,v) => setG(prev=>({...prev,[k]:+v||0}));
  const [goalsSaved, setGoalsSaved] = useState(false);
  const saveGoalsLocal = () => { onApplyGoals(g); setGoalsSaved(true); setTimeout(()=>setGoalsSaved(false),1500); };

  const field = PF_FIELD;
  const label = PF_LABEL;

  const doSave = () => { onSave(p); setSaved(true); setTimeout(()=>setSaved(false),1800); };

  return (
    <div style={{flex:1,overflowY:"auto",padding:"12px 14px",WebkitOverflowScrolling:"touch"}}>
      <div style={{fontSize:11,color:T.accent,letterSpacing:"0.12em",marginBottom:4}}>YOUR PROFILE</div>
      <div style={{fontSize:12,color:T.muted,marginBottom:14}}>
        Used to personalize the coaches and food suggestions. Stored only on your device.
      </div>

      <PfSection title="ABOUT YOU">
        <div style={label}>Name (what the app calls you)</div>
        <input value={p.name} onChange={e=>set("name",e.target.value)}
          placeholder="e.g. Brayden" style={field}/>
      </PfSection>

      <PfSection title="BODY STATS">
        <div style={{display:"flex",gap:10,marginBottom:12}}>
          <div style={{flex:1}}>
            <div style={label}>Age</div>
            <input type="number" inputMode="numeric" value={p.age} onChange={e=>set("age",e.target.value)} style={field}/>
          </div>
          <div style={{flex:1}}>
            <div style={label}>Weight ({weightUnit(units)})</div>
            <input type="number" inputMode="numeric" value={p.weight} onChange={e=>set("weight",e.target.value)} style={field}/>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <div style={label}>Height</div>
          <div style={{display:"flex",gap:10}}>
            <input type="number" inputMode="numeric" placeholder="ft" value={p.heightFt} onChange={e=>set("heightFt",e.target.value)} style={field}/>
            <input type="number" inputMode="numeric" placeholder="in" value={p.heightIn} onChange={e=>set("heightIn",e.target.value)} style={field}/>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <div style={label}>Wingspan (inches, optional — helps the coach with lift mechanics)
            <InfoDot title="Why wingspan?">
              Your arm span affects lift mechanics. Longer arms mean the bar travels
              farther on presses and pulls (a longer range of motion), which can make
              bench and deadlift feel harder and may favor certain grip widths or stances.
              <br/><br/>
              Measure fingertip-to-fingertip with arms stretched out wide, in inches.
              The coach uses it to tailor form cues — it's optional.
            </InfoDot>
          </div>
          <input type="number" inputMode="numeric" value={p.wingspanIn} onChange={e=>set("wingspanIn",e.target.value)}
            placeholder="e.g. 72" style={field}/>
        </div>
        <div style={label}>Sex (for calorie math)</div>
        <PfPills value={p.sex} options={["Male","Female"]} onPick={v=>set("sex",v)}/>
      </PfSection>

      <PfSection title="TRAINING">
        <div style={{marginBottom:12}}>
          <div style={label}>Experience</div>
          <PfPills value={p.experience} options={["Beginner","Intermediate","Advanced"]} onPick={v=>set("experience",v)}/>
        </div>
        <div style={{marginBottom:12}}>
          <div style={label}>Days per week</div>
          <PfPills value={p.daysPerWeek} options={["1","2","3","4","5","6","7"]} onPick={v=>set("daysPerWeek",v)}/>
        </div>
        <div>
          <div style={label}>Main training goal</div>
          <PfPills value={p.trainingGoal} options={["Strength","Hypertrophy","Endurance","General fitness"]} onPick={v=>set("trainingGoal",v)}/>
        </div>
      </PfSection>

      <PfSection title="GOAL">
        <div style={{marginBottom:12}}>
          <div style={label}>Direction</div>
          <PfPills value={p.goalType} options={["Cut","Maintain","Bulk"]} onPick={v=>set("goalType",v)}/>
        </div>
        <div>
          <div style={label}>Target weight (lbs, optional)</div>
          <input type="number" inputMode="numeric" value={p.targetWeight} onChange={e=>set("targetWeight",e.target.value)} style={field}/>
        </div>
      </PfSection>

      <PfSection title="DIET">
        <div style={{marginBottom:12}}>
          <div style={label}>Preferences (e.g. high protein, vegetarian)</div>
          <input value={p.dietPrefs} onChange={e=>set("dietPrefs",e.target.value)} style={field} placeholder="optional"/>
        </div>
        <div style={{marginBottom:12}}>
          <div style={label}>Allergies</div>
          <input value={p.allergies} onChange={e=>set("allergies",e.target.value)} style={field} placeholder="e.g. peanuts, shellfish"/>
        </div>
        <div>
          <div style={label}>Restrictions (e.g. no pork, gluten-free)</div>
          <input value={p.restrictions} onChange={e=>set("restrictions",e.target.value)} style={field} placeholder="optional"/>
        </div>
      </PfSection>

      {/* Suggested goals */}
      {suggestion && (
        <div style={{background:T.surface,borderRadius:14,border:`1px solid ${T.accent}55`,
          padding:"14px",marginBottom:12}}>
          <div style={{fontSize:11,color:T.accent,letterSpacing:"0.12em",marginBottom:10}}>
            SUGGESTED DAILY GOALS
            <InfoDot title="How these are estimated">
              We estimate the calories your body burns daily using the Mifflin–St Jeor
              equation (a standard formula based on your age, sex, height, and weight),
              then adjust for how many days a week you train.
              <br/><br/>
              If your goal is Cut, we subtract ~500 cal for fat loss; Bulk adds ~350 for
              gaining. Protein is set near 1g per pound of bodyweight, fat around 25% of
              calories, and the rest goes to carbs.
              <br/><br/>
              These are a solid starting point, not medical advice — adjust based on how
              your body responds over a few weeks.
            </InfoDot>
          </div>
          <div style={{display:"flex",gap:16,marginBottom:12}}>
            {[[`${suggestion.calories}`,"cal",T.cal],[`${suggestion.protein}g`,"P",T.protein],
              [`${suggestion.carbs}g`,"C",T.carbs],[`${suggestion.fat}g`,"F",T.fat],
              [`${toDisplayWater(suggestion.water, units)}`,`${waterUnit(units)} water`,T.info]].map(([v,l,c])=>(
              <div key={l}>
                <span style={{fontSize:18,fontWeight:800,color:c}}>{v}</span>
                <span style={{fontSize:11,color:T.muted,marginLeft:2}}>{l}</span>
              </div>
            ))}
          </div>
          <div style={{fontSize:11,color:T.muted,marginBottom:10}}>
            Estimated from your stats. You can apply these or keep your current goals
            (cal {goals.calories}, P {goals.protein}, C {goals.carbs}, F {goals.fat}).
          </div>
          <button onClick={()=>{ onApplyGoals(suggestion); setG(suggestion); }}
            style={{width:"100%",background:T.accent,border:"none",color:"#0b0f0b",
              borderRadius:10,padding:"12px",fontWeight:700,fontSize:14,cursor:"pointer",
              minHeight:46,WebkitTapHighlightColor:"transparent"}}>
            Apply suggested goals
          </button>
        </div>
      )}

      {/* Editable daily goals */}
      <PfSection title={<>DAILY GOALS <InfoDot title="Macros explained">
        Your daily targets. "Macros" are the three nutrients that make up calories:
        <br/><br/>
        Protein (4 cal/g) — builds and repairs muscle; key when training.<br/>
        Carbs (4 cal/g) — your body's main energy source.<br/>
        Fat (9 cal/g) — hormones, vitamin absorption, long-lasting energy.
        <br/><br/>
        Calories are the total of all three. Hitting your protein target matters most
        for body composition; calories matter most for weight change.
      </InfoDot></>}>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          {[["calories","Calories",T.cal],["protein","Protein (g)",T.protein],
            ["carbs","Carbs (g)",T.carbs],["fat","Fat (g)",T.fat]].map(([k,lbl,col])=>(
            <div key={k} style={{flex:1,minWidth:0}}>
              <div style={{fontSize:10,color:col,marginBottom:4,textAlign:"center"}}>{lbl}</div>
              <input type="number" inputMode="numeric" value={g[k]}
                onChange={e=>setGoal(k,e.target.value)}
                style={{...field,textAlign:"center",padding:"9px 4px",fontSize:15,fontWeight:700}}/>
            </div>
          ))}
        </div>
        {/* Water goal */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,color:T.info,marginBottom:4,display:"flex",alignItems:"center"}}>
            WATER GOAL ({waterUnit(units)})
            <InfoDot title="Water goal">
              How many ounces you're aiming to drink per day. A common guideline is
              roughly half to one ounce per pound of bodyweight, more if you train hard
              or it's hot. The suggested value below is based on your weight and how
              often you train — adjust to whatever feels right for you.
            </InfoDot>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="number" inputMode="numeric" value={g.water}
              onChange={e=>setGoal("water",e.target.value)}
              style={{...field,flex:1,minWidth:0,textAlign:"center",padding:"9px 4px",fontSize:15,fontWeight:700}}/>
            {suggestion && (
              <button onClick={()=>setG(prev=>({...prev,water:suggestion.water}))}
                style={{background:T.info+"22",border:`1px solid ${T.info}66`,color:T.info,
                  borderRadius:8,padding:"9px 12px",fontSize:12,fontWeight:600,cursor:"pointer",
                  whiteSpace:"nowrap",minHeight:42,WebkitTapHighlightColor:"transparent"}}>
                Use {toDisplayWater(suggestion.water, units)}
              </button>
            )}
          </div>
        </div>
        <button onClick={saveGoalsLocal}
          style={{width:"100%",background:goalsSaved?T.accent:T.gAccent,border:"none",color:"#0b0f0b",
            borderRadius:10,padding:"12px",fontWeight:700,fontSize:14,cursor:"pointer",
            minHeight:46,WebkitTapHighlightColor:"transparent"}}>
          {goalsSaved ? "✓ Goals saved" : "Save goals"}
        </button>
      </PfSection>

      <button onClick={doSave}
        style={{width:"100%",background:saved?T.accent:T.info,border:"none",color:"#0b0f0b",
          borderRadius:12,padding:"14px",fontWeight:700,fontSize:15,cursor:"pointer",
          minHeight:52,WebkitTapHighlightColor:"transparent",marginBottom:8}}>
        {saved ? "✓ Saved" : "Save Profile"}
      </button>
      <div style={{height:"env(safe-area-inset-bottom,20px)"}}/>
    </div>
  );
};
