import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DemoQuickBar from '../components/DemoQuickBar';
import api from '../services/api';
import {
  QrCode,
  History,
  User,
  Shield,
  Clock,
  Radio,
  LogOut,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const OfficerLayout = () => {
  const { user, officerProfile, logout, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [assignedGate, setAssignedGate] = useState(officerProfile?.assignedGateId || null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await api.get('/gates/my-assignment');
        if (res.data?.assignedGate) {
          setAssignedGate(res.data.assignedGate);
        }
      } catch (err) {
        console.error('Could not fetch gate assignment:', err);
      }
    };
    if (user?.role === 'GATE_OFFICER') {
      fetchAssignment();
    }
  }, [user]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 md:pb-0">
      <DemoQuickBar />

      {/* Officer Top Tactical Banner */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-[33px] z-30 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">GATE SCANNER</span>
                <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" /> ON DUTY
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-200 font-semibold">
                  {assignedGate?.name || officerProfile?.assignedGateId?.name || 'Gate Terminal'}
                </span>
                <span className="text-slate-500">({assignedGate?.code || 'GATE-MAIN'})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right text-xs">
              <div className="font-bold text-slate-200">{user?.fullName || 'Gate Officer'}</div>
              <div className="text-[11px] text-slate-400 font-mono">Badge: {officerProfile?.badgeNumber || 'SEC-101'}</div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Scanner Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>

      {/* Bottom Sticky Mobile Tactical Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 z-40 shadow-2xl">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
          <Link
            to="/scanner"
            className={`flex flex-col items-center justify-center py-2 rounded-xl text-xs font-semibold transition ${
              isActive('/scanner') || isActive('/scanner/scan')
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-5 h-5 mb-1" />
            <span>QR Scanner</span>
          </Link>

          <Link
            to="/scanner/history"
            className={`flex flex-col items-center justify-center py-2 rounded-xl text-xs font-semibold transition ${
              isActive('/scanner/history')
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-5 h-5 mb-1" />
            <span>Shift Scans</span>
          </Link>

          <Link
            to="/scanner/profile"
            className={`flex flex-col items-center justify-center py-2 rounded-xl text-xs font-semibold transition ${
              isActive('/scanner/profile')
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-5 h-5 mb-1" />
            <span>Officer Info</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};
export default OfficerLayout;
