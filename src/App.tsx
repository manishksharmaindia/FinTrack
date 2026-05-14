import { useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useAppStore } from './store';
import { seedDefaults } from './db';
import { Sidebar } from './components/Sidebar';
import { CategoriesTab } from './components/CategoriesTab';
import { TransactionsTab } from './components/TransactionsTab';
import { DashboardTab } from './components/DashboardTab';
import logoUrl from './assets/logo.png';

function App() {
  const { activeTab, theme, setMobileMenuOpen } = useAppStore();

  useEffect(() => {
    seedDefaults();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[var(--color-surface-secondary)] relative w-full max-w-full p-3 sm:p-5 md:p-6 lg:p-8 gap-4 md:gap-6">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-[var(--color-border)] shrink-0">
            <img src={logoUrl} alt="FinTrack" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-bold text-[var(--color-text-primary)] text-lg">FinTrack</h1>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2.5 rounded-xl text-[var(--color-text-secondary)] bg-[var(--color-surface-tertiary)] hover:bg-[var(--color-border)] transition-colors">
          <Menu size={22} />
        </button>
      </div>

      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative max-w-full w-full bg-[var(--color-surface)] rounded-2xl md:rounded-3xl border border-[var(--color-border)] shadow-sm">
        {activeTab === 0 && <CategoriesTab />}
        {activeTab === 1 && <TransactionsTab />}
        {activeTab === 2 && <DashboardTab />}
      </main>
    </div>
  );
}

export default App;
