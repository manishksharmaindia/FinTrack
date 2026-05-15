import { X, Database, HardDrive, ShieldAlert, BookOpen, ChevronRight, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface HelpDocProps {
  onClose: () => void;
}

export function HelpDoc({ onClose }: HelpDocProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <BookOpen size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">FinTrack Documentation</h2>
              <p className="text-xs text-[var(--color-text-tertiary)]">User Guide & Technical Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {/* ───── HOW TO USE ───── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ChevronRight size={18} className="text-primary-500" />
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">How to Use FinTrack</h3>
            </div>

            <div className="space-y-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-xs font-bold">1</span>
                  Categories Tab
                </h4>
                <ul className="space-y-1.5 ml-8 list-disc marker:text-[var(--color-text-tertiary)]">
                  <li>View and manage your <strong>Expense</strong> and <strong>Earning</strong> categories</li>
                  <li>Click <strong>"+ Add Category"</strong> to create a new category with a custom name, icon, color, and monthly budget</li>
                  <li>Use the <strong>✏️ Edit</strong> button on any category to update its details</li>
                  <li>Use the <strong>🗑️ Delete</strong> button to remove a category permanently</li>
                  <li>Toggle between <strong>Expenses</strong> and <strong>Earnings</strong> tabs to switch views</li>
                  <li>Use the search bar to quickly find categories</li>
                </ul>
              </div>

              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-xs font-bold">2</span>
                  Transactions Tab
                </h4>
                <ul className="space-y-1.5 ml-8 list-disc marker:text-[var(--color-text-tertiary)]">
                  <li>Record daily <strong>expenses</strong> and <strong>earnings</strong> with date, amount, category, and notes</li>
                  <li>Navigate months using the <strong>◀ ▶</strong> arrows to view transactions for any month</li>
                  <li>Filter by <strong>All / Expenses / Earnings</strong> using the toggle buttons</li>
                  <li>Search transactions by notes, category name, or amount</li>
                  <li>Select payment method: Cash, UPI, Credit Card, Debit Card, Net Banking, or Wallet</li>
                  <li>Use <strong>✏️ Edit</strong> or <strong>🗑️ Delete</strong> on any transaction to modify or remove it</li>
                  <li>Summary cards at the top show monthly totals at a glance</li>
                </ul>
              </div>

              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center text-xs font-bold">3</span>
                  Dashboard Tab
                </h4>
                <ul className="space-y-1.5 ml-8 list-disc marker:text-[var(--color-text-tertiary)]">
                  <li>View <strong>annual financial overview</strong> — total earnings, expenses, savings, and budget</li>
                  <li><strong>Income vs Expenses</strong> bar chart shows monthly comparison</li>
                  <li><strong>Expense Breakdown</strong> pie chart visualizes spending by category</li>
                  <li><strong>Savings Trend</strong> and <strong>Cash Flow</strong> charts track financial health over time</li>
                  <li><strong>Top Spending Categories</strong> shows where most money goes</li>
                  <li><strong>Smart Insights</strong> provides AI-style tips based on your spending patterns</li>
                </ul>
              </div>

              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold">4</span>
                  Import / Export & Other Tools
                </h4>
                <ul className="space-y-1.5 ml-8 list-disc marker:text-[var(--color-text-tertiary)]">
                  <li><strong>Export Expenses / Earnings</strong> — download your data as a CSV file</li>
                  <li><strong>Import Expenses / Earnings</strong> — upload a CSV file to bulk-add data</li>
                  <li><strong>Theme Toggle</strong> — switch between Light and Dark mode</li>
                  <li><strong>Reset Data</strong> — permanently delete all data (requires admin password: <code className="bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 rounded text-xs font-mono">magic@123</code>)</li>
                  <li><strong>Year Selector</strong> — switch between years (2026–2050) from the sidebar</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ───── DATABASE DETAILS ───── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database size={18} className="text-primary-500" />
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Database Details</h3>
            </div>

            <div className="space-y-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Info size={16} className="text-primary-500 shrink-0 mt-0.5" />
                  <p>
                    FinTrack uses <strong>IndexedDB</strong> — a powerful, browser-native NoSQL database built into every modern browser.
                    We use <strong>Dexie.js</strong> as a wrapper library for simpler and more reliable database operations.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] p-3">
                    <p className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Database Name</p>
                    <p className="font-semibold text-[var(--color-text-primary)] font-mono text-xs">SmartExpenseManager</p>
                  </div>
                  <div className="bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] p-3">
                    <p className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Library</p>
                    <p className="font-semibold text-[var(--color-text-primary)] text-xs">Dexie.js v4</p>
                  </div>
                </div>
              </div>

              {/* Tables */}
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Database Tables (6 total)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="text-left py-2 pr-4 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Table</th>
                        <th className="text-left py-2 pr-4 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Fields</th>
                        <th className="text-left py-2 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Indexes</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--color-text-secondary)]">
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-mono font-semibold text-[var(--color-text-primary)]">expenseCategories</td>
                        <td className="py-2.5 pr-4">id, name, icon, color, monthlyBudget, isDefault, createdAt</td>
                        <td className="py-2.5">id (auto), name, createdAt</td>
                      </tr>
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-mono font-semibold text-[var(--color-text-primary)]">earningCategories</td>
                        <td className="py-2.5 pr-4">id, name, icon, color, isRecurring, recurringAmount, recurringFrequency, isDefault, createdAt</td>
                        <td className="py-2.5">id (auto), name, createdAt</td>
                      </tr>
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-mono font-semibold text-[var(--color-text-primary)]">expenses</td>
                        <td className="py-2.5 pr-4">id, date, categoryId, amount, paymentMethod, notes, tags, isRecurring, createdAt</td>
                        <td className="py-2.5">id (auto), date, categoryId, paymentMethod, amount</td>
                      </tr>
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-mono font-semibold text-[var(--color-text-primary)]">earnings</td>
                        <td className="py-2.5 pr-4">id, date, categoryId, amount, source, notes, isRecurring, createdAt</td>
                        <td className="py-2.5">id (auto), date, categoryId, amount</td>
                      </tr>
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-mono font-semibold text-[var(--color-text-primary)]">budgets</td>
                        <td className="py-2.5 pr-4">id, year, month, totalBudget, savingsGoal</td>
                        <td className="py-2.5">id (auto), year, month, [year+month]</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 font-mono font-semibold text-[var(--color-text-primary)]">userProfiles</td>
                        <td className="py-2.5 pr-4">id, name, currency, theme, createdAt</td>
                        <td className="py-2.5">id (auto), name</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* ───── STORAGE LIMITS ───── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <HardDrive size={18} className="text-primary-500" />
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Storage Limits by Browser</h3>
            </div>

            <div className="space-y-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p>
                    IndexedDB storage is <strong>very generous</strong>. For a finance app like FinTrack, you can store
                    <strong> millions of transactions</strong> without hitting any limit in most browsers.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="text-left py-2 pr-4 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Browser</th>
                        <th className="text-left py-2 pr-4 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Storage Limit</th>
                        <th className="text-left py-2 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--color-text-secondary)]">
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-semibold text-[var(--color-text-primary)]">🌐 Google Chrome</td>
                        <td className="py-2.5 pr-4 font-mono">Up to 80% of disk space</td>
                        <td className="py-2.5">Per origin. On a 256GB disk ≈ ~200GB available</td>
                      </tr>
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-semibold text-[var(--color-text-primary)]">🔥 Mozilla Firefox</td>
                        <td className="py-2.5 pr-4 font-mono">Up to 50% of disk space</td>
                        <td className="py-2.5">Max ~2GB per origin by default. Prompts user if more needed</td>
                      </tr>
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-semibold text-[var(--color-text-primary)]">🧭 Safari (macOS/iOS)</td>
                        <td className="py-2.5 pr-4 font-mono">~1 GB per origin</td>
                        <td className="py-2.5">Strictest limits. Data may be evicted after 7 days of inactivity in some versions</td>
                      </tr>
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-semibold text-[var(--color-text-primary)]">🔷 Microsoft Edge</td>
                        <td className="py-2.5 pr-4 font-mono">Up to 80% of disk space</td>
                        <td className="py-2.5">Same as Chrome (Chromium-based)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 font-semibold text-[var(--color-text-primary)]">📱 Mobile Browsers</td>
                        <td className="py-2.5 pr-4 font-mono">Varies (50MB – 500MB+)</td>
                        <td className="py-2.5">More restrictive. iOS Safari is most limited</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-md border border-emerald-200 dark:border-emerald-900/30 p-4">
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  <strong>💡 Practical estimate:</strong> Each transaction record is ~500 bytes. In Chrome, you could store
                  <strong> 4+ million transactions</strong> even within just 2GB — that's over <strong>10,000 transactions per day for a year</strong>.
                  For personal finance, you'll never run out of space.
                </p>
              </div>
            </div>
          </section>

          {/* ───── DATA LOSS SCENARIOS ───── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={18} className="text-rose-500" />
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">How You Can Lose Data</h3>
            </div>

            <div className="space-y-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {[
                {
                  title: 'Clearing Browser Data',
                  desc: 'Going to browser Settings → "Clear browsing data" → selecting "Cookies and site data" will delete all IndexedDB data permanently.',
                  severity: 'high',
                },
                {
                  title: 'Uninstalling / Reinstalling Browser',
                  desc: 'Removing the browser from your device deletes all local databases including FinTrack data.',
                  severity: 'high',
                },
                {
                  title: 'Using Incognito / Private Mode',
                  desc: 'Data saved in Incognito mode is automatically deleted when the window is closed. Always use normal mode.',
                  severity: 'high',
                },
                {
                  title: 'Safari\'s 7-Day Eviction Policy',
                  desc: 'Safari (especially on iOS) may delete IndexedDB data if the site hasn\'t been visited in 7 days. Use Chrome or Edge for reliable long-term storage.',
                  severity: 'high',
                },
                {
                  title: 'Using the "Reset Data" Button',
                  desc: 'The in-app Reset button (in sidebar) permanently deletes all categories, expenses, and earnings. Password protected for safety.',
                  severity: 'medium',
                },
                {
                  title: 'Switching Devices or Browsers',
                  desc: 'IndexedDB is local to each browser on each device. Your data does NOT sync across browsers or devices. Use Export/Import to transfer data.',
                  severity: 'medium',
                },
                {
                  title: 'Browser Storage Pressure',
                  desc: 'If your device runs very low on disk space, the browser may evict stored data. This is extremely rare for desktop.',
                  severity: 'low',
                },
                {
                  title: 'OS Reinstallation or Hard Drive Failure',
                  desc: 'Any system-level failure will destroy browser data. Regularly export your data as CSV for backup.',
                  severity: 'high',
                },
              ].map((item, i) => (
                <div key={i} className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4 flex items-start gap-3">
                  <AlertTriangle size={16} className={`shrink-0 mt-0.5 ${item.severity === 'high' ? 'text-rose-500' : item.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'}`} />
                  <div>
                    <p className="font-semibold text-[var(--color-text-primary)] text-xs">{item.title}</p>
                    <p className="text-xs mt-1 text-[var(--color-text-secondary)]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-md border border-amber-200 dark:border-amber-900/30 p-4 mt-4">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                ⚠️ Best Practice: Regularly use <strong>Export (CSV)</strong> from the sidebar to back up your financial data.
                This is the safest way to protect against any data loss. See the section below for step-by-step instructions.
              </p>
            </div>
          </section>

          {/* ───── HOW TO PROTECT YOUR DATA ───── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">How to Protect Your Data (Backup & Restore)</h3>
            </div>

            <div className="space-y-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-md border border-emerald-200 dark:border-emerald-900/30 p-4">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Since FinTrack stores data locally in your browser, <strong>exporting your data regularly as CSV files is the only way to create a backup</strong>.
                    If your data is ever lost, you can import these CSV files back to restore everything.
                  </p>
                </div>
              </div>

              {/* Step 1: Export */}
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-xs font-bold">1</span>
                  Taking Backup — Export Your Data
                </h4>
                <ol className="space-y-2 ml-8 list-decimal marker:text-[var(--color-text-tertiary)] marker:font-semibold">
                  <li>Open the <strong>Sidebar</strong> and click on <strong>"Import / Export"</strong> to expand the menu</li>
                  <li>Click <strong>"📤 Export Expenses"</strong> — this downloads a CSV file containing all your expense transactions</li>
                  <li>Click <strong>"📤 Export Earnings"</strong> — this downloads a CSV file containing all your earning transactions</li>
                  <li>Save both CSV files in a <strong>safe location</strong> — Google Drive, USB drive, or any cloud storage</li>
                  <li className="text-emerald-600 dark:text-emerald-400 font-medium">✅ Repeat this process weekly or monthly to keep your backup up to date</li>
                </ol>
              </div>

              {/* Step 2: Store Safely */}
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-xs font-bold">2</span>
                  Store Backup Files Safely
                </h4>
                <ul className="space-y-1.5 ml-8 list-disc marker:text-[var(--color-text-tertiary)]">
                  <li>Keep CSV files in <strong>cloud storage</strong> (Google Drive, OneDrive, iCloud, Dropbox)</li>
                  <li>Or save to a <strong>USB drive / external hard disk</strong> as a secondary backup</li>
                  <li>Name your files with dates for easy tracking, e.g., <code className="bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 rounded text-xs font-mono">expenses_backup_2026-05-15.csv</code></li>
                  <li>Keep at least the <strong>last 2-3 backups</strong> so you always have a recent copy</li>
                </ul>
              </div>

              {/* Step 3: Restore */}
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold">3</span>
                  Restoring Data — Import Your Backup
                </h4>
                <p className="ml-8 mb-2 text-xs">If your data is lost (browser cleared, device changed, etc.), follow these steps:</p>
                <ol className="space-y-2 ml-8 list-decimal marker:text-[var(--color-text-tertiary)] marker:font-semibold">
                  <li>Open FinTrack in your browser — the app will start fresh with default categories</li>
                  <li>Open the <strong>Sidebar</strong> → click <strong>"Import / Export"</strong></li>
                  <li>Click <strong>"📥 Import Expenses"</strong> → select your backed-up expenses CSV file</li>
                  <li>Click <strong>"📥 Import Earnings"</strong> → select your backed-up earnings CSV file</li>
                  <li>Your transactions will be restored immediately and visible in the Transactions tab</li>
                  <li className="text-emerald-600 dark:text-emerald-400 font-medium">✅ All your financial data is now restored! Dashboard charts will update automatically.</li>
                </ol>
              </div>

              {/* Summary */}
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">📋 Quick Summary</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="text-left py-2 pr-4 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Action</th>
                        <th className="text-left py-2 pr-4 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">How</th>
                        <th className="text-left py-2 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">When</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--color-text-secondary)]">
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-semibold text-[var(--color-text-primary)]">📤 Export (Backup)</td>
                        <td className="py-2.5 pr-4">Sidebar → Import/Export → Export Expenses & Earnings</td>
                        <td className="py-2.5">Weekly or Monthly</td>
                      </tr>
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-semibold text-[var(--color-text-primary)]">💾 Store Safely</td>
                        <td className="py-2.5 pr-4">Save CSV files to Google Drive, USB, or cloud storage</td>
                        <td className="py-2.5">After every export</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 font-semibold text-[var(--color-text-primary)]">📥 Import (Restore)</td>
                        <td className="py-2.5 pr-4">Sidebar → Import/Export → Import Expenses & Earnings</td>
                        <td className="py-2.5">When data is lost</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] shrink-0 flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-tertiary)]">FinTrack v1.0 — Built with React, Dexie.js & IndexedDB</p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
}
