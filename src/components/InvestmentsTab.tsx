import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioItem } from '../hooks/useFinanceData';
import { RefreshCw, TrendingUp, TrendingDown, Search, X, Pickaxe, Building2, Coins, DollarSign, Bot } from 'lucide-react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import AIAnalyzerModal from './AIAnalyzerModal';

const MOCK_STOCKS = [
  { id: 'thyao', symbol: 'THYAO', name: 'Türk Hava Yolları', basePrice: 310, color: '#e11d48', imageUrl: 'https://www.google.com/s2/favicons?sz=128&domain=turkishairlines.com' },
  { id: 'asels', symbol: 'ASELS', name: 'Aselsan', basePrice: 60, color: '#0284c7', imageUrl: 'https://www.google.com/s2/favicons?sz=128&domain=aselsan.com.tr' },
  { id: 'garan', symbol: 'GARAN', name: 'Garanti BBVA', basePrice: 110, color: '#16a34a', imageUrl: 'https://www.google.com/s2/favicons?sz=128&domain=garantibbva.com.tr' },
  { id: 'sasa', symbol: 'SASA', name: 'Sasa Polyester', basePrice: 45, color: '#0f766e', imageUrl: 'https://www.google.com/s2/favicons?sz=128&domain=sasa.com.tr' },
  { id: 'tuprs', symbol: 'TUPRS', name: 'Tüpraş', basePrice: 180, color: '#b91c1c', imageUrl: 'https://www.google.com/s2/favicons?sz=128&domain=tupras.com.tr' },
  { id: 'kchol', symbol: 'KCHOL', name: 'Koç Holding', basePrice: 220, color: '#1d4ed8', imageUrl: 'https://www.google.com/s2/favicons?sz=128&domain=koc.com.tr' },
  { id: 'akbnk', symbol: 'AKBNK', name: 'Akbank', basePrice: 65, color: '#dc2626', imageUrl: 'https://www.google.com/s2/favicons?sz=128&domain=akbank.com' },
  { id: 'eregl', symbol: 'EREGL', name: 'Erdemir', basePrice: 50, color: '#475569', imageUrl: 'https://www.google.com/s2/favicons?sz=128&domain=erdemir.com.tr' },
  { id: 'froto', symbol: 'FROTO', name: 'Ford Otosan', basePrice: 1150, color: '#2563eb', imageUrl: 'https://www.google.com/s2/favicons?sz=128&domain=fordotosan.com.tr' },
  { id: 'bimas', symbol: 'BIMAS', name: 'BİM Mağazalar', basePrice: 400, color: '#ea580c', imageUrl: 'https://www.google.com/s2/favicons?sz=128&domain=bim.com.tr' },
  { id: 'ttkom', symbol: 'TTKOM', name: 'Türk Telekom', basePrice: 40, color: '#0284c7', imageUrl: 'https://www.google.com/s2/favicons?sz=128&domain=turktelekom.com.tr' },
  { id: 'sahol', symbol: 'SAHOL', name: 'Sabancı Holding', basePrice: 105, color: '#1e3a8a', imageUrl: 'https://www.google.com/s2/favicons?sz=128&domain=sabanci.com' },
  { id: 'toaso', symbol: 'TOASO', name: 'Tofaş', basePrice: 320, color: '#b91c1c', imageUrl: 'https://www.google.com/s2/favicons?sz=128&domain=tofas.com.tr' },
  { id: 'ykbnk', symbol: 'YKBNK', name: 'Yapı Kredi', basePrice: 35, color: '#0369a1', imageUrl: 'https://www.google.com/s2/favicons?sz=128&domain=yapikredi.com.tr' },
  { id: 'pgsus', symbol: 'PGSUS', name: 'Pegasus', basePrice: 1050, color: '#e11d48', imageUrl: 'https://www.google.com/s2/favicons?sz=128&domain=flypgs.com' }
];

