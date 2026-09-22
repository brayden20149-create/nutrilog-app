import { T } from "../theme.js";

export const Bubble = ({msg}) => {
  const isUser = msg.role==="user";
  const lines = (msg.content||"").split("\n").map(l=>l.trim()).filter(Boolean);
  const MODE_TAG = {
    food:    { label:"Food",    emoji:"🍴", color:T.cal },
    workout: { label:"Workout", emoji:"🏋️", color:T.info },
    meal:    { label:"Meal prep", emoji:"👨‍🍳", color:T.accent },
    general: { label:"NutriLog AI", emoji:"💬", color:T.muted },
  };
  const tag = !isUser ? (MODE_TAG[msg.mode]||MODE_TAG.general) : null;
  return (
    <div style={{display:"flex",flexDirection:"column",
      alignItems:isUser?"flex-end":"flex-start",marginBottom:14}}>
      {tag && (
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4,paddingLeft:4}}>
          <span style={{fontSize:11}}>{tag.emoji}</span>
          <span style={{fontSize:10,color:tag.color,fontWeight:700,letterSpacing:"0.08em",
            textTransform:"uppercase"}}>{tag.label}</span>
        </div>
      )}
      {msg.image && (
        <img src={msg.image} alt="meal"
          style={{maxWidth:"60%",borderRadius:14,marginBottom:6,
            border:`1px solid ${T.border}`}}/>
      )}
      <div style={{
        maxWidth:"82%",padding:"11px 15px",
        background:isUser?T.accent:T.ai,
        color:isUser?"#0b0f0b":T.text,
        borderRadius:isUser?"18px 18px 5px 18px":"18px 18px 18px 5px",
        border:isUser?"none":`1px solid ${T.border}`,
        fontSize:14,lineHeight:1.55,wordBreak:"break-word",
        whiteSpace:"pre-wrap",
      }}>
        {lines.length>1
          ? lines.map((l,i)=>(
              <div key={i} style={{marginBottom:i<lines.length-1?4:0}}>{l}</div>
            ))
          : msg.content}
      </div>
      {/* Source bubbles (branded/restaurant items only) */}
      {msg.sources && msg.sources.length>0 && (
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6,maxWidth:"82%"}}>
          {msg.sources.map((s,i)=>{
            let host = "source";
            try { host = new URL(s.url).hostname.replace(/^www\./,""); } catch {}
            return (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:5,
                  background:T.card,border:`1px solid ${T.border}`,borderRadius:99,
                  padding:"5px 11px",fontSize:11,color:T.info,textDecoration:"none",
                  maxWidth:"100%",WebkitTapHighlightColor:"transparent"}}>
                <span style={{fontSize:10}}>🔗</span>
                <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{host}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};
