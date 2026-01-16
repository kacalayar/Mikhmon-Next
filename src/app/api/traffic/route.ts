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
  const iface = searchParams.get("interface") || "ether1";

  const { client, error } = await getAuthenticatedClient();
  if (!client) {
    return NextResponse.json(
      { success: false, error: error || "Unauthorized" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
    const traffic = await client.write<{
      "tx-bits-per-second": string;
      "rx-bits-per-second": string;
    }>("/interface/monitor-traffic", [`=interface=${iface}`, "=once="]);

    await client.disconnect();

    const data = traffic[0] || {};
    return NextResponse.json(
      {
        success: true,
        tx: parseInt(data["tx-bits-per-second"] || "0") || 0,
        rx: parseInt(data["rx-bits-per-second"] || "0") || 0,
      },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Traffic API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