const MOCK_COMMODITIES = [
  { id: 'xau', symbol: 'XAU/TRY', name: 'Gram Altın', basePrice: 2450, color: '#eab308', imageUrl: 'https://img.icons8.com/color/96/gold-bars.png' },
  { id: 'xag', symbol: 'XAG/TRY', name: 'Gümüş', basePrice: 32, color: '#94a3b8', imageUrl: 'https://img.icons8.com/color/96/silver-bars.png' },
  { id: 'xpt', symbol: 'XPT/TRY', name: 'Platin', basePrice: 1050, color: '#cbd5e1', imageUrl: 'https://img.icons8.com/color/96/diamond.png' },
  { id: 'xpd', symbol: 'XPD/TRY', name: 'Paladyum', basePrice: 1100, color: '#64748b', imageUrl: 'https://img.icons8.com/color/96/ring.png' },
  { id: 'cop', symbol: 'COPPER', name: 'Bakır', basePrice: 150, color: '#b45309', imageUrl: 'https://img.icons8.com/color/96/copper.png' },
  { id: 'brent', symbol: 'BRENT', name: 'Brent Petrol', basePrice: 2700, color: '#1e293b', imageUrl: 'https://img.icons8.com/color/96/oil-industry.png' }
];

// Helper to generate a realistic looking sparkline ending at current price (60 data points for better forecasting)
const generateMockSparkline = (currentPrice: number, volatility: number = 0.05) => {
  const data = [];
  let price = currentPrice * (1 - volatility * 1.5);
  for (let i = 0; i < 60; i++) {
    price = price * (1 + (Math.random() - 0.48) * volatility);
    data.push({ value: price });
  }
  data.push({ value: currentPrice });
  return data;
};

// Generates a random color for cryptos
const getRandomColor = () => {
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#22c55e', '#0ea5e9', '#6366f1', '#eab308', '#e11d48', '#8b5cf6', '#ec4899'];
  return colors[Math.floor(Math.random() * colors.length)];
};

type Asset = {
  id: string;
  symbol: string;
  name: string;
  priceUsd: number;
  priceTry: number;
  change24h: number;
  color: string;
  imageUrl?: string;
};

