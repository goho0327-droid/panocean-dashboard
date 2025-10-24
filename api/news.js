export default async function handler(req, res) {
  try {
    const { symbol = "028670.KS", from, to } = req.query;
    const key = process.env.VITE_FINNHUB_KEY;
    if (!key) return res.status(500).json({ error: "Missing Finnhub key" });
    const now = new Date();
    const d1 = from || new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10);
    const d2 = to || now.toISOString().slice(0, 10);
    const url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${d1}&to=${d2}&token=${key}`;
    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
