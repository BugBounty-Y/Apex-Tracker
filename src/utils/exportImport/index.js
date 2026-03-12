import { createEmptyAppData, normalizeAppData } from '../appData';

export function buildExportPayload(data) {
  const normalizedData = normalizeAppData(data);

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    app: 'Apex Tracker',
    data: normalizedData,
  };
}

export function exportDataAsJson(data) {
  return JSON.stringify(buildExportPayload(data), null, 2);
}

export function parseImportedJson(rawJson, fallbackName = '') {
  const parsedValue = JSON.parse(rawJson);
  const rawData = parsedValue?.data ?? parsedValue;

  return normalizeAppData(rawData, fallbackName);
}

export function mergeImportedData(currentData, importedData) {
  const normalizedCurrentData = normalizeAppData(currentData);
  const normalizedImportedData = normalizeAppData(importedData);

  const mergedSubjects = {
    ...normalizedCurrentData.subjects,
    ...normalizedImportedData.subjects,
  };

  const mergedDailyLog = {
    ...normalizedCurrentData.dailyLog,
    ...normalizedImportedData.dailyLog,
  };

  const existingSessionIds = new Set(normalizedCurrentData.studySessions.map((session) => session.id));
  const mergedStudySessions = [
    ...normalizedCurrentData.studySessions,
    ...normalizedImportedData.studySessions.filter((session) => !existingSessionIds.has(session.id)),
  ].sort((left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime());

  return normalizeAppData({
    ...createEmptyAppData(),
    ...normalizedCurrentData,
    ...normalizedImportedData,
    subjects: mergedSubjects,
    dailyLog: mergedDailyLog,
    studySessions: mergedStudySessions,
    userProfile: {
      ...normalizedCurrentData.userProfile,
      ...normalizedImportedData.userProfile,
      goals: {
        ...normalizedCurrentData.userProfile.goals,
        ...normalizedImportedData.userProfile.goals,
      },
      notificationSettings: {
        ...normalizedCurrentData.userProfile.notificationSettings,
        ...normalizedImportedData.userProfile.notificationSettings,
      },
      badges: Array.from(new Set([
        ...normalizedCurrentData.userProfile.badges,
        ...normalizedImportedData.userProfile.badges,
      ])),
    },
    dailyGoal: normalizedImportedData.dailyGoal || normalizedCurrentData.dailyGoal,
    pomodoroSettings: {
      ...normalizedCurrentData.pomodoroSettings,
      ...normalizedImportedData.pomodoroSettings,
    },
  });
}

export function downloadJsonFile(filename, content) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = downloadUrl;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(downloadUrl);
}
