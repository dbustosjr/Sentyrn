export type ReviewStatus = "approved" | "needs_review" | "risk_accepted";

export type MockSession = {
  id: string;
  repo: string;
  branch: string;
  model: string;
  durationMin: number;
  findings: number;
  status: ReviewStatus;
  startedAt: string;
};

export const MOCK_SESSIONS: MockSession[] = [
  {
    id: "ses_01hxyz",
    repo: "acme/api",
    branch: "feat/auth-hardening",
    model: "gpt-5.2",
    durationMin: 42,
    findings: 3,
    status: "needs_review",
    startedAt: "2026-05-14T08:12:00Z",
  },
  {
    id: "ses_01habcd",
    repo: "acme/web",
    branch: "main",
    model: "claude-opus-4-7",
    durationMin: 18,
    findings: 0,
    status: "approved",
    startedAt: "2026-05-13T21:40:00Z",
  },
  {
    id: "ses_01hdefg",
    repo: "acme/api",
    branch: "chore/migrations",
    model: "gpt-5.2",
    durationMin: 63,
    findings: 5,
    status: "risk_accepted",
    startedAt: "2026-05-13T14:05:00Z",
  },
];

export type MockTimelineEvent = {
  id: string;
  type: string;
  label: string;
  detail?: string;
  at: string;
  tone?: "default" | "warning" | "success";
};

export const MOCK_TIMELINE: MockTimelineEvent[] = [
  {
    id: "ev1",
    type: "prompt.submitted",
    label: "Prompt submitted",
    detail: "Refactor auth middleware for stricter session handling",
    at: "08:12:02",
  },
  {
    id: "ev2",
    type: "session.started",
    label: "Session started",
    detail: "Cursor · workspace /acme/api",
    at: "08:12:04",
  },
  {
    id: "ev3",
    type: "file.read",
    label: "File read",
    detail: "src/auth/session.ts",
    at: "08:12:18",
  },
  {
    id: "ev4",
    type: "file.written",
    label: "File written",
    detail: "src/auth/middleware.ts",
    at: "08:14:51",
  },
  {
    id: "ev5",
    type: "terminal.command",
    label: "Terminal command",
    detail: "pnpm test --filter auth",
    at: "08:16:03",
  },
  {
    id: "ev6",
    type: "test.failed",
    label: "Tests failed",
    detail: "3 failed · session-cookie.spec.ts",
    at: "08:16:40",
    tone: "warning",
  },
  {
    id: "ev7",
    type: "protected_path.touched",
    label: "Protected path touched",
    detail: "policy:auth-files",
    at: "08:19:22",
    tone: "warning",
  },
  {
    id: "ev8",
    type: "finding.created",
    label: "Finding created",
    detail: "auth_files_modified",
    at: "08:19:23",
    tone: "warning",
  },
];

export const MOCK_FINDINGS = [
  {
    id: "f1",
    title: "Auth files modified",
    rule: "protected_paths",
    severity: "high" as const,
    sessionId: "ses_01hxyz",
  },
  {
    id: "f2",
    title: "Tests failed after edit loop",
    rule: "test_health",
    severity: "medium" as const,
    sessionId: "ses_01hxyz",
  },
  {
    id: "f3",
    title: "Migration file changed",
    rule: "migrations",
    severity: "low" as const,
    sessionId: "ses_01hdefg",
  },
];
