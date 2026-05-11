"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Bot, Activity, TrendingUp, TrendingDown, Clock, Newspaper, ExternalLink, Wifi, WifiOff, BarChart3 } from "lucide-react";

type NewsItem = { id: number; title: string; source: string; time: string; exactDate: string; url: string; isLive: boolean; publishedAt: number };
type AIAnalyzerModalProps = {
  asset: { id: string; name: string; symbol: string; currentPrice: number; currencySymbol: string; change24h: number; sparkline?: { value: number }[]; };
  onClose: () => void;
};

// ==================== HABER ÇEKİCİ ====================
const fetchLiveNews = async (name: string, symbol: string): Promise<NewsItem[]> => {
  try {
    const q = encodeURIComponent(`${name} ${symbol}`);
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(`https://news.google.com/rss/search?q=${q}&hl=tr&gl=TR&ceid=TR:tr`)}`, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    if (data.status !== "ok" || !data.items?.length) throw new Error("No items");
    const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    const items: NewsItem[] = data.items.slice(0, 10).map((item: any, idx: number) => {
      const d = new Date(item.pubDate || "");
      const now = new Date();
      const mins = Math.floor((now.getTime() - d.getTime()) / 60000);
      const hrs = Math.floor(mins / 60);
      const days = Math.floor(hrs / 24);
      const time = mins < 60 ? `${Math.max(1, mins)} dk önce` : hrs < 24 ? `${hrs} saat önce` : `${days} gün önce`;
      const cleanTitle = (item.title || "").replace(/ - [^-]+$/, "").trim();
      const srcMatch = (item.title || "").match(/ - ([^-]+)$/);
      return { id: idx+1, title: cleanTitle, source: srcMatch?.[1]?.trim() || "Google News", time, exactDate: `${d.getDate()} ${months[d.getMonth()]} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`, url: item.link || "", isLive: true, publishedAt: d.getTime() };
    });
    items.sort((a, b) => b.publishedAt - a.publishedAt);
    return items;
  } catch { return []; }
};

const generateMockNews = (name: string, sym: string): NewsItem[] => {
  const mk = (t: string, s: string) => ({ url: `https://www.google.com/search?q=${encodeURIComponent(t+" "+s)}`, isLive: false, exactDate: '', publishedAt: 0 });
  const crypto = ['BTC','ETH','USDT','SOL','BNB','XRP','ADA','DOGE','TRX','LINK','DOT','AVAX'].includes(sym);
  const bist = ['THYAO','ASELS','KCHOL','SASA','TUPRS'].includes(sym);
  const items = bist ? [
    { id:1, source:"KAP", time:"15 dk önce", title:`${name} 3. Çeyrek Bilanço Beklentileri Revize Edildi.` },
    { id:2, source:"Bloomberg HT", time:"2 saat önce", title:`Yabancı fonların ${sym} hissesindeki alımları hızlandı.` },
    { id:3, source:"KAP", time:"4 saat önce", title:`${name} yeni yatırım teşvik belgesi aldı.` },
    { id:4, source:"Investing", time:"7 saat önce", title:`Aracı kurumlar ${sym} için hedef fiyatı yukarı yönlü güncelledi.` },
    { id:5, source:"Reuters", time:"12 saat önce", title:`Global ekonomik veriler ${name} sektöründe iyimserlik yaratıyor.` },
    { id:6, source:"KAP", time:"1 gün önce", title:`${name} yönetim kurulundan bedelsiz sermaye artırımı kararı!` },
  ] : crypto ? [
    { id:1, source:"CoinDesk", time:"20 dk önce", title:`SEC'in son kararı sonrası ${name} işlem hacminde patlama yaşandı.` },
    { id:2, source:"Whale Alert", time:"1 saat önce", title:`Bilinmeyen bir cüzdandan borsalara devasa ${sym} transferi gerçekleşti.` },
    { id:3, source:"CoinTelegraph", time:"3 saat önce", title:`Kurumsal balinalar yüklü miktarda ${name} toplamaya devam ediyor.` },
    { id:4, source:"Decrypt", time:"5 saat önce", title:`${sym} ağındaki aktif adres sayısı tüm zamanların en yüksek seviyesinde.` },
    { id:5, source:"Reuters", time:"10 saat önce", title:`Global piyasalardaki risk iştahı ${name} fiyatını destekliyor.` },
    { id:6, source:"Bloomberg", time:"18 saat önce", title:`Asya merkezli fonların kripto paralara ilgisi yeniden artıyor.` },
  ] : [
    { id:1, source:"Investing", time:"45 dk önce", title:`FED'in faiz açıklamaları ${name} fiyatlamalarını doğrudan etkiledi.` },
    { id:2, source:"Reuters", time:"2 saat önce", title:`Küresel arz endişeleri ${sym} piyasasında oynaklık yarattı.` },
    { id:3, source:"Bloomberg", time:"5 saat önce", title:`Merkez bankalarının ${name} rezerv talebi rekor seviyelere ulaştı.` },
    { id:4, source:"Finans Gündem", time:"9 saat önce", title:`Ortadoğu'daki jeopolitik gerilimler güvenli liman ${sym} alımlarını hızlandırdı.` },
    { id:5, source:"Wall Street Journal", time:"14 saat önce", title:`Çin'den gelen ekonomik veriler ${name} piyasası için karışık sinyaller veriyor.` },
  ];
  return items.map(i => ({ ...i, ...mk(i.title, i.source) }));
};

