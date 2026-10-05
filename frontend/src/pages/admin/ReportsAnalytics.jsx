import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  Car,
  Users,
  Shield,
  Download,
  Calendar,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const ReportsAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/analytics');
      setData(res.data.analytics || null);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
        <span>Aggregating traffic and vehicle analytics...</span>
      </div>
    );
  }

  const { scansByGate = [], vehiclesByType = [], scansByRole = [] } = data;

  const totalScans = scansByGate.reduce((acc, g) => acc + (g.totalScans || 0), 0);
  const totalVehicles = vehiclesByType.reduce((acc, v) => acc + (v.count || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            University Traffic & Fleet Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Perimeter volume analysis, gate utilization breakdown, and vehicle category statistics.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-purple-600" />
        </button>
      </div>

      {/* Gate Utilization Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Traffic Volume by Gate Checkpoint</h2>
            <p className="text-xs text-slate-400">Total scan transactions, entries vs exits per gate.</p>
          </div>
          <span className="text-xs font-bold font-mono text-purple-700 bg-purple-50 px-3 py-1 rounded-xl">
            {totalScans} Total Scans
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scansByGate.map((gate) => {
            const percentage = totalScans > 0 ? Math.round((gate.totalScans / totalScans) * 100) : 0;
            return (
              <div key={gate.gateId} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{gate.gateName}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{gate.gateCode}</span>
                  </div>
                  <span className="text-base font-extrabold text-purple-700">{gate.totalScans} scans</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="text-blue-700 font-semibold">{gate.entries || 0} Inbound</span>
                  <span className="text-purple-700 font-semibold">{gate.exits || 0} Outbound</span>
                  <span className="text-emerald-700 font-semibold">{gate.validScans || 0} Valid</span>
                  <span className="text-slate-400">{percentage}% of campus total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Vehicle Types & User Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Types */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-600" />
              Fleet Distribution by Type
            </h2>
            <span className="text-xs font-mono font-bold text-slate-600">{totalVehicles} Registered</span>
          </div>

          <div className="space-y-3">
            {vehiclesByType.map((vt) => {
              const pct = totalVehicles > 0 ? Math.round((vt.count / totalVehicles) * 100) : 0;
              return (
                <div key={vt.vehicleType} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{vt.vehicleType}</span>
                    <span className="font-bold text-slate-900">{vt.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scan Traffic by User Role */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Gate Traffic by User Category
            </h2>
            <span className="text-xs font-mono font-bold text-slate-600">{totalScans} Total</span>
          </div>

          <div className="space-y-3">
            {scansByRole.map((sr) => {
              const pct = totalScans > 0 ? Math.round((sr.count / totalScans) * 100) : 0;
              return (
                <div key={sr.role} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{sr.role}</span>
                    <span className="font-bold text-slate-900">{sr.count} scans ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReportsAnalytics;
