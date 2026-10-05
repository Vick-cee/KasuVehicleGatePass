import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { History, Search, RefreshCw, Shield, Clock, FileText } from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [targetTypeFilter, setTargetTypeFilter] = useState('ALL');

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, targetTypeFilter]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit', {
        params: {
          action: actionFilter,
          targetType: targetTypeFilter,
          limit: 100,
        },
      });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-purple-600" />
            Security & Administrative Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Immutable log of critical system operations, approvals, suspensions, and configuration changes.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Action Type:</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="ALL">All Actions</option>
            <option value="VEHICLE_APPROVED">VEHICLE_APPROVED</option>
            <option value="VEHICLE_REJECTED">VEHICLE_REJECTED</option>
            <option value="PASS_SUSPENDED">PASS_SUSPENDED</option>
            <option value="PASS_REACTIVATED">PASS_REACTIVATED</option>
            <option value="OFFICER_ASSIGNED">OFFICER_ASSIGNED</option>
            <option value="GATE_CREATED">GATE_CREATED</option>
            <option value="GATE_UPDATED">GATE_UPDATED</option>
            <option value="USER_REGISTERED">USER_REGISTERED</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Target Type:</label>
          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="ALL">All Targets</option>
            <option value="VEHICLE">VEHICLE</option>
            <option value="PASS">PASS</option>
            <option value="GATE">GATE</option>
            <option value="OFFICER">OFFICER</option>
            <option value="USER">USER</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No audit events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Type</th>
                  <th className="py-3.5 px-4">Details Summary</th>
                  <th className="py-3.5 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition font-mono text-[11px]">
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-sans">
                      <div>{log.actorName || 'System'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.actorRole}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold font-mono text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">
                      {log.targetType}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-sans max-w-sm">
                      {typeof log.details === 'object' ? (
                        <pre className="text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200 overflow-x-auto max-h-20 whitespace-pre-wrap font-mono">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      ) : (
                        <span>{String(log.details || '')}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[10px]">
                      {log.ipAddress || '127.0.0.1'}
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
export default AuditLogs;
