"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X } from "lucide-react";
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

export default function AddProfilePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    sharedUsers: "1",
    rateLimit: "",
    sessionTimeout: "",
    idleTimeout: "",
    keepaliveTimeout: "",
    addressPool: "none",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const profileData: Record<string, string> = {
        name: formData.name.replace(/\s+/g, "-"),
        "shared-users": formData.sharedUsers,
      };

      if (formData.rateLimit) {
        profileData["rate-limit"] = formData.rateLimit;
      }

      if (formData.sessionTimeout) {
        profileData["session-timeout"] = formData.sessionTimeout;
      }

      if (formData.idleTimeout) {
        profileData["idle-timeout"] = formData.idleTimeout;
      }

      if (formData.keepaliveTimeout) {
        profileData["keepalive-timeout"] = formData.keepaliveTimeout;
      }

      if (formData.addressPool !== "none") {
        profileData["address-pool"] = formData.addressPool;
      }

      const res = await fetch("/api/hotspot/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Profile created successfully");
        router.push("/hotspot/profiles");
      } else {
        toast.error(data.error || "Failed to create profile");
      }
    } catch {
      toast.error("Failed to create profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Add User Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push("/hotspot/profiles")}
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
                      <td className="py-3 pr-4 align-middle w-40">Name</td>
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
                      <td className="py-3 pr-4 align-middle">Address Pool</td>
                      <td className="py-3">
                        <Select
                          value={formData.addressPool}
                          onValueChange={(value) =>
                            setFormData({ ...formData, addressPool: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">none</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 align-middle">Shared Users</td>
                      <td className="py-3">
                        <Input
                          type="number"
                          min={1}
                          value={formData.sharedUsers}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sharedUsers: e.target.value,
                            })
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 align-middle">Rate Limit</td>
                      <td className="py-3">
                        <Input
                          value={formData.rateLimit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rateLimit: e.target.value,
                            })
                          }
                          placeholder="e.g. 512k/512k"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 align-middle">
                        Session Timeout
                      </td>
                      <td className="py-3">
                        <Input
                          value={formData.sessionTimeout}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sessionTimeout: e.target.value,
                            })
                          }
                          placeholder="e.g. 1h, 30m"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 align-middle">Idle Timeout</td>
                      <td className="py-3">
                        <Input
                          value={formData.idleTimeout}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              idleTimeout: e.target.value,
                            })
                          }
                          placeholder="e.g. 5m"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 align-middle">
                        Keepalive Timeout
                      </td>
                      <td className="py-3">
                        <Input
                          value={formData.keepaliveTimeout}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              keepaliveTimeout: e.target.value,
                            })
                          }
                          placeholder="e.g. 2m"
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
                <CardTitle>Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-4">
                <div>
                  <p className="font-medium text-foreground">
                    Rate Limit Format
                  </p>
                  <p>upload/download</p>
                  <p>Example: 512k/512k, 1M/2M</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Time Format</p>
                  <p>Use: s (seconds), m (minutes), h (hours), d (days)</p>
                  <p>Example: 30m, 1h, 1d</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
