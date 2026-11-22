import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Compass,
  MapPin,
  RotateCcw,
  Smartphone,
} from 'lucide-react';
import { DailyPrayerSchedule, LocationInfo } from '../types/prayer';

interface QiblaCompassProps {
  location: LocationInfo;
  schedule: DailyPrayerSchedule;
  onOpenLocationModal: () => void;
}

type SensorMode = 'manual' | 'live' | 'denied' | 'unsupported';

interface DeviceOrientationWithWebkit extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function shortestAngleDiff(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

export function QiblaCompass({
  location,
  schedule,
  onOpenLocationModal,
}: QiblaCompassProps) {
  const [sensorMode, setSensorMode] = useState<SensorMode>('manual');
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [sensorStatusText, setSensorStatusText] = useState<string>(
    'Masaüstünde manuel kadranı çevirebilir veya mobilde canlı pusula sensörünü başlatabilirsiniz.'
  );

  const wasAlignedRef = useRef(false);
  const qiblaAngle = schedule.qiblaAngle;

  // Relative angle from device top edge to Qibla
  const relativeQibla = normalizeAngle(qiblaAngle - deviceHeading);
  const signedDelta = shortestAngleDiff(deviceHeading, qiblaAngle);
  const isAligned = Math.abs(signedDelta) <= 3;

  useEffect(() => {
    if (sensorMode === 'live' && isAligned && !wasAlignedRef.current) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(25);
        } catch {
          // Ignore vibration restrictions
        }
      }
    }
    wasAlignedRef.current = isAligned;
  }, [isAligned, sensorMode]);

  useEffect(() => {
    if (sensorMode !== 'live') return;

    const handleOrientation = (event: Event) => {
      const e = event as DeviceOrientationWithWebkit;
      let heading: number | null = null;

      if (typeof e.webkitCompassHeading === 'number') {
        heading = e.webkitCompassHeading;
      } else if (typeof e.alpha === 'number') {
        // Convert alpha counter-clockwise to clockwise compass heading
        heading = 360 - e.alpha;
      }

      if (heading !== null && Number.isFinite(heading)) {
        setDeviceHeading(normalizeAngle(heading));
      }
    };

    const win = window as unknown as {
      ondeviceorientationabsolute?: unknown;
    };
    const eventName =
      'ondeviceorientationabsolute' in win
        ? 'deviceorientationabsolute'
        : 'deviceorientation';

    window.addEventListener(eventName, handleOrientation, true);
    return () => {
      window.removeEventListener(eventName, handleOrientation, true);
    };
  }, [sensorMode]);

  const handleEnableSensor = async () => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setSensorMode('unsupported');
      setSensorStatusText(
        'Bu cihazda pusula sensörü bulunamadı. Aşağıdaki manuel kalibrasyon kadranını kullanabilirsiniz.'
      );
      return;
    }

    const OrientationEvent = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof OrientationEvent.requestPermission === 'function') {
      try {
        const res = await OrientationEvent.requestPermission();
        if (res === 'granted') {
          setSensorMode('live');
          setSensorStatusText(
            'Canlı pusula sensörü aktif. Cihazınızı yere paralel tutarak Kâbe simgesini üst oka hizalayın.'
          );
        } else {
          setSensorMode('denied');
          setSensorStatusText(
            'Hareket ve yön sensörü izni verilmedi. Manuel kalibrasyon ile devam edebilirsiniz.'
          );
        }
      } catch {
        setSensorMode('denied');
        setSensorStatusText(
          'Sensör izni alınamadı. Tarayıcı veya cihaz ayarlarını kontrol edin.'
        );
      }
    } else {
      setSensorMode('live');
      setSensorStatusText(
        'Canlı sensör dinleniyor. Masaüstü cihazlarda sensör verisi gelmezse manuel kadranı kullanabilirsiniz.'
      );
    }
  };

  const handleResetManual = () => {
    setSensorMode('manual');
    setDeviceHeading(0);
    setSensorStatusText(
      'Kuzey (0°) üst kenara hizalandı. Kıble ibresi gerçek coğrafi açıyı göstermektedir.'
    );
  };

  // Degree tick marks every 5 degrees
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EEEAE0] pb-5 dark:border-[#1E2936]">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
              Kıble Yön Pusulası
            </h1>
            <p className="mt-1 text-sm text-[#575C59] dark:text-[#9CA7B0]">
              {location.name} ({location.country}) için küresel trigonometri ile hesaplanan hassas Kâbe yönü
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenLocationModal}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] px-3.5 py-2 text-xs font-medium text-[#171A19] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]"
          >
            <MapPin className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#34D399]" />
            <span>Konumu Değiştir</span>
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Precision SVG Compass Instrument */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Fixed top reference pointer */}
            <div className="mb-2 flex flex-col items-center">
              <span
                className={`text-xs font-medium mb-1 transition-colors ${
                  isAligned
                    ? 'text-[#0F6E56] dark:text-[#34D399]'
                    : 'text-[#666C68] dark:text-[#8E9BA4]'
                }`}
              >
                {isAligned ? 'Kıble Hizası Doğrulandı' : 'Cihaz Ön Yönü'}
              </span>
              <div
                className={`h-3 w-0.5 transition-colors ${
                  isAligned
                    ? 'bg-[#0F6E56] dark:bg-[#34D399]'
                    : 'bg-[#171A19] dark:bg-[#EDF2F0]'
                }`}
              />
            </div>

            <div className="relative w-full max-w-[340px] aspect-square">
              <svg
                viewBox="0 0 320 320"
                className="h-full w-full select-none"
                role="img"
                aria-label={`Kıble pusulası. Kıble açısı ${qiblaAngle.toFixed(1)} derece`}
              >
                {/* Outer Architectural Ring */}
                <circle
                  cx="160"
                  cy="160"
                  r="148"
                  fill="none"
                  stroke="currentColor"
                  className={
                    isAligned
                      ? 'text-[#0F6E56] dark:text-[#34D399]'
                      : 'text-[#DCD6C8] dark:text-[#233040]'
                  }
                  strokeWidth={isAligned ? '2.5' : '1.5'}
                />
                <circle
                  cx="160"
                  cy="160"
                  r="138"
                  fill="none"
                  stroke="currentColor"
                  className="text-[#EEEAE0] dark:text-[#1A2532]"
                  strokeWidth="1"
                />

                {/* Rotating Compass Dial (rotates opposite to device heading) */}
                <g
                  style={{
                    transform: `rotate(${-deviceHeading}deg)`,
                    transformOrigin: '160px 160px',
                    transition:
                      sensorMode === 'live'
                        ? 'transform 120ms linear'
                        : 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Degree Ticks */}
                  {ticks.map((deg) => {
                    const isMajor = deg % 30 === 0;
                    const isCardinal = deg % 90 === 0;
                    const rOuter = 136;
                    const rInner = isCardinal ? 120 : isMajor ? 125 : 130;
                    const rad = ((deg - 90) * Math.PI) / 180;
                    const x1 = 160 + rInner * Math.cos(rad);
                    const y1 = 160 + rInner * Math.sin(rad);
                    const x2 = 160 + rOuter * Math.cos(rad);
                    const y2 = 160 + rOuter * Math.sin(rad);

                    return (
                      <line
                        key={deg}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="currentColor"
                        className={
                          deg === 0
                            ? 'text-[#B91C1C] dark:text-[#F87171]'
                            : isMajor
                            ? 'text-[#575C59] dark:text-[#8E9BA4]'
                            : 'text-[#C8C2B4] dark:text-[#2D3B4D]'
                        }
                        strokeWidth={isCardinal ? '2' : isMajor ? '1.5' : '1'}
                      />
                    );
                  })}

                  {/* Cardinal Labels */}
                  <text
                    x="160"
                    y="108"
                    textAnchor="middle"
                    className="fill-[#B91C1C] dark:fill-[#F87171] text-[13px] font-bold"
                  >
                    K
                  </text>
                  <text
                    x="212"
                    y="164"
                    textAnchor="middle"
                    className="fill-[#575C59] dark:fill-[#9CA7B0] text-[12px] font-semibold"
                  >
                    D
                  </text>
                  <text
                    x="160"
                    y="219"
                    textAnchor="middle"
                    className="fill-[#575C59] dark:fill-[#9CA7B0] text-[12px] font-semibold"
                  >
                    G
                  </text>
                  <text
                    x="108"
                    y="164"
                    textAnchor="middle"
                    className="fill-[#575C59] dark:fill-[#9CA7B0] text-[12px] font-semibold"
                  >
                    B
                  </text>

                  {/* Qibla Bearing Vector & Kaaba Marker on the Rotating Dial */}
                  <g
                    style={{
                      transform: `rotate(${qiblaAngle}deg)`,
                      transformOrigin: '160px 160px',
                    }}
                  >
                    {/* Line from center to Kaaba */}
                    <line
                      x1="160"
                      y1="160"
                      x2="160"
                      y2="44"
                      stroke="currentColor"
                      className="text-[#0F6E56] dark:text-[#34D399]"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {/* Opposite tail */}
                    <line
                      x1="160"
                      y1="160"
                      x2="160"
                      y2="205"
                      stroke="currentColor"
                      className="text-[#B4832C]/50 dark:text-[#D4A853]/50"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    {/* Arrowhead */}
                    <polygon
                      points="160,30 152,48 168,48"
                      className="fill-[#0F6E56] dark:fill-[#34D399]"
                    />
                    {/* Stylized Kaaba Icon */}
                    <rect
                      x="149"
                      y="54"
                      width="22"
                      height="22"
                      rx="3"
                      className="fill-[#171A19] stroke-[#D4A853] dark:fill-[#090D12]"
                      strokeWidth="2"
                    />
                    <line
                      x1="149"
                      y1="61"
                      x2="171"
                      y2="61"
                      stroke="#D4A853"
                      strokeWidth="2"
                    />
                  </g>
                </g>

                {/* Center Pivot */}
                <circle
                  cx="160"
                  cy="160"
                  r="24"
                  className="fill-[#FAF9F6] stroke-[#E5E0D5] dark:fill-[#16202C] dark:stroke-[#263445]"
                  strokeWidth="1.5"
                />
                <text
                  x="160"
                  y="164"
                  textAnchor="middle"
                  className="fill-[#171A19] dark:fill-[#EDF2F0] font-mono text-[11px] font-semibold"
                >
                  {Math.round(qiblaAngle)}°
                </text>
              </svg>
            </div>

            {/* Alignment Banner */}
            <div
              className={`mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                isAligned
                  ? 'border-[#0F6E56]/40 bg-[#0F6E56]/10 text-[#0F6E56] dark:border-[#34D399]/40 dark:bg-[#10B981]/15 dark:text-[#34D399]'
                  : 'border-[#E5E0D5] bg-[#FAF9F6] text-[#575C59] dark:border-[#1E2936] dark:bg-[#0D141C] dark:text-[#9CA7B0]'
              }`}
            >
              {isAligned ? (
                <>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Kıble yönündesiniz ({qiblaAngle.toFixed(1)}°)</span>
                </>
              ) : (
                <>
                  <Compass className="h-4 w-4 shrink-0" />
                  <span>
                    Kıble için{' '}
                    <strong className="font-mono-tabular text-[#171A19] dark:text-[#EDF2F0]">
                      {Math.abs(Math.round(signedDelta))}°{' '}
                      {signedDelta > 0 ? 'sağa' : 'sola'}
                    </strong>{' '}
                    yönelin
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Controls & Telemetry Details */}
          <div className="lg:col-span-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-4 dark:border-[#1E2936] dark:bg-[#0D141C]">
                <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                  Kıble Açısı (Kuzeyden)
                </div>
                <div className="mt-1 font-mono-tabular text-2xl font-semibold text-[#0F6E56] dark:text-[#34D399]">
                  {qiblaAngle.toFixed(1)}°
                </div>
                <div className="mt-0.5 text-xs text-[#575C59] dark:text-[#9CA7B0]">
                  {schedule.qiblaDirectionLabel}
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-4 dark:border-[#1E2936] dark:bg-[#0D141C]">
                <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                  Kâbe’ye Mesafe
                </div>
                <div className="mt-1 font-mono-tabular text-2xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                  {schedule.distanceToMeccaKm.toLocaleString('tr-TR')} km
                </div>
                <div className="mt-0.5 text-xs text-[#575C59] dark:text-[#9CA7B0]">
                  Mekke-i Mükerreme
                </div>
              </div>
            </div>

            {/* Live Sensor Trigger + Manual Calibration */}
            <div className="rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-4 space-y-4 dark:border-[#1E2936] dark:bg-[#0D141C]">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleEnableSensor}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E] dark:hover:bg-[#34D399] whitespace-nowrap"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>
                    {sensorMode === 'live'
                      ? 'Canlı Sensör Aktif'
                      : 'Canlı Pusula Sensörünü Aç'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleResetManual}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-[#DDD7C9] bg-white px-3 py-2 text-xs font-medium text-[#575C59] hover:text-[#171A19] dark:border-[#243242] dark:bg-[#121A24] dark:text-[#9CA7B0]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Kuzeye Sıfırla</span>
                </button>
              </div>

              <p className="text-xs leading-relaxed text-[#575C59] dark:text-[#9CA7B0]">
                {sensorStatusText}
              </p>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="manual-heading-range"
                    className="font-medium text-[#171A19] dark:text-[#EDF2F0]"
                  >
                    Cihaz / Kuzey Yönü Kalibrasyonu
                  </label>
                  <span className="font-mono-tabular text-[#666C68] dark:text-[#8E9BA4]">
                    {Math.round(deviceHeading)}° (Kâbe göreli {Math.round(relativeQibla)}°)
                  </span>
                </div>
                <input
                  id="manual-heading-range"
                  type="range"
                  min={0}
                  max={359}
                  value={Math.round(deviceHeading)}
                  onChange={(e) => {
                    setSensorMode('manual');
                    setDeviceHeading(Number(e.target.value));
                  }}
                  className="w-full accent-[#0F6E56] dark:accent-[#34D399]"
                />
              </div>
            </div>

            <div className="text-xs leading-relaxed text-[#666C68] dark:text-[#8E9BA4] space-y-1">
              <p>
                • En doğru sonuç için cihazınızı metal eşyalardan uzaklaştırıp yere paralel tutun.
              </p>
              <p>
                • Bilgisayarda gerçek Kuzey yönünü biliyorsanız üst kaydırıcıyı kendi baktığınız yöne getirerek Kâbe açısını görebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
