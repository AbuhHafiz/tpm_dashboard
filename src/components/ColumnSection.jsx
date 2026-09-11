import React from 'react';
import DocumentSlot from './DocumentSlot';

export default function ColumnSection({
  sectionId,
  sectionData,
  isAdmin,
  onOpenUpload,
  onOpenView,
  onDeletePdf,
  onUpdateTitle
}) {
  if (!sectionData) return null;

  const uploadedCount = sectionData.slots.filter(s => s.pdfUrl).length;
  const totalCount = sectionData.slots.length;

  return (
    <div className="flex flex-col bg-slate-900/60 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-slate-700/60 shadow-xl">
      
      {/* Physical Board Style Header Plaque */}
      <div className="bg-white rounded-xl py-2.5 px-4 mb-3 sm:mb-4 shadow-md border-b-2 border-slate-300 flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-black tracking-wider text-slate-900 uppercase">
            {sectionData.title}
          </h2>
          {sectionData.subtitle && (
            <p className="text-[11px] text-slate-500 font-medium">
              {sectionData.subtitle}
            </p>
          )}
        </div>

        {/* Badge Count */}
        <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-300 text-xs font-bold">
          <span className={uploadedCount === totalCount ? 'text-emerald-600' : 'text-slate-700'}>
            {uploadedCount}
          </span>
          <span className="text-slate-400">/{totalCount}</span>
        </div>
      </div>

      {/* Grid of Document Sleeves */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-3.5">
        {sectionData.slots.map((slot, idx) => (
          <DocumentSlot
            key={slot.id}
            slot={slot}
            sectionId={sectionId}
            index={idx}
            isAdmin={isAdmin}
            onOpenUpload={onOpenUpload}
            onOpenView={onOpenView}
            onDeletePdf={onDeletePdf}
            onUpdateTitle={onUpdateTitle}
          />
        ))}
      </div>

    </div>
  );
}