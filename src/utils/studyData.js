// ==========================================
// STUDY DATA HELPERS
// ==========================================
import { getDateKeyInTimeZone } from './helpers';

export function incrementSubjectStudyTime(subjects, activeSubject, elapsedSeconds = 1) {
  if (!activeSubject || elapsedSeconds <= 0 || !subjects?.[activeSubject]) {
    return subjects;
  }

  return {
    ...subjects,
    [activeSubject]: {
      ...subjects[activeSubject],
      studiedSeconds: subjects[activeSubject].studiedSeconds + elapsedSeconds,
    },
  };
}

export function incrementDailyLogEntry(dailyLog, dateKey, elapsedSeconds = 1) {
  if (!dateKey || elapsedSeconds <= 0) {
    return dailyLog;
  }

  return {
    ...dailyLog,
    [dateKey]: (dailyLog?.[dateKey] || 0) + elapsedSeconds,
  };
}

function toTimestampMs(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  const parsedValue = new Date(value);
  return Number.isNaN(parsedValue.getTime()) ? NaN : parsedValue.getTime();
}

export function incrementDailyLogRange(
  dailyLog,
  rangeStart,
  elapsedSeconds = 1,
  userTimezone = 'auto',
) {
  const startTimestampMs = toTimestampMs(rangeStart);

  if (!Number.isFinite(startTimestampMs) || elapsedSeconds <= 0) {
    return dailyLog;
  }

  const nextDailyLog = { ...(dailyLog || {}) };

  // Map each tracked second to its civil day in the selected timezone.
  for (let secondIndex = 0; secondIndex < elapsedSeconds; secondIndex += 1) {
    const secondMidpoint = startTimestampMs + (secondIndex * 1000) + 500;
    const dateKey = getDateKeyInTimeZone(new Date(secondMidpoint), userTimezone);
    nextDailyLog[dateKey] = (nextDailyLog[dateKey] || 0) + 1;
  }

  return nextDailyLog;
}

export function incrementSubjectSessions(subjects, activeSubject) {
  if (!activeSubject || !subjects?.[activeSubject]) {
    return subjects;
  }

  return {
    ...subjects,
    [activeSubject]: {
      ...subjects[activeSubject],
      sessions: subjects[activeSubject].sessions + 1,
    },
  };
}
