export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export interface AuthResponse {
  success?: boolean;
  token?: string;
  accessToken?: string;
  user?: AdminUser;
  message?: string;
}
