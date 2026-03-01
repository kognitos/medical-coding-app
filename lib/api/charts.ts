/**
 * API functions for the Chart entity.
 */

import type { Chart, Document, Comment, AuditEvent } from "@/lib/types";
import {
  getAllCharts,
  getChartById as _getChartById,
  getDocumentsForChart as _getDocumentsForChart,
  getCommentsForChart as _getCommentsForChart,
  getAuditEventsForChart as _getAuditEventsForChart,
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
