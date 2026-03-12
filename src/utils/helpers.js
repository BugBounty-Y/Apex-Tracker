// ==========================================
// FORMATTING & DATE/TIME HELPERS
// ==========================================

export const DEFAULT_TIMEZONE = 'auto';

export const TIMEZONE_OPTIONS = [
  { value: 'auto', label: 'تلقائي (حسب جهازك)' },
  { value: 'Africa/Cairo', label: 'مصر - القاهرة' },
  { value: 'Asia/Riyadh', label: 'السعودية - الرياض' },
  { value: 'Asia/Dubai', label: 'الإمارات - دبي' },
  { value: 'Africa/Casablanca', label: 'المغرب - الدار البيضاء' },
  { value: 'Europe/Paris', label: 'أوروبا الوسطى - باريس' },
  { value: 'Europe/London', label: 'بريطانيا - لندن' },
  { value: 'America/New_York', label: 'شرق أمريكا - نيويورك' },
  { value: 'America/Los_Angeles', label: 'غرب أمريكا - لوس أنجلِس' },
  { value: 'Pacific/Honolulu', label: 'هاواي - هونولولو' },
  { value: 'Asia/Kolkata', label: 'الهند - مومباي' },
  { value: 'Asia/Shanghai', label: 'الصين - شنغهاي' },
  { value: 'Asia/Tokyo', label: 'اليابان - طوكيو' },
  { value: 'Australia/Sydney', label: 'أستراليا - سيدني' },
  { value: 'Pacific/Auckland', label: 'نيوزيلندا - أوكلاند' },
  { value: 'Etc/GMT+12', label: 'UTC-12 - Baker Island' },
];

const LEGACY_TIMEZONE_ALIASES = {
  'UTC-12': 'Etc/GMT+12',
  'UTC-8': 'America/Los_Angeles',
  'UTC-5': 'America/New_York',
  'UTC+0': 'Europe/London',
  'UTC+1': 'Europe/Paris',
  'UTC+2': 'Africa/Cairo',
  'UTC+3': 'Asia/Riyadh',
  'UTC+4': 'Asia/Dubai',
  'UTC+5:30': 'Asia/Kolkata',
  'UTC+8': 'Asia/Shanghai',
  'UTC+9': 'Asia/Tokyo',
  'UTC+11': 'Australia/Sydney',
};

const dateFormatterCache = new Map();
const offsetFormatterCache = new Map();
const hourFormatterCache = new Map();
const localeFormatterCache = new Map();

export function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export function formatHoursMins(sec) {
  if (!sec || sec <= 0) return '-';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return '-';
}

export function getBrowserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function isValidTimeZone(timeZone) {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimeZoneSelection(userTimezone = DEFAULT_TIMEZONE) {
  if (!userTimezone || userTimezone === DEFAULT_TIMEZONE) {
    return DEFAULT_TIMEZONE;
  }

  const mappedTimezone = LEGACY_TIMEZONE_ALIASES[userTimezone] || userTimezone;
  return isValidTimeZone(mappedTimezone) ? mappedTimezone : DEFAULT_TIMEZONE;
}

export function normalizeTimeZone(userTimezone = DEFAULT_TIMEZONE) {
  const normalizedSelection = normalizeTimeZoneSelection(userTimezone);
  return normalizedSelection === DEFAULT_TIMEZONE ? getBrowserTimeZone() : normalizedSelection;
}

function getDateFormatter(timeZone) {
  if (!dateFormatterCache.has(timeZone)) {
    dateFormatterCache.set(timeZone, new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }));
  }

  return dateFormatterCache.get(timeZone);
}

function getOffsetFormatter(timeZone) {
  if (!offsetFormatterCache.has(timeZone)) {
    offsetFormatterCache.set(timeZone, new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'shortOffset',
      hour12: false,
    }));
  }

  return offsetFormatterCache.get(timeZone);
}

function getHourFormatter(timeZone) {
  if (!hourFormatterCache.has(timeZone)) {
    hourFormatterCache.set(timeZone, new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      hour12: false,
    }));
  }

  return hourFormatterCache.get(timeZone);
}

