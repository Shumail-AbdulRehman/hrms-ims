import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../useToast';

export default function StockIn() {
    const [items, setItems] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [form, setForm] = useState({ item: '', quantity: '', vendor: '', remarks: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const { showSuccess, showError, ToastComponent } = useToast();

    useEffect(() => {
        api.get('/inventory/inventory').then(r => setItems(r.data.data || [])).catch(() => { });
        api.get('/vendors').then(r => setVendors(r.data.data || [])).catch(() => { });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                item: form.item,
                quantity: parseInt(form.quantity),
                remarks: form.remarks || undefined,
            };
            if (form.vendor) payload.vendor = form.vendor;
            const { data } = await api.post('/inventory/stock-in', payload);
            showSuccess(`Stock in processed! Receipt: ${data.data?.receiptId}`);
            setResult(data.data);
            setForm({ item: '', quantity: '', vendor: '', remarks: '' });
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {ToastComponent}
            <h1 className="text-2xl font-bold mb-6">📥 Stock In — Receive Items</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Receive Stock</h2>
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
                            <label>Vendor (optional)</label>
                            <select value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })}>
                                <option value="">No vendor</option>
                                {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Remarks (optional)</label>
                            <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2} />
                        </div>
                        <button type="submit" className="btn-success w-full" disabled={loading}>
                            {loading ? <span className="loading-spinner" /> : 'Receive Stock'}
                        </button>
                    </form>
                </div>

                {result && (
                    <div className="card border-green-500/30">
                        <h2 className="text-lg font-semibold mb-3 text-green-400">✅ Last Receipt</h2>
                        <div className="space-y-2 text-sm">
                            <div><span className="text-slate-400">Receipt ID:</span> <code className="text-green-400">{result.receiptId}</code></div>
                            <div><span className="text-slate-400">Item:</span> {result.item?.name} ({result.item?.itemId})</div>
                            <div><span className="text-slate-400">Quantity:</span> <span className="font-bold">{result.quantity}</span></div>
                            {result.vendor && <div><span className="text-slate-400">Vendor:</span> {result.vendor?.name}</div>}
                            <div><span className="text-slate-400">Received by:</span> {result.receivedBy?.firstName} {result.receivedBy?.lastName}</div>
                            <div><span className="text-slate-400">Time:</span> {new Date(result.createdAt).toLocaleString()}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
