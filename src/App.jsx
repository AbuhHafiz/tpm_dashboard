import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MonthPicker from './components/MonthPicker';
import ColumnSection from './components/ColumnSection';
import FullBoardView from './components/FullBoardView';
import PdfUploadModal from './components/PdfUploadModal';
import PdfViewerModal from './components/PdfViewerModal';
import QrCodeModal from './components/QrCodeModal';
import AdminLoginModal from './components/AdminLoginModal';
import { Wrench, Users, TrendingUp, AlertTriangle } from 'lucide-react';

export default function App() {
  // Read initial month from URL search param if present
  const getInitialMonth = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const m = params.get('month');
      if (m && /^\d{4}-\d{2}$/.test(m)) {
        return m;
      }
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const [currentMonth, setCurrentMonth] = useState(getInitialMonth);
  const [sections, setSections] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('plan-maintenance');
  const [viewMode, setViewMode] = useState('mobile'); // 'mobile' or 'full-board'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Authentication State
  const [adminToken, setAdminToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tonasa_admin_token') || '';
    }
    return '';
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      return Boolean(localStorage.getItem('tonasa_admin_token'));
    }
    return false;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Modals state
  const [uploadTarget, setUploadTarget] = useState(null); // { slot, sectionId }
  const [viewTarget, setViewTarget] = useState(null); // slot
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Verify Admin Token on mount
  useEffect(() => {
    if (adminToken) {
      fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (!data.valid) {
            handleLogout();
          }
        })
        .catch(() => {
          // Keep offline if server temporarily unreachable
        });
    }
  }, [adminToken]);

  // Fetch Network Info once
  useEffect(() => {
    fetch('/api/network-info')
      .then(res => res.json())
      .then(data => setNetworkInfo(data))
      .catch(() => {
        if (typeof window !== 'undefined') {
          setNetworkInfo({ fullUrl: window.location.origin });
        }
      });
  }, []);

  // Fetch board data when currentMonth changes
  const fetchBoardData = async (month) => {
    setIsLoading(true);
    setError(null);
    try {
      let boardSections = null;

      // Try live API first
      try {
        const res = await fetch(`/api/board?month=${month}`);
        if (res.ok) {
          const data = await res.json();
          boardSections = data.sections;
        }
      } catch (apiErr) {
        // Fall back to static data
      }

      // Fallback to static JSON if API fails (e.g. on Vercel)
      if (!boardSections) {
        const staticRes = await fetch(`/data/board-data.json`);
        if (staticRes.ok) {
          const allData = await staticRes.json();
          boardSections = allData[month] || null;
        }
      }

      if (!boardSections) {
        throw new Error('Data untuk bulan ini belum tersedia atau server tidak merespons');
      }

      setSections(boardSections);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData(currentMonth);
    // Sync browser URL without reloading
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('month', currentMonth);
      window.history.replaceState({}, '', url);
    }
  }, [currentMonth]);

  // Handle Month Change
  const handleChangeMonth = (newMonth) => {
    setCurrentMonth(newMonth);
  };

  // Auth Handlers
  const handleLoginSuccess = (token) => {
    localStorage.setItem('tonasa_admin_token', token);
    setAdminToken(token);
    setIsAdmin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('tonasa_admin_token');
    setAdminToken('');
    setIsAdmin(false);
  };

  // Upload handler
  const handleOpenUpload = (slot, sectionId) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    setUploadTarget({ slot, sectionId });
  };

  const handleUploadSuccess = (sectionId, slotId, updatedSlot) => {
    setSections(prev => {
      if (!prev || !prev[sectionId]) return prev;
      const newSlots = prev[sectionId].slots.map(s => s.id === slotId ? updatedSlot : s);
      return {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          slots: newSlots
        }
      };
    });
  };

  // View PDF handler
  const handleOpenView = (slot) => {
    setViewTarget(slot);
  };

  // Delete PDF handler
  const handleDeletePdf = async (sectionId, slotId) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    if (!window.confirm('Apakah Anda yakin ingin menghapus berkas PDF ini dari bagan?')) {
      return;
    }

    try {
      const res = await fetch(`/api/slot-pdf?month=${currentMonth}&sectionId=${sectionId}&slotId=${slotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        throw new Error('Website Vercel ini adalah tampilan publik. Untuk menghapus PDF, lakukan di laptop Anda (localhost:3000) lalu klik file "push-to-github.bat".');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus PDF');

      setSections(prev => {
        if (!prev || !prev[sectionId]) return prev;
        const newSlots = prev[sectionId].slots.map(s => s.id === slotId ? data.slot : s);
        return {
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            slots: newSlots
          }
        };
      });
    } catch (err) {
      alert(err.message);
    }
  };

  // Update Title handler
  const handleUpdateTitle = async (sectionId, slotId, title, subtitle) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/slot-title', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          month: currentMonth,
          sectionId,
          slotId,
          title,
          subtitle
        })
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        throw new Error('Website Vercel ini adalah tampilan publik. Untuk mengubah judul, lakukan di laptop Anda (localhost:3000) lalu klik file "push-to-github.bat".');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah judul');

      setSections(prev => {
        if (!prev || !prev[sectionId]) return prev;
        const newSlots = prev[sectionId].slots.map(s => s.id === slotId ? data.slot : s);
        return {
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            slots: newSlots
          }
        };
      });
    } catch (err) {
      alert(err.message);
    }
  };

  // Calculate statistics
  let totalUploaded = 0;
  let totalSlots = 0;
  if (sections) {
    Object.values(sections).forEach(sec => {
      totalSlots += sec.slots.length;
      sec.slots.forEach(slot => {
        if (slot.pdfUrl) totalUploaded++;
      });
    });
  }

  return (
    <div className="min-h-screen bg-board-pattern flex flex-col selection:bg-amber-400 selection:text-slate-900 text-slate-100">
      
      {/* 1. Header (SIG + Semen Tonasa + TPM 4.0 + RBAC Controls) */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenQr={() => setIsQrModalOpen(true)}
        onRefresh={() => fetchBoardData(currentMonth)}
        isLoading={isLoading}
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. Month Picker Component */}
      <MonthPicker
        currentMonth={currentMonth}
        onChangeMonth={handleChangeMonth}
        totalUploaded={totalUploaded}
        totalSlots={totalSlots}
      />

      {/* Error Banner if any */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-rose-900/80 border border-rose-600 text-rose-200 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-300" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 3. Main Board Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 py-4 sm:px-4 sm:py-6">
        {viewMode === 'full-board' ? (
          /* FULL BOARD VIEW: Panoramic 1:1 like physical board */
          <FullBoardView
            sections={sections}
            isAdmin={isAdmin}
            onOpenUpload={handleOpenUpload}
            onOpenView={handleOpenView}
            onDeletePdf={handleDeletePdf}
            onUpdateTitle={handleUpdateTitle}
          />
        ) : (
          /* MOBILE TAB VIEW: Optimized for Smartphone Screens */
          <div className="space-y-4">
            
            {/* Mobile Tab Switcher Buttons */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1 bg-slate-950/70 backdrop-blur rounded-2xl border border-slate-800 shadow-lg">
              
              {/* Tab 1: PLAN MAINTENANCE */}
              <button
                onClick={() => setActiveTab('plan-maintenance')}
                className={`py-2 px-1.5 sm:px-3 rounded-xl font-bold text-[11px] sm:text-xs transition flex flex-col items-center justify-center gap-1 ${
                  activeTab === 'plan-maintenance'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">PLAN MAINTENANCE</span>
                </div>
                {sections && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === 'plan-maintenance' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {sections['plan-maintenance']?.slots.filter(s => s.pdfUrl).length || 0}/{sections['plan-maintenance']?.slots.length || 5} PDF
                  </span>
                )}
              </button>

              {/* Tab 2: TPM OFFICER */}
              <button
                onClick={() => setActiveTab('tpm-officer')}
                className={`py-2 px-1.5 sm:px-3 rounded-xl font-bold text-[11px] sm:text-xs transition flex flex-col items-center justify-center gap-1 ${
                  activeTab === 'tpm-officer'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">TPM OFFICER</span>
                </div>
                {sections && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === 'tpm-officer' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {sections['tpm-officer']?.slots.filter(s => s.pdfUrl).length || 0}/{sections['tpm-officer']?.slots.length || 6} PDF
                  </span>
                )}
              </button>

              {/* Tab 3: FOCUS IMPROVEMENT */}
              <button
                onClick={() => setActiveTab('focus-improvement')}
                className={`py-2 px-1.5 sm:px-3 rounded-xl font-bold text-[11px] sm:text-xs transition flex flex-col items-center justify-center gap-1 ${
                  activeTab === 'focus-improvement'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">FOCUS IMPROVE</span>
                </div>
                {sections && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === 'focus-improvement' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {sections['focus-improvement']?.slots.filter(s => s.pdfUrl).length || 0}/{sections['focus-improvement']?.slots.length || 6} PDF
                  </span>
                )}
              </button>

            </div>

            {/* Active Column Content */}
            {sections && (
              <div className="animate-in fade-in-50 duration-200">
                <ColumnSection
                  sectionId={activeTab}
                  sectionData={sections[activeTab]}
                  isAdmin={isAdmin}
                  onOpenUpload={handleOpenUpload}
                  onOpenView={handleOpenView}
                  onDeletePdf={handleDeletePdf}
                  onUpdateTitle={handleUpdateTitle}
                />
              </div>
            )}

          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="bg-slate-950/90 border-t border-slate-800 py-3 text-center text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <div>
            PT. Semen Tonasa © {new Date().getFullYear()} • Total Productive Maintenance (TPM 4.0)
          </div>
          <div className="text-slate-400">
            Sistem Digitalisasi Papan Kontrol Pabrik {isAdmin ? '• Mode Admin' : '• Mode Pembaca'}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <PdfUploadModal
        isOpen={Boolean(uploadTarget)}
        onClose={() => setUploadTarget(null)}
        slot={uploadTarget?.slot}
        sectionId={uploadTarget?.sectionId}
        currentMonth={currentMonth}
        adminToken={adminToken}
        onUploadSuccess={handleUploadSuccess}
      />

      <PdfViewerModal
        isOpen={Boolean(viewTarget)}
        onClose={() => setViewTarget(null)}
        slot={viewTarget}
      />

      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        currentMonth={currentMonth}
        networkInfo={networkInfo}
      />

    </div>
  );
}