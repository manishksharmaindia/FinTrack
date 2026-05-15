import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Trash2, Pencil } from 'lucide-react';
import { db, type Expense, type Earning } from '../db';
import { useAppStore } from '../store';
import { getIcon, formatCurrency, formatDate, paymentMethods, months, years } from '../utils';
import { Modal } from './Modal';

function ExpenseForm({ editId, onClose }: { editId: number | null; onClose: () => void }) {

  const cats = useLiveQuery(() => db.expenseCategories.toArray()) || [];
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [categoryId, setCategoryId] = useState(0);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('Cash');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (editId) {
      db.expenses.get(editId).then((e) => {
        if (e) { setDate(e.date); setCategoryId(e.categoryId); setAmount(String(e.amount)); setPaymentMethod(e.paymentMethod); setNotes(e.notes); setTags(e.tags.join(', ')); }
      });
    }
  }, [editId]);

  useEffect(() => { if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id!); }, [cats]);

  const handleSubmit = async () => {
    if (!amount || !categoryId) return;
    const data: Omit<Expense, 'id'> = {
      date, categoryId, amount: Number(amount), paymentMethod, notes,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      isRecurring: false, createdAt: new Date().toISOString(),
    };
    if (editId) await db.expenses.update(editId, data);
    else await db.expenses.add(data as Expense);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}
          className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all">
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Payment Method</label>
        <div className="flex flex-wrap gap-2">
          {paymentMethods.map((m) => (
            <button key={m} onClick={() => setPaymentMethod(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${paymentMethod === m ? 'bg-primary-100 text-primary-600 ring-1 ring-primary-300' : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Notes</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes"
          className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Tags (comma separated)</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="food, lunch, office"
          className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-all">Cancel</button>
        <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-medium hover:from-rose-600 hover:to-rose-700 shadow-md transition-all">
          {editId ? 'Update' : 'Add'} Expense
        </button>
      </div>
    </div>
  );
}

function EarningForm({ editId, onClose }: { editId: number | null; onClose: () => void }) {

  const cats = useLiveQuery(() => db.earningCategories.toArray()) || [];
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [categoryId, setCategoryId] = useState(0);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editId) {
      db.earnings.get(editId).then((e) => {
        if (e) { setDate(e.date); setCategoryId(e.categoryId); setAmount(String(e.amount)); setSource(e.source); setNotes(e.notes); }
      });
    }
  }, [editId]);

  useEffect(() => { if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id!); }, [cats]);

  const handleSubmit = async () => {
    if (!amount || !categoryId) return;
    const data: Omit<Earning, 'id'> = { date, categoryId, amount: Number(amount), source, notes, isRecurring: false, createdAt: new Date().toISOString() };
    if (editId) await db.earnings.update(editId, data);
    else await db.earnings.add(data as Earning);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}
          className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all">
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Source</label>
        <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Company Name"
          className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Notes</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes"
          className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-all">Cancel</button>
        <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 shadow-md transition-all">
          {editId ? 'Update' : 'Add'} Earning
        </button>
      </div>
    </div>
  );
}

