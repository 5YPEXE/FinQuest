import { NextResponse } from 'next/server';

// TradingView Scanner API - Ücretsiz, güvenilir, sunucu tarafından çalışır
async function fetchTradingView(tickers: string[], market: string) {
  const res = await fetch(`https://scanner.tradingview.com/${market}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbols: { tickers, query: { types: [] } },
      columns: ['close', 'change', 'description']
    })
  });
  if (!res.ok) throw new Error(`TradingView ${market} failed: ${res.status}`);
  return res.json();
}

// Configuration
const BIST_TICKERS = [
  'BIST:THYAO', 'BIST:ASELS', 'BIST:EREGL', 'BIST:KCHOL', 'BIST:TUPRS',
  'BIST:GARAN', 'BIST:BIMAS', 'BIST:AKBNK', 'BIST:YKBNK', 'BIST:SASA',
  'BIST:FROTO', 'BIST:TTKOM', 'BIST:SAHOL', 'BIST:TOASO', 'BIST:PGSUS', 'BIST:SISE'
];

// Emtia: Altın/Gümüş -> cfd market, Petrol/Platin/Paladyum/Bakır -> futures market
const COMMODITY_CFD: Record<string, string> = { 'xau': 'TVC:GOLD', 'xag': 'TVC:SILVER' };
const COMMODITY_FUTURES: Record<string, string> = { 'brent': 'NYMEX:BZ1!', 'xpt': 'NYMEX:PL1!', 'xpd': 'NYMEX:PA1!', 'cop': 'COMEX:HG1!' };

const CRYPTO_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'TRXUSDT'];

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Tüm verileri paralel çek (5 istek aynı anda)
    const [bistRes, fxRes, cfdRes, futuresRes, binanceRes] = await Promise.allSettled([
      fetchTradingView(BIST_TICKERS, 'turkey'),
      fetchTradingView(['FX_IDC:USDTRY'], 'forex'),
      fetchTradingView(Object.values(COMMODITY_CFD), 'cfd'),
      fetchTradingView(Object.values(COMMODITY_FUTURES), 'futures'),
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(CRYPTO_SYMBOLS)}`).then(r => r.json())
    ]);

    // 1. USD/TRY Kuru
    let usdRate = 38.5;
    if (fxRes.status === 'fulfilled' && fxRes.value?.data?.[0]) {
      usdRate = fxRes.value.data[0].d[0] || 38.5;
    }

    // 2. BIST Hisseleri
    const bist: any[] = [];
    if (bistRes.status === 'fulfilled' && bistRes.value?.data) {
      for (const item of bistRes.value.data) {
        bist.push({
          symbol: item.s.replace('BIST:', ''),
          price: item.d[0] || 0,
          change: item.d[1] || 0
        });
      }
    }

    // 3. Emtialar (CFD + Futures birleştir)
    const commodities: any[] = [];
    const cfdTickerToId = Object.fromEntries(Object.entries(COMMODITY_CFD).map(([k, v]) => [v, k]));
    const futuresTickerToId = Object.fromEntries(Object.entries(COMMODITY_FUTURES).map(([k, v]) => [v, k]));

    if (cfdRes.status === 'fulfilled' && cfdRes.value?.data) {
      for (const item of cfdRes.value.data) {
        const id = cfdTickerToId[item.s];
        if (!id) continue;
        let priceUsd = item.d[0] || 0;
        // Ons -> Gram dönüşümü (Altın ve Gümüş ons fiyatı olarak gelir)
        if (id === 'xau' || id === 'xag') priceUsd = priceUsd / 31.1035;
        commodities.push({ id, priceUsd, priceTry: priceUsd * usdRate, change: item.d[1] || 0 });
      }
    }

    if (futuresRes.status === 'fulfilled' && futuresRes.value?.data) {
      for (const item of futuresRes.value.data) {
        const id = futuresTickerToId[item.s];
        if (!id) continue;
        let priceUsd = item.d[0] || 0;
        if (id === 'xpt' || id === 'xpd') priceUsd = priceUsd / 31.1035; // Ons -> Gram
        // Bakır: lb başına fiyat gelir, kg'ye çevir (1 lb = 0.453592 kg)
        if (id === 'cop') priceUsd = priceUsd / 0.453592;
        commodities.push({ id, priceUsd, priceTry: priceUsd * usdRate, change: item.d[1] || 0 });
      }
    }

    // 4. Kripto (Binance)
    const crypto: any[] = [];
    if (binanceRes.status === 'fulfilled' && Array.isArray(binanceRes.value)) {
      for (const c of binanceRes.value) {
        crypto.push({
          symbol: c.symbol.replace('USDT', ''),
          price: parseFloat(c.lastPrice) || 0,
          change: parseFloat(c.priceChangePercent) || 0
        });
      }
    }

    return NextResponse.json({
      status: 'success',
      usd_rate: usdRate,
      bist,
      commodities,
      crypto,
      timestamp: Date.now(),
      sources: {
        bist: bistRes.status === 'fulfilled' ? 'TradingView' : 'failed',
        fx: fxRes.status === 'fulfilled' ? 'TradingView' : 'failed',
        commodities_cfd: cfdRes.status === 'fulfilled' ? 'TradingView' : 'failed',
        commodities_futures: futuresRes.status === 'fulfilled' ? 'TradingView' : 'failed',
        crypto: binanceRes.status === 'fulfilled' ? 'Binance' : 'failed'
      }
    });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}
