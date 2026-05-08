"use client";

import { Wallet, PieChart, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Bot } from "lucide-react";

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Navigation (Mock) */}
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
          <div className="w-full bg-border rounded-full h-2 mb-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: "45%" }}></div>
          </div>
          <div className="text-xs text-muted-foreground text-right">Seviye 3 Çırak</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Hoş Geldin, Umut 👋</h1>
            <p className="text-muted-foreground mt-1">İşte bu ayki finansal özetin.</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-semibold">
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
                Bu ay dışarıda kahveye geçen aya göre <strong>%40 daha fazla</strong> harcadığını fark ettim. "Latte Faktörü" hakkında kısa bir eğitim almak ister misin?
              </p>
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                Latte Faktörünü Öğren
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Subcomponents for cleaner code
function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
        active
          ? "bg-primary text-primary-foreground"
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
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between">
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
    <div className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-xl transition-colors">
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
