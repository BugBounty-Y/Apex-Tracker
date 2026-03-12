import { DEFAULT_POMODORO_SETTINGS } from './appData';

function getNormalizedSettings(pomodoroSettings = {}) {
  return {
    ...DEFAULT_POMODORO_SETTINGS,
    ...pomodoroSettings,
  };
}

export function getDurationForTimerMode(mode, pomodoroSettings = {}) {
  const settings = getNormalizedSettings(pomodoroSettings);

  if (mode === 'shortBreak') return settings.shortBreakMinutes * 60;
  if (mode === 'longBreak') return settings.longBreakMinutes * 60;
  return settings.focusMinutes * 60;
}

export function getNextTimerPhase(currentMode, completedSessions, pomodoroSettings = {}, variant = 'pomodoro') {
  const settings = getNormalizedSettings(pomodoroSettings);

  if (variant === 'focusOnly') {
    return { mode: 'focus', sessions: completedSessions };
  }

  if (currentMode === 'focus') {
    const nextCompletedSessions = completedSessions + 1;

    if (nextCompletedSessions >= settings.sessionsBeforeLongBreak) {
      return { mode: 'longBreak', sessions: nextCompletedSessions };
    }

    return { mode: 'shortBreak', sessions: nextCompletedSessions };
  }

  if (currentMode === 'longBreak') {
    return { mode: 'focus', sessions: 0 };
  }

  return { mode: 'focus', sessions: completedSessions };
}

export function shouldAutoStartNextPhase(currentMode, nextMode, pomodoroSettings = {}, variant = 'pomodoro') {
  const settings = getNormalizedSettings(pomodoroSettings);

  if (variant === 'focusOnly') {
    return false;
  }

  return currentMode === 'focus' && nextMode !== 'focus' && Boolean(settings.autoStartBreaks);
}
