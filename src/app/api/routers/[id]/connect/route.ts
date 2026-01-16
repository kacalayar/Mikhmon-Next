import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRouter } from "@/lib/router-config";
import { createRouterOSClient } from "@/lib/routeros";
import { setRouterSession } from "@/lib/session";
import { withRateLimit, createRateLimitHeaders } from "@/lib/rate-limit";

const checkRateLimit = withRateLimit("api");

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Rate limiting
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== "string" || id.length > 100) {
      return NextResponse.json(
        { success: false, error: "Invalid router ID" },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const router = await getRouter(id);
    if (!router) {
      return NextResponse.json(
        { success: false, error: "Router not found" },
        { status: 404, headers: rateLimit.headers },
      );
    }

    const client = createRouterOSClient({
      host: router.host,
      port: router.port,
      user: router.username,
      password: router.password,
    });

    const connected = await client.connect();
    if (!connected) {
      console.error("Connection failed for router:", {
        id: router.id,
        host: router.host,
        port: router.port,
        user: router.username,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Gagal konek ke MikroTik ${router.host}:${router.port}. Cek IP, user, password dan pastikan port API (${router.port}) aktif.`,
        },
        { status: 400, headers: rateLimit.headers },
      );
    }

    await client.disconnect();

    // Store session with encryption
    await setRouterSession({
      id: router.id,
      name: router.name,
      host: router.host,
      port: router.port,
      user: router.username,
      password: router.password,
      hotspotName: router.hotspotName,
      currency: router.currency,
    });

    return NextResponse.json(
      { success: true, data: { id: router.id } },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Failed to connect:", error);
    return NextResponse.json(
      { success: false, error: "Gagal konek ke router" },
      { status: 500 },
    );
  }
}
