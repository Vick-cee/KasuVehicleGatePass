import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { User, Mail, Phone, Building, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const UserProfile = () => {
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    department: user?.department || '',
    idNumber: user?.idNumber || '',
    visitorPurpose: user?.visitorPurpose || '',
    visitorHost: user?.visitorHost || '',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.put('/auth/profile', formData);
      await refreshUser();
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Account Profile & Settings</h1>
        <p className="text-xs text-slate-600 font-medium">Manage your Kaduna State University credentials and contact details.</p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-kasu-green-50 border border-kasu-green-200 text-kasu-green-900 text-xs flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 text-kasu-green-700 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-kasu-red-800 text-white flex items-center justify-center font-black text-lg shadow-inner">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="font-black text-slate-900 text-base">{user?.fullName}</div>
              <div className="text-xs text-slate-500 font-medium">{user?.email}</div>
            </div>
          </div>
          <StatusBadge status={user?.role} size="sm" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-kasu-red-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">Phone Number</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-kasu-red-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">ID Reference Number (Staff / Student Matric / Visitor ID)</label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-kasu-red-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">Department / Faculty / Unit</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-kasu-red-700"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-kasu-red-800 hover:bg-kasu-red-900 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UserProfile;
