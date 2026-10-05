import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Car,
  User,
  Building,
  Calendar,
  AlertCircle,
  Check,
  X,
  FileText,
  Search,
} from 'lucide-react';

export const PendingApprovals = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [rejectingVehicle, setRejectingVehicle] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles/pending');
      setVehicles(res.data.vehicles || []);
    } catch (err) {
      console.error('Failed to load pending queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vehicleId, plate) => {
    setActionLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      await api.post(`/vehicles/${vehicleId}/approve`, {});
      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      setFeedback({ type: 'success', message: `Vehicle ${plate} approved! Digital QR Pass generated.` });
      setSelectedVehicle(null);
      await fetchPending();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Approval failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      return setFeedback({ type: 'error', message: 'A rejection reason is required.' });
    }
    setActionLoading(true);
    try {
      await api.post(`/vehicles/${rejectingVehicle._id}/reject`, { reason: rejectionReason });
      setFeedback({ type: 'success', message: `Vehicle ${rejectingVehicle.registrationNumber} has been rejected.` });
      setRejectingVehicle(null);
      setRejectionReason('');
      await fetchPending();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Rejection failed' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-600" />
            Pending Vehicle Approvals
          </h1>
          <p className="text-xs text-slate-500">
            Review submitted vehicle registrations and authorize digital QR passes for campus gate access.
          </p>
        </div>

        <div className="bg-purple-50 text-purple-800 px-3.5 py-1.5 rounded-xl border border-purple-200 text-xs font-bold self-start sm:self-auto">
          {vehicles.length} Application{vehicles.length === 1 ? '' : 's'} Pending
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

      {/* Pending Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading pending requests...</div>
        ) : vehicles.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400 space-y-3">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-80" />
            <div className="font-bold text-slate-700 text-sm">Review Queue Empty</div>
            <p className="text-slate-400 max-w-sm mx-auto">
              All vehicle registrations have been processed. New submissions will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">User Type</th>
                  <th className="py-3.5 px-4">License Plate</th>
                  <th className="py-3.5 px-4">Vehicle Details</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{v.ownerId?.fullName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{v.ownerId?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={v.ownerId?.role} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 text-sm">
                      {v.registrationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{v.make} {v.model}</div>
                      <div className="text-[10px] text-slate-400">{v.colour} &bull; {v.vehicleType}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={v.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedVehicle(v)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => handleApprove(v._id, v.registrationNumber)}
                          disabled={actionLoading}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => setRejectingVehicle(v)}
                          disabled={actionLoading}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] border border-rose-200 transition flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Car className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-lg text-slate-900">Vehicle Application Review</h3>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-900 text-white p-4 rounded-2xl text-center space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">License Plate</div>
                <div className="text-3xl font-extrabold font-mono text-amber-400 tracking-wider">
                  {selectedVehicle.registrationNumber}
                </div>
                <div className="text-xs text-slate-300">
                  {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.colour})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400">Applicant:</span>
                  <div className="font-bold text-slate-900">{selectedVehicle.ownerId?.fullName}</div>
                </div>
                <div>
                  <span className="text-slate-400">Role:</span>
                  <div><StatusBadge status={selectedVehicle.ownerId?.role} size="sm" /></div>
                </div>
                <div>
                  <span className="text-slate-400">ID / Ref:</span>
                  <div className="font-semibold text-slate-800">{selectedVehicle.ownerId?.idNumber || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Phone:</span>
                  <div className="font-semibold text-slate-800">{selectedVehicle.ownerId?.phone}</div>
                </div>
                {selectedVehicle.ownerId?.department && (
                  <div className="col-span-2">
                    <span className="text-slate-400">Department:</span>
                    <div className="font-semibold text-slate-800">{selectedVehicle.ownerId?.department}</div>
                  </div>
                )}
                {selectedVehicle.ownerId?.visitorPurpose && (
                  <div className="col-span-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    <strong className="text-amber-900">Visit Purpose:</strong>
                    <p className="text-amber-800 mt-0.5">{selectedVehicle.ownerId?.visitorPurpose}</p>
                    {selectedVehicle.ownerId?.visitorHost && (
                      <div className="text-amber-700 text-[11px] mt-1">Host: {selectedVehicle.ownerId?.visitorHost}</div>
                    )}
                  </div>
                )}
                {selectedVehicle.notes && (
                  <div className="col-span-2">
                    <span className="text-slate-400">Special Notes:</span>
                    <p className="text-slate-700">{selectedVehicle.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setRejectingVehicle(selectedVehicle);
                  setSelectedVehicle(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 font-semibold text-xs border border-rose-200 hover:bg-rose-100 transition"
              >
                Reject Application
              </button>
              <button
                onClick={() => handleApprove(selectedVehicle._id, selectedVehicle.registrationNumber)}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                Approve & Generate QR Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleReject}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                Reject Vehicle: {rejectingVehicle.registrationNumber}
              </h3>
              <button
                type="button"
                onClick={() => setRejectingVehicle(null)}
                className="p-1 rounded-full text-slate-400"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Please specify a clear justification for rejecting this vehicle registration. The applicant will see this reason on their dashboard.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Reason for Rejection *</label>
              <textarea
                required
                rows="3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Missing valid insurance document, license plate format mismatch, or vehicle unauthorized..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectingVehicle(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition shadow"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default PendingApprovals;
