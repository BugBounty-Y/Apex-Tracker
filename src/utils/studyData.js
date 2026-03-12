// ==========================================
// STUDY DATA HELPERS
// ==========================================

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
