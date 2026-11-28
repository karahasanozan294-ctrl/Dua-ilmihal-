import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  List,
  Maximize2,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import {
  CalculationMethodId,
  DailyPrayerSchedule,
  LocationInfo,
  MadhabId,
  PrayerKey,
  TemkinOffsets,
} from '../types/prayer';
import { ZikirState } from '../types/zikir';
import {
  formatFullClockInZone,
  NextPrayerStatus,
} from '../utils/prayerCalculator';

export type WatchTab = 'vakit' | 'liste' | 'kible' | 'zikir' | 'ayar';
export type WatchShape = 'round' | 'square';

const DEFAULT_TEMKIN: TemkinOffsets = {
  imsak: 0,
  gunes: 0,
  ogle: 0,
  ikindi: 0,
  aksam: 0,
  yatsi: 0,
};

interface WatchModeViewProps {
  location: LocationInfo;
  now: Date;
  schedule: DailyPrayerSchedule;
  nextStatus: NextPrayerStatus;
  zikirState: ZikirState;
  onZikirIncrement: () => void;
  onZikirDecrement: () => void;
  onZikirResetCurrent: () => void;
  onZikirSelect: (id: string) => void;
  methodId?: CalculationMethodId;
  onChangeMethod?: (method: CalculationMethodId) => void;
  madhabId?: MadhabId;
  onChangeMadhab?: (madhab: MadhabId) => void;
  temkinOffsets?: Partial<TemkinOffsets>;
  onChangeTemkinOffsets?: (next: TemkinOffsets) => void;
  onOpenLocationModal?: () => void;
  onExitWatchMode?: () => void;
  embedded?: boolean;
  shape?: WatchShape;
  onToggleShape?: () => void;
}

