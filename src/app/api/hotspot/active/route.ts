import { NextRequest, NextResponse } from "next/server";
import { createRouterOSClient } from "@/lib/routeros";
import { cookies } from "next/headers";

async function getClient() {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("mikhmon_session");

  if (!sessionData) {
    return null;
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
      return null;
    }

    return client;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const client = await getClient();

  if (!client) {
    return NextResponse.json(
      { success: false, error: "Not connected to MikroTik" },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const server = searchParams.get("server") || undefined;

    const active = await client.getHotspotActive(server);
    await client.disconnect();

    return NextResponse.json({
      success: true,
      data: active,
    });
  } catch (error) {
    console.error("Hotspot active GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get active connections" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const client = await getClient();

  if (!client) {
    return NextResponse.json(
      { success: false, error: "Not connected to MikroTik" },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Active connection ID is required" },
        { status: 400 },
      );
    }

    await client.removeHotspotActive(id);
    await client.disconnect();

    return NextResponse.json({
      success: true,
      message: "Connection removed successfully",
    });
  } catch (error) {
    console.error("Hotspot active DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove connection" },
      { status: 500 },
    );
  }
}
