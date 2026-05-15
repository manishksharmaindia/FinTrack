import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X, CreditCard, IndianRupee, Calendar, Percent, Hash, Building2, StickyNote } from 'lucide-react';
import { db, type EmiEntry } from '../db';
import { formatCurrency } from '../utils';

const emptyForm: Omit<EmiEntry, 'id' | 'createdAt'> = {
  name: '', lender: '', totalAmount: 0, emiAmount: 0,
  interestRate: 0, totalEmis: 0, emisPaid: 0, startDate: '', notes: '',
};

export function EmiTab() {
  const emiEntries = useLiveQuery(() => db.emiEntries.toArray()) || [];
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (e: EmiEntry) => {
    setForm({ name: e.name, lender: e.lender, totalAmount: e.totalAmount, emiAmount: e.emiAmount, interestRate: e.interestRate, totalEmis: e.totalEmis, emisPaid: e.emisPaid, startDate: e.startDate, notes: e.notes });
    setEditingId(e.id!); setShowModal(true);
  };

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.name || !form.emiAmount || !form.totalEmis) return;
    if (editingId) {
      await db.emiEntries.update(editingId, { ...form });
    } else {
      await db.emiEntries.add({ ...form, createdAt: new Date().toISOString() });
    }
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (deleteId) { await db.emiEntries.delete(deleteId); setDeleteId(null); }
  };

  // Summary stats
  const totalMonthlyEmi = emiEntries.reduce((s, e) => s + e.emiAmount, 0);
  const totalOutstanding = emiEntries.reduce((s, e) => s + e.emiAmount * (e.totalEmis - e.emisPaid), 0);
  const activeCount = emiEntries.filter(e => e.emisPaid < e.totalEmis).length;

  const getProgress = (e: EmiEntry) => e.totalEmis > 0 ? Math.round((e.emisPaid / e.totalEmis) * 100) : 0;
  const getEndDate = (e: EmiEntry) => {
    if (!e.startDate) return '—';
    const d = new Date(e.startDate);
    d.setMonth(d.getMonth() + e.totalEmis);
    return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  const f = (key: keyof typeof form, val: any) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:px-12 lg:py-10 space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">EMI Tracker</h1>
            <p className="text-sm text-[var(--color-text-tertiary)] mt-1">Manage all your EMI commitments</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm shadow-md shadow-primary-500/20 hover:bg-primary-600 transition-all active:scale-95">
            <Plus size={18} /> Add EMI
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: 'Monthly EMI Outflow', value: formatCurrency(totalMonthlyEmi), icon: IndianRupee, color: '#f43f5e' },
            { label: 'Total Outstanding', value: formatCurrency(totalOutstanding), icon: CreditCard, color: '#f59e0b' },
            { label: 'Active EMIs', value: String(activeCount), icon: Hash, color: '#3b82f6' },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 card-hover">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.color + '15', color: c.color }}>
                  <c.icon size={18} />
                </div>
                <span className="text-xs text-[var(--color-text-tertiary)] font-medium">{c.label}</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">{c.value}</p>
            </motion.div>
          ))}
        </div>

        {/* EMI Cards */}
        {emiEntries.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-text-tertiary)]">
            <CreditCard size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">No EMI entries yet</p>
            <p className="text-sm mt-1">Click "Add EMI" to start tracking</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {emiEntries.map((e, i) => {
              const progress = getProgress(e);
              const remaining = e.totalEmis - e.emisPaid;
              const isComplete = remaining <= 0;
              return (
                <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className={`bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 card-hover ${isComplete ? 'opacity-60' : ''}`}>
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{e.name}</h3>
                        {e.lender && <p className="text-xs text-[var(--color-text-tertiary)]">{e.lender}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(e.id!)} className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
                    <div><span className="text-[var(--color-text-tertiary)]">Monthly EMI</span><p className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(e.emiAmount)}</p></div>
                    <div><span className="text-[var(--color-text-tertiary)]">Total Amount</span><p className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(e.totalAmount)}</p></div>
                    <div><span className="text-[var(--color-text-tertiary)]">Interest Rate</span><p className="font-semibold text-[var(--color-text-primary)]">{e.interestRate}%</p></div>
                    <div><span className="text-[var(--color-text-tertiary)]">Start Date</span><p className="font-semibold text-[var(--color-text-primary)]">{e.startDate ? new Date(e.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</p></div>
                    <div><span className="text-[var(--color-text-tertiary)]">EMIs Paid</span><p className="font-semibold text-[var(--color-text-primary)]">{e.emisPaid} / {e.totalEmis}</p></div>
                    <div><span className="text-[var(--color-text-tertiary)]">End Date</span><p className="font-semibold text-[var(--color-text-primary)]">{getEndDate(e)}</p></div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-[var(--color-text-tertiary)]">{isComplete ? '✅ Completed' : `${remaining} EMIs remaining`}</span>
                      <span className="text-xs font-bold text-primary-500">{progress}%</span>
                    </div>
                    <div className="h-2 bg-[var(--color-surface-tertiary)] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }}
                        className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-primary-500'}`} />
                    </div>
                  </div>

                  {e.notes && <p className="text-xs text-[var(--color-text-tertiary)] mt-3 italic">📝 {e.notes}</p>}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{editingId ? 'Edit EMI' : 'Add New EMI'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)] transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-wider">EMI Name *</label>
                <div className="relative">
                  <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                  <input value={form.name} onChange={e => f('name', e.target.value)} required placeholder="e.g. Home Loan, Car Loan"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                </div>
              </div>
              {/* Lender */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-wider">Lender / Bank</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                  <input value={form.lender} onChange={e => f('lender', e.target.value)} placeholder="e.g. SBI, HDFC"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                </div>
              </div>
              {/* Row: Total Amount + EMI Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-wider">Total Loan Amt</label>
                  <div className="relative">
                    <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                    <input type="number" min={0} value={form.totalAmount || ''} onChange={e => f('totalAmount', Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-wider">Monthly EMI *</label>
                  <div className="relative">
                    <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                    <input type="number" min={0} value={form.emiAmount || ''} onChange={e => f('emiAmount', Number(e.target.value))} required
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                  </div>
                </div>
              </div>
              {/* Row: Interest Rate + Start Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-wider">Interest Rate %</label>
                  <div className="relative">
                    <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                    <input type="number" step="0.01" min={0} value={form.interestRate || ''} onChange={e => f('interestRate', Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-wider">Start Date</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                    <input type="date" value={form.startDate} onChange={e => f('startDate', e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                  </div>
                </div>
              </div>
              {/* Row: Total EMIs + EMIs Paid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-wider">Total EMIs *</label>
                  <div className="relative">
                    <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                    <input type="number" min={1} value={form.totalEmis || ''} onChange={e => f('totalEmis', Number(e.target.value))} required
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-wider">EMIs Paid</label>
                  <div className="relative">
                    <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                    <input type="number" min={0} value={form.emisPaid || ''} onChange={e => f('emisPaid', Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                  </div>
                </div>
              </div>
              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-wider">Notes</label>
                <div className="relative">
                  <StickyNote size={14} className="absolute left-3 top-3 text-[var(--color-text-tertiary)]" />
                  <textarea value={form.notes} onChange={e => f('notes', e.target.value)} rows={2} placeholder="Any additional details..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none" />
                </div>
              </div>
              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-colors">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold bg-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary-500/20 transition-all active:scale-95">
                  {editingId ? 'Update' : 'Add EMI'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Delete EMI?</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-5">This entry will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20 transition-all active:scale-95">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
