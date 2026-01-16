"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { List, Trash2, Printer, Loader2, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface QuickPrintPackage {
  id: string;
  name: string;
  package: string;
  server: string;
  userMode: string;
  userLength: string;
  prefix: string;
  character: string;
  profile: string;
  timeLimit: string;
  dataLimit: string;
  comment: string;
  validity: string;
  price: string;
  sellingPrice: string;
}

interface HotspotProfile {
  ".id": string;
  name: string;
}

interface HotspotServer {
  ".id": string;
  name: string;
}

export default function QuickPrintListPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<QuickPrintPackage[]>([]);
  const [profiles, setProfiles] = useState<HotspotProfile[]>([]);
  const [servers, setServers] = useState<HotspotServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    server: "all",
    userMode: "vc",
    nameLength: "4",
    prefix: "",
    character: "mix",
    profile: "",
    timeLimit: "",
    dataLimit: "",
    dataUnit: "1048576",
    comment: "",
  });

  async function loadPackages() {
    setLoading(true);
    try {
      const [packagesRes, profilesRes, serversRes] = await Promise.all([
        fetch("/api/quick-print"),
        fetch("/api/hotspot/profiles"),
        fetch("/api/hotspot/servers"),
      ]);

      const [packagesData, profilesData, serversData] = await Promise.all([
        packagesRes.json(),
        profilesRes.json(),
        serversRes.json(),
      ]);

      if (packagesData.success) {
        setPackages(packagesData.data);
      }
      if (profilesData.success) {
        setProfiles(profilesData.data);
      }
      if (serversData.success) {
        setServers(serversData.data);
      }
    } catch (error) {
      console.error("Failed to load packages:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPackages();
  }, []);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`Are you sure to delete package (${name})?`)) return;

    try {
      const res = await fetch(`/api/quick-print?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Package deleted");
        loadPackages();
      } else {
        toast.error(data.error || "Failed to delete package");
      }
    } catch (error) {
      console.error("Failed to delete package:", error);
      toast.error("Failed to delete package");
    }
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.profile) {
      toast.error("Name and Profile are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/quick-print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Quick Print package created");
        setFormData({
          name: "",
          server: "all",
          userMode: "vc",
          nameLength: "4",
          prefix: "",
          character: "mix",
          profile: "",
          timeLimit: "",
          dataLimit: "",
          dataUnit: "1048576",
          comment: "",
        });
        loadPackages();
      } else {
        toast.error(data.error || "Failed to create package");
      }
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error("Failed to create package");
    } finally {
      setSaving(false);
    }
  }

  const columns: ColumnDef<QuickPrintPackage>[] = useMemo(
    () => [
      {
        id: "actions",
        header: () => <div className="text-center">{packages.length}</div>,
        cell: ({ row }) => {
          const pkg = row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleDelete(pkg.id, pkg.package)}
                className="text-destructive hover:text-destructive/80"
                title={`Remove ${pkg.package}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => toast.info(`Print ${pkg.package}`)}
                className="text-primary hover:text-primary/80"
                title={`Print ${pkg.package}`}
              >
                <Printer className="h-4 w-4" />
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "package",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Package" />
        ),
      },
      {
        accessorKey: "server",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Server" />
        ),
      },
      {
        accessorKey: "profile",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Profile" />
        ),
      },
      {
        accessorKey: "timeLimit",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Time Limit" />
        ),
      },
      {
        accessorKey: "dataLimit",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Data Limit" />
        ),
      },
      {
        accessorKey: "validity",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Validity" />
        ),
      },
      {
        accessorKey: "price",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Price" />
        ),
      },
      {
        accessorKey: "sellingPrice",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Selling Price" />
        ),
      },
    ],
    [packages, handleDelete],
  );

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/quick-print")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add Quick Print</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Server</Label>
                  <Select
                    value={formData.server}
                    onValueChange={(value) =>
                      setFormData({ ...formData, server: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">all</SelectItem>
                      {servers.map((server) => (
                        <SelectItem key={server[".id"]} value={server.name}>
                          {server.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>User Mode</Label>
                  <Select
                    value={formData.userMode}
                    onValueChange={(value) =>
                      setFormData({ ...formData, userMode: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vc">Username = Password</SelectItem>
                      <SelectItem value="up">Username & Password</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Name Length</Label>
                  <Select
                    value={formData.nameLength}
                    onValueChange={(value) =>
                      setFormData({ ...formData, nameLength: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7, 8].map((len) => (
                        <SelectItem key={len} value={len.toString()}>
                          {len}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prefix</Label>
                  <Input
                    value={formData.prefix}
                    onChange={(e) =>
                      setFormData({ ...formData, prefix: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Character</Label>
                  <Select
                    value={formData.character}
                    onValueChange={(value) =>
                      setFormData({ ...formData, character: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lower">Random abcd</SelectItem>
                      <SelectItem value="upper">Random ABCD</SelectItem>
                      <SelectItem value="upplow">Random aBcD</SelectItem>
                      <SelectItem value="mix">Random 5ab2c34d</SelectItem>
                      <SelectItem value="mix1">Random 5AB2C34D</SelectItem>
                      <SelectItem value="mix2">Random 5aB2c34D</SelectItem>
                      <SelectItem value="num">Random 1234</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Profile</Label>
                  <Select
                    value={formData.profile}
                    onValueChange={(value) =>
                      setFormData({ ...formData, profile: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile[".id"]} value={profile.name}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time Limit</Label>
                  <Input
                    value={formData.timeLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, timeLimit: e.target.value })
                    }
                    placeholder="e.g. 1h, 30m"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Limit</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={formData.dataLimit}
                      onChange={(e) =>
                        setFormData({ ...formData, dataLimit: e.target.value })
                      }
                      className="flex-1"
                    />
                    <Select
                      value={formData.dataUnit}
                      onValueChange={(value) =>
                        setFormData({ ...formData, dataUnit: value })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1048576">MB</SelectItem>
                        <SelectItem value="1073741824">GB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Comment</Label>
                  <Input
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                  />
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                <span>Quick Print List</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <DataTable
                columns={columns}
                data={packages}
                searchPlaceholder="Search packages..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
