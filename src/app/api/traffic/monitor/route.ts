import { NextRequest, NextResponse } from "next/server";
import { createRouterOSClient } from "@/lib/routeros";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("mikhmon_session");

  if (!sessionData) {
    return NextResponse.json(
      { success: false, error: "No active session" },
      { status: 401 }
    );
  }

  try {
    const session = JSON.parse(sessionData.value);
    const { searchParams } = new URL(request.url);
    const iface = searchParams.get("interface");

    if (!iface) {
      return NextResponse.json(
        { success: false, error: "Interface is required" },
        { status: 400 }
      );
    }

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
        { status: 503 }
      );
    }

    const stats = await client.write("/interface/monitor-traffic", [
      `=interface=${iface}`,
      "=once=",
    ]);

    await client.disconnect();

    const stat = stats[0] as any;
    const tx = parseInt(stat?.["tx-bits-per-second"] || "0");
    const rx = parseInt(stat?.["rx-bits-per-second"] || "0");

    return NextResponse.json({
      success: true,
      data: { tx, rx, timestamp: Date.now() },
    });
  } catch (error) {
    console.error("Traffic monitor API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get traffic data" },
      { status: 500 }
    );
  }
}
