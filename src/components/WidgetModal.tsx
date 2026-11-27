import { useEffect, useState } from 'react';
import {
  Check,
  LayoutGrid,
  Monitor,
  PictureInPicture2,
  Smartphone,
  X,
} from 'lucide-react';
import { DailyPrayerSchedule, LocationInfo } from '../types/prayer';
import {
  isAndroidPinWidgetSupported,
  isDesktopWindows,
  isNativeAndroid,
  isNativeIos,
  openDesktopWidgetWindow,
  requestPinAndroidWidget,
} from '../utils/notifications';
import { NextPrayerStatus } from '../utils/prayerCalculator';
import {
  PrayerWidgetPreviewCard,
  WidgetPreferences,
  WidgetTheme,
  WidgetVariant,
} from './PrayerWidgetCard';

interface WidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationInfo;
  schedule: DailyPrayerSchedule;
  nextStatus: NextPrayerStatus;
  preferences: WidgetPreferences;
  onUpdatePreferences: (next: WidgetPreferences) => void;
}

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (opts?: { width?: number; height?: number }) => Promise<Window>;
    };
  }
}

export function WidgetModal({
  isOpen,
  onClose,
  location,
  schedule,
  nextStatus,
  preferences,
  onUpdatePreferences,
}: WidgetModalProps) {
  const [pinSupported, setPinSupported] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [pipSupported, setPipSupported] = useState(false);

  const android = isNativeAndroid();
  const ios = isNativeIos();
  const windowsDesktop = isDesktopWindows();

  useEffect(() => {
    if (!isOpen) return;
    setStatusMessage(null);
    setPipSupported(
      typeof window !== 'undefined' && Boolean(window.documentPictureInPicture)
    );
    if (android) {
      isAndroidPinWidgetSupported().then(setPinSupported);
    }
  }, [isOpen, android]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const setVariant = (variant: WidgetVariant) =>
    onUpdatePreferences({ ...preferences, variant });

  const setTheme = (theme: WidgetTheme) =>
    onUpdatePreferences({ ...preferences, theme });

  const handlePinAndroid = async (variant: WidgetVariant) => {
    const res = await requestPinAndroidWidget(variant);
    if (res.requested) {
      setStatusMessage(
        'Android ana ekrana widget ekleme penceresi açıldı. Onaylayarak widget’ı yerleştirebilirsiniz.'
      );
    } else {
      setStatusMessage(
        'Cihaz başlatıcınız otomatik sabitlemeyi desteklemiyor. Ana ekrana basılı tutup Widget’lar > Mihrab yolunu kullanabilirsiniz.'
      );
    }
  };

  const handleOpenWindowsWidget = () => {
    const ok = openDesktopWidgetWindow();
    if (ok) {
      setStatusMessage(
        'Masaüstü mini widget penceresi açıldı. İstediğiniz köşeye sürükleyebilirsiniz.'
      );
    }
  };

  const handleOpenBrowserPip = async () => {
    if (!window.documentPictureInPicture) return;
    try {
      const pipWin = await window.documentPictureInPicture.requestWindow({
        width: 344,
        height: 210,
      });

      const doc = pipWin.document;
      doc.title = 'Mihrab Widget';
      doc.body.style.margin = '0';
      doc.body.style.fontFamily =
        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";
      const isDark = preferences.theme === 'dark';
      const isEmerald = preferences.theme === 'emerald';
      doc.body.style.background = isEmerald
        ? '#0B3B2E'
        : isDark
          ? '#121A24'
          : '#FBF9F5';
      doc.body.style.color = isEmerald
        ? '#F4FAF7'
        : isDark
          ? '#EDF2F0'
          : '#171A19';

      const renderPip = () => {
        const prayersHtml = schedule.prayers
          .map((p) => {
            const isNext = p.key === nextStatus.nextPrayer.key;
            const bg = isNext
              ? isEmerald
                ? '#134E3D'
                : isDark
                  ? '#123027'
                  : '#E6F4F0'
              : 'transparent';
            const clr = isNext
              ? isEmerald
                ? '#6EE7B7'
                : isDark
                  ? '#34D399'
                  : '#0F6E56'
              : 'inherit';
            return `<div style="padding:6px 4px;border-radius:8px;background:${bg};color:${clr};text-align:center;">
              <div style="font-size:10px;opacity:0.8;">${p.label}</div>
              <div style="font-size:12px;font-weight:700;font-variant-numeric:tabular-nums;">${p.formattedTime}</div>
            </div>`;
          })
          .join('');

        doc.body.innerHTML = `<div style="padding:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <div>
              <div style="font-size:12px;font-weight:700;">${location.name}${preferences.showHijri ? ` · ${schedule.hijriDate}` : ''}</div>
              <div style="font-size:11px;opacity:0.85;">Sıradaki: ${nextStatus.nextPrayer.label} (${nextStatus.nextPrayer.formattedTime})</div>
            </div>
            <div style="font-size:14px;font-weight:700;font-variant-numeric:tabular-nums;">${nextStatus.countdownFormatted}</div>
          </div>
          <div style="height:1px;background:rgba(128,128,128,0.22);margin:10px 0;"></div>
          <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;">${prayersHtml}</div>
        </div>`;
      };

      renderPip();
      const timer = window.setInterval(renderPip, 1000);
      pipWin.addEventListener('pagehide', () => window.clearInterval(timer));
      setStatusMessage('Ekran üstü yüzer widget penceresi açıldı.');
    } catch {
      setStatusMessage('Tarayıcı yüzer pencereye izin vermedi.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="widget-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 shadow-xl dark:border-[#1E2936] dark:bg-[#121A24] space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
          <div>
            <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
              Ana Ekran ve Masaüstü Widget Merkezi
            </div>
            <h2
              id="widget-modal-title"
              className="mt-1 font-display text-xl sm:text-2xl font-semibold text-[#171A19] dark:text-[#EDF2F0]"
            >
              Namaz Vakitleri Widget Ekle
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Widget penceresini kapat"
            className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg text-[#666C68] hover:bg-[#F1EEE7] dark:text-[#8E9BA4] dark:hover:bg-[#1A2532]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Live Interactive Preview */}
        <div className="rounded-xl border border-[#E5E0D5] bg-[#F7F5F0] p-4 dark:border-[#243242] dark:bg-[#0B1117] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#666C68] dark:text-[#8E9BA4]">
            <span>Canlı Önizleme · {location.name}</span>
            <span>
              {preferences.variant === 'wide' ? '4×2 Tam Vakit Çubuğu' : '2×1 Kompakt Sayaç'}
            </span>
          </div>

          <div
            className={
              preferences.variant === 'compact' ? 'mx-auto max-w-[300px]' : ''
            }
          >
            <PrayerWidgetPreviewCard
              location={location}
              schedule={schedule}
              nextStatus={nextStatus}
              variant={preferences.variant}
              theme={preferences.theme}
              showHijri={preferences.showHijri}
            />
          </div>
        </div>

        {/* Customization Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-[#575C59] dark:text-[#9CA7B0]">
              Widget Boyutu
            </div>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#EAE5DA] p-1 dark:bg-[#16202C]">
              <button
                type="button"
                onClick={() => setVariant('wide')}
                className={`min-h-[36px] rounded-md px-2.5 text-xs font-medium transition-colors ${
                  preferences.variant === 'wide'
                    ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                    : 'text-[#575C59] dark:text-[#9CA7B0]'
                }`}
              >
                4×2 Tam Vakit
              </button>
              <button
                type="button"
                onClick={() => setVariant('compact')}
                className={`min-h-[36px] rounded-md px-2.5 text-xs font-medium transition-colors ${
                  preferences.variant === 'compact'
                    ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                    : 'text-[#575C59] dark:text-[#9CA7B0]'
                }`}
              >
                2×1 Kompakt
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-medium text-[#575C59] dark:text-[#9CA7B0]">
              Widget Görünümü
            </div>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#EAE5DA] p-1 dark:bg-[#16202C]">
              {(
                [
                  { id: 'light', label: 'Açık' },
                  { id: 'emerald', label: 'Zümrüt' },
                  { id: 'dark', label: 'Koyu' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={`min-h-[36px] rounded-md px-2 text-xs font-medium transition-colors ${
                    preferences.theme === opt.id
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] dark:text-[#9CA7B0]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="flex items-center justify-between rounded-xl border border-[#E5E0D5] px-4 py-3 text-xs font-medium text-[#171A19] dark:border-[#243242] dark:text-[#EDF2F0] cursor-pointer">
          <span>Widget üzerinde Hicri tarihi göster</span>
          <input
            type="checkbox"
            checked={preferences.showHijri}
            onChange={(e) =>
              onUpdatePreferences({
                ...preferences,
                showHijri: e.target.checked,
              })
            }
            className="h-4 w-4 accent-[#0F6E56]"
          />
        </label>

        {statusMessage && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-[#0F6E56]/30 bg-[#0F6E56]/8 px-3.5 py-2.5 text-xs text-[#0F6E56] dark:border-[#34D399]/30 dark:bg-[#10B981]/12 dark:text-[#34D399]"
          >
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Platform Actions */}
        <div className="space-y-3 border-t border-[#EEEAE0] pt-4 dark:border-[#1E2936]">
          {android && (
            <div className="space-y-2.5">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePinAndroid('wide')}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E]"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Ana Ekrana 4×2 Widget Ekle</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePinAndroid('compact')}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] px-4 py-2 text-xs font-medium text-[#171A19] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]"
                >
                  <LayoutGrid className="h-4 w-4 text-[#0F6E56] dark:text-[#34D399]" />
                  <span>2×1 Kompakt Widget Ekle</span>
                </button>
              </div>
              {!pinSupported && (
                <p className="text-[11px] text-[#666C68] dark:text-[#8E9BA4]">
                  Not: Bazı Android başlatıcılarında widget eklemek için ana ekranda boş bir alana basılı tutup <strong>Widget’lar &gt; Mihrab</strong> seçeneğini seçebilirsiniz.
                </p>
              )}
            </div>
          )}

          {windowsDesktop && (
            <button
              type="button"
              onClick={handleOpenWindowsWidget}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E]"
            >
              <Monitor className="h-4 w-4" />
              <span>Masaüstü Mini Widget Penceresini Aç</span>
            </button>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onUpdatePreferences({
                  ...preferences,
                  floatingEnabled: !preferences.floatingEnabled,
                });
                if (!preferences.floatingEnabled) {
                  setStatusMessage(
                    'Uygulama içi yüzer mini widget etkinleştirildi.'
                  );
                }
              }}
              className={`inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition-colors ${
                preferences.floatingEnabled
                  ? 'border-[#0F6E56] bg-[#0F6E56]/10 text-[#0F6E56] dark:border-[#34D399] dark:text-[#34D399]'
                  : 'border-[#DDD7C9] bg-[#FAF9F6] text-[#171A19] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0]'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>
                {preferences.floatingEnabled
                  ? 'Yüzer Mini Widget Açık (Kapat)'
                  : 'Uygulama İçi Yüzer Widget’ı Aç'}
              </span>
            </button>

            {pipSupported && !windowsDesktop && !android && !ios && (
              <button
                type="button"
                onClick={handleOpenBrowserPip}
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E]"
              >
                <PictureInPicture2 className="h-4 w-4" />
                <span>Masaüstü Yüzer Pencere Aç</span>
              </button>
            )}
          </div>

          {!windowsDesktop && (
            <div className="rounded-xl border border-[#EEEAE0] bg-[#FAF9F6] p-3.5 text-xs text-[#575C59] dark:border-[#1E2936] dark:bg-[#0D141C] dark:text-[#9CA7B0] space-y-1.5">
              <div className="font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                {ios ? 'iPhone / iPad Ana Ekran Ekleme' : 'Telefon Ana Ekranına Widget / Kısayol Ekleme'}
              </div>
              {ios ? (
                <p className="leading-relaxed">
                  iOS Safari üzerinden <strong>Paylaş &gt; Ana Ekrana Ekle</strong> adımıyla Mihrab’ı uygulama gibi ana ekranınıza yerleştirebilir; kilit ekranı ve bildirim merkezi için <strong>Bildirimler</strong> sekmesinden vakit uyarılarını açabilirsiniz.
                </p>
              ) : (
                <p className="leading-relaxed">
                  Android APK sürümünde telefonunuzun ana ekranında boş bir alana basılı tutup <strong>Widget’lar → Mihrab Vakitler (4×2)</strong> veya <strong>Mihrab Sıradaki Vakit (2×1)</strong> seçerek doğrudan ana ekrana ekleyebilirsiniz.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
