import type { Classroom } from "@/types";

export function classStats(c: Classroom) {
  const slots = c.students.length * c.assignments.length;
  const done = c.students.reduce((a, s) => a + c.assignments.filter(x => s.completed.includes(x.storyId)).length, 0);
  return {
    students: c.students.length,
    assignments: c.assignments.length,
    completed: done,
    completionRate: slots ? done / slots : 0,
    discussions: c.students.reduce((a, s) => a + s.discussions, 0),
  };
}

export function daysLeft(iso?: string) {
  if (!iso) return null;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}
