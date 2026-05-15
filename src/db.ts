// Database schema using Dexie.js (IndexedDB wrapper)
import Dexie, { type Table } from 'dexie';

export interface ExpenseCategory {
  id?: number;
  name: string;
  icon: string;
  color: string;
  monthlyBudget: number;
  isDefault: boolean;
  createdAt: string;
}

export interface EarningCategory {
  id?: number;
  name: string;
  icon: string;
  color: string;
  isRecurring: boolean;
  recurringAmount: number;
  recurringFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
  isDefault: boolean;
  createdAt: string;
}

export interface Expense {
  id?: number;
  date: string;
  categoryId: number;
  amount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallet';
  notes: string;
  tags: string[];
  isRecurring: boolean;
  createdAt: string;
}

export interface Earning {
  id?: number;
  date: string;
  categoryId: number;
  amount: number;
  source: string;
  notes: string;
  isRecurring: boolean;
  createdAt: string;
}

export interface EmiEntry {
  id?: number;
  name: string;
  lender: string;
  totalAmount: number;
  emiAmount: number;
  interestRate: number;
  totalEmis: number;
  emisPaid: number;
  startDate: string;
  notes: string;
  createdAt: string;
}

export interface Budget {
  id?: number;
  year: number;
  month: number;
  totalBudget: number;
  savingsGoal: number;
}

export interface UserProfile {
  id?: number;
  name: string;
  currency: string;
  theme: 'light' | 'dark' | 'system';
  createdAt: string;
}

class FinanceDB extends Dexie {
  expenseCategories!: Table<ExpenseCategory>;
  earningCategories!: Table<EarningCategory>;
  expenses!: Table<Expense>;
  earnings!: Table<Earning>;
  budgets!: Table<Budget>;
  userProfiles!: Table<UserProfile>;
  emiEntries!: Table<EmiEntry>;

  constructor() {
    super('SmartExpenseManager');
    this.version(1).stores({
      expenseCategories: '++id, name, createdAt',
      earningCategories: '++id, name, createdAt',
      expenses: '++id, date, categoryId, paymentMethod, amount',
      earnings: '++id, date, categoryId, amount',
      budgets: '++id, year, month, [year+month]',
      userProfiles: '++id, name',
    });
    this.version(2).stores({
      expenseCategories: '++id, name, createdAt',
      earningCategories: '++id, name, createdAt',
      expenses: '++id, date, categoryId, paymentMethod, amount',
      earnings: '++id, date, categoryId, amount',
      budgets: '++id, year, month, [year+month]',
      userProfiles: '++id, name',
      emiEntries: '++id, name, startDate, createdAt',
    });
  }
}

export const db = new FinanceDB();

// Seed default categories
export async function seedDefaults() {
  const expCount = await db.expenseCategories.count();
  if (expCount === 0) {
    await db.expenseCategories.bulkAdd([
      { name: 'Food', icon: 'UtensilsCrossed', color: '#f59e0b', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Rent', icon: 'Home', color: '#3b82f6', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Electricity', icon: 'Zap', color: '#eab308', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Water Bill', icon: 'Droplets', color: '#06b6d4', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Internet', icon: 'Wifi', color: '#8b5cf6', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Fuel', icon: 'Fuel', color: '#ef4444', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Groceries', icon: 'ShoppingCart', color: '#10b981', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Entertainment', icon: 'Film', color: '#a855f7', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Travel', icon: 'Plane', color: '#0ea5e9', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Medical', icon: 'Heart', color: '#f43f5e', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Education', icon: 'GraduationCap', color: '#6366f1', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'EMI', icon: 'CreditCard', color: '#f97316', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Insurance', icon: 'Shield', color: '#14b8a6', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Investment', icon: 'TrendingUp', color: '#22c55e', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Miscellaneous', icon: 'MoreHorizontal', color: '#64748b', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
    ]);
  }

  const earnCount = await db.earningCategories.count();
  if (earnCount === 0) {
    await db.earningCategories.bulkAdd([
      { name: 'Salary', icon: 'Banknote', color: '#10b981', isRecurring: true, recurringAmount: 0, recurringFrequency: 'monthly', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Freelancing', icon: 'Laptop', color: '#3b82f6', isRecurring: false, recurringAmount: 0, recurringFrequency: 'none', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Business', icon: 'Briefcase', color: '#8b5cf6', isRecurring: false, recurringAmount: 0, recurringFrequency: 'none', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Rental Income', icon: 'Building', color: '#f59e0b', isRecurring: true, recurringAmount: 0, recurringFrequency: 'monthly', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Interest', icon: 'Percent', color: '#06b6d4', isRecurring: false, recurringAmount: 0, recurringFrequency: 'none', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Dividend', icon: 'PieChart', color: '#22c55e', isRecurring: false, recurringAmount: 0, recurringFrequency: 'none', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Side Income', icon: 'Sparkles', color: '#ec4899', isRecurring: false, recurringAmount: 0, recurringFrequency: 'none', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Bonus', icon: 'Gift', color: '#f97316', isRecurring: false, recurringAmount: 0, recurringFrequency: 'none', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Other Income', icon: 'CircleDollarSign', color: '#64748b', isRecurring: false, recurringAmount: 0, recurringFrequency: 'none', isDefault: true, createdAt: new Date().toISOString() },
    ]);
  }
}
