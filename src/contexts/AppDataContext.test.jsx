// @vitest-environment jsdom

import { useEffect } from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppDataProvider, useAppData } from './AppDataContext';

const timerMocks = vi.hoisted(() => ({
  startTimer: vi.fn(),
  pauseTimer: vi.fn(),
  resetTimer: vi.fn(),
  changeMode: vi.fn(),
  skipToNextPhase: vi.fn(),
  resetCycle: vi.fn(),
  restoreTimerState: vi.fn(),
  getTimerSnapshot: vi.fn(() => ({
    timerMode: 'focus',
    timeLeft: 1500,
    totalTimerSeconds: 1500,
    isRunning: false,
    isPaused: false,
    timerComplete: false,
    lastCompletedMode: null,
    completedSessions: 0,
  })),
}));

const loadOrMigrateUserDataMock = vi.fn();
const saveUserDataMock = vi.fn(async () => true);
const saveDataMock = vi.fn((data, uid) => ({
  ...data,
  ownerUid: uid,
  updatedAt: Date.now(),
}));

let authState = {
  user: { uid: 'user-1', displayName: 'Yahya' },
};

vi.mock('./AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('../components/ui/ToastProvider', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock('../utils/storage', () => ({
  calculateStreak: vi.fn(() => 0),
  clearLocalData: vi.fn(),
  clearUserData: vi.fn(async () => true),
  loadOrMigrateUserData: (...args) => loadOrMigrateUserDataMock(...args),
  saveData: (...args) => saveDataMock(...args),
  saveUserData: (...args) => saveUserDataMock(...args),
}));

vi.mock('../hooks/useTimer', () => ({
  DEFAULT_POMODORO_SETTINGS: {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    customFocusMinutes: 45,
    autoStartBreaks: false,
  },
  useTimer: () => ({
    timerMode: 'focus',
    timeLeft: 1500,
    isRunning: false,
    isPaused: false,
    timerComplete: false,
    lastCompletedMode: null,
    totalTimerSeconds: 1500,
    completedSessions: 0,
    sessionsBeforeLongBreak: 4,
    startTimer: timerMocks.startTimer,
    pauseTimer: timerMocks.pauseTimer,
    resetTimer: timerMocks.resetTimer,
    changeMode: timerMocks.changeMode,
    skipToNextPhase: timerMocks.skipToNextPhase,
    resetCycle: timerMocks.resetCycle,
    restoreTimerState: timerMocks.restoreTimerState,
    getTimerSnapshot: timerMocks.getTimerSnapshot,
    timerTheme: {
      stroke: 'stroke-cyan-400',
      glow: 'shadow-cyan-500/30',
      bg: 'bg-cyan-500',
      from: 'from-cyan-400',
      to: 'to-sky-600',
    },
    ringCircumference: 0,
    ringOffset: 0,
  }),
}));

vi.mock('../utils/telemetry', () => ({
  trackEvent: vi.fn(),
}));

function createDeferred() {
  let resolve;
  const promise = new Promise((resolver) => {
    resolve = resolver;
  });

  return { promise, resolve };
}

function StateProbe() {
  const { loading, appData } = useAppData();

  return (
    <div>
      <div>{loading ? 'loading' : 'ready'}</div>
      <div>{appData.userProfile.hasCompletedOnboarding ? 'onboarded' : 'needs-onboarding'}</div>
    </div>
  );
}

let capturedContext = null;

function ContextCapture() {
  const context = useAppData();

  useEffect(() => {
    capturedContext = context;
  }, [context]);

  return null;
}

