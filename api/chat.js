// Vercel Serverless Function — runs on the server, NOT in the browser.
// Your secret API key lives here as an environment variable and is never
// exposed to anyone using the app.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: { message: "Server is missing ANTHROPIC_API_KEY" } });
  }

  try {
    const { system, messages, useSearch } = req.body;

    const tools = useSearch
      ? [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }]
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
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
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
