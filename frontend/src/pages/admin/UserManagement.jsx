import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Power,
} from 'lucide-react';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: 'Password123!',
    role: 'STUDENT',
    idNumber: '',
    department: '',
    visitorPurpose: '',
    visitorHost: '',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', {
        params: {
          role: roleFilter,
          search: search.trim() || undefined,
        },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleStatusToggle = async (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/users/${user._id}/status`, { status: nextStatus });
      setFeedback({ type: 'success', message: `User ${user.fullName} is now ${nextStatus}.` });
      await fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update user status' });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/users', newUser);
      setFeedback({ type: 'success', message: `User ${newUser.fullName} created successfully!` });
      setShowAddModal(false);
      setNewUser({
        fullName: '',
        email: '',
        phone: '',
        password: 'Password123!',
        role: 'STUDENT',
        idNumber: '',
        department: '',
        visitorPurpose: '',
        visitorHost: '',
      });
      await fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create user' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            University User Directory
          </h1>
          <p className="text-xs text-slate-500">
            Manage students, faculty/staff, visitors, gate security officers, and administrator privileges.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> Add New User
          </button>
        </div>
      </div>

      {feedback.message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by full name, email, department, or ID..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 w-full sm:w-auto"
        >
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="STAFF">Faculty / Staff</option>
          <option value="VISITOR">Visitors</option>
          <option value="GATE_OFFICER">Gate Officers</option>
          <option value="ADMIN">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading user accounts...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">ID / Reference</th>
                  <th className="py-3.5 px-4">Department / Purpose</th>
                  <th className="py-3.5 px-4">Vehicles</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-[10px] text-slate-400">{u.email} &bull; {u.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.role} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {u.idNumber || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.department || u.visitorPurpose || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {u.vehiclesCount || 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleStatusToggle(u)}
                          className={`p-1.5 rounded-lg border text-[11px] font-semibold transition ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title={u.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add New User</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2 space-y-1">
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="STUDENT">Student</option>
                  <option value="STAFF">Faculty / Staff</option>
                  <option value="VISITOR">Visitor</option>
                  <option value="GATE_OFFICER">Gate Officer</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">ID Number</label>
                <input
                  type="text"
                  value={newUser.idNumber}
                  onChange={(e) => setNewUser({ ...newUser, idNumber: e.target.value })}
                  placeholder="e.g. STU-2026-XXXX"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="font-semibold text-slate-700">Department / Office</label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-600 transition shadow"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default UserManagement;
