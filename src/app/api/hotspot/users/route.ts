import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/session";
import {
  validateInput,
  hotspotUserSchema,
  hotspotUserUpdateSchema,
} from "@/lib/validations";
import { withRateLimit } from "@/lib/rate-limit";

const checkReadRateLimit = withRateLimit("readonly");
const checkWriteRateLimit = withRateLimit("api");

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimit = checkReadRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const { client, error } = await getAuthenticatedClient();

  if (!client) {
    return NextResponse.json(
      { success: false, error: error || "Not connected to MikroTik" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const profile = searchParams.get("profile");
    const comment = searchParams.get("comment");

    // Validate query params
    if (profile && profile.length > 100) {
      await client.disconnect();
      return NextResponse.json(
        { success: false, error: "Invalid profile parameter" },
        { status: 400, headers: rateLimit.headers },
      );
    }
    if (comment && comment.length > 255) {
      await client.disconnect();
      return NextResponse.json(
        { success: false, error: "Invalid comment parameter" },
        { status: 400, headers: rateLimit.headers },
      );
    }

    let filters: string[] | undefined;
    if (profile) {
      filters = [`?profile=${profile}`];
    } else if (comment) {
      filters = [`?comment=${comment}`];
    }

    const users = await client.getHotspotUsers(filters);
    await client.disconnect();

    return NextResponse.json(
      { success: true, data: users },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Hotspot users GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get hotspot users" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimit = checkWriteRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const { client, error } = await getAuthenticatedClient();

  if (!client) {
    return NextResponse.json(
      { success: false, error: error || "Not connected to MikroTik" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = validateInput(hotspotUserSchema, body);
    if (!validation.success) {
      await client.disconnect();
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const { name, password, profile, comment, disabled } = validation.data;

    const result = await client.addHotspotUser({
      name,
      password,
      profile,
      comment,
      disabled: disabled ? "true" : undefined,
    });

    await client.disconnect();

    return NextResponse.json(
      {
        success: true,
        data: { id: result[0]?.ret },
        message: "User created successfully",
      },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Hotspot users POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

export async function PUT(request: NextRequest) {
  // Rate limiting
  const rateLimit = checkWriteRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const { client, error } = await getAuthenticatedClient();

  if (!client) {
    return NextResponse.json(
      { success: false, error: error || "Not connected to MikroTik" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = validateInput(hotspotUserUpdateSchema, body);
    if (!validation.success) {
      await client.disconnect();
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const { id, action, ...userData } = validation.data;

    if (action === "enable") {
      await client.enableHotspotUser(id);
    } else if (action === "disable") {
      await client.disableHotspotUser(id);
    } else if (action === "reset") {
      await client.resetHotspotUser(id);
    } else {
      await client.updateHotspotUser(id, userData);
    }

    await client.disconnect();

    return NextResponse.json(
      {
        success: true,
        message: action
          ? `User ${action}d successfully`
          : "User updated successfully",
      },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Hotspot users PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Rate limiting - use sensitive for delete operations
  const rateLimit = withRateLimit("sensitive")(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const { client, error } = await getAuthenticatedClient();

  if (!client) {
    return NextResponse.json(
      { success: false, error: error || "Not connected to MikroTik" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || id.length > 50) {
      await client.disconnect();
      return NextResponse.json(
        { success: false, error: "Valid User ID is required" },
        { status: 400, headers: rateLimit.headers },
      );
    }

    await client.removeHotspotUser(id);
    await client.disconnect();

    return NextResponse.json(
      { success: true, message: "User deleted successfully" },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Hotspot users DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
