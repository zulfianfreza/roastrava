import { getOauthToken } from "@/services/strava.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const code = searchParams.get("code");

    // Validasi parameter code
    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    const tokenResponse = await getOauthToken({
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!,
      client_secret: process.env.STRAVA_CLIENT_SECRET!,
      code: code,
      grant_type: "authorization_code",
    });

    if (!tokenResponse || !tokenResponse.access_token) {
      throw new Error("Failed to exchange authorization code for access token");
    }

    const baseUrl = request.nextUrl.origin;
    const response = NextResponse.redirect(new URL("/dashboard", baseUrl));

    const isProduction = process.env.NODE_ENV === "production";

    // Set access token
    response.cookies.set("strava_access_token", tokenResponse.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: tokenResponse.expires_in || 21600, // default 6 jam jika tidak ada expires_in
      path: "/",
    });

    // Set refresh token jika ada
    if (tokenResponse.refresh_token) {
      response.cookies.set(
        "strava_refresh_token",
        tokenResponse.refresh_token,
        {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30, // 30 hari untuk refresh token
          path: "/",
        }
      );
    }

    response.cookies.set(
      "strava_athlete_id",
      tokenResponse.athlete.id.toString(),
      {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      }
    );

    // Redirect dengan absolute URL
    return response;
  } catch (error) {
    console.error("Strava OAuth error:", error);

    // Redirect ke error page atau login page
    const baseUrl = request.nextUrl.origin;
    return NextResponse.redirect(new URL("/login?error=oauth_failed", baseUrl));
  }
}
