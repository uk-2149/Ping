import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from "react";
import type { AuthState, User } from "../types";
import api, { addAuthEventListener, removeAuthEventListener } from "../lib/api";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_FAILURE"; payload: string }
//   | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false, error: null };
    case "AUTH_FAILURE":
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: action.payload };
    // case "LOGOUT":
    //   return { ...state, user: null, isAuthenticated: false, isLoading: false, error: null };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const transformUser = useCallback((userData: any): User => {
    return {
      id: userData._id || userData.id,
      username: userData.username,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      status: userData.status,
      createdAt: userData.createdAt ? new Date(userData.createdAt) : undefined,
      isVerified: userData.isVerified,
      servers: userData.servers,
      messages: userData.messages,
    };
  }, []);

  const checkAuthStatus = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await api.get(`/api/auth/check_auth`);
      const user = transformUser(res.data.user);
      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (error: any) {
      dispatch({ type: "SET_LOADING", payload: false });
      console.log("Auth check failed:", error?.response?.data?.message);
    }
  }, [transformUser]);

  const handleTokenRefresh = useCallback(() => {
    console.log("Token was refreshed, updating auth state");
    // Optionally refresh user data after token refresh
    // checkAuthStatus();
  }, []);

//   const handleLogout = useCallback(async () => {
//     // await api.post(`/api/auth/logout`);
//     console.log("Logout triggered by token refresh failure");
//     dispatch({ type: "LOGOUT" });
//   }, []);

  useEffect(() => {
    // Initial auth check
    checkAuthStatus();

    // Listen for auth events from the API interceptor
    // addAuthEventListener("logout", handleLogout);
    addAuthEventListener("tokenRefreshed", handleTokenRefresh);

    // Cleanup listeners on unmount
    return () => {
    //   removeAuthEventListener("logout", handleLogout);
      removeAuthEventListener("tokenRefreshed", handleTokenRefresh);
    };
  }, [checkAuthStatus, handleTokenRefresh]);

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: "AUTH_START" });
    try {
      const res = await api.post(`/api/auth/signin`, { email, password });
      const user = transformUser(res.data.user);
      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (error: any) {
      dispatch({ type: "AUTH_FAILURE", payload: error?.response?.data?.message });
    }
  }, [transformUser]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    dispatch({ type: "AUTH_START" });
    try {
      const res = await api.post(`/api/auth/signup`, { name, email, password });
      const user = transformUser(res.data.user);
      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (error: any) {
      dispatch({ type: "AUTH_FAILURE", payload: error?.response?.data?.message });
    }
  }, [transformUser]);

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        refreshAuth,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
