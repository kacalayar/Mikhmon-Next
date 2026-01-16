"use client";

import { useEffect, useState } from "react";
import { AreaChart, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrafficData {
  time: string;
  tx: number;
  rx: number;
}

interface InterfaceItem {
  ".id": string;
  name: string;
}

function formatBps(bps: number): string {
  const sizes = ["bps", "Kbps", "Mbps", "Gbps"];
  if (bps === 0) return "0 bps";
  const i = Math.floor(Math.log(bps) / Math.log(1024));
  return (
    Math.round((bps / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  );
}

export default function TrafficPage() {
  const [interfaces, setInterfaces] = useState<InterfaceItem[]>([]);
  const [selectedInterface, setSelectedInterface] = useState<string>("");
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInterfaces() {
      try {
        const res = await fetch("/api/interfaces");
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setInterfaces(data.data);
          setSelectedInterface(data.data[0].name);
        }
      } catch (error) {
        console.error("Failed to load interfaces:", error);
      } finally {
        setLoading(false);
      }
    }

    loadInterfaces();
  }, []);

  useEffect(() => {
    if (!selectedInterface) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/traffic/monitor?interface=${selectedInterface}`
        );
        const result = await res.json();

        if (result.success) {
          const now = new Date();
          const timeStr = now.toLocaleTimeString("en-US", { hour12: false });

          setTrafficData((prev) => {
            const newData = [
              ...prev,
              {
                time: timeStr,
                tx: result.data.tx,
                rx: result.data.rx,
              },
            ];
            return newData.slice(-20);
          });
        }
      } catch (error) {
        console.error("Failed to fetch traffic data:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedInterface]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AreaChart className="h-5 w-5" />
              <span>Interface: {selectedInterface || "Select Interface"}</span>
            </CardTitle>
            <div className="w-64">
              <Select
                value={selectedInterface}
                onValueChange={(value) => {
                  setSelectedInterface(value);
                  setTrafficData([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interface" />
                </SelectTrigger>
                <SelectContent>
                  {interfaces.map((iface, idx) => (
                    <SelectItem key={iface[".id"]} value={iface.name}>
                      [{idx + 1}] {iface.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full">
              {trafficData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsAreaChart
                    data={trafficData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis tickFormatter={(value) => formatBps(value)} />
                    <Tooltip
                      formatter={(value: any) => formatBps(Number(value))}
                      labelStyle={{ color: "#000" }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="tx"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorTx)"
                      name="TX"
                    />
                    <Area
                      type="monotone"
                      dataKey="rx"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorRx)"
                      name="RX"
                    />
                  </RechartsAreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Waiting for traffic data...
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
