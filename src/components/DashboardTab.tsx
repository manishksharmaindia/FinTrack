import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Target, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Lightbulb, BarChart3, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, AreaChart, Area, LineChart, Line, Legend
} from 'recharts';
import { db } from '../db';
import { useAppStore } from '../store';
import { formatCurrency, months, years, getIcon } from '../utils';



function SummaryCard({ icon: Icon, label, value, trend, trendLabel, color, delay }: {
  icon: any; label: string; value: string; trend?: 'up' | 'down'; trendLabel?: string; color: string; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 md:p-7 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '15', color }}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendLabel}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{label}</p>
    </motion.div>
  );
}

type FilterMode = 'monthly' | 'quarterly' | 'yearly' | 'all';
const quarterLabels = ['Q1 (Jan–Mar)', 'Q2 (Apr–Jun)', 'Q3 (Jul–Sep)', 'Q4 (Oct–Dec)'];

export function DashboardTab() {
  const { selectedYear, setSelectedYear } = useAppStore();
  const [filterMode, setFilterMode] = useState<FilterMode>('yearly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3));

  const allExpenses = useLiveQuery(() => db.expenses.toArray()) || [];
  const allEarnings = useLiveQuery(() => db.earnings.toArray()) || [];
  const expCats = useLiveQuery(() => db.expenseCategories.toArray()) || [];

  const expCatMap = useMemo(() => Object.fromEntries(expCats.map((c) => [c.id, c])), [expCats]);

  // Filtered data based on selected mode
  const { filteredExpenses: yearExpenses, filteredEarnings: yearEarnings } = useMemo(() => {
    let fExp = allExpenses;
    let fEarn = allEarnings;
    if (filterMode !== 'all') {
      fExp = fExp.filter((e) => new Date(e.date).getFullYear() === selectedYear);
      fEarn = fEarn.filter((e) => new Date(e.date).getFullYear() === selectedYear);
    }
    if (filterMode === 'monthly') {
      fExp = fExp.filter((e) => new Date(e.date).getMonth() === selectedMonth);
      fEarn = fEarn.filter((e) => new Date(e.date).getMonth() === selectedMonth);
    } else if (filterMode === 'quarterly') {
      const qStart = selectedQuarter * 3;
      fExp = fExp.filter((e) => { const m = new Date(e.date).getMonth(); return m >= qStart && m < qStart + 3; });
      fEarn = fEarn.filter((e) => { const m = new Date(e.date).getMonth(); return m >= qStart && m < qStart + 3; });
    }
    return { filteredExpenses: fExp, filteredEarnings: fEarn };
  }, [allExpenses, allEarnings, selectedYear, filterMode, selectedMonth, selectedQuarter]);

  const totalExpenses = yearExpenses.reduce((s, e) => s + e.amount, 0);
  const totalEarnings = yearEarnings.reduce((s, e) => s + e.amount, 0);
  const totalSavings = totalEarnings - totalExpenses;
  const budgetMultiplier = filterMode === 'monthly' ? 1 : filterMode === 'quarterly' ? 3 : 12;
  const totalBudget = expCats.reduce((s, c) => s + (c.monthlyBudget || 0), 0) * budgetMultiplier;

  // Label for current filter
  const filterLabel = filterMode === 'monthly' ? `${months[selectedMonth]} ${selectedYear}`
    : filterMode === 'quarterly' ? `${quarterLabels[selectedQuarter]} ${selectedYear}`
    : filterMode === 'yearly' ? `${selectedYear}` : 'All Time';

  // Monthly breakdown for charts
  const monthlyData = useMemo(() => {
    if (filterMode === 'monthly') {
      // Show daily breakdown for the selected month
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dayStr = String(day);
        const mExp = yearExpenses.filter((e) => new Date(e.date).getDate() === day).reduce((s, e) => s + e.amount, 0);
        const mEarn = yearEarnings.filter((e) => new Date(e.date).getDate() === day).reduce((s, e) => s + e.amount, 0);
        return { name: dayStr, expenses: mExp, earnings: mEarn, savings: mEarn - mExp };
      });
    } else if (filterMode === 'quarterly') {
      const qStart = selectedQuarter * 3;
      return [0, 1, 2].map((offset) => {
        const mi = qStart + offset;
        const mExp = yearExpenses.filter((e) => new Date(e.date).getMonth() === mi).reduce((s, e) => s + e.amount, 0);
        const mEarn = yearEarnings.filter((e) => new Date(e.date).getMonth() === mi).reduce((s, e) => s + e.amount, 0);
        return { name: months[mi].slice(0, 3), expenses: mExp, earnings: mEarn, savings: mEarn - mExp };
      });
    } else {
      return months.map((name, i) => {
        const mExp = yearExpenses.filter((e) => new Date(e.date).getMonth() === i).reduce((s, e) => s + e.amount, 0);
        const mEarn = yearEarnings.filter((e) => new Date(e.date).getMonth() === i).reduce((s, e) => s + e.amount, 0);
        return { name: name.slice(0, 3), expenses: mExp, earnings: mEarn, savings: mEarn - mExp };
      });
    }
  }, [yearExpenses, yearEarnings, filterMode, selectedYear, selectedMonth, selectedQuarter]);

  // Category pie data
  const categoryPieData = useMemo(() => {
    const map: Record<number, number> = {};
    yearExpenses.forEach((e) => { map[e.categoryId] = (map[e.categoryId] || 0) + e.amount; });
    return Object.entries(map)
      .map(([id, amount]) => ({ name: expCatMap[Number(id)]?.name || 'Unknown', value: amount, color: expCatMap[Number(id)]?.color || '#64748b' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [yearExpenses, expCatMap]);

  // Top spending categories
  const topCategories = useMemo(() => {
    const map: Record<number, number> = {};
    yearExpenses.forEach((e) => { map[e.categoryId] = (map[e.categoryId] || 0) + e.amount; });
    return Object.entries(map)
      .map(([id, amount]) => {
        const cat = expCatMap[Number(id)];
        return { id: Number(id), name: cat?.name || 'Unknown', icon: cat?.icon || 'MoreHorizontal', color: cat?.color || '#64748b', amount, budget: cat?.monthlyBudget || 0 };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [yearExpenses, expCatMap]);

  // Smart insights
  const insights = useMemo(() => {
    const tips: { icon: any; text: string; type: 'info' | 'warning' | 'success' }[] = [];
    if (totalExpenses === 0 && totalEarnings === 0) {
      tips.push({ icon: Lightbulb, text: 'Start by adding your income and expenses to see insights here.', type: 'info' });
      return tips;
    }
    if (totalSavings > 0) tips.push({ icon: PiggyBank, text: `You've saved ${formatCurrency(totalSavings)} this year. Great job! 🎉`, type: 'success' });
    else if (totalSavings < 0) tips.push({ icon: AlertTriangle, text: `You've overspent by ${formatCurrency(Math.abs(totalSavings))} this year. Review your expenses.`, type: 'warning' });

    if (topCategories.length > 0) {
      const top = topCategories[0];
      const pct = totalExpenses > 0 ? Math.round((top.amount / totalExpenses) * 100) : 0;
      tips.push({ icon: BarChart3, text: `${top.name} is your highest expense at ${pct}% of total spending.`, type: 'info' });
    }

    // Budget warnings
    topCategories.forEach((c) => {
      if (c.budget > 0) {
        const monthlySpend = c.amount / 12;
        if (monthlySpend > c.budget) {
          tips.push({ icon: AlertTriangle, text: `${c.name} exceeds monthly budget by ${formatCurrency(monthlySpend - c.budget)}/mo.`, type: 'warning' });
        }
      }
    });

    const savingsRate = totalEarnings > 0 ? Math.round((totalSavings / totalEarnings) * 100) : 0;
    if (savingsRate > 20) tips.push({ icon: TrendingUp, text: `Savings rate: ${savingsRate}%. You're above the recommended 20%!`, type: 'success' });
    else if (savingsRate > 0) tips.push({ icon: Lightbulb, text: `Savings rate: ${savingsRate}%. Aim for 20%+ for financial health.`, type: 'info' });

    return tips.slice(0, 4);
  }, [totalExpenses, totalEarnings, totalSavings, topCategories]);

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 shadow-lg text-xs">
        <p className="font-medium text-[var(--color-text-primary)] mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-medium">{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:px-12 lg:py-10 space-y-8 md:space-y-10 pb-12">
        {/* Header + Filter Bar */}
        <div className="mb-6">
          <div className="text-center mb-5">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
            <p className="text-sm text-[var(--color-text-tertiary)] mt-1">Financial overview — {filterLabel}</p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {/* Mode Tabs */}
            <div className="flex items-center bg-[var(--color-surface-secondary)] rounded-xl border border-[var(--color-border)] p-1 gap-1">
              {(['monthly', 'quarterly', 'yearly', 'all'] as FilterMode[]).map((mode) => (
                <button key={mode} onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                    filterMode === mode
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)]'
                  }`}>
                  {mode === 'all' ? 'All Time' : mode}
                </button>
              ))}
            </div>

            {/* Year Selector (hidden for 'all') */}
            {filterMode !== 'all' && (
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedYear(selectedYear - 1)}
                  className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={() => setSelectedYear(selectedYear + 1)}
                  className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Month Selector */}
            {filterMode === 'monthly' && (
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            )}

            {/* Quarter Selector */}
            {filterMode === 'quarterly' && (
              <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                {quarterLabels.map((q, i) => <option key={i} value={i}>{q}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <SummaryCard icon={Wallet} label="Total Balance" value={formatCurrency(totalSavings)} color="#3b82f6" delay={0} trend={totalSavings >= 0 ? 'up' : 'down'} trendLabel={totalEarnings > 0 ? `${Math.round((totalSavings / totalEarnings) * 100)}%` : '0%'} />
          <SummaryCard icon={TrendingUp} label="Total Earnings" value={formatCurrency(totalEarnings)} color="#10b981" delay={0.05} />
          <SummaryCard icon={TrendingDown} label="Total Expenses" value={formatCurrency(totalExpenses)} color="#f43f5e" delay={0.1} />
          <SummaryCard icon={Target} label="Annual Budget" value={totalBudget > 0 ? formatCurrency(totalBudget) : 'Not Set'} color="#8b5cf6" delay={0.15} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Income vs Expense Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-[var(--color-surface-secondary)] rounded-2xl border border-[var(--color-border)] p-5 sm:p-7">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="earnings" fill="#10b981" radius={[4, 4, 0, 0]} name="Earnings" />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Pie */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-[var(--color-surface-secondary)] rounded-2xl border border-[var(--color-border)] p-5 sm:p-7">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Expense Breakdown</h3>
            {categoryPieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {categoryPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-[8px] mt-[16px]">
                  {categoryPieData.slice(0, 4).map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-[8px]">
                        <div className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-[var(--color-text-secondary)]">{c.name}</span>
                      </div>
                      <span className="font-medium text-[var(--color-text-primary)]">{formatCurrency(c.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">No data yet</div>
            )}
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Savings Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-[var(--color-surface-secondary)] rounded-2xl border border-[var(--color-border)] p-5 sm:p-7">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Savings Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={customTooltip} />
                <Area type="monotone" dataKey="savings" stroke="#3b82f6" fill="url(#savingsGrad)" strokeWidth={2} name="Savings" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Cash Flow */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-[var(--color-surface-secondary)] rounded-2xl border border-[var(--color-border)] p-5 sm:p-7">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Cash Flow</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} dot={false} name="Earnings" />
                <Line type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} dot={false} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Bottom Row: Top Categories + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Top Categories */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-[var(--color-surface-secondary)] rounded-2xl border border-[var(--color-border)] p-5 sm:p-7">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Top Spending Categories</h3>
            {topCategories.length > 0 ? (
              <div className="space-y-[16px]">
                {topCategories.map((cat) => {
                  const Icon = getIcon(cat.icon);
                  const pct = totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0;
                  return (
                    <div key={cat.id} className="flex items-center gap-[12px]">
                      <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + '18', color: cat.color }}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-[4px]">
                          <span className="text-xs font-medium text-[var(--color-text-primary)]">{cat.name}</span>
                          <span className="text-xs font-semibold text-[var(--color-text-primary)]">{formatCurrency(cat.amount)}</span>
                        </div>
                        <div className="h-[6px] bg-[var(--color-surface-tertiary)] rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.5 }}
                            className="h-full rounded-full" style={{ backgroundColor: cat.color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[150px] flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">No expenses yet</div>
            )}
          </motion.div>

          {/* Smart Insights */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="bg-[var(--color-surface-secondary)] rounded-2xl border border-[var(--color-border)] p-5 sm:p-7">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">💡 Smart Insights</h3>
            <div className="space-y-[12px]">
              {insights.map((tip, i) => {
                const Icon = tip.icon;
                const colors = { info: 'bg-primary-50 text-primary-600 border-primary-100', warning: 'bg-amber-50 text-amber-700 border-amber-100', success: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                    className={`flex items-start gap-[12px] p-[12px] rounded-xl border ${colors[tip.type]}`}>
                    <Icon size={16} className="shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">{tip.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
