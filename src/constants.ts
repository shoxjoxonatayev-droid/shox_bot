/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category } from './types';
import { Utensils, Hotel, User } from 'lucide-react';

export const CATEGORIES: { id: Category; label: string; icon: any; color: string; activeBg: string }[] = [
  { id: 'restaurant', label: 'Restoran', icon: Utensils, color: 'text-indigo-400', activeBg: 'bg-indigo-600' },
  { id: 'hotel', label: 'Mexmonxona', icon: Hotel, color: 'text-indigo-400', activeBg: 'bg-indigo-600' },
  { id: 'personal', label: 'Shaxsiy', icon: User, color: 'text-indigo-400', activeBg: 'bg-indigo-600' },
];

export const PERIODS = [
  { id: 'day', label: 'Bugun' },
  { id: 'week', label: '1 Hafta' },
  { id: 'month', label: '1 Oy' },
  { id: 'year', label: '1 Yil' },
] as const;

export type Period = typeof PERIODS[number]['id'];
