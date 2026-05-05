/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  History, 
  Calendar,
  X,
  ChevronRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import { format, subWeeks, subMonths, subYears, isAfter, parseISO, startOfDay } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CATEGORIES, PERIODS, Period } from './constants';
import { Transaction, Category, TransactionType } from './types';
import FinancialChart from './components/Chart';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('restaurant');
  const [activePeriod, setActivePeriod] = useState<Period>('month');
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState<{
    amount: string;
    type: TransactionType;
    description: string;
  }>({
    amount: '',
    type: 'income',
    description: '',
  });

  // Telegram WebApp Setup
  useEffect(() => {
    if ((window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.expand();
      tg.ready();
    }
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.category === activeCategory);
  }, [transactions, activeCategory]);

  const periodTransactions = useMemo(() => {
    const now = new Date();
    let limitDate = subMonths(now, 1);
    
    if (activePeriod === 'day') limitDate = startOfDay(now);
    if (activePeriod === 'week') limitDate = subWeeks(now, 1);
    if (activePeriod === 'year') limitDate = subYears(now, 1);
    
    return filteredTransactions.filter(t => isAfter(parseISO(t.date), limitDate))
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [filteredTransactions, activePeriod]);

  // Stats
  const stats = useMemo(() => {
    const income = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [periodTransactions]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.amount || !newTransaction.description) return;

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      amount: parseFloat(newTransaction.amount),
      type: newTransaction.type,
      category: activeCategory,
      description: newTransaction.description,
      date: new Date().toISOString(),
    };

    setTransactions(prev => [transaction, ...prev]);
    setNewTransaction({ amount: '', type: 'income', description: '' });
    setShowAddModal(false);
  };

  const currentCategoryObj = CATEGORIES.find(c => c.id === activeCategory)!;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-indigo-100 flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar Nav */}
      <nav className="hidden md:flex fixed top-0 bottom-0 left-0 w-64 bg-slate-900 flex-col border-r border-slate-800 z-30 transition-all">
        <div className="p-8">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg mb-4 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
            M
          </div>
          <h1 className="text-white font-bold tracking-tight text-lg">Moliya Nazorati</h1>
          <p className="text-slate-400 text-[10px] mt-1 uppercase tracking-widest font-bold">Boshqaruv Paneli</p>
        </div>
        
        <div className="flex-1 px-4 space-y-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                activeCategory === cat.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <cat.icon size={20} className={cn("shrink-0", activeCategory === cat.id ? "text-white" : "opacity-40")} />
              <span className="font-medium text-sm">{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 mt-auto">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-[10px] space-y-1.5 overflow-hidden">
            <p className="text-slate-500 uppercase font-bold tracking-widest">Tizim Holati</p>
            <p className="text-emerald-400 font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Faol
            </p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-white md:ml-64 min-h-screen pb-20 md:pb-0">
        {/* Header / Time Filter */}
        <header className="h-16 md:h-20 sticky top-0 bg-white/80 backdrop-blur-md z-20 border-b border-slate-100 px-4 md:px-8 flex items-center justify-between">
          <div className="flex space-x-0.5 bg-slate-100 p-1 rounded-xl">
            {PERIODS.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePeriod(p.id)}
                className={cn(
                  "px-3 md:px-6 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all",
                  activePeriod === p.id 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
              >
                {p.label === 'Bugun' ? 'Bugun' : p.label === '1 Hafta' ? 'Hafta' : p.label === '1 Oy' ? 'Oy' : 'Yil'}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Sana</p>
              <p className="font-bold text-slate-800 text-sm">{format(new Date(), 'dd.MM.yy')}</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white p-2 md:p-2.5 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Plus size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="p-4 md:p-8 flex-1 space-y-6 md:space-y-8 overflow-y-auto">
          {/* Top Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <StatCard 
              label="Kirim" 
              value={stats.income} 
              type="income"
            />
            <StatCard 
              label="Chiqim" 
              value={stats.expense} 
              type="expense"
            />
            <StatCard 
              label="Balans" 
              value={stats.balance} 
              type="balance"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
            {/* Table Section */}
            <div className="flex flex-col border-2 border-slate-50 rounded-2xl md:rounded-[2rem] overflow-hidden bg-white shadow-sm">
              <div className="bg-slate-50/50 px-5 md:px-8 py-4 md:py-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 text-sm md:text-base tracking-tight">Amallar ({currentCategoryObj.label})</h2>
                <button 
                  onClick={() => {
                    if (confirm("Barcha amallarni o'chirmoqchimisiz?")) {
                      setTransactions(prev => prev.filter(t => t.category !== activeCategory));
                    }
                  }}
                  className="text-[9px] md:text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded-lg font-bold hover:bg-rose-100 hover:text-rose-600 transition-colors uppercase tracking-widest"
                >
                  Tozalash
                </button>
              </div>
              
              <div className="flex-1 p-2 md:p-3 min-h-[300px]">
                <div className="space-y-1">
                  {periodTransactions.length > 0 ? (
                    periodTransactions.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className={cn(
                            "w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center font-black text-xs md:text-sm",
                            t.type === 'income' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          )}>
                            {t.type === 'income' ? 'K' : 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm md:text-base">{t.description}</p>
                            <p className="text-[10px] md:text-[11px] text-slate-400 font-medium">
                              {format(parseISO(t.date), 'HH:mm, dd-MMM')}
                            </p>
                          </div>
                        </div>
                        <span className={cn(
                          "font-black tabular-nums tracking-tight text-sm md:text-base",
                          t.type === 'income' ? "text-emerald-600" : "text-rose-500"
                        )}>
                          {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <p className="text-slate-400 font-medium text-sm">Ma'lumot topilmadi</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Graph Section */}
            <div className="flex flex-col space-y-6">
              <div className="bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-indigo-900/20">
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-8">Dinamika</h3>
                <div className="flex-1 min-h-[200px] md:min-h-[250px]">
                  <FinancialChart transactions={periodTransactions} period={activePeriod} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-12 md:h-14 bg-indigo-600 flex items-center justify-center cursor-pointer hover:bg-indigo-500 transition-colors text-white active:bg-indigo-700">
                  <span className="font-black text-[10px] md:text-xs tracking-[0.15em] uppercase">Yuklash (.PDF)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="bg-emerald-50 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-emerald-100/50 shadow-sm">
                  <p className="text-[9px] md:text-[10px] text-emerald-800 font-black tracking-widest uppercase mb-1">Max Kirim</p>
                  <p className="text-xl md:text-2xl font-black text-emerald-600 tabular-nums">
                    {Math.max(...(periodTransactions.filter(t => t.type === 'income').map(t => t.amount) || [0]), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-rose-50 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-rose-100/50 shadow-sm">
                  <p className="text-[9px] md:text-[10px] text-rose-800 font-black tracking-widest uppercase mb-1">Max Chiqim</p>
                  <p className="text-xl md:text-2xl font-black text-rose-500 tabular-nums">
                    {Math.max(...(periodTransactions.filter(t => t.type === 'expense').map(t => t.amount) || [0]), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-30 px-2 py-2 flex justify-around items-center h-16 shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex flex-col items-center justify-center transition-all p-2 rounded-xl",
                activeCategory === cat.id 
                  ? "text-white bg-indigo-600 shadow-lg shadow-indigo-600/30 scale-105" 
                  : "text-slate-500"
              )}
            >
              <cat.icon size={20} className={activeCategory === cat.id ? "mb-0" : "mb-1"} />
              <span className={cn("text-[9px] font-bold uppercase tracking-wider", activeCategory === cat.id ? "hidden" : "block")}>
                {cat.label.slice(0, 3)}
              </span>
            </button>
          ))}
        </nav>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md relative z-10 overflow-hidden shadow-2xl border border-slate-100"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900">Yangi Amal</h3>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleAddTransaction} className="space-y-5">
                  <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button 
                      type="button"
                      onClick={() => setNewTransaction(p => ({ ...p, type: 'income' }))}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                        newTransaction.type === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      Kirim
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewTransaction(p => ({ ...p, type: 'expense' }))}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                        newTransaction.type === 'expense' ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      Chiqim
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Summa (UZS)</label>
                      <input 
                        type="number" 
                        required
                        placeholder="0.00"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction(p => ({ ...p, amount: e.target.value }))}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold text-lg tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Tavsif</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Masalan: Tushlik yoki Xontaxta..."
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction(p => ({ ...p, description: e.target.value }))}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold tracking-wide shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98]"
                  >
                    Saqlash
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  type,
  trend 
}: { 
  label: string; 
  value: number; 
  type: 'income' | 'expense' | 'balance';
  trend?: string;
}) {
  const isBalance = type === 'balance';
  
  return (
    <div className={cn(
      "p-5 md:p-8 rounded-2xl md:rounded-[2rem] transition-all duration-300 group overflow-hidden relative",
      isBalance 
        ? "bg-indigo-600 text-white shadow-xl md:shadow-2xl shadow-indigo-200" 
        : "bg-white border-2 border-slate-100"
    )}>
      <div className="flex flex-col justify-between h-full relative z-10">
        <div className="flex justify-between items-start mb-2 md:mb-4">
          <p className={cn(
            "text-[9px] md:text-[11px] font-bold uppercase tracking-widest",
            isBalance ? "text-indigo-200" : "text-slate-400"
          )}>
            {label}
          </p>
          {trend && (
            <span className={cn(
              "text-[8px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 rounded-md uppercase tracking-tight",
              type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
            )}>
              {trend.split(' ')[0]}
            </span>
          )}
        </div>
        <div>
          <div className="flex items-baseline gap-1 overflow-hidden shrink-0">
            <h4 className={cn(
              "text-xl md:text-3xl font-black tabular-nums tracking-tighter truncate",
              isBalance ? "text-white" : (type === 'income' ? "text-emerald-600" : "text-rose-500")
            )}>
              {isBalance ? '' : (type === 'income' ? '+' : '-')}{value.toLocaleString()}
            </h4>
          </div>
          <p className={cn(
            "text-[8px] md:text-[10px] font-black mt-1 md:mt-2 tracking-[0.2em] uppercase opacity-70",
            isBalance ? "text-indigo-300" : "text-slate-300"
          )}>UZB</p>
        </div>
      </div>
      
      {isBalance && (
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
      )}
    </div>
  );
}
