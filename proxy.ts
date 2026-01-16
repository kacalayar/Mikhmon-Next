import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
 
const protectedRoutes = ["/", "/sessions", "/settings", "/hotspot", "/ppp", "/dhcp", "/reports", "/voucher"];
const publicRoutes = ["/login"];
 
export async function proxy(req: NextRequest) {
   const path = req.nextUrl.pathname;
 
   const isProtectedRoute = protectedRoutes.some(
     (route) => path === route || path.startsWith(route + "/")
   );
   const isPublicRoute = publicRoutes.includes(path);
 
   const cookieStore = await cookies();
   const sessionToken =
     cookieStore.get("authjs.session-token")?.value ||
     cookieStore.get("__Secure-authjs.session-token")?.value;
 
   const isLoggedIn = !!sessionToken;
 
   if (isProtectedRoute && !isLoggedIn) {
     return NextResponse.redirect(new URL("/login", req.nextUrl));
   }
 
   if (isPublicRoute && isLoggedIn) {
     return NextResponse.redirect(new URL("/sessions", req.nextUrl));
   }
 
   return NextResponse.next();
 }
 
 export const config = {
   matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
 };
