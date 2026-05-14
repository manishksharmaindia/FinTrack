import { useEffect } from 'react';
import { useAppStore } from './store';
import { seedDefaults } from './db';
import { Sidebar } from './components/Sidebar';
import { CategoriesTab } from './components/CategoriesTab';
import { TransactionsTab } from './components/TransactionsTab';
import { DashboardTab } from './components/DashboardTab';

function App() {
  const { activeTab, theme } = useAppStore();

  useEffect(() => {
    seedDefaults();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface-secondary)]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 0 && <CategoriesTab />}
        {activeTab === 1 && <TransactionsTab />}
        {activeTab === 2 && <DashboardTab />}
      </main>
    </div>
  );
}

export default App;
