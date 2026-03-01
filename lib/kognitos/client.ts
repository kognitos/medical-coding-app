/**
 * Mock Kognitos API client for medical coding SOPs.
 */

import type {
  KognitosRun,
  KognitosRunEvent,
  KognitosInsights,
  KognitosMetricResult,
} from "@/lib/types";

// ── Mock Runs ──────────────────────────────────────────────────

const mockRuns: KognitosRun[] = [
  {
    name: "workspaces/ws-1/runs/run-1",
    createTime: "2026-02-20T09:00:00Z",
    updateTime: "2026-02-20T09:04:32Z",
    state: {
      completed: {
        outputs: {
          status: "auto_coded",
          cpt_codes: "99213, 99214",
          icd10_codes: "I10, E11.9, J44.1",
          drg: "MS-DRG 291",
          confidence_score: "92",
        },
      },
    },
    stage: "auto-code-clinical-notes",
    stageVersion: "2.1",
    invocationDetails: { invocationSource: "api" },
    userInputs: {
      chart_id: "cht-3",
      encounter_number: "ENC-2026-0103",
      department: "Inpatient",
    },
  },
  {
    name: "workspaces/ws-1/runs/run-2",
    createTime: "2026-02-21T14:30:00Z",
    updateTime: "2026-02-21T14:35:10Z",
    state: {
      completed: {
        outputs: {
          status: "auto_coded",
          cpt_codes: "27447",
          icd10_codes: "M17.11, Z96.651",
          drg: "MS-DRG 470",
          confidence_score: "97",
        },
      },
    },
    stage: "auto-code-clinical-notes",
    stageVersion: "2.1",
    invocationDetails: { invocationSource: "api" },
    userInputs: {
      chart_id: "cht-5",
      encounter_number: "ENC-2026-0105",
      department: "Surgical",
    },
  },
  {
    name: "workspaces/ws-1/runs/run-3",
    createTime: "2026-02-22T08:15:00Z",
    updateTime: "2026-02-22T08:18:45Z",
    state: {
      completed: {
        outputs: {
          validation_result: "pass",
          bundling_issues: "0",
          specificity_warnings: "1",
          notes: "ICD-10 E11 should be coded to highest specificity",
        },
      },
    },
    stage: "validate-code-bundling",
    stageVersion: "1.3",
    invocationDetails: { invocationSource: "api" },
    userInputs: {
      chart_id: "cht-3",
      cpt_codes: "99213, 99214",
      icd10_codes: "I10, E11.9, J44.1",
    },
  },
  {
    name: "workspaces/ws-1/runs/run-4",
    createTime: "2026-02-22T10:00:00Z",
    updateTime: "2026-02-22T10:02:30Z",
    state: {
      awaitingGuidance: {
        exception: "missing_documentation",
        description: "Operative report does not specify laterality for knee replacement. Query physician for clarification.",
      },
    },
    stage: "auto-code-clinical-notes",
    stageVersion: "2.1",
    invocationDetails: { invocationSource: "api" },
    userInputs: {
      chart_id: "cht-8",
      encounter_number: "ENC-2026-0108",
      department: "Surgical",
    },
  },
  {
    name: "workspaces/ws-1/runs/run-5",
    createTime: "2026-02-23T11:00:00Z",
    updateTime: "2026-02-23T11:03:20Z",
    state: {
      completed: {
        outputs: {
          drg_assigned: "MS-DRG 193",
          relative_weight: "1.4237",
          expected_reimbursement: "12450.00",
          validation: "pass",
        },
      },
    },
    stage: "drg-assignment",
    stageVersion: "1.0",
    invocationDetails: { invocationSource: "api" },
    userInputs: {
      chart_id: "cht-6",
      principal_dx: "J18.9",
      secondary_dx: "J96.01, N17.9",
    },
  },
];

// ── Mock Run Events ────────────────────────────────────────────

