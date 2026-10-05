import React from 'react';
import { Shield, Phone, MapPin, Mail, Clock, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-kasu-dark-950 text-slate-300 border-t border-kasu-dark-800 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: University Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-kasu-red-800 to-kasu-red-950 flex items-center justify-center text-white font-black text-base shadow border border-kasu-red-700">
                K
              </div>
              <div>
                <span className="font-black text-white text-base tracking-tight block">Kaduna State University</span>
                <span className="text-[10px] text-slate-400 font-mono">Tafawa Balewa Way, Kaduna</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Directorate of Campus Security & Transportation Management. Regulating vehicle gate clearance, digital passes, and perimeter safety across KASU campuses.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kasu-dark-900 border border-kasu-dark-800 text-kasu-green-400 font-mono text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-kasu-green-400 animate-pulse"></span>
              KASU Digital GatePass v2.0 Live
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="font-black text-white text-xs uppercase tracking-wider mb-3.5">Portal Navigation</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition">Portal Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition">KASU Gates & Traffic Rules</Link>
              </li>
              <li>
                <Link to="/vehicles/register" className="text-slate-400 hover:text-kasu-green-400 transition">Vehicle Registration (Max 3)</Link>
              </li>
              <li>
                <Link to="/activity" className="text-slate-400 hover:text-white transition">Gate Movement Logs</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Designated Campus Gates */}
          <div>
            <h3 className="font-black text-white text-xs uppercase tracking-wider mb-3.5">Designated Campus Gates</h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-kasu-dark-900 border border-kasu-dark-800">
                <MapPin className="w-4 h-4 text-kasu-green-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-200 block">KASU Main Entry Gate:</strong>
                  <span className="text-[11px] text-slate-400">Tafawa Balewa Inbound (Check-In Station)</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-kasu-dark-900 border border-kasu-dark-800">
                <MapPin className="w-4 h-4 text-kasu-red-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-200 block">KASU Main Exit Gate:</strong>
                  <span className="text-[11px] text-slate-400">Tafawa Balewa Outbound (Check-Out Station)</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Safety & Emergency Dispatch */}
          <div>
            <h3 className="font-black text-white text-xs uppercase tracking-wider mb-3.5">KASU Security Command</h3>
            <div className="bg-kasu-dark-900 rounded-2xl p-4 border border-kasu-dark-800 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-kasu-red-400 font-bold">
                <Phone className="w-3.5 h-3.5" />
                <span>Emergency Hotline: +234 (0) 800-KASU-SEC</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Security Checkpoints: 24/7 Active</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>security@kasu.edu.ng</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-kasu-dark-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} Kaduna State University (KASU). All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Main Campus, Kaduna, Nigeria</span>
            <span>Security Regulations</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
