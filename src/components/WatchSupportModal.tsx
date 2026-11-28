import { useEffect, useState } from 'react';
import {
  BellRing,
  Check,
  Maximize2,
  Send,
  Smartphone,
  Watch,
  X,
} from 'lucide-react';
import {
  CalculationMethodId,
  DailyPrayerSchedule,
  LocationInfo,
  MadhabId,
  NotificationSettings,
  TemkinOffsets,
} from '../types/prayer';
import { ZikirState } from '../types/zikir';
import {
  dispatchWatchSummaryNotification,
  isNativeAndroid,
} from '../utils/notifications';
import { NextPrayerStatus } from '../utils/prayerCalculator';
import { WatchModeView, WatchShape } from './WatchModeView';

interface WatchSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationInfo;
  now: Date;
  schedule: DailyPrayerSchedule;
  nextStatus: NextPrayerStatus;
  zikirState: ZikirState;
  onZikirIncrement: () => void;
  onZikirDecrement: () => void;
  onZikirResetCurrent: () => void;
  onZikirSelect: (id: string) => void;
  methodId: CalculationMethodId;
  onChangeMethod: (method: CalculationMethodId) => void;
  madhabId: MadhabId;
  onChangeMadhab: (madhab: MadhabId) => void;
  temkinOffsets: TemkinOffsets;
  onChangeTemkinOffsets: (next: TemkinOffsets) => void;
  notificationSettings: NotificationSettings;
  onUpdateNotifications: (next: NotificationSettings) => void;
  onOpenWatchFullscreen: () => void;
}

