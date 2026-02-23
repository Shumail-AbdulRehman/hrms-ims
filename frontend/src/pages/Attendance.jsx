import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../useToast';
import { useAuth } from '../AuthContext';

export default function Attendance() {
    const { user } = useAuth();
    const role = user?.role;
    const isSubAdmin = role === 'sub_admin';
    const isAdmin = role === 'admin';
    const isSuperAdmin = role === 'super_admin';
    const canMark = isSubAdmin || isSuperAdmin;
    const canApproveSubAdmin = isSubAdmin || isSuperAdmin;
    const canApproveAdmin = isAdmin || isSuperAdmin;

    const [records, setRecords] = useState([]);
    const [personnel, setPersonnel] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [bulkStatus, setBulkStatus] = useState({});
    const { showSuccess, showError, ToastComponent } = useToast();

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/attendance', { params: { date } });
            setRecords(data.data || []);
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to fetch attendance');
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

    useEffect(() => { fetchAttendance(); }, [date]);
    useEffect(() => { if (canMark) fetchPersonnel(); }, []);

    const handleBulkMark = async () => {
        const entries = Object.entries(bulkStatus);
        if (entries.length === 0) return showError('Mark at least one person');

        const payload = {
            records: entries.map(([personnelId, status]) => ({
                personnel: personnelId,
                date,
                status,
            })),
        };

        try {
            await api.post('/attendance', payload);
            showSuccess(`${entries.length} attendance record(s) created`);
            setBulkStatus({});
            setShowForm(false);
            fetchAttendance();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to mark attendance');
        }
    };

    const handleApproval = async (id, endpoint) => {
        try {
            await api.patch(`/attendance/${id}/${endpoint}`);
            showSuccess('Attendance updated');
            fetchAttendance();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        }
    };

    const setBulk = (personnelId, status) => {
        setBulkStatus(prev => ({ ...prev, [personnelId]: status }));
    };

    const statusColors = {
        present: 'badge-active',
        absent: 'bg-red-500/20 text-red-400',
        leave: 'bg-yellow-500/20 text-yellow-400',
        half_day: 'bg-orange-500/20 text-orange-400',
    };

    return (
        <div>
            {ToastComponent}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">📅 Attendance</h1>
                <div className="flex gap-3 items-center">
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
                    />
                    {canMark && (
                        <button className="btn-primary" onClick={() => setShowForm(true)}>
                            + Mark Attendance
                        </button>
                    )}
                </div>
            </div>

            {/* Bulk Mark Form */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">Mark Attendance — {date}</h2>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {personnel.map(p => (
                                <div key={p._id} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                                    <span className="text-sm font-medium">{p.firstName} {p.lastName} <span className="text-slate-400 text-xs">({p.role?.replace(/_/g, ' ')})</span></span>
                                    <select
                                        value={bulkStatus[p._id] || ''}
                                        onChange={e => setBulk(p._id, e.target.value)}
                                        className="text-sm bg-slate-700 border border-slate-600 rounded px-2 py-1"
                                    >
                                        <option value="">—</option>
                                        <option value="present">Present</option>
                                        <option value="absent">Absent</option>
                                        <option value="leave">Leave</option>
                                        <option value="half_day">Half Day</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button className="btn-primary flex-1" onClick={handleBulkMark}>
                                Submit ({Object.keys(bulkStatus).length})
                            </button>
                            <button className="btn-secondary flex-1" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance Table */}
            {loading ? (
                <div className="empty-state"><span className="loading-spinner" /></div>
            ) : records.length === 0 ? (
                <div className="empty-state">No attendance records for {date}</div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Status</th>
                                <th>Sub-Admin Approval</th>
                                <th>Admin Approval</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(r => (
                                <tr key={r._id}>
                                    <td className="font-medium">
                                        {r.personnel?.firstName} {r.personnel?.lastName}
                                        <span className="text-xs text-slate-400 block">{r.personnel?.designation || r.personnel?.role?.replace(/_/g, ' ')}</span>
                                    </td>
                                    <td><span className={`badge ${statusColors[r.status] || ''}`}>{r.status?.replace(/_/g, ' ')}</span></td>
                                    <td>
                                        <span className={`badge ${r.subAdminApproval?.status === 'approved' ? 'badge-active' : r.subAdminApproval?.status === 'rejected' ? 'badge-inactive' : 'bg-slate-600 text-slate-300'}`}>
                                            {r.subAdminApproval?.status || 'pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${r.adminApproval?.status === 'approved' ? 'badge-active' : r.adminApproval?.status === 'rejected' ? 'badge-inactive' : 'bg-slate-600 text-slate-300'}`}>
                                            {r.adminApproval?.status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="space-x-1">
                                        {canApproveSubAdmin && r.subAdminApproval?.status === 'pending' && (
                                            <>
                                                <button className="btn-primary text-xs py-1 px-2" onClick={() => handleApproval(r._id, 'approve-sub-admin')}>✓</button>
                                                <button className="btn-danger text-xs py-1 px-2" onClick={() => handleApproval(r._id, 'reject-sub-admin')}>✗</button>
                                            </>
                                        )}
                                        {canApproveAdmin && r.subAdminApproval?.status === 'approved' && r.adminApproval?.status === 'pending' && (
                                            <>
                                                <button className="btn-primary text-xs py-1 px-2" onClick={() => handleApproval(r._id, 'approve-admin')}>✓ Admin</button>
                                                <button className="btn-danger text-xs py-1 px-2" onClick={() => handleApproval(r._id, 'reject-admin')}>✗ Admin</button>
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
