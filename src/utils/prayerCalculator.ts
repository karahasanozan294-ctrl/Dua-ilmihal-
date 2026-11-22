import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  Madhab,
  PrayerTimes,
  Qibla,
  Rounding,
  SunnahTimes,
} from 'adhan';
import {
  CalculationMethodId,
  DailyPrayerSchedule,
  LocationInfo,
  MadhabId,
  PrayerKey,
  PrayerTimeEntry,
} from '../types/prayer';

export const CALCULATION_METHODS: {
  id: CalculationMethodId;
  label: string;
  description: string;
}[] = [
  {
    id: 'Turkey',
    label: 'Diyanet İşleri (Türkiye)',
    description: 'T.C. Diyanet İşleri Başkanlığı resmi hesaplama yöntemi',
  },
  {
    id: 'Fazilet',
    label: 'Fazilet Takvimi (Temkinli)',
    description: 'İmsak -19°, Yatsı -17° ve geleneksel temkin payları ile hesaplama',
  },
  {
    id: 'MuslimWorldLeague',
    label: 'Dünya İslam Birliği (MWL)',
    description: 'Avrupa ve genel uluslararası standart',
  },
  {
    id: 'UmmAlQura',
    label: 'Ümmü’l-Kura (Mekke)',
    description: 'Suudi Arabistan resmi vakit hesaplaması',
  },
  {
    id: 'Egyptian',
    label: 'Mısır Genel Kurumu',
    description: 'Afrika ve Orta Doğu yaygın hesaplama yöntemi',
  },
  {
    id: 'NorthAmerica',
    label: 'ISNA (Kuzey Amerika)',
    description: 'ABD ve Kanada İslam Topluluğu standardı',
  },
  {
    id: 'Karachi',
    label: 'Karaçi İslami Bilimler',
    description: 'Güney Asya standart hesaplama yöntemi',
  },
];

export const PRAYER_LABELS: Record<
  PrayerKey,
  { label: string; arabicHint: string }
> = {
  imsak: { label: 'İmsak', arabicHint: 'Fecr-i Sâdık' },
  gunes: { label: 'Güneş', arabicHint: 'Şurûk' },
  ogle: { label: 'Öğle', arabicHint: 'Zuhr' },
  ikindi: { label: 'İkindi', arabicHint: 'Asr' },
  aksam: { label: 'Akşam', arabicHint: 'Mağrib' },
  yatsi: { label: 'Yatsı', arabicHint: 'İşâ' },
};

function getCalculationParams(
  methodId: CalculationMethodId,
  madhabId: MadhabId
): CalculationParameters {
  let params: CalculationParameters;
  switch (methodId) {
    case 'Turkey':
      params = CalculationMethod.Turkey();
      break;
    case 'Fazilet':
      params = new CalculationParameters('Other', 19, 17);
      params.rounding = Rounding.None;
      break;
    case 'MuslimWorldLeague':
      params = CalculationMethod.MuslimWorldLeague();
      break;
    case 'UmmAlQura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'Egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'NorthAmerica':
      params = CalculationMethod.NorthAmerica();
      break;
    case 'Karachi':
      params = CalculationMethod.Karachi();
      break;
    default:
      params = CalculationMethod.Turkey();
  }
  params.madhab = madhabId === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return params;
}

export function formatTimeInZone(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }
}

export function formatFullClockInZone(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  }
}

export function formatGregorianDate(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      timeZone: timezone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }
}

export function formatHijriDate(date: Date, timezone: string): string {
  try {
    const formatted = new Intl.DateTimeFormat(
      'tr-TR-u-ca-islamic-umalqura',
      {
        timeZone: timezone,
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    ).format(date);
    return formatted.replace(/\s*AH$/i, '').trim() + ' (Hicri)';
  } catch {
    return 'Hicri Takvim';
  }
}

export function getZoneDateComponents(
  date: Date,
  timezone: string
): { year: number; month: number; day: number } {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);

    const year = Number(parts.find((p) => p.type === 'year')?.value);
    const month = Number(parts.find((p) => p.type === 'month')?.value);
    const day = Number(parts.find((p) => p.type === 'day')?.value);
    return { year, month, day };
  } catch {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }
}

