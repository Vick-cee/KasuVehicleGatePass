import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import {
  QrCode,
  Shield,
  MapPin,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Radio,
  Camera,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const OfficerDashboard = () => {
  const { user, officerProfile } = useAuth();
  const [assignedGate, setAssignedGate] = useState(officerProfile?.assignedGateId || null);
  const [shiftLogs, setShiftLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficerData();
  }, []);

  const fetchOfficerData = async () => {
    setLoading(true);
    try {
      const [gateRes, logsRes] = await Promise.all([
        api.get('/gates/my-assignment'),
        api.get('/scan/shift-logs?limit=5'),
      ]);
      if (gateRes.data?.assignedGate) setAssignedGate(gateRes.data.assignedGate);
      setShiftLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error('Failed to load officer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const entryCount = shiftLogs.filter((l) => l.direction === 'ENTRY' && l.verificationStatus === 'VALID').length;
  const exitCount = shiftLogs.filter((l) => l.direction === 'EXIT' && l.verificationStatus === 'VALID').length;

  return (
    <div className="space-y-6">
      {/* Assigned Gate Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kasu-green-950 text-kasu-green-300 border border-kasu-green-800 text-xs font-bold">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>KASU ACTIVE GATE TERMINAL</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Shift: {officerProfile?.shift || 'MORNING'}</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {assignedGate?.name || 'KASU Main Entry Gate'}
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-kasu-green-400" />
              <span>{assignedGate?.location || 'Tafawa Balewa Way / Main Campus Inbound Boulevard'}</span>
              <span className="font-mono text-kasu-green-400 font-bold">({assignedGate?.code || 'GATE-ENTRY'})</span>
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/scanner/scan"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-kasu-green-600 hover:bg-kasu-green-500 text-white font-black text-base shadow-xl shadow-kasu-green-950/60 transition"
            >
              <Camera className="w-5 h-5" />
              OPEN LIVE QR CAMERA SCANNER
            </Link>
          </div>
        </div>

        <div className="absolute right-[-20px] bottom-[-20px] opacity-5 pointer-events-none">
          <QrCode className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Shift Quick Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Shift Scans</div>
          <div className="text-2xl font-black text-white font-mono">{shiftLogs.length}</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
          <div className="text-[10px] uppercase font-bold text-blue-400 flex items-center justify-center gap-1">
            <ArrowDownLeft className="w-3 h-3" /> Inbound
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono">{entryCount}</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
          <div className="text-[10px] uppercase font-bold text-purple-400 flex items-center justify-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Outbound
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">{exitCount}</div>
        </div>
      </div>

      {/* Recent Scans during this shift */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            Recent Shift Transactions
          </h2>
          <Link to="/scanner/history" className="text-xs text-emerald-400 hover:underline">
            View All &rarr;
          </Link>
        </div>

        {shiftLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No scans recorded in your current shift. Tap the button above to begin scanning.
          </div>
        ) : (
          <div className="space-y-2.5">
            {shiftLogs.map((log) => (
              <div
                key={log._id}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="font-mono font-black text-sm text-white bg-slate-800 px-2.5 py-1 rounded-xl">
                    {log.licensePlate}
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">{log.ownerName}</div>
                    <div className="text-[10px] text-slate-400">{log.vehicleMakeModel || log.vehicleType}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <div>
                    <StatusBadge status={log.direction} size="sm" />
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {new Date(log.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <StatusBadge status={log.verificationStatus} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default OfficerDashboard;
