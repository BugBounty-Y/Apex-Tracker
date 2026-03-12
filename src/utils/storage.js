// ==========================================
// DATA PERSISTENCE LAYER
// localStorage (local cache) + Firestore (cloud)
// ==========================================
import { deleteDoc, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getTodayKey, shiftDateKey } from './helpers';
import { normalizeAppData } from './appData';
import { db } from '../firebase';

const STORAGE_KEY_PREFIX = 'apex-tracker-data';
const LEGACY_STORAGE_KEY = STORAGE_KEY_PREFIX;

function getStorageKey(uid) {
  return uid ? `${STORAGE_KEY_PREFIX}:${uid}` : LEGACY_STORAGE_KEY;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function resolveUpdatedAtMs(value, fallbackValue) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (value && typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  return fallbackValue;
}

function normalizePersistedData(data, ownerUid = null, fallbackUpdatedAt = 0) {
  if (!isPlainObject(data)) return null;

  const normalizedAppData = normalizeAppData(data);

  return {
    ...normalizedAppData,
    ownerUid: ownerUid || data.ownerUid || null,
    updatedAt: resolveUpdatedAtMs(data.updatedAtMs ?? data.updatedAt, fallbackUpdatedAt),
  };
}

function loadStoredSnapshot(storageKey, uid) {
  const rawValue = localStorage.getItem(storageKey);
  if (!rawValue) return null;

  try {
    const parsedData = JSON.parse(rawValue);
    const normalizedData = normalizePersistedData(parsedData, uid, 0);

    if (!normalizedData) return null;
    if (uid && normalizedData.ownerUid && normalizedData.ownerUid !== uid) return null;

    return uid && !normalizedData.ownerUid
      ? { ...normalizedData, ownerUid: uid }
      : normalizedData;
  } catch {
    return null;
  }
}

export function createPersistedSnapshot(data = {}, ownerUid = null) {
  return normalizePersistedData(isPlainObject(data) ? data : {}, ownerUid, Date.now());
}

// ==========================================
// LOCAL CACHE (localStorage)
// ==========================================

/**
 * Load persisted data for the current user from localStorage.
 * Falls back to the legacy shared key for older installs.
 */
export function loadData(uid) {
  try {
    if (uid) {
      return loadStoredSnapshot(getStorageKey(uid), uid) || loadStoredSnapshot(LEGACY_STORAGE_KEY, uid);
    }

    return loadStoredSnapshot(LEGACY_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Save application state to localStorage (local cache).
 * Returns the normalized snapshot that was written.
 */
export function saveData(data, uid) {
  const snapshot = createPersistedSnapshot(data, uid);

  try {
    const storageKey = getStorageKey(snapshot.ownerUid || uid);
    localStorage.setItem(storageKey, JSON.stringify(snapshot));

    if (snapshot.ownerUid) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
    // Storage full or unavailable — fail silently
  }

  return snapshot;
}

export function clearLocalData(uid) {
  try {
    if (uid) {
      localStorage.removeItem(getStorageKey(uid));
    }

    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore storage errors while clearing local cache
  }
}

export function clearAllLocalData() {
  try {
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore storage errors while clearing local cache
  }
}

// ==========================================
// FIRESTORE (cloud persistence)
// ==========================================

/**
 * Load user data from Firestore.
 * Returns a status so callers can distinguish "missing document" from "network error".
 */
export async function loadUserData(uid) {
  if (!uid) return { status: 'missing', data: null };

  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) {
      return { status: 'missing', data: null };
    }

    const normalizedData = normalizePersistedData(snap.data(), uid, 0);
    return { status: 'success', data: normalizedData };
  } catch (err) {
    console.warn('Firestore load failed, falling back to local cache:', err.message);
    return { status: 'error', data: null };
  }
}

export function resolvePreferredUserData(localData, firestoreData) {
  if (localData && firestoreData) {
    return localData.updatedAt > firestoreData.updatedAt ? localData : firestoreData;
  }

  return firestoreData || localData || null;
}

/**
 * Save user data to Firestore.
 * Returns true on success so the caller can coordinate retries safely.
 */
export async function saveUserData(uid, data) {
  if (!uid || !data) return false;

  const snapshot = createPersistedSnapshot(data, uid);

  try {
    await setDoc(doc(db, 'users', uid), {
      subjects: snapshot.subjects,
      dailyLog: snapshot.dailyLog,
      dailyGoal: snapshot.dailyGoal,
      studySessions: snapshot.studySessions,
      userProfile: snapshot.userProfile,
      pomodoroSettings: snapshot.pomodoroSettings,
      ownerUid: uid,
      updatedAtMs: snapshot.updatedAt,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (err) {
    console.warn('Firestore save failed:', err.message);
    return false;
  }
}

/**
 * Delete user data document from Firestore.
 */
export async function clearUserData(uid) {
  if (!uid) return true;

  try {
    await deleteDoc(doc(db, 'users', uid));
    return true;
  } catch (err) {
    console.warn('Firestore delete failed:', err.message);
    return false;
  }
}

/**
 * Load user data from Firestore and merge it with the local cache using updatedAt.
 * The newest snapshot wins; Firestore failures never clear local data.
 */
export async function loadOrMigrateUserData(uid) {
  if (!uid) return null;

  const localData = loadData(uid);
  const firestoreResult = await loadUserData(uid);

  if (firestoreResult.status === 'success') {
    const resolvedData = resolvePreferredUserData(localData, firestoreResult.data);
    if (resolvedData) saveData(resolvedData, uid);
    return resolvedData;
  }

  if (firestoreResult.status === 'error') {
    if (localData) {
      saveData(localData, uid);
    }

    return localData;
  }

  if (localData) {
    saveData(localData, uid);
    return localData;
  }

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

  let streak = 0;
  let checkKey = getTodayKey(userTimezone);

  if ((dailyLog[checkKey] || 0) < 1500) {
    checkKey = shiftDateKey(checkKey, -1);
  }

  while (streak < 3650 && checkKey) {
    const seconds = dailyLog[checkKey] || 0;
    if (seconds < 1500) break;

    streak += 1;
    checkKey = shiftDateKey(checkKey, -1);
  }

  return streak;
}
