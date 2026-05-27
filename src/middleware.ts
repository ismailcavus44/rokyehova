import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales, type Locale } from "@/i18n/config";

function getLocaleFromPath(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  if (locales.includes(segment as Locale)) {
    return segment as Locale;
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const pathnameLocale = getLocaleFromPath(pathname);
  if (pathnameLocale) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
