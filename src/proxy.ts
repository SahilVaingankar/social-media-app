import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicRoutes = new Set(["/403", "/reset-password"]);
const authRoutes = new Set(["/login", "/signup"]);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const { pathname } = nextUrl;
  const isPublicRoute = publicRoutes.has(pathname);
  const isAuthRoute = authRoutes.has(pathname);

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (!session && !isAuthRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isPublicRoute || isAuthRoute) {
    return NextResponse.next();
  }

  if (session) {
    const isProUser = session.user.role === "PRO";
    if (pathname === "/dashboard/pro" && !isProUser) {
      return NextResponse.redirect(new URL("/403", nextUrl));
    }

    const isAdmin = session.user.role === "ADMIN";

    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/403", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
