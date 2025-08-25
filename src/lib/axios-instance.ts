import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
