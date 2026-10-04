import { useState, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { ScannerPage } from '@/pages/ScannerPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { PrintingPage } from '@/pages/PrintingPage';
import { ExchangePage } from '@/pages/ExchangePage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';

type PageId = 'dashboard' | 'scanner' | 'inventory' | 'printing' | 'exchange' | 'analytics';

function App() {
  const [page, setPage] = useState<PageId>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNavigate = useCallback((p: PageId) => setPage(p), []);

  const handleAddedToInventory = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <Layout currentPage={page} onNavigate={handleNavigate}>
      {page === 'dashboard' && <DashboardPage key={refreshKey} />}
      {page === 'scanner' && <ScannerPage onAddedToInventory={handleAddedToInventory} />}
      {page === 'inventory' && <InventoryPage />}
      {page === 'printing' && <PrintingPage />}
      {page === 'exchange' && <ExchangePage />}
      {page === 'analytics' && <AnalyticsPage />}
    </Layout>
  );
}

export default App;
