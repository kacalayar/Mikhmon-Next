"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Laptop, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import Link from "next/link";

interface HotspotHost {
  ".id": string;
  "mac-address": string;
  address: string;
  "to-address"?: string;
  server?: string;
  bypassed?: string;
  authorized?: string;
  comment?: string;
}

export default function HotspotHostsPage() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "all";
  const [hosts, setHosts] = useState<HotspotHost[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshHosts = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/hotspot/hosts";
      if (filter === "authorized") {
        url += "?authorized=yes";
      } else if (filter === "bypassed") {
        url += "?bypassed=yes";
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setHosts(data.data);
      }
    } catch (error) {
      console.error("Failed to refresh hosts:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    refreshHosts();
  }, [filter, refreshHosts]);

  const handleDeleteHost = useCallback(
    async (id: string, mac: string) => {
      if (!confirm(`Are you sure to delete host (${mac})?`)) return;

      try {
        const res = await fetch(`/api/hotspot/hosts?id=${id}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (data.success) {
          toast.success("Host deleted");
          refreshHosts();
        } else {
          toast.error(data.error || "Failed to delete host");
        }
      } catch (error) {
        console.error("Failed to delete host:", error);
        toast.error("Failed to delete host");
      }
    },
    [refreshHosts],
  );

  const columns: ColumnDef<HotspotHost>[] = useMemo(
    () => [
      {
        id: "actions",
        header: () => <div className="text-center">{hosts.length}</div>,
        cell: ({ row }) => {
          const host = row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() =>
                  handleDeleteHost(host[".id"], host["mac-address"])
                }
                className="cursor-pointer text-destructive hover:text-destructive/80"
                title={`Remove ${host["mac-address"]}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const host = row.original;
          if (host.authorized === "true") {
            return <Badge variant="default">Authorized</Badge>;
          } else if (host.bypassed === "true") {
            return <Badge variant="secondary">Bypassed</Badge>;
          }
          return <Badge variant="outline">-</Badge>;
        },
      },
      {
        accessorKey: "mac-address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="MAC Address" />
        ),
      },
      {
        accessorKey: "address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Address" />
        ),
      },
      {
        accessorKey: "to-address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="To Address" />
        ),
        cell: ({ row }) => row.getValue("to-address") || "-",
      },
      {
        accessorKey: "server",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Server" />
        ),
        cell: ({ row }) => row.getValue("server") || "all",
      },
      {
        accessorKey: "comment",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Comment" />
        ),
        cell: ({ row }) => row.getValue("comment") || "-",
      },
    ],
    [hosts, handleDeleteHost],
  );

  if (loading) {
    return <PageSkeleton rows={6} columns={5} />;
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Laptop className="h-5 w-5" />
            <span>Hosts</span>
            <span className="text-sm font-normal text-muted-foreground">
              |{" "}
              <Link
                href="/hotspot/hosts"
                className={filter === "all" ? "text-info" : ""}
              >
                All
              </Link>
              {" | "}
              <Link
                href="/hotspot/hosts?filter=authorized"
                className={filter === "authorized" ? "text-success" : ""}
              >
                A
              </Link>
              {" | "}
              <Link
                href="/hotspot/hosts?filter=bypassed"
                className={filter === "bypassed" ? "text-primary" : ""}
              >
                P
              </Link>
              {" | "}
              <button
                onClick={refreshHosts}
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
            data={hosts}
            searchPlaceholder="Search hosts..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
