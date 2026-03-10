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
 * Returns today's date string in YYYY-MM-DD format for daily tracking.
 * Uses local timezone to prevent UTC midnight drifting.
 * If userProfile has a specific timezone (e.g., 'UTC+3'), it calculates based on that.
 */
export function getTodayKey(userTimezone = 'auto') {
  const d = new Date();
  
  // If set to auto, use browser's local timezone offset
  if (!userTimezone || userTimezone === 'auto') {
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
  }

  // Parse custom timezone (e.g., 'UTC+3' -> 3, 'UTC-5' -> -5)
  try {
    const offsetStr = userTimezone.replace('UTC', '');
    let offsetMinutes = 0;
    
    if (offsetStr === '+5:30') { // Special case for India
      offsetMinutes = 5.5 * 60;
    } else {
      offsetMinutes = Number(offsetStr) * 60;
    }

    if (isNaN(offsetMinutes)) throw new Error('Invalid offset');

    // Calculate time using UTC milliseconds + custom offset
    const utcTime = d.getTime() + (d.getTimezoneOffset() * 60000); // Convert local to true UTC
    const customTime = utcTime + (offsetMinutes * 60000); // Add custom offset
    
    return new Date(customTime).toISOString().slice(0, 10);
  } catch (e) {
    // Fallback to auto on any parsing error
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
  }
}

/**
 * Plays a notification sound using the Web Audio API.
 * Falls back silently if audio is not available.
 */
export function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
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
