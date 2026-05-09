import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioItem } from '../hooks/useFinanceData';
import { RefreshCw, TrendingUp, TrendingDown, Coins, X } from 'lucide-react';

const COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' }
];

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
  const [prices, setPrices] = useState<Record<string, { price: number; change24h: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [selectedCoin, setSelectedCoin] = useState<typeof COINS[0] | null>(null);
  const [modalAction, setModalAction] = useState<'buy' | 'sell'>('buy');
  const [inputAmount, setInputAmount] = useState('');

  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const ids = COINS.map(c => c.id).join(',');
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=try&include_24hr_change=true`);
      const data = await res.json();
      
      const newPrices: Record<string, { price: number; change24h: number }> = {};
      COINS.forEach(coin => {
        if (data[coin.id]) {
          newPrices[coin.id] = {
            price: data[coin.id].try,
            change24h: data[coin.id].try_24h_change
          };
        }
      });
      setPrices(newPrices);
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
  }, []);

  const totalPortfolioValue = portfolio.reduce((acc, item) => {
    const currentPrice = prices[item.coinId]?.price || 0;
    return acc + (item.amount * currentPrice);
  }, 0);

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin || !inputAmount) return;
    
    const amountNum = parseFloat(inputAmount);
    const currentPrice = prices[selectedCoin.id]?.price || 0;

    if (modalAction === 'buy') {
      if (amountNum > totalBalance) {
        alert("Yetersiz bakiye! Ana bakiyenizden daha fazla alım yapamazsınız.");
        return;
      }
      onBuyCrypto(selectedCoin.id, selectedCoin.symbol, selectedCoin.name, currentPrice, amountNum);
    } else {
      const item = portfolio.find(p => p.coinId === selectedCoin.id);
      if (!item) return;
      
      // inputAmount is in COIN amount, but let's make it simpler: user enters TRY amount to sell
      // Wait, standard is selling by coin amount.
      // Let's do TRY amount for simplicity of UX.
      const amountOfCoinToSell = amountNum / currentPrice;
      if (amountOfCoinToSell > item.amount) {
        alert("Sahip olduğunuzdan daha fazla satamazsınız!");
        return;
      }
      onSellCrypto(selectedCoin.id, selectedCoin.name, amountOfCoinToSell, currentPrice);
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
        <button onClick={fetchPrices} disabled={isLoading} className="p-2 bg-secondary rounded-full hover:bg-border transition-colors">
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between col-span-1 md:col-span-2 shadow-sm">
          <div className="text-sm text-muted-foreground mb-2">Toplam Portföy Değeri</div>
          <div className="text-4xl font-bold mb-2">₺{totalPortfolioValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
          <div className="text-sm text-muted-foreground">Kullanılabilir Nakit (Ana Bakiye): ₺{totalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Varlıklarım */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Varlıklarım</h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {portfolio.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Henüz bir yatırımınız bulunmuyor.</div>
            ) : (
              <div className="divide-y divide-border">
                {portfolio.map(item => {
                  const currentPrice = prices[item.coinId]?.price || 0;
                  const totalValue = item.amount * currentPrice;
                  const profitLossPercent = currentPrice > 0 ? ((currentPrice - item.averageBuyPrice) / item.averageBuyPrice) * 100 : 0;
                  
                  return (
                    <div key={item.coinId} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                      <div>
                        <div className="font-bold">{item.symbol}</div>
                        <div className="text-xs text-muted-foreground">{item.amount.toFixed(6)} Adet</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₺{totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className={`text-xs font-medium ${profitLossPercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
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
              const priceStr = pData ? `₺${pData.price.toLocaleString('tr-TR')}` : 'Yükleniyor...';
              const isPositive = pData && pData.change24h >= 0;
              
              return (
                <div key={coin.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                      <Coins className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-bold">{coin.name}</div>
                      <div className="text-xs text-muted-foreground">{coin.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="font-bold">{priceStr}</div>
                    {pData && (
                      <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {Math.abs(pData.change24h).toFixed(2)}%
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => openModal(coin, 'buy')} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded hover:bg-primary hover:text-white transition-colors">Al</button>
                      <button onClick={() => openModal(coin, 'sell')} className="px-3 py-1 bg-secondary text-foreground text-xs font-bold rounded hover:bg-border transition-colors">Sat</button>
                    </div>
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
                  <div className="text-xl font-bold">₺{prices[selectedCoin.id]?.price.toLocaleString('tr-TR') || 0}</div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {modalAction === 'buy' ? 'Kaç TL\'lik almak istiyorsunuz?' : 'Kaç TL\'lik satmak istiyorsunuz?'}
                  </label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    value={inputAmount} 
                    onChange={e => setInputAmount(e.target.value)} 
                    placeholder="0.00" 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-lg" 
                  />
                  {modalAction === 'buy' && (
                    <div className="text-xs text-muted-foreground mt-1 text-right">Kullanılabilir Bakiye: ₺{totalBalance.toLocaleString('tr-TR')}</div>
                  )}
                  {modalAction === 'sell' && (
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      Sahip olduğunuz: {portfolio.find(p => p.coinId === selectedCoin.id)?.amount.toFixed(6) || 0} {selectedCoin.symbol} 
                      (₺{((portfolio.find(p => p.coinId === selectedCoin.id)?.amount || 0) * (prices[selectedCoin.id]?.price || 0)).toLocaleString('tr-TR', { maximumFractionDigits: 2 })})
                    </div>
                  )}
                </div>

                <button type="submit" className={`w-full py-3 mt-2 font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer ${modalAction === 'buy' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-rose-500 text-white hover:bg-rose-600'}`}>
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
