import React from 'react';
import ColumnSection from './ColumnSection';

export default function FullBoardView({
  sections,
  isAdmin,
  onOpenUpload,
  onOpenView,
  onDeletePdf,
  onUpdateTitle
}) {
  if (!sections) return null;

  return (
    <div className="w-full overflow-x-auto pb-8 pt-2">
      <div className="min-w-[1020px] max-w-7xl mx-auto px-4">
        
        {/* Physical Board Title Bar Mockup */}
        <div className="mb-4 bg-white/95 border-b-4 border-[#f4b000] p-3 rounded-2xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-[#071e3b] text-[#f4b000] font-black text-xs uppercase tracking-wider">
              PAPAN KONTROL FISIK DIGITAL (1:1)
            </span>
            <span className="text-xs text-slate-600 font-semibold">
              Menampilkan seluruh bagan kolom secara berdampingan {isAdmin ? '(Mode Admin)' : '(Mode Pembaca)'}
            </span>
          </div>
          <div className="text-xs text-slate-500 italic">
            PT. Semen Tonasa • Pabrik Pangkep
          </div>
        </div>

        {/* 3 Columns Side by Side */}
        <div className="grid grid-cols-3 gap-4.5 items-start">
          {/* Column 1: PLAN MAINTENANCE */}
          <ColumnSection
            sectionId="plan-maintenance"
            sectionData={sections['plan-maintenance']}
            isAdmin={isAdmin}
            onOpenUpload={onOpenUpload}
            onOpenView={onOpenView}
            onDeletePdf={onDeletePdf}
            onUpdateTitle={onUpdateTitle}
          />

          {/* Column 2: TPM OFFICER */}
          <ColumnSection
            sectionId="tpm-officer"
            sectionData={sections['tpm-officer']}
            isAdmin={isAdmin}
            onOpenUpload={onOpenUpload}
            onOpenView={onOpenView}
            onDeletePdf={onDeletePdf}
            onUpdateTitle={onUpdateTitle}
          />

          {/* Column 3: FOCUS IMPROVEMENT */}
          <ColumnSection
            sectionId="focus-improvement"
            sectionData={sections['focus-improvement']}
            isAdmin={isAdmin}
            onOpenUpload={onOpenUpload}
            onOpenView={onOpenView}
            onDeletePdf={onDeletePdf}
            onUpdateTitle={onUpdateTitle}
          />
        </div>

      </div>
    </div>
  );
}