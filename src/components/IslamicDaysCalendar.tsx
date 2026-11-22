import { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  buildGregorianHijriMonthGrid,
  getHijriParts,
  getIslamicEventsForHijriYear,
  IslamicEventCategory,
} from '../data/islamicCalendar';

const WEEKDAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export function IslamicDaysCalendar() {
  const today = useMemo(() => new Date(), []);
  const currentHijri = useMemo(() => getHijriParts(today), [today]);

  const [selectedHijriYear, setSelectedHijriYear] = useState<number>(
    currentHijri.year
  );
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | IslamicEventCategory
  >('all');

  const [calendarMonth, setCalendarMonth] = useState<{
    year: number;
    month: number;
  }>({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const events = useMemo(
    () => getIslamicEventsForHijriYear(selectedHijriYear, today),
    [selectedHijriYear, today]
  );

  const filteredEvents = useMemo(() => {
    if (categoryFilter === 'all') return events;
    return events.filter((ev) => ev.category === categoryFilter);
  }, [events, categoryFilter]);

  const upcomingEvent = useMemo(() => {
    const pool = [
      ...getIslamicEventsForHijriYear(currentHijri.year, today),
      ...getIslamicEventsForHijriYear(currentHijri.year + 1, today),
    ];
    return pool.find((ev) => ev.daysRemaining >= 0) ?? pool[0];
  }, [currentHijri.year, today]);

  const monthCells = useMemo(
    () =>
      buildGregorianHijriMonthGrid(
        calendarMonth.year,
        calendarMonth.month,
        today
      ),
    [calendarMonth, today]
  );

  const monthTitle = useMemo(() => {
    const d = new Date(calendarMonth.year, calendarMonth.month, 15);
    return new Intl.DateTimeFormat('tr-TR', {
      month: 'long',
      year: 'numeric',
    }).format(d);
  }, [calendarMonth]);

  const monthHijriSpan = useMemo(() => {
    if (monthCells.length === 0) return '';
    const firstInMonth =
      monthCells.find((c) => c.isCurrentMonth) ?? monthCells[0];
    const lastInMonth =
      [...monthCells].reverse().find((c) => c.isCurrentMonth) ??
      monthCells[monthCells.length - 1];
    if (firstInMonth.hijri.monthNameTr === lastInMonth.hijri.monthNameTr) {
      return `${firstInMonth.hijri.monthNameTr} ${firstInMonth.hijri.year}`;
    }
    return `${firstInMonth.hijri.monthNameTr} – ${lastInMonth.hijri.monthNameTr} ${lastInMonth.hijri.year}`;
  }, [monthCells]);

  const shiftMonth = (delta: number) => {
    setCalendarMonth((prev) => {
      const next = new Date(prev.year, prev.month + delta, 15);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  return (
    <section className="space-y-6">
      {/* Top Overview Card: Today's Hijri Date & Next Upcoming Kandil / Bayram */}
      <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-2">
            <p className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
              Hicri Takvim, Kandiller ve Bayram Günleri
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
              {currentHijri.day} {currentHijri.monthNameTr} {currentHijri.year}
            </h1>
            <p className="text-sm text-[#575C59] dark:text-[#9CA7B0]">
              Bugün:{' '}
              {new Intl.DateTimeFormat('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                weekday: 'long',
              }).format(today)}
            </p>
          </div>

          {upcomingEvent && (
            <div className="lg:col-span-5 rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-4 sm:p-5 dark:border-[#1E2936] dark:bg-[#0D141C]">
              <div className="flex items-center justify-between text-xs text-[#666C68] dark:text-[#8E9BA4]">
                <span>Yaklaşan Mübarek Gün</span>
                <span>{upcomingEvent.categoryLabel}</span>
              </div>
              <div className="mt-1.5 font-display text-xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                {upcomingEvent.title}
              </div>
              <div className="mt-1 text-xs text-[#575C59] dark:text-[#9CA7B0]">
                {upcomingEvent.gregorianFormatted} · {upcomingEvent.hijriDateText}
              </div>
              <div className="mt-2 font-mono-tabular text-sm font-semibold text-[#0F6E56] dark:text-[#34D399]">
                {upcomingEvent.daysRemaining === 0
                  ? 'Bugün'
                  : `${upcomingEvent.daysRemaining} gün kaldı`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Special Islamic Days List (Hicri Günler, Kandiller, Bayramlar) */}
      <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EEEAE0] pb-5 dark:border-[#1E2936]">
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F1EEE7] p-1 dark:bg-[#18222E]">
            {(
              [
                { id: 'all', label: 'Tümü' },
                { id: 'kandil', label: 'Kandiller' },
                { id: 'bayram', label: 'Bayramlar' },
                { id: 'hicri', label: 'Hicri Günler' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`min-h-[36px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === tab.id
                    ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                    : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
              Hicri Yıl:
            </span>
            <div className="inline-flex rounded-lg bg-[#F1EEE7] p-1 dark:bg-[#18222E]">
              {[currentHijri.year - 1, currentHijri.year, currentHijri.year + 1].map(
                (yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedHijriYear(yr)}
                    className={`min-h-[34px] rounded-md px-2.5 py-1 font-mono-tabular text-xs font-medium transition-colors ${
                      selectedHijriYear === yr
                        ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                        : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                    }`}
                  >
                    {yr}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 divide-y divide-[#EEEAE0] dark:divide-[#1E2936]">
          {filteredEvents.map((ev) => {
            const isToday = ev.daysRemaining === 0;
            const isPast = ev.daysRemaining < 0;

            return (
              <div
                key={ev.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 ${
                  isPast ? 'opacity-65' : ''
                }`}
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#666C68] dark:text-[#8E9BA4]">
                    <span
                      className={
                        ev.category === 'kandil'
                          ? 'font-semibold text-[#B4832C] dark:text-[#FBBF24]'
                          : ev.category === 'bayram'
                          ? 'font-semibold text-[#0F6E56] dark:text-[#34D399]'
                          : 'font-medium text-[#575C59] dark:text-[#9CA7B0]'
                      }
                    >
                      {ev.categoryLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{ev.hijriDateText}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                    {ev.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-[#575C59] dark:text-[#9CA7B0]">
                    {ev.description}
                  </p>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="text-sm font-medium text-[#171A19] dark:text-[#EDF2F0]">
                    {ev.gregorianFormatted}
                  </div>
                  <div
                    className={`mt-0.5 font-mono-tabular text-xs font-semibold ${
                      isToday
                        ? 'text-[#0F6E56] dark:text-[#34D399]'
                        : isPast
                        ? 'text-[#7D827E] dark:text-[#6E7B85]'
                        : 'text-[#0F6E56] dark:text-[#34D399]'
                    }`}
                  >
                    {isToday
                      ? 'Bugün'
                      : isPast
                      ? `${Math.abs(ev.daysRemaining)} gün önce`
                      : `${ev.daysRemaining} gün kaldı`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dual Gregorian-Hijri Monthly Grid */}
      <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
              Hicri – Miladi Aylık Takvim
            </h2>
            <p className="mt-0.5 text-xs text-[#666C68] dark:text-[#8E9BA4]">
              {monthTitle} · {monthHijriSpan}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Önceki ay"
              className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setCalendarMonth({
                  year: today.getFullYear(),
                  month: today.getMonth(),
                })
              }
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] px-3 text-xs font-medium hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C]"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Bugün</span>
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Sonraki ay"
              className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-[#666C68] dark:text-[#8E9BA4]">
          {WEEKDAYS_TR.map((wd) => (
            <div key={wd} className="py-2">
              {wd}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {monthCells.map((cell) => {
            const hasEvent = Boolean(cell.event);
            return (
              <div
                key={cell.date.toISOString()}
                className={`min-h-[72px] sm:min-h-[84px] rounded-xl border p-2 flex flex-col justify-between transition-colors ${
                  cell.isToday
                    ? 'border-[#0F6E56] bg-[#0F6E56]/8 dark:border-[#34D399] dark:bg-[#10B981]/12'
                    : hasEvent
                    ? 'border-[#B4832C]/45 bg-[#B4832C]/5 dark:border-[#D4A853]/40 dark:bg-[#D4A853]/8'
                    : 'border-[#EEEAE0] bg-[#FAF9F6] dark:border-[#1A2532] dark:bg-[#0D141C]'
                } ${!cell.isCurrentMonth ? 'opacity-40' : ''}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="font-mono-tabular text-sm font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                    {cell.gregorianDay}
                  </span>
                  <span className="font-mono-tabular text-[11px] text-[#666C68] dark:text-[#8E9BA4]">
                    {cell.hijri.day}
                  </span>
                </div>

                <div className="mt-1">
                  {cell.event ? (
                    <div
                      title={cell.event.title}
                      className="text-[10px] font-medium leading-tight text-[#0F6E56] dark:text-[#34D399] line-clamp-2"
                    >
                      {cell.event.title}
                    </div>
                  ) : (
                    <div className="text-[10px] text-[#7D827E] dark:text-[#6E7B85] truncate">
                      {cell.hijri.day === 1 ? cell.hijri.monthNameTr : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