export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function getCompassDirectionLabel(angle: number): string {
  const dirs = [
    'Kuzey',
    'Kuzeydoğu',
    'Doğu',
    'Güneydoğu',
    'Güney',
    'Güneybatı',
    'Batı',
    'Kuzeybatı',
  ];
  const index = Math.round(((angle % 360) / 45)) % 8;
  return dirs[index];
}

export function calculateDailySchedule(
  location: LocationInfo,
  targetDate: Date,
  methodId: CalculationMethodId,
  madhabId: MadhabId
): DailyPrayerSchedule {
  const coords = new Coordinates(location.latitude, location.longitude);
  const params = getCalculationParams(methodId, madhabId);

  // Use local calendar date of the selected timezone so prayer times match that city's calendar day
  const { year, month, day } = getZoneDateComponents(
    targetDate,
    location.timezone
  );
  const localCalendarDate = new Date(year, month - 1, day, 12, 0, 0);

  const prayerTimes = new PrayerTimes(coords, localCalendarDate, params);
  const sunnahTimes = new SunnahTimes(prayerTimes);
  const qiblaAngle = Qibla(coords);

  const floorMin = (d: Date, addMin: number) =>
    new Date(Math.floor((d.getTime() + addMin * 60000) / 60000) * 60000);
  const ceilMin = (d: Date, addMin: number) =>
    new Date(Math.ceil((d.getTime() + addMin * 60000) / 60000) * 60000);
  const roundMin = (d: Date, addMin: number) =>
    new Date(Math.round((d.getTime() + addMin * 60000) / 60000) * 60000);

  // Also calculate Hanafi (Asr-ı Sânî) independently so both İkindi and Asr-ı Sânî are always available
  const hanafiParams = getCalculationParams(methodId, 'Hanafi');
  const hanafiPrayerTimes = new PrayerTimes(
    coords,
    localCalendarDate,
    hanafiParams
  );

  let fajrDate = prayerTimes.fajr;
  let sunriseDate = prayerTimes.sunrise;
  let dhuhrDate = prayerTimes.dhuhr;
  let asrDate = prayerTimes.asr;
  let asrSaniDate = hanafiPrayerTimes.asr;
  let maghribDate = prayerTimes.maghrib;
  let ishaDate = prayerTimes.isha;
  let sabahDate = floorMin(fajrDate, 20);
  let israkDate = floorMin(sunriseDate, 45);

  if (methodId === 'Fazilet') {
    fajrDate = floorMin(prayerTimes.fajr, -10);
    sabahDate = floorMin(fajrDate, 20);
    sunriseDate = floorMin(prayerTimes.sunrise, -8);
    israkDate = floorMin(prayerTimes.sunrise, 45);
    dhuhrDate = roundMin(prayerTimes.dhuhr, 10);
    asrSaniDate = roundMin(hanafiPrayerTimes.asr, 5);
    asrDate =
      madhabId === 'Hanafi'
        ? asrSaniDate
        : ceilMin(prayerTimes.asr, 10);
    maghribDate = roundMin(prayerTimes.maghrib, 9);
    ishaDate = ceilMin(prayerTimes.isha, 10);
  }

  const entries: PrayerTimeEntry[] = [
    {
      key: 'imsak',
      ...PRAYER_LABELS.imsak,
      date: fajrDate,
      formattedTime: formatTimeInZone(fajrDate, location.timezone),
    },
    {
      key: 'gunes',
      ...PRAYER_LABELS.gunes,
      date: sunriseDate,
      formattedTime: formatTimeInZone(sunriseDate, location.timezone),
    },
    {
      key: 'ogle',
      ...PRAYER_LABELS.ogle,
      date: dhuhrDate,
      formattedTime: formatTimeInZone(dhuhrDate, location.timezone),
    },
    {
      key: 'ikindi',
      label: madhabId === 'Hanafi' ? 'İkindi (A. Sânî)' : PRAYER_LABELS.ikindi.label,
      arabicHint:
        madhabId === 'Hanafi' ? 'Asr-ı Sânî (Hanefi)' : PRAYER_LABELS.ikindi.arabicHint,
      date: asrDate,
      formattedTime: formatTimeInZone(asrDate, location.timezone),
    },
    {
      key: 'aksam',
      ...PRAYER_LABELS.aksam,
      date: maghribDate,
      formattedTime: formatTimeInZone(maghribDate, location.timezone),
    },
    {
      key: 'yatsi',
      ...PRAYER_LABELS.yatsi,
      date: ishaDate,
      formattedTime: formatTimeInZone(ishaDate, location.timezone),
    },
  ];

  // Kaaba coordinates: 21.4225° N, 39.8262° E
  const distanceToMeccaKm = calculateHaversineDistanceKm(
    location.latitude,
    location.longitude,
    21.4225,
    39.8262
  );

  return {
    date: localCalendarDate,
    gregorianDate: formatGregorianDate(targetDate, location.timezone),
    hijriDate: formatHijriDate(targetDate, location.timezone),
    prayers: entries,
    sunnah: {
      middleOfTheNight: formatTimeInZone(
        sunnahTimes.middleOfTheNight,
        location.timezone
      ),
      lastThirdOfTheNight: formatTimeInZone(
        sunnahTimes.lastThirdOfTheNight,
        location.timezone
      ),
    },
    extended: {
      sabah: formatTimeInZone(sabahDate, location.timezone),
      israk: formatTimeInZone(israkDate, location.timezone),
      asrSani: formatTimeInZone(asrSaniDate, location.timezone),
    },
    qiblaAngle,
    qiblaDirectionLabel: getCompassDirectionLabel(qiblaAngle),
    distanceToMeccaKm,
  };
}

