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
    const profile = searchParams.get("profile");
    const comment = searchParams.get("comment");

    let filters: string[] | undefined;
    if (profile) {
      filters = [`?profile=${profile}`];
    } else if (comment) {
      filters = [`?comment=${comment}`];
    }

    const users = await client.getHotspotUsers(filters);
    await client.disconnect();

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Hotspot users GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get hotspot users" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const client = await getClient();

  if (!client) {
    return NextResponse.json(
      { success: false, error: "Not connected to MikroTik" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { name, password, profile, comment, disabled } = body;

    if (!name || !profile) {
      return NextResponse.json(
        { success: false, error: "Name and profile are required" },
        { status: 400 },
      );
    }

    const result = await client.addHotspotUser({
      name,
      password,
      profile,
      comment,
      disabled: disabled ? "true" : undefined,
    });

    await client.disconnect();

    return NextResponse.json({
      success: true,
      data: { id: result[0]?.ret },
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Hotspot users POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const client = await getClient();

  if (!client) {
    return NextResponse.json(
      { success: false, error: "Not connected to MikroTik" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { id, action, ...userData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    if (action === "enable") {
      await client.enableHotspotUser(id);
    } else if (action === "disable") {
      await client.disableHotspotUser(id);
    } else if (action === "reset") {
      await client.resetHotspotUser(id);
    } else {
      await client.updateHotspotUser(id, userData);
    }

    await client.disconnect();

    return NextResponse.json({
      success: true,
      message: action
        ? `User ${action}d successfully`
        : "User updated successfully",
    });
  } catch (error) {
    console.error("Hotspot users PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
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
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    await client.removeHotspotUser(id);
    await client.disconnect();

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Hotspot users DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
