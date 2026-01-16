import { NextRequest, NextResponse } from "next/server";
import { createRouterOSClient } from "@/lib/routeros";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const idhr = searchParams.get("idhr");
    const idbl = searchParams.get("idbl");

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

    let filter = ["?comment=mikhmon"];
    if (idhr) {
      filter = [`?source=${idhr}`];
    } else if (idbl) {
      filter = [`?owner=${idbl}`];
    }
    const scripts = await client.write("/system/script/print", filter);
    await client.disconnect();

    const sales = scripts.map((script: any) => {
      // Data format: Date-|-Time-|-Username-|-Price-|-...-|-...-|-...-|-Profile-|-Comment
      const name = script.name || "";
      const parts = name.split("-|-");

      return {
        id: script[".id"],
        name: script.name,
        date: parts[0] || "-",
        time: parts[1] || "-",
        username: parts[2] || "-",
        price: parts[3] || "0",
        profile: parts[7] || "-",
        comment: parts[8] || "-",
        source: script.source || "",
        owner: script.owner || "",
      };
    });

    return NextResponse.json({ success: true, data: sales });
  } catch (error) {
    console.error("Report selling API error:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function DELETE(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const idhr = searchParams.get("idhr");
    const idbl = searchParams.get("idbl");

    if (!idhr && !idbl) {
      return NextResponse.json(
        { success: false, error: "idhr or idbl is required" },
        { status: 400 }
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
        { status: 503 }
      );
    }

    const filter = idhr ? [`?source=${idhr}`] : [`?owner=${idbl}`];
    const scripts = await client.write("/system/script/print", filter);

    for (const script of scripts) {
      await client.write("/system/script/remove", [`=.id=${script[".id"]}`]);
    }

    await client.disconnect();

    return NextResponse.json({
      success: true,
      message: "Records deleted",
    });
  } catch (error) {
    console.error("Delete report error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete records" },
      { status: 500 }
    );
  }
}
