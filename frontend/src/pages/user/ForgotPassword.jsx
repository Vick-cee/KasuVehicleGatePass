import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ShieldCheck, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center mx-auto shadow-lg">
          <ShieldCheck className="w-7 h-7 text-blue-200" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Reset Password</h1>
        <p className="text-xs text-slate-500">
          Enter your registered email address to receive pass recovery credentials.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Account Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Sending Instructions...' : 'Send Password Reset Link'}
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-900 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
