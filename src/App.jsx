// --- 공통 유틸 ---
const getJSON = async (url) => {
  const r = await fetch(url);
  const text = await r.text();
  if (!r.ok) throw new Error(text || `HTTP ${r.status}`);
  try { return JSON.parse(text); } catch (e) { throw new Error(`Bad JSON: ${text}`); }
};

// --- 상태 ---
const [freight, setFreight]   = useState({ BDI: null, BCI: null, BPI: null, BSI: null });
const [quote, setQuote]       = useState({ price: null, changePct: null });
const [news, setNews]         = useState([]);
const [errBanner, setErrBanner] = useState(null);

useEffect(() => {
  let alive = true;
  (async () => {
    try {
      // 1) 운임지수 (Close -> Last -> Value 우선순위)
      const [bdi, bci, bpi, bsi] = await Promise.all([
        getJSON('/api/te?series=BDI:IND'),
        getJSON('/api/te?series=BCI:IND'),
        getJSON('/api/te?series=BPI:IND'),
        getJSON('/api/te?series=BSI:IND'),
      ]);
      const pick = (d) => d.value ?? d.raw?.Close ?? d.raw?.Last ?? d.raw?.Value ?? null;
      if (alive) setFreight({
        BDI: pick(bdi), BCI: pick(bci), BPI: pick(bpi), BSI: pick(bsi)
      });
    } catch (e) {
      if (alive) setErrBanner(`운임지수 불러오기 실패: ${e.message}`);
    }

    try {
      // 2) 팬오션 시세
      const q = await getJSON('/api/quote?symbol=028670.KS');
      if (alive) setQuote({
        price: q.price ?? q.raw?.c ?? null,
        changePct: q.changePct ?? ((q.raw?.c != null && q.raw?.pc) ? (q.raw.c - q.raw.pc) / q.raw.pc * 100 : null)
      });
    } catch (e) {
      if (alive) setErrBanner((p) => p ?? `주가 불러오기 실패: ${e.message}`);
    }

    try {
      // 3) 뉴스
      const n = await getJSON('/api/news?symbol=028670.KS');
      if (alive) setNews(Array.isArray(n) ? n : []);
    } catch (e) {
      if (alive) setErrBanner((p) => p ?? `뉴스 불러오기 실패: ${e.message}`);
    }
  })();
  return () => { alive = false; };
}, []);
