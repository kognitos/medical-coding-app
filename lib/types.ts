/**
 * Domain types for the Medical Coding (CPT/ICD-10) application.
 */

// ── Status & Enum Types ────────────────────────────────────────

export type ChartStatus =
  | "pending_coding"
  | "auto_coded"
  | "in_review"
  | "query_sent"
  | "coded"
  | "audited"
  | "finalized";

export type UserRole = "coder" | "auditor" | "coding_manager" | "admin";

export type Priority = "stat" | "routine";

// ── Code Types ─────────────────────────────────────────────────

export interface SuggestedCode {
  code: string;
  type: "CPT" | "ICD-10";
  description: string;
  confidence: number;
}

export interface FinalCode {
  code: string;
  type: "CPT" | "ICD-10";
  description: string;
  source: "auto" | "manual";
}

// ── Core Domain Models ─────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface User {
  id: string;
  org_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

/**
 * The core workflow entity — a clinical chart requiring CPT/ICD-10 coding.
 */
export interface Chart {
  id: string;
  org_id: string;
  title: string;
  description: string;
  patient_mrn: string;
  encounter_number: string;
  encounter_date: string;
  discharge_date: string | null;
  provider_name: string;
  department: string;
  assigned_to: string | null;
  status: ChartStatus;
  priority: Priority;
  category: string;
  suggested_codes: SuggestedCode[];
  final_codes: FinalCode[];
  drg: string | null;
  estimated_reimbursement: number;
  coding_accuracy_score: number | null;
  coded_at: string | null;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
  kognitos_run_id: string;
  episode_id: string | null;
}

export interface Document {
  id: string;
  chart_id: string;
  file_name: string;
  document_type: string;
  size_bytes: number;
  source: string;
  created_at: string;
}

export interface Comment {
  id: string;
  chart_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  chart_id: string;
  action: string;
  actor_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  chart_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  criteria: string;
  created_at: string;
  updated_at: string;
}

// ── Kognitos Integration Types ─────────────────────────────────

export interface KognitosRun {
  name: string;
  createTime: string;
  updateTime: string;
  state: {
    pending?: Record<string, never>;
    executing?: Record<string, never>;
    awaitingGuidance?: { exception: string; description: string };
    completed?: { outputs: Record<string, string> };
    failed?: { id: string; description: string };
  };
  stage: string;
  stageVersion: string;
  invocationDetails: {
    invocationSource: string;
  };
  userInputs: Record<string, string>;
}

export interface KognitosRunEvent {
  id: string;
  runId: string;
  timestamp: string;
  type: "runUpdate" | "executionJournal";
  nodeKind?: string;
  description: string;
  details?: Record<string, unknown>;
}

export interface KognitosInsights {
  valueInsight: {
    totalMoneySavedUsd: string;
    totalTimeSavedSecs: number;
  };
  runInsight: {
    totalRunsCount: number;
    trend: { percentChange: number; comparisonWindow: string };
  };
  completionInsight: {
    totalPercentCompletions: number;
    stp: number;
    completionsPerPeriod: {
      windowLabel: string;
      autoCompletedCount: number;
      manuallyResolvedCount: number;
    }[];
  };
  awaitingGuidanceInsight: {
    totalRunsAwaitingGuidance: number;
  };
}

export interface KognitosMetricSeries {
  tags: Record<string, string>;
  points: { startTime: string; value: number; windowLabel: string }[];
}

export interface KognitosMetricResult {
  metric: string;
  interval: string;
  series: KognitosMetricSeries[];
}

// ── Mock Users ─────────────────────────────────────────────────

export const MOCK_USERS: Record<UserRole, User> = {
  coder: {
    id: "usr_001",
    org_id: "org_001",
    full_name: "Sarah Chen",
    email: "sarah.chen@mercy-health.org",
    role: "coder",
    avatar_url: "",
    created_at: "2025-06-01T08:00:00Z",
  },
  auditor: {
    id: "usr_002",
    org_id: "org_001",
    full_name: "James Rivera",
    email: "james.rivera@mercy-health.org",
    role: "auditor",
    avatar_url: "",
    created_at: "2025-06-01T08:00:00Z",
  },
  coding_manager: {
    id: "usr_003",
    org_id: "org_001",
    full_name: "Patricia Walsh",
    email: "patricia.walsh@mercy-health.org",
    role: "coding_manager",
    avatar_url: "",
    created_at: "2025-06-01T08:00:00Z",
  },
  admin: {
    id: "usr_004",
    org_id: "org_001",
    full_name: "Michael Torres",
    email: "michael.torres@mercy-health.org",
    role: "admin",
    avatar_url: "",
    created_at: "2025-06-01T08:00:00Z",
  },
};
