import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/session";
import { withRateLimit } from "@/lib/rate-limit";

// Use strict rate limiting for dangerous operations
const checkRateLimit = withRateLimit("sensitive");

export async function POST(request: Request) {
  // Rate limiting - very strict for shutdown
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please wait before retrying.",
      },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const { client, error } = await getAuthenticatedClient();

  if (!client) {
    return NextResponse.json(
      { success: false, error: error || "No active session" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
    await client.write("/system/shutdown");
    await client.disconnect();

    return NextResponse.json(
      { success: true, message: "Router is shutting down" },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Shutdown error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to shutdown" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
