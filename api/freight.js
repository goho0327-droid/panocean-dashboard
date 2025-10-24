export default async function handler(req, res) {
  const key = process.env.TRADINGECONOMICS_KEY;
  const url = `https://api.tradingeconomics.com/markets/index/BCI:IND,BPI:IND,BSI:IND,BDI:IND?c=${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch freight data' });
  }
}
