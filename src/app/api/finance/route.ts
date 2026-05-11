import { NextResponse } from 'next/server';

// Configuration
const BIST_SYMBOLS = ['THYAO.IS', 'ASELS.IS', 'EREGL.IS', 'KCHOL.IS', 'TUPRS.IS', 'GARAN.IS', 'SISE.IS', 'BIMAS.IS', 'AKBNK.IS', 'YKBNK.IS'];
const COMMODITY_YAHOO: Record<string, string> = { 'xau': 'GC=F', 'xag': 'SI=F', 'xpt': 'PL=F', 'xpd': 'PA=F', 'cop': 'HG=F', 'brent': 'BZ=F' };
const CRYPTO_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'TRXUSDT'];

export async function GET() {
  try {
    // 1. Fetch everything in parallel
    const [rateRes, yahooRes, binanceRes] = await Promise.allSettled([
      // USD/TRY Rate
      fetch('https://query1.finance.yahoo.com/v7/finance/quote?symbols=USDTRY=X', { next: { revalidate: 60 } }).then(r => r.json()),
      // BIST & Commodities combined (Yahoo allows multiple symbols)
      fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${BIST_SYMBOLS.join(',')},${Object.values(COMMODITY_YAHOO).join(',')}`, { next: { revalidate: 60 } }).then(r => r.json()),
      // Crypto from Binance
      fetch('https://api.binance.com/api/v3/ticker/24hr', { next: { revalidate: 30 } }).then(r => r.json())
    ]);

    // 2. Process USD/TRY
    let usdRate = 32.5;
    if (rateRes.status === 'fulfilled') {
      usdRate = rateRes.value.quoteResponse?.result?.[0]?.regularMarketPrice || 32.5;
    }

    // 3. Process Yahoo (BIST & Commodities)
    const yahooData = yahooRes.status === 'fulfilled' ? yahooRes.value.quoteResponse?.result : [];
    
    const bist = BIST_SYMBOLS.map(symbol => {
      const item = yahooData?.find((r: any) => r.symbol === symbol);
      return {
        symbol: symbol.replace('.IS', ''),
        price: item?.regularMarketPrice || 0,
        change: item?.regularMarketChangePercent || 0
      };
    });

    const commodities = Object.entries(COMMODITY_YAHOO).map(([id, symbol]) => {
      const item = yahooData?.find((r: any) => r.symbol === symbol);
      let price = item?.regularMarketPrice || 0;
      if (id === 'xau' || id === 'xag') price = price / 31.1035; // oz -> gram
      return {
        id,
        priceUsd: price,
        priceTry: price * usdRate,
        change: item?.regularMarketChangePercent || 0
      };
    });

    // 4. Process Binance (Crypto)
    const binanceData = binanceRes.status === 'fulfilled' ? binanceRes.value : [];
    const crypto = CRYPTO_SYMBOLS.map(symbol => {
      const item = binanceData?.find((r: any) => r.symbol === symbol);
      return {
        symbol: symbol.replace('USDT', ''),
        price: parseFloat(item?.lastPrice || '0'),
        change: parseFloat(item?.priceChangePercent || '0')
      };
    });

    return NextResponse.json({
      status: 'success',
      usd_rate: usdRate,
      bist,
      commodities,
      crypto,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to fetch data' }, { status: 500 });
  }
}
