import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../useToast';
import { useAuth } from '../AuthContext';

const CATEGORIES = ['tools', 'spare_parts', 'consumables', 'equipment', 'furniture', 'stationery'];

export default function Inventory() {
    const { user } = useAuth();
    const canManage = ['store_manager', 'super_admin'].includes(user?.role);
    const isSuperAdmin = user?.role === 'super_admin';
    const [items, setItems] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', category: 'consumables', uom: '', minStockLevel: 0, unit: '' });
    const { showSuccess, showError, ToastComponent } = useToast();

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/inventory/inventory');
            setItems(data.data || []);
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        if (isSuperAdmin) {
            api.get('/units').then(r => setUnits(r.data.data || [])).catch(() => { });
        }
    }, []);

    const set = (key) => (e) => setForm({ ...form, [key]: key === 'minStockLevel' ? parseInt(e.target.value) || 0 : e.target.value });

    const resetForm = () => {
        setForm({ name: '', category: 'consumables', uom: '', minStockLevel: 0, unit: '' });
        setEditing(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                const { unit, ...updateData } = form;
                await api.put(`/inventory/items/${editing}`, updateData);
                showSuccess('Item updated');
            } else {
                const payload = { ...form, minStockLevel: parseInt(form.minStockLevel) || 0 };
                if (!isSuperAdmin) delete payload.unit;
                await api.post('/inventory/items', payload);
                showSuccess('Item registered');
            }
            setShowForm(false);
            resetForm();
            fetchItems();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        }
    };

    const toggleActive = async (id, isActive) => {
        try {
            await api.patch(`/inventory/items/${id}/${isActive ? 'deactivate' : 'activate'}`);
            showSuccess(isActive ? 'Item deactivated' : 'Item activated');
            fetchItems();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        }
    };

    const startEdit = (item) => {
        setForm({
            name: item.name, category: item.category, uom: item.uom,
            minStockLevel: item.minStockLevel || 0, unit: item.unit?._id || ''
        });
        setEditing(item._id);
        setShowForm(true);
    };

    return (
        <div>
            {ToastComponent}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">📦 Inventory</h1>
                {canManage && (
                    <button className="btn-primary" onClick={() => { setShowForm(true); resetForm(); }}>+ Register Item</button>
                )}
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => { setShowForm(false); resetForm(); }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Item' : 'Register New Item'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label>Name</label><input value={form.name} onChange={set('name')} required /></div>

                            {isSuperAdmin && !editing && (
                                <div className="form-group">
                                    <label>Unit</label>
                                    <select value={form.unit} onChange={set('unit')} required>
                                        <option value="">Select unit</option>
                                        {units.map(u => <option key={u._id} value={u._id}>{u.name} ({u.code})</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select value={form.category} onChange={set('category')} required>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Unit of Measure</label>
                                    <input value={form.uom} onChange={set('uom')} placeholder="e.g. pieces, kg, liters" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Min Stock Level (alert threshold)</label>
                                <input type="number" min="0" value={form.minStockLevel} onChange={set('minStockLevel')} />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Register'}</button>
                                <button type="button" className="btn-secondary flex-1" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="empty-state"><span className="loading-spinner" /></div>
            ) : items.length === 0 ? (
                <div className="empty-state">
                    <p className="text-lg mb-2">No items in inventory</p>
                    {canManage && <p className="text-sm">Click "+ Register Item" to add your first item</p>}
                </div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <table>
                        <thead>
                            <tr>
                                <th>Item ID</th><th>Name</th><th>Category</th><th>UOM</th>
                                <th>Current Stock</th><th>Min Level</th><th>Status</th>
                                {canManage && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item._id}>
                                    <td><code className="text-blue-400">{item.itemId}</code></td>
                                    <td className="font-medium">{item.name}</td>
                                    <td className="text-slate-400">{item.category?.replace(/_/g, ' ')}</td>
                                    <td>{item.uom}</td>
                                    <td>
                                        <span className={item.currentStock <= item.minStockLevel ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                                            {item.currentStock}
                                        </span>
                                    </td>
                                    <td className="text-slate-400">{item.minStockLevel}</td>
                                    <td><span className={`badge ${item.isActive ? 'badge-active' : 'badge-inactive'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td>
                                    {canManage && (
                                        <td>
                                            <div className="flex gap-2">
                                                <button className="btn-secondary text-xs py-1 px-3" onClick={() => startEdit(item)}>Edit</button>
                                                <button className={`${item.isActive ? 'btn-danger' : 'btn-success'} text-xs py-1 px-3`} onClick={() => toggleActive(item._id, item.isActive)}>
                                                    {item.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
