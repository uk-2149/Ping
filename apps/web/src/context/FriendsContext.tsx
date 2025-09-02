import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import api from "../lib/api";

export interface User {
  _id: string;
  username: string;
  avatar?: string;
}

interface FriendsContextType {
  friends: any[];
  receivedRequests: string[];
  acceptFriendRequest: (requestid: string) => Promise<void>;
  rejectFriendRequest: (requestid: string) => Promise<void>;
}

interface FriendsState {
  friends: User[];
  receivedRequests: string[];
}

type FriendsAction =
  | { type: 'ACCEPT_FRIEND_REQUEST'; payload: { requestid: string } }
  | { type: 'REJECT_FRIEND_REQUEST'; payload: string }
  | { type: 'SET_FRIENDS'; payload: User[] }
  | { type: 'SET_RECEIVED_REQUESTS'; payload: string[] };

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

const friendsReducer = (state: FriendsState, action: FriendsAction): FriendsState => {
  switch (action.type) {
    case 'ACCEPT_FRIEND_REQUEST':
      return {
        ...state,
        receivedRequests: state.receivedRequests.filter((id) => id !== action.payload.requestid),
      };
    case 'REJECT_FRIEND_REQUEST':
      return {
        ...state,
        receivedRequests: state.receivedRequests.filter((id) => id !== action.payload),
      };
    case 'SET_FRIENDS':
      return { ...state, friends: action.payload };
    case 'SET_RECEIVED_REQUESTS':
      return { ...state, receivedRequests: action.payload };
    default:
      return state;
  }
};

export const FriendsProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(friendsReducer, { friends: [], receivedRequests: [] });

  const fetchFriendLists = async () => {
      try {
        const [friendsRes, requestsRes] = await Promise.all([
          api.get("/api/users/getFriends"),
          api.get("/api/users/getReceivedRequests"),
        ]);
        dispatch({ type: 'SET_FRIENDS', payload: friendsRes.data });
        dispatch({ type: 'SET_RECEIVED_REQUESTS', payload: requestsRes.data });
      } catch (error) {
        console.error("Error fetching friend data:", error);
      }
    };

  useEffect(() => {
    fetchFriendLists();
  }, []);

  const acceptFriendRequest = useCallback(async (requestid: string) => {
    try {
      await api.post('/api/users/acceptFriendRequest', { requestid });
      dispatch({ type: 'ACCEPT_FRIEND_REQUEST', payload: { requestid } });
      fetchFriendLists();
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  }, []);

  const rejectFriendRequest = useCallback(async (requestid: string) => {
    try {
      await api.post('/api/users/declineFriendRequest', { requestid });
      dispatch({ type: 'REJECT_FRIEND_REQUEST', payload: requestid });
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  }, []);

  return (
    <FriendsContext.Provider
      value={{
        friends: state.friends,
        receivedRequests: state.receivedRequests,
        acceptFriendRequest,
        rejectFriendRequest,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error("useFriends must be used within a FriendsProvider");
  }
  return context;
};