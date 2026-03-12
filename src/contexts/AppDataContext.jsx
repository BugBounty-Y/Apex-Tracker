import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import {
  createEmptyAppData,
  createId,
  getValidSelection,
  normalizeAppData,
} from '../utils/appData';
import {
  calculateStreak,
  clearLocalData,
  clearUserData,
  loadOrMigrateUserData,
  saveData,
  saveUserData,
} from '../utils/storage';
import { getHourInTimeZone, getTodayKey } from '../utils/helpers';
import { DEFAULT_POMODORO_SETTINGS, useTimer } from '../hooks/useTimer';
import { incrementDailyLogEntry, incrementSubjectSessions, incrementSubjectStudyTime } from '../utils/studyData';
import { downloadJsonFile, exportDataAsJson, mergeImportedData, parseImportedJson } from '../utils/exportImport';
import {
  getDashboardSummary,
  getHeatmapData,
  getMonthlyStats,
  getSubjectBreakdown,
  getWeeklyStats,
} from '../features/analytics/helpers';
import { colorStringForKey, COLOR_KEYS } from '../utils/constants';
import { trackEvent } from '../utils/telemetry';

const AppDataContext = createContext(null);
const REMINDER_STORAGE_KEY_PREFIX = 'apex-tracker-reminder';

function getReminderStorageKey(uid) {
  return `${REMINDER_STORAGE_KEY_PREFIX}:${uid || 'guest'}`;
}

function getRandomSubjectColor() {
  const randomColorKey = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
  return colorStringForKey(randomColorKey);
}

