"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Clock,
  FileCheck,
  AlertTriangle,
  ClipboardList,
  Zap,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/domain/status-badge";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { DOMAIN, getStatusConfig } from "@/lib/domain.config";
import { listCharts, queryInsights, queryMetrics } from "@/lib/api";
import {
  queryDNFCCount,
  queryCodingAccuracyRate,
  queryAvgTimeToCode,
  queryRevenueAtRisk,
  queryStatusBreakdown,
  queryCategoryBreakdown,
} from "@/lib/queries";
import type {
  Chart,
  KognitosInsights,
  KognitosMetricResult,
} from "@/lib/types";

// ── Colors ──────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending_coding: "oklch(0.556 0 0)",
  auto_coded: "oklch(0.615 0.133 261.34)",
  in_review: "oklch(0.769 0.165 70.08)",
  query_sent: "oklch(0.776 0.003 264.539)",
  coded: "oklch(0.635 0.185 147.775)",
  audited: "oklch(0.741 0.199 147.068)",
  finalized: "oklch(0.858 0.164 114.307)",
};

const CATEGORY_COLORS = [
  "oklch(0.858 0.164 114.307)",
  "oklch(0.615 0.133 261.34)",
  "oklch(0.769 0.165 70.08)",
  "oklch(0.635 0.185 147.775)",
  "oklch(0.741 0.199 147.068)",
  "oklch(0.776 0.003 264.539)",
  "oklch(0.556 0 0)",
];

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// ── KPI Card ────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  trendDirection,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  trendDirection?: "up" | "down";
}) {
  return (
    <Card className="gap-4 py-5">
      <CardContent className="flex items-start justify-between px-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                trendDirection === "up" ? "text-success" : "text-destructive"
              }`}
            >
              {trendDirection === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {trend}
            </div>
          )}
        </div>
        <div className="rounded-md bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Drill-Down Table ────────────────────────────────────────────

function DrillDownTable({ items }: { items: Chart[] }) {
  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Est. Reimb.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-8 text-center text-muted-foreground"
              >
                No {DOMAIN.entity.plural.toLowerCase()} match this filter
              </TableCell>
            </TableRow>
          )}
          {items.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <Link
                  href={`/${DOMAIN.entitySlug}/${c.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {c.id}
                </Link>
              </TableCell>
              <TableCell className="max-w-[180px] truncate">
                {c.title}
              </TableCell>
              <TableCell>{c.department}</TableCell>
              <TableCell>
                <StatusBadge status={c.status} />
              </TableCell>
              <TableCell className="text-right">
                {currencyFmt.format(c.estimated_reimbursement)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Dashboard Page ──────────────────────────────────────────────

export default function DashboardPage() {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [dnfcCount, setDnfccount] = useState(0);
  const [codingAccuracy, setCodingAccuracy] = useState(0);
  const [avgTimeToCode, setAvgTimeToCode] = useState(0);
  const [revenueAtRisk, setRevenueAtRisk] = useState(0);
  const [statusData, setStatusData] = useState<
    { status: string; count: number }[]
  >([]);
  const [categoryData, setCategoryData] = useState<
    { category: string; count: number }[]
  >([]);
  const [insights, setInsights] = useState<KognitosInsights | null>(null);
  const [metrics, setMetrics] = useState<KognitosMetricResult[]>([]);
  const [drillDown, setDrillDown] = useState<{
    title: string;
    items: Chart[];
  } | null>(null);

  useEffect(() => {
    Promise.all([
      listCharts(),
      queryDNFCCount(),
      queryCodingAccuracyRate(),
      queryAvgTimeToCode(),
      queryRevenueAtRisk(),
      queryStatusBreakdown(),
      queryCategoryBreakdown(),
      queryInsights(),
      queryMetrics(),
    ]).then(
      ([
        chs,
        dnfc,
        acc,
        avgT,
        rev,
        statusBk,
        catBk,
        ins,
        metricRes,
      ]) => {
        setCharts(chs);
        setDnfccount(dnfc);
        setCodingAccuracy(acc);
        setAvgTimeToCode(avgT);
        setRevenueAtRisk(rev);
        setStatusData(statusBk);
        setCategoryData(catBk);
        setInsights(ins);
        setMetrics(metricRes.results);
      },
    );
  }, []);

  const totalRuns = insights?.runInsight.totalRunsCount ?? 0;

  const statusChartData = useMemo(
    () =>
      statusData.map((d) => ({
        name: getStatusConfig(d.status)?.label ?? d.status.replace(/_/g, " "),
        value: d.count,
        fill: STATUS_COLORS[d.status] ?? "oklch(0.556 0 0)",
        rawStatus: d.status,
      })),
    [statusData],
  );

  const categoryChartData = useMemo(
    () =>
      categoryData.map((d, i) => ({
        name: d.category,
        value: d.count,
        fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      })),
    [categoryData],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Medical coding analytics and performance overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="DNFC Count"
          value={dnfcCount.toString()}
          icon={AlertTriangle}
        />
        <KpiCard
          label="Coding Accuracy"
          value={`${Math.round(codingAccuracy)}%`}
          icon={FileCheck}
        />
        <KpiCard
          label="Avg Time to Code"
          value={`${avgTimeToCode.toFixed(1)} hrs`}
          icon={Clock}
        />
        <KpiCard
          label="Revenue at Risk"
          value={currencyFmt.format(revenueAtRisk)}
          icon={DollarSign}
        />
        <KpiCard
          label={`Total ${DOMAIN.entity.plural}`}
          value={charts.length.toString()}
          icon={ClipboardList}
        />
        <KpiCard
          label="Kognitos Runs"
          value={totalRuns.toString()}
          icon={Zap}
        />
      </div>

      {/* Charts 2-up */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Status PieChart (donut) */}
        <Card>
          <CardHeader>
            <CardTitle>{DOMAIN.entity.plural} by Status</CardTitle>
            <p className="text-xs text-muted-foreground">
              Click a slice to see {DOMAIN.entity.plural.toLowerCase()}
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                  fontSize={11}
                  className="cursor-pointer"
                  onClick={(data) => {
                    const status = data.rawStatus;
                    setDrillDown({
                      title: `${data.name} (${data.value})`,
                      items: charts.filter((c) => c.status === status),
                    });
                  }}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department/Service Line BarChart (horizontal) */}
        <Card>
          <CardHeader>
            <CardTitle>{DOMAIN.entity.plural} by Department</CardTitle>
            <p className="text-xs text-muted-foreground">
              Click a bar to see {DOMAIN.entity.plural.toLowerCase()}
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  barSize={28}
                  name="Count"
                  className="cursor-pointer"
                  onClick={(data) => {
                    const payload = (
                      data as unknown as {
                        payload: { name: string; value: number };
                      }
                    ).payload;
                    setDrillDown({
                      title: `${payload.name} (${payload.value})`,
                      items: charts.filter(
                        (c) => (c.category || "Uncategorized") === payload.name,
                      ),
                    });
                  }}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cat-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Kognitos Automation Insights */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Kognitos Automation Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Runs
                </p>
                <p className="text-lg font-bold">{totalRuns}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  STP Rate
                </p>
                <p className="text-lg font-bold">
                  {insights.completionInsight.stp}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Time Saved
                </p>
                <p className="text-lg font-bold">
                  {Math.round(insights.valueInsight.totalTimeSavedSecs / 60)}{" "}
                  min
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Awaiting Guidance
                </p>
                <p className="text-lg font-bold">
                  {insights.awaitingGuidanceInsight.totalRunsAwaitingGuidance}
                </p>
              </div>
            </div>

            {insights.completionInsight.completionsPerPeriod.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Completions per Period
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">
                        Auto-Completed
                      </TableHead>
                      <TableHead className="text-right">
                        Manually Resolved
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {insights.completionInsight.completionsPerPeriod.map(
                      (p) => (
                        <TableRow key={p.windowLabel}>
                          <TableCell>{p.windowLabel}</TableCell>
                          <TableCell className="text-right">
                            {p.autoCompletedCount}
                          </TableCell>
                          <TableCell className="text-right">
                            {p.manuallyResolvedCount}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Drill-Down Sheet */}
      <Sheet
        open={drillDown !== null}
        onOpenChange={(open) => {
          if (!open) setDrillDown(null);
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-4xl">
          <SheetHeader>
            <SheetTitle>{drillDown?.title}</SheetTitle>
            <SheetDescription>
              {drillDown?.items.length ?? 0}{" "}
              {(drillDown?.items.length ?? 0) !== 1
                ? DOMAIN.entity.plural.toLowerCase()
                : DOMAIN.entity.singular.toLowerCase()}{" "}
              — click an ID to view details
            </SheetDescription>
          </SheetHeader>
          {drillDown && <DrillDownTable items={drillDown.items} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
