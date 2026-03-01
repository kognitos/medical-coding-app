"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Plus } from "lucide-react";

import type { Chart } from "@/lib/types";
import { DOMAIN } from "@/lib/domain.config";
import { listCharts, insertChart, insertAuditEvent } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { canPerformAction } from "@/lib/role-permissions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WorklistFiltersBar,
  type WorklistFilters,
} from "@/components/worklist/worklist-filters";
import { WorklistTable } from "@/components/worklist/worklist-table";

const defaultFilters: WorklistFilters = {
  search: "",
  statuses: [],
  priority: null,
};

function applyFilters(items: Chart[], filters: WorklistFilters): Chart[] {
  let result = items;

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((c) => {
      return (
        c.title.toLowerCase().includes(q) ||
        c.patient_mrn.toLowerCase().includes(q) ||
        c.encounter_number.toLowerCase().includes(q) ||
        c.provider_name.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    });
  }

  if (filters.statuses.length > 0) {
    result = result.filter((c) => filters.statuses.includes(c.status));
  }

  if (filters.priority) {
    result = result.filter((c) => c.priority === filters.priority);
  }

  return result;
}

function exportToCSV(items: Chart[]) {
  const headers = [
    "ID",
    "Patient MRN",
    "Encounter #",
    "Title",
    "Provider",
    "Department",
    "Status",
    "Priority",
    "Est. Reimbursement",
    "Encounter Date",
    "Discharge Date",
  ];
  const rows = items.map((c) => [
    c.id,
    c.patient_mrn,
    c.encounter_number,
    c.title,
    c.provider_name,
    c.department,
    c.status,
    c.priority,
    c.estimated_reimbursement,
    c.encounter_date,
    c.discharge_date ?? "",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${v}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${DOMAIN.entitySlug}-worklist.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function WorklistPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const userRole = user?.role ?? "coder";
  const showCreate = canPerformAction(userRole, "review_codes");

  const [allItems, setAllItems] = useState<Chart[]>([]);
  const [filters, setFilters] = useState<WorklistFilters>(defaultFilters);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newPriority, setNewPriority] = useState<string>("routine");

  useEffect(() => {
    listCharts().then(setAllItems);
  }, []);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setFilters((prev) => ({ ...prev, search: q }));
  }, [searchParams]);

  const filteredItems = useMemo(
    () => applyFilters(allItems, filters),
    [allItems, filters],
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {DOMAIN.entity.plural} Worklist
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {filteredItems.length}{" "}
              {filteredItems.length !== 1
                ? DOMAIN.entity.plural.toLowerCase()
                : DOMAIN.entity.singular.toLowerCase()}
              {filters.search || filters.statuses.length > 0 || filters.priority
                ? " matching filters"
                : " total"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => exportToCSV(filteredItems)}
            >
              <Download className="size-4" />
              Download CSV
            </Button>
            {showCreate && (
              <Button
                className="gap-1.5"
                onClick={() => setShowNewDialog(true)}
              >
                <Plus className="size-4" />
                New {DOMAIN.entity.singular}
              </Button>
            )}
          </div>
        </div>

        <WorklistFiltersBar filters={filters} onFiltersChange={setFilters} />

        <WorklistTable items={filteredItems} />
      </div>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New {DOMAIN.entity.singular}</DialogTitle>
            <DialogDescription>
              Add a new chart for coding. Fill in the patient and encounter details.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);
              const title = (formData.get("title") as string) || "";
              const patientMrn = (formData.get("patientMrn") as string) || "";
              const encounterNumber = (formData.get("encounterNumber") as string) || "";
              const providerName = (formData.get("providerName") as string) || "";
              const department = (formData.get("department") as string) || "";

              const now = new Date().toISOString();
              const chartId = `cht-new-${Date.now()}`;
              const newItem: Chart = {
                id: chartId,
                org_id: user?.org_id ?? "org-1",
                title,
                description: "",
                patient_mrn: patientMrn,
                encounter_number: encounterNumber,
                encounter_date: now,
                discharge_date: null,
                provider_name: providerName,
                department,
                assigned_to: null,
                status: "pending_coding",
                priority: newPriority as Chart["priority"],
                category: department,
                suggested_codes: [],
                final_codes: [],
                drg: null,
                estimated_reimbursement: 0,
                coding_accuracy_score: null,
                coded_at: null,
                finalized_at: null,
                created_at: now,
                updated_at: now,
                kognitos_run_id: "",
                episode_id: null,
              };

              try {
                const saved = await insertChart(newItem);
                await insertAuditEvent({
                  id: `ae-${Date.now()}`,
                  chart_id: chartId,
                  action: "chart_created",
                  actor_id: user?.id ?? null,
                  details: { title, department, priority: newPriority },
                });
                setAllItems((prev) => [saved, ...prev]);
                setShowNewDialog(false);
                setNewPriority("routine");
                form.reset();
              } catch (err) {
                alert(`Failed to create chart: ${err instanceof Error ? err.message : String(err)}`);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Chart Title</Label>
              <Input id="title" name="title" type="text" required placeholder="Patient Name — Visit Type" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="patientMrn">Patient MRN</Label>
                <Input id="patientMrn" name="patientMrn" type="text" required placeholder="MRN-100XXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="encounterNumber">Encounter #</Label>
                <Input id="encounterNumber" name="encounterNumber" type="text" required placeholder="ENC-2026-XXXX" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="providerName">Provider</Label>
              <Input id="providerName" name="providerName" type="text" placeholder="Dr. ..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" type="text" placeholder="e.g. Inpatient, Emergency" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={newPriority} onValueChange={setNewPriority}>
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAIN.priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create {DOMAIN.entity.singular}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
