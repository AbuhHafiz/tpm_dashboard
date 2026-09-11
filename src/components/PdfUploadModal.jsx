import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function PdfUploadModal({
  isOpen,
  onClose,
  slot,
  sectionId,
  currentMonth,
  adminToken,
  onUploadSuccess
}) {
  if (!isOpen || !slot) return null;

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [customTitle, setCustomTitle] = useState(slot.title);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isUploading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isUploading]);

  const handleFileChange = (file) => {
    setErrorMsg('');
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Hanya berkas format .PDF yang didukung!');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('Ukuran berkas maksimal 50 MB!');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Pilih berkas PDF terlebih dahulu!');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('month', currentMonth);
      formData.append('sectionId', sectionId);
      formData.append('slotId', slot.id);
      formData.append('customTitle', customTitle);
      formData.append('pdfFile', selectedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken || ''}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah PDF');
      }

      onUploadSuccess(sectionId, slot.id, data.slot);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      onClick={() => { if (!isUploading) onClose(); }}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Modal */}
        <div className="bg-[#071e3b] text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                Unggah Dokumen PDF (Mode Admin)
              </h3>
              <p className="text-[11px] text-slate-300">
                Periode: <span className="text-amber-400 font-semibold">{currentMonth}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            title="Tutup (Esc)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          
          {/* Target Slot Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Bagan Dokumen:
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Masukkan judul dokumen"
              required
            />
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
              isDragging
                ? 'border-amber-500 bg-amber-50/60'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50/40'
                : 'border-slate-300 hover:border-amber-400 bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-1 text-emerald-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="font-bold text-xs sm:text-sm text-slate-900 max-w-xs truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatBytes(selectedFile.size)} • Siap diunggah
                </p>
                <span className="text-[11px] text-amber-600 font-semibold underline mt-0.5">
                  Ganti file lain
                </span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    Sentuh atau Tarik Berkas PDF ke sini
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mendukung dokumen .PDF hingga 50 MB
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current slot info if replacing */}
          {slot.pdfUrl && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
              <FileText className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="truncate">
                <span className="font-semibold text-slate-700">Dokumen saat ini:</span>{' '}
                <span className="truncate">{slot.pdfOriginalName}</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#071e3b] hover:bg-[#0b2e59] text-amber-400 border border-amber-500/30 shadow-md transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Mengunggah...</span>
                </>
              ) : (
                <span>Simpan PDF</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}