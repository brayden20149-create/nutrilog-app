// Vercel Serverless Function — runs on the server, NOT in the browser.
// The API key and every system prompt live here; the browser sends only which
// prompt it wants plus the conversation, so a caller cannot supply their own
// instructions and run this as a general-purpose Claude proxy on our bill.

import { buildSystem } from "./_lib/prompts.js";
import { checkPayload, clientIp, createRateLimiter, isAllowedOrigin } from "./_lib/guard.js";

const MODEL = "claude-sonnet-5-5";
// Sonnet 5.5 runs adaptive thinking when `thinking` is omitted, and thinking
// tokens come out of max_tokens — 1500 (the old cap, from a non-thinking model)
// would now truncate the JSON mid-object. Low effort keeps the spend near where
// it was while still letting it check its own macro arithmetic.
const MAX_TOKENS = 4000;
const EFFORT = "low";

const rateLimit = createRateLimiter({ max: 30, windowMs: 60000 });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const allow = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!isAllowedOrigin(req.headers, { allow })) {
    return res.status(403).json({ error: { message: "Forbidden" } });
  }

  const limit = rateLimit(clientIp(req.headers));
  if (!limit.ok) {
    res.setHeader("Retry-After", String(limit.retryAfter));
    return res.status(429).json({ error: { message: "Too many requests — give it a moment." } });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: "Server is missing ANTHROPIC_API_KEY" } });
  }

  try {
    const { prompt, system: legacySystem, messages, useSearch, aiStyle } = req.body ?? {};

    const bad = checkPayload({ messages, legacySystem });
    if (bad) return res.status(400).json({ error: { message: bad } });

    // Archived builds under src/versions/* are frozen and still post their own
    // system string, so that path stays supported — behind the same origin check.
    const system = buildSystem({ prompt, aiStyle, useSearch }) ?? legacySystem;
    if (!system) return res.status(400).json({ error: { message: "Unknown prompt" } });

    const tools = useSearch
      ? [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }]
      : undefined;

    // Claude may respond with a web_search tool call before its final answer.
    // The API executes the search server-side and returns results as a
    // tool_result block automatically — we just need to keep sending the
    // conversation back until we get a turn with no pending tool_use.
    let convo = [...messages];
    let data = null;
    const MAX_ROUNDS = 4;

    for (let round = 0; round < MAX_ROUNDS; round++) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          output_config: { effort: EFFORT },
          system,
          messages: convo,
          ...(tools ? { tools } : {}),
        }),
      });

      data = await response.json();

      if (!response.ok) {
        return res
          .status(response.status)
          .json({ error: data?.error || { message: "API error" } });
      }

      // If Claude used the search tool itself, the server-executed results
      // already come back inside data.content as server_tool_use / web_search_tool_result
      // blocks, and stop_reason is "end_turn" once it's done searching+answering —
      // so in the normal case one round trip is enough. This loop only guards
      // against the rarer case of stop_reason "tool_use" needing us to continue.
      if (data.stop_reason !== "tool_use") break;

      convo = [...convo, { role: "assistant", content: data.content }];
    }

    return res.status(200).json(data);
  } catch (err) {
    return res
      .status(500)
      .json({ error: { message: err.message || "Unknown server error" } });
  }
}
