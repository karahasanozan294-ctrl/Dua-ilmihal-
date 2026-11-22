import { Capacitor, registerPlugin } from '@capacitor/core';
import { DailyPrayerSchedule, NotificationSettings } from '../types/prayer';

export type NotificationPermissionState =
  | 'granted'
  | 'denied'
  | 'default'
  | 'unsupported';

interface MihrabNativePlugin {
  getPermissionStatus(): Promise<{ state: NotificationPermissionState }>;
  requestPermission(): Promise<{ state: NotificationPermissionState }>;
  syncPrayerSchedule(options: {
    persistentEnabled: boolean;
    alertsEnabled: boolean;
    soundEnabled: boolean;
    leadMinutes: number;
    locationName: string;
    dateLabel: string;
    hijriLabel: string;
    prayersJson: string;
    enabledPrayersJson: string;
  }): Promise<{ applied: boolean; permission: NotificationPermissionState }>;
  sendAlertNotification(options: {
    title: string;
    body: string;
  }): Promise<{ sent: boolean }>;
}

const MihrabNativeNotifications =
  registerPlugin<MihrabNativePlugin>('MihrabNotifications');

export function isNativeAndroid(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
}

export function getNotificationPermissionState(): NotificationPermissionState {
  if (isNativeAndroid()) {
    return 'default';
  }
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function getUnifiedNotificationPermissionState(): Promise<NotificationPermissionState> {
  if (isNativeAndroid()) {
    try {
      const res = await MihrabNativeNotifications.getPermissionStatus();
      return res.state ?? 'default';
    } catch {
      return 'default';
    }
  }
  return getNotificationPermissionState();
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermissionState> {
  if (isNativeAndroid()) {
    try {
      const res = await MihrabNativeNotifications.requestPermission();
      return res.state ?? 'denied';
    } catch {
      return 'denied';
    }
  }
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return Notification.permission || 'denied';
  }
}

export async function syncNativeAndroidPrayerBar(params: {
  settings: NotificationSettings;
  locationName: string;
  dateLabel: string;
  hijriLabel: string;
  schedules: DailyPrayerSchedule[];
}): Promise<NotificationPermissionState | null> {
  if (!isNativeAndroid()) return null;

  try {
    const flatPrayers = params.schedules.flatMap((daySchedule) =>
      daySchedule.prayers.map((p) => ({
        key: p.key,
        label: p.label,
        time: p.formattedTime,
        epochMs: p.date.getTime(),
      }))
    );

    const res = await MihrabNativeNotifications.syncPrayerSchedule({
      persistentEnabled: params.settings.persistentSummary,
      alertsEnabled: params.settings.enabled,
      soundEnabled: params.settings.soundEnabled,
      leadMinutes: params.settings.leadMinutes,
      locationName: params.locationName,
      dateLabel: params.dateLabel,
      hijriLabel: params.hijriLabel,
      prayersJson: JSON.stringify(flatPrayers),
      enabledPrayersJson: JSON.stringify(params.settings.prayers),
    });

    return res.permission;
  } catch {
    return null;
  }
}

export function dispatchBrowserNotification(
  title: string,
  body: string,
  options?: { tag?: string; silent?: boolean; renotify?: boolean }
): boolean {
  if (isNativeAndroid()) {
    MihrabNativeNotifications.sendAlertNotification({ title, body }).catch(
      () => undefined
    );
    return true;
  }

  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    Notification.permission !== 'granted'
  ) {
    return false;
  }

  try {
    const notificationOptions: NotificationOptions & { renotify?: boolean } = {
      body,
      tag: options?.tag ?? 'mihrab-prayer-alert',
      silent: options?.silent ?? false,
      renotify: options?.renotify ?? true,
    };
    new Notification(title, notificationOptions);
    return true;
  } catch {
    return false;
  }
}

export function playGentleAdhanChime(): void {
  if (typeof window === 'undefined') return;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Gentle Hijaz-inspired soft harmonic chime (D4 - F#4 - G4 - A4)
    const notes = [293.66, 369.99, 392.0, 440.0];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.28);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.28);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.28 + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.28 + 1.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.28);
      osc.stop(now + idx * 0.28 + 1.2);
    });
  } catch {
    // Ignore autoplay blocks gracefully
  }
}

let sharedZikirCtx: AudioContext | null = null;

export function playZikirTapSound(isTargetReached = false): void {
  if (typeof window === 'undefined') return;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return;

  try {
    if (!sharedZikirCtx) {
      sharedZikirCtx = new AudioCtx();
    }
    if (sharedZikirCtx.state === 'suspended') {
      sharedZikirCtx.resume().catch(() => {});
    }

    const now = sharedZikirCtx.currentTime;
    const osc = sharedZikirCtx.createOscillator();
    const gain = sharedZikirCtx.createGain();

    osc.type = isTargetReached ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isTargetReached ? 660 : 520, now);
    osc.frequency.exponentialRampToValueAtTime(
      isTargetReached ? 880 : 320,
      now + (isTargetReached ? 0.18 : 0.045)
    );

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(
      isTargetReached ? 0.11 : 0.06,
      now + 0.008
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + (isTargetReached ? 0.28 : 0.06)
    );

    osc.connect(gain);
    gain.connect(sharedZikirCtx.destination);
    osc.start(now);
    osc.stop(now + (isTargetReached ? 0.3 : 0.07));
  } catch {
    // Ignore audio errors gracefully
  }
}
