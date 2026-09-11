import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Eye, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  CalendarCheck
} from 'lucide-react';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
}

export default function DocumentSlot({
  slot,
  sectionId,
  index,
  isAdmin,
  onOpenUpload,
  onOpenView,
  onDeletePdf,
  onUpdateTitle
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(slot.title);
  const [subtitleValue, setSubtitleValue] = useState(slot.subtitle || '');

  const hasPdf = Boolean(slot.pdfUrl);

  const handleSaveTitle = (e) => {
    e.stopPropagation();
    if (titleValue.trim()) {
      onUpdateTitle(sectionId, slot.id, titleValue.trim(), subtitleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = (e) => {
    e.stopPropagation();
    setTitleValue(slot.title);
    setSubtitleValue(slot.subtitle || '');
    setIsEditingTitle(false);
  };

  return (
    <div className="relative group flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border-2 border-slate-200 overflow-hidden">
      
      {/* Plastic sleeve punched hole strip at top (physical realism) */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 font-bold tracking-wider text-slate-700">
          <span className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[9px]">
            {index + 1}
          </span>
          <span className="uppercase text-[10px] tracking-wider text-slate-500 font-bold">Bagan #{index + 1}</span>
        </div>

        {/* Status Badge */}
        {hasPdf ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            PDF Terpasang
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Kosong
          </span>
        )}
      </div>

      {/* Sleeve Title Section */}
      <div className="p-3 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50">
        {isEditingTitle && isAdmin ? (
          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              className="w-full text-xs font-bold text-slate-900 border border-amber-400 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Judul Bagan Dokumen"
              autoFocus
            />
            <input
              type="text"
              value={subtitleValue}
              onChange={(e) => setSubtitleValue(e.target.value)}
              className="w-full text-[11px] text-slate-600 border border-slate-300 rounded px-2 py-0.5 outline-none"
              placeholder="Keterangan singkat / Subtitle"
            />
            <div className="flex justify-end gap-1 pt-1">
              <button
                onClick={handleCancelTitle}
                className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleSaveTitle}
                className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2">
                {slot.title}
              </h4>
              {slot.subtitle && (
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {slot.subtitle}
                </p>
              )}
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="opacity-40 hover:opacity-100 p-1 text-slate-500 hover:text-amber-600 rounded transition"
                title="Edit judul bagan (Admin)"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Document Sleeve Content Body */}
      <div className="p-3 flex-1 flex flex-col justify-center">
        {hasPdf ? (
          <div className="space-y-2.5">
            {/* PDF Card Representation (Click to View) */}
            <div 
              onClick={() => onOpenView(slot, sectionId)}
              className="cursor-pointer bg-gradient-to-br from-red-50 to-rose-50/40 border border-rose-200/80 hover:border-rose-400 rounded-lg p-2.5 flex items-center gap-2.5 transition active:scale-[0.98]"
              title="Klik untuk membuka dokumen PDF"
            >
              <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                <FileText className="w-5 h-5" />
                <span className="text-[8px] font-black uppercase tracking-tighter">PDF</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate" title={slot.pdfOriginalName}>
                  {slot.pdfOriginalName || 'Dokumen.pdf'}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                  <span>{formatBytes(slot.pdfSize)}</span>
                  {slot.uploadedAt && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <CalendarCheck className="w-2.5 h-2.5" />
                        {formatDate(slot.uploadedAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              {/* Buka PDF (Available for both Admin and User) */}
              <button
                onClick={() => onOpenView(slot, sectionId)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Buka PDF</span>
              </button>

              {/* Admin-only controls: Ganti and Hapus */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => onOpenUpload(slot, sectionId)}
                    className="flex items-center justify-center p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition active:scale-95"
                    title="Ganti berkas PDF"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeletePdf(sectionId, slot.id)}
                    className="flex items-center justify-center p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition active:scale-95"
                    title="Hapus berkas PDF"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          isAdmin ? (
            /* Admin: Prompt to Upload */
            <div
              onClick={() => onOpenUpload(slot, sectionId)}
              className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/70 hover:bg-amber-50/40 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all group/empty py-6 active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 group-hover/empty:bg-amber-100 flex items-center justify-center text-slate-500 group-hover/empty:text-amber-600 transition mb-1.5">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover/empty:text-amber-800">
                Unggah Berkas PDF
              </span>
              <span className="text-[10px] text-slate-400 group-hover/empty:text-amber-600/80 mt-0.5">
                Sentuh untuk memilih file
              </span>
            </div>
          ) : (
            /* User / Public: Clean Read-Only Placeholder */
            <div className="border border-dashed border-slate-200 bg-slate-50/50 rounded-xl p-4 flex flex-col items-center justify-center text-center py-5 select-none">
              <div className="w-8 h-8 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-400 mb-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Belum Ada Dokumen
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Dokumen belum diunggah untuk periode ini
              </span>
            </div>
          )
        )}
      </div>

    </div>
  );
}