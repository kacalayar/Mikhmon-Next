import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/session";
import { withRateLimit } from "@/lib/rate-limit";

const checkReadRateLimit = withRateLimit("readonly");
const checkWriteRateLimit = withRateLimit("api");

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimit = checkReadRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const { client, error } = await getAuthenticatedClient();

  if (!client) {
    return NextResponse.json(
      { success: false, error: error || "Not connected to MikroTik" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const server = searchParams.get("server") || undefined;

    // Validate server param
    if (server && server.length > 100) {
      await client.disconnect();
      return NextResponse.json(
        { success: false, error: "Invalid server parameter" },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const active = await client.getHotspotActive(server);
    await client.disconnect();

    return NextResponse.json(
      { success: true, data: active },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Hotspot active GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get active connections" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Rate limiting
  const rateLimit = checkWriteRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const { client, error } = await getAuthenticatedClient();

  if (!client) {
    return NextResponse.json(
      { success: false, error: error || "Not connected to MikroTik" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || id.length > 50) {
      await client.disconnect();
      return NextResponse.json(
        { success: false, error: "Valid connection ID is required" },
        { status: 400, headers: rateLimit.headers },
      );
    }

    await client.removeHotspotActive(id);
    await client.disconnect();

    return NextResponse.json(
      { success: true, message: "Connection removed successfully" },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Hotspot active DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove connection" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
