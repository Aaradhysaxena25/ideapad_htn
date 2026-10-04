import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { InventoryItem, ScanLog } from '@/types';
import { ACTION_META } from '@/lib/constants';
import {
  TrendingUp,
  Activity,
  PieChart,
  BarChart3,
  Loader2,
} from 'lucide-react';

export function AnalyticsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: inv }, { data: scanData }] = await Promise.all([
        supabase.from('inventory').select('*'),
        supabase.from('scan_logs').select('*').order('created_at', { ascending: false }),
      ]);
      setItems((inv || []) as InventoryItem[]);
      setScans((scanData || []) as ScanLog[]);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Action distribution
  const actionCounts: Record<string, number> = {};
  items.forEach((item) => {
    actionCounts[item.recommended_action] = (actionCounts[item.recommended_action] || 0) + item.quantity;
  });
  const totalItems = Object.values(actionCounts).reduce((a, b) => a + b, 0) || 1;

  // Material distribution
  const materialCounts: Record<string, number> = {};
  items.forEach((item) => {
    materialCounts[item.material] = (materialCounts[item.material] || 0) + 1;
  });
  const sortedMaterials = Object.entries(materialCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxMaterial = Math.max(...sortedMaterials.map((m) => m[1]), 1);

  // Condition distribution
  const conditionCounts: Record<string, number> = {};
  items.forEach((item) => {
    conditionCounts[item.condition] = (conditionCounts[item.condition] || 0) + 1;
  });
  const conditions = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1]);

  // Location distribution
  const locationCounts: Record<string, number> = {};
  items.forEach((item) => {
    locationCounts[item.location] = (locationCounts[item.location] || 0) + item.quantity;
  });
  const sortedLocations = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]);

  // Sustainability metrics
  const wastePrevented = items.reduce((sum, item) => item.recommended_action !== 'DISCARD' ? sum + item.quantity * 1.5 : sum, 0);
  const co2Saved = Math.round(wastePrevented * 2.3);
  const resupplySaved = Math.round(wastePrevented * 0.8);

  // Scan activity (last 7 "days" simulated)
  const scanActivity = scans.slice(0, 10).reverse();

  const actionColors: Record<string, string> = {
    REPAIR: '#3b82f6',
    REUSE: '#10b981',
    RECYCLE: '#f59e0b',
    EXCHANGE: '#06b6d4',
    '3D_PRINT': '#ec4899',
    DISCARD: '#6b7280',
  };

  // Build pie chart segments
  let cumulativePercent = 0;
  const pieSegments = Object.entries(actionCounts).map(([action, count]) => {
    const percent = (count / totalItems) * 100;
    const segment = {
      action,
      count,
      percent,
      start: cumulativePercent,
      end: cumulativePercent + percent,
    };
    cumulativePercent += percent;
    return segment;
  });

  function describeArc(start: number, end: number, radius: number) {
    const startAngle = (start / 100) * 360 - 90;
    const endAngle = (end / 100) * 360 - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 80 + radius * Math.cos(startRad);
    const y1 = 80 + radius * Math.sin(startRad);
    const x2 = 80 + radius * Math.cos(endRad);
    const y2 = 80 + radius * Math.sin(endRad);
    const largeArc = end - start > 50 ? 1 : 0;
    return `M 80 80 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Sustainability metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-emerald-400" />
            <h3 className="font-display text-sm font-semibold text-slate-200">CO₂ Saved</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-emerald-400">{co2Saved}</span>
            <span className="text-sm text-slate-400">kg</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Estimated from recovered materials</p>
        </div>
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={18} className="text-cyan-400" />
            <h3 className="font-display text-sm font-semibold text-slate-200">Resupply Mass Saved</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-cyan-400">{resupplySaved}</span>
            <span className="text-sm text-slate-400">kg</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Mass avoided from Earth launches</p>
        </div>
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={18} className="text-blue-400" />
            <h3 className="font-display text-sm font-semibold text-slate-200">Total Scans</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-blue-400">{scans.length}</span>
            <span className="text-sm text-slate-400">objects</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Objects analyzed by AI pipeline</p>
        </div>
      </div>

      {/* Pie chart + action breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={18} className="text-cyan-400" />
            <h3 className="font-display text-sm font-semibold text-slate-200">Action Distribution</h3>
          </div>
          <div className="flex items-center gap-6">
            <svg width="160" height="160" viewBox="0 0 160 160" className="flex-shrink-0">
              {pieSegments.length === 0 ? (
                <circle cx="80" cy="80" r="65" fill="none" stroke="rgba(37, 43, 69, 0.5)" strokeWidth="2" />
              ) : (
                pieSegments.map((seg) => (
                  <path
                    key={seg.action}
                    d={describeArc(seg.start, seg.end, 65)}
                    fill={actionColors[seg.action] || '#6b7280'}
                    opacity={0.8}
                    stroke="rgba(5, 8, 20, 0.8)"
                    strokeWidth="1"
                  />
                ))
              )}
              <circle cx="80" cy="80" r="35" fill="rgba(10, 14, 31, 0.95)" />
              <text x="80" y="76" textAnchor="middle" className="fill-slate-200 font-display" fontSize="20" fontWeight="bold">
                {totalItems}
              </text>
              <text x="80" y="92" textAnchor="middle" className="fill-slate-500" fontSize="10">
                items
              </text>
            </svg>
            <div className="flex-1 space-y-2">
              {pieSegments.map((seg) => {
                const meta = ACTION_META[seg.action as keyof typeof ACTION_META];
                if (!meta) return null;
                return (
                  <div key={seg.action} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded" style={{ background: actionColors[seg.action] }} />
                    <span className={meta.text + ' flex-1'}>{meta.label}</span>
                    <span className="text-slate-400">{seg.percent.toFixed(0)}%</span>
                    <span className="text-slate-500">({seg.count})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Condition distribution */}
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-cyan-400" />
            <h3 className="font-display text-sm font-semibold text-slate-200">Condition Breakdown</h3>
          </div>
          <div className="space-y-3">
            {conditions.map(([condition, count]) => {
              const pct = (count / items.length) * 100;
              const colors: Record<string, string> = {
                Good: '#10b981',
                Worn: '#f59e0b',
                Damaged: '#f97316',
                Critical: '#ef4444',
              };
              return (
                <div key={condition}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{condition}</span>
                    <span className="text-slate-400">{count} items</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: colors[condition] || '#6b7280' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Material + Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-5">
          <h3 className="font-display text-sm font-semibold text-slate-200 mb-4">Material Distribution</h3>
          <div className="space-y-2">
            {sortedMaterials.map(([material, count]) => (
              <div key={material} className="flex items-center gap-3">
                <span className="text-xs text-slate-300 w-32 truncate">{material}</span>
                <div className="flex-1 h-5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 flex items-center justify-end px-2"
                    style={{ width: `${(count / maxMaterial) * 100}%`, background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }}
                  >
                    <span className="text-[10px] text-white font-semibold">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5">
          <h3 className="font-display text-sm font-semibold text-slate-200 mb-4">Location Distribution</h3>
          <div className="space-y-2">
            {sortedLocations.map(([location, count]) => (
              <div key={location} className="flex items-center gap-3">
                <span className="text-xs text-slate-300 w-32 truncate">{location}</span>
                <div className="flex-1 h-5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 flex items-center justify-end px-2"
                    style={{ width: `${(count / (Math.max(...sortedLocations.map((l) => l[1]), 1))) * 100}%`, background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
                  >
                    <span className="text-[10px] text-white font-semibold">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scan activity */}
      <div className="glass-panel p-5">
        <h3 className="font-display text-sm font-semibold text-slate-200 mb-4">Recent Scan Activity</h3>
        {scanActivity.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No scans yet</p>
        ) : (
          <div className="flex items-end gap-2 h-32">
            {scanActivity.map((scan, i) => {
              const height = (scan.confidence * 100);
              const meta = ACTION_META[scan.recommended_action as keyof typeof ACTION_META];
              return (
                <div key={scan.id || i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {scan.confidence ? `${(scan.confidence * 100).toFixed(0)}%` : ''}
                  </div>
                  <div
                    className="w-full rounded-t-md transition-all duration-500 hover:opacity-80"
                    style={{
                      height: `${height}%`,
                      background: meta?.color || '#06b6d4',
                      minHeight: '8px',
                    }}
                    title={`${scan.detected_object} (${scan.confidence ? (scan.confidence * 100).toFixed(0) : 0}%)`}
                  />
                  <div className="text-[9px] text-slate-600 truncate w-full text-center">
                    {scan.detected_object.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-600 text-center pt-2">
        All analytics are based on prototype data. Metrics are illustrative and not scientifically validated for actual space missions.
      </p>
    </div>
  );
}
