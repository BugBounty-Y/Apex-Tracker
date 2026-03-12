import { describe, expect, it } from 'vitest';
import {
  incrementDailyLogEntry,
  incrementSubjectSessions,
  incrementSubjectStudyTime,
} from './studyData';

describe('study data helpers', () => {
  it('increments studied seconds and daily log without mutating the originals', () => {
    const subjects = {
      Math: { goalHours: 10, studiedSeconds: 120, sessions: 1, color: 'bg-blue-50 text-blue-900' },
    };
    const dailyLog = { '2026-03-12': 600 };

    const nextSubjects = incrementSubjectStudyTime(subjects, 'Math', 30);
    const nextDailyLog = incrementDailyLogEntry(dailyLog, '2026-03-12', 30);

    expect(subjects.Math.studiedSeconds).toBe(120);
    expect(dailyLog['2026-03-12']).toBe(600);
    expect(nextSubjects.Math.studiedSeconds).toBe(150);
    expect(nextDailyLog['2026-03-12']).toBe(630);
  });

  it('increments completed sessions only for the active subject', () => {
    const subjects = {
      Physics: { goalHours: 8, studiedSeconds: 0, sessions: 2, color: 'bg-red-50 text-red-900' },
    };

    const nextSubjects = incrementSubjectSessions(subjects, 'Physics');

    expect(nextSubjects.Physics.sessions).toBe(3);
    expect(subjects.Physics.sessions).toBe(2);
  });
});
