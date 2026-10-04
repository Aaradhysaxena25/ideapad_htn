import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { ExchangeListing, ExchangeStatus } from '@/types';
import { LOCATIONS } from '@/lib/constants';
import {
  ArrowLeftRight,
  Plus,
  Search,
  X,
  MapPin,
  Package,
  Loader2,
  CheckCircle2,
  User,
} from 'lucide-react';

const STATUS_COLORS: Record<ExchangeStatus, string> = {
  Available: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Requested: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Transferred: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
};

export function ExchangePage() {
  const [listings, setListings] = useState<ExchangeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const loadListings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('exchange_listings').select('*').order('created_at', { ascending: false });
    if (!error && data) setListings(data as ExchangeListing[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const filtered = listings.filter((l) =>
    !search ||
    l.item_name.toLowerCase().includes(search.toLowerCase()) ||
    l.material.toLowerCase().includes(search.toLowerCase()) ||
    l.location.toLowerCase().includes(search.toLowerCase())
  );

  async function requestItem(id: number) {
    const { error } = await supabase.from('exchange_listings').update({
      status: 'Requested',
      requested_by: 'Mars Habitat A',
    }).eq('id', id);
    if (!error) loadListings();
  }

  async function transferItem(id: number) {
    const { error } = await supabase.from('exchange_listings').update({
      status: 'Transferred',
    }).eq('id', id);
    if (!error) loadListings();
  }

  async function deleteListing(id: number) {
    const { error } = await supabase.from('exchange_listings').delete().eq('id', id);
    if (!error) loadListings();
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-100">Resource Exchange</h3>
          <p className="text-sm text-slate-500">Cross-mission marketplace for unused resources</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> List Resource
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search resources by name, material, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Listings */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="text-cyan-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center py-16 text-slate-500">
          <ArrowLeftRight size={40} className="mb-3 opacity-50" />
          <p className="text-sm">No listings found. List a resource to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((listing) => (
            <div key={listing.id} className="glass-panel p-4 glass-panel-hover flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Package size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{listing.item_name}</p>
                    <p className="text-xs text-slate-500">{listing.material}</p>
                  </div>
                </div>
                <span className={`badge border ${STATUS_COLORS[listing.status]}`}>{listing.status}</span>
              </div>

              {listing.description && (
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{listing.description}</p>
              )}

              <div className="space-y-1.5 mb-3 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Package size={12} className="text-slate-500" />
                  <span>Qty: {listing.quantity}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin size={12} className="text-slate-500" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <User size={12} className="text-slate-500" />
                  <span>Listed by {listing.listed_by}</span>
                </div>
                {listing.requested_by && (
                  <div className="flex items-center gap-2 text-amber-400">
                    <User size={12} />
                    <span>Requested by {listing.requested_by}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-auto">
                {listing.status === 'Available' && (
                  <button onClick={() => requestItem(listing.id)} className="btn-primary text-xs flex-1" style={{ padding: '6px 12px' }}>
                    Request Resource
                  </button>
                )}
                {listing.status === 'Requested' && (
                  <button onClick={() => transferItem(listing.id)} className="btn-primary text-xs flex-1" style={{ padding: '6px 12px' }}>
                    Mark Transferred
                  </button>
                )}
                {listing.status === 'Transferred' && (
                  <div className="flex items-center gap-1 text-xs text-cyan-400 flex-1 justify-center">
                    <CheckCircle2 size={14} /> Transfer complete
                  </div>
                )}
                <button
                  onClick={() => deleteListing(listing.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                  style={{ padding: '6px 8px' }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <NewListingModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); loadListings(); }} />}
    </div>
  );
}

function NewListingModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    item_name: '',
    material: '',
    quantity: 1,
    location: LOCATIONS[0],
    description: '',
    listed_by: LOCATIONS[0],
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!form.item_name.trim()) {
      setError('Item name is required');
      return;
    }
    setCreating(true);
    setError('');
    const { error: insertError } = await supabase.from('exchange_listings').insert({
      item_name: form.item_name,
      material: form.material || 'Unknown',
      quantity: form.quantity,
      location: form.location,
      description: form.description,
      listed_by: form.listed_by,
      status: 'Available',
    });
    setCreating(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in" onClick={onClose}>
      <div className="glass-panel p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-bold text-slate-100">List a Resource</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Item Name</label>
            <input className="input-field" value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} placeholder="e.g. Carbon Fiber Sheet" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Material</label>
              <input className="input-field" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} placeholder="e.g. Carbon Fiber" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Quantity</label>
              <input type="number" min="1" className="input-field" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Location</label>
              <select className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Listed By</label>
              <select className="input-field" value={form.listed_by} onChange={(e) => setForm({ ...form, listed_by: e.target.value })}>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Description</label>
            <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the resource and its condition..." />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={handleSubmit} disabled={creating} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {creating ? 'Listing...' : 'List Resource'}
          </button>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}
