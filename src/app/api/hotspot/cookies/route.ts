import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/session";
import { withRateLimit } from "@/lib/rate-limit";
import { validateInput, idParamSchema } from "@/lib/validations";

const checkReadonlyRateLimit = withRateLimit("readonly");
const checkApiRateLimit = withRateLimit("api");

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
    const hotspotCookies = await client.write("/ip/hotspot/cookie/print");
    await client.disconnect();

    return NextResponse.json(
      { success: true, data: hotspotCookies },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Hotspot cookies API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const rateLimit = checkApiRateLimit(request);
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const validation = validateInput(idParamSchema, id);
    if (!validation.success) {
      await client.disconnect();
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400, headers: rateLimit.headers },
      );
    }

    await client.write("/ip/hotspot/cookie/remove", [
      `=.id=${validation.data}`,
    ]);
    await client.disconnect();

    return NextResponse.json(
      { success: true, message: "Cookie removed" },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Delete cookie error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove cookie" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
