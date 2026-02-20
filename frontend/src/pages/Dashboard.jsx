import { useAuth } from '../AuthContext';

export default function Dashboard() {
    const { user } = useAuth();

    const roleInfo = {
        super_admin: { color: 'from-purple-500 to-pink-500', desc: 'Full system access — manage units, users, and all modules' },
        admin: { color: 'from-blue-500 to-cyan-500', desc: 'Unit admin — manage users, approve procurement & discipline' },
        hr_officer: { color: 'from-green-500 to-emerald-500', desc: 'HR operations — employees, attendance, leave, training' },
        supervisor: { color: 'from-yellow-500 to-orange-500', desc: 'Team management — view team data, apply leave' },
        employee: { color: 'from-slate-500 to-slate-400', desc: 'Self-service — profile, leave, stock requests' },
        store_manager: { color: 'from-indigo-500 to-blue-500', desc: 'IMS management — items, vendors, procurement' },
        inventory_operator: { color: 'from-teal-500 to-green-500', desc: 'Stock operations — receive, issue, return items' },
        hrms_audit_officer: { color: 'from-gray-500 to-gray-400', desc: 'HRMS auditing — read-only access to HR data' },
        ims_audit_officer: { color: 'from-gray-500 to-gray-400', desc: 'IMS auditing — read-only access to inventory data' },
    };

    const info = roleInfo[user?.role] || roleInfo.employee;

    return (
        <div>
            <div className={`card bg-gradient-to-r ${info.color} border-0 mb-8`}>
                <h1 className="text-2xl font-bold text-white mb-2">Welcome, {user?.firstName}!</h1>
                <p className="text-white/80 text-sm">{info.desc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                    <div className="text-sm text-slate-400 mb-1">Role</div>
                    <div className="text-lg font-semibold">{user?.role?.replace(/_/g, ' ')}</div>
                </div>
                <div className="card">
                    <div className="text-sm text-slate-400 mb-1">Email</div>
                    <div className="text-lg font-semibold truncate">{user?.email}</div>
                </div>
                <div className="card">
                    <div className="text-sm text-slate-400 mb-1">Employee ID</div>
                    <div className="text-lg font-semibold">{user?.employeeId || '—'}</div>
                </div>
            </div>
        </div>
    );
}
