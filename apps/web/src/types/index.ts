export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  status: "ONLINE" | "OFFLINE" | "AWAY" | "DO_NOT_DISTURB";
  createdAt?: Date;
  isVerified: boolean;
  servers: string[];
  messages: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}