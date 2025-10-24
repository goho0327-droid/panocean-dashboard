// PANOCEAN × Freight Indices — Mini Dashboard (single-file React)
import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const USE_MOCK = False; // 실데이터 연결 시 false로 변경
const FREIGHT_PROVIDER = USE_MOCK ? "MOCK" : "TRADINGECONOMICS";
const EQUITY_PROVIDER = USE_MOCK ? "MOCK" : "FINNHUB";
const NEWS_PROVIDER = USE_MOCK ? "MOCK" : "FINNHUB";
const PANOCEAN_YF = "028670.KS";

const fmtNumber = (n) => (n == null ? "-" : n.toLocaleString());
const fmtPct = (n) => (n == null ? "-" : `${n.toFixed(2)}%`);
const fmtTime = (ts) => new Date(ts).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

async function apiFetch(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: { "Content-Type": "application/json", ...(opts.headers || {}) } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Mock data
const mockFreight = [
  { code: "BDI", name: "Baltic Dry Index", unit: "pts", series: Array.from({ length: 30 }).map((_, i) => ({ t: Date.now() - (29 - i) * 86400000, v: 1600 + Math.round(Math.sin(i / 5) * 150) })) },
  { code: "BPI", name: "Panamax Index", unit: "pts", series: Array.from({ length: 30 }).map((_, i) => ({ t: Date.now() - (29 - i) * 86400000, v: 1700 + Math.round(Math.cos(i / 7) * 120) })) },
  { code: "BSI", name: "Supramax Index", unit: "pts", series: Array.from({ length: 30 }).map((_, i) => ({ t: Date.now() - (29 - i) * 86400000, v: 1200 + Math.round(Math.sin(i / 6) * 90) })) },
  { code: "BCI", name: "Capesize Index", unit: "pts", series: Array.from({ length: 30 }).map((_, i) => ({ t: Date.now() - (29 - i) * 86400000, v: 2200 + Math.round(Math.cos(i / 4) * 200) })) },
];

const mockQuote = { symbol: PANOCEAN_YF, price: 3990, change: 200, percent: 5.28, ts: Date.now() };
const mockNews = [
  { id: "n1", title: "팬오션, 벌크·LNG 선대 다변화로 수익성 개선 기대", url: "https://example.com/1", source: "Example News", ts: Date.now() - 3600e3 },
  { id: "n2", title: "BDI 반등, 건화물 운임 회복 시그널", url: "https://example.com/2", source: "Shipping Daily", ts: Date.now() - 7200e3 },
];
const mockFleet = [
  { label: "Dry‑Bulk", value: 230 },
  { label: "LNG", value: 11 },
  { label: "Container", value: 11 },
  { label: "Tanker (VLCC/MR/Chem)", value: 21 },
  { label: "Heavy‑Lift", value: 2 },
];

async function fetchFreightSeries(codes = ["BDI", "BPI", "BSI", "BCI"]) {
  if (FREIGHT_PROVIDER === "MOCK") return mockFreight.filter((s) => codes.includes(s.code));
  if (FREIGHT_PROVIDER === "TRADINGECONOMICS") {
    const key = import.meta.env.VITE_TRADINGECONOMICS_KEY;
    const base = "https://api.tradingeconomics.com";
    const out = [];
    for (const code of codes) {
      try {
        const d1 = new Date(Date.now()-86400000*30).toISOString().slice(0,10);
        const hist = await apiFetch(`${base}/historical/series/${code}?c=${key}&output=json&d1=${d1}`);
        const series = (hist || []).map((row) => ({ t: new Date(row.DateTime || row.Date).getTime(), v: Number(row.Value) }));
        out.push({ code, name: code, unit: "pts", series });
      } catch (e) { console.warn("TE fetch fail", code, e); }
    }
    return out;
  }
  return [];
}

async function fetchEquityQuote(symbol = PANOCEAN_YF) {
  if (EQUITY_PROVIDER === "MOCK") return mockQuote;
  if (EQUITY_PROVIDER === "FINNHUB") {
    const key = import.meta.env.VITE_FINNHUB_KEY;
    const quote = await apiFetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`);
    return { symbol, price: quote.c, change: quote.d, percent: quote.dp, ts: (quote.t || 0) * 1000 };
  }
  return mockQuote;
}

async function fetchNews(symbol = PANOCEAN_YF) {
  if (NEWS_PROVIDER === "MOCK") return mockNews;
  if (NEWS_PROVIDER === "FINNHUB") {
    const key = import.meta.env.VITE_FINNHUB_KEY;
    const now = new Date();
    const d1 = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10);
    const d2 = now.toISOString().slice(0, 10);
    const items = await apiFetch(`https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${d1}&to=${d2}&token=${key}`);
    return (items || []).slice(0, 10).map((n) => ({ id: n.id?.toString() || n.url, title: n.headline, url: n.url, source: n.source, ts: (n.datetime || 0) * 1000 }));
  }
  return mockNews;
}

function Card({ children, className = "" }) {
  return (<div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>);
}
function Stat({ label, value, foot }) {
  return (
    <div className="flex flex-col">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {foot && <div className="mt-1 text-xs text-gray-400">{foot}</div>}
    </div>
  );
}
function Header() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">PANOCEAN × Freight Indices</h1>
        <p className="text-sm text-gray-500">실시간 해상운임지수 & 팬오션(028670.KS) 대시보드</p>
      </div>
      <div className="text-right text-xs text-gray-400">KST: {fmtTime(Date.now())}</div>
    </div>
  );
}

function FreightChart({ series }) {
  const data = useMemo(() => {
    const allTs = new Set();
    series.forEach((s) => s.series.forEach((p) => allTs.add(p.t)));
    const xs = Array.from(allTs).sort((a, b) => a - b).slice(-60);
    return xs.map((t) => {
      const row = { t };
      series.forEach((s) => {
        const found = s.series.find((p) => p.t === t);
        if (found) row[s.code] = found.v;
      });
      return row;
    });
  }, [series]);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="t" tickFormatter={(t) => new Date(t).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })} />
          <YAxis width={70} />
          <Tooltip labelFormatter={(t) => fmtTime(t)} formatter={(value, name) => [fmtNumber(value), name]} />
          {series.map((s) => (<Line key={s.code} type="monotone" dataKey={s.code} dot={false} strokeWidth={2} />))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function FleetList({ items }) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((it) => (
        <li key={it.label} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
          <span className="text-sm text-gray-600">{it.label}</span>
          <span className="text-base font-semibold">{fmtNumber(it.value)} 척</span>
        </li>
      ))}
    </ul>
  );
}
function NewsList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((n) => (
        <li key={n.id} className="group">
          <a href={n.url} target="_blank" rel="noreferrer" className="line-clamp-2 text-sm font-medium text-blue-700 group-hover:underline">
            {n.title}
          </a>
          <div className="text-xs text-gray-400">{n.source} · {fmtTime(n.ts)}</div>
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [freight, setFreight] = useState([]);
  const [quote, setQuote] = useState(null);
  const [news, setNews] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [fs, eq, ns] = await Promise.all([
          fetchFreightSeries(["BDI", "BPI", "BSI", "BCI"]),
          fetchEquityQuote(PANOCEAN_YF),
          fetchNews(PANOCEAN_YF),
        ]);
        if (!alive) return;
        setFreight(fs);
        setQuote(eq);
        setNews(ns);
        setFleet(mockFleet);
      } catch (e) {
        if (!alive) return;
        console.error(e);
        setError("데이터를 불러오지 못했습니다. 잠시 후 다시 시도하세요.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    const iv = setInterval(load, 60_000 * 5);
    return () => { alive = false; clearInterval(iv); };
  }, []);

  const latestRow = useMemo(() => {
    const out = {};
    freight.forEach((s) => {
      const last = s.series[s.series.length - 1];
      if (last) out[s.code] = last.v;
    });
    return out;
  }, [freight]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <Header />
      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><Stat label="BDI (pts)" value={fmtNumber(latestRow.BDI)} foot="Baltic Dry Index" /></Card>
        <Card><Stat label="BPI (pts)" value={fmtNumber(latestRow.BPI)} foot="Panamax Index" /></Card>
        <Card><Stat label="BSI (pts)" value={fmtNumber(latestRow.BSI)} foot="Supramax Index" /></Card>
        <Card><Stat label="BCI (pts)" value={fmtNumber(latestRow.BCI)} foot="Capesize Index" /></Card>
      </div>

      <Card>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="text-lg font-semibold">Freight Indices — 30일 추세</div>
          <div className="text-xs text-gray-400">Auto‑refresh 5분</div>
        </div>
        <FreightChart series={freight} />
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold">팬오션 (028670.KS)</div>
            {quote && (
              <div className="text-right">
                <div className="text-2xl font-bold">{fmtNumber(quote.price)} <span className="text-base">KRW</span></div>
                <div className={quote.change >= 0 ? "text-green-600" : "text-red-600"}>
                  {quote.change >= 0 ? "+" : ""}{fmtNumber(quote.change)} ({fmtPct(quote.percent)})
                </div>
                <div className="text-xs text-gray-400">{fmtTime(quote.ts)}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="bg-gray-50">
              <div className="mb-2 text-sm font-semibold">선대 요약</div>
              <FleetList items={fleet} />
            </Card>
            <Card className="bg-gray-50">
              <div className="mb-2 text-sm font-semibold">메모</div>
              <ul className="list-inside list-disc text-sm text-gray-600">
                <li>실시간 시세·뉴스는 제공사 약관을 준수하여 사용하세요.</li>
                <li>공식 해상운임 데이터(특히 Baltic)는 유료 API가 일반적입니다.</li>
                <li>상용 전환 시 서버 프록시를 통해 API 키를 안전하게 보관하세요.</li>
              </ul>
            </Card>
          </div>
        </Card>

        <Card>
          <div className="mb-3 text-lg font-semibold">최근 뉴스</div>
          <NewsList items={news} />
        </Card>
      </div>

      <footer className="pt-4 text-center text-xs text-gray-400">
        Built for 테스님 · Timezone: Asia/Seoul · Demo uses MOCK data
      </footer>
    </div>
  );
}
