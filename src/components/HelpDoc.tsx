import { X, Database, HardDrive, ShieldAlert, BookOpen, ChevronRight, AlertTriangle, Info, CheckCircle2, Lock, Cloud } from 'lucide-react';
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
                  <li><strong>Reset Data</strong> — permanently delete all your cloud data (type <code className="bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 rounded text-xs font-mono">RESET</code> to confirm)</li>
                  <li><strong>Year Selector</strong> — switch between years (2026–2050) from the sidebar</li>
                </ul>
              </div>

              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4 border-l-4 border-l-primary-500">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-xs font-bold">5</span>
                  EMI Tracker Tab (Special Note)
                </h4>
                <ul className="space-y-2 ml-8 list-disc marker:text-[var(--color-text-tertiary)]">
                  <li className="text-rose-500 font-semibold italic">IMPORTANT: Any values or amounts added in this EMI tab do NOT reflect in the Dashboard tab calculations. This tab is completely separate for your loan tracking.</li>
                  <li><strong>How to show EMI in Dashboard:</strong> If you want your EMI numbers to be included in the main Dashboard analytics, you must:
                    <ul className="mt-2 ml-4 space-y-1 list-[circle] opacity-80">
                      <li>Add the <strong>Total Loan Amount</strong> as an <strong>Earning</strong> in the Transactions tab when you receive it.</li>
                      <li>Add your <strong>Monthly EMI Payments</strong> as <strong>Expenses</strong> in the Transactions tab each month.</li>
                    </ul>
                  </li>
                  <li>By following the steps above, your Dashboard will correctly reflect your actual cash flow and financial health.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ───── DATABASE DETAILS ───── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database size={18} className="text-primary-500" />
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Data Storage Architecture</h3>
            </div>

            <div className="space-y-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">

              {/* Overview */}
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <div className="flex items-start gap-3 mb-4">
                  <Cloud size={16} className="text-primary-500 shrink-0 mt-0.5" />
                  <p>
                    FinTrack stores all your data in <strong>Firebase Firestore</strong> — Google's managed cloud database.
                    Your data is synced in real time and accessible from any device or browser as long as you log in with the same account.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] p-3">
                    <p className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Backend</p>
                    <p className="font-semibold text-[var(--color-text-primary)] text-xs">Firebase Firestore</p>
                  </div>
                  <div className="bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] p-3">
                    <p className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Auth</p>
                    <p className="font-semibold text-[var(--color-text-primary)] text-xs">Firebase Auth</p>
                  </div>
                  <div className="bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] p-3">
                    <p className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Encryption</p>
                    <p className="font-semibold text-[var(--color-text-primary)] text-xs">AES-256-GCM</p>
                  </div>
                  <div className="bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] p-3">
                    <p className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Structure</p>
                    <p className="font-semibold text-[var(--color-text-primary)] text-xs">Single doc / user</p>
                  </div>
                </div>
              </div>

              {/* E2E Encryption */}
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-md border border-blue-200 dark:border-blue-900/30 p-4">
                <div className="flex items-start gap-3">
                  <Lock size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-700 dark:text-blue-300 text-xs mb-1">End-to-End Encryption — Your Data is Private</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                      All your financial data is encrypted <strong>in your browser</strong> before it ever reaches Firestore.
                      The encryption key is derived from your <strong>login password using PBKDF2 (100,000 iterations)</strong> and your unique user ID as the salt.
                      This means even Firebase / Google cannot read your data — only you can, with your password.
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Structure */}
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Firestore Document Structure</h4>
                <p className="text-xs text-[var(--color-text-secondary)] mb-3 leading-relaxed">
                  All your data lives in a <strong>single Firestore document</strong> at <code className="bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 rounded font-mono">users/{'{'}&lt;your-uid&gt;{'}'}</code>.
                  Each section (expenses, earnings, etc.) is stored as a separate <strong>encrypted string field</strong> within that document.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="text-left py-2 pr-4 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Field</th>
                        <th className="text-left py-2 pr-4 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Contents</th>
                        <th className="text-left py-2 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Encrypted?</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--color-text-secondary)]">
                      {[
                        ['expenseCategories', 'id, name, icon, color, monthlyBudget, isDefault, createdAt', true],
                        ['earningCategories', 'id, name, icon, color, isRecurring, recurringAmount, recurringFrequency, isDefault, createdAt', true],
                        ['expenses', 'id, date, categoryId, amount, paymentMethod, notes, tags, isRecurring, createdAt', true],
                        ['earnings', 'id, date, categoryId, amount, source, notes, isRecurring, createdAt', true],
                        ['budgets', 'id, year, month, totalBudget, savingsGoal', true],
                        ['userProfiles', 'id, name, currency, theme, createdAt', true],
                        ['emiEntries', 'id, name, lender, totalAmount, emiAmount, interestRate, totalEmis, emisPaid, startDate, notes, createdAt', true],
                        ['dataVersion', 'Schema version number (currently 2)', false],
                        ['lastUpdated', 'ISO timestamp of last write', false],
                      ].map(([field, contents, enc], i, arr) => (
                        <tr key={field as string} className={i < arr.length - 1 ? 'border-b border-[var(--color-border)]/50' : ''}>
                          <td className="py-2.5 pr-4 font-mono font-semibold text-[var(--color-text-primary)] text-[11px]">{field as string}</td>
                          <td className="py-2.5 pr-4">{contents as string}</td>
                          <td className="py-2.5">{enc ? <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✅ Yes</span> : <span className="text-[var(--color-text-tertiary)]">No</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Login & Key derivation */}
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">How Login & Encryption Works</h4>
                <ol className="space-y-2 ml-2 list-decimal marker:text-[var(--color-text-tertiary)] marker:font-semibold text-xs leading-relaxed">
                  <li>You enter your <strong>email + password</strong> on the login screen.</li>
                  <li>Firebase Auth verifies your credentials and returns your unique <strong>User ID (UID)</strong>.</li>
                  <li>Your browser derives a <strong>256-bit AES-GCM encryption key</strong> from your password + UID using PBKDF2 (100,000 rounds). This key never leaves your device.</li>
                  <li>All data read from Firestore is <strong>decrypted in-browser</strong> using this key before being displayed.</li>
                  <li>All data written to Firestore is <strong>encrypted in-browser</strong> first — Firestore only ever sees ciphertext.</li>
                  <li>When you sign out, the encryption key is discarded from memory. Your data in Firestore remains safe ciphertext.</li>
                </ol>
                <div className="mt-3 bg-amber-50 dark:bg-amber-900/10 rounded-md border border-amber-200 dark:border-amber-900/30 p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    ⚠️ <strong>Important:</strong> If you forget your password, your encrypted data <strong>cannot be recovered</strong> — there is no master key.
                    Use Firebase's <em>"Forgot Password"</em> reset only if you need to regain access to your account;
                    however, data encrypted with the old password will be unreadable with a new one.
                    Always keep your password safe.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* ───── STORAGE LIMITS ───── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <HardDrive size={18} className="text-primary-500" />
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Cloud Storage & Limits</h3>
            </div>

            <div className="space-y-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p>
                    Because FinTrack uses <strong>Firebase Firestore</strong>, your data is stored in Google's cloud — not in your browser.
                    This means your data persists across all browsers, devices, and OS reinstalls.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="text-left py-2 pr-4 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Limit</th>
                        <th className="text-left py-2 pr-4 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Value</th>
                        <th className="text-left py-2 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--color-text-secondary)]">
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-semibold text-[var(--color-text-primary)]">Document size</td>
                        <td className="py-2.5 pr-4 font-mono">Max 1 MB</td>
                        <td className="py-2.5">All your data is stored in one document. Encrypted data is ~1.4× larger than raw JSON.</td>
                      </tr>
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-semibold text-[var(--color-text-primary)]">Practical record limit</td>
                        <td className="py-2.5 pr-4 font-mono">~5,000–10,000 records</td>
                        <td className="py-2.5">Depends on note/tag length. Typical users will never hit this limit.</td>
                      </tr>
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-semibold text-[var(--color-text-primary)]">Firebase free tier</td>
                        <td className="py-2.5 pr-4 font-mono">1 GiB storage, 50K reads/day</td>
                        <td className="py-2.5">Firestore Spark (free) plan. Sufficient for personal finance tracking.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 font-semibold text-[var(--color-text-primary)]">Data availability</td>
                        <td className="py-2.5 pr-4 font-mono">Any device, any browser</td>
                        <td className="py-2.5">Log in with your account on any device to access all your data.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-md border border-emerald-200 dark:border-emerald-900/30 p-4">
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  <strong>💡 Practical estimate:</strong> Each transaction is ~300–500 bytes after encryption.
                  A typical user adding 5 transactions per day for 5 years accumulates ~9,000 records — well within the document limit.
                  If you reach the limit, export old years to CSV and clear them from the app.
                </p>
              </div>
            </div>
          </section>

          {/* ───── DATA LOSS SCENARIOS ───── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={18} className="text-rose-500" />
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">When Can You Lose Data?</h3>
            </div>

            <div className="space-y-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {[
                {
                  title: 'Forgetting Your Password',
                  desc: 'Your data is encrypted with a key derived from your password. If you forget it, the encrypted data in Firestore becomes permanently unreadable. There is no master key or recovery mechanism.',
                  severity: 'high',
                },
                {
                  title: 'Using the "Reset Data" Button',
                  desc: 'The in-app Reset button (in sidebar) permanently overwrites all your cloud data with empty arrays. Type RESET to confirm. This cannot be undone.',
                  severity: 'high',
                },
                {
                  title: 'Firebase Account Deletion',
                  desc: 'If your Firebase Auth account is deleted (by you or by an admin), your Firestore document at users/{uid} and all your data is removed permanently.',
                  severity: 'high',
                },
                {
                  title: 'Firestore Document Size Exceeded',
                  desc: 'Firestore documents have a 1MB limit. If your encrypted data exceeds this (very unlikely for normal use), writes will fail silently. Export old data regularly.',
                  severity: 'medium',
                },
                {
                  title: 'Network Issues During Write',
                  desc: 'If you lose internet mid-write (e.g., during import), the Firestore write may not complete. The app will show a timeout after 30 seconds. Try again when connected.',
                  severity: 'low',
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

            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-md border border-emerald-200 dark:border-emerald-900/30 p-4 mt-4">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                ✅ <strong>Good news:</strong> Unlike the old browser-only version, your data is now safe from browser clearing, device changes, OS reinstalls, and incognito mode.
                It lives in Google's cloud and syncs automatically across all your devices.
              </p>
            </div>
          </section>

          {/* ───── HOW TO PROTECT YOUR DATA ───── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Backup & Restore Your Data</h3>
            </div>

            <div className="space-y-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-md border border-blue-200 dark:border-blue-900/30 p-4">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Your data is safely stored in the cloud and syncs across devices automatically.
                    However, <strong>exporting CSV backups periodically</strong> is still a good habit — it protects against accidental resets,
                    password loss, or account deletion.
                  </p>
                </div>
              </div>

              {/* Step 1: Export */}
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-xs font-bold">1</span>
                  Export Your Data (CSV Backup)
                </h4>
                <ol className="space-y-2 ml-8 list-decimal marker:text-[var(--color-text-tertiary)] marker:font-semibold">
                  <li>Open the <strong>Sidebar</strong> and click <strong>"Import / Export"</strong> to expand the section</li>
                  <li>Click <strong>"📤 Export Expenses"</strong> — downloads a CSV of all your expense records</li>
                  <li>Click <strong>"📤 Export Earnings"</strong> — downloads a CSV of all your earning records</li>
                  <li>Click <strong>"📤 Export EMI Summary"</strong> — downloads a CSV of your EMI tracker entries</li>
                  <li>Save all CSV files to <strong>Google Drive, iCloud, OneDrive, or a USB drive</strong></li>
                  <li className="text-emerald-600 dark:text-emerald-400 font-medium">✅ Repeat monthly to keep your offline backup current</li>
                </ol>
              </div>

              {/* Step 2: Backup to Email */}
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-xs font-bold">2</span>
                  Backup to Email (Quick Option)
                </h4>
                <ol className="space-y-2 ml-8 list-decimal marker:text-[var(--color-text-tertiary)] marker:font-semibold">
                  <li>Click <strong>"Backup to Email"</strong> at the bottom of the Sidebar</li>
                  <li>Enter your email address and click <strong>"Backup Now"</strong></li>
                  <li>All three CSV files download automatically, and your email client opens with a pre-filled message</li>
                  <li>Attach the downloaded CSV files to the email and send it to yourself</li>
                  <li className="text-emerald-600 dark:text-emerald-400 font-medium">✅ Your backup is now in your inbox and safe</li>
                </ol>
              </div>

              {/* Step 3: Restore */}
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold">3</span>
                  Restore Data from CSV Backup
                </h4>
                <p className="ml-8 mb-3 text-xs">Use this if you accidentally reset your data or want to import records from a backup:</p>
                <ol className="space-y-2 ml-8 list-decimal marker:text-[var(--color-text-tertiary)] marker:font-semibold">
                  <li>Log in to FinTrack with your account</li>
                  <li>Open the <strong>Sidebar</strong> → click <strong>"Import / Export"</strong></li>
                  <li>Click <strong>"📥 Import Expenses"</strong> → select your backed-up expenses CSV</li>
                  <li>Wait for the <strong>✅ success toast</strong> at the bottom of the screen before importing the next file</li>
                  <li>Click <strong>"📥 Import Earnings"</strong> → select your backed-up earnings CSV</li>
                  <li>Click <strong>"📥 Import EMI CSV"</strong> → select your backed-up EMI CSV (if applicable)</li>
                  <li className="text-emerald-600 dark:text-emerald-400 font-medium">✅ All records are restored to Firestore. Switch to Transactions or Dashboard to verify.</li>
                </ol>
              </div>

              {/* Summary table */}
              <div className="bg-[var(--color-surface-secondary)] rounded-md border border-[var(--color-border)] p-4">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">📋 Quick Reference</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="text-left py-2 pr-4 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Action</th>
                        <th className="text-left py-2 pr-4 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Where</th>
                        <th className="text-left py-2 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Frequency</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--color-text-secondary)]">
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-semibold text-[var(--color-text-primary)]">📤 Export CSV</td>
                        <td className="py-2.5 pr-4">Sidebar → Import / Export → Export Expenses / Earnings / EMI</td>
                        <td className="py-2.5">Monthly</td>
                      </tr>
                      <tr className="border-b border-[var(--color-border)]/50">
                        <td className="py-2.5 pr-4 font-semibold text-[var(--color-text-primary)]">📧 Backup to Email</td>
                        <td className="py-2.5 pr-4">Sidebar → Backup to Email</td>
                        <td className="py-2.5">Monthly</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 font-semibold text-[var(--color-text-primary)]">📥 Restore from CSV</td>
                        <td className="py-2.5 pr-4">Sidebar → Import / Export → Import Expenses / Earnings / EMI</td>
                        <td className="py-2.5">After accidental reset</td>
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
          <div className="flex flex-col">
            <p className="text-xs text-[var(--color-text-tertiary)]">FinTrack v2.0 — Built with React, Firebase Firestore & AES-256 E2E Encryption</p>
            <p className="text-[10px] text-primary-500 font-medium mt-0.5">📧 For help, contact: manishksharma.india@gmail.com</p>
          </div>
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
