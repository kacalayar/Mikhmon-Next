import { NextRequest, NextResponse } from "next/server";
import net from "net";

export async function POST(request: NextRequest) {
  try {
    const { host, port = 8728 } = await request.json();

    if (!host) {
      return NextResponse.json(
        { success: false, error: "Host is required" },
        { status: 400 },
      );
    }

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
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 },
    );
  }
}
