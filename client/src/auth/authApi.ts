import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://bosm-backend.trainees.hosting.cyf.academy";

// Create an Axios Instance
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add Request Interceptor to automatically attach token
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
    `${API_BASE_URL}/auth/magic-link`,
    { email },
  );
  return response.data;
}

// Send token to backend for verification

export async function verifyMagicLink(
  token: string,
): Promise<VerifyMagicLinkResponse> {
  const response = await api.post<VerifyMagicLinkResponse>(
    `${API_BASE_URL}/auth/verify`,
    { token },
  );
  return response.data;
}
