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

    const bindings = await client.write("/ip/hotspot/ip-binding/print");
    await client.disconnect();

    return NextResponse.json({ success: true, data: bindings });
  } catch (error) {
    console.error("IP Binding API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, action } = await request.json();

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: "ID and action are required" },
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

    const disabled = action === "disable" ? "yes" : "no";
    await client.write("/ip/hotspot/ip-binding/set", [
      `=.id=${id}`,
      `=disabled=${disabled}`,
    ]);

    await client.disconnect();

    return NextResponse.json({
      success: true,
      message: `Binding ${action}d successfully`,
    });
  } catch (error) {
    console.error("Toggle binding error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update binding" },
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
        { success: false, error: "Binding ID is required" },
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

    await client.write("/ip/hotspot/ip-binding/remove", [`=.id=${id}`]);
    await client.disconnect();

    return NextResponse.json({ success: true, message: "Binding deleted" });
  } catch (error) {
    console.error("Delete binding error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete binding" },
      { status: 500 },
    );
  }
}
