"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Users, X } from "lucide-react";
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
import type { HotspotUserProfile } from "@/types/routeros";

interface HotspotServer {
  ".id": string;
  name: string;
}

export default function GenerateUsersPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<HotspotUserProfile[]>([]);
  const [servers, setServers] = useState<HotspotServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    qty: 1,
    server: "all",
    userMode: "vc", // vc = user=pass, up = user+pass
    userLength: 4,
    prefix: "",
    charMode: "mix", // lower, upper, upplow, mix, mix1, mix2, num
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

  function generateChars(length: number, mode: string): string {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";

    let chars = "";
    switch (mode) {
      case "lower":
        chars = lower;
        break;
      case "upper":
        chars = upper;
        break;
      case "upplow":
        chars = lower + upper;
        break;
      case "mix":
        chars = lower + nums;
        break;
      case "mix1":
        chars = upper + nums;
        break;
      case "mix2":
        chars = lower + upper + nums;
        break;
      case "num":
        chars = nums;
        break;
      default:
        chars = lower + nums;
    }

    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.profile) {
      toast.error("Profile wajib dipilih");
      return;
    }

    if (formData.qty < 1 || formData.qty > 500) {
      toast.error("Quantity harus antara 1-500");
      return;
    }

    setGenerating(true);
    let successCount = 0;
    let failCount = 0;

    const dateStr = new Date()
      .toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, ".");
    const genCode = Math.floor(Math.random() * 900 + 100);
    const commentBase = `gen-${genCode}-${dateStr}${formData.comment ? `-${formData.comment}` : ""}`;

    try {
      for (let i = 0; i < formData.qty; i++) {
        const chars = generateChars(formData.userLength, formData.charMode);
        const username = formData.prefix + chars;

        const password =
          formData.userMode === "vc"
            ? username
            : generateChars(formData.userLength, "num");

        const userData: Record<string, string> = {
          name: username,
          password: password,
          profile: formData.profile,
          comment: commentBase,
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

        const res = await fetch("/api/hotspot/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
        const data = await res.json();

        if (data.success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} user berhasil dibuat`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} user gagal dibuat`);
      }

      if (successCount > 0) {
        router.push("/hotspot/users");
      }
    } catch {
      toast.error("Gagal generate users");
    } finally {
      setGenerating(false);
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
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/hotspot/users")}
        >
          <X className="mr-2 h-4 w-4" />
          Close
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/hotspot/users")}
        >
          <Users className="mr-2 h-4 w-4" />
          User List
        </Button>
        <h1 className="text-xl font-semibold">Generate User</h1>
      </div>

      <form onSubmit={handleGenerate}>
        <Card>
          <CardHeader>
            <CardTitle>Generate User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={formData.qty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qty: parseInt(e.target.value) || 1,
                      })
                    }
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
                      <SelectItem value="up">User + Password</SelectItem>
                      <SelectItem value="vc">User = Password</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>User Length</Label>
                  <Select
                    value={formData.userLength.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, userLength: parseInt(value) })
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Prefix</Label>
                  <Input
                    maxLength={6}
                    value={formData.prefix}
                    onChange={(e) =>
                      setFormData({ ...formData, prefix: e.target.value })
                    }
                    placeholder="e.g. vc"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Character</Label>
                  <Select
                    value={formData.charMode}
                    onValueChange={(value) =>
                      setFormData({ ...formData, charMode: value })
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
              </div>

              <div className="space-y-2">
                <Label>Profile *</Label>
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
                        {profile.name}{" "}
                        {profile["rate-limit"]
                          ? `(${profile["rate-limit"]})`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Time Limit</Label>
                  <Input
                    value={formData.timeLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, timeLimit: e.target.value })
                    }
                    placeholder="e.g. 1h, 30m, 1d"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Limit</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={9999}
                      value={formData.dataLimit}
                      onChange={(e) =>
                        setFormData({ ...formData, dataLimit: e.target.value })
                      }
                      placeholder="0"
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
              </div>

              <div className="space-y-2">
                <Label>Comment</Label>
                <Input
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  placeholder="User for comment"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button
            type="submit"
            disabled={generating}
            className="w-full sm:w-auto"
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Users className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
        </div>
      </form>
    </div>
  );
}
