export default async function handler(req, res) {
  try {
    const { series = "BDI", d1 } = req.query;
    const key = process.env.VITE_TRADINGECONOMICS_KEY;
    if (!key) return res.status(500).json({ error: "Missing TE key" });
    const base = "https://api.tradingeconomics.com";
    const from = d1 || new Date(Date.now()-86400000*30).toISOString().slice(0,10);
    const url = `${base}/historical/series/${series}?c=${key}&output=json&d1=${from}`;
    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
