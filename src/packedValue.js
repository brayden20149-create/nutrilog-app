// lz-string ships as CommonJS, so named ESM imports fail under Node; Vite's
// interop hides this, which makes the default import the portable form.
import LZString from "lz-string";
const { compressToUTF16, decompressFromUTF16 } = LZString;

// Values are stored LZ-compressed so the ~5MB localStorage quota holds far more
// history. The marker tells packed values apart from the plain JSON written by
// earlier versions, so existing data still reads back untouched.
export const MARK = "\u0001lz1\u0001";

export const pack = (s) => MARK + compressToUTF16(s);

export const unpack = (s) => {
  if (typeof s !== "string" || !s.startsWith(MARK)) return s;
  return decompressFromUTF16(s.slice(MARK.length)) || null;
};
