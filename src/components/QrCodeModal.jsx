import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, Copy, Check, Download, Printer, Globe, Users, ArrowLeft } from 'lucide-react';

export default function QrCodeModal({
  isOpen,
  onClose,
  currentMonth,
  networkInfo
}) {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const printCardRef = useRef(null);

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

  // Target URL always points to public view (use current domain if hosted online)
  const isOnlineHosted = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  const defaultBaseUrl = isOnlineHosted ? window.location.origin : (networkInfo?.fullUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'));
  const [customUrl, setCustomUrl] = useState(`${defaultBaseUrl}/?month=${currentMonth}`);

  const handleCopy = () => {
    navigator.clipboard.writeText(customUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const svgElement = document.getElementById('qr-code-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 100, 100, 800, 800);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_Papan_TPM_User_${currentMonth}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sticky Header Modal */}
        <div className="bg-[#071e3b] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                QR Code Akses User (Publik)
              </h3>
              <p className="text-[11px] text-slate-300">
                Pindai untuk melihat dashboard tanpa akun
              </p>
            </div>
          </div>
          
          {/* Close button with high visibility */}
          <button
            onClick={onClose}
            title="Tutup (Esc)"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition active:scale-95 flex items-center gap-1 text-xs font-semibold"
          >
            <span className="hidden xs:inline text-[11px]">Tutup</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">

          {/* User Mode Notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-start gap-2 text-xs text-emerald-900">
            <Users className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Akses Karyawan Bebas Akun:</span>
              <p className="text-[11px] text-emerald-700 mt-0.5 leading-snug">
                QR code ini aman disebarkan atau ditempel di lapangan. Karyawan yang memindai langsung dapat membaca seluruh dokumen PDF tanpa perlu login.
              </p>
            </div>
          </div>
          
          {/* Printable Card Area */}
          <div 
            ref={printCardRef}
            className="bg-gradient-to-b from-slate-50 to-amber-50/20 border-2 border-slate-300 rounded-xl p-3.5 flex flex-col items-center text-center shadow-inner"
          >
            {/* Header Badge in QR Card with Official Logo */}
            <div className="flex items-center justify-between w-full border-b border-slate-200 pb-2 mb-2.5 text-slate-800">
              <div className="flex items-center gap-2">
                <img 
                  src="/logo-semen-tonasa.png" 
                  alt="Logo Semen Tonasa" 
                  className="w-7 h-7 object-contain rounded-full shadow-xs" 
                />
                <div className="leading-tight text-left">
                  <span className="text-[11px] font-extrabold text-[#071e3b] tracking-tight block">
                    PT. SEMEN TONASA
                  </span>
                  <span className="text-[9px] font-bold text-cyan-700 tracking-wider block uppercase">
                    SGA QUALITY CONTROL 4/5
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-cyan-700 italic">
                TPM 4.0
              </span>
            </div>

            {/* QR Code Graphic */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
              <QRCodeSVG
                id="qr-code-svg"
                value={customUrl}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Month indicator */}
            <div className="mt-2.5">
              <p className="text-xs font-black text-slate-900 uppercase tracking-wide">
                Papan Kontrol Digital TPM
              </p>
              <p className="text-[11px] font-bold text-amber-600 mt-0.5">
                Periode: {currentMonth}
              </p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[240px] leading-tight">
                Arahkan kamera smartphone ke kode di atas untuk melihat dokumen papan kontrol (Akses User / Tanpa Login).
              </p>
            </div>
          </div>

          {/* URL Bar & Copy */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                URL Akses HP (Jaringan Wi-Fi):
              </span>
              {networkInfo?.localIp && (
                <span className="text-[10px] font-normal text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  IP LAN: {networkInfo.localIp}
                </span>
              )}
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition active:scale-95"
                title="Salin tautan"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons: Download & Print */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleDownloadQr}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Unduh PNG</span>
            </button>
            <button
              onClick={handlePrintCard}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition active:scale-95 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kartu QR</span>
            </button>
          </div>

        </div>

        {/* Sticky Footer with Clear 'Kembali ke Dashboard' Button */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition active:scale-95 flex items-center justify-center gap-2 shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Kembali ke Halaman Dashboard</span>
          </button>
        </div>

      </div>
    </div>
  );
}