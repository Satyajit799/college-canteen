import axios from "axios";

import { API_URL } from "../../api/config";

const ADMIN_API_URL = `${API_URL}/api/admin`;

interface AdminLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    admin: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  };
}

export async function adminLogin(
  email: string,
  password: string,
) {
  const response = await axios.post<AdminLoginResponse>(
    `${ADMIN_API_URL}/auth/login`,
    {
      email,
      password,
    },
  );

  return response.data;
}