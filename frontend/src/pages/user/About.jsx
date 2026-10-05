import React from 'react';
import { Shield, AlertCircle, MapPin, CheckCircle2, Car, Clock, FileText, ArrowRight, LogIn, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About = () => {
  return (
    <div className="space-y-12 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-kasu-red-800 bg-kasu-red-50 px-3.5 py-1 rounded-full border border-kasu-red-200">
          KASU Campus Security & Traffic Policies
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Vehicle Access Rules & Designated Gate Operations
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
          Official Kaduna State University (KASU) vehicle registration regulations, two-gate perimeter system, and parking policies.
        </p>
      </div>

      {/* Two Designated Gates Grid */}
      <section className="bg-kasu-milk rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-kasu-red-800" />
            Two Designated Campus Gates (Entry & Exit)
          </h2>
          <p className="text-xs text-slate-500">
            Vehicles entering campus must pass through the Entry Gate to check in, and depart through the Exit Gate to check out.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Entry Gate */}
          <div className="p-6 rounded-2xl bg-white border border-kasu-green-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogIn className="w-5 h-5 text-kasu-green-700" />
                <h3 className="font-black text-slate-900 text-base">Gate 1: Main Entry Gate (GATE-ENTRY)</h3>
              </div>
              <span className="text-[10px] bg-kasu-green-100 text-kasu-green-900 font-bold px-2 py-0.5 rounded-full">
                CHECK-IN STATION
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Located at <strong>Tafawa Balewa Way (Inbound Lane)</strong>. Primary entry checkpoint where gate officers scan driver QR passes to verify authorization and log the vehicle as <strong>"CHECKED IN"</strong> on campus.
            </p>
            <div className="text-[11px] text-kasu-green-800 font-bold bg-kasu-green-50 p-2 rounded-xl">
              Action: Instant Pass Verification & Check-In Recording (24/7)
            </div>
          </div>

          {/* Exit Gate */}
          <div className="p-6 rounded-2xl bg-white border border-kasu-red-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogOut className="w-5 h-5 text-kasu-red-700" />
                <h3 className="font-black text-slate-900 text-base">Gate 2: Main Exit Gate (GATE-EXIT)</h3>
              </div>
              <span className="text-[10px] bg-kasu-red-100 text-kasu-red-900 font-bold px-2 py-0.5 rounded-full">
                CHECK-OUT STATION
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Located at <strong>Tafawa Balewa Way (Outbound Lane)</strong>. Outbound checkpoint where gate officers scan exiting vehicles to confirm clearance and log the vehicle as <strong>"CHECKED OUT"</strong>.
            </p>
            <div className="text-[11px] text-kasu-red-800 font-bold bg-kasu-red-50 p-2 rounded-xl">
              Action: Departure Audit & Check-Out Clearance (24/7)
            </div>
          </div>
        </div>
      </section>

      {/* Rules and Regulations Section */}
      <section className="bg-kasu-milk rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-kasu-red-800" />
          KASU Vehicle Pass Regulations
        </h2>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-kasu-green-600 mt-0.5 shrink-0" />
            <div>
              <strong className="text-slate-900">Vehicle Limit Policy (Max 3 Vehicles):</strong> Students, faculty/staff, and visitors may register <strong>at most 3 vehicles</strong> under their user account. All vehicle registrations require security review and approval.
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-kasu-green-600 mt-0.5 shrink-0" />
            <div>
              <strong className="text-slate-900">Mandatory QR Pass Scanning:</strong> All vehicles must present a valid, unexpired digital or printed QR pass at the Entry Gate checkpoint for verification.
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-kasu-green-600 mt-0.5 shrink-0" />
            <div>
              <strong className="text-slate-900">Campus Speed Limit:</strong> Maximum speed on all Kaduna State University roads is <strong>20 km/h (12 mph)</strong>. Pedestrian priority is enforced at all times.
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-kasu-green-600 mt-0.5 shrink-0" />
            <div>
              <strong className="text-slate-900">Security Suspensions:</strong> Violations of university parking codes, unauthorized lane blocking, or reckless driving will lead to immediate administrative pass suspension.
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-kasu-red-900 via-kasu-red-800 to-kasu-red-950 text-white rounded-3xl p-8 text-center space-y-4 shadow-xl border border-kasu-red-700">
        <h3 className="text-2xl font-black">Register Your Vehicle Today</h3>
        <p className="text-xs text-slate-200 max-w-md mx-auto">
          Submit your vehicle license plate online to obtain your official Kaduna State University digital QR gate pass.
        </p>
        <div className="pt-2">
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-kasu-green-600 hover:bg-kasu-green-500 text-white font-black text-xs uppercase tracking-wider shadow-md inline-block transition"
          >
            Start Vehicle Registration
          </Link>
        </div>
      </div>
    </div>
  );
};
export default About;
