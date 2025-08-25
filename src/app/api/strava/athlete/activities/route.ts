import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("strava_access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data } = await axios.get(
      "https://www.strava.com/api/v3/athlete/activities",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    console.log(data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in athlete API route:", error);

    if (error instanceof AxiosError) {
      return NextResponse.json(
        { error: error.response?.data || error.message },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
