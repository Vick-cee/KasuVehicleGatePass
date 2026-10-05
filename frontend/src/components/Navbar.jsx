import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Car,
  QrCode,
  LayoutDashboard,
  History,
  PlusCircle,
  LogOut,
  User,
  Menu,
  X,
  Lock,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isGateOfficer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20">
          {/* Brand / Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md border border-slate-200 group-hover:scale-105 transition">
                <img
                  src="/kasu-logo.png"
                  alt="Kaduna State University Crest Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <div className="font-black text-slate-900 text-base sm:text-lg leading-tight tracking-tight flex items-center gap-2">
                  KADUNA STATE UNIVERSITY
                  <span className="text-[10px] bg-kasu-red-100 text-kasu-red-800 border border-kasu-red-200 font-black px-2 py-0.5 rounded-full tracking-wider">
                    KASU
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-semibold tracking-wide">
                  Vehicle Gate Pass Verification System
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links - Only shown when NOT authenticated as requested */}
            {!isAuthenticated && (
              <div className="hidden md:flex md:ml-8 md:space-x-2">
                <Link
                  to="/"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    isActive('/')
                      ? 'text-kasu-red-800 bg-kasu-red-50 border border-kasu-red-200 shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    isActive('/about')
                      ? 'text-kasu-red-800 bg-kasu-red-50 border border-kasu-red-200 shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  KASU Gates & Rules
                </Link>
              </div>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Show Scanner ONLY to Gate Officers and Admins */}
            {(isGateOfficer || isAdmin) && (
              <Link
                to="/scanner"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-kasu-green-50 text-kasu-green-800 border border-kasu-green-300 hover:bg-kasu-green-100 transition shadow-xs"
                title="Gate Officer Mobile QR Scanner View"
              >
                <QrCode className="w-3.5 h-3.5 text-kasu-green-700" />
                Officer Scanner
              </Link>
            )}

            {/* Show Admin Portal ONLY to Administrators */}
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-kasu-red-50 text-kasu-red-800 border border-kasu-red-300 hover:bg-kasu-red-100 transition shadow-xs"
                title="Administrative Security Console"
              >
                <Lock className="w-3.5 h-3.5 text-kasu-red-700" />
                Admin Console
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-bold transition"
                  title="View User Profile"
                >
                  <div className="w-6 h-6 rounded-full bg-kasu-red-800 text-white flex items-center justify-center text-[10px] font-black shadow-inner">
                    {user.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[140px] truncate">{user.fullName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4.5 py-2 rounded-xl text-xs font-black bg-kasu-red-800 hover:bg-kasu-red-900 text-white shadow-md transition"
                >
                  Register Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {!isAuthenticated && (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100"
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100"
              >
                KASU Gates & Rules
              </Link>
            </>
          )}
          {isAuthenticated && (
            <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-kasu-red-800 text-white flex items-center justify-center text-xs font-black shadow-inner">
                {user.fullName?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 truncate">{user.fullName}</div>
                <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            {/* Show Scanner ONLY if Officer or Admin */}
            {(isGateOfficer || isAdmin) && (
              <Link
                to="/scanner"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-3 rounded-xl text-xs font-black bg-kasu-green-800 text-white shadow"
              >
                Gate Officer Mobile Scanner
              </Link>
            )}

            {/* Show Admin ONLY if Admin */}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-3 rounded-xl text-xs font-black bg-kasu-red-800 text-white shadow"
              >
                Admin Security Console
              </Link>
            )}

            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-center px-4 py-3 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200"
              >
                Sign Out ({user.fullName})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-3 py-3 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-3 py-3 rounded-xl text-xs font-black bg-kasu-red-800 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
