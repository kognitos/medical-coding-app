/**
 * Central domain configuration for the Medical Coding (CPT/ICD-10) application.
 *
 * Every generic component (sidebar, topbar, status-badge, worklist-filters,
 * login, role-permissions) reads from this config.
 */

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning";

export interface StatusConfig {
  value: string;
  label: string;
  variant: BadgeVariant;
}

export interface RoleConfig {
  value: string;
  label: string;
  defaultPath: string;
  allowedPaths: string[] | ["*"];
  actions: string[] | ["*"];
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
}

export const DOMAIN = {
  appName: "MedCode",
  appDescription: "Autonomous Medical Coding Platform",
  appLogo: "Stethoscope",
  entitySlug: "charts",

  entity: {
    singular: "Chart",
    plural: "Charts",
  },

  statuses: [
    { value: "pending_coding", label: "Pending Coding", variant: "secondary" },
    { value: "auto_coded", label: "Auto-Coded", variant: "default" },
    { value: "in_review", label: "In Review", variant: "warning" },
    { value: "query_sent", label: "Query Sent", variant: "outline" },
    { value: "coded", label: "Coded", variant: "success" },
    { value: "audited", label: "Audited", variant: "success" },
    { value: "finalized", label: "Finalized", variant: "success" },
  ] satisfies StatusConfig[],

  terminalStatuses: ["finalized"],

  priorities: [
    { value: "stat", label: "STAT" },
    { value: "routine", label: "Routine" },
  ],

  roles: [
    {
      value: "coder",
      label: "Coder",
      defaultPath: "/",
      allowedPaths: ["/", "/charts", "/rules", "/notifications"],
      actions: ["review_codes", "accept_codes", "modify_codes", "send_query", "finalize"],
    },
    {
      value: "auditor",
      label: "Auditor",
      defaultPath: "/",
      allowedPaths: ["/", "/charts", "/rules", "/notifications", "/dashboard"],
      actions: ["audit", "override_codes", "send_query", "reject_codes"],
    },
    {
      value: "coding_manager",
      label: "Coding Manager",
      defaultPath: "/dashboard",
      allowedPaths: ["/", "/charts", "/dashboard", "/rules", "/notifications", "/settings"],
      actions: ["assign", "audit", "override_codes"],
    },
    {
      value: "admin",
      label: "Admin",
      defaultPath: "/dashboard",
      allowedPaths: ["*"],
      actions: ["*"],
    },
  ] satisfies RoleConfig[],

  navItems: [
    { label: "Worklist", href: "/", icon: "ClipboardList" },
    { label: "Dashboard", href: "/dashboard", icon: "BarChart3" },
    { label: "Coding Rules", href: "/rules", icon: "BookOpen" },
    { label: "Notifications", href: "/notifications", icon: "Bell" },
    { label: "Settings", href: "/settings", icon: "Settings", roles: ["admin", "coding_manager"] },
  ] satisfies NavItem[],
} as const;

export function getStatusConfig(value: string): StatusConfig | undefined {
  return (DOMAIN.statuses as readonly StatusConfig[]).find((s) => s.value === value);
}

export function getRoleConfig(value: string): RoleConfig | undefined {
  return (DOMAIN.roles as readonly RoleConfig[]).find((r) => r.value === value);
}
