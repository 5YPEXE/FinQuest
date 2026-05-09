import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export type Transaction = {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  type: 'income' | 'expense' | 'investment';
};

export type PortfolioItem = {
  id?: string;
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  averageBuyPrice: number;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  isCompleted: boolean;
};

export type Debt = {
  id: string;
  name: string;
  amount: number;
  type: 'credit_card' | 'loan';
};

export type Badge = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  isUnlocked: boolean;
};

export function useFinanceData(user: User | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoaded(false);
      if (user) {
        // Fetch from Supabase
        const [txRes, pfRes, glRes, dbRes] = await Promise.all([
          supabase.from('transactions').select('*').order('created_at', { ascending: false }),
          supabase.from('portfolios').select('*'),
          supabase.from('goals').select('*'),
          supabase.from('debts').select('*')
        ]);

        if (txRes.data) {
          setTransactions(txRes.data.map((t: any) => ({
            id: t.id, name: t.name, category: t.category, amount: Number(t.amount), date: t.date, type: t.type
          })));
        }
        if (pfRes.data) {
          setPortfolio(pfRes.data.map((p: any) => ({
            id: p.id, coinId: p.coin_id, symbol: p.symbol, name: p.name, amount: Number(p.amount), averageBuyPrice: Number(p.average_buy_price)
          })));
        }
        if (glRes.data) {
          setGoals(glRes.data.map((g: any) => ({
            id: g.id, name: g.name, targetAmount: Number(g.target_amount), currentAmount: Number(g.current_amount), icon: g.icon, isCompleted: g.is_completed
          })));
        }
        if (dbRes.data) {
          setDebts(dbRes.data.map((d: any) => ({
            id: d.id, name: d.name, amount: Number(d.amount), type: d.type
          })));
        }
      } else {
        // Fetch from Local Storage
        const savedTx = localStorage.getItem('fq_transactions');
        const savedPortfolio = localStorage.getItem('fq_portfolio');
        const savedGoals = localStorage.getItem('fq_goals');
        const savedDebts = localStorage.getItem('fq_debts');
        
        if (savedTx) {
          setTransactions(JSON.parse(savedTx));
        } else {
          const defaultTx: Transaction[] = [
            { id: '1', name: 'Başlangıç Bakiyesi', category: 'Gelir', amount: 15000, date: new Date().toLocaleDateString('tr-TR'), type: 'income' }
          ];
          setTransactions(defaultTx);
          localStorage.setItem('fq_transactions', JSON.stringify(defaultTx));
        }

        if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
        if (savedGoals) setGoals(JSON.parse(savedGoals));
        if (savedDebts) setDebts(JSON.parse(savedDebts));
      }
      setIsLoaded(true);
    };

    loadData();
  }, [user]);

  // Modifiers
  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    if (user) {
      const { data } = await supabase.from('transactions').insert([{
        user_id: user.id,
        name: tx.name,
        category: tx.category,
        amount: tx.amount,
        date: tx.date,
        type: tx.type
      }]).select();
      if (data) {
        setTransactions([{
          id: data[0].id, name: data[0].name, category: data[0].category, amount: Number(data[0].amount), date: data[0].date, type: data[0].type
        }, ...transactions]);
      }
    } else {
      const newTx = [{ ...tx, id: Date.now().toString() }, ...transactions];
      setTransactions(newTx);
      localStorage.setItem('fq_transactions', JSON.stringify(newTx));
    }
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'currentAmount' | 'isCompleted'>) => {
    if (user) {
      const { data } = await supabase.from('goals').insert([{
        user_id: user.id,
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: 0,
        icon: goal.icon,
        is_completed: false
      }]).select();
      if (data) {
        setGoals([...goals, {
          id: data[0].id, name: data[0].name, targetAmount: Number(data[0].target_amount), currentAmount: Number(data[0].current_amount), icon: data[0].icon, isCompleted: data[0].is_completed
        }]);
      }
    } else {
      const newGoals = [...goals, { ...goal, id: Date.now().toString(), currentAmount: 0, isCompleted: false }];
      setGoals(newGoals);
      localStorage.setItem('fq_goals', JSON.stringify(newGoals));
    }
  };

  const addFundsToGoal = async (goalId: string, amount: number) => {
    await addTransaction({
      name: `Kumbara: Hedefe Aktarım`,
      category: 'Birikim',
      amount: -amount,
      date: new Date().toLocaleDateString('tr-TR'),
      type: 'expense'
    });

    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const newAmount = goal.currentAmount + amount;
    const isCompleted = newAmount >= goal.targetAmount;

    if (user) {
      await supabase.from('goals').update({ current_amount: newAmount, is_completed: isCompleted }).eq('id', goalId);
    }
    
    const newGoals = goals.map(g => g.id === goalId ? { ...g, currentAmount: newAmount, isCompleted } : g);
    setGoals(newGoals);
    if (!user) localStorage.setItem('fq_goals', JSON.stringify(newGoals));
  };

  const addDebt = async (debt: Omit<Debt, 'id'>) => {
    if (user) {
      const { data } = await supabase.from('debts').insert([{
        user_id: user.id,
        name: debt.name,
        amount: debt.amount,
        type: debt.type
      }]).select();
      if (data) {
        setDebts([...debts, { id: data[0].id, name: data[0].name, amount: Number(data[0].amount), type: data[0].type }]);
      }
    } else {
      const newDebts = [...debts, { ...debt, id: Date.now().toString() }];
      setDebts(newDebts);
      localStorage.setItem('fq_debts', JSON.stringify(newDebts));
    }
  };

  const payDebt = async (debtId: string, amount: number) => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    await addTransaction({
      name: `Borç Ödemesi: ${debt.name}`,
      category: 'Borç Ödemesi',
      amount: -amount,
      date: new Date().toLocaleDateString('tr-TR'),
      type: 'expense'
    });

    const newAmount = Math.max(0, debt.amount - amount);

    if (user) {
      if (newAmount === 0) {
        await supabase.from('debts').delete().eq('id', debtId);
      } else {
        await supabase.from('debts').update({ amount: newAmount }).eq('id', debtId);
      }
    }

    const newDebts = debts.map(d => d.id === debtId ? { ...d, amount: newAmount } : d).filter(d => d.amount > 0);
    setDebts(newDebts);
    if (!user) localStorage.setItem('fq_debts', JSON.stringify(newDebts));
  };

  const buyCrypto = async (coinId: string, symbol: string, name: string, priceTry: number, amountTry: number) => {
    await addTransaction({
      name: `${name} Alımı`,
      category: 'Yatırım',
      amount: -amountTry,
      date: new Date().toLocaleDateString('tr-TR'),
      type: 'investment'
    });

    const coinAmount = amountTry / priceTry;
    const existing = portfolio.find(p => p.coinId === coinId);
    
    let newPortfolio = [...portfolio];

    if (existing) {
      const totalCost = (existing.amount * existing.averageBuyPrice) + amountTry;
      const newTotalAmount = existing.amount + coinAmount;
      const newAvgPrice = totalCost / newTotalAmount;

      if (user && existing.id) {
        await supabase.from('portfolios').update({ amount: newTotalAmount, average_buy_price: newAvgPrice }).eq('id', existing.id);
      }

      newPortfolio = portfolio.map(p => p.coinId === coinId ? { ...p, amount: newTotalAmount, averageBuyPrice: newAvgPrice } : p);
    } else {
      if (user) {
        const { data } = await supabase.from('portfolios').insert([{
          user_id: user.id, coin_id: coinId, symbol, name, amount: coinAmount, average_buy_price: priceTry
        }]).select();
        if (data) {
          newPortfolio.push({ id: data[0].id, coinId, symbol, name, amount: Number(data[0].amount), averageBuyPrice: Number(data[0].average_buy_price) });
        }
      } else {
        newPortfolio.push({ coinId, symbol, name, amount: coinAmount, averageBuyPrice: priceTry });
      }
    }

    setPortfolio(newPortfolio);
    if (!user) localStorage.setItem('fq_portfolio', JSON.stringify(newPortfolio));
  };

  const sellCrypto = async (coinId: string, name: string, amountToSellCoin: number, currentPriceTry: number) => {
    const existing = portfolio.find(p => p.coinId === coinId);
    if (!existing || existing.amount < amountToSellCoin) return false;

    const valueInTry = amountToSellCoin * currentPriceTry;

    await addTransaction({
      name: `${name} Satışı`,
      category: 'Yatırım Getirisi',
      amount: valueInTry,
      date: new Date().toLocaleDateString('tr-TR'),
      type: 'income'
    });

    const remainingAmount = existing.amount - amountToSellCoin;

    if (user && existing.id) {
      if (remainingAmount <= 0.000001) {
        await supabase.from('portfolios').delete().eq('id', existing.id);
      } else {
        await supabase.from('portfolios').update({ amount: remainingAmount }).eq('id', existing.id);
      }
    }

    const newPortfolio = portfolio.map(p => p.coinId === coinId ? { ...p, amount: remainingAmount } : p).filter(p => p.amount > 0.000001);
    
    setPortfolio(newPortfolio);
    if (!user) localStorage.setItem('fq_portfolio', JSON.stringify(newPortfolio));
    return true;
  };

  const totalBalance = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const monthlyExpense = transactions.filter(t => t.amount < 0 && t.type === 'expense').reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
  const totalDebts = debts.reduce((acc, d) => acc + d.amount, 0);

  const calculateScore = () => {
    let score = 500;
    score += (totalBalance / 1000); 
    score += (portfolio.length * 50); 
    score -= (totalDebts / 500); 
    return Math.min(1000, Math.max(0, Math.floor(score)));
  };

  const badges: Badge[] = [
    { id: 'first_blood', name: 'İlk Kan', desc: 'İlk gelirini veya giderini ekledin', icon: '🪙', isUnlocked: transactions.length > 1 },
    { id: 'investor', name: 'Kurt Vps', desc: 'İlk yatırımını yaptın', icon: '📈', isUnlocked: transactions.some(t => t.type === 'investment') },
    { id: 'goal_achiever', name: 'Tasarruf Şampiyonu', desc: 'Bir kumbarayı tamamen doldurdun', icon: '🎯', isUnlocked: goals.some(g => g.isCompleted) },
    { id: 'debt_destroyer', name: 'Borç Yok Edici', desc: 'Bir borcunu sıfırladın', icon: '🛡️', isUnlocked: transactions.some(t => t.category === 'Borç Ödemesi') },
  ];

  return {
    transactions, portfolio, goals, debts, badges, isLoaded,
    addTransaction, buyCrypto, sellCrypto, addGoal, addFundsToGoal, addDebt, payDebt,
    totalBalance, monthlyExpense, totalDebts, finquestScore: calculateScore()
  };
}
