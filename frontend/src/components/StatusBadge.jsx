import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock, ShieldAlert, ArrowDownLeft, ArrowUpRight, LogIn, LogOut, Radio } from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  const configs = {
    CHECKED_IN: {
      label: 'CHECKED IN',
      bg: 'bg-kasu-green-800 text-white font-black border-kasu-green-900 shadow-xs',
      icon: LogIn,
    },
    CHECKED_OUT: {
      label: 'CHECKED OUT',
      bg: 'bg-slate-800 text-slate-200 font-bold border-slate-700 shadow-xs',
      icon: LogOut,
    },
    INSIDE: {
      label: 'ON CAMPUS',
      bg: 'bg-kasu-green-100 text-kasu-green-900 font-extrabold border-kasu-green-300',
      icon: Radio,
    },
    OUTSIDE: {
      label: 'OFF CAMPUS',
      bg: 'bg-slate-100 text-slate-700 font-bold border-slate-200',
      icon: Radio,
    },
    APPROVED: {
      label: 'Approved',
      bg: 'bg-kasu-green-50 text-kasu-green-800 border-kasu-green-200 font-bold',
      icon: CheckCircle2,
    },
    ACTIVE: {
      label: 'Active Pass',
      bg: 'bg-kasu-green-50 text-kasu-green-800 border-kasu-green-200 font-bold',
      icon: CheckCircle2,
    },
    VALID: {
      label: 'VALID PASS',
      bg: 'bg-kasu-green-700 text-white font-black tracking-wider shadow-sm',
      icon: CheckCircle2,
    },
    PENDING: {
      label: 'Pending Review',
      bg: 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse font-bold',
      icon: Clock,
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-kasu-red-50 text-kasu-red-800 border-kasu-red-200 font-bold',
      icon: XCircle,
    },
    SUSPENDED: {
      label: 'Suspended',
      bg: 'bg-orange-50 text-orange-800 border-orange-200 font-bold',
      icon: ShieldAlert,
    },
    EXPIRED: {
      label: 'Expired',
      bg: 'bg-slate-200 text-slate-700 border-slate-300 font-semibold',
      icon: AlertCircle,
    },
    REVOKED: {
      label: 'Revoked',
      bg: 'bg-kasu-red-100 text-kasu-red-900 border-kasu-red-300 font-bold',
      icon: XCircle,
    },
    INVALID: {
      label: 'INVALID PASS',
      bg: 'bg-kasu-red-700 text-white font-black tracking-wider shadow-sm',
      icon: XCircle,
    },
    GATE_MISMATCH: {
      label: 'GATE MISMATCH',
      bg: 'bg-orange-600 text-white font-bold tracking-wider',
      icon: AlertCircle,
    },
    ENTRY: {
      label: 'INBOUND (ENTRY)',
      bg: 'bg-kasu-green-100 text-kasu-green-900 border-kasu-green-300 font-bold',
      icon: ArrowDownLeft,
    },
    EXIT: {
      label: 'OUTBOUND (EXIT)',
      bg: 'bg-kasu-red-100 text-kasu-red-900 border-kasu-red-300 font-bold',
      icon: ArrowUpRight,
    },
    STUDENT: {
      label: 'Student',
      bg: 'bg-slate-100 text-slate-800 border-slate-300 font-bold',
    },
    STAFF: {
      label: 'Faculty / Staff',
      bg: 'bg-amber-50 text-amber-900 border-amber-200 font-bold',
    },
    VISITOR: {
      label: 'Visitor',
      bg: 'bg-teal-50 text-teal-800 border-teal-200 font-bold',
    },
    GATE_OFFICER: {
      label: 'Gate Officer',
      bg: 'bg-kasu-green-50 text-kasu-green-900 border-kasu-green-200 font-bold',
    },
    ADMIN: {
      label: 'Administrator',
      bg: 'bg-kasu-red-50 text-kasu-red-900 border-kasu-red-200 font-bold',
    },
  };

  const config = configs[normalized] || {
    label: status,
    bg: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
  };

  const IconComponent = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : size === 'lg' ? 'px-3.5 py-1.5 text-xs font-bold' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses}`}>
      {IconComponent && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
};
export default StatusBadge;
