// Simple pass-through proxy on Vercel Serverless to hide API keys & avoid CORS
export default async function handler(req, res) {
  try {
    const { target } = req.query;
    if (!target) return res.status(400).json({ error: "Missing 'target' query param" });
    const url = decodeURIComponent(target);

    const r = await fetch(url, {
      headers: { "Content-Type": "application/json" }
    });
    const contentType = r.headers.get("content-type") || "application/json";
    const data = contentType.includes("application/json") ? await r.json() : await r.text();
    res.setHeader("content-type", contentType);
    res.status(r.status).send(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
