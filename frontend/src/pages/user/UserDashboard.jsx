import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { PassCard } from '../../components/PassCard';
import {
  Car,
  QrCode,
  Clock,
  CheckCircle2,
  PlusCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Printer,
  History,
  Info,
} from 'lucide-react';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPassVehicle, setSelectedPassVehicle] = useState(null);

  const MAX_VEHICLES = 3;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [vehRes, actRes] = await Promise.all([
        api.get('/vehicles/my-vehicles'),
        api.get('/scan/user-activity'),
      ]);
      setVehicles(vehRes.data.vehicles || []);
      setActivities(actRes.data.logs || []);
    } catch (err) {
      console.error('Failed to load user dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const activePassCount = vehicles.filter((v) => v.status === 'APPROVED' && v.pass?.status === 'ACTIVE').length;
  const pendingCount = vehicles.filter((v) => v.status === 'PENDING').length;
  const isLimitReached = vehicles.length >= MAX_VEHICLES;

  return (
    <div className="space-y-8 py-2">
      {/* Welcome Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome, {user?.fullName}
            </h1>
            <StatusBadge status={user?.role} size="sm" />
          </div>
          <p className="text-xs text-slate-600 flex flex-wrap items-center gap-3 font-medium">
            <span>Email: <strong className="text-slate-900 font-mono">{user?.email}</strong></span>
            {user?.idNumber && <span>ID: <strong className="text-slate-900 font-mono">{user.idNumber}</strong></span>}
            {user?.department && <span>Faculty/Dept: <strong className="text-slate-900">{user.department}</strong></span>}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
          {isLimitReached ? (
            <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-700" />
              <span>Vehicle Quota Full (3/3 Registered)</span>
            </div>
          ) : (
            <Link
              to="/vehicles/register"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-kasu-red-800 hover:bg-kasu-red-900 text-white font-bold text-xs shadow-md transition"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              Register New Vehicle ({vehicles.length}/3)
            </Link>
          )}
          <span className="text-[11px] text-slate-500 font-semibold">
            KASU policy limits up to 3 vehicles per user account.
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Registered Vehicles</span>
            <Car className="w-4 h-4 text-kasu-red-800" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {vehicles.length} <span className="text-xs text-slate-500 font-normal">/ {MAX_VEHICLES} max</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${vehicles.length >= 3 ? 'bg-amber-600' : 'bg-kasu-green-700'}`}
              style={{ width: `${(vehicles.length / MAX_VEHICLES) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active QR Passes</span>
            <CheckCircle2 className="w-4 h-4 text-kasu-green-700" />
          </div>
          <div className="text-3xl font-black text-kasu-green-800">{activePassCount}</div>
          <div className="text-xs text-slate-500 font-medium">Ready for Gate Entry & Exit</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-3xl font-black text-amber-800">{pendingCount}</div>
          <div className="text-xs text-slate-500 font-medium">Under Security Review</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Gate Movements</span>
            <History className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-3xl font-black text-slate-900">{activities.length}</div>
          <div className="text-xs text-slate-500 font-medium">Logged Entries & Exits</div>
        </div>
      </div>

      {/* Main Grid: My Vehicles + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Vehicles List (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-kasu-red-800" />
              My Registered Vehicles ({vehicles.length}/3)
            </h2>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
              {3 - vehicles.length} slots available
            </span>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 font-medium">
              Loading your vehicle passes...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-kasu-red-50 text-kasu-red-800 flex items-center justify-center mx-auto border border-kasu-red-100">
                <Car className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">No vehicles registered yet</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
                  You can register up to 3 personal or university vehicles to obtain official digital gate passes.
                </p>
              </div>
              <Link
                to="/vehicles/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-kasu-red-800 text-white font-bold text-xs hover:bg-kasu-red-900 transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" /> Register Vehicle Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.map((v) => (
                <div
                  key={v._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-slate-300 transition shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-kasu-red-50 border border-kasu-red-100 flex items-center justify-center text-kasu-red-800">
                        <Car className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 tracking-wider">
                            {v.registrationNumber}
                          </span>
                          <StatusBadge status={v.status} size="sm" />
                        </div>
                        <div className="text-xs text-slate-600 font-semibold mt-1">
                          {v.make} {v.model} &bull; {v.colour} &bull; {v.vehicleType}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {v.pass && v.pass.status === 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => setSelectedPassVehicle(v)}
                          className="px-3.5 py-2 rounded-xl bg-kasu-green-800 text-white hover:bg-kasu-green-900 font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                        >
                          <QrCode className="w-3.5 h-3.5" /> View Digital QR Pass
                        </button>
                      )}
                      <Link
                        to={`/pass/${v.pass?._id || v._id}`}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                        title="Pass Details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Pass Details Sub-row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 text-[10px] block font-bold uppercase tracking-wider">Pass Status</span>
                      <span className="font-bold text-slate-800">
                        {v.pass ? <StatusBadge status={v.pass.status} size="sm" /> : 'Not Issued'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-bold uppercase tracking-wider">Campus Location</span>
                      <span className="font-bold text-slate-800">
                        <StatusBadge status={v.pass?.campusStatus || 'OUTSIDE'} size="sm" />
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-bold uppercase tracking-wider">Pass Expiry</span>
                      <span className="font-bold text-slate-800">
                        {v.pass ? new Date(v.pass.expiresAt).toLocaleDateString() : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-bold uppercase tracking-wider">Registered On</span>
                      <span className="font-bold text-slate-800">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {v.rejectionReason && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-700" />
                      <span>Rejection Reason: {v.rejectionReason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-kasu-green-800" />
              Recent Gate Movements
            </h2>
            <Link to="/activity" className="text-xs text-kasu-red-800 hover:text-kasu-red-900 hover:underline font-bold">
              View All
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3 shadow-xs">
            {activities.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-medium">
                No gate movements recorded yet.
              </div>
            ) : (
              activities.slice(0, 5).map((act) => (
                <div
                  key={act._id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {act.licensePlate}
                    </span>
                    <StatusBadge status={act.direction === 'ENTRY' ? 'CHECKED_IN' : 'CHECKED_OUT'} size="sm" />
                  </div>
                  <div className="text-[11px] text-slate-600 font-semibold flex items-center justify-between">
                    <span>{act.gateId?.name || (act.direction === 'ENTRY' ? 'KASU Main Entry Gate' : 'KASU Main Exit Gate')}</span>
                    <span>{new Date(act.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Digital Pass Modal */}
      {selectedPassVehicle && selectedPassVehicle.pass && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative my-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Digital Vehicle Access Pass</h3>
              <button
                type="button"
                onClick={() => setSelectedPassVehicle(null)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 border border-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <PassCard pass={selectedPassVehicle.pass} vehicle={selectedPassVehicle} owner={user} />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPassVehicle(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-kasu-green-800 hover:bg-kasu-green-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print / Save Badge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserDashboard;
