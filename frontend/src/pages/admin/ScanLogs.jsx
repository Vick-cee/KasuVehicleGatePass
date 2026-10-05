import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import {
  FileSpreadsheet,
  Search,
  Download,
  Filter,
  MapPin,
  Calendar,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';

export const ScanLogs = () => {
  const [logs, setLogs] = useState([]);
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [gateFilter, setGateFilter] = useState('ALL');
  const [directionFilter, setDirectionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchGates();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [gateFilter, directionFilter, statusFilter, startDate, endDate]);

  const fetchGates = async () => {
    try {
      const res = await api.get('/gates');
      setGates(res.data.gates || []);
    } catch (err) {
      console.error('Failed to fetch gates:', err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/scan/all', {
        params: {
          gateId: gateFilter,
          direction: directionFilter,
          verificationStatus: statusFilter,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          search: search.trim() || undefined,
          limit: 100,
        },
      });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch scan logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get('/reports/export-csv', {
        params: {
          gateId: gateFilter,
          direction: directionFilter,
          verificationStatus: statusFilter,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `KASU_Gate_Scan_Report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV report:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-purple-600" />
            Master Gate Entry & Exit Audit Logs
          </h1>
          <p className="text-xs text-slate-500">
            Real-time digital transaction record of every vehicle perimeter scan across university gates.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-xs"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Generating CSV...' : 'Export Filtered CSV'}
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by license plate number, driver name, vehicle..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={gateFilter}
              onChange={(e) => setGateFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="ALL">All Gates</option>
              {gates.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
            </select>

            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="ALL">All Directions</option>
              <option value="ENTRY">ENTRY (Inbound)</option>
              <option value="EXIT">EXIT (Outbound)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="VALID">VALID</option>
              <option value="INVALID">INVALID</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Date Filter:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-[11px] text-rose-600 hover:underline font-semibold"
            >
              Clear Dates
            </button>
          )}
        </div>
      </div>

      {/* Scan Log Master Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading scan logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No scan activity found for current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Gate Checkpoint</th>
                  <th className="py-3.5 px-4">License Plate</th>
                  <th className="py-3.5 px-4">Vehicle Details</th>
                  <th className="py-3.5 px-4">Driver / Category</th>
                  <th className="py-3.5 px-4">Direction</th>
                  <th className="py-3.5 px-4">Officer</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {new Date(log.scannedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{log.gateId?.name || 'Gate'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.gateId?.code}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 text-sm">
                      {log.licensePlate}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{log.vehicleMakeModel || '—'}</div>
                      <div className="text-[10px] text-slate-400">{log.vehicleType}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{log.ownerName}</div>
                      <div className="text-[10px] text-slate-400">{log.ownerRole}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={log.direction} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {log.officerId?.fullName || 'Gate Officer'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <StatusBadge status={log.verificationStatus} size="sm" />
                        {log.failureReason && (
                          <div className="text-[10px] text-rose-600 font-medium max-w-xs truncate" title={log.failureReason}>
                            {log.failureReason}
                          </div>
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
    </div>
  );
};
export default ScanLogs;
