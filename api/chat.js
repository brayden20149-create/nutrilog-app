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
    const { system, messages } = req.body;

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
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: data?.error || { message: "API error" } });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res
      .status(500)
      .json({ error: { message: err.message || "Unknown server error" } });
  }
}
