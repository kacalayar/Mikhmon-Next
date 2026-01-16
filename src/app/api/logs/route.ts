import { NextResponse } from "next/server";
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
        { success: false, error: "Failed to connect" },
        { status: 503 },
      );
    }

    // Get recent logs (without filter to ensure we get results)
    const logs = await client.write<{
      time?: string;
      message?: string;
      topics?: string;
    }>("/log/print");

    await client.disconnect();

    // Filter hotspot related logs and format
    const hotspotLogs = logs.filter((log) => {
      const topics = log.topics || "";
      return topics.includes("hotspot") || topics.includes("info");
    });

    const formattedLogs = hotspotLogs
      .slice(-50)
      .reverse()
      .map((log) => {
        const message = log.message || "";
        const userMatch = message.match(/([^\s:]+)/);
        return {
          time: log.time || "",
          user: userMatch ? userMatch[1] : "",
          message: message,
        };
      });

    return NextResponse.json({
      success: true,
      data: formattedLogs,
    });
  } catch (error) {
    console.error("Logs API error:", error);
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  }
}
