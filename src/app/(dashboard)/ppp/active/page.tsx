"use client";

import { useEffect, useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Activity, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { PageSkeleton } from "@/components/ui/page-skeleton";

interface PPPActive {
  ".id": string;
  name: string;
  service?: string;
  "caller-id"?: string;
  address?: string;
  uptime?: string;
}

export default function PPPActivePage() {
  const [active, setActive] = useState<PPPActive[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshActive() {
    setLoading(true);
    try {
      const res = await fetch("/api/ppp/active");
      const data = await res.json();
      if (data.success) {
        setActive(data.data);
      }
    } catch (error) {
      console.error("Failed to refresh active:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshActive();
  }, []);

  const columns: ColumnDef<PPPActive>[] = useMemo(
    () => [
      {
        id: "count",
        header: () => <div className="text-center">{active.length}</div>,
        cell: () => null,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
      },
      {
        accessorKey: "service",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Service" />
        ),
        cell: ({ row }) => row.getValue("service") || "-",
      },
      {
        accessorKey: "caller-id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Caller ID" />
        ),
        cell: ({ row }) => row.getValue("caller-id") || "-",
      },
      {
        accessorKey: "address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Address" />
        ),
        cell: ({ row }) => row.getValue("address") || "-",
      },
      {
        accessorKey: "uptime",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Uptime" />
        ),
        cell: ({ row }) => row.getValue("uptime") || "-",
      },
    ],
    [active],
  );

  if (loading) {
    return <PageSkeleton rows={5} columns={5} />;
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <span>PPP Active</span>
            <span className="text-sm font-normal text-muted-foreground">
              |{" "}
              <button
                onClick={refreshActive}
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
            data={active}
            searchPlaceholder="Search active connections..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
