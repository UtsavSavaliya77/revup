import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/feed",
  "/profile",
  "/garage",
  "/upload",
];

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  if (path === "/") {
    return NextResponse.redirect(new URL(token ? "/feed" : "/login", req.url));
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if ((path === "/login" || path === "/signup") && token) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/feed/:path*",
    "/profile/:path*",
    "/garage/:path*",
    "/upload/:path*",
    "/login",
    "/signup",
  ],
};