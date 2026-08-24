import { useState } from 'react';
import FidsonLogo from './FidsonLogo';
import Icon from './Icon';
import type { SignedInUser } from '../types';

interface LoginScreenProps {
  onLogin: (user: SignedInUser) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);

  // Simulates the Microsoft 365 redirect. Real auth is Entra ID; there is no app password (AC 1.1).
  const handleMicrosoftSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin({ email: 'demo@fidson.com', signedInEmail: 'demo@fidson.com' });
    }, 1100);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left brand panel */}
      <div
        className="lg:w-1/2 relative overflow-hidden flex flex-col p-6 sm:p-10 lg:p-16 text-white"
        style={{ background: 'linear-gradient(135deg, #0A1830 0%, #142A5A 50%, #1a3a6e 100%)', minHeight: '40vh' }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(91, 183, 73, 0.4) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(91, 183, 73, 0.25) 0%, transparent 50%)'
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 flex items-center gap-3 fade-up">
          <div className="bg-white rounded-xl p-1.5">
            <FidsonLogo size={36} />
          </div>
          <div>
            <p className="font-display text-lg font-extrabold tracking-tight">FIDSON</p>
            <p className="text-[11px] text-leaf-300 tracking-wider uppercase">Healthcare Plc</p>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center mt-12 lg:mt-0 max-w-lg">
          <p className="text-leaf-300 text-xs font-bold tracking-[0.2em] uppercase fade-up stagger-1">FieldForce · SFA · CRM</p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight fade-up stagger-2">
            One platform.<br />
            <span className="text-leaf-300">Every rep.</span><br />
            Every order.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-navy-200 leading-relaxed fade-up stagger-3 max-w-md">
            Sales Force Automation built for Fidson · institutional, trade, and frontline channels across all 6 Nigerian regions, with AI forecasting, GPS-verified visits, and SOA-integrated ordering.
          </p>

          <div className="mt-8 flex flex-wrap gap-2 fade-up stagger-4">
            {['GPS Verified Visits', 'AI Next-Best-Action', 'SOA Integrated', 'Offline-First'].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-white/90 backdrop-blur-sm">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-8 lg:mt-0">
          <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase">Built by Tales Consulting · For Fidson Healthcare</p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-paper">
        <div className="w-full max-w-md fade-up stagger-2">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Welcome back</h2>
          <p className="text-sm text-navy-500 mt-1">Sign in to access your dashboard</p>

          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={handleMicrosoftSignIn}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-navy-700 text-white font-display font-semibold text-sm btn-press hover:bg-navy-800 disabled:opacity-70 flex items-center justify-center gap-2.5 transition-colors"
            >
              {loading ? (
                <>
                  <Icon name="refresh" size={16} className="spin" />
                  Signing you in with Microsoft...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <rect x="0" y="0" width="7.4" height="7.4" fill="#F25022" />
                    <rect x="8.6" y="0" width="7.4" height="7.4" fill="#7FBA00" />
                    <rect x="0" y="8.6" width="7.4" height="7.4" fill="#00A4EF" />
                    <rect x="8.6" y="8.6" width="7.4" height="7.4" fill="#FFB900" />
                  </svg>
                  Sign in with Microsoft 365
                </>
              )}
            </button>

            <p className="text-xs text-navy-500 leading-relaxed text-center px-2">
              Use your existing Fidson Microsoft 365 account. There is no separate password:
              access is granted and removed by Fidson IT through security groups.
            </p>
          </div>

          <div className="mt-6 p-4 rounded-xl border-2 border-dashed border-leaf-300 bg-leaf-50">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-leaf-500 flex items-center justify-center flex-shrink-0">
                <Icon name="sparkles" size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[11px] font-bold text-leaf-800 tracking-wider uppercase">Demo Mode</p>
                  <span className="px-1.5 py-0.5 rounded bg-leaf-500 text-white text-[9px] font-bold tracking-wider">8 ROLES</span>
                </div>
                <p className="text-xs text-leaf-700 mt-1.5 leading-relaxed">
                  Sign in once and switch between <strong>Rep</strong>, <strong>ASM</strong>, <strong>RSM</strong>, <strong>FSM</strong>, <strong>PM</strong>, <strong>MM</strong>, <strong>DM</strong>, and <strong>NSM</strong> · Fidson's full org chart across Nigeria.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-[10px] text-navy-400 text-center tracking-wider">
            POWERED BY TALES CONSULTING · v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
