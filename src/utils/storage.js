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
export function calculateStreak(dailyLog) {
  if (!dailyLog || Object.keys(dailyLog).length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let checkDate = new Date(today);

  // Check today first
  const todayKey = checkDate.toISOString().slice(0, 10);
  const todaySeconds = dailyLog[todayKey] || 0;

  // If no study today yet, start checking from yesterday
  if (todaySeconds < 60) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count consecutive days
  while (true) {
    const key = checkDate.toISOString().slice(0, 10);
    const seconds = dailyLog[key] || 0;
    if (seconds >= 60) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
