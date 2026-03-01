"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { queryRuleMetrics } from "@/lib/queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getRuleById } from "@/lib/api";
import type { Rule } from "@/lib/types";

const HIGHLIGHT_KEYWORDS = [
  "Check",
  "Verify",
  "Confirm",
  "Review",
  "Flag",
  "Must",
  "Required",
];

function renderCriteria(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("##")) {
      const level = line.match(/^#+/)?.[0].length ?? 2;
      const text = line.replace(/^#+\s*/, "");
      if (level === 2)
        return (
          <h2 key={i} className="mt-6 mb-3 text-xl font-bold text-foreground first:mt-0">
            {text}
          </h2>
        );
      return (
        <h3 key={i} className="mt-5 mb-2 text-lg font-semibold text-foreground">
          {text}
        </h3>
      );
    }

    let processed: React.ReactNode = line;
    for (const kw of HIGHLIGHT_KEYWORDS) {
      if (line.includes(kw)) {
        const parts = line.split(new RegExp(`(${kw})`, "g"));
        processed = parts.map((part, j) =>
          part === kw ? (
            <span key={j} className="font-bold text-blue-600">{part}</span>
          ) : (
            <span key={j}>{part}</span>
          )
        );
        break;
      }
    }

    if (line.startsWith("  - ")) {
      return (
        <div key={i} className="flex gap-2 py-0.5 pl-8">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
          <span className="text-sm leading-relaxed">{typeof processed === "string" ? processed.slice(4) : processed}</span>
        </div>
      );
    }

    if (line.startsWith("- ")) {
      return (
        <div key={i} className="flex gap-2 py-0.5 pl-4">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
          <span className="text-sm leading-relaxed">{typeof processed === "string" ? processed.slice(2) : processed}</span>
        </div>
      );
    }

    if (line.match(/^\d+\.\s/)) {
      return (
        <p key={i} className="py-0.5 pl-4 text-sm leading-relaxed">{processed}</p>
      );
    }

    if (line.trim() === "") {
      return <div key={i} className="h-2" />;
    }

    return (
      <p key={i} className="text-sm leading-relaxed">{processed}</p>
    );
  });
}

export default function RuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [rule, setRule] = useState<Rule | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [metrics, setMetrics] = useState<{
    hit_rate: number;
    approval_rate: number;
  } | null>(null);

  useEffect(() => {
    getRuleById(id).then((r) => {
      if (!r) setNotFound(true);
      else setRule(r);
    });
    queryRuleMetrics(id).then(setMetrics);
  }, [id]);

  if (notFound) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Rule not found</p>
      </div>
    );
  }

  if (!rule) return null;

  return (
    <div className="space-y-6">
      <Link href="/rules">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Rules
        </Button>
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{rule.name}</h1>
          <Badge variant={rule.is_active ? "default" : "secondary"}>
            {rule.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{rule.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {rule.category}
          </span>
          <span>
            Created {format(new Date(rule.created_at), "MMM d, yyyy")}
          </span>
          <span>
            Updated {format(new Date(rule.updated_at), "MMM d, yyyy")}
          </span>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Criteria Text */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              {renderCriteria(rule.criteria)}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-72 shrink-0 space-y-4">
          {/* Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Rule Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {metrics && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      Hit Rate
                    </div>
                    <span className="text-sm font-semibold">
                      {Math.round(metrics.hit_rate * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      Approval Rate
                    </div>
                    <span className="text-sm font-semibold">
                      {Math.round(metrics.approval_rate * 100)}%
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Rule Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs">{rule.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span>{rule.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={rule.is_active ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {rule.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
