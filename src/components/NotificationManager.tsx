import {
  Bell,
  BellRing,
  Check,
  LayoutGrid,
  Send,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  DailyPrayerSchedule,
  LocationInfo,
  NotificationSettings,
  PrayerKey,
} from '../types/prayer';
import {
  isNativeAndroid,
  isNativeIos,
  NotificationPermissionState,
} from '../utils/notifications';
import { formatTimeInZone, NextPrayerStatus } from '../utils/prayerCalculator';

interface NotificationManagerProps {
  location: LocationInfo;
  schedule: DailyPrayerSchedule;
  nextStatus: NextPrayerStatus;
  settings: NotificationSettings;
  onUpdateSettings: (next: NotificationSettings) => void;
  permissionState: NotificationPermissionState;
  onRequestPermission: () => Promise<void>;
  onSendTestNotification: () => void;
  onSendSummaryNotification: () => void;
  onOpenWidgetModal?: () => void;
}

const LEAD_OPTIONS: { value: 0 | 10 | 15 | 30; label: string }[] = [
  { value: 0, label: 'Tam vaktinde' },
  { value: 10, label: '10 dk önce' },
  { value: 15, label: '15 dk önce' },
  { value: 30, label: '30 dk önce' },
];

export function NotificationManager({
  location,
  schedule,
  nextStatus,
  settings,
  onUpdateSettings,
  permissionState,
  onRequestPermission,
  onSendTestNotification,
  onSendSummaryNotification,
  onOpenWidgetModal,
}: NotificationManagerProps) {
  const togglePrayer = (key: PrayerKey) => {
    onUpdateSettings({
      ...settings,
      prayers: {
        ...settings.prayers,
        [key]: !settings.prayers[key],
      },
    });
  };

  const nativeAndroid = isNativeAndroid();
  const nativeIos = isNativeIos();

  const permissionLabel = nativeAndroid
    ? permissionState === 'granted'
      ? 'Android bildirim izni aktif · Vakit çubuğu açık'
      : permissionState === 'denied'
      ? 'Android bildirim izni kapalı (Uygulama ayarlarından açabilirsiniz)'
      : 'Bildirim çubuğunda vakitleri göstermek için izin bekleniyor'
    : nativeIos
    ? permissionState === 'granted'
      ? 'iOS bildirim izni aktif · Vakit bildirimleri zamanlandı'
      : permissionState === 'denied'
      ? 'iOS bildirim izni kapalı (iPhone Ayarlar > Bildirimler bölümünden açabilirsiniz)'
      : 'iPhone kilit ekranı ve bildirim merkezinde vakit uyarıları için izin bekleniyor'
    : permissionState === 'granted'
    ? 'Tarayıcı bildirimleri onaylı'
    : permissionState === 'denied'
    ? 'Tarayıcı bildirimleri engelli (uygulama içi bildirimler aktif)'
    : permissionState === 'unsupported'
    ? 'Bu tarayıcı yerel bildirimleri desteklemiyor (uygulama içi bildirimler aktif)'
    : 'Bildirim izni bekleniyor';

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EEEAE0] pb-5 dark:border-[#1E2936]">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
              Namaz Vakti Bildirimleri
            </h1>
            <p className="mt-1 text-sm text-[#575C59] dark:text-[#9CA7B0]">
              {location.name} vakitleri yaklaştığında masaüstü/mobil bildirim alın ve vakit özetini bildirim alanında görüntüleyin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenWidgetModal && (
              <button
                type="button"
                onClick={onOpenWidgetModal}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] px-3.5 py-2 text-xs font-medium text-[#171A19] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0] whitespace-nowrap"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#34D399]" />
                <span>Widget Ekle</span>
              </button>
            )}

            <button
              type="button"
              onClick={onSendTestNotification}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] px-3.5 py-2 text-xs font-medium text-[#171A19] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0] whitespace-nowrap"
            >
              <Send className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#34D399]" />
              <span>Test Bildirimi Gönder</span>
            </button>

            <button
              type="button"
              onClick={onSendSummaryNotification}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#0F6E56] px-4 py-2 text-xs font-medium text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E] dark:hover:bg-[#34D399] whitespace-nowrap"
            >
              <BellRing className="h-3.5 w-3.5" />
              <span>Bildirimde Vakitleri Göster</span>
            </button>
          </div>
        </div>

        {/* Permission & Master Switch Row */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-5 space-y-3 dark:border-[#1E2936] dark:bg-[#0D141C]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                  Bildirim İzni ve Durumu
                </h2>
                <p className="mt-0.5 text-xs text-[#666C68] dark:text-[#8E9BA4]">
                  {permissionLabel}
                </p>
              </div>
              {permissionState !== 'granted' &&
                permissionState !== 'unsupported' && (
                  <button
                    type="button"
                    onClick={onRequestPermission}
                    className="min-h-[40px] rounded-lg bg-[#0F6E56] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E] whitespace-nowrap"
                  >
                    İzin Ver
                  </button>
                )}
            </div>

            <div className="flex items-center justify-between border-t border-[#E5E0D5] pt-3 dark:border-[#1E2936]">
              <div>
                <div className="text-sm font-medium">Vakit Uyarılarını Etkinleştir</div>
                <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                  Seçili vakitlerde hem tarayıcı hem uygulama içi uyarı verir
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.enabled}
                onClick={() =>
                  onUpdateSettings({ ...settings, enabled: !settings.enabled })
                }
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                  settings.enabled
                    ? 'bg-[#0F6E56] dark:bg-[#10B981]'
                    : 'bg-[#D2CCC0] dark:bg-[#2B3949]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    settings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Sound, Persistent Bar & Lead Time */}
          <div className="rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-5 space-y-4 dark:border-[#1E2936] dark:bg-[#0D141C]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {settings.soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-[#0F6E56] dark:text-[#34D399]" />
                ) : (
                  <VolumeX className="h-4 w-4 text-[#666C68] dark:text-[#8E9BA4]" />
                )}
                <div>
                  <div className="text-sm font-medium">Bildirim Sesi (Yumuşak Melodi)</div>
                  <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                    Vakit girdiğinde kısa bir uyarı sesi çalar
                  </div>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={settings.soundEnabled}
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    soundEnabled: !settings.soundEnabled,
                  })
                }
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                  settings.soundEnabled
                    ? 'bg-[#0F6E56] dark:bg-[#10B981]'
                    : 'bg-[#D2CCC0] dark:bg-[#2B3949]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#E5E0D5] pt-3 dark:border-[#1E2936]">
              <div className="flex items-center gap-2.5">
                <Bell className="h-4 w-4 text-[#0F6E56] dark:text-[#34D399]" />
                <div>
                  <div className="text-sm font-medium">
                    Bildirim Çubuğunda Vakitleri Göster
                  </div>
                  <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                    {nativeAndroid
                      ? 'Telefonun bildirim çubuğunda günlük 6 vakti ve geri sayımı sabit gösterir'
                      : nativeIos
                      ? 'Uygulama üst şeridinde sıradaki vakti sabit tutar ve istendiğinde iPhone Bildirim Merkezine özet gönderir'
                      : 'Gezinirken sıradaki vakti ve kalan süreyi üst şeritte sabit tutar'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={settings.persistentSummary}
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    persistentSummary: !settings.persistentSummary,
                  })
                }
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                  settings.persistentSummary
                    ? 'bg-[#0F6E56] dark:bg-[#10B981]'
                    : 'bg-[#D2CCC0] dark:bg-[#2B3949]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    settings.persistentSummary ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Lead Time Selection */}
        <div className="mt-6 space-y-2.5">
          <div className="text-xs font-medium text-[#575C59] dark:text-[#9CA7B0]">
            Hatırlatma Zamanlaması
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LEAD_OPTIONS.map((opt) => {
              const active = settings.leadMinutes === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    onUpdateSettings({ ...settings, leadMinutes: opt.value })
                  }
                  className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'border-[#0F6E56] bg-[#0F6E56]/8 text-[#0F6E56] dark:border-[#34D399] dark:bg-[#10B981]/12 dark:text-[#34D399]'
                      : 'border-[#E5E0D5] bg-[#FAF9F6] text-[#575C59] hover:text-[#171A19] dark:border-[#1E2936] dark:bg-[#0D141C] dark:text-[#9CA7B0]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Per-Prayer Toggles + Scheduled Times */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#666C68] dark:text-[#8E9BA4]">
            <span>Bildirim Gönderilecek Vakitler ({location.name})</span>
            <span>
              Sıradaki bildirim: {nextStatus.nextPrayer.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {schedule.prayers.map((prayer) => {
              const isChecked = settings.prayers[prayer.key];
              const triggerDate = new Date(
                prayer.date.getTime() - settings.leadMinutes * 60 * 1000
              );
              const triggerFormatted = formatTimeInZone(
                triggerDate,
                location.timezone
              );

              return (
                <button
                  key={prayer.key}
                  type="button"
                  onClick={() => togglePrayer(prayer.key)}
                  className={`flex min-h-[64px] items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                    isChecked
                      ? 'border-[#0F6E56]/40 bg-[#0F6E56]/5 dark:border-[#34D399]/35 dark:bg-[#10B981]/10'
                      : 'border-[#E5E0D5] bg-[#FAF9F6] opacity-75 dark:border-[#1E2936] dark:bg-[#0D141C]'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                      {prayer.label}
                    </div>
                    <div className="mt-0.5 text-xs text-[#666C68] dark:text-[#8E9BA4]">
                      Ezan:{' '}
                      <span className="font-mono-tabular">
                        {prayer.formattedTime}
                      </span>
                      {settings.leadMinutes > 0 && isChecked && (
                        <>
                          {' · '}Uyarı:{' '}
                          <span className="font-mono-tabular">
                            {triggerFormatted}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
                      isChecked
                        ? 'border-[#0F6E56] bg-[#0F6E56] text-white dark:border-[#10B981] dark:bg-[#10B981] dark:text-[#07130E]'
                        : 'border-[#C8C2B4] bg-white dark:border-[#334355] dark:bg-[#121A24]'
                    }`}
                  >
                    {isChecked && <Check className="h-3.5 w-3.5" />}
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
