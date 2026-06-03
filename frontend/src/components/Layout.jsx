import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Flame, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const navByRole = {
  ADMIN: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/extinguishers', label: 'Extinguishers' },
    { to: '/inspections', label: 'Inspections' },
    { to: '/maintenance', label: 'Maintenance' },
    { to: '/users', label: 'Users' },
    { to: '/reports', label: 'Reports' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/profile', label: 'Profile' },
  ],
  INSPECTOR: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/extinguishers', label: 'Extinguishers' },
    { to: '/inspections', label: 'Inspections' },
    { to: '/maintenance', label: 'Maintenance' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/profile', label: 'Profile' },
  ],
  USER: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/extinguishers', label: 'Extinguishers' },
    { to: '/inspections', label: 'Inspections' },
    { to: '/maintenance', label: 'Maintenance' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/profile', label: 'Profile' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navByRole[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-brand-700">
            <Flame size={24} />
            Fire Extinguisher MIS
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {user?.firstName} {user?.lastName} ({user?.role})
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
