/**
 * Data access layer — all reads go through Supabase.
 * Table names match the medical coding schema.
 */

import { supabase } from "./supabase";
import type {
  Chart,
  User,
  Document,
  Comment,
  AuditEvent,
  Notification,
  Rule,
} from "./types";

function sb() {
  if (!supabase)
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  return supabase;
}

// ── Full-table fetchers ────────────────────────────────────────

export async function getAllCharts(): Promise<Chart[]> {
  const { data, error } = await sb().from("charts").select("*");
  if (error) throw error;
  return data as Chart[];
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await sb().from("users").select("*");
  if (error) throw error;
  return data as User[];
}

export async function getAllDocuments(): Promise<Document[]> {
  const { data, error } = await sb().from("documents").select("*");
  if (error) throw error;
  return data as Document[];
}

export async function getAllComments(): Promise<Comment[]> {
  const { data, error } = await sb().from("comments").select("*");
  if (error) throw error;
  return data as Comment[];
}

export async function getAllAuditEvents(): Promise<AuditEvent[]> {
  const { data, error } = await sb().from("audit_events").select("*");
  if (error) throw error;
  return data as AuditEvent[];
}

export async function getAllNotifications(): Promise<Notification[]> {
  const { data, error } = await sb().from("notifications").select("*");
  if (error) throw error;
  return data as Notification[];
}

export async function getAllRules(): Promise<Rule[]> {
  const { data, error } = await sb().from("rules").select("*");
  if (error) throw error;
  return data as Rule[];
}

// ── Single-record fetchers ─────────────────────────────────────

export async function getChartById(id: string): Promise<Chart | undefined> {
  const { data, error } = await sb()
    .from("charts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return data as Chart;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const { data, error } = await sb()
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return data as User;
}

export async function getRuleById(id: string): Promise<Rule | undefined> {
  const { data, error } = await sb()
    .from("rules")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return data as Rule;
}

// ── Relational fetchers ────────────────────────────────────────

export async function getDocumentsForChart(chartId: string): Promise<Document[]> {
  const { data, error } = await sb()
    .from("documents")
    .select("*")
    .eq("chart_id", chartId);
  if (error) throw error;
  return data as Document[];
}

export async function getCommentsForChart(chartId: string): Promise<Comment[]> {
  const { data, error } = await sb()
    .from("comments")
    .select("*")
    .eq("chart_id", chartId);
  if (error) throw error;
  return data as Comment[];
}

export async function getAuditEventsForChart(chartId: string): Promise<AuditEvent[]> {
  const { data, error } = await sb()
    .from("audit_events")
    .select("*")
    .eq("chart_id", chartId);
  if (error) throw error;
  return data as AuditEvent[];
}

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  const { data, error } = await sb()
    .from("notifications")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data as Notification[];
}

// ── Write operations ──────────────────────────────────────────

export async function updateChart(
  id: string,
  updates: Partial<Omit<Chart, "id">>,
): Promise<Chart> {
  const { data, error } = await sb()
    .from("charts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Chart;
}

export async function insertChart(chart: Chart): Promise<Chart> {
  const { data, error } = await sb()
    .from("charts")
    .insert(chart)
    .select("*")
    .single();
  if (error) throw error;
  return data as Chart;
}

export async function insertAuditEvent(event: {
  id: string;
  chart_id: string;
  action: string;
  actor_id: string | null;
  details: Record<string, unknown>;
}): Promise<AuditEvent> {
  const { data, error } = await sb()
    .from("audit_events")
    .insert(event)
    .select("*")
    .single();
  if (error) throw error;
  return data as AuditEvent;
}
