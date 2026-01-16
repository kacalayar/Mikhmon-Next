"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Server,
  Settings,
  Trash2,
  ExternalLink,
  Loader2,
  RefreshCw,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { MikrotikRouter } from "@/types";

const COLORS = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-red-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-cyan-500",
];

export default function SessionsPage() {
  const router = useRouter();
  const [routers, setRouters] = useState<MikrotikRouter[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [adminForm, setAdminForm] = useState({
    username: "",
    password: "",
  });
  const [savingAdmin, setSavingAdmin] = useState(false);

  async function fetchRouters() {
    try {
      const res = await fetch("/api/routers");
      const data = await res.json();
      if (data.success) {
        setRouters(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch routers:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRouters();
    setAdminForm({
      username: "admin",
      password: "",
    });
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus router "${name}"?`)) return;

    try {
      const res = await fetch(`/api/routers/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast.success("Router berhasil dihapus");
        fetchRouters();
      } else {
        toast.error(result.error || "Gagal menghapus router");
      }
    } catch {
      toast.error("Gagal menghapus router");
    }
  }

  async function handleConnect(routerId: string) {
    setConnecting(routerId);
    try {
      const res = await fetch(`/api/routers/${routerId}/connect`, {
        method: "POST",
      });
      const result = await res.json();
      if (result.success) {
        sessionStorage.setItem("activeRouter", routerId);
        router.push("/");
      } else {
        toast.error(result.error || "Gagal konek ke router");
      }
    } catch {
      toast.error("Gagal konek ke router");
    } finally {
      setConnecting(null);
    }
  }

  async function handleSaveAdmin(e: React.FormEvent) {
    e.preventDefault();
    setSavingAdmin(true);
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Admin berhasil diupdate");
        if (result.requireRelogin) {
          signOut({ callbackUrl: "/login" });
        }
      } else {
        toast.error(result.error || "Gagal update admin");
      }
    } catch {
      toast.error("Gagal update admin");
    } finally {
      setSavingAdmin(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-32" />
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {/* Router List Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-14" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Admin Settings Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-10" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Settings className="h-5 w-5" />
        <h1 className="text-lg font-semibold md:text-xl">Admin Settings</h1>
        <span className="text-muted-foreground">|</span>
        <Button variant="ghost" size="sm" onClick={() => fetchRouters()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        {/* Router List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4" />
              Router List
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {routers.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Belum ada router. Klik &quot;Add Router&quot; di sidebar untuk
                menambahkan.
              </p>
            ) : (
              routers.map((r, index) => (
                <div
                  key={r.id}
                  className={`flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${COLORS[index % COLORS.length]} bg-opacity-10`}
                >
                  <div className="flex items-start gap-3 sm:items-center">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${COLORS[index % COLORS.length]}`}
                    >
                      <Server className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {r.hotspotName || r.name}
                      </p>
                      <p className="truncate text-xs">{r.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-13 sm:pl-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => handleConnect(r.id)}
                      disabled={connecting === r.id}
                    >
                      {connecting === r.id ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <ExternalLink className="mr-1 h-3 w-3" />
                      )}
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => router.push(`/router/${r.id}`)}
                    >
                      <Settings className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs text-destructive hover:text-destructive"
                      onClick={() => handleDelete(r.id, r.name)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Admin Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-username">Username</Label>
                <Input
                  id="admin-username"
                  value={adminForm.username}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, username: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={adminForm.password}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, password: e.target.value })
                    }
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={savingAdmin}>
                  {savingAdmin ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchRouters()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">v1.0.0</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
