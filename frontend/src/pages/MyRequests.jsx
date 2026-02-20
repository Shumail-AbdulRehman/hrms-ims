import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../useToast';

export default function MyRequests() {
    const [requests, setRequests] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ item: '', quantity: '', purpose: '', remarks: '' });
    const { showSuccess, showError, ToastComponent } = useToast();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/stock-requests/my');
            setRequests(data.data || []);
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        api.get('/inventory/inventory').then(r => setItems(r.data.data || [])).catch(() => { });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/stock-requests', {
                item: form.item,
                quantity: parseInt(form.quantity),
                purpose: form.purpose,
                remarks: form.remarks || undefined,
            });
            showSuccess('Request submitted!');
            setShowForm(false);
            setForm({ item: '', quantity: '', purpose: '', remarks: '' });
            fetchRequests();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        }
    };

    return (
        <div>
            {ToastComponent}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">🙋 My Stock Requests</h1>
                <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Request</button>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">Request Stock Out</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Item</label>
                                <select value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} required>
                                    <option value="">Select item</option>
                                    {items.map(i => <option key={i._id} value={i._id}>{i.itemId} — {i.name} (stock: {i.currentStock})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Purpose</label>
                                <input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Why do you need this?" required />
                            </div>
                            <div className="form-group">
                                <label>Remarks (optional)</label>
                                <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2} />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary flex-1">Submit Request</button>
                                <button type="button" className="btn-secondary flex-1" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="empty-state"><span className="loading-spinner" /></div>
            ) : requests.length === 0 ? (
                <div className="empty-state">No requests yet — click "+ New Request" to request items</div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <table>
                        <thead>
                            <tr><th>Request ID</th><th>Item</th><th>Qty</th><th>Purpose</th><th>Status</th><th>Reviewed By</th><th>Date</th></tr>
                        </thead>
                        <tbody>
                            {requests.map(r => (
                                <tr key={r._id}>
                                    <td><code className="text-blue-400">{r.requestId}</code></td>
                                    <td className="font-medium">{r.item?.name || '—'}</td>
                                    <td className="font-bold">{r.quantity}</td>
                                    <td className="text-slate-400 max-w-[200px] truncate">{r.purpose}</td>
                                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                                    <td className="text-slate-400">{r.reviewedBy ? `${r.reviewedBy.firstName} ${r.reviewedBy.lastName}` : '—'}</td>
                                    <td className="text-slate-500 text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
