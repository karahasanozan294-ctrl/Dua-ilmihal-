import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist/types/src/display/api';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  FolderPlus,
  Loader2,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { BUILTIN_PDF_BOOKS, BuiltInPdfBook } from '../data/pdfBooksData';
import {
  deleteStoredPdf,
  formatFileSize,
  listStoredPdfs,
  saveStoredPdf,
  StoredPdfBook,
} from '../utils/pdfStorage';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfBookReaderProps {
  mode?: 'library' | 'embedded';
  embeddedBook?: BuiltInPdfBook;
  initialPage?: number;
}

type ActivePdfDescriptor =
  | { kind: 'builtin'; book: BuiltInPdfBook }
  | { kind: 'custom'; book: StoredPdfBook };

function readSavedPage(bookId: string): number {
  try {
    const raw = window.localStorage.getItem(`mihrab_pdf_page_${bookId}`);
    const parsed = raw ? Number.parseInt(raw, 10) : 1;
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
  } catch {
    return 1;
  }
}

function saveBookPage(bookId: string, page: number) {
  try {
    window.localStorage.setItem(`mihrab_pdf_page_${bookId}`, String(page));
  } catch {
    // Ignore storage errors
  }
}

export function PdfBookReader({
  mode = 'library',
  embeddedBook = BUILTIN_PDF_BOOKS[0],
  initialPage,
}: PdfBookReaderProps) {
  const [customBooks, setCustomBooks] = useState<StoredPdfBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>(
    embeddedBook.id
  );
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(embeddedBook.pageCount);
  const [currentPage, setCurrentPage] = useState<number>(() =>
    readSavedPage(embeddedBook.id)
  );
  const [pageInput, setPageInput] = useState<string>(() =>
    String(readSavedPage(embeddedBook.id))
  );
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [fitToWidth, setFitToWidth] = useState<boolean>(true);
  const [containerWidth, setContainerWidth] = useState<number>(680);

  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(true);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mobileTocOpen, setMobileTocOpen] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportWrapRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  // Load user-uploaded PDFs from IndexedDB when in library mode
  useEffect(() => {
    if (mode !== 'library') return;
    let active = true;
    listStoredPdfs().then((items) => {
      if (active) setCustomBooks(items);
    });
    return () => {
      active = false;
    };
  }, [mode]);

  const activeDescriptor: ActivePdfDescriptor = useMemo(() => {
    if (mode === 'embedded') {
      return { kind: 'builtin', book: embeddedBook };
    }
    const builtin = BUILTIN_PDF_BOOKS.find((b) => b.id === selectedBookId);
    if (builtin) return { kind: 'builtin', book: builtin };
    const custom = customBooks.find((b) => b.id === selectedBookId);
    if (custom) return { kind: 'custom', book: custom };
    return { kind: 'builtin', book: BUILTIN_PDF_BOOKS[0] };
  }, [mode, embeddedBook, selectedBookId, customBooks]);

  const activeId = activeDescriptor.book.id;
  const activeTitle = activeDescriptor.book.title;

  // Measure canvas wrapper width cleanly for crisp Fit-to-Width rendering
  useEffect(() => {
    const el = viewportWrapRef.current;
    if (!el) return;

    const updateWidth = () => {
      const next = Math.max(280, el.clientWidth - 16);
      setContainerWidth(next);
    };
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Load the selected PDF document
  useEffect(() => {
    let cancelled = false;
    let loadedDoc: PDFDocumentProxy | null = null;
    let activeLoadingTask: ReturnType<typeof pdfjsLib.getDocument> | null = null;
    const abortController = new AbortController();

    setIsLoadingDoc(true);
    setLoadError(null);

    const openDocument = async () => {
      try {
        let pdfBytes: Uint8Array;
        if (activeDescriptor.kind === 'builtin') {
          const resolvedUrl = new URL(
            activeDescriptor.book.url.replace(/^\/+/, ''),
            window.location.href
          ).toString();
          const res = await fetch(resolvedUrl, { signal: abortController.signal });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const buf = await res.arrayBuffer();
          pdfBytes = new Uint8Array(buf);
        } else {
          pdfBytes = new Uint8Array(activeDescriptor.book.data.slice(0));
        }

        if (cancelled) return;

        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
        activeLoadingTask = loadingTask;
        const doc = await loadingTask.promise;

        if (cancelled) {
          doc.cleanup().catch(() => undefined);
          return;
        }
        loadedDoc = doc;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        const target =
          initialPage && initialPage >= 1 ? initialPage : readSavedPage(activeId);
        const restored = Math.min(Math.max(1, target), doc.numPages);
        setCurrentPage(restored);
        setPageInput(String(restored));
        setIsLoadingDoc(false);
      } catch (err) {
        if (cancelled || (err instanceof Error && err.name === 'AbortError')) {
          return;
        }
        const detail = err instanceof Error && err.message ? ` (${err.message})` : '';
        setPdfDoc(null);
        setLoadError(
          `PDF dosyası yüklenemedi. Lütfen bağlantınızı veya dosya bütünlüğünü kontrol edin.${detail}`
        );
        setIsLoadingDoc(false);
      }
    };

    openDocument();

    return () => {
      cancelled = true;
      abortController.abort();
      if (loadedDoc) {
        loadedDoc.cleanup().catch(() => undefined);
      }
      if (activeLoadingTask) {
        activeLoadingTask.destroy().catch(() => undefined);
      }
    };
  }, [activeDescriptor, activeId]);

  // Jump if caller supplies an updated initialPage while document is loaded
  useEffect(() => {
    if (!isLoadingDoc && numPages > 0 && initialPage && initialPage >= 1) {
      const bounded = Math.min(initialPage, numPages);
      setCurrentPage(bounded);
      setPageInput(String(bounded));
    }
  }, [initialPage, isLoadingDoc, numPages]);

  // Persist current page
  useEffect(() => {
    if (!isLoadingDoc && numPages > 0) {
      saveBookPage(activeId, currentPage);
      setPageInput(String(currentPage));
    }
  }, [activeId, currentPage, isLoadingDoc, numPages]);

  // Render the active page onto the HiDPI canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;
    setIsRenderingPage(true);

    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {
        // Ignore cancellation error
      }
      renderTaskRef.current = null;
    }

    pdfDoc
      .getPage(currentPage)
      .then((page) => {
        if (cancelled || !canvasRef.current) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const computedScale = fitToWidth
          ? Math.min(2.4, Math.max(0.45, containerWidth / baseViewport.width))
          : zoomScale;

        const viewport = page.getViewport({ scale: computedScale });
        const canvas = canvasRef.current;
        const dpr = Math.min(window.devicePixelRatio || 1, 2.25);

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined;

        const task = page.render({
          canvas,
          viewport,
          transform,
        });
        renderTaskRef.current = task;

        return task.promise;
      })
      .then(() => {
        if (!cancelled) {
          setIsRenderingPage(false);
        }
      })
      .catch((err: unknown) => {
        const isCancel =
          err instanceof Error && err.name === 'RenderingCancelledException';
        if (!cancelled && !isCancel) {
          setIsRenderingPage(false);
        }
      });

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Ignore cancellation error
        }
      }
    };
  }, [pdfDoc, currentPage, zoomScale, fitToWidth, containerWidth]);

  const goToPage = (target: number) => {
    const clamped = Math.min(Math.max(1, Math.round(target)), numPages || 1);
    setCurrentPage(clamped);
    setMobileTocOpen(false);
  };

  const handlePageInputSubmit = (e: FormEvent) => {
    e.preventDefault();
    const num = Number.parseInt(pageInput.trim(), 10);
    if (Number.isFinite(num)) {
      goToPage(num);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handleUploadPdf = async (e: ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      setUploadError('Lütfen yalnızca .pdf uzantılı bir dosya seçin.');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ');
      const newBook: StoredPdfBook = {
        id: `custom-pdf-${Date.now()}`,
        title: cleanTitle || file.name,
        fileName: file.name,
        sizeBytes: file.size,
        addedAt: Date.now(),
        data: buffer,
      };
      await saveStoredPdf(newBook);
      setCustomBooks((prev) => [newBook, ...prev]);
      setSelectedBookId(newBook.id);
    } catch {
      setUploadError(
        'PDF tarayıcı hafızasına kaydedilemedi. Dosya çok büyük veya depolama alanı dolu olabilir.'
      );
    }
  };

  const handleDeleteCustom = async (id: string) => {
    try {
      await deleteStoredPdf(id);
      setCustomBooks((prev) => prev.filter((item) => item.id !== id));
      if (selectedBookId === id) {
        setSelectedBookId(BUILTIN_PDF_BOOKS[0].id);
      }
    } catch {
      // Ignore delete errors
    }
  };

  const handleDownloadActive = () => {
    if (activeDescriptor.kind === 'builtin') {
      const a = document.createElement('a');
      a.href = activeDescriptor.book.url;
      a.download = `${activeDescriptor.book.id}.pdf`;
      a.click();
    } else {
      const blob = new Blob([activeDescriptor.book.data], {
        type: 'application/pdf',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeDescriptor.book.fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }
  };

  const chapters =
    activeDescriptor.kind === 'builtin' ? activeDescriptor.book.chapters : [];

  return (
    <section className="space-y-6">
      {/* Header Card in Library Mode */}
      {mode === 'library' && (
        <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
                Çevrimdışı PDF Kitap Okuyucu
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                PDF Kitaplık
              </h1>
              <p className="text-sm text-[#575C59] dark:text-[#9CA7B0]">
                Fazilet Neşriyat Resimli Muhtasar İlmihal (240 sayfa) dahili
                olarak yüklüdür. İsterseniz cihazınızdan yeni PDF kitaplar da
                ekleyebilirsiniz.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleUploadPdf}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white hover:bg-[#0C5A46] transition-colors whitespace-nowrap dark:bg-[#10B981] dark:text-[#08130F] dark:hover:bg-[#34D399]"
              >
                <FolderPlus className="h-4 w-4" />
                <span>Cihazdan PDF Ekle</span>
              </button>
            </div>
          </div>

          {uploadError && (
            <p className="mt-3 text-xs font-medium text-rose-600 dark:text-rose-400">
              {uploadError}
            </p>
          )}
        </div>
      )}

      {/* Main Split Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Book Picker & Chapters */}
        <aside className="lg:col-span-4 rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-4 dark:border-[#1E2936] dark:bg-[#121A24] space-y-5">
          {mode === 'library' && (
            <div className="space-y-2">
              <h2 className="px-1 text-xs font-semibold text-[#666C68] dark:text-[#8E9BA4]">
                Kayıtlı PDF Kitaplar ({BUILTIN_PDF_BOOKS.length + customBooks.length})
              </h2>

              <div className="space-y-1.5">
                {BUILTIN_PDF_BOOKS.map((book) => {
                  const isActive = book.id === activeId;
                  return (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => setSelectedBookId(book.id)}
                      className={`flex w-full min-h-[52px] items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? 'bg-[#0F6E56]/8 text-[#0F6E56] dark:bg-[#10B981]/12 dark:text-[#34D399]'
                          : 'hover:bg-[#FAF9F6] dark:hover:bg-[#17222E]'
                      }`}
                    >
                      <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {book.title}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#666C68] dark:text-[#8E9BA4]">
                          {book.authorOrPublisher} ·{' '}
                          <span className="font-mono-tabular">
                            {book.pageCount} sayfa
                          </span>{' '}
                          · {book.sizeLabel}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {customBooks.map((book) => {
                  const isActive = book.id === activeId;
                  return (
                    <div
                      key={book.id}
                      className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 transition-colors ${
                        isActive
                          ? 'bg-[#0F6E56]/8 text-[#0F6E56] dark:bg-[#10B981]/12 dark:text-[#34D399]'
                          : 'hover:bg-[#FAF9F6] dark:hover:bg-[#17222E]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedBookId(book.id)}
                        className="flex min-w-0 flex-1 items-start gap-3 text-left"
                      >
                        <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">
                            {book.title}
                          </div>
                          <div className="mt-0.5 text-[11px] text-[#666C68] dark:text-[#8E9BA4]">
                            Eklenen PDF · {formatFileSize(book.sizeBytes)}
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCustom(book.id)}
                        aria-label={`${book.title} sil`}
                        className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg text-[#666C68] hover:bg-rose-50 hover:text-rose-600 dark:text-[#8E9BA4] dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Direct Page Jump Input */}
          <form onSubmit={handlePageInputSubmit} className="space-y-2">
            <label
              htmlFor={`pdf-page-jump-${mode}`}
              className="block px-1 text-xs font-semibold text-[#666C68] dark:text-[#8E9BA4]"
            >
              Sayfaya Git (1 – {numPages})
            </label>
            <div className="flex items-center gap-2">
              <input
                id={`pdf-page-jump-${mode}`}
                type="number"
                min={1}
                max={numPages || 1}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                className="w-full min-h-[42px] rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] px-3 text-sm font-mono-tabular focus:border-[#0F6E56] focus:outline-none dark:border-[#243242] dark:bg-[#0D141C]"
              />
              <button
                type="submit"
                className="min-h-[42px] rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] px-4 text-xs font-medium hover:border-[#0F6E56] hover:text-[#0F6E56] transition-colors whitespace-nowrap dark:border-[#243242] dark:bg-[#0D141C]"
              >
                Git
              </button>
            </div>
          </form>

          {/* Table of Contents / Chapters for Built-in Book */}
          {chapters.length > 0 && (
            <div className="space-y-2">
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileTocOpen((v) => !v)}
                  className="flex w-full min-h-[44px] items-center justify-between rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] px-3.5 py-2 text-xs font-medium dark:border-[#243242] dark:bg-[#0D141C]"
                >
                  <span>İçindekiler ve Bölüm Geçişleri</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      mobileTocOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              <div
                className={`${
                  mobileTocOpen ? 'block' : 'hidden'
                } lg:block space-y-1 max-h-[440px] overflow-y-auto pr-1`}
              >
                <h3 className="px-1 pb-1 text-xs font-semibold text-[#666C68] dark:text-[#8E9BA4]">
                  Hızlı Bölüm Geçişi
                </h3>
                {chapters.map((ch, idx) => {
                  const nextChPage = chapters[idx + 1]?.page ?? numPages + 1;
                  const isCurrentChapter =
                    currentPage >= ch.page && currentPage < nextChPage;
                  return (
                    <button
                      key={`${ch.page}-${ch.label}`}
                      type="button"
                      onClick={() => goToPage(ch.page)}
                      className={`flex w-full min-h-[40px] items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                        isCurrentChapter
                          ? 'bg-[#0F6E56]/8 font-medium text-[#0F6E56] dark:bg-[#10B981]/12 dark:text-[#34D399]'
                          : 'text-[#363A38] hover:bg-[#FAF9F6] dark:text-[#CBD5E1] dark:hover:bg-[#17222E]'
                      }`}
                    >
                      <span className="truncate">{ch.label}</span>
                      <span className="font-mono-tabular text-[11px] text-[#666C68] dark:text-[#8E9BA4] shrink-0">
                        s. {ch.page}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Right Canvas Reading Surface */}
        <div className="lg:col-span-8 rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-4 sm:p-6 dark:border-[#1E2936] dark:bg-[#121A24] space-y-4">
          {/* Reader Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#171A19] dark:text-[#EDF2F0] truncate">
                {activeTitle}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#666C68] dark:text-[#8E9BA4]">
                <span className="font-mono-tabular">
                  Sayfa {currentPage} / {numPages}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Bookmark className="h-3 w-3 text-[#B4832C] dark:text-[#FBBF24]" />
                  Otomatik kaydedilir
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setFitToWidth(false);
                  setZoomScale((s) => Math.max(0.6, Number((s - 0.15).toFixed(2))));
                }}
                aria-label="Küçült"
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] text-[#171A19] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]"
              >
                <ZoomOut className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setFitToWidth((v) => !v)}
                className={`min-h-[40px] rounded-lg border px-3 text-xs font-medium transition-colors whitespace-nowrap ${
                  fitToWidth
                    ? 'border-[#0F6E56] bg-[#0F6E56]/8 text-[#0F6E56] dark:border-[#34D399] dark:text-[#34D399]'
                    : 'border-[#DDD7C9] bg-[#FAF9F6] text-[#171A19] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]'
                }`}
              >
                {fitToWidth ? 'Genişliğe Sığdır' : `%${Math.round(zoomScale * 100)}`}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFitToWidth(false);
                  setZoomScale((s) => Math.min(2.4, Number((s + 0.15).toFixed(2))));
                }}
                aria-label="Büyüt"
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] text-[#171A19] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]"
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleDownloadActive}
                aria-label="PDF İndir"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] px-3 text-xs font-medium text-[#171A19] hover:border-[#0F6E56] hover:text-[#0F6E56] whitespace-nowrap dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>İndir</span>
              </button>
            </div>
          </div>

          {/* PDF Canvas Stage */}
          <div
            ref={viewportWrapRef}
            className="relative flex min-h-[460px] flex-col items-center justify-start overflow-x-auto rounded-xl border border-[#EEEAE0] bg-[#F3EFE6] p-2 sm:p-4 dark:border-[#1E2936] dark:bg-[#0B1117]"
          >
            {isLoadingDoc && (
              <div className="flex flex-col items-center justify-center py-24 text-sm text-[#575C59] dark:text-[#9CA7B0]">
                <Loader2 className="h-6 w-6 animate-spin text-[#0F6E56] dark:text-[#34D399]" />
                <span className="mt-3">PDF sayfaları hazırlanıyor...</span>
              </div>
            )}

            {loadError && (
              <div className="py-16 px-4 text-center text-sm text-rose-600 dark:text-rose-400">
                {loadError}
              </div>
            )}

            {!isLoadingDoc && !loadError && (
              <div className="relative flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="rounded-lg bg-white shadow-sm"
                />
                {isRenderingPage && (
                  <div className="pointer-events-none absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-[11px] text-white">
                    Yükleniyor...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Page Navigation Bar */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              disabled={currentPage <= 1 || isLoadingDoc}
              onClick={() => goToPage(currentPage - 1)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] px-4 py-2 text-xs font-medium text-[#171A19] hover:border-[#0F6E56] disabled:opacity-40 dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Önceki Sayfa</span>
            </button>

            <div className="text-xs font-mono-tabular text-[#575C59] dark:text-[#9CA7B0]">
              {currentPage} / {numPages}
            </div>

            <button
              type="button"
              disabled={currentPage >= numPages || isLoadingDoc}
              onClick={() => goToPage(currentPage + 1)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white hover:bg-[#0C5A46] disabled:opacity-40 dark:bg-[#10B981] dark:text-[#08130F] dark:hover:bg-[#34D399]"
            >
              <span>Sonraki Sayfa</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
