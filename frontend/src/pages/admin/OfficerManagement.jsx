import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import {
  QrCode,
  UserPlus,
  Shield,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Radio,
} from 'lucide-react';

export const OfficerManagement = () => {
  const [officers, setOfficers] = useState([]);
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [assigningOfficer, setAssigningOfficer] = useState(null);
  const [newOfficer, setNewOfficer] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: 'Password123!',
    badgeNumber: '',
    assignedGateId: '',
    shift: 'MORNING',
  });
  const [assignData, setAssignData] = useState({
    gateId: '',
    shift: 'MORNING',
    status: 'ON_DUTY',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [offRes, gateRes] = await Promise.all([
        api.get('/gates/officers'),
        api.get('/gates'),
      ]);
      setOfficers(offRes.data.officers || []);
      setGates(gateRes.data.gates || []);
    } catch (err) {
      console.error('Failed to load officers/gates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/gates/officers', newOfficer);
      setFeedback({ type: 'success', message: `Gate Officer ${newOfficer.fullName} registered successfully!` });
      setShowAddModal(false);
      setNewOfficer({
        fullName: '',
        email: '',
        phone: '',
        password: 'Password123!',
        badgeNumber: '',
        assignedGateId: '',
        shift: 'MORNING',
      });
      await fetchData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create officer' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAssign = (officer) => {
    setAssigningOfficer(officer);
    setAssignData({
      gateId: officer.assignedGateId?._id || '',
      shift: officer.shift || 'MORNING',
      status: officer.status || 'ON_DUTY',
    });
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.put(`/gates/officers/${assigningOfficer._id}/assign`, {
        gateId: assignData.gateId || null,
        shift: assignData.shift,
        status: assignData.status,
      });
      setFeedback({ type: 'success', message: `Assignment updated for ${assigningOfficer.userId?.fullName}.` });
      setAssigningOfficer(null);
      await fetchData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update assignment' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-purple-600" />
            Gate Officers & Terminal Assignments
          </h1>
          <p className="text-xs text-slate-500">
            Authorize security personnel, manage badge credentials, and assign officers to specific gate terminals.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Register Gate Officer
        </button>
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

      {/* Officers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading gate officers...</div>
        ) : officers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No gate officers registered.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Badge Number</th>
                  <th className="py-3.5 px-4">Officer Name</th>
                  <th className="py-3.5 px-4">Assigned Gate</th>
                  <th className="py-3.5 px-4">Shift</th>
                  <th className="py-3.5 px-4">Duty Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {officers.map((off) => (
                  <tr key={off._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                      {off.badgeNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{off.userId?.fullName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">{off.userId?.email} &bull; {off.userId?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {off.assignedGateId ? (
                        <div>
                          <div className="font-semibold text-slate-900">{off.assignedGateId.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{off.assignedGateId.code}</div>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-medium italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {off.shift} SHIFT
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          off.status === 'ON_DUTY'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <Radio className="w-2.5 h-2.5" />
                        {off.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenAssign(off)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Reassign Gate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Officer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateOfficer}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Register Gate Security Officer</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newOfficer.fullName}
                  onChange={(e) => setNewOfficer({ ...newOfficer, fullName: e.target.value })}
                  placeholder="e.g. Officer James Wilson"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Badge Number *</label>
                  <input
                    type="text"
                    required
                    value={newOfficer.badgeNumber}
                    onChange={(e) => setNewOfficer({ ...newOfficer, badgeNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. SEC-105"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Shift *</label>
                  <select
                    value={newOfficer.shift}
                    onChange={(e) => setNewOfficer({ ...newOfficer, shift: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="MORNING">MORNING</option>
                    <option value="AFTERNOON">AFTERNOON</option>
                    <option value="NIGHT">NIGHT</option>
                    <option value="ROTATING">ROTATING</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Officer Email *</label>
                <input
                  type="email"
                  required
                  value={newOfficer.email}
                  onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                  placeholder="officer@university.edu"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newOfficer.phone}
                  onChange={(e) => setNewOfficer({ ...newOfficer, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Assigned Gate</label>
                <select
                  value={newOfficer.assignedGateId}
                  onChange={(e) => setNewOfficer({ ...newOfficer, assignedGateId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="">Select a Gate (Optional)...</option>
                  {gates.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name} ({g.code})
                    </option>
                  ))}
                </select>
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
                Register Officer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reassign Modal */}
      {assigningOfficer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveAssignment}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                Reassign: {assigningOfficer.userId?.fullName}
              </h3>
              <button
                type="button"
                onClick={() => setAssigningOfficer(null)}
                className="p-1 rounded-full text-slate-400"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Assigned Gate Terminal *</label>
                <select
                  value={assignData.gateId}
                  onChange={(e) => setAssignData({ ...assignData, gateId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="">Unassign from gate</option>
                  {gates.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name} ({g.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Assigned Shift</label>
                <select
                  value={assignData.shift}
                  onChange={(e) => setAssignData({ ...assignData, shift: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="MORNING">MORNING SHIFT</option>
                  <option value="AFTERNOON">AFTERNOON SHIFT</option>
                  <option value="NIGHT">NIGHT SHIFT</option>
                  <option value="ROTATING">ROTATING SHIFT</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Duty Status</label>
                <select
                  value={assignData.status}
                  onChange={(e) => setAssignData({ ...assignData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="ON_DUTY">ON DUTY</option>
                  <option value="OFF_DUTY">OFF DUTY</option>
                  <option value="ON_LEAVE">ON LEAVE</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAssigningOfficer(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-600 transition shadow"
              >
                Save Assignment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default OfficerManagement;
