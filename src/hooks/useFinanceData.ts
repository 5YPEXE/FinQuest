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

export function useFinanceData() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTx = localStorage.getItem('fq_transactions');
    const savedPortfolio = localStorage.getItem('fq_portfolio');
    
    if (savedTx) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTransactions(JSON.parse(savedTx));
    } else {
      // Varsayılan başlangıç verisi (İlk defa giren kullanıcı boş ekran görmesin diye)
      const defaultTx: Transaction[] = [
        { id: '1', name: 'Başlangıç Bakiyesi', category: 'Gelir', amount: 15000, date: new Date().toLocaleDateString('tr-TR'), type: 'income' }
      ];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTransactions(defaultTx);
      localStorage.setItem('fq_transactions', JSON.stringify(defaultTx));
    }

    if (savedPortfolio) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPortfolio(JSON.parse(savedPortfolio));
    }
    
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

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx = [{ ...tx, id: Date.now().toString() }, ...transactions];
    saveTransactions(newTx);
  };

  const buyCrypto = (coinId: string, symbol: string, name: string, priceTry: number, amountTry: number) => {
    // 1. İşlemlere yatırımı ekle (Ana bakiyeden düşer)
    addTransaction({
      name: `${name} Alımı`,
      category: 'Yatırım',
      amount: -amountTry,
      date: new Date().toLocaleDateString('tr-TR'),
      type: 'investment'
    });

    // 2. Portföyü güncelle
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

    // 1. İşlemlere geliri ekle
    addTransaction({
      name: `${name} Satışı`,
      category: 'Yatırım Getirisi',
      amount: valueInTry,
      date: new Date().toLocaleDateString('tr-TR'),
      type: 'income'
    });

    // 2. Portföyden düş
    const newPortfolio = portfolio.map(p => {
      if (p.coinId === coinId) {
        return { ...p, amount: p.amount - amountToSellCoin };
      }
      return p;
    }).filter(p => p.amount > 0.000001); // Sıfıra yakınsa listeden çıkar

    savePortfolio(newPortfolio);
    return true;
  };

  const totalBalance = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const monthlyExpense = transactions.filter(t => t.amount < 0 && t.type === 'expense').reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

  return {
    transactions,
    portfolio,
    isLoaded,
    addTransaction,
    buyCrypto,
    sellCrypto,
    totalBalance,
    monthlyExpense
  };
}
