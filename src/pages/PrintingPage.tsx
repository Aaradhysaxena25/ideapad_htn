import { useEffect, useState, useCallback } from 'react';
import { supabase, createPrintJob } from '@/lib/supabase';
import type { PrintJob, PrintStatus } from '@/types';
import {
  Printer,
  Plus,
  Clock,
  Weight,
  CheckCircle2,
  Loader2,
  X,
  FileText,
  Layers,
} from 'lucide-react';

const STATUS_COLORS: Record<PrintStatus, string> = {
  Pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Printing: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  Completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Failed: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export function PrintingPage() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('print_jobs').select('*').order('created_at', { ascending: false });
    if (!error && data) setJobs(data as PrintJob[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  async function updateStatus(id: number, status: PrintStatus) {
    const { error } = await supabase.from('print_jobs').update({ status }).eq('id', id);
    if (!error) loadJobs();
  }

  const stats = {
    total: jobs.length,
    completed: jobs.filter((j) => j.status === 'Completed').length,
    printing: jobs.filter((j) => j.status === 'Printing').length,
    pending: jobs.filter((j) => j.status === 'Pending').length,
  };

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-100">3D Printing Module</h3>
          <p className="text-sm text-slate-500">On-demand replacement parts from recycled materials</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Print Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="text-xs text-slate-500 mb-1">Total Jobs</div>
          <div className="font-display text-2xl font-bold text-slate-100">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-slate-500 mb-1">Completed</div>
          <div className="font-display text-2xl font-bold text-emerald-400">{stats.completed}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-slate-500 mb-1">Printing</div>
          <div className="font-display text-2xl font-bold text-cyan-400">{stats.printing}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-slate-500 mb-1">Pending</div>
          <div className="font-display text-2xl font-bold text-amber-400">{stats.pending}</div>
        </div>
      </div>

      {/* Job cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="text-cyan-400 animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center py-16 text-slate-500">
          <Printer size={40} className="mb-3 opacity-50" />
          <p className="text-sm">No print jobs yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="glass-panel p-4 glass-panel-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                    <Printer size={18} className="text-pink-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{job.part_name}</p>
                    {job.source_item && <p className="text-xs text-slate-500">From: {job.source_item}</p>}
                  </div>
                </div>
                <span className={`badge border ${STATUS_COLORS[job.status]}`}>{job.status}</span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Layers size={14} className="text-slate-500" />
                  <span>{job.required_material}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={14} className="text-slate-500" />
                  <span>{job.estimated_print_time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Weight size={14} className="text-slate-500" />
                  <span>{job.estimated_material_amount}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {job.design_available ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <FileText size={14} /> Design available
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <FileText size={14} /> Design needed
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {job.status === 'Pending' && (
                  <button onClick={() => updateStatus(job.id, 'Printing')} className="btn-secondary text-xs flex-1" style={{ padding: '6px 12px' }}>
                    Start Printing
                  </button>
                )}
                {job.status === 'Printing' && (
                  <button onClick={() => updateStatus(job.id, 'Completed')} className="btn-primary text-xs flex-1" style={{ padding: '6px 12px' }}>
                    Mark Complete
                  </button>
                )}
                {job.status === 'Completed' && (
                  <div className="flex items-center gap-1 text-xs text-emerald-400 flex-1 justify-center">
                    <CheckCircle2 size={14} /> Part ready for use
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <NewJobModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); loadJobs(); }} />}
    </div>
  );
}

function NewJobModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    part_name: '',
    required_material: 'Recycled PLA',
    estimated_print_time: '1h 30m',
    estimated_material_amount: '25g',
    design_available: true,
    source_item: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!form.part_name.trim()) {
      setError('Part name is required');
      return;
    }
    setCreating(true);
    setError('');
    try {
      await createPrintJob({
        part_name: form.part_name,
        required_material: form.required_material,
        estimated_print_time: form.estimated_print_time,
        estimated_material_amount: form.estimated_material_amount,
        design_available: form.design_available,
        source_item: form.source_item || undefined,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create print job');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in" onClick={onClose}>
      <div className="glass-panel p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-bold text-slate-100">New Print Job</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Part Name</label>
            <input className="input-field" value={form.part_name} onChange={(e) => setForm({ ...form, part_name: e.target.value })} placeholder="e.g. Pipe Fitting Adapter" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Material</label>
              <input className="input-field" value={form.required_material} onChange={(e) => setForm({ ...form, required_material: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Est. Amount</label>
              <input className="input-field" value={form.estimated_material_amount} onChange={(e) => setForm({ ...form, estimated_material_amount: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Est. Print Time</label>
              <input className="input-field" value={form.estimated_print_time} onChange={(e) => setForm({ ...form, estimated_print_time: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Source Item</label>
              <input className="input-field" value={form.source_item} onChange={(e) => setForm({ ...form, source_item: e.target.value })} placeholder="Optional" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={form.design_available} onChange={(e) => setForm({ ...form, design_available: e.target.checked })} className="accent-cyan-500" />
            Design file available
          </label>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={handleSubmit} disabled={creating} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {creating ? 'Creating...' : 'Create Job'}
          </button>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}
