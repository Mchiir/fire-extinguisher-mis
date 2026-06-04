import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Flame, LogOut, Menu, X, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../api/client.js';
import toast from 'react-hot-toast';

// Removed '/notifications' from the sidebar lists since it's now in the top header
const navByRole = {
  ADMIN: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/extinguishers', label: 'Extinguishers' },
    { to: '/inspections', label: 'Inspections' },
    { to: '/maintenance', label: 'Maintenance' },
    { to: '/users', label: 'Users' },
    { to: '/reports', label: 'Reports' },
    { to: '/profile', label: 'Profile' },
  ],
  INSPECTOR: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/extinguishers', label: 'Extinguishers' },
    { to: '/inspections', label: 'Inspections' },
    { to: '/maintenance', label: 'Maintenance' },
    { to: '/profile', label: 'Profile' },
  ],
  USER: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/extinguishers', label: 'Extinguishers' },
    { to: '/inspections', label: 'Inspections' },
    { to: '/maintenance', label: 'Maintenance' },
    { to: '/profile', label: 'Profile' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const links = navByRole[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  // Fetch recent preview items when the user opens the notification drawer
  useEffect(() => {
    if (isNotifOpen) {
      apiFetch('/notifications?page=1&limit=5')
        .then((res) => setNotifications(res.data?.items || []))
        .catch((err) => console.error(err.message));
    }
  }, [isNotifOpen]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* 1. Full-Width Top Header Bar */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-brand-700">
            <Flame size={24} />
            <span className="text-base font-bold tracking-tight sm:text-lg">Extinguisher MIS</span>
          </Link>
        </div>

        {/* Header Right Content Area */}
        <div className="flex items-center gap-4">
          {/* Toggleable Notification Bell (Prioritized Blue Color) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative rounded-full p-2 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" />
            </button>

            {/* Notification Pane Dropdown Overlays */}
            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-20">
                  <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-800 text-sm">Recent Alerts</span>
                    <Link 
                      to="/notifications" 
                      onClick={() => setIsNotifOpen(false)} 
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-4">No new notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} className="border-b border-slate-50 pb-2 last:border-none last:pb-0">
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Execution Split (Sidebar + Workspace Container) */}
      <div className="flex flex-1 relative">
        {/* Mobile Backdrop Overlay Shadow */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Component Panel — Drops cleanly down from header base (top-16) */}
        <aside
          className={`fixed bottom-0 top-16 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Scrollable Navigation Stream Area */}
          <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Anchored Account Profile Details + Actions Panel (Kept exactly from original code) */}
          <div className="border-t border-slate-100 bg-slate-50/50 p-4">
            <div className="mb-3 flex flex-col px-2">
              <span className="truncate text-sm font-semibold text-slate-800">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="truncate text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
                {user?.role}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        {/* 3. Primary Page Component Display Area */}
        <main className="flex-1 md:pl-64 min-w-0">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}