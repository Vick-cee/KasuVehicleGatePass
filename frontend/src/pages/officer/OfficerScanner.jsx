import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Camera,
  QrCode,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Clock,
  RotateCcw,
  CheckCircle2,
  Car,
  User,
  Search,
  Sparkles,
  Zap,
  Volume2,
  LogIn,
  LogOut,
} from 'lucide-react';

export const OfficerScanner = () => {
  const { user, officerProfile } = useAuth();

  const [direction, setDirection] = useState('ENTRY'); // 'ENTRY' | 'EXIT'
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cooldown, setCooldown] = useState(false);

  const html5QrCodeRef = useRef(null);

  // Play audio chime
  const playSound = (isValid) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isValid) {
        // High pleasant ding
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15); // E6
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        // Low alert buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  const startScanner = async () => {
    setCameraError('');
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleTokenScanned(decodedText);
        },
        () => {
          // Frame read callback
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.warn('Camera start error:', err);
      setCameraError('Camera access unavailable or permission denied. Please use the Manual Input tab below.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.warn('Failed to stop camera:', err);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [activeTab]);

  const handleTokenScanned = async (token) => {
    if (cooldown || verifying || scanResult) return;

    setVerifying(true);
    setCooldown(true);

    try {
      const res = await api.post('/scan/verify', {
        qrToken: token,
        direction,
        gateId: officerProfile?.assignedGateId?._id || undefined,
      });

      const result = res.data;
      setScanResult(result);
      playSound(result.isValid);
    } catch (err) {
      const errorMsg = err.message || 'Pass verification failed';
      setScanResult({
        isValid: false,
        verificationStatus: 'INVALID',
        movementAction: direction === 'ENTRY' ? 'CHECKED_IN' : 'CHECKED_OUT',
        failureReason: errorMsg,
        direction,
      });
      playSound(false);
    } finally {
      setVerifying(false);
      setTimeout(() => {
        setCooldown(false);
      }, 3000);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleTokenScanned(manualToken.trim());
  };

  const handleResetScanner = () => {
    setScanResult(null);
    setManualToken('');
  };

  // Pre-configured test sample buttons
  const sampleTokens = [
    { label: 'Student Valid Pass (UNI-789-ST)', token: 'UGP-STUDENT-VALID', type: 'student' },
    { label: 'Staff Valid Pass (FAC-404-OK)', token: 'UGP-STAFF-VALID', type: 'staff' },
    { label: 'Visitor Valid Pass (VIS-880-NY)', token: 'UGP-VISITOR-VALID', type: 'visitor' },
    { label: 'Suspended Pass (SUS-555-ZZ)', token: 'UGP-SUSPENDED-TEST', type: 'suspended' },
    { label: 'Non-Existent / Invalid QR', token: 'UGP-INVALID-FAKE-TOKEN', type: 'invalid' },
  ];

  const handleQuickSampleToken = async (sample) => {
    try {
      if (sample.type === 'student') {
        const veh = await api.get('/vehicles/all?search=UNI-789-ST').catch(() => null);
        const token = veh?.data?.vehicles?.[0]?.pass?.qrToken || 'UGP-STUDENT-VALID';
        handleTokenScanned(token);
      } else if (sample.type === 'staff') {
        const veh = await api.get('/vehicles/all?search=FAC-404-OK').catch(() => null);
        const token = veh?.data?.vehicles?.[0]?.pass?.qrToken || 'UGP-STAFF-VALID';
        handleTokenScanned(token);
      } else if (sample.type === 'visitor') {
        const veh = await api.get('/vehicles/all?search=VIS-880-NY').catch(() => null);
        const token = veh?.data?.vehicles?.[0]?.pass?.qrToken || 'UGP-VISITOR-VALID';
        handleTokenScanned(token);
      } else if (sample.type === 'suspended') {
        const veh = await api.get('/vehicles/all?search=SUS-555-ZZ').catch(() => null);
        const token = veh?.data?.vehicles?.[0]?.pass?.qrToken || 'UGP-SUSPENDED-TEST';
        handleTokenScanned(token);
      } else {
        handleTokenScanned(sample.token);
      }
    } catch (e) {
      handleTokenScanned(sample.token);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Two Gates / Direction Selection Bar */}
      <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 grid grid-cols-2 gap-2 shadow-xl">
        <button
          type="button"
          onClick={() => setDirection('ENTRY')}
          className={`py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
            direction === 'ENTRY'
              ? 'bg-kasu-green-700 text-white shadow-lg shadow-kasu-green-950 border border-kasu-green-500'
              : 'text-slate-400 hover:text-white bg-slate-950/60'
          }`}
        >
          <LogIn className="w-4 h-4" />
          KASU ENTRY GATE (CHECK IN)
        </button>

        <button
          type="button"
          onClick={() => setDirection('EXIT')}
          className={`py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
            direction === 'EXIT'
              ? 'bg-kasu-red-800 text-white shadow-lg shadow-kasu-red-950 border border-kasu-red-600'
              : 'text-slate-400 hover:text-white bg-slate-950/60'
          }`}
        >
          <LogOut className="w-4 h-4" />
          KASU EXIT GATE (CHECK OUT)
        </button>
      </div>

      {/* Input Mode Selector */}
      <div className="flex items-center justify-center gap-2 text-xs">
        <button
          onClick={() => setActiveTab('camera')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeTab === 'camera'
              ? 'bg-kasu-green-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" /> Live Camera Scanner
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeTab === 'manual'
              ? 'bg-kasu-green-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" /> Manual Token / Testing
        </button>
      </div>

      {/* Camera Viewport Area */}
      {activeTab === 'camera' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 shadow-2xl space-y-3 relative overflow-hidden">
          <div className="relative rounded-2xl overflow-hidden bg-black min-h-[300px] flex items-center justify-center">
            <div id="qr-reader" className="w-full h-full"></div>

            {/* Viewfinder Target Graphic */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-60 h-60 border-2 border-kasu-green-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                {/* Laser animation */}
                <div className="scan-laser absolute left-2 right-2 h-0.5 bg-kasu-green-400 shadow-[0_0_8px_#22c55e]"></div>
                <div className="absolute top-2 left-2 text-[10px] font-mono text-kasu-green-300 font-black bg-slate-950/90 px-2 py-0.5 rounded">
                  ALIGN KASU PASS QR
                </div>
              </div>
            </div>
          </div>

          {cameraError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{cameraError}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-kasu-green-400 animate-pulse"></span>
              Optical QR Reader Active
            </span>
            <span className="font-mono text-[11px] text-kasu-green-300 font-bold">
              Mode: {direction === 'ENTRY' ? 'ENTRY (CHECK IN)' : 'EXIT (CHECK OUT)'}
            </span>
          </div>
        </div>
      )}

      {/* Manual Input / Rapid Test Tab */}
      {activeTab === 'manual' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white">Manual Pass Token Verification</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Type or paste a pass QR token or click a pre-loaded sample below:
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="e.g. UGP-STUDENT-VALID"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-kasu-green-500 tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={verifying || !manualToken.trim()}
              className="w-full py-3 rounded-2xl bg-kasu-green-600 hover:bg-kasu-green-500 text-white font-black text-xs uppercase tracking-wider transition shadow disabled:opacity-50"
            >
              {verifying ? 'Verifying...' : `Verify & ${direction === 'ENTRY' ? 'Check In' : 'Check Out'}`}
            </button>
          </form>

          {/* Quick Demo Test Buttons */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              1-Click Verification Test Scenarios:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleTokens.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => handleQuickSampleToken(sample)}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between"
                >
                  <span>{sample.label}</span>
                  <Zap className="w-3.5 h-3.5 text-kasu-green-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instant Verification Result Modal / Card */}
      {scanResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative my-6">
            {/* Status Banner */}
            <div
              className={`p-6 rounded-2xl text-center space-y-1.5 ${
                scanResult.isValid
                  ? scanResult.direction === 'ENTRY'
                    ? 'bg-kasu-green-700 text-white shadow-lg shadow-kasu-green-950'
                    : 'bg-kasu-red-800 text-white shadow-lg shadow-kasu-red-950'
                  : 'bg-rose-700 text-white shadow-lg shadow-rose-950'
              }`}
            >
              <div className="text-3xl font-black tracking-widest uppercase">
                {scanResult.isValid
                  ? scanResult.direction === 'ENTRY'
                    ? 'CHECKED IN'
                    : 'CHECKED OUT'
                  : 'ACCESS DENIED'}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/90">
                {scanResult.isValid
                  ? scanResult.direction === 'ENTRY'
                    ? 'ENTRY GRANTED & LOGGED ON CAMPUS'
                    : 'EXIT CLEARED & LOGGED OFF CAMPUS'
                  : scanResult.verificationStatus}
                {' '}&bull; {scanResult.gate?.name || (scanResult.direction === 'ENTRY' ? 'KASU Main Entry Gate' : 'KASU Main Exit Gate')}
              </div>
            </div>

            {/* Rejection / Failure Reason Alert */}
            {!scanResult.isValid && scanResult.failureReason && (
              <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  REJECTION REASON:
                </div>
                <div className="leading-relaxed">{scanResult.failureReason}</div>
              </div>
            )}

            {/* Vehicle & Driver Snapshot */}
            {scanResult.vehicleDetails && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                {/* Plate number */}
                <div className="text-center py-2 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    License Plate
                  </div>
                  <div className="text-3xl font-black font-mono text-amber-400 tracking-wider">
                    {scanResult.vehicleDetails.registrationNumber}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {scanResult.vehicleDetails.make} {scanResult.vehicleDetails.model} &bull; {scanResult.vehicleDetails.colour}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400">Driver / Owner:</span>
                    <div className="font-bold text-white text-sm">
                      {scanResult.ownerDetails?.fullName || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Category:</span>
                    <div>
                      <StatusBadge status={scanResult.ownerDetails?.role} size="sm" />
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">ID / Ref:</span>
                    <div className="font-semibold text-slate-200 font-mono">
                      {scanResult.ownerDetails?.idNumber || '—'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Movement Result:</span>
                    <div>
                      <StatusBadge status={scanResult.movementAction || (scanResult.direction === 'ENTRY' ? 'CHECKED_IN' : 'CHECKED_OUT')} size="sm" />
                    </div>
                  </div>
                  {scanResult.ownerDetails?.department && (
                    <div className="col-span-2">
                      <span className="text-slate-400">Faculty/Department:</span>
                      <div className="font-semibold text-slate-200">
                        {scanResult.ownerDetails.department}
                      </div>
                    </div>
                  )}
                  {scanResult.passDetails?.expiresAt && (
                    <div className="col-span-2 text-slate-400 pt-1 border-t border-slate-900 flex items-center justify-between">
                      <span>Pass Expiry: {new Date(scanResult.passDetails.expiresAt).toLocaleDateString()}</span>
                      <span className="font-mono text-[10px] text-slate-500">Ref: {scanResult.passDetails.passNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action to Dismiss and scan next */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetScanner}
                className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm transition flex items-center justify-center gap-2 border border-slate-700 shadow-lg"
              >
                <RotateCcw className="w-4 h-4 text-kasu-green-400" />
                SCAN NEXT VEHICLE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default OfficerScanner;
