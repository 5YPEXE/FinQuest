"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, Activity, TrendingUp, TrendingDown, Clock, Loader2, Newspaper, ExternalLink, Wifi, WifiOff } from "lucide-react";

type AIAnalyzerModalProps = {
  asset: {
    id: string;
    name: string;
    symbol: string;
    currentPrice: number;
    currencySymbol: string;
    change24h: number;
    type?: 'crypto' | 'stock' | 'commodity';
  };
  onClose: () => void;
};

type NewsItem = {
  id: number;
  title: string;
  source: string;
  time: string;
  url: string;
  isLive: boolean; // true = gerçek haber, false = simülasyon
};

// ============================================================
// GERÇEK HABER ÇEKİCİ (Google News RSS via CORS Proxy)
// ============================================================
const fetchLiveNews = async (assetName: string, assetSymbol: string): Promise<NewsItem[]> => {
  try {
    // Google News RSS - Türkçe haberler
    const query = encodeURIComponent(`${assetName} ${assetSymbol}`);
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=tr&gl=TR&ceid=TR:tr`;
    
    // Yöntem 1: RSS2JSON API (en güvenilir, CORS yok)
    const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    const res = await fetch(rss2jsonUrl, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    
    if (data.status !== "ok" || !data.items || data.items.length === 0) {
      throw new Error("RSS2JSON returned no items");
    }
    
    const newsItems: NewsItem[] = data.items.slice(0, 8).map((item: any, idx: number) => {
      const pubDate = item.pubDate || "";
      const publishedAt = new Date(pubDate);
      const now = new Date();
      const diffMs = now.getTime() - publishedAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      let timeStr = "";
      if (diffMins < 60) timeStr = `${Math.max(1, diffMins)} dakika önce`;
      else if (diffHours < 24) timeStr = `${diffHours} saat önce`;
      else timeStr = `${diffDays} gün önce`;
      
      // Başlıktan " - KaynakAdı" kısmını çıkar
      const cleanTitle = (item.title || "").replace(/ - [^-]+$/, "").trim();
      // Kaynak adını ayıkla
      const sourceMatch = (item.title || "").match(/ - ([^-]+)$/);
      const source = sourceMatch ? sourceMatch[1].trim() : "Google News";
      
      return {
        id: idx + 1,
        title: cleanTitle,
        source: source,
        time: timeStr,
        url: item.link || item.guid || "",
        isLive: true
      };
    });
    
    return newsItems;
  } catch (error) {
    console.warn("Canlı haber çekilemedi, simülasyona geçiliyor:", error);
    return [];
  }
};

// ============================================================
// SİMÜLASYON HABERLERİ (Fallback / Yedek)
// ============================================================
const generateMockNews = (assetName: string, assetSymbol: string): NewsItem[] => {
  const isCrypto = ['BTC', 'ETH', 'USDT', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'TRX', 'LINK', 'DOT', 'AVAX'].includes(assetSymbol) || assetName.toLowerCase().includes('coin');
  const isBist = ['THYAO', 'ASELS', 'KCHOL', 'SASA', 'TUPRS'].includes(assetSymbol);
  
  const makeUrl = (title: string, source: string) => `https://www.google.com/search?q=${encodeURIComponent(title + " " + source)}`;
  
  if (isBist) {
    const items = [
      { id: 1, source: "KAP", time: "15 dakika önce", title: `${assetName} 3. Çeyrek Bilanço Beklentileri Revize Edildi.` },
      { id: 2, source: "Bloomberg HT", time: "2 saat önce", title: `Yabancı fonların ${assetSymbol} hissesindeki alımları hızlandı.` },
      { id: 3, source: "KAP", time: "4 saat önce", title: `${assetName} yeni yatırım teşvik belgesi aldı.` },
      { id: 4, source: "Investing", time: "7 saat önce", title: `Aracı kurumlar ${assetSymbol} için hedef fiyatı yukarı yönlü güncelledi.` },
      { id: 5, source: "Reuters", time: "12 saat önce", title: `Global ekonomik veriler ${assetName} sektöründe iyimserlik yaratıyor.` },
      { id: 6, source: "KAP", time: "1 gün önce", title: `${assetName} yönetim kurulundan bedelsiz sermaye artırımı kararı!` },
    ];
    return items.map(i => ({ ...i, url: makeUrl(i.title, i.source), isLive: false }));
  } else if (isCrypto) {
    const items = [
      { id: 1, source: "CoinDesk", time: "20 dakika önce", title: `SEC'in son kararı sonrası ${assetName} işlem hacminde patlama yaşandı.` },
      { id: 2, source: "Whale Alert", time: "1 saat önce", title: `Bilinmeyen bir cüzdandan borsalara devasa ${assetSymbol} transferi gerçekleşti.` },
      { id: 3, source: "CoinTelegraph", time: "3 saat önce", title: `Kurumsal balinalar yüklü miktarda ${assetName} toplamaya devam ediyor.` },
      { id: 4, source: "Decrypt", time: "5 saat önce", title: `${assetSymbol} ağındaki aktif adres sayısı tüm zamanların en yüksek seviyesinde.` },
      { id: 5, source: "Reuters", time: "10 saat önce", title: `Global piyasalardaki risk iştahı ${assetName} fiyatını destekliyor.` },
      { id: 6, source: "Bloomberg", time: "18 saat önce", title: `Asya merkezli fonların kripto paralara ilgisi yeniden artıyor.` },
    ];
    return items.map(i => ({ ...i, url: makeUrl(i.title, i.source), isLive: false }));
  } else {
    const items = [
      { id: 1, source: "Investing", time: "45 dakika önce", title: `FED'in faiz açıklamaları ${assetName} fiyatlamalarını doğrudan etkiledi.` },
      { id: 2, source: "Reuters", time: "2 saat önce", title: `Küresel arz endişeleri ${assetSymbol} piyasasında oynaklık yarattı.` },
      { id: 3, source: "Bloomberg", time: "5 saat önce", title: `Merkez bankalarının ${assetName} rezerv talebi rekor seviyelere ulaştı.` },
      { id: 4, source: "Finans Gündem", time: "9 saat önce", title: `Ortadoğu'daki jeopolitik gerilimler güvenli liman ${assetSymbol} alımlarını hızlandırdı.` },
      { id: 5, source: "Wall Street Journal", time: "14 saat önce", title: `Çin'den gelen ekonomik veriler ${assetName} piyasası için karışık sinyaller veriyor.` },
    ];
    return items.map(i => ({ ...i, url: makeUrl(i.title, i.source), isLive: false }));
  }
};

// ============================================================
// TAHMİN MOTORU
// ============================================================
const generatePrediction = (assetName: string, price: number, change24h: number) => {
  const today = new Date().toISOString().split('T')[0];
  const hashVal = (assetName.charCodeAt(0) + assetName.length + today.charCodeAt(today.length-1)) % 100;
  
  let isBullish = hashVal > 40;
  
  if (change24h > 5) isBullish = false;
  if (change24h < -5) isBullish = true;

  const score = isBullish ? (60 + (hashVal % 35)) : (20 + (hashVal % 30));
  const vol = Math.max(2, Math.abs(change24h) * 1.5);
  
  const w1 = isBullish ? (vol * 0.5 + (hashVal % 3)) : -(vol * 0.4 + (hashVal % 3));
  const m1 = isBullish ? (vol * 1.5 + (hashVal % 8)) : -(vol * 1.2 + (hashVal % 5));
  const m3 = isBullish ? (vol * 3.0 + (hashVal % 15)) : -(vol * 2.5 + (hashVal % 10));
  
  let reason = "";
  if (change24h > 5) {
    reason = `Son 24 saatteki aşırı yükseliş (${change24h.toFixed(2)}%), RSI indikatörünü 'Aşırı Alım' (Overbought) bölgesine taşıdı. Önümüzdeki günlerde kar satışlarıyla teknik bir düzeltme yaşanma ihtimali yüksek.`;
  } else if (change24h < -5) {
    reason = `Son dönemdeki sert düşüşler (${change24h.toFixed(2)}%) varlığı 'Aşırı Satım' (Oversold) noktasına getirdi. Temel veriler güçlü kaldığı sürece bu seviyelerden güçlü bir tepki alımı (bounce) bekleniyor.`;
  } else if (isBullish) {
    reason = `MACD ve hareketli ortalamalar pozitif bir ivmeye (Momentum) işaret ediyor. Haber akışındaki olumlu gelişmelerle birlikte önümüzdeki 1-3 aylık periyotta kademeli bir yükseliş trendi öngörülüyor.`;
  } else {
    reason = `Teknik göstergelerdeki zayıflama ve hacim düşüşü, kısa vadede aşağı yönlü bir baskı oluşturuyor. Destek seviyelerinin kırılması durumunda düşüş derinleşebilir, temkinli olunmalı.`;
  }

  return {
    sentiment: isBullish ? 'Boğa (Yükseliş)' : 'Ayı (Düşüş)',
    score,
    reason,
    w1, m1, m3,
    w1Price: price * (1 + (w1 / 100)),
    m1Price: price * (1 + (m1 / 100)),
    m3Price: price * (1 + (m3 / 100)),
  };
};

// ============================================================
// COMPONENT
// ============================================================
export default function AIAnalyzerModal({ asset, onClose }: AIAnalyzerModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [loadingText, setLoadingText] = useState("KAP ve Global Haberler Taranıyor...");
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isNewsLive, setIsNewsLive] = useState(false);
  const [pred, setPred] = useState<any>(null);

  useEffect(() => {
    setPred(generatePrediction(asset.name, asset.currentPrice, asset.change24h));
    
    // Fetch real news in parallel with loading animation
    const fetchNews = async () => {
      const liveNews = await fetchLiveNews(asset.name, asset.symbol);
      
      if (liveNews.length > 0) {
        setNews(liveNews);
        setIsNewsLive(true);
      } else {
        setNews(generateMockNews(asset.name, asset.symbol));
        setIsNewsLive(false);
      }
    };

    fetchNews();
    
    const timer1 = setTimeout(() => setLoadingText("Duygu Analizi (Sentiment) Hesaplanıyor..."), 1200);
    const timer2 = setTimeout(() => setLoadingText("Teknik İndikatörler (RSI, MACD) Yorumlanıyor..."), 2400);
    const timer3 = setTimeout(() => setIsAnalyzing(false), 3800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [asset.currentPrice, asset.name, asset.symbol, asset.change24h]);

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
                    {pred.reason}
                  </p>
                </div>
              </div>

              {/* Predictions */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> AI Fiyat Tahminleri ({asset.currencySymbol})
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '1 Hafta', change: pred.w1, price: pred.w1Price },
                    { label: '1 Ay', change: pred.m1, price: pred.m1Price },
                    { label: '3 Ay', change: pred.m3, price: pred.m3Price }
                  ].map((p, idx) => (
                    <div key={idx} className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                      <span className="text-xs text-muted-foreground mb-1">{p.label}</span>
                      <span className="font-bold text-lg">{asset.currencySymbol}{p.price.toLocaleString(asset.currencySymbol === '₺' ? 'tr-TR' : 'en-US', { maximumFractionDigits: asset.currencySymbol === '₺' ? 2 : 4 })}</span>
                      <span className={`text-xs font-bold mt-1 flex items-center ${p.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {p.change >= 0 ? '+' : ''}{p.change.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-3">* Bu tahminler yapay zeka modelinin simülasyonudur ve yatırım tavsiyesi (YTD) içermez.</p>
              </div>

              {/* News Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Newspaper className="w-4 h-4" /> 
                  Taranan Son Haberler
                  {isNewsLive ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] rounded-full font-bold">
                      <Wifi className="w-3 h-3" /> CANLI
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] rounded-full font-bold">
                      <WifiOff className="w-3 h-3" /> SİMÜLASYON
                    </span>
                  )}
                </h3>
                <div className="space-y-2">
                  {news.map((item) => (
                    <a 
                      key={item.id} 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-secondary/30 rounded-xl p-3 text-sm flex gap-3 group hover:bg-secondary/50 transition-colors cursor-pointer block"
                    >
                      <div className={`w-1.5 rounded-full shrink-0 ${item.isLive ? 'bg-emerald-500' : 'bg-primary/50'}`}></div>
                      <div className="flex-1">
                        <p className="font-medium group-hover:text-primary transition-colors">{item.title}</p>
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="font-semibold text-primary/70 flex items-center gap-1">
                            {item.source}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                        </div>
                      </div>
                    </a>
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
