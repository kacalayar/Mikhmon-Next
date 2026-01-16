import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/session";
import { withRateLimit } from "@/lib/rate-limit";

const checkReadonlyRateLimit = withRateLimit("readonly");

export async function GET(request: NextRequest) {
  const rateLimit = checkReadonlyRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const { client, error } = await getAuthenticatedClient();
  if (!client) {
    return NextResponse.json(
      { success: false, error: error || "Unauthorized" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
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

    return NextResponse.json(
      { success: true, data: formattedLogs },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Logs API error:", error);
    return NextResponse.json(
      { success: true, data: [] },
      { status: 200, headers: rateLimit.headers },
    );
  }
}
