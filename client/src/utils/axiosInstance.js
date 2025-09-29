import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import axios from "axios";

export function useApi() {
  const { getToken } = useKindeAuth();

  const api = axios.create({
    baseURL: "http://localhost:3000",
  });

  // Attach token before every request
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
}
