import { useMemo, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  Search,
} from 'lucide-react';
import { normalizeTurkish } from '../data/cities';
import {
  ILMIHAL_BOOK_META,
  ILMIHAL_CHAPTERS,
  IlmihalTopic,
} from '../data/muhtasarIlmihalData';
import { BUILTIN_PDF_BOOKS } from '../data/pdfBooksData';
import { PdfBookReader } from './PdfBookReader';

export function MuhtasarIlmihalReader() {
  const [viewMode, setViewMode] = useState<'text' | 'pdf'>('text');
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    ILMIHAL_CHAPTERS[0].id
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileChaptersOpen, setMobileChaptersOpen] = useState(false);
  const [bookmarkedTopicId, setBookmarkedTopicId] = useState<string | null>(
    () => {
      try {
        return window.localStorage.getItem('mihrab_ilmihal_bookmark');
      } catch {
        return null;
      }
    }
  );
  const [copiedTopicId, setCopiedTopicId] = useState<string | null>(null);

  const activeChapter =
    ILMIHAL_CHAPTERS.find((c) => c.id === selectedChapterId) ??
    ILMIHAL_CHAPTERS[0];

  const normalizedQuery = useMemo(
    () => normalizeTurkish(searchQuery.trim()),
    [searchQuery]
  );

  const searchMatches = useMemo(() => {
    if (!normalizedQuery) return null;

    const results: { chapterTitle: string; chapterId: string; topic: IlmihalTopic }[] =
      [];
    for (const ch of ILMIHAL_CHAPTERS) {
      for (const topic of ch.topics) {
        const hay = normalizeTurkish(
          [
            ch.title,
            topic.title,
            topic.summary,
            ...topic.details,
            ...(topic.listItems ?? []),
            topic.transliteration ?? '',
            topic.meaning ?? '',
          ].join(' ')
        );
        if (hay.includes(normalizedQuery)) {
          results.push({
            chapterTitle: ch.title,
            chapterId: ch.id,
            topic,
          });
        }
      }
    }
    return results;
  }, [normalizedQuery]);

  const handleBookmark = (topicId: string) => {
    setBookmarkedTopicId(topicId);
    try {
      window.localStorage.setItem('mihrab_ilmihal_bookmark', topicId);
    } catch {
      // Ignore storage errors
    }
  };

  const handleJumpToBookmark = () => {
    if (!bookmarkedTopicId) return;
    const owner = ILMIHAL_CHAPTERS.find((ch) =>
      ch.topics.some((t) => t.id === bookmarkedTopicId)
    );
    if (owner) {
      setSearchQuery('');
      setSelectedChapterId(owner.id);
      setTimeout(() => {
        document
          .getElementById(`ilmihal-topic-${bookmarkedTopicId}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
    }
  };

  const handleCopyTopic = async (topic: IlmihalTopic) => {
    const lines = [
      `${topic.title} (${ILMIHAL_BOOK_META.publisher} · ${ILMIHAL_BOOK_META.title})`,
      '',
      topic.summary,
      ...topic.details,
      topic.arabicText ? `\n${topic.arabicText}` : '',
      topic.transliteration ? `Okunuşu: ${topic.transliteration}` : '',
      topic.meaning ? `Anlamı: ${topic.meaning}` : '',
      topic.listItems?.length
        ? `\n${topic.listTitle ?? 'Maddeler'}:\n${topic.listItems.map((i) => `- ${i}`).join('\n')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(lines);
      setCopiedTopicId(topic.id);
      setTimeout(() => setCopiedTopicId(null), 1800);
    } catch {
      // Ignore clipboard errors
    }
  };

  const totalTopicsCount = ILMIHAL_CHAPTERS.reduce(
    (sum, c) => sum + c.topics.length,
    0
  );

  const bookmarkedLabel = useMemo(() => {
    if (!bookmarkedTopicId) return null;
    for (const ch of ILMIHAL_CHAPTERS) {
      const found = ch.topics.find((t) => t.id === bookmarkedTopicId);
      if (found) return found.title;
    }
    return null;
  }, [bookmarkedTopicId]);

  return (
    <section className="space-y-6">
      {/* Book Metadata Header */}
      <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex h-32 w-24 shrink-0 flex-col items-center justify-center rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-3 text-center dark:border-[#243242] dark:bg-[#0D141C]">
            <BookOpen className="h-7 w-7 text-[#0F6E56] dark:text-[#34D399]" />
            <span className="mt-2 font-display text-xs font-semibold leading-tight text-[#171A19] dark:text-[#EDF2F0]">
              Muhtasar İlmihal
            </span>
            <span className="mt-0.5 text-[10px] text-[#666C68] dark:text-[#8E9BA4]">
              Fazilet Neşriyat
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
              {ILMIHAL_BOOK_META.publisher} · {ILMIHAL_BOOK_META.madhab}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
              {ILMIHAL_BOOK_META.title}
            </h1>
            <p className="text-sm leading-relaxed text-[#575C59] dark:text-[#9CA7B0]">
              {ILMIHAL_BOOK_META.subtitle} ·{' '}
              <span className="font-mono-tabular">
                {ILMIHAL_CHAPTERS.length}
              </span>{' '}
              Bölüm ·{' '}
              <span className="font-mono-tabular">{totalTopicsCount}</span> Temel
              Konu
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="inline-flex rounded-lg bg-[#EAE5DA] p-1 dark:bg-[#16202C]">
                <button
                  type="button"
                  onClick={() => setViewMode('text')}
                  className={`min-h-[38px] rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    viewMode === 'text'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  Metin &amp; Konular
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('pdf')}
                  className={`min-h-[38px] rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    viewMode === 'pdf'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  Orijinal PDF Kitap (240 Sayfa)
                </button>
              </div>

              {bookmarkedLabel && viewMode === 'text' && (
                <button
                  type="button"
                  onClick={handleJumpToBookmark}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#0F6E56]/30 bg-[#0F6E56]/6 px-3 py-1.5 text-xs font-medium text-[#0F6E56] hover:bg-[#0F6E56]/12 dark:border-[#34D399]/30 dark:text-[#34D399]"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Kaldığım Konu: {bookmarkedLabel}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'pdf' ? (
        <PdfBookReader mode="embedded" embeddedBook={BUILTIN_PDF_BOOKS[0]} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation */}
        <aside className="lg:col-span-4 rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-4 dark:border-[#1E2936] dark:bg-[#121A24] space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666C68]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İlmihalde konu ara (örn. abdest, sehiv, zekât)..."
              className="w-full min-h-[42px] rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] pl-9 pr-3 text-xs focus:border-[#0F6E56] focus:outline-none dark:border-[#243242] dark:bg-[#0D141C]"
            />
          </div>

          {/* Mobile Chapter Toggle */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileChaptersOpen((v) => !v)}
              className="flex w-full min-h-[44px] items-center justify-between rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] px-3.5 py-2 text-xs font-medium dark:border-[#243242] dark:bg-[#0D141C]"
            >
              <span className="truncate">
                {activeChapter.chapterNo}. {activeChapter.title}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ${
                  mobileChaptersOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          <div
            className={`${
              mobileChaptersOpen ? 'block' : 'hidden'
            } lg:block space-y-1`}
          >
            <h2 className="px-2 pb-1 text-xs font-semibold text-[#666C68] dark:text-[#8E9BA4]">
              Bölümler
            </h2>
            {ILMIHAL_CHAPTERS.map((ch) => {
              const isActive = !searchMatches && ch.id === activeChapter.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedChapterId(ch.id);
                    setMobileChaptersOpen(false);
                  }}
                  className={`flex w-full min-h-[48px] items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-[#0F6E56]/8 font-medium text-[#0F6E56] dark:bg-[#10B981]/12 dark:text-[#34D399]'
                      : 'hover:bg-[#FAF9F6] dark:hover:bg-[#17222E]'
                  }`}
                >
                  <span className="truncate">
                    {ch.chapterNo}. {ch.title}
                  </span>
                  <span className="font-mono-tabular text-xs text-[#666C68] dark:text-[#8E9BA4] shrink-0">
                    {ch.topics.length}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Reading Canvas */}
        <div className="lg:col-span-8 rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24] space-y-6">
          {searchMatches ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
                <h2 className="font-display text-xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                  Arama Sonuçları ({searchMatches.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-medium text-[#0F6E56] hover:underline dark:text-[#34D399]"
                >
                  Aramayı Temizle
                </button>
              </div>

              {searchMatches.length === 0 ? (
                <p className="py-10 text-center text-sm text-[#666C68] dark:text-[#8E9BA4]">
                  “{searchQuery}” ile eşleşen ilmihal konusu bulunamadı.
                </p>
              ) : (
                <div className="divide-y divide-[#EEEAE0] dark:divide-[#1E2936]">
                  {searchMatches.map(({ chapterTitle, topic }) => (
                    <TopicArticle
                      key={topic.id}
                      topic={topic}
                      chapterSubtitle={chapterTitle}
                      isBookmarked={bookmarkedTopicId === topic.id}
                      isCopied={copiedTopicId === topic.id}
                      onBookmark={() => handleBookmark(topic.id)}
                      onCopy={() => handleCopyTopic(topic)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
                <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
                  {activeChapter.chapterNo}. Bölüm · {activeChapter.subtitle}
                </div>
                <h2 className="mt-1 font-display text-2xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                  {activeChapter.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#575C59] dark:text-[#9CA7B0]">
                  {activeChapter.intro}
                </p>

                {activeChapter.topics.length > 1 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {activeChapter.topics.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          document
                            .getElementById(`ilmihal-topic-${t.id}`)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="min-h-[36px] rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] px-2.5 py-1.5 text-xs font-medium text-[#363A38] hover:border-[#0F6E56] hover:text-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#CBD5E1] dark:hover:border-[#34D399] dark:hover:text-[#34D399]"
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="divide-y divide-[#EEEAE0] dark:divide-[#1E2936]">
                {activeChapter.topics.map((topic) => (
                  <TopicArticle
                    key={topic.id}
                    topic={topic}
                    isBookmarked={bookmarkedTopicId === topic.id}
                    isCopied={copiedTopicId === topic.id}
                    onBookmark={() => handleBookmark(topic.id)}
                    onCopy={() => handleCopyTopic(topic)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </section>
  );
}

interface TopicArticleProps {
  topic: IlmihalTopic;
  chapterSubtitle?: string;
  isBookmarked: boolean;
  isCopied: boolean;
  onBookmark: () => void;
  onCopy: () => void;
}

function TopicArticle({
  topic,
  chapterSubtitle,
  isBookmarked,
  isCopied,
  onBookmark,
  onCopy,
}: TopicArticleProps) {
  return (
    <article
      id={`ilmihal-topic-${topic.id}`}
      className="py-6 space-y-4 first:pt-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {chapterSubtitle && (
            <div className="text-xs text-[#666C68] dark:text-[#8E9BA4] mb-0.5">
              {chapterSubtitle}
            </div>
          )}
          <h3 className="font-display text-xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
            {topic.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onBookmark}
            aria-label={`${topic.title} yer imine ekle`}
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
            onClick={onCopy}
            aria-label={`${topic.title} kopyala`}
            className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg text-[#575C59] hover:bg-[#F1EEE7] dark:text-[#9CA7B0] dark:hover:bg-[#1A2532]"
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-[#0F6E56] dark:text-[#34D399]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <p className="text-sm sm:text-base font-medium leading-relaxed text-[#171A19] dark:text-[#EDF2F0]">
        {topic.summary}
      </p>

      {topic.arabicText && (
        <div className="rounded-xl bg-[#FAF9F6] p-4 sm:p-5 space-y-2.5 dark:bg-[#0D141C]">
          <p
            dir="rtl"
            lang="ar"
            className="font-serif text-xl sm:text-2xl leading-[2.1] text-right text-[#171A19] dark:text-[#EDF2F0]"
          >
            {topic.arabicText}
          </p>
          {topic.transliteration && (
            <p className="text-xs sm:text-sm italic text-[#0F6E56] dark:text-[#34D399]">
              <strong>Okunuşu:</strong> {topic.transliteration}
            </p>
          )}
          {topic.meaning && (
            <p className="text-xs sm:text-sm leading-relaxed text-[#363A38] dark:text-[#CBD5E1]">
              <strong>Anlamı:</strong> {topic.meaning}
            </p>
          )}
        </div>
      )}

      {topic.details.length > 0 && (
        <div className="space-y-2 text-sm leading-relaxed text-[#363A38] dark:text-[#CBD5E1]">
          {topic.details.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      )}

      {topic.listItems && topic.listItems.length > 0 && (
        <div className="rounded-xl bg-[#FAF9F6] p-4 sm:p-5 space-y-2 dark:bg-[#0D141C]">
          {topic.listTitle && (
            <div className="text-xs font-semibold text-[#0F6E56] dark:text-[#34D399]">
              {topic.listTitle}
            </div>
          )}
          <ul className="space-y-1.5 text-xs sm:text-sm leading-relaxed text-[#363A38] dark:text-[#CBD5E1]">
            {topic.listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1 w-1 rounded-full bg-[#0F6E56] dark:bg-[#34D399] shrink-0"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
