import { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';
import { normalizeTurkish } from '../data/cities';
import { ESMAUL_HUSNA_LIST, EsmaulHusnaItem } from '../data/esmaulHusnaData';
import { getDayOfYearIndex } from '../data/versesAndHadiths';

interface EsmaulHusnaReaderProps {
  onSendToZikirmatik?: (title: string, arabic: string, target: number) => void;
}

const FAVORITES_KEY = 'mihrab_esma_favorites';

function readFavorites(): number[] {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

export function EsmaulHusnaReader({ onSendToZikirmatik }: EsmaulHusnaReaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => readFavorites());
  const [selectedOrder, setSelectedOrder] = useState<number>(() => {
    const dayIdx = getDayOfYearIndex(new Date());
    return (dayIdx % ESMAUL_HUSNA_LIST.length) + 1;
  });
  const [quickTasbihCount, setQuickTasbihCount] = useState(0);
  const [copiedOrder, setCopiedOrder] = useState<number | null>(null);

  const dailyEsma = useMemo(() => {
    const dayIdx = getDayOfYearIndex(new Date());
    return ESMAUL_HUSNA_LIST[dayIdx % ESMAUL_HUSNA_LIST.length];
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // Ignore storage errors
    }
  }, [favorites]);

  const selectedEsma: EsmaulHusnaItem = useMemo(() => {
    return (
      ESMAUL_HUSNA_LIST.find((e) => e.order === selectedOrder) ??
      ESMAUL_HUSNA_LIST[0]
    );
  }, [selectedOrder]);

  useEffect(() => {
    setQuickTasbihCount(0);
  }, [selectedOrder]);

  const normalizedQuery = useMemo(
    () => normalizeTurkish(searchQuery.trim()),
    [searchQuery]
  );

  const filteredList = useMemo(() => {
    return ESMAUL_HUSNA_LIST.filter((item) => {
      if (showFavoritesOnly && !favorites.includes(item.order)) {
        return false;
      }
      if (!normalizedQuery) return true;
      if (String(item.order) === normalizedQuery) return true;
      return (
        normalizeTurkish(item.nameTr).includes(normalizedQuery) ||
        normalizeTurkish(item.meaning).includes(normalizedQuery) ||
        item.arabic.includes(searchQuery.trim())
      );
    });
  }, [favorites, normalizedQuery, searchQuery, showFavoritesOnly]);

  const toggleFavorite = (order: number) => {
    setFavorites((prev) =>
      prev.includes(order) ? prev.filter((id) => id !== order) : [...prev, order]
    );
  };

  const handleCopy = async (item: EsmaulHusnaItem) => {
    const text = `${item.order}. ${item.nameTr} (${item.arabic})\n${item.meaning}\n(${item.source})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedOrder(item.order);
      setTimeout(() => setCopiedOrder(null), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const formatZikirTitle = (item: EsmaulHusnaItem) => {
    const clean = item.nameTr.replace(/^(er-|el-|es-|eş-|et-|ez-|ed-|en-)/i, '');
    return `Yâ ${clean}`;
  };

  return (
    <section className="space-y-6">
      {/* Header + Daily Spotlight */}
      <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#EEEAE0] pb-6 dark:border-[#1E2936]">
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
              Allah Teâlâ’nın 99 Güzel İsmi
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
              Esmâü’l-Hüsnâ
            </h1>
            <p className="text-sm text-[#575C59] dark:text-[#9CA7B0] max-w-2xl">
              “En güzel isimler Allah’ındır. O halde O’na o güzel isimlerle dua edin.” (A’râf, 7/180)
            </p>
          </div>

          {/* Günün Esmâsı Quick Jump */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] px-4 py-3 dark:border-[#1E2936] dark:bg-[#0D141C]">
            <Sparkles className="h-4 w-4 text-[#B4832C] dark:text-[#FBBF24] shrink-0" />
            <div className="text-xs">
              <div className="text-[#666C68] dark:text-[#8E9BA4]">Günün Esmâsı</div>
              <div className="font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                {dailyEsma.order}. {dailyEsma.nameTr}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedOrder(dailyEsma.order)}
              className="min-h-[36px] rounded-lg border border-[#DDD7C9] bg-white px-3 text-xs font-medium text-[#0F6E56] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#121A24] dark:text-[#34D399] whitespace-nowrap"
            >
              İncele
            </button>
          </div>
        </div>

        {/* Selected Esma Detail Panel */}
        <div className="mt-6 rounded-2xl border border-[#0F6E56]/25 bg-[#FAF9F6] p-5 sm:p-6 dark:border-[#34D399]/25 dark:bg-[#0D141C]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5 text-xs text-[#666C68] dark:text-[#8E9BA4]">
                <span className="font-mono-tabular font-semibold text-[#0F6E56] dark:text-[#34D399]">
                  {String(selectedEsma.order).padStart(2, '0')} / 99
                </span>
                <span>·</span>
                <span>{selectedEsma.source}</span>
                <span>·</span>
                <span className="font-mono-tabular">
                  Önerilen Zikir: {selectedEsma.ebced}
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                {selectedEsma.nameTr}
              </h2>

              <p className="text-sm sm:text-base leading-relaxed text-[#2C312F] dark:text-[#E2E8F0]">
                {selectedEsma.meaning}
              </p>

              <p className="text-xs sm:text-sm leading-relaxed text-[#575C59] dark:text-[#9CA7B0]">
                {selectedEsma.reflection}
              </p>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0 self-stretch justify-between">
              <div
                dir="rtl"
                lang="ar"
                className="font-serif text-4xl sm:text-5xl leading-relaxed text-[#0F6E56] dark:text-[#34D399] select-all"
              >
                {selectedEsma.arabic}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleFavorite(selectedEsma.order)}
                  aria-label="Favorilere ekle"
                  className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${
                    favorites.includes(selectedEsma.order)
                      ? 'border-[#B4832C]/50 bg-[#B4832C]/10 text-[#9A6E1F] dark:border-[#FBBF24]/50 dark:text-[#FBBF24]'
                      : 'border-[#DDD7C9] bg-white text-[#575C59] dark:border-[#243242] dark:bg-[#121A24] dark:text-[#9CA7B0]'
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>{favorites.includes(selectedEsma.order) ? 'Kayıtlı' : 'Kaydet'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(selectedEsma)}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#DDD7C9] bg-white px-3 text-xs font-medium text-[#575C59] hover:text-[#171A19] dark:border-[#243242] dark:bg-[#121A24] dark:text-[#9CA7B0]"
                >
                  {copiedOrder === selectedEsma.order ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#34D399]" />
                      <span>Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Detail Actions: Quick Mini Counter + Send to Zikirmatik + Prev/Next */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E0D5] pt-4 dark:border-[#1E2936]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setQuickTasbihCount((c) => c + 1)}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E] dark:hover:bg-[#34D399] whitespace-nowrap"
              >
                <span>{formatZikirTitle(selectedEsma)}</span>
                <span className="font-mono-tabular rounded bg-white/20 px-1.5 py-0.5 text-[11px]">
                  {quickTasbihCount} / {selectedEsma.ebced}
                </span>
              </button>

              {quickTasbihCount > 0 && (
                <button
                  type="button"
                  onClick={() => setQuickTasbihCount(0)}
                  aria-label="Hızlı sayacı sıfırla"
                  className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-[#DDD7C9] bg-white text-[#575C59] hover:text-[#171A19] dark:border-[#243242] dark:bg-[#121A24] dark:text-[#9CA7B0]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}

              {onSendToZikirmatik && (
                <button
                  type="button"
                  onClick={() =>
                    onSendToZikirmatik(
                      formatZikirTitle(selectedEsma),
                      selectedEsma.arabic,
                      selectedEsma.ebced
                    )
                  }
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#0F6E56]/40 bg-white px-3.5 py-2 text-xs font-medium text-[#0F6E56] hover:bg-[#0F6E56]/8 dark:border-[#34D399]/40 dark:bg-[#121A24] dark:text-[#34D399] whitespace-nowrap"
                >
                  <span>Zikirmatik’te Çek →</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setSelectedOrder((o) => (o <= 1 ? 99 : o - 1))
                }
                className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-[#DDD7C9] bg-white px-3 text-xs font-medium text-[#575C59] hover:text-[#171A19] dark:border-[#243242] dark:bg-[#121A24] dark:text-[#9CA7B0]"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Önceki</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setSelectedOrder((o) => (o >= 99 ? 1 : o + 1))
                }
                className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-[#DDD7C9] bg-white px-3 text-xs font-medium text-[#575C59] hover:text-[#171A19] dark:border-[#243242] dark:bg-[#121A24] dark:text-[#9CA7B0]"
              >
                <span>Sonraki</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666C68] dark:text-[#8E9BA4]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="İsim, anlam veya sıra no ara (örn: Latîf, rızık, 31)..."
            className="min-h-[44px] w-full rounded-xl border border-[#DDD7C9] bg-[#FFFFFF] pl-10 pr-4 text-sm text-[#171A19] placeholder:text-[#848A86] focus:border-[#0F6E56] focus:outline-none dark:border-[#1E2936] dark:bg-[#121A24] dark:text-[#EDF2F0]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFavoritesOnly(false)}
            className={`min-h-[40px] rounded-lg px-3.5 text-xs font-medium transition-colors whitespace-nowrap ${
              !showFavoritesOnly
                ? 'bg-[#0F6E56] text-white dark:bg-[#10B981] dark:text-[#07130E]'
                : 'border border-[#DDD7C9] bg-[#FFFFFF] text-[#575C59] dark:border-[#1E2936] dark:bg-[#121A24] dark:text-[#9CA7B0]'
            }`}
          >
            Tümü (99)
          </button>
          <button
            type="button"
            onClick={() => setShowFavoritesOnly(true)}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium transition-colors whitespace-nowrap ${
              showFavoritesOnly
                ? 'bg-[#0F6E56] text-white dark:bg-[#10B981] dark:text-[#07130E]'
                : 'border border-[#DDD7C9] bg-[#FFFFFF] text-[#575C59] dark:border-[#1E2936] dark:bg-[#121A24] dark:text-[#9CA7B0]'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Kayıtlı ({favorites.length})</span>
          </button>
        </div>
      </div>

      {/* 99 Names Grid */}
      {filteredList.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-10 text-center text-sm text-[#666C68] dark:border-[#1E2936] dark:bg-[#121A24] dark:text-[#8E9BA4]">
          Aramanızla veya filtrenizle eşleşen bir Esmâ bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredList.map((item) => {
            const isSelected = item.order === selectedEsma.order;
            const isFav = favorites.includes(item.order);
            return (
              <div
                key={item.order}
                onClick={() => setSelectedOrder(item.order)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedOrder(item.order);
                  }
                }}
                className={`group cursor-pointer rounded-2xl border p-4 transition-colors ${
                  isSelected
                    ? 'border-[#0F6E56] bg-[#0F6E56]/[0.04] dark:border-[#34D399] dark:bg-[#10B981]/[0.07]'
                    : 'border-[#E5E0D5] bg-[#FFFFFF] hover:border-[#C5BFA8] dark:border-[#1E2936] dark:bg-[#121A24] dark:hover:border-[#2E3F54]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono-tabular text-xs font-semibold text-[#0F6E56] dark:text-[#34D399]">
                    {String(item.order).padStart(2, '0')}
                  </span>

                  <div
                    dir="rtl"
                    lang="ar"
                    className="font-serif text-2xl leading-relaxed text-[#171A19] dark:text-[#EDF2F0]"
                  >
                    {item.arabic}
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                      {item.nameTr}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.order);
                      }}
                      aria-label={`${item.nameTr} kaydet`}
                      className={`rounded-md p-1.5 transition-colors ${
                        isFav
                          ? 'text-[#B4832C] dark:text-[#FBBF24]'
                          : 'text-[#9CA3AF] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Bookmark
                        className="h-3.5 w-3.5"
                        fill={isFav ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>

                  <p className="text-xs leading-relaxed text-[#575C59] dark:text-[#9CA7B0] line-clamp-2">
                    {item.meaning}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#EEEAE0] pt-2.5 text-[11px] text-[#666C68] dark:border-[#1E2936] dark:text-[#8E9BA4]">
                  <span className="truncate">{item.source}</span>
                  <span className="font-mono-tabular shrink-0">
                    Zikir: {item.ebced}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
