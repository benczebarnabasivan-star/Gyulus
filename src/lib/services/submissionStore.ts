import 'server-only';

// ---------------------------------------------------------------------------
// In-memory submission store.
//
// This keeps the app fully functional WITHOUT a database (seed mode). In a
// production deployment, swap these functions for Prisma calls against the
// `Submission` model (see prisma/schema.prisma) — the route handlers don't
// need to change. State here resets when the server restarts.
// ---------------------------------------------------------------------------

export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Submission {
  id: string;
  tiktokUrl: string;
  note?: string;
  authorName?: string;
  status: SubmissionStatus;
  createdAt: string;
}

const submissions: Submission[] = [];

export function listSubmissions(): Submission[] {
  return [...submissions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addSubmission(input: {
  tiktokUrl: string;
  note?: string;
  authorName?: string;
}): Submission {
  const submission: Submission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    tiktokUrl: input.tiktokUrl,
    note: input.note,
    authorName: input.authorName,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  submissions.unshift(submission);
  return submission;
}

export function setSubmissionStatus(
  id: string,
  status: SubmissionStatus,
): Submission | null {
  const s = submissions.find((x) => x.id === id);
  if (!s) return null;
  s.status = status;
  return s;
}
