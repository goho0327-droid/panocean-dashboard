export default async function handler(req, res) {
  const key = process.env.FINNHUB_KEY;
  const url = `https://finnhub.io/api/v1/news?category=general&token=${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data.slice(0, 5)); // 최신 뉴스 5개만
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}
