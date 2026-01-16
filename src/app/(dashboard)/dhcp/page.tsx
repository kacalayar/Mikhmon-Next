"use client";

import { useEffect, useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Network, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

interface DhcpLease {
  ".id": string;
  address?: string;
  "mac-address"?: string;
  server?: string;
  "active-address"?: string;
  "active-mac-address"?: string;
  "host-name"?: string;
  status?: string;
  dynamic?: string;
}

export default function DHCPPage() {
  const [leases, setLeases] = useState<DhcpLease[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLeases() {
    setLoading(true);
    try {
      const res = await fetch("/api/dhcp/leases");
      const data = await res.json();
      if (data.success) {
        setLeases(data.data);
      }
    } catch (error) {
      console.error("Failed to load DHCP leases:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeases();
  }, []);

  const columns: ColumnDef<DhcpLease>[] = useMemo(
    () => [
      {
        id: "type",
        header: () => <div className="text-center">Type</div>,
        cell: ({ row }) => {
          const isDynamic = row.original.dynamic === "true";
          return (
            <div className="flex justify-center">
              <Badge variant={isDynamic ? "default" : "secondary"} title={isDynamic ? "Dynamic" : "Static"}>
                {isDynamic ? "D" : "S"}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Address" />
        ),
        cell: ({ row }) => row.original.address || "-",
      },
      {
        accessorKey: "mac-address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="MAC Address" />
        ),
        cell: ({ row }) => row.original["mac-address"] || "-",
      },
      {
        accessorKey: "server",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Server" />
        ),
        cell: ({ row }) => row.original.server || "-",
      },
      {
        accessorKey: "active-address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Active Address" />
        ),
        cell: ({ row }) => row.original["active-address"] || "-",
      },
      {
        accessorKey: "active-mac-address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Active MAC Address" />
        ),
        cell: ({ row }) => row.original["active-mac-address"] || "-",
      },
      {
        accessorKey: "host-name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Active Host Name" />
        ),
        cell: ({ row }) => row.original["host-name"] || "-",
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.original.status || "-";
          return (
            <Badge variant={status === "bound" ? "default" : "outline"}>
              {status}
            </Badge>
          );
        },
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">DHCP Leases</h1>
        <Button variant="outline" size="sm" onClick={loadLeases}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reload
        </Button>
      </div>

      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            <span>DHCP Leases ({leases.length} items)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            data={leases}
            searchPlaceholder="Search leases..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
