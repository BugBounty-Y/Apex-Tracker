// ==========================================
// localStorage PERSISTENCE LAYER
// ==========================================
const STORAGE_KEY = 'apex-tracker-data';

/**
 * Load all persisted data from localStorage.
 * Returns null if nothing stored.
 */
export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save application state to localStorage.
 */
export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

/**
 * Calculates the streak (consecutive days with at least 1 minute of study).
 * dailyLog is an object like { "2026-03-10": 120, "2026-03-09": 3600, ... }
 */
export function calculateStreak(dailyLog, userTimezone = 'auto') {
  if (!dailyLog || Object.keys(dailyLog).length === 0) return 0;

  // Determine timezone offset in minutes
  let offsetMinutes = 0;
  if (!userTimezone || userTimezone === 'auto') {
    // Note: getTimezoneOffset() returns minutes, where UTC+3 is -180.
    // For our math where we add the offset, we need the inverse.
    offsetMinutes = -new Date().getTimezoneOffset();
  } else {
    try {
      const offsetStr = userTimezone.replace('UTC', '');
      if (offsetStr === '+5:30') offsetMinutes = 5.5 * 60;
      else offsetMinutes = Number(offsetStr) * 60;
      if (isNaN(offsetMinutes)) offsetMinutes = -new Date().getTimezoneOffset();
    } catch {
      offsetMinutes = -new Date().getTimezoneOffset();
    }
  }

  // Define getLocKey globally for this function using the computed offset.
  // We take the pure UTC time of the date object, and add the target offset.
  const getLocKey = (d) => {
    const utcTime = d.getTime() + (d.getTimezoneOffset() * 60000);
    return new Date(utcTime + (offsetMinutes * 60000)).toISOString().slice(0, 10);
  };

  const pureNow = new Date();
  let streak = 0;
  
  // Set our "check date" to today, but aligned to the specific timezone.
  // Actually, we can just use the pure current time, format it, then step back day by day.
  // Since `setDate(getDate() - 1)` preserves time components and handles month/year wrapping reliably, we will use it.
  let checkDate = new Date();

  const todayKey = getLocKey(checkDate);
  const todaySeconds = dailyLog[todayKey] || 0;

  // Streak requires 25 minutes (1500 seconds)
  if (todaySeconds < 1500) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count consecutive days (safety limit 3650 days = 10 years)
  while (streak < 3650) {
    const key = getLocKey(checkDate);
    const seconds = dailyLog[key] || 0;
    if (seconds >= 1500) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
