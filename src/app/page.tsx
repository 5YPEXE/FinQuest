"use client";

import { useState, useEffect } from "react";
import { Wallet, PieChart, TrendingUp, ArrowUpRight, ArrowDownRight, Bot, X, CheckCircle, Construction } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userLevel, setUserLevel] = useState(3);
  const [userExp, setUserExp] = useState(45); // percentage
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, transactions, investments

  // Load saved progress on mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const savedLevel = localStorage.getItem("fq_level");
    const savedExp = localStorage.getItem("fq_exp");
    if (savedLevel) setUserLevel(parseInt(savedLevel, 10));
    if (savedExp) setUserExp(parseInt(savedExp, 10));
  }, []);

  const handleQuizComplete = () => {
    setIsLessonOpen(false);
    
    let newExp = userExp + 20;
    let newLevel = userLevel;
    
    if (newExp >= 100) {
      newLevel += 1;
      newExp = newExp - 100 + 5; // Level up with a 5% starting bonus
    } else {
      newExp = Math.min(newExp, 100);
    }
    
    setUserExp(newExp);
    setUserLevel(newLevel);
    
    // Save to LocalStorage
    localStorage.setItem("fq_level", newLevel.toString());
    localStorage.setItem("fq_exp", newExp.toString());
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="w-64 border-r border-border bg-card p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md shadow-primary/20">
            FQ
          </div>
          <span className="text-xl font-bold tracking-tight">FinQuest</span>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem 
            icon={<PieChart className="w-5 h-5" />} 
            label="Gösterge Paneli" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<Wallet className="w-5 h-5" />} 
            label="İşlemlerim" 
            active={activeTab === 'transactions'} 
            onClick={() => setActiveTab('transactions')} 
          />
          <NavItem 
            icon={<TrendingUp className="w-5 h-5" />} 
            label="Yatırımlar" 
            active={activeTab === 'investments'} 
            onClick={() => setActiveTab('investments')} 
          />
        </nav>

        <div className="mt-auto p-4 bg-secondary rounded-xl">
          <div className="text-sm font-medium mb-1">Finansal Zeka</div>
          <div className="w-full bg-border rounded-full h-2 mb-2 overflow-hidden">
            {isMounted && (
              <motion.div 
                className="bg-primary h-full rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${userExp}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            )}
          </div>
          <div className="text-xs text-muted-foreground text-right">Seviye {isMounted ? userLevel : 3} Çırak</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6 p-6 lg:p-10 relative">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Hoş Geldin, Umut 👋</h1>
            <p className="text-muted-foreground mt-1">İşte bu ayki finansal özetin.</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-semibold cursor-pointer hover:bg-border transition-colors">
            U
          </div>
        </header>

        {activeTab === "dashboard" ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <MetricCard
                title="Toplam Bakiye"
                amount="₺45,231.00"
                trend="+12.5%"
                isPositive={true}
              />
              <MetricCard
                title="Aylık Harcama"
                amount="₺12,450.00"
                trend="+24.2%"
                isPositive={false}
              />
              <MetricCard
                title="Tasarruf Hedefi"
                amount="₺5,000.00"
                trend="₺1,200 Kaldı"
                isPositive={true}
              />
            </div>

            {/* Recent Transactions & AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Son İşlemler</h2>
                  <button onClick={() => setActiveTab('transactions')} className="text-sm font-medium text-primary hover:underline">Tümünü Gör</button>
                </div>
                <div className="space-y-4">
                  <TransactionItem name="Starbucks Kahve" category="Yeme İçme" date="Bugün, 09:30" amount="-₺185.00" />
                  <TransactionItem name="Netflix Aboneliği" category="Eğlence" date="Dün, 14:20" amount="-₺230.00" />
                  <TransactionItem name="Maaş Ödemesi" category="Gelir" date="15 Mayıs 2026" amount="+₺65,000.00" isIncome />
                  <TransactionItem name="Trendyol Alışverişi" category="Alışveriş" date="14 Mayıs 2026" amount="-₺3,450.00" />
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Bot className="w-32 h-32 text-primary" />
                </div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
                    <Bot className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-primary">FinQuest AI</h2>
                </div>
                
                <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50 relative z-10 flex-1">
                  <p className="text-sm font-medium mb-2">💡 Yeni Bir Tespitim Var!</p>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Bu ay dışarıda kahveye geçen aya göre <strong>%40 daha fazla</strong> harcadığını fark ettim. &quot;Latte Faktörü&quot; hakkında kısa bir eğitim almak ister misin?
                  </p>
                  <button 
                    onClick={() => setIsLessonOpen(true)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer shadow-lg shadow-primary/20"
                  >
                    Latte Faktörünü Öğren
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex flex-col items-center justify-center h-[60vh] text-center px-4"
          >
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-muted-foreground mb-6">
              <Construction className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Çok Yakında! 🚀</h2>
            <p className="text-muted-foreground max-w-md">
              "{activeTab === 'transactions' ? 'İşlemlerim' : 'Yatırımlar'}" sayfası şu anda yapım aşamasında. 
              Hackathon sonrası burada yepyeni özellikler göreceksin!
            </p>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="mt-8 px-6 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors"
            >
              Ana Ekrana Dön
            </button>
          </motion.div>
        )}
      </main>

      {/* Mobile Bottom Navigation (Visible only on small screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 px-6 flex justify-between items-center z-40 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1.5 p-2 transition-colors ${activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <div className={`p-2 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-primary/10' : 'bg-transparent'}`}>
            <PieChart className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold">Özet</span>
        </button>
        <button onClick={() => setActiveTab('transactions')} className={`flex flex-col items-center gap-1.5 p-2 transition-colors ${activeTab === 'transactions' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <div className={`p-2 rounded-xl transition-colors ${activeTab === 'transactions' ? 'bg-primary/10' : 'bg-transparent'}`}>
            <Wallet className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold">İşlemler</span>
        </button>
        <button onClick={() => setActiveTab('investments')} className={`flex flex-col items-center gap-1.5 p-2 transition-colors ${activeTab === 'investments' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <div className={`p-2 rounded-xl transition-colors ${activeTab === 'investments' ? 'bg-primary/10' : 'bg-transparent'}`}>
            <TrendingUp className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold">Yatırım</span>
        </button>
      </nav>

      {/* AI Lesson Modal */}
      <AnimatePresence>
        {isLessonOpen && (
          <LessonModal onClose={() => setIsLessonOpen(false)} onComplete={handleQuizComplete} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponents
function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium cursor-pointer ${
        active
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MetricCard({ title, amount, trend, isPositive }: { title: string; amount: string; trend: string; isPositive: boolean }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between hover:border-primary/50 transition-colors cursor-default shadow-sm hover:shadow-md">
      <div className="text-sm text-muted-foreground mb-2">{title}</div>
      <div className="text-3xl font-bold mb-4 tracking-tight">{amount}</div>
      <div className={`flex items-center text-sm font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
        {trend}
      </div>
    </div>
  );
}

function TransactionItem({ name, category, date, amount, isIncome = false }: { name: string; category: string; date: string; amount: string; isIncome?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-border">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isIncome ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-secondary text-foreground'}`}>
          {isIncome ? <TrendingUp className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
        </div>
        <div>
          <div className="font-medium text-sm md:text-base">{name}</div>
          <div className="text-xs text-muted-foreground">{category} • {date}</div>
        </div>
      </div>
      <div className={`font-bold ${isIncome ? 'text-emerald-500' : ''}`}>
        {amount}
      </div>
    </div>
  );
}

// Modal Component
function LessonModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const [step, setStep] = useState<"lesson" | "quiz" | "success">("lesson");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  const handleAnswerSubmit = () => {
    if (selectedAnswer === 1) { // 1 is the correct index
       setStep("success");
    } else {
       alert("Tekrar düşün! Küçük harcamaların birikmesinden bahsediyorduk sanki?");
    }
  }

  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div 
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border overflow-hidden"
        >
           <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/50">
             <div className="flex items-center gap-2 text-primary font-bold">
               <Bot className="w-5 h-5" /> AI Eğitim Modülü
             </div>
             <button onClick={onClose} className="p-1 hover:bg-border rounded-full transition-colors cursor-pointer">
               <X className="w-5 h-5" />
             </button>
           </div>

           <div className="p-6 md:p-8">
             {step === "lesson" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <h2 className="text-2xl font-bold mb-4">☕ Latte Faktörü Nedir?</h2>
                   <p className="text-muted-foreground mb-4 leading-relaxed">
                     Küçük ve masum görünen günlük harcamaların (örneğin her gün içilen 150 TL&apos;lik kahvenin), uzun vadede nasıl devasa bir servete dönüşebileceğini gösteren finansal bir kavramdır.
                   </p>
                   <div className="bg-primary/10 p-4 rounded-xl text-primary font-medium mb-6">
                     💡 Günde 150 TL, ayda 4.500 TL yapar. Bu parayı 10 yıl boyunca yıllık %10 getiri sağlayan bir fona yatırsaydın, bugün <strong>1 Milyon TL&apos;den fazla</strong> paran olabilirdi!
                   </div>
                   <button 
                     onClick={() => setStep("quiz")}
                     className="w-full py-3 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                   >
                     Anladım, Teste Geç
                   </button>
                </motion.div>
             )}

             {step === "quiz" && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                   <h2 className="text-xl font-bold mb-6">Hızlı Soru 🧠</h2>
                   <p className="font-medium mb-4">Latte Faktörü&apos;nün temel amacı aşağıdakilerden hangisidir?</p>
                   
                   <div className="space-y-3 mb-6">
                      {[
                        "Kahve içmeyi tamamen yasaklamak.",
                        "Küçük düzenli masrafları yatırıma çevirerek uzun vadede zenginlik yaratmak.",
                        "En ucuz kahveciyi bulup oradan alışveriş yapmak."
                      ].map((answer, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setSelectedAnswer(idx)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer font-medium ${
                             selectedAnswer === idx 
                                ? 'border-primary bg-primary/5 shadow-inner' 
                                : 'border-border hover:border-primary/50 hover:bg-secondary/20'
                          }`}
                        >
                          {answer}
                        </button>
                      ))}
                   </div>
                   
                   <button 
                     disabled={selectedAnswer === null}
                     onClick={handleAnswerSubmit}
                     className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                   >
                     Cevabı Onayla
                   </button>
                </motion.div>
             )}

             {step === "success" && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                   <motion.div 
                     initial={{ scale: 0 }}
                     animate={{ scale: 1, rotate: 360 }}
                     transition={{ type: "spring", stiffness: 200, damping: 10 }}
                     className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                   >
                     <CheckCircle className="w-10 h-10" />
                   </motion.div>
                   <h2 className="text-2xl font-bold mb-2">Tebrikler! 🎉</h2>
                   <p className="text-muted-foreground mb-6">Doğru cevap. Finansal zeka puanın +20 XP arttı.</p>
                   <button 
                     onClick={onComplete}
                     className="w-full py-3 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer shadow-lg"
                   >
                     Ödülümü Al ve Kapat
                   </button>
                </motion.div>
             )}
           </div>
        </motion.div>
     </div>
  );
}
