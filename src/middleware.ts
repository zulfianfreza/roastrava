import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("strava_access_token")?.value;

  // Protected routes yang memerlukan Strava authentication
  const protectedPaths = ["/dashboard", "/roast", "/profile"];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Public-only routes (redirect jika sudah ada token valid)
  const publicOnlyPaths = ["/", "/auth/login"];
  const isPublicOnlyPath = publicOnlyPaths.includes(pathname);

  // ✅ Handle routes yang butuh token
  if (accessToken && (isPublicOnlyPath || isProtectedPath)) {
    try {
      // Validate token dengan Strava API
      const response = await fetch("https://www.strava.com/api/v3/athlete", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        // Token valid
        if (isPublicOnlyPath) {
          // Redirect authenticated user dari public routes ke dashboard
          console.log(
            `Redirecting authenticated user from ${pathname} to /dashboard`
          );
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        // Jika protected route, lanjut
        return NextResponse.next();
      } else {
        // Token invalid/expired, clear cookies
        console.log(
          `Token invalid, clearing cookies and redirecting from ${pathname} to /`
        );
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("strava_access_token");
        response.cookies.delete("strava_refresh_token");
        response.cookies.delete("strava_athlete_id");
        return response;
      }
    } catch (error) {
      // Network error atau API down, clear cookies untuk safety
      console.error("Token validation error:", error);
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("strava_access_token");
      response.cookies.delete("strava_refresh_token");
      response.cookies.delete("strava_athlete_id");
      return response;
    }
  }

  // ✅ No token tapi akses protected route → redirect ke landing
  if (isProtectedPath && !accessToken) {
    console.log(`Redirecting unauthenticated user from ${pathname} to /`);
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ✅ Allow semua routes lainnya (termasuk auth callback)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/login",
    "/dashboard/:path*",
    "/roast/:path*",
    "/profile/:path*",
  ],
};
