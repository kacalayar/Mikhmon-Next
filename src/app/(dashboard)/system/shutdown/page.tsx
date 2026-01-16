"use client";

import { useState } from "react";
import { Power, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ShutdownPage() {
  const [shuttingDown, setShuttingDown] = useState(false);

  async function handleShutdown() {
    if (
      !confirm(
        "Are you sure you want to shutdown the MikroTik router? This will turn off the device completely.",
      )
    )
      return;

    setShuttingDown(true);
    try {
      const res = await fetch("/api/system/shutdown", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Router is shutting down...");
      } else {
        toast.error(data.error || "Failed to shutdown");
      }
    } catch (error) {
      console.error("Failed to shutdown:", error);
      toast.error("Failed to shutdown");
    } finally {
      setShuttingDown(false);
    }
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="h-5 w-5" />
            <span>Shutdown System</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            <strong className="text-destructive">Warning:</strong> This will
            completely shutdown the MikroTik router. You will need physical
            access to turn it back on.
          </p>
          <Button
            variant="destructive"
            onClick={handleShutdown}
            disabled={shuttingDown}
          >
            {shuttingDown ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Power className="mr-2 h-4 w-4" />
            )}
            Shutdown Router
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
