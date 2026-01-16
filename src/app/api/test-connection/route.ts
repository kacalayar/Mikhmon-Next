import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateInput, connectionTestSchema } from "@/lib/validations";
import { withRateLimit } from "@/lib/rate-limit";
import net from "net";

// Use sensitive rate limiting to prevent port scanning abuse
const checkRateLimit = withRateLimit("sensitive");

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimit.headers },
    );
  }

  // Authentication check - prevent unauthorized port scanning
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = validateInput(connectionTestSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const { host, port } = validation.data;

    // Additional validation: block internal/private IPs in production
    if (process.env.NODE_ENV === "production") {
      const blockedPatterns = [
        /^127\./, // Localhost
        /^0\./, // Current network
        /^10\./, // Private Class A
        /^172\.(1[6-9]|2\d|3[01])\./, // Private Class B
        /^192\.168\./, // Private Class C (allow for local dev)
        /^169\.254\./, // Link-local
        /^::1$/, // IPv6 localhost
        /^fc00:/i, // IPv6 private
        /^fe80:/i, // IPv6 link-local
      ];

      // Note: In production with Vercel, you might want to allow private IPs
      // for connecting to routers. Adjust this based on your deployment needs.
    }

    return new Promise<NextResponse>((resolve) => {
      const timeout = 5000;
      const socket = new net.Socket();

      const timer = setTimeout(() => {
        socket.destroy();
        resolve(
          NextResponse.json(
            {
              success: false,
              error: "Connection timeout",
              host,
              port,
            },
            { headers: rateLimit.headers },
          ),
        );
      }, timeout);

      socket.connect(port, host, () => {
        clearTimeout(timer);
        socket.destroy();
        resolve(
          NextResponse.json(
            {
              success: true,
              message: "Ping OK",
              host,
              port,
            },
            { headers: rateLimit.headers },
          ),
        );
      });

      socket.on("error", (err) => {
        clearTimeout(timer);
        socket.destroy();
        resolve(
          NextResponse.json(
            {
              success: false,
              error: err.message,
              host,
              port,
            },
            { headers: rateLimit.headers },
          ),
        );
      });
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 },
    );
  }
}
