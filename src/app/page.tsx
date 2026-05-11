"use client";

import { useState, useEffect } from "react";
import { Wallet, PieChart as PieChartIcon, TrendingUp, ArrowUpRight, ArrowDownRight, Bot, X, CheckCircle, Target, Activity, Sun, Moon, ChevronRight, Award, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useTheme } from "next-themes";

import { useFinanceData } from "../hooks/useFinanceData";
import { useAIEngine, LessonContext, generateMonthlyReport } from "../hooks/useAIEngine";
import TransactionsTab from "../components/TransactionsTab";
import InvestmentsTab from "../components/InvestmentsTab";
import PlanningTab from "../components/PlanningTab";
import AuthModal from "../components/AuthModal";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  const [userLevel, setUserLevel] = useState(3);
  const [userExp, setUserExp] = useState(45);
  const [activeTab, setActiveTab] = useState("dashboard");

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Global Finance State
  const { 
    transactions, portfolio, goals, debts, badges, isLoaded, 
    addTransaction, buyCrypto, sellCrypto, addGoal, addFundsToGoal, addDebt, payDebt,
    totalBalance, monthlyExpense, totalDebts, finquestScore
  } = useFinanceData(user);

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  
  const aiLesson = useAIEngine(transactions, totalBalance, completedLessonIds);

  // Load gamification & onboarding progress
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    // Check Auth and merge with local storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      setIsAuthChecking(false);

      const localLevel = localStorage.getItem("fq_level");
      const localExp = localStorage.getItem("fq_exp");
      const localOnboarded = localStorage.getItem("fq_onboarded");
      const localLessons = localStorage.getItem("fq_completed_lessons");

      if (activeUser) {
        // Logged in: use Supabase metadata, fallback to local if Supabase is empty (migration)
        const meta = activeUser.user_metadata || {};
        const level = meta.fq_level || (localLevel ? parseInt(localLevel, 10) : 3);
        const exp = meta.fq_exp || (localExp ? parseInt(localExp, 10) : 45);
        const onboarded = meta.fq_onboarded || localOnboarded;
        const lessons = meta.fq_completed_lessons || (localLessons ? JSON.parse(localLessons) : []);

        setUserLevel(level);
        setUserExp(exp);
        if (!onboarded) setShowOnboarding(true);
        setCompletedLessonIds(lessons);

        // If data was only local, sync it up to Supabase now
        if (!meta.fq_level && localLevel) {
          supabase.auth.updateUser({
            data: { fq_level: level, fq_exp: exp, fq_onboarded: onboarded, fq_completed_lessons: lessons }
          });
        }
      } else {
        // Guest mode: strictly local storage
        if (localLevel) setUserLevel(parseInt(localLevel, 10));
        if (localExp) setUserExp(parseInt(localExp, 10));
        if (!localOnboarded) setShowOnboarding(true);
        if (localLessons) setCompletedLessonIds(JSON.parse(localLessons));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // When auth changes (e.g. login), reload page to sync properly
        window.location.reload();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleQuizComplete = async () => {
    setIsLessonOpen(false);
    
    let newCompleted = [...completedLessonIds];
    if (aiLesson) {
      newCompleted = [...completedLessonIds, aiLesson.id];
      setCompletedLessonIds(newCompleted);
      localStorage.setItem("fq_completed_lessons", JSON.stringify(newCompleted));
    }

    let newExp = userExp + 20;
    let newLevel = userLevel;
    if (newExp >= 100) {
      newLevel += 1;
      newExp = newExp - 100 + 5;
    } else {
      newExp = Math.min(newExp, 100);
    }
    setUserExp(newExp);
    setUserLevel(newLevel);
    
    localStorage.setItem("fq_level", newLevel.toString());
    localStorage.setItem("fq_exp", newExp.toString());

    if (user) {
      await supabase.auth.updateUser({
        data: { fq_level: newLevel, fq_exp: newExp, fq_completed_lessons: newCompleted }
      });
    }
  };

  const finishOnboarding = async () => {
    setShowOnboarding(false);
    localStorage.setItem("fq_onboarded", "true");
    if (user) {
      await supabase.auth.updateUser({ data: { fq_onboarded: "true" } });
    }
  };

  if (!isLoaded || !mounted) return <div className="flex items-center justify-center h-screen bg-background text-foreground">Yükleniyor...</div>;

  const portfolioTotal = portfolio.reduce((acc, p) => acc + (p.amount * p.averageBuyPrice), 0);
  const goalsTotal = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  
  const pieData = [
    { name: 'Nakit Bakiye', value: Math.max(0, totalBalance), color: '#3b82f6' },
    { name: 'Yatırımlar', value: portfolioTotal, color: '#10b981' },
    { name: 'Hedefler/Kumbara', value: goalsTotal, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  const assetDistribution = [
    { name: 'Kripto', value: portfolio.filter(p => !p.symbol.endsWith('.IS') && !['xau','xag','xpt','xpd','cop','brent'].includes(p.coinId)).reduce((acc, p) => acc + (p.amount * p.averageBuyPrice), 0), color: '#8b5cf6' },
    { name: 'BIST', value: portfolio.filter(p => p.symbol.endsWith('.IS')).reduce((acc, p) => acc + (p.amount * p.averageBuyPrice), 0), color: '#ec4899' },
    { name: 'Emtia', value: portfolio.filter(p => ['xau','xag','xpt','xpd','cop','brent'].includes(p.coinId)).reduce((acc, p) => acc + (p.amount * p.averageBuyPrice), 0), color: '#f59e0b' }
  ].filter(d => d.value > 0);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  if (isAuthChecking) return <div className="flex items-center justify-center h-screen bg-background text-foreground"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      
      {!user && <AuthModal onSuccess={() => {}} />}
      
      {/* Sidebar Navigation (Desktop) */}
      <aside className="w-64 border-r border-border bg-card p-6 hidden md:flex flex-col relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="FinQuest Logo" className="w-8 h-8 rounded-lg object-cover shadow-md shadow-primary/20" />
            <span className="text-xl font-bold tracking-tight">FinQuest</span>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem icon={<PieChartIcon className="w-5 h-5" />} label="Gösterge Paneli" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Target className="w-5 h-5" />} label="Planlama" active={activeTab === 'planning'} onClick={() => setActiveTab('planning')} />
          <NavItem icon={<TrendingUp className="w-5 h-5" />} label="Yatırımlar" active={activeTab === 'investments'} onClick={() => setActiveTab('investments')} />
          <NavItem icon={<Wallet className="w-5 h-5" />} label="İşlemlerim" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
        </nav>

        {/* Gamification Area */}
        <div className="mt-auto space-y-4">
          <div className="bg-secondary rounded-xl p-4">
            <div className="flex items-center justify-between text-sm font-medium mb-2">
              <span>Rozetler</span>
              <span className="text-primary">{badges.filter(b=>b.isUnlocked).length}/{badges.length}</span>
            </div>
            <div className="flex gap-2">
              {badges.map(b => (
                <div key={b.id} title={b.desc} className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${b.isUnlocked ? 'bg-primary/20 cursor-help' : 'bg-background grayscale opacity-40'}`}>
                  {b.icon}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-secondary rounded-xl">
            <div className="text-sm font-medium mb-1">Finansal Zeka</div>
            <div className="w-full bg-border rounded-full h-2 mb-2 overflow-hidden">
              <motion.div className="bg-primary h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${userExp}%` }} transition={{ duration: 1 }} />
            </div>
            <div className="text-xs text-muted-foreground text-right">Seviye {userLevel} Çırak</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6 p-6 lg:p-10 relative">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Hoş Geldin, Umut 👋</h1>
            <p className="text-muted-foreground mt-1">İşte bu ayki finansal özetin.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="md:hidden p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-semibold cursor-pointer hover:bg-border transition-colors">
              U
            </div>
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="text-xs font-bold text-destructive hover:underline hidden md:block"
            >
              Çıkış Yap
            </button>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <MetricCard title="Toplam Bakiye" amount={`₺${totalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`} trend={totalBalance >= 0 ? "Bakiye Pozitif" : "Bakiye Negatif"} isPositive={totalBalance >= 0} />
              <MetricCard title="Aylık Harcama" amount={`₺${monthlyExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`} trend="Geçmiş işlemlere göre" isPositive={false} />
              
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md col-span-1 md:col-span-2 relative overflow-hidden transition-colors">
                <div className="absolute right-6 top-6 bottom-6 w-32 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="z-10">
                  <div className="text-sm text-muted-foreground mb-2">Varlık Dağılımı</div>
                  <div className="space-y-1">
                    {pieData.length === 0 && <div className="text-sm font-bold opacity-50">Veri yok</div>}
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center gap-2 text-sm font-bold">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                        {d.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: FinQuest Score & AI */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* FinQuest Score */}
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm hover:shadow-md transition-colors">
                <h2 className="text-lg font-semibold w-full text-left mb-6 absolute top-6 left-6">FinQuest Skoru</h2>
                <div className="relative mt-12 mb-4">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-secondary" />
                    <circle 
                      cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" 
                      strokeDasharray="439.8" strokeDashoffset={439.8 - (439.8 * finquestScore) / 1000} 
                      strokeLinecap="round" 
                      className={`transition-all duration-1000 ease-out ${finquestScore > 700 ? 'text-emerald-500' : finquestScore > 400 ? 'text-primary' : 'text-rose-500'}`} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-black">{finquestScore}</div>
                    <div className="text-xs text-muted-foreground">/ 1000</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center px-4">Gelir, gider ve borç oranlarına göre hesaplanan finansal sağlık durumun.</p>
              </div>

              {/* AI Insight */}
              <div className="lg:col-span-2 bg-primary/10 border border-primary/20 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Bot className="w-32 h-32 text-primary" />
                </div>
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
                      <Bot className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-semibold text-primary">FinQuest AI</h2>
                  </div>
                  <button onClick={() => setIsReportOpen(true)} className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-primary/20 hover:scale-105 transition-transform cursor-pointer">
                    <Activity className="w-4 h-4" /> Aylık Karnemi Çıkar
                  </button>
                </div>
                
                <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50 relative z-10 flex-1 flex flex-col justify-center">
                  {aiLesson ? (
                    <>
                      <p className="text-sm font-medium mb-2">💡 Yeni Bir Tespitim Var!</p>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {aiLesson.alertMessage}
                      </p>
                      <button onClick={() => setIsLessonOpen(true)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer shadow-lg shadow-primary/20 mt-auto">
                        Eğitimi Görüntüle
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold mb-1">Tüm Eğitimleri Tamamladın!</p>
                      <p className="text-xs text-muted-foreground">Finansal zekan sınırları zorluyor. Yeni modüller çok yakında eklenecek.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Widgets: Asset Distribution & AI Picks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* Asset Distribution Pie Chart */}
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md relative overflow-hidden transition-colors h-64">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><PieChartIcon className="w-4 h-4 text-primary" /> Portföy Varlık Dağılımı</h3>
                <div className="flex-1 flex items-center">
                  <div className="w-1/2 h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={assetDistribution.length > 0 ? assetDistribution : [{ name: 'Boş', value: 1, color: '#334155' }]} innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                          {(assetDistribution.length > 0 ? assetDistribution : [{ name: 'Boş', value: 1, color: '#334155' }]).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        {assetDistribution.length > 0 && <RechartsTooltip formatter={(value: number) => `₺${value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />}
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 flex flex-col justify-center space-y-2 pl-4">
                    {assetDistribution.length === 0 && <div className="text-sm font-bold opacity-50">Henüz yatırım yok</div>}
                    {assetDistribution.map(d => (
                      <div key={d.name} className="flex items-center gap-2 text-sm font-bold">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}></div>
                        <span className="truncate">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top 3 AI Picks */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-colors h-64 flex flex-col">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> AI Fırsat Radarı (Top 3)</h3>
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {[
                    { name: 'Bitcoin', symbol: 'BTC', trend: '+4.2%', reason: 'Zaman serisi tahmini 30 günlük süreçte güçlü alım sinyali veriyor.', type: 'Kripto' },
                    { name: 'THY', symbol: 'THYAO.IS', trend: '+2.8%', reason: 'Teknik trend kırılımı ve RSI göstergelerinde pozitif uyumsuzluk.', type: 'BIST' },
                    { name: 'Gümüş', symbol: 'XAG', trend: '+1.5%', reason: 'Global momentum endeksi yükseliş eğilimini destekliyor.', type: 'Emtia' }
                  ].map((pick, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{pick.name}</span>
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase">{pick.type}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{pick.reason}</div>
                      </div>
                      <div className="text-emerald-500 font-bold text-sm flex-shrink-0">{pick.trend}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Badges (Mobile Only) */}
            <div className="md:hidden bg-card border border-border rounded-2xl p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Kazanılan Rozetler</h2>
                <span className="text-sm font-bold text-primary">{badges.filter(b=>b.isUnlocked).length}/{badges.length}</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {badges.map(b => (
                  <div key={b.id} className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border ${b.isUnlocked ? 'bg-primary/10 border-primary/30' : 'bg-secondary border-transparent opacity-50 grayscale'}`}>
                    <div className="text-3xl">{b.icon}</div>
                    <div className="text-[10px] font-bold text-center w-16 leading-tight">{b.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-card border border-border rounded-2xl p-6 transition-colors">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Son İşlemler</h2>
                <button onClick={() => setActiveTab('transactions')} className="text-sm font-medium text-primary hover:underline">Tümünü Gör</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transactions.slice(0, 4).map(tx => (
                  <TransactionItem key={tx.id} name={tx.name} category={tx.category} date={tx.date} amount={`${tx.amount > 0 ? '+' : ''}₺${Math.abs(tx.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`} isIncome={tx.amount > 0} />
                ))}
                {transactions.length === 0 && <div className="text-muted-foreground py-4">Henüz işlem bulunmuyor.</div>}
              </div>
            </div>

          </motion.div>
        )}

        {activeTab === "planning" && <PlanningTab goals={goals} debts={debts} totalBalance={totalBalance} addGoal={addGoal} addFundsToGoal={addFundsToGoal} addDebt={addDebt} payDebt={payDebt} />}
        {activeTab === "transactions" && <TransactionsTab transactions={transactions} onAddTransaction={addTransaction} />}
        {activeTab === "investments" && <InvestmentsTab portfolio={portfolio} onBuyCrypto={buyCrypto} onSellCrypto={sellCrypto} totalBalance={totalBalance} />}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 px-4 flex justify-between items-center z-40 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] transition-colors">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'}`}>
          <PieChartIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">Özet</span>
        </button>
        <button onClick={() => setActiveTab('planning')} className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'planning' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Target className="w-5 h-5" />
          <span className="text-[10px] font-bold">Plan</span>
        </button>
        <button onClick={() => setActiveTab('investments')} className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'investments' ? 'text-primary' : 'text-muted-foreground'}`}>
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-bold">Yatırım</span>
        </button>
        <button onClick={() => setActiveTab('transactions')} className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'transactions' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-bold">İşlem</span>
        </button>
      </nav>

      {/* AI Lesson Modal */}
      <AnimatePresence>
        {isLessonOpen && aiLesson && <LessonModal lesson={aiLesson} onClose={() => setIsLessonOpen(false)} onComplete={handleQuizComplete} />}
      </AnimatePresence>

      {/* AI Monthly Report Modal */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/50">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Activity className="w-5 h-5" /> Aylık Finansal Karne
                </div>
                <button onClick={() => setIsReportOpen(false)} className="p-1 hover:bg-border rounded-full transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 md:p-8">
                <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed font-medium">
                  {generateMonthlyReport(transactions, portfolio, totalBalance, totalDebts)}
                </div>
                <button onClick={() => setIsReportOpen(false)} className="w-full mt-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] cursor-pointer">
                  Raporu Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding Overlay Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden relative"
            >
              {/* Slides */}
              <div className="relative h-[450px]">
                <AnimatePresence mode="wait">
                  {onboardingStep === 0 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                      <img src="/logo.png" alt="FinQuest Logo" className="w-24 h-24 rounded-3xl shadow-xl shadow-primary/30 mb-8 transform rotate-12 object-cover" />
                      <h2 className="text-3xl font-black mb-4">FinQuest&apos;e<br/>Hoş Geldin</h2>
                      <p className="text-muted-foreground">Yeni nesil finansal asistanınla tanış. Cüzdanını sadece takip etme, onu büyütmeyi öğren.</p>
                    </motion.div>
                  )}
                  {onboardingStep === 1 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                      <Bot className="w-24 h-24 text-primary mb-8 animate-bounce" />
                      <h2 className="text-3xl font-black mb-4">Yapay Zeka<br/>Koçun Hazır</h2>
                      <p className="text-muted-foreground">Harcama alışkanlıklarını analiz eden ve seni eğiten akıllı bir motora sahipsin. Artık parayı yönetmek bir oyun.</p>
                    </motion.div>
                  )}
                  {onboardingStep === 2 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                      <Award className="w-24 h-24 text-primary mb-8" />
                      <h2 className="text-3xl font-black mb-4">Gerçekçi<br/>Simülasyon</h2>
                      <p className="text-muted-foreground">BIST, Kripto ve Emtia piyasalarında risksiz deneyim kazan. Rozetleri topla ve finansın ustası ol.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation & Dots */}
              <div className="px-8 pb-8 flex flex-col items-center">
                <div className="flex gap-2 mb-8">
                  {[0,1,2].map(i => (
                    <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === onboardingStep ? 'w-8 bg-primary' : 'w-2 bg-border'}`}></div>
                  ))}
                </div>
                {onboardingStep < 2 ? (
                  <button onClick={() => setOnboardingStep(s=>s+1)} className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                    Devam Et <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button onClick={finishOnboarding} className="w-full bg-foreground text-background font-bold py-4 rounded-2xl flex items-center justify-center hover:opacity-90 transition-opacity">
                    Hemen Başla 🚀
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Subcomponents
function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium cursor-pointer ${active ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
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
          <div className="font-medium text-sm md:text-base truncate max-w-[120px] sm:max-w-[150px]">{name}</div>
          <div className="text-xs text-muted-foreground">{category} • {date}</div>
        </div>
      </div>
      <div className={`font-bold ${isIncome ? 'text-emerald-500' : ''}`}>
        {amount}
      </div>
    </div>
  );
}

function LessonModal({ lesson, onClose, onComplete }: { lesson: LessonContext; onClose: () => void; onComplete: () => void }) {
  const [step, setStep] = useState<"lesson" | "quiz" | "success">("lesson");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const handleAnswerSubmit = () => { if (selectedAnswer === lesson.correctAnswerIdx) setStep("success"); else alert("Tekrar düşün! Yanlış cevap verdin."); }
  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border overflow-hidden">
           <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/50">
             <div className="flex items-center gap-2 text-primary font-bold"><Bot className="w-5 h-5" /> AI Eğitim Modülü</div>
             <button onClick={onClose} className="p-1 hover:bg-border rounded-full transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
           </div>
           <div className="p-6 md:p-8">
             {step === "lesson" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <h2 className="text-2xl font-bold mb-4">{lesson.title}</h2>
                   <p className="text-muted-foreground mb-6 leading-relaxed text-lg">{lesson.description}</p>
                   <button onClick={() => setStep("quiz")} className="w-full py-3 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer mt-4">Anladım, Teste Geç</button>
                </motion.div>
             )}
             {step === "quiz" && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                   <h2 className="text-xl font-bold mb-6">Hızlı Soru 🧠</h2>
                   <p className="font-medium mb-4">{lesson.question}</p>
                   <div className="space-y-3 mb-6">
                      {lesson.options.map((answer, idx) => (
                        <button key={idx} onClick={() => setSelectedAnswer(idx)} className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer font-medium ${selectedAnswer === idx ? 'border-primary bg-primary/5 shadow-inner' : 'border-border hover:border-primary/50 hover:bg-secondary/20'}`}>{answer}</button>
                      ))}
                   </div>
                   <button disabled={selectedAnswer === null} onClick={handleAnswerSubmit} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer">Cevabı Onayla</button>
                </motion.div>
             )}
             {step === "success" && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                   <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: "spring", stiffness: 200, damping: 10 }} className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10" /></motion.div>
                   <h2 className="text-2xl font-bold mb-2">Tebrikler! 🎉</h2>
                   <p className="text-muted-foreground mb-6">Doğru cevap. Finansal zeka puanın +20 XP arttı.</p>
                   <button onClick={onComplete} className="w-full py-3 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer shadow-lg">Ödülümü Al ve Kapat</button>
                </motion.div>
             )}
           </div>
        </motion.div>
     </div>
  );
}
