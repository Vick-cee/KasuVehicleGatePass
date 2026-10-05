import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Sparkles, ChevronDown, Shield, Car, QrCode, LogOut } from 'lucide-react';

export const DemoQuickBar = () => {
  const { user, quickLoginAs, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const navigate = useNavigate();

  const handleSwitch = async (demoUser) => {
    setSwitching(true);
    try {
      const loggedUser = await quickLoginAs(demoUser.email);
      setIsOpen(false);
      // Navigate to appropriate section based on role
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin');
      } else if (loggedUser.role === 'GATE_OFFICER') {
        navigate('/scanner');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Quick switch failed:', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-1.5 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Interactive Demo Testing:
          </span>
          <span className="text-slate-400 hidden sm:inline">1-Click role switch to test complete end-to-end workflow</span>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-300">
                Logged in as: <strong className="text-emerald-400 font-medium">{user.fullName}</strong> ({user.role})
              </span>
              <button
                onClick={logout}
                className="text-slate-400 hover:text-rose-400 p-1 rounded transition flex items-center gap-1"
                title="Log out"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <span className="text-slate-400 italic">Not logged in</span>
          )}

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              disabled={switching}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-2.5 py-1 rounded flex items-center gap-1.5 shadow transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{switching ? 'Switching...' : 'Switch Demo Role'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Select Demo Persona
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {DEMO_USERS.map((demo) => (
                    <button
                      key={demo.email}
                      onClick={() => handleSwitch(demo)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between transition group"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 flex items-center gap-1.5">
                          {demo.role === 'ADMIN' && <Shield className="w-3.5 h-3.5 text-purple-600" />}
                          {demo.role === 'GATE_OFFICER' && <QrCode className="w-3.5 h-3.5 text-blue-600" />}
                          {['STUDENT', 'STAFF', 'VISITOR'].includes(demo.role) && <Car className="w-3.5 h-3.5 text-emerald-600" />}
                          {demo.label}
                        </div>
                        <div className="text-[11px] text-slate-500">{demo.email}</div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${demo.color}`}>
                        {demo.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DemoQuickBar;
