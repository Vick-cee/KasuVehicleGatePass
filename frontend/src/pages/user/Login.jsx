import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles, AlertCircle, Car, UserCheck } from 'lucide-react';

export const Login = () => {
  const { login, quickLoginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectAfterLogin = (role) => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'GATE_OFFICER') navigate('/scanner');
    else navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      redirectAfterLogin(user.role);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoUser) => {
    setError('');
    setLoading(true);
    try {
      const user = await quickLoginAs(demoUser.email);
      redirectAfterLogin(user.role);
    } catch (err) {
      setError(err.message || 'Failed to login with demo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex p-2 rounded-2xl bg-white shadow-md border border-slate-200 mx-auto">
          <img
            src="/kasu-logo.png"
            alt="Kaduna State University Logo"
            className="w-16 h-16 object-contain"
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign In to KASU Pass
          </h1>
          <p className="text-xs text-slate-600">
            Kaduna State University &bull; Vehicle Gate Pass Portal
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">University / Personal Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@student.kasu.edu.ng"
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-kasu-green-600 bg-slate-50 focus:bg-white transition text-slate-900"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-kasu-red-800 font-bold hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-kasu-green-600 bg-slate-50 focus:bg-white transition text-slate-900"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-kasu-red-800 to-kasu-red-700 hover:from-kasu-red-700 hover:to-kasu-red-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 border border-kasu-red-600 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="pt-3 text-center text-xs text-slate-600 border-t border-slate-200">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-kasu-red-800 font-black hover:underline">
            Register Account
          </Link>
        </div>
      </div>

      {/* 1-Click Fast Persona Switcher */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Quick Demo One-Click Sign In</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Test distinct role dashboards with pre-seeded accounts:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEMO_USERS.map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => handleQuickDemo(demo)}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition shadow-xs flex flex-col justify-between group"
            >
              <span className="font-bold text-xs text-slate-900 group-hover:text-kasu-red-800 truncate">
                {demo.label}
              </span>
              <span className="text-[10px] text-slate-500 font-mono truncate">{demo.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Login;
