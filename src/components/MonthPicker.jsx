import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, FileCheck } from 'lucide-react';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function MonthPicker({ 
  currentMonth, 
  onChangeMonth, 
  totalUploaded = 0, 
  totalSlots = 18 
}) {
  const [yearStr, monthStr] = currentMonth.split('-');
  const currentYear = parseInt(yearStr, 10);
  const currentMonthIdx = parseInt(monthStr, 10) - 1;

  const handlePrev = () => {
    let newMonthIdx = currentMonthIdx - 1;
    let newYear = currentYear;
    if (newMonthIdx < 0) {
      newMonthIdx = 11;
      newYear -= 1;
    }
    const formatted = `${newYear}-${String(newMonthIdx + 1).padStart(2, '0')}`;
    onChangeMonth(formatted);
  };

  const handleNext = () => {
    let newMonthIdx = currentMonthIdx + 1;
    let newYear = currentYear;
    if (newMonthIdx > 11) {
      newMonthIdx = 0;
      newYear += 1;
    }
    const formatted = `${newYear}-${String(newMonthIdx + 1).padStart(2, '0')}`;
    onChangeMonth(formatted);
  };

  const handleMonthChange = (e) => {
    const selectedIdx = parseInt(e.target.value, 10);
    const formatted = `${currentYear}-${String(selectedIdx + 1).padStart(2, '0')}`;
    onChangeMonth(formatted);
  };

  const handleYearChange = (e) => {
    const selectedYear = parseInt(e.target.value, 10);
    const formatted = `${selectedYear}-${String(currentMonthIdx + 1).padStart(2, '0')}`;
    onChangeMonth(formatted);
  };

  const handleSetToday = () => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    onChangeMonth(formatted);
  };

  return (
    <div className="bg-[#0b254a]/90 backdrop-blur border-b border-slate-700/80 px-3 py-2.5 sm:px-4 sm:py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Month Selector Controls */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs sm:text-sm">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden xs:inline">Periode:</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/90 rounded-lg p-1 border border-slate-700 shadow-inner">
            <button
              onClick={handlePrev}
              title="Bulan sebelumnya"
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Select Month */}
            <select
              value={currentMonthIdx}
              onChange={handleMonthChange}
              className="bg-transparent text-white text-xs sm:text-sm font-bold px-1.5 py-0.5 outline-none cursor-pointer hover:text-amber-300"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx} value={idx} className="bg-slate-900 text-white">
                  {m}
                </option>
              ))}
            </select>

            {/* Select Year */}
            <select
              value={currentYear}
              onChange={handleYearChange}
              className="bg-transparent text-amber-400 text-xs sm:text-sm font-extrabold px-1.5 py-0.5 outline-none cursor-pointer hover:text-amber-300 border-l border-slate-700"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={handleNext}
              title="Bulan berikutnya"
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSetToday}
            className="text-[11px] font-medium px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Bulan Ini
          </button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-300 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              <strong className="text-emerald-400 font-bold">{totalUploaded}</strong>
              <span className="text-slate-400">/{totalSlots} Bagan Terisi</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}