// ==================== 3 KATMANLI ANALİZ MOTORU ====================
const POS_KW = ['yükseliş','yükseldi','artış','arttı','rekor','pozitif','güçlü','destekliyor','iyimser','talep','alım','büyüme','kazanç','onay','patlama','toparlanma','rally','surge','bullish','gain','high','boost','profit','growth','teşvik','hızlandı','toplamaya','artıyor','hedef fiyat','bedelsiz','açık standart'];
const NEG_KW = ['düşüş','düştü','azalış','kayıp','negatif','zayıf','baskı','endişe','risk','satış','kriz','çöküş','gerileme','crash','drop','bearish','loss','decline','fall','fear','selloff','düzeltme','sert','gerilim','oynaklık','tehdit','yasak','ceza','soruşturma','hack','iflas'];

const analyzeNews = (items: NewsItem[]) => {
  let pos = 0, neg = 0;
  items.forEach(i => { const l = i.title.toLowerCase(); const p = POS_KW.filter(k => l.includes(k)).length; const n = NEG_KW.filter(k => l.includes(k)).length; if (p > n) pos++; else if (n > p) neg++; });
  const total = Math.max(1, items.length);
  return { score: ((pos - neg) / total) * 100, pos, neg, neutral: items.length - pos - neg };
};

const analyzeTrend = (sparkline: { value: number }[]) => {
  if (!sparkline || sparkline.length < 5) return { score: 0, dir: 'Yatay', support: 0, resistance: 0 };
  const v = sparkline.map(s => s.value);
  const half = Math.floor(v.length / 2);
  const recentAvg = v.slice(half).reduce((a, b) => a + b, 0) / v.slice(half).length;
  const olderAvg = v.slice(0, half).reduce((a, b) => a + b, 0) / v.slice(0, half).length;
  const pct = ((recentAvg - olderAvg) / olderAvg) * 100;
  return { score: Math.max(-100, Math.min(100, pct * 10)), dir: pct > 1 ? 'Yükseliş' : pct < -1 ? 'Düşüş' : 'Yatay', support: Math.min(...v), resistance: Math.max(...v) };
};

const analyzeMomentum = (c: number) => ({
  score: Math.max(-100, Math.min(100, c * 12)),
  rsi: c > 7 ? 'Aşırı Alım' : c > 3 ? 'Güçlü Alım' : c < -7 ? 'Aşırı Satım' : c < -3 ? 'Güçlü Satım' : 'Nötr'
});

type Pred = { sentiment: string; score: number; reason: string; details: { newsScore: number; trendScore: number; momScore: number; rsi: string; trendDir: string; posNews: number; negNews: number; neutralNews: number }; w1: number; m1: number; m3: number; w1P: number; m1P: number; m3P: number };

