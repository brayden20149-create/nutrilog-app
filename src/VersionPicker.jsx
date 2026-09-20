import {switchVersion} from "./appVersions.js";
export default function VersionPicker({current="current",theme}) {
  return <div style={{marginBottom:16,paddingBottom:12,borderBottom:`1px solid ${theme.border}`}}>
    <label style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,fontSize:13,color:theme.text}}>
      App version
      <select aria-label="App version" value={current} onChange={e=>switchVersion(e.target.value)}
        style={{fontSize:16,padding:6,maxWidth:"65%",background:theme.bg,color:theme.text,border:`1px solid ${theme.border}`,borderRadius:6}}>
        <option value="current">Current · 1.10.3</option>
        <option value="1.10.0">1.10.0</option>
        <option value="1.9.2">1.9.2</option>
      </select>
    </label>
    <p style={{fontSize:12,color:theme.muted,lineHeight:1.5,marginTop:8}}>Older versions start with a copy of your current data. Changes stay in that version. Switch back here to return to your current logs. AI uses the current service.</p>
  </div>;
}
