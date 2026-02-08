// export { auth as middleware } from "@/auth";

import { auth } from "@/auth";

export default auth((req) => {
  const isAdmin = req.auth?.user?.role === "ADMIN";

  if (!isAdmin && req.nextUrl.pathname.startsWith("/admin")) {
    return Response.redirect(new URL("/403", req.nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
