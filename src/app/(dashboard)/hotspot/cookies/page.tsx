"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Cookie, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { PageSkeleton } from "@/components/ui/page-skeleton";

interface HotspotCookie {
  ".id": string;
  user: string;
  "mac-address": string;
  domain?: string;
  "expires-in"?: string;
}

export default function HotspotCookiesPage() {
  const [cookies, setCookies] = useState<HotspotCookie[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshCookies() {
    setLoading(true);
    try {
      const res = await fetch("/api/hotspot/cookies");
      const data = await res.json();
      if (data.success) {
        setCookies(data.data);
      }
    } catch (error) {
      console.error("Failed to refresh cookies:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshCookies();
  }, []);

  const handleDeleteCookie = useCallback(async (id: string, user: string) => {
    if (!confirm(`Are you sure to remove cookie for user (${user})?`)) return;

    try {
      const res = await fetch(`/api/hotspot/cookies?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Cookie removed");
        refreshCookies();
      } else {
        toast.error(data.error || "Failed to remove cookie");
      }
    } catch (error) {
      console.error("Failed to remove cookie:", error);
      toast.error("Failed to remove cookie");
    }
  }, []);

  const columns: ColumnDef<HotspotCookie>[] = useMemo(
    () => [
      {
        id: "actions",
        header: () => <div className="text-center">{cookies.length}</div>,
        cell: ({ row }) => {
          const cookie = row.original;
          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleDeleteCookie(cookie[".id"], cookie.user)}
                className="cursor-pointer text-destructive hover:text-destructive/80"
                title={`Remove ${cookie.user}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "user",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="User" />
        ),
      },
      {
        accessorKey: "mac-address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="MAC Address" />
        ),
      },
      {
        accessorKey: "domain",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Domain" />
        ),
        cell: ({ row }) => row.getValue("domain") || "-",
      },
      {
        accessorKey: "expires-in",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Expires In" />
        ),
        cell: ({ row }) => row.getValue("expires-in") || "-",
      },
    ],
    [cookies, handleDeleteCookie],
  );

  if (loading) {
    return <PageSkeleton rows={5} columns={4} />;
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            <span>Hotspot Cookies</span>
            <span className="text-sm font-normal text-muted-foreground">
              |{" "}
              <button
                onClick={refreshCookies}
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
            data={cookies}
            searchPlaceholder="Search cookies..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
