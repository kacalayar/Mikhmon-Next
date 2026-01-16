"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { KeyRound, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { PageSkeleton } from "@/components/ui/page-skeleton";

interface PPPSecret {
  ".id": string;
  name: string;
  password?: string;
  service?: string;
  profile?: string;
  "local-address"?: string;
  "remote-address"?: string;
  disabled?: string;
  comment?: string;
}

export default function PPPSecretsPage() {
  const [secrets, setSecrets] = useState<PPPSecret[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshSecrets() {
    setLoading(true);
    try {
      const res = await fetch("/api/ppp/secrets");
      const data = await res.json();
      if (data.success) {
        setSecrets(data.data);
      }
    } catch (error) {
      console.error("Failed to refresh secrets:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshSecrets();
  }, []);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`Are you sure to delete secret (${name})?`)) return;

    try {
      const res = await fetch(`/api/ppp/secrets?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Secret deleted");
        refreshSecrets();
      } else {
        toast.error(data.error || "Failed to delete secret");
      }
    } catch (error) {
      console.error("Failed to delete secret:", error);
      toast.error("Failed to delete secret");
    }
  }, []);

  const columns: ColumnDef<PPPSecret>[] = useMemo(
    () => [
      {
        id: "actions",
        header: () => <div className="text-center">{secrets.length}</div>,
        cell: ({ row }) => {
          const secret = row.original;
          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleDelete(secret[".id"], secret.name)}
                className="cursor-pointer text-destructive hover:text-destructive/80"
                title={`Remove ${secret.name}`}
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
        accessorKey: "service",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Service" />
        ),
        cell: ({ row }) => row.getValue("service") || "any",
      },
      {
        accessorKey: "profile",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Profile" />
        ),
        cell: ({ row }) => row.getValue("profile") || "default",
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
        accessorKey: "disabled",
        header: "Status",
        cell: ({ row }) => {
          const disabled = row.getValue("disabled");
          return disabled === "true" ? (
            <Badge variant="secondary">Disabled</Badge>
          ) : (
            <Badge variant="default">Active</Badge>
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
    [secrets, handleDelete],
  );

  if (loading) {
    return <PageSkeleton rows={5} columns={5} />;
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            <span>PPP Secrets</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            data={secrets}
            searchPlaceholder="Search secrets..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
