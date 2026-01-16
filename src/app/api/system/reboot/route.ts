import { NextResponse } from "next/server";
import { createRouterOSClient } from "@/lib/routeros";
import { cookies } from "next/headers";

export async function POST() {
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

    await client.write("/system/reboot");
    await client.disconnect();

    return NextResponse.json({ success: true, message: "Router is rebooting" });
  } catch (error) {
    console.error("Reboot error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reboot" },
      { status: 500 },
    );
  }
}
