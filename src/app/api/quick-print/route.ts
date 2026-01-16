import { NextRequest, NextResponse } from "next/server";
import { createRouterOSClient } from "@/lib/routeros";
import { cookies } from "next/headers";

function formatBytes(bytes: string | number): string {
  const numBytes = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (!numBytes || numBytes === 0) return "-";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  return Math.round((numBytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("mikhmon_session");

  if (!sessionData) {
    return NextResponse.json(
      { success: false, error: "No active session" },
      { status: 401 },
    );
  }

  try {
    const session = JSON.parse(sessionData.value);
    const client = createRouterOSClient();

    const connected = await client.connect({
      host: session.host,
      port: session.port,
      user: session.user,
      password: session.password,
    });

    if (!connected) {
      return NextResponse.json(
        { success: false, error: "Failed to connect to MikroTik" },
        { status: 503 },
      );
    }

    const scripts = await client.write("/system/script/print", [
      "?comment=QuickPrintMikhmon",
    ]);
    await client.disconnect();

    // Parse quick print packages from script source
    const packages = scripts.map((script: any) => {
      const source = script.source || "";
      const parts = source.split("#");

      return {
        id: script[".id"],
        name: script.name,
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

    return NextResponse.json({ success: true, data: packages });
  } catch (error) {
    console.error("Quick print API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("mikhmon_session");

  if (!sessionData) {
    return NextResponse.json(
      { success: false, error: "No active session" },
      { status: 401 }
    );
  }

  try {
    const session = JSON.parse(sessionData.value);
    const body = await request.json();

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
    } = body;

    if (!name || !profile) {
      return NextResponse.json(
        { success: false, error: "Name and Profile are required" },
        { status: 400 }
      );
    }

    const scriptName = `Quick_Print_${name.replace(/\s+/g, "-")}`;
    const calculatedDataLimit =
      dataLimit && dataUnit ? parseInt(dataLimit) * parseInt(dataUnit) : "";

    // Build script source similar to PHP version
    const scriptSource = `#${name}#${server}#${userMode}#${nameLength}#${prefix}#${character}#${profile}#${timeLimit || ""}#${calculatedDataLimit}#${comment || ""}#`;

    const client = createRouterOSClient();

    const connected = await client.connect({
      host: session.host,
      port: session.port,
      user: session.user,
      password: session.password,
    });

    if (!connected) {
      return NextResponse.json(
        { success: false, error: "Failed to connect to MikroTik" },
        { status: 503 }
      );
    }

    await client.write("/system/script/add", [
      `=name=${scriptName}`,
      `=source=${scriptSource}`,
      "=comment=QuickPrintMikhmon",
    ]);

    await client.disconnect();

    return NextResponse.json({
      success: true,
      message: "Quick Print package created",
    });
  } catch (error) {
    console.error("Create package error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create package" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("mikhmon_session");

  if (!sessionData) {
    return NextResponse.json(
      { success: false, error: "No active session" },
      { status: 401 },
    );
  }

  try {
    const session = JSON.parse(sessionData.value);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Package ID is required" },
        { status: 400 },
      );
    }

    const client = createRouterOSClient();

    const connected = await client.connect({
      host: session.host,
      port: session.port,
      user: session.user,
      password: session.password,
    });

    if (!connected) {
      return NextResponse.json(
        { success: false, error: "Failed to connect to MikroTik" },
        { status: 503 },
      );
    }

    await client.write("/system/script/remove", [`=.id=${id}`]);
    await client.disconnect();

    return NextResponse.json({ success: true, message: "Package deleted" });
  } catch (error) {
    console.error("Delete package error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete package" },
      { status: 500 },
    );
  }
}
