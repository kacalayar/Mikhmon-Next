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

  const { client, error } = await getAuthenticatedClient();
  if (!client) {
    return NextResponse.json(
      { success: false, error: error || "Unauthorized" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
    const leases = await client.write("/ip/dhcp-server/lease/print");
    await client.disconnect();

    return NextResponse.json(
      { success: true, data: leases || [] },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("DHCP leases API error:", error);
    return NextResponse.json(
      { success: true, data: [] },
      { headers: rateLimit.headers },
    );
  }
}
