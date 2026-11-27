import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { DailyWisdomSection } from './components/DailyWisdomSection';
import { Header, AppSection } from './components/Header';
import { HijriSummaryCard } from './components/HijriSummaryCard';
import { IslamicDaysCalendar } from './components/IslamicDaysCalendar';
import { LocationModal } from './components/LocationModal';
import { MonthlySchedule } from './components/MonthlySchedule';
import { NotificationManager } from './components/NotificationManager';
import { PrayerOverview } from './components/PrayerOverview';
import {
  DesktopMiniWidgetView,
  FloatingMiniWidget,
  WidgetPreferences,
  WidgetTheme,
} from './components/PrayerWidgetCard';
import { QiblaCompass } from './components/QiblaCompass';
import { EsmaulHusnaReader } from './components/EsmaulHusnaReader';
import { QuranReader } from './components/QuranReader';
import { HakDiniTefsirReader } from './components/HakDiniTefsirReader';
import { MuhtasarIlmihalReader } from './components/MuhtasarIlmihalReader';
import { PdfBookReader } from './components/PdfBookReader';
import { RamuzElHadisReader } from './components/RamuzElHadisReader';
import { RiyazusSalihinReader } from './components/RiyazusSalihinReader';
import { WidgetModal } from './components/WidgetModal';
import { Zikirmatik, ZikirmatikQuickCard } from './components/Zikirmatik';
import { TURKEY_PROVINCES } from './data/cities';
import { getHijriParts } from './data/islamicCalendar';
import {
  CalculationMethodId,
  InAppNotification,
  LocationInfo,
  MadhabId,
  NotificationSettings,
} from './types/prayer';
import { ZikirItem, ZikirState } from './types/zikir';
import {
  dispatchBrowserNotification,
  getNotificationPermissionState,
  getUnifiedNotificationPermissionState,
  isNativeAndroid,
  isNativeIos,
  isNativeMobile,
  NotificationPermissionState,
  playGentleAdhanChime,
  playZikirTapSound,
  requestBrowserNotificationPermission,
  syncNativeAndroidPrayerBar,
  updateWindowsTraySummary,
} from './utils/notifications';
import {
  calculateDailySchedule,
  getNextPrayerStatus,
} from './utils/prayerCalculator';

const DEFAULT_LOCATION: LocationInfo = TURKEY_PROVINCES[0]; // İstanbul

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: false,
  persistentSummary: true,
  leadMinutes: 0,
  prayers: {
    imsak: true,
    gunes: false,
    ogle: true,
    ikindi: true,
    aksam: true,
    yatsi: true,
  },
};

