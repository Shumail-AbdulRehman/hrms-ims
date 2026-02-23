import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../useToast';
import { useAuth } from '../AuthContext';

const ROLES = [
    'super_admin', 'admin', 'sub_admin', 'sdo', 'sub_engineer',
    'supervisor', 'employee', 'store_manager', 'inventory_operator', 'ims_audit_officer'
];

export default function Personnel() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'super_admin';
    const canCreate = ['super_admin', 'admin', 'sub_admin'].includes(user?.role);
    const [personnel, setPersonnel] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '',
        role: 'employee', unit: '', designation: '', department: '',
        phone: '', cnic: '', employeeType: 'permanent'
    });
    const { showSuccess, showError, ToastComponent } = useToast();

    const fetchPersonnel = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/personnel');
            setPersonnel(data.data || []);
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPersonnel();
        if (isSuperAdmin) {
            api.get('/units').then(r => setUnits(r.data.data || [])).catch(() => { });
        }
    }, []);

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const resetForm = () => {
        setForm({
            firstName: '', lastName: '', email: '', password: '',
            role: 'employee', unit: '', designation: '', department: '',
            phone: '', cnic: '', employeeType: 'permanent'
        });
        setEditing(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                const { email, password, ...updateData } = form;
                await api.put(`/personnel/${editing}`, updateData);
                showSuccess('Personnel updated');
            } else {
                const payload = { ...form };
                if (!payload.password) payload.password = 'changeme123';
                if (!isSuperAdmin) delete payload.unit;
                await api.post('/personnel/create', payload);
                showSuccess('Personnel created');
            }
            setShowForm(false);
            resetForm();
            fetchPersonnel();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        }
    };

    const startEdit = (p) => {
        setForm({
            firstName: p.firstName, lastName: p.lastName, email: p.email, password: '',
            role: p.role, unit: p.unit?._id || p.unit || '', designation: p.designation || '',
            department: p.department || '', phone: p.phone || '', cnic: p.cnic || '',
            employeeType: p.employeeType || 'permanent'
        });
        setEditing(p._id);
        setShowForm(true);
    };

    return (
        <div>
            {ToastComponent}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">👥 Personnel Management</h1>
                <button className="btn-primary" onClick={() => { setShowForm(true); resetForm(); }}>+ Create Personnel</button>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => { setShowForm(false); resetForm(); }}>
                    <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Personnel' : 'Create Personnel'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="form-group"><label>First Name</label><input value={form.firstName} onChange={set('firstName')} required /></div>
                                <div className="form-group"><label>Last Name</label><input value={form.lastName} onChange={set('lastName')} required /></div>
                            </div>
                            {!editing && (
                                <>
                                    <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={set('email')} required /></div>
                                    <div className="form-group"><label>Password (default: changeme123)</label><input type="password" value={form.password} onChange={set('password')} placeholder="Leave blank for default" /></div>
                                </>
                            )}
                            <div className={`grid ${isSuperAdmin ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select value={form.role} onChange={set('role')} required>
                                        {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                                    </select>
                                </div>
                                {isSuperAdmin && (
                                    <div className="form-group">
                                        <label>Unit</label>
                                        <select value={form.unit} onChange={set('unit')} required>
                                            <option value="">Select unit</option>
                                            {units.map(u => <option key={u._id} value={u._id}>{u.name} ({u.code})</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="form-group"><label>Designation</label><input value={form.designation} onChange={set('designation')} /></div>
                                <div className="form-group"><label>Department</label><input value={form.department} onChange={set('department')} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={set('phone')} /></div>
                                <div className="form-group"><label>CNIC</label><input value={form.cnic} onChange={set('cnic')} /></div>
                            </div>
                            <div className="form-group">
                                <label>Employee Type</label>
                                <select value={form.employeeType} onChange={set('employeeType')}>
                                    <option value="permanent">Permanent</option>
                                    <option value="contract">Contract</option>
                                </select>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Create'}</button>
                                <button type="button" className="btn-secondary flex-1" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="empty-state"><span className="loading-spinner" /></div>
            ) : personnel.length === 0 ? (
                <div className="empty-state">No personnel found</div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <table>
                        <thead>
                            <tr><th>Emp ID</th><th>Name</th><th>Email</th><th>Role</th><th>Unit</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {personnel.map(p => (
                                <tr key={p._id}>
                                    <td><code className="text-blue-400">{p.employeeId}</code></td>
                                    <td className="font-medium">{p.firstName} {p.lastName}</td>
                                    <td className="text-slate-400">{p.email}</td>
                                    <td><span className="badge badge-active">{p.role?.replace(/_/g, ' ')}</span></td>
                                    <td className="text-slate-400">{p.unit?.name || '—'} <span className="text-xs">({p.unit?.code || '—'})</span></td>
                                    <td><span className={`badge ${p.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{p.status || 'active'}</span></td>
                                    <td>
                                        <button className="btn-secondary text-xs py-1 px-3" onClick={() => startEdit(p)}>Edit</button>
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
