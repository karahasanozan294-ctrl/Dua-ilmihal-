import { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Shuffle,
} from 'lucide-react';
import {
  AYET_COLLECTION,
  getDayOfYearIndex,
  HADIS_COLLECTION,
} from '../data/versesAndHadiths';

interface DailyWisdomSectionProps {
  onOpenQuran?: () => void;
  onOpenTefsir?: () => void;
  onOpenRiyaz?: () => void;
  onOpenRamuz?: () => void;
}

export function DailyWisdomSection({
  onOpenQuran,
  onOpenTefsir,
  onOpenRiyaz,
  onOpenRamuz,
}: DailyWisdomSectionProps) {
  const dayIdx = getDayOfYearIndex(new Date());
  const [ayetIdx, setAyetIdx] = useState<number>(
    dayIdx % AYET_COLLECTION.length
  );
  const [hadisIdx, setHadisIdx] = useState<number>(
    dayIdx % HADIS_COLLECTION.length
  );

  const [copiedType, setCopiedType] = useState<'ayet' | 'hadis' | null>(null);

  const ayet = AYET_COLLECTION[ayetIdx];
  const hadis = HADIS_COLLECTION[hadisIdx];

  const handleCopy = async (type: 'ayet' | 'hadis') => {
    const text =
      type === 'ayet'
        ? `${ayet.arabic}\n\n"${ayet.turkish}"\n— ${ayet.reference}`
        : `"${hadis.textTr}"\n— Hz. Muhammed (s.a.v.) (${hadis.source})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Günün Ayet-i Kerimesi */}
      <article className="flex flex-col justify-between rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 dark:border-[#1E2936] dark:bg-[#121A24]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 text-xs text-[#666C68] dark:text-[#8E9BA4]">
            <span>
              Günün Ayet-i Kerimesi · {ayet.topic}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setAyetIdx(
                    (i) => (i - 1 + AYET_COLLECTION.length) % AYET_COLLECTION.length
                  )
                }
                aria-label="Önceki ayet"
                className="inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg hover:bg-[#F1EEE7] dark:hover:bg-[#1A2532]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setAyetIdx(Math.floor(Math.random() * AYET_COLLECTION.length))
                }
                aria-label="Rastgele ayet"
                className="inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg hover:bg-[#F1EEE7] dark:hover:bg-[#1A2532]"
              >
                <Shuffle className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setAyetIdx((i) => (i + 1) % AYET_COLLECTION.length)
                }
                aria-label="Sonraki ayet"
                className="inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg hover:bg-[#F1EEE7] dark:hover:bg-[#1A2532]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p
            dir="rtl"
            lang="ar"
            className="font-serif text-xl sm:text-2xl leading-[2.1] text-right text-[#171A19] dark:text-[#EDF2F0]"
          >
            {ayet.arabic}
          </p>

          <p className="text-sm sm:text-base leading-relaxed text-[#363A38] dark:text-[#CBD5E1]">
            “{ayet.turkish}”
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#EEEAE0] pt-4 text-xs dark:border-[#1E2936]">
          <span className="font-medium text-[#0F6E56] dark:text-[#34D399]">
            {ayet.reference}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenTefsir && (
              <button
                type="button"
                onClick={onOpenTefsir}
                className="min-h-[36px] rounded-lg px-2.5 py-1 font-medium text-[#0F6E56] hover:bg-[#0F6E56]/8 dark:text-[#34D399] dark:hover:bg-[#10B981]/12 whitespace-nowrap shrink-0"
              >
                Elmalılı Tefsiri
              </button>
            )}
            {onOpenQuran && (
              <button
                type="button"
                onClick={onOpenQuran}
                className="min-h-[36px] rounded-lg px-2.5 py-1 font-medium text-[#575C59] hover:bg-[#F1EEE7] hover:text-[#171A19] dark:text-[#9CA7B0] dark:hover:bg-[#1A2532] whitespace-nowrap shrink-0"
              >
                Kur’an’ı Aç
              </button>
            )}
            <button
              type="button"
              onClick={() => handleCopy('ayet')}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#DDD7C9] px-2.5 py-1 font-medium text-[#575C59] hover:text-[#171A19] dark:border-[#243242] dark:text-[#9CA7B0]"
            >
              {copiedType === 'ayet' ? (
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
      </article>

      {/* Günün Hadis-i Şerifi */}
      <article className="flex flex-col justify-between rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 dark:border-[#1E2936] dark:bg-[#121A24]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 text-xs text-[#666C68] dark:text-[#8E9BA4]">
            <span>
              Günün Hadis-i Şerifi · {hadis.topic}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setHadisIdx(
                    (i) => (i - 1 + HADIS_COLLECTION.length) % HADIS_COLLECTION.length
                  )
                }
                aria-label="Önceki hadis"
                className="inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg hover:bg-[#F1EEE7] dark:hover:bg-[#1A2532]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setHadisIdx(Math.floor(Math.random() * HADIS_COLLECTION.length))
                }
                aria-label="Rastgele hadis"
                className="inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg hover:bg-[#F1EEE7] dark:hover:bg-[#1A2532]"
              >
                <Shuffle className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setHadisIdx((i) => (i + 1) % HADIS_COLLECTION.length)
                }
                aria-label="Sonraki hadis"
                className="inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg hover:bg-[#F1EEE7] dark:hover:bg-[#1A2532]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="font-display text-lg sm:text-xl leading-relaxed text-[#171A19] dark:text-[#EDF2F0]">
            “{hadis.textTr}”
          </p>

          <p className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
            Hz. Muhammed Mustafa (s.a.v.)
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#EEEAE0] pt-4 text-xs dark:border-[#1E2936]">
          <span className="font-medium text-[#B4832C] dark:text-[#FBBF24]">
            {hadis.source}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenRiyaz && (
              <button
                type="button"
                onClick={onOpenRiyaz}
                className="min-h-[36px] rounded-lg px-2.5 py-1 font-medium text-[#0F6E56] hover:bg-[#0F6E56]/8 dark:text-[#34D399] dark:hover:bg-[#10B981]/12 whitespace-nowrap shrink-0"
              >
                Riyâzu’s-Sâlihîn
              </button>
            )}
            {onOpenRamuz && (
              <button
                type="button"
                onClick={onOpenRamuz}
                className="min-h-[36px] rounded-lg px-2.5 py-1 font-medium text-[#575C59] hover:bg-[#F1EEE7] hover:text-[#171A19] dark:text-[#9CA7B0] dark:hover:bg-[#1A2532] whitespace-nowrap shrink-0"
              >
                Râmûzü’l-Ehâdîs
              </button>
            )}
            <button
              type="button"
              onClick={() => handleCopy('hadis')}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#DDD7C9] px-2.5 py-1 font-medium text-[#575C59] hover:text-[#171A19] dark:border-[#243242] dark:text-[#9CA7B0] whitespace-nowrap shrink-0"
            >
            {copiedType === 'hadis' ? (
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
      </article>
    </section>
  );
}
