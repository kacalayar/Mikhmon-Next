import { NextResponse } from "next/server";
import { createRouterOSClient } from "@/lib/routeros";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("mikhmon_session");

  if (!sessionData) {
    return NextResponse.json(
      { success: false, error: "No active session" },
      { status: 401 },
    );
  }

  try {
    const session = JSON.parse(sessionData.value);
    const client = createRouterOSClient();

    const connected = await client.connect({
      host: session.host,
      port: session.port,
      user: session.user,
      password: session.password,
    });

    if (!connected) {
      return NextResponse.json(
        { success: false, error: "Failed to connect to MikroTik" },
        { status: 503 },
      );
    }

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

    return NextResponse.json({
      success: true,
      routerId: session.id,
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
        currency: session.currency || "Rp",
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
