import { useState } from 'react';
import { Maximize2, Minimize2, Pin, PinOff, X } from 'lucide-react';
import { DailyPrayerSchedule, LocationInfo } from '../types/prayer';
import {
  closeDesktopWidgetWindow,
  focusDesktopMainWindow,
  setDesktopWidgetAlwaysOnTop,
} from '../utils/notifications';
import { NextPrayerStatus } from '../utils/prayerCalculator';

export type WidgetVariant = 'wide' | 'compact';
export type WidgetTheme = 'light' | 'emerald' | 'dark';

export interface WidgetPreferences {
  variant: WidgetVariant;
  theme: WidgetTheme;
  showHijri: boolean;
  floatingEnabled: boolean;
}

interface PrayerWidgetPreviewCardProps {
  location: LocationInfo;
  schedule: DailyPrayerSchedule;
  nextStatus: NextPrayerStatus;
  variant: WidgetVariant;
  theme: WidgetTheme;
  showHijri: boolean;
}

function getThemeClasses(theme: WidgetTheme) {
  if (theme === 'emerald') {
    return {
      container:
        'border-[#175B47] bg-[#0B3B2E] text-[#F4FAF7]',
      muted: 'text-[#A6D3C3]',
      accent: 'text-[#6EE7B7]',
      activeCol: 'bg-[#134E3D] border-[#267A61] text-[#6EE7B7]',
      colText: 'text-[#F4FAF7]',
      divider: 'border-[#185846]',
      countdownBox: 'bg-[#134E3D] text-[#6EE7B7]',
    };
  }
  if (theme === 'dark') {
    return {
      container:
        'border-[#223040] bg-[#121A24] text-[#EDF2F0]',
      muted: 'text-[#8E9BA4]',
      accent: 'text-[#34D399]',
      activeCol: 'bg-[#123027] border-[#1D5442] text-[#34D399]',
      colText: 'text-[#EDF2F0]',
      divider: 'border-[#1E2936]',
      countdownBox: 'bg-[#123027] text-[#34D399]',
    };
  }
  return {
    container:
      'border-[#E5E0D5] bg-[#FBF9F5] text-[#171A19]',
    muted: 'text-[#666C68]',
    accent: 'text-[#0F6E56]',
    activeCol: 'bg-[#E6F4F0] border-[#BBE2D6] text-[#0F6E56]',
    colText: 'text-[#171A19]',
    divider: 'border-[#E8E3D8]',
    countdownBox: 'bg-[#E6F4F0] text-[#0F6E56]',
  };
}

