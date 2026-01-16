import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRouter, updateRouter, deleteRouter } from "@/lib/router-config";
import { withRateLimit } from "@/lib/rate-limit";
import { validateInput, routerUpdateSchema } from "@/lib/validations";

const checkReadonlyRateLimit = withRateLimit("readonly");
const checkApiRateLimit = withRateLimit("api");
const checkSensitiveRateLimit = withRateLimit("sensitive");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rateLimit = checkReadonlyRateLimit(request);
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
    const { id } = await params;
    const router = await getRouter(id);
    if (!router) {
      return NextResponse.json(
        { success: false, error: "Router not found" },
        { status: 404, headers: rateLimit.headers },
      );
    }
    // Remove password from response
    const sanitizedRouter = { ...router, password: undefined };
    return NextResponse.json(
      { success: true, data: sanitizedRouter },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Failed to get router:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get router" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rateLimit = checkApiRateLimit(request);
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
    const { id } = await params;
    const body = await request.json();

    // Parse host:port if provided in host field
    if (body.host && body.host.includes(":")) {
      const parts = body.host.split(":");
      body.host = parts[0];
      body.port = parseInt(parts[1]) || body.port || 8728;
    }

    const validation = validateInput(routerUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const router = await updateRouter(id, validation.data);
    if (!router) {
      return NextResponse.json(
        { success: false, error: "Router not found" },
        { status: 404, headers: rateLimit.headers },
      );
    }
    // Remove password from response
    const sanitizedRouter = { ...router, password: undefined };
    return NextResponse.json(
      { success: true, data: sanitizedRouter },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Failed to update router:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update router" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rateLimit = checkSensitiveRateLimit(request);
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
    const { id } = await params;
    const deleted = await deleteRouter(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Router not found" },
        { status: 404, headers: rateLimit.headers },
      );
    }
    return NextResponse.json({ success: true }, { headers: rateLimit.headers });
  } catch (error) {
    console.error("Failed to delete router:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete router" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
