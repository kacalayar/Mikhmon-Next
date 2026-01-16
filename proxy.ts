import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/",
  "/sessions",
  "/settings",
  "/hotspot",
  "/ppp",
  "/dhcp",
  "/reports",
  "/voucher",
  "/router",
  "/traffic",
  "/log",
  "/system",
  "/quick-print",
  "/about",
];

const protectedApiRoutes = [
  "/api/routers",
  "/api/hotspot",
  "/api/ppp",
  "/api/dashboard",
  "/api/traffic",
  "/api/interfaces",
  "/api/logs",
  "/api/system",
  "/api/quick-print",
  "/api/test-connection",
];

const publicRoutes = ["/login"];
const publicApiRoutes = ["/api/auth"];

// Security headers for all responses
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if it's an API route
  const isApiRoute = path.startsWith("/api/");

  // Check protected routes
  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(route + "/"),
  );
  const isProtectedApiRoute = protectedApiRoutes.some(
    (route) => path === route || path.startsWith(route + "/"),
  );

  // Check public routes
  const isPublicRoute = publicRoutes.includes(path);
  const isPublicApiRoute = publicApiRoutes.some(
    (route) => path === route || path.startsWith(route + "/"),
  );

  // Get session token from cookies
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  // Handle API routes
  if (isApiRoute) {
    // Allow public API routes
    if (isPublicApiRoute) {
      const response = NextResponse.next();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Block protected API routes if not logged in
    if (isProtectedApiRoute && !isLoggedIn) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        {
          status: 401,
          headers: securityHeaders,
        },
      );
    }

    // Add security headers to API responses
    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Handle page routes
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (isPublicRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/sessions", request.nextUrl));
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.ico$|.*\\.svg$).*)",
  ],
};
