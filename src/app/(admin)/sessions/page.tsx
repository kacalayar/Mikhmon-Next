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
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h1 className="text-xl font-semibold">Admin Settings</h1>
        <span className="text-muted-foreground">|</span>
        <Button variant="ghost" size="sm" onClick={() => fetchRouters()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
                  className={`flex items-center justify-between rounded-lg border p-3 ${COLORS[index % COLORS.length]} bg-opacity-10`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded ${COLORS[index % COLORS.length]}`}
                    >
                      <Server className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Hotspot Name: {r.hotspotName || r.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Session Name: {r.name}
                      </p>
                      <div className="mt-1 flex gap-2">
                        <Button
                          size="sm"
                          variant="link"
                          className="h-auto p-0 text-xs"
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
                          variant="link"
                          className="h-auto p-0 text-xs"
                          onClick={() => router.push(`/router/${r.id}`)}
                        >
                          <Settings className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="link"
                          className="h-auto p-0 text-xs text-destructive"
                          onClick={() => handleDelete(r.id, r.name)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
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
