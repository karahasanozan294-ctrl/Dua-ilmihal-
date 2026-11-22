import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  Check,
  ChevronDown,
  Copy,
  Headphones,
  Loader2,
  Pause,
  Play,
  Search,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
} from 'lucide-react';
import { normalizeTurkish } from '../data/cities';
import {
  ArabicWordToken,
  BESMELE_ARABIC,
  BESMELE_TURKISH,
  ChapterWordTimings,
  estimateWordWeights,
  fetchChapterWordTimings,
  fetchSurahContent,
  getAyahAudioUrl,
  getBesmeleAudioUrl,
  getReciterById,
  QURAN_RECITERS,
  SURAH_CATALOG,
  SurahContent,
  tokenizeArabicAyah,
  WordTimingSegment,
} from '../data/quranCatalog';

type DisplayMode = 'both' | 'turkish' | 'arabic';
type MealSource = 'diyanet' | 'elmalili';
type PlayingTarget = 'besmele' | number | null;
type PlaybackSpeed = 0.75 | 1 | 1.25;

interface QuranBookmark {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
}

interface QuranReaderProps {
  onOpenTefsir?: (surahNumber: number) => void;
}

interface TrackedArabicLineProps {
  tokens: ArabicWordToken[];
  activeWordIndex: number | null;
  isPlayingLine: boolean;
  fontScale: number;
  baseRem?: number;
  ayahNumber?: number;
  centered?: boolean;
}

