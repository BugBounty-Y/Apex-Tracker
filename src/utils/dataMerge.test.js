import { describe, expect, it } from 'vitest';
import { mergeAppDataSnapshots } from './dataMerge';

describe('data merge helpers', () => {
  it('preserves cumulative subject totals when stored sessions are truncated', () => {
    const mergedData = mergeAppDataSnapshots(
      {
        subjects: {
          Math: {
            goalHours: 20,
            studiedSeconds: 18000,
            sessions: 12,
            color: 'bg-blue-50 text-blue-900',
            tasks: [],
          },
        },
        dailyLog: { '2026-03-10': 7200 },
        studySessions: [
          {
            id: 'session-1',
            subject: 'Math',
            startedAt: '2026-03-10T08:00:00.000Z',
            endedAt: '2026-03-10T09:00:00.000Z',
            durationSeconds: 3600,
            type: 'focus',
            completed: true,
            mode: 'pomodoro',
          },
        ],
      },
      {
        subjects: {
          Math: {
            goalHours: 20,
            studiedSeconds: 14400,
            sessions: 10,
            color: 'bg-blue-50 text-blue-900',
            tasks: [],
          },
        },
        dailyLog: { '2026-03-11': 3600 },
        studySessions: [
          {
            id: 'session-2',
            subject: 'Math',
            startedAt: '2026-03-11T08:00:00.000Z',
            endedAt: '2026-03-11T09:00:00.000Z',
            durationSeconds: 3600,
            type: 'focus',
            completed: true,
            mode: 'pomodoro',
          },
        ],
      },
    );

    expect(mergedData.subjects.Math.studiedSeconds).toBe(18000);
    expect(mergedData.subjects.Math.sessions).toBe(12);
    expect(mergedData.studySessions).toHaveLength(2);
    expect(mergedData.dailyLog['2026-03-10']).toBe(7200);
    expect(mergedData.dailyLog['2026-03-11']).toBe(3600);
  });
});
