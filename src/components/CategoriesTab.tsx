import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Wallet, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { db, type ExpenseCategory, type EarningCategory } from '../db';
import { useAppStore } from '../store';
import { getIcon, availableIcons, availableColors, formatCurrency } from '../utils';
import { Modal } from './Modal';

function CategoryCard({ cat, type, onEdit, onDelete }: {
  cat: ExpenseCategory | EarningCategory;
  type: 'expense' | 'earning';
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = getIcon(cat.icon);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 card-hover"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: cat.color + '18', color: cat.color }}
          >
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{cat.name}</h3>
            {type === 'expense' && (cat as ExpenseCategory).monthlyBudget > 0 && (
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                Budget: {formatCurrency((cat as ExpenseCategory).monthlyBudget)}
              </p>
            )}
            {type === 'earning' && (cat as EarningCategory).isRecurring && (
              <p className="text-xs text-emerald-500 mt-0.5">
                ↻ {(cat as EarningCategory).recurringFrequency}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)] hover:text-primary-500 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-rose-50 text-[var(--color-text-tertiary)] hover:text-rose-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CategoryForm({ type, editId, onClose }: {
  type: 'expense' | 'earning';
  editId: number | null;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [icon, setIconName] = useState('MoreHorizontal');
  const [color, setColor] = useState('#3b82f6');
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'none'>('none');
  const [recurringAmount, setRecurringAmount] = useState(0);

  useEffect(() => {
    if (editId) {
      const loadData = async () => {
        if (type === 'expense') {
          const cat = await db.expenseCategories.get(editId);
          if (cat) { setName(cat.name); setIconName(cat.icon); setColor(cat.color); setMonthlyBudget(cat.monthlyBudget); }
        } else {
          const cat = await db.earningCategories.get(editId);
          if (cat) { setName(cat.name); setIconName(cat.icon); setColor(cat.color); setIsRecurring(cat.isRecurring); setRecurringFrequency(cat.recurringFrequency); setRecurringAmount(cat.recurringAmount); }
        }
      };
      loadData();
    }
  }, [editId, type]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    if (type === 'expense') {
      const data = { name: name.trim(), icon, color, monthlyBudget, isDefault: false, createdAt: new Date().toISOString() };
      if (editId) await db.expenseCategories.update(editId, data);
      else await db.expenseCategories.add(data);
    } else {
      const data = { name: name.trim(), icon, color, isRecurring, recurringAmount, recurringFrequency, isDefault: false, createdAt: new Date().toISOString() };
      if (editId) await db.earningCategories.update(editId, data);
      else await db.earningCategories.add(data);
    }
    onClose();
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Name</label>
        <input
          value={name} onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
          placeholder="Category name"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Icon</label>
        <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
          {availableIcons.map((iconName) => {
            const I = getIcon(iconName);
            return (
              <button key={iconName} onClick={() => setIconName(iconName)}
                className={`p-2 rounded-lg transition-all ${icon === iconName ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-500' : 'hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]'}`}>
                <I size={16} />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Color</label>
        <div className="flex flex-wrap gap-2">
          {availableColors.map((c) => (
            <button key={c} onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-[var(--color-text-primary)] scale-110' : 'hover:scale-110'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {type === 'expense' && (
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Monthly Budget (optional)</label>
          <input type="number" value={monthlyBudget || ''} onChange={(e) => setMonthlyBudget(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            placeholder="0" />
        </div>
      )}

      {type === 'earning' && (
        <>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-[var(--color-border)] text-primary-500 focus:ring-primary-500" />
            <span className="text-sm text-[var(--color-text-secondary)]">Recurring income</span>
          </label>
          {isRecurring && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Frequency</label>
                <select value={recurringFrequency} onChange={(e) => setRecurringFrequency(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Amount</label>
                <input type="number" value={recurringAmount || ''} onChange={(e) => setRecurringAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
                  placeholder="0" />
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-all">
          Cancel
        </button>
        <button onClick={handleSubmit}
          className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all">
          {editId ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  );
}

export function CategoriesTab() {
  const [activeSection, setActiveSection] = useState<'expense' | 'earning'>('expense');
  const [search, setSearch] = useState('');
  const store = useAppStore();

  const expenseCategories = useLiveQuery(() => db.expenseCategories.toArray()) || [];
  const earningCategories = useLiveQuery(() => db.earningCategories.toArray()) || [];

  const categories = activeSection === 'expense' ? expenseCategories : earningCategories;
  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: number) => {
    if (confirm('Delete this category?')) {
      if (activeSection === 'expense') await db.expenseCategories.delete(id);
      else await db.earningCategories.delete(id);
    }
  };

  const handleEdit = (id: number) => {
    if (activeSection === 'expense') {
      store.setEditingExpenseCategory(id);
      store.setShowAddExpenseCategoryModal(true);
    } else {
      store.setEditingEarningCategory(id);
      store.setShowAddEarningCategoryModal(true);
    }
  };

  const handleAdd = () => {
    if (activeSection === 'expense') {
      store.setEditingExpenseCategory(null);
      store.setShowAddExpenseCategoryModal(true);
    } else {
      store.setEditingEarningCategory(null);
      store.setShowAddEarningCategoryModal(true);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:px-12 lg:py-10 space-y-8 md:space-y-10 pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Categories</h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">Manage your expense and earning types</p>
        </div>

        {/* Section Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-wrap">
          <div className="flex bg-[var(--color-surface-tertiary)] rounded-xl p-1 overflow-x-auto hide-scrollbar shrink-0">
            <button onClick={() => setActiveSection('expense')}
              className={`flex items-center justify-center flex-1 sm:flex-none gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'expense' ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-tertiary)]'}`}>
              <Wallet size={16} /> Expenses ({expenseCategories.length})
            </button>
            <button onClick={() => setActiveSection('earning')}
              className={`flex items-center justify-center flex-1 sm:flex-none gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'earning' ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-tertiary)]'}`}>
              <TrendingUpIcon size={16} /> Earnings ({earningCategories.length})
            </button>
          </div>
          <div className="hidden sm:block flex-1" />
          <div className="relative w-full sm:w-auto order-3 sm:order-none">
            <div className="absolute left-[14px] top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <Search size={16} className="text-[var(--color-text-tertiary)]" />
            </div>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
              className="pr-[16px] py-[10px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm w-full sm:w-[240px] focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-[var(--color-text-primary)] transition-all"
              placeholder="Search categories..." />
          </div>
          <button onClick={handleAdd}
            className="flex items-center justify-center gap-[8px] px-[20px] py-[10px] rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all w-full sm:w-auto order-2 sm:order-none">
            <Plus size={16} /> Add {activeSection === 'expense' ? 'Expense' : 'Earning'}
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-7">
          <AnimatePresence mode="popLayout">
            {filtered.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} type={activeSection}
                onEdit={() => handleEdit(cat.id!)} onDelete={() => handleDelete(cat.id!)} />
            ))}
          </AnimatePresence>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-[64px] text-[var(--color-text-tertiary)]">
            <p className="text-lg font-medium">No categories found</p>
            <p className="text-sm mt-1">Create your first {activeSection} category to get started</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={store.showAddExpenseCategoryModal} onClose={() => { store.setShowAddExpenseCategoryModal(false); store.setEditingExpenseCategory(null); }}
        title={store.editingExpenseCategory ? 'Edit Expense Category' : 'New Expense Category'}>
        <CategoryForm type="expense" editId={store.editingExpenseCategory}
          onClose={() => { store.setShowAddExpenseCategoryModal(false); store.setEditingExpenseCategory(null); }} />
      </Modal>
      <Modal isOpen={store.showAddEarningCategoryModal} onClose={() => { store.setShowAddEarningCategoryModal(false); store.setEditingEarningCategory(null); }}
        title={store.editingEarningCategory ? 'Edit Earning Category' : 'New Earning Category'}>
        <CategoryForm type="earning" editId={store.editingEarningCategory}
          onClose={() => { store.setShowAddEarningCategoryModal(false); store.setEditingEarningCategory(null); }} />
      </Modal>
    </div>
  );
}
