"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { MikrotikRouter } from "@/types";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routerId = searchParams.get("router");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [routerData, setRouterData] = useState<MikrotikRouter | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    host: "",
    port: 8728,
    username: "",
    password: "",
    hotspotName: "",
    dnsName: "",
    currency: "Rp",
    autoReload: 10,
  });

  useEffect(() => {
    async function fetchRouter() {
      if (!routerId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/routers/${routerId}`);
        const data = await res.json();
        if (data.success) {
          setRouterData(data.data);
          setFormData({
            name: data.data.name || "",
            host: data.data.host || "",
            port: data.data.port || 8728,
            username: data.data.username || "",
            password: data.data.password || "",
            hotspotName: data.data.hotspotName || "",
            dnsName: data.data.dnsName || "",
            currency: data.data.currency || "Rp",
            autoReload: data.data.autoReload || 10,
          });
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
    fetchRouter();
  }, [routerId, router]);

  async function handleSave() {
    if (!routerId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/routers/${routerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Router berhasil diupdate");
        router.push("/sessions");
      } else {
        toast.error(data.error || "Gagal menyimpan");
      }
    } catch {
      toast.error("Gagal menyimpan data router");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!routerId || !confirm("Hapus router ini?")) return;

    try {
      const res = await fetch(`/api/routers/${routerId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Router berhasil dihapus");
        router.push("/sessions");
      } else {
        toast.error(data.error || "Gagal menghapus");
      }
    } catch {
      toast.error("Gagal menghapus router");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (!routerId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Pilih router dari halaman Sessions untuk mengedit pengaturan
          </p>
        </div>
        <Button onClick={() => router.push("/sessions")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Ke Sessions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Router</h1>
          <p className="text-muted-foreground">
            {routerData?.hotspotName || routerData?.name}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/sessions")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Koneksi MikroTik</CardTitle>
            <CardDescription>Pengaturan koneksi ke router</CardDescription>
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
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="host">IP MikroTik</Label>
                <Input
                  id="host"
                  value={formData.host}
                  onChange={(e) =>
                    setFormData({ ...formData, host: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      port: parseInt(e.target.value) || 8728,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mikhmon Data</CardTitle>
            <CardDescription>Pengaturan tambahan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
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

      <Separator />

      <div className="flex justify-between">
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus Router
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Simpan
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
