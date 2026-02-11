import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicRoutes = new Set(["/403"]);
const authRoutes = new Set(["/login", "/signup"]);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const { pathname } = nextUrl;

  if (publicRoutes.has(pathname)) {
    return NextResponse.next();
  }

  if (authRoutes.has(pathname) && session) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  const isProUser = session.user.role === "PRO";
  if (pathname === "/dashboard/pro" && !isProUser) {
    return NextResponse.redirect(new URL("/403", nextUrl));
  }

  const isAdmin = session.user.role === "ADMIN";

  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/403", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
