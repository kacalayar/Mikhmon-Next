"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Link as LinkIcon, Trash2, Lock, Unlock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { PageSkeleton } from "@/components/ui/page-skeleton";

interface IPBinding {
  ".id": string;
  "mac-address": string;
  address?: string;
  "to-address"?: string;
  server?: string;
  comment?: string;
  disabled?: string;
  bypassed?: string;
}

export default function IPBindingPage() {
  const [bindings, setBindings] = useState<IPBinding[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshBindings() {
    try {
      const res = await fetch("/api/hotspot/ip-binding");
      const data = await res.json();
      if (data.success) {
        setBindings(data.data);
      }
    } catch (error) {
      console.error("Failed to refresh bindings:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshBindings();
  }, []);

  const handleDeleteBinding = useCallback(async (id: string, mac: string) => {
    if (!confirm(`Are you sure to delete (${mac})?`)) return;

    try {
      const res = await fetch(`/api/hotspot/ip-binding?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("IP Binding deleted");
        refreshBindings();
      } else {
        toast.error(data.error || "Failed to delete binding");
      }
    } catch (error) {
      console.error("Failed to delete binding:", error);
      toast.error("Failed to delete binding");
    }
  }, []);

  const handleToggleBinding = useCallback(
    async (id: string, currentStatus: string) => {
      try {
        const action = currentStatus === "true" ? "enable" : "disable";
        const res = await fetch("/api/hotspot/ip-binding", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action }),
        });
        const data = await res.json();

        if (data.success) {
          toast.success(data.message);
          refreshBindings();
        } else {
          toast.error(data.error || "Action failed");
        }
      } catch (error) {
        console.error("Action failed:", error);
        toast.error("Action failed");
      }
    },
    [],
  );

  const columns: ColumnDef<IPBinding>[] = useMemo(
    () => [
      {
        id: "actions",
        header: () => <div className="text-center">{bindings.length}</div>,
        cell: ({ row }) => {
          const binding = row.original;
          const isDisabled = binding.disabled === "true";
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() =>
                  handleDeleteBinding(binding[".id"], binding["mac-address"])
                }
                className="cursor-pointer text-destructive hover:text-destructive/80"
                title={`Remove ${binding["mac-address"]}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  handleToggleBinding(
                    binding[".id"],
                    binding.disabled || "false",
                  )
                }
                className={`cursor-pointer ${isDisabled ? "text-warning hover:text-warning/80" : "text-foreground hover:text-foreground/80"}`}
                title={
                  isDisabled
                    ? `Enable Binding ${binding.address}`
                    : `Disable Binding ${binding.address}`
                }
              >
                {isDisabled ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
              </button>
            </div>
          );
        },
      },
      {
        id: "type",
        header: "",
        cell: ({ row }) => {
          const binding = row.original;
          if (binding.bypassed === "true") {
            return (
              <Badge variant="secondary" className="text-info">
                P
              </Badge>
            );
          }
          return null;
        },
      },
      {
        accessorKey: "comment",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => row.getValue("comment") || "-",
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
        cell: ({ row }) => row.getValue("address") || "-",
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
    ],
    [bindings, handleDeleteBinding, handleToggleBinding],
  );

  if (loading) {
    return <PageSkeleton rows={5} columns={5} />;
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            <span>IP Bindings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            data={bindings}
            searchPlaceholder="Search bindings..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
