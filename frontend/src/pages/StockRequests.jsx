import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../useToast';

export default function StockRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const { showSuccess, showError, ToastComponent } = useToast();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const query = statusFilter ? `?status=${statusFilter}` : '';
            const { data } = await api.get(`/inventory/stock-requests${query}`);
            setRequests(data.data || []);
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, [statusFilter]);

    const handleApprove = async (id) => {
        try {
            await api.patch(`/inventory/stock-requests/${id}/approve`);
            showSuccess('Request approved — stock issued');
            fetchRequests();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to approve');
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return showError('Rejection reason is required');
        try {
            await api.patch(`/inventory/stock-requests/${rejectModal}/reject`, { rejectionReason: rejectReason });
            showSuccess('Request rejected');
            setRejectModal(null);
            setRejectReason('');
            fetchRequests();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to reject');
        }
    };

    return (
        <div>
            {ToastComponent}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">📋 Stock Out Requests</h1>
                <div className="flex gap-2">
                    {['', 'pending', 'approved', 'rejected'].map(s => (
                        <button key={s} className={`text-xs py-1.5 px-3 rounded-full ${statusFilter === s ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`} onClick={() => setStatusFilter(s)}>
                            {s || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {rejectModal && (
                <div className="modal-overlay" onClick={() => setRejectModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4 text-red-400">Reject Request</h2>
                        <div className="form-group">
                            <label>Rejection Reason</label>
                            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="Why is this request being rejected?" />
                        </div>
                        <div className="flex gap-3">
                            <button className="btn-danger flex-1" onClick={handleReject}>Reject</button>
                            <button className="btn-secondary flex-1" onClick={() => setRejectModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="empty-state"><span className="loading-spinner" /></div>
            ) : requests.length === 0 ? (
                <div className="empty-state">No stock requests found</div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <table>
                        <thead>
                            <tr><th>Request ID</th><th>Item</th><th>Qty</th><th>Purpose</th><th>Requested By</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {requests.map(r => (
                                <tr key={r._id}>
                                    <td><code className="text-blue-400">{r.requestId}</code></td>
                                    <td className="font-medium">{r.item?.name || '—'}<br /><span className="text-xs text-slate-500">{r.item?.itemId}</span></td>
                                    <td className="font-bold">{r.quantity}</td>
                                    <td className="text-slate-400 max-w-[200px] truncate">{r.purpose}</td>
                                    <td>{r.requestedBy?.firstName} {r.requestedBy?.lastName}</td>
                                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                                    <td>
                                        {r.status === 'pending' ? (
                                            <div className="flex gap-2">
                                                <button className="btn-success text-xs py-1 px-3" onClick={() => handleApprove(r._id)}>Approve</button>
                                                <button className="btn-danger text-xs py-1 px-3" onClick={() => setRejectModal(r._id)}>Reject</button>
                                            </div>
                                        ) : r.status === 'rejected' ? (
                                            <span className="text-xs text-slate-500">{r.rejectionReason}</span>
                                        ) : (
                                            <span className="text-xs text-green-400">Issued</span>
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
