import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Users,
  Car,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
  QrCode,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stats');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
        <span>Loading live system telemetry...</span>
      </div>
    );
  }

  const { stats, recentScans } = data;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Security & Transportation Command Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Real-time university gate metrics, pending vehicle applications, and perimeter clearance activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStats}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-xs"
            title="Refresh Stats"
          >
            <RefreshCw className="w-4 h-4 text-purple-600" />
          </button>
          <Link
            to="/admin/approvals"
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" /> Review Pending Queue ({stats.vehiclesBreakdown.pending})
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Users</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalUsers}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>Stu: <strong>{stats.usersBreakdown.students}</strong></span>
            <span>&bull;</span>
            <span>Staff: <strong>{stats.usersBreakdown.staff}</strong></span>
            <span>&bull;</span>
            <span>Vis: <strong>{stats.usersBreakdown.visitors}</strong></span>
          </div>
        </div>

        {/* Registered Vehicles */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle Registry</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalVehicles}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span className="text-emerald-600 font-semibold">{stats.vehiclesBreakdown.approved} Active</span>
            <span>&bull;</span>
            <span className="text-amber-600 font-semibold">{stats.vehiclesBreakdown.pending} Pending</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 bg-amber-50/20 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Pending Approvals</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">{stats.vehiclesBreakdown.pending}</div>
          <Link
            to="/admin/approvals"
            className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-1"
          >
            Open review queue <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Today's Traffic Movements */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Gate Traffic</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-900">{stats.todayTraffic.total}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span className="text-blue-600 font-bold flex items-center gap-0.5">
              <ArrowDownLeft className="w-3 h-3" /> {stats.todayTraffic.entries} In
            </span>
            <span>&bull;</span>
            <span className="text-purple-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> {stats.todayTraffic.exits} Out
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Active Campus Gates</div>
            <div className="text-lg font-bold text-slate-900">{stats.activeGates} Checkpoints Online</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Active Gate Officers</div>
            <div className="text-lg font-bold text-slate-900">{stats.activeOfficers} On Duty</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-900 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Restricted Passes</div>
            <div className="text-lg font-bold text-slate-900">
              {stats.vehiclesBreakdown.suspended + stats.vehiclesBreakdown.rejected} Suspended/Rejected
            </div>
          </div>
        </div>
      </div>

      {/* Live Gate Scan Stream */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Gate Clearance Feed
            </h2>
            <p className="text-xs text-slate-400">Real-time scan logs coming from gate terminals.</p>
          </div>

          <Link
            to="/admin/logs"
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
          >
            View Master Log Table <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentScans.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No scans recorded today yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Gate</th>
                  <th className="py-3 px-4">Plate</th>
                  <th className="py-3 px-4">Driver / Category</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Officer</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentScans.map((scan) => (
                  <tr key={scan._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {new Date(scan.scannedAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {scan.gateId?.name || 'Gate Terminal'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {scan.licensePlate}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{scan.ownerName}</div>
                      <div className="text-[10px] text-slate-400">{scan.ownerRole}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={scan.direction} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {scan.officerId?.fullName || 'Gate Officer'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={scan.verificationStatus} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminDashboard;
