import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRouter } from "@/lib/router-config";
import { createRouterOSClient } from "@/lib/routeros";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const router = await getRouter(id);
    if (!router) {
      return NextResponse.json(
        { success: false, error: "Router not found" },
        { status: 404 },
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
          error:
            `Gagal konek ke MikroTik ${router.host}:${router.port}. Cek IP, user, password dan pastikan port API (${router.port}) aktif.`,
        },
        { status: 400 },
      );
    }

    await client.disconnect();

    const cookieStore = await cookies();
    cookieStore.set(
      "mikhmon_session",
      JSON.stringify({
        id: router.id,
        host: router.host,
        port: router.port,
        user: router.username,
        password: router.password,
        name: router.name,
        hotspotName: router.hotspotName,
        currency: router.currency,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      },
    );

    return NextResponse.json({ success: true, data: { id: router.id } });
  } catch (error) {
    console.error("Failed to connect:", error);
    return NextResponse.json(
      { success: false, error: "Gagal konek ke router" },
      { status: 500 },
    );
  }
}
