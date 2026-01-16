import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/session";
import { withRateLimit } from "@/lib/rate-limit";
import {
  validateInput,
  idParamSchema,
  ipBindingActionSchema,
} from "@/lib/validations";

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
    const bindings = await client.write("/ip/hotspot/ip-binding/print");
    await client.disconnect();

    return NextResponse.json(
      { success: true, data: bindings },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("IP Binding API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const body = await request.json();
    const validation = validateInput(ipBindingActionSchema, body);
    if (!validation.success) {
      await client.disconnect();
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const { id, action } = validation.data;
    const disabled = action === "disable" ? "yes" : "no";
    await client.write("/ip/hotspot/ip-binding/set", [
      `=.id=${id}`,
      `=disabled=${disabled}`,
    ]);

    await client.disconnect();

    return NextResponse.json(
      { success: true, message: `Binding ${action}d successfully` },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Toggle binding error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update binding" },
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

    await client.write("/ip/hotspot/ip-binding/remove", [
      `=.id=${validation.data}`,
    ]);
    await client.disconnect();

    return NextResponse.json(
      { success: true, message: "Binding deleted" },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Delete binding error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete binding" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
