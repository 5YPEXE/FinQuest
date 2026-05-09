import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioItem } from '../hooks/useFinanceData';
import { RefreshCw, TrendingUp, TrendingDown, Coins, X, DollarSign } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', color: '#f59e0b' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', color: '#3b82f6' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', color: '#10b981' },
  { id: 'tether', symbol: 'USDT', name: 'Tether', color: '#22c55e' },
  { id: 'ripple', symbol: 'XRP', name: 'Ripple', color: '#0ea5e9' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', color: '#6366f1' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', color: '#eab308' },
];

// Helper to generate a realistic looking fake 7-day sparkline ending at current price
const generateMockSparkline = (currentPrice: number, volatility: number = 0.05) => {
  const data = [];
  let price = currentPrice * (1 - volatility); // start a bit off
  for (let i = 0; i < 20; i++) {
    price = price * (1 + (Math.random() - 0.5) * volatility);
    data.push({ value: price });
  }
  data.push({ value: currentPrice }); // end exactly at current price
  return data;
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
  const [prices, setPrices] = useState<Record<string, { try: number; usd: number; change24h: number }>>({});
  const [sparklines, setSparklines] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState<'try' | 'usd'>('try');
  
  // Modal State
  const [selectedCoin, setSelectedCoin] = useState<typeof COINS[0] | null>(null);
  const [modalAction, setModalAction] = useState<'buy' | 'sell'>('buy');
  const [inputAmount, setInputAmount] = useState('');

  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const ids = COINS.map(c => c.id).join(',');
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=try,usd&include_24hr_change=true`);
      const data = await res.json();
      
      const newPrices: Record<string, { try: number; usd: number; change24h: number }> = {};
      const newSparklines: Record<string, any[]> = {};

      COINS.forEach(coin => {
        if (data[coin.id]) {
          newPrices[coin.id] = {
            try: data[coin.id].try,
            usd: data[coin.id].usd,
            change24h: data[coin.id].usd_24h_change || 0
          };
          
          // Generate a smooth random graph once per load for demo purposes
          if (!sparklines[coin.id]) {
            newSparklines[coin.id] = generateMockSparkline(data[coin.id][currency], 0.08);
          }
        }
      });
      setPrices(newPrices);
      if (Object.keys(newSparklines).length > 0) {
        setSparklines(prev => ({ ...prev, ...newSparklines }));
      }
    } catch (error) {
      console.error("Fiyatlar çekilemedi", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // 1 dk
    return () => clearInterval(interval);
  }, [currency]); // Re-fetch or regenerate when currency changes? No, prices are both fetched.

  const currencySymbol = currency === 'try' ? '₺' : '$';
  const getPrice = (id: string) => prices[id]?.[currency] || 0;

  const totalPortfolioValue = portfolio.reduce((acc, item) => {
    return acc + (item.amount * getPrice(item.coinId));
  }, 0);

  // Approximate USD balance (1 USD = 32 TRY mockup fallback if not exact)
  const usdRate = prices['tether']?.try || 32.5;
  const displayBalance = currency === 'try' ? totalBalance : totalBalance / usdRate;

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin || !inputAmount) return;
    
    // Alımlar her zaman ana bakiyeden (TL) düşer. Kullanıcı USD girerse TL'ye çevirip o kadar düşeceğiz.
    const amountNum = parseFloat(inputAmount);
    let amountInTry = amountNum;
    
    if (currency === 'usd') {
      amountInTry = amountNum * usdRate;
    }

    const currentPriceTry = prices[selectedCoin.id]?.try || 0;

    if (modalAction === 'buy') {
      if (amountInTry > totalBalance) {
        alert("Yetersiz bakiye! Ana bakiyenizden daha fazla alım yapamazsınız.");
        return;
      }
      onBuyCrypto(selectedCoin.id, selectedCoin.symbol, selectedCoin.name, currentPriceTry, amountInTry);
    } else {
      const item = portfolio.find(p => p.coinId === selectedCoin.id);
      if (!item) return;
      
      const currentPrice = getPrice(selectedCoin.id);
      const amountOfCoinToSell = amountNum / currentPrice;
      
      if (amountOfCoinToSell > item.amount) {
        alert("Sahip olduğunuzdan daha fazla satamazsınız!");
        return;
      }
      onSellCrypto(selectedCoin.id, selectedCoin.name, amountOfCoinToSell, currentPriceTry);
    }

    setSelectedCoin(null);
    setInputAmount('');
  };

  const openModal = (coin: typeof COINS[0], action: 'buy' | 'sell') => {
    setSelectedCoin(coin);
    setModalAction(action);
    setInputAmount('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Portföyüm & Piyasalar</h2>
        <div className="flex items-center gap-2">
          <div className="bg-secondary p-1 rounded-xl flex items-center">
            <button 
              onClick={() => setCurrency('try')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currency === 'try' ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              TRY
            </button>
            <button 
              onClick={() => setCurrency('usd')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currency === 'usd' ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              USD
            </button>
          </div>
          <button onClick={fetchPrices} disabled={isLoading} className="p-2 bg-secondary rounded-xl hover:bg-border transition-colors">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Varlıklarım */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Varlıklarım</h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {portfolio.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Henüz bir yatırımınız bulunmuyor.</div>
            ) : (
              <div className="divide-y divide-border">
                {portfolio.map(item => {
                  const currentPrice = getPrice(item.coinId);
                  const totalValue = item.amount * currentPrice;
                  
                  // Profit calculation is tricky when switching currencies. We use TRY for profit calculation as base.
                  const currentPriceTry = prices[item.coinId]?.try || 0;
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

        {/* Piyasalar */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Piyasalar</h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {COINS.map(coin => {
              const pData = prices[coin.id];
              const priceVal = pData ? pData[currency] : 0;
              const priceStr = pData ? `${currencySymbol}${priceVal.toLocaleString(currency === 'try' ? 'tr-TR' : 'en-US', { maximumFractionDigits: currency === 'try' ? 2 : 4 })}` : 'Yükleniyor...';
              const isPositive = pData && pData.change24h >= 0;
              
              return (
                <div key={coin.id} className="p-4 grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: coin.color }}>
                      {coin.symbol[0]}
                    </div>
                    <div className="hidden sm:block">
                      <div className="font-bold">{coin.name}</div>
                      <div className="text-xs text-muted-foreground">{coin.symbol}</div>
                    </div>
                  </div>
                  
                  {/* Mini Chart */}
                  <div className="h-10 w-full px-2 max-w-[120px] hidden md:block">
                    {sparklines[coin.id] && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklines[coin.id]}>
                          <YAxis domain={['dataMin', 'dataMax']} hide />
                          <Line type="monotone" dataKey="value" stroke={isPositive ? '#10b981' : '#f43f5e'} strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <div className="font-bold">{priceStr}</div>
                    {pData && (
                      <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {Math.abs(pData.change24h).toFixed(2)}%
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <button onClick={() => openModal(coin, 'buy')} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded hover:bg-primary hover:text-white transition-colors">Al</button>
                    <button onClick={() => openModal(coin, 'sell')} className="px-3 py-1 bg-secondary text-foreground text-xs font-bold rounded hover:bg-border transition-colors">Sat</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Buy/Sell Modal */}
      <AnimatePresence>
        {selectedCoin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden"
            >
              <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/50">
                <h3 className="font-bold">{selectedCoin.name} {modalAction === 'buy' ? 'Al' : 'Sat'}</h3>
                <button onClick={() => setSelectedCoin(null)} className="p-1 hover:bg-border rounded-full transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAction} className="p-6 space-y-4">
                <div className="bg-secondary p-3 rounded-xl mb-4 text-center">
                  <div className="text-sm text-muted-foreground">Güncel Fiyat</div>
                  <div className="text-xl font-bold">{currencySymbol}{getPrice(selectedCoin.id).toLocaleString(currency === 'try' ? 'tr-TR' : 'en-US', { maximumFractionDigits: 4 })}</div>
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
                      Sahip olduğunuz: {portfolio.find(p => p.coinId === selectedCoin.id)?.amount.toFixed(6) || 0} {selectedCoin.symbol} 
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
    </motion.div>
  );
}
