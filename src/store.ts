import { create } from 'zustand';

interface AppState {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  selectedYear: number;
  selectedMonth: number;
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: number | null;
  setFilterCategory: (id: number | null) => void;
  filterPaymentMethod: string | null;
  setFilterPaymentMethod: (method: string | null) => void;
  showAddExpenseModal: boolean;
  setShowAddExpenseModal: (show: boolean) => void;
  showAddEarningModal: boolean;
  setShowAddEarningModal: (show: boolean) => void;
  showAddExpenseCategoryModal: boolean;
  setShowAddExpenseCategoryModal: (show: boolean) => void;
  showAddEarningCategoryModal: boolean;
  setShowAddEarningCategoryModal: (show: boolean) => void;
  editingExpense: number | null;
  setEditingExpense: (id: number | null) => void;
  editingEarning: number | null;
  setEditingEarning: (id: number | null) => void;
  editingExpenseCategory: number | null;
  setEditingExpenseCategory: (id: number | null) => void;
  editingEarningCategory: number | null;
  setEditingEarningCategory: (id: number | null) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 3,
  setActiveTab: (tab) => set({ activeTab: tab }),
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    }),
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth(),
  setSelectedYear: (year) => set({ selectedYear: year }),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  filterCategory: null,
  setFilterCategory: (id) => set({ filterCategory: id }),
  filterPaymentMethod: null,
  setFilterPaymentMethod: (method) => set({ filterPaymentMethod: method }),
  showAddExpenseModal: false,
  setShowAddExpenseModal: (show) => set({ showAddExpenseModal: show }),
  showAddEarningModal: false,
  setShowAddEarningModal: (show) => set({ showAddEarningModal: show }),
  showAddExpenseCategoryModal: false,
  setShowAddExpenseCategoryModal: (show) => set({ showAddExpenseCategoryModal: show }),
  showAddEarningCategoryModal: false,
  setShowAddEarningCategoryModal: (show) => set({ showAddEarningCategoryModal: show }),
  editingExpense: null,
  setEditingExpense: (id) => set({ editingExpense: id }),
  editingEarning: null,
  setEditingEarning: (id) => set({ editingEarning: id }),
  editingExpenseCategory: null,
  setEditingExpenseCategory: (id) => set({ editingExpenseCategory: id }),
  editingEarningCategory: null,
  setEditingEarningCategory: (id) => set({ editingEarningCategory: id }),
  isMobileMenuOpen: false,
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
}));
