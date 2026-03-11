// ==========================================
// localStorage PERSISTENCE LAYER
// ==========================================
import { parseTimezoneOffset, dateToLocalKey } from './helpers';

const STORAGE_KEY = 'apex-tracker-data';

/**
 * Load all persisted data from localStorage.
 * Returns null if nothing stored.
 */
export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Basic schema validation to prevent corrupted data from crashing the app
    if (!data || typeof data !== 'object') return null;
    if (data.subjects && typeof data.subjects !== 'object') return null;
    if (data.dailyLog && typeof data.dailyLog !== 'object') return null;
    return data;
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
 * Calculates the streak (consecutive days with at least 25 minutes of study).
 * dailyLog is an object like { "2026-03-10": 120, "2026-03-09": 3600, ... }
 */
export function calculateStreak(dailyLog, userTimezone = 'auto') {
  if (!dailyLog || Object.keys(dailyLog).length === 0) return 0;

  const offsetMinutes = parseTimezoneOffset(userTimezone);
  const getLocKey = (d) => dateToLocalKey(d, offsetMinutes);

  let streak = 0;
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
