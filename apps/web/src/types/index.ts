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

export const servers = [
    { id: 1, name: 'Gaming Hub', icon: '🎮', hasNotification: true, color: 'bg-blue-500' },
    { id: 2, name: 'Dev Community', icon: '💻', hasNotification: false, color: 'bg-green-500' },
    { id: 3, name: 'Art Studio', icon: '🎨', hasNotification: true, color: 'bg-purple-500' },
    { id: 4, name: 'Music Lounge', icon: '🎵', hasNotification: false, color: 'bg-pink-500' },
    { id: 5, name: 'Study Group', icon: '📚', hasNotification: true, color: 'bg-yellow-500' },
];