export function PrayerWidgetPreviewCard({
  location,
  schedule,
  nextStatus,
  variant,
  theme,
  showHijri,
}: PrayerWidgetPreviewCardProps) {
  const palette = getThemeClasses(theme);

  if (variant === 'compact') {
    const nextIdx = schedule.prayers.findIndex(
      (p) => p.key === nextStatus.nextPrayer.key
    );
    const followingPrayer =
      nextIdx >= 0 && nextIdx + 1 < schedule.prayers.length
        ? schedule.prayers[nextIdx + 1]
        : schedule.prayers[0];

    return (
      <div
        className={`w-full rounded-2xl border p-4 shadow-sm transition-colors ${palette.container}`}
      >
        <div className={`text-[11px] font-medium truncate ${palette.muted}`}>
          Mihrab · {location.name}
          {showHijri ? ` · ${schedule.hijriDate}` : ''}
        </div>
        <div className="mt-1.5 flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <span className="font-display text-lg font-semibold truncate">
              {nextStatus.nextPrayer.label}
            </span>
            <span className={`ml-1.5 font-mono-tabular text-sm ${palette.muted}`}>
              {nextStatus.nextPrayer.formattedTime}
            </span>
          </div>
          <div
            className={`font-mono-tabular shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold ${palette.countdownBox}`}
          >
            {nextStatus.countdownFormatted}
          </div>
        </div>
        <div
          className={`mt-2.5 border-t pt-2 text-[11px] flex items-center justify-between ${palette.divider} ${palette.muted}`}
        >
          <span>Sonraki: {followingPrayer.label}</span>
          <span className="font-mono-tabular">{followingPrayer.formattedTime}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-2xl border p-4 shadow-sm transition-colors ${palette.container}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold truncate">
            {location.name}
            {showHijri && (
              <span className={`font-normal ${palette.muted}`}>
                {' '}
                · {schedule.hijriDate}
              </span>
            )}
          </div>
          <div className={`text-[11px] font-medium truncate ${palette.accent}`}>
            Sıradaki: {nextStatus.nextPrayer.label} ({nextStatus.nextPrayer.formattedTime})
          </div>
        </div>

        <div
          className={`font-mono-tabular shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold ${palette.countdownBox}`}
        >
          {nextStatus.countdownFormatted}
        </div>
      </div>

      <div className={`my-3 border-t ${palette.divider}`} />

      <div className="grid grid-cols-6 gap-1.5 text-center">
        {schedule.prayers.map((prayer) => {
          const isNext = prayer.key === nextStatus.nextPrayer.key;
          return (
            <div
              key={prayer.key}
              className={`rounded-lg border px-1 py-1.5 ${
                isNext ? palette.activeCol : `border-transparent ${palette.colText}`
              }`}
            >
              <div
                className={`text-[10px] truncate ${
                  isNext ? 'font-semibold' : palette.muted
                }`}
              >
                {prayer.label}
              </div>
              <div className="mt-0.5 font-mono-tabular text-xs font-semibold">
                {prayer.formattedTime}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface FloatingMiniWidgetProps {
  location: LocationInfo;
  schedule: DailyPrayerSchedule;
  nextStatus: NextPrayerStatus;
  theme: WidgetTheme;
  showHijri: boolean;
  onClose: () => void;
  onOpenWidgetModal: () => void;
}

export function FloatingMiniWidget({
  location,
  schedule,
  nextStatus,
  theme,
  showHijri,
  onClose,
  onOpenWidgetModal,
}: FloatingMiniWidgetProps) {
  const [minimized, setMinimized] = useState(false);

  return (
    <aside
      aria-label="Mihrab Mini Vakit Widget"
      className="fixed bottom-20 right-3 md:bottom-6 md:right-6 z-40 w-[312px] sm:w-[344px]"
    >
      <div className="rounded-2xl border border-[#DDD7C9] bg-[#FFFFFF]/95 p-2 shadow-lg backdrop-blur-md dark:border-[#243242] dark:bg-[#0D141C]/95">
        <div className="mb-1.5 flex items-center justify-between px-1.5 text-[11px] text-[#666C68] dark:text-[#8E9BA4]">
          <button
            type="button"
            onClick={onOpenWidgetModal}
            className="font-medium hover:text-[#0F6E56] dark:hover:text-[#34D399]"
          >
            Mihrab Widget · Özelleştir
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMinimized((m) => !m)}
              aria-label={minimized ? 'Widget’ı genişlet' : 'Widget’ı küçült'}
              className="rounded-md p-1 hover:bg-[#F1EEE7] dark:hover:bg-[#1A2532]"
            >
              {minimized ? (
                <Maximize2 className="h-3.5 w-3.5" />
              ) : (
                <Minimize2 className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Mini widget’ı kapat"
              className="rounded-md p-1 hover:bg-[#F1EEE7] dark:hover:bg-[#1A2532]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <PrayerWidgetPreviewCard
          location={location}
          schedule={schedule}
          nextStatus={nextStatus}
          variant={minimized ? 'compact' : 'wide'}
          theme={theme}
          showHijri={showHijri}
        />
      </div>
    </aside>
  );
}

interface DesktopMiniWidgetViewProps {
  location: LocationInfo;
  schedule: DailyPrayerSchedule;
  nextStatus: NextPrayerStatus;
  theme: WidgetTheme;
  showHijri: boolean;
  onCycleTheme: () => void;
}

export function DesktopMiniWidgetView({
  location,
  schedule,
  nextStatus,
  theme,
  showHijri,
  onCycleTheme,
}: DesktopMiniWidgetViewProps) {
  const [pinned, setPinned] = useState(true);
  const [compact, setCompact] = useState(false);

  const togglePin = () => {
    const next = !pinned;
    setPinned(next);
    setDesktopWidgetAlwaysOnTop(next);
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F5F0] p-2.5 dark:bg-[#0B1117] flex flex-col justify-between select-none">
      <div className="[-webkit-app-region:drag] flex items-center justify-between gap-2 pb-1.5 px-1 text-[11px] text-[#575C59] dark:text-[#9CA7B0]">
        <span className="font-display font-semibold text-[#171A19] dark:text-[#EDF2F0] truncate">
          Mihrab Masaüstü Widget
        </span>
        <div className="[-webkit-app-region:no-drag] flex items-center gap-1">
          <button
            type="button"
            onClick={onCycleTheme}
            className="rounded px-1.5 py-0.5 text-[10px] font-medium hover:bg-[#EAE5DA] dark:hover:bg-[#1A2532]"
          >
            Tema
          </button>
          <button
            type="button"
            onClick={() => setCompact((c) => !c)}
            aria-label={compact ? 'Tam görünüm' : 'Kompakt görünüm'}
            className="rounded p-1 hover:bg-[#EAE5DA] dark:hover:bg-[#1A2532]"
          >
            {compact ? (
              <Maximize2 className="h-3.5 w-3.5" />
            ) : (
              <Minimize2 className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={togglePin}
            aria-label={pinned ? 'Üstte tutmayı kapat' : 'Her zaman üstte tut'}
            title={pinned ? 'Üstte sabitli' : 'Üste sabitle'}
            className={`rounded p-1 hover:bg-[#EAE5DA] dark:hover:bg-[#1A2532] ${
              pinned ? 'text-[#0F6E56] dark:text-[#34D399]' : ''
            }`}
          >
            {pinned ? <Pin className="h-3.5 w-3.5" /> : <PinOff className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => focusDesktopMainWindow()}
            className="rounded px-1.5 py-0.5 text-[10px] font-medium text-[#0F6E56] hover:bg-[#EAE5DA] dark:text-[#34D399] dark:hover:bg-[#1A2532]"
          >
            Ana Ekran
          </button>
          <button
            type="button"
            onClick={() => closeDesktopWidgetWindow()}
            aria-label="Masaüstü widget’ını kapat"
            className="rounded p-1 hover:bg-[#EAE5DA] dark:hover:bg-[#1A2532]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <PrayerWidgetPreviewCard
        location={location}
        schedule={schedule}
        nextStatus={nextStatus}
        variant={compact ? 'compact' : 'wide'}
        theme={theme}
        showHijri={showHijri}
      />
    </div>
  );
}
