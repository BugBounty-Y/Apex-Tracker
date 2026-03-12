import { describe, expect, it } from 'vitest';
import { mergeImportedData, parseImportedJson } from './index';

describe('export/import utilities', () => {
  it('rejects arbitrary JSON objects that are not Apex Tracker backups', () => {
    expect(() => parseImportedJson('{}')).toThrow();
    expect(() => parseImportedJson('{"foo":"bar"}')).toThrow();
  });

  it('merges subjects and sessions without overwriting current progress', () => {
    const mergedData = mergeImportedData(
      {
        subjects: {
          Math: {
            goalHours: 10,
            studiedSeconds: 3600,
            sessions: 1,
            color: 'bg-blue-50 text-blue-900',
            tasks: [{ id: 'task-1', title: 'Chapter 1', done: false, estimatedMinutes: 45 }],
            notes: 'Current notes',
          },
        },
        dailyLog: { '2026-03-12': 3600 },
        studySessions: [
          {
            id: 'session-1',
            subject: 'Math',
            taskId: 'task-1',
            taskTitle: 'Chapter 1',
            startedAt: '2026-03-12T08:00:00.000Z',
            endedAt: '2026-03-12T09:00:00.000Z',
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
            goalHours: 8,
            studiedSeconds: 1800,
            sessions: 1,
            color: 'bg-blue-50 text-blue-900',
            tasks: [
              { id: 'task-1', title: 'Chapter 1', done: true, estimatedMinutes: 45 },
              { id: 'task-2', title: 'Chapter 2', done: false, estimatedMinutes: 30 },
            ],
            notes: 'Imported notes',
          },
        },
        dailyLog: { '2026-03-12': 1800 },
        studySessions: [
          {
            id: 'session-2',
            subject: 'Math',
            taskId: 'task-2',
            taskTitle: 'Chapter 2',
            startedAt: '2026-03-12T10:00:00.000Z',
            endedAt: '2026-03-12T10:30:00.000Z',
            durationSeconds: 1800,
            type: 'focus',
            completed: false,
            mode: 'pomodoro',
          },
        ],
      },
    );

    expect(mergedData.subjects.Math.studiedSeconds).toBe(5400);
    expect(mergedData.subjects.Math.sessions).toBe(1);
    expect(mergedData.subjects.Math.tasks).toHaveLength(2);
    expect(mergedData.subjects.Math.tasks.find((task) => task.id === 'task-1')?.done).toBe(true);
    expect(mergedData.subjects.Math.notes).toContain('Current notes');
    expect(mergedData.subjects.Math.notes).toContain('Imported notes');
    expect(mergedData.dailyLog['2026-03-12']).toBe(5400);
    expect(mergedData.studySessions).toHaveLength(2);
  });
});
