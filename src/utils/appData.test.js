import { describe, expect, it } from 'vitest';
import { getValidSelection, normalizeAppData } from './appData';

describe('app data normalization', () => {
  it('normalizes daily log values to non-negative integers', () => {
    const normalized = normalizeAppData({
      dailyLog: {
        '2026-03-12': '3600',
        '2026-03-11': -50,
        invalid: 120,
      },
    });

    expect(normalized.dailyLog).toEqual({
      '2026-03-12': 3600,
      '2026-03-11': 0,
    });
  });

  it('returns the first valid subject and task when the preferred selection is missing', () => {
    const selection = getValidSelection({
      Math: {
        tasks: [
          { id: 'task-1', title: 'Algebra' },
        ],
      },
      Physics: {
        tasks: [
          { id: 'task-2', title: 'Mechanics' },
        ],
      },
    }, 'Chemistry', 'task-x');

    expect(selection).toEqual({
      subject: 'Math',
      taskId: 'task-1',
    });
  });
});
