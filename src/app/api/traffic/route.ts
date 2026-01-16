import { NextResponse } from "next/server";
import { createRouterOSClient } from "@/lib/routeros";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("mikhmon_session");

  if (!sessionData) {
    return NextResponse.json(
      { success: false, error: "No active session" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const iface = searchParams.get("interface") || "ether1";

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
        { success: false, error: "Failed to connect" },
        { status: 503 },
      );
    }

    const traffic = await client.write<{
      "tx-bits-per-second": string;
      "rx-bits-per-second": string;
    }>("/interface/monitor-traffic", [`=interface=${iface}`, "=once="]);

    await client.disconnect();

    const data = traffic[0] || {};
    return NextResponse.json({
      success: true,
      tx: parseInt(data["tx-bits-per-second"] || "0") || 0,
      rx: parseInt(data["rx-bits-per-second"] || "0") || 0,
    });
  } catch (error) {
    console.error("Traffic API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
