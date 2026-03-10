import { useState, useEffect, useRef, useCallback } from 'react';
import { playNotificationSound } from '../utils/helpers';

/**
 * Custom hook for the Pomodoro timer engine.
 * 
 * Fixes from original:
 * - Removed `subjects` from useEffect deps (was causing infinite re-renders)
 * - Uses useRef to access latest subject data without re-creating intervals
 * - Properly handles timer completion with sound notification
 * - Prevents counting study time during break modes
 */
export function useTimer({ activeSubject, onTickFocus, onSessionComplete }) {
  const [timerMode, setTimerMode] = useState('focus');
  const [totalTimerSeconds, setTotalTimerSeconds] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);

  // Use refs to avoid stale closures in setInterval
  const timerModeRef = useRef(timerMode);
  const activeSubjectRef = useRef(activeSubject);
  const onTickFocusRef = useRef(onTickFocus);
  const onSessionCompleteRef = useRef(onSessionComplete);

  timerModeRef.current = timerMode;
  activeSubjectRef.current = activeSubject;
  onTickFocusRef.current = onTickFocus;
  onSessionCompleteRef.current = onSessionComplete;

  // Core timer engine — safe against tab throttling
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const endTime = Date.now() + timeLeft * 1000;
    let lastTickTime = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const nextTimeLeft = Math.round((endTime - now) / 1000);
      
      const elapsedSinceLastTick = Math.max(0, Math.round((now - lastTickTime) / 1000));
      lastTickTime = now;

      if (nextTimeLeft <= 0) {
        setTimeLeft(0);
        setIsRunning(false);
        setTimerComplete(true);
        playNotificationSound();

        if (timerModeRef.current === 'focus' && activeSubjectRef.current) {
          onTickFocusRef.current?.(elapsedSinceLastTick);
          onSessionCompleteRef.current?.();
        }

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⏰ انتهى الوقت!', {
            body: timerModeRef.current === 'focus'
              ? `أحسنت! المشوار اكتمل في ${activeSubjectRef.current || 'هذه الجلسة'}`
              : 'انتهت فترة الراحة، استعد للدراسة!',
          });
        }
      } else {
        setTimeLeft(nextTimeLeft);
        if (timerModeRef.current === 'focus' && activeSubjectRef.current) {
          onTickFocusRef.current?.(elapsedSinceLastTick);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]); // Removes timeLeft dependency to prevent loop drift

  const toggleTimer = useCallback(() => {
    if (!activeSubject) return;
    setTimerComplete(false);
    setIsRunning(prev => !prev);
  }, [activeSubject]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(totalTimerSeconds);
    setTimerComplete(false);
  }, [totalTimerSeconds]);

  const changeMode = useCallback((mode) => {
    setIsRunning(false);
    setTimerMode(mode);
    setTimerComplete(false);
    const newTime = mode === 'shortBreak' ? 5 * 60 : mode === 'longBreak' ? 15 * 60 : 25 * 60;
    setTimeLeft(newTime);
    setTotalTimerSeconds(newTime);
  }, []);

  // Timer theme based on mode
  const getTimerTheme = () => {
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
  };

  // Ring progress calculations
  const ringCircumference = 2 * Math.PI * 46;
  const safeTotalSeconds = totalTimerSeconds || 1; // prevent division by zero
  const ringProgress = ((safeTotalSeconds - timeLeft) / safeTotalSeconds) * 100;
  const ringOffset = ringCircumference - (ringProgress / 100) * ringCircumference;

  return {
    timerMode,
    timeLeft,
    isRunning,
    timerComplete,
    totalTimerSeconds,
    toggleTimer,
    resetTimer,
    changeMode,
    timerTheme: getTimerTheme(),
    ringCircumference,
    ringOffset,
  };
}
