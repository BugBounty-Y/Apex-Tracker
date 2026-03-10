// ==========================================
// FORMATTING & HELPER UTILITIES
// ==========================================

/**
 * Formats seconds as MM:SS for the timer display.
 */
export function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

/**
 * Formats seconds as a human-readable "Xh Ym" string.
 */
export function formatHoursMins(sec) {
  if (!sec || sec <= 0) return '-';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return '<1m';
}

/**
 * Returns today's date string in YYYY-MM-DD format for daily tracking.
 */
export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Plays a notification sound using the Web Audio API.
 * Falls back silently if audio is not available.
 */
export function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 — happy chord
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
    // Audio not available — fail silently
  }
}
