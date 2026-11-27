import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Hash,
  Library,
  Loader2,
  RotateCcw,
  Search,
} from 'lucide-react';
import { normalizeTurkish } from '../data/cities';
import {
  fetchSahihCollection,
  SAHIHAYN_META,
  SAHIHAYN_MUTTEFEKUN_ALEYH,
  SahihBookCollectionId,
  SahihBookSection,
  SahihFullDataset,
  SahihHadithEntry,
  stripArabicDiacritics,
} from '../data/sahihaynData';

type DisplayMode = 'both' | 'turkish' | 'arabic';
type ReaderTab = SahihBookCollectionId | 'muttefekun';

const PAGE_SIZE = 20;

interface SahihaynReaderProps {
  initialCollection?: SahihBookCollectionId;
}

function getStorageKey(collection: SahihBookCollectionId, kind: 'book' | 'bookmark') {
  return `mihrab_sahihayn_${collection}_${kind}`;
}

export function SahihaynReader({ initialCollection = 'bukhari' }: SahihaynReaderProps) {
  const [activeTab, setActiveTab] = useState<ReaderTab>(initialCollection);
  const activeCollection: SahihBookCollectionId =
    activeTab === 'muttefekun' ? 'bukhari' : activeTab;

  const [datasets, setDatasets] = useState<
    Partial<Record<SahihBookCollectionId, SahihFullDataset>>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState<number>(0);

  const [selectedBookIds, setSelectedBookIds] = useState<
    Record<SahihBookCollectionId, number>
  >(() => {
    const readBookId = (col: SahihBookCollectionId, fallback: number) => {
      try {
        const raw = window.localStorage.getItem(getStorageKey(col, 'book'));
        const num = raw !== null ? Number(raw) : fallback;
        return Number.isFinite(num) && num >= 0 ? num : fallback;
      } catch {
        return fallback;
      }
    };
    return {
      bukhari: readBookId('bukhari', 1),
      muslim: readBookId('muslim', 1),
    };
  });

  const [bookmarks, setBookmarks] = useState<
    Record<SahihBookCollectionId, number | null>
  >(() => {
    const readBm = (col: SahihBookCollectionId) => {
      try {
        const raw = window.localStorage.getItem(getStorageKey(col, 'bookmark'));
        return raw ? Number(raw) : null;
      } catch {
        return null;
      }
    };
    return {
      bukhari: readBm('bukhari'),
      muslim: readBm('muslim'),
    };
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookFilterQuery, setBookFilterQuery] = useState<string>('');
  const [hadithJumpInput, setHadithJumpInput] = useState<string>('');
  const [highlightedHadith, setHighlightedHadith] = useState<number | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('both');
  const [mobileBooksOpen, setMobileBooksOpen] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pendingJump, setPendingJump] = useState<{
    collection: SahihBookCollectionId;
    hadithNo: number;
  } | null>(null);

  const contentTopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveTab(initialCollection);
  }, [initialCollection]);

  const activeDataset = datasets[activeCollection] ?? null;
  const activeMeta = SAHIHAYN_META[activeCollection];
  const selectedBookId = selectedBookIds[activeCollection];
  const bookmarkedHadith = bookmarks[activeCollection];

  useEffect(() => {
    if (activeTab === 'muttefekun') {
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    if (datasets[activeCollection]) {
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    fetchSahihCollection(activeCollection, controller.signal)
      .then((data) => {
        setDatasets((prev) => ({ ...prev, [activeCollection]: data }));
        setIsLoading(false);
      })
      .catch((err) => {
        if ((err as Error).name !== 'AbortError') {
          setLoadError(
            `${SAHIHAYN_META[activeCollection].shortTitle} külliyatı yüklenirken bir hata oluştu.`
          );
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [activeCollection, activeTab, datasets, reloadNonce]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        getStorageKey(activeCollection, 'book'),
        String(selectedBookId)
      );
    } catch {
      // Ignore storage failures
    }
  }, [activeCollection, selectedBookId]);

  const booksById = useMemo(() => {
    const map = new Map<number, SahihBookSection>();
    activeDataset?.books.forEach((b) => map.set(b.id, b));
    return map;
  }, [activeDataset]);

  const activeBook = booksById.get(selectedBookId) ?? activeDataset?.books[0];

  const normalizedBookFilter = useMemo(
    () => normalizeTurkish(bookFilterQuery.trim()),
    [bookFilterQuery]
  );

  const visibleSidebarBooks = useMemo(() => {
    if (!activeDataset) return [];
    if (!normalizedBookFilter) return activeDataset.books;
    return activeDataset.books.filter(
      (b) =>
        normalizeTurkish(b.titleTr).includes(normalizedBookFilter) ||
        String(b.id) === normalizedBookFilter
    );
  }, [activeDataset, normalizedBookFilter]);

  const normalizedQuery = useMemo(
    () => normalizeTurkish(searchQuery.trim()),
    [searchQuery]
  );

  const normalizedArQuery = useMemo(
    () => stripArabicDiacritics(searchQuery.trim()),
    [searchQuery]
  );

  const filteredHadiths = useMemo<SahihHadithEntry[]>(() => {
    if (!activeDataset) return [];

    if (normalizedQuery) {
      const isArabicSearch = /[\u0600-\u06FF]/.test(searchQuery);
      return activeDataset.hadiths.filter((h) => {
        if (String(h.n) === normalizedQuery) return true;
        if (isArabicSearch) {
          return stripArabicDiacritics(h.a).includes(normalizedArQuery);
        }
        return normalizeTurkish(h.t).includes(normalizedQuery);
      });
    }

    const targetId = activeBook?.id ?? selectedBookId;
    return activeDataset.hadiths.filter((h) => h.b === targetId);
  }, [
    activeDataset,
    activeBook,
    selectedBookId,
    normalizedQuery,
    normalizedArQuery,
    searchQuery,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredHadiths.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const pageHadiths = useMemo(() => {
    const startIdx = (safePage - 1) * PAGE_SIZE;
    return filteredHadiths.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredHadiths, safePage]);

  const executeJumpInLoadedDataset = (
    col: SahihBookCollectionId,
    data: SahihFullDataset,
    hadithNo: number
  ) => {
    const target =
      data.hadiths.find((h) => h.n === hadithNo) ??
      data.hadiths.find((h) => h.n >= hadithNo) ??
      data.hadiths[0];
    if (!target) return;

    setSearchQuery('');
    setSelectedBookIds((prev) => ({ ...prev, [col]: target.b }));
    const sectionHadiths = data.hadiths.filter((h) => h.b === target.b);
    const idx = sectionHadiths.findIndex((h) => h.n === target.n);
    const targetPage = idx >= 0 ? Math.floor(idx / PAGE_SIZE) + 1 : 1;
    setCurrentPage(targetPage);
    setHighlightedHadith(target.n);
    setMobileBooksOpen(false);

    setTimeout(() => {
      const el = document.getElementById(`sahihayn-hadith-${col}-${target.n}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        contentTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 90);
  };

  useEffect(() => {
    if (!pendingJump) return;
    const loaded = datasets[pendingJump.collection];
    if (loaded && activeTab === pendingJump.collection) {
      executeJumpInLoadedDataset(pendingJump.collection, loaded, pendingJump.hadithNo);
      setPendingJump(null);
    }
  }, [pendingJump, datasets, activeTab]);

  const handleJumpToHadith = (
    collection: SahihBookCollectionId,
    hadithNo: number
  ) => {
    setActiveTab(collection);
    const loaded = datasets[collection];
    if (loaded) {
      executeJumpInLoadedDataset(collection, loaded, hadithNo);
    } else {
      setPendingJump({ collection, hadithNo });
    }
  };

  const handleHadithJumpSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = Number(hadithJumpInput.trim());
    if (!Number.isFinite(parsed) || parsed < 1) return;
    handleJumpToHadith(activeCollection, Math.floor(parsed));
  };

  const handleSelectBook = (bookId: number) => {
    setSearchQuery('');
    setHighlightedHadith(null);
    setSelectedBookIds((prev) => ({ ...prev, [activeCollection]: bookId }));
    setCurrentPage(1);
    setMobileBooksOpen(false);
    contentTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSwitchCollectionTab = (tab: ReaderTab) => {
    setSearchQuery('');
    setHighlightedHadith(null);
    setCurrentPage(1);
    setMobileBooksOpen(false);
    setActiveTab(tab);
  };

  const handlePageChange = (nextPage: number) => {
    const bounded = Math.min(Math.max(1, nextPage), totalPages);
    setCurrentPage(bounded);
    setHighlightedHadith(null);
    contentTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBookmark = (hadithNo: number) => {
    setBookmarks((prev) => ({ ...prev, [activeCollection]: hadithNo }));
    try {
      window.localStorage.setItem(
        getStorageKey(activeCollection, 'bookmark'),
        String(hadithNo)
      );
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

  return (
    <section className="space-y-6">
      {/* Scholarly Header & Collection Switch */}
      <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24] space-y-5">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex h-36 w-28 shrink-0 flex-col items-center justify-center rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-3 text-center dark:border-[#243242] dark:bg-[#0D141C]">
            <Library className="h-7 w-7 text-[#0F6E56] dark:text-[#34D399]" />
            <span className="mt-2 font-display text-xs font-semibold leading-tight text-[#171A19] dark:text-[#EDF2F0]">
              {activeTab === 'muttefekun'
                ? 'Müttefekun Aleyh'
                : activeMeta.shortTitle}
            </span>
            <span className="mt-1 text-[10px] text-[#666C68] dark:text-[#8E9BA4]">
              Sahîhayn Külliyatı
            </span>
          </div>

          <div className="flex-1 space-y-2.5 min-w-0">
            <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
              {activeTab === 'muttefekun'
                ? 'İmâm Buhârî & İmâm Müslim (Ortak Sahîh Rivayetler)'
                : activeMeta.author}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#171A19] dark:text-[#EDF2F0] [text-wrap:balance]">
              {activeTab === 'muttefekun'
                ? 'Müttefekun Aleyh — Buhârî ve Müslim’den Seçme Hadisler'
                : activeMeta.fullTitle}
            </h1>
            <p className="text-sm font-medium text-[#363A38] dark:text-[#CBD5E1]">
              {activeTab === 'muttefekun'
                ? 'Her İki Sahîh’te Birden Yer Alan En Temel Hadis-i Şerifler'
                : activeMeta.subtitle}
            </p>
            <p className="text-xs leading-relaxed text-[#666C68] dark:text-[#8E9BA4]">
              {activeTab === 'muttefekun'
                ? 'Buhârî ve Müslim’de aynı sahâbîden ittifakla rivayet edilen seçkin hadisleri okuyabilir, tek tıkla ilgili kitabın içindeki yerine gidebilirsiniz.'
                : activeMeta.description}
            </p>

            {/* Primary Collection Selector */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div
                role="tablist"
                aria-label="Sahîhayn Kitap Seçimi"
                className="inline-flex flex-wrap rounded-lg bg-[#EAE5DA] p-1 dark:bg-[#16202C]"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'bukhari'}
                  onClick={() => handleSwitchCollectionTab('bukhari')}
                  className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === 'bukhari'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Sahîh-i Buhârî (7.583 Hadis)</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'muslim'}
                  onClick={() => handleSwitchCollectionTab('muslim')}
                  className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === 'muslim'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Sahîh-i Müslim (7.466 Hadis)</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'muttefekun'}
                  onClick={() => handleSwitchCollectionTab('muttefekun')}
                  className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === 'muttefekun'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  <Library className="h-3.5 w-3.5" />
                  <span>Seçme Müttefekun Aleyh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search, Jump & Display Toolbar (for Full Books) */}
        {activeTab !== 'muttefekun' && (
          <div className="border-t border-[#EEEAE0] pt-4 dark:border-[#1E2936] space-y-3">
            <div className="flex flex-col lg:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666C68] dark:text-[#8E9BA4]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={`${activeMeta.shortTitle} içinde Türkçe veya Arapça kelime ya da hadis no ara...`}
                  className="w-full min-h-[44px] rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] pl-9 pr-3 text-sm text-[#171A19] outline-none focus:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]"
                />
              </div>

              <form onSubmit={handleHadithJumpSubmit} className="flex gap-2">
                <div className="relative w-36">
                  <Hash className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#666C68] dark:text-[#8E9BA4]" />
                  <input
                    type="number"
                    min={1}
                    max={activeMeta.totalHadiths}
                    value={hadithJumpInput}
                    onChange={(e) => setHadithJumpInput(e.target.value)}
                    placeholder="Hadis No"
                    className="w-full min-h-[44px] rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] pl-8 pr-2.5 text-sm font-mono-tabular text-[#171A19] outline-none focus:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[44px] rounded-xl bg-[#0F6E56] px-4 text-xs font-medium text-white hover:bg-[#0C5A46] whitespace-nowrap shrink-0"
                >
                  Git
                </button>
              </form>

              {bookmarkedHadith !== null && (
                <button
                  type="button"
                  onClick={() =>
                    handleJumpToHadith(activeCollection, bookmarkedHadith)
                  }
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#DDD7C9] px-3.5 text-xs font-medium text-[#0F6E56] hover:bg-[#FAF9F6] dark:border-[#243242] dark:text-[#34D399] dark:hover:bg-[#17222E] whitespace-nowrap shrink-0"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Kaldığın Yer ({bookmarkedHadith})</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                role="group"
                aria-label="Hadis Metni Görünüm Modu"
                className="inline-flex rounded-lg bg-[#EAE5DA] p-1 dark:bg-[#16202C]"
              >
                {(
                  [
                    { id: 'both', label: 'Arapça + Türkçe' },
                    { id: 'turkish', label: 'Sadece Türkçe' },
                    { id: 'arabic', label: 'Sadece Arapça' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setDisplayMode(mode.id)}
                    className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                      displayMode === mode.id
                        ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                        : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                Çevrimdışı tam metin ·{' '}
                <span className="font-mono-tabular">
                  {activeDataset ? activeDataset.books.length : activeMeta.totalBooks}
                </span>{' '}
                Kitâb ·{' '}
                <span className="font-mono-tabular">
                  {activeDataset
                    ? activeDataset.hadiths.length.toLocaleString('tr-TR')
                    : activeMeta.totalHadiths.toLocaleString('tr-TR')}
                </span>{' '}
                Hadis-i Şerif
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mode: Selected Muttefekun Aleyh Hadiths */}
      {activeTab === 'muttefekun' ? (
        <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24] space-y-5">
          <div className="border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
            <div className="text-xs font-medium text-[#B4832C] dark:text-[#FBBF24]">
              İmâm Buhârî & İmâm Müslim İttifakı
            </div>
            <h2 className="mt-1 font-display text-xl sm:text-2xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
              Müttefekun Aleyh Seçme Hadis-i Şerifler
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#666C68] dark:text-[#8E9BA4]">
              Hadis ilminde sıhhat bakımından en yüksek dereceyi temsil eden ortak rivayetler. Doğrudan Buhârî veya Müslim tam metnindeki yerine geçebilirsiniz.
            </p>
          </div>

          <div className="space-y-4">
            {SAHIHAYN_MUTTEFEKUN_ALEYH.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-5 dark:border-[#243242] dark:bg-[#0D141C] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#0F6E56] dark:text-[#34D399]">
                    {item.topic}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleJumpToHadith('bukhari', item.bukhariNo)}
                      className="min-h-[32px] rounded-lg border border-[#DDD7C9] px-2.5 py-1 text-[11px] font-medium text-[#0F6E56] hover:bg-white dark:border-[#243242] dark:text-[#34D399] dark:hover:bg-[#17222E] whitespace-nowrap"
                    >
                      Buhârî #{item.bukhariNo}’da Aç
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJumpToHadith('muslim', item.muslimNo)}
                      className="min-h-[32px] rounded-lg border border-[#DDD7C9] px-2.5 py-1 text-[11px] font-medium text-[#B4832C] hover:bg-white dark:border-[#243242] dark:text-[#FBBF24] dark:hover:bg-[#17222E] whitespace-nowrap"
                    >
                      Müslim #{item.muslimNo}’da Aç
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          item.id,
                          `${item.arabic}\n\n"${item.turkish}"\n— ${item.narrator} (Buhârî, ${item.bukhariNo}; Müslim, ${item.muslimNo})`
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

                <p className="max-w-prose text-sm sm:text-base leading-relaxed text-[#171A19] dark:text-[#EDF2F0]">
                  “{item.turkish}”
                </p>

                <div className="rounded-lg border border-[#E5E0D5] bg-[#FFFFFF] px-3.5 py-2.5 text-xs leading-relaxed text-[#575C59] dark:border-[#1E2936] dark:bg-[#121A24] dark:text-[#9CA7B0]">
                  <strong className="text-[#171A19] dark:text-[#EDF2F0]">
                    Râvi: {item.narrator}
                  </strong>{' '}
                  · {item.note}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        /* Mode: Full Collection Reader (Bukhari or Muslim) */
        <div
          ref={contentTopRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          {/* Sidebar: Books (Kitab) Index */}
          <aside className="lg:col-span-4 rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-4 dark:border-[#1E2936] dark:bg-[#121A24] space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-[#666C68] dark:text-[#8E9BA4]">
                Kitâblar ({activeDataset ? activeDataset.books.length : activeMeta.totalBooks})
              </span>
              <span className="text-[11px] font-medium text-[#0F6E56] dark:text-[#34D399]">
                {activeMeta.shortTitle}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMobileBooksOpen((o) => !o)}
              className="flex w-full min-h-[44px] items-center justify-between rounded-xl border border-[#DDD7C9] px-3 py-2 text-sm font-medium lg:hidden dark:border-[#243242]"
            >
              <span className="truncate">
                {activeBook
                  ? `${activeBook.id}. ${activeBook.titleTr}`
                  : 'Kitâb Seçin'}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ${
                  mobileBooksOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`${
                mobileBooksOpen ? 'block' : 'hidden'
              } lg:block space-y-2.5`}
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#666C68] dark:text-[#8E9BA4]" />
                <input
                  type="search"
                  value={bookFilterQuery}
                  onChange={(e) => setBookFilterQuery(e.target.value)}
                  placeholder="Kitâb başlığı ara (ör. İman, Namaz, Zekât)..."
                  className="w-full min-h-[38px] rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] pl-8 pr-2.5 text-xs text-[#171A19] outline-none focus:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]"
                />
              </div>

              <div className="max-h-[540px] overflow-y-auto space-y-1 pr-1">
                {visibleSidebarBooks.map((bk) => {
                  const isSelected = activeBook?.id === bk.id && !normalizedQuery;
                  return (
                    <button
                      key={bk.id}
                      type="button"
                      onClick={() => handleSelectBook(bk.id)}
                      className={`w-full min-h-[44px] rounded-xl px-3 py-2 text-left transition-colors ${
                        isSelected
                          ? 'bg-[#0F6E56]/10 text-[#0F6E56] dark:bg-[#10B981]/14 dark:text-[#34D399]'
                          : 'hover:bg-[#FAF9F6] text-[#171A19] dark:text-[#EDF2F0] dark:hover:bg-[#17222E]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs sm:text-sm font-medium leading-snug">
                          <span className="font-mono-tabular opacity-75">
                            {bk.id}.
                          </span>{' '}
                          {bk.titleTr}
                        </span>
                        <span className="font-mono-tabular shrink-0 text-[11px] text-[#666C68] dark:text-[#8E9BA4]">
                          {bk.count}
                        </span>
                      </div>
                      <div
                        dir="rtl"
                        lang="ar"
                        className="mt-0.5 text-right font-serif text-xs text-[#666C68] dark:text-[#8E9BA4]"
                      >
                        {bk.titleAr}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Reading Pane */}
          <div className="lg:col-span-8 space-y-4">
            {isLoading ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-8 text-center dark:border-[#1E2936] dark:bg-[#121A24]">
                <Loader2 className="h-7 w-7 animate-spin text-[#0F6E56] dark:text-[#34D399]" />
                <p className="mt-3 text-sm font-medium text-[#171A19] dark:text-[#EDF2F0]">
                  {activeMeta.shortTitle} tam metni yükleniyor...
                </p>
                <p className="mt-1 text-xs text-[#666C68] dark:text-[#8E9BA4]">
                  {activeMeta.totalBooks} Kitâb ·{' '}
                  {activeMeta.totalHadiths.toLocaleString('tr-TR')} Hadis-i Şerif hazırlanıyor
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
            ) : (
              <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24] space-y-6">
                {/* Active Book / Search Banner */}
                <div className="border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936] space-y-2">
                  {normalizedQuery ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
                          {activeMeta.shortTitle} · Arama Sonuçları
                        </div>
                        <h2 className="mt-1 font-display text-xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                          “{searchQuery.trim()}” için{' '}
                          <span className="font-mono-tabular">
                            {filteredHadiths.length}
                          </span>{' '}
                          hadis bulundu
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
                  ) : (
                    activeBook && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
                            {activeMeta.shortTitle} · {activeBook.id}. Kitâb · Hadis{' '}
                            <span className="font-mono-tabular">
                              {activeBook.start}–{activeBook.end}
                            </span>{' '}
                            ({activeBook.count} Hadis)
                          </div>
                          <h2 className="mt-1 font-display text-2xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                            {activeBook.titleTr}
                          </h2>
                        </div>
                        <div
                          dir="rtl"
                          lang="ar"
                          className="font-serif text-xl text-[#0F6E56] dark:text-[#34D399]"
                        >
                          {activeBook.titleAr}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Hadiths List */}
                {pageHadiths.length === 0 ? (
                  <p className="py-10 text-center text-sm text-[#666C68] dark:text-[#8E9BA4]">
                    Aramanızla eşleşen hadis bulunamadı. Farklı bir kelime veya hadis numarası deneyin.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pageHadiths.map((h) => {
                      const section = booksById.get(h.b);
                      const isBookmarked = bookmarkedHadith === h.n;
                      const isHighlighted = highlightedHadith === h.n;
                      const copyKey = `${activeCollection}-${h.n}`;

                      return (
                        <article
                          key={`${activeCollection}-${h.n}-${h.b}`}
                          id={`sahihayn-hadith-${activeCollection}-${h.n}`}
                          className={`rounded-xl border p-5 transition-colors space-y-3 ${
                            isHighlighted
                              ? 'border-[#0F6E56] bg-[#0F6E56]/5 dark:border-[#34D399] dark:bg-[#10B981]/10'
                              : 'border-[#EEEAE0] bg-[#FAF9F6]/70 dark:border-[#1E2936] dark:bg-[#0D141C]/80'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E0D5] pb-2.5 text-xs text-[#666C68] dark:border-[#1E2936] dark:text-[#8E9BA4]">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono-tabular font-semibold text-[#0F6E56] dark:text-[#34D399]">
                                {activeMeta.shortTitle} · Hadis {h.n}
                              </span>
                              {section && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{section.titleTr}</span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleBookmark(h.n)}
                                aria-label={`Hadis ${h.n} yer imi`}
                                className={`inline-flex min-h-[30px] items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                                  isBookmarked
                                    ? 'bg-[#0F6E56]/12 text-[#0F6E56] dark:bg-[#10B981]/18 dark:text-[#34D399]'
                                    : 'text-[#575C59] hover:bg-white dark:text-[#9CA7B0] dark:hover:bg-[#17222E]'
                                }`}
                              >
                                <Bookmark className="h-3 w-3" />
                                <span>{isBookmarked ? 'İşaretli' : 'İşaretle'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyText(
                                    copyKey,
                                    [
                                      h.a,
                                      h.t,
                                      `— ${activeMeta.shortTitle}, Hadis No: ${h.n}${section ? ` (${section.titleTr})` : ''}`,
                                    ]
                                      .filter(Boolean)
                                      .join('\n\n')
                                  )
                                }
                                className="inline-flex min-h-[30px] items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[#575C59] hover:bg-white dark:text-[#9CA7B0] dark:hover:bg-[#17222E]"
                              >
                                {copiedKey === copyKey ? (
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

                          {(displayMode === 'both' || displayMode === 'arabic') &&
                            h.a && (
                              <p
                                dir="rtl"
                                lang="ar"
                                className="font-serif text-xl sm:text-2xl leading-[2.15] text-right text-[#171A19] dark:text-[#EDF2F0]"
                              >
                                {h.a}
                              </p>
                            )}

                          {(displayMode === 'both' || displayMode === 'turkish') && (
                            <p className="max-w-prose text-sm sm:text-base leading-relaxed text-[#222624] dark:text-[#D5DEE6]">
                              {h.t ||
                                'Bu rivayetin tercümesi önceki/bağlantılı rivayet içinde aktarılmıştır; Arapça aslı yukarıda yer almaktadır.'}
                            </p>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {filteredHadiths.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEEAE0] pt-4 dark:border-[#1E2936]">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => handlePageChange(safePage - 1)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#DDD7C9] px-3.5 py-2 text-xs font-medium text-[#171A19] disabled:opacity-40 hover:bg-[#FAF9F6] dark:border-[#243242] dark:text-[#EDF2F0] dark:hover:bg-[#17222E]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Önceki Sayfa</span>
                    </button>

                    <span className="font-mono-tabular text-xs text-[#666C68] dark:text-[#8E9BA4]">
                      Sayfa {safePage} / {totalPages} · Toplam{' '}
                      {filteredHadiths.length.toLocaleString('tr-TR')} hadis
                    </span>

                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => handlePageChange(safePage + 1)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#DDD7C9] px-3.5 py-2 text-xs font-medium text-[#171A19] disabled:opacity-40 hover:bg-[#FAF9F6] dark:border-[#243242] dark:text-[#EDF2F0] dark:hover:bg-[#17222E]"
                    >
                      <span>Sonraki Sayfa</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
