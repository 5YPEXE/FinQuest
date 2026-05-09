import { useState } from 'react';
import { motion } from 'framer-motion';
import { Goal, Debt } from '../hooks/useFinanceData';
import { Target, CreditCard, Plus, CheckCircle2, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PlanningTab({
  goals,
  debts,
  totalBalance,
  addGoal,
  addFundsToGoal,
  addDebt,
  payDebt
}: {
  goals: Goal[];
  debts: Debt[];
  totalBalance: number;
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount' | 'isCompleted'>) => void;
  addFundsToGoal: (goalId: string, amount: number) => void;
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  payDebt: (debtId: string, amount: number) => void;
}) {
  // Goal Modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalIcon, setGoalIcon] = useState('🚗');

  // Debt Modal
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [debtName, setDebtName] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtType, setDebtType] = useState<'credit_card' | 'loan'>('credit_card');

  // Fund Modal
  const [fundGoalId, setFundGoalId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');

  // Pay Debt Modal
  const [payDebtId, setPayDebtId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTarget) return;
    addGoal({ name: goalName, targetAmount: parseFloat(goalTarget), icon: goalIcon });
    setShowGoalModal(false);
    setGoalName('');
    setGoalTarget('');
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtName || !debtAmount) return;
    addDebt({ name: debtName, amount: parseFloat(debtAmount), type: debtType });
    setShowDebtModal(false);
    setDebtName('');
    setDebtAmount('');
  };

  const handleFundGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundGoalId || !fundAmount) return;
    
    const amount = parseFloat(fundAmount);
    if (amount > totalBalance) {
      alert("Yetersiz bakiye!");
      return;
    }

    addFundsToGoal(fundGoalId, amount);
    
    // Check if goal is met to trigger confetti
    const goal = goals.find(g => g.id === fundGoalId);
    if (goal && goal.currentAmount + amount >= goal.targetAmount) {
      triggerConfetti();
    }

    setFundGoalId(null);
    setFundAmount('');
  };

  const handlePayDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payDebtId || !payAmount) return;
    
    const amount = parseFloat(payAmount);
    if (amount > totalBalance) {
      alert("Yetersiz bakiye!");
      return;
    }

    payDebt(payDebtId, amount);
    setPayDebtId(null);
    setPayAmount('');
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="pb-10">
      <h2 className="text-2xl font-bold mb-6">Planlama & Hedefler</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Hedefler (Kumbaralar) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Target className="text-primary w-6 h-6" /> Kumbaram
            </h3>
            <button onClick={() => setShowGoalModal(true)} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-primary hover:text-white transition-colors">
              <Plus className="w-4 h-4" /> Hedef Ekle
            </button>
          </div>

          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                Henüz bir birikim hedefi belirlemedin. Hayalini kurduğun bir şeyi ekle!
              </div>
            ) : (
              goals.map(goal => {
                const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                return (
                  <div key={goal.id} className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden">
                    {goal.isCompleted && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Tamamlandı
                      </div>
                    )}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl bg-secondary w-16 h-16 flex items-center justify-center rounded-2xl shrink-0">
                        {goal.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{goal.name}</h4>
                        <div className="text-sm text-muted-foreground flex justify-between mt-1">
                          <span>{goal.currentAmount.toLocaleString('tr-TR')} ₺</span>
                          <span>Hedef: {goal.targetAmount.toLocaleString('tr-TR')} ₺</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-3 bg-secondary rounded-full overflow-hidden mb-4">
                      <div className={`h-full transition-all duration-1000 ${goal.isCompleted ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${percent}%` }}></div>
                    </div>

                    {!goal.isCompleted && (
                      <button onClick={() => setFundGoalId(goal.id)} className="w-full py-2 bg-secondary text-foreground font-bold rounded-xl hover:bg-primary hover:text-white transition-colors text-sm">
                        Para Ekle
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Borçlar */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="text-rose-500 w-6 h-6" /> Kredi & Borçlar
            </h3>
            <button onClick={() => setShowDebtModal(true)} className="flex items-center gap-1 bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-rose-500 hover:text-white transition-colors">
              <Plus className="w-4 h-4" /> Borç Ekle
            </button>
          </div>

          <div className="space-y-4">
            {debts.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3 opacity-50" />
                Harika! Hiç borcun görünmüyor.
              </div>
            ) : (
              debts.map(debt => (
                <div key={debt.id} className="bg-card border border-rose-500/20 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">{debt.name}</h4>
                      <div className="text-xs text-muted-foreground capitalize">{debt.type === 'credit_card' ? 'Kredi Kartı' : 'Kredi/Borç'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-rose-500 mb-1">{debt.amount.toLocaleString('tr-TR')} ₺</div>
                    <button onClick={() => setPayDebtId(debt.id)} className="text-xs font-bold px-3 py-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
                      Ödeme Yap
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 border border-border shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Yeni Hedef Ekle</h3>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Hedef Adı (Örn: Araba, Tatil)</label>
                <input required value={goalName} onChange={e=>setGoalName(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-2 outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Hedef Tutar (₺)</label>
                <input required type="number" value={goalTarget} onChange={e=>setGoalTarget(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-2 outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Emoji İkonu</label>
                <input required value={goalIcon} onChange={e=>setGoalIcon(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-2 outline-none text-2xl" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={()=>setShowGoalModal(false)} className="flex-1 py-2 rounded-xl bg-secondary font-bold">İptal</button>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-primary text-white font-bold">Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDebtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 border border-border shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Yeni Borç Ekle</h3>
            <form onSubmit={handleAddDebt} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Borç Adı</label>
                <input required value={debtName} onChange={e=>setDebtName(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-2 outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Tutar (₺)</label>
                <input required type="number" value={debtAmount} onChange={e=>setDebtAmount(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-2 outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Tür</label>
                <select value={debtType} onChange={e=>setDebtType(e.target.value as 'credit_card' | 'loan')} className="w-full bg-secondary border border-border rounded-xl px-4 py-2 outline-none">
                  <option value="credit_card">Kredi Kartı</option>
                  <option value="loan">Kredi / Diğer</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={()=>setShowDebtModal(false)} className="flex-1 py-2 rounded-xl bg-secondary font-bold">İptal</button>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-rose-500 text-white font-bold">Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {fundGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 border border-border shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Kumbara&apos;ya Para At</h3>
            <div className="text-sm text-muted-foreground mb-4">Kullanılabilir Bakiye: {totalBalance.toLocaleString('tr-TR')} ₺</div>
            <form onSubmit={handleFundGoal} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Yatırılacak Tutar (₺)</label>
                <input required type="number" max={totalBalance} value={fundAmount} onChange={e=>setFundAmount(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-2 outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={()=>setFundGoalId(null)} className="flex-1 py-2 rounded-xl bg-secondary font-bold">İptal</button>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-primary text-white font-bold">Yatır</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {payDebtId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 border border-border shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Borç Öde</h3>
            <div className="text-sm text-muted-foreground mb-4">Kullanılabilir Bakiye: {totalBalance.toLocaleString('tr-TR')} ₺</div>
            <form onSubmit={handlePayDebt} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Ödenecek Tutar (₺)</label>
                <input required type="number" max={totalBalance} value={payAmount} onChange={e=>setPayAmount(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-2 outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={()=>setPayDebtId(null)} className="flex-1 py-2 rounded-xl bg-secondary font-bold">İptal</button>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-rose-500 text-white font-bold">Öde</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </motion.div>
  );
}
