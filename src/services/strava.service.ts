import axiosInstance from "@/lib/axios-instance";
import stravaInstance from "@/lib/strava-instance";
import {
  StravaActivity,
  StravaAthlete,
  StravaStats,
  StravaTokenResponse,
} from "@/types/strava.type";

export const getOauthToken = async (payload: unknown) => {
  const { data } = await stravaInstance.post<StravaTokenResponse>(
    "/oauth/token",
    payload
  );

  return data;
};

export async function getAthlete() {
  const { data } = await axiosInstance.get<StravaAthlete>(
    "/api/strava/athlete"
  );

  return data;
}

export async function getActivities() {
  const { data } = await axiosInstance.get<StravaActivity[]>(
    "/api/strava/athlete/activities"
  );
  return data;
}

export async function getAthleteStats(params?: unknown) {
  const { data } = await axiosInstance.get<StravaStats>(
    "/api/strava/athlete/stats",
    {
      params,
    }
  );
  return data;
}

export async function createRoast(payload: unknown) {
  const { data } = await axiosInstance.post<string>("/api/roast", payload);

  return data;
}