function normalizeDataForUser(data, user) {
  return normalizeAppData(data, user?.displayName || '');
}

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [appData, setAppData] = useState(() => createEmptyAppData());
  const [loading, setLoading] = useState(() => Boolean(user));
  const [syncStatus, setSyncStatus] = useState('saved');
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [activeSubject, setActiveSubjectState] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState('');
  const [timerPreset, setTimerPreset] = useState('pomodoro');
  const [stopwatchElapsed, setStopwatchElapsed] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchPaused, setStopwatchPaused] = useState(false);

  const sessionDraftRef = useRef(null);
  const latestDataRef = useRef(appData);
  const activeSubjectRef = useRef(activeSubject);
  const activeTaskIdRef = useRef(activeTaskId);
  const latestSnapshotRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const saveInFlightRef = useRef(false);
  const saveQueuedRef = useRef(false);
  const savePromiseRef = useRef(null);

  useEffect(() => {
    latestDataRef.current = appData;
  }, [appData]);

  useEffect(() => {
    activeSubjectRef.current = activeSubject;
    activeTaskIdRef.current = activeTaskId;
  }, [activeSubject, activeTaskId]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateData = useCallback((updater) => {
    setAppData((currentData) => {
      const nextData = typeof updater === 'function' ? updater(currentData) : updater;
      return normalizeDataForUser(nextData, user);
    });
  }, [user]);

  const commitDataSnapshot = useCallback((nextData, options = {}) => {
    const {
      preferredSubject = activeSubjectRef.current,
      preferredTaskId = activeTaskIdRef.current,
    } = options;
    const normalizedData = normalizeDataForUser(nextData, user);
    const nextSelection = getValidSelection(
      normalizedData.subjects,
      preferredSubject,
      preferredTaskId,
    );

    latestDataRef.current = normalizedData;
    setAppData(normalizedData);
    setActiveSubjectState(nextSelection.subject);
    setActiveTaskId(nextSelection.taskId);

    return normalizedData;
  }, [user]);

  useEffect(() => {
    if (!user) {
      const emptyData = createEmptyAppData();
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      latestDataRef.current = emptyData;
      latestSnapshotRef.current = null;
      saveInFlightRef.current = false;
      saveQueuedRef.current = false;
      savePromiseRef.current = null;
      setAppData(emptyData);
      setActiveSubjectState(null);
      setActiveTaskId('');
      setLoading(false);
      setSyncStatus('saved');
      setStopwatchElapsed(0);
      setStopwatchRunning(false);
      setStopwatchPaused(false);
      sessionDraftRef.current = null;
      return;
    }

    let cancelled = false;
    setLoading(true);

    loadOrMigrateUserData(user.uid).then((loadedData) => {
      if (cancelled) return;

      const normalizedData = normalizeDataForUser(loadedData || createEmptyAppData(user.displayName || ''), user);

      commitDataSnapshot(normalizedData, { preferredTaskId: '' });
      setLoading(false);
      setSyncStatus(navigator.onLine ? 'saved' : 'offline');
    });

    return () => {
      cancelled = true;
    };
  }, [commitDataSnapshot, user]);

  const currentSubject = activeSubject ? appData.subjects[activeSubject] : null;
  const currentTask = currentSubject?.tasks?.find((task) => task.id === activeTaskId) || null;
  const todayKey = getTodayKey(appData.userProfile.timezone);
  const todaySeconds = appData.dailyLog[todayKey] || 0;
  const streak = useMemo(
    () => calculateStreak(appData.dailyLog, appData.userProfile.timezone),
    [appData.dailyLog, appData.userProfile.timezone],
  );

  const beginTrackedSession = useCallback((mode) => {
    if (!activeSubject || sessionDraftRef.current) return;

    const task = latestDataRef.current.subjects[activeSubject]?.tasks?.find((item) => item.id === activeTaskId) || null;

    sessionDraftRef.current = {
      id: createId('session'),
      subject: activeSubject,
      taskId: task?.id || '',
      taskTitle: task?.title || '',
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      mode,
      type: mode === 'stopwatch' ? 'stopwatch' : mode === 'custom' ? 'custom' : 'focus',
    };
  }, [activeSubject, activeTaskId]);

  const finalizeTrackedSession = useCallback((completed) => {
    const sessionDraft = sessionDraftRef.current;
    sessionDraftRef.current = null;

    if (!sessionDraft || sessionDraft.durationSeconds <= 0) {
      return null;
    }

    const completedSession = {
      ...sessionDraft,
      endedAt: new Date().toISOString(),
      completed,
    };

    updateData((currentData) => {
      const nextSubjects = { ...currentData.subjects };
      const subjectToUpdate = nextSubjects[completedSession.subject];

      if (subjectToUpdate) {
        nextSubjects[completedSession.subject] = {
          ...subjectToUpdate,
          lastSessionAt: completedSession.endedAt,
          lastTaskId: completedSession.taskId || subjectToUpdate.lastTaskId || '',
        };
      }

      const nextBadges = new Set(currentData.userProfile.badges || []);
      if (currentData.studySessions.length === 0) nextBadges.add('First session');
      if (completed && streak >= 6) nextBadges.add('7-day streak');

      const totalCompletedHours = Object.values(nextSubjects)
        .reduce((total, subject) => total + ((subject.studiedSeconds || 0) / 3600), 0);
      if (totalCompletedHours >= 50) nextBadges.add('50 hours');

      return {
        ...currentData,
        subjects: nextSubjects,
        studySessions: [completedSession, ...currentData.studySessions].slice(0, 800),
        userProfile: {
          ...currentData.userProfile,
          badges: Array.from(nextBadges),
        },
      };
    });

    trackEvent('study_session_recorded', {
      subject: completedSession.subject,
      durationSeconds: completedSession.durationSeconds,
      completed: completedSession.completed,
      mode: completedSession.mode,
    });

    return completedSession;
  }, [streak, updateData]);

  const onTickFocus = useCallback((elapsed = 1) => {
    if (!elapsed || elapsed <= 0 || !activeSubject) return;

    const currentTodayKey = getTodayKey(latestDataRef.current.userProfile.timezone);

    updateData((currentData) => ({
      ...currentData,
      subjects: incrementSubjectStudyTime(currentData.subjects, activeSubject, elapsed),
      dailyLog: incrementDailyLogEntry(currentData.dailyLog, currentTodayKey, elapsed),
    }));

    if (sessionDraftRef.current) {
      sessionDraftRef.current.durationSeconds += elapsed;
    }
  }, [activeSubject, updateData]);

  const onSessionComplete = useCallback(() => {
    if (!activeSubject) return;

    updateData((currentData) => ({
      ...currentData,
      subjects: incrementSubjectSessions(currentData.subjects, activeSubject),
    }));

    const completedSession = finalizeTrackedSession(true);
    if (completedSession) {
      showToast({
        tone: 'success',
        title: 'تم حفظ الجلسة',
        description: `${completedSession.subject} · ${Math.round(completedSession.durationSeconds / 60)} دقيقة`,
      });
    }
  }, [activeSubject, finalizeTrackedSession, showToast, updateData]);

  const effectivePomodoroSettings = useMemo(() => (
    timerPreset === 'custom'
      ? {
          ...appData.pomodoroSettings,
          focusMinutes: appData.pomodoroSettings.customFocusMinutes || DEFAULT_POMODORO_SETTINGS.customFocusMinutes,
        }
      : appData.pomodoroSettings
  ), [appData.pomodoroSettings, timerPreset]);

  const focusTimer = useTimer({
    activeSubject,
    onTickFocus,
    onSessionComplete,
    pomodoroSettings: effectivePomodoroSettings,
    notificationSettings: appData.userProfile.notificationSettings,
    variant: timerPreset === 'custom' ? 'focusOnly' : 'pomodoro',
  });

  useEffect(() => {
    if (timerPreset !== 'stopwatch' || !stopwatchRunning) return undefined;

    let lastTickAt = Date.now();

    const interval = window.setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.max(0, Math.round((now - lastTickAt) / 1000));

      if (elapsedSeconds > 0) {
        setStopwatchElapsed((currentValue) => currentValue + elapsedSeconds);
        onTickFocus(elapsedSeconds);
        lastTickAt = now;
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [onTickFocus, stopwatchRunning, timerPreset]);

  const resetStopwatchState = useCallback(() => {
    setStopwatchElapsed(0);
    setStopwatchRunning(false);
    setStopwatchPaused(false);
  }, []);

  const resetTimerEngines = useCallback((options = {}) => {
    const { resetPreset = false } = options;

    focusTimer.resetCycle();
    resetStopwatchState();

    if (resetPreset) {
      setTimerPreset('pomodoro');
    }
  }, [focusTimer, resetStopwatchState]);

  const clearTransientStudyState = useCallback((options = {}) => {
    sessionDraftRef.current = null;
    resetTimerEngines(options);
  }, [resetTimerEngines]);

  useEffect(() => {
    const nextSelection = getValidSelection(appData.subjects, activeSubject, activeTaskId);
    const subjectChanged = nextSelection.subject !== activeSubject;
    const taskChanged = nextSelection.taskId !== activeTaskId;

    if (!subjectChanged && !taskChanged) {
      return;
    }

    if (subjectChanged && activeSubject && !appData.subjects[activeSubject]) {
      clearTransientStudyState();
    }

    if (subjectChanged) {
      setActiveSubjectState(nextSelection.subject);
    }

    if (taskChanged) {
      setActiveTaskId(nextSelection.taskId);
    }
  }, [activeSubject, activeTaskId, appData.subjects, clearTransientStudyState]);

  const hasTrackedSessionInProgress = Boolean(sessionDraftRef.current);

  const stopActiveStudySession = useCallback((completed = false) => {
    const savedSession = finalizeTrackedSession(completed);
    if (!completed && savedSession) {
      showToast({
        tone: 'info',
        title: 'تم حفظ جلسة غير مكتملة',
        description: `${savedSession.subject} · ${Math.round(savedSession.durationSeconds / 60)} دقيقة`,
      });
    }
  }, [finalizeTrackedSession, showToast]);

  const setActiveSubject = useCallback((subjectName) => {
    if (subjectName === activeSubject) return;

    if (hasTrackedSessionInProgress) {
      stopActiveStudySession(false);
      resetTimerEngines();
    }

    const nextSelection = getValidSelection(appData.subjects, subjectName, '');
    setActiveSubjectState(nextSelection.subject);
    setActiveTaskId(nextSelection.taskId);
  }, [
    activeSubject,
    appData.subjects,
    hasTrackedSessionInProgress,
    resetTimerEngines,
    stopActiveStudySession,
  ]);

  const startTimer = useCallback(() => {
    if (!activeSubject) {
      showToast({
        tone: 'warning',
        title: 'اختر مادة أولًا',
        description: 'لنبدأ من المادة التي تريد التركيز عليها الآن.',
      });
      return;
    }

    if (timerPreset === 'stopwatch') {
      beginTrackedSession('stopwatch');
      setStopwatchRunning(true);
      setStopwatchPaused(false);
      return;
    }

    const isStartingImmediatelyAfterCompletion = focusTimer.timeLeft <= 0 && !focusTimer.isRunning;
    const nextModeAfterCompletion = isStartingImmediatelyAfterCompletion
      ? (
          focusTimer.timerMode === 'focus'
            ? (
                timerPreset === 'custom'
                  ? 'focus'
                  : focusTimer.completedSessions + 1 >= focusTimer.sessionsBeforeLongBreak
                    ? 'longBreak'
                    : 'shortBreak'
              )
            : 'focus'
        )
      : focusTimer.timerMode;

    if (nextModeAfterCompletion === 'focus') {
      beginTrackedSession(timerPreset);
    }

    focusTimer.startTimer();
  }, [activeSubject, beginTrackedSession, focusTimer, showToast, timerPreset]);

  const pauseTimer = useCallback(() => {
    if (timerPreset === 'stopwatch') {
      setStopwatchRunning(false);
      setStopwatchPaused(true);
      return;
    }

    focusTimer.pauseTimer();
  }, [focusTimer, timerPreset]);

  const resetTimer = useCallback(() => {
    if (timerPreset === 'stopwatch') {
      stopActiveStudySession(false);
      resetStopwatchState();
      return;
    }

    if (focusTimer.timerMode === 'focus' && (focusTimer.isRunning || focusTimer.isPaused)) {
      stopActiveStudySession(false);
    }

    focusTimer.resetTimer();
  }, [focusTimer, resetStopwatchState, stopActiveStudySession, timerPreset]);

  const skipToNextPhase = useCallback(() => {
    if (timerPreset === 'stopwatch') {
      stopActiveStudySession(false);
      resetStopwatchState();
      return;
    }

    if (focusTimer.timerMode === 'focus' && (focusTimer.isRunning || focusTimer.isPaused)) {
      stopActiveStudySession(false);
    }

    focusTimer.skipToNextPhase();
  }, [focusTimer, resetStopwatchState, stopActiveStudySession, timerPreset]);

  const toggleTimer = useCallback(() => {
    if (timerPreset === 'stopwatch') {
      if (stopwatchRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
      return;
    }

    if (focusTimer.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [focusTimer.isRunning, pauseTimer, startTimer, stopwatchRunning, timerPreset]);

  const changeTimerPreset = useCallback((nextPreset) => {
    if (nextPreset === timerPreset) return;

    if (hasTrackedSessionInProgress) {
      stopActiveStudySession(false);
    }

    focusTimer.resetCycle();
    resetStopwatchState();
    setTimerPreset(nextPreset);
  }, [focusTimer, hasTrackedSessionInProgress, resetStopwatchState, stopActiveStudySession, timerPreset]);

  const timerState = useMemo(() => {
    if (timerPreset === 'stopwatch') {
      return {
        timerMode: 'focus',
        timeLeft: stopwatchElapsed,
        displaySeconds: stopwatchElapsed,
        isRunning: stopwatchRunning,
        isPaused: stopwatchPaused,
        timerComplete: false,
        lastCompletedMode: null,
        totalTimerSeconds: Math.max(stopwatchElapsed, 1),
        completedSessions: 0,
        sessionsBeforeLongBreak: appData.pomodoroSettings.sessionsBeforeLongBreak,
        toggleTimer,
        startTimer,
        pauseTimer,
        resetTimer,
        changeMode: () => {},
        skipToNextPhase,
        resetCycle: resetStopwatchState,
        timerTheme: {
          stroke: 'stroke-cyan-400',
          glow: 'shadow-cyan-500/30',
          bg: 'bg-cyan-500',
          from: 'from-cyan-400',
          to: 'to-sky-600',
        },
        ringCircumference: 2 * Math.PI * 46,
        ringOffset: 0,
        isCountUp: true,
      };
    }

    return {
      ...focusTimer,
      displaySeconds: focusTimer.timeLeft,
      isCountUp: false,
    };
  }, [
    appData.pomodoroSettings.sessionsBeforeLongBreak,
    focusTimer,
    pauseTimer,
    resetStopwatchState,
    resetTimer,
    skipToNextPhase,
    startTimer,
    stopwatchElapsed,
    stopwatchPaused,
    stopwatchRunning,
    timerPreset,
    toggleTimer,
  ]);

  const clearScheduledSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, []);

  const flushCloudSave = useCallback(async () => {
    clearScheduledSave();

    if (!user?.uid || window.isClearingData || !latestSnapshotRef.current) {
      return;
    }

    if (!isOnline) {
      setSyncStatus('offline');
      return;
    }

    if (saveInFlightRef.current) {
      saveQueuedRef.current = true;
      return;
    }

    saveInFlightRef.current = true;
    saveQueuedRef.current = false;
    setSyncStatus('syncing');

    const snapshot = latestSnapshotRef.current;
    const snapshotVersion = snapshot.updatedAt;

    let savePromise;

    savePromise = (async () => {
      try {
        const success = await saveUserData(user.uid, snapshot);
        setSyncStatus(success ? 'saved' : 'error');
      } finally {
        saveInFlightRef.current = false;

        if (savePromiseRef.current === savePromise) {
          savePromiseRef.current = null;
        }

        const hasNewerSnapshot = latestSnapshotRef.current
          && latestSnapshotRef.current.updatedAt > snapshotVersion;

        if (saveQueuedRef.current || hasNewerSnapshot) {
          saveQueuedRef.current = false;
          flushCloudSave();
        }
      }
    })();

    savePromiseRef.current = savePromise;
    await savePromise;
  }, [clearScheduledSave, isOnline, user?.uid]);

  const scheduleCloudSave = useCallback((delayMs, resetDelay = true) => {
    if (!user?.uid || window.isClearingData || !latestSnapshotRef.current) return;
    if (!isOnline) {
      setSyncStatus('offline');
      return;
    }

    if (saveInFlightRef.current) {
      saveQueuedRef.current = true;
      return;
    }

    if (saveTimeoutRef.current && !resetDelay) return;

    clearScheduledSave();
    setSyncStatus('syncing');

    saveTimeoutRef.current = window.setTimeout(() => {
      saveTimeoutRef.current = null;
      flushCloudSave();
    }, delayMs);
  }, [clearScheduledSave, flushCloudSave, isOnline, user?.uid]);

  useEffect(() => {
    if (!user?.uid || loading) return;

    latestSnapshotRef.current = saveData(appData, user.uid);

    if (!isOnline) {
      setSyncStatus('offline');
      return;
    }

    if (timerState.isRunning) {
      scheduleCloudSave(5000, false);
    } else {
      scheduleCloudSave(1500, true);
    }
  }, [appData, isOnline, loading, scheduleCloudSave, timerState.isRunning, user?.uid]);

  useEffect(() => () => clearScheduledSave(), [clearScheduledSave]);

  useEffect(() => {
    if (isOnline && user?.uid && latestSnapshotRef.current) {
      scheduleCloudSave(300, true);
    }
  }, [isOnline, scheduleCloudSave, user?.uid]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !window.isClearingData && user?.uid) {
        latestSnapshotRef.current = saveData(latestDataRef.current, user.uid);
        flushCloudSave();
      }
    };

    const handleBeforeUnload = () => {
      if (window.isClearingData || !user?.uid) return;
      latestSnapshotRef.current = saveData(latestDataRef.current, user.uid);
      flushCloudSave();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flushCloudSave, user?.uid]);

  useEffect(() => {
    if (!user?.uid) return undefined;

    const { reminderEnabled, reminderHour } = appData.userProfile.notificationSettings;
    if (!reminderEnabled) return undefined;

    const maybeSendReminder = () => {
      const currentTodayKey = getTodayKey(latestDataRef.current.userProfile.timezone);
      const studiedTodaySeconds = latestDataRef.current.dailyLog[currentTodayKey] || 0;
      if (studiedTodaySeconds > 0) return;

      const currentHour = getHourInTimeZone(new Date(), latestDataRef.current.userProfile.timezone);
      if (currentHour < reminderHour) return;

      const reminderStorageKey = getReminderStorageKey(user.uid);
      const lastReminderDate = localStorage.getItem(reminderStorageKey);
      if (lastReminderDate === currentTodayKey) return;

      localStorage.setItem(reminderStorageKey, currentTodayKey);
      showToast({
        tone: 'info',
        title: 'تذكير لطيف',
        description: 'لم تبدأ جلسة اليوم بعد. افتح المؤقت وخذ أول 25 دقيقة الآن.',
      });

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Apex Tracker', {
          body: 'لم تبدأ جلسة اليوم بعد. افتح المؤقت وخذ أول 25 دقيقة الآن.',
        });
      }

      trackEvent('study_reminder_sent', {
        reminderHour,
        timezone: latestDataRef.current.userProfile.timezone,
      });
    };

    maybeSendReminder();
    const interval = window.setInterval(maybeSendReminder, 60000);
    return () => window.clearInterval(interval);
  }, [
    appData.userProfile.notificationSettings,
    appData.userProfile.timezone,
    showToast,
    user?.uid,
  ]);

  const addSubject = useCallback((subjectName, goalHours = 50) => {
    const trimmedName = subjectName.trim();
    if (!trimmedName) return false;
    if (appData.subjects[trimmedName]) return false;

    updateData((currentData) => ({
      ...currentData,
      subjects: {
        ...currentData.subjects,
        [trimmedName]: {
          goalHours,
          studiedSeconds: 0,
          sessions: 0,
          color: getRandomSubjectColor(),
          tasks: [],
          notes: '',
          lastSessionAt: '',
          lastTaskId: '',
        },
      },
    }));

    setActiveSubjectState(trimmedName);
    setActiveTaskId('');
    trackEvent('subject_created', { subject: trimmedName });
    return true;
  }, [appData.subjects, updateData]);

  const updateSubject = useCallback((subjectName, changes) => {
    updateData((currentData) => ({
      ...currentData,
      subjects: {
        ...currentData.subjects,
        [subjectName]: {
          ...currentData.subjects[subjectName],
          ...changes,
        },
      },
    }));
  }, [updateData]);

  const removeSubject = useCallback((subjectName) => {
    if (activeSubject === subjectName || sessionDraftRef.current?.subject === subjectName) {
      clearTransientStudyState();
    }

    const nextSubjects = { ...latestDataRef.current.subjects };
    delete nextSubjects[subjectName];

    commitDataSnapshot({
      ...latestDataRef.current,
      subjects: nextSubjects,
      studySessions: latestDataRef.current.studySessions.filter((session) => session.subject !== subjectName),
    }, {
      preferredSubject: activeSubject === subjectName ? null : activeSubject,
      preferredTaskId: activeTaskId,
    });
  }, [activeSubject, activeTaskId, clearTransientStudyState, commitDataSnapshot]);

  const addTask = useCallback((subjectName, title, estimatedMinutes = 45) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const newTaskId = createId('task');

    updateData((currentData) => ({
      ...currentData,
      subjects: {
        ...currentData.subjects,
        [subjectName]: {
          ...currentData.subjects[subjectName],
          tasks: [
            ...currentData.subjects[subjectName].tasks,
            {
              id: newTaskId,
              title: trimmedTitle,
              done: false,
              estimatedMinutes,
            },
          ],
        },
      },
    }));

    if (subjectName === activeSubject && !activeTaskId) {
      setActiveTaskId(newTaskId);
    }
  }, [activeSubject, activeTaskId, updateData]);

  const updateTask = useCallback((subjectName, taskId, updater) => {
    updateData((currentData) => ({
      ...currentData,
      subjects: {
        ...currentData.subjects,
        [subjectName]: {
          ...currentData.subjects[subjectName],
          tasks: currentData.subjects[subjectName].tasks.map((task) => (
            task.id === taskId
              ? { ...task, ...(typeof updater === 'function' ? updater(task) : updater) }
              : task
          )),
        },
      },
    }));
  }, [updateData]);

  const toggleTask = useCallback((subjectName, taskId) => {
    updateTask(subjectName, taskId, (task) => ({ done: !task.done }));
  }, [updateTask]);

  const deleteTask = useCallback((subjectName, taskId) => {
    updateData((currentData) => ({
      ...currentData,
      subjects: {
        ...currentData.subjects,
        [subjectName]: {
          ...currentData.subjects[subjectName],
          tasks: currentData.subjects[subjectName].tasks.filter((task) => task.id !== taskId),
        },
      },
    }));

    if (activeTaskId === taskId) {
      setActiveTaskId('');
    }
  }, [activeTaskId, updateData]);

  const updateProfile = useCallback((profileChanges) => {
    updateData((currentData) => ({
      ...currentData,
      userProfile: {
        ...currentData.userProfile,
        ...profileChanges,
      },
    }));
  }, [updateData]);

  const updateGoals = useCallback((goalChanges) => {
    updateData((currentData) => ({
      ...currentData,
      dailyGoal: goalChanges.dailyHours ?? currentData.dailyGoal,
      userProfile: {
        ...currentData.userProfile,
        goals: {
          ...currentData.userProfile.goals,
          ...goalChanges,
        },
      },
    }));
  }, [updateData]);

  const updateNotificationSettings = useCallback((changes) => {
    updateData((currentData) => ({
      ...currentData,
      userProfile: {
        ...currentData.userProfile,
        notificationSettings: {
          ...currentData.userProfile.notificationSettings,
          ...changes,
        },
      },
    }));
  }, [updateData]);

  const updatePomodoroSettings = useCallback((changes) => {
    updateData((currentData) => ({
      ...currentData,
      pomodoroSettings: {
        ...currentData.pomodoroSettings,
        ...changes,
      },
    }));
  }, [updateData]);

  const completeOnboarding = useCallback((payload) => {
    updateData((currentData) => ({
      ...currentData,
      ...payload,
      dailyGoal: payload?.userProfile?.goals?.dailyHours || currentData.dailyGoal,
      userProfile: {
        ...currentData.userProfile,
        ...payload.userProfile,
        hasCompletedOnboarding: true,
      },
    }));
  }, [updateData]);

  const exportBackup = useCallback(() => {
    const filename = `apex-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJsonFile(filename, exportDataAsJson(latestDataRef.current));
    trackEvent('backup_exported', {
      subjects: Object.keys(latestDataRef.current.subjects).length,
      sessions: latestDataRef.current.studySessions.length,
    });
    showToast({
      tone: 'success',
      title: 'تم تصدير النسخة الاحتياطية',
      description: 'يمكنك حفظ الملف أو استيراده لاحقًا على أي جهاز.',
    });
  }, [showToast]);

  const importBackup = useCallback(async (file, mode = 'merge') => {
    try {
      const fileContent = await file.text();
      const importedData = parseImportedJson(fileContent, user?.displayName || '');
      const nextData = mode === 'replace'
        ? importedData
        : mergeImportedData(latestDataRef.current, importedData);

      clearTransientStudyState();
      commitDataSnapshot(nextData, {
        preferredSubject: mode === 'replace' ? null : activeSubject,
        preferredTaskId: mode === 'replace' ? '' : activeTaskId,
      });
      trackEvent('backup_imported', { mode });
      showToast({
        tone: 'success',
        title: 'تم استيراد البيانات',
        description: mode === 'replace' ? 'تم استبدال البيانات الحالية بالكامل.' : 'تم دمج النسخة الاحتياطية مع بياناتك الحالية.',
      });
    } catch {
      showToast({
        tone: 'danger',
        title: 'تعذر استيراد الملف',
        description: 'تأكد من أن الملف بصيغة JSON صحيحة وأنه صادر من Apex Tracker.',
      });
    }
  }, [activeSubject, activeTaskId, clearTransientStudyState, commitDataSnapshot, showToast, user]);

  const waitForPendingSync = useCallback(async () => {
    clearScheduledSave();

    if (!user?.uid || window.isClearingData) {
      return;
    }

    latestSnapshotRef.current = saveData(latestDataRef.current, user.uid);
    await flushCloudSave();

    let pendingPromise = savePromiseRef.current;

    while (pendingPromise) {
      try {
        await pendingPromise;
      } catch {
        // Ignore sync failures here; destructive flows handle their own errors.
      }

      pendingPromise = savePromiseRef.current;
    }
  }, [clearScheduledSave, flushCloudSave, user?.uid]);

  const resetAllData = useCallback(async () => {
    await waitForPendingSync();
    window.isClearingData = true;

    try {
      if (user?.uid) {
        const cloudCleared = await clearUserData(user.uid);
        if (!cloudCleared) {
          return {
            success: false,
            error: 'تعذر مسح البيانات السحابية الآن. لم نحذف أي شيء محليًا لحماية بياناتك.',
          };
        }
      }

      clearLocalData(user?.uid);

      const emptyData = createEmptyAppData(user?.displayName || '');
      clearTransientStudyState({ resetPreset: true });
      latestSnapshotRef.current = saveData(emptyData, user?.uid);
      commitDataSnapshot(emptyData, { preferredSubject: null, preferredTaskId: '' });
      setSyncStatus(isOnline ? 'saved' : 'offline');
      trackEvent('all_data_cleared');

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'تعذر مسح البيانات الآن. حاول مرة أخرى.',
      };
    } finally {
      window.isClearingData = false;
    }
  }, [clearTransientStudyState, commitDataSnapshot, isOnline, user, waitForPendingSync]);

  const dashboardSummary = useMemo(() => getDashboardSummary(appData), [appData]);
  const weeklyStats = useMemo(() => getWeeklyStats(appData), [appData]);
  const monthlyStats = useMemo(() => getMonthlyStats(appData), [appData]);
  const subjectBreakdown = useMemo(() => getSubjectBreakdown(appData.subjects), [appData.subjects]);
  const heatmapData = useMemo(
    () => getHeatmapData(appData.dailyLog, appData.userProfile.timezone),
    [appData.dailyLog, appData.userProfile.timezone],
  );

  const value = useMemo(() => ({
    appData,
    loading,
    syncStatus,
    isOnline,
    activeSubject,
    setActiveSubject,
    activeTaskId,
    setActiveTaskId,
    currentSubject,
    currentTask,
    todayKey,
    todaySeconds,
    streak,
    timerPreset,
    changeTimerPreset,
    timerState,
    addSubject,
    updateSubject,
    removeSubject,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    updateProfile,
    updateGoals,
    updateNotificationSettings,
    updatePomodoroSettings,
    completeOnboarding,
    exportBackup,
    importBackup,
    resetAllData,
    waitForPendingSync,
    dashboardSummary,
    weeklyStats,
    monthlyStats,
    subjectBreakdown,
    heatmapData,
  }), [
    activeSubject,
    activeTaskId,
    addSubject,
    addTask,
    appData,
    changeTimerPreset,
    completeOnboarding,
    currentSubject,
    currentTask,
    dashboardSummary,
    deleteTask,
    exportBackup,
    heatmapData,
    importBackup,
    isOnline,
    loading,
    monthlyStats,
    removeSubject,
    resetAllData,
    waitForPendingSync,
    setActiveSubject,
    streak,
    subjectBreakdown,
    syncStatus,
    timerPreset,
    timerState,
    todayKey,
    todaySeconds,
    toggleTask,
    updateGoals,
    updateNotificationSettings,
    updatePomodoroSettings,
    updateProfile,
    updateSubject,
    updateTask,
    weeklyStats,
  ]);

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within AppDataProvider');
  return context;
}
