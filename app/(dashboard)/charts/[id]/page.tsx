"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { format, formatDistanceStrict } from "date-fns";
import {
  ArrowLeft,
  CheckCircle,
  Send,
  FileCheck,
  ClipboardCheck,
  Edit3,
  UserPlus,
  FileText,
  MessageSquare,
  Clock,
  Play,
  CircleDot,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  getChartById,
  getUserById,
  getDocumentsForChart,
  getCommentsForChart,
  getAuditEventsForChart,
  getRun,
  getRunEvents,
} from "@/lib/api";
import { DOMAIN } from "@/lib/domain.config";
import { useAuth } from "@/lib/auth-context";
import { canPerformAction } from "@/lib/role-permissions";
import type {
  Chart,
  User,
  Document,
  Comment,
  AuditEvent,
  KognitosRun,
  KognitosRunEvent,
  SuggestedCode,
  FinalCode,
} from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/domain/status-badge";
import { PriorityBadge } from "@/components/domain/priority-badge";
import { TimelineEvent } from "@/components/domain/timeline-event";

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function nextAction(status: string): string {
  const map: Record<string, string> = {
    pending_coding: "Awaiting auto-coding by Kognitos AI",
    auto_coded: "Review suggested codes and accept, modify, or query",
    in_review: "Coder is reviewing — verify codes against clinical documentation",
    query_sent: "Waiting for physician response to documentation query",
    coded: "Ready for audit review",
    audited: "Audit passed — ready for finalization",
    finalized: "Chart finalized and sent to billing",
  };
  return map[status] ?? "No action required";
}