function TrackedArabicLine({
  tokens,
  activeWordIndex,
  isPlayingLine,
  fontScale,
  baseRem = 1.75,
  ayahNumber,
  centered = false,
}: TrackedArabicLineProps) {
  return (
    <div
      dir="rtl"
      lang="ar"
      style={{ fontSize: `${(baseRem * fontScale).toFixed(2)}rem` }}
      className={`font-serif leading-[1.9] flex flex-wrap items-start gap-x-2.5 gap-y-1.5 text-[#171A19] dark:text-[#EDF2F0] ${
        centered ? 'justify-center text-center' : 'justify-start text-right'
      }`}
    >
      {tokens.map((token, idx) => {
        const isWordActive =
          isPlayingLine &&
          token.wordIndex !== null &&
          activeWordIndex === token.wordIndex;

        return (
          <span
            key={`${idx}-${token.text}`}
            className="inline-flex flex-col items-center"
          >
            <span
              className={
                isWordActive
                  ? 'text-[#0F6E56] dark:text-[#34D399] rounded-md bg-[#0F6E56]/12 dark:bg-[#10B981]/20 px-1.5 -mx-1.5 transition-colors duration-100'
                  : token.wordIndex === null
                    ? 'text-[#7C6D4F] dark:text-[#A39574]'
                    : 'transition-colors duration-100'
              }
            >
              {token.text}
            </span>
            <span
              aria-hidden="true"
              className={`flex h-4 items-center justify-center transition-opacity duration-100 ${
                isWordActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <svg
                viewBox="0 0 12 10"
                className="h-3 w-3 text-[#0F6E56] dark:text-[#34D399]"
                fill="currentColor"
              >
                <path d="M6 1L11 9H1L6 1Z" />
              </svg>
            </span>
          </span>
        );
      })}
      {ayahNumber !== undefined && (
        <span className="inline-flex flex-col items-center self-start font-mono-tabular text-sm text-[#0F6E56] dark:text-[#34D399] pt-2 mx-0.5">
          <span>﴿{ayahNumber}﴾</span>
        </span>
      )}
    </div>
  );
}

function computeActiveWordIndex(
  currentTime: number,
  duration: number,
  wordCount: number,
  weights: number[],
  segments?: WordTimingSegment[]
): number | null {
  if (!Number.isFinite(duration) || duration <= 0 || wordCount <= 0) {
    return null;
  }

  const ratio = Math.min(0.9999, Math.max(0, currentTime / duration));

  if (segments && segments.length > 0) {
    let matchedSeg = segments[0];
    for (let i = segments.length - 1; i >= 0; i--) {
      if (ratio >= segments[i][1]) {
        matchedSeg = segments[i];
        break;
      }
    }
    const maxSegWordIdx = Math.max(...segments.map((s) => s[0]));
    const segWordCount = maxSegWordIdx + 1;
    if (segWordCount === wordCount) {
      return Math.min(wordCount - 1, Math.max(0, matchedSeg[0]));
    }
    return Math.min(
      wordCount - 1,
      Math.max(0, Math.floor((matchedSeg[0] / Math.max(1, segWordCount)) * wordCount))
    );
  }

  if (weights.length === 0) return 0;
  const adjusted = Math.min(0.9999, Math.max(0, (ratio - 0.025) / 0.94));
  for (let i = 0; i < weights.length; i++) {
    if (adjusted <= weights[i]) return i;
  }
  return wordCount - 1;
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

  const [selectedReciterId, setSelectedReciterId] = useState<string>(() => {
    try {
      const saved = window.localStorage.getItem('mihrab_quran_reciter');
      return saved ? getReciterById(saved).id : 'alafasy';
    } catch {
      return 'alafasy';
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
  const [fontScale, setFontScale] = useState<number>(1);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [autoContinue, setAutoContinue] = useState<boolean>(true);

  const [surahData, setSurahData] = useState<SurahContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [chapterTimings, setChapterTimings] = useState<ChapterWordTimings>({});
  const [besmeleTimings, setBesmeleTimings] = useState<WordTimingSegment[]>([]);

  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [playingTarget, setPlayingTarget] = useState<PlayingTarget>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const playSessionRef = useRef<number>(0);

  const surahDataRef = useRef<SurahContent | null>(null);
  surahDataRef.current = surahData;

  const selectedSurahRef = useRef<number>(selectedSurah);
  selectedSurahRef.current = selectedSurah;

  const selectedReciterRef = useRef<string>(selectedReciterId);
  selectedReciterRef.current = selectedReciterId;

  const autoContinueRef = useRef<boolean>(autoContinue);
  autoContinueRef.current = autoContinue;

  const playbackSpeedRef = useRef<PlaybackSpeed>(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  const chapterTimingsRef = useRef<ChapterWordTimings>(chapterTimings);
  chapterTimingsRef.current = chapterTimings;

  const besmeleTimingsRef = useRef<WordTimingSegment[]>(besmeleTimings);
  besmeleTimingsRef.current = besmeleTimings;

  const besmeleContainerRef = useRef<HTMLDivElement | null>(null);
  const ayahRefs = useRef<Record<number, HTMLElement | null>>({});

  const besmeleTokens = useMemo(() => tokenizeArabicAyah(BESMELE_ARABIC), []);
  const besmeleWeights = useMemo(
    () => estimateWordWeights(besmeleTokens),
    [besmeleTokens]
  );

  const tokenizedAyahs = useMemo(() => {
    const map = new Map<
      number,
      { tokens: ArabicWordToken[]; weights: number[]; wordCount: number }
    >();
    if (!surahData) return map;
    for (const ayah of surahData.ayahs) {
      const tokens = tokenizeArabicAyah(ayah.arabic);
      const weights = estimateWordWeights(tokens);
      const wordCount = tokens.filter((t) => t.wordIndex !== null).length;
      map.set(ayah.numberInSurah, { tokens, weights, wordCount });
    }
    return map;
  }, [surahData]);

  const tokenizedAyahsRef = useRef(tokenizedAyahs);
  tokenizedAyahsRef.current = tokenizedAyahs;

  const stopTrackingLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    playSessionRef.current += 1;
    stopTrackingLoop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    setPlayingTarget(null);
    setIsPaused(false);
    setIsBuffering(false);
    setActiveWordIndex(null);
    setAudioError(null);
  }, [stopTrackingLoop]);

  useEffect(() => {
    try {
      window.localStorage.setItem('mihrab_quran_surah', String(selectedSurah));
    } catch {
      // Ignore storage errors
    }
  }, [selectedSurah]);

  useEffect(() => {
    try {
      window.localStorage.setItem('mihrab_quran_reciter', selectedReciterId);
    } catch {
      // Ignore storage errors
    }
  }, [selectedReciterId]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Fetch Surah text
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
  }, [selectedSurah, stopAudio]);

  // Fetch word-level timings for active reciter & surah (+ Surah 1 Ayah 1 for Besmele)
  useEffect(() => {
    const controller = new AbortController();
    setChapterTimings({});
    setBesmeleTimings([]);

    fetchChapterWordTimings(selectedReciterId, selectedSurah, controller.signal)
      .then((timings) => setChapterTimings(timings))
      .catch(() => {});

    if (selectedSurah === 1) {
      fetchChapterWordTimings(selectedReciterId, 1, controller.signal)
        .then((timings) => {
          if (timings[1]) setBesmeleTimings(timings[1]);
        })
        .catch(() => {});
    } else if (selectedSurah !== 9) {
      fetchChapterWordTimings(selectedReciterId, 1, controller.signal)
        .then((timings) => {
          if (timings[1]) setBesmeleTimings(timings[1]);
        })
        .catch(() => {});
    }

    return () => {
      controller.abort();
    };
  }, [selectedReciterId, selectedSurah]);

  useEffect(() => {
    return () => {
      stopTrackingLoop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [stopTrackingLoop]);

  // Smooth auto-scroll when active ayah or Besmele changes
  useEffect(() => {
    if (playingTarget === null) return;
    const node =
      playingTarget === 'besmele'
        ? besmeleContainerRef.current
        : ayahRefs.current[playingTarget];
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [playingTarget]);

  const startTrackingLoop = useCallback(
    (audio: HTMLAudioElement, target: Exclude<PlayingTarget, null>, sessionId: number) => {
      stopTrackingLoop();
      let lastIdx: number | null = null;

      const tick = () => {
        if (playSessionRef.current !== sessionId) return;
        if (!audio.paused && audio.duration > 0) {
          let nextIdx: number | null = null;
          if (target === 'besmele') {
            nextIdx = computeActiveWordIndex(
              audio.currentTime,
              audio.duration,
              besmeleWeights.length,
              besmeleWeights,
              besmeleTimingsRef.current
            );
          } else {
            const meta = tokenizedAyahsRef.current.get(target);
            if (meta) {
              nextIdx = computeActiveWordIndex(
                audio.currentTime,
                audio.duration,
                meta.wordCount,
                meta.weights,
                chapterTimingsRef.current[target]
              );
            }
          }
          if (nextIdx !== lastIdx) {
            lastIdx = nextIdx;
            setActiveWordIndex(nextIdx);
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [besmeleWeights, stopTrackingLoop]
  );

  const playTarget = useCallback(
    (
      target: Exclude<PlayingTarget, null>,
      options?: { reciterId?: string; autoAdvanceOverride?: boolean }
    ) => {
      const reciterId = options?.reciterId ?? selectedReciterRef.current;
      const surahNum = selectedSurahRef.current;

      // Guard: Surah 9 (Tevbe) NEVER starts with Besmele
      const effectiveTarget: Exclude<PlayingTarget, null> =
        target === 'besmele' && (surahNum === 9 || surahNum === 1) ? 1 : target;

      const url =
        effectiveTarget === 'besmele'
          ? getBesmeleAudioUrl(reciterId)
          : getAyahAudioUrl(reciterId, surahNum, effectiveTarget);

      playSessionRef.current += 1;
      const sessionId = playSessionRef.current;
      stopTrackingLoop();

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.playbackRate = playbackSpeedRef.current;
      audioRef.current = audio;

      setAudioError(null);
      setPlayingTarget(effectiveTarget);
      setIsPaused(false);
      setIsBuffering(true);
      setActiveWordIndex(0);

      audio.onwaiting = () => {
        if (playSessionRef.current === sessionId) setIsBuffering(true);
      };
      audio.onplaying = () => {
        if (playSessionRef.current === sessionId) setIsBuffering(false);
      };
      audio.oncanplay = () => {
        if (playSessionRef.current === sessionId) setIsBuffering(false);
      };

      audio.onended = () => {
        if (playSessionRef.current !== sessionId) return;

        // If Besmele just finished, ALWAYS continue to Ayah 1
        if (effectiveTarget === 'besmele') {
          playTarget(1, { reciterId, autoAdvanceOverride: options?.autoAdvanceOverride });
          return;
        }

        const shouldContinue =
          options?.autoAdvanceOverride ?? autoContinueRef.current;
        if (shouldContinue && surahDataRef.current) {
          const nextAyah = surahDataRef.current.ayahs.find(
            (a) => a.numberInSurah === effectiveTarget + 1
          );
          if (nextAyah) {
            playTarget(nextAyah.numberInSurah, {
              reciterId,
              autoAdvanceOverride: options?.autoAdvanceOverride,
            });
            return;
          }
        }

        stopTrackingLoop();
        setPlayingTarget(null);
        setIsPaused(false);
        setIsBuffering(false);
        setActiveWordIndex(null);
      };

      audio.onerror = () => {
        if (playSessionRef.current !== sessionId) return;
        stopTrackingLoop();
        setPlayingTarget(null);
        setIsPaused(false);
        setIsBuffering(false);
        setActiveWordIndex(null);
        setAudioError(
          'Ses dosyası yüklenemedi. Farklı bir Kurra Hafız seçebilir veya bağlantınızı kontrol edebilirsiniz.'
        );
      };

      startTrackingLoop(audio, effectiveTarget, sessionId);

      audio.play().catch(() => {
        if (playSessionRef.current !== sessionId) return;
        stopTrackingLoop();
        setPlayingTarget(null);
        setIsPaused(false);
        setIsBuffering(false);
        setActiveWordIndex(null);
      });
    },
    [startTrackingLoop, stopTrackingLoop]
  );

  // Switch reciter smoothly even mid-playback
  const handleSelectReciter = (nextReciterId: string) => {
    setSelectedReciterId(nextReciterId);
    if (playingTarget !== null) {
      playTarget(playingTarget, { reciterId: nextReciterId });
    }
  };

  const handleTogglePauseResume = () => {
    const audio = audioRef.current;
    if (!audio || playingTarget === null) return;

    if (audio.paused) {
      setIsPaused(false);
      audio.play().catch(() => {});
    } else {
      setIsPaused(true);
      audio.pause();
    }
  };

  // Surah main button ("Tilaveti Dinle"): starts with Besmele on every surah except Tevbe (9) and Fatiha (1 IS Besmele)
  const handleToggleSurahAudio = () => {
    if (playingTarget !== null) {
      handleTogglePauseResume();
      return;
    }
    if (selectedSurah === 9 || selectedSurah === 1) {
      playTarget(1, { autoAdvanceOverride: true });
    } else {
      playTarget('besmele', { autoAdvanceOverride: true });
    }
  };

  const handleStepAyah = (direction: -1 | 1) => {
    if (!surahData || playingTarget === null) return;
    if (playingTarget === 'besmele') {
      if (direction === 1) playTarget(1);
      return;
    }
    const targetNum = playingTarget + direction;
    if (targetNum < 1) {
      if (selectedSurah !== 1 && selectedSurah !== 9) {
        playTarget('besmele');
      }
      return;
    }
    const exists = surahData.ayahs.some((a) => a.numberInSurah === targetNum);
    if (exists) {
      playTarget(targetNum);
    }
  };

  const handleCycleSpeed = () => {
    setPlaybackSpeed((prev) =>
      prev === 1 ? 1.25 : prev === 1.25 ? 0.75 : 1
    );
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
      const hay = normalizeTurkish(`${s.number} ${s.nameTr} ${s.meaningTr}`);
      return hay.includes(q);
    });
  }, [surahSearch]);

  const currentMeta =
    SURAH_CATALOG.find((s) => s.number === selectedSurah) ?? SURAH_CATALOG[0];

  const activeReciter = getReciterById(selectedReciterId);
  const hasBesmeleBanner = selectedSurah !== 1 && selectedSurah !== 9;

  return (
    <section className="space-y-6 pb-20">
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
                className="flex w-full min-h-[44px] items-center justify-between rounded-xl border border-[#0F6E56]/30 bg-[#0F6E56]/6 px-3 py-2 text-left text-xs transition-colors hover:bg-[#0F6E56]/12 dark:border-[#34D399]/30 dark:bg-[#10B981]/10"
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
                className="w-full min-h-[44px] rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] pl-9 pr-3 text-xs text-[#171A19] placeholder:text-[#7D827E] focus:border-[#0F6E56] focus:outline-none dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]"
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
        <div className="lg:col-span-8 rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-5 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
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
              <button
                type="button"
                onClick={handleToggleSurahAudio}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E] dark:hover:bg-[#34D399] whitespace-nowrap"
              >
                {playingTarget !== null && !isPaused ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>
                      Duraklat (
                      {playingTarget === 'besmele'
                        ? 'Besmele'
                        : `${playingTarget}. Ayet`}
                      )
                    </span>
                  </>
                ) : playingTarget !== null && isPaused ? (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Devam Et</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>
                      {selectedSurah === 9
                        ? 'Tilaveti Dinle'
                        : 'Besmele ile Dinle'}
                    </span>
                  </>
                )}
              </button>

              {playingTarget !== null && (
                <button
                  type="button"
                  onClick={stopAudio}
                  aria-label="Okumayı durdur"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] text-[#575C59] hover:border-[#B91C1C] hover:text-[#B91C1C] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#9CA7B0]"
                >
                  <Square className="h-3.5 w-3.5" />
                </button>
              )}

              <div className="inline-flex items-center rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] p-0.5 dark:border-[#243242] dark:bg-[#0D141C]">
                <button
                  type="button"
                  onClick={() =>
                    setFontScale((s) =>
                      Math.max(0.85, Number((s - 0.1).toFixed(2)))
                    )
                  }
                  aria-label="Yazı boyutunu küçült"
                  className="min-h-[40px] min-w-[40px] px-2 text-xs font-medium hover:text-[#0F6E56] dark:hover:text-[#34D399]"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFontScale((s) =>
                      Math.min(1.4, Number((s + 0.1).toFixed(2)))
                    )
                  }
                  aria-label="Yazı boyutunu büyüt"
                  className="min-h-[40px] min-w-[40px] px-2 text-xs font-medium hover:text-[#0F6E56] dark:hover:text-[#34D399]"
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* Kurra Hafiz Reciter Selector & Playback Preferences */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#EEEAE0] bg-[#FAF9F6] p-3.5 dark:border-[#1E2936] dark:bg-[#0D141C]">
            <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-0">
              <label
                htmlFor="kurra-reciter-select"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4D524F] dark:text-[#A3B0B9] shrink-0"
              >
                <Headphones className="h-4 w-4 text-[#0F6E56] dark:text-[#34D399]" />
                Kurra Hafız:
              </label>
              <select
                id="kurra-reciter-select"
                value={selectedReciterId}
                onChange={(e) => handleSelectReciter(e.target.value)}
                className="min-h-[40px] flex-1 min-w-[220px] rounded-lg border border-[#DDD7C9] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#171A19] focus:border-[#0F6E56] focus:outline-none dark:border-[#243242] dark:bg-[#121A24] dark:text-[#EDF2F0]"
              >
                {QURAN_RECITERS.map((reciter) => (
                  <option key={reciter.id} value={reciter.id}>
                    {reciter.nameTr} — {reciter.originTr} ({reciter.styleTr})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <button
                type="button"
                onClick={handleCycleSpeed}
                title="Okuma hızını değiştir"
                className="min-h-[38px] rounded-lg border border-[#DDD7C9] bg-[#FFFFFF] px-3 py-1 font-mono-tabular font-medium text-[#171A19] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#121A24] dark:text-[#EDF2F0]"
              >
                Hız: {playbackSpeed}x
              </button>
              <label className="inline-flex min-h-[38px] cursor-pointer items-center gap-2 text-[#4D524F] dark:text-[#A3B0B9] select-none">
                <input
                  type="checkbox"
                  checked={autoContinue}
                  onChange={(e) => setAutoContinue(e.target.checked)}
                  className="h-4 w-4 accent-[#0F6E56] rounded"
                />
                <span>Otomatik Geçiş</span>
              </label>
            </div>
          </div>

          {audioError && (
            <div className="mt-3 rounded-xl border border-[#B91C1C]/25 bg-[#FEF2F2] px-4 py-2.5 text-xs text-[#991B1B] dark:border-[#F87171]/30 dark:bg-[#450A0A]/40 dark:text-[#FCA5A5]">
              {audioError}
            </div>
          )}

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
                    className={`min-h-[36px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
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
                  className={`min-h-[36px] rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    mealSource === 'diyanet'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  Diyanet Meali
                </button>
                <button
                  type="button"
                  onClick={() => setMealSource('elmalili')}
                  className={`min-h-[36px] rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
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
                  className="min-h-[38px] rounded-lg border border-[#0F6E56]/35 px-3 py-1.5 font-medium text-[#0F6E56] hover:bg-[#0F6E56]/8 dark:border-[#34D399]/35 dark:text-[#34D399]"
                >
                  Tefsiri Oku
                </button>
              )}
              <button
                type="button"
                disabled={selectedSurah <= 1}
                onClick={() => setSelectedSurah((s) => Math.max(1, s - 1))}
                className="min-h-[38px] rounded-lg border border-[#DDD7C9] px-3 py-1.5 font-medium disabled:opacity-40 hover:border-[#0F6E56] dark:border-[#243242]"
              >
                Önceki Sure
              </button>
              <button
                type="button"
                disabled={selectedSurah >= 114}
                onClick={() => setSelectedSurah((s) => Math.min(114, s + 1))}
                className="min-h-[38px] rounded-lg border border-[#DDD7C9] px-3 py-1.5 font-medium disabled:opacity-40 hover:border-[#0F6E56] dark:border-[#243242]"
              >
                Sonraki Sure
              </button>
            </div>
          </div>

          {/* Besmele Banner (every surah except Fatiha 1 [already ayah 1] and Tevbe 9 [no Besmele]) */}
          {hasBesmeleBanner && (
            <div
              ref={besmeleContainerRef}
              className={`mt-6 border-b border-[#EEEAE0] pb-5 pt-3 transition-colors dark:border-[#1E2936] ${
                playingTarget === 'besmele'
                  ? 'bg-[#0F6E56]/6 -mx-3 px-3 rounded-xl dark:bg-[#10B981]/12'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-medium text-[#666C68] dark:text-[#8E9BA4]">
                  Besmele
                </span>
                <button
                  type="button"
                  onClick={() =>
                    playingTarget === 'besmele'
                      ? handleTogglePauseResume()
                      : playTarget('besmele', { autoAdvanceOverride: true })
                  }
                  aria-label="Besmele ile okumaya başla"
                  className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[#0F6E56] hover:bg-[#0F6E56]/10 dark:text-[#34D399] dark:hover:bg-[#10B981]/15"
                >
                  {playingTarget === 'besmele' && !isPaused ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>Duraklat</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Besmele’den Başla</span>
                    </>
                  )}
                </button>
              </div>

              {displayMode !== 'turkish' && (
                <TrackedArabicLine
                  tokens={besmeleTokens}
                  activeWordIndex={activeWordIndex}
                  isPlayingLine={playingTarget === 'besmele'}
                  fontScale={fontScale}
                  baseRem={1.7}
                  centered
                />
              )}

              {displayMode !== 'arabic' && (
                <p className="mt-1 text-center text-xs text-[#666C68] dark:text-[#8E9BA4]">
                  {BESMELE_TURKISH}
                </p>
              )}
            </div>
          )}

          {selectedSurah === 9 && (
            <div className="mt-5 border-b border-[#EEEAE0] pb-4 text-center text-xs text-[#666C68] dark:border-[#1E2936] dark:text-[#8E9BA4]">
              Tevbe Suresi besmele ile başlamaz; tilavet doğrudan 1. ayetten başlar.
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
                className="mt-4 min-h-[42px] rounded-lg bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white dark:bg-[#10B981] dark:text-[#07130E]"
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#EEEAE0] dark:divide-[#1E2936]">
              {surahData?.ayahs.map((ayah) => {
                const isPlaying = playingTarget === ayah.numberInSurah;
                const isBookmarked =
                  bookmark?.surahNumber === selectedSurah &&
                  bookmark?.ayahNumber === ayah.numberInSurah;
                const tokenInfo = tokenizedAyahs.get(ayah.numberInSurah);

                return (
                  <article
                    key={ayah.numberInSurah}
                    ref={(el) => {
                      ayahRefs.current[ayah.numberInSurah] = el;
                    }}
                    className={`py-6 transition-colors ${
                      isPlaying
                        ? 'bg-[#0F6E56]/6 -mx-4 px-4 rounded-xl dark:bg-[#10B981]/12'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="font-mono-tabular text-xs font-semibold text-[#0F6E56] dark:text-[#34D399]">
                        {selectedSurah}:{ayah.numberInSurah}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            isPlaying
                              ? handleTogglePauseResume()
                              : playTarget(ayah.numberInSurah)
                          }
                          aria-label={`${ayah.numberInSurah}. ayeti dinle`}
                          className={`inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg transition-colors ${
                            isPlaying
                              ? 'bg-[#0F6E56]/12 text-[#0F6E56] dark:bg-[#10B981]/20 dark:text-[#34D399]'
                              : 'text-[#575C59] hover:bg-[#F1EEE7] hover:text-[#0F6E56] dark:text-[#9CA7B0] dark:hover:bg-[#1A2532] dark:hover:text-[#34D399]'
                          }`}
                        >
                          {isPlaying && !isPaused ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBookmarkAyah(ayah.numberInSurah)}
                          aria-label={`${ayah.numberInSurah}. ayeti yer imine ekle`}
                          className={`inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg transition-colors ${
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
                          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-[#575C59] hover:bg-[#F1EEE7] dark:text-[#9CA7B0] dark:hover:bg-[#1A2532]"
                        >
                          {copiedAyah === ayah.numberInSurah ? (
                            <Check className="h-4 w-4 text-[#0F6E56] dark:text-[#34D399]" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {displayMode !== 'turkish' && tokenInfo && (
                      <TrackedArabicLine
                        tokens={tokenInfo.tokens}
                        activeWordIndex={activeWordIndex}
                        isPlayingLine={isPlaying}
                        fontScale={fontScale}
                        baseRem={1.75}
                        ayahNumber={ayah.numberInSurah}
                      />
                    )}

                    {displayMode !== 'arabic' && (
                      <p
                        style={{
                          fontSize: `${(1 * fontScale).toFixed(2)}rem`,
                        }}
                        className="mt-2.5 leading-relaxed text-[#363A38] dark:text-[#CBD5E1]"
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

      {/* Compact Sticky Mini Audio Player Bar */}
      {playingTarget !== null && (
        <div className="fixed bottom-3 left-3 right-3 z-40 mx-auto max-w-2xl rounded-2xl border border-[#DDD7C9] bg-[#FFFFFF]/95 px-4 py-2.5 shadow-lg backdrop-blur-md dark:border-[#243242] dark:bg-[#121A24]/95">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#171A19] dark:text-[#EDF2F0] truncate">
                <span>
                  {currentMeta.nameTr} Suresi ·{' '}
                  {playingTarget === 'besmele'
                    ? 'Besmele'
                    : `${playingTarget}. Ayet`}
                </span>
                {isBuffering && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0F6E56] dark:text-[#34D399] shrink-0" />
                )}
              </div>
              <div className="text-[11px] text-[#666C68] dark:text-[#8E9BA4] truncate">
                {activeReciter.nameTr}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleStepAyah(-1)}
                aria-label="Önceki ayet"
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-[#575C59] hover:bg-[#F1EEE7] dark:text-[#9CA7B0] dark:hover:bg-[#1E2936]"
              >
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleTogglePauseResume}
                aria-label={isPaused ? 'Devam et' : 'Duraklat'}
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg bg-[#0F6E56] text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E]"
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleStepAyah(1)}
                aria-label="Sonraki ayet"
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-[#575C59] hover:bg-[#F1EEE7] dark:text-[#9CA7B0] dark:hover:bg-[#1E2936]"
              >
                <SkipForward className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleCycleSpeed}
                className="hidden sm:inline-flex min-h-[40px] items-center justify-center rounded-lg px-2 font-mono-tabular text-xs font-medium text-[#575C59] hover:bg-[#F1EEE7] dark:text-[#9CA7B0] dark:hover:bg-[#1E2936]"
              >
                {playbackSpeed}x
              </button>
              <button
                type="button"
                onClick={stopAudio}
                aria-label="Sesli okumayı kapat"
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-[#575C59] hover:bg-[#FEE2E2] hover:text-[#B91C1C] dark:text-[#9CA7B0] dark:hover:bg-[#450A0A]"
              >
                <Square className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
