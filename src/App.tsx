import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import { Layout } from '@/components/Layout';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ScannerPage } from '@/pages/ScannerPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { PrintingPage } from '@/pages/PrintingPage';
import { ExchangePage } from '@/pages/ExchangePage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { NearbyPage } from '@/pages/NearbyPage';
import { Loader2 } from 'lucide-react';

type PageId = 'dashboard' | 'scanner' | 'inventory' | 'printing' | 'exchange' | 'analytics' | 'nearby';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<PageId>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNavigate = useCallback((p: PageId) => setPage(p), []);
  const handleAddedToInventory = useCallback(() => setRefreshKey((k) => k + 1), []);

  if (loading) {
    return (
      <div className="space-bg min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Layout currentPage={page} onNavigate={handleNavigate}>
      {page === 'dashboard' && <DashboardPage key={refreshKey} />}
      {page === 'scanner' && <ScannerPage onAddedToInventory={handleAddedToInventory} />}
      {page === 'inventory' && <InventoryPage />}
      {page === 'printing' && <PrintingPage />}
      {page === 'exchange' && <ExchangePage />}
      {page === 'analytics' && <AnalyticsPage />}
      {page === 'nearby' && <NearbyPage />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
