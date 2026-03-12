import { DEFAULT_TIMEZONE, normalizeTimeZoneSelection } from './helpers';

export const DEFAULT_NOTIFICATION_SETTINGS = {
  soundEnabled: true,
  sessionEndNotification: true,
  breakEndNotification: true,
  reminderEnabled: false,
  reminderHour: 18,
};

export const DEFAULT_GOALS = {
  dailyHours: 3,
  weeklyHours: 20,
  monthlyHours: 80,
};

export const DEFAULT_POMODORO_SETTINGS = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  customFocusMinutes: 45,
  autoStartBreaks: false,
};

export const DEFAULT_USER_PROFILE = {
  name: '',
  examDate: '',
  timezone: DEFAULT_TIMEZONE,
  hasCompletedOnboarding: false,
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
  goals: DEFAULT_GOALS,
  badges: [],
};

export const DEFAULT_APP_DATA = {
  subjects: {},
  dailyLog: {},
  dailyGoal: DEFAULT_GOALS.dailyHours,
  studySessions: [],
  userProfile: DEFAULT_USER_PROFILE,
  pomodoroSettings: DEFAULT_POMODORO_SETTINGS,
};

function asPositiveInteger(value, fallbackValue, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) {
  const normalizedValue = Number.parseInt(value, 10);
  if (!Number.isFinite(normalizedValue)) return fallbackValue;
  return Math.min(maximum, Math.max(minimum, normalizedValue));
}

function ensureObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeDailyLog(dailyLog) {
  return Object.fromEntries(
    Object.entries(ensureObject(dailyLog))
      .filter(([dateKey]) => typeof dateKey === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateKey))
      .map(([dateKey, seconds]) => [dateKey, asPositiveInteger(seconds, 0, 0)]),
  );
}

