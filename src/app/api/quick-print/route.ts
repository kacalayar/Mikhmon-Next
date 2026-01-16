import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/session";
import { withRateLimit } from "@/lib/rate-limit";
import {
  validateInput,
  idParamSchema,
  quickPrintSchema,
} from "@/lib/validations";

const checkReadonlyRateLimit = withRateLimit("readonly");
const checkApiRateLimit = withRateLimit("api");

function formatBytes(bytes: string | number): string {
  const numBytes = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (!numBytes || numBytes === 0) return "-";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  return Math.round((numBytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

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
    const scripts = await client.write("/system/script/print", [
      "?comment=QuickPrintMikhmon",
    ]);
    await client.disconnect();

    // Parse quick print packages from script source
    const packages = scripts.map((script) => {
      const s = script as Record<string, string>;
      const source = s.source || "";
      const parts = source.split("#");

      return {
        id: s[".id"],
        name: s.name,
        package: parts[1] || "-",
        server: parts[2] || "all",
        profile: parts[7] || "-",
        timeLimit: parts[8] || "-",
        dataLimit: formatBytes(parts[9] || "0"),
        validity: parts[11] || "-",
        price: parts[12]?.split("_")[0] || "0",
        sellingPrice: parts[12]?.split("_")[1] || "0",
      };
    });

    return NextResponse.json(
      { success: true, data: packages },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Quick print API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

export async function POST(request: NextRequest) {
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
    const validation = validateInput(quickPrintSchema, body);
    if (!validation.success) {
      await client.disconnect();
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const {
      name,
      server,
      userMode,
      nameLength,
      prefix,
      character,
      profile,
      timeLimit,
      dataLimit,
      dataUnit,
      comment,
    } = validation.data;

    const scriptName = `Quick_Print_${name.replace(/\s+/g, "-")}`;
    const calculatedDataLimit =
      dataLimit && dataUnit ? parseInt(dataLimit) * parseInt(dataUnit) : "";

    // Build script source similar to PHP version
    const scriptSource = `#${name}#${server}#${userMode}#${nameLength}#${prefix}#${character}#${profile}#${timeLimit || ""}#${calculatedDataLimit}#${comment || ""}#`;

    await client.write("/system/script/add", [
      `=name=${scriptName}`,
      `=source=${scriptSource}`,
      "=comment=QuickPrintMikhmon",
    ]);

    await client.disconnect();

    return NextResponse.json(
      { success: true, message: "Quick Print package created" },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Create package error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create package" },
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

    await client.write("/system/script/remove", [`=.id=${validation.data}`]);
    await client.disconnect();

    return NextResponse.json(
      { success: true, message: "Package deleted" },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Delete package error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete package" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
