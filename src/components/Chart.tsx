/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Transaction } from '../types';
import { format, parseISO, startOfDay, eachDayOfInterval, subDays } from 'date-fns';

interface ChartProps {
  transactions: Transaction[];
  period: 'day' | 'week' | 'month' | 'year';
}

export default function FinancialChart({ transactions, period }: ChartProps) {
  const data = (() => {
    const now = new Date();
    
    if (period === 'day') {
      const hourlyData: any[] = [];
      const currentDay = startOfDay(now);
      
      // Group by 4-hour intervals
      for (let i = 0; i < 6; i++) {
        const startHour = i * 4;
        const endHour = (i + 1) * 4;
        const label = `${startHour}:00-${endHour}:00`;
        
        const intervalIncome = transactions
          .filter(t => {
            const date = parseISO(t.date);
            const hour = date.getHours();
            return format(date, 'yyyy-MM-dd') === format(currentDay, 'yyyy-MM-dd') && 
                   hour >= startHour && hour < endHour;
          })
          .reduce((sum, t) => sum + t.amount, 0);
          
        const intervalExpense = transactions
          .filter(t => {
            const date = parseISO(t.date);
            const hour = date.getHours();
            return format(date, 'yyyy-MM-dd') === format(currentDay, 'yyyy-MM-dd') && 
                   hour >= startHour && hour < endHour;
          })
          .reduce((sum, t) => sum + t.amount, 0);
          
        hourlyData.push({
          name: label,
          income: intervalIncome,
          expense: intervalExpense,
        });
      }
      return hourlyData;
    }

    let days = 7;
    if (period === 'month') days = 30;
    if (period === 'year') days = 12; // Handle months for year

    if (period === 'year') {
      const monthData: any[] = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = subDays(now, i * 30);
        const monthLabel = format(monthDate, 'MMM');
        const monthIncome = transactions
          .filter(t => t.type === 'income' && format(parseISO(t.date), 'MMM yyyy') === format(monthDate, 'MMM yyyy'))
          .reduce((sum, t) => sum + t.amount, 0);
        const monthExpense = transactions
          .filter(t => t.type === 'expense' && format(parseISO(t.date), 'MMM yyyy') === format(monthDate, 'MMM yyyy'))
          .reduce((sum, t) => sum + t.amount, 0);
        
        monthData.push({
          name: monthLabel,
          income: monthIncome,
          expense: monthExpense,
        });
      }
      return monthData;
    }

    const interval = eachDayOfInterval({
      start: subDays(now, days - 1),
      end: now,
    });

    return interval.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const income = transactions
        .filter(t => t.type === 'income' && format(parseISO(t.date), 'yyyy-MM-dd') === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions
        .filter(t => t.type === 'expense' && format(parseISO(t.date), 'yyyy-MM-dd') === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: format(date, days > 7 ? 'dd MMM' : 'EEE'),
        income,
        expense,
      };
    });
  })();

  return (
    <div className="h-[200px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
          <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={16} />
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
