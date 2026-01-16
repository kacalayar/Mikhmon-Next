"use client";

import { useEffect, useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Users, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

interface LogEntry {
  time: string;
  message: string;
  topics?: string;
}

export default function UserLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/logs?topics=account");
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
        accessorKey: "message",
        header: "Message",
        cell: ({ row }) => (
          <span className="text-xs">{row.getValue("message")}</span>
        ),
      },
      {
        accessorKey: "topics",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Topics" />
        ),
        cell: ({ row }) => (
          <span className="text-xs">{row.getValue("topics") || "-"}</span>
        ),
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>User Log</span>
            <span className="text-sm font-normal text-muted-foreground">
              |{" "}
              <button onClick={refreshLogs} className="hover:text-primary">
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
