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
  _id: string;
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

interface Member {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface Roles {
  _id: string;
  name: string;
  permissions: Record<string, any>;
  serverid: string;
  members: Member[];
} 