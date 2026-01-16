import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRouter } from "@/lib/router-config";
import { withRateLimit } from "@/lib/rate-limit";
import net from "net";

const checkApiRateLimit = withRateLimit("api");

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rateLimit = checkApiRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers: rateLimit.headers },
    );
  }

  const { id } = await params;

  const router = await getRouter(id);
  if (!router) {
    return NextResponse.json(
      { success: false, error: "Router not found" },
      { status: 404, headers: rateLimit.headers },
    );
  }

  const host = router.host.split(":")[0];
  const port = parseInt(router.host.split(":")[1]) || router.port || 8728;

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
}
