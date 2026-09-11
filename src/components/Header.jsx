import React from 'react';
import { QrCode, Monitor, Smartphone, RefreshCw, Lock, LogOut, ShieldCheck } from 'lucide-react';

export default function Header({ 
  viewMode, 
  setViewMode, 
  onOpenQr, 
  onRefresh, 
  isLoading,
  isAdmin,
  onOpenLogin,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#071e3b] border-b-4 border-[#f4b000] shadow-xl text-white">
      {/* Top corporate banner */}
      <div className="max-w-7xl mx-auto px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-2">
        
        {/* Left: Semen Tonasa Logo & Corporate Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Semen Tonasa Circular Badge */}
          <div className="flex items-center justify-center bg-white rounded-full p-0.5 sm:p-1 shadow-md shrink-0 border border-slate-200">
            <img 
              src="/logo-semen-tonasa.png" 
              alt="Logo PT Semen Tonasa" 
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full"
            />
          </div>

          <div className="leading-tight">
            <div className="text-[10px] sm:text-xs text-slate-300 font-medium tracking-wide uppercase">
              Semen Indonesia Group
            </div>
            <div className="text-base sm:text-xl font-extrabold text-[#f4b000] tracking-tight drop-shadow-sm flex items-center gap-1.5">
              PT. Semen Tonasa
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-cyan-400 tracking-wider uppercase mt-0.5">
              SGA QUALITY CONTROL 4/5
            </div>
          </div>
        </div>

        {/* Right: TPM 4.0 & Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* TPM 4.0 Badge */}
          <div className="flex flex-col items-end pr-1 sm:pr-2 border-r border-slate-700 hidden xs:flex">
            <div className="flex items-baseline gap-0.5">
              <span className="text-base sm:text-xl font-black text-white tracking-tighter italic">tpm</span>
              <span className="text-[10px] sm:text-xs font-bold text-cyan-400">4.0</span>
            </div>
            <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-widest">
              Smart Board
            </span>
          </div>

          {/* Role Status & Login / Logout Button */}
          {isAdmin ? (
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] sm:text-xs shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </div>
              <button
                onClick={onLogout}
                title="Keluar dari mode Administrator"
                className="p-1.5 sm:p-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 transition active:scale-95 flex items-center gap-1 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline font-semibold">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              title="Login sebagai Admin untuk mengelola dokumen"
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 shadow-sm transition active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Login Admin</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="Muat ulang data"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin text-yellow-400' : ''}`} />
          </button>

          {/* QR Code Trigger Button */}
          <button
            onClick={onOpenQr}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
          >
            <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
            <span className="hidden sm:inline">QR Code</span>
            <span className="sm:hidden">QR</span>
          </button>

          {/* Mode Toggle (Mobile Tab vs Papan Penuh) */}
          <button
            onClick={() => setViewMode(viewMode === 'mobile' ? 'full-board' : 'mobile')}
            className={`flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg text-xs font-semibold border transition ${
              viewMode === 'full-board'
                ? 'bg-cyan-600 border-cyan-400 text-white shadow-inner'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={viewMode === 'mobile' ? 'Beralih ke Tampilan Papan Penuh (Desktop/Wide)' : 'Beralih ke Tampilan Mobile Tab'}
          >
            {viewMode === 'mobile' ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Papan Penuh</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Mode HP</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}