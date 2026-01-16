import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/session";
import { withRateLimit } from "@/lib/rate-limit";

const checkReadonlyRateLimit = withRateLimit("readonly");

export async function GET(request: NextRequest) {
  const rateLimit = checkReadonlyRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const { searchParams } = new URL(request.url);
  const iface = searchParams.get("interface");

  if (!iface) {
    return NextResponse.json(
      { success: false, error: "Interface is required" },
      { status: 400, headers: rateLimit.headers },
    );
  }

  const { client, error } = await getAuthenticatedClient();
  if (!client) {
    return NextResponse.json(
      { success: false, error: error || "Unauthorized" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
    const stats = await client.write("/interface/monitor-traffic", [
      `=interface=${iface}`,
      "=once=",
    ]);

    await client.disconnect();

    const stat = stats[0] as Record<string, string>;
    const tx = parseInt(stat?.["tx-bits-per-second"] || "0");
    const rx = parseInt(stat?.["rx-bits-per-second"] || "0");

    return NextResponse.json(
      {
        success: true,
        data: { tx, rx, timestamp: Date.now() },
      },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Traffic monitor API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get traffic data" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
