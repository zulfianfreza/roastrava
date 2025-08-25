import {
  QueryObserverOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  createRoast,
  getActivities,
  getAthlete,
  getAthleteStats,
} from "../strava.service";
import { ApiServiceErr, MutOpt } from "@/types/common.type";
import {
  StravaActivity,
  StravaAthlete,
  StravaStats,
} from "@/types/strava.type";

export const useGetAthlete = (
  opt?: Partial<QueryObserverOptions<StravaAthlete>>
) => {
  return useQuery<StravaAthlete, ApiServiceErr>({
    queryKey: ["get-athlete"],
    queryFn: () => getAthlete(),
    ...opt,
  });
};

export const useGetActivities = (
  opt?: Partial<QueryObserverOptions<StravaActivity[]>>
) => {
  return useQuery<StravaActivity[], ApiServiceErr>({
    queryKey: ["get-activities"],
    queryFn: () => getActivities(),
    ...opt,
  });
};

export const useGetAthleteStats = (
  params?: unknown,
  opt?: Partial<QueryObserverOptions<StravaStats>>
) => {
  return useQuery<StravaStats, ApiServiceErr>({
    queryKey: ["get-athletes-stats", params],
    queryFn: () => getAthleteStats(params),
    ...opt,
  });
};

export const useCreateRoast = (opt?: MutOpt<string>) => {
  return useMutation<string, ApiServiceErr, unknown>({
    ...opt,
    mutationKey: ["create-roast"],
    mutationFn: async (payload) => {
      const res = await createRoast(payload);

      return res;
    },
  });
};
