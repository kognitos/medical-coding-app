/**
 * Async analytics query functions for medical coding metrics.
 */

import {
  getAllCharts,
  getAllNotifications,
  getAllRules,
} from "@/lib/db";

const CODED_STATUSES = ["coded", "audited", "finalized"];
const NON_FINAL_STATUSES = ["pending_coding", "auto_coded", "in_review", "query_sent", "coded", "audited"];

/** Count of charts not yet finalized (DNFC). */
export async function queryDNFCCount(): Promise<number> {
  const charts = await getAllCharts();
  return charts.filter((c) => NON_FINAL_STATUSES.includes(c.status)).length;
}

/**
 * Percentage of auto-coded charts where suggested codes were accepted
 * without modification (final_codes match suggested_codes).
 */
export async function queryCodingAccuracyRate(): Promise<number> {
  const charts = await getAllCharts();
  const coded = charts.filter((c) => CODED_STATUSES.includes(c.status));
  if (coded.length === 0) return 0;

  const accepted = coded.filter((c) => {
    if (!c.suggested_codes?.length || !c.final_codes?.length) return false;
    const suggestedSet = new Set(c.suggested_codes.map((s) => s.code));
    const finalSet = new Set(c.final_codes.map((f) => f.code));
    if (suggestedSet.size !== finalSet.size) return false;
    for (const code of suggestedSet) {
      if (!finalSet.has(code)) return false;
    }
    return true;
  });

  return (accepted.length / coded.length) * 100;
}

/** Average hours from created_at to coded_at for coded charts. */
export async function queryAvgTimeToCode(): Promise<number> {
  const charts = await getAllCharts();
  const withDates = charts.filter((c) => c.coded_at);
  if (withDates.length === 0) return 0;
  const totalHours = withDates.reduce((sum, c) => {
    return (
      sum +
      (new Date(c.coded_at!).getTime() - new Date(c.created_at).getTime()) /
        3_600_000
    );
  }, 0);
  return totalHours / withDates.length;
}

/** Sum of estimated_reimbursement for non-finalized charts. */
export async function queryRevenueAtRisk(): Promise<number> {
  const charts = await getAllCharts();
  return charts
    .filter((c) => c.status !== "finalized")
    .reduce((sum, c) => sum + (c.estimated_reimbursement || 0), 0);
}

/** Count of charts grouped by status. */
export async function queryStatusBreakdown(): Promise<
  { status: string; count: number }[]
> {
  const charts = await getAllCharts();
  const counts: Record<string, number> = {};
  for (const c of charts) {
    counts[c.status] = (counts[c.status] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

/** Number of unread notifications for a given user. */
export async function queryUnreadNotificationCount(
  userId: string,
): Promise<number> {
  const notifs = await getAllNotifications();
  return notifs.filter((n) => n.user_id === userId && !n.is_read).length;
}

/** Count of charts grouped by department/service line. */
export async function queryCategoryBreakdown(): Promise<
  { category: string; count: number }[]
> {
  const charts = await getAllCharts();
  const counts: Record<string, number> = {};
  for (const c of charts) {
    const cat = c.category || "Uncategorized";
    counts[cat] = (counts[cat] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * For a given rule, compute hit_rate and acceptance_rate
 * against charts in matching categories.
 */
export async function queryRuleMetrics(
  ruleId: string,
): Promise<{ hit_rate: number; approval_rate: number }> {
  const [charts, rules] = await Promise.all([
    getAllCharts(),
    getAllRules(),
  ]);

  const rule = rules.find((r) => r.id === ruleId);
  if (!rule || charts.length === 0) return { hit_rate: 0, approval_rate: 0 };

  const hitCharts = charts.filter((c) => c.category === rule.category);
  const hit_rate = hitCharts.length / charts.length;

  const coded = hitCharts.filter((c) => CODED_STATUSES.includes(c.status));
  const finalized = coded.filter((c) => c.status === "finalized" || c.status === "audited");
  const approval_rate = coded.length > 0 ? finalized.length / coded.length : 0;

  return { hit_rate, approval_rate };
}
