import { NextRequest, NextResponse } from "next/server";
import { getRouter } from "@/lib/router-config";
import net from "net";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const router = await getRouter(id);
  if (!router) {
    return NextResponse.json(
      { success: false, error: "Router not found" },
      { status: 404 },
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
        NextResponse.json({
          success: false,
          error: "Connection timeout",
          host,
          port,
        }),
      );
    }, timeout);

    socket.connect(port, host, () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(
        NextResponse.json({
          success: true,
          message: "Ping OK",
          host,
          port,
        }),
      );
    });

    socket.on("error", (err) => {
      clearTimeout(timer);
      socket.destroy();
      resolve(
        NextResponse.json({
          success: false,
          error: err.message,
          host,
          port,
        }),
      );
    });
  });
}
