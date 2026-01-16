"use client";

import { useEffect, useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { PageSkeleton } from "@/components/ui/page-skeleton";

interface LogEntry {
  time: string;
  message: string;
  topics?: string;
}

export default function HotspotLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/logs?topics=hotspot,info,debug");
      const data = await res.json();
      if (data.success) {
        setLogs(data.data.reverse());
      }
    } catch (error) {
      console.error("Failed to refresh logs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshLogs();
  }, []);

  const columns: ColumnDef<LogEntry>[] = useMemo(
    () => [
      {
        accessorKey: "time",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Time" />
        ),
        cell: ({ row }) => (
          <span className="text-xs">{row.getValue("time")}</span>
        ),
      },
      {
        id: "user",
        header: "User (IP)",
        cell: ({ row }) => {
          const message = row.original.message;
          if (message.startsWith("->")) {
            const parts = message.split(":");
            if (parts.length > 6) {
              return (
                <span className="text-xs">{parts.slice(1, 7).join(":")}</span>
              );
            } else if (parts.length > 1) {
              return <span className="text-xs">{parts[1]}</span>;
            }
          }
          return "-";
        },
      },
      {
        id: "message",
        header: "Message",
        cell: ({ row }) => {
          const message = row.original.message;
          if (message.startsWith("->")) {
            const parts = message.split(":");
            if (parts.length > 6) {
              return (
                <span className="text-xs">
                  {parts.slice(7).join(":").replace("trying to", "").trim()}
                </span>
              );
            } else if (parts.length > 2) {
              return (
                <span className="text-xs">
                  {parts.slice(2).join(":").replace("trying to", "").trim()}
                </span>
              );
            }
          }
          return <span className="text-xs">{message}</span>;
        },
      },
    ],
    [],
  );

  if (loading) {
    return <PageSkeleton rows={8} columns={3} />;
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Hotspot Log</span>
            <span className="text-sm font-normal text-muted-foreground">
              |{" "}
              <button
                onClick={refreshLogs}
                className="cursor-pointer hover:text-primary"
              >
                <RefreshCw className="inline h-3 w-3" />
              </button>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            data={logs}
            searchPlaceholder="Search logs..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
