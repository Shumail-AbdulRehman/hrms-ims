import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../useToast';

export default function Units() {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', location: '' });
    const [showInactive, setShowInactive] = useState(false);
    const { showSuccess, showError, ToastComponent } = useToast();

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/units?showInactive=${showInactive}`);
            setUnits(data.data || []);
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to fetch units');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUnits(); }, [showInactive]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/units/${editing}`, form);
                showSuccess('Unit updated');
            } else {
                await api.post('/units', form);
                showSuccess('Unit created');
            }
            setShowForm(false);
            setEditing(null);
            setForm({ name: '', code: '', location: '' });
            fetchUnits();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        }
    };

    const toggleActive = async (id, isActive) => {
        try {
            await api.patch(`/units/${id}/${isActive ? 'deactivate' : 'activate'}`);
            showSuccess(isActive ? 'Unit deactivated' : 'Unit activated');
            fetchUnits();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        }
    };

    const startEdit = (unit) => {
        setForm({ name: unit.name, code: unit.code || '', location: unit.location || '' });
        setEditing(unit._id);
        setShowForm(true);
    };

    return (
        <div>
            {ToastComponent}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Units</h1>
                <div className="flex gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-400">
                        <input type="checkbox" checked={showInactive} onChange={() => setShowInactive(!showInactive)} />
                        Show inactive
                    </label>
                    <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', code: '', location: '' }); }}>+ Create Unit</button>
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Unit' : 'Create Unit'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Code</label>
                                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. LHR-01" required />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                            </div>
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
            ) : units.length === 0 ? (
                <div className="empty-state">No units found</div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <table>
                        <thead>
                            <tr><th>Name</th><th>Code</th><th>Location</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {units.map(u => (
                                <tr key={u._id}>
                                    <td className="font-medium">{u.name}</td>
                                    <td><code className="text-blue-400">{u.code}</code></td>
                                    <td className="text-slate-400">{u.location || '—'}</td>
                                    <td><span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn-secondary text-xs py-1 px-3" onClick={() => startEdit(u)}>Edit</button>
                                            <button className={`${u.isActive ? 'btn-danger' : 'btn-success'} text-xs py-1 px-3`} onClick={() => toggleActive(u._id, u.isActive)}>
                                                {u.isActive ? 'Deactivate' : 'Activate'}
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
