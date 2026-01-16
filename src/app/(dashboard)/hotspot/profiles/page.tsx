"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { PieChart, Trash2, Edit, Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import Link from "next/link";

import type { HotspotUserProfile } from "@/types/routeros";

export default function HotspotProfilesPage() {
  const [profiles, setProfiles] = useState<HotspotUserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshProfiles() {
    try {
      const res = await fetch("/api/hotspot/profiles");
      const data = await res.json();
      if (data.success) {
        setProfiles(data.data);
      }
    } catch (error) {
      console.error("Failed to refresh profiles:", error);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const res = await fetch("/api/hotspot/profiles");
        const data = await res.json();

        if (isMounted) {
          if (data.success) {
            setProfiles(data.data);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDeleteProfile = useCallback(async (id: string, name: string) => {
    if (!confirm(`Are you sure to delete profile (${name})?`)) return;

    try {
      const res = await fetch(`/api/hotspot/profiles?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Profile deleted");
        refreshProfiles();
      } else {
        toast.error(data.error || "Failed to delete profile");
      }
    } catch (error) {
      console.error("Failed to delete profile:", error);
      toast.error("Failed to delete profile");
    }
  }, []);

  const columns: ColumnDef<HotspotUserProfile>[] = useMemo(
    () => [
      {
        id: "actions",
        header: () => <div className="text-center">{profiles.length}</div>,
        cell: ({ row }) => {
          const profile = row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() =>
                  handleDeleteProfile(profile[".id"], profile.name)
                }
                className="text-destructive hover:text-destructive/80"
                title={`Remove ${profile.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <Link
                href={`/hotspot/users?profile=${profile.name}`}
                className="hover:text-primary"
                title={`Open users by profile ${profile.name}`}
              >
                <Users className="h-4 w-4" />
              </Link>
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/hotspot/profiles/${row.original[".id"]}`}
            className="font-medium hover:underline"
          >
            <Edit className="mr-1 inline h-3 w-3" />
            {row.getValue("name")}
          </Link>
        ),
      },
      {
        accessorKey: "shared-users",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Shared Users" />
        ),
        cell: ({ row }) => row.getValue("shared-users") || "1",
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
      {
        accessorKey: "keepalive-timeout",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Keepalive Timeout" />
        ),
        cell: ({ row }) => row.getValue("keepalive-timeout") || "-",
      },
    ],
    [profiles, handleDeleteProfile],
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
            <PieChart className="h-5 w-5" />
            <span>User Profile</span>
            <span className="text-sm font-normal text-muted-foreground">
              |{" "}
              <Link href="/hotspot/profiles/add" className="hover:underline">
                Add
              </Link>
            </span>
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
