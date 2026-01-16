import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRouters, addRouter } from "@/lib/router-config";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const routers = await getRouters();
    return NextResponse.json({ success: true, data: routers });
  } catch (error) {
    console.error("Failed to get routers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get routers" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    
    // Parse host:port if provided in host field
    let host = body.host;
    let port = body.port || 8728;
    
    if (body.host && body.host.includes(":")) {
      const parts = body.host.split(":");
      host = parts[0];
      port = parseInt(parts[1]) || 8728;
    }
    
    const router = await addRouter({
      name: body.name,
      host,
      port,
      username: body.username,
      password: body.password,
      hotspotName: body.hotspotName || body.name,
      dnsName: body.dnsName || "",
      currency: body.currency || "Rp",
      autoReload: body.autoReload || 10,
    });
    return NextResponse.json({ success: true, data: router });
  } catch (error) {
    console.error("Failed to add router:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add router" },
      { status: 500 },
    );
  }
}
