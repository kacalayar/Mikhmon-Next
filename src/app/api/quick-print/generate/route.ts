import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/session";
import { withRateLimit } from "@/lib/rate-limit";

const checkApiRateLimit = withRateLimit("api");

// Generate random string based on character set
function generateRandomString(length: number, charset: string): string {
  let result = "";
  const characters = charset.includes("a")
    ? "abcdefghijklmnopqrstuvwxyz"
    : charset.includes("A")
      ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      : charset.includes("1")
        ? "0123456789"
        : "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Parse data limit string to bytes
function parseDataLimit(dataLimit: string): string | undefined {
  if (!dataLimit || dataLimit === "-") return undefined;

  // If already in bytes format
  if (/^\d+$/.test(dataLimit)) return dataLimit;

  // Parse formatted values like "1 GB", "500 MB", etc.
  const match = dataLimit.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)$/i);
  if (!match) return undefined;

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const multipliers: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
  };

  return String(Math.floor(value * (multipliers[unit] || 1)));
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
    const {
      packageId,
      packageName,
      server,
      profile,
      timeLimit,
      dataLimit,
      validity,
      price,
    } = body;

    if (!profile) {
      await client.disconnect();
      return NextResponse.json(
        { success: false, error: "Profile is required" },
        { status: 400, headers: rateLimit.headers },
      );
    }

    // Generate username and password
    const username = generateRandomString(6, "1"); // 6 digit numbers
    const password = generateRandomString(6, "1"); // 6 digit numbers

    // Build user object
    const userParams: string[] = [
      `=name=${username}`,
      `=password=${password}`,
      `=profile=${profile}`,
    ];

    // Add server if not "all"
    if (server && server !== "all") {
      userParams.push(`=server=${server}`);
    }

    // Add time limit if specified
    if (timeLimit && timeLimit !== "-") {
      userParams.push(`=limit-uptime=${timeLimit}`);
    }

    // Add data limit if specified
    const dataLimitBytes = parseDataLimit(dataLimit);
    if (dataLimitBytes) {
      userParams.push(`=limit-bytes-total=${dataLimitBytes}`);
    }

    // Add comment with package info and price
    const comment = `${packageName || "Quick Print"}|${validity || ""}|${price || "0"}`;
    userParams.push(`=comment=${comment}`);

    // Create the user in MikroTik
    await client.write("/ip/hotspot/user/add", userParams);
    await client.disconnect();

    return NextResponse.json(
      {
        success: true,
        message: "Voucher generated successfully",
        user: {
          username,
          password,
          profile,
          server: server || "all",
          timeLimit: timeLimit || "-",
          dataLimit: dataLimit || "-",
          validity: validity || "-",
          price: price || "0",
        },
      },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Quick print generate error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate voucher" },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
