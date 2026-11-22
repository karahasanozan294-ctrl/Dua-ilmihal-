export type NotificationPermissionState =
  | 'granted'
  | 'denied'
  | 'default'
  | 'unsupported';

export function getNotificationPermissionState(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermissionState> {
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

export function dispatchBrowserNotification(
  title: string,
  body: string,
  options?: { tag?: string; silent?: boolean; renotify?: boolean }
): boolean {
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

