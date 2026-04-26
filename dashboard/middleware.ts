import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic =
    pathname === "/" ||
    pathname === "/pricing" ||
    pathname === "/login" ||
    pathname === "/register";

  if (isPublic) {
    return NextResponse.next();
  }

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname === "/api/licenses/generate" ||
    pathname === "/api/payments/create-invoice";

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/licenses/generate", "/api/payments/create-invoice"],
};
