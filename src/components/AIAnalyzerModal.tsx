"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, Activity, TrendingUp, TrendingDown, Clock, Loader2, Newspaper } from "lucide-react";

type AIAnalyzerModalProps = {
  asset: {
    id: string;
    name: string;
    symbol: string;
    priceTry: number;
    priceUsd: number;
    type?: 'crypto' | 'stock' | 'commodity'; // We'll infer this if not passed
  };
  onClose: () => void;
};

// Mock News Generators based on Asset Name/Type
const generateMockNews = (assetName: string, assetSymbol: string) => {
  const isCrypto = ['BTC', 'ETH', 'USDT', 'SOL'].includes(assetSymbol) || assetName.toLowerCase().includes('coin');
  const isBist = ['THYAO', 'ASELS', 'KCHOL', 'SASA', 'TUPRS'].includes(assetSymbol);
  
  if (isBist) {
    return [
      { id: 1, source: "KAP", time: "2 saat önce", title: `${assetName} 3. Çeyrek Bilanço Beklentileri Revize Edildi.` },
      { id: 2, source: "Bloomberg HT", time: "5 saat önce", title: `Yabancı fonların ${assetSymbol} hissesindeki alımları hızlandı.` },
      { id: 3, source: "KAP", time: "1 gün önce", title: `${assetName} yeni yatırım teşvik belgesi aldı.` },
    ];
  } else if (isCrypto) {
    return [
      { id: 1, source: "CoinDesk", time: "1 saat önce", title: `SEC'in son kararı sonrası ${assetName} işlem hacminde patlama yaşandı.` },
      { id: 2, source: "CoinTelegraph", time: "3 saat önce", title: `Kurumsal balinalar yüklü miktarda ${assetSymbol} transferi gerçekleştirdi.` },
      { id: 3, source: "Reuters", time: "12 saat önce", title: `Global piyasalardaki risk iştahı ${assetName} fiyatını destekliyor.` },
    ];
  } else {
    // Commodities
    return [
      { id: 1, source: "Investing", time: "4 saat önce", title: `FED'in faiz kararı ${assetName} fiyatlamalarını doğrudan etkiledi.` },
      { id: 2, source: "Reuters", time: "8 saat önce", title: `Küresel arz endişeleri ${assetSymbol} piyasasında oynaklık yarattı.` },
      { id: 3, source: "Bloomberg", time: "1 gün önce", title: `Merkez bankalarının ${assetName} talebi rekor seviyelere ulaştı.` },
    ];
  }
};

const generatePrediction = (price: number) => {
  // Generate slightly positive or slightly negative predictions deterministically but pseudo-randomly
  const isBullish = Math.random() > 0.3; // 70% chance of bullish for demo purposes
  const w1 = isBullish ? (Math.random() * 5 + 1) : -(Math.random() * 3 + 1);
  const m1 = isBullish ? (Math.random() * 12 + 5) : -(Math.random() * 8 + 3);
  const m3 = isBullish ? (Math.random() * 25 + 10) : -(Math.random() * 15 + 5);
  
  return {
    sentiment: isBullish ? 'Boğa (Yükseliş)' : 'Ayı (Düşüş)',
    score: isBullish ? Math.floor(Math.random() * 30 + 70) : Math.floor(Math.random() * 40 + 20), // 70-100 or 20-60
    w1, m1, m3,
    w1Price: price * (1 + (w1 / 100)),
    m1Price: price * (1 + (m1 / 100)),
    m3Price: price * (1 + (m3 / 100)),
  };
};

export default function AIAnalyzerModal({ asset, onClose }: AIAnalyzerModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [loadingText, setLoadingText] = useState("KAP ve Global Haberler Taranıyor...");
  
  const news = generateMockNews(asset.name, asset.symbol);
  const [pred, setPred] = useState<any>(null);

  useEffect(() => {
    setPred(generatePrediction(asset.priceTry));
    
    // Simulate complex AI loading
    const timer1 = setTimeout(() => setLoadingText("Duygu Analizi (Sentiment) Hesaplanıyor..."), 1200);
    const timer2 = setTimeout(() => setLoadingText("Teknik İndikatörler (RSI, MACD) Yorumlanıyor..."), 2400);
    const timer3 = setTimeout(() => setIsAnalyzing(false), 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [asset.priceTry]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-secondary/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                FinQuest AI Analisti
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] rounded-full uppercase tracking-wider font-bold">Beta</span>
              </h2>
              <p className="text-sm text-muted-foreground">{asset.name} ({asset.symbol}) Yapay Zeka Analizi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors relative z-10">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                <Bot className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
              </div>
              <p className="text-lg font-medium text-primary animate-pulse">{loadingText}</p>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Sentiment Score & Verdict */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-secondary/30 border border-border rounded-2xl p-5 flex flex-col justify-center items-center text-center">
                  <p className="text-sm text-muted-foreground mb-1">Genel Görünüm (Duygu Analizi)</p>
                  <div className="flex items-center gap-2 mb-2">
                    {pred.score >= 50 ? <TrendingUp className="w-8 h-8 text-emerald-500" /> : <TrendingDown className="w-8 h-8 text-rose-500" />}
                    <span className={`text-3xl font-black ${pred.score >= 50 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {pred.sentiment}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5 mt-2">
                    <div 
                      className={`h-2.5 rounded-full ${pred.score >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                      style={{ width: `${pred.score}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Güven Skoru: {pred.score}/100</p>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-primary">
                    <Bot className="w-4 h-4" /> AI Yorumu
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Son taranan {news.length} habere ve güncel teknik göstergelere göre, {asset.name} için pazar duyarlılığı büyük ölçüde {pred.score >= 50 ? 'pozitif' : 'negatif'} görünüyor. Kurumsal ilgi ve hacimdeki değişimler, önümüzdeki 1-3 aylık periyotta fiyatın {pred.score >= 50 ? 'yukarı' : 'aşağı'} yönlü hareket etme ihtimalini güçlendiriyor.
                  </p>
                </div>
              </div>

              {/* Predictions */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> AI Fiyat Tahminleri (₺)
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '1 Hafta', change: pred.w1, price: pred.w1Price },
                    { label: '1 Ay', change: pred.m1, price: pred.m1Price },
                    { label: '3 Ay', change: pred.m3, price: pred.m3Price }
                  ].map((p, idx) => (
                    <div key={idx} className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                      <span className="text-xs text-muted-foreground mb-1">{p.label}</span>
                      <span className="font-bold text-lg">{p.price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</span>
                      <span className={`text-xs font-bold mt-1 flex items-center ${p.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {p.change >= 0 ? '+' : ''}{p.change.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-3">* Bu tahminler yapay zeka modelinin simülasyonudur ve yatırım tavsiyesi (YTD) içermez.</p>
              </div>

              {/* Scraped News */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Newspaper className="w-4 h-4" /> Taranan Son Haberler (Kaynak Verisi)
                </h3>
                <div className="space-y-2">
                  {news.map((item) => (
                    <div key={item.id} className="bg-secondary/30 rounded-xl p-3 text-sm flex gap-3">
                      <div className="w-1.5 rounded-full bg-primary/50 shrink-0"></div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="font-semibold text-primary/70">{item.source}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
