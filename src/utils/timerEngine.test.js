import { describe, expect, it } from 'vitest';
import { getNextTimerPhase, shouldAutoStartNextPhase } from './timerEngine';

describe('timer engine helpers', () => {
  it('moves from focus to short break until the long-break threshold is reached', () => {
    expect(getNextTimerPhase('focus', 0, { sessionsBeforeLongBreak: 4 }, 'pomodoro')).toEqual({
      mode: 'shortBreak',
      sessions: 1,
    });

    expect(getNextTimerPhase('focus', 3, { sessionsBeforeLongBreak: 4 }, 'pomodoro')).toEqual({
      mode: 'longBreak',
      sessions: 4,
    });
  });

  it('auto-starts only focus-to-break transitions when enabled', () => {
    expect(shouldAutoStartNextPhase('focus', 'shortBreak', { autoStartBreaks: true }, 'pomodoro')).toBe(true);
    expect(shouldAutoStartNextPhase('focus', 'shortBreak', { autoStartBreaks: false }, 'pomodoro')).toBe(false);
    expect(shouldAutoStartNextPhase('shortBreak', 'focus', { autoStartBreaks: true }, 'pomodoro')).toBe(false);
    expect(shouldAutoStartNextPhase('focus', 'focus', { autoStartBreaks: true }, 'focusOnly')).toBe(false);
  });
});
