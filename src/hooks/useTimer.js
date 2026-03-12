import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { playNotificationSound } from '../utils/helpers';

/**
 * Default Pomodoro settings.
 * These are used when no custom settings are provided.
 */
export const DEFAULT_POMODORO_SETTINGS = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

/**
 * Custom hook for the Pomodoro timer engine.
 * 
 * Full Pomodoro cycle:
 * - Focus → Short Break → Focus → Short Break → Focus → Short Break → Focus → Long Break
 * - After a long break, the cycle resets
 * 
 * Supports:
 * - Pause / Resume with correct time tracking
 * - Auto-advance to next phase on completion
 * - Manual skip to next phase
 * - Configurable durations via pomodoroSettings
 */
export function useTimer({ activeSubject, onTickFocus, onSessionComplete, pomodoroSettings }) {
  // Merge custom settings with defaults
  const settings = useMemo(() => ({
    ...DEFAULT_POMODORO_SETTINGS,
    ...pomodoroSettings,
  }), [pomodoroSettings]);

  const [timerMode, setTimerMode] = useState('focus');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalTimerSeconds, setTotalTimerSeconds] = useState(settings.focusMinutes * 60);
  const [timeLeft, setTimeLeft] = useState(settings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Tracks if the timer was paused (vs never started)
  const [timerComplete, setTimerComplete] = useState(false);
  const [lastCompletedMode, setLastCompletedMode] = useState(null); // Tracks which mode just finished for the banner

  // Use refs to avoid stale closures in setInterval
  const timerModeRef = useRef(timerMode);
  const activeSubjectRef = useRef(activeSubject);
  const onTickFocusRef = useRef(onTickFocus);
  const onSessionCompleteRef = useRef(onSessionComplete);
  const completedSessionsRef = useRef(completedSessions);
  const settingsRef = useRef(settings);
  const advanceTimeoutRef = useRef(null); // For cleaning up the auto-advance setTimeout

  timerModeRef.current = timerMode;
  activeSubjectRef.current = activeSubject;
  onTickFocusRef.current = onTickFocus;
  onSessionCompleteRef.current = onSessionComplete;
  completedSessionsRef.current = completedSessions;
  settingsRef.current = settings;

  // Cleanup advance timeout on unmount
  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = null;
      }
    };
  }, []);

  // When settings change externally (e.g. user updates pomodoro settings), 
  // update timer duration only if timer is idle (not running, not paused, not complete)
  useEffect(() => {
    if (isRunning || isPaused || timerComplete) return;

    const newTime = timerMode === 'shortBreak'
      ? settings.shortBreakMinutes * 60
      : timerMode === 'longBreak'
        ? settings.longBreakMinutes * 60
        : settings.focusMinutes * 60;
    
    setTimeLeft(newTime);
    setTotalTimerSeconds(newTime);
  }, [settings.focusMinutes, settings.shortBreakMinutes, settings.longBreakMinutes, timerMode, isRunning, isPaused, timerComplete]);

  /**
   * Returns the duration in seconds for a given timer mode.
   */
  const getDurationForMode = useCallback((mode) => {
    const s = settingsRef.current;
    if (mode === 'shortBreak') return s.shortBreakMinutes * 60;
    if (mode === 'longBreak') return s.longBreakMinutes * 60;
    return s.focusMinutes * 60;
  }, []);

  /**
   * Determines the next mode after the current phase completes.
   * Focus → Short Break (or Long Break after N sessions)
   * Short Break / Long Break → Focus
   */
  const getNextMode = useCallback((currentMode, sessionsCompleted) => {
    if (currentMode === 'focus') {
      const newCompleted = sessionsCompleted + 1;
      if (newCompleted >= settingsRef.current.sessionsBeforeLongBreak) {
        return { mode: 'longBreak', sessions: newCompleted }; // Don't reset yet so UI shows full dots during break
      }
      return { mode: 'shortBreak', sessions: newCompleted };
    }
    // After long break finishes, reset the cycle back to 0
    if (currentMode === 'longBreak') {
      return { mode: 'focus', sessions: 0 };
    }
    // After short break, go back to focus
    return { mode: 'focus', sessions: sessionsCompleted };
  }, []);

  /**
   * Switches to the next Pomodoro phase after timer completion.
   * Timer is stopped and ready for user to press start.
   */
  const advanceToNextPhase = useCallback((currentMode, sessionsCompleted) => {
    const { mode: nextMode, sessions: nextSessions } = getNextMode(currentMode, sessionsCompleted);
    const newTime = getDurationForMode(nextMode);

    setTimerMode(nextMode);
    setCompletedSessions(nextSessions);
    setTimeLeft(newTime);
    setTotalTimerSeconds(newTime);
    setIsPaused(false);
    // Keep timerComplete true so the banner stays visible until user starts next phase
  }, [getNextMode, getDurationForMode]);

  // Core timer engine — safe against tab throttling
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const endTime = Date.now() + timeLeft * 1000;
    let lastTickTime = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const nextTimeLeft = Math.round((endTime - now) / 1000);
      
      // Calculate actual elapsed seconds since last tick (handles tab throttling)
      const rawElapsed = Math.max(0, Math.round((now - lastTickTime) / 1000));
      lastTickTime = now;

      if (nextTimeLeft <= 0) {
        // Timer completed
        // Calculate the actual remaining seconds that were consumed in this final tick
        const previousTimeLeft = Math.max(0, Math.round((endTime - (now - rawElapsed * 1000)) / 1000));
        const finalSeconds = Math.min(rawElapsed, previousTimeLeft);

        const currentMode = timerModeRef.current;

        setTimeLeft(0);
        setIsRunning(false);
        setIsPaused(false);
        setTimerComplete(true);
        setLastCompletedMode(currentMode);
        playNotificationSound();

        // Record study time and session completion for focus mode
        if (currentMode === 'focus' && activeSubjectRef.current) {
          if (finalSeconds > 0) onTickFocusRef.current?.(finalSeconds);
          onSessionCompleteRef.current?.();
        }

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const isBreakMode = currentMode === 'shortBreak' || currentMode === 'longBreak';
          new Notification('⏰ انتهى الوقت!', {
            body: isBreakMode
              ? 'انتهت فترة الراحة، استعد للدراسة!'
              : `أحسنت! المشوار اكتمل في ${activeSubjectRef.current || 'هذه الجلسة'}`,
          });
        }

        // Clear any previous advance timeout before setting a new one
        if (advanceTimeoutRef.current) {
          clearTimeout(advanceTimeoutRef.current);
        }

        // Auto-advance to the next phase after a short delay
        // so the user sees the completion banner briefly
        advanceTimeoutRef.current = setTimeout(() => {
          advanceTimeoutRef.current = null;
          advanceToNextPhase(currentMode, completedSessionsRef.current);
        }, 1500);
      } else {
        // Timer still running — update display and track focus time
        setTimeLeft(nextTimeLeft);
        if (timerModeRef.current === 'focus' && activeSubjectRef.current) {
          if (rawElapsed > 0) onTickFocusRef.current?.(rawElapsed);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, advanceToNextPhase]);

  /**
   * Start or resume the timer. When resuming from pause,
   * the timer continues from where it left off (timeLeft is preserved).
   */
  const startTimer = useCallback(() => {
    if (!activeSubject) return;
    
    // Request notification permission on first interaction
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cancel any pending auto-advance if user starts manually
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    
    setTimerComplete(false);
    setLastCompletedMode(null);
    setIsPaused(false);
    setIsRunning(true);
  }, [activeSubject]);

  /**
   * Pause the timer. Time is preserved for resume.
   * Only tracks time counted, not paused time.
   */
  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  /**
   * Toggle between start/resume and pause.
   */
  const toggleTimer = useCallback(() => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [isRunning, startTimer, pauseTimer]);

  /**
   * Reset the current phase to its full duration.
   */
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimerComplete(false);
    setLastCompletedMode(null);

    // Cancel any pending auto-advance
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }

    const newTime = getDurationForMode(timerModeRef.current);
    setTimeLeft(newTime);
    setTotalTimerSeconds(newTime);
  }, [getDurationForMode]);

  /**
   * Switch to a specific mode (focus, shortBreak, longBreak).
   * Resets the timer to the new mode's full duration.
   */
  const changeMode = useCallback((mode) => {
    setIsRunning(false);
    setIsPaused(false);
    setTimerMode(mode);
    setTimerComplete(false);
    setLastCompletedMode(null);

    // Cancel any pending auto-advance
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }

    const newTime = getDurationForMode(mode);
    setTimeLeft(newTime);
    setTotalTimerSeconds(newTime);
  }, [getDurationForMode]);

  /**
   * Manually skip to the next phase.
   * If skipping a focus session, it does NOT count as completed.
   * If skipping a break, just moves to the next focus session.
   */
  const skipToNextPhase = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimerComplete(false);
    setLastCompletedMode(null);

    // Cancel any pending auto-advance
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }

    const currentMode = timerModeRef.current;
    const currentSessions = completedSessionsRef.current;
    let nextMode;
    let nextSessions;

    if (currentMode === 'focus') {
      nextMode = 'shortBreak';
      nextSessions = currentSessions;
    } else {
      const nextPhase = getNextMode(currentMode, currentSessions);
      nextMode = nextPhase.mode;
      nextSessions = nextPhase.sessions;
    }

    const newTime = getDurationForMode(nextMode);

    setTimerMode(nextMode);
    setCompletedSessions(nextSessions);
    setTimeLeft(newTime);
    setTotalTimerSeconds(newTime);
  }, [getNextMode, getDurationForMode]);

  /**
   * Reset the entire Pomodoro cycle (sessions counter + go back to focus).
   */
  const resetCycle = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimerComplete(false);
    setLastCompletedMode(null);
    setTimerMode('focus');
    setCompletedSessions(0);

    // Cancel any pending auto-advance
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }

    const newTime = getDurationForMode('focus');
    setTimeLeft(newTime);
    setTotalTimerSeconds(newTime);
  }, [getDurationForMode]);

  // Timer theme based on mode (memoized to prevent unnecessary child re-renders)
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

  // Ring progress calculations
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
    timerTheme,
    ringCircumference,
    ringOffset,
  };
}