const mockRunEvents: KognitosRunEvent[] = [
  {
    id: "evt-1-1",
    runId: "run-1",
    timestamp: "2026-02-20T09:00:05Z",
    type: "runUpdate",
    description: "Run started for auto-code-clinical-notes SOP",
  },
  {
    id: "evt-1-2",
    runId: "run-1",
    timestamp: "2026-02-20T09:01:10Z",
    type: "executionJournal",
    nodeKind: "action",
    description: "Extracted clinical narrative from discharge summary",
    details: { document_type: "discharge_summary", pages: 4 },
  },
  {
    id: "evt-1-3",
    runId: "run-1",
    timestamp: "2026-02-20T09:02:00Z",
    type: "executionJournal",
    nodeKind: "decision",
    description: "Identified primary diagnosis: Essential hypertension (I10)",
    details: { confidence: 0.95 },
  },
  {
    id: "evt-1-4",
    runId: "run-1",
    timestamp: "2026-02-20T09:02:45Z",
    type: "executionJournal",
    nodeKind: "action",
    description: "Generated CPT codes: 99213 (Office visit), 99214 (Detailed visit)",
    details: { cpt_count: 2 },
  },
  {
    id: "evt-1-5",
    runId: "run-1",
    timestamp: "2026-02-20T09:03:30Z",
    type: "executionJournal",
    nodeKind: "decision",
    description: "Validated CCI edits — no bundling conflicts detected",
    details: { rule: "cci_edit_check", result: "pass" },
  },
  {
    id: "evt-1-6",
    runId: "run-1",
    timestamp: "2026-02-20T09:04:32Z",
    type: "runUpdate",
    description: "Run completed — chart auto-coded with confidence 92%",
    details: { status: "auto_coded", confidence: 92 },
  },
  {
    id: "evt-2-1",
    runId: "run-2",
    timestamp: "2026-02-21T14:30:05Z",
    type: "runUpdate",
    description: "Run started for auto-code-clinical-notes SOP",
  },
  {
    id: "evt-2-2",
    runId: "run-2",
    timestamp: "2026-02-21T14:31:20Z",
    type: "executionJournal",
    nodeKind: "action",
    description: "Extracted operative report for total knee arthroplasty",
    details: { document_type: "operative_report" },
  },
  {
    id: "evt-2-3",
    runId: "run-2",
    timestamp: "2026-02-21T14:33:00Z",
    type: "executionJournal",
    nodeKind: "decision",
    description: "Assigned CPT 27447 (Total knee replacement) and ICD-10 M17.11",
    details: { confidence: 0.97 },
  },
  {
    id: "evt-2-4",
    runId: "run-2",
    timestamp: "2026-02-21T14:35:10Z",
    type: "runUpdate",
    description: "Run completed — surgical chart auto-coded with confidence 97%",
    details: { status: "auto_coded", confidence: 97 },
  },
  {
    id: "evt-3-1",
    runId: "run-3",
    timestamp: "2026-02-22T08:15:05Z",
    type: "runUpdate",
    description: "Run started for validate-code-bundling SOP",
  },
  {
    id: "evt-3-2",
    runId: "run-3",
    timestamp: "2026-02-22T08:16:30Z",
    type: "executionJournal",
    nodeKind: "decision",
    description: "Checked CCI edits for CPT 99213 + 99214 — no conflict",
  },
  {
    id: "evt-3-3",
    runId: "run-3",
    timestamp: "2026-02-22T08:17:45Z",
    type: "executionJournal",
    nodeKind: "decision",
    description: "ICD-10 specificity warning: E11.9 could be more specific",
    details: { rule: "specificity_check", code: "E11.9" },
  },
  {
    id: "evt-3-4",
    runId: "run-3",
    timestamp: "2026-02-22T08:18:45Z",
    type: "runUpdate",
    description: "Validation complete — 1 specificity warning flagged",
  },
];

// ── Mock Insights ──────────────────────────────────────────────

const mockInsights: KognitosInsights = {
  valueInsight: {
    totalMoneySavedUsd: "28500.00",
    totalTimeSavedSecs: 54000,
  },
  runInsight: {
    totalRunsCount: 5,
    trend: { percentChange: 25, comparisonWindow: "week" },
  },
  completionInsight: {
    totalPercentCompletions: 80,
    stp: 80,
    completionsPerPeriod: [
      { windowLabel: "2026-02-20", autoCompletedCount: 1, manuallyResolvedCount: 0 },
      { windowLabel: "2026-02-21", autoCompletedCount: 1, manuallyResolvedCount: 0 },
      { windowLabel: "2026-02-22", autoCompletedCount: 1, manuallyResolvedCount: 1 },
      { windowLabel: "2026-02-23", autoCompletedCount: 1, manuallyResolvedCount: 0 },
    ],
  },
  awaitingGuidanceInsight: {
    totalRunsAwaitingGuidance: 1,
  },
};

// ── Mock Metrics ───────────────────────────────────────────────

const mockMetricResults: KognitosMetricResult[] = [
  {
    metric: "runs_completed",
    interval: "1d",
    series: [
      {
        tags: { stage: "auto-code-clinical-notes" },
        points: [
          { startTime: "2026-02-18T00:00:00Z", value: 0, windowLabel: "Feb 18" },
          { startTime: "2026-02-19T00:00:00Z", value: 0, windowLabel: "Feb 19" },
          { startTime: "2026-02-20T00:00:00Z", value: 1, windowLabel: "Feb 20" },
          { startTime: "2026-02-21T00:00:00Z", value: 1, windowLabel: "Feb 21" },
          { startTime: "2026-02-22T00:00:00Z", value: 0, windowLabel: "Feb 22" },
        ],
      },
      {
        tags: { stage: "validate-code-bundling" },
        points: [
          { startTime: "2026-02-18T00:00:00Z", value: 0, windowLabel: "Feb 18" },
          { startTime: "2026-02-19T00:00:00Z", value: 0, windowLabel: "Feb 19" },
          { startTime: "2026-02-20T00:00:00Z", value: 0, windowLabel: "Feb 20" },
          { startTime: "2026-02-21T00:00:00Z", value: 0, windowLabel: "Feb 21" },
          { startTime: "2026-02-22T00:00:00Z", value: 1, windowLabel: "Feb 22" },
        ],
      },
      {
        tags: { stage: "drg-assignment" },
        points: [
          { startTime: "2026-02-18T00:00:00Z", value: 0, windowLabel: "Feb 18" },
          { startTime: "2026-02-19T00:00:00Z", value: 0, windowLabel: "Feb 19" },
          { startTime: "2026-02-20T00:00:00Z", value: 0, windowLabel: "Feb 20" },
          { startTime: "2026-02-21T00:00:00Z", value: 0, windowLabel: "Feb 21" },
          { startTime: "2026-02-22T00:00:00Z", value: 0, windowLabel: "Feb 22" },
          { startTime: "2026-02-23T00:00:00Z", value: 1, windowLabel: "Feb 23" },
        ],
      },
    ],
  },
];

