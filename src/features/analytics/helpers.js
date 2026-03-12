import { getRemainingDays } from '../../utils/constants';
import { getTodayKey, shiftDateKey } from '../../utils/helpers';

function sum(values) {
  return values.reduce((acc, value) => acc + value, 0);
}

export function getRangeDailyLog(dailyLog, days = 7, userTimezone = 'auto') {
  const todayKey = getTodayKey(userTimezone);
  const entries = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const dateKey = shiftDateKey(todayKey, -index);
    entries.push({
      dateKey,
      seconds: dailyLog?.[dateKey] || 0,
    });
  }

  return entries;
}

export function getWeeklyStats({ dailyLog = {}, userProfile = {}, studySessions = [] }) {
  const last7Days = getRangeDailyLog(dailyLog, 7, userProfile?.timezone);
  const weeklySeconds = sum(last7Days.map((entry) => entry.seconds));
  const weeklyHours = weeklySeconds / 3600;
  const weeklyGoal = userProfile?.goals?.weeklyHours || 20;

  return {
    last7Days,
    weeklySeconds,
    weeklyHours,
    weeklyGoal,
    weeklyCompletion: weeklyGoal > 0 ? Math.min(100, (weeklyHours / weeklyGoal) * 100) : 0,
    averageSessionMinutes: studySessions.length
      ? Math.round(sum(studySessions.map((session) => session.durationSeconds)) / studySessions.length / 60)
      : 0,
  };
}

export function getMonthlyStats({ dailyLog = {}, userProfile = {}, studySessions = [] }) {
  const last30Days = getRangeDailyLog(dailyLog, 30, userProfile?.timezone);
  const monthlySeconds = sum(last30Days.map((entry) => entry.seconds));
  const monthlyHours = monthlySeconds / 3600;
  const monthlyGoal = userProfile?.goals?.monthlyHours || 80;

  return {
    last30Days,
    monthlySeconds,
    monthlyHours,
    monthlyGoal,
    monthlyCompletion: monthlyGoal > 0 ? Math.min(100, (monthlyHours / monthlyGoal) * 100) : 0,
    completedSessions: studySessions.filter((session) => session.completed).length,
  };
}

export function getSubjectBreakdown(subjects = {}) {
  return Object.entries(subjects)
    .map(([name, subject]) => ({
      name,
      studiedSeconds: subject.studiedSeconds || 0,
      goalHours: subject.goalHours || 0,
      sessions: subject.sessions || 0,
      tasksOpen: (subject.tasks || []).filter((task) => !task.done).length,
      lastSessionAt: subject.lastSessionAt || '',
    }))
    .sort((left, right) => right.studiedSeconds - left.studiedSeconds);
}

export function getHeatmapData(dailyLog = {}, userTimezone = 'auto', days = 35) {
  return getRangeDailyLog(dailyLog, days, userTimezone).map((entry) => ({
    ...entry,
    intensity: Math.min(4, Math.floor((entry.seconds / 1800) * 4)),
  }));
}

export function getDashboardSummary({ subjects = {}, dailyLog = {}, userProfile = {}, studySessions = [] }) {
  const subjectBreakdown = getSubjectBreakdown(subjects);
  const weeklyStats = getWeeklyStats({ dailyLog, userProfile, studySessions });
  const todayKey = getTodayKey(userProfile?.timezone);
  const todaySeconds = dailyLog?.[todayKey] || 0;
  const remainingDays = getRemainingDays(userProfile?.examDate, userProfile?.timezone);
  const openTasks = subjectBreakdown.reduce((total, subject) => total + subject.tasksOpen, 0);
  const totalGoalHours = subjectBreakdown.reduce((total, subject) => total + subject.goalHours, 0);
  const totalStudiedHours = subjectBreakdown.reduce((total, subject) => total + (subject.studiedSeconds / 3600), 0);
  const overallProgress = totalGoalHours > 0 ? Math.min(100, (totalStudiedHours / totalGoalHours) * 100) : 0;

  return {
    todayKey,
    todaySeconds,
    remainingDays,
    openTasks,
    overallProgress,
    weeklyStats,
    subjectBreakdown,
    recentSessions: [...studySessions]
      .sort((left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime())
      .slice(0, 5),
  };
}
