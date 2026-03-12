import { createEmptyAppData, normalizeAppData } from './appData';
import { rebuildDailyLogFromSessions, getStudySessionEndTimestamp } from './studyData';

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeTaskTitle(title) {
  return isNonEmptyString(title) ? title.trim().toLocaleLowerCase() : '';
}

function isAppDataEffectivelyEmpty(appData) {
  const normalizedData = normalizeAppData(appData);

  if (Object.keys(normalizedData.subjects).length > 0) return false;
  if (Object.keys(normalizedData.dailyLog).length > 0) return false;
  if (normalizedData.studySessions.length > 0) return false;
  if (isNonEmptyString(normalizedData.userProfile.name)) return false;
  if (isNonEmptyString(normalizedData.userProfile.examDate)) return false;

  return true;
}

function mergeNotes(currentNotes, incomingNotes) {
  if (!isNonEmptyString(currentNotes)) return incomingNotes || '';
  if (!isNonEmptyString(incomingNotes) || currentNotes.trim() === incomingNotes.trim()) return currentNotes;
  return `${currentNotes.trim()}\n\n${incomingNotes.trim()}`;
}

function findMatchingTaskIndex(tasks, candidateTask) {
  const candidateTitle = normalizeTaskTitle(candidateTask?.title);

  return tasks.findIndex((task) => (
    (task.id && candidateTask?.id && task.id === candidateTask.id)
    || (candidateTitle && normalizeTaskTitle(task.title) === candidateTitle)
  ));
}

function mergeSingleTask(currentTask, incomingTask, preferIncoming = false) {
  const preferredTask = preferIncoming ? incomingTask : currentTask;
  const fallbackTask = preferIncoming ? currentTask : incomingTask;

  return {
    ...fallbackTask,
    ...preferredTask,
    id: currentTask?.id || incomingTask?.id || fallbackTask?.id || preferredTask?.id || '',
    title: preferredTask?.title || fallbackTask?.title || '',
    done: Boolean(currentTask?.done || incomingTask?.done),
    estimatedMinutes: preferredTask?.estimatedMinutes || fallbackTask?.estimatedMinutes || 30,
  };
}

function mergeTasks(currentTasks = [], incomingTasks = [], preferIncoming = false) {
  const mergedTasks = [];

  currentTasks.forEach((task) => {
    mergedTasks.push(task);
  });

  incomingTasks.forEach((task) => {
    const existingIndex = findMatchingTaskIndex(mergedTasks, task);

    if (existingIndex === -1) {
      mergedTasks.push(task);
      return;
    }

    mergedTasks[existingIndex] = mergeSingleTask(mergedTasks[existingIndex], task, preferIncoming);
  });

  return mergedTasks;
}

function getStudySessionMergeKey(session) {
  if (isNonEmptyString(session?.id)) {
    return `id:${session.id}`;
  }

  return [
    session?.subject || '',
    session?.taskId || '',
    session?.startedAt || '',
    session?.endedAt || '',
    String(session?.durationSeconds || 0),
    session?.type || '',
    session?.mode || '',
  ].join('|');
}

function mergeStudySession(currentSession, incomingSession) {
  const currentEndTimestamp = getStudySessionEndTimestamp(currentSession);
  const incomingEndTimestamp = getStudySessionEndTimestamp(incomingSession);
  const preferIncoming = incomingEndTimestamp > currentEndTimestamp
    || (incomingSession?.completed && !currentSession?.completed)
    || ((incomingSession?.durationSeconds || 0) > (currentSession?.durationSeconds || 0));

  const preferredSession = preferIncoming ? incomingSession : currentSession;
  const fallbackSession = preferIncoming ? currentSession : incomingSession;

  return {
    ...fallbackSession,
    ...preferredSession,
    id: currentSession?.id || incomingSession?.id || '',
    subject: preferredSession?.subject || fallbackSession?.subject || '',
    taskId: preferredSession?.taskId || fallbackSession?.taskId || '',
    taskTitle: preferredSession?.taskTitle || fallbackSession?.taskTitle || '',
    startedAt: currentSession?.startedAt || incomingSession?.startedAt || '',
    endedAt: incomingSession?.endedAt || currentSession?.endedAt || '',
    durationSeconds: Math.max(currentSession?.durationSeconds || 0, incomingSession?.durationSeconds || 0),
    completed: Boolean(currentSession?.completed || incomingSession?.completed),
    type: preferredSession?.type || fallbackSession?.type || 'focus',
    mode: preferredSession?.mode || fallbackSession?.mode || 'pomodoro',
  };
}

