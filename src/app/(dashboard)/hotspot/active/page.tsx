"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Radio, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { PageSkeleton } from "@/components/ui/page-skeleton";

import type { HotspotActive } from "@/types/routeros";

function formatBytes(bytes: string): string {
  const num = parseInt(bytes, 10);
  if (isNaN(num)) return bytes || "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let unitIndex = 0;
  let value = num;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export default function HotspotActivePage() {
  const [activeUsers, setActiveUsers] = useState<HotspotActive[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchActive() {
    try {
      const res = await fetch("/api/hotspot/active");
      const data = await res.json();
      if (data.success) {
        setActiveUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch active users:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleKickUser = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/hotspot/active?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("User disconnected");
        fetchActive();
      } else {
        toast.error(data.error || "Failed to disconnect user");
      }
    } catch (error) {
      console.error("Failed to kick user:", error);
      toast.error("Failed to disconnect user");
    }
  }, []);

  const columns: ColumnDef<HotspotActive>[] = useMemo(
    () => [
      {
        accessorKey: "user",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="User" />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue("user")}</span>
        ),
      },
      {
        accessorKey: "address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="IP Address" />
        ),
      },
      {
        accessorKey: "mac-address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="MAC Address" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.getValue("mac-address")}
          </span>
        ),
      },
      {
        accessorKey: "uptime",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Uptime" />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">{row.getValue("uptime")}</Badge>
        ),
      },
      {
        accessorKey: "bytes-in",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Download" />
        ),
        cell: ({ row }) => formatBytes(row.getValue("bytes-in")),
      },
      {
        accessorKey: "bytes-out",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Upload" />
        ),
        cell: ({ row }) => formatBytes(row.getValue("bytes-out")),
      },
      {
        accessorKey: "server",
        header: "Server",
        cell: ({ row }) => (
          <Badge variant="secondary">{row.getValue("server")}</Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => handleKickUser(user[".id"])}
              title="Disconnect"
            >
              <X className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    [handleKickUser],
  );

  if (loading) {
    return <PageSkeleton rows={6} columns={6} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hotspot Active</h1>
          <p className="text-muted-foreground">
            Currently connected users ({activeUsers.length})
          </p>
        </div>
        <Button variant="outline" onClick={fetchActive}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className="h-5 w-5 text-green-500" />
            Active Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={activeUsers}
            searchPlaceholder="Search active users..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
