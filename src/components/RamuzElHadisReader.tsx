import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Library,
  Loader2,
  RotateCcw,
  Search,
} from 'lucide-react';
import { normalizeTurkish } from '../data/cities';
import { BUILTIN_PDF_BOOKS } from '../data/pdfBooksData';
import {
  fetchRamuzDataset,
  RAMUZ_BOOK_META,
  RAMUZ_FEATURED_HADITHS,
  RAMUZ_PREFACE,
  RAMUZ_SOURCE_REMIZLERI,
  RamuzChapter,
  RamuzDataset,
} from '../data/ramuzElHadisData';
import { PdfBookReader } from './PdfBookReader';

type RamuzViewMode = 'text' | 'selected' | 'pdf1' | 'pdf2';

interface SavedBookmark {
  chapterId: string;
  page: number;
  title: string;
}

const BOOKMARK_KEY = 'mihrab_ramuz_bookmark';
const ACTIVE_CHAPTER_KEY = 'mihrab_ramuz_chapter';
const PAGES_PER_BATCH = 8;

function readSavedBookmark(): SavedBookmark | null {
  try {
    const raw = window.localStorage.getItem(BOOKMARK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedBookmark;
    return parsed?.chapterId && typeof parsed.page === 'number' ? parsed : null;
  } catch {
    return null;
  }
}

export function RamuzElHadisReader() {
  const [viewMode, setViewMode] = useState<RamuzViewMode>('text');
  const [dataset, setDataset] = useState<RamuzDataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  const [volumeFilter, setVolumeFilter] = useState<'all' | 1 | 2>('all');
  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    try {
      return window.localStorage.getItem(ACTIVE_CHAPTER_KEY) || 'preface';
    } catch {
      return 'preface';
    }
  });
  const [pageBatch, setPageBatch] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileChaptersOpen, setMobileChaptersOpen] = useState(false);

  const [bookmark, setBookmark] = useState<SavedBookmark | null>(() =>
    readSavedBookmark()
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pdfJumpPage, setPdfJumpPage] = useState<number | undefined>(undefined);

  const contentTopRef = useRef<HTMLDivElement | null>(null);

  const cilt1PdfBook = useMemo(
    () =>
      BUILTIN_PDF_BOOKS.find((b) => b.id === 'ramuz-el-hadis-cilt-1') ??
      BUILTIN_PDF_BOOKS[0],
    []
  );
  const cilt2PdfBook = useMemo(
    () =>
      BUILTIN_PDF_BOOKS.find((b) => b.id === 'ramuz-el-hadis-cilt-2') ??
      BUILTIN_PDF_BOOKS[0],
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    fetchRamuzDataset(controller.signal)
      .then((data) => {
        setDataset(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if ((err as Error).name !== 'AbortError') {
          setLoadError(
            'Râmûzü’l-Ehâdîs tam metin veritabanı yüklenirken bir hata oluştu.'
          );
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [reloadNonce]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ACTIVE_CHAPTER_KEY, selectedChapterId);
    } catch {
      // Ignore storage failures
    }
  }, [selectedChapterId]);

  const filteredChapters = useMemo(() => {
    if (!dataset) return [];
    if (volumeFilter === 'all') return dataset.chapters;
    return dataset.chapters.filter((ch) => ch.volume === volumeFilter);
  }, [dataset, volumeFilter]);

  const activeChapter: RamuzChapter | null = useMemo(() => {
    if (!dataset || selectedChapterId === 'preface') return null;
    return (
      dataset.chapters.find((ch) => ch.id === selectedChapterId) ??
      dataset.chapters[0] ??
      null
    );
  }, [dataset, selectedChapterId]);

  const normalizedQuery = useMemo(
    () => normalizeTurkish(searchQuery.trim()),
    [searchQuery]
  );

  const searchResults = useMemo(() => {
    if (!dataset || normalizedQuery.length < 2) return null;
    const matches: {
      chapter: RamuzChapter;
      page: number;
      snippet: string;
    }[] = [];

    for (const ch of dataset.chapters) {
      if (volumeFilter !== 'all' && ch.volume !== volumeFilter) continue;
      for (const pg of ch.pages) {
        const joined = pg.paragraphs.join(' ');
        const norm = normalizeTurkish(joined);
        const idx = norm.indexOf(normalizedQuery);
        if (idx !== -1) {
          const start = Math.max(0, idx - 60);
          const end = Math.min(joined.length, idx + 190);
          const rawSlice = joined.slice(start, end).trim();
          matches.push({
            chapter: ch,
            page: pg.p,
            snippet: `${start > 0 ? '…' : ''}${rawSlice}${end < joined.length ? '…' : ''}`,
          });
          if (matches.length >= 60) return matches;
        }
      }
    }
    return matches;
  }, [dataset, normalizedQuery, volumeFilter]);

  const totalBatches = activeChapter
    ? Math.max(1, Math.ceil(activeChapter.pages.length / PAGES_PER_BATCH))
    : 1;
  const safeBatch = Math.min(pageBatch, totalBatches);

  const visiblePages = useMemo(() => {
    if (!activeChapter) return [];
    const startIdx = (safeBatch - 1) * PAGES_PER_BATCH;
    return activeChapter.pages.slice(startIdx, startIdx + PAGES_PER_BATCH);
  }, [activeChapter, safeBatch]);

  const handleSelectChapter = (chapterId: string, targetPage?: number) => {
    setSearchQuery('');
    setSelectedChapterId(chapterId);
    setMobileChaptersOpen(false);

    if (chapterId !== 'preface' && dataset && targetPage) {
      const ch = dataset.chapters.find((c) => c.id === chapterId);
      if (ch) {
        const idx = ch.pages.findIndex((pg) => pg.p >= targetPage);
        const batch = idx >= 0 ? Math.floor(idx / PAGES_PER_BATCH) + 1 : 1;
        setPageBatch(batch);
        setTimeout(() => {
          document
            .getElementById(`ramuz-page-${targetPage}`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 70);
        return;
      }
    }

    setPageBatch(1);
    contentTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleOpenPdfAtPage = (volume: 1 | 2, page?: number) => {
    setPdfJumpPage(page);
    setViewMode(volume === 1 ? 'pdf1' : 'pdf2');
    contentTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBookmarkPage = (chapter: RamuzChapter, page: number) => {
    const next: SavedBookmark = {
      chapterId: chapter.id,
      page,
      title: `Cilt ${chapter.volume} · ${String(chapter.chapterNo).padStart(2, '0')}. ${chapter.title}`,
    };
    setBookmark(next);
    try {
      window.localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  };

  const handleCopyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const activeChapterIndex = useMemo(() => {
    if (!dataset || !activeChapter) return -1;
    return dataset.chapters.findIndex((c) => c.id === activeChapter.id);
  }, [dataset, activeChapter]);

  return (
    <section className="space-y-6">
      {/* Archival Book Header */}
      <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex h-36 w-28 shrink-0 flex-col items-center justify-center rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-3 text-center dark:border-[#243242] dark:bg-[#0D141C]">
            <Library className="h-7 w-7 text-[#0F6E56] dark:text-[#34D399]" />
            <span className="mt-2 font-display text-xs font-semibold leading-tight text-[#171A19] dark:text-[#EDF2F0]">
              Râmûzü’l-Ehâdîs
            </span>
            <span className="mt-0.5 text-[10px] text-[#666C68] dark:text-[#8E9BA4]">
              Gümüşhânevî (k.s.)
            </span>
          </div>

          <div className="flex-1 space-y-2.5">
            <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
              {RAMUZ_BOOK_META.author}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#171A19] dark:text-[#EDF2F0] [text-wrap:balance]">
              {RAMUZ_BOOK_META.title} — Hadis Külliyatı ve Dersleri
            </h1>
            <p className="text-sm font-medium text-[#363A38] dark:text-[#CBD5E1]">
              {RAMUZ_BOOK_META.commentator}
            </p>
            <p className="text-xs leading-relaxed text-[#666C68] dark:text-[#8E9BA4]">
              {RAMUZ_BOOK_META.structureSummary} ·{' '}
              <span className="font-mono-tabular">
                {RAMUZ_BOOK_META.totalVolumes}
              </span>{' '}
              Cilt ·{' '}
              <span className="font-mono-tabular">
                {RAMUZ_BOOK_META.totalChapters}
              </span>{' '}
              Ders ·{' '}
              <span className="font-mono-tabular">
                {RAMUZ_BOOK_META.totalPages}
              </span>{' '}
              Sayfa
            </p>

            {/* View Mode Segmented Switch */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div
                role="tablist"
                aria-label="Râmûzü’l-Ehâdîs Görünüm Modu"
                className="inline-flex flex-wrap rounded-lg bg-[#EAE5DA] p-1 dark:bg-[#16202C]"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === 'text'}
                  onClick={() => setViewMode('text')}
                  className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    viewMode === 'text'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Okuma Modu (34 Ders)</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === 'selected'}
                  onClick={() => setViewMode('selected')}
                  className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    viewMode === 'selected'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  <Library className="h-3.5 w-3.5" />
                  <span>Seçme Hadisler & Remizler</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === 'pdf1'}
                  onClick={() => {
                    setPdfJumpPage(undefined);
                    setViewMode('pdf1');
                  }}
                  className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    viewMode === 'pdf1'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Orijinal PDF · Cilt 1 (647 s.)</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === 'pdf2'}
                  onClick={() => {
                    setPdfJumpPage(undefined);
                    setViewMode('pdf2');
                  }}
                  className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    viewMode === 'pdf2'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Orijinal PDF · Cilt 2 (636 s.)</span>
                </button>
              </div>
            </div>

            {viewMode === 'text' && (
              <div className="pt-2 flex flex-col md:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666C68] dark:text-[#8E9BA4]" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="İki cilt (1.283 sayfa) içinde kelime veya hadis ara (ör. niyet, sabır, anne, salât)..."
                    className="w-full min-h-[44px] rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] pl-9 pr-3 text-sm text-[#171A19] outline-none focus:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]"
                  />
                </div>
                {bookmark && (
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectChapter(bookmark.chapterId, bookmark.page)
                    }
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#DDD7C9] px-3.5 text-xs font-medium text-[#0F6E56] hover:bg-[#FAF9F6] dark:border-[#243242] dark:text-[#34D399] dark:hover:bg-[#17222E] whitespace-nowrap shrink-0"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>
                      Kaldığın Yer (s. {bookmark.page})
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mode: Selected Hadiths + Gümüşhanevî Source Remizleri */}
      {viewMode === 'selected' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 dark:border-[#1E2936] dark:bg-[#121A24] space-y-5">
            <div className="border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
              <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
                Harekeli Arapça Metin · Kaynak Remizleri · Türkçe Tercüme
              </div>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                Râmûzü’l-Ehâdîs’ten Seçme Hadis-i Şerifler
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#666C68] dark:text-[#8E9BA4]">
                Gümüşhânevî Hazretleri’nin alfabetik tertibinden derlenen temel hadis-i şerifler ve müellifin kullandığı orijinal kaynak kısaltma (remiz) anahtarı.
              </p>
            </div>

            <div className="space-y-4">
              {RAMUZ_FEATURED_HADITHS.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-5 dark:border-[#243242] dark:bg-[#0D141C] space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#666C68] dark:text-[#8E9BA4]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-[#0F6E56] dark:text-[#34D399]">
                        {item.letterGroup}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.ramuzRef}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.lessonVolume && item.lessonPage && (
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenPdfAtPage(
                              item.lessonVolume!,
                              item.lessonPage
                            )
                          }
                          className="min-h-[32px] rounded-lg border border-[#DDD7C9] px-2.5 py-1 text-[11px] font-medium text-[#0F6E56] hover:bg-white dark:border-[#243242] dark:text-[#34D399] dark:hover:bg-[#17222E] whitespace-nowrap"
                        >
                          PDF s. {item.lessonPage}’de Gör
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(
                            item.id,
                            `${item.arabic}\n\n${item.turkish}\n— ${item.narrator} (${item.sourceDetail} · ${item.ramuzRef})`
                          )
                        }
                        className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-[#DDD7C9] px-2.5 py-1 text-[11px] font-medium text-[#575C59] hover:bg-white dark:border-[#243242] dark:text-[#9CA7B0] dark:hover:bg-[#17222E]"
                      >
                        {copiedKey === item.id ? (
                          <>
                            <Check className="h-3 w-3 text-[#0F6E56] dark:text-[#34D399]" />
                            <span>Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Kopyala</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p
                    dir="rtl"
                    lang="ar"
                    className="font-serif text-xl sm:text-2xl leading-[2.1] text-right text-[#171A19] dark:text-[#EDF2F0]"
                  >
                    {item.arabic}
                  </p>

                  <p className="text-xs italic text-[#666C68] dark:text-[#8E9BA4]">
                    ({item.transliteration})
                  </p>

                  <p className="max-w-prose text-sm sm:text-base leading-relaxed text-[#171A19] dark:text-[#EDF2F0]">
                    “{item.turkish}”
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E0D5] pt-3 text-xs dark:border-[#1E2936]">
                    <span className="font-medium text-[#363A38] dark:text-[#CBD5E1]">
                      Râvi: {item.narrator}
                    </span>
                    <span className="text-[#B4832C] dark:text-[#FBBF24]">
                      {item.remiz} · {item.sourceDetail}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Gümüşhanevî Source Abbreviation Glossary */}
          <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 dark:border-[#1E2936] dark:bg-[#121A24] space-y-4">
            <div className="border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
              <div className="text-xs font-medium text-[#B4832C] dark:text-[#FBBF24]">
                Hadis Usûlü · Kısaltmalar Sözlüğü
              </div>
              <h2 className="mt-1 font-display text-xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                Râmûzü’l-Ehâdîs Kaynak Remizleri (Kısaltmaları)
              </h2>
              <p className="mt-1 text-xs text-[#666C68] dark:text-[#8E9BA4]">
                Ahmed Ziyâeddin Gümüşhânevî Hazretleri’nin her hadis metninin sonunda muhaddisi ve kitabını göstermek için kullandığı rumuzlar:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {RAMUZ_SOURCE_REMIZLERI.map((r) => (
                <div
                  key={r.symbol}
                  className="flex items-center gap-3 rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] px-3.5 py-2.5 dark:border-[#243242] dark:bg-[#0D141C]"
                >
                  <span
                    dir="rtl"
                    lang="ar"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#DDD7C9] bg-white font-serif text-lg font-bold text-[#0F6E56] dark:border-[#243242] dark:bg-[#121A24] dark:text-[#34D399]"
                  >
                    ({r.symbol})
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[#171A19] dark:text-[#EDF2F0]">
                      {r.scholar}
                    </div>
                    <div className="truncate text-xs text-[#666C68] dark:text-[#8E9BA4]">
                      {r.bookTitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode: Original Volume 1 PDF */}
      {viewMode === 'pdf1' && (
        <PdfBookReader
          mode="embedded"
          embeddedBook={cilt1PdfBook}
          initialPage={pdfJumpPage}
        />
      )}

      {/* Mode: Original Volume 2 PDF */}
      {viewMode === 'pdf2' && (
        <PdfBookReader
          mode="embedded"
          embeddedBook={cilt2PdfBook}
          initialPage={pdfJumpPage}
        />
      )}

      {/* Mode: Full Text & Chapters Reader */}
      {viewMode === 'text' && (
        <div
          ref={contentTopRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          {/* Sidebar: Volume Filter & Chapter Index */}
          <aside className="lg:col-span-4 rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-4 dark:border-[#1E2936] dark:bg-[#121A24] space-y-3">
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-xs font-semibold text-[#666C68] dark:text-[#8E9BA4]">
                İçindekiler ({dataset ? dataset.totalChapters : 34} Ders)
              </span>
              <div className="inline-flex rounded-lg bg-[#EAE5DA] p-0.5 dark:bg-[#16202C]">
                {(['all', 1, 2] as const).map((vol) => (
                  <button
                    key={String(vol)}
                    type="button"
                    onClick={() => setVolumeFilter(vol)}
                    className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                      volumeFilter === vol
                        ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                        : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                    }`}
                  >
                    {vol === 'all' ? 'Tümü' : `Cilt ${vol}`}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileChaptersOpen((o) => !o)}
              className="flex w-full min-h-[44px] items-center justify-between rounded-xl border border-[#DDD7C9] px-3 py-2 text-sm font-medium lg:hidden dark:border-[#243242]"
            >
              <span className="truncate">
                {selectedChapterId === 'preface'
                  ? 'Müellif & Eser Hakkında'
                  : activeChapter
                    ? `Cilt ${activeChapter.volume} · ${String(activeChapter.chapterNo).padStart(2, '0')}. ${activeChapter.title}`
                    : 'Bölüm Seçin'}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ${
                  mobileChaptersOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`${
                mobileChaptersOpen ? 'block' : 'hidden'
              } lg:block max-h-[580px] overflow-y-auto space-y-1 pr-1`}
            >
              <button
                type="button"
                onClick={() => handleSelectChapter('preface')}
                className={`w-full min-h-[44px] rounded-xl px-3 py-2.5 text-left transition-colors ${
                  selectedChapterId === 'preface' && !normalizedQuery
                    ? 'bg-[#0F6E56]/10 text-[#0F6E56] font-medium dark:bg-[#10B981]/14 dark:text-[#34D399]'
                    : 'hover:bg-[#FAF9F6] text-[#171A19] dark:text-[#EDF2F0] dark:hover:bg-[#17222E]'
                }`}
              >
                <div className="text-sm font-medium">
                  Müellif & Eser Mukaddimesi
                </div>
                <div className="text-[11px] text-[#666C68] dark:text-[#8E9BA4]">
                  Ahmed Ziyâeddin Gümüşhânevî (k.s.) · Tertip & Usûl
                </div>
              </button>

              {filteredChapters.map((ch) => {
                const isSelected =
                  activeChapter?.id === ch.id && !normalizedQuery;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleSelectChapter(ch.id)}
                    className={`w-full min-h-[44px] rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-[#0F6E56]/10 text-[#0F6E56] dark:bg-[#10B981]/14 dark:text-[#34D399]'
                        : 'hover:bg-[#FAF9F6] text-[#171A19] dark:text-[#EDF2F0] dark:hover:bg-[#17222E]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-snug">
                        <span className="font-mono-tabular text-xs opacity-75">
                          {String(ch.chapterNo).padStart(2, '0')}.
                        </span>{' '}
                        {ch.title}
                      </span>
                      <span className="font-mono-tabular shrink-0 text-[11px] text-[#666C68] dark:text-[#8E9BA4]">
                        C{ch.volume} · s.{ch.startPage}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Reading Pane */}
          <div className="lg:col-span-8 space-y-4">
            {isLoading ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-8 text-center dark:border-[#1E2936] dark:bg-[#121A24]">
                <Loader2 className="h-7 w-7 animate-spin text-[#0F6E56] dark:text-[#34D399]" />
                <p className="mt-3 text-sm font-medium text-[#171A19] dark:text-[#EDF2F0]">
                  Râmûzü’l-Ehâdîs tam metni yükleniyor...
                </p>
                <p className="mt-1 text-xs text-[#666C68] dark:text-[#8E9BA4]">
                  2 cilt · 34 ders · 1.283 sayfa hazırlanıyor
                </p>
              </div>
            ) : loadError ? (
              <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-8 text-center dark:border-[#1E2936] dark:bg-[#121A24]">
                <p className="text-sm font-medium text-[#171A19] dark:text-[#EDF2F0]">
                  {loadError}
                </p>
                <button
                  type="button"
                  onClick={() => setReloadNonce((n) => n + 1)}
                  className="mt-4 inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white hover:bg-[#0C5A46]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Tekrar Dene</span>
                </button>
              </div>
            ) : searchResults !== null ? (
              /* Search Results View */
              <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24] space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
                  <div>
                    <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
                      Arama Sonuçları
                    </div>
                    <h2 className="font-display text-xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                      “{searchQuery.trim()}” için{' '}
                      <span className="font-mono-tabular">
                        {searchResults.length}
                      </span>{' '}
                      sayfa eşleşti
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="min-h-[36px] rounded-lg border border-[#DDD7C9] px-3 text-xs font-medium text-[#575C59] hover:bg-[#FAF9F6] dark:border-[#243242] dark:text-[#9CA7B0]"
                  >
                    Aramayı Temizle
                  </button>
                </div>

                {searchResults.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#666C68] dark:text-[#8E9BA4]">
                    Aradığınız ifadeye uygun sayfa bulunamadı. Farklı bir kelime deneyin.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((match, idx) => (
                      <div
                        key={`${match.chapter.id}-${match.page}-${idx}`}
                        className="rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-4 dark:border-[#243242] dark:bg-[#0D141C] space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-medium text-[#0F6E56] dark:text-[#34D399]">
                            Cilt {match.chapter.volume} ·{' '}
                            {String(match.chapter.chapterNo).padStart(2, '0')}.{' '}
                            {match.chapter.title} · Sayfa {match.page}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectChapter(match.chapter.id, match.page)
                              }
                              className="rounded-lg border border-[#DDD7C9] px-2.5 py-1 text-[11px] font-medium text-[#171A19] hover:bg-white dark:border-[#243242] dark:text-[#EDF2F0] dark:hover:bg-[#17222E]"
                            >
                              Metinde Aç
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenPdfAtPage(
                                  match.chapter.volume,
                                  match.page
                                )
                              }
                              className="rounded-lg border border-[#DDD7C9] px-2.5 py-1 text-[11px] font-medium text-[#0F6E56] hover:bg-white dark:border-[#243242] dark:text-[#34D399] dark:hover:bg-[#17222E]"
                            >
                              PDF’de Gör
                            </button>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed text-[#363A38] dark:text-[#CBD5E1]">
                          {match.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : selectedChapterId === 'preface' || !activeChapter ? (
              /* Author & Work Preface View */
              <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24] space-y-6">
                <div className="border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
                  <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
                    Mukaddime ve Tertip Usûlü
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                    {RAMUZ_PREFACE.biographyTitle}
                  </h2>
                </div>

                <div className="max-w-prose space-y-4 text-sm sm:text-base leading-relaxed text-[#2C302E] dark:text-[#CBD5E1]">
                  {RAMUZ_PREFACE.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-[#EEEAE0] pt-5 dark:border-[#1E2936]">
                  {dataset?.chapters[0] && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectChapter(dataset.chapters[0].id)
                      }
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white hover:bg-[#0C5A46]"
                    >
                      <span>İlk Derse Başla: Hadis-i Şeriflerin Gayesi</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setViewMode('selected')}
                    className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#DDD7C9] px-4 py-2 text-xs font-medium text-[#171A19] hover:bg-[#FAF9F6] dark:border-[#243242] dark:text-[#EDF2F0] dark:hover:bg-[#17222E]"
                  >
                    <span>Seçme Hadisler ve Kaynak Remizleri</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Active Chapter Reading View */
              <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24] space-y-6">
                <div className="border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#666C68] dark:text-[#8E9BA4]">
                    <span className="font-medium text-[#0F6E56] dark:text-[#34D399]">
                      Cilt {activeChapter.volume} ·{' '}
                      {String(activeChapter.chapterNo).padStart(2, '0')}. Ders ·
                      Sayfa {activeChapter.startPage}–{activeChapter.endPage}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenPdfAtPage(
                          activeChapter.volume,
                          activeChapter.startPage
                        )
                      }
                      className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-[#DDD7C9] px-2.5 py-1 text-xs font-medium text-[#0F6E56] hover:bg-[#FAF9F6] dark:border-[#243242] dark:text-[#34D399] dark:hover:bg-[#17222E]"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>
                        Orijinal PDF’de Aç (C{activeChapter.volume} · s.{' '}
                        {activeChapter.startPage})
                      </span>
                    </button>
                  </div>

                  <h2 className="font-display text-2xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                    {String(activeChapter.chapterNo).padStart(2, '0')}.{' '}
                    {activeChapter.title}
                  </h2>

                  {activeChapter.subsections.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeChapter.subsections.map((sub, i) => (
                        <button
                          key={`${sub.page}-${i}`}
                          type="button"
                          onClick={() =>
                            handleSelectChapter(activeChapter.id, sub.page)
                          }
                          className="rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] px-2.5 py-1 text-[11px] font-medium text-[#575C59] hover:border-[#0F6E56] hover:text-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#9CA7B0] dark:hover:text-[#34D399]"
                        >
                          {sub.label}{' '}
                          <span className="font-mono-tabular opacity-70">
                            (s.{sub.page})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pages Batch */}
                <div className="space-y-6">
                  {visiblePages.map((pg) => {
                    const isBookmarked =
                      bookmark?.chapterId === activeChapter.id &&
                      bookmark?.page === pg.p;
                    return (
                      <article
                        key={pg.p}
                        id={`ramuz-page-${pg.p}`}
                        className="rounded-xl border border-[#EEEAE0] bg-[#FAF9F6]/65 p-5 dark:border-[#1E2936] dark:bg-[#0D141C]/80 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E0D5] pb-2.5 text-xs text-[#666C68] dark:border-[#1E2936] dark:text-[#8E9BA4]">
                          <span className="font-mono-tabular font-medium text-[#171A19] dark:text-[#EDF2F0]">
                            Cilt {activeChapter.volume} · Sayfa {pg.p}
                          </span>
                          <div className="flex items-center gap-2">
                            {pg.hasArabic && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenPdfAtPage(activeChapter.volume, pg.p)
                                }
                                className="rounded-md px-2 py-1 text-[11px] font-medium text-[#0F6E56] hover:bg-[#0F6E56]/8 dark:text-[#34D399] dark:hover:bg-[#10B981]/12"
                              >
                                Arapça Metni PDF’de Gör →
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                handleBookmarkPage(activeChapter, pg.p)
                              }
                              aria-label={`Sayfa ${pg.p} yer imi`}
                              className={`inline-flex min-h-[30px] items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                                isBookmarked
                                  ? 'bg-[#0F6E56]/12 text-[#0F6E56] dark:bg-[#10B981]/18 dark:text-[#34D399]'
                                  : 'hover:bg-white text-[#575C59] dark:text-[#9CA7B0] dark:hover:bg-[#17222E]'
                              }`}
                            >
                              <Bookmark className="h-3 w-3" />
                              <span>{isBookmarked ? 'İşaretli' : 'İşaretle'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText(
                                  `pg-${activeChapter.id}-${pg.p}`,
                                  `${pg.paragraphs.join('\n\n')}\n\n— Râmûzü’l-Ehâdîs Dersleri (Cilt ${activeChapter.volume}, s. ${pg.p})`
                                )
                              }
                              className="inline-flex min-h-[30px] items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[#575C59] hover:bg-white dark:text-[#9CA7B0] dark:hover:bg-[#17222E]"
                            >
                              {copiedKey === `pg-${activeChapter.id}-${pg.p}` ? (
                                <>
                                  <Check className="h-3 w-3 text-[#0F6E56] dark:text-[#34D399]" />
                                  <span>Kopyalandı</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Kopyala</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="max-w-prose space-y-3 text-sm sm:text-base leading-relaxed text-[#222624] dark:text-[#D5DEE6]">
                          {pg.paragraphs.map((para, pIdx) => {
                            const isSub =
                              /^[a-zçğıöşü]{1,2}\.\s+[A-ZÇĞİÖŞÜÂÎÛ]/.test(para) &&
                              para.length < 100;
                            const isRef = /^(RE\.|ME\.|RS\.)/.test(para);

                            if (isSub) {
                              return (
                                <h3
                                  key={pIdx}
                                  className="pt-2 font-display text-base sm:text-lg font-semibold text-[#0F6E56] dark:text-[#34D399]"
                                >
                                  {para}
                                </h3>
                              );
                            }

                            if (isRef) {
                              return (
                                <p
                                  key={pIdx}
                                  className="rounded-lg border border-[#E5E0D5] bg-[#FFFFFF] px-3.5 py-2.5 text-sm font-medium text-[#171A19] dark:border-[#243242] dark:bg-[#121A24] dark:text-[#EDF2F0]"
                                >
                                  {para}
                                </p>
                              );
                            }

                            return <p key={pIdx}>{para}</p>;
                          })}
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Page Batch & Chapter Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEEAE0] pt-4 dark:border-[#1E2936]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safeBatch <= 1}
                      onClick={() => {
                        setPageBatch((b) => Math.max(1, b - 1));
                        contentTopRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }}
                      className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-[#DDD7C9] px-3 text-xs font-medium text-[#171A19] hover:bg-[#FAF9F6] disabled:opacity-40 dark:border-[#243242] dark:text-[#EDF2F0]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Önceki Sayfalar</span>
                    </button>
                    <span className="font-mono-tabular px-2 text-xs text-[#666C68] dark:text-[#8E9BA4]">
                      Bölüm Sayfası {safeBatch} / {totalBatches}
                    </span>
                    <button
                      type="button"
                      disabled={safeBatch >= totalBatches}
                      onClick={() => {
                        setPageBatch((b) => Math.min(totalBatches, b + 1));
                        contentTopRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }}
                      className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-[#DDD7C9] px-3 text-xs font-medium text-[#171A19] hover:bg-[#FAF9F6] disabled:opacity-40 dark:border-[#243242] dark:text-[#EDF2F0]"
                    >
                      <span>Sonraki Sayfalar</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {dataset && activeChapterIndex > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectChapter(
                            dataset.chapters[activeChapterIndex - 1].id
                          )
                        }
                        className="min-h-[38px] rounded-xl border border-[#DDD7C9] px-3 text-xs font-medium text-[#575C59] hover:bg-[#FAF9F6] dark:border-[#243242] dark:text-[#9CA7B0]"
                      >
                        ← Önceki Ders
                      </button>
                    )}
                    {dataset &&
                      activeChapterIndex >= 0 &&
                      activeChapterIndex < dataset.chapters.length - 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectChapter(
                              dataset.chapters[activeChapterIndex + 1].id
                            )
                          }
                          className="min-h-[38px] rounded-xl bg-[#0F6E56] px-3.5 text-xs font-medium text-white hover:bg-[#0C5A46]"
                        >
                          Sonraki Ders →
                        </button>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
