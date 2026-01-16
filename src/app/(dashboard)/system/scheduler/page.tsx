"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Clock, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

interface Scheduler {
  ".id": string;
  name: string;
  "start-date"?: string;
  "start-time"?: string;
  interval?: string;
  disabled?: string;
  "next-run"?: string;
  comment?: string;
}

export default function SchedulerPage() {
  const [schedulers, setSchedulers] = useState<Scheduler[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshSchedulers() {
    setLoading(true);
    try {
      const res = await fetch("/api/system/scheduler");
      const data = await res.json();
      if (data.success) {
        setSchedulers(data.data);
      }
    } catch (error) {
      console.error("Failed to refresh schedulers:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshSchedulers();
  }, []);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`Are you sure to delete scheduler (${name})?`)) return;

    try {
      const res = await fetch(`/api/system/scheduler?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Scheduler deleted");
        refreshSchedulers();
      } else {
        toast.error(data.error || "Failed to delete scheduler");
      }
    } catch (error) {
      console.error("Failed to delete scheduler:", error);
      toast.error("Failed to delete scheduler");
    }
  }, []);

  const columns: ColumnDef<Scheduler>[] = useMemo(
    () => [
      {
        id: "actions",
        header: () => <div className="text-center">{schedulers.length}</div>,
        cell: ({ row }) => {
          const scheduler = row.original;
          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleDelete(scheduler[".id"], scheduler.name)}
                className="text-destructive hover:text-destructive/80"
                title={`Remove ${scheduler.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
      },
      {
        accessorKey: "start-time",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Start Time" />
        ),
        cell: ({ row }) => row.getValue("start-time") || "-",
      },
      {
        accessorKey: "interval",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Interval" />
        ),
        cell: ({ row }) => row.getValue("interval") || "-",
      },
      {
        accessorKey: "next-run",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Next Run" />
        ),
        cell: ({ row }) => row.getValue("next-run") || "-",
      },
      {
        accessorKey: "disabled",
        header: "Status",
        cell: ({ row }) => {
          const disabled = row.getValue("disabled");
          return disabled === "true" ? (
            <Badge variant="secondary">Disabled</Badge>
          ) : (
            <Badge variant="default">Enabled</Badge>
          );
        },
      },
      {
        accessorKey: "comment",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Comment" />
        ),
        cell: ({ row }) => row.getValue("comment") || "-",
      },
    ],
    [schedulers, handleDelete],
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
            <Clock className="h-5 w-5" />
            <span>Scheduler</span>
            <span className="text-sm font-normal text-muted-foreground">
              |{" "}
              <button
                onClick={refreshSchedulers}
                className="hover:text-primary"
              >
                <RefreshCw className="inline h-3 w-3" />
              </button>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            data={schedulers}
            searchPlaceholder="Search schedulers..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
