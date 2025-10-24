export default async function handler(req, res) {
  const key = process.env.FINNHUB_KEY;
  const symbol = "028670.KS";
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
}
