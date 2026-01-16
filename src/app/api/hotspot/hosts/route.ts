import { NextRequest, NextResponse } from "next/server";
import { createRouterOSClient } from "@/lib/routeros";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const authorized = searchParams.get("authorized");
    const bypassed = searchParams.get("bypassed");

    let hosts;
    if (authorized === "yes") {
      hosts = await client.write("/ip/hotspot/host/print", ["?authorized=yes"]);
    } else if (bypassed === "yes") {
      hosts = await client.write("/ip/hotspot/host/print", ["?bypassed=yes"]);
    } else {
      hosts = await client.write("/ip/hotspot/host/print");
    }

    await client.disconnect();

    return NextResponse.json({ success: true, data: hosts });
  } catch (error) {
    console.error("Hotspot hosts API error:", error);
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
        { success: false, error: "Host ID is required" },
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

    await client.write("/ip/hotspot/host/remove", [`=.id=${id}`]);
    await client.disconnect();

    return NextResponse.json({ success: true, message: "Host deleted" });
  } catch (error) {
    console.error("Delete host error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete host" },
      { status: 500 },
    );
  }
}
