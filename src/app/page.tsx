"use client";

import { useState } from "react";
import { Wallet, PieChart, TrendingUp, ArrowUpRight, ArrowDownRight, Bot, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [userLevel, setUserLevel] = useState(3);
  const [userExp, setUserExp] = useState(45); // percentage

  const handleQuizComplete = () => {
    setIsLessonOpen(false);
    setUserExp((prev) => Math.min(prev + 20, 100));
    if (userExp >= 80) {
      setUserLevel(4);
      setUserExp(5); // reset exp after level up
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-card p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            FQ
          </div>
          <span className="text-xl font-bold tracking-tight">FinQuest</span>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem icon={<PieChart className="w-5 h-5" />} label="Gösterge Paneli" active />
          <NavItem icon={<Wallet className="w-5 h-5" />} label="İşlemlerim" />
          <NavItem icon={<TrendingUp className="w-5 h-5" />} label="Yatırımlar" />
        </nav>

        <div className="mt-auto p-4 bg-secondary rounded-xl">
          <div className="text-sm font-medium mb-1">Finansal Zeka</div>
          <div className="w-full bg-border rounded-full h-2 mb-2 overflow-hidden">
            <motion.div 
              className="bg-primary h-full rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: `${userExp}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-right">Seviye {userLevel} Çırak</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Hoş Geldin, Umut 👋</h1>
            <p className="text-muted-foreground mt-1">İşte bu ayki finansal özetin.</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-semibold cursor-pointer hover:bg-border transition-colors">
            U
          </div>
        </header>

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
            <h2 className="text-xl font-semibold mb-6">Son İşlemler</h2>
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
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                <Bot className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold text-primary">FinQuest AI</h2>
            </div>
            
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50 relative z-10 flex-1">
              <p className="text-sm font-medium mb-2">💡 Yeni Bir Tespitim Var!</p>
              <p className="text-sm text-muted-foreground mb-4">
                Bu ay dışarıda kahveye geçen aya göre <strong>%40 daha fazla</strong> harcadığını fark ettim. &quot;Latte Faktörü&quot; hakkında kısa bir eğitim almak ister misin?
              </p>
              <button 
                onClick={() => setIsLessonOpen(true)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors text-sm cursor-pointer shadow-lg shadow-primary/20"
              >
                Latte Faktörünü Öğren
              </button>
            </div>
          </div>
        </div>
      </main>

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
function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium cursor-pointer ${
        active
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
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
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow cursor-default">
      <div className="text-sm text-muted-foreground mb-2">{title}</div>
      <div className="text-3xl font-bold mb-4">{amount}</div>
      <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
        {trend}
      </div>
    </div>
  );
}

function TransactionItem({ name, category, date, amount, isIncome = false }: { name: string; category: string; date: string; amount: string; isIncome?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-xl transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isIncome ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-secondary text-foreground'}`}>
          {isIncome ? <TrendingUp className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
        </div>
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">{category} • {date}</div>
        </div>
      </div>
      <div className={`font-semibold ${isIncome ? 'text-emerald-500' : ''}`}>
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
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                             selectedAnswer === idx 
                                ? 'border-primary bg-primary/5 shadow-inner' 
                                : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {answer}
                        </button>
                      ))}
                   </div>
                   
                   <button 
                     disabled={selectedAnswer === null}
                     onClick={handleAnswerSubmit}
                     className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                   >
                     Cevabı Onayla
                   </button>
                </motion.div>
             )}

             {step === "success" && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                   <motion.div 
                     initial={{ scale: 0 }}
                     animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                     transition={{ type: "spring", stiffness: 200, damping: 10 }}
                     className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                   >
                     <CheckCircle className="w-10 h-10" />
                   </motion.div>
                   <h2 className="text-2xl font-bold mb-2">Tebrikler! 🎉</h2>
                   <p className="text-muted-foreground mb-6">Doğru cevap. Finansal zeka puanın +20 XP arttı.</p>
                   <button 
                     onClick={onComplete}
                     className="w-full py-3 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
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
