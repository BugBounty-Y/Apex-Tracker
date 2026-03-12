import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getRemainingDays } from './constants';
import { getTodayKey, normalizeTimeZoneSelection, shiftDateKey } from './helpers';

describe('date helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates remaining days using the selected timezone civil date', () => {
    vi.setSystemTime(new Date('2026-03-11T22:30:00Z'));

    expect(getRemainingDays('2026-03-13', 'Africa/Cairo')).toBe(1);
    expect(getTodayKey('Africa/Cairo')).toBe('2026-03-12');
  });

  it('shifts date keys safely across month boundaries', () => {
    expect(shiftDateKey('2026-03-01', -1)).toBe('2026-02-28');
    expect(shiftDateKey('2028-03-01', -1)).toBe('2028-02-29');
  });

  it('maps legacy UTC offsets to real IANA timezones', () => {
    expect(normalizeTimeZoneSelection('UTC+2')).toBe('Africa/Cairo');
    expect(normalizeTimeZoneSelection('UTC-5')).toBe('America/New_York');
  });
});
