"use client";

import { useEffect, useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Settings, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

interface PPPProfile {
  ".id": string;
  name: string;
  "local-address"?: string;
  "remote-address"?: string;
  "rate-limit"?: string;
  "session-timeout"?: string;
  "idle-timeout"?: string;
}

export default function PPPProfilesPage() {
  const [profiles, setProfiles] = useState<PPPProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfiles() {
      try {
        const res = await fetch("/api/ppp/profiles");
        const data = await res.json();
        if (data.success) {
          setProfiles(data.data);
        }
      } catch (error) {
        console.error("Failed to load profiles:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfiles();
  }, []);

  const columns: ColumnDef<PPPProfile>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
      },
      {
        accessorKey: "local-address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Local Address" />
        ),
        cell: ({ row }) => row.getValue("local-address") || "-",
      },
      {
        accessorKey: "remote-address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Remote Address" />
        ),
        cell: ({ row }) => row.getValue("remote-address") || "-",
      },
      {
        accessorKey: "rate-limit",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Rate Limit" />
        ),
        cell: ({ row }) => row.getValue("rate-limit") || "-",
      },
      {
        accessorKey: "session-timeout",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Session Timeout" />
        ),
        cell: ({ row }) => row.getValue("session-timeout") || "-",
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
            <Settings className="h-5 w-5" />
            <span>PPP Profiles</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            data={profiles}
            searchPlaceholder="Search profiles..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
