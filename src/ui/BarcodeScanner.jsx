import { useState, useEffect, useRef } from "react";
import { T } from "../theme.js";

export const BarcodeScanner = ({ onDetected, onClose }) => {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [err, setErr] = useState("");

  useEffect(()=>{
    let cancelled = false;
    let delivered = false;
    let reader = null;
    (async ()=>{
      try {
        const mod = await import("https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/+esm");
        if (cancelled) return;
        const { BrowserMultiFormatReader } = mod;
        reader = new BrowserMultiFormatReader();
        controlsRef.current = await reader.decodeFromVideoDevice(
          undefined, videoRef.current,
          (result, e) => {
            if (result && !cancelled && !delivered) {
              const text = result.getText();
              if (text) { delivered = true; onDetected(text); }
            }
          }
        );
      } catch (e) {
        if (!cancelled) setErr("Couldn't start the camera. Make sure camera access is allowed.");
      }
    })();
    return ()=>{
      cancelled = true;
      try { controlsRef.current?.stop?.(); } catch {}
      try { reader?.reset?.(); } catch {}
    };
  },[onDetected]);

  return (
    <div style={{position:"fixed",inset:0,background:"#000",zIndex:540,
      display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"env(safe-area-inset-top,16px) 16px 12px"}}>
        <span style={{color:"#fff",fontSize:16,fontWeight:700}}>Scan a barcode</span>
        <button onClick={onClose}
          style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",
            borderRadius:99,minWidth:40,minHeight:40,fontSize:18,cursor:"pointer",
            WebkitTapHighlightColor:"transparent"}}>✕</button>
      </div>
      <div style={{flex:1,position:"relative",overflow:"hidden"}}>
        <video ref={videoRef} playsInline muted
          style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        {/* Scan frame */}
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          width:"70%",height:120,border:`2px solid ${T.accent}`,borderRadius:12,
          boxShadow:"0 0 0 9999px rgba(0,0,0,0.45)"}}/>
        {err && (
          <div style={{position:"absolute",bottom:40,left:20,right:20,
            background:T.surface,border:`1px solid ${T.cal}66`,borderRadius:12,
            padding:14,color:T.text,fontSize:13,textAlign:"center"}}>{err}</div>
        )}
      </div>
      <div style={{padding:"14px 20px env(safe-area-inset-bottom,20px)",
        textAlign:"center",color:"#bbb",fontSize:12,background:"#000"}}>
        Point at a product barcode — it scans automatically.
      </div>
    </div>
  );
};