export default function InvestmentsTab({
  portfolio,
  onBuyCrypto,
  onSellCrypto,
  totalBalance
}: {
  portfolio: PortfolioItem[];
  onBuyCrypto: (id: string, symbol: string, name: string, price: number, amount: number) => void;
  onSellCrypto: (id: string, name: string, amountToSell: number, currentPrice: number) => boolean;
  totalBalance: number;
}) {
  const [cryptos, setCryptos] = useState<Asset[]>([]);
  const [stocks, setStocks] = useState<Asset[]>([]);
  const [commodities, setCommodities] = useState<Asset[]>([]);
  const [sparklines, setSparklines] = useState<Record<string, { value: number }[]>>({});
  const [usdRate, setUsdRate] = useState(32.5);
  
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState<'try' | 'usd'>('try');
  const [activeCategory, setActiveCategory] = useState<'crypto' | 'stocks' | 'commodities'>('crypto');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetToAnalyze, setAssetToAnalyze] = useState<Asset | null>(null);
  const [modalAction, setModalAction] = useState<'buy' | 'sell'>('buy');
  const [inputAmount, setInputAmount] = useState('');

  // Initial Data Fetch for Crypto & Base Prices
  const fetchInitialData = async () => {
    setIsLoading(true);
    const BASE_CRYPTOS = [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', b: 'BTCUSDT', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', b: 'ETHUSDT', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
      { id: 'solana', symbol: 'SOL', name: 'Solana', b: 'SOLUSDT', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
      { id: 'binancecoin', symbol: 'BNB', name: 'BNB', b: 'BNBUSDT', image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
      { id: 'ripple', symbol: 'XRP', name: 'XRP', b: 'XRPUSDT', image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
      { id: 'cardano', symbol: 'ADA', name: 'Cardano', b: 'ADAUSDT', image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' },
      { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', b: 'DOGEUSDT', image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
      { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', b: 'AVAXUSDT', image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png' },
      { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', b: 'DOTUSDT', image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png' },
      { id: 'tron', symbol: 'TRX', name: 'TRON', b: 'TRXUSDT', image: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png' }
    ];

    try {
      // 1. Fetch USD/TRY rate from Yahoo Finance (more reliable than CG)
      const rateRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://query1.finance.yahoo.com/v7/finance/quote?symbols=USDTRY=X')}`);
      const rateData = await rateRes.json();
      const rateParsed = JSON.parse(rateData.contents);
      currentUsdRate = rateParsed.quoteResponse?.result?.[0]?.regularMarketPrice || 32.5;
      setUsdRate(currentUsdRate);

      // 2. Fetch Prices from Binance
      const binanceRes = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      const binanceData = await binanceRes.json();

      const newCryptos = BASE_CRYPTOS.map(bc => {
        const bItem = binanceData.find((item: any) => item.symbol === bc.b);
        const priceUsd = parseFloat(bItem?.lastPrice || '0') || 0;
        const change = parseFloat(bItem?.priceChangePercent || '0') || 0;
        return {
          id: bc.id,
          symbol: bc.symbol,
          name: bc.name,
          priceUsd: priceUsd,
          priceTry: priceUsd * currentUsdRate,
          change24h: change,
          color: getRandomColor(),
          imageUrl: bc.image
        };
      });
      setCryptos(newCryptos);
      console.log("✅ Kripto verileri Binance'den çekildi.");
    } catch (error) {
      console.warn("Binance API hatası veya CORS. Mock veriler kullanılıyor.");
      const mockCryptos = [
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', priceUsd: 80700, priceTry: 80700 * currentUsdRate, change24h: -1.8, color: '#f7931a', imageUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', priceUsd: 2450, priceTry: 2450 * currentUsdRate, change24h: 1.2, color: '#627eea', imageUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
        { id: 'solana', symbol: 'SOL', name: 'Solana', priceUsd: 145, priceTry: 145 * currentUsdRate, change24h: 4.5, color: '#14f195', imageUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' }
      ];
      setCryptos(mockCryptos);
    }

      // 3. Initialize Sparklines for cryptos
      const newSparklines: Record<string, { value: number }[]> = {};
      newCryptos.forEach((c: Asset) => { newSparklines[c.id] = generateMockSparkline(c.priceTry, 0.1); });

      // 4 & 5. Fetch BIST Stocks and Commodities in parallel from Yahoo Finance
      const BIST_SYMBOLS = MOCK_STOCKS.map(s => `${s.symbol}.IS`).join(',');
      const COMMODITY_YAHOO: Record<string, string> = { 'xau': 'GC=F', 'xag': 'SI=F', 'xpt': 'PL=F', 'xpd': 'PA=F', 'cop': 'HG=F', 'brent': 'BZ=F' };
      const COMMODITY_SYMBOLS = Object.values(COMMODITY_YAHOO).join(',');

      const [bistPromise, cmdsPromise] = await Promise.allSettled([
        fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${BIST_SYMBOLS}`)}`, { signal: AbortSignal.timeout(15000) }).then(r => r.json()),
        fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${COMMODITY_SYMBOLS}`)}`, { signal: AbortSignal.timeout(15000) }).then(r => r.json())
      ]);

      let stocksFetched = false;
      if (bistPromise.status === 'fulfilled') {
        try {
          const parsed = JSON.parse(bistPromise.value.contents);
          if (parsed.quoteResponse?.result?.length > 0) {
            const results = parsed.quoteResponse.result;
            const liveStocks = MOCK_STOCKS.map(ms => {
              const yItem = results.find((r: any) => r.symbol === `${ms.symbol}.IS`);
              const priceTry = yItem?.regularMarketPrice || ms.basePrice;
              const change = yItem?.regularMarketChangePercent || ((Math.random() * 4) - 1.5);
              newSparklines[ms.id] = generateMockSparkline(priceTry, 0.05);
              return { ...ms, priceTry, priceUsd: priceTry / currentUsdRate, change24h: change };
            });
            setStocks(liveStocks);
            stocksFetched = true;
            console.log("✅ BIST verileri Yahoo Finance'den çekildi.");
          }
        } catch (e) { console.warn("Yahoo Finance BIST parse hatası.", e); }
      }

      if (!stocksFetched) {
        const initialStocks = MOCK_STOCKS.map(s => {
          newSparklines[s.id] = generateMockSparkline(s.basePrice, 0.05);
          return { ...s, priceTry: s.basePrice, priceUsd: s.basePrice / currentUsdRate, change24h: (Math.random() * 4) - 1.5 };
        });
        setStocks(initialStocks);
      }

      let cmdsFetched = false;
      if (cmdsPromise.status === 'fulfilled') {
        try {
          const cParsed = JSON.parse(cmdsPromise.value.contents);
          if (cParsed.quoteResponse?.result?.length > 0) {
            const cResults = cParsed.quoteResponse.result;
            const liveCmds = MOCK_COMMODITIES.map(mc => {
              const yahooSym = COMMODITY_YAHOO[mc.id];
              const cItem = cResults.find((r: any) => r.symbol === yahooSym);
              let priceUsd = cItem?.regularMarketPrice || mc.basePrice / currentUsdRate;
              if (mc.id === 'xau' || mc.id === 'xag') priceUsd = priceUsd / 31.1035; // oz -> gram
              const priceTry = priceUsd * currentUsdRate;
              const change = cItem?.regularMarketChangePercent || ((Math.random() * 2) - 0.5);
              newSparklines[mc.id] = generateMockSparkline(priceTry, 0.03);
              return { ...mc, priceTry, priceUsd, change24h: change };
            });
            setCommodities(liveCmds);
            cmdsFetched = true;
            console.log("✅ Emtia verileri Yahoo Finance'den çekildi.");
          }
        } catch (e) { console.warn("Yahoo Finance Emtia parse hatası.", e); }
      }

      if (!cmdsFetched) {
        const initialCmds = MOCK_COMMODITIES.map(c => {
          newSparklines[c.id] = generateMockSparkline(c.basePrice, 0.03);
          return { ...c, priceTry: c.basePrice, priceUsd: c.basePrice / currentUsdRate, change24h: (Math.random() * 2) - 0.5 };
        });
        setCommodities(initialCmds);
      }
      
      setSparklines(newSparklines);
    } catch (err) {
      console.warn("Veri işleme hatası:", err);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInitialData();
  }, []);

  // Stock Market Simulation Loop (Live Illusion)
  useEffect(() => {
    if (stocks.length === 0) return;
    const interval = setInterval(() => {
      setStocks(prev => prev.map(s => {
        const volatility = 0.002; // 0.2% tick change
        const change = 1 + ((Math.random() - 0.5) * volatility);
        const newPrice = s.priceTry * change;
        return { ...s, priceTry: newPrice, priceUsd: newPrice / usdRate };
      }));
      
      setCommodities(prev => prev.map(c => {
        const volatility = 0.0005; // very low volatility for metals
        const change = 1 + ((Math.random() - 0.5) * volatility);
        const newPrice = c.priceTry * change;
        return { ...c, priceTry: newPrice, priceUsd: newPrice / usdRate };
      }));
    }, 4000); // Update every 4 seconds

    return () => clearInterval(interval);
  }, [stocks.length, usdRate]);

  // Derived Values
  const currencySymbol = currency === 'try' ? '₺' : '$';
  const displayBalance = currency === 'try' ? totalBalance : totalBalance / usdRate;

  // Global Price Lookup Helper
  const getAssetPrice = (id: string, curr: 'try' | 'usd') => {
    const asset = [...cryptos, ...stocks, ...commodities].find(a => a.id === id);
    if (!asset) return 0;
    return curr === 'try' ? asset.priceTry : asset.priceUsd;
  };

  const totalPortfolioValue = portfolio.reduce((acc, item) => {
    return acc + (item.amount * getAssetPrice(item.coinId, currency));
  }, 0);

  // Active List Filtering
  const activeList = useMemo(() => {
    let list = cryptos;
    if (activeCategory === 'stocks') list = stocks;
    if (activeCategory === 'commodities') list = commodities;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q));
    }
    return list;
  }, [activeCategory, cryptos, stocks, commodities, searchQuery]);

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !inputAmount) return;
    
    const amountNum = parseFloat(inputAmount);
    let amountInTry = amountNum;
    if (currency === 'usd') amountInTry = amountNum * usdRate;

    const currentPriceTry = selectedAsset.priceTry;

    if (modalAction === 'buy') {
      if (amountInTry > totalBalance) {
        alert("Yetersiz bakiye! Ana bakiyenizden daha fazla alım yapamazsınız.");
        return;
      }
      onBuyCrypto(selectedAsset.id, selectedAsset.symbol, selectedAsset.name, currentPriceTry, amountInTry);
    } else {
      const item = portfolio.find(p => p.coinId === selectedAsset.id);
      if (!item) return;
      
      const currentPrice = getAssetPrice(selectedAsset.id, currency);
      const amountOfCoinToSell = amountNum / currentPrice;
      
      if (amountOfCoinToSell > item.amount) {
        alert("Sahip olduğunuzdan daha fazla satamazsınız!");
        return;
      }
      onSellCrypto(selectedAsset.id, selectedAsset.name, amountOfCoinToSell, currentPriceTry);
    }

    setSelectedAsset(null);
    setInputAmount('');
  };

  const openModal = (asset: Asset, action: 'buy' | 'sell') => {
    setSelectedAsset(asset);
    setModalAction(action);
    setInputAmount('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="pb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Portföyüm & Piyasalar</h2>
        <div className="flex items-center gap-2">
          <div className="bg-secondary p-1 rounded-xl flex items-center">
            <button onClick={() => setCurrency('try')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currency === 'try' ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>TRY</button>
            <button onClick={() => setCurrency('usd')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currency === 'usd' ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>USD</button>
          </div>
          <button onClick={fetchInitialData} disabled={isLoading} className="p-2 bg-secondary rounded-xl hover:bg-border transition-colors">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between col-span-1 md:col-span-2 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <DollarSign className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <div className="text-sm text-muted-foreground mb-2">Toplam Portföy Değeri</div>
            <div className="text-4xl font-bold mb-2">{currencySymbol}{totalPortfolioValue.toLocaleString(currency === 'try' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-sm text-muted-foreground">Kullanılabilir Nakit (Ana Bakiye): {currencySymbol}{displayBalance.toLocaleString(currency === 'try' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Varlıklarım (Sol Kolon) */}
        <div className="xl:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Sahip Olduklarım</h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden max-h-[600px] overflow-y-auto">
            {portfolio.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Henüz bir yatırımınız bulunmuyor. Piyasalardan varlık satın alın.</div>
            ) : (
              <div className="divide-y divide-border">
                {portfolio.map(item => {
                  const currentPrice = getAssetPrice(item.coinId, currency);
                  const totalValue = item.amount * currentPrice;
                  
                  const currentPriceTry = getAssetPrice(item.coinId, 'try');
                  const profitLossPercent = currentPriceTry > 0 ? ((currentPriceTry - item.averageBuyPrice) / item.averageBuyPrice) * 100 : 0;
                  
                  return (
                    <div key={item.coinId} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                      <div>
                        <div className="font-bold">{item.symbol}</div>
                        <div className="text-xs text-muted-foreground">{item.amount.toFixed(6)} Adet</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{currencySymbol}{totalValue.toLocaleString(currency === 'try' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className={`text-xs font-bold ${profitLossPercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Piyasalar (Sağ Kolon) */}
        <div className="xl:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Tüm Piyasalar</h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-[600px]">
            
            {/* Header & Tabs */}
            <div className="p-4 border-b border-border bg-secondary/30">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
                <div className="flex gap-2 w-full sm:w-auto bg-background p-1 rounded-xl">
                  <button onClick={() => setActiveCategory('crypto')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeCategory === 'crypto' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                    <Coins className="w-4 h-4" /> Kripto
                  </button>
                  <button onClick={() => setActiveCategory('stocks')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeCategory === 'stocks' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                    <Building2 className="w-4 h-4" /> BIST
                  </button>
                  <button onClick={() => setActiveCategory('commodities')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeCategory === 'commodities' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                    <Pickaxe className="w-4 h-4" /> Emtia
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder={`${activeCategory === 'crypto' ? 'Bitcoin, Ethereum' : activeCategory === 'stocks' ? 'THYAO, ASELS' : 'Altın, Gümüş'} ara...`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary transition-colors text-sm"
                />
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 divide-y divide-border">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">Piyasalar Yükleniyor...</div>
              ) : activeList.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">Sonuç bulunamadı.</div>
              ) : (
                activeList.map(asset => {
                  const priceVal = currency === 'try' ? asset.priceTry : asset.priceUsd;
                  const priceStr = `${currencySymbol}${priceVal.toLocaleString(currency === 'try' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: currency === 'try' ? 2 : 4 })}`;
                  const isPositive = asset.change24h >= 0;
                  
                  return (
                    <div key={asset.id} className="p-4 grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-3 w-32 md:w-48">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 relative overflow-hidden" style={{ backgroundColor: asset.color }}>
                          <span>{asset.symbol[0]}</span>
                          {asset.imageUrl && (
                            <img 
                              src={asset.imageUrl} 
                              alt={asset.symbol} 
                              className="w-full h-full object-contain absolute inset-0 bg-white p-1 rounded-full" 
                              onError={(e) => { e.currentTarget.style.opacity = '0'; }} 
                            />
                          )}
                        </div>
                        <div className="truncate">
                          <div className="font-bold truncate">{asset.symbol}</div>
                          <div className="text-xs text-muted-foreground truncate">{asset.name}</div>
                        </div>
                      </div>
                      
                      {/* Mini Chart */}
                      <div className="h-10 w-full px-2 max-w-[120px] hidden md:block opacity-60 hover:opacity-100 transition-opacity">
                        {sparklines[asset.id] && (
                          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <LineChart data={sparklines[asset.id]}>
                              <YAxis domain={['dataMin', 'dataMax']} hide />
                              <Line type="monotone" dataKey="value" stroke={isPositive ? '#10b981' : '#f43f5e'} strokeWidth={2} dot={false} isAnimationActive={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      <div className="text-right flex flex-col items-end w-24 md:w-32">
                        <div className="font-bold whitespace-nowrap">{priceStr}</div>
                        <div className={`flex items-center text-xs font-bold whitespace-nowrap ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {Math.abs(asset.change24h).toFixed(2)}%
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button onClick={() => setAssetToAnalyze(asset)} className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors" title="AI Analizi">
                          <Bot className="w-4 h-4" />
                        </button>
                        <button onClick={() => openModal(asset, 'buy')} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">Al</button>
                        <button onClick={() => openModal(asset, 'sell')} className="px-3 py-1.5 bg-secondary text-foreground text-xs font-bold rounded-lg hover:bg-border transition-colors">Sat</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buy/Sell Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden"
            >
              <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/50">
                <h3 className="font-bold">{selectedAsset.name} {modalAction === 'buy' ? 'Al' : 'Sat'}</h3>
                <button onClick={() => setSelectedAsset(null)} className="p-1 hover:bg-border rounded-full transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAction} className="p-6 space-y-4">
                <div className="bg-secondary p-3 rounded-xl mb-4 text-center">
                  <div className="text-sm text-muted-foreground">Güncel Fiyat</div>
                  <div className="text-xl font-bold text-primary">{currencySymbol}{getAssetPrice(selectedAsset.id, currency).toLocaleString(currency === 'try' ? 'tr-TR' : 'en-US', { maximumFractionDigits: 4 })}</div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {modalAction === 'buy' ? `Kaç ${currency.toUpperCase()}'lik almak istiyorsunuz?` : `Kaç ${currency.toUpperCase()}'lik satmak istiyorsunuz?`}
                  </label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    value={inputAmount} 
                    onChange={e => setInputAmount(e.target.value)} 
                    placeholder="0.00" 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-lg font-bold" 
                  />
                  {modalAction === 'buy' && (
                    <div className="text-xs text-muted-foreground mt-1 text-right">Kullanılabilir Bakiye: {currencySymbol}{displayBalance.toLocaleString(currency === 'try' ? 'tr-TR' : 'en-US', { maximumFractionDigits: 2 })}</div>
                  )}
                  {modalAction === 'sell' && (
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      Sahip olduğunuz: {portfolio.find(p => p.coinId === selectedAsset.id)?.amount.toFixed(6) || 0} {selectedAsset.symbol} 
                    </div>
                  )}
                </div>

                <button type="submit" className={`w-full py-3 mt-2 font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer ${modalAction === 'buy' ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20' : 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20'}`}>
                  {modalAction === 'buy' ? 'Alımı Onayla' : 'Satışı Onayla'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Analyzer Modal */}
      <AnimatePresence>
        {assetToAnalyze && (
          <AIAnalyzerModal 
            asset={{
              id: assetToAnalyze.id,
              name: assetToAnalyze.name,
              symbol: assetToAnalyze.symbol,
              currentPrice: currency === 'try' ? assetToAnalyze.priceTry : assetToAnalyze.priceUsd,
              currencySymbol: currencySymbol,
              change24h: assetToAnalyze.change24h,
              sparkline: sparklines[assetToAnalyze.id] || []
            }}
            onClose={() => setAssetToAnalyze(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
