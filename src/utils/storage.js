// ==========================================
// DATA PERSISTENCE LAYER
// localStorage (local cache) + Firestore (cloud)
// ==========================================
import { parseTimezoneOffset, dateToLocalKey } from './helpers';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const STORAGE_KEY = 'apex-tracker-data';

// ==========================================
// LOCAL CACHE (localStorage)
// ==========================================

/**
 * Load all persisted data from localStorage.
 * Returns null if nothing stored.
 */
export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    if (data.subjects && typeof data.subjects !== 'object') return null;
    if (data.dailyLog && typeof data.dailyLog !== 'object') return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Save application state to localStorage (local cache).
 */
export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

// ==========================================
// FIRESTORE (cloud persistence)
// ==========================================

/**
 * Load user data from Firestore.
 * Returns null if no document exists or on error.
 */
export async function loadUserData(uid) {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    // Validate basic structure
    if (!data || typeof data !== 'object') return null;
    return data;
  } catch (err) {
    console.warn('Firestore load failed, falling back to local cache:', err.message);
    return null;
  }
}

/**
 * Save user data to Firestore.
 * Overwrites the document to ensure it acts as a perfect mirror of the local state.
 */
export async function saveUserData(uid, data) {
  if (!uid || !data) return;
  try {
    await setDoc(doc(db, 'users', uid), {
      subjects: data.subjects || {},
      dailyLog: data.dailyLog || {},
      dailyGoal: data.dailyGoal || 3,
      userProfile: data.userProfile || {},
      pomodoroSettings: data.pomodoroSettings || {},
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore save failed:', err.message);
  }
}

/**
 * Delete user data document from Firestore.
 */
export async function clearUserData(uid) {
  if (!uid) return;
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (err) {
    console.warn('Firestore delete failed:', err.message);
  }
}

/**
 * Load user data from Firestore and enforce it onto localStorage.
 * Firestore is the primary source of truth.
 * Returns the data from Firestore, or null if no data exists.
 */
export async function loadOrMigrateUserData(uid) {
  if (!uid) return null;

  // 1. Try loading from Firestore first
  const firestoreData = await loadUserData(uid);
  if (firestoreData) {
    // Cloud data exists — force it onto local cache
    saveData(firestoreData);
    return firestoreData;
  }

  // 2. Firestore is empty — new user (do NOT migrate from localStorage)
  // Clear any old local data so we don't accidentally load it later
  localStorage.removeItem(STORAGE_KEY);
  return null;
}

// ==========================================
// STREAK CALCULATION (pure function)
// ==========================================

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
