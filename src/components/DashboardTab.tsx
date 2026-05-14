import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Target, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Lightbulb, BarChart3
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, AreaChart, Area, LineChart, Line, Legend
} from 'recharts';
import { db } from '../db';
import { useAppStore } from '../store';
import { formatCurrency, months, getIcon } from '../utils';



function SummaryCard({ icon: Icon, label, value, trend, trendLabel, color, delay }: {
  icon: any; label: string; value: string; trend?: 'up' | 'down'; trendLabel?: string; color: string; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 card-hover">
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

export function DashboardTab() {
  const { selectedYear } = useAppStore();

  const allExpenses = useLiveQuery(() => db.expenses.toArray()) || [];
  const allEarnings = useLiveQuery(() => db.earnings.toArray()) || [];
  const expCats = useLiveQuery(() => db.expenseCategories.toArray()) || [];


  const expCatMap = useMemo(() => Object.fromEntries(expCats.map((c) => [c.id, c])), [expCats]);

  // Year filter
  const yearExpenses = useMemo(() => allExpenses.filter((e) => new Date(e.date).getFullYear() === selectedYear), [allExpenses, selectedYear]);
  const yearEarnings = useMemo(() => allEarnings.filter((e) => new Date(e.date).getFullYear() === selectedYear), [allEarnings, selectedYear]);

  const totalExpenses = yearExpenses.reduce((s, e) => s + e.amount, 0);
  const totalEarnings = yearEarnings.reduce((s, e) => s + e.amount, 0);
  const totalSavings = totalEarnings - totalExpenses;
  const totalBudget = expCats.reduce((s, c) => s + (c.monthlyBudget || 0), 0) * 12;

  // Monthly breakdown for charts
  const monthlyData = useMemo(() => {
    return months.map((name, i) => {
      const mExp = yearExpenses.filter((e) => new Date(e.date).getMonth() === i).reduce((s, e) => s + e.amount, 0);
      const mEarn = yearEarnings.filter((e) => new Date(e.date).getMonth() === i).reduce((s, e) => s + e.amount, 0);
      return { name: name.slice(0, 3), expenses: mExp, earnings: mEarn, savings: mEarn - mExp };
    });
  }, [yearExpenses, yearEarnings]);

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
      <div className="max-w-6xl mx-auto px-[32px] py-[32px] space-y-[32px]">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">Financial overview for {selectedYear}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[24px]">
          <SummaryCard icon={Wallet} label="Total Balance" value={formatCurrency(totalSavings)} color="#3b82f6" delay={0} trend={totalSavings >= 0 ? 'up' : 'down'} trendLabel={totalEarnings > 0 ? `${Math.round((totalSavings / totalEarnings) * 100)}%` : '0%'} />
          <SummaryCard icon={TrendingUp} label="Total Earnings" value={formatCurrency(totalEarnings)} color="#10b981" delay={0.05} />
          <SummaryCard icon={TrendingDown} label="Total Expenses" value={formatCurrency(totalExpenses)} color="#f43f5e" delay={0.1} />
          <SummaryCard icon={Target} label="Annual Budget" value={totalBudget > 0 ? formatCurrency(totalBudget) : 'Not Set'} color="#8b5cf6" delay={0.15} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
          {/* Income vs Expense Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-[24px]">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-[16px]">Income vs Expenses</h3>
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
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-[24px]">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-[16px]">Expense Breakdown</h3>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
          {/* Savings Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-[24px]">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-[16px]">Savings Trend</h3>
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
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-[24px]">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-[16px]">Cash Flow</h3>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
          {/* Top Categories */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-[24px]">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-[16px]">Top Spending Categories</h3>
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
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-[24px]">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-[16px]">💡 Smart Insights</h3>
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
