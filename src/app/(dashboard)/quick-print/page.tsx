"use client";

import { useEffect, useState } from "react";
import { Printer, List } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
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

  useEffect(() => {
    async function loadPackages() {
      try {
        const res = await fetch("/api/quick-print");
        const data = await res.json();
        if (data.success) {
          setPackages(data.data);
        }
      } catch (error) {
        console.error("Failed to load packages:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPackages();
  }, []);

  async function handlePrint(pkg: QuickPrintPackage) {
    toast.info(`Printing package: ${pkg.package}`);
    // TODO: Implement print voucher functionality
  }

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
                &quot;QuickPrintMikhmon&quot;
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg, index) => (
                <Card
                  key={pkg.id}
                  className={`${COLORS[index % COLORS.length]} text-white border-0 cursor-pointer hover:opacity-90 transition`}
                  onClick={() => handlePrint(pkg)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-white/20 p-3">
                        <Printer className="h-6 w-6" />
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
