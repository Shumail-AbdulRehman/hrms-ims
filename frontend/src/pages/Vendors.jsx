import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../useToast';
import { useAuth } from '../AuthContext';

export default function Vendors() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'super_admin';
    const [vendors, setVendors] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', contact: '', phone: '', email: '', address: '', unit: '' });
    const [showInactive, setShowInactive] = useState(false);
    const { showSuccess, showError, ToastComponent } = useToast();

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/vendors?showInactive=${showInactive}`);
            setVendors(data.data || []);
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to fetch vendors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVendors(); }, [showInactive]);

    useEffect(() => {
        if (isSuperAdmin) {
            api.get('/units').then(r => setUnits(r.data.data || [])).catch(() => { });
        }
    }, []);

    const resetForm = () => setForm({ name: '', contact: '', phone: '', email: '', address: '', unit: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            if (!isSuperAdmin) delete payload.unit;

            if (editing) {
                delete payload.unit;
                await api.put(`/vendors/${editing}`, payload);
                showSuccess('Vendor updated');
            } else {
                await api.post('/vendors', payload);
                showSuccess('Vendor created');
            }
            setShowForm(false);
            setEditing(null);
            resetForm();
            fetchVendors();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        }
    };

    const toggleActive = async (id, isActive) => {
        try {
            await api.patch(`/vendors/${id}/${isActive ? 'deactivate' : 'activate'}`);
            showSuccess(isActive ? 'Vendor deactivated' : 'Vendor activated');
            fetchVendors();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        }
    };

    const startEdit = (v) => {
        setForm({ name: v.name, contact: v.contact || '', phone: v.phone || '', email: v.email || '', address: v.address || '', unit: v.unit?._id || '' });
        setEditing(v._id);
        setShowForm(true);
    };

    return (
        <div>
            {ToastComponent}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Vendors</h1>
                <div className="flex gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-400">
                        <input type="checkbox" checked={showInactive} onChange={() => setShowInactive(!showInactive)} />
                        Show inactive
                    </label>
                    <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}>+ Add Vendor</button>
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Vendor' : 'Add Vendor'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>

                            {isSuperAdmin && !editing && (
                                <div className="form-group">
                                    <label>Unit</label>
                                    <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required>
                                        <option value="">Select unit</option>
                                        {units.map(u => <option key={u._id} value={u._id}>{u.name} ({u.code})</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="form-group"><label>Contact Person</label><input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
                                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                            </div>
                            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                            <div className="form-group"><label>Address</label><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} /></div>
                            <div className="flex gap-3 mt-4">
                                <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Create'}</button>
                                <button type="button" className="btn-secondary flex-1" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="empty-state"><span className="loading-spinner" /></div>
            ) : vendors.length === 0 ? (
                <div className="empty-state">No vendors found</div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <table>
                        <thead>
                            <tr><th>Name</th><th>Contact</th><th>Phone</th><th>Email</th><th>Unit</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {vendors.map(v => (
                                <tr key={v._id}>
                                    <td className="font-medium">{v.name}</td>
                                    <td className="text-slate-400">{v.contact || '—'}</td>
                                    <td className="text-slate-400">{v.phone || '—'}</td>
                                    <td className="text-slate-400">{v.email || '—'}</td>
                                    <td className="text-slate-400">{v.unit?.name || '—'} <span className="text-xs">({v.unit?.code || '—'})</span></td>
                                    <td><span className={`badge ${v.isActive ? 'badge-active' : 'badge-inactive'}`}>{v.isActive ? 'Active' : 'Inactive'}</span></td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn-secondary text-xs py-1 px-3" onClick={() => startEdit(v)}>Edit</button>
                                            <button className={`${v.isActive ? 'btn-danger' : 'btn-success'} text-xs py-1 px-3`} onClick={() => toggleActive(v._id, v.isActive)}>
                                                {v.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
