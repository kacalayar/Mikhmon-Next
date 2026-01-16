"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Users,
  Download,
  Trash2,
  Lock,
  Unlock,
  Printer,
  Loader2,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import Link from "next/link";

import type { HotspotUser, HotspotUserProfile } from "@/types/routeros";

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "-";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export default function HotspotUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<HotspotUser[]>([]);
  const [profiles, setProfiles] = useState<HotspotUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState("all");
  const [selectedComment, setSelectedComment] = useState("all");

  async function refreshUsers() {
    try {
      let url = "/api/hotspot/users";
      if (selectedProfile !== "all") {
        url += `?profile=${selectedProfile}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to refresh users:", error);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [usersRes, profilesRes] = await Promise.all([
          fetch("/api/hotspot/users"),
          fetch("/api/hotspot/profiles"),
        ]);

        const [usersData, profilesData] = await Promise.all([
          usersRes.json(),
          profilesRes.json(),
        ]);

        if (isMounted) {
          if (usersData.success) {
            setUsers(usersData.data);
          }
          if (profilesData.success) {
            setProfiles(profilesData.data);
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

  async function handleDeleteUser(id: string, name: string) {
    if (!confirm(`Are you sure to delete username (${name})?`)) return;

    try {
      const res = await fetch(`/api/hotspot/users?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("User deleted");
        refreshUsers();
      } else {
        toast.error(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  }

  async function handleToggleUser(id: string, currentStatus: string) {
    try {
      const action = currentStatus === "true" ? "enable" : "disable";
      const res = await fetch("/api/hotspot/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        refreshUsers();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (error) {
      console.error("Action failed:", error);
      toast.error("Action failed");
    }
  }

  // Get unique comments from users
  const comments = useMemo(() => {
    const commentSet = new Set<string>();
    users.forEach((user) => {
      if (user.comment && user.comment.trim()) {
        commentSet.add(user.comment);
      }
    });
    return Array.from(commentSet);
  }, [users]);

  // Filter users by selected comment
  const filteredUsers = useMemo(() => {
    if (selectedComment === "all") return users;
    return users.filter((user) => user.comment === selectedComment);
  }, [users, selectedComment]);

  const columns: ColumnDef<HotspotUser>[] = useMemo(
    () => [
      {
        id: "actions",
        header: () => <div className="text-center">{filteredUsers.length}</div>,
        cell: ({ row }) => {
          const user = row.original;
          const isDisabled = user.disabled === "true";
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleDeleteUser(user[".id"], user.name)}
                className="text-destructive hover:text-destructive/80"
                title={`Remove ${user.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  handleToggleUser(user[".id"], user.disabled || "false")
                }
                className={isDisabled ? "text-warning" : "text-foreground"}
                title={
                  isDisabled ? `Enable ${user.name}` : `Disable ${user.name}`
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
        accessorKey: "server",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Server" />
        ),
        cell: ({ row }) => row.getValue("server") || "all",
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/hotspot/users/${row.original[".id"]}`}
            className="font-medium hover:underline"
          >
            {row.getValue("name")}
          </Link>
        ),
      },
      {
        id: "print",
        header: "Print",
        cell: ({ row }) => {
          const user = row.original;
          const userMode = user.name === user.password ? "vc" : "up";
          return (
            <div className="flex gap-2">
              <button
                onClick={() => toast.info("Print feature coming soon")}
                className="hover:text-primary"
                title={`Print ${user.name}`}
              >
                <Printer className="h-4 w-4" />
              </button>
              <button
                onClick={() => toast.info("Print QR feature coming soon")}
                className="hover:text-primary"
                title={`Print QR ${user.name}`}
              >
                <QrCode className="h-4 w-4" />
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "profile",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Profile" />
        ),
      },
      {
        accessorKey: "mac-address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Mac Address" />
        ),
        cell: ({ row }) => row.getValue("mac-address") || "-",
      },
      {
        accessorKey: "uptime",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Uptime" />
        ),
        cell: ({ row }) => row.getValue("uptime") || "-",
      },
      {
        accessorKey: "bytes-in",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Bytes In"
            className="text-right"
          />
        ),
        cell: ({ row }) => (
          <div className="text-right">
            {formatBytes(parseInt(row.getValue("bytes-in")) || 0)}
          </div>
        ),
      },
      {
        accessorKey: "bytes-out",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Bytes Out"
            className="text-right"
          />
        ),
        cell: ({ row }) => (
          <div className="text-right">
            {formatBytes(parseInt(row.getValue("bytes-out")) || 0)}
          </div>
        ),
      },
      {
        accessorKey: "comment",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Comment" />
        ),
        cell: ({ row }) => row.getValue("comment") || "-",
      },
    ],
    [filteredUsers],
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
            <Users className="h-5 w-5" />
            <span>Users</span>
            <span className="text-sm font-normal text-muted-foreground">
              |{" "}
              <Link href="/hotspot/users/add" className="hover:underline">
                Add
              </Link>
              {" | "}
              <Link href="/hotspot/users/generate" className="hover:underline">
                Generate
              </Link>
              {" | "}
              <button
                onClick={() => toast.info("Export feature coming soon")}
                className="hover:underline"
              >
                Script
              </button>
              {" | "}
              <button
                onClick={() => toast.info("Export feature coming soon")}
                className="hover:underline"
              >
                CSV
              </button>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Select
                  value={selectedProfile}
                  onValueChange={setSelectedProfile}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Show All</SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem key={profile[".id"]} value={profile.name}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={selectedComment}
                  onValueChange={setSelectedComment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Comment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Comments</SelectItem>
                    {comments.map((comment, idx) => (
                      <SelectItem key={idx} value={comment}>
                        {comment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => toast.info("Print feature coming soon")}
                  variant="default"
                  size="sm"
                >
                  <Printer className="mr-1 h-4 w-4" />
                  Print
                </Button>
                <Button
                  onClick={() => toast.info("Print QR feature coming soon")}
                  variant="default"
                  size="sm"
                >
                  <QrCode className="mr-1 h-4 w-4" />
                  QR
                </Button>
              </div>
            </div>
            <DataTable
              columns={columns}
              data={filteredUsers}
              searchPlaceholder="Search users..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
