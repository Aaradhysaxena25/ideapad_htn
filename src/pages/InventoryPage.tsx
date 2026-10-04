import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ACTION_META, CATEGORIES, CONDITIONS, DAMAGE_LEVELS, LOCATIONS } from '@/lib/constants';
import type { InventoryItem, ActionType, ItemStatus } from '@/types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Package,
  Loader2,
  Filter,
} from 'lucide-react';

const STATUS_OPTIONS: ItemStatus[] = ['Available', 'Repaired', 'Recycled', 'Exchanged', 'Printed', 'Discarded'];
const ACTION_OPTIONS: ActionType[] = ['REPAIR', 'REUSE', 'RECYCLE', 'EXCHANGE', '3D_PRINT', 'DISCARD'];

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('inventory').select('*').order('created_at', { ascending: false });
    if (!error && data) setItems(data as InventoryItem[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filtered = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.object_name.toLowerCase().includes(search.toLowerCase()) ||
      item.material.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || item.recommended_action === actionFilter;
    return matchesSearch && matchesAction;
  });

  async function deleteItem(id: number) {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (!error) loadItems();
  }

  async function saveItem(item: Partial<InventoryItem>) {
    if (editingItem) {
      const { error } = await supabase.from('inventory').update({
        object_name: item.object_name,
        category: item.category,
        material: item.material,
        condition: item.condition,
        damage_level: item.damage_level,
        quantity: item.quantity,
        location: item.location,
        recommended_action: item.recommended_action,
        status: item.status,
      }).eq('id', editingItem.id);
      if (!error) {
        setShowModal(false);
        setEditingItem(null);
        loadItems();
      }
    }
  }

  return (
    <div className="space-y-4 fade-in">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, material, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="ALL">All Actions</option>
            {ACTION_OPTIONS.map((a) => (
              <option key={a} value={a}>{ACTION_META[a].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="text-cyan-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Package size={40} className="mb-3 opacity-50" />
            <p className="text-sm">No items found. Scan an object to add it to inventory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider" style={{ borderBottom: '1px solid rgba(37, 43, 69, 0.6)' }}>
                  <th className="text-left px-4 py-3 font-medium">Object</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Material</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Condition</th>
                  <th className="text-center px-4 py-3 font-medium">Qty</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-medium">Action</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Status</th>
                  <th className="text-right px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const meta = ACTION_META[item.recommended_action];
                  const Icon = meta.icon;
                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(37, 43, 69, 0.3)' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                            <Icon size={14} className={meta.text} />
                          </div>
                          <div>
                            <p className="text-slate-200 font-medium">{item.object_name}</p>
                            <p className="text-xs text-slate-500">{item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{item.material}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-slate-300">{item.condition}</span>
                        <span className="text-slate-600 text-xs ml-1">({item.damage_level})</span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-300">{item.quantity}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs hidden sm:table-cell">{item.location}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${meta.bg} ${meta.text}`}>{meta.label}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditingItem(item); setShowModal(true); }}
                            className="p-2 rounded-lg hover:bg-cyan-500/10 text-slate-500 hover:text-cyan-400 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => { setShowModal(false); setEditingItem(null); }}
          onSave={saveItem}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ItemStatus }) {
  const colors: Record<ItemStatus, string> = {
    Available: 'bg-slate-700/40 text-slate-300',
    Repaired: 'bg-blue-500/15 text-blue-300',
    Recycled: 'bg-amber-500/15 text-amber-300',
    Exchanged: 'bg-cyan-500/15 text-cyan-300',
    Printed: 'bg-pink-500/15 text-pink-300',
    Discarded: 'bg-gray-600/20 text-gray-400',
  };
  return <span className={`badge ${colors[status]}`}>{status}</span>;
}

function EditModal({ item, onClose, onSave }: {
  item: InventoryItem;
  onClose: () => void;
  onSave: (item: Partial<InventoryItem>) => void;
}) {
  const [form, setForm] = useState({
    object_name: item.object_name,
    category: item.category,
    material: item.material,
    condition: item.condition,
    damage_level: item.damage_level,
    quantity: item.quantity,
    location: item.location,
    recommended_action: item.recommended_action,
    status: item.status,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in" onClick={onClose}>
      <div className="glass-panel p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-bold text-slate-100">Edit Item</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Object Name">
            <input className="input-field" value={form.object_name} onChange={(e) => setForm({ ...form, object_name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Material">
              <input className="input-field" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
            </Field>
            <Field label="Condition">
              <select className="input-field" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Damage Level">
              <select className="input-field" value={form.damage_level} onChange={(e) => setForm({ ...form, damage_level: e.target.value })}>
                {DAMAGE_LEVELS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Quantity">
              <input type="number" min="1" className="input-field" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} />
            </Field>
            <Field label="Location">
              <select className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Recommended Action">
              <select className="input-field" value={form.recommended_action} onChange={(e) => setForm({ ...form, recommended_action: e.target.value as ActionType })}>
                {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{ACTION_META[a].label}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ItemStatus })}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(form)} className="btn-primary flex-1">Save Changes</button>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-slate-500 mb-1 block">{label}</label>
      {children}
    </div>
  );
}
