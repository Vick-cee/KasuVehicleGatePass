import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { History, RefreshCw, Car, MapPin, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const OfficerShiftLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/scan/shift-logs?limit=50');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load shift scans:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            Current Shift Gate Scans
          </h1>
          <p className="text-xs text-slate-400">All inbound and outbound verifications processed on your terminal.</p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition shadow"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 sm:p-6 space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading shift records...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No scans recorded on your shift yet.</div>
        ) : (
          <div className="space-y-2.5">
            {logs.map((log) => (
              <div
                key={log._id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="font-mono font-black text-sm text-white bg-slate-800 px-2.5 py-1.5 rounded-xl self-start">
                    {log.licensePlate}
                  </div>
                  <div>
                    <div className="font-bold text-white">{log.ownerName}</div>
                    <div className="text-[11px] text-slate-400">
                      {log.vehicleMakeModel || log.vehicleType} &bull; {log.ownerRole}
                    </div>
                    {log.failureReason && (
                      <div className="text-[10px] text-rose-400 mt-1 font-medium">
                        Alert: {log.failureReason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-900">
                  <div className="text-right">
                    <StatusBadge status={log.direction} size="sm" />
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      {new Date(log.scannedAt).toLocaleTimeString()}
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
export default OfficerShiftLogs;