export function WatchSupportModal({
  isOpen,
  onClose,
  location,
  now,
  schedule,
  nextStatus,
  zikirState,
  onZikirIncrement,
  onZikirDecrement,
  onZikirResetCurrent,
  onZikirSelect,
  methodId,
  onChangeMethod,
  madhabId,
  onChangeMadhab,
  temkinOffsets,
  onChangeTemkinOffsets,
  notificationSettings,
  onUpdateNotifications,
  onOpenWatchFullscreen,
}: WatchSupportModalProps) {
  const [watchShape, setWatchShape] = useState<WatchShape>('round');
  const [guideTab, setGuideTab] = useState<'wearos' | 'all'>('wearos');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const android = isNativeAndroid();
  const watchMirrorEnabled = notificationSettings.watchAlertsEnabled ?? true;

  useEffect(() => {
    if (!isOpen) return;
    setStatusMessage(null);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendWatchTest = async () => {
    const title = `${nextStatus.nextPrayer.label} ${nextStatus.nextPrayer.formattedTime} · ${location.name}`;
    const body = `Kalan süre: ${nextStatus.countdownFormatted} · ${schedule.prayers
      .slice(0, 6)
      .map((p) => `${p.label} ${p.formattedTime}`)
      .join(' · ')}`;
    await dispatchWatchSummaryNotification(title, body);
    setStatusMessage(
      android
        ? 'Akıllı saat özet bildirimi gönderildi. Saatinizle eşli uygulamada (Huawei Health, Zepp, Mi Fitness, Galaxy Wearable) Mihrab bildirimleri açıksa bileğinizde görünecektir.'
        : 'Saat uyumlu özet bildirimi test olarak gönderildi.'
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="watch-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 shadow-xl dark:border-[#1E2936] dark:bg-[#121A24] space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
          <div>
            <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
              Wear OS & Tüm Android Saatler
            </div>
            <h2
              id="watch-modal-title"
              className="mt-1 font-display text-xl sm:text-2xl font-semibold text-[#171A19] dark:text-[#EDF2F0]"
            >
              Android Akıllı Saat Desteği
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Saat penceresini kapat"
            className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg text-[#666C68] hover:bg-[#F1EEE7] dark:text-[#8E9BA4] dark:hover:bg-[#1A2532]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Interactive Watch Preview + Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center rounded-xl border border-[#E5E0D5] bg-[#F7F5F0] p-4 dark:border-[#243242] dark:bg-[#0B1117]">
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            <div className="h-3.5 w-20 rounded-t-lg bg-[#24312C]" />
            <WatchModeView
              location={location}
              now={now}
              schedule={schedule}
              nextStatus={nextStatus}
              zikirState={zikirState}
              onZikirIncrement={onZikirIncrement}
              onZikirDecrement={onZikirDecrement}
              onZikirResetCurrent={onZikirResetCurrent}
              onZikirSelect={onZikirSelect}
              methodId={methodId}
              onChangeMethod={onChangeMethod}
              madhabId={madhabId}
              onChangeMadhab={onChangeMadhab}
              temkinOffsets={temkinOffsets}
              onChangeTemkinOffsets={onChangeTemkinOffsets}
              embedded
              shape={watchShape}
            />
            <div className="h-3.5 w-20 rounded-b-lg bg-[#24312C]" />
            <p className="mt-2 text-[11px] text-[#666C68] dark:text-[#8E9BA4]">
              Canlı saat ekranı · Alt simgelerden Kıble, Zikir ve Fazilet / Temkin ayarlarını test edin
            </p>
          </div>

          <div className="md:col-span-6 space-y-3">
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-[#575C59] dark:text-[#9CA7B0]">
                Kadran Şekli Önizleme
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#EAE5DA] p-1 dark:bg-[#16202C]">
                <button
                  type="button"
                  onClick={() => setWatchShape('round')}
                  className={`min-h-[36px] rounded-md px-2.5 text-xs font-medium transition-colors ${
                    watchShape === 'round'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] dark:text-[#9CA7B0]'
                  }`}
                >
                  Dairesel (Round)
                </button>
                <button
                  type="button"
                  onClick={() => setWatchShape('square')}
                  className={`min-h-[36px] rounded-md px-2.5 text-xs font-medium transition-colors ${
                    watchShape === 'square'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] dark:text-[#9CA7B0]'
                  }`}
                >
                  Kare (Square)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E0D5] bg-[#FFFFFF] px-3.5 py-3 dark:border-[#243242] dark:bg-[#121A24]">
              <div>
                <div className="text-xs font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                  Tüm Saatlere Vakit Özeti İlet
                </div>
                <div className="mt-0.5 text-[11px] text-[#666C68] dark:text-[#8E9BA4]">
                  Huawei, Amazfit, Xiaomi, Haylou ve Wear OS saatlere uyumlu bildirim gönderir
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={watchMirrorEnabled}
                onClick={() =>
                  onUpdateNotifications({
                    ...notificationSettings,
                    watchAlertsEnabled: !watchMirrorEnabled,
                  })
                }
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                  watchMirrorEnabled
                    ? 'bg-[#0F6E56] dark:bg-[#10B981]'
                    : 'bg-[#D2CCC0] dark:bg-[#2B3949]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    watchMirrorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onOpenWatchFullscreen}
                className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E]"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Tam Ekran Saat Modunu Aç</span>
              </button>

              <button
                type="button"
                onClick={handleSendWatchTest}
                className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl border border-[#DDD7C9] bg-[#FFFFFF] px-4 py-2 text-xs font-medium text-[#171A19] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#121A24] dark:text-[#EDF2F0]"
              >
                <Send className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#34D399]" />
                <span>Saatime Test Bildirimi Gönder</span>
              </button>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-[#0F6E56]/30 bg-[#0F6E56]/8 px-3.5 py-2.5 text-xs text-[#0F6E56] dark:border-[#34D399]/30 dark:bg-[#10B981]/12 dark:text-[#34D399]"
          >
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Setup Guide Tabs for ALL Android Watch Ecosystems */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#EAE5DA] p-1 dark:bg-[#16202C]">
            <button
              type="button"
              onClick={() => setGuideTab('wearos')}
              className={`min-h-[38px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                guideTab === 'wearos'
                  ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                  : 'text-[#575C59] dark:text-[#9CA7B0]'
              }`}
            >
              <Watch className="h-3.5 w-3.5" />
              <span>Wear OS (APK Doğrudan Çalışır)</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideTab('all')}
              className={`min-h-[38px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                guideTab === 'all'
                  ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                  : 'text-[#575C59] dark:text-[#9CA7B0]'
              }`}
            >
              <BellRing className="h-3.5 w-3.5" />
              <span>Huawei / Xiaomi / Amazfit</span>
            </button>
          </div>

          {guideTab === 'wearos' ? (
            <div className="rounded-xl border border-[#EEEAE0] bg-[#FAF9F6] p-4 text-xs text-[#575C59] dark:border-[#1E2936] dark:bg-[#0D141C] dark:text-[#9CA7B0] space-y-2.5">
              <div className="font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                Samsung Galaxy Watch 4/5/6/7/8, Pixel Watch, Xiaomi Watch 2, TicWatch
              </div>
              <p className="leading-relaxed">
                Mihrab’ın <strong>Mihrab-Android.apk</strong> paketi Wear OS saatlerde <strong>Android WebView gerektirmeden</strong> doğrudan yerel (native) saat arayüzü ile açılır ve telefon yanınızda olmasa bile internetsiz çalışır.
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                <li>
                  Saatte <strong>Ayarlar &gt; Saat Hakkında &gt; Yazılım Bilgileri</strong> bölümünden <em>Yapım Numarasına</em> 7 kez dokunup Geliştirici Seçeneklerini ve <strong>ADB / Kablosuz Hata Ayıklamayı</strong> açın.
                </li>
                <li>
                  Telefonunuza <strong>Bugjaeger</strong> veya <strong>Wear Installer 2</strong> kurup saate bağlanın ve güncel <strong>Mihrab-Android.apk</strong> dosyasını gönderin.
                </li>
                <li>
                  Saat kadranında saat/ayar ikonuna veya şehir adına dokunarak 81 il, <strong>GPS ile Konum Bul</strong>, <strong>Fazilet Takvimi</strong>, <strong>Hanefi İkindi</strong> ve vakit başı <strong>± dakika Temkin</strong> ayarlarını yapabilirsiniz.
                </li>
              </ol>
            </div>
          ) : (
            <div className="rounded-xl border border-[#EEEAE0] bg-[#FAF9F6] p-4 text-xs text-[#575C59] dark:border-[#1E2936] dark:bg-[#0D141C] dark:text-[#9CA7B0] space-y-2.5">
              <div className="flex items-center gap-2 font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                <Smartphone className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#34D399]" />
                <span>Huawei Watch GT/Fit, Amazfit (Zepp), Xiaomi Band/Watch, Haylou, Garmin</span>
              </div>
              <p className="leading-relaxed">
                Wear OS dışındaki Android uyumlu saatler kendi kapalı sistemini kullandığı için doğrudan APK kurulmaz; ancak telefonunuzdaki Mihrab uygulaması tüm vakit geçişlerini ve sıradaki vakit özetini saatinize anlık bildirim olarak gönderir.
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                <li>
                  Telefonunuzdaki saat uygulamasını açın (<strong>Huawei Health</strong>, <strong>Zepp</strong>, <strong>Mi Fitness</strong>, <strong>Galaxy Wearable</strong> vb.).
                </li>
                <li>
                  <strong>Cihazlar &gt; Bildirimler / Uygulama Uyarıları</strong> menüsünden <strong>Mihrab</strong> uygulamasını aktif edin.
                </li>
                <li>
                  Yukarıdaki <strong>&ldquo;Tüm Saatlere Vakit Özeti İlet&rdquo;</strong> anahtarı açık kaldığında sesli alarmı kapattığınız vakitler bile sessiz özet olarak bileğinize düşer.
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
