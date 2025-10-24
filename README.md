# PANOCEAN × Freight Indices — Mini Dashboard

## 1) 설치
```bash
npm install
npm run dev
```

## 2) 실데이터 연결
- `src/App.jsx`의 `USE_MOCK = true`를 `false`로 변경
- 프로젝트 루트에 `.env` 파일을 만들고 아래 값 추가
```
VITE_FINNHUB_KEY=YOUR_KEY
VITE_TRADINGECONOMICS_KEY=YOUR_KEY
```
(필요시) `VITE_BALTICEX_API_KEY`, `VITE_FREIGHTOS_KEY`

## 3) 빌드 & 배포
```bash
npm run build
npm run preview
```
Vercel/Netlify에 `dist/`를 배포하거나 리포지토리를 연결하면 자동 배포됩니다.


---

## 4) Vercel로 5분 배포
1. 이 리포지토리를 GitHub에 올립니다.
2. Vercel에서 **New Project** → 해당 리포지토리 연결
3. **Environment Variables**에 아래 키를 추가
   - `VITE_FINNHUB_KEY`
   - `VITE_TRADINGECONOMICS_KEY`
4. Deploy 클릭 → 완료 후 URL이 발급됩니다.

※ API 키가 없는 경우 `src/App.jsx`에서 `USE_MOCK=true`로 두고도 배포가 가능합니다.

## 5) Netlify 배포
- Git 연동 후 자동 빌드 (netlify.toml 포함)
- 환경변수 동일하게 설정
