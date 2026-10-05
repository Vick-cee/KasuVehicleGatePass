import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, QrCode, MapPin, Radio, Clock, Phone, AlertTriangle } from 'lucide-react';

export const OfficerProfile = () => {
  const { user, officerProfile } = useAuth();

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Gate Security Officer Profile
        </h1>
        <p className="text-xs text-slate-400">Official credentials and active perimeter deployment information.</p>
      </div>

      {/* Officer ID Card */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-lg">
              {user?.fullName?.charAt(0) || 'O'}
            </div>
            <div>
              <div className="font-extrabold text-white text-base">{user?.fullName}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
            <Radio className="w-3 h-3 animate-pulse" /> ON DUTY
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Badge Number</span>
            <div className="text-base font-black font-mono text-purple-400">
              {officerProfile?.badgeNumber || 'SEC-101'}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Active Shift</span>
            <div className="text-base font-black text-white">
              {officerProfile?.shift || 'MORNING'} SHIFT
            </div>
          </div>

          <div className="col-span-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Assigned Gate Terminal</span>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{officerProfile?.assignedGateId?.name || 'Main Campus Gate Checkpoint'}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {officerProfile?.assignedGateId?.location || 'University Boulevard & 1st Avenue North'}
            </div>
          </div>
        </div>

        {/* Security Standard Operating Procedures */}
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            STANDARD OPERATING INSTRUCTIONS:
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-200/90 leading-relaxed">
            <li>Verify that the physical vehicle license plate matches the on-screen display exactly.</li>
            <li>In case of a <strong className="text-rose-400">PASS SUSPENDED</strong> or <strong className="text-rose-400">REJECTED</strong> alert, request the driver pull into the inspection bay.</li>
            <li>For emergency incidents, immediately contact Central Campus Dispatch via radio channel 4 or hotline <strong>(555) 911-GATE</strong>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default OfficerProfile;
