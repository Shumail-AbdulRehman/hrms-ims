import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../useToast';
import api from '../api';

const ROLES = [
    'super_admin', 'admin', 'sub_admin', 'sdo', 'sub_engineer',
    'supervisor', 'employee', 'store_manager', 'inventory_operator', 'ims_audit_officer'
];

export default function SignUp() {
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '',
        role: 'employee', unit: '', designation: '', department: ''
    });
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showError, showSuccess, ToastComponent } = useToast();

    useEffect(() => {
        api.get('/units').then(r => setUnits(r.data.data || [])).catch(() => { });
    }, []);

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/personnel/signUp', form);
            showSuccess('Account created!');
            login(data.data.personnel, data.data.accessToken);
            navigate('/');
        } catch (err) {
            showError(err.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {ToastComponent}
            <div className="card w-full max-w-lg">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Create Account
                    </h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="form-group">
                            <label>First Name</label>
                            <input value={form.firstName} onChange={set('firstName')} required />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input value={form.lastName} onChange={set('lastName')} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={form.email} onChange={set('email')} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={form.password} onChange={set('password')} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="form-group">
                            <label>Role</label>
                            <select value={form.role} onChange={set('role')}>
                                {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Unit</label>
                            {units.length > 0 ? (
                                <select value={form.unit} onChange={set('unit')} required>
                                    <option value="">Select unit</option>
                                    {units.map(u => <option key={u._id} value={u._id}>{u.name} ({u.code})</option>)}
                                </select>
                            ) : (
                                <input value={form.unit} onChange={set('unit')} placeholder="Unit ObjectId" required />
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="form-group">
                            <label>Designation</label>
                            <input value={form.designation} onChange={set('designation')} />
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <input value={form.department} onChange={set('department')} />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                        {loading ? <span className="loading-spinner" /> : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-400 mt-6">
                    Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
