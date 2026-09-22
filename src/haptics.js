export let HAPTICS_ON = true;
export const setHapticsOn = (v) => { HAPTICS_ON = v; };
export const haptic = (pattern=10) => { try { if (HAPTICS_ON) navigator.vibrate?.(pattern); } catch {} };
