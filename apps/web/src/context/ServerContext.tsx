import React, { createContext, useContext, useReducer, useCallback } from "react";
import api from "../lib/api";
import { type Roles } from "../types";

type Permission =
  | "ADMIN"
  | "MODERATOR"
  | "MANAGE_MEMBERS"
  | "MANAGE_CHANNELS"
  | "SEND_MESSAGES"
  | "CONNECT_VOICE";

interface ServerState {
  roles: Roles[];
  userPermissions: Permission[];
  isOpenInvite: boolean;
}

type ServerAction =
  | { type: "FETCH_ROLES"; payload: Roles[] }
  | { type: "ADD_ROLE"; payload: Roles }
  | { type: "UPDATE_ROLE"; payload: Roles }
  | { type: "DELETE_ROLE"; payload: string }
  | { type: "GET_USER_PERMISSIONS"; payload: Permission[] }
  | { type: "OPEN_INVITE"; payload: boolean };

interface ServerContextType extends ServerState {
  fetchRoles: (serverid: string) => Promise<void>;
  getUserPermissions: (serverid: string, userid: string) => Promise<void>;
  openInviteBox: (param: boolean) => void;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

const ServerReducer = (state: ServerState, action: ServerAction): ServerState => {
  switch (action.type) {
    case "FETCH_ROLES":
      return { ...state, roles: [...action.payload] };

    case "ADD_ROLE":
      return { ...state, roles: [...state.roles, action.payload] };

    case "UPDATE_ROLE":
      return {
        ...state,
        roles: state.roles.map((role) =>
          role._id === action.payload._id ? action.payload : role
        ),
      };

    case "DELETE_ROLE":
      return { ...state, roles: state.roles.filter((r) => r._id !== action.payload) };

    case "GET_USER_PERMISSIONS":
      return { ...state, userPermissions: [...action.payload] };

    case "OPEN_INVITE":
      return { ...state, isOpenInvite: action.payload };

    default:
      return state;
  }
};

const initialState: ServerState = {
  roles: [],
  userPermissions: [],
  isOpenInvite: false,
};

export function ServerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(ServerReducer, initialState);

  const fetchRoles = useCallback(async (serverid: string) => {
    try {
      console.log("Fetching roles for server:", serverid);
      const res = await api.get(`/api/server/roles/${serverid}`);
      console.log("Roles fetched:", res.data);
      dispatch({ type: "FETCH_ROLES", payload: res.data });
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  }, []);

  const getUserPermissions = useCallback(async (serverid: string, userid: string) => {
    try {
      console.log("Fetching user permissions for server:", serverid);
      const res = await api.get(`/api/server/getUserPermissions/${serverid}/${userid}`);
      const permissions = res.data.permissions;

      // Extract all true permissions into an array
      const activePermissions = Object.entries(permissions)
        .filter(([_, value]) => value === true)
        .map(([key]) => key as Permission);

      console.log("User permissions fetched:", activePermissions);
      dispatch({ type: "GET_USER_PERMISSIONS", payload: activePermissions });
    } catch (error) {
      console.error("Error fetching user permissions:", error);
    }
  }, []);

  const openInviteBox = useCallback((param: boolean) => {
    try {
      dispatch({ type: "OPEN_INVITE", payload: param });
    } catch (error) {
      console.error("Error fetching user permissions:", error);
    }
  }, [])

  return (
    <ServerContext.Provider value={{ ...state, fetchRoles, getUserPermissions, openInviteBox }}>
      {children}
    </ServerContext.Provider>
  );
}

export function useServer(): ServerContextType {
  const context = useContext(ServerContext);
  if (!context) {
    throw new Error("useServer must be used within a ServerProvider");
  }
  return context;
}
