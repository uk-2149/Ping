export interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  status: "ONLINE" | "OFFLINE" | "AWAY" | "DO_NOT_DISTURB";
  createdAt?: Date;
  lastSeen: Date;
  isVerified: boolean;
  servers: Server[];
  messages: string[];
  friends: string[];
  dmFriends: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Server {
  id: string;
  name: string;
  icon: string;
  description?: string;
  ownerid: string;
  members: string[];
  roles: string[];
  channels: string[];
  createdAt: Date;
  updatedAt: Date; 
}

export const servers = [
    { id: "GH", name: 'Gaming Hub', icon: '🎮', hasNotification: true, color: 'bg-blue-500' },
    { id: "DV", name: 'Dev Community', icon: '💻', hasNotification: false, color: 'bg-green-500' },
    { id: "AS", name: 'Art Studio', icon: '🎨', hasNotification: true, color: 'bg-purple-500' },
    { id: "ML", name: 'Music Lounge', icon: '🎵', hasNotification: false, color: 'bg-pink-500' },
    { id: "SG", name: 'Study Group', icon: '📚', hasNotification: true, color: 'bg-yellow-500' },
];