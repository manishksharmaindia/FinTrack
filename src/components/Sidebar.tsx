import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Receipt, BarChart3, Sun, Moon, Download, RotateCcw, Plus, Minus, X } from 'lucide-react';
import { useAppStore } from '../store';
import { exportExpensesCSV, exportEarningsCSV, importCSV, resetDatabase } from '../exportUtils';
import logoUrl from '../assets/logo.png';

const tabs = [
  { id: 0, label: 'Categories', icon: LayoutGrid, desc: 'Manage Types' },
  { id: 1, label: 'Transactions', icon: Receipt, desc: 'Monthly Entry' },
  { id: 2, label: 'Dashboard', icon: BarChart3, desc: 'Analytics' },
];

export function Sidebar() {
  const { activeTab, setActiveTab, theme, toggleTheme, selectedYear, isMobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const [showTools, setShowTools] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');

  const handleImport = async (type: 'expense' | 'earning') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const count = await importCSV(file, type);
        alert(`Imported ${count} ${type} records.`);
      }
    };
    input.click();
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPassword === 'magic@123') {
      resetDatabase();
    } else {
      setResetError('Incorrect password');
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-50 w-[280px] h-full max-h-screen flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] md:rounded-md shrink-0 shadow-sm transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-[24px] pt-[24px] pb-[24px] md:pt-[32px] md:pb-[32px]">
          <div className="flex items-center gap-[16px]">
            <div className="w-[48px] h-[48px] rounded-2xl overflow-hidden shadow-md shrink-0 border border-[var(--color-border)]">
              <img src={logoUrl} alt="FinTrack Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--color-text-primary)] leading-tight">FinTrack</h1>
              <p className="text-sm text-[var(--color-text-tertiary)] leading-tight mt-1">Smart Finance</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            className="md:hidden p-2 rounded-xl text-[var(--color-text-tertiary)] bg-[var(--color-surface-tertiary)] hover:bg-[var(--color-border)] transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-[20px] overflow-y-auto flex flex-col gap-[12px]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                className={`relative w-full flex items-center gap-[16px] px-[16px] py-[16px] rounded-[16px] text-left transition-all duration-200 ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-[16px] border border-primary-100 dark:border-primary-900/30"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <Icon size={22} className="relative z-10 shrink-0" />
                <div className="relative z-10">
                  <span className="text-sm font-bold block leading-tight">{tab.label}</span>
                  <span className="text-xs opacity-70 mt-1 block font-medium">{tab.desc}</span>
                </div>
              </button>
            );
          })}

          {/* Tools Section */}
          <div className="pt-[24px] pb-[16px]">
            <button
              onClick={() => setShowTools(!showTools)}
              className="w-full flex items-center justify-between px-[16px] py-[16px] rounded-[16px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-all font-semibold"
            >
              <div className="flex items-center gap-[16px]">
                <Download size={22} className="shrink-0" />
                <span className="text-sm">Import / Export</span>
              </div>
              <div className="shrink-0 text-[var(--color-text-tertiary)]">
                {showTools ? <Minus size={18} /> : <Plus size={18} />}
              </div>
            </button>

            {showTools && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="ml-[24px] mt-[8px] flex flex-col gap-[4px] overflow-hidden border-l-2 border-[var(--color-border)] pl-[16px]"
              >
                <button onClick={() => exportExpensesCSV(selectedYear)}
                  className="w-full text-left px-[16px] py-[10px] text-sm font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] rounded-xl transition-all">
                  📤 Export Expenses
                </button>
                <button onClick={() => exportEarningsCSV(selectedYear)}
                  className="w-full text-left px-[16px] py-[10px] text-sm font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] rounded-xl transition-all">
                  📤 Export Earnings
                </button>
                <button onClick={() => handleImport('expense')}
                  className="w-full text-left px-[16px] py-[10px] text-sm font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] rounded-xl transition-all">
                  📥 Import Expenses
                </button>
                <button onClick={() => handleImport('earning')}
                  className="w-full text-left px-[16px] py-[10px] text-sm font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] rounded-xl transition-all">
                  📥 Import Earnings
                </button>
              </motion.div>
            )}
          </div>
        </nav>

        {/* Bottom controls */}
        <div className="border-t border-[var(--color-border)]">
          <div className="px-[20px] py-[24px] flex flex-col gap-[12px]">
            {/* Signature */}
            <div className="px-[16px] pb-[8px]">
              <p className="text-[11px] font-medium text-[var(--color-text-tertiary)] leading-tight">App Created By:</p>
              <p className="text-[13px] font-semibold text-[var(--color-text-secondary)] mt-1 leading-tight">Manish Sharma</p>
              <a href="mailto:manishksharma.india@gmail.com" className="text-[11px] text-[var(--color-text-tertiary)] hover:text-primary-500 mt-0.5 leading-tight transition-colors block break-all">
                manishksharma.india@gmail.com
              </a>
            </div>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-[16px] px-[16px] py-[16px] rounded-[16px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] transition-all font-semibold"
            >
              {theme === 'light' ? <Moon size={22} className="shrink-0" /> : <Sun size={22} className="shrink-0" />}
              <span className="text-sm">Theme: {theme === 'light' ? 'Light' : 'Dark'}</span>
            </button>
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full flex items-center gap-[16px] px-[16px] py-[16px] rounded-[16px] text-[var(--color-text-tertiary)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all font-semibold"
            >
              <RotateCcw size={22} className="shrink-0" />
              <span className="text-sm">Reset Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-md w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                <RotateCcw size={24} className="text-rose-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Reset Data</h2>
                <p className="text-sm text-rose-500 font-medium">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              All expenses, earnings, and custom categories will be permanently deleted.
            </p>

            <form onSubmit={handleResetSubmit}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-[var(--color-text-tertiary)] mb-2 uppercase tracking-wider">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => {
                    setResetPassword(e.target.value);
                    setResetError('');
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                  placeholder="Enter password to confirm"
                  autoFocus
                />
                {resetError && (
                  <p className="text-sm text-rose-500 mt-2 font-medium">{resetError}</p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetPassword('');
                    setResetError('');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20 transition-all active:scale-95"
                >
                  Reset Now
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
