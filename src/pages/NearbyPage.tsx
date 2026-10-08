import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase, autoScan, getNearbyDetections } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { ACTION_META } from '@/lib/constants';
import type { NearbyDetection } from '@/types';
import {
  Radar,
  Loader2,
  Radio,
  Zap,
  Package,
  CheckCircle2,
  Activity,
  Satellite,
} from 'lucide-react';

export function NearbyPage() {
  const { user, profile } = useAuth();
  const [detections, setDetections] = useState<NearbyDetection[]>([]);
  const [scanning, setScanning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadDetections = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getNearbyDetections(user.id, 30);
      setDetections(data);
    } catch {
      // silent fail
    }
  }, [user]);

  useEffect(() => {
    loadDetections();
  }, [loadDetections]);

  const runAutoScan = useCallback(async () => {
    if (!user) return;
    setScanning(true);
    try {
      await autoScan(user.id, 3);
      await loadDetections();
      setLastScan(new Date());
      setScanCount((c) => c + 1);
    } catch {
      // silent fail
    } finally {
      setScanning(false);
    }
  }, [user, loadDetections]);

  useEffect(() => {
    if (autoMode) {
      runAutoScan();
      autoTimerRef.current = setInterval(runAutoScan, 8000);
    } else {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    }
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [autoMode, runAutoScan]);

  const autoListedCount = detections.filter((d) => d.auto_listed).length;
  const uniqueObjects = new Set(detections.map((d) => d.detected_object)).size;

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="glass-panel p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 opacity-5 spin-slow" style={{ borderRadius: '50%', border: '2px solid #06b6d4', right: '-80px', top: '-80px' }} />
        <div className="flex items-start justify-between flex-wrap gap-4 relative">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Radar size={20} className="text-cyan-400" />
              <h3 className="font-display text-lg font-bold text-slate-100">Continuous Nearby Scanner</h3>
            </div>
            <p className="text-sm text-slate-400 max-w-xl">
              Automatically scans surrounding machinery and spacecraft parts in real-time.
              Detected items that are not needed get automatically listed on the exchange for other spacecraft.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-2">
            <Activity size={16} className="text-cyan-400" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-100">{detections.length}</div>
          <div className="text-xs text-slate-500">Total Detections</div>
        </div>
        <div className="stat-card">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2">
            <Package size={16} className="text-emerald-400" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-100">{uniqueObjects}</div>
          <div className="text-xs text-slate-500">Unique Objects</div>
        </div>
        <div className="stat-card">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2">
            <Zap size={16} className="text-amber-400" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-100">{autoListedCount}</div>
          <div className="text-xs text-slate-500">Auto-Listed</div>
        </div>
        <div className="stat-card">
          <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center mb-2">
            <Radio size={16} className="text-pink-400" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-100">{scanCount}</div>
          <div className="text-xs text-slate-500">Scan Cycles</div>
        </div>
      </div>

      {/* Radar visualization + controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-panel p-5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Satellite size={18} className="text-cyan-400" />
            <h3 className="font-display text-sm font-semibold text-slate-200">Scanner Control</h3>
          </div>

          {/* Radar animation */}
          <div className="relative w-48 h-48 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
            <div className="absolute inset-4 rounded-full border border-cyan-500/15" />
            <div className="absolute inset-8 rounded-full border border-cyan-500/10" />
            <div className="absolute inset-12 rounded-full border border-cyan-500/5" />
            <div className="absolute top-1/2 left-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400" />
            {scanning && (
              <div
                className="absolute top-1/2 left-1/2 origin-left h-0.5 spin-slow"
                style={{
                  width: '50%',
                  background: 'linear-gradient(90deg, #06b6d4, transparent)',
                  animationDuration: '2s',
                  transform: 'translateY(-50%)',
                }}
              />
            )}
            {detections.slice(0, 5).map((d, i) => {
              const angle = (i * 72 * Math.PI) / 180;
              const r = 40 + (i % 2) * 25;
              const x = 50 + r * Math.cos(angle);
              const y = 50 + r * Math.sin(angle);
              return (
                <div
                  key={d.id}
                  className="absolute w-2 h-2 rounded-full bg-cyan-400 pulse-glow"
                  style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                  title={d.detected_object}
                />
              );
            })}
          </div>

          <div className="space-y-2 text-center mb-4">
            <div className="text-xs text-slate-500">
              Spacecraft: <span className="text-slate-300">{profile?.spacecraft_name || 'Unknown'}</span>
            </div>
            <div className="text-xs text-slate-500">
              Status: {scanning ? <span className="text-cyan-300">Scanning...</span> : <span className="text-emerald-300">Standby</span>}
            </div>
            {lastScan && (
              <div className="text-xs text-slate-500">
                Last scan: <span className="text-slate-400">{lastScan.toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => runAutoScan()}
              disabled={scanning}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              {scanning ? <Loader2 size={16} className="animate-spin" /> : <Radar size={16} />}
              {scanning ? 'Scanning...' : 'Scan Now'}
            </button>
            <button
              onClick={() => setAutoMode(!autoMode)}
              className={`flex items-center justify-center gap-2 ${autoMode ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Radio size={16} />
              {autoMode ? 'Stop Auto-Scan' : 'Start Continuous Scan'}
            </button>
          </div>
        </div>

        {/* Detection feed */}
        <div className="glass-panel p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-cyan-400" />
            <h3 className="font-display text-sm font-semibold text-slate-200">Live Detection Feed</h3>
            {autoMode && (
              <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-glow" /> LIVE
              </span>
            )}
          </div>

          {detections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Radar size={32} className="mb-3 opacity-50" />
              <p className="text-sm">No detections yet. Start a scan to detect nearby machinery parts.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {detections.map((d) => {
                const meta = ACTION_META[d.recommended_action as keyof typeof ACTION_META];
                const Icon = meta?.icon;
                return (
                  <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors slide-in">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta?.bg || 'bg-slate-700/40'}`}>
                      {Icon && <Icon size={14} className={meta?.text} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-slate-200 truncate">{d.detected_object}</p>
                        {d.auto_listed && (
                          <span className="badge bg-emerald-500/15 text-emerald-300 text-[9px]">
                            <CheckCircle2 size={8} /> Auto-Listed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {d.material} • {d.condition} • {Math.round(d.confidence * 100)}% confidence
                      </p>
                    </div>
                    <span className="text-xs text-slate-600 flex-shrink-0">
                      {new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="glass-panel p-4">
        <div className="flex items-start gap-3">
          <Satellite size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-300 font-medium mb-1">How it works</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              The continuous scanner runs a detection sweep every 8 seconds, identifying machinery parts and objects in the vicinity of your spacecraft.
              Items detected as REUSE or EXCHANGE candidates are automatically listed on the Resource Exchange marketplace, visible to other registered spacecraft in the network.
              This enables real-time resource sharing across the mission without manual intervention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
