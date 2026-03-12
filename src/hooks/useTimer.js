import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { playNotificationSound } from '../utils/helpers';
import { DEFAULT_NOTIFICATION_SETTINGS, DEFAULT_POMODORO_SETTINGS } from '../utils/appData';
import {
  getDurationForTimerMode,
  getNextTimerPhase,
  shouldAutoStartNextPhase,
} from '../utils/timerEngine';

export { DEFAULT_POMODORO_SETTINGS };

export function useTimer({
  activeSubject,
  onTickFocus,
  onSessionComplete,
  pomodoroSettings,
  notificationSettings,
  variant = 'pomodoro',
  restoredState = null,
}) {
  const settings = useMemo(() => ({
    ...DEFAULT_POMODORO_SETTINGS,
    ...pomodoroSettings,
  }), [pomodoroSettings]);
  const effectiveNotificationSettings = useMemo(() => ({
    ...DEFAULT_NOTIFICATION_SETTINGS,
    ...notificationSettings,
  }), [notificationSettings]);

  const [timerMode, setTimerMode] = useState('focus');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalTimerSeconds, setTotalTimerSeconds] = useState(settings.focusMinutes * 60);
  const [timeLeft, setTimeLeft] = useState(settings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);
  const [lastCompletedMode, setLastCompletedMode] = useState(null);

  const timerModeRef = useRef(timerMode);
  const activeSubjectRef = useRef(activeSubject);
  const onTickFocusRef = useRef(onTickFocus);
  const onSessionCompleteRef = useRef(onSessionComplete);
  const completedSessionsRef = useRef(completedSessions);
  const settingsRef = useRef(settings);
  const notificationSettingsRef = useRef(effectiveNotificationSettings);
  const timeLeftRef = useRef(timeLeft);
  const advanceTimeoutRef = useRef(null);
  const lastTickTimestampRef = useRef(null);
  const tickRemainderMsRef = useRef(0);
  const restoredStateKeyRef = useRef('');

  useEffect(() => {
    timerModeRef.current = timerMode;
    activeSubjectRef.current = activeSubject;
    onTickFocusRef.current = onTickFocus;
    onSessionCompleteRef.current = onSessionComplete;
    completedSessionsRef.current = completedSessions;
    settingsRef.current = settings;
    notificationSettingsRef.current = effectiveNotificationSettings;
    timeLeftRef.current = timeLeft;
  }, [
    activeSubject,
    completedSessions,
    effectiveNotificationSettings,
    onSessionComplete,
    onTickFocus,
    settings,
    timeLeft,
    timerMode,
  ]);

  const clearPendingAdvance = useCallback(() => {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  }, []);

  const resetTickTracking = useCallback(() => {
    lastTickTimestampRef.current = null;
    tickRemainderMsRef.current = 0;
  }, []);

  useEffect(() => () => {
    clearPendingAdvance();
  }, [clearPendingAdvance]);

  useEffect(() => {
    if (isRunning || isPaused || timerComplete) return;

    const newTime = getDurationForTimerMode(timerMode, settings);
    const timeoutId = window.setTimeout(() => {
      setTimeLeft(newTime);
      setTotalTimerSeconds(newTime);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [
    isPaused,
    isRunning,
    settings,
    timerComplete,
    timerMode,
  ]);

  const getDurationForMode = useCallback((mode) => getDurationForTimerMode(mode, settingsRef.current), []);

  const getNextMode = useCallback((currentMode, sessionsCompleted) => (
    getNextTimerPhase(currentMode, sessionsCompleted, settingsRef.current, variant)
  ), [variant]);

  const applyPhaseState = useCallback((nextMode, nextSessions, options = {}) => {
    const {
      keepCompletionBanner = false,
      autoStart = false,
    } = options;
    const nextDuration = getDurationForMode(nextMode);

    setTimerMode(nextMode);
    setCompletedSessions(nextSessions);
    setTimeLeft(nextDuration);
    setTotalTimerSeconds(nextDuration);
    setIsPaused(false);
    setIsRunning(autoStart);
    setTimerComplete(keepCompletionBanner);

    if (!keepCompletionBanner) {
      setLastCompletedMode(null);
    }
  }, [getDurationForMode]);

  const advanceToNextPhase = useCallback((currentMode, sessionsCompleted, options = {}) => {
    const { mode: nextMode, sessions: nextSessions } = getNextMode(currentMode, sessionsCompleted);
    applyPhaseState(nextMode, nextSessions, options);
  }, [applyPhaseState, getNextMode]);

  const restoreTimerState = useCallback((snapshot) => {
    if (!snapshot) return;

    clearPendingAdvance();
    resetTickTracking();

    const nextMode = ['focus', 'shortBreak', 'longBreak'].includes(snapshot.timerMode)
      ? snapshot.timerMode
      : 'focus';
    const fallbackDuration = getDurationForMode(nextMode);
    const nextTotalTimerSeconds = Math.max(
      1,
      Number.isFinite(snapshot.totalTimerSeconds) ? snapshot.totalTimerSeconds : fallbackDuration,
    );
    const requestedTimeLeft = Number.isFinite(snapshot.timeLeft)
      ? snapshot.timeLeft
      : fallbackDuration;
    const nextTimeLeft = Math.max(0, Math.min(requestedTimeLeft, nextTotalTimerSeconds));

    setTimerMode(nextMode);
    setCompletedSessions(Math.max(0, Number.parseInt(snapshot.completedSessions, 10) || 0));
    setTotalTimerSeconds(nextTotalTimerSeconds);
    setTimeLeft(nextTimeLeft);
    setIsRunning(Boolean(snapshot.isRunning) && nextTimeLeft > 0);
    setIsPaused(Boolean(snapshot.isPaused) && !snapshot.isRunning && nextTimeLeft > 0);
    setTimerComplete(Boolean(snapshot.timerComplete));
    setLastCompletedMode(snapshot.lastCompletedMode || null);
  }, [clearPendingAdvance, getDurationForMode, resetTickTracking]);

  const getTimerSnapshot = useCallback(() => ({
    timerMode,
    completedSessions,
    totalTimerSeconds,
    timeLeft,
    isRunning,
    isPaused,
    timerComplete,
    lastCompletedMode,
  }), [
    completedSessions,
    isPaused,
    isRunning,
    lastCompletedMode,
    timeLeft,
    timerComplete,
    timerMode,
    totalTimerSeconds,
  ]);

  useEffect(() => {
    const restorationKey = restoredState?.restorationKey;
    if (!restorationKey || restorationKey === restoredStateKeyRef.current) {
      return;
    }

    restoredStateKeyRef.current = restorationKey;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        restoreTimerState(restoredState);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [restoreTimerState, restoredState]);

  useEffect(() => {
    if (!isRunning || timeLeftRef.current <= 0) {
      resetTickTracking();
      return undefined;
    }

    lastTickTimestampRef.current = Date.now();

    const interval = window.setInterval(() => {
      const now = Date.now();
      const previousTickTimestamp = lastTickTimestampRef.current ?? now;
      const elapsedMs = Math.max(0, now - previousTickTimestamp) + tickRemainderMsRef.current;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);

      lastTickTimestampRef.current = now;
      tickRemainderMsRef.current = elapsedMs % 1000;

      if (elapsedSeconds <= 0) {
        return;
      }

      const currentMode = timerModeRef.current;
      const previousTimeLeft = timeLeftRef.current;
      const consumedSeconds = Math.min(previousTimeLeft, elapsedSeconds);
      const nextTimeLeft = Math.max(0, previousTimeLeft - elapsedSeconds);

      if (currentMode === 'focus' && activeSubjectRef.current && consumedSeconds > 0) {
        onTickFocusRef.current?.(consumedSeconds);
      }

      if (nextTimeLeft > 0) {
        setTimeLeft(nextTimeLeft);
        return;
      }

      setTimeLeft(0);
      setIsRunning(false);
      setIsPaused(false);
      setTimerComplete(true);
      setLastCompletedMode(currentMode);
      resetTickTracking();

      if (currentMode === 'focus' && activeSubjectRef.current) {
        onSessionCompleteRef.current?.();
      }

      const isBreakMode = currentMode === 'shortBreak' || currentMode === 'longBreak';
      const shouldPlaySound = notificationSettingsRef.current.soundEnabled;
      const shouldShowNotification = isBreakMode
        ? notificationSettingsRef.current.breakEndNotification
        : notificationSettingsRef.current.sessionEndNotification;

      if (shouldPlaySound) {
        playNotificationSound();
      }

      if (shouldShowNotification && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('⏰ انتهى الوقت!', {
          body: isBreakMode
            ? 'انتهت فترة الراحة، استعد للدراسة!'
            : `أحسنت! المشوار اكتمل في ${activeSubjectRef.current || 'هذه الجلسة'}`,
        });
      }

      const nextPhase = getNextMode(currentMode, completedSessionsRef.current);
      const autoStartNextPhase = shouldAutoStartNextPhase(
        currentMode,
        nextPhase.mode,
        settingsRef.current,
        variant,
      );

      clearPendingAdvance();
      advanceTimeoutRef.current = window.setTimeout(() => {
        advanceTimeoutRef.current = null;
        advanceToNextPhase(currentMode, completedSessionsRef.current, {
          keepCompletionBanner: !autoStartNextPhase,
          autoStart: autoStartNextPhase,
        });
      }, 1500);
    }, 250);

    return () => window.clearInterval(interval);
  }, [advanceToNextPhase, clearPendingAdvance, getNextMode, isRunning, resetTickTracking, variant]);

  const startTimer = useCallback(() => {
    if (!activeSubject) return;

    const shouldRequestNotificationPermission = notificationSettingsRef.current.sessionEndNotification
      || notificationSettingsRef.current.breakEndNotification;

    if (
      shouldRequestNotificationPermission
      && 'Notification' in window
      && Notification.permission === 'default'
    ) {
      Notification.requestPermission();
    }

    const hadPendingAdvance = Boolean(advanceTimeoutRef.current);
    clearPendingAdvance();
    resetTickTracking();

    if ((timerComplete || hadPendingAdvance) && timeLeft <= 0) {
      advanceToNextPhase(timerModeRef.current, completedSessionsRef.current, { autoStart: true });
      setLastCompletedMode(null);
      return;
    }

    setTimerComplete(false);
    setLastCompletedMode(null);
    setIsPaused(false);
    setIsRunning(true);
  }, [activeSubject, advanceToNextPhase, clearPendingAdvance, resetTickTracking, timeLeft, timerComplete]);

  const pauseTimer = useCallback(() => {
    clearPendingAdvance();
    resetTickTracking();
    setIsRunning(false);
    setIsPaused(true);
  }, [clearPendingAdvance, resetTickTracking]);

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [isRunning, pauseTimer, startTimer]);

  const resetTimer = useCallback(() => {
    clearPendingAdvance();
    resetTickTracking();
    setIsRunning(false);
    setIsPaused(false);
    setTimerComplete(false);
    setLastCompletedMode(null);

    const nextDuration = getDurationForMode(timerModeRef.current);
    setTimeLeft(nextDuration);
    setTotalTimerSeconds(nextDuration);
  }, [clearPendingAdvance, getDurationForMode, resetTickTracking]);

  const changeMode = useCallback((mode) => {
    clearPendingAdvance();
    resetTickTracking();
    setIsRunning(false);
    setIsPaused(false);
    setTimerMode(mode);
    setTimerComplete(false);
    setLastCompletedMode(null);

    const nextDuration = getDurationForMode(mode);
    setTimeLeft(nextDuration);
    setTotalTimerSeconds(nextDuration);
  }, [clearPendingAdvance, getDurationForMode, resetTickTracking]);

  const skipToNextPhase = useCallback(() => {
    clearPendingAdvance();
    resetTickTracking();
    setIsRunning(false);
    setIsPaused(false);
    setTimerComplete(false);
    setLastCompletedMode(null);

    const currentMode = timerModeRef.current;
    const currentSessions = completedSessionsRef.current;
    let nextMode;
    let nextSessions;

    if (variant === 'focusOnly') {
      nextMode = 'focus';
      nextSessions = currentSessions;
    } else if (currentMode === 'focus') {
      nextMode = 'shortBreak';
      nextSessions = currentSessions;
    } else {
      const nextPhase = getNextMode(currentMode, currentSessions);
      nextMode = nextPhase.mode;
      nextSessions = nextPhase.sessions;
    }

    applyPhaseState(nextMode, nextSessions);
  }, [applyPhaseState, clearPendingAdvance, getNextMode, resetTickTracking, variant]);

  const resetCycle = useCallback(() => {
    clearPendingAdvance();
    resetTickTracking();
    setIsRunning(false);
    setIsPaused(false);
    setTimerComplete(false);
    setLastCompletedMode(null);
    setTimerMode('focus');
    setCompletedSessions(0);

    const nextDuration = getDurationForMode('focus');
    setTimeLeft(nextDuration);
    setTotalTimerSeconds(nextDuration);
  }, [clearPendingAdvance, getDurationForMode, resetTickTracking]);

  const timerTheme = useMemo(() => {
    if (timerMode === 'shortBreak') return {
      stroke: 'stroke-emerald-400', glow: 'shadow-emerald-500/30',
      bg: 'bg-emerald-500', from: 'from-emerald-400', to: 'to-teal-600',
    };
    if (timerMode === 'longBreak') return {
      stroke: 'stroke-purple-400', glow: 'shadow-purple-500/30',
      bg: 'bg-purple-500', from: 'from-purple-400', to: 'to-indigo-600',
    };
    return {
      stroke: 'stroke-violet-500', glow: 'shadow-violet-500/30',
      bg: 'bg-violet-600', from: 'from-violet-400', to: 'to-indigo-600',
    };
  }, [timerMode]);

  const ringCircumference = 2 * Math.PI * 46;
  const safeTotalSeconds = totalTimerSeconds || 1;
  const ringProgress = ((safeTotalSeconds - timeLeft) / safeTotalSeconds) * 100;
  const ringOffset = ringCircumference - (ringProgress / 100) * ringCircumference;

  return {
    timerMode,
    timeLeft,
    isRunning,
    isPaused,
    timerComplete,
    lastCompletedMode,
    totalTimerSeconds,
    completedSessions,
    sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
    toggleTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    changeMode,
    skipToNextPhase,
    resetCycle,
    restoreTimerState,
    getTimerSnapshot,
    timerTheme,
    ringCircumference,
    ringOffset,
  };
}
