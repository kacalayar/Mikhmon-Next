"use client";

import { useEffect, useState } from "react";
import {
  Ticket,
  ExternalLink,
  Users as UsersIcon,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface ProfileCount {
  profile: string;
  count: number;
}

const COLORS = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-gray-500",
];

export default function VouchersPage() {
  const [profileCounts, setProfileCounts] = useState<ProfileCount[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadVouchers() {
    setLoading(true);
    try {
      const [usersRes, profilesRes] = await Promise.all([
        fetch("/api/hotspot/users"),
        fetch("/api/hotspot/profiles"),
      ]);

      const [usersData, profilesData] = await Promise.all([
        usersRes.json(),
        profilesRes.json(),
      ]);

      if (usersData.success && profilesData.success) {
        const users = usersData.data;
        const profiles = profilesData.data;

        // Count total users
        const allCount = users.length;

        // Count users per profile
        const counts: ProfileCount[] = [{ profile: "all", count: allCount }];

        profiles.forEach((profile: { name: string }) => {
          const count = users.filter(
            (user: { profile: string }) => user.profile === profile.name,
          ).length;
          counts.push({ profile: profile.name, count });
        });

        setProfileCounts(counts);
      }
    } catch (error) {
      console.error("Failed to load vouchers:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVouchers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full flex-col space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="mb-2 h-8 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            <span>Vouchers</span>
            <span className="text-sm font-normal text-muted-foreground">
              |{" "}
              <button
                onClick={loadVouchers}
                className="cursor-pointer hover:text-primary"
              >
                <RefreshCw className="inline h-3 w-3" />
              </button>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profileCounts.map((item, index) => (
              <Card
                key={item.profile}
                className={`${COLORS[index % COLORS.length]} text-white border-0`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-white/20 p-3">
                      <Ticket className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold">Profile: {item.profile}</h3>
                      <p className="text-sm opacity-90">
                        {item.count} {item.count === 1 ? "Item" : "Items"}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="h-8"
                        >
                          <Link href={`/hotspot/users?profile=${item.profile}`}>
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Open
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="h-8"
                        >
                          <Link
                            href={
                              item.profile === "all"
                                ? "/hotspot/users/generate"
                                : `/hotspot/users/generate?profile=${item.profile}`
                            }
                          >
                            <UsersIcon className="mr-1 h-3 w-3" />
                            Generate
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