export interface NextPrayerStatus {
  currentPrayer: PrayerTimeEntry | null;
  nextPrayer: PrayerTimeEntry;
  remainingMs: number;
  countdownFormatted: string;
  progressPercent: number;
}

export function getNextPrayerStatus(
  location: LocationInfo,
  now: Date,
  methodId: CalculationMethodId,
  madhabId: MadhabId
): NextPrayerStatus {
  const todaySchedule = calculateDailySchedule(
    location,
    now,
    methodId,
    madhabId
  );
  const prayers = todaySchedule.prayers;
  const nowMs = now.getTime();

  let nextIdx = prayers.findIndex((p) => p.date.getTime() > nowMs);

  let currentPrayer: PrayerTimeEntry | null = null;
  let nextPrayer: PrayerTimeEntry;
  let periodStartMs: number;
  let periodEndMs: number;

  if (nextIdx === -1) {
    // After Yatsı -> next prayer is tomorrow's İmsak
    const tomorrow = new Date(nowMs + 24 * 60 * 60 * 1000);
    const tomorrowSchedule = calculateDailySchedule(
      location,
      tomorrow,
      methodId,
      madhabId
    );
    currentPrayer = prayers[prayers.length - 1];
    nextPrayer = tomorrowSchedule.prayers[0];
    periodStartMs = currentPrayer.date.getTime();
    periodEndMs = nextPrayer.date.getTime();
  } else if (nextIdx === 0) {
    // Before İmsak -> current period is yesterday's Yatsı
    const yesterday = new Date(nowMs - 24 * 60 * 60 * 1000);
    const yesterdaySchedule = calculateDailySchedule(
      location,
      yesterday,
      methodId,
      madhabId
    );
    currentPrayer = yesterdaySchedule.prayers[yesterdaySchedule.prayers.length - 1];
    nextPrayer = prayers[0];
    periodStartMs = currentPrayer.date.getTime();
    periodEndMs = nextPrayer.date.getTime();
  } else {
    currentPrayer = prayers[nextIdx - 1];
    nextPrayer = prayers[nextIdx];
    periodStartMs = currentPrayer.date.getTime();
    periodEndMs = nextPrayer.date.getTime();
  }

  const remainingMs = Math.max(0, periodEndMs - nowMs);
  const totalSpan = Math.max(1, periodEndMs - periodStartMs);
  const elapsed = Math.max(0, nowMs - periodStartMs);
  const progressPercent = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  const countdownFormatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return {
    currentPrayer,
    nextPrayer,
    remainingMs,
    countdownFormatted,
    progressPercent,
  };
}

export function generateMonthlySchedule(
  location: LocationInfo,
  startDate: Date,
  daysCount: number,
  methodId: CalculationMethodId,
  madhabId: MadhabId
): DailyPrayerSchedule[] {
  const list: DailyPrayerSchedule[] = [];
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    list.push(calculateDailySchedule(location, d, methodId, madhabId));
  }
  return list;
}
