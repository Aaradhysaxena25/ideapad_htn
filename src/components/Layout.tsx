import { useEffect, useRef, useState } from 'react';
import { Starfield } from '@/components/Starfield';
import { useAuth } from '@/components/AuthContext';
import { LogOut, Rocket, ChevronDown } from 'lucide-react';

type PageId = 'dashboard' | 'scanner' | 'inventory' | 'printing' | 'exchange' | 'analytics' | 'nearby';

interface LayoutProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'scanner', label: 'Scanner', icon: <ScanIcon /> },
  { id: 'nearby', label: 'Nearby Scan', icon: <RadarIcon /> },
  { id: 'inventory', label: 'Inventory', icon: <BoxIcon /> },
  { id: 'printing', label: '3D Printing', icon: <PrintIcon /> },
  { id: 'exchange', label: 'Exchange', icon: <ExchangeIcon /> },
  { id: 'analytics', label: 'Analytics', icon: <ChartIcon /> },
];

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M7 12h10" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
  );
}

function ExchangeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 3 4 4-4 4" />
      <path d="M20 7H4" />
      <path d="m8 21-4-4 4-4" />
      <path d="M4 17h16" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
      <line x1="3" x2="21" y1="20" y2="20" />
    </svg>
  );
}

function RadarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" />
      <path d="M4 6h.01" />
      <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" />
      <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" />
      <path d="M12 12h.01" />
      <path d="M19 12h.01" />
      <path d="M2 12h.01" />
      <path d="M12 2v0" />
      <path d="M12 22v0" />
    </svg>
  );
}

export function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const { user, profile, signOut } = useAuth();
  const [time, setTime] = useState(new Date());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPage]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLabel = NAV_ITEMS.find((n) => n.id === currentPage)?.label || '';
  const displayName = profile?.spacecraft_name || user?.email?.split('@')[0] || 'Commander';

  return (
    <div className="space-bg h-screen w-screen flex overflow-hidden relative">
      <Starfield />

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-40 h-full w-64 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: 'rgba(10, 14, 31, 0.85)',
          backdropFilter: 'blur(16px)',
          borderRight: '1px solid rgba(37, 43, 69, 0.6)',
        }}
      >
        <div className="p-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(37, 43, 69, 0.4)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-sm font-bold text-cyan-300 tracking-wider leading-tight">ORBITAL</h1>
            <p className="text-[10px] text-slate-500 tracking-widest uppercase">Circular Commerce</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 ${
                currentPage === item.id ? 'active' : ''
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid rgba(37, 43, 69, 0.4)' }}>
          <div className="glass-panel p-3 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">System Online</span>
            </div>
            <div className="font-display text-xs text-cyan-300">
              {time.toISOString().split('T')[1].split('.')[0]} UTC
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Mission Day 247</div>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header
          className="flex items-center justify-between px-6 py-4"
          style={{
            background: 'rgba(10, 14, 31, 0.5)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(37, 43, 69, 0.4)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
            </button>
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-100">{currentLabel}</h2>
              <p className="text-xs text-slate-500">Space Resource Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-emerald-300 font-medium">Prototype Mode</span>
            </div>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-slate-200 max-w-[120px] truncate">{displayName}</div>
                  <div className="text-[10px] text-slate-500">{profile?.mission_type || 'Spacecraft'}</div>
                </div>
                <ChevronDown size={16} className="text-slate-500" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 glass-panel p-3 z-50 fade-in" style={{ borderRadius: '12px' }}>
                  <div className="px-2 py-2 mb-2" style={{ borderBottom: '1px solid rgba(37, 43, 69, 0.4)' }}>
                    <div className="flex items-center gap-2">
                      <Rocket size={14} className="text-cyan-400" />
                      <span className="text-sm font-medium text-slate-200 truncate">{displayName}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{user?.email}</div>
                    {profile && (
                      <div className="text-xs text-slate-500 mt-1">Coords: {profile.coordinates}</div>
                    )}
                  </div>
                  <button
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-2 py-2.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors text-sm"
                  >
                    <LogOut size={16} /> Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 grid-pattern">
          {children}
        </main>
      </div>
    </div>
  );
}
