export const APP_VERSIONS = ["current", "1.10.0", "1.9.2"];
export function resolveVersion(value) {
  return APP_VERSIONS.includes(value) ? value : "current";
}
export function createVersionStorage(version, storage = window.localStorage) {
  if (!APP_VERSIONS.includes(version) || version === "current") throw new Error("Unsupported archived version");
  const prefix = "nl_archive_" + version + ":";
  const marker = prefix + "ready";
  if (storage.getItem(marker) !== "1") {
    const keys = Array.from({length:storage.length},(_,i)=>storage.key(i)).filter(k=>k?.startsWith("nl4_"));
    for (const key of keys) storage.setItem(prefix + key, storage.getItem(key));
    storage.setItem(marker,"1");
  }
  return {
    getItem:key=>storage.getItem(prefix + key),
    setItem:(key,value)=>storage.setItem(prefix + key,String(value)),
    removeItem:key=>storage.removeItem(prefix + key)
  };
}
export function switchVersion(version) {
  version = resolveVersion(version);
  try { window.localStorage.setItem("nl_app_version",version); } catch {}
  const url = new URL(window.location.href);
  if (version === "current") url.searchParams.delete("version");
  else url.searchParams.set("version",version);
  window.location.assign(url.href);
}
