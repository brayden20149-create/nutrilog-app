// Cheap protections for a public, keyless endpoint. None of this is real
// authentication — a static site has no secret it can keep — but it stops the
// endpoint being a free, unmetered Claude proxy for anyone who finds the URL.

/**
 * Same-origin only. A browser always sends Origin on a cross-origin POST, so
 * this rejects other sites and plain curl. It does NOT stop a forged header —
 * that needs a real credential.
 */
export function isAllowedOrigin(headers = {}, { allow = [] } = {}) {
  const host = headers.host;
  const source = headers.origin || headers.referer;
  if (!host || !source) return false;
  let sourceHost;
  try { sourceHost = new URL(source).host; } catch { return false; }
  return sourceHost === host || allow.includes(sourceHost);
}

/**
 * Best-effort per-IP throttle. Serverless instances are per-region and get
 * recycled, so this bounds a burst against one warm instance rather than
 * enforcing a global quota; a durable limit needs a shared store.
 */
export function createRateLimiter({ max = 30, windowMs = 60000, now = Date.now } = {}) {
  const hits = new Map();
  return function take(key) {
    const t = now();
    const recent = (hits.get(key) || []).filter(ts => t - ts < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return { ok: false, retryAfter: Math.max(1, Math.ceil((windowMs - (t - recent[0])) / 1000)) };
    }
    recent.push(t);
    hits.set(key, recent);
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (!v.some(ts => t - ts < windowMs)) hits.delete(k);
    }
    return { ok: true, remaining: max - recent.length };
  };
}

/** Bounds one request's cost. Returns an error string, or null when acceptable. */
export function checkPayload({ messages, legacySystem }, { maxMessages = 40, maxChars = 120000 } = {}) {
  if (!Array.isArray(messages) || messages.length === 0) return "messages must be a non-empty array";
  if (messages.length > maxMessages) return `too many messages (max ${maxMessages})`;
  if (legacySystem != null && typeof legacySystem !== "string") return "system must be a string";
  if (typeof legacySystem === "string" && legacySystem.length > 20000) return "system prompt too large";
  let chars = legacySystem?.length || 0;
  for (const m of messages) {
    if (!m || typeof m !== "object") return "malformed message";
    chars += typeof m.content === "string" ? m.content.length : JSON.stringify(m.content ?? "").length;
    if (chars > maxChars) return `request too large (max ${maxChars} characters)`;
  }
  return null;
}

export function clientIp(headers = {}) {
  const fwd = headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd) return fwd.split(",")[0].trim();
  return headers["x-real-ip"] || "unknown";
}
