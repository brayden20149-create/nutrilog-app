// api/chat.js
// Vercel Serverless Function — keeps the Anthropic key server-side.
// NutriLog can optionally enable Claude's server-side web search for nutrition
// resolution while retaining a no-search fallback if web search is disabled.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

async function sendAnthropic({ apiKey, model, system, messages, useWebSearch }) {
  const body = {
    model,
    max_tokens: 2400,
    system,
    messages,
  };

  if (useWebSearch) {
    body.tools = [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 4,
      },
    ];
  }

  return fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: { message: "Server is missing ANTHROPIC_API_KEY" },
    });
  }

  try {
    const { system, messages, webSearch = false } = req.body || {};

    if (typeof system !== "string" || !Array.isArray(messages)) {
      return res.status(400).json({
        error: { message: "Invalid chat request" },
      });
    }

    // Keep accidental giant payloads from becoming expensive or failing strangely.
    const approximateBytes = Buffer.byteLength(
      JSON.stringify({ system, messages }),
      "utf8"
    );

    if (approximateBytes > 2_500_000) {
      return res.status(413).json({
        error: { message: "Request is too large" },
      });
    }

    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
    const wantsWeb = webSearch === true;

    let response = await sendAnthropic({
      apiKey,
      model,
      system,
      messages,
      useWebSearch: wantsWeb,
    });

    let data = await response.json();

    // Some Anthropic organizations may have web search disabled.
    // In that case NutriLog still works: retry the exact request without the tool.
    if (!response.ok && wantsWeb && response.status === 400) {
      const msg = String(data?.error?.message || "").toLowerCase();

      const looksLikeWebToolProblem =
        msg.includes("web search") ||
        msg.includes("web_search") ||
        msg.includes("tool");

      if (looksLikeWebToolProblem) {
        response = await sendAnthropic({
          apiKey,
          model,
          system,
          messages,
          useWebSearch: false,
        });

        data = await response.json();
      }
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error || { message: "Anthropic API error" },
      });
    }

    // Avoid caching personalized chat responses at the edge/browser.
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: { message: err?.message || "Unknown server error" },
    });
  }
}