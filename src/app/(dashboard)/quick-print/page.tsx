"use client";

import { useEffect, useState, useCallback } from "react";
import { Printer, List, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { printVouchers, VoucherData } from "@/components/print";
import Link from "next/link";

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

interface QuickPrintPackage {
  id: string;
  name: string;
  package: string;
  server: string;
  profile: string;
  timeLimit: string;
  dataLimit: string;
  validity: string;
  price: string;
  sellingPrice: string;
}

export default function QuickPrintPage() {
  const [packages, setPackages] = useState<QuickPrintPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [routerName, setRouterName] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      try {
        // Load packages and router identity in parallel
        const [packagesRes, dashboardRes] = await Promise.all([
          fetch("/api/quick-print"),
          fetch("/api/dashboard"),
        ]);

        const [packagesData, dashboardData] = await Promise.all([
          packagesRes.json(),
          dashboardRes.json(),
        ]);

        if (packagesData.success) {
          setPackages(packagesData.data);
        }
        if (dashboardData.success && dashboardData.data?.identity) {
          setRouterName(dashboardData.data.identity);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePrint = useCallback(
    async (pkg: QuickPrintPackage) => {
      setGeneratingId(pkg.id);

      try {
        // Generate a new user based on the package configuration
        const res = await fetch("/api/quick-print/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageId: pkg.id,
            packageName: pkg.package,
            server: pkg.server,
            profile: pkg.profile,
            timeLimit: pkg.timeLimit,
            dataLimit: pkg.dataLimit,
            validity: pkg.validity,
            price: pkg.sellingPrice || pkg.price,
          }),
        });

        const data = await res.json();

        if (data.success && data.user) {
          // Prepare voucher data for printing
          const voucher: VoucherData = {
            username: data.user.username,
            password: data.user.password,
            profile: pkg.profile,
            timeLimit: pkg.timeLimit !== "-" ? pkg.timeLimit : undefined,
            dataLimit: pkg.dataLimit !== "-" ? pkg.dataLimit : undefined,
            validity: pkg.validity !== "-" ? pkg.validity : undefined,
            price: pkg.sellingPrice || pkg.price,
            server: pkg.server !== "all" ? pkg.server : undefined,
          };

          // Print directly using browser print dialog
          printVouchers([voucher], { routerName, showQr: false });
          toast.success(`User "${data.user.username}" created successfully`);
        } else {
          toast.error(data.error || "Failed to generate voucher");
        }
      } catch (error) {
        console.error("Failed to generate:", error);
        toast.error("Failed to generate voucher");
      } finally {
        setGeneratingId(null);
      }
    },
    [routerName],
  );

  if (loading) {
    return (
      <div className="flex h-full flex-col space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
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
            <Printer className="h-5 w-5" />
            <span>Quick Print</span>
            <span className="text-sm font-normal text-muted-foreground">
              |{" "}
              <Link href="/quick-print/list" className="hover:underline">
                <List className="inline h-3 w-3 mr-1" />
                List
              </Link>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {packages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No quick print packages found.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Create packages in MikroTik System Scripts with comment
                &quot;QuickPrintMikhmon&quot; or{" "}
                <Link href="/quick-print/list" className="underline">
                  add a new package here
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg, index) => {
                const isGenerating = generatingId === pkg.id;
                return (
                  <Card
                    key={pkg.id}
                    className={`${COLORS[index % COLORS.length]} text-white border-0 cursor-pointer hover:opacity-90 transition ${isGenerating ? "opacity-70 cursor-wait" : ""}`}
                    onClick={() => !isGenerating && handlePrint(pkg)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-white/20 p-3">
                          {isGenerating ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <Printer className="h-6 w-6" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold">
                            Package: {pkg.package}
                          </h3>
                          <div className="text-sm opacity-90 space-y-1">
                            <p>
                              Time: {pkg.timeLimit} | Data: {pkg.dataLimit}
                            </p>
                            <p>Validity: {pkg.validity}</p>
                            <p>
                              Price: {pkg.price} | Selling: {pkg.sellingPrice}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