function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function shortestSignedAngle(target: number, current: number): number {
  let diff = normalizeAngle(target) - normalizeAngle(current);
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

export function WatchModeView({
  location,
  now,
  schedule,
  nextStatus,
  zikirState,
  onZikirIncrement,
  onZikirDecrement,
  onZikirResetCurrent,
  onZikirSelect,
  methodId = 'Turkey',
  onChangeMethod,
  madhabId = 'Shafi',
  onChangeMadhab,
  temkinOffsets,
  onChangeTemkinOffsets,
  onOpenLocationModal,
  onExitWatchMode,
  embedded = false,
  shape: controlledShape,
  onToggleShape,
}: WatchModeViewProps) {
  const [activeTab, setActiveTab] = useState<WatchTab>('vakit');
  const [internalShape, setInternalShape] = useState<WatchShape>('round');
  const [heading, setHeading] = useState<number | null>(null);

  const shape = controlledShape ?? internalShape;
  const normalizedTemkin: TemkinOffsets = {
    ...DEFAULT_TEMKIN,
    ...temkinOffsets,
  };
  const hasAnyTemkin = Object.values(normalizedTemkin).some((v) => v !== 0);

  const adjustTemkin = (key: PrayerKey, delta: number) => {
    if (!onChangeTemkinOffsets) return;
    const nextVal = Math.max(-30, Math.min(30, normalizedTemkin[key] + delta));
    onChangeTemkinOffsets({
      ...normalizedTemkin,
      [key]: nextVal,
    });
  };

  const resetAllTemkin = () => {
    if (!onChangeTemkinOffsets) return;
    onChangeTemkinOffsets({ ...DEFAULT_TEMKIN });
  };

  // Compact wrist compass listener when Kıble tab is active
  useEffect(() => {
    if (activeTab !== 'kible' || typeof window === 'undefined') return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const ev = event as DeviceOrientationEvent & {
        webkitCompassHeading?: number;
      };
      if (typeof ev.webkitCompassHeading === 'number' && !Number.isNaN(ev.webkitCompassHeading)) {
        setHeading(normalizeAngle(ev.webkitCompassHeading));
        return;
      }
      if (typeof event.alpha === 'number' && !Number.isNaN(event.alpha)) {
        setHeading(normalizeAngle(360 - event.alpha));
      }
    };

    const win = window as Window & {
      ondeviceorientationabsolute?: unknown;
    };
    const eventName =
      'ondeviceorientationabsolute' in win
        ? 'deviceorientationabsolute'
        : 'deviceorientation';

    window.addEventListener(eventName, handleOrientation as EventListener, true);
    return () => {
      window.removeEventListener(
        eventName,
        handleOrientation as EventListener,
        true
      );
    };
  }, [activeTab]);

  const activeZikirIndex = useMemo(() => {
    const idx = zikirState.items.findIndex((i) => i.id === zikirState.activeId);
    return idx >= 0 ? idx : 0;
  }, [zikirState.items, zikirState.activeId]);

  const activeZikir = zikirState.items[activeZikirIndex] ?? zikirState.items[0];

  const cycleZikir = (dir: -1 | 1) => {
    if (!zikirState.items.length) return;
    const nextIdx =
      (activeZikirIndex + dir + zikirState.items.length) %
      zikirState.items.length;
    onZikirSelect(zikirState.items[nextIdx].id);
  };

  const hhmm = useMemo(
    () => formatFullClockInZone(now, location.timezone).slice(0, 5),
    [now, location.timezone]
  );

  // SVG Ring math (circumference for r=92 is 2*PI*92 ≈ 578.05)
  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, nextStatus.progressPercent));
  const dashOffset = circumference * (1 - progress / 100);

  // Compass bearing math
  const qiblaBearing = schedule.qiblaAngle;
  const compassDelta =
    heading !== null ? shortestSignedAngle(qiblaBearing, heading) : qiblaBearing;
  const isQiblaAligned = heading !== null && Math.abs(compassDelta) <= 6;

  // Detect true tiny watch viewport vs phone/desktop frame
  const isTinyPhysicalWatch =
    !embedded &&
    typeof window !== 'undefined' &&
    window.innerWidth <= 340 &&
    window.innerHeight <= 380;

  const dialClassName = isTinyPhysicalWatch
    ? 'relative flex h-screen w-screen flex-col items-center justify-between overflow-hidden bg-[#040806] text-[#EDF2F0] px-4 py-3 select-none'
    : `relative flex flex-col items-center justify-between overflow-hidden bg-[#040806] text-[#EDF2F0] border-[3px] border-[#202C28] shadow-2xl select-none transition-all ${
        embedded ? 'h-[268px] w-[268px]' : 'h-[312px] w-[312px] sm:h-[340px] sm:w-[340px]'
      } ${shape === 'round' ? 'rounded-full px-6 py-5' : 'rounded-[44px] px-5 py-4'}`;

  const dialContent = (
    <div className={dialClassName}>
      {/* Background Ambient Countdown Ring on Main Dial */}
      {activeTab === 'vakit' && (
        <svg
          viewBox="0 0 200 200"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#13221C"
            strokeWidth="5"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#10B981"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
      )}

      {/* Top Watch Status Row */}
      <div className="relative z-10 flex w-full items-center justify-center gap-1.5 pt-1 text-[11px] font-medium text-[#9DB0A8]">
        {onOpenLocationModal ? (
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="inline-flex max-w-[104px] items-center gap-1 truncate hover:text-[#34D399]"
            title="Konumu değiştir"
          >
            <MapPin className="h-3 w-3 shrink-0 text-[#34D399]" />
            <span className="truncate">{location.name}</span>
          </button>
        ) : (
          <span className="inline-flex max-w-[104px] items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0 text-[#34D399]" />
            <span className="truncate">{location.name}</span>
          </span>
        )}
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={() => setActiveTab('ayar')}
          title="Takvim ve temkin ayarları"
          className="inline-flex items-center gap-1 font-mono-tabular font-semibold text-[#EDF2F0] hover:text-[#34D399]"
        >
          {methodId === 'Fazilet' && (
            <span className="text-[9px] font-bold text-[#34D399]">FZL</span>
          )}
          <span>{hhmm}</span>
        </button>
      </div>

      {/* Main Watch Face Content */}
      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center overflow-hidden px-1 py-1">
        {activeTab === 'vakit' && (
          <div className="flex flex-col items-center text-center">
            <span className="text-[11px] font-medium text-[#34D399]">
              Sıradaki · {nextStatus.nextPrayer.formattedTime}
              {methodId === 'Fazilet' ? ' · Fazilet' : ''}
            </span>
            <div className="mt-0.5 font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
              {nextStatus.nextPrayer.label}
            </div>
            <div className="mt-1 font-mono-tabular text-2xl sm:text-3xl font-bold tracking-tight text-[#34D399]">
              {nextStatus.countdownFormatted}
            </div>
            <div className="mt-1.5 text-[10px] text-[#8EA39B]">
              {nextStatus.currentPrayer
                ? `Şu an: ${nextStatus.currentPrayer.label} (${nextStatus.currentPrayer.formattedTime})`
                : schedule.hijriDate}
            </div>
          </div>
        )}

        {activeTab === 'liste' && (
          <div className="w-full max-w-[215px] flex-1 overflow-y-auto px-1 py-1 space-y-1">
            {methodId === 'Fazilet' && (
              <div className="flex items-center justify-between px-1.5 pb-0.5 text-[9px] font-semibold text-[#34D399]">
                <span>Fazilet Takvimi (Temkinli)</span>
                {hasAnyTemkin && <span>±dk</span>}
              </div>
            )}
            {schedule.prayers.map((p) => {
              const isNext = p.key === nextStatus.nextPrayer.key;
              const isCurrent = p.key === nextStatus.currentPrayer?.key;
              const offset = normalizedTemkin[p.key];
              return (
                <div
                  key={p.key}
                  className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs border ${
                    isNext
                      ? 'border-[#34D399]/60 bg-[#10B981]/20 text-white font-semibold'
                      : isCurrent
                      ? 'border-[#FBBF24]/40 bg-[#FBBF24]/10 text-[#FDE68A]'
                      : 'border-[#16241F] bg-[#0B1310] text-[#B7C7C0]'
                  }`}
                >
                  <span className="truncate">
                    {p.label}
                    {offset !== 0 && (
                      <span className="ml-1 text-[9px] text-[#34D399]">
                        ({offset > 0 ? `+${offset}` : offset}d)
                      </span>
                    )}
                  </span>
                  <span className="font-mono-tabular">{p.formattedTime}</span>
                </div>
              );
            })}
            <div className="flex items-center justify-between px-2 pt-1 text-[10px] text-[#7D9189]">
              <span>Sabah {schedule.extended.sabah}</span>
              <span>Teheccüd {schedule.sunnah.lastThirdOfTheNight}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('ayar')}
              className="mt-1 flex w-full items-center justify-center gap-1 rounded-xl border border-[#1E332B] bg-[#0B1511] px-2 py-1.5 text-[10px] font-semibold text-[#34D399] hover:border-[#34D399]/60"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>Takvim, Temkin & Konum</span>
            </button>
          </div>
        )}

        {activeTab === 'kible' && (
          <div className="flex flex-col items-center justify-center text-center">
            <div
              className={`relative flex h-24 w-24 items-center justify-center rounded-full border-2 transition-colors ${
                isQiblaAligned
                  ? 'border-[#34D399] bg-[#10B981]/15'
                  : 'border-[#1E332B] bg-[#0A1310]'
              }`}
            >
              <svg viewBox="0 0 120 120" className="h-full w-full">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#1D322A"
                  strokeWidth="1.5"
                  strokeDasharray="3 4"
                />
                <text
                  x="60"
                  y="15"
                  textAnchor="middle"
                  className="fill-[#6E827A] text-[9px] font-bold"
                >
                  K
                </text>
                <g transform={`rotate(${compassDelta} 60 60)`}>
                  <polygon
                    points="60,16 53,60 67,60"
                    className={
                      isQiblaAligned ? 'fill-[#34D399]' : 'fill-[#FBBF24]'
                    }
                  />
                  <polygon points="60,104 55,60 65,60" fill="#273D35" />
                  <circle cx="60" cy="60" r="4.5" fill="#EDF2F0" />
                </g>
              </svg>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold">
              <span className="font-mono-tabular text-[#34D399]">
                {schedule.qiblaAngle.toFixed(1)}°
              </span>
              <span className="text-[#CBD5E1]">
                {schedule.qiblaDirectionLabel}
              </span>
            </div>
            <div className="text-[10px] text-[#8EA39B]">
              {isQiblaAligned
                ? 'Kıble yönü hizalandı'
                : heading !== null
                ? 'Oku yukarı (12 yönüne) çevirin'
                : `Kâbe · ${schedule.distanceToMeccaKm.toLocaleString('tr-TR')} km`}
            </div>
          </div>
        )}

        {activeTab === 'zikir' && activeZikir && (
          <div className="flex w-full flex-col items-center justify-center">
            <div className="flex w-full max-w-[195px] items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => cycleZikir(-1)}
                aria-label="Önceki zikir"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#101C18] text-[#9DB0A8] hover:text-white"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="truncate text-[11px] font-semibold text-[#EDF2F0]">
                {activeZikir.title}
              </span>
              <button
                type="button"
                onClick={() => cycleZikir(1)}
                aria-label="Sonraki zikir"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#101C18] text-[#9DB0A8] hover:text-white"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onZikirIncrement}
              className="mt-1.5 flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-[#34D399]/70 bg-[#0D261D] text-white active:scale-95 transition-transform"
            >
              <span className="font-mono-tabular text-3xl font-bold leading-none text-[#34D399]">
                {activeZikir.count}
              </span>
              <span className="mt-1 font-mono-tabular text-[10px] text-[#A7BDB4]">
                / {activeZikir.target} · Tur {activeZikir.rounds}
              </span>
            </button>

            <div className="mt-1.5 flex items-center gap-3">
              <button
                type="button"
                onClick={onZikirDecrement}
                aria-label="Bir azalt"
                className="inline-flex h-6 items-center gap-1 rounded-md bg-[#111D18] px-2 text-[10px] text-[#9DB0A8] hover:text-white"
              >
                <Minus className="h-3 w-3" />
                <span>1</span>
              </button>
              <button
                type="button"
                onClick={onZikirResetCurrent}
                aria-label="Sayacı sıfırla"
                className="inline-flex h-6 items-center gap-1 rounded-md bg-[#111D18] px-2 text-[10px] text-[#9DB0A8] hover:text-white"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Sıfırla</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ayar' && (
          <div className="w-full max-w-[214px] flex-1 overflow-y-auto px-1 py-1 space-y-2 text-[11px]">
            {/* Takvim Seçimi */}
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-[#8EA39B]">
                Hesaplama Takvimi
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => onChangeMethod?.('Turkey')}
                  className={`rounded-lg py-1.5 text-[10px] font-semibold transition-colors ${
                    methodId !== 'Fazilet'
                      ? 'bg-[#10B981] text-[#05120D]'
                      : 'bg-[#101C18] text-[#9DB0A8] hover:text-white'
                  }`}
                >
                  Diyanet
                </button>
                <button
                  type="button"
                  onClick={() => onChangeMethod?.('Fazilet')}
                  className={`rounded-lg py-1.5 text-[10px] font-semibold transition-colors ${
                    methodId === 'Fazilet'
                      ? 'bg-[#10B981] text-[#05120D]'
                      : 'bg-[#101C18] text-[#9DB0A8] hover:text-white'
                  }`}
                >
                  Fazilet (Temkin)
                </button>
              </div>
              {methodId === 'Fazilet' && (
                <div className="text-[9px] text-[#34D399]">
                  İmsak -19°, Yatsı -17° ve geleneksel temkinler etkin
                </div>
              )}
            </div>

            {/* İkindi Mezhebi */}
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-[#8EA39B]">
                İkindi Vakti
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => onChangeMadhab?.('Shafi')}
                  className={`rounded-lg py-1.5 text-[10px] font-semibold transition-colors ${
                    madhabId !== 'Hanafi'
                      ? 'bg-[#10B981] text-[#05120D]'
                      : 'bg-[#101C18] text-[#9DB0A8] hover:text-white'
                  }`}
                >
                  Standart
                </button>
                <button
                  type="button"
                  onClick={() => onChangeMadhab?.('Hanafi')}
                  className={`rounded-lg py-1.5 text-[10px] font-semibold transition-colors ${
                    madhabId === 'Hanafi'
                      ? 'bg-[#10B981] text-[#05120D]'
                      : 'bg-[#101C18] text-[#9DB0A8] hover:text-white'
                  }`}
                >
                  Hanefi
                </button>
              </div>
            </div>

            {/* Temkin (± Dakika) Ayarlama */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#8EA39B]">
                  Temkin Ayarı (± dk)
                </span>
                {hasAnyTemkin && (
                  <button
                    type="button"
                    onClick={resetAllTemkin}
                    className="text-[9px] font-semibold text-[#34D399] hover:underline"
                  >
                    Sıfırla
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {schedule.prayers.map((p) => {
                  const offset = normalizedTemkin[p.key];
                  const shortLabel =
                    p.key === 'ikindi' ? 'İkindi' : p.label;
                  return (
                    <div
                      key={p.key}
                      className="flex items-center justify-between rounded-lg border border-[#16241F] bg-[#0B1310] px-2 py-1"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-medium text-[#EDF2F0]">
                          {shortLabel}
                        </span>
                        <span className="ml-1.5 font-mono-tabular text-[10px] text-[#34D399]">
                          {p.formattedTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => adjustTemkin(p.key, -1)}
                          aria-label={`${shortLabel} temkin azalt`}
                          className="flex h-5 w-5 items-center justify-center rounded bg-[#13221C] text-[#CBD5E1] hover:bg-[#1B332A]"
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </button>
                        <span
                          className={`w-7 text-center font-mono-tabular text-[10px] font-semibold ${
                            offset !== 0 ? 'text-[#34D399]' : 'text-[#8EA39B]'
                          }`}
                        >
                          {offset > 0 ? `+${offset}` : offset}d
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustTemkin(p.key, 1)}
                          aria-label={`${shortLabel} temkin artır`}
                          className="flex h-5 w-5 items-center justify-center rounded bg-[#13221C] text-[#CBD5E1] hover:bg-[#1B332A]"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {onOpenLocationModal && (
              <button
                type="button"
                onClick={onOpenLocationModal}
                className="flex w-full items-center justify-center gap-1 rounded-lg border border-[#1E332B] bg-[#0B1511] py-1.5 text-[10px] font-semibold text-[#CBD5E1] hover:border-[#34D399]"
              >
                <MapPin className="h-3 w-3 text-[#34D399]" />
                <span className="truncate">Konum: {location.name}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Compact Watch Navigation Bar */}
      <nav
        aria-label="Saat sekmeleri"
        className="relative z-10 flex items-center justify-center gap-1 pb-0.5"
      >
        {(
          [
            { id: 'vakit', label: 'Vakit', icon: Clock },
            { id: 'liste', label: 'Liste', icon: List },
            { id: 'kible', label: 'Kıble', icon: Compass },
            { id: 'zikir', label: 'Zikir', icon: Sparkles },
            { id: 'ayar', label: 'Takvim ve Temkin', icon: SlidersHorizontal },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label}
              title={tab.label}
              className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-colors ${
                active
                  ? 'bg-[#10B981] text-[#05120D]'
                  : 'bg-[#101C18] text-[#8EA39B] hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </nav>
    </div>
  );

  if (embedded || isTinyPhysicalWatch) {
    return dialContent;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#060908] px-4 py-6 text-[#EDF2F0]">
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs">
        <button
          type="button"
          onClick={() =>
            onToggleShape
              ? onToggleShape()
              : setInternalShape((prev) =>
                  prev === 'round' ? 'square' : 'round'
                )
          }
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#24322D] bg-[#0E1613] px-3 py-1.5 font-medium text-[#CBD5E1] hover:border-[#34D399]"
        >
          <span>
            {shape === 'round' ? 'Kare Kadran Görünümü' : 'Dairesel Kadran Görünümü'}
          </span>
        </button>

        {onExitWatchMode && (
          <button
            type="button"
            onClick={onExitWatchMode}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#10B981] px-3.5 py-1.5 font-medium text-[#05120D] hover:bg-[#34D399]"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Tam Görünüme Dön</span>
          </button>
        )}
      </div>

      {/* Watch Bezel & Straps Presentation */}
      <div className="flex flex-col items-center">
        <div className="h-5 w-24 rounded-t-xl bg-[#161E1B] border-x border-t border-[#25312C]" />
        {dialContent}
        <div className="h-5 w-24 rounded-b-xl bg-[#161E1B] border-x border-b border-[#25312C]" />
      </div>

      <p className="mt-5 max-w-xs text-center text-[11px] text-[#8EA39B]">
        Mihrab Akıllı Saat Modu · Wear OS saatlerde ve kompakt saat tarayıcılarında otomatik etkinleşir.
      </p>
    </div>
  );
}
