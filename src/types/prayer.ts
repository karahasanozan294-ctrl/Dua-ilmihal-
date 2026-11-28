export type CalculationMethodId =
  | 'Turkey'
  | 'Fazilet'
  | 'MuslimWorldLeague'
  | 'UmmAlQura'
  | 'Egyptian'
  | 'NorthAmerica'
  | 'Karachi';

export type MadhabId = 'Shafi' | 'Hanafi';

export type PrayerKey =
  | 'imsak'
  | 'gunes'
  | 'ogle'
  | 'ikindi'
  | 'aksam'
  | 'yatsi';

export interface LocationInfo {
  id: string;
  name: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  source: 'preset' | 'gps' | 'search' | 'manual';
}

export interface PrayerTimeEntry {
  key: PrayerKey;
  label: string;
  arabicHint: string;
  date: Date;
  formattedTime: string;
}

export interface DailyPrayerSchedule {
  date: Date;
  gregorianDate: string;
  hijriDate: string;
  prayers: PrayerTimeEntry[];
  sunnah: {
    middleOfTheNight: string;
    lastThirdOfTheNight: string;
  };
  extended: {
    sabah: string;
    israk: string;
    asrSani: string;
  };
  qiblaAngle: number;
  qiblaDirectionLabel: string;
  distanceToMeccaKm: number;
}

export type TemkinOffsets = Record<PrayerKey, number>;

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  persistentSummary: boolean;
  watchAlertsEnabled?: boolean;
  leadMinutes: 0 | 10 | 15 | 30;
  prayers: Record<PrayerKey, boolean>;
}

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  prayerKey?: PrayerKey;
}
