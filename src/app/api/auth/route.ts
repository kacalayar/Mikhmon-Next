import { NextRequest, NextResponse } from "next/server";
import { createRouterOSClient } from "@/lib/routeros";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { host, port = 8728, user, password, name } = body;

    if (!host || !user || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: host, user, password",
        },
        { status: 400 },
      );
    }

    const client = createRouterOSClient();
    const connected = await client.connect({ host, port, user, password });

    if (!connected) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to connect to MikroTik. Check IP, port, and credentials.",
        },
        { status: 401 },
      );
    }

    const identity = await client.getSystemIdentity();
    await client.disconnect();

    // Save session to cookie
    const sessionData = {
      name: name || identity.name,
      host,
      port,
      user,
      password,
      identity: identity.name,
    };

    const cookieStore = await cookies();
    cookieStore.set("mikhmon_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      data: {
        identity: identity.name,
        message: "Connected successfully",
      },
    });
  } catch (error) {
    console.error("Auth connect error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("mikhmon_session");

  return NextResponse.json({
    success: true,
    message: "Disconnected successfully",
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("mikhmon_session");

  if (!sessionData) {
    return NextResponse.json({
      success: true,
      data: { connected: false },
    });
  }

  try {
    const session = JSON.parse(sessionData.value);
    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        name: session.name,
        host: session.host,
        identity: session.identity,
      },
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: { connected: false },
    });
  }
}