export function TransactionsTab() {
  const store = useAppStore();
  const { selectedYear, selectedMonth } = store;
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [txType, setTxType] = useState<'all' | 'expense' | 'earning'>('all');
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
  const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${new Date(selectedYear, selectedMonth + 1, 0).getDate()}`;

  const expensesRaw = useLiveQuery(() => db.expenses.where('date').between(startDate, endDate, true, true).toArray(), [startDate, endDate]) || [];
  const earningsRaw = useLiveQuery(() => db.earnings.where('date').between(startDate, endDate, true, true).toArray(), [startDate, endDate]) || [];
  const expCats = useLiveQuery(() => db.expenseCategories.toArray()) || [];
  const earnCats = useLiveQuery(() => db.earningCategories.toArray()) || [];

  const expCatMap = useMemo(() => Object.fromEntries(expCats.map((c) => [c.id, c])), [expCats]);
  const earnCatMap = useMemo(() => Object.fromEntries(earnCats.map((c) => [c.id, c])), [earnCats]);

  const totalExpenses = expensesRaw.reduce((s, e) => s + e.amount, 0);
  const totalEarnings = earningsRaw.reduce((s, e) => s + e.amount, 0);
  const netBalance = totalEarnings - totalExpenses;

  type TxItem = { id: number; type: 'expense' | 'earning'; date: string; amount: number; catName: string; catIcon: string; catColor: string; notes: string; paymentMethod?: string };

  const transactions: TxItem[] = useMemo(() => {
    const items: TxItem[] = [];
    if (txType !== 'earning') {
      expensesRaw.forEach((e) => {
        const cat = expCatMap[e.categoryId];
        if (cat) items.push({ id: e.id!, type: 'expense', date: e.date, amount: e.amount, catName: cat.name, catIcon: cat.icon, catColor: cat.color, notes: e.notes, paymentMethod: e.paymentMethod });
      });
    }
    if (txType !== 'expense') {
      earningsRaw.forEach((e) => {
        const cat = earnCatMap[e.categoryId];
        if (cat) items.push({ id: e.id!, type: 'earning', date: e.date, amount: e.amount, catName: cat.name, catIcon: cat.icon, catColor: cat.color, notes: e.notes });
      });
    }
    return items.filter((t) => !search || t.catName.toLowerCase().includes(search.toLowerCase()) || t.notes.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expensesRaw, earningsRaw, expCatMap, earnCatMap, txType, search]);

  const handleDelete = async (e: React.MouseEvent, item: TxItem) => {
    e.stopPropagation();
    e.preventDefault();
    const key = `${item.type}-${item.id}`;
    if (confirmDeleteId === key) {
      // Second click — actually delete
      if (item.type === 'expense') await db.expenses.delete(item.id);
      else await db.earnings.delete(item.id);
      setConfirmDeleteId(null);
    } else {
      // First click — ask to confirm
      setConfirmDeleteId(key);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDeleteId((prev) => (prev === key ? null : prev)), 3000);
    }
  };

  const handleEdit = (item: TxItem) => {
    if (item.type === 'expense') {
      store.setEditingExpense(item.id);
      store.setShowAddExpenseModal(true);
    } else {
      store.setEditingEarning(item.id);
      store.setShowAddEarningModal(true);
    }
  };

  const prevMonth = () => {
    if (selectedMonth === 0) { store.setSelectedMonth(11); store.setSelectedYear(selectedYear - 1); }
    else store.setSelectedMonth(selectedMonth - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 11) { store.setSelectedMonth(0); store.setSelectedYear(selectedYear + 1); }
    else store.setSelectedMonth(selectedMonth + 1);
  };

  // Calendar data
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dailyTotals = useMemo(() => {
    const map: Record<number, { exp: number; earn: number }> = {};
    expensesRaw.forEach((e) => { const d = new Date(e.date).getDate(); if (!map[d]) map[d] = { exp: 0, earn: 0 }; map[d].exp += e.amount; });
    earningsRaw.forEach((e) => { const d = new Date(e.date).getDate(); if (!map[d]) map[d] = { exp: 0, earn: 0 }; map[d].earn += e.amount; });
    return map;
  }, [expensesRaw, earningsRaw]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:px-12 lg:py-10 space-y-8 md:space-y-10 pb-12">

        {/* ── Header Row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
          <div className="shrink-0 text-center w-full">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Transactions</h1>
            <p className="text-sm text-[var(--color-text-tertiary)] mt-1">Record and manage your finances</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <button onClick={() => { store.setEditingExpense(null); store.setShowAddExpenseModal(true); }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all whitespace-nowrap">
              <ArrowDownRight size={16} /> Expense
            </button>
            <button onClick={() => { store.setEditingEarning(null); store.setShowAddEarningModal(true); }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all whitespace-nowrap">
              <ArrowUpRight size={16} /> Earning
            </button>
          </div>
        </div>

        {/* ── Month Selector & Summary Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-[var(--color-surface-secondary)] rounded-2xl border border-[var(--color-border)] p-4 md:p-6 flex flex-col items-center justify-center col-span-2 sm:col-span-1">
            <div className="flex items-center gap-[12px]">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)] transition-colors"><ChevronLeft size={18} /></button>
              <div className="text-center min-w-[110px]">
                <p className="text-lg font-bold text-[var(--color-text-primary)]">{months[selectedMonth]}</p>
                <select value={selectedYear} onChange={(e) => store.setSelectedYear(Number(e.target.value))}
                  className="text-xs text-[var(--color-text-tertiary)] bg-transparent border-none focus:outline-none cursor-pointer text-center">
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)] transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>
          {[
            { label: 'Expenses', value: totalExpenses, color: 'text-rose-500' },
            { label: 'Earnings', value: totalEarnings, color: 'text-emerald-500' },
            { label: 'Net Balance', value: netBalance, color: netBalance >= 0 ? 'text-emerald-500' : 'text-rose-500' },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--color-surface-secondary)] rounded-2xl border border-[var(--color-border)] p-4 md:p-6 flex flex-col justify-center">
              <p className="text-xs text-[var(--color-text-tertiary)] mb-1 md:mb-2">{s.label}</p>
              <p className={`text-lg md:text-xl font-bold ${s.color}`}>{formatCurrency(s.value)}</p>
            </div>
          ))}
        </div>

        {/* ── Filter Row ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-6 flex-wrap">
          {/* Type Filter Tabs */}
          <div className="flex gap-1 bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] rounded-xl p-1 overflow-x-auto hide-scrollbar shrink-0">
            {(['all', 'expense', 'earning'] as const).map((t) => (
              <button key={t} onClick={() => setTxType(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 text-center ${
                  txType === t
                    ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                }`}>
                {t === 'all' ? 'All' : t === 'expense' ? 'Expenses' : 'Earnings'}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 min-w-[220px]">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <Search size={16} className="text-[var(--color-text-secondary)]" />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.75rem' }}
              className="w-full pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
              placeholder="Search transactions..."
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] rounded-xl p-1 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <button onClick={() => setView('list')}
              className={`flex-1 sm:flex-none flex justify-center px-4 py-2 rounded-lg transition-all ${
                view === 'list'
                  ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
              }`}>
              <Filter size={16} />
            </button>
            <button onClick={() => setView('calendar')}
              className={`flex-1 sm:flex-none flex justify-center px-4 py-2 rounded-lg transition-all ${
                view === 'calendar'
                  ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
              }`}>
              <Calendar size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        {view === 'list' ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {transactions.map((tx) => {
                const Icon = getIcon(tx.catIcon);
                return (
                  <motion.div key={`${tx.type}-${tx.id}`} layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-[var(--color-surface-secondary)] rounded-2xl border border-[var(--color-border)] p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tx.catColor + '18', color: tx.catColor }}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{tx.catName}</p>
                        {tx.paymentMethod && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]">{tx.paymentMethod}</span>}
                      </div>
                      <p className="text-xs text-[var(--color-text-tertiary)] truncate">{formatDate(tx.date)}{tx.notes ? ` · ${tx.notes}` : ''}</p>
                    </div>
                    <p className={`text-sm font-semibold shrink-0 ${tx.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(tx)}
                        title="Edit this transaction"
                        className="p-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, tx)}
                        title={confirmDeleteId === `${tx.type}-${tx.id}` ? 'Click again to confirm delete' : 'Delete this transaction'}
                        className={`relative z-10 shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          confirmDeleteId === `${tx.type}-${tx.id}`
                            ? 'bg-rose-500 text-white shadow-md hover:bg-rose-600'
                            : 'bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600'
                        }`}
                      >
                        {confirmDeleteId === `${tx.type}-${tx.id}` ? (
                          <span className="flex items-center gap-1.5"><Trash2 size={14} /> Delete?</span>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {transactions.length === 0 && (
              <div className="text-center py-16 text-[var(--color-text-tertiary)]">
                <p className="text-lg font-medium">No transactions yet</p>
                <p className="text-sm mt-1">Add your first expense or earning for {months[selectedMonth]} {selectedYear}</p>
              </div>
            )}
          </div>
        ) : (
          /* Calendar View */
          <div className="bg-[var(--color-surface-secondary)] rounded-2xl border border-[var(--color-border)] p-5 sm:p-7">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-[var(--color-text-tertiary)] py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {calendarDays.map((day) => {
                const dt = dailyTotals[day];
                return (
                  <div key={day} className="aspect-square p-1 rounded-xl border border-transparent hover:border-[var(--color-border)] transition-all cursor-pointer">
                    <p className="text-xs font-medium text-[var(--color-text-primary)]">{day}</p>
                    {dt && (
                      <div className="mt-0.5 space-y-0.5">
                        {dt.exp > 0 && <div className="text-[9px] text-rose-500 font-medium truncate">-{formatCurrency(dt.exp)}</div>}
                        {dt.earn > 0 && <div className="text-[9px] text-emerald-500 font-medium truncate">+{formatCurrency(dt.earn)}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={store.showAddExpenseModal} onClose={() => { store.setShowAddExpenseModal(false); store.setEditingExpense(null); }} title={store.editingExpense ? 'Edit Expense' : 'New Expense'}>
        <ExpenseForm editId={store.editingExpense} onClose={() => { store.setShowAddExpenseModal(false); store.setEditingExpense(null); }} />
      </Modal>
      <Modal isOpen={store.showAddEarningModal} onClose={() => { store.setShowAddEarningModal(false); store.setEditingEarning(null); }} title={store.editingEarning ? 'Edit Earning' : 'New Earning'}>
        <EarningForm editId={store.editingEarning} onClose={() => { store.setShowAddEarningModal(false); store.setEditingEarning(null); }} />
      </Modal>
    </div>
  );
}
