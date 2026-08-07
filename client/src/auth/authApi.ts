import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

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
  const response = await axios.post<RequestMagicLinkResponse>(
    `${API_BASE_URL}/auth/magic-link`,
    { email },
  );
  return response.data;
}

// Send token to backend for verification

export async function verifyMagicLink(
  token: string,
): Promise<VerifyMagicLinkResponse> {
  const response = await axios.post<VerifyMagicLinkResponse>(
    `${API_BASE_URL}/auth/verify`,
    { token },
  );
  return response.data;
}
