import { Language } from "./common.type";

export type StravaTokenResponse = {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
};

export type StravaAthlete = {
  id: number;
  username: string;
  resource_state: number;
  firstname: string;
  lastname: string;
  bio: null;
  city: string;
  state: string;
  country: null;
  sex: string;
  premium: boolean;
  summit: boolean;
  created_at: Date;
  updated_at: Date;
  badge_type_id: number;
  ftp: number | null;
  weight: number;
  profile_medium: string;
  profile: string;
  friend: null;
  follower: null;
};

export type StravaActivity = {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
  average_cadence: number;
  average_watts: number;
  weighted_average_watts: number;
  kilojoules: number;
  average_heartrate: number;
  max_heartrate: number;
  suffer_score: number;
};

export interface StravaStats {
  recent_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  ytd_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  all_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
}

export interface RoastRequest {
  type: string;
  intensity: number;
  language: Language;
  athlete: {
    username: string;
    firstname: string;
    lastname: string;
    city: string;
    state: string;
    country: string;
    follower_count: number;
    friend_count: number;
    weight: number;
    ftp: number | null;
  };
  activities: Array<{
    name: string;
    distance: number;
    moving_time: number;
    total_elevation_gain: number;
    type: string;
    average_speed: number;
    max_speed: number;
    average_heartrate: number;
    max_heartrate: number;
    suffer_score: number;
  }>;
  stats: {
    recent_run_totals: {
      count: number;
      distance: number;
      moving_time: number;
      elevation_gain: number;
    };
    ytd_run_totals: {
      count: number;
      distance: number;
      moving_time: number;
      elevation_gain: number;
    };
  };
}