const predict = (name: string, price: number, change24h: number, newsItems: NewsItem[], sparkline: { value: number }[]): Pred => {
  const ns = analyzeNews(newsItems);
  const tr = analyzeTrend(sparkline);
  const mo = analyzeMomentum(change24h);
  const weighted = ns.score * 0.35 + tr.score * 0.35 + mo.score * 0.30;
  const finalScore = Math.max(0, Math.min(100, Math.round(50 + weighted / 2)));
  const bull = finalScore >= 50;
  const vol = Math.max(2, Math.abs(change24h) * 1.2 + Math.abs(weighted) * 0.05);
  const w1 = bull ? (vol * 0.4 + (finalScore - 50) * 0.05) : -(vol * 0.35 + (50 - finalScore) * 0.05);
  const m1 = bull ? (vol * 1.2 + (finalScore - 50) * 0.15) : -(vol * 1.0 + (50 - finalScore) * 0.12);
  const m3 = bull ? (vol * 2.5 + (finalScore - 50) * 0.3) : -(vol * 2.0 + (50 - finalScore) * 0.25);
  const nv = ns.pos > ns.neg ? `olumlu (${ns.pos} pozitif / ${ns.neg} negatif)` : ns.neg > ns.pos ? `olumsuz (${ns.neg} negatif / ${ns.pos} pozitif)` : `nötr (dengeli)`;
  let reason = `📊 Taranan ${newsItems.length} haberin duygu analizi: ${nv}. 📈 Teknik trend: ${tr.dir} eğilimli. ⚡ RSI bölgesi: ${mo.rsi} (24s: ${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%). `;
  reason += bull ? `Üç katmanlı analiz birleştirildiğinde, ${name} için kısa-orta vadede yükseliş potansiyeli öne çıkıyor.` : `Üç katmanlı analiz birleştirildiğinde, ${name} için kısa vadede temkinli olunması gerektiği sinyali güçleniyor.`;
  return { sentiment: bull ? 'Boğa (Yükseliş)' : 'Ayı (Düşüş)', score: finalScore, reason, details: { newsScore: Math.round(ns.score), trendScore: Math.round(tr.score), momScore: Math.round(mo.score), rsi: mo.rsi, trendDir: tr.dir, posNews: ns.pos, negNews: ns.neg, neutralNews: ns.neutral }, w1, m1, m3, w1P: price * (1 + w1/100), m1P: price * (1 + m1/100), m3P: price * (1 + m3/100) };
};

