import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role as string | undefined;

  const publicRoutes = ["/", "/login", "/register", "/api/auth"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isAdminRoute = pathname.startsWith("/admin");

  const isProtectedRoute =
    pathname.startsWith("/booking") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/bookings") ||
    pathname.startsWith("/profile");

  if (isPublicRoute) {
    if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/fields", req.url));
    }
    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    return NextResponse.next();
  }

  if (isProtectedRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|images).*)",
  ],
};
