"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Plug,
  Trash,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface RouterData {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  hotspotName: string;
  dnsName: string;
  currency: string;
  autoReload: number;
}

export default function EditRouterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<RouterData | null>(null);

  useEffect(() => {
    async function loadRouter() {
      try {
        const res = await fetch(`/api/routers/${id}`);
        const result = await res.json();
        if (result.success) {
          setFormData(result.data);
        } else {
          toast.error("Router tidak ditemukan");
          router.push("/sessions");
        }
      } catch {
        toast.error("Gagal memuat data router");
      } finally {
        setLoading(false);
      }
    }
    loadRouter();
  }, [id, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData) return;

    let host = formData.host;
    let port = formData.port;
    
    if (formData.host.includes(":")) {
      const parts = formData.host.split(":");
      host = parts[0];
      port = parseInt(parts[1]) || 8728;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/routers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, host, port }),
      });
      const result = await res.json();

      if (result.success) {
        toast.success("Router berhasil diupdate");
      } else {
        toast.error(result.error || "Gagal mengupdate router");
      }
    } catch {
      toast.error("Gagal mengupdate router");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    try {
      const res = await fetch(`/api/routers/${id}/test`, { method: "POST" });
      const result = await res.json();

      if (result.success) {
        toast.success(`Ping OK - ${result.host}:${result.port}`);
      } else {
        toast.error(
          `Ping Failed - ${result.host}:${result.port} - ${result.error}`,
        );
      }
    } catch {
      toast.error("Ping test failed");
    } finally {
      setTesting(false);
    }
  }

  async function handleConnect() {
    setConnecting(true);
    try {
      const res = await fetch(`/api/routers/${id}/connect`, { method: "POST" });
      const result = await res.json();

      if (result.success) {
        toast.success("Terhubung ke router");
        router.push(`/?session=${id}`);
      } else {
        toast.error(result.error || "Gagal terhubung ke router");
      }
    } catch {
      toast.error("Gagal terhubung ke router");
    } finally {
      setConnecting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus router ini?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/routers/${id}`, { method: "DELETE" });
      const result = await res.json();

      if (result.success) {
        toast.success("Router berhasil dihapus");
        router.push("/sessions");
      } else {
        toast.error(result.error || "Gagal menghapus router");
      }
    } catch {
      toast.error("Gagal menghapus router");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/sessions")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-xl font-semibold">Edit Router: {formData.name}</h1>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Session Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>MikroTik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="host">IP MikroTik (atau hostname:port) *</Label>
                <Input
                  id="host"
                  value={formData.host}
                  onChange={(e) =>
                    setFormData({ ...formData, host: e.target.value })
                  }
                  placeholder="192.168.88.1 atau id-10.hostddns.us:56933"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Bisa input IP saja (192.168.88.1) atau hostname:port (id-10.hostddns.us:56933)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
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
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Mikhmon Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="hotspotName">Hotspot Name</Label>
                  <Input
                    id="hotspotName"
                    value={formData.hotspotName}
                    onChange={(e) =>
                      setFormData({ ...formData, hotspotName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dnsName">DNS Name</Label>
                  <Input
                    id="dnsName"
                    value={formData.dnsName}
                    onChange={(e) =>
                      setFormData({ ...formData, dnsName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autoReload">Auto Reload (sec)</Label>
                  <Input
                    id="autoReload"
                    type="number"
                    min={10}
                    value={formData.autoReload}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        autoReload: parseInt(e.target.value) || 10,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={testing}
            onClick={handleTest}
          >
            {testing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wifi className="mr-2 h-4 w-4" />
            )}
            Ping
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={connecting}
            onClick={handleConnect}
          >
            {connecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plug className="mr-2 h-4 w-4" />
            )}
            Connect
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash className="mr-2 h-4 w-4" />
            )}
            Delete
          </Button>
        </div>
      </form>
    </div>
  );
}
