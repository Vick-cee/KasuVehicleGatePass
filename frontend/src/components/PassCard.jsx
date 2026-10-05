import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import {
  Printer,
  Download,
  Maximize2,
  ShieldCheck,
  Calendar,
  Car,
  User,
  Hash,
  AlertTriangle,
  Building,
} from 'lucide-react';

export const PassCard = ({ pass, vehicle, owner }) => {
  const [showEnlargedQr, setShowEnlargedQr] = useState(false);

  if (!pass && !vehicle) {
    return (
      <div className="bg-kasu-milk rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        No vehicle pass record found.
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!pass?.qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = pass.qrCodeDataUrl;
    link.download = `KASU_PASS_${vehicle?.registrationNumber || 'QR'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isExpired = pass?.expiresAt && new Date() > new Date(pass.expiresAt);
  const displayStatus = isExpired ? 'EXPIRED' : pass?.status || vehicle?.status || 'PENDING';

  return (
    <div className="space-y-4">
      {/* Printable Badge Container */}
      <div
        id="printable-pass"
        className="bg-kasu-milk rounded-3xl border-2 border-kasu-red-800/30 shadow-xl overflow-hidden max-w-xl mx-auto transition-all"
      >
        {/* Pass Header Banner */}
        <div className="bg-gradient-to-r from-kasu-red-900 via-kasu-red-800 to-kasu-red-950 text-white p-5 relative border-b-4 border-kasu-green-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-inner border border-white/30">
                <img
                  src="/kasu-logo.png"
                  alt="KASU Crest"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h3 className="font-black text-lg tracking-wide uppercase text-white">
                  Kaduna State University
                </h3>
                <p className="text-[11px] text-kasu-green-200 font-bold tracking-wider uppercase">
                  Official Vehicle Gate Access Pass (KASU)
                </p>
              </div>
            </div>

            <div className="text-right">
              <StatusBadge status={displayStatus} size="sm" />
              {pass?.passNumber && (
                <div className="text-[11px] font-mono text-kasu-milk mt-1 font-bold">
                  {pass.passNumber}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pass Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* QR Code Section */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-3.5 bg-kasu-smoke rounded-2xl border border-slate-200 text-center">
              {pass?.qrCodeDataUrl ? (
                <>
                  <div className="relative group cursor-pointer" onClick={() => setShowEnlargedQr(true)}>
                    <img
                      src={pass.qrCodeDataUrl}
                      alt="Vehicle Pass QR Code"
                      className="w-40 h-40 object-contain rounded-xl shadow-sm border border-slate-300 bg-white p-1"
                    />
                    <div className="absolute inset-0 bg-kasu-red-950/70 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-xs font-bold gap-1">
                      <Maximize2 className="w-4 h-4" /> Click to Enlarge
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-2.5">
                    Scan at KASU Entry Gate
                  </span>
                  <div className="text-[11px] font-mono font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 mt-1 truncate max-w-full">
                    {pass.qrToken}
                  </div>
                </>
              ) : (
                <div className="w-40 h-40 bg-white rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center text-slate-400">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                  <span className="text-xs font-semibold">QR Code pending security approval</span>
                </div>
              )}
            </div>

            {/* Vehicle & Driver Details */}
            <div className="sm:col-span-7 space-y-4">
              {/* License Plate Badge */}
              <div className="bg-slate-950 text-white rounded-2xl p-3.5 text-center shadow-inner border border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Vehicle License Plate
                </div>
                <div className="text-2xl font-black tracking-wider font-mono text-amber-400">
                  {vehicle?.registrationNumber || 'N/A'}
                </div>
                <div className="text-xs text-slate-300 font-medium mt-0.5">
                  {vehicle?.make} {vehicle?.model} &bull; {vehicle?.colour}
                </div>
              </div>

              {/* Driver & Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium">Pass Holder:</span>
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{owner?.fullName || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium">Affiliation:</span>
                  <div>
                    <StatusBadge status={owner?.role || 'STUDENT'} size="sm" />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium">ID / Reg No:</span>
                  <div className="font-bold text-slate-800 font-mono">
                    {owner?.idNumber || 'N/A'}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium">Vehicle Category:</span>
                  <div className="font-bold text-slate-800">
                    {vehicle?.vehicleType || 'CAR'}
                  </div>
                </div>

                {owner?.department && (
                  <div className="col-span-2 space-y-0.5">
                    <span className="text-slate-500 font-medium">Faculty / Department:</span>
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{owner.department}</span>
                    </div>
                  </div>
                )}

                {owner?.visitorPurpose && (
                  <div className="col-span-2 space-y-1 bg-amber-50 p-2 rounded-xl border border-amber-200">
                    <span className="text-amber-800 font-bold">Visit Purpose:</span>
                    <div className="text-amber-900 font-medium">{owner.visitorPurpose}</div>
                    {owner.visitorHost && (
                      <div className="text-amber-700 text-[11px]">Host: {owner.visitorHost}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Validity Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Issued: {pass?.issuedAt ? new Date(pass.issuedAt).toLocaleDateString() : 'Pending'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-kasu-green-800">
              <Calendar className="w-3.5 h-3.5 text-kasu-green-600" />
              <span>Valid Until: {pass?.expiresAt ? new Date(pass.expiresAt).toLocaleDateString() : 'Annual'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-kasu-red-800 hover:bg-kasu-red-900 text-white text-xs font-bold shadow-md transition"
        >
          <Printer className="w-4 h-4" /> Print / Save Pass Badge (PDF)
        </button>

        {pass?.qrCodeDataUrl && (
          <button
            onClick={handleDownloadQr}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition shadow-xs"
          >
            <Download className="w-4 h-4 text-kasu-green-700" /> Download QR Code
          </button>
        )}
      </div>

      {/* Modal for Enlarged QR Code */}
      {showEnlargedQr && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-kasu-milk rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative border border-slate-200">
            <h4 className="font-black text-slate-900 text-lg">KASU Vehicle Pass QR Code</h4>
            <p className="text-xs text-slate-500">Present this QR code clearly to the gate officer camera.</p>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 inline-block shadow-inner">
              <img src={pass?.qrCodeDataUrl} alt="Enlarged QR" className="w-64 h-64 object-contain mx-auto" />
            </div>
            <div className="text-base font-mono font-black text-slate-900">
              {vehicle?.registrationNumber}
            </div>
            <button
              onClick={() => setShowEnlargedQr(false)}
              className="w-full py-3 rounded-xl bg-kasu-red-800 text-white font-bold text-xs hover:bg-kasu-red-900 transition"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default PassCard;