const DEFAULT_WIDGET_PREFS: WidgetPreferences = {
  variant: 'wide',
  theme: 'light',
  showHijri: true,
  floatingEnabled: false,
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const getLocalDateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const DEFAULT_ZIKIR_ITEMS: ZikirItem[] = [
  {
    id: 'subhanallah',
    title: 'Sübhânallah',
    arabic: 'سُبْحَانَ ٱللَّهِ',
    meaning: 'Allah her türlü noksanlıktan münezzehtir',
    target: 33,
    count: 0,
    rounds: 0,
  },
  {
    id: 'elhamdulillah',
    title: 'Elhamdülillah',
    arabic: 'ٱلْحَمْدُ لِلَّهِ',
    meaning: 'Hamd yalnızca Allah’a mahsustur',
    target: 33,
    count: 0,
    rounds: 0,
  },
  {
    id: 'allahuekber',
    title: 'Allâhu Ekber',
    arabic: 'ٱللَّهُ أَكْبَرُ',
    meaning: 'Allah en büyüktür',
    target: 33,
    count: 0,
    rounds: 0,
  },
  {
    id: 'tevhid',
    title: 'Lâ ilâhe illallâh',
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ',
    meaning: 'Allah’tan başka ilâh yoktur',
    target: 99,
    count: 0,
    rounds: 0,
  },
  {
    id: 'istigfar',
    title: 'Estağfirullâh el-Azîm',
    arabic: 'أَسْتَغْفِرُ ٱللَّهَ ٱلْعَظِيمَ',
    meaning: 'Yüce Allah’tan bağışlanma dilerim',
    target: 100,
    count: 0,
    rounds: 0,
  },
  {
    id: 'salavat',
    title: 'Salavat-ı Şerife',
    arabic: 'ٱللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ',
    meaning: 'Allah’ım, Efendimiz Muhammed’e salât eyle',
    target: 100,
    count: 0,
    rounds: 0,
  },
];

const DEFAULT_ZIKIR_STATE: ZikirState = {
  items: DEFAULT_ZIKIR_ITEMS,
  activeId: 'subhanallah',
  dailyTotal: 0,
  dailyDateKey: getLocalDateKey(),
  allTimeTotal: 0,
  soundEnabled: true,
  vibrationEnabled: true,
  tesbihatChainEnabled: true,
};

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('vakitler');
  const [prayerSubView, setPrayerSubView] = useState<
    'today' | 'zikirmatik' | 'imsakiye'
  >('today');
  const [librarySubView, setLibrarySubView] = useState<
    'mushaf' | 'tefsir' | 'riyaz' | 'ramuz' | 'ilmihal' | 'esma' | 'pdf'
  >('mushaf');
  const [tefsirInitialSurah, setTefsirInitialSurah] = useState<
    number | undefined
  >(undefined);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);

  const isDesktopWidgetMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('widget') === '1';

  const [location, setLocation] = useState<LocationInfo>(() =>
    readStorage<LocationInfo>('mihrab_location', DEFAULT_LOCATION)
  );
  const [recentLocations, setRecentLocations] = useState<LocationInfo[]>(() =>
    readStorage<LocationInfo[]>('mihrab_recents', [])
  );
  const [methodId, setMethodId] = useState<CalculationMethodId>(() =>
    readStorage<CalculationMethodId>('mihrab_method', 'Turkey')
  );
  const [madhabId, setMadhabId] = useState<MadhabId>(() =>
    readStorage<MadhabId>('mihrab_madhab', 'Shafi')
  );
  const [isDark, setIsDark] = useState<boolean>(() =>
    readStorage<boolean>('mihrab_dark', false)
  );
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(() =>
      readStorage<NotificationSettings>(
        'mihrab_notifications',
        DEFAULT_NOTIFICATION_SETTINGS
      )
    );
  const [widgetPrefs, setWidgetPrefs] = useState<WidgetPreferences>(() =>
    readStorage<WidgetPreferences>('mihrab_widget_prefs', DEFAULT_WIDGET_PREFS)
  );

  const [permissionState, setPermissionState] =
    useState<NotificationPermissionState>(() => getNotificationPermissionState());
  const [activeToast, setActiveToast] = useState<InAppNotification | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());

  const [zikirState, setZikirState] = useState<ZikirState>(() => {
    const loaded = readStorage<ZikirState>('mihrab_zikir', DEFAULT_ZIKIR_STATE);
    const todayKey = getLocalDateKey();
    if (loaded.dailyDateKey !== todayKey) {
      return { ...loaded, dailyTotal: 0, dailyDateKey: todayKey };
    }
    return loaded;
  });

  const firedAlertsRef = useRef<Set<string>>(new Set());

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem('mihrab_dark', JSON.stringify(isDark));
    } catch {
      // Ignore storage errors
    }
  }, [isDark]);

  // Persist core user settings
  useEffect(() => {
    try {
      window.localStorage.setItem('mihrab_location', JSON.stringify(location));
      window.localStorage.setItem('mihrab_method', JSON.stringify(methodId));
      window.localStorage.setItem('mihrab_madhab', JSON.stringify(madhabId));
      window.localStorage.setItem(
        'mihrab_notifications',
        JSON.stringify(notificationSettings)
      );
      window.localStorage.setItem(
        'mihrab_recents',
        JSON.stringify(recentLocations)
      );
      window.localStorage.setItem('mihrab_zikir', JSON.stringify(zikirState));
      window.localStorage.setItem(
        'mihrab_widget_prefs',
        JSON.stringify(widgetPrefs)
      );
    } catch {
      // Ignore storage errors
    }
  }, [
    location,
    methodId,
    madhabId,
    notificationSettings,
    recentLocations,
    zikirState,
    widgetPrefs,
  ]);

  // Keep secondary Desktop Widget window synchronized with main window changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === 'mihrab_location') setLocation(JSON.parse(e.newValue));
        if (e.key === 'mihrab_method') setMethodId(JSON.parse(e.newValue));
        if (e.key === 'mihrab_madhab') setMadhabId(JSON.parse(e.newValue));
        if (e.key === 'mihrab_dark') setIsDark(JSON.parse(e.newValue));
        if (e.key === 'mihrab_widget_prefs') setWidgetPrefs(JSON.parse(e.newValue));
      } catch {
        // Ignore malformed storage updates
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // 1-second precision clock tick
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  const schedule = useMemo(
    () => calculateDailySchedule(location, now, methodId, madhabId),
    [location, todayKey, methodId, madhabId]
  );

  const tomorrowSchedule = useMemo(() => {
    const tomorrow = new Date(now.getTime() + 86_400_000);
    return calculateDailySchedule(location, tomorrow, methodId, madhabId);
  }, [location, todayKey, methodId, madhabId]);

  const nextStatus = useMemo(
    () => getNextPrayerStatus(location, now, methodId, madhabId),
    [location, now, methodId, madhabId]
  );

  // Sync native Android notification permission on startup
  useEffect(() => {
    let active = true;
    (async () => {
      const current = await getUnifiedNotificationPermissionState();
      if (!active) return;
      setPermissionState(current);

      if (isNativeMobile() && current === 'default') {
        const promptedKey = 'mihrab_native_perm_prompted';
        const alreadyPrompted = window.localStorage.getItem(promptedKey);
        if (!alreadyPrompted) {
          window.localStorage.setItem(promptedKey, '1');
          const nextPerm = await requestBrowserNotificationPermission();
          if (active) setPermissionState(nextPerm);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Push 2-day prayer schedule to native Android notification shade / iOS local notifications
  useEffect(() => {
    if (!isNativeMobile()) return;
    const refDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      12,
      0,
      0
    );
    const hijri = getHijriParts(refDate);
    const hijriLabel = `${hijri.day} ${hijri.monthNameTr} ${hijri.year}`;
    const dateLabel = new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
    }).format(refDate);

    syncNativeAndroidPrayerBar({
      settings: notificationSettings,
      locationName: location.name,
      dateLabel,
      hijriLabel,
      schedules: [schedule, tomorrowSchedule],
    });
  }, [
    location,
    schedule,
    tomorrowSchedule,
    notificationSettings,
    permissionState,
  ]);

  // Reflect next prayer countdown in browser tab title and Windows tray tooltip
  useEffect(() => {
    const label = `${nextStatus.nextPrayer.label} ${nextStatus.nextPrayer.formattedTime} (${nextStatus.countdownFormatted}) · Mihrab`;
    document.title = label;
    updateWindowsTraySummary(`Mihrab · ${location.name} · ${label.replace(' · Mihrab', '')}`);
  }, [nextStatus, location.name]);

  // Check and dispatch scheduled prayer notifications
  useEffect(() => {
    if (!notificationSettings.enabled) return;

    const nowMs = now.getTime();
    const leadMs = notificationSettings.leadMinutes * 60 * 1000;

    for (const prayer of schedule.prayers) {
      if (!notificationSettings.prayers[prayer.key]) continue;

      const triggerMs = prayer.date.getTime() - leadMs;
      const diffMs = nowMs - triggerMs;

      if (diffMs >= 0 && diffMs < 5000) {
        const alertKey = `${location.id}-${prayer.key}-${prayer.date.toDateString()}-${notificationSettings.leadMinutes}`;
        if (firedAlertsRef.current.has(alertKey)) continue;
        firedAlertsRef.current.add(alertKey);

        const title =
          notificationSettings.leadMinutes > 0
            ? `${prayer.label} vaktine ${notificationSettings.leadMinutes} dakika kaldı`
            : `${prayer.label} Vakti Girdi`;

        const body = `${location.name} için ${prayer.label} ezanı: ${prayer.formattedTime}`;

        dispatchBrowserNotification(title, body, {
          tag: `mihrab-${prayer.key}`,
        });

        if (notificationSettings.soundEnabled) {
          playGentleAdhanChime();
        }

        setActiveToast({
          id: alertKey,
          title,
          body,
          timestamp: prayer.formattedTime,
          prayerKey: prayer.key,
        });
      }
    }
  }, [now, schedule, location, notificationSettings]);

  const handleSelectLocation = (nextLoc: LocationInfo) => {
    setLocation(nextLoc);
    setRecentLocations((prev) => {
      const filtered = prev.filter((item) => item.id !== nextLoc.id);
      return [nextLoc, ...filtered].slice(0, 6);
    });
  };

  const handleRequestPermission = async () => {
    const result = await requestBrowserNotificationPermission();
    setPermissionState(result);
    if (result === 'granted') {
      if (!isNativeMobile()) {
        dispatchBrowserNotification(
          'Mihrab Bildirimleri Etkin',
          `${location.name} için seçili namaz vakitlerinde bildirim alacaksınız.`,
          { tag: 'mihrab-welcome' }
        );
      }
    }
  };

  const handleSendTestNotification = async () => {
    let currentPerm = await getUnifiedNotificationPermissionState();
    if (currentPerm === 'default') {
      currentPerm = await requestBrowserNotificationPermission();
      setPermissionState(currentPerm);
    }

    const title = `Test Bildirimi · ${nextStatus.nextPrayer.label}`;
    const body = `${location.name}: Sıradaki vakit ${nextStatus.nextPrayer.label} (${nextStatus.nextPrayer.formattedTime}) · Kalan süre ${nextStatus.countdownFormatted}`;

    dispatchBrowserNotification(title, body, { tag: 'mihrab-test' });
    if (notificationSettings.soundEnabled) {
      playGentleAdhanChime();
    }

    setActiveToast({
      id: `test-${Date.now()}`,
      title,
      body,
      timestamp: nextStatus.nextPrayer.formattedTime,
    });
  };

  const handleSendSummaryNotification = async () => {
    let currentPerm = await getUnifiedNotificationPermissionState();
    if (currentPerm === 'default') {
      currentPerm = await requestBrowserNotificationPermission();
      setPermissionState(currentPerm);
    }

    const nextSettings = notificationSettings.persistentSummary
      ? notificationSettings
      : { ...notificationSettings, persistentSummary: true };

    if (!notificationSettings.persistentSummary) {
      setNotificationSettings(nextSettings);
    }

    if (isNativeMobile()) {
      const refDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        12,
        0,
        0
      );
      const hijri = getHijriParts(refDate);
      await syncNativeAndroidPrayerBar({
        settings: nextSettings,
        locationName: location.name,
        dateLabel: new Intl.DateTimeFormat('tr-TR', {
          day: 'numeric',
          month: 'short',
        }).format(refDate),
        hijriLabel: `${hijri.day} ${hijri.monthNameTr} ${hijri.year}`,
        schedules: [schedule, tomorrowSchedule],
      });
    }

    const summaryLine = schedule.prayers
      .map((p) => `${p.label} ${p.formattedTime}`)
      .join(' · ');

    const title = `${location.name} Namaz Vakitleri`;
    const body = `Sıradaki: ${nextStatus.nextPrayer.label} (${nextStatus.countdownFormatted}) — ${summaryLine}`;

    if (isNativeIos()) {
      dispatchBrowserNotification(title, body, {
        tag: 'mihrab-live-summary',
        silent: true,
      });
    } else if (!isNativeAndroid()) {
      dispatchBrowserNotification(title, body, {
        tag: 'mihrab-live-summary',
        silent: true,
      });
    }

    setActiveToast({
      id: `summary-${Date.now()}`,
      title: isNativeAndroid()
        ? `${location.name} Vakitleri Bildirim Çubuğuna Sabitlendi`
        : isNativeIos()
        ? `${location.name} Vakitleri iPhone Bildirim Merkezine Gönderildi`
        : title,
      body,
      timestamp: nextStatus.nextPrayer.formattedTime,
    });
  };

  const handleZikirIncrement = () => {
    const todayKey = getLocalDateKey();
    setZikirState((prev) => {
      const currentDaily = prev.dailyDateKey === todayKey ? prev.dailyTotal : 0;
      const activeIdx = prev.items.findIndex((i) => i.id === prev.activeId);
      const item = prev.items[activeIdx] ?? prev.items[0];
      const nextCount = item.count + 1;
      const reachedTarget = nextCount >= item.target;

      if (prev.soundEnabled) {
        playZikirTapSound(reachedTarget);
      }
      if (
        reachedTarget &&
        prev.vibrationEnabled &&
        typeof navigator !== 'undefined' &&
        'vibrate' in navigator
      ) {
        try {
          navigator.vibrate([25, 40, 25]);
        } catch {
          // Ignore vibration restriction
        }
      }

      const chainOrder = ['subhanallah', 'elhamdulillah', 'allahuekber'];
      const chainIndex = chainOrder.indexOf(item.id);
      const shouldChainAdvance =
        prev.tesbihatChainEnabled && reachedTarget && chainIndex !== -1;

      const updatedItems = prev.items.map((entry) => {
        if (entry.id !== item.id) return entry;
        if (reachedTarget) {
          return {
            ...entry,
            count: shouldChainAdvance ? 0 : nextCount,
            rounds: entry.rounds + 1,
          };
        }
        return { ...entry, count: nextCount };
      });

      const nextActiveId = shouldChainAdvance
        ? chainOrder[(chainIndex + 1) % chainOrder.length]
        : item.id;

      return {
        ...prev,
        items: updatedItems,
        activeId: nextActiveId,
        dailyTotal: currentDaily + 1,
        dailyDateKey: todayKey,
        allTimeTotal: prev.allTimeTotal + 1,
      };
    });
  };

  const handleZikirDecrement = () => {
    setZikirState((prev) => {
      const item = prev.items.find((i) => i.id === prev.activeId);
      if (!item || item.count <= 0) return prev;
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.id === prev.activeId ? { ...i, count: Math.max(0, i.count - 1) } : i
        ),
        dailyTotal: Math.max(0, prev.dailyTotal - 1),
        allTimeTotal: Math.max(0, prev.allTimeTotal - 1),
      };
    });
  };

  const handleZikirResetCurrent = () => {
    setZikirState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === prev.activeId ? { ...i, count: 0 } : i
      ),
    }));
  };

  const handleZikirSelect = (id: string) => {
    setZikirState((prev) => ({ ...prev, activeId: id }));
  };

  const handleAddCustomZikir = (title: string, target: number) => {
    const id = `custom-${Date.now()}`;
    const newItem: ZikirItem = {
      id,
      title,
      target,
      count: 0,
      rounds: 0,
      isCustom: true,
    };
    setZikirState((prev) => ({
      ...prev,
      items: [newItem, ...prev.items],
      activeId: id,
    }));
  };

  const handleDeleteCustomZikir = (id: string) => {
    setZikirState((prev) => {
      const remaining = prev.items.filter((i) => i.id !== id);
      const nextActive =
        prev.activeId === id ? remaining[0]?.id ?? 'subhanallah' : prev.activeId;
      return {
        ...prev,
        items: remaining,
        activeId: nextActive,
      };
    });
  };

  const handleToggleZikirSetting = (
    key: 'soundEnabled' | 'vibrationEnabled' | 'tesbihatChainEnabled'
  ) => {
    setZikirState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendEsmaToZikirmatik = (
    title: string,
    arabic: string,
    target: number
  ) => {
    setZikirState((prev) => {
      const existing = prev.items.find((i) => i.title === title);
      if (existing) {
        return { ...prev, activeId: existing.id };
      }
      const id = `esma-${Date.now()}`;
      const newItem: ZikirItem = {
        id,
        title,
        arabic,
        meaning: 'Esmâü’l-Hüsnâ Zikri',
        target,
        count: 0,
        rounds: 0,
        isCustom: true,
      };
      return {
        ...prev,
        items: [newItem, ...prev.items],
        activeId: id,
      };
    });
    setActiveSection('vakitler');
    setPrayerSubView('zikirmatik');
  };

  if (isDesktopWidgetMode) {
    const cycleTheme = () => {
      const order: WidgetTheme[] = ['light', 'emerald', 'dark'];
      const next = order[(order.indexOf(widgetPrefs.theme) + 1) % order.length];
      setWidgetPrefs((prev) => ({ ...prev, theme: next }));
    };

    return (
      <DesktopMiniWidgetView
        location={location}
        schedule={schedule}
        nextStatus={nextStatus}
        theme={widgetPrefs.theme}
        showHijri={widgetPrefs.showHijri}
        onCycleTheme={cycleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#171A19] dark:bg-[#0B1117] dark:text-[#EDF2F0]">
      <Header
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        location={location}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
      />

      {/* Persistent In-App Prayer Notification Strip */}
      {notificationSettings.persistentSummary && (
        <div className="border-b border-[#E5E0D5] bg-[#FFFFFF] dark:border-[#1E2936] dark:bg-[#101820]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1.5 px-4 py-2 text-xs sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[#575C59] dark:text-[#9CA7B0]">
              <Bell
                className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#34D399]"
                aria-hidden="true"
              />
              <span className="font-medium text-[#171A19] dark:text-[#EDF2F0]">
                {location.name}:
              </span>
              <span>
                Sıradaki vakit{' '}
                <strong className="font-semibold text-[#0F6E56] dark:text-[#34D399]">
                  {nextStatus.nextPrayer.label} ({nextStatus.nextPrayer.formattedTime})
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">
                Kalan {nextStatus.countdownFormatted}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-3 font-mono-tabular text-[11px] text-[#666C68] dark:text-[#8E9BA4]">
              {schedule.prayers.map((p) => (
                <span
                  key={p.key}
                  className={
                    p.key === nextStatus.nextPrayer.key
                      ? 'font-semibold text-[#0F6E56] dark:text-[#34D399]'
                      : ''
                  }
                >
                  {p.label} {p.formattedTime}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 md:pb-12 lg:px-8">
        {isNativeMobile() &&
          permissionState !== 'granted' &&
          notificationSettings.persistentSummary && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#0F6E56]/30 bg-[#FFFFFF] px-4 py-3 text-xs dark:border-[#34D399]/30 dark:bg-[#121A24]">
              <div className="flex items-center gap-2.5 text-[#363A38] dark:text-[#CBD5E1]">
                <Bell className="h-4 w-4 shrink-0 text-[#0F6E56] dark:text-[#34D399]" />
                <span>
                  {isNativeIos()
                    ? 'Namaz vakti uyarılarını kilit ekranı ve bildirim merkezinde almak için bildirim izni verin.'
                    : 'Telefonun bildirim çubuğunda günlük vakitleri sabitlemek için bildirim izni verin.'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRequestPermission}
                className="min-h-[38px] rounded-lg bg-[#0F6E56] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E] whitespace-nowrap"
              >
                Bildirim İzni Ver
              </button>
            </div>
          )}

        {activeToast && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-[#0F6E56]/35 bg-[#FFFFFF] p-4 shadow-sm dark:border-[#34D399]/35 dark:bg-[#121A24]"
          >
            <div className="flex items-start gap-3">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[#0F6E56] dark:text-[#34D399]" />
              <div>
                <div className="text-sm font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                  {activeToast.title}
                </div>
                <p className="mt-0.5 text-xs text-[#575C59] dark:text-[#9CA7B0]">
                  {activeToast.body}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              aria-label="Bildirimi kapat"
              className="rounded-lg p-1.5 text-[#666C68] hover:bg-[#F1EEE7] dark:text-[#8E9BA4] dark:hover:bg-[#1A2532]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {activeSection === 'vakitler' && (
          <div className="space-y-6">
            {/* Sub-view switcher: Bugünün Vakitleri | Zikirmatik | 30 Günlük İmsakiye */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-lg bg-[#EAE5DA] p-1 dark:bg-[#16202C]">
                <button
                  type="button"
                  onClick={() => setPrayerSubView('today')}
                  className={`min-h-[36px] rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    prayerSubView === 'today'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  Bugünün Vakitleri
                </button>
                <button
                  type="button"
                  onClick={() => setPrayerSubView('zikirmatik')}
                  className={`min-h-[36px] rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    prayerSubView === 'zikirmatik'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  Zikirmatik
                </button>
                <button
                  type="button"
                  onClick={() => setPrayerSubView('imsakiye')}
                  className={`min-h-[36px] rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    prayerSubView === 'imsakiye'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  30 Günlük İmsakiye
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveSection('takvim')}
                className="text-xs font-medium text-[#0F6E56] hover:underline dark:text-[#34D399]"
              >
                Kandil ve Bayram Takvimini Gör →
              </button>
            </div>

            {prayerSubView === 'today' && (
              <>
                <PrayerOverview
                  location={location}
                  now={now}
                  schedule={schedule}
                  nextStatus={nextStatus}
                  methodId={methodId}
                  onChangeMethod={setMethodId}
                  madhabId={madhabId}
                  onChangeMadhab={setMadhabId}
                  isDark={isDark}
                  onToggleTheme={() => setIsDark((d) => !d)}
                  notificationsEnabled={notificationSettings.enabled}
                  onOpenNotifications={() => setActiveSection('bildirimler')}
                  onOpenQibla={() => setActiveSection('kible')}
                  onOpenLocationModal={() => setIsLocationModalOpen(true)}
                  onOpenWidgetModal={() => setIsWidgetModalOpen(true)}
                />
                <HijriSummaryCard
                  now={now}
                  onOpenCalendar={() => setActiveSection('takvim')}
                />
                <ZikirmatikQuickCard
                  state={zikirState}
                  onIncrement={handleZikirIncrement}
                  onResetCurrent={handleZikirResetCurrent}
                  onSelectZikir={handleZikirSelect}
                  onOpenFullZikirmatik={() => setPrayerSubView('zikirmatik')}
                />
                <DailyWisdomSection
                  onOpenQuran={() => {
                    setActiveSection('kuran');
                    setLibrarySubView('mushaf');
                  }}
                  onOpenTefsir={() => {
                    setActiveSection('kuran');
                    setLibrarySubView('tefsir');
                  }}
                  onOpenRiyaz={() => {
                    setActiveSection('kuran');
                    setLibrarySubView('riyaz');
                  }}
                  onOpenRamuz={() => {
                    setActiveSection('kuran');
                    setLibrarySubView('ramuz');
                  }}
                />
              </>
            )}

            {prayerSubView === 'zikirmatik' && (
              <Zikirmatik
                state={zikirState}
                onIncrement={handleZikirIncrement}
                onDecrement={handleZikirDecrement}
                onResetCurrent={handleZikirResetCurrent}
                onSelectZikir={handleZikirSelect}
                onAddCustomZikir={handleAddCustomZikir}
                onDeleteCustomZikir={handleDeleteCustomZikir}
                onToggleSetting={handleToggleZikirSetting}
              />
            )}

            {prayerSubView === 'imsakiye' && (
              <MonthlySchedule
                location={location}
                methodId={methodId}
                madhabId={madhabId}
              />
            )}
          </div>
        )}

        {activeSection === 'kible' && (
          <QiblaCompass
            location={location}
            schedule={schedule}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
          />
        )}

        {activeSection === 'kuran' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                role="tablist"
                aria-label="İslami Kitaplık Bölümleri"
                className="inline-flex flex-wrap rounded-lg bg-[#EAE5DA] p-1 dark:bg-[#16202C]"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={librarySubView === 'mushaf'}
                  onClick={() => setLibrarySubView('mushaf')}
                  className={`min-h-[40px] rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    librarySubView === 'mushaf'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  Kur’an-ı Kerim
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={librarySubView === 'tefsir'}
                  onClick={() => setLibrarySubView('tefsir')}
                  className={`min-h-[40px] rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    librarySubView === 'tefsir'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  Hak Dini Kur’an Dili (Tefsir)
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={librarySubView === 'riyaz'}
                  onClick={() => setLibrarySubView('riyaz')}
                  className={`min-h-[40px] rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    librarySubView === 'riyaz'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  Riyâzu’s-Sâlihîn
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={librarySubView === 'ramuz'}
                  onClick={() => setLibrarySubView('ramuz')}
                  className={`min-h-[40px] rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    librarySubView === 'ramuz'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  Râmûzü’l-Ehâdîs
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={librarySubView === 'ilmihal'}
                  onClick={() => setLibrarySubView('ilmihal')}
                  className={`min-h-[40px] rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    librarySubView === 'ilmihal'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  Muhtasar İlmihal
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={librarySubView === 'esma'}
                  onClick={() => setLibrarySubView('esma')}
                  className={`min-h-[40px] rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    librarySubView === 'esma'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  Esmâü’l-Hüsnâ (99 İsim)
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={librarySubView === 'pdf'}
                  onClick={() => setLibrarySubView('pdf')}
                  className={`min-h-[40px] rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    librarySubView === 'pdf'
                      ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                  }`}
                >
                  PDF Kitaplık
                </button>
              </div>
            </div>

            {librarySubView === 'mushaf' && (
              <QuranReader
                onOpenTefsir={(surahNum) => {
                  setTefsirInitialSurah(surahNum);
                  setLibrarySubView('tefsir');
                }}
              />
            )}

            {librarySubView === 'tefsir' && (
              <HakDiniTefsirReader initialSurah={tefsirInitialSurah} />
            )}

            {librarySubView === 'riyaz' && <RiyazusSalihinReader />}

            {librarySubView === 'ramuz' && <RamuzElHadisReader />}

            {librarySubView === 'ilmihal' && <MuhtasarIlmihalReader />}

            {librarySubView === 'esma' && (
              <EsmaulHusnaReader
                onSendToZikirmatik={handleSendEsmaToZikirmatik}
              />
            )}

            {librarySubView === 'pdf' && <PdfBookReader mode="library" />}
          </div>
        )}

        {activeSection === 'takvim' && <IslamicDaysCalendar />}

        {activeSection === 'bildirimler' && (
          <NotificationManager
            location={location}
            schedule={schedule}
            nextStatus={nextStatus}
            settings={notificationSettings}
            onUpdateSettings={setNotificationSettings}
            permissionState={permissionState}
            onRequestPermission={handleRequestPermission}
            onSendTestNotification={handleSendTestNotification}
            onSendSummaryNotification={handleSendSummaryNotification}
            onOpenWidgetModal={() => setIsWidgetModalOpen(true)}
          />
        )}
      </main>

      {/* Clean Quiet Footer */}
      <footer className="hidden md:block border-t border-[#E5E0D5] bg-[#F7F5F0] py-6 text-xs text-[#666C68] dark:border-[#1E2936] dark:bg-[#0B1117] dark:text-[#8E9BA4]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <span>
            Mihrab · Namaz Vakitleri, Kur’an-ı Kerim, Dini Günler ve Kıble Pusulası
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setActiveSection('vakitler');
                setPrayerSubView('today');
              }}
              className="hover:text-[#171A19] dark:hover:text-[#EDF2F0]"
            >
              Vakitler
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('kible')}
              className="hover:text-[#171A19] dark:hover:text-[#EDF2F0]"
            >
              Kıble Pusulası
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSection('kuran');
                setLibrarySubView('mushaf');
              }}
              className="hover:text-[#171A19] dark:hover:text-[#EDF2F0]"
            >
              Kur’an-ı Kerim
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSection('kuran');
                setLibrarySubView('tefsir');
              }}
              className="hover:text-[#171A19] dark:hover:text-[#EDF2F0]"
            >
              Hak Dini Tefsiri
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSection('kuran');
                setLibrarySubView('riyaz');
              }}
              className="hover:text-[#171A19] dark:hover:text-[#EDF2F0]"
            >
              Riyâzu’s-Sâlihîn
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSection('kuran');
                setLibrarySubView('ramuz');
              }}
              className="hover:text-[#171A19] dark:hover:text-[#EDF2F0]"
            >
              Râmûzü’l-Ehâdîs
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSection('kuran');
                setLibrarySubView('ilmihal');
              }}
              className="hover:text-[#171A19] dark:hover:text-[#EDF2F0]"
            >
              Muhtasar İlmihal
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSection('kuran');
                setLibrarySubView('esma');
              }}
              className="hover:text-[#171A19] dark:hover:text-[#EDF2F0]"
            >
              Esmâü’l-Hüsnâ
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSection('kuran');
                setLibrarySubView('pdf');
              }}
              className="hover:text-[#171A19] dark:hover:text-[#EDF2F0]"
            >
              PDF Kitaplık
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('takvim')}
              className="hover:text-[#171A19] dark:hover:text-[#EDF2F0]"
            >
              Dini Günler
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('bildirimler')}
              className="hover:text-[#171A19] dark:hover:text-[#EDF2F0]"
            >
              Bildirimler
            </button>
          </div>
        </div>
      </footer>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        recentLocations={recentLocations}
        onSelectLocation={handleSelectLocation}
      />

      {widgetPrefs.floatingEnabled && (
        <FloatingMiniWidget
          location={location}
          schedule={schedule}
          nextStatus={nextStatus}
          theme={widgetPrefs.theme}
          showHijri={widgetPrefs.showHijri}
          onClose={() =>
            setWidgetPrefs((prev) => ({ ...prev, floatingEnabled: false }))
          }
          onOpenWidgetModal={() => setIsWidgetModalOpen(true)}
        />
      )}

      <WidgetModal
        isOpen={isWidgetModalOpen}
        onClose={() => setIsWidgetModalOpen(false)}
        location={location}
        schedule={schedule}
        nextStatus={nextStatus}
        preferences={widgetPrefs}
        onUpdatePreferences={setWidgetPrefs}
      />
    </div>
  );
}
