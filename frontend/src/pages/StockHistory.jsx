import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../useToast';

export default function StockHistory() {
    const [history, setHistory] = useState({});
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { showError, ToastComponent } = useToast();

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (type) params.set('type', type);
            if (startDate) params.set('startDate', startDate);
            if (endDate) params.set('endDate', endDate);
            const { data } = await api.get(`/inventory/stock-history?${params}`);
            setHistory(data.data || {});
        } catch (err) {
            showError(err.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, [type, startDate, endDate]);

    return (
        <div>
            {ToastComponent}
            <h1 className="text-2xl font-bold mb-6">📈 Stock History</h1>

            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex gap-2">
                    {[{ v: '', l: 'All' }, { v: 'in', l: 'Stock In' }, { v: 'out', l: 'Stock Out' }, { v: 'return', l: 'Returns' }].map(t => (
                        <button key={t.v} className={`text-xs py-1.5 px-3 rounded-full ${type === t.v ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`} onClick={() => setType(t.v)}>
                            {t.l}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 items-center text-sm">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="py-1.5 text-sm" />
                    <span className="text-slate-500">to</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="py-1.5 text-sm" />
                </div>
            </div>

            {loading ? (
                <div className="empty-state"><span className="loading-spinner" /></div>
            ) : (
                <div className="space-y-6">
                    {history.stockIn && (
                        <div>
                            <h2 className="text-lg font-semibold text-green-400 mb-3">📥 Stock In ({history.stockIn.length})</h2>
                            {history.stockIn.length === 0 ? <div className="empty-state text-sm">No stock in records</div> : (
                                <div className="card p-0 overflow-hidden">
                                    <table>
                                        <thead><tr><th>Receipt</th><th>Item</th><th>Qty</th><th>Vendor</th><th>Received By</th><th>Date</th></tr></thead>
                                        <tbody>
                                            {history.stockIn.map(r => (
                                                <tr key={r._id}>
                                                    <td><code className="text-green-400">{r.receiptId || '—'}</code></td>
                                                    <td>{r.item?.name || '—'}</td>
                                                    <td className="font-bold text-green-400">+{r.quantity}</td>
                                                    <td className="text-slate-400">{r.vendor?.name || '—'}</td>
                                                    <td>{r.receivedBy?.firstName} {r.receivedBy?.lastName}</td>
                                                    <td className="text-slate-500 text-sm">{new Date(r.createdAt).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {history.stockOut && (
                        <div>
                            <h2 className="text-lg font-semibold text-red-400 mb-3">📤 Stock Out ({history.stockOut.length})</h2>
                            {history.stockOut.length === 0 ? <div className="empty-state text-sm">No stock out records</div> : (
                                <div className="card p-0 overflow-hidden">
                                    <table>
                                        <thead><tr><th>Item</th><th>Qty</th><th>Purpose</th><th>Issued To</th><th>Issued By</th><th>Date</th></tr></thead>
                                        <tbody>
                                            {history.stockOut.map(r => (
                                                <tr key={r._id}>
                                                    <td>{r.item?.name || '—'}</td>
                                                    <td className="font-bold text-red-400">-{r.quantity}</td>
                                                    <td className="text-slate-400 max-w-[200px] truncate">{r.purpose}</td>
                                                    <td>{r.issuedTo?.firstName} {r.issuedTo?.lastName}</td>
                                                    <td>{r.issuedBy?.firstName} {r.issuedBy?.lastName}</td>
                                                    <td className="text-slate-500 text-sm">{new Date(r.createdAt).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {history.stockReturns && (
                        <div>
                            <h2 className="text-lg font-semibold text-yellow-400 mb-3">🔄 Returns ({history.stockReturns.length})</h2>
                            {history.stockReturns.length === 0 ? <div className="empty-state text-sm">No return records</div> : (
                                <div className="card p-0 overflow-hidden">
                                    <table>
                                        <thead><tr><th>Return ID</th><th>Item</th><th>Qty</th><th>Reason</th><th>Returned By</th><th>Received By</th><th>Date</th></tr></thead>
                                        <tbody>
                                            {history.stockReturns.map(r => (
                                                <tr key={r._id}>
                                                    <td><code className="text-yellow-400">{r.returnId || '—'}</code></td>
                                                    <td>{r.item?.name || '—'}</td>
                                                    <td className="font-bold">{r.quantity}</td>
                                                    <td><span className={r.returnReason === 'damaged' ? 'text-red-400' : 'text-green-400'}>{r.returnReason}</span></td>
                                                    <td>{r.returnedBy?.firstName} {r.returnedBy?.lastName}</td>
                                                    <td>{r.receivedBy?.firstName} {r.receivedBy?.lastName}</td>
                                                    <td className="text-slate-500 text-sm">{new Date(r.createdAt).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
