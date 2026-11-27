import {
  Bell,
  BellOff,
  Compass,
  LayoutGrid,
  MapPin,
  Moon,
  Sun,
  Watch,
} from 'lucide-react';
import {
  CalculationMethodId,
  DailyPrayerSchedule,
  LocationInfo,
  MadhabId,
} from '../types/prayer';
import {
  CALCULATION_METHODS,
  formatFullClockInZone,
  NextPrayerStatus,
} from '../utils/prayerCalculator';

interface PrayerOverviewProps {
  location: LocationInfo;
  now: Date;
  schedule: DailyPrayerSchedule;
  nextStatus: NextPrayerStatus;
  methodId: CalculationMethodId;
  onChangeMethod: (method: CalculationMethodId) => void;
  madhabId: MadhabId;
  onChangeMadhab: (madhab: MadhabId) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  notificationsEnabled: boolean;
  onOpenNotifications: () => void;
  onOpenQibla: () => void;
  onOpenLocationModal: () => void;
  onOpenWidgetModal?: () => void;
  onOpenWatchModal?: () => void;
}

export function PrayerOverview({
  location,
  now,
  schedule,
  nextStatus,
  methodId,
  onChangeMethod,
  madhabId,
  onChangeMadhab,
  isDark,
  onToggleTheme,
  notificationsEnabled,
  onOpenNotifications,
  onOpenQibla,
  onOpenLocationModal,
  onOpenWidgetModal,
  onOpenWatchModal,
}: PrayerOverviewProps) {
  const localClock = formatFullClockInZone(now, location.timezone);

  // Compute solar arc coordinates for the astronomical horizon indicator
  const arcRadius = 92;
  const centerX = 120;
  const centerY = 108;
  // Angle goes from PI (left, İmsak) to 0 (right, Yatsı) along upper semicircle
  const progressFraction = Math.min(1, Math.max(0, nextStatus.progressPercent / 100));
  const currentIdx = schedule.prayers.findIndex(
    (p) => p.key === nextStatus.currentPrayer?.key
  );
  const overallDayRatio =
    currentIdx >= 0
      ? (currentIdx + progressFraction) / schedule.prayers.length
      : progressFraction;
  const theta = Math.PI * (1 - overallDayRatio);
  const markerX = centerX + arcRadius * Math.cos(theta);
  const markerY = centerY - arcRadius * Math.sin(theta);

  return (
    <section className="space-y-6">
      {/* Primary Hero Card (Single Focal Anchor) */}
      <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
        {/* Unboxed Metadata Strip with typographic separators */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-[#575C59] dark:text-[#9CA7B0]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="inline-flex items-center gap-1.5 font-medium text-[#171A19] hover:text-[#0F6E56] dark:text-[#EDF2F0] dark:hover:text-[#34D399] transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {location.name}
                {location.region ? `, ${location.region}` : ''} ({location.country})
              </span>
            </button>
            <span aria-hidden="true">·</span>
            <span>{schedule.gregorianDate}</span>
            <span aria-hidden="true">·</span>
            <span>{schedule.hijriDate}</span>
          </div>

          <div className="font-mono-tabular text-xs text-[#666C68] dark:text-[#8E9BA4]">
            Yerel Saat {localClock}
          </div>
        </div>

        {/* Hero Split: Countdown & Horizon Arc */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#0F6E56] dark:text-[#34D399]">
                {nextStatus.currentPrayer
                  ? `Şu an ${nextStatus.currentPrayer.label} vakti`
                  : 'Vakit takibi'}
                {' · '}Sıradaki ezan: {nextStatus.nextPrayer.label} ({nextStatus.nextPrayer.formattedTime})
              </p>
              <h1
                className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#171A19] dark:text-[#EDF2F0]"
                style={{ textWrap: 'balance' }}
              >
                {nextStatus.nextPrayer.label} vaktine{' '}
                <span className="font-mono-tabular text-[#0F6E56] dark:text-[#34D399]">
                  {nextStatus.countdownFormatted}
                </span>
              </h1>
            </div>

            {/* Clean Progress Bar */}
            <div className="space-y-2 pt-1 max-w-xl">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#EEEAE0] dark:bg-[#1E2936]">
                <div
                  className="h-full rounded-full bg-[#0F6E56] transition-transform duration-300 dark:bg-[#10B981]"
                  style={{ width: `${nextStatus.progressPercent.toFixed(1)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-[#666C68] dark:text-[#8E9BA4]">
                <span>
                  {nextStatus.currentPrayer?.label ?? 'Önceki vakit'}{' '}
                  <span className="font-mono-tabular">
                    {nextStatus.currentPrayer?.formattedTime ?? ''}
                  </span>
                </span>
                <span className="font-mono-tabular">
                  %{Math.round(nextStatus.progressPercent)} tamamlandı
                </span>
                <span>
                  {nextStatus.nextPrayer.label}{' '}
                  <span className="font-mono-tabular">
                    {nextStatus.nextPrayer.formattedTime}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Astronomical Solar Horizon Arc */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-xl bg-[#F7F5F0] px-5 py-4 dark:bg-[#0D141C]">
            <svg
              viewBox="0 0 240 132"
              className="w-full max-w-[260px]"
              role="img"
              aria-label="Günlük namaz vakitleri gökyüzü yayı"
            >
              {/* Horizon line */}
              <line
                x1="16"
                y1={centerY}
                x2="224"
                y2={centerY}
                stroke="currentColor"
                className="text-[#DCD6C8] dark:text-[#243242]"
                strokeWidth="1"
              />
              {/* Background semi-circle arc */}
              <path
                d={`M ${centerX - arcRadius} ${centerY} A ${arcRadius} ${arcRadius} 0 0 1 ${
                  centerX + arcRadius
                } ${centerY}`}
                fill="none"
                stroke="currentColor"
                className="text-[#DCD6C8] dark:text-[#243242]"
                strokeWidth="2"
                strokeDasharray="3 4"
              />
              {/* Active traversed arc */}
              <path
                d={`M ${centerX - arcRadius} ${centerY} A ${arcRadius} ${arcRadius} 0 0 1 ${markerX.toFixed(
                  2
                )} ${markerY.toFixed(2)}`}
                fill="none"
                stroke="currentColor"
                className="text-[#0F6E56] dark:text-[#34D399]"
                strokeWidth="2.5"
              />
              {/* Prayer station ticks */}
              {schedule.prayers.map((p, idx) => {
                const ratio = idx / (schedule.prayers.length - 1);
                const t = Math.PI * (1 - ratio);
                const px = centerX + arcRadius * Math.cos(t);
                const py = centerY - arcRadius * Math.sin(t);
                const isNext = p.key === nextStatus.nextPrayer.key;
                return (
                  <circle
                    key={p.key}
                    cx={px}
                    cy={py}
                    r={isNext ? 4 : 2.5}
                    className={
                      isNext
                        ? 'fill-[#B4832C] dark:fill-[#FBBF24]'
                        : 'fill-[#9CA39F] dark:fill-[#4B5A6B]'
                    }
                  />
                );
              })}
              {/* Current sun/moon marker */}
              <circle
                cx={markerX}
                cy={markerY}
                r="7"
                className="fill-[#0F6E56]/20 dark:fill-[#34D399]/25"
              />
              <circle
                cx={markerX}
                cy={markerY}
                r="4"
                className="fill-[#0F6E56] dark:fill-[#34D399]"
              />
              <text
                x="28"
                y="124"
                textAnchor="middle"
                className="fill-[#666C68] dark:fill-[#8E9BA4] text-[9px] font-medium"
              >
                İmsak
              </text>
              <text
                x="120"
                y="124"
                textAnchor="middle"
                className="fill-[#666C68] dark:fill-[#8E9BA4] text-[9px] font-medium"
              >
                Öğle
              </text>
              <text
                x="212"
                y="124"
                textAnchor="middle"
                className="fill-[#666C68] dark:fill-[#8E9BA4] text-[9px] font-medium"
              >
                Yatsı
              </text>
            </svg>
            <div className="mt-1 flex items-center gap-3 text-xs text-[#575C59] dark:text-[#9CA7B0]">
              <span>
                Kıble:{' '}
                <strong className="font-mono-tabular font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                  {schedule.qiblaAngle.toFixed(1)}°
                </strong>{' '}
                {schedule.qiblaDirectionLabel}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">
                {schedule.distanceToMeccaKm.toLocaleString('tr-TR')} km
              </span>
            </div>
          </div>
        </div>

        {/* Workspace Toolbar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEEAE0] pt-5 dark:border-[#1E2936]">
          <div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="method-select">
              Hesaplama Yöntemi
            </label>
            <select
              id="method-select"
              value={methodId}
              onChange={(e) =>
                onChangeMethod(e.target.value as CalculationMethodId)
              }
              className="min-h-[40px] rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] px-3 py-1.5 text-xs font-medium text-[#171A19] focus:border-[#0F6E56] focus:outline-none dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]"
            >
              {CALCULATION_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>

            <div
              role="group"
              aria-label="İkindi mezhep seçimi"
              className="inline-flex items-center rounded-lg bg-[#F1EEE7] p-1 dark:bg-[#18222E]"
            >
              <button
                type="button"
                onClick={() => onChangeMadhab('Shafi')}
                className={`min-h-[32px] rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  madhabId === 'Shafi'
                    ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                    : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                }`}
              >
                Standart İkindi
              </button>
              <button
                type="button"
                onClick={() => onChangeMadhab('Hanafi')}
                className={`min-h-[32px] rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  madhabId === 'Hanafi'
                    ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                    : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                }`}
              >
                Hanefi İkindi
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenWidgetModal && (
              <button
                type="button"
                onClick={onOpenWidgetModal}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] px-3 py-1.5 text-xs font-medium text-[#171A19] transition-colors hover:border-[#0F6E56] hover:text-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0] dark:hover:border-[#34D399] dark:hover:text-[#34D399] whitespace-nowrap"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#34D399]" aria-hidden="true" />
                <span>Widget Ekle</span>
              </button>
            )}

            {onOpenWatchModal && (
              <button
                type="button"
                onClick={onOpenWatchModal}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] px-3 py-1.5 text-xs font-medium text-[#171A19] transition-colors hover:border-[#0F6E56] hover:text-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0] dark:hover:border-[#34D399] dark:hover:text-[#34D399] whitespace-nowrap"
              >
                <Watch className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#34D399]" aria-hidden="true" />
                <span>Akıllı Saat</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenNotifications}
              className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                notificationsEnabled
                  ? 'border-[#0F6E56]/30 bg-[#0F6E56]/8 text-[#0F6E56] dark:border-[#34D399]/30 dark:bg-[#10B981]/12 dark:text-[#34D399]'
                  : 'border-[#DDD7C9] bg-[#FAF9F6] text-[#575C59] hover:text-[#171A19] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#9CA7B0]'
              }`}
            >
              {notificationsEnabled ? (
                <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <BellOff className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>
                {notificationsEnabled ? 'Bildirimler Açık' : 'Bildirim Ayarla'}
              </span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
              className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] px-2.5 text-[#575C59] transition-colors hover:text-[#171A19] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#9CA7B0] dark:hover:text-[#EDF2F0]"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-[#666C68] dark:text-[#8E9BA4]">
          Aktif hesaplama:{' '}
          <span className="font-medium text-[#171A19] dark:text-[#EDF2F0]">
            {CALCULATION_METHODS.find((m) => m.id === methodId)?.label}
          </span>
          {' · '}
          {CALCULATION_METHODS.find((m) => m.id === methodId)?.description}
        </p>
      </div>

      {/* 6 Daily Prayer Times Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {schedule.prayers.map((prayer) => {
          const isNext = prayer.key === nextStatus.nextPrayer.key;
          const isCurrent = prayer.key === nextStatus.currentPrayer?.key;

          return (
            <div
              key={prayer.key}
              className={`flex sm:flex-col items-center sm:items-start justify-between rounded-xl border p-4 sm:p-5 transition-colors ${
                isNext
                  ? 'border-[#0F6E56] bg-[#0F6E56]/6 dark:border-[#34D399] dark:bg-[#10B981]/10'
                  : isCurrent
                  ? 'border-[#B4832C]/45 bg-[#FFFFFF] dark:border-[#D4A853]/40 dark:bg-[#121A24]'
                  : 'border-[#E5E0D5] bg-[#FFFFFF] dark:border-[#1E2936] dark:bg-[#121A24]'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                    {prayer.label}
                  </span>
                </div>
                <p className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                  {isNext
                    ? 'Sıradaki vakit'
                    : isCurrent
                    ? 'İçinde olunan vakit'
                    : prayer.arabicHint}
                </p>
              </div>

              <div
                className={`font-mono-tabular text-2xl sm:text-3xl font-semibold sm:mt-4 ${
                  isNext
                    ? 'text-[#0F6E56] dark:text-[#34D399]'
                    : 'text-[#171A19] dark:text-[#EDF2F0]'
                }`}
              >
                {prayer.formattedTime}
              </div>
            </div>
          );
        })}
      </div>

      {/* Extended, Sunnah & Qibla Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-[#E5E0D5] bg-[#FFFFFF] px-4 py-3.5 dark:border-[#1E2936] dark:bg-[#121A24]">
          <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
            Sabah
          </div>
          <div className="mt-1 font-mono-tabular text-lg font-semibold">
            {schedule.extended.sabah}
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E0D5] bg-[#FFFFFF] px-4 py-3.5 dark:border-[#1E2936] dark:bg-[#121A24]">
          <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
            İşrak
          </div>
          <div className="mt-1 font-mono-tabular text-lg font-semibold">
            {schedule.extended.israk}
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E0D5] bg-[#FFFFFF] px-4 py-3.5 dark:border-[#1E2936] dark:bg-[#121A24]">
          <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
            Asr-ı Sânî
          </div>
          <div className="mt-1 font-mono-tabular text-lg font-semibold">
            {schedule.extended.asrSani}
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E0D5] bg-[#FFFFFF] px-4 py-3.5 dark:border-[#1E2936] dark:bg-[#121A24]">
          <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
            Gece Yarısı
          </div>
          <div className="mt-1 font-mono-tabular text-lg font-semibold">
            {schedule.sunnah.middleOfTheNight}
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E0D5] bg-[#FFFFFF] px-4 py-3.5 dark:border-[#1E2936] dark:bg-[#121A24]">
          <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
            Teheccüd
          </div>
          <div className="mt-1 font-mono-tabular text-lg font-semibold">
            {schedule.sunnah.lastThirdOfTheNight}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenQibla}
          className="flex items-center justify-between rounded-xl border border-[#E5E0D5] bg-[#FFFFFF] px-4 py-3.5 text-left transition-colors hover:border-[#0F6E56] dark:border-[#1E2936] dark:bg-[#121A24] dark:hover:border-[#34D399]"
        >
          <div className="min-w-0">
            <div className="text-xs text-[#666C68] dark:text-[#8E9BA4] truncate">
              Kıble Açısı
            </div>
            <div className="mt-1 font-mono-tabular text-lg font-semibold text-[#0F6E56] dark:text-[#34D399] truncate">
              {schedule.qiblaAngle.toFixed(1)}°
            </div>
          </div>
          <Compass className="h-5 w-5 shrink-0 text-[#0F6E56] dark:text-[#34D399]" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
