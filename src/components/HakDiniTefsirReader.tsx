import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Loader2, Search } from 'lucide-react';
import { normalizeTurkish } from '../data/cities';
import {
  HAK_DINI_MUKADDIME,
  HAK_DINI_TEFSIR_SECTIONS,
} from '../data/hakDiniTefsirData';
import {
  fetchSurahContent,
  SURAH_CATALOG,
  SurahContent,
} from '../data/quranCatalog';

interface HakDiniTefsirReaderProps {
  initialSurah?: number;
}

export function HakDiniTefsirReader({ initialSurah }: HakDiniTefsirReaderProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    'mukaddime'
  );
  const [surahNumber, setSurahNumber] = useState<number>(initialSurah ?? 1);
  const [surahQuery, setSurahQuery] = useState('');
  const [surahContent, setSurahContent] = useState<SurahContent | null>(null);
  const [isLoadingSurah, setIsLoadingSurah] = useState(false);

  useEffect(() => {
    if (initialSurah) {
      const matching = HAK_DINI_TEFSIR_SECTIONS.find(
        (s) => s.surahNumber === initialSurah
      );
      if (matching) {
        setSelectedSectionId(matching.id);
      } else {
        setSelectedSectionId('surah-meal');
      }
      setSurahNumber(initialSurah);
    }
  }, [initialSurah]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingSurah(true);
    fetchSurahContent(surahNumber, controller.signal)
      .then((data) => {
        setSurahContent(data);
        setIsLoadingSurah(false);
      })
      .catch((err) => {
        if ((err as Error).name !== 'AbortError') {
          setIsLoadingSurah(false);
        }
      });
    return () => controller.abort();
  }, [surahNumber]);

  const activeTefsir = HAK_DINI_TEFSIR_SECTIONS.find(
    (s) => s.id === selectedSectionId
  );

  const filteredSurahs = useMemo(() => {
    const q = normalizeTurkish(surahQuery);
    if (!q) return SURAH_CATALOG;
    return SURAH_CATALOG.filter((s) =>
      normalizeTurkish(`${s.number} ${s.nameTr} ${s.meaningTr}`).includes(q)
    );
  }, [surahQuery]);

  const currentMeta =
    SURAH_CATALOG.find((s) => s.number === surahNumber) ?? SURAH_CATALOG[0];

  return (
    <section className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
        <p className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
          {HAK_DINI_MUKADDIME.author} · {HAK_DINI_MUKADDIME.subtitle}
        </p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
          Hak Dini Kur’an Dili — Kur’an-ı Kerim Tefsiri ve Meali
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#575C59] dark:text-[#9CA7B0]">
          Elmalılı Muhammed Hamdi Yazır’ın dokuz ciltlik klasik tefsirinden mukaddime usulü, seçkin sure tefsirleri ve 114 surenin tamamı için Elmalılı Hamdi Yazır meali.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation: Tefsir Sections + 114 Sure Elmalılı Meali */}
        <aside className="lg:col-span-4 rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-4 dark:border-[#1E2936] dark:bg-[#121A24] space-y-4">
          <div className="space-y-1">
            <h2 className="px-2 text-xs font-semibold text-[#666C68] dark:text-[#8E9BA4]">
              Tefsir Bölümleri
            </h2>
            <button
              type="button"
              onClick={() => setSelectedSectionId('mukaddime')}
              className={`flex w-full min-h-[44px] items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                selectedSectionId === 'mukaddime'
                  ? 'bg-[#0F6E56]/8 font-medium text-[#0F6E56] dark:bg-[#10B981]/12 dark:text-[#34D399]'
                  : 'hover:bg-[#FAF9F6] dark:hover:bg-[#17222E]'
              }`}
            >
              <span>Mukaddime (Tefsir Usulü)</span>
            </button>

            {HAK_DINI_TEFSIR_SECTIONS.map((sec) => {
              const isActive = selectedSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setSelectedSectionId(sec.id);
                    setSurahNumber(sec.surahNumber);
                  }}
                  className={`flex w-full min-h-[46px] items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-[#0F6E56]/8 font-medium text-[#0F6E56] dark:bg-[#10B981]/12 dark:text-[#34D399]'
                      : 'hover:bg-[#FAF9F6] dark:hover:bg-[#17222E]'
                  }`}
                >
                  <span className="truncate">{sec.title}</span>
                  <span className="text-[11px] text-[#666C68] dark:text-[#8E9BA4] shrink-0">
                    {sec.volumeHint}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 114 Sure Elmalılı Meali Selector */}
          <div className="border-t border-[#EEEAE0] pt-4 space-y-2.5 dark:border-[#1E2936]">
            <h2 className="px-1 text-xs font-semibold text-[#666C68] dark:text-[#8E9BA4]">
              114 Sure — Elmalılı Meali ile Oku
            </h2>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666C68]" />
              <input
                type="text"
                value={surahQuery}
                onChange={(e) => setSurahQuery(e.target.value)}
                placeholder="Sure ara (örn. Bakara, Kehf)..."
                className="w-full min-h-[40px] rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] pl-9 pr-3 text-xs focus:border-[#0F6E56] focus:outline-none dark:border-[#243242] dark:bg-[#0D141C]"
              />
            </div>

            <div className="max-h-[260px] overflow-y-auto divide-y divide-[#EEEAE0] dark:divide-[#1A2532]">
              {filteredSurahs.map((s) => {
                const isSelected =
                  selectedSectionId === 'surah-meal' && surahNumber === s.number;
                return (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => {
                      setSurahNumber(s.number);
                      setSelectedSectionId('surah-meal');
                    }}
                    className={`flex w-full min-h-[44px] items-center justify-between px-2.5 py-2 text-left text-xs rounded-lg ${
                      isSelected
                        ? 'bg-[#0F6E56]/8 font-medium text-[#0F6E56] dark:bg-[#10B981]/12 dark:text-[#34D399]'
                        : 'hover:bg-[#FAF9F6] dark:hover:bg-[#17222E]'
                    }`}
                  >
                    <span>
                      {s.number}. {s.nameTr}
                    </span>
                    <span className="text-[#666C68] dark:text-[#8E9BA4]">
                      {s.ayahCount} ayet
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Reading Canvas */}
        <div className="lg:col-span-8 rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24] space-y-6">
          {selectedSectionId === 'mukaddime' && (
            <div className="space-y-6">
              <div className="border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
                <h2 className="font-display text-2xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                  {HAK_DINI_MUKADDIME.title}
                </h2>
                <p className="mt-1 text-xs text-[#666C68] dark:text-[#8E9BA4]">
                  Tefsir Mukaddimesi · İlim, Vahiy ve Dil Usulü
                </p>
              </div>

              <div className="space-y-5">
                {HAK_DINI_MUKADDIME.points.map((pt) => (
                  <article
                    key={pt.heading}
                    className="rounded-xl border border-[#EEEAE0] bg-[#FAF9F6] p-5 dark:border-[#1E2936] dark:bg-[#0D141C]"
                  >
                    <h3 className="text-base font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                      {pt.heading}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#363A38] dark:text-[#CBD5E1]">
                      {pt.text}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTefsir && (
            <div className="space-y-6">
              <div className="border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
                <div className="text-xs text-[#0F6E56] dark:text-[#34D399] font-medium">
                  {activeTefsir.volumeHint} · {activeTefsir.ayahRange}
                </div>
                <h2 className="mt-1 font-display text-2xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                  {activeTefsir.title}
                </h2>
              </div>

              <div className="rounded-xl border border-[#EEEAE0] bg-[#FAF9F6] p-5 dark:border-[#1E2936] dark:bg-[#0D141C]">
                <h3 className="text-sm font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                  Nüzul Ortamı ve Ana Konu
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#363A38] dark:text-[#CBD5E1]">
                  {activeTefsir.nuzulContext}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                  Kavram ve Lafız Tahlilleri
                </h3>
                <div className="divide-y divide-[#EEEAE0] rounded-xl border border-[#EEEAE0] dark:divide-[#1E2936] dark:border-[#1E2936]">
                  {activeTefsir.keyConcepts.map((c) => (
                    <div key={c.term} className="p-4">
                      <div className="text-sm font-semibold text-[#0F6E56] dark:text-[#34D399]">
                        {c.term}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-[#363A38] dark:text-[#CBD5E1]">
                        {c.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                  Elmalılı Tefsiri Işığında Açıklamalar
                </h3>
                <div className="space-y-2.5 text-sm leading-relaxed text-[#363A38] dark:text-[#CBD5E1]">
                  {activeTefsir.tefsirSummary.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#EEEAE0] pt-4 dark:border-[#1E2936]">
                <button
                  type="button"
                  onClick={() => {
                    setSurahNumber(activeTefsir.surahNumber);
                    setSelectedSectionId('surah-meal');
                  }}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E]"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {currentMeta.nameTr} Suresi Elmalılı Mealini Ayet Ayet Oku
                  </span>
                </button>
              </div>
            </div>
          )}

          {selectedSectionId === 'surah-meal' && (
            <div className="space-y-5">
              <div className="border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
                <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                  Hak Dini Kur’an Dili Meali · {currentMeta.revelation} Dönemi ·{' '}
                  {currentMeta.ayahCount} Ayet
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-2xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                    {currentMeta.number}. {currentMeta.nameTr} Suresi
                  </h2>
                  <span
                    dir="rtl"
                    lang="ar"
                    className="font-serif text-2xl text-[#0F6E56] dark:text-[#34D399]"
                  >
                    {currentMeta.nameAr}
                  </span>
                </div>
              </div>

              {isLoadingSurah ? (
                <div className="flex flex-col items-center justify-center py-12 text-sm text-[#666C68] dark:text-[#8E9BA4]">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0F6E56] dark:text-[#34D399]" />
                  <p className="mt-3">Elmalılı Hamdi Yazır meali yükleniyor...</p>
                </div>
              ) : (
                <div className="divide-y divide-[#EEEAE0] dark:divide-[#1E2936]">
                  {surahContent?.ayahs.map((ayah) => (
                    <article key={ayah.numberInSurah} className="py-5">
                      <div className="font-mono-tabular text-xs font-semibold text-[#0F6E56] dark:text-[#34D399] mb-2">
                        {surahNumber}:{ayah.numberInSurah}
                      </div>
                      <p
                        dir="rtl"
                        lang="ar"
                        className="font-serif text-2xl leading-[2.1] text-right text-[#171A19] dark:text-[#EDF2F0]"
                      >
                        {ayah.arabic}
                      </p>
                      <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#363A38] dark:text-[#CBD5E1]">
                        {ayah.elmalili || ayah.turkish}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
