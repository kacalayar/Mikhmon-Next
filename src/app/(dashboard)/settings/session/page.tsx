"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Eye, EyeOff, Wifi } from "lucide-react";
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

export default function SessionSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [routerId, setRouterId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RouterData | null>(null);

  useEffect(() => {
    async function loadCurrentRouter() {
      try {
        // Get current session from cookie via dashboard API
        const res = await fetch("/api/dashboard");
        if (res.status === 401) {
          router.push("/sessions");
          return;
        }
        const data = await res.json();
        if (data.routerId) {
          setRouterId(data.routerId);
          // Load router data
          const routerRes = await fetch(`/api/routers/${data.routerId}`);
          const routerData = await routerRes.json();
          if (routerData.success) {
            setFormData(routerData.data);
          }
        }
      } catch {
        toast.error("Gagal memuat data router");
      } finally {
        setLoading(false);
      }
    }
    loadCurrentRouter();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData || !routerId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/routers/${routerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (result.success) {
        toast.success("Settings berhasil disimpan");
      } else {
        toast.error(result.error || "Gagal menyimpan settings");
      }
    } catch {
      toast.error("Gagal menyimpan settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!routerId) return;
    setTesting(true);
    try {
      const res = await fetch(`/api/routers/${routerId}/test`, {
        method: "POST",
      });
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">No router session found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Session Settings</h1>

      <form onSubmit={handleSave}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Session Name</Label>
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
                <Label htmlFor="host">IP MikroTik</Label>
                <Input
                  id="host"
                  value={formData.host}
                  onChange={(e) =>
                    setFormData({ ...formData, host: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
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
                <Label htmlFor="password">Password</Label>
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
        </div>
      </form>
    </div>
  );
}
