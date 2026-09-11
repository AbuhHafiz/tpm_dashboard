import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Download, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Use stable v3 worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export default function PdfViewerModal({
  isOpen,
  onClose,
  slot
}) {
  if (!isOpen || !slot || !slot.pdfUrl) return null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [fitMode, setFitMode] = useState('width'); // 'width' or 'page'
  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const renderTaskRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const scrollContainerRef = useRef(null);

  // Close on Escape key press, left/right for pages
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setCurrentPage(p => Math.min(p + 1, numPages || 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentPage(p => Math.max(p - 1, 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, numPages]);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: slot.pdfUrl,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        if (isCancelled) return;
        console.error('Error loading PDF:', err);
        setError('Gagal memuat dokumen PDF di browser HP ini. Anda dapat mengunduh berkasnya secara langsung melalui tombol unduh.');
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy?.();
        pdfDocRef.current = null;
      }
    };
  }, [slot.pdfUrl]);

  // Render Current Page onto Canvas
  const renderPage = useCallback(async (pageNum) => {
    if (!pdfDocRef.current || !canvasRef.current) return;

    try {
      // Cancel ongoing render if any
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDocRef.current.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

      const baseViewport = page.getViewport({ scale: 1.0 });
      const screenWidth = window.innerWidth || 360;
      const screenHeight = window.innerHeight || 640;
      
      // Calculate available area taking header & footer into account
      const availableWidth = Math.max(screenWidth - 24, 260);
      const availableHeight = Math.max(screenHeight - 140, 300);

      let baseScale = 1.0;
      if (fitMode === 'page') {
        // Fit entire page (both width and height within viewport)
        baseScale = Math.min(availableWidth / baseViewport.width, availableHeight / baseViewport.height);
      } else {
        // Fit width (standard reading)
        baseScale = availableWidth / baseViewport.width;
      }

      const finalScale = baseScale * scale;
      const viewport = page.getViewport({ scale: finalScale });

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Render error:', err);
      }
    }
  }, [scale, fitMode]);

  useEffect(() => {
    if (!loading && pdfDocRef.current && currentPage > 0) {
      renderPage(currentPage);
    }
  }, [loading, currentPage, scale, fitMode, renderPage]);

  // Touch Swipe Handlers for Next/Previous page (guards against accidental page switch while scrolling)
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Only switch page if horizontal gesture is dominant (horizontal diff >> vertical diff)
    if (Math.abs(diffX) > Math.abs(diffY) * 1.6 && Math.abs(diffX) > 60) {
      if (diffX > 0) {
        // Swiped Left -> Next page
        setCurrentPage(p => Math.min(p + 1, numPages));
      } else {
        // Swiped Right -> Previous page
        setCurrentPage(p => Math.max(p - 1, 1));
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const toggleFitMode = () => {
    setFitMode(mode => (mode === 'width' ? 'page' : 'width'));
    setScale(1.0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0f1d] flex flex-col animate-in fade-in duration-100 select-none overflow-hidden">
      
      {/* Top Floating Control Bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-50 flex items-center justify-between pointer-events-none">
        
        {/* Left: Download Button + Zoom Controls + Fit Mode Toggle */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Small Download Icon (as requested) */}
          <a
            href={slot.pdfUrl}
            download={slot.pdfOriginalName || 'dokumen.pdf'}
            title="Unduh Berkas PDF"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-900/95 hover:bg-slate-950 text-amber-400 font-bold backdrop-blur-md border border-slate-700/80 shadow-2xl transition active:scale-95"
          >
            <Download className="w-4 h-4 text-amber-400" />
          </a>

          {/* Zoom Controls & Fit Mode */}
          {!loading && !error && (
            <div className="flex items-center bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-full p-0.5 shadow-2xl text-white">
              {/* Zoom Out (Allows zooming down to 25%) */}
              <button
                onClick={() => setScale(s => Math.max(s - 0.15, 0.25))}
                title="Perkecil (Zoom Out)"
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-800 text-slate-200 transition active:scale-90"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              {/* Reset to 100% */}
              <button
                onClick={() => setScale(1.0)}
                title="Reset Ukuran (100%)"
                className="px-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300"
              >
                {Math.round(scale * 100)}%
              </button>

              {/* Zoom In */}
              <button
                onClick={() => setScale(s => Math.min(s + 0.2, 3.0))}
                title="Perbesar (Zoom In)"
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-800 text-slate-200 transition active:scale-90"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {/* Toggle Fit Page / Fit Width */}
              <button
                onClick={toggleFitMode}
                title={fitMode === 'width' ? 'Tampilkan Seluruh Halaman (Pas Layar)' : 'Paskan ke Lebar Layar'}
                className={`ml-0.5 px-2 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 ${
                  fitMode === 'page'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {fitMode === 'page' ? (
                  <>
                    <Minimize2 className="w-3 h-3" />
                    <span>Pas Layar</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3 h-3" />
                    <span>Pas Lebar</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right: Close Button */}
        <div className="pointer-events-auto">
          <button
            onClick={onClose}
            title="Tutup (Esc)"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-900/95 hover:bg-slate-950 text-white font-bold backdrop-blur-md border border-slate-700/80 shadow-2xl transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Canvas Document Area with Smooth Vertical & Horizontal Scrolling */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 w-full h-full overflow-y-auto overflow-x-auto pt-16 pb-24 px-2 flex flex-col items-center justify-start touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Loading Spinner */}
        {loading && (
          <div className="my-auto flex flex-col items-center justify-center text-center p-6 text-white space-y-3">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-300">
              Membuka isi dokumen PDF...
            </p>
          </div>
        )}

        {/* Error Fallback */}
        {error && (
          <div className="my-auto max-w-sm bg-rose-950/90 border border-rose-600 rounded-2xl p-5 text-center text-white space-y-3 shadow-2xl">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-xs text-rose-200 leading-relaxed">{error}</p>
            <a
              href={slot.pdfUrl}
              download={slot.pdfOriginalName || 'dokumen.pdf'}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berkas PDF</span>
            </a>
          </div>
        )}

        {/* Canvas for Document Page - without my-auto so scroll top-to-bottom works 100% */}
        <div className="my-2 mb-20 flex flex-col items-center shadow-2xl rounded-md bg-white shrink-0">
          <canvas ref={canvasRef} className="block" />
        </div>

      </div>

      {/* Bottom Floating Page Navigator */}
      {!loading && !error && numPages > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-full shadow-2xl text-white">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded-full hover:bg-slate-800 disabled:opacity-30 transition"
            title="Halaman Sebelumnya (Geser Kanan)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-200 whitespace-nowrap px-1">
            <span className="text-amber-400">{currentPage}</span> / {numPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, numPages))}
            disabled={currentPage >= numPages}
            className="p-1 rounded-full hover:bg-slate-800 disabled:opacity-30 transition"
            title="Halaman Selanjutnya (Geser Kiri)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}