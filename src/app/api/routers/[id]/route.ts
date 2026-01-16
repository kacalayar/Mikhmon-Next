import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRouter, updateRouter, deleteRouter } from "@/lib/router-config";

export async function GET(
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
    return NextResponse.json({ success: true, data: router });
  } catch (error) {
    console.error("Failed to get router:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get router" },
      { status: 500 },
    );
  }
}

export async function PUT(
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
    const body = await request.json();
    
    // Parse host:port if provided in host field
    if (body.host && body.host.includes(":")) {
      const parts = body.host.split(":");
      body.host = parts[0];
      body.port = parseInt(parts[1]) || body.port || 8728;
    }
    
    const router = await updateRouter(id, body);
    if (!router) {
      return NextResponse.json(
        { success: false, error: "Router not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: router });
  } catch (error) {
    console.error("Failed to update router:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update router" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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
    const deleted = await deleteRouter(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Router not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete router:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete router" },
      { status: 500 },
    );
  }
}
