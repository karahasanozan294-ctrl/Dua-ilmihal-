import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  Check,
  ChevronDown,
  Copy,
  Loader2,
  Pause,
  Play,
  Search,
  Volume2,
} from 'lucide-react';
import { normalizeTurkish } from '../data/cities';
import {
  fetchSurahContent,
  SURAH_CATALOG,
  SurahContent,
} from '../data/quranCatalog';

type DisplayMode = 'both' | 'turkish' | 'arabic';
type MealSource = 'diyanet' | 'elmalili';

interface QuranBookmark {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
}

interface QuranReaderProps {
  onOpenTefsir?: (surahNumber: number) => void;
}

export function QuranReader({ onOpenTefsir }: QuranReaderProps) {
  const [selectedSurah, setSelectedSurah] = useState<number>(() => {
    try {
      const saved = window.localStorage.getItem('mihrab_quran_surah');
      const num = saved ? Number(saved) : 1;
      return num >= 1 && num <= 114 ? num : 1;
    } catch {
      return 1;
    }
  });

  const [bookmark, setBookmark] = useState<QuranBookmark | null>(() => {
    try {
      const raw = window.localStorage.getItem('mihrab_quran_bookmark');
      return raw ? (JSON.parse(raw) as QuranBookmark) : null;
    } catch {
      return null;
    }
  });

  const [surahSearch, setSurahSearch] = useState('');
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('both');
  const [mealSource, setMealSource] = useState<MealSource>('diyanet');
  const [fontScale, setFontScale] = useState<number>(1); // 0.85 to 1.35

  const [surahData, setSurahData] = useState<SurahContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const surahDataRef = useRef<SurahContent | null>(null);
  surahDataRef.current = surahData;

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'mihrab_quran_surah',
        String(selectedSurah)
      );
    } catch {
      // Ignore storage errors
    }
  }, [selectedSurah]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);
    stopAudio();

    fetchSurahContent(selectedSurah, controller.signal)
      .then((content) => {
        setSurahData(content);
        setIsLoading(false);
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return;
        setLoadError(
          'Sure metni yüklenemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.'
        );
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [selectedSurah]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setPlayingAyah(null);
    setIsAutoAdvancing(false);
  };

  const playAyahAudio = (ayahNumber: number, autoAdvance: boolean) => {
    const content = surahDataRef.current;
    if (!content) return;
    const target = content.ayahs.find((a) => a.numberInSurah === ayahNumber);
    if (!target?.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(target.audioUrl);
    audioRef.current = audio;
    setPlayingAyah(ayahNumber);
    setIsAutoAdvancing(autoAdvance);

    audio.onended = () => {
      if (autoAdvance && surahDataRef.current) {
        const nextAyah = surahDataRef.current.ayahs.find(
          (a) => a.numberInSurah === ayahNumber + 1
        );
        if (nextAyah?.audioUrl) {
          playAyahAudio(nextAyah.numberInSurah, true);
          return;
        }
      }
      setPlayingAyah(null);
      setIsAutoAdvancing(false);
    };

    audio.onerror = () => {
      setPlayingAyah(null);
      setIsAutoAdvancing(false);
    };

    audio.play().catch(() => {
      setPlayingAyah(null);
      setIsAutoAdvancing(false);
    });
  };

  const handleToggleSurahAudio = () => {
    if (playingAyah !== null) {
      stopAudio();
      return;
    }
    const firstWithAudio = surahData?.ayahs.find((a) => Boolean(a.audioUrl));
    if (firstWithAudio) {
      playAyahAudio(firstWithAudio.numberInSurah, true);
    }
  };

  const handleBookmarkAyah = (ayahNumber: number) => {
    const meta =
      SURAH_CATALOG.find((s) => s.number === selectedSurah) ?? SURAH_CATALOG[0];
    const nextBookmark: QuranBookmark = {
      surahNumber: selectedSurah,
      ayahNumber,
      surahName: meta.nameTr,
    };
    setBookmark(nextBookmark);
    try {
      window.localStorage.setItem(
        'mihrab_quran_bookmark',
        JSON.stringify(nextBookmark)
      );
    } catch {
      // Ignore storage errors
    }
  };

  const handleCopyAyah = async (
    ayahNumber: number,
    arabic: string,
    turkish: string
  ) => {
    const meta =
      SURAH_CATALOG.find((s) => s.number === selectedSurah) ?? SURAH_CATALOG[0];
    const text = `${arabic}\n\n${turkish}\n(${meta.nameTr} Suresi, ${ayahNumber}. Ayet)`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAyah(ayahNumber);
      setTimeout(() => setCopiedAyah(null), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const filteredSurahs = useMemo(() => {
    const q = normalizeTurkish(surahSearch);
    if (!q) return SURAH_CATALOG;
    return SURAH_CATALOG.filter((s) => {
      const hay = normalizeTurkish(
        `${s.number} ${s.nameTr} ${s.meaningTr}`
      );
      return hay.includes(q);
    });
  }, [surahSearch]);

  const currentMeta =
    SURAH_CATALOG.find((s) => s.number === selectedSurah) ?? SURAH_CATALOG[0];

  const hasAudio = Boolean(surahData?.ayahs.some((a) => Boolean(a.audioUrl)));

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Mobile Surah Selector Trigger */}
        <div className="lg:hidden rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-4 dark:border-[#1E2936] dark:bg-[#121A24]">
          <button
            type="button"
            onClick={() => setMobileListOpen((prev) => !prev)}
            className="flex w-full min-h-[44px] items-center justify-between text-left"
          >
            <div>
              <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                Seçili Sure (114 Sure)
              </div>
              <div className="font-display text-lg font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                {currentMeta.number}. {currentMeta.nameTr} ({currentMeta.nameAr})
              </div>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-[#575C59] transition-transform ${
                mobileListOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Left Sidebar: 114 Surahs Directory */}
        <aside
          className={`${
            mobileListOpen ? 'block' : 'hidden'
          } lg:block lg:col-span-4 rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-4 dark:border-[#1E2936] dark:bg-[#121A24] lg:sticky lg:top-20`}
        >
          <div className="space-y-3 pb-3 border-b border-[#EEEAE0] dark:border-[#1E2936]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                Kur’an-ı Kerim
              </h2>
              <span className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                114 Sure
              </span>
            </div>

            {bookmark && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSurah(bookmark.surahNumber);
                  setMobileListOpen(false);
                }}
                className="flex w-full min-h-[40px] items-center justify-between rounded-xl border border-[#0F6E56]/30 bg-[#0F6E56]/6 px-3 py-2 text-left text-xs transition-colors hover:bg-[#0F6E56]/12 dark:border-[#34D399]/30 dark:bg-[#10B981]/10"
              >
                <span className="inline-flex items-center gap-1.5 font-medium text-[#0F6E56] dark:text-[#34D399]">
                  <Bookmark className="h-3.5 w-3.5" />
                  Kaldığım Yer: {bookmark.surahName}, {bookmark.ayahNumber}. Ayet
                </span>
                <span className="text-[#575C59] dark:text-[#9CA7B0]">Git</span>
              </button>
            )}

            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666C68] dark:text-[#8E9BA4]"
                aria-hidden="true"
              />
              <input
                type="text"
                value={surahSearch}
                onChange={(e) => setSurahSearch(e.target.value)}
                placeholder="Sure adı veya numara ara (örn. Yasin)..."
                className="w-full min-h-[42px] rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] pl-9 pr-3 text-xs text-[#171A19] placeholder:text-[#7D827E] focus:border-[#0F6E56] focus:outline-none dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]"
              />
            </div>
          </div>

          <div className="mt-2 max-h-[420px] lg:max-h-[560px] overflow-y-auto divide-y divide-[#EEEAE0] dark:divide-[#1A2532]">
            {filteredSurahs.map((surah) => {
              const isActive = surah.number === selectedSurah;
              return (
                <button
                  key={surah.number}
                  type="button"
                  onClick={() => {
                    setSelectedSurah(surah.number);
                    setMobileListOpen(false);
                  }}
                  className={`flex w-full min-h-[54px] items-center justify-between gap-3 px-2.5 py-2.5 text-left transition-colors rounded-lg ${
                    isActive
                      ? 'bg-[#0F6E56]/8 text-[#0F6E56] dark:bg-[#10B981]/12 dark:text-[#34D399]'
                      : 'hover:bg-[#FAF9F6] dark:hover:bg-[#17222E]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono-tabular text-xs font-semibold w-7 text-center text-[#666C68] dark:text-[#8E9BA4]">
                      {surah.number}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {surah.nameTr}
                      </div>
                      <div className="text-[11px] text-[#666C68] dark:text-[#8E9BA4] truncate">
                        {surah.revelation} · {surah.ayahCount} ayet ·{' '}
                        {surah.meaningTr}
                      </div>
                    </div>
                  </div>
                  <span
                    dir="rtl"
                    lang="ar"
                    className="text-base font-serif shrink-0"
                  >
                    {surah.nameAr}
                  </span>
                </button>
              );
            })}
            {filteredSurahs.length === 0 && (
              <div className="py-8 text-center text-xs text-[#666C68] dark:text-[#8E9BA4]">
                Eşleşen sure bulunamadı.
              </div>
            )}
          </div>
        </aside>

        {/* Right Reading Canvas */}
        <div className="lg:col-span-8 rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
          {/* Surah Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EEEAE0] pb-5 dark:border-[#1E2936]">
            <div>
              <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                {currentMeta.number}. Sure · {currentMeta.revelation} Dönemi ·{' '}
                {currentMeta.ayahCount} Ayet ·{' '}
                {mealSource === 'elmalili'
                  ? 'Elmalılı Hamdi Yazır Meali'
                  : 'Diyanet Meali'}
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                  {currentMeta.nameTr} Suresi
                </h1>
                <span
                  dir="rtl"
                  lang="ar"
                  className="text-2xl font-serif text-[#0F6E56] dark:text-[#34D399]"
                >
                  {currentMeta.nameAr}
                </span>
              </div>
            </div>

            {/* Audio & Typography Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {hasAudio && (
                <button
                  type="button"
                  onClick={handleToggleSurahAudio}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#0F6E56] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E] dark:hover:bg-[#34D399] whitespace-nowrap"
                >
                  {playingAyah !== null ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>
                        Duraklat ({playingAyah}. Ayet{isAutoAdvancing ? '' : ''})
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      <span>Tilaveti Dinle</span>
                    </>
                  )}
                </button>
              )}

              <div className="inline-flex items-center rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] p-0.5 dark:border-[#243242] dark:bg-[#0D141C]">
                <button
                  type="button"
                  onClick={() =>
                    setFontScale((s) => Math.max(0.85, Number((s - 0.1).toFixed(2))))
                  }
                  aria-label="Yazı boyutunu küçült"
                  className="min-h-[36px] min-w-[36px] px-2 text-xs font-medium hover:text-[#0F6E56] dark:hover:text-[#34D399]"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFontScale((s) => Math.min(1.4, Number((s + 0.1).toFixed(2))))
                  }
                  aria-label="Yazı boyutunu büyüt"
                  className="min-h-[36px] min-w-[36px] px-2 text-xs font-medium hover:text-[#0F6E56] dark:hover:text-[#34D399]"
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* Reading Mode & Meal Tabs */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg bg-[#F1EEE7] p-1 dark:bg-[#18222E]">
                {(
                  [
                    { id: 'both', label: 'Arapça + Meal' },
                    { id: 'turkish', label: 'Sadece Meal' },
                    { id: 'arabic', label: 'Sadece Arapça' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setDisplayMode(m.id)}
                    className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                      displayMode === m.id
                        ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                        : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="inline-flex rounded-lg bg-[#F1EEE7] p-1 dark:bg-[#18222E]">
                <button
                  type="button"
                  onClick={() => setMealSource('diyanet')}
                  className={`min-h-[34px] rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    mealSource === 'diyanet'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  Diyanet
                </button>
                <button
                  type="button"
                  onClick={() => setMealSource('elmalili')}
                  className={`min-h-[34px] rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    mealSource === 'elmalili'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  Elmalılı Yazır
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {onOpenTefsir && (
                <button
                  type="button"
                  onClick={() => onOpenTefsir(selectedSurah)}
                  className="min-h-[36px] rounded-lg border border-[#0F6E56]/35 px-3 py-1.5 font-medium text-[#0F6E56] hover:bg-[#0F6E56]/8 dark:border-[#34D399]/35 dark:text-[#34D399]"
                >
                  Tefsiri Oku
                </button>
              )}
              <button
                type="button"
                disabled={selectedSurah <= 1}
                onClick={() => setSelectedSurah((s) => Math.max(1, s - 1))}
                className="min-h-[36px] rounded-lg border border-[#DDD7C9] px-3 py-1.5 font-medium disabled:opacity-40 hover:border-[#0F6E56] dark:border-[#243242]"
              >
                Önceki Sure
              </button>
              <button
                type="button"
                disabled={selectedSurah >= 114}
                onClick={() => setSelectedSurah((s) => Math.min(114, s + 1))}
                className="min-h-[36px] rounded-lg border border-[#DDD7C9] px-3 py-1.5 font-medium disabled:opacity-40 hover:border-[#0F6E56] dark:border-[#243242]"
              >
                Sonraki Sure
              </button>
            </div>
          </div>

          {/* Besmele Banner (except Fatiha and Tevbe) */}
          {selectedSurah !== 1 && selectedSurah !== 9 && (
            <div className="mt-6 border-b border-[#EEEAE0] pb-5 text-center dark:border-[#1E2936]">
              <p
                dir="rtl"
                lang="ar"
                className="font-serif text-2xl sm:text-3xl text-[#171A19] dark:text-[#EDF2F0]"
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>
              {displayMode !== 'arabic' && (
                <p className="mt-1.5 text-xs text-[#666C68] dark:text-[#8E9BA4]">
                  Rahmân ve Rahîm olan Allah’ın adıyla.
                </p>
              )}
            </div>
          )}

          {/* Content State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-sm text-[#666C68] dark:text-[#8E9BA4]">
              <Loader2 className="h-6 w-6 animate-spin text-[#0F6E56] dark:text-[#34D399]" />
              <p className="mt-3">
                {currentMeta.nameTr} Suresi yükleniyor...
              </p>
            </div>
          ) : loadError ? (
            <div className="my-8 rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-6 text-center dark:border-[#1E2936] dark:bg-[#0D141C]">
              <p className="text-sm text-[#B91C1C] dark:text-[#FCA5A5]">
                {loadError}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setLoadError(null);
                  fetchSurahContent(selectedSurah)
                    .then((c) => {
                      setSurahData(c);
                      setIsLoading(false);
                    })
                    .catch(() => {
                      setLoadError('Sure metni şu an yüklenemedi.');
                      setIsLoading(false);
                    });
                }}
                className="mt-4 min-h-[40px] rounded-lg bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white dark:bg-[#10B981] dark:text-[#07130E]"
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#EEEAE0] dark:divide-[#1E2936]">
              {surahData?.ayahs.map((ayah) => {
                const isPlaying = playingAyah === ayah.numberInSurah;
                const isBookmarked =
                  bookmark?.surahNumber === selectedSurah &&
                  bookmark?.ayahNumber === ayah.numberInSurah;

                return (
                  <article
                    key={ayah.numberInSurah}
                    className={`py-6 transition-colors ${
                      isPlaying
                        ? 'bg-[#0F6E56]/5 -mx-4 px-4 rounded-xl dark:bg-[#10B981]/10'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="font-mono-tabular text-xs font-semibold text-[#0F6E56] dark:text-[#34D399]">
                        {selectedSurah}:{ayah.numberInSurah}
                      </span>

                      <div className="flex items-center gap-1">
                        {ayah.audioUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              isPlaying
                                ? stopAudio()
                                : playAyahAudio(ayah.numberInSurah, false)
                            }
                            aria-label={`${ayah.numberInSurah}. ayeti dinle`}
                            className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-[#575C59] hover:bg-[#F1EEE7] hover:text-[#0F6E56] dark:text-[#9CA7B0] dark:hover:bg-[#1A2532] dark:hover:text-[#34D399]"
                          >
                            {isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleBookmarkAyah(ayah.numberInSurah)}
                          aria-label={`${ayah.numberInSurah}. ayeti yer imine ekle`}
                          className={`inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg transition-colors ${
                            isBookmarked
                              ? 'text-[#B4832C] bg-[#B4832C]/10 dark:text-[#FBBF24]'
                              : 'text-[#575C59] hover:bg-[#F1EEE7] dark:text-[#9CA7B0] dark:hover:bg-[#1A2532]'
                          }`}
                        >
                          <Bookmark className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyAyah(
                              ayah.numberInSurah,
                              ayah.arabic,
                              mealSource === 'elmalili' && ayah.elmalili
                                ? ayah.elmalili
                                : ayah.turkish
                            )
                          }
                          aria-label={`${ayah.numberInSurah}. ayeti kopyala`}
                          className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-[#575C59] hover:bg-[#F1EEE7] dark:text-[#9CA7B0] dark:hover:bg-[#1A2532]"
                        >
                          {copiedAyah === ayah.numberInSurah ? (
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
                        style={{ fontSize: `${(1.75 * fontScale).toFixed(2)}rem` }}
                        className="font-serif leading-[2.2] text-right text-[#171A19] dark:text-[#EDF2F0]"
                      >
                        {ayah.arabic}{' '}
                        <span className="inline-block font-mono-tabular text-sm text-[#0F6E56] dark:text-[#34D399] mx-1">
                          ﴿{ayah.numberInSurah}﴾
                        </span>
                      </p>
                    )}

                    {displayMode !== 'arabic' && (
                      <p
                        style={{ fontSize: `${(1 * fontScale).toFixed(2)}rem` }}
                        className="mt-3 leading-relaxed text-[#363A38] dark:text-[#CBD5E1]"
                      >
                        {mealSource === 'elmalili' && ayah.elmalili
                          ? ayah.elmalili
                          : ayah.turkish}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
