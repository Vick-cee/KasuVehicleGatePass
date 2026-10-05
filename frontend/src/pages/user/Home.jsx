import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  QrCode,
  Car,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  MapPin,
  Building,
  FileCheck,
  ChevronRight,
  Shield,
  Zap,
  Radio,
  LogIn,
  LogOut,
  Smartphone,
  Eye,
  Sliders,
  Sparkles,
  Users,
  Award,
} from 'lucide-react';

export const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-16 py-4 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-kasu-red-900 via-kasu-red-800 to-kasu-red-950 text-white shadow-2xl p-8 sm:p-12 lg:p-16 border border-kasu-red-700">
        {/* Subtle decorative crest watermark in background */}
        <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none hidden lg:block">
          <img
            src="/kasu-logo.png"
            alt="KASU Watermark"
            className="w-96 h-96 object-contain filter brightness-200"
          />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Hero Text & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-black backdrop-blur-md">
              <img
                src="/kasu-logo.png"
                alt="KASU Badge"
                className="w-5 h-5 object-contain bg-white rounded-full p-0.5"
              />
              <span className="tracking-wide">KADUNA STATE UNIVERSITY &bull; SECURITY DIRECTORATE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
              Digital Vehicle Gate Pass & Perimeter Access
            </h1>

            <p className="text-base sm:text-lg text-slate-100 leading-relaxed max-w-2xl font-normal">
              Official vehicle clearance and automated gate verification platform for Kaduna State University campuses. Students, faculty, staff, and visitors can register up to <strong>3 vehicles</strong> online, receive cryptographic QR passes, and enjoy fast clearance at designated Entry and Exit checkpoints.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-4 rounded-2xl bg-kasu-green-600 hover:bg-kasu-green-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-kasu-green-950/50 flex items-center gap-2 transition"
                >
                  Go to My Vehicle Passes <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-6 py-4 rounded-2xl bg-kasu-green-600 hover:bg-kasu-green-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-kasu-green-950/50 flex items-center gap-2 transition"
                  >
                    Register Vehicle Pass <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition"
                  >
                    Sign In to Portal
                  </Link>
                </>
              )}

              <Link
                to="/about"
                className="px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-xs border border-white/10 transition"
              >
                Traffic Rules & Gates
              </Link>
            </div>

            {/* Key Quota & Metrics Bar */}
            <div className="pt-6 grid grid-cols-3 gap-3 border-t border-white/15">
              <div className="space-y-0.5">
                <div className="text-2xl font-black text-white">3 Vehicles</div>
                <div className="text-xs text-slate-200 font-medium">Max Quota per User</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-black text-kasu-green-300">2 Gates</div>
                <div className="text-xs text-slate-200 font-medium">Dedicated Entry & Exit</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-black text-amber-300">&lt; 0.5s</div>
                <div className="text-xs text-slate-200 font-medium">QR Optical Clearance</div>
              </div>
            </div>
          </div>

          {/* Right Column: Specimen Pass Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/kasu-logo.png"
                    alt="KASU Crest"
                    className="w-8 h-8 object-contain"
                  />
                  <div>
                    <div className="font-black text-xs text-slate-900">KADUNA STATE UNIVERSITY</div>
                    <div className="text-[10px] text-slate-500 font-mono">OFFICIAL DIGITAL VEHICLE PASS</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-kasu-green-100 text-kasu-green-800 border border-kasu-green-300">
                  ACTIVE / VALID
                </span>
              </div>

              {/* Vehicle Snapshot Details */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">License Plate</span>
                    <span className="text-xl font-black font-mono text-kasu-red-800 tracking-wider">UNI-789-ST</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Vehicle</span>
                    <span className="text-xs font-bold text-slate-800">Honda Civic &bull; Black</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/70">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Driver / Owner</span>
                    <span className="font-bold text-slate-900">Ibrahim Abubakar</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Current Status</span>
                    <span className="font-bold text-kasu-green-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-kasu-green-600 animate-pulse"></span>
                      CHECKED IN (ON CAMPUS)
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Verification Specimen */}
              <div className="p-3 bg-slate-900 rounded-2xl text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-slate-950" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-white">UGP-STUDENT-VALID</div>
                    <div className="text-[10px] text-slate-400">Cryptographic Gate Token</div>
                  </div>
                </div>
                <span className="text-[10px] font-black text-kasu-green-400 bg-kasu-green-950 border border-kasu-green-800 px-2.5 py-1 rounded-lg font-mono">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Designated Gates Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-kasu-red-800 bg-kasu-red-50 px-3.5 py-1 rounded-full border border-kasu-red-200">
              Perimeter Gate Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Two Designated Campus Checkpoints
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Vehicles enter through the Main Entry Gate (Check-In) and depart through the Main Exit Gate (Check-Out).
            </p>
          </div>
          <Link
            to="/about"
            className="text-xs font-bold text-kasu-red-800 hover:text-kasu-red-900 flex items-center gap-1 font-semibold"
          >
            View Complete Traffic Rules <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gate 1: Entry Gate */}
          <div className="bg-white rounded-3xl p-7 border border-kasu-green-200 hover:border-kasu-green-400 transition shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-kasu-green-50 border border-kasu-green-200 text-kasu-green-800 text-xs font-mono font-bold">
                <LogIn className="w-3.5 h-3.5 text-kasu-green-700" /> GATE-ENTRY
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                24/7 INBOUND CHECK-IN
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900">KASU Main Entry Gate</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Located on <strong>Tafawa Balewa Way (Main Inbound Boulevard)</strong>. High-throughput optical scanning lane for student commuters, faculty, staff, and authorized guests.
            </p>

            <div className="p-3.5 rounded-2xl bg-kasu-green-50 border border-kasu-green-200 flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold">Scanner Movement Result:</span>
              <span className="font-bold text-kasu-green-800 bg-white px-2.5 py-1 rounded-lg border border-kasu-green-200 shadow-xs">
                CHECKED IN (ON CAMPUS)
              </span>
            </div>
          </div>

          {/* Gate 2: Exit Gate */}
          <div className="bg-white rounded-3xl p-7 border border-kasu-red-200 hover:border-kasu-red-400 transition shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-kasu-red-50 border border-kasu-red-200 text-kasu-red-800 text-xs font-mono font-bold">
                <LogOut className="w-3.5 h-3.5 text-kasu-red-700" /> GATE-EXIT
              </div>
              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-full">
                24/7 OUTBOUND CHECK-OUT
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900">KASU Main Exit Gate</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Located on <strong>Tafawa Balewa Way (Main Outbound Boulevard)</strong>. Checkpoint for auditing campus departures and recording vehicle exit clearance.
            </p>

            <div className="p-3.5 rounded-2xl bg-kasu-red-50 border border-kasu-red-200 flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold">Scanner Movement Result:</span>
              <span className="font-bold text-kasu-red-800 bg-white px-2.5 py-1 rounded-lg border border-kasu-red-200 shadow-xs">
                CHECKED OUT (OFF CAMPUS)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Clearance Workflow */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-kasu-green-800 bg-kasu-green-50 px-3.5 py-1 rounded-full border border-kasu-green-200">
            Automated Clearance Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Three Steps to Campus Clearance
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Replacing manual paperwork with instantaneous optical QR verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200 hover:border-slate-300 transition space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-kasu-red-50 text-kasu-red-800 flex items-center justify-center font-black text-lg border border-kasu-red-200">
              01
            </div>
            <h3 className="text-base font-black text-slate-900">Register Vehicles (Max 3)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Students, faculty, staff, and guests submit their vehicle details online. Each user account can register up to 3 vehicles.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200 hover:border-slate-300 transition space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-kasu-green-50 text-kasu-green-800 flex items-center justify-center font-black text-lg border border-kasu-green-200">
              02
            </div>
            <h3 className="text-base font-black text-slate-900">Administrative Approval</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              KASU Security Administration validates your details and issues a cryptographic QR pass instantly available on your phone.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200 hover:border-slate-300 transition space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-black text-lg border border-amber-200">
              03
            </div>
            <h3 className="text-base font-black text-slate-900">Contactless Gate Clearance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Present your QR code at the <strong>Main Entry Gate</strong> or <strong>Exit Gate</strong> for sub-second optical scanning by gate officers.
            </p>
          </div>
        </div>
      </section>

      {/* Security Features 4-Grid */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8 shadow-sm">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xs font-black uppercase tracking-widest text-kasu-red-800">
            Perimeter Security Architecture
          </h2>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
            Engineered for University Safety & Fast Transit
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-kasu-red-100 text-kasu-red-800 flex items-center justify-center border border-kasu-red-200">
              <QrCode className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Anti-Fraud QR Passes</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cryptographically signed tokens prevent forged badges and unauthorized vehicle entry.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-kasu-green-100 text-kasu-green-800 flex items-center justify-center border border-kasu-green-200">
              <Car className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">3-Vehicle User Quota</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automatic validation ensures accounts stay within the official 3-vehicle registration limit.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Expo Go Mobile Scanner</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dedicated mobile app for gate security officers with laser optical scanning and audio feedback.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center border border-sky-200">
              <Radio className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Live Movement Audit</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              24/7 logging of all vehicular entries, departures, and security interventions.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Dispatch & Registration CTA */}
      <section className="rounded-3xl bg-gradient-to-r from-kasu-red-900 via-kasu-red-800 to-kasu-red-950 border border-kasu-red-700 text-white p-8 sm:p-12 text-center space-y-6 shadow-xl">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-kasu-green-300 bg-white/10 px-3.5 py-1 rounded-full border border-white/20">
            Kaduna State University &bull; Security Command
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Ready to Activate Your Digital Gate Pass?
          </h2>
          <p className="text-xs sm:text-sm text-slate-100">
            Submit your vehicle information today for rapid, contactless clearance at KASU Entry & Exit gates.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/register"
            className="px-7 py-4 rounded-2xl bg-kasu-green-600 hover:bg-kasu-green-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition"
          >
            Start Vehicle Registration
          </Link>
          <Link
            to="/login"
            className="px-7 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition"
          >
            Sign In to Account
          </Link>
        </div>
      </section>
    </div>
  );
};
export default Home;
