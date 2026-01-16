"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { HotspotUserProfile } from "@/types/routeros";

interface HotspotServer {
  ".id": string;
  name: string;
}

export default function AddUserPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<HotspotUserProfile[]>([]);
  const [servers, setServers] = useState<HotspotServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    server: "all",
    name: "",
    password: "",
    profile: "",
    timeLimit: "",
    dataLimit: "",
    dataUnit: "1048576", // MB
    comment: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [profilesRes, serversRes] = await Promise.all([
          fetch("/api/hotspot/profiles"),
          fetch("/api/hotspot/servers"),
        ]);
        const [profilesData, serversData] = await Promise.all([
          profilesRes.json(),
          serversRes.json(),
        ]);
        if (profilesData.success) {
          setProfiles(profilesData.data);
          if (profilesData.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              profile: profilesData.data[0].name,
            }));
          }
        }
        if (serversData.success) {
          setServers(serversData.data);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.profile) {
      toast.error("Name dan Profile wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const userMode = formData.name === formData.password ? "vc-" : "up-";
      const comment = formData.comment ? userMode + formData.comment : "";

      const userData: Record<string, string> = {
        name: formData.name,
        password: formData.password,
        profile: formData.profile,
        disabled: "no",
      };

      if (formData.server !== "all") {
        userData.server = formData.server;
      }

      if (formData.timeLimit) {
        userData["limit-uptime"] = formData.timeLimit;
      }

      if (formData.dataLimit) {
        const bytes =
          parseInt(formData.dataLimit) * parseInt(formData.dataUnit);
        userData["limit-bytes-total"] = bytes.toString();
      }

      if (comment) {
        userData.comment = comment;
      }

      const res = await fetch("/api/hotspot/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("User berhasil ditambahkan");
        router.push("/hotspot/users");
      } else {
        toast.error(data.error || "Gagal menambahkan user");
      }
    } catch {
      toast.error("Gagal menambahkan user");
    } finally {
      setSaving(false);
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
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Add User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push("/hotspot/users")}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Close
                  </Button>
                  <Button type="submit" size="sm" disabled={saving}>
                    {saving ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-1 h-4 w-4" />
                    )}
                    Save
                  </Button>
                </div>
                <table className="w-full">
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-3 pr-4 align-middle w-32">Server</td>
                      <td className="py-3">
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
                              <SelectItem
                                key={server[".id"]}
                                value={server.name}
                              >
                                {server.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 align-middle">Name</td>
                      <td className="py-3">
                        <Input
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                          autoFocus
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 align-middle">Password</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                            required
                            className="flex-1"
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
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 align-middle">Profile</td>
                      <td className="py-3">
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
                              <SelectItem
                                key={profile[".id"]}
                                value={profile.name}
                              >
                                {profile.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 align-middle">Time Limit</td>
                      <td className="py-3">
                        <Input
                          value={formData.timeLimit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              timeLimit: e.target.value,
                            })
                          }
                          placeholder=""
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 align-middle">Data Limit</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={9999}
                            value={formData.dataLimit}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dataLimit: e.target.value,
                              })
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
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 align-middle">Comment</td>
                      <td className="py-3">
                        <Input
                          value={formData.comment}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              comment: e.target.value,
                            })
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Read Me</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-4">
                <div>
                  <p className="font-medium text-foreground">
                    Format Time Limit.
                  </p>
                  <p>
                    [wdhm] Example : 30d - 30days, 12h - 12hours, 4w3d - 31days.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Add User with Time Limit.
                  </p>
                  <p>Should Time Limit &lt; Validity.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
