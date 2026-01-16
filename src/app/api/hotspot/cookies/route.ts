import { NextRequest, NextResponse } from "next/server";
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

    const hotspotCookies = await client.write("/ip/hotspot/cookie/print");
    await client.disconnect();

    return NextResponse.json({ success: true, data: hotspotCookies });
  } catch (error) {
    console.error("Hotspot cookies API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Cookie ID is required" },
        { status: 400 },
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
        { status: 503 },
      );
    }

    await client.write("/ip/hotspot/cookie/remove", [`=.id=${id}`]);
    await client.disconnect();

    return NextResponse.json({ success: true, message: "Cookie removed" });
  } catch (error) {
    console.error("Delete cookie error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove cookie" },
      { status: 500 },
    );
  }
}