// ── API Functions ──────────────────────────────────────────────

export async function getRun(runId: string): Promise<KognitosRun | null> {
  await Promise.resolve();
  const run = mockRuns.find(
    (r) =>
      r.name.endsWith(`/runs/${runId}`) || r.name.split("/").pop() === runId
  );
  return run ?? null;
}

export async function listRuns(options?: {
  pageSize?: number;
  filter?: string;
}): Promise<{ runs: KognitosRun[]; nextPageToken: string | null }> {
  await Promise.resolve();
  const pageSize = Math.min(options?.pageSize ?? 10, 1000);
  let filtered = [...mockRuns];

  if (options?.filter) {
    filtered = applyRunsFilter(filtered, options.filter);
  }

  const runs = filtered.slice(0, pageSize);
  const nextPageToken =
    filtered.length > pageSize ? `page-${pageSize}` : null;

  return { runs, nextPageToken };
}

export async function getRunEvents(
  runId: string,
  options?: { pageSize?: number; filter?: string }
): Promise<{ runEvents: KognitosRunEvent[]; nextPageToken: string | null }> {
  await Promise.resolve();
  const pageSize = Math.min(options?.pageSize ?? 100, 1000);
  let filtered = mockRunEvents.filter(
    (e) => e.runId === runId || e.runId.endsWith(`/runs/${runId}`)
  );

  if (options?.filter) {
    filtered = applyRunEventsFilter(filtered, options.filter);
  }

  const runEvents = filtered.slice(0, pageSize);
  const nextPageToken =
    filtered.length > pageSize ? `page-${pageSize}` : null;

  return { runEvents, nextPageToken };
}

export async function queryInsights(): Promise<KognitosInsights> {
  await Promise.resolve();
  return mockInsights;
}

export async function queryMetrics(options?: {
  metrics?: string[];
  groupBy?: string[];
  interval?: string;
}): Promise<{ results: KognitosMetricResult[] }> {
  await Promise.resolve();
  let results = [...mockMetricResults];

  if (options?.metrics?.length) {
    results = results.filter((r) => options.metrics!.includes(r.metric));
  }
  if (options?.interval) {
    results = results.map((r) => ({ ...r, interval: options.interval! }));
  }

  return { results };
}

export async function getAutomationRunAggregates(): Promise<{
  automationRunAggregates: {
    automationId: string;
    stats: { totalRuns: number; completedRuns: number };
  }[];
}> {
  await Promise.resolve();
  const total = mockRuns.length;
  const completed = mockRuns.filter((r) => r.state.completed).length;

  return {
    automationRunAggregates: [
      {
        automationId: "auto-code-clinical-notes",
        stats: { totalRuns: 3, completedRuns: 2 },
      },
      {
        automationId: "validate-code-bundling",
        stats: { totalRuns: 1, completedRuns: 1 },
      },
      {
        automationId: "drg-assignment",
        stats: { totalRuns: 1, completedRuns: 1 },
      },
    ],
  };
}

// ── Helpers ────────────────────────────────────────────────────

function applyRunsFilter(
  runs: KognitosRun[],
  filter: string
): KognitosRun[] {
  const createTimeGte = filter.match(/create_time\s*>=\s*"([^"]+)"/)?.[1];
  const createTimeLte = filter.match(/create_time\s*<=\s*"([^"]+)"/)?.[1];
  if (createTimeGte || createTimeLte) {
    return runs.filter((r) => {
      const t = new Date(r.createTime).getTime();
      if (createTimeGte && t < new Date(createTimeGte).getTime()) return false;
      if (createTimeLte && t > new Date(createTimeLte).getTime()) return false;
      return true;
    });
  }
  return runs;
}

function applyRunEventsFilter(
  events: KognitosRunEvent[],
  filter: string
): KognitosRunEvent[] {
  const nodeKindMatch = filter.match(/node_kind\s*=\s*"([^"]+)"/)?.[1];
  if (nodeKindMatch) {
    return events.filter((e) => e.nodeKind === nodeKindMatch);
  }
  return events;
}
