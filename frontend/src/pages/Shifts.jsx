import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../useToast';
import { useAuth } from '../AuthContext';

export default function Shifts() {
    const { user } = useAuth();
    const role = user?.role;
    const isSupervisor = role === 'supervisor';
    const isSubAdmin = role === 'sub_admin';
    const isSuperAdmin = role === 'super_admin';
    const canCreate = isSupervisor || isSuperAdmin;
    const canApprove = isSubAdmin || isSuperAdmin;

    const [shifts, setShifts] = useState([]);
    const [personnel, setPersonnel] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [form, setForm] = useState({
        name: '', startTime: '', endTime: '', effectiveDate: '', assignedTo: [], remarks: ''
    });
    const { showSuccess, showError, ToastComponent } = useToast();

    const fetchShifts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            const { data } = await api.get('/shifts', { params });
            setShifts(data.data || []);
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to fetch shifts');
        } finally {
            setLoading(false);
        }
    };

    const fetchPersonnel = async () => {
        try {
            const { data } = await api.get('/personnel');
            setPersonnel(data.data || []);
        } catch { }
    };

    useEffect(() => { fetchShifts(); }, [statusFilter]);
    useEffect(() => { if (canCreate) fetchPersonnel(); }, []);

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const toggleAssign = (id) => {
        setForm(prev => ({
            ...prev,
            assignedTo: prev.assignedTo.includes(id)
                ? prev.assignedTo.filter(x => x !== id)
                : [...prev.assignedTo, id]
        }));
    };

    const resetForm = () => {
        setForm({ name: '', startTime: '', endTime: '', effectiveDate: '', assignedTo: [], remarks: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/shifts', form);
            showSuccess('Shift created — pending sub_admin approval');
            setShowForm(false);
            resetForm();
            fetchShifts();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to create shift');
        }
    };

    const handleApproval = async (id, action) => {
        try {
            await api.patch(`/shifts/${id}/${action}`);
            showSuccess(`Shift ${action}d`);
            fetchShifts();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        }
    };

    const approvalColors = {
        pending: 'bg-slate-600 text-slate-300',
        approved: 'badge-active',
        rejected: 'badge-inactive',
    };

    return (
        <div>
            {ToastComponent}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">⏰ Shifts</h1>
                <div className="flex gap-3 items-center">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    {canCreate && (
                        <button className="btn-primary" onClick={() => { setShowForm(true); resetForm(); }}>
                            + Create Shift
                        </button>
                    )}
                </div>
            </div>

            {/* Create Shift Form */}
            {showForm && (
                <div className="modal-overlay" onClick={() => { setShowForm(false); resetForm(); }}>
                    <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">Create Shift</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label>Shift Name</label><input value={form.name} onChange={set('name')} required placeholder="e.g. Morning Shift" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="form-group"><label>Start Time</label><input type="time" value={form.startTime} onChange={set('startTime')} required /></div>
                                <div className="form-group"><label>End Time</label><input type="time" value={form.endTime} onChange={set('endTime')} required /></div>
                            </div>
                            <div className="form-group"><label>Effective Date</label><input type="date" value={form.effectiveDate} onChange={set('effectiveDate')} required /></div>
                            <div className="form-group"><label>Remarks</label><input value={form.remarks} onChange={set('remarks')} placeholder="Optional" /></div>

                            <div className="form-group">
                                <label>Assign Personnel ({form.assignedTo.length} selected)</label>
                                <div className="max-h-40 overflow-y-auto space-y-1 mt-1">
                                    {personnel.map(p => (
                                        <label key={p._id} className="flex items-center gap-2 p-2 bg-slate-800 rounded cursor-pointer hover:bg-slate-700 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={form.assignedTo.includes(p._id)}
                                                onChange={() => toggleAssign(p._id)}
                                            />
                                            {p.firstName} {p.lastName} <span className="text-slate-400">({p.role?.replace(/_/g, ' ')})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button type="submit" className="btn-primary flex-1">Create</button>
                                <button type="button" className="btn-secondary flex-1" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Shifts Table */}
            {loading ? (
                <div className="empty-state"><span className="loading-spinner" /></div>
            ) : shifts.length === 0 ? (
                <div className="empty-state">No shifts found</div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Time</th>
                                <th>Effective Date</th>
                                <th>Assigned</th>
                                <th>Created By</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shifts.map(s => (
                                <tr key={s._id}>
                                    <td className="font-medium">{s.name}</td>
                                    <td className="text-slate-400">{s.startTime} — {s.endTime}</td>
                                    <td className="text-slate-400">{s.effectiveDate ? new Date(s.effectiveDate).toLocaleDateString() : '—'}</td>
                                    <td className="text-sm text-slate-400">{s.assignedTo?.length || 0} person(s)</td>
                                    <td className="text-sm">{s.assignedBy?.firstName} {s.assignedBy?.lastName}</td>
                                    <td><span className={`badge ${approvalColors[s.approval?.status] || ''}`}>{s.approval?.status || 'pending'}</span></td>
                                    <td className="space-x-1">
                                        {canApprove && s.approval?.status === 'pending' && (
                                            <>
                                                <button className="btn-primary text-xs py-1 px-2" onClick={() => handleApproval(s._id, 'approve')}>Approve</button>
                                                <button className="btn-danger text-xs py-1 px-2" onClick={() => handleApproval(s._id, 'reject')}>Reject</button>
                                            </>
                                        )}
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