function mergeStudySessions(currentSessions = [], incomingSessions = []) {
  const mergedSessions = new Map();

  [...currentSessions, ...incomingSessions].forEach((session) => {
    const key = getStudySessionMergeKey(session);
    const existingSession = mergedSessions.get(key);

    if (!existingSession) {
      mergedSessions.set(key, session);
      return;
    }

    mergedSessions.set(key, mergeStudySession(existingSession, session));
  });

  return Array.from(mergedSessions.values()).sort((left, right) => {
    const rightTimestamp = getStudySessionEndTimestamp(right);
    const leftTimestamp = getStudySessionEndTimestamp(left);

    if (Number.isFinite(rightTimestamp) && Number.isFinite(leftTimestamp)) {
      return rightTimestamp - leftTimestamp;
    }

    return (right?.startedAt || '').localeCompare(left?.startedAt || '');
  });
}

function buildSubjectMetrics(studySessions = []) {
  const metrics = {};

  studySessions.forEach((session) => {
    if (!isNonEmptyString(session?.subject)) return;

    const subjectName = session.subject;
    const bucket = metrics[subjectName] || {
      studiedSeconds: 0,
      sessions: 0,
      lastSessionAt: '',
      lastTaskId: '',
    };

    bucket.studiedSeconds += session.durationSeconds || 0;

    if (session.completed && session.type !== 'stopwatch') {
      bucket.sessions += 1;
    }

    const sessionEndTimestamp = getStudySessionEndTimestamp(session);
    if (Number.isFinite(sessionEndTimestamp)) {
      const sessionEndedAt = new Date(sessionEndTimestamp).toISOString();
      if (!bucket.lastSessionAt || sessionEndedAt > bucket.lastSessionAt) {
        bucket.lastSessionAt = sessionEndedAt;
        bucket.lastTaskId = session.taskId || bucket.lastTaskId;
      }
    }

    metrics[subjectName] = bucket;
  });

  return metrics;
}

function mergeDailyLog(currentDailyLog = {}, incomingDailyLog = {}) {
  const mergedEntries = {};

  [...Object.entries(currentDailyLog), ...Object.entries(incomingDailyLog)].forEach(([dateKey, seconds]) => {
    mergedEntries[dateKey] = Math.max(mergedEntries[dateKey] || 0, seconds || 0);
  });

  return mergedEntries;
}

function buildMergedUserProfile(currentProfile, incomingProfile, preferIncomingSettings) {
  const preferredProfile = preferIncomingSettings ? incomingProfile : currentProfile;
  const fallbackProfile = preferIncomingSettings ? currentProfile : incomingProfile;

  return {
    ...fallbackProfile,
    ...preferredProfile,
    goals: {
      ...fallbackProfile.goals,
      ...preferredProfile.goals,
    },
    notificationSettings: {
      ...fallbackProfile.notificationSettings,
      ...preferredProfile.notificationSettings,
    },
    badges: Array.from(new Set([
      ...(currentProfile.badges || []),
      ...(incomingProfile.badges || []),
    ])),
  };
}

