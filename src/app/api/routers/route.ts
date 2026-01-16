import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRouters, addRouter } from "@/lib/router-config";
import { validateInput, routerSchema } from "@/lib/validations";
import { withRateLimit } from "@/lib/rate-limit";

const checkReadRateLimit = withRateLimit("readonly");
const checkWriteRateLimit = withRateLimit("api");

export async function GET(request: Request) {
  // Rate limiting
  const rateLimit = checkReadRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
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
    const routers = await getRouters();

    // Don't expose passwords in list response
    const sanitizedRouters = routers.map((r) => ({
      ...r,
      password: undefined, // Remove password from response
    }));

    return NextResponse.json(
      { success: true, data: sanitizedRouters },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Failed to get routers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get routers" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

export async function POST(request: Request) {
  // Rate limiting
  const rateLimit = checkWriteRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
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
    const body = await request.json();

    // Parse host:port if provided in host field
    const processedBody = { ...body };
    if (body.host && body.host.includes(":")) {
      const parts = body.host.split(":");
      processedBody.host = parts[0];
      processedBody.port = parseInt(parts[1]) || 8728;
    }

    // Validate input
    const validation = validateInput(routerSchema, processedBody);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const validatedData = validation.data;

    const router = await addRouter({
      name: validatedData.name,
      host: validatedData.host,
      port: validatedData.port,
      username: validatedData.username,
      password: validatedData.password,
      hotspotName: validatedData.hotspotName || validatedData.name,
      dnsName: validatedData.dnsName || "",
      currency: validatedData.currency,
      autoReload: validatedData.autoReload,
    });

    // Don't expose password in response
    const sanitizedRouter = { ...router, password: undefined };

    return NextResponse.json(
      { success: true, data: sanitizedRouter },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Failed to add router:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add router" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
