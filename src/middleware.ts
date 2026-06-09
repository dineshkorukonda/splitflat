import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

function hasSecret(): boolean {
  return Boolean(process.env.APP_SECRET && process.env.APP_SECRET.length >= 16);
}

export async function middleware(request: NextRequest) {
  if (!hasSecret()) return NextResponse.next();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/login")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token && (await verifySessionToken(token))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login"],
};