export function mergeAppDataSnapshots(currentData, incomingData, options = {}) {
  const normalizedCurrentData = normalizeAppData(currentData);
  const normalizedIncomingData = normalizeAppData(incomingData);
  const preferIncomingSettings = options.preferIncomingSettings
    ?? isAppDataEffectivelyEmpty(normalizedCurrentData);

  const mergedStudySessions = mergeStudySessions(
    normalizedCurrentData.studySessions,
    normalizedIncomingData.studySessions,
  );

  const mergedUserProfile = buildMergedUserProfile(
    normalizedCurrentData.userProfile,
    normalizedIncomingData.userProfile,
    preferIncomingSettings,
  );

  const subjectMetrics = buildSubjectMetrics(mergedStudySessions);
  const subjectsWithSessionData = new Set(Object.keys(subjectMetrics));
  const subjectNames = new Set([
    ...Object.keys(normalizedCurrentData.subjects),
    ...Object.keys(normalizedIncomingData.subjects),
    ...Object.keys(subjectMetrics),
  ]);

  const mergedSubjects = {};

  subjectNames.forEach((subjectName) => {
    const currentSubject = normalizedCurrentData.subjects[subjectName];
    const incomingSubject = normalizedIncomingData.subjects[subjectName];
    const preferredSubject = preferIncomingSettings ? incomingSubject : currentSubject;
    const fallbackSubject = preferIncomingSettings ? currentSubject : incomingSubject;
    const metrics = subjectMetrics[subjectName];
    const mergedTasks = mergeTasks(
      currentSubject?.tasks || [],
      incomingSubject?.tasks || [],
      preferIncomingSettings,
    );
    const availableTaskIds = new Set(mergedTasks.map((task) => task.id).filter(Boolean));
    const hasSessionData = subjectsWithSessionData.has(subjectName);
    const sessionDerivedStudiedSeconds = metrics?.studiedSeconds || 0;
    const sessionDerivedSessions = metrics?.sessions || 0;

    mergedSubjects[subjectName] = {
      ...(fallbackSubject || {}),
      ...(preferredSubject || {}),
      goalHours: preferredSubject?.goalHours || fallbackSubject?.goalHours || 50,
      color: preferredSubject?.color || fallbackSubject?.color || 'bg-slate-50 text-slate-900',
      tasks: mergedTasks,
      notes: mergeNotes(currentSubject?.notes || '', incomingSubject?.notes || ''),
      studiedSeconds: hasSessionData
        ? Math.max(
            currentSubject?.studiedSeconds || 0,
            incomingSubject?.studiedSeconds || 0,
            sessionDerivedStudiedSeconds,
          )
        : Math.max(currentSubject?.studiedSeconds || 0, incomingSubject?.studiedSeconds || 0),
      sessions: hasSessionData
        ? Math.max(
            currentSubject?.sessions || 0,
            incomingSubject?.sessions || 0,
            sessionDerivedSessions,
          )
        : Math.max(currentSubject?.sessions || 0, incomingSubject?.sessions || 0),
      lastSessionAt: metrics?.lastSessionAt
        || incomingSubject?.lastSessionAt
        || currentSubject?.lastSessionAt
        || '',
      lastTaskId: availableTaskIds.has(metrics?.lastTaskId)
        ? metrics.lastTaskId
        : availableTaskIds.has(preferredSubject?.lastTaskId)
          ? preferredSubject.lastTaskId
          : availableTaskIds.has(fallbackSubject?.lastTaskId)
            ? fallbackSubject.lastTaskId
            : '',
      name: subjectName,
    };
  });

  const fallbackDailyLog = mergeDailyLog(
    normalizedCurrentData.dailyLog,
    normalizedIncomingData.dailyLog,
  );
  const rebuiltDailyLog = rebuildDailyLogFromSessions(mergedStudySessions, mergedUserProfile.timezone);

  const preferredPomodoroSettings = preferIncomingSettings
    ? normalizedIncomingData.pomodoroSettings
    : normalizedCurrentData.pomodoroSettings;
  const fallbackPomodoroSettings = preferIncomingSettings
    ? normalizedCurrentData.pomodoroSettings
    : normalizedIncomingData.pomodoroSettings;

  return normalizeAppData({
    ...createEmptyAppData(),
    ...normalizedCurrentData,
    ...normalizedIncomingData,
    subjects: mergedSubjects,
    dailyLog: mergeDailyLog(fallbackDailyLog, rebuiltDailyLog),
    studySessions: mergedStudySessions,
    userProfile: mergedUserProfile,
    dailyGoal: preferIncomingSettings
      ? normalizedIncomingData.dailyGoal || normalizedCurrentData.dailyGoal
      : normalizedCurrentData.dailyGoal || normalizedIncomingData.dailyGoal,
    pomodoroSettings: {
      ...fallbackPomodoroSettings,
      ...preferredPomodoroSettings,
    },
  });
}
