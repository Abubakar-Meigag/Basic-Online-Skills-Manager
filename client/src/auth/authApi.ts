import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://bosm-backend.trainees.hosting.cyf.academy";

// Create an Axios Instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add Request Interceptor to automatically attach token
// This adds the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sessionToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// This Handles security errors from the server
api.interceptors.response.use(
  (response) => response, // If the request is successful, just let it pass
  (error) => {
    // If the server sends a 403 (Wrong Role) or 401 (Not Logged in)
    if (error.response && error.response.data.redirectRoute) {
      // If the session is invalid, wipe the local data
      if (error.response.status === 401) {
        localStorage.clear();
      }

      // We use window.location.href because this file is outside of React components
      window.location.href = error.response.data.redirectRoute;
    }

    return Promise.reject(error);
  },
);

export interface RequestMagicLinkResponse {
  message: string;
}

export interface VerifyMagicLinkResponse {
  message: string;
  token?: string;
  user: {
    id: string;
    email: string;
    orgType: string;
  };
  redirectRoute: string;
}

// Send request to generate magic link

export async function requestMagicLink(
  email: string,
): Promise<RequestMagicLinkResponse> {
  const response = await api.post<RequestMagicLinkResponse>(
    `/auth/magic-link`,
    { email },
  );
  return response.data;
}

// Send token to backend for verification

export async function verifyMagicLink(
  token: string,
): Promise<VerifyMagicLinkResponse> {
  const response = await api.post<VerifyMagicLinkResponse>(
    `/auth/verify`,
    { token },
  );
  return response.data;
}
