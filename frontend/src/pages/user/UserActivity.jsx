import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { History, Search, Calendar, MapPin, RefreshCw, Car } from 'lucide-react';

export const UserActivity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/scan/user-activity');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load user gate logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      log.licensePlate?.toLowerCase().includes(term) ||
      log.gateId?.name?.toLowerCase().includes(term) ||
      log.direction?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-kasu-red-800" />
            Gate Movement History
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Chronological audit of every entry and exit scan recorded for your registered vehicles.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by license plate, gate name, or direction..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-kasu-red-700"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-medium">Loading your gate records...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Car className="w-8 h-8 mx-auto text-slate-400" />
            <div>No matching movement records found.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Gate Location</th>
                  <th className="py-3.5 px-4">Vehicle Plate</th>
                  <th className="py-3.5 px-4">Direction</th>
                  <th className="py-3.5 px-4">Pass Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {new Date(log.scannedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-kasu-red-700 shrink-0" />
                        <span>{log.gateId?.name || 'Gate Checkpoint'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 pl-5 font-medium">{log.gateId?.location || log.gateId?.code}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                      {log.licensePlate}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={log.direction} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={log.verificationStatus} size="sm" />
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
export default UserActivity;
