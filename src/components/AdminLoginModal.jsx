import React, { useState, useEffect } from 'react';
import { X, Lock, KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess
}) {
  if (!isOpen) return null;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username dan password harus diisi');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      let loggedIn = false;

      // Try server API first
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            password: password.trim()
          })
        });

        if (res.ok) {
          const data = await res.json();
          onLoginSuccess(data.token);
          onClose();
          loggedIn = true;
          return;
        }
      } catch (apiErr) {
        // Fallback to client check on static platforms (e.g. Vercel)
      }

      // Standalone / Static fallback check
      if (!loggedIn) {
        if (username.trim() === 'admin' && password.trim() === 'tonasa-admin') {
          onLoginSuccess('tonasa-master-token-2026');
          onClose();
          return;
        } else {
          throw new Error('Username atau password admin salah!');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat masuk');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Modal */}
        <div className="bg-[#071e3b] text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Login Administrator
              </h3>
              <p className="text-[11px] text-slate-300">
                Papan Kontrol TPM PT. Semen Tonasa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Tutup (Esc)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          
          <div className="text-center pb-1">
            <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-1.5 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-snug">
              Masuk sebagai admin untuk mengunggah, mengubah, atau menghapus dokumen PDF.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: admin"
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              autoFocus
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin"
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 pr-10 text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>


          {/* Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition border border-slate-200"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 rounded-lg text-xs font-bold bg-[#071e3b] hover:bg-[#0b2e59] text-amber-400 border border-amber-500/30 shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Memproses...' : 'Masuk Admin'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}