function RunTraceEvent({ event }: { event: KognitosRunEvent }) {
  const [expanded, setExpanded] = useState(false);
  const isRunUpdate = event.type === "runUpdate";
  const hasDetails = event.details && Object.keys(event.details).length > 0;

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border last:hidden" />
      <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-background">
        {isRunUpdate ? (
          <CircleDot className="size-4 text-muted-foreground" />
        ) : (
          <Play className="size-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 space-y-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          {hasDetails && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex size-5 items-center justify-center rounded hover:bg-muted"
              aria-label={expanded ? "Collapse details" : "Expand details"}
            >
              {expanded ? (
                <ChevronDown className="size-3" />
              ) : (
                <ChevronRight className="size-3" />
              )}
            </button>
          )}
          <span
            className={`text-sm ${isRunUpdate ? "font-semibold" : "font-medium"}`}
          >
            {event.description}
          </span>
          {event.nodeKind && (
            <Badge variant="outline" className="text-[10px]">
              {event.nodeKind}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <time>
            {format(new Date(event.timestamp), "MMM d, yyyy 'at' h:mm:ss a")}
          </time>
        </div>
        {expanded && hasDetails && event.details && (
          <pre className="mt-2 overflow-x-auto rounded-md border bg-muted/50 p-3 text-xs">
            {JSON.stringify(event.details, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default function ChartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { user } = useAuth();
  const [chart, setChart] = useState<Chart | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [assignedUser, setAssignedUser] = useState<User | null>(null);
  const [commentAuthors, setCommentAuthors] = useState<Map<string, User>>(
    new Map()
  );
  const [run, setRun] = useState<KognitosRun | null>(null);
  const [runEvents, setRunEvents] = useState<KognitosRunEvent[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getChartById(id).then((c) => {
      if (!c) setNotFound(true);
      else setChart(c);
    });
  }, [id]);

  useEffect(() => {
    if (!chart) return;
    Promise.all([
      getDocumentsForChart(chart.id),
      getCommentsForChart(chart.id),
      getAuditEventsForChart(chart.id),
    ]).then(([docs, cmts, evts]) => {
      setDocuments(docs);
      setComments(cmts);
      setAuditEvents(evts);
    });
  }, [chart?.id]);

  useEffect(() => {
    if (!chart?.assigned_to) {
      setAssignedUser(null);
      return;
    }
    getUserById(chart.assigned_to).then((u) => setAssignedUser(u ?? null));
  }, [chart?.assigned_to]);

  useEffect(() => {
    const ids = [...new Set(comments.map((c) => c.author_id))];
    Promise.all(ids.map((aid) => getUserById(aid))).then((users) => {
      const m = new Map<string, User>();
      ids.forEach((aid, i) => {
        const u = users[i];
        if (u) m.set(aid, u);
      });
      setCommentAuthors(m);
    });
  }, [comments]);

  useEffect(() => {
    if (!chart?.kognitos_run_id) return;
    const runId = chart.kognitos_run_id.includes("/")
      ? chart.kognitos_run_id.split("/").pop() ?? chart.kognitos_run_id
      : chart.kognitos_run_id;
    Promise.all([getRun(runId), getRunEvents(runId)]).then(([r, { runEvents: evts }]) => {
      setRun(r ?? null);
      setRunEvents(evts ?? []);
    });
  }, [chart?.kognitos_run_id]);

  const handleAction = (
    action: string,
    payload?: { status?: string; final_codes?: FinalCode[]; assigned_to?: string }
  ) => {
    if (!chart) return;
    if (action === "accept_codes") {
      setChart({
        ...chart,
        status: "coded",
        final_codes: chart.suggested_codes.map((s) => ({
          code: s.code,
          type: s.type,
          description: s.description,
          source: "auto" as const,
        })),
      });
    } else if (action === "send_query") {
      setChart({ ...chart, status: "query_sent" });
    } else if (action === "finalize") {
      setChart({
        ...chart,
        status: "finalized",
        finalized_at: new Date().toISOString(),
      });
    } else if (action === "audit") {
      setChart({ ...chart, status: "audited" });
    } else if (action === "override_codes") {
      // Prompt-based — placeholder
      alert("Override Codes: In production, this would open a prompt to modify codes.");
    } else if (action === "assign" && payload?.assigned_to) {
      setChart({ ...chart, assigned_to: payload.assigned_to });
    }
  };

  if (notFound) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Chart not found</p>
      </div>
    );
  }

  if (!chart) return null;

  const runStage = run?.stage ?? "—";
  const runStatus = run?.state.completed
    ? "Completed"
    : run?.state.awaitingGuidance
      ? "Awaiting Guidance"
      : run?.state.failed
        ? "Failed"
        : "Running";
  const runDuration =
    run?.createTime && run?.updateTime
      ? formatDistanceStrict(
          new Date(run.createTime),
          new Date(run.updateTime)
        )
      : "—";

  return (
    <div className="space-y-6">
      <Link href="/">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Worklist
        </Button>
      </Link>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-xl">{chart.title}</CardTitle>
            <StatusBadge status={chart.status} />
            <PriorityBadge priority={chart.priority} />
          </div>
          <p className="text-sm text-muted-foreground font-mono">{chart.id}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3 md:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Patient MRN</span>
              <p className="font-medium">{chart.patient_mrn}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Encounter #</span>
              <p className="font-medium">{chart.encounter_number}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Provider</span>
              <p className="font-medium">{chart.provider_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Department</span>
              <p className="font-medium">{chart.department}</p>
            </div>
            {chart.drg && (
              <div>
                <span className="text-muted-foreground">DRG</span>
                <p className="font-medium">{chart.drg}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Encounter Date</span>
              <p className="font-medium">
                {format(new Date(chart.encounter_date), "MMM d, yyyy")}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Discharge Date</span>
              <p className="font-medium">
                {chart.discharge_date
                  ? format(new Date(chart.discharge_date), "MMM d, yyyy")
                  : "—"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Est. Reimbursement</span>
              <p className="font-medium">
                {currencyFmt.format(chart.estimated_reimbursement)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="min-w-0 flex-1">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="codes">Codes</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              {chart.kognitos_run_id && (
                <TabsTrigger value="sop-run">SOP Run</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Recommended Next Action
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{nextAction(chart.status)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Chart Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>{chart.description}</p>
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <span>Category: {chart.category}</span>
                    <span>
                      Created{" "}
                      {format(new Date(chart.created_at), "MMM d, yyyy")}
                    </span>
                    <span>
                      Updated{" "}
                      {format(new Date(chart.updated_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="codes" className="mt-4 space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold">
                  Suggested Codes (AI)
                </h3>
                {chart.suggested_codes.length > 0 ? (
                  <ul className="space-y-2">
                    {chart.suggested_codes.map((s: SuggestedCode, i: number) => (
                      <li
                        key={`${s.code}-${i}`}
                        className="flex flex-wrap items-center gap-2 rounded-md border p-3"
                      >
                        <span className="font-mono font-medium">{s.code}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {s.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {s.description}
                        </span>
                        <Badge variant="secondary" className="ml-auto">
                          {Math.round(s.confidence)}%
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No suggested codes yet
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-sm font-semibold">Final Codes</h3>
                {chart.final_codes.length > 0 ? (
                  <ul className="space-y-2">
                    {chart.final_codes.map((f: FinalCode, i: number) => (
                      <li
                        key={`${f.code}-${i}`}
                        className="flex flex-wrap items-center gap-2 rounded-md border p-3"
                      >
                        <span className="font-mono font-medium">{f.code}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {f.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {f.description}
                        </span>
                        <Badge
                          variant={f.source === "auto" ? "secondary" : "default"}
                          className="ml-auto text-[10px]"
                        >
                          {f.source}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No final codes assigned yet
                  </p>
                )}
              </div>

              {chart.coding_accuracy_score != null && (
                <div className="rounded-md border bg-muted/30 p-3">
                  <span className="text-sm font-medium">
                    Coding Accuracy Score:{" "}
                  </span>
                  <span className="font-semibold">
                    {Math.round(chart.coding_accuracy_score)}%
                  </span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <ul className="space-y-2">
                {documents.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center gap-2 rounded-md border p-3"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{d.file_name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {d.document_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {(d.size_bytes / 1024).toFixed(1)} KB
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {d.source}
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {format(new Date(d.created_at), "MMM d, yyyy")}
                    </span>
                  </li>
                ))}
                {documents.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No documents attached
                  </p>
                )}
              </ul>
            </TabsContent>

            <TabsContent value="comments" className="mt-4">
              <ul className="space-y-4">
                {comments.map((c) => (
                  <li key={c.id} className="rounded-md border p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {commentAuthors.get(c.author_id)?.full_name ?? "Unknown"}
                      </span>
                      <span className="text-muted-foreground">
                        {format(new Date(c.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{c.content}</p>
                  </li>
                ))}
                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No comments yet
                  </p>
                )}
              </ul>
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <div className="space-y-0">
                {auditEvents.map((e) => (
                  <TimelineEvent key={e.id} event={e} />
                ))}
                {auditEvents.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No audit events yet
                  </p>
                )}
              </div>
            </TabsContent>

            {chart.kognitos_run_id && (
              <TabsContent value="sop-run" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Run Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={run?.state.completed ? "success" : "secondary"}>
                        {runStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span>{runDuration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stage</span>
                      <span>{runStage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <span>{run?.stageVersion ?? "—"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Inputs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {run?.userInputs && Object.keys(run.userInputs).length > 0 ? (
                      <dl className="space-y-2 text-sm">
                        {Object.entries(run.userInputs).map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">{k}</dt>
                            <dd className="font-mono text-right">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="text-sm text-muted-foreground">No inputs</p>
                    )}
                  </CardContent>
                </Card>

                {run?.state.completed?.outputs && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Outputs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2 text-sm">
                        {Object.entries(run.state.completed.outputs).map(
                          ([k, v]) => (
                            <div key={k} className="flex justify-between gap-4">
                              <dt className="text-muted-foreground">{k}</dt>
                              <dd className="font-mono text-right">{v}</dd>
                            </div>
                          )
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Execution Trace</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-0">
                      {runEvents.map((e) => (
                        <RunTraceEvent key={e.id} event={e} />
                      ))}
                      {runEvents.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No events recorded
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="w-72 shrink-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {user && canPerformAction(user.role, "accept_codes") && (
                <Button
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => handleAction("accept_codes")}
                >
                  <CheckCircle className="h-4 w-4" />
                  Accept Codes
                </Button>
              )}
              {user && canPerformAction(user.role, "send_query") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => handleAction("send_query")}
                >
                  <Send className="h-4 w-4" />
                  Send Query
                </Button>
              )}
              {user && canPerformAction(user.role, "finalize") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => handleAction("finalize")}
                >
                  <FileCheck className="h-4 w-4" />
                  Finalize
                </Button>
              )}
              {user && canPerformAction(user.role, "audit") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => handleAction("audit")}
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Audit
                </Button>
              )}
              {user && canPerformAction(user.role, "override_codes") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => handleAction("override_codes")}
                >
                  <Edit3 className="h-4 w-4" />
                  Override Codes
                </Button>
              )}
              {user && canPerformAction(user.role, "assign") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    const uid = prompt("Enter user ID to assign:");
                    if (uid) handleAction("assign", { assigned_to: uid });
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  Assign
                </Button>
              )}
            </CardContent>
          </Card>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Encounter</span>
                <span>
                  {format(new Date(chart.encounter_date), "MMM d, yyyy")}
                </span>
              </div>
              {chart.discharge_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discharge</span>
                  <span>
                    {format(new Date(chart.discharge_date), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reimbursement</span>
                <span className="font-medium">
                  {currencyFmt.format(chart.estimated_reimbursement)}
                </span>
              </div>
              {assignedUser && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned to</span>
                  <span>{assignedUser.full_name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
