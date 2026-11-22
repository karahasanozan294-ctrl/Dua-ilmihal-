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
  Loader2,
  RotateCcw,
  Search,
} from 'lucide-react';
import { normalizeTurkish } from '../data/cities';
import {
  fetchFullRiyazusSalihin,
  MUKADDIMAT_MILESTONES,
  RIYAZ_BOOK_META,
  RIYAZ_COMMENTARY_BY_HADITH,
  RiyazFullBook,
  RiyazFullDataset,
  RiyazFullHadith,
} from '../data/riyazusSalihinData';

type DisplayMode = 'both' | 'turkish' | 'arabic';

const PAGE_SIZE = 25;

export function RiyazusSalihinReader() {
  const [dataset, setDataset] = useState<RiyazFullDataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  const [selectedBookId, setSelectedBookId] = useState<number>(() => {
    try {
      const saved = window.localStorage.getItem('mihrab_riyaz_book');
      const num = saved !== null ? Number(saved) : 0;
      return num >= 0 && num <= 19 ? num : 0;
    } catch {
      return 0;
    }
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [hadithJumpInput, setHadithJumpInput] = useState('');
  const [highlightedHadith, setHighlightedHadith] = useState<number | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('both');
  const [mobileBooksOpen, setMobileBooksOpen] = useState(false);

  const [bookmarkedHadith, setBookmarkedHadith] = useState<number | null>(() => {
    try {
      const saved = window.localStorage.getItem('mihrab_riyaz_bookmark');
      return saved ? Number(saved) : null;
    } catch {
      return null;
    }
  });
  const [copiedNo, setCopiedNo] = useState<number | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const contentTopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    fetchFullRiyazusSalihin(controller.signal)
      .then((data) => {
        setDataset(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if ((err as Error).name !== 'AbortError') {
          setLoadError(
            'Riyâzu’s-Sâlihîn tam metin veritabanı yüklenirken bir sorun oluştu.'
          );
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [reloadNonce]);

  useEffect(() => {
    try {
      window.localStorage.setItem('mihrab_riyaz_book', String(selectedBookId));
    } catch {
      // Ignore storage errors
    }
  }, [selectedBookId]);

  const booksById = useMemo(() => {
    const map = new Map<number, RiyazFullBook>();
    dataset?.books.forEach((b) => map.set(b.id, b));
    return map;
  }, [dataset]);

  const activeBook = booksById.get(selectedBookId) ?? dataset?.books[0];

  const normalizedQuery = useMemo(
    () => normalizeTurkish(searchQuery.trim()),
    [searchQuery]
  );

  const filteredHadiths = useMemo<RiyazFullHadith[]>(() => {
    if (!dataset) return [];

    if (normalizedQuery) {
      return dataset.hadiths.filter((h) => {
        if (String(h.n) === normalizedQuery) return true;
        return normalizeTurkish(h.t).includes(normalizedQuery);
      });
    }

    return dataset.hadiths.filter((h) => h.b === selectedBookId);
  }, [dataset, normalizedQuery, selectedBookId]);

  const totalPages = Math.max(1, Math.ceil(filteredHadiths.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const pageHadiths = useMemo(() => {
    const startIdx = (safePage - 1) * PAGE_SIZE;
    return filteredHadiths.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredHadiths, safePage]);

  const jumpToHadithNumber = (hadithNo: number) => {
    if (!dataset) return;
    const clamped = Math.min(Math.max(1, hadithNo), dataset.hadiths.length);
    const target = dataset.hadiths.find((h) => h.n === clamped);
    if (!target) return;

    setSearchQuery('');
    setSelectedBookId(target.b);
    const bookHadiths = dataset.hadiths.filter((h) => h.b === target.b);
    const idx = bookHadiths.findIndex((h) => h.n === clamped);
    const targetPage = idx >= 0 ? Math.floor(idx / PAGE_SIZE) + 1 : 1;
    setCurrentPage(targetPage);
    setHighlightedHadith(clamped);
    setMobileBooksOpen(false);

    setTimeout(() => {
      const el = document.getElementById(`riyaz-hadith-${clamped}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        contentTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  const handleHadithJumpSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = Number(hadithJumpInput.trim());
    if (!Number.isFinite(parsed) || parsed < 1) return;
    jumpToHadithNumber(Math.floor(parsed));
  };

  const handleSelectBook = (bookId: number) => {
    setSearchQuery('');
    setHighlightedHadith(null);
    setSelectedBookId(bookId);
    setCurrentPage(1);
    setMobileBooksOpen(false);
    contentTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePageChange = (nextPage: number) => {
    const bounded = Math.min(Math.max(1, nextPage), totalPages);
    setCurrentPage(bounded);
    setHighlightedHadith(null);
    contentTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBookmark = (hadithNo: number) => {
    setBookmarkedHadith(hadithNo);
    try {
      window.localStorage.setItem('mihrab_riyaz_bookmark', String(hadithNo));
    } catch {
      // Ignore storage errors
    }
  };

  const handleCopyHadith = async (h: RiyazFullHadith) => {
    const bk = booksById.get(h.b);
    const explanation = RIYAZ_COMMENTARY_BY_HADITH[h.n];
    const text = [
      h.a,
      '',
      h.t,
      `— Riyâzu’s-Sâlihîn, Hadis No: ${h.n}${bk ? ` (${bk.titleTr})` : ''}`,
      explanation ? `\n${explanation}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedNo(h.n);
      setTimeout(() => setCopiedNo(null), 1800);
    } catch {
      // Ignore clipboard errors
    }
  };

  return (
    <section className="space-y-6">
      {/* Book Metadata Header (Darussalam Complete Edition) */}
      <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] dark:border-[#243242] dark:bg-[#0D141C]">
            {!imageFailed ? (
              <img
                src={RIYAZ_BOOK_META.coverImagePath}
                alt="İmâm Nevevî Riyâzu’s-Sâlihîn Tercüme ve Açıklaması — Darussalam"
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                className="h-36 w-full object-cover"
              />
            ) : (
              <div className="flex h-36 w-full flex-col items-center justify-center p-2 text-center">
                <BookOpen className="h-6 w-6 text-[#0F6E56] dark:text-[#34D399]" />
                <span className="mt-1.5 text-[10px] font-medium text-[#575C59] dark:text-[#9CA7B0]">
                  Riyâzu’s-Sâlihîn
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2.5">
            <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
              {RIYAZ_BOOK_META.author} · {RIYAZ_BOOK_META.publisher}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
              {RIYAZ_BOOK_META.title} — Tam Kitap (1.900 Hadis)
            </h1>
            <p className="text-sm font-medium text-[#363A38] dark:text-[#CBD5E1]">
              {RIYAZ_BOOK_META.subtitle}
            </p>
            <p className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
              Hazırlayanlar: {RIYAZ_BOOK_META.preparedBy} · Çeviren:{' '}
              {RIYAZ_BOOK_META.translators} · 20 Kitâb ·{' '}
              <span className="font-mono-tabular">
                {dataset ? dataset.hadiths.length : RIYAZ_BOOK_META.totalHadiths}
              </span>{' '}
              Hadis-i Şerif
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {bookmarkedHadith && (
                <button
                  type="button"
                  onClick={() => jumpToHadithNumber(bookmarkedHadith)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#0F6E56]/30 bg-[#0F6E56]/6 px-3.5 py-2 text-xs font-medium text-[#0F6E56] hover:bg-[#0F6E56]/12 dark:border-[#34D399]/30 dark:text-[#34D399] whitespace-nowrap shrink-0"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>
                    Kaldığım Hadis: No{' '}
                    <span className="font-mono-tabular">{bookmarkedHadith}</span>
                  </span>
                </button>
              )}

              <form
                onSubmit={handleHadithJumpSubmit}
                className="inline-flex items-center gap-1.5"
              >
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#666C68]" />
                  <input
                    type="number"
                    min={1}
                    max={dataset?.hadiths.length ?? 1900}
                    value={hadithJumpInput}
                    onChange={(e) => setHadithJumpInput(e.target.value)}
                    placeholder="Hadis No (1–1900)"
                    aria-label="Hadis numarasına git"
                    className="w-36 min-h-[40px] rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] pl-8 pr-2.5 text-xs font-mono-tabular focus:border-[#0F6E56] focus:outline-none dark:border-[#243242] dark:bg-[#0D141C]"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[40px] rounded-lg bg-[#0F6E56] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E] whitespace-nowrap shrink-0"
                >
                  Git
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Reader Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Full-Book Search + 20 Books Directory */}
        <aside className="lg:col-span-4 rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-4 dark:border-[#1E2936] dark:bg-[#121A24] space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666C68]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="1.900 hadis içinde ara (örn. namaz, sabır, 626)..."
              className="w-full min-h-[42px] rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] pl-9 pr-3 text-xs focus:border-[#0F6E56] focus:outline-none dark:border-[#243242] dark:bg-[#0D141C]"
            />
          </div>

          {/* Mobile Kitab Toggle */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileBooksOpen((v) => !v)}
              className="flex w-full min-h-[44px] items-center justify-between rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] px-3.5 py-2 text-xs font-medium dark:border-[#243242] dark:bg-[#0D141C]"
            >
              <span className="truncate">
                {activeBook
                  ? `${activeBook.id + 1}. ${activeBook.titleTr}`
                  : 'Kitâb Seçin (20 Kitâb)'}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ${
                  mobileBooksOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          <div
            className={`${
              mobileBooksOpen ? 'block' : 'hidden'
            } lg:block space-y-1 max-h-[480px] lg:max-h-[640px] overflow-y-auto pr-1`}
          >
            <h2 className="px-2 pb-1 text-xs font-semibold text-[#666C68] dark:text-[#8E9BA4]">
              Kitâblar Dizini (20 Kitâb · 1.900 Hadis)
            </h2>

            {dataset?.books.map((bk) => {
              const isActive = !normalizedQuery && bk.id === selectedBookId;
              const count = bk.end - bk.start + 1;
              return (
                <button
                  key={bk.id}
                  type="button"
                  onClick={() => handleSelectBook(bk.id)}
                  className={`flex w-full min-h-[48px] items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                    isActive
                      ? 'bg-[#0F6E56]/8 font-medium text-[#0F6E56] dark:bg-[#10B981]/12 dark:text-[#34D399]'
                      : 'hover:bg-[#FAF9F6] dark:hover:bg-[#17222E]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm">
                      {bk.id + 1}. {bk.titleTr}
                    </div>
                    <div className="mt-0.5 text-[11px] text-[#666C68] dark:text-[#8E9BA4] font-mono-tabular">
                      Hadis {bk.start}–{bk.end}
                    </div>
                  </div>
                  <span className="font-mono-tabular text-xs text-[#666C68] dark:text-[#8E9BA4] shrink-0">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Reading Canvas */}
        <div
          ref={contentTopRef}
          className="lg:col-span-8 rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-5 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24] space-y-6"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-sm text-[#666C68] dark:text-[#8E9BA4]">
              <Loader2 className="h-6 w-6 animate-spin text-[#0F6E56] dark:text-[#34D399]" />
              <p className="mt-3">
                Riyâzu’s-Sâlihîn tam metni (1.900 hadis) hazırlanıyor...
              </p>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <p className="text-sm text-[#B45309] dark:text-[#FBBF24]">
                {loadError}
              </p>
              <button
                type="button"
                onClick={() => setReloadNonce((n) => n + 1)}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E]"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Tekrar Dene</span>
              </button>
            </div>
          ) : (
            <>
              {/* Active Book / Search Header + Display Toggle */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
                <div>
                  {normalizedQuery ? (
                    <>
                      <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
                        Tam Kitap Arama Sonuçları ·{' '}
                        <span className="font-mono-tabular">
                          {filteredHadiths.length}
                        </span>{' '}
                        hadis
                      </div>
                      <h2 className="mt-1 font-display text-2xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                        “{searchQuery}”
                      </h2>
                    </>
                  ) : (
                    activeBook && (
                      <>
                        <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
                          {activeBook.id + 1}. Kitâb · Hadis{' '}
                          <span className="font-mono-tabular">
                            {activeBook.start}–{activeBook.end}
                          </span>{' '}
                          ·{' '}
                          <span className="font-mono-tabular">
                            {activeBook.end - activeBook.start + 1}
                          </span>{' '}
                          Hadis
                        </div>
                        <h2 className="mt-1 font-display text-2xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                          {activeBook.titleTr}
                        </h2>
                        <div
                          dir="rtl"
                          lang="ar"
                          className="mt-1 font-serif text-lg text-[#575C59] dark:text-[#9CA7B0]"
                        >
                          {activeBook.titleAr}
                        </div>
                      </>
                    )
                  )}
                </div>

                {/* Display Mode + Clear Search */}
                <div className="flex flex-wrap items-center gap-2">
                  {normalizedQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-medium text-[#0F6E56] hover:bg-[#0F6E56]/8 dark:text-[#34D399]"
                    >
                      Aramayı Temizle
                    </button>
                  )}
                  <div className="inline-flex rounded-lg bg-[#EAE5DA] p-1 dark:bg-[#16202C]">
                    {(
                      [
                        ['both', 'Arapça + Türkçe'],
                        ['turkish', 'Yalnız Türkçe'],
                        ['arabic', 'Yalnız Arapça'],
                      ] as [DisplayMode, string][]
                    ).map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setDisplayMode(mode)}
                        className={`min-h-[34px] rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          displayMode === mode
                            ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                            : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mukaddimat Topic Milestones when viewing Book 0 */}
              {!normalizedQuery && selectedBookId === 0 && (
                <div className="space-y-2 border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
                  <div className="text-xs font-medium text-[#666C68] dark:text-[#8E9BA4]">
                    Başlangıç Bâblarına Hızlı Geçiş:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {MUKADDIMAT_MILESTONES.map((m) => (
                      <button
                        key={m.hadithNo}
                        type="button"
                        onClick={() => jumpToHadithNumber(m.hadithNo)}
                        className="min-h-[36px] rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] px-2.5 py-1.5 text-xs font-medium text-[#363A38] hover:border-[#0F6E56] hover:text-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#CBD5E1] dark:hover:border-[#34D399] dark:hover:text-[#34D399] whitespace-nowrap shrink-0"
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination Top */}
              {filteredHadiths.length > PAGE_SIZE && (
                <PaginationControls
                  safePage={safePage}
                  totalPages={totalPages}
                  totalItems={filteredHadiths.length}
                  onPageChange={handlePageChange}
                />
              )}

              {/* Hadith List */}
              {pageHadiths.length === 0 ? (
                <p className="py-12 text-center text-sm text-[#666C68] dark:text-[#8E9BA4]">
                  “{searchQuery}” ile eşleşen hadis-i şerif bulunamadı.
                </p>
              ) : (
                <div className="divide-y divide-[#EEEAE0] dark:divide-[#1E2936]">
                  {pageHadiths.map((h) => {
                    const isBookmarked = bookmarkedHadith === h.n;
                    const isHighlighted = highlightedHadith === h.n;
                    const bookMeta = booksById.get(h.b);
                    const commentary = RIYAZ_COMMENTARY_BY_HADITH[h.n];
                    const paragraphs = h.t.split('\n\n').filter(Boolean);

                    return (
                      <article
                        key={h.n}
                        id={`riyaz-hadith-${h.n}`}
                        className={`py-6 space-y-4 first:pt-2 transition-colors ${
                          isHighlighted
                            ? 'bg-[#0F6E56]/5 -mx-3 px-3 rounded-xl dark:bg-[#10B981]/10'
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                            <span className="font-mono-tabular font-semibold text-[#0F6E56] dark:text-[#34D399]">
                              Hadis No {h.n}
                            </span>
                            {bookMeta && (
                              <>
                                {' '}
                                · <span>{bookMeta.titleTr}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleBookmark(h.n)}
                              aria-label={`Hadis ${h.n} yer imine ekle`}
                              className={`inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg transition-colors ${
                                isBookmarked
                                  ? 'text-[#B4832C] bg-[#B4832C]/10 dark:text-[#FBBF24]'
                                  : 'text-[#575C59] hover:bg-[#F1EEE7] dark:text-[#9CA7B0] dark:hover:bg-[#1A2532]'
                              }`}
                            >
                              <Bookmark className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyHadith(h)}
                              aria-label={`Hadis ${h.n} kopyala`}
                              className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg text-[#575C59] hover:bg-[#F1EEE7] dark:text-[#9CA7B0] dark:hover:bg-[#1A2532]"
                            >
                              {copiedNo === h.n ? (
                                <Check className="h-4 w-4 text-[#0F6E56] dark:text-[#34D399]" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {displayMode !== 'turkish' && (
                          <p
                            dir="rtl"
                            lang="ar"
                            className="font-serif text-xl sm:text-2xl leading-[2.2] text-right text-[#171A19] dark:text-[#EDF2F0]"
                          >
                            {h.a}
                          </p>
                        )}

                        {displayMode !== 'arabic' && (
                          <div className="space-y-2.5 text-sm sm:text-base leading-relaxed text-[#171A19] dark:text-[#EDF2F0]">
                            {paragraphs.map((para, idx) => {
                              const isLast =
                                paragraphs.length > 1 &&
                                idx === paragraphs.length - 1 &&
                                /(Buhârî|Müslim|Tirmizî|Ebû Dâvûd|Nesâî|İbni Mâce|Muvatta|Riyâz)/i.test(
                                  para
                                );
                              return (
                                <p
                                  key={idx}
                                  className={
                                    isLast
                                      ? 'text-xs font-medium text-[#B4832C] dark:text-[#FBBF24]'
                                      : ''
                                  }
                                >
                                  {para}
                                </p>
                              );
                            })}
                          </div>
                        )}

                        {commentary && (
                          <p className="rounded-xl bg-[#FAF9F6] p-4 text-xs sm:text-sm leading-relaxed text-[#363A38] dark:bg-[#0D141C] dark:text-[#CBD5E1]">
                            {commentary}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Pagination Bottom */}
              {filteredHadiths.length > PAGE_SIZE && (
                <div className="border-t border-[#EEEAE0] pt-4 dark:border-[#1E2936]">
                  <PaginationControls
                    safePage={safePage}
                    totalPages={totalPages}
                    totalItems={filteredHadiths.length}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

interface PaginationControlsProps {
  safePage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

function PaginationControls({
  safePage,
  totalPages,
  totalItems,
  onPageChange,
}: PaginationControlsProps) {
  const startItem = (safePage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(safePage * PAGE_SIZE, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
      <span className="text-[#666C68] dark:text-[#8E9BA4] font-mono-tabular">
        {startItem}–{endItem} / {totalItems} hadis · Sayfa {safePage}/{totalPages}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-[#DDD7C9] px-3 py-1.5 font-medium text-[#363A38] hover:bg-[#FAF9F6] disabled:opacity-40 dark:border-[#243242] dark:text-[#CBD5E1] dark:hover:bg-[#1A2532] whitespace-nowrap shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Önceki</span>
        </button>
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-[#DDD7C9] px-3 py-1.5 font-medium text-[#363A38] hover:bg-[#FAF9F6] disabled:opacity-40 dark:border-[#243242] dark:text-[#CBD5E1] dark:hover:bg-[#1A2532] whitespace-nowrap shrink-0"
        >
          <span>Sonraki</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
