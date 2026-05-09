import { useState, useEffect } from 'react';

export type Transaction = {
  id: string;
  name: string;
  category: string;
  amount: number; // positive for income, negative for expense
  date: string;
  type: 'income' | 'expense' | 'investment';
};

export type PortfolioItem = {
  coinId: string;
  symbol: string;
  name: string;
  amount: number; // how much coin they own
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

export function useFinanceData() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTx = localStorage.getItem('fq_transactions');
    const savedPortfolio = localStorage.getItem('fq_portfolio');
    const savedGoals = localStorage.getItem('fq_goals');
    const savedDebts = localStorage.getItem('fq_debts');
    
    if (savedTx) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTransactions(JSON.parse(savedTx));
    } else {
      const defaultTx: Transaction[] = [
        { id: '1', name: 'Başlangıç Bakiyesi', category: 'Gelir', amount: 15000, date: new Date().toLocaleDateString('tr-TR'), type: 'income' }
      ];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTransactions(defaultTx);
      localStorage.setItem('fq_transactions', JSON.stringify(defaultTx));
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedDebts) setDebts(JSON.parse(savedDebts));
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  const saveTransactions = (newTx: Transaction[]) => {
    setTransactions(newTx);
    localStorage.setItem('fq_transactions', JSON.stringify(newTx));
  };

  const savePortfolio = (newPortfolio: PortfolioItem[]) => {
    setPortfolio(newPortfolio);
    localStorage.setItem('fq_portfolio', JSON.stringify(newPortfolio));
  };

  const saveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem('fq_goals', JSON.stringify(newGoals));
  };

  const saveDebts = (newDebts: Debt[]) => {
    setDebts(newDebts);
    localStorage.setItem('fq_debts', JSON.stringify(newDebts));
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx = [{ ...tx, id: Date.now().toString() }, ...transactions];
    saveTransactions(newTx);
  };

  // Goals
  const addGoal = (goal: Omit<Goal, 'id' | 'currentAmount' | 'isCompleted'>) => {
    saveGoals([...goals, { ...goal, id: Date.now().toString(), currentAmount: 0, isCompleted: false }]);
  };

  const addFundsToGoal = (goalId: string, amount: number) => {
    // Para ana bakiyeden düşmeli
    addTransaction({
      name: `Kumbara: Hedefe Aktarım`,
      category: 'Birikim',
      amount: -amount,
      date: new Date().toLocaleDateString('tr-TR'),
      type: 'expense'
    });

    const newGoals = goals.map(g => {
      if (g.id === goalId) {
        const newAmount = g.currentAmount + amount;
        return { ...g, currentAmount: newAmount, isCompleted: newAmount >= g.targetAmount };
      }
      return g;
    });
    saveGoals(newGoals);
  };

  // Debts
  const addDebt = (debt: Omit<Debt, 'id'>) => {
    saveDebts([...debts, { ...debt, id: Date.now().toString() }]);
  };

  const payDebt = (debtId: string, amount: number) => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    addTransaction({
      name: `Borç Ödemesi: ${debt.name}`,
      category: 'Borç Ödemesi',
      amount: -amount,
      date: new Date().toLocaleDateString('tr-TR'),
      type: 'expense'
    });

    const newDebts = debts.map(d => {
      if (d.id === debtId) {
        return { ...d, amount: Math.max(0, d.amount - amount) };
      }
      return d;
    }).filter(d => d.amount > 0);
    saveDebts(newDebts);
  };

  const buyCrypto = (coinId: string, symbol: string, name: string, priceTry: number, amountTry: number) => {
    addTransaction({
      name: `${name} Alımı`,
      category: 'Yatırım',
      amount: -amountTry,
      date: new Date().toLocaleDateString('tr-TR'),
      type: 'investment'
    });

    const coinAmount = amountTry / priceTry;
    const existing = portfolio.find(p => p.coinId === coinId);
    let newPortfolio;
    
    if (existing) {
      newPortfolio = portfolio.map(p => {
        if (p.coinId === coinId) {
          const totalCost = (p.amount * p.averageBuyPrice) + amountTry;
          const newTotalAmount = p.amount + coinAmount;
          return {
            ...p,
            amount: newTotalAmount,
            averageBuyPrice: totalCost / newTotalAmount
          };
        }
        return p;
      });
    } else {
      newPortfolio = [...portfolio, { coinId, symbol, name, amount: coinAmount, averageBuyPrice: priceTry }];
    }
    savePortfolio(newPortfolio);
  };

  const sellCrypto = (coinId: string, name: string, amountToSellCoin: number, currentPriceTry: number) => {
    const existing = portfolio.find(p => p.coinId === coinId);
    if (!existing || existing.amount < amountToSellCoin) return false;

    const valueInTry = amountToSellCoin * currentPriceTry;

    addTransaction({
      name: `${name} Satışı`,
      category: 'Yatırım Getirisi',
      amount: valueInTry,
      date: new Date().toLocaleDateString('tr-TR'),
      type: 'income'
    });

    const newPortfolio = portfolio.map(p => {
      if (p.coinId === coinId) {
        return { ...p, amount: p.amount - amountToSellCoin };
      }
      return p;
    }).filter(p => p.amount > 0.000001);

    savePortfolio(newPortfolio);
    return true;
  };

  const totalBalance = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const monthlyExpense = transactions.filter(t => t.amount < 0 && t.type === 'expense').reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
  const totalDebts = debts.reduce((acc, d) => acc + d.amount, 0);

  // FinQuest Skoru (0-1000)
  // Basit algoritma: 500 başlangıç + (Toplam Varlık) - (Toplam Borç). 
  // Min 0, Max 1000.
  const calculateScore = () => {
    let score = 500;
    // Puan ekleyenler
    score += (totalBalance / 1000); 
    score += (portfolio.length * 50); // Çeşitlilik
    // Puan düşürenler
    score -= (totalDebts / 500); 
    
    return Math.min(1000, Math.max(0, Math.floor(score)));
  };

  return {
    transactions,
    portfolio,
    goals,
    debts,
    isLoaded,
    addTransaction,
    buyCrypto,
    sellCrypto,
    addGoal,
    addFundsToGoal,
    addDebt,
    payDebt,
    totalBalance,
    monthlyExpense,
    totalDebts,
    finquestScore: calculateScore()
  };
}
