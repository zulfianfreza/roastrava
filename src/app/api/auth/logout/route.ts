import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "Logout successfully",
    success: true,
  });

  response.cookies.delete("strava_access_token");
  response.cookies.delete("strava_refresh_token");
  response.cookies.delete("strava_athlete_id");

  return response;
}
