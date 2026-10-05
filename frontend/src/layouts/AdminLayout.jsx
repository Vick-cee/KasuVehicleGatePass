import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DemoQuickBar from '../components/DemoQuickBar';
import api from '../services/api';
import {
  LayoutDashboard,
  Clock,
  Car,
  Users,
  Shield,
  QrCode,
  FileSpreadsheet,
  History,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get('/vehicles/pending');
        setPendingCount(res.data.count || 0);
      } catch (err) {
        // ignore if not admin yet
      }
    };
    if (isAdmin) fetchPending();
  }, [isAdmin, location.pathname]);

  const navItems = [
    { label: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    {
      label: 'Pending Approvals',
      path: '/admin/approvals',
      icon: Clock,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { label: 'Registered Vehicles', path: '/admin/vehicles', icon: Car },
    { label: 'Users Directory', path: '/admin/users', icon: Users },
    { label: 'Campus Gates', path: '/admin/gates', icon: Shield },
    { label: 'Gate Officers', path: '/admin/officers', icon: QrCode },
    { label: 'Master Entry/Exit Logs', path: '/admin/logs', icon: FileSpreadsheet },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Audit Trail', path: '/admin/audit', icon: History },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <DemoQuickBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-white text-base leading-tight tracking-tight">
                ADMIN CONSOLE
              </div>
              <div className="text-[11px] text-purple-400 font-medium">
                KASU Security & Transit
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Management Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge !== null && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        active ? 'bg-white text-purple-700' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-slate-800/80 my-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Other Portals
              </div>
              <Link
                to="/scanner"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-emerald-400 hover:bg-slate-800 transition"
              >
                <QrCode className="w-4 h-4" />
                <span>Officer Mobile Scanner</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-blue-400 hover:bg-slate-800 transition"
              >
                <Car className="w-4 h-4" />
                <span>User Vehicle Portal</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </Link>
            </div>
          </div>

          {/* User Footer in Sidebar */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="truncate text-xs">
                <div className="font-semibold text-white truncate">{user?.fullName || 'Administrator'}</div>
                <div className="text-slate-400 text-[10px] truncate">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Main Content Body */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Admin Header */}
          <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Kaduna State University Administration</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="text-purple-700 font-semibold">
                  {navItems.find((n) => isActive(n.path))?.label || 'Overview'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/scanner"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-sm"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Test Gate Scanner</span>
              </Link>
            </div>
          </header>

          {/* Page Content View */}
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 text-slate-300 p-4 space-y-3 z-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-white text-sm">ADMIN MENU</span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                    isActive(item.path) ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminLayout;
