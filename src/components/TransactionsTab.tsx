import { useState } from 'react';
import { Wallet, TrendingUp, Plus, X } from 'lucide-react';
import { Transaction } from '../hooks/useFinanceData';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionsTab({ 
  transactions, 
  onAddTransaction 
}: { 
  transactions: Transaction[], 
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !name || !category) return;

    const numAmount = parseFloat(amount);
    onAddTransaction({
      name,
      category,
      amount: type === 'expense' ? -numAmount : numAmount,
      date: new Date().toLocaleDateString('tr-TR'),
      type
    });

    setIsModalOpen(false);
    setAmount('');
    setName('');
    setCategory('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tüm İşlemler</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Yeni İşlem Ekle
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Henüz hiç işlem bulunmuyor.</div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-secondary text-foreground'}`}>
                    {tx.amount > 0 ? <TrendingUp className="w-5 h-5" /> : (tx.type === 'investment' ? <PieChartIcon className="w-5 h-5" /> : <Wallet className="w-5 h-5" />)}
                  </div>
                  <div>
                    <div className="font-medium text-sm md:text-base">{tx.name}</div>
                    <div className="text-xs text-muted-foreground">{tx.category} • {tx.date}</div>
                  </div>
                </div>
                <div className={`font-bold ${tx.amount > 0 ? 'text-emerald-500' : ''}`}>
                  {tx.amount > 0 ? '+' : ''}₺{Math.abs(tx.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden"
            >
              <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/50">
                <h3 className="font-bold">Yeni İşlem Ekle</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-border rounded-full transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="flex gap-2 p-1 bg-secondary rounded-xl">
                  <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'expense' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Gider</button>
                  <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'income' ? 'bg-emerald-500 text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}>Gelir</button>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Tutar (₺)</label>
                  <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-lg" />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Başlık</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Market Alışverişi" className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Kategori</label>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors appearance-none">
                    <option value="" disabled>Kategori Seçin</option>
                    {type === 'expense' ? (
                      <>
                        <option value="Gıda & Market">Gıda & Market</option>
                        <option value="Yeme İçme">Yeme İçme</option>
                        <option value="Ulaşım">Ulaşım</option>
                        <option value="Faturalar">Faturalar</option>
                        <option value="Eğlence">Eğlence</option>
                        <option value="Diğer">Diğer</option>
                      </>
                    ) : (
                      <>
                        <option value="Maaş">Maaş</option>
                        <option value="Serbest Çalışma">Serbest Çalışma</option>
                        <option value="Yatırım Getirisi">Yatırım Getirisi</option>
                        <option value="Diğer">Diğer</option>
                      </>
                    )}
                  </select>
                </div>

                <button type="submit" className="w-full py-3 mt-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] cursor-pointer">
                  İşlemi Kaydet
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Just a tiny pie chart icon replacement for investments if wallet isn't fitting
function PieChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}
