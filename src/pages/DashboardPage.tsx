import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { InventoryItem, PrintJob, ExchangeListing } from '@/types';
import { ACTION_META } from '@/lib/constants';
import {
  Package,
  Repeat,
  Recycle,
  Wrench,
  Printer,
  ArrowLeftRight,
  TrendingDown,
  Rocket,
  Layers,
  Activity,
} from 'lucide-react';

interface DashboardStats {
  total: number;
  reusable: number;
  recycled: number;
  repaired: number;
  printed: number;
  exchanged: number;
  wastePrevented: number;
  resupplyReduction: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0, reusable: 0, recycled: 0, repaired: 0, printed: 0, exchanged: 0,
    wastePrevented: 0, resupplyReduction: 0,
  });
  const [recentItems, setRecentItems] = useState<InventoryItem[]>([]);
  const [actionBreakdown, setActionBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    const { data: items } = await supabase.from('inventory').select('*').order('created_at', { ascending: false });
    const { data: prints } = await supabase.from('print_jobs').select('*');
    const { data: exchanges } = await supabase.from('exchange_listings').select('*');

    const inv = (items || []) as InventoryItem[];
    const printJobs = (prints || []) as PrintJob[];
    const exch = (exchanges || []) as ExchangeListing[];

    const breakdown: Record<string, number> = {};
    inv.forEach((item) => {
      breakdown[item.recommended_action] = (breakdown[item.recommended_action] || 0) + item.quantity;
    });

    const wastePrevented = inv.reduce((sum, item) => {
      if (item.recommended_action === 'DISCARD') return sum;
      return sum + item.quantity * 1.5;
    }, 0);

    const resupplyReduction = Math.min(100, Math.round((wastePrevented / (wastePrevented + 50)) * 100));

    setStats({
      total: inv.reduce((s, i) => s + i.quantity, 0),
      reusable: inv.filter((i) => i.reusable).reduce((s, i) => s + i.quantity, 0),
      recycled: inv.filter((i) => i.status === 'Recycled' || i.recommended_action === 'RECYCLE').reduce((s, i) => s + i.quantity, 0),
      repaired: inv.filter((i) => i.status === 'Repaired' || i.recommended_action === 'REPAIR').reduce((s, i) => s + i.quantity, 0),
      printed: printJobs.filter((p) => p.status === 'Completed').length,
      exchanged: exch.filter((e) => e.status === 'Transferred').length,
      wastePrevented: Math.round(wastePrevented),
      resupplyReduction,
    });
    setRecentItems(inv.slice(0, 5));
    setActionBreakdown(breakdown);
    setLoading(false);
  }

  const statCards = [
    { label: 'Total Resources', value: stats.total, icon: Package, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
    { label: 'Reusable', value: stats.reusable, icon: Repeat, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Recycled', value: stats.recycled, icon: Recycle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'Repaired', value: stats.repaired, icon: Wrench, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { label: '3D Printed', value: stats.printed, icon: Printer, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
    { label: 'Exchanged', value: stats.exchanged, icon: ArrowLeftRight, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
  ];

  const maxAction = Math.max(...Object.values(actionBreakdown), 1);
  const sortedActions = Object.entries(actionBreakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 fade-in">
      {/* Hero banner */}
      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10 spin-slow" style={{ borderRadius: '50%', border: '2px solid #06b6d4', right: '-100px', top: '-100px' }} />
        <div className="absolute top-4 right-8 text-cyan-500/20">
          <Rocket size={48} className="float-anim" />
        </div>
        <div className="relative">
          <p className="text-xs text-cyan-400 uppercase tracking-widest mb-2">Mission Control Overview</p>
          <h2 className="font-display text-2xl font-bold text-slate-100 mb-2">Sustainability Dashboard</h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Real-time monitoring of resource circularity across Moon and Mars missions. Every item scanned,
            repaired, recycled, or 3D printed reduces our dependency on Earth-based resupply.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: card.bg }}>
              <card.icon size={20} style={{ color: card.color }} />
            </div>
            <div className="font-display text-2xl font-bold text-slate-100">
              {loading ? '—' : card.value}
            </div>
            <div className="text-xs text-slate-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Impact metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <TrendingDown size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-slate-200">Waste Prevented</h3>
              <p className="text-xs text-slate-500">Total mass diverted from disposal</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-emerald-400">{stats.wastePrevented}</span>
            <span className="text-sm text-slate-400">kg</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (stats.wastePrevented / 100) * 100)}%`, background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">Target: 100 kg per mission cycle</p>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <Rocket size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-slate-200">Earth Resupply Reduction</h3>
              <p className="text-xs text-slate-500">Estimated dependency decrease</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-blue-400">{stats.resupplyReduction}</span>
            <span className="text-sm text-slate-400">%</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${stats.resupplyReduction}%`, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">Based on circular resource utilization</p>
        </div>
      </div>

      {/* Action breakdown + Recent items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-5">
          <div className="flex items-center gap-3 mb-4">
            <Layers size={18} className="text-cyan-400" />
            <h3 className="font-display text-sm font-semibold text-slate-200">Action Distribution</h3>
          </div>
          <div className="space-y-3">
            {sortedActions.length === 0 && !loading && (
              <p className="text-sm text-slate-500 text-center py-8">No data yet</p>
            )}
            {sortedActions.map(([action, count]) => {
              const meta = ACTION_META[action as keyof typeof ACTION_META];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <div key={action} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.bg}`}>
                    <Icon size={16} className={meta.text} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={meta.text}>{meta.label}</span>
                      <span className="text-slate-400">{count} items</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(count / maxAction) * 100}%`, background: meta.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center gap-3 mb-4">
            <Activity size={18} className="text-cyan-400" />
            <h3 className="font-display text-sm font-semibold text-slate-200">Recent Scans</h3>
          </div>
          <div className="space-y-2">
            {recentItems.length === 0 && !loading && (
              <p className="text-sm text-slate-500 text-center py-8">No items scanned yet</p>
            )}
            {recentItems.map((item) => {
              const meta = ACTION_META[item.recommended_action];
              const Icon = meta.icon;
              return (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.bg}`}>
                    <Icon size={14} className={meta.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{item.object_name}</p>
                    <p className="text-xs text-slate-500">{item.material} • {item.location}</p>
                  </div>
                  <span className={`badge ${meta.bg} ${meta.text}`}>{meta.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 text-center pt-2">
        This is a prototype decision-support system. AI recommendations are not scientifically validated for actual space missions.
      </p>
    </div>
  );
}