describe('AppDataProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedContext = null;
    localStorage.clear();
    authState = {
      user: { uid: 'user-1', displayName: 'Yahya' },
    };
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('starts in loading state for authenticated users until data hydration finishes', async () => {
    const deferred = createDeferred();
    loadOrMigrateUserDataMock.mockReturnValueOnce(deferred.promise);

    render(
      <AppDataProvider>
        <StateProbe />
      </AppDataProvider>,
    );

    expect(screen.getByText('loading')).toBeTruthy();
    expect(screen.getByText('needs-onboarding')).toBeTruthy();

    deferred.resolve({
      subjects: {},
      dailyLog: {},
      studySessions: [],
      userProfile: {
        name: 'Yahya',
        examDate: '2026-06-20',
        timezone: 'Africa/Cairo',
        hasCompletedOnboarding: true,
      },
      pomodoroSettings: {},
    });

    await waitFor(() => {
      expect(screen.getAllByText('ready').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('onboarded')).toBeTruthy();
  });

  it('reselects a valid subject and resets transient timer state after removing the active subject', async () => {
    loadOrMigrateUserDataMock.mockResolvedValue({
      subjects: {
        Math: { goalHours: 10, studiedSeconds: 0, sessions: 0, color: 'bg-blue-50 text-blue-900', tasks: [] },
        Physics: { goalHours: 8, studiedSeconds: 0, sessions: 0, color: 'bg-red-50 text-red-900', tasks: [] },
      },
      dailyLog: {},
      studySessions: [],
      userProfile: {
        name: 'Yahya',
        examDate: '2026-06-20',
        timezone: 'Africa/Cairo',
        hasCompletedOnboarding: true,
      },
      pomodoroSettings: {},
    });

    render(
      <AppDataProvider>
        <StateProbe />
        <ContextCapture />
      </AppDataProvider>,
    );

    await waitFor(() => {
      expect(capturedContext?.activeSubject).toBe('Math');
    });

    act(() => {
      capturedContext.removeSubject('Math');
    });

    await waitFor(() => {
      expect(capturedContext?.activeSubject).toBe('Physics');
    });

    expect(timerMocks.resetCycle).toHaveBeenCalledTimes(1);
  });

  it('flushes the latest snapshot when waitForPendingSync is called', async () => {
    loadOrMigrateUserDataMock.mockResolvedValue({
      subjects: {},
      dailyLog: {},
      studySessions: [],
      userProfile: {
        name: 'Yahya',
        examDate: '2026-06-20',
        timezone: 'Africa/Cairo',
        hasCompletedOnboarding: true,
      },
      pomodoroSettings: {},
    });

    render(
      <AppDataProvider>
        <StateProbe />
        <ContextCapture />
      </AppDataProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('ready')).toBeTruthy();
    });

    saveUserDataMock.mockClear();

    await act(async () => {
      await capturedContext.waitForPendingSync();
    });

    expect(saveUserDataMock).toHaveBeenCalledTimes(1);
  });

  it('restores a paused stopwatch session from persisted local state', async () => {
    const fixedNow = 1_800_000_000_000;
    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(fixedNow);

    localStorage.setItem('apex-tracker-active-study:user-1', JSON.stringify({
      version: 1,
      persistedAt: fixedNow,
      activeSubject: 'Math',
      activeTaskId: '',
      timerPreset: 'stopwatch',
      sessionDraft: {
        id: 'session-1',
        subject: 'Math',
        taskId: '',
        taskTitle: '',
        startedAt: '2026-03-13T10:00:00.000Z',
        startedAtMs: fixedNow - 120000,
        durationSeconds: 120,
        mode: 'stopwatch',
        type: 'stopwatch',
      },
      stopwatch: {
        elapsedSeconds: 120,
        isRunning: false,
        isPaused: true,
      },
      focusTimer: null,
    }));

    loadOrMigrateUserDataMock.mockResolvedValue({
      subjects: {
        Math: { goalHours: 10, studiedSeconds: 120, sessions: 0, color: 'bg-blue-50 text-blue-900', tasks: [] },
      },
      dailyLog: { '2026-03-13': 120 },
      studySessions: [],
      userProfile: {
        name: 'Yahya',
        examDate: '2026-06-20',
        timezone: 'Africa/Cairo',
        hasCompletedOnboarding: true,
      },
      pomodoroSettings: {},
    });

    render(
      <AppDataProvider>
        <ContextCapture />
      </AppDataProvider>,
    );

    await waitFor(() => {
      expect(capturedContext?.timerPreset).toBe('stopwatch');
    });

    expect(capturedContext.activeSubject).toBe('Math');
    expect(capturedContext.timerState.displaySeconds).toBe(120);
    expect(capturedContext.timerState.isPaused).toBe(true);
    expect(capturedContext.timerState.isRunning).toBe(false);

    dateNowSpy.mockRestore();
  });

  it('rebuilds daily log buckets when the user changes timezone', async () => {
    loadOrMigrateUserDataMock.mockResolvedValue({
      subjects: {
        Math: { goalHours: 10, studiedSeconds: 5, sessions: 1, color: 'bg-blue-50 text-blue-900', tasks: [] },
      },
      dailyLog: {
        '2026-03-12': 2,
        '2026-03-13': 3,
      },
      studySessions: [
        {
          id: 'session-1',
          subject: 'Math',
          startedAt: '2026-03-12T14:59:58.000Z',
          endedAt: '2026-03-12T15:00:03.000Z',
          durationSeconds: 5,
          type: 'focus',
          completed: true,
          mode: 'pomodoro',
        },
      ],
      userProfile: {
        name: 'Yahya',
        examDate: '2026-06-20',
        timezone: 'Asia/Tokyo',
        hasCompletedOnboarding: true,
      },
      pomodoroSettings: {},
    });

    render(
      <AppDataProvider>
        <ContextCapture />
      </AppDataProvider>,
    );

    await waitFor(() => {
      expect(capturedContext?.appData.userProfile.timezone).toBe('Asia/Tokyo');
    });

    act(() => {
      capturedContext.updateProfile({ timezone: 'America/New_York' });
    });

    await waitFor(() => {
      expect(capturedContext?.appData.userProfile.timezone).toBe('America/New_York');
    });

    expect(capturedContext.appData.dailyLog).toEqual({
      '2026-03-12': 5,
    });
  });
});
