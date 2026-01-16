"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Info,
  Server,
  Wifi,
  Users,
  UserPlus,
  Activity,
  DollarSign,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DashboardStats {
  identity: string;
  date: string;
  time: string;
  uptime: string;
  boardName: string;
  model: string;
  version: string;
  cpuLoad: string;
  freeMemory: string;
  freeHdd: string;
  activeUsers: number;
  totalUsers: number;
  interfaces: string[];
  currency: string;
}

interface TrafficData {
  tx: number;
  rx: number;
  time: number;
}

interface LogEntry {
  time: string;
  user: string;
  message: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function formatBits(bits: number, short = false): string {
  if (bits === 0) return "0 bps";
  const units = ["bps", "kbps", "Mbps", "Gbps"];
  const i = Math.floor(Math.log(bits) / Math.log(1024));
  const value = bits / Math.pow(1024, i);
  return short
    ? `${value.toFixed(1)} ${units[i]}`
    : `${value.toFixed(2)} ${units[i]}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [traffic, setTraffic] = useState<TrafficData[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoaded, setLogsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterface, setSelectedInterface] = useState<string>("");

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) {
        router.push("/sessions");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
        if (!selectedInterface && data.data.interfaces?.length > 0) {
          setSelectedInterface(data.data.interfaces[0]);
        }
        setError(null);
      } else {
        setError(data.error || "Failed to fetch dashboard data");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [router, selectedInterface]);

  const fetchTraffic = useCallback(async () => {
    if (!selectedInterface) return;
    try {
      const res = await fetch(`/api/traffic?interface=${selectedInterface}`);
      const data = await res.json();
      if (data.success) {
        setTraffic((prev) => {
          const newData = [
            ...prev,
            { tx: data.tx, rx: data.rx, time: Date.now() },
          ];
          return newData.slice(-20);
        });
      }
    } catch {
      console.error("Failed to fetch traffic");
    }
  }, [selectedInterface]);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.data || []);
      }
    } catch {
      console.error("Failed to fetch logs");
    } finally {
      setLogsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchLogs();
    const dashInterval = setInterval(fetchDashboard, 10000);
    const logInterval = setInterval(fetchLogs, 30000);
    return () => {
      clearInterval(dashInterval);
      clearInterval(logInterval);
    };
  }, [fetchDashboard, fetchLogs]);

  useEffect(() => {
    if (selectedInterface) {
      fetchTraffic();
      const trafficInterval = setInterval(fetchTraffic, 8000);
      return () => clearInterval(trafficInterval);
    }
  }, [selectedInterface, fetchTraffic]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Activity className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = traffic.map((t) => ({
    name: new Date(t.time).toLocaleTimeString(),
    tx: t.tx,
    rx: t.rx,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-start gap-3">
            <Calendar className="mt-1 h-8 w-8 text-primary" />
            <div className="text-sm">
              <p className="font-medium">System Date Time</p>
              <p>
                {stats.date} {stats.time}
              </p>
              <p>Uptime: {stats.uptime}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-1 h-8 w-8 text-primary" />
            <div className="text-sm">
              <p className="font-medium">Board Name: {stats.boardName}</p>
              <p>Model: {stats.model}</p>
              <p>RouterOS: {stats.version}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-start gap-3">
            <Server className="mt-1 h-8 w-8 text-primary" />
            <div className="text-sm">
              <p className="font-medium">CPU Load: {stats.cpuLoad}%</p>
              <p>Free Memory: {formatBytes(parseInt(stats.freeMemory) || 0)}</p>
              <p>Free HDD: {formatBytes(parseInt(stats.freeHdd) || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wifi className="h-4 w-4" /> Hotspot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Link href="/hotspot/active" className="block">
                  <div className="rounded-lg bg-blue-500 p-4 text-center text-white transition-opacity hover:opacity-90">
                    <p className="text-3xl font-bold">{stats.activeUsers}</p>
                    <p className="text-sm">
                      <Wifi className="mr-1 inline h-3 w-3" /> Hotspot Active
                    </p>
                  </div>
                </Link>
                <Link href="/hotspot/users" className="block">
                  <div className="rounded-lg bg-green-500 p-4 text-center text-white transition-opacity hover:opacity-90">
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                    <p className="text-sm">
                      <Users className="mr-1 inline h-3 w-3" /> Hotspot Users
                    </p>
                  </div>
                </Link>
                <Link href="/hotspot/users/add" className="block">
                  <div className="rounded-lg bg-yellow-500 p-4 text-center text-white transition-opacity hover:opacity-90">
                    <p className="text-3xl font-bold">
                      <UserPlus className="mx-auto h-8 w-8" />
                    </p>
                    <p className="text-sm">Add User</p>
                  </div>
                </Link>
                <Link href="/hotspot/users/generate" className="block">
                  <div className="rounded-lg bg-red-500 p-4 text-center text-white transition-opacity hover:opacity-90">
                    <p className="text-3xl font-bold">
                      <UserPlus className="mx-auto h-8 w-8" />
                    </p>
                    <p className="text-sm">Generate</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Traffic Monitor
                </span>
                {stats.interfaces && stats.interfaces.length > 0 && (
                  <select
                    className="rounded border bg-background px-2 py-1 text-sm"
                    value={selectedInterface}
                    onChange={(e) => {
                      setSelectedInterface(e.target.value);
                      setTraffic([]);
                    }}
                  >
                    {stats.interfaces.map((iface) => (
                      <option key={iface} value={iface}>
                        {iface}
                      </option>
                    ))}
                  </select>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                {chartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Loading traffic data...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="txGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="rxGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#22c55e"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#22c55e"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => formatBits(value, true)}
                        width={70}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                        labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
                        formatter={(value, name) => [
                          formatBits(Number(value) || 0),
                          name === "tx" ? "Upload (TX)" : "Download (RX)",
                        ]}
                      />
                      <Legend
                        formatter={(value) =>
                          value === "tx" ? "Upload (TX)" : "Download (RX)"
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="tx"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#txGradient)"
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 2 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="rx"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fill="url(#rxGradient)"
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <DollarSign className="mt-1 h-8 w-8 text-primary" />
              <div className="text-sm">
                <p className="font-medium">Income</p>
                <p>Today: {stats.currency} 0</p>
                <p>This Month: {stats.currency} 0</p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                <Link href="/log/hotspot" className="hover:underline">
                  Hotspot Log
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-1">Time</th>
                      <th className="p-1">User</th>
                      <th className="p-1">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!logsLoaded ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-4 text-center text-muted-foreground"
                        >
                          <Activity className="mx-auto h-4 w-4 animate-spin" />{" "}
                          Loading...
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-4 text-center text-muted-foreground"
                        >
                          No hotspot logs found
                        </td>
                      </tr>
                    ) : (
                      logs.slice(0, 20).map((log, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-1">{log.time}</td>
                          <td className="p-1">{log.user}</td>
                          <td className="p-1">{log.message}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
