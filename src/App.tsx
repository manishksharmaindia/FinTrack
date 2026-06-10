import { useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useAppStore } from './store';
import { seedDefaults, migrateFromSubcollections } from './db';
import { Sidebar } from './components/Sidebar';
import { CategoriesTab } from './components/CategoriesTab';
import { TransactionsTab } from './components/TransactionsTab';
import { DashboardTab } from './components/DashboardTab';
import { EmiTab } from './components/EmiTab';
import { AuthScreen } from './components/AuthScreen';
import { useAuth } from './AuthContext';
import logoUrl from './assets/logo.png';

function App() {
  const { activeTab, theme, setMobileMenuOpen } = useAppStore();
  const { user, encryptionKey, loading } = useAuth();
  useEffect(() => {
    if (!user || !encryptionKey) {
      return;
    }

    // Run migration + seeding on every login.
    // Both functions are safe to re-run:
    // - migrateFromSubcollections() checks dataVersion on server and skips if already done
    // - seedDefaults() checks server count and skips if categories already exist
    // This ensures data is always available regardless of which browser/device is used.
    async function initUserData() {
      try {
        await migrateFromSubcollections();
        await seedDefaults();
      } catch (err) {
        console.error("Failed to initialize user data / migrate:", err);
      }
    }

    initUserData();
  }, [user, encryptionKey]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (loading) {
    return <div className="h-screen w-full flex flex-col items-center justify-center bg-[var(--color-surface-secondary)] gap-4">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user || !encryptionKey) {
    return <AuthScreen />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[var(--color-surface-secondary)] relative w-full max-w-full p-3 sm:p-5 md:p-6 lg:p-8 gap-1 md:gap-1.5" style={{ border: '10px solid var(--color-app-border)' }}>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] shrink-0 z-30 shadow-sm">
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
      
      <main className="flex-1 flex flex-col overflow-hidden relative max-w-full w-full bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] shadow-sm">
        {activeTab === 0 && <CategoriesTab />}
        {activeTab === 1 && <TransactionsTab />}
        {activeTab === 2 && <EmiTab />}
        {activeTab === 3 && <DashboardTab />}
      </main>
    </div>
  );
}

export default App;
