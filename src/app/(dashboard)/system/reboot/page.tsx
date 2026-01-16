"use client";

import { useState } from "react";
import { Power, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RebootPage() {
  const [rebooting, setRebooting] = useState(false);

  async function handleReboot() {
    if (!confirm("Are you sure you want to reboot the MikroTik router?"))
      return;

    setRebooting(true);
    try {
      const res = await fetch("/api/system/reboot", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Router is rebooting...");
      } else {
        toast.error(data.error || "Failed to reboot");
      }
    } catch (error) {
      console.error("Failed to reboot:", error);
      toast.error("Failed to reboot");
    } finally {
      setRebooting(false);
    }
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="h-5 w-5" />
            <span>Reboot System</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This will reboot the MikroTik router. All connections will be
            temporarily lost.
          </p>
          <Button
            variant="destructive"
            onClick={handleReboot}
            disabled={rebooting}
          >
            {rebooting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Power className="mr-2 h-4 w-4" />
            )}
            Reboot Router
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
