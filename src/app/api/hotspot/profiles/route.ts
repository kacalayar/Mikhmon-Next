import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/session";
import { validateInput, hotspotProfileSchema } from "@/lib/validations";
import { withRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

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

  const { client, error } = await getAuthenticatedClient();

  if (!client) {
    return NextResponse.json(
      { success: false, error: error || "Not connected to MikroTik" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
    const profiles = await client.getHotspotUserProfiles();
    await client.disconnect();

    return NextResponse.json(
      { success: true, data: profiles },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Hotspot profiles GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get hotspot profiles" },
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
    const validation = validateInput(hotspotProfileSchema, body);
    if (!validation.success) {
      await client.disconnect();
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const result = await client.addHotspotUserProfile(validation.data);
    await client.disconnect();

    return NextResponse.json(
      {
        success: true,
        data: { id: result[0]?.ret },
        message: "Profile created successfully",
      },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Hotspot profiles POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create profile" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

const profileUpdateSchema = z
  .object({
    id: z.string().min(1, "Profile ID is required"),
  })
  .merge(hotspotProfileSchema.partial());

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
    const validation = validateInput(profileUpdateSchema, body);
    if (!validation.success) {
      await client.disconnect();
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const { id, ...profileData } = validation.data;
    await client.updateHotspotUserProfile(id, profileData);
    await client.disconnect();

    return NextResponse.json(
      { success: true, message: "Profile updated successfully" },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Hotspot profiles PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Rate limiting - use sensitive for delete
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
        { success: false, error: "Valid Profile ID is required" },
        { status: 400, headers: rateLimit.headers },
      );
    }

    await client.removeHotspotUserProfile(id);
    await client.disconnect();

    return NextResponse.json(
      { success: true, message: "Profile deleted successfully" },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Hotspot profiles DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete profile" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
