import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

function hasSecret(): boolean {
  return Boolean(process.env.APP_SECRET && process.env.APP_SECRET.length >= 16);
}

async function hasValidSession(token: string | undefined): Promise<boolean> {
  if (!token || !hasSecret()) return false;
  try {
    return await verifySessionToken(token);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/login")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (await hasValidSession(token)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await hasValidSession(token))) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
