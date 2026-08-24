export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  fullName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthSession {
  token: string;
  user: User;
}
