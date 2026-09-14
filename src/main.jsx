import React from "react";
import {createRoot} from "react-dom/client";
import {resolveVersion,switchVersion} from "./appVersions.js";

const style = document.createElement("style");
style.textContent = `
 html, body, #root {height:100%;margin:0;padding:0;background:#0b0f0b;}
 * {-webkit-tap-highlight-color:transparent;}
`;
document.head.appendChild(style);
const requested = new URL(window.location.href).searchParams.get("version");
let saved;
try {saved=window.localStorage.getItem("nl_app_version");} catch {}
const version=resolveVersion(requested ?? saved);
const loaders={
 current:()=>import("./App.jsx"),
 "1.10.0":()=>import("./versions/1.10.0/App.jsx"),
 "1.9.2":()=>import("./versions/1.9.2/App.jsx")
};
const root=createRoot(document.getElementById("root"));
root.render(<p style={{color:"#eaf5ea",fontFamily:"system-ui",padding:24}}>Opening NutriLog…</p>);
loaders[version]().then(({default:App})=>{
 root.render(<React.StrictMode><App/></React.StrictMode>);
}).catch(()=>{
 root.render(<div style={{color:"#eaf5ea",fontFamily:"system-ui",padding:24}}>
  <p>Could not open this version. Your current logs have not been replaced.</p>
  <button onClick={()=>switchVersion("current")} style={{marginTop:16,padding:12}}>Return to current version</button>
 </div>);
});
