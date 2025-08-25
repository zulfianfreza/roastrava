import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const stravaInstance = axios.create({
  baseURL: "https://www.strava.com",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

stravaInstance.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

stravaInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default stravaInstance;
