import { useEffect, useState } from 'react';
import { Download, PlusSquare, Share, Smartphone, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton() {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isIOSSafari,
    isNativeApp,
    install,
  } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled || isNativeApp) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#0F6E56]/35 bg-[#0F6E56]/8 px-3 py-1.5 text-xs font-medium text-[#0F6E56] transition-colors hover:bg-[#0F6E56]/14 dark:border-[#34D399]/35 dark:bg-[#10B981]/12 dark:text-[#34D399] whitespace-nowrap shrink-0"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Uygulamayı Kur</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#DDD7C9] bg-[#FFFFFF] px-2.5 py-1.5 text-xs font-medium text-[#171A19] transition-colors hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#121A24] dark:text-[#EDF2F0] whitespace-nowrap shrink-0"
        >
          <Smartphone
            className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#34D399]"
            aria-hidden="true"
          />
          <span>Ana Ekrana Ekle</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-guide-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowIOSGuide(false);
            }}
          >
            <div className="w-full max-w-md rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 shadow-xl dark:border-[#1E2936] dark:bg-[#121A24] space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-[#EEEAE0] pb-3 dark:border-[#1E2936]">
                <div>
                  <div className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
                    iPhone & iPad · Safari Kurulumu
                  </div>
                  <h2
                    id="ios-install-guide-title"
                    className="mt-0.5 font-display text-xl font-semibold text-[#171A19] dark:text-[#EDF2F0]"
                  >
                    Mihrab’ı Ana Ekrana Ekle
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Kapat"
                  className="rounded-lg p-1.5 text-[#666C68] hover:bg-[#F1EEE7] dark:text-[#8E9BA4] dark:hover:bg-[#1A2532]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {!isIOSSafari && (
                <div className="rounded-xl border border-[#B4832C]/35 bg-[#B4832C]/8 px-3.5 py-2.5 text-xs text-[#7D5817] dark:border-[#FBBF24]/30 dark:bg-[#FBBF24]/10 dark:text-[#FCD34D]">
                  Şu an Safari dışında bir tarayıcıdasınız. iPhone’da ana ekrana kurmak için sayfa adresini <strong>Safari</strong> ile açın.
                </div>
              )}

              <ol className="space-y-3 text-sm text-[#363A38] dark:text-[#CBD5E1]">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0F6E56] text-xs font-semibold text-white dark:bg-[#10B981] dark:text-[#07130E]">
                    1
                  </span>
                  <span>
                    Safari araç çubuğundaki{' '}
                    <strong className="inline-flex items-center gap-1 text-[#171A19] dark:text-[#EDF2F0]">
                      Paylaş <Share className="h-3.5 w-3.5" />
                    </strong>{' '}
                    simgesine dokunun.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0F6E56] text-xs font-semibold text-white dark:bg-[#10B981] dark:text-[#07130E]">
                    2
                  </span>
                  <span>
                    Açılan menüyü yukarı kaydırıp{' '}
                    <strong className="inline-flex items-center gap-1 text-[#171A19] dark:text-[#EDF2F0]">
                      Ana Ekrana Ekle <PlusSquare className="h-3.5 w-3.5" />
                    </strong>{' '}
                    seçeneğine basın.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0F6E56] text-xs font-semibold text-white dark:bg-[#10B981] dark:text-[#07130E]">
                    3
                  </span>
                  <span>
                    Sağ üst köşedeki <strong>Ekle</strong> butonuna dokunun; Mihrab simgesi ana ekranınıza tam ekran uygulama olarak yerleşir.
                  </span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[42px] rounded-xl bg-[#0F6E56] py-2 text-xs font-medium text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E]"
              >
                Anladım
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-3 md:bottom-5 md:left-5 z-40 flex items-center gap-2 rounded-xl border border-[#B4832C]/40 bg-[#FFFFFF] px-3 py-2 text-xs font-medium text-[#7D5817] shadow-md dark:border-[#FBBF24]/30 dark:bg-[#121A24] dark:text-[#FCD34D]"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>Çevrimdışı Mod — Kayıtlı veriler kullanılıyor</span>
    </div>
  );
}
