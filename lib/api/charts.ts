/**
 * API functions for the Chart entity.
 *
 * Read operations go through Supabase.
 * Simple writes (assign, status transitions) go directly to Supabase + audit event.
 * Complex writes (auto-coding, finalization) go through Kognitos SOPs via createRun.
 */

import type { Chart, Document, Comment, AuditEvent } from "@/lib/types";
import {
  getAllCharts,
  getChartById as _getChartById,
  getDocumentsForChart as _getDocumentsForChart,
  getCommentsForChart as _getCommentsForChart,
  getAuditEventsForChart as _getAuditEventsForChart,
  updateChart as _updateChart,
  insertChart as _insertChart,
  insertAuditEvent as _insertAuditEvent,
} from "@/lib/db";

export async function listCharts(): Promise<Chart[]> {
  return getAllCharts();
}

export async function getChartById(
  id: string,
): Promise<Chart | undefined> {
  return _getChartById(id);
}

export async function getDocumentsForChart(
  chartId: string,
): Promise<Document[]> {
  return _getDocumentsForChart(chartId);
}

export async function getCommentsForChart(
  chartId: string,
): Promise<Comment[]> {
  return _getCommentsForChart(chartId);
}

export async function getAuditEventsForChart(
  chartId: string,
): Promise<AuditEvent[]> {
  return _getAuditEventsForChart(chartId);
}

export async function updateChart(
  id: string,
  updates: Partial<Omit<Chart, "id">>,
): Promise<Chart> {
  return _updateChart(id, updates);
}

export async function insertChart(chart: Chart): Promise<Chart> {
  return _insertChart(chart);
}

export async function insertAuditEvent(event: {
  id: string;
  chart_id: string;
  action: string;
  actor_id: string | null;
  details: Record<string, unknown>;
}): Promise<AuditEvent> {
  return _insertAuditEvent(event);
}
