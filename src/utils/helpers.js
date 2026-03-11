// ==========================================
// FORMATTING & HELPER UTILITIES
// ==========================================

export function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export function formatHoursMins(sec) {
  if (!sec || sec <= 0) return '-';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return '-';
}

/**
 * Parses a timezone string like 'UTC+3', 'UTC-5', 'UTC+5:30' into offset in minutes.
 * Returns browser's local offset if timezone is 'auto' or invalid.
 * Shared utility to avoid duplicating timezone parsing logic.
 */
export function parseTimezoneOffset(userTimezone = 'auto') {
  if (!userTimezone || userTimezone === 'auto') {
    return -new Date().getTimezoneOffset(); // Browser's local offset (e.g., UTC+3 = 180)
  }
  try {
    const offsetStr = userTimezone.replace('UTC', '');
    let offsetMinutes;
    if (offsetStr.includes(':')) {
      const [h, m] = offsetStr.split(':');
      const hours = Number(h);
      const mins = Number(m);
      offsetMinutes = hours >= 0
        ? (hours * 60) + mins
        : (hours * 60) - mins;
    } else {
      offsetMinutes = Number(offsetStr) * 60;
    }
    if (isNaN(offsetMinutes)) return -new Date().getTimezoneOffset();
    return offsetMinutes;
  } catch {
    return -new Date().getTimezoneOffset();
  }
}

/**
 * Given a Date object and an offset in minutes, returns the YYYY-MM-DD string
 * representing the date in that timezone.
 */
export function dateToLocalKey(d, offsetMinutes) {
  const utcTime = d.getTime() + (d.getTimezoneOffset() * 60000);
  return new Date(utcTime + (offsetMinutes * 60000)).toISOString().slice(0, 10);
}

/**
 * Returns today's date string in YYYY-MM-DD format for daily tracking.
 * Uses local timezone to prevent UTC midnight drifting.
 * If userProfile has a specific timezone (e.g., 'UTC+3'), it calculates based on that.
 */
export function getTodayKey(userTimezone = 'auto') {
  const offsetMinutes = parseTimezoneOffset(userTimezone);
  return dateToLocalKey(new Date(), offsetMinutes);
}

/**
 * Plays a notification sound using the Web Audio API.
 * Reuses a single AudioContext to prevent memory leaks.
 * Falls back silently if audio is not available.
 */
let _audioCtx = null;
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    // Reuse existing AudioContext or create one
    if (!_audioCtx || _audioCtx.state === 'closed') {
      _audioCtx = new AudioContextClass();
    }
    // Resume if suspended (browser autoplay policy)
    if (_audioCtx.state === 'suspended') {
      _audioCtx.resume();
    }

    const ctx = _audioCtx;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.8);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.8);
    });
  } catch {
    // Audio not available or blocked — fail silently
  }
}