// ==================== COMPONENT ====================
export default function AIAnalyzerModal({ asset, onClose }: AIAnalyzerModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [loadingText, setLoadingText] = useState("KAP ve Global Haberler Taranıyor...");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isNewsLive, setIsNewsLive] = useState(false);
  const [pred, setPred] = useState<Pred | null>(null);

  useEffect(() => {
    const run = async () => {
      const live = await fetchLiveNews(asset.name, asset.symbol);
      let finalNews: NewsItem[];
      if (live.length > 0) { finalNews = live; setIsNewsLive(true); }
      else { finalNews = generateMockNews(asset.name, asset.symbol); setIsNewsLive(false); }
      setNews(finalNews);
      setPred(predict(asset.name, asset.currentPrice, asset.change24h, finalNews, asset.sparkline || []));
    };
    run();
    const t1 = setTimeout(() => setLoadingText("Haber Duygu Analizi (NLP) Hesaplanıyor..."), 1000);
    const t2 = setTimeout(() => setLoadingText("Teknik İndikatörler (SMA, RSI) Yorumlanıyor..."), 2200);
    const t3 = setTimeout(() => setLoadingText("3 Katmanlı Skor Birleştiriliyor..."), 3200);
    const t4 = setTimeout(() => setIsAnalyzing(false), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [asset.currentPrice, asset.name, asset.symbol, asset.change24h]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-secondary/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20"><Bot className="w-6 h-6" /></div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">FinQuest AI Analisti <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] rounded-full uppercase tracking-wider font-bold">v2</span></h2>
              <p className="text-sm text-muted-foreground">{asset.name} ({asset.symbol}) · 3 Katmanlı Yapay Zeka Analizi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors relative z-10"><X className="w-5 h-5 text-muted-foreground" /></button>
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
          ) : pred && (
            <div className="space-y-6">
              {/* Sentiment + AI Comment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-secondary/30 border border-border rounded-2xl p-5 flex flex-col justify-center items-center text-center">
                  <p className="text-sm text-muted-foreground mb-1">Genel Görünüm</p>
                  <div className="flex items-center gap-2 mb-2">
                    {pred.score >= 50 ? <TrendingUp className="w-8 h-8 text-emerald-500" /> : <TrendingDown className="w-8 h-8 text-rose-500" />}
                    <span className={`text-3xl font-black ${pred.score >= 50 ? 'text-emerald-500' : 'text-rose-500'}`}>{pred.sentiment}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5 mt-2"><div className={`h-2.5 rounded-full ${pred.score >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${pred.score}%` }}></div></div>
                  <p className="text-xs text-muted-foreground mt-2">Birleşik Güven Skoru: {pred.score}/100</p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-primary"><Bot className="w-4 h-4" /> AI Yorumu</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">{pred.reason}</p>
                </div>
              </div>

              {/* 3-Layer Detail Bars */}
              <div className="bg-secondary/20 border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Katman Detayları</h3>
                <div className="space-y-3">
                  {[
                    { label: '📰 Haber Duygusu', val: pred.details.newsScore, desc: `${pred.details.posNews} pozitif · ${pred.details.negNews} negatif · ${pred.details.neutralNews} nötr` },
                    { label: '📈 Teknik Trend', val: pred.details.trendScore, desc: `Yön: ${pred.details.trendDir}` },
                    { label: '⚡ Momentum (RSI)', val: pred.details.momScore, desc: `Bölge: ${pred.details.rsi}` },
                  ].map((layer, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{layer.label}</span>
                        <span className={`font-bold ${layer.val >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{layer.val >= 0 ? '+' : ''}{layer.val}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 relative">
                        <div className="absolute left-1/2 top-0 w-px h-2 bg-muted-foreground/30"></div>
                        <div className={`h-2 rounded-full absolute ${layer.val >= 0 ? 'bg-emerald-500 left-1/2' : 'bg-rose-500 right-1/2'}`} style={{ width: `${Math.min(50, Math.abs(layer.val) / 2)}%` }}></div>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{layer.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Predictions */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> AI Fiyat Tahminleri ({asset.currencySymbol})</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[{ label: '1 Hafta', change: pred.w1, price: pred.w1P }, { label: '1 Ay', change: pred.m1, price: pred.m1P }, { label: '3 Ay', change: pred.m3, price: pred.m3P }].map((p, idx) => (
                    <div key={idx} className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                      <span className="text-xs text-muted-foreground mb-1">{p.label}</span>
                      <span className="font-bold text-lg">{asset.currencySymbol}{p.price.toLocaleString(asset.currencySymbol === '₺' ? 'tr-TR' : 'en-US', { maximumFractionDigits: asset.currencySymbol === '₺' ? 2 : 4 })}</span>
                      <span className={`text-xs font-bold mt-1 ${p.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{p.change >= 0 ? '+' : ''}{p.change.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-3">* Bu tahminler yapay zeka modelinin simülasyonudur ve yatırım tavsiyesi (YTD) içermez.</p>
              </div>

              {/* News */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Newspaper className="w-4 h-4" /> Taranan Son Haberler
                  {isNewsLive ? <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] rounded-full font-bold"><Wifi className="w-3 h-3" /> CANLI</span>
                  : <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] rounded-full font-bold"><WifiOff className="w-3 h-3" /> SİMÜLASYON</span>}
                </h3>
                <div className="space-y-2">
                  {news.map((item) => (
                    <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="bg-secondary/30 rounded-xl p-3 text-sm flex gap-3 group hover:bg-secondary/50 transition-colors cursor-pointer block">
                      <div className={`w-1.5 rounded-full shrink-0 ${item.isLive ? 'bg-emerald-500' : 'bg-primary/50'}`}></div>
                      <div className="flex-1">
                        <p className="font-medium group-hover:text-primary transition-colors">{item.title}</p>
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="font-semibold text-primary/70 flex items-center gap-1">{item.source}<ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></span>
                          {item.exactDate && <span className="text-muted-foreground/60">{item.exactDate}</span>}
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
