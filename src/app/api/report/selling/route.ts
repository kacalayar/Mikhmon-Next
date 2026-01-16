import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/session";
import { withRateLimit } from "@/lib/rate-limit";

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

  const { searchParams } = new URL(request.url);
  const idhr = searchParams.get("idhr");
  const idbl = searchParams.get("idbl");

  const { client, error } = await getAuthenticatedClient();
  if (!client) {
    return NextResponse.json(
      { success: false, error: error || "Unauthorized" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
    let filter = ["?comment=mikhmon"];
    if (idhr) {
      filter = [`?source=${idhr}`];
    } else if (idbl) {
      filter = [`?owner=${idbl}`];
    }
    const scripts = await client.write("/system/script/print", filter);
    await client.disconnect();

    const sales = scripts.map((script) => {
      const s = script as Record<string, string>;
      // Data format: Date-|-Time-|-Username-|-Price-|-...-|-...-|-...-|-Profile-|-Comment
      const name = s.name || "";
      const parts = name.split("-|-");

      return {
        id: s[".id"],
        name: s.name,
        date: parts[0] || "-",
        time: parts[1] || "-",
        username: parts[2] || "-",
        price: parts[3] || "0",
        profile: parts[7] || "-",
        comment: parts[8] || "-",
        source: s.source || "",
        owner: s.owner || "",
      };
    });

    return NextResponse.json(
      { success: true, data: sales },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Report selling API error:", error);
    return NextResponse.json(
      { success: true, data: [] },
      { headers: rateLimit.headers },
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

  const { searchParams } = new URL(request.url);
  const idhr = searchParams.get("idhr");
  const idbl = searchParams.get("idbl");

  if (!idhr && !idbl) {
    return NextResponse.json(
      { success: false, error: "idhr or idbl is required" },
      { status: 400, headers: rateLimit.headers },
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
    const filter = idhr ? [`?source=${idhr}`] : [`?owner=${idbl}`];
    const scripts = await client.write("/system/script/print", filter);

    for (const script of scripts) {
      const scriptRecord = script as Record<string, string>;
      await client.write("/system/script/remove", [
        `=.id=${scriptRecord[".id"]}`,
      ]);
    }

    await client.disconnect();

    return NextResponse.json(
      { success: true, message: "Records deleted" },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Delete report error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete records" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
