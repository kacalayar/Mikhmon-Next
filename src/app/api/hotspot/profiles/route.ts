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

export async function GET() {
  const client = await getClient();

  if (!client) {
    return NextResponse.json(
      { success: false, error: "Not connected to MikroTik" },
      { status: 401 },
    );
  }

  try {
    const profiles = await client.getHotspotUserProfiles();
    await client.disconnect();

    return NextResponse.json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    console.error("Hotspot profiles GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get hotspot profiles" },
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
    const result = await client.addHotspotUserProfile(body);
    await client.disconnect();

    return NextResponse.json({
      success: true,
      data: { id: result[0]?.ret },
      message: "Profile created successfully",
    });
  } catch (error) {
    console.error("Hotspot profiles POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create profile" },
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
    const { id, ...profileData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Profile ID is required" },
        { status: 400 },
      );
    }

    await client.updateHotspotUserProfile(id, profileData);
    await client.disconnect();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Hotspot profiles PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
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
        { success: false, error: "Profile ID is required" },
        { status: 400 },
      );
    }

    await client.removeHotspotUserProfile(id);
    await client.disconnect();

    return NextResponse.json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("Hotspot profiles DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete profile" },
      { status: 500 },
    );
  }
}