function getLocaleFormatter(locale, timeZone, options = {}) {
  const cacheKey = JSON.stringify([locale, timeZone, options]);

  if (!localeFormatterCache.has(cacheKey)) {
    localeFormatterCache.set(cacheKey, new Intl.DateTimeFormat(locale, {
      ...options,
      timeZone,
    }));
  }

  return localeFormatterCache.get(cacheKey);
}

export function buildDateKey(year, month, day) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseDateKey(dateKey) {
  if (typeof dateKey !== 'string') return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;

  return { year, month, day };
}

export function getDatePartsInTimeZone(date = new Date(), userTimezone = DEFAULT_TIMEZONE) {
  const timeZone = normalizeTimeZone(userTimezone);
  const formatter = getDateFormatter(timeZone);
  const parts = formatter.formatToParts(date);

  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);

  return { year, month, day };
}

export function getDateKeyInTimeZone(date = new Date(), userTimezone = DEFAULT_TIMEZONE) {
  const { year, month, day } = getDatePartsInTimeZone(date, userTimezone);
  return buildDateKey(year, month, day);
}

export function shiftDateKey(dateKey, daysToShift) {
  const parsedDate = parseDateKey(dateKey);
  if (!parsedDate) return '';

  const shiftedDate = new Date(Date.UTC(parsedDate.year, parsedDate.month - 1, parsedDate.day + daysToShift));
  return buildDateKey(
    shiftedDate.getUTCFullYear(),
    shiftedDate.getUTCMonth() + 1,
    shiftedDate.getUTCDate(),
  );
}

export function getWeekdayFromDateKey(dateKey) {
  const parsedDate = parseDateKey(dateKey);
  if (!parsedDate) return 0;

  return new Date(Date.UTC(parsedDate.year, parsedDate.month - 1, parsedDate.day)).getUTCDay();
}

export function getTodayKey(userTimezone = DEFAULT_TIMEZONE) {
  return getDateKeyInTimeZone(new Date(), userTimezone);
}

export function getTimeZoneOffsetLabel(userTimezone = DEFAULT_TIMEZONE, date = new Date()) {
  const timeZone = normalizeTimeZone(userTimezone);

  try {
    const part = getOffsetFormatter(timeZone)
      .formatToParts(date)
      .find((item) => item.type === 'timeZoneName')?.value;

    return part ? part.replace('GMT', 'UTC') : timeZone;
  } catch {
    return timeZone;
  }
}

export function getHourInTimeZone(date = new Date(), userTimezone = DEFAULT_TIMEZONE) {
  const timeZone = normalizeTimeZone(userTimezone);

  try {
    return Number(getHourFormatter(timeZone).format(date));
  } catch {
    return date.getHours();
  }
}

export function getTimeZoneOptionLabel(userTimezone = DEFAULT_TIMEZONE) {
  const normalizedSelection = normalizeTimeZoneSelection(userTimezone);
  return TIMEZONE_OPTIONS.find((option) => option.value === normalizedSelection)?.label || normalizedSelection;
}

export function formatTimestampInTimeZone(
  value,
  userTimezone = DEFAULT_TIMEZONE,
  locale = 'ar',
  options = {},
) {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const timeZone = normalizeTimeZone(userTimezone);

  try {
    return getLocaleFormatter(locale, timeZone, options).format(date);
  } catch {
    return '';
  }
}

export function formatDateKeyForDisplay(dateKey, locale = 'ar', options = {}) {
  const parsedDate = parseDateKey(dateKey);
  if (!parsedDate) return '';

  const date = new Date(Date.UTC(parsedDate.year, parsedDate.month - 1, parsedDate.day));

  try {
    return getLocaleFormatter(locale, 'UTC', options).format(date);
  } catch {
    return '';
  }
}

/**
 * Plays a notification sound using the Web Audio API.
 * Reuses a single AudioContext to prevent memory leaks.
 * Falls back silently if audio is not available.
 */
let audioContextInstance = null;

export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioContextInstance || audioContextInstance.state === 'closed') {
      audioContextInstance = new AudioContextClass();
    }

    if (audioContextInstance.state === 'suspended') {
      audioContextInstance.resume();
    }

    const ctx = audioContextInstance;
    const notes = [523.25, 659.25, 783.99];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.8);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.8);
    });
  } catch {
    // Audio not available or blocked — fail silently
  }
}
