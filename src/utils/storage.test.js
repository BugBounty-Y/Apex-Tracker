import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const firestoreMocks = vi.hoisted(() => ({
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn((_db, collection, uid) => `${collection}/${uid}`),
  serverTimestamp: vi.fn(() => 'server-timestamp'),
}));

vi.mock('firebase/firestore', () => firestoreMocks);
vi.mock('../firebase', () => ({ db: {} }));

import { calculateStreak, loadOrMigrateUserData, saveData } from './storage';

describe('storage utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    firestoreMocks.getDoc.mockReset();
    firestoreMocks.setDoc.mockReset();
    firestoreMocks.deleteDoc.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the local cache when Firestore fails', async () => {
    saveData({
      subjects: {
        Math: { goalHours: 20, studiedSeconds: 3600, sessions: 3, color: 'bg-blue-50 text-blue-900' },
      },
      dailyLog: { '2026-03-12': 3600 },
      dailyGoal: 4,
      userProfile: { name: 'Apex', examDate: '2026-06-01', timezone: 'Africa/Cairo' },
      pomodoroSettings: { focusMinutes: 25 },
      updatedAt: 2000,
    }, 'user-1');

    firestoreMocks.getDoc.mockRejectedValue(new Error('offline'));

    const result = await loadOrMigrateUserData('user-1');
    const cachedSnapshot = JSON.parse(localStorage.getItem('apex-tracker-data:user-1'));

    expect(result.subjects.Math.studiedSeconds).toBe(3600);
    expect(cachedSnapshot.subjects.Math.studiedSeconds).toBe(3600);
  });

  it('merges local and cloud snapshots instead of discarding one side', async () => {
    saveData({
      subjects: {
        Local: { goalHours: 5, studiedSeconds: 900, sessions: 1, color: 'bg-green-50 text-green-900' },
      },
      dailyLog: {},
      dailyGoal: 3,
      userProfile: { name: 'Local', examDate: '2026-05-20', timezone: 'Africa/Cairo' },
      pomodoroSettings: {},
      updatedAt: 5000,
    }, 'user-1');

    firestoreMocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        subjects: {
          Cloud: { goalHours: 5, studiedSeconds: 1200, sessions: 2, color: 'bg-red-50 text-red-900' },
        },
        dailyLog: {},
        dailyGoal: 2,
        userProfile: { name: 'Cloud', examDate: '2026-05-20', timezone: 'Africa/Cairo' },
        pomodoroSettings: {},
        updatedAtMs: 3000,
      }),
    });

    const result = await loadOrMigrateUserData('user-1');

    expect(result.subjects.Local).toBeDefined();
    expect(result.subjects.Cloud).toBeDefined();
  });

  it('calculates streaks from civil date keys even across DST periods', () => {
    vi.setSystemTime(new Date('2026-03-09T14:00:00Z'));

    const dailyLog = {
      '2026-03-09': 1800,
      '2026-03-08': 1900,
      '2026-03-07': 2500,
    };

    expect(calculateStreak(dailyLog, 'America/New_York')).toBe(3);
  });
});
