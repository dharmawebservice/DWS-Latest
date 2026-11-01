import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { createToken, authConfigured } from "../../../../lib/auth";
import { rateLimit, clientIp } from "../../../../lib/ratelimit";

const sha = (s) => createHash("sha256").update(String(s)).digest();

export async function POST(req) {
  try {
    if (!rateLimit(`login:${clientIp(req)}`, { limit: 5, windowMs: 10 * 60 * 1000 })) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in a few minutes." },
        { status: 429 }
      );
    }

    if (!authConfigured) {
      console.error("Login blocked: JWT_SECRET is missing or too short (min 16 characters).");
      return NextResponse.json({ error: "Server is not configured: set JWT_SECRET in the environment." }, { status: 500 });
    }

    const { password } = await req.json();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    // Constant-time comparison of equal-length sha256 digests
    const ok =
      typeof password === "string" &&
      !!ADMIN_PASSWORD &&
      timingSafeEqual(sha(password), sha(ADMIN_PASSWORD));

    if (!ok) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await createToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set("dws_admin", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 12,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
