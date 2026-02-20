import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../useToast';
import api from '../api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showError, ToastComponent } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/personnel/signIn', { email, password });
            login(data.data.personnel, data.data.accessToken);
            navigate('/');
        } catch (err) {
            showError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {ToastComponent}
            <div className="card w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        HRMS & IMS
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required />
                    </div>
                    <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                        {loading ? <span className="loading-spinner" /> : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-500 mt-6">
                    Contact your admin if you don't have credentials
                </p>
            </div>
        </div>
    );
}