function createFallbackId(prefix) {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `${prefix}-${crypto.randomUUID()}`;
    }
  } catch {
    // Ignore crypto errors and fall back to timestamp-based IDs.
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function createId(prefix = 'item') {
  return createFallbackId(prefix);
}

export function normalizeTask(task) {
  const safeTask = ensureObject(task);

  return {
    id: safeTask.id || createId('task'),
    title: typeof safeTask.title === 'string' ? safeTask.title.trim() : '',
    done: Boolean(safeTask.done),
    estimatedMinutes: asPositiveInteger(safeTask.estimatedMinutes, 30, 0, 600),
  };
}

export function normalizeSubject(subjectName, subjectData) {
  const safeSubjectData = ensureObject(subjectData);
  const normalizedTasks = ensureArray(safeSubjectData.tasks)
    .map(normalizeTask)
    .filter((task) => task.title);

  return {
    goalHours: asPositiveInteger(safeSubjectData.goalHours, 50, 1, 2000),
    studiedSeconds: asPositiveInteger(safeSubjectData.studiedSeconds, 0, 0),
    sessions: asPositiveInteger(safeSubjectData.sessions, 0, 0),
    color: typeof safeSubjectData.color === 'string' ? safeSubjectData.color : 'bg-slate-50 text-slate-900',
    tasks: normalizedTasks,
    notes: typeof safeSubjectData.notes === 'string' ? safeSubjectData.notes : '',
    lastSessionAt: typeof safeSubjectData.lastSessionAt === 'string' ? safeSubjectData.lastSessionAt : '',
    lastTaskId: typeof safeSubjectData.lastTaskId === 'string' ? safeSubjectData.lastTaskId : '',
    name: subjectName,
  };
}

export function normalizeStudySession(sessionData) {
  const safeSessionData = ensureObject(sessionData);
  const sessionType = ['focus', 'break', 'stopwatch', 'custom'].includes(safeSessionData.type)
    ? safeSessionData.type
    : 'focus';

  return {
    id: safeSessionData.id || createId('session'),
    subject: typeof safeSessionData.subject === 'string' ? safeSessionData.subject : '',
    taskId: typeof safeSessionData.taskId === 'string' ? safeSessionData.taskId : '',
    taskTitle: typeof safeSessionData.taskTitle === 'string' ? safeSessionData.taskTitle : '',
    startedAt: typeof safeSessionData.startedAt === 'string' ? safeSessionData.startedAt : '',
    endedAt: typeof safeSessionData.endedAt === 'string' ? safeSessionData.endedAt : '',
    durationSeconds: asPositiveInteger(safeSessionData.durationSeconds, 0, 0),
    type: sessionType,
    completed: Boolean(safeSessionData.completed),
    mode: typeof safeSessionData.mode === 'string' ? safeSessionData.mode : 'pomodoro',
  };
}

export function normalizeUserProfile(profileData, fallbackName = '') {
  const safeProfileData = ensureObject(profileData);
  const safeGoals = ensureObject(safeProfileData.goals);
  const safeNotificationSettings = ensureObject(safeProfileData.notificationSettings);

  const dailyHours = asPositiveInteger(
    safeGoals.dailyHours ?? safeProfileData.dailyGoal,
    DEFAULT_GOALS.dailyHours,
    1,
    24,
  );

  return {
    ...DEFAULT_USER_PROFILE,
    ...safeProfileData,
    name: typeof safeProfileData.name === 'string' && safeProfileData.name.trim()
      ? safeProfileData.name.trim()
      : fallbackName,
    examDate: typeof safeProfileData.examDate === 'string' ? safeProfileData.examDate : '',
    timezone: normalizeTimeZoneSelection(safeProfileData.timezone),
    hasCompletedOnboarding: Boolean(safeProfileData.hasCompletedOnboarding),
    notificationSettings: {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...safeNotificationSettings,
      reminderHour: asPositiveInteger(
        safeNotificationSettings.reminderHour,
        DEFAULT_NOTIFICATION_SETTINGS.reminderHour,
        0,
        23,
      ),
    },
    goals: {
      ...DEFAULT_GOALS,
      ...safeGoals,
      dailyHours,
      weeklyHours: asPositiveInteger(safeGoals.weeklyHours, DEFAULT_GOALS.weeklyHours, 1, 200),
      monthlyHours: asPositiveInteger(safeGoals.monthlyHours, DEFAULT_GOALS.monthlyHours, 1, 800),
    },
    badges: ensureArray(safeProfileData.badges).filter((badge) => typeof badge === 'string'),
  };
}

export function normalizePomodoroSettings(settingsData) {
  const safeSettingsData = ensureObject(settingsData);

  return {
    ...DEFAULT_POMODORO_SETTINGS,
    ...safeSettingsData,
    focusMinutes: asPositiveInteger(safeSettingsData.focusMinutes, DEFAULT_POMODORO_SETTINGS.focusMinutes, 1, 180),
    shortBreakMinutes: asPositiveInteger(safeSettingsData.shortBreakMinutes, DEFAULT_POMODORO_SETTINGS.shortBreakMinutes, 1, 60),
    longBreakMinutes: asPositiveInteger(safeSettingsData.longBreakMinutes, DEFAULT_POMODORO_SETTINGS.longBreakMinutes, 1, 120),
    sessionsBeforeLongBreak: asPositiveInteger(safeSettingsData.sessionsBeforeLongBreak, DEFAULT_POMODORO_SETTINGS.sessionsBeforeLongBreak, 1, 12),
    customFocusMinutes: asPositiveInteger(safeSettingsData.customFocusMinutes, DEFAULT_POMODORO_SETTINGS.customFocusMinutes, 5, 240),
    autoStartBreaks: Boolean(safeSettingsData.autoStartBreaks),
  };
}

export function getValidSelection(subjects = {}, preferredSubject = null, preferredTaskId = '') {
  const subjectNames = Object.keys(ensureObject(subjects));
  const nextSubject = preferredSubject && subjects[preferredSubject]
    ? preferredSubject
    : subjectNames[0] || null;

  const subjectTasks = nextSubject ? ensureArray(subjects[nextSubject]?.tasks) : [];
  const nextTaskId = preferredTaskId && subjectTasks.some((task) => task.id === preferredTaskId)
    ? preferredTaskId
    : subjectTasks[0]?.id || '';

  return { subject: nextSubject, taskId: nextTaskId };
}

export function normalizeAppData(rawData = {}, fallbackName = '') {
  const safeData = ensureObject(rawData);
  const normalizedUserProfile = normalizeUserProfile(safeData.userProfile, fallbackName);
  const dailyGoal = asPositiveInteger(
    safeData.dailyGoal ?? normalizedUserProfile.goals.dailyHours,
    normalizedUserProfile.goals.dailyHours,
    1,
    24,
  );

  return {
    subjects: Object.fromEntries(
      Object.entries(ensureObject(safeData.subjects)).map(([subjectName, subjectData]) => [
        subjectName,
        normalizeSubject(subjectName, subjectData),
      ]),
    ),
    dailyLog: normalizeDailyLog(safeData.dailyLog),
    dailyGoal,
    studySessions: ensureArray(safeData.studySessions)
      .map(normalizeStudySession)
      .filter((session) => session.subject && session.startedAt),
    userProfile: {
      ...normalizedUserProfile,
      goals: {
        ...normalizedUserProfile.goals,
        dailyHours: dailyGoal,
      },
    },
    pomodoroSettings: normalizePomodoroSettings(safeData.pomodoroSettings),
  };
}

export function createEmptyAppData(fallbackName = '') {
  return normalizeAppData(DEFAULT_APP_DATA, fallbackName);
}
