import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock,
  Building,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  UserCheck,
} from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('STUDENT'); // 'STUDENT' (User) | 'STAFF' | 'VISITOR'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    idNumber: '',
    department: '',
    visitorPurpose: '',
    visitorHost: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match. Please re-enter your password.');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    setLoading(true);
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role,
        idNumber: formData.idNumber.trim(),
        department: formData.department.trim(),
        visitorPurpose: formData.visitorPurpose.trim(),
        visitorHost: formData.visitorHost.trim(),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Brand Header with Official KASU Crest */}
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
            Create KASU Vehicle Pass Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Kaduna State University &bull; Vehicle Gate Pass Verification & Clearance Portal
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Single Unified Registration Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Account Category Selection Section */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-kasu-green-700" />
              1. Select Registration Type *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Student / User */}
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`p-3.5 rounded-2xl text-left border transition flex flex-col justify-between gap-1.5 ${
                  role === 'STUDENT'
                    ? 'bg-kasu-green-50 border-kasu-green-600 ring-2 ring-kasu-green-600/30'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <GraduationCap
                    className={`w-5 h-5 ${role === 'STUDENT' ? 'text-kasu-green-700' : 'text-slate-500'}`}
                  />
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      role === 'STUDENT' ? 'border-kasu-green-700 bg-kasu-green-700' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {role === 'STUDENT' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Student (User)</div>
                  <div className="text-[10px] text-slate-500">KASU Student Commuters</div>
                </div>
              </button>

              {/* Option 2: Staff */}
              <button
                type="button"
                onClick={() => setRole('STAFF')}
                className={`p-3.5 rounded-2xl text-left border transition flex flex-col justify-between gap-1.5 ${
                  role === 'STAFF'
                    ? 'bg-kasu-red-50 border-kasu-red-700 ring-2 ring-kasu-red-700/30'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Briefcase
                    className={`w-5 h-5 ${role === 'STAFF' ? 'text-kasu-red-700' : 'text-slate-500'}`}
                  />
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      role === 'STAFF' ? 'border-kasu-red-700 bg-kasu-red-700' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {role === 'STAFF' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Faculty / Staff</div>
                  <div className="text-[10px] text-slate-500">University Employees</div>
                </div>
              </button>

              {/* Option 3: Visitor */}
              <button
                type="button"
                onClick={() => setRole('VISITOR')}
                className={`p-3.5 rounded-2xl text-left border transition flex flex-col justify-between gap-1.5 ${
                  role === 'VISITOR'
                    ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-600/30'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <User
                    className={`w-5 h-5 ${role === 'VISITOR' ? 'text-amber-700' : 'text-slate-500'}`}
                  />
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      role === 'VISITOR' ? 'border-amber-600 bg-amber-600' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {role === 'VISITOR' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Visitor / Guest</div>
                  <div className="text-[10px] text-slate-500">Guest Pass & Contractors</div>
                </div>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
              2. Personal & Profile Details
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Ibrahim Abubakar"
                    className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-kasu-green-600 bg-slate-50 focus:bg-white transition text-slate-900 font-medium"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={
                      role === 'STUDENT'
                        ? 'student@student.kasu.edu.ng'
                        : role === 'STAFF'
                        ? 'staff@kasu.edu.ng'
                        : 'visitor@gmail.com'
                    }
                    className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-kasu-green-600 bg-slate-50 focus:bg-white transition text-slate-900 font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+234 (0) 800 000 0000"
                    className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-kasu-green-600 bg-slate-50 focus:bg-white transition text-slate-900 font-medium"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Dynamic Student Fields */}
              {role === 'STUDENT' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Matric / Student ID Number *</label>
                    <input
                      type="text"
                      name="idNumber"
                      required
                      value={formData.idNumber}
                      onChange={handleChange}
                      placeholder="e.g. KASU/24/CSC/1042"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-kasu-green-600 bg-slate-50 focus:bg-white transition text-slate-900 font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Faculty / Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Science / Computer Science"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-kasu-green-600 bg-slate-50 focus:bg-white transition text-slate-900 font-medium"
                    />
                  </div>
                </>
              )}

              {/* Dynamic Staff Fields */}
              {role === 'STAFF' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Staff / File No. *</label>
                    <input
                      type="text"
                      name="idNumber"
                      required
                      value={formData.idNumber}
                      onChange={handleChange}
                      placeholder="e.g. KASU/STF/2018/092"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-kasu-red-700 bg-slate-50 focus:bg-white transition text-slate-900 font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Department / Office</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Faculty of Science / Bursary"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-kasu-red-700 bg-slate-50 focus:bg-white transition text-slate-900 font-medium"
                    />
                  </div>
                </>
              )}

              {/* Dynamic Visitor Fields */}
              {role === 'VISITOR' && (
                <>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Purpose of Visit *</label>
                    <input
                      type="text"
                      name="visitorPurpose"
                      required
                      value={formData.visitorPurpose}
                      onChange={handleChange}
                      placeholder="e.g. Official Meeting / Delivery / Contractor / Guest Lecture"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 bg-slate-50 focus:bg-white transition text-slate-900 font-medium"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Host Department / Person Being Visited</label>
                    <input
                      type="text"
                      name="visitorHost"
                      value={formData.visitorHost}
                      onChange={handleChange}
                      placeholder="e.g. Dean of Science / Vice Chancellor's Office"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 bg-slate-50 focus:bg-white transition text-slate-900 font-medium"
                    />
                  </div>
                </>
              )}

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Create Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-kasu-green-600 bg-slate-50 focus:bg-white transition text-slate-900 font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Confirm Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-kasu-green-600 bg-slate-50 focus:bg-white transition text-slate-900 font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-kasu-red-800 to-kasu-red-700 hover:from-kasu-red-700 hover:to-kasu-red-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 border border-kasu-red-600 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Complete Account Registration'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 text-center text-xs text-slate-600 border-t border-slate-200">
          Already registered?{' '}
          <Link to="/login" className="text-kasu-red-800 font-black hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Register;
