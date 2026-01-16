import { NextResponse } from "next/server";
import { getAuthenticatedClient, getRouterSession } from "@/lib/session";
import { withRateLimit } from "@/lib/rate-limit";

const checkRateLimit = withRateLimit("readonly");

export async function GET(request: Request) {
  // Rate limiting
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const { client, error } = await getAuthenticatedClient();

  if (!client) {
    return NextResponse.json(
      { success: false, error: error || "No active session" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
    const session = await getRouterSession();

    const [
      identity,
      resource,
      clock,
      routerboard,
      users,
      activeUsers,
      interfaces,
    ] = await Promise.all([
      client.getSystemIdentity(),
      client.getSystemResource(),
      client.write("/system/clock/print").then((r) => r[0] || {}),
      client.write("/system/routerboard/print").then((r) => r[0] || {}),
      client.getHotspotUsers(),
      client.getHotspotActive(),
      client
        .write<{ name: string }>("/interface/print")
        .then((r) => r.map((i) => i.name)),
    ]);

    await client.disconnect();

    return NextResponse.json(
      {
        success: true,
        routerId: session?.id,
        data: {
          identity: identity.name,
          date: clock.date || "",
          time: clock.time || "",
          uptime: resource.uptime,
          boardName: resource["board-name"] || "",
          model: routerboard.model || "",
          version: resource.version,
          cpuLoad: resource["cpu-load"],
          freeMemory: resource["free-memory"],
          freeHdd: resource["free-hdd-space"],
          activeUsers: activeUsers.length,
          totalUsers: users.length,
          interfaces: interfaces || [],
          currency: session?.currency || "Rp",
        },
      },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
