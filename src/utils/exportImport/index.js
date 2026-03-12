import { normalizeAppData } from '../appData';
import { mergeAppDataSnapshots } from '../dataMerge';

const APEX_BACKUP_APP_NAME = 'Apex Tracker';
const KNOWN_APP_DATA_KEYS = [
  'subjects',
  'dailyLog',
  'dailyGoal',
  'studySessions',
  'userProfile',
  'pomodoroSettings',
];

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasKnownAppDataKeys(value) {
  return isPlainObject(value) && KNOWN_APP_DATA_KEYS.some((key) => key in value);
}

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
  const isWrappedBackup = isPlainObject(parsedValue)
    && parsedValue.app === APEX_BACKUP_APP_NAME
    && Number.isFinite(Number(parsedValue.version))
    && isPlainObject(parsedValue.data);

  if (!isWrappedBackup && !hasKnownAppDataKeys(parsedValue)) {
    throw new Error('INVALID_BACKUP_FILE');
  }

  const rawData = isWrappedBackup ? parsedValue.data : parsedValue;

  return normalizeAppData(rawData, fallbackName);
}

export function mergeImportedData(currentData, importedData) {
  return mergeAppDataSnapshots(currentData, importedData, {
    preferIncomingSettings: false,
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
