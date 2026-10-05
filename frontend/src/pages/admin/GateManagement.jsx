import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Shield,
  PlusCircle,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Users,
  TrendingUp,
} from 'lucide-react';

export const GateManagement = () => {
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGate, setEditingGate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    status: 'ACTIVE',
    description: '',
    operatingHours: '24/7',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchGates();
  }, []);

  const fetchGates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gates');
      setGates(res.data.gates || []);
    } catch (err) {
      console.error('Failed to load gates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingGate(null);
    setFormData({
      name: '',
      code: '',
      location: '',
      status: 'ACTIVE',
      description: '',
      operatingHours: '24/7',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (gate) => {
    setEditingGate(gate);
    setFormData({
      name: gate.name,
      code: gate.code,
      location: gate.location,
      status: gate.status,
      description: gate.description || '',
      operatingHours: gate.operatingHours || '24/7',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingGate) {
        await api.put(`/gates/${editingGate._id}`, formData);
        setFeedback({ type: 'success', message: `Gate '${formData.name}' updated successfully.` });
      } else {
        await api.post('/gates', formData);
        setFeedback({ type: 'success', message: `Gate '${formData.name}' created successfully.` });
      }
      setShowModal(false);
      await fetchGates();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            Campus Gate Checkpoints
          </h1>
          <p className="text-xs text-slate-500">
            Create, configure, and manage university entrance gates and terminal locations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Add Campus Gate
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

      {/* Gate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gates.map((gate) => (
          <div
            key={gate._id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{gate.name}</h3>
                    <div className="text-xs font-mono text-purple-700 font-bold">{gate.code}</div>
                  </div>
                </div>
                <StatusBadge status={gate.status} size="sm" />
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {gate.description || 'Designated campus perimeter checkpoint.'}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Location:</span>
                  <div className="font-semibold text-slate-800 truncate">{gate.location}</div>
                </div>
                <div>
                  <span className="text-slate-400">Hours:</span>
                  <div className="font-semibold text-slate-800">{gate.operatingHours || '24/7'}</div>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>On-Duty Officers: <strong>{gate.activeOfficersCount || 0}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Today's Scans: <strong>{gate.todayScansCount || 0}</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => handleOpenEdit(gate)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Configuration
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Gate Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingGate ? `Edit Gate: ${editingGate.name}` : 'Create New Gate Checkpoint'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Gate Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. West Campus Gate"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Gate Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. GATE-WEST"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Physical Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. West Campus Expressway & 4th Ave"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Operating Hours</label>
                  <input
                    type="text"
                    value={formData.operatingHours}
                    onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                    placeholder="e.g. 24/7 or 06:00 - 23:00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description / Access Scope</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Dedicated gate for athletics and science delivery trucks..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-600 transition shadow"
              >
                {editingGate ? 'Save Changes' : 'Create Gate'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default GateManagement;
