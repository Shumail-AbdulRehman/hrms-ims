import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../useToast';

export default function StockReturns() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ item: '', quantity: '', returnedBy: '', returnReason: 'excess', remarks: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const { showSuccess, showError, ToastComponent } = useToast();

    useEffect(() => {
        api.get('/inventory/inventory').then(r => setItems(r.data.data || [])).catch(() => { });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/inventory/stock-returns', {
                item: form.item,
                quantity: parseInt(form.quantity),
                returnedBy: form.returnedBy,
                returnReason: form.returnReason,
                remarks: form.remarks || undefined,
            });
            showSuccess(`Return processed! ID: ${data.data?.returnId}`);
            setResult(data.data);
            setForm({ item: '', quantity: '', returnedBy: '', returnReason: 'excess', remarks: '' });
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {ToastComponent}
            <h1 className="text-2xl font-bold mb-6">🔄 Stock Returns</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Process Return</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Item</label>
                            <select value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} required>
                                <option value="">Select item</option>
                                {items.map(i => <option key={i._id} value={i._id}>{i.itemId} — {i.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="form-group">
                                <label>Quantity</label>
                                <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Reason</label>
                                <select value={form.returnReason} onChange={(e) => setForm({ ...form, returnReason: e.target.value })}>
                                    <option value="excess">Excess</option>
                                    <option value="damaged">Damaged</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Returned By (Personnel ID)</label>
                            <input value={form.returnedBy} onChange={(e) => setForm({ ...form, returnedBy: e.target.value })} placeholder="ObjectId of the employee" required />
                        </div>
                        <div className="form-group">
                            <label>Remarks</label>
                            <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2} />
                        </div>
                        <button type="submit" className="btn-warning w-full" disabled={loading}>
                            {loading ? <span className="loading-spinner" /> : 'Process Return'}
                        </button>
                    </form>

                    <div className="mt-4 p-3 rounded-lg bg-slate-800 text-xs text-slate-400">
                        <strong>Note:</strong> "Excess" returns add stock back. "Damaged" returns are recorded as loss — no stock change.
                    </div>
                </div>

                {result && (
                    <div className="card border-yellow-500/30">
                        <h2 className="text-lg font-semibold mb-3 text-yellow-400">✅ Return Processed</h2>
                        <div className="space-y-2 text-sm">
                            <div><span className="text-slate-400">Return ID:</span> <code className="text-yellow-400">{result.returnId}</code></div>
                            <div><span className="text-slate-400">Item:</span> {result.item?.name} ({result.item?.itemId})</div>
                            <div><span className="text-slate-400">Quantity:</span> <span className="font-bold">{result.quantity}</span></div>
                            <div><span className="text-slate-400">Reason:</span> <span className={result.returnReason === 'damaged' ? 'text-red-400' : 'text-green-400'}>{result.returnReason}</span></div>
                            <div><span className="text-slate-400">Stock change:</span> {result.returnReason === 'excess' ? `+${result.quantity}` : 'None (loss)'}</div>
                            <div><span className="text-slate-400">Current stock:</span> {result.item?.currentStock}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
