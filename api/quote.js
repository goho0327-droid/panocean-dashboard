export default async function handler(req, res) {
  try {
    const { symbol = "028670.KS" } = req.query;
    const key = process.env.VITE_FINNHUB_KEY;
    if (!key) return res.status(500).json({ error: "Missing Finnhub key" });
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`;
    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
