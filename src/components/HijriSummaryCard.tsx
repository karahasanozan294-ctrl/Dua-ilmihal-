import { useMemo } from 'react';
import { ArrowRight, CalendarDays } from 'lucide-react';
import {
  getHijriParts,
  getIslamicEventsForHijriYear,
  IslamicCalendarEvent,
} from '../data/islamicCalendar';

interface HijriSummaryCardProps {
  now: Date;
  onOpenCalendar: () => void;
}

function formatDaysRemainingLabel(days: number): string {
  if (days <= 0) return 'Bugün';
  if (days === 1) return 'Yarın';
  return `${days} gün`;
}

export function HijriSummaryCard({
  now,
  onOpenCalendar,
}: HijriSummaryCardProps) {
  const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  const { hijri, gregorianFull, todayEvents, upcomingEvents } = useMemo(() => {
    const refDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      12,
      0,
      0
    );
    const hijriParts = getHijriParts(refDate);
    const gregorianText = new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    }).format(refDate);

    const pool: IslamicCalendarEvent[] = [
      ...getIslamicEventsForHijriYear(hijriParts.year, refDate),
      ...getIslamicEventsForHijriYear(hijriParts.year + 1, refDate),
    ];

    const todayList = pool.filter((ev) => ev.daysRemaining === 0);
    const futureList = pool.filter((ev) => ev.daysRemaining > 0).slice(0, 4);

    return {
      hijri: hijriParts,
      gregorianFull: gregorianText,
      todayEvents: todayList,
      upcomingEvents: futureList,
    };
  }, [dateKey]);

  const highlightedList =
    todayEvents.length > 0
      ? [...todayEvents, ...upcomingEvents].slice(0, 4)
      : upcomingEvents;

  return (
    <section
      aria-label="Hicri Tarih ve Yaklaşan Dini Günler"
      className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Sol Sütun: Bugünün Hicri Tarihi */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
            <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Hicri Takvim · Bugün</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#171A19] dark:text-[#EDF2F0]">
            <span className="font-mono-tabular">{hijri.day}</span>{' '}
            {hijri.monthNameTr}{' '}
            <span className="font-mono-tabular">{hijri.year}</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#575C59] dark:text-[#9CA7B0]">
            {gregorianFull}
            <span aria-hidden="true"> · </span>
            <span className="font-mono-tabular">
              Hicri {hijri.year}. Yıl, {hijri.month}. Ay
            </span>
          </p>

          {todayEvents.length > 0 ? (
            <div className="rounded-xl bg-[#0F6E56]/8 p-4 dark:bg-[#10B981]/12">
              <div className="text-xs font-semibold text-[#0F6E56] dark:text-[#34D399]">
                Bugün Mübarek Gün · {todayEvents[0].categoryLabel}
              </div>
              <div className="mt-1 text-base font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                {todayEvents[0].title}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#363A38] dark:text-[#CBD5E1]">
                {todayEvents[0].description}
              </p>
            </div>
          ) : (
            upcomingEvents[0] && (
              <p className="pt-1 text-xs leading-relaxed text-[#575C59] dark:text-[#9CA7B0]">
                Sıradaki önemli gün:{' '}
                <strong className="font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                  {upcomingEvents[0].title}
                </strong>{' '}
                (
                <span className="font-mono-tabular text-[#0F6E56] dark:text-[#34D399]">
                  {upcomingEvents[0].daysRemaining} gün
                </span>{' '}
                kaldı · {upcomingEvents[0].hijriDateText})
              </p>
            )
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={onOpenCalendar}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] px-3.5 py-2 text-xs font-medium text-[#171A19] hover:border-[#0F6E56] hover:text-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0] dark:hover:border-[#34D399] dark:hover:text-[#34D399] whitespace-nowrap shrink-0 transition-colors"
            >
              <span>Tüm Hicri Günler ve Kandilleri Aç</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Sağ Sütun: Dinamik Yaklaşan Önemli Dini Günler */}
        <div className="lg:col-span-7 border-t border-[#EEEAE0] pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 dark:border-[#1E2936]">
          <div className="flex items-center justify-between gap-2 pb-3">
            <h3 className="text-sm font-semibold text-[#171A19] dark:text-[#EDF2F0]">
              Yaklaşan Önemli Dini Günler
            </h3>
            <span className="text-xs text-[#666C68] dark:text-[#8E9BA4] font-mono-tabular">
              {hijri.year}–{hijri.year + 1}
            </span>
          </div>

          <div className="divide-y divide-[#EEEAE0] dark:divide-[#1E2936]">
            {highlightedList.map((ev) => {
              const isToday = ev.daysRemaining === 0;
              const isKandil = ev.category === 'kandil';
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={onOpenCalendar}
                  className="flex w-full min-h-[56px] items-center justify-between gap-4 py-3 text-left transition-colors hover:bg-[#FAF9F6] -mx-2 px-2 rounded-lg dark:hover:bg-[#17222E]"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-sm font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                        {ev.title}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          isKandil
                            ? 'text-[#B4832C] dark:text-[#FBBF24]'
                            : 'text-[#0F6E56] dark:text-[#34D399]'
                        }`}
                      >
                        {ev.categoryLabel}
                      </span>
                    </div>
                    <div className="text-xs text-[#666C68] dark:text-[#8E9BA4] truncate">
                      {ev.hijriDateText} · {ev.gregorianFormatted}
                    </div>
                  </div>

                  <span
                    className={`font-mono-tabular text-xs font-semibold whitespace-nowrap shrink-0 ${
                      isToday
                        ? 'text-[#0F6E56] dark:text-[#34D399]'
                        : 'text-[#363A38] dark:text-[#CBD5E1]'
                    }`}
                  >
                    {formatDaysRemainingLabel(ev.daysRemaining)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
