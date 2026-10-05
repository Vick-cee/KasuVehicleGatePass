import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { PassCard } from '../../components/PassCard';
import {
  Car,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  QrCode,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedPassVehicle, setSelectedPassVehicle] = useState(null);
  const [suspendingVehicle, setSuspendingVehicle] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchVehicles();
  }, [statusFilter, typeFilter]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles/all', {
        params: {
          status: statusFilter,
          vehicleType: typeFilter,
          search: search.trim() || undefined,
        },
      });
      setVehicles(res.data.vehicles || []);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVehicles();
  };

  const handleSuspend = async (e) => {
    e.preventDefault();
    if (!suspensionReason.trim()) {
      return setFeedback({ type: 'error', message: 'A suspension reason is required.' });
    }
    setActionLoading(true);
    try {
      await api.post(`/vehicles/${suspendingVehicle._id}/suspend`, { reason: suspensionReason });
      setFeedback({ type: 'success', message: `Pass for ${suspendingVehicle.registrationNumber} suspended.` });
      setSuspendingVehicle(null);
      setSuspensionReason('');
      await fetchVehicles();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Suspension failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (vehicle) => {
    setActionLoading(true);
    try {
      await api.post(`/vehicles/${vehicle._id}/reactivate`, {});
      setFeedback({ type: 'success', message: `Pass for ${vehicle.registrationNumber} reactivated!` });
      await fetchVehicles();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Reactivation failed' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Car className="w-6 h-6 text-purple-600" />
            Registered Vehicles Directory
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive registry of all university registered vehicles, pass statuses, and suspension controls.
          </p>
        </div>

        <button
          onClick={fetchVehicles}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
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

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search license plate, make, model, or driver name..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="ALL">All Vehicle Types</option>
            <option value="CAR">Passenger Car</option>
            <option value="MOTORCYCLE">Motorcycle</option>
            <option value="VAN">Van</option>
            <option value="BICYCLE_ESCOOTER">Bicycle/Scooter</option>
            <option value="DELIVERY_TRUCK">Delivery Truck</option>
          </select>
        </div>
      </div>

      {/* Vehicle Registry Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading vehicle registry...</div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No vehicles match the selected criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">License Plate</th>
                  <th className="py-3.5 px-4">Make & Model</th>
                  <th className="py-3.5 px-4">Owner / Category</th>
                  <th className="py-3.5 px-4">Pass Number</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Pass Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 text-sm">
                      {v.registrationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{v.make} {v.model}</div>
                      <div className="text-[10px] text-slate-400">{v.colour} &bull; {v.vehicleType}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{v.ownerId?.fullName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">{v.ownerId?.role} &bull; {v.ownerId?.department || v.ownerId?.idNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {v.pass?.passNumber || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={v.pass?.status || v.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {v.pass && (
                          <button
                            onClick={() => setSelectedPassVehicle(v)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-900 font-semibold text-[11px] hover:bg-blue-100 transition flex items-center gap-1"
                          >
                            <QrCode className="w-3.5 h-3.5" /> View QR
                          </button>
                        )}

                        {v.status === 'APPROVED' && v.pass?.status === 'ACTIVE' && (
                          <button
                            onClick={() => setSuspendingVehicle(v)}
                            className="px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-700 font-semibold text-[11px] hover:bg-orange-100 transition flex items-center gap-1"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" /> Suspend
                          </button>
                        )}

                        {v.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleReactivate(v)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-[11px] hover:bg-emerald-100 transition flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Pass Modal */}
      {selectedPassVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-xl w-full">
            <button
              onClick={() => setSelectedPassVehicle(null)}
              className="absolute right-3 top-3 z-10 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900"
            >
              &times;
            </button>
            <PassCard
              pass={selectedPassVehicle.pass}
              vehicle={selectedPassVehicle}
              owner={selectedPassVehicle.ownerId}
            />
          </div>
        </div>
      )}

      {/* Suspend Pass Modal */}
      {suspendingVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSuspend}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                Suspend Pass: {suspendingVehicle.registrationNumber}
              </h3>
              <button
                type="button"
                onClick={() => setSuspendingVehicle(null)}
                className="p-1 rounded-full text-slate-400"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Pass suspension will immediately block gate entry at all terminals with a "PASS SUSPENDED" alert.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Reason for Suspension *</label>
              <textarea
                required
                rows="3"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="e.g. Unpaid parking citations, reckless speeding, or temporary security hold..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSuspendingVehicle(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-500 transition shadow"
              >
                Confirm Suspension
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default VehicleManagement;
