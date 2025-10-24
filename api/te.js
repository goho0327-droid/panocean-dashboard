export default async function handler(req, res) {
  try {
    // 쿼리로 BDI/BCI/BPI/BSI 또는 완전한 심볼(BDI:IND 등)을 받음
    const raw = (req.query.series || "BDI").toUpperCase();

    // BDI/BCI/BPI/BSI -> TE 심볼 매핑
    const map = { BDI: "BDI:IND", BCI: "BCI:IND", BPI: "BPI:IND", BSI: "BSI:IND" };
    const series = map[raw] || raw; // 이미 :IND가 포함되어 있으면 그대로 사용

    const key = process.env.TRADINGECONOMICS_KEY; // ← VITE_ 제거
    if (!key) return res.status(500).json({ error: "Missing TRADINGECONOMICS_KEY" });

    // 최신값(마켓 인덱스) 가져오기
    const params = new URLSearchParams({ c: key, output: "json" }).toString();
    const url = `https://api.tradingeconomics.com/markets/index/${encodeURIComponent(series)}?${params}`;

    const r = await fetch(url);
    const data = await r.json();
    return res.status(r.ok ? 200 : 500).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
