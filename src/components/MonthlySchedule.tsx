import { useMemo, useState } from 'react';
import { Calendar, Download, Printer } from 'lucide-react';
import {
  CalculationMethodId,
  LocationInfo,
  MadhabId,
} from '../types/prayer';
import {
  CALCULATION_METHODS,
  generateMonthlySchedule,
  getZoneDateComponents,
} from '../utils/prayerCalculator';

interface MonthlyScheduleProps {
  location: LocationInfo;
  methodId: CalculationMethodId;
  madhabId: MadhabId;
}

export function MonthlySchedule({
  location,
  methodId,
  madhabId,
}: MonthlyScheduleProps) {
  const [startDateStr, setStartDateStr] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });

  const startDate = useMemo(() => {
    const parsed = new Date(`${startDateStr}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [startDateStr]);

  const rows = useMemo(
    () => generateMonthlySchedule(location, startDate, 30, methodId, madhabId),
    [location, startDate, methodId, madhabId]
  );

  const todayKey = useMemo(() => {
    const t = getZoneDateComponents(new Date(), location.timezone);
    return `${t.year}-${t.month}-${t.day}`;
  }, [location.timezone]);

  const activeMethodLabel =
    CALCULATION_METHODS.find((m) => m.id === methodId)?.label ?? 'Diyanet';

  const handleDownloadCsv = () => {
    const headers = [
      'Miladi Tarih',
      'Hicri Tarih',
      'İmsak',
      'Güneş',
      'Öğle',
      'İkindi',
      'Akşam',
      'Yatsı',
    ];
    const lines = [
      headers.join(','),
      ...rows.map((r) =>
        [
          `"${r.gregorianDate}"`,
          `"${r.hijriDate}"`,
          ...r.prayers.map((p) => p.formattedTime),
        ].join(',')
      ),
    ];
    const blob = new Blob(['\uFEFF' + lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `imsakiye-${location.name
      .toLowerCase()
      .replace(/\s+/g, '-')}-${startDateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EEEAE0] pb-5 dark:border-[#1E2936]">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
              30 Günlük İmsakiye
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#575C59] dark:text-[#9CA7B0]">
              {location.name} ({location.country}) · {activeMethodLabel}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex items-center">
              <Calendar
                className="pointer-events-none absolute left-3 h-4 w-4 text-[#666C68] dark:text-[#8E9BA4]"
                aria-hidden="true"
              />
              <input
                type="date"
                aria-label="Başlangıç tarihi"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="min-h-[40px] rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] pl-9 pr-3 text-xs font-medium text-[#171A19] focus:border-[#0F6E56] focus:outline-none dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]"
              />
            </div>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] px-3 py-2 text-xs font-medium text-[#171A19] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0] whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>CSV İndir</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] px-3 py-2 text-xs font-medium text-[#171A19] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0] whitespace-nowrap"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Yazdır</span>
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5E0D5] text-xs font-medium text-[#666C68] dark:border-[#1E2936] dark:text-[#8E9BA4]">
                <th className="py-3 pr-4">Miladi Tarih</th>
                <th className="py-3 pr-4">Hicri Tarih</th>
                <th className="py-3 px-3 text-right">İmsak</th>
                <th className="py-3 px-3 text-right">Güneş</th>
                <th className="py-3 px-3 text-right">Öğle</th>
                <th className="py-3 px-3 text-right">İkindi</th>
                <th className="py-3 px-3 text-right">Akşam</th>
                <th className="py-3 pl-3 text-right">Yatsı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEAE0] dark:divide-[#1A2532]">
              {rows.map((row) => {
                const rowKey = `${row.date.getFullYear()}-${
                  row.date.getMonth() + 1
                }-${row.date.getDate()}`;
                const isToday = rowKey === todayKey;

                return (
                  <tr
                    key={rowKey}
                    className={
                      isToday
                        ? 'bg-[#0F6E56]/8 font-medium text-[#0F6E56] dark:bg-[#10B981]/12 dark:text-[#34D399]'
                        : 'hover:bg-[#FAF9F6] dark:hover:bg-[#16202C]'
                    }
                  >
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {row.gregorianDate}
                      {isToday ? ' (Bugün)' : ''}
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#666C68] dark:text-[#8E9BA4] whitespace-nowrap">
                      {row.hijriDate.replace(' (Hicri)', '')}
                    </td>
                    {row.prayers.map((p) => (
                      <td
                        key={p.key}
                        className="py-3 px-3 text-right font-mono-tabular whitespace-nowrap"
                      >
                        {p.formattedTime}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
