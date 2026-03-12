import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const helperMocks = vi.hoisted(() => ({
  playNotificationSound: vi.fn(),
}));

vi.mock('../utils/helpers', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ...helperMocks,
  };
});

import { useTimer } from './useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    helperMocks.playNotificationSound.mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('records a completed focus session and advances to the break phase', () => {
    const onTickFocus = vi.fn();
    const onSessionComplete = vi.fn();

    const { result } = renderHook(() => useTimer({
      activeSubject: 'Math',
      onTickFocus,
      onSessionComplete,
      pomodoroSettings: {
        focusMinutes: 1 / 60,
        shortBreakMinutes: 1 / 60,
        longBreakMinutes: 1 / 60,
        sessionsBeforeLongBreak: 4,
      },
    }));

    act(() => {
      result.current.startTimer();
    });

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(onTickFocus).toHaveBeenCalledWith(1);
    expect(onSessionComplete).toHaveBeenCalledTimes(1);
    expect(result.current.timerComplete).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    expect(result.current.timerMode).toBe('shortBreak');
    expect(result.current.completedSessions).toBe(1);
  });

  it('does not count a skipped focus phase as a completed session', () => {
    const { result } = renderHook(() => useTimer({
      activeSubject: 'Physics',
      onTickFocus: vi.fn(),
      onSessionComplete: vi.fn(),
      pomodoroSettings: {
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        sessionsBeforeLongBreak: 4,
      },
    }));

    act(() => {
      result.current.skipToNextPhase();
    });

    expect(result.current.timerMode).toBe('shortBreak');
    expect(result.current.completedSessions).toBe(0);
  });

  it('starts the next phase immediately when the user resumes before auto-advance finishes', () => {
    const { result } = renderHook(() => useTimer({
      activeSubject: 'Math',
      onTickFocus: vi.fn(),
      onSessionComplete: vi.fn(),
      pomodoroSettings: {
        focusMinutes: 1 / 60,
        shortBreakMinutes: 1 / 60,
        longBreakMinutes: 1 / 60,
        sessionsBeforeLongBreak: 4,
      },
    }));

    act(() => {
      result.current.startTimer();
    });

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    act(() => {
      result.current.startTimer();
    });

    expect(result.current.timerMode).toBe('shortBreak');
    expect(result.current.isRunning).toBe(true);
    expect(result.current.timeLeft).toBe(1);
    expect(result.current.timerComplete).toBe(false);
  });

  it('keeps custom focus sessions in focus mode when skipping', () => {
    const { result } = renderHook(() => useTimer({
      activeSubject: 'Physics',
      onTickFocus: vi.fn(),
      onSessionComplete: vi.fn(),
      pomodoroSettings: {
        focusMinutes: 45,
      },
      variant: 'focusOnly',
    }));

    act(() => {
      result.current.skipToNextPhase();
    });

    expect(result.current.timerMode).toBe('focus');
    expect(result.current.completedSessions).toBe(0);
  });
});
