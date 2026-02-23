import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const NAV = [
    { to: '/', label: '📊 Dashboard', roles: null },
    { to: '/units', label: '🏢 Units', roles: ['super_admin'] },
    { to: '/personnel', label: '👥 Personnel', roles: ['super_admin', 'admin', 'sub_admin'] },
    { to: '/attendance', label: '📅 Attendance', roles: ['super_admin', 'admin', 'sub_admin', 'sdo', 'sub_engineer', 'supervisor', 'employee'] },
    { to: '/shifts', label: '⏰ Shifts', roles: ['super_admin', 'sub_admin', 'supervisor', 'sdo', 'sub_engineer', 'employee'] },
    { to: '/vendors', label: '🏪 Vendors', roles: ['store_manager', 'super_admin'] },
    { to: '/inventory', label: '📦 Inventory', roles: ['inventory_operator', 'store_manager', 'super_admin', 'admin'] },
    { to: '/stock-in', label: '📥 Stock In', roles: ['inventory_operator', 'super_admin'] },
    { to: '/stock-requests', label: '📋 Stock Requests', roles: ['inventory_operator', 'super_admin'] },
    { to: '/my-requests', label: '🙋 My Requests', roles: ['employee', 'super_admin'] },
    { to: '/stock-returns', label: '🔄 Stock Returns', roles: ['inventory_operator', 'super_admin'] },
    { to: '/stock-history', label: '📈 Stock History', roles: ['inventory_operator', 'store_manager', 'super_admin', 'admin'] },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const visibleNav = NAV.filter(n => !n.roles || n.roles.includes(user?.role));

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col fixed h-full">
                <div className="p-5 border-b border-slate-700">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        HRMS & IMS
                    </h1>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {visibleNav.map(n => (
                        <NavLink
                            key={n.to}
                            to={n.to}
                            end={n.to === '/'}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            {n.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <div className="text-sm font-medium text-slate-300 truncate">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-slate-500 mb-3">{user?.role?.replace(/_/g, ' ')}</div>
                    <button onClick={handleLogout} className="btn-danger w-full text-sm py-2">Logout</button>
                </div>
            </aside>

            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
}
