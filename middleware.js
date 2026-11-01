import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;

  // Allow these routes without authentication
  if (
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/session"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("dws_admin")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "dev-only-secret-not-for-production-use-0000" : "");
  if (secret.length < 16) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));

    return NextResponse.next();
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    "/api/admin/transactions/:path*",
    "/api/admin/messages/:path*",
    "/api/admin/brands/:path*",
    "/api/admin/packages/:path*",
    "/api/admin/testimonials/:path*",
    "/api/admin/onboarding/:path*",
    "/api/admin/docs/:path*",
    "/api/admin/visits/:path*",
    "/api/admin/logout/:path*",
  ],
};