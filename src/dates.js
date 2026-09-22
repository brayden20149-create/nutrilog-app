export const localKey = (dt) => {
  const y = dt.getFullYear();
  const m = String(dt.getMonth()+1).padStart(2,"0");
  const d = String(dt.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
};
export const todayKey = () => localKey(new Date());
export const isToday  = d  => d === todayKey();
export const fmtDate  = d  => {
  const [,m,day] = d.split("-");
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]} ${+day}`;
};
export const fmtFull = d => {
  const dt = new Date(d+"T00:00:00");
  const wd = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dt.getDay()];
  const [y,m,day] = d.split("-");
  return `${wd}, ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]} ${+day}, ${y}`;
};
export const fmtTime = ts => new Date(ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

export const dayKeyFromDate = (dt) => localKey(dt);
export const weekStart = (dayKey) => {
  const d = new Date(dayKey + "T00:00:00");
  d.setDate(d.getDate() - d.getDay()); // back to Sunday
  return dayKeyFromDate(d);
};
export const addDays = (dayKey, n) => {
  const d = new Date(dayKey + "T00:00:00");
  d.setDate(d.getDate() + n);
  return dayKeyFromDate(d);
};
export const weekDays = (startKey) => Array.from({length:7}).map((_,i)=>addDays(startKey,i));
export const dowShort = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
export const dayNum = (dayKey) => +dayKey.split("-")[2];
