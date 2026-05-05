/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'income' | 'expense';

export type Category = 'restaurant' | 'hotel' | 'personal';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  description: string;
  date: string; // ISO string representing the date
}

export interface Stats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
