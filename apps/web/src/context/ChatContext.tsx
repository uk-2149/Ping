import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import api from "../lib/api";
import { useAuth } from "./AuthContext";
import { type User, type Server } from "../types";

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timeStamp: Date;
}

interface Chat {
  id: string;
  participants: any[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

interface ChatState {
    activeChat: Chat | null;
    friends: User[];
    dmFriends: any[];
    showFriends: boolean;
    showDmWindow: boolean;
    servers: Server[];
    activeServer: string | null;
    usernameSet: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const messageReducerCases = {
    'SEND_MESSAGE': (state: ChatState, message: Message) => {
        if (!state.activeChat) return state;
        
        // Only update activeChat if the message is for the current active chat
        const isForActiveChat = state.activeChat.id === message.to;
        
        if (isForActiveChat) {
            return {
                ...state,
                activeChat: {
                    ...state.activeChat,
                    messages: [...state.activeChat.messages, message],
                    lastMessage: message,
                }
            };
        }
        
        return state;
    },

    'RECEIVE_MESSAGE': (state: ChatState, message: Message) => {
        // If we have an active chat and the message is from the active chat participant
        if (state.activeChat && state.activeChat.id === message.from) {
            return {
                ...state,
                activeChat: {
                    ...state.activeChat,
                    messages: [...state.activeChat.messages, message],
                    lastMessage: message,
                    unreadCount: 0, // Mark as read since it's the active chat
                }
            };
        }
        
        // If message is not for active chat, we can handle notifications here if needed
        console.log("📨 Message received but not for active chat:", message);
        return state;
    }
};

type ChatAction  = 
    | { type: 'SET_USERNAME_STATUS'; payload: string }
    | {
      type: "UPDATE_USER_STATUS";
      payload: { userid: string; status: "ONLINE" | "OFFLINE" | "AWAY" | "DO_NOT_DISTURB"; lastSeen: Date };
    }
    | { type: 'SET_ACTIVE_CHAT'; payload: Chat | null }
    | { type: 'SET_FRIENDS'; payload: User[] }
    | { type: 'SET_DM_FRIENDS'; payload: User[] }
    | { type: 'SET_SHOW_FRIENDS'; payload: boolean }
    | { type: 'SET_ACTIVE_SERVER'; payload: string | null }
    | { type: 'CREATE_NEW_SERVER'; payload: Server }
    | { type: 'SET_SHOW_DM_WINDOW'; payload: boolean }
    | { type: 'SEND_MESSAGE'; payload: Message }
    | { type: 'RECEIVE_MESSAGE'; payload: Message }
    | { type: 'ADD_FRIEND'; payload: User }
    | { type: 'ADD_DM_FRIEND'; payload: User }
    | { type: 'CREATE_DM_CHAT'; payload: { currentUser: User, friend: User } }
    | { type: 'LOAD_CHAT_MESSAGES'; payload: { messages: Message[] } };

const ChatReducer = (state: ChatState, action: ChatAction): ChatState => {
    switch (action.type) {
        case 'SET_USERNAME_STATUS':
            return { ...state, usernameSet: action.payload };

        case "UPDATE_USER_STATUS": {
            const { userid, status, lastSeen } = action.payload;
            console.log("🔄 Updating user status in reducer:", {
                userid,
                status,
                lastSeen,
            });

            // Update user status in friends
            const updatedFriends = state.friends.map((friend) =>
                friend._id === userid ? { ...friend, status, lastSeen } : friend
            );

            // Update user status in dmFriends
            const updatedDmFriends = state.dmFriends.map((friend) =>
                friend.id === userid ? { ...friend, status, lastSeen } : friend
            );

            // Update active chat if it contains this user
            const updatedActiveChat = state.activeChat
                ? {
                    ...state.activeChat,
                    participants: state.activeChat.participants.map((participant) =>
                    participant.id === userid
                        ? { ...participant, status, lastSeen }
                        : participant
                    ),
                }
                : null;

            return {
                ...state,
                friends: updatedFriends,
                dmFriends: updatedDmFriends,
                activeChat: updatedActiveChat,
            };
        }

        case 'SET_ACTIVE_CHAT':
            return { ...state, activeChat: action.payload };

        case 'SET_FRIENDS':
            return { ...state, friends: action.payload };

        case 'SET_DM_FRIENDS':
            return { ...state, dmFriends: action.payload };

        case 'ADD_DM_FRIEND':
            return { 
                ...state, 
                dmFriends: [...state.dmFriends, action.payload] 
            };

        case 'SET_SHOW_FRIENDS':
            return { ...state, showFriends: action.payload };

        case 'SET_SHOW_DM_WINDOW':
            return { ...state, showDmWindow: action.payload };

        case 'SEND_MESSAGE':
            return messageReducerCases.SEND_MESSAGE(state, action.payload);
            
        case 'RECEIVE_MESSAGE':
            return messageReducerCases.RECEIVE_MESSAGE(state, action.payload);

        case 'CREATE_DM_CHAT': {
            const { currentUser, friend } = action.payload;
            
            // Create new chat with friend's id as chat id
            const newChat: Chat = {
                id: friend._id,
                participants: [currentUser, friend],
                messages: [], // Start with empty messages - will be loaded separately
                unreadCount: 0,
            };
            
            return {
                ...state,
                activeChat: newChat,
                showDmWindow: true,
                showFriends: false
            };
        }

        case 'ADD_FRIEND':
            return {
                ...state,
                friends: [...state.friends, action.payload],
            };
            
        case 'SET_ACTIVE_SERVER':
            return { ...state, activeServer: action.payload };

        case 'CREATE_NEW_SERVER':
            return {
                ...state,
                servers: [...state.servers, action.payload],
                activeServer: action.payload.id
            }

        case 'LOAD_CHAT_MESSAGES':
            if (!state.activeChat) return state;
            
            return {
                ...state,
                activeChat: {
                    ...state.activeChat,
                    messages: action.payload.messages,
                    lastMessage: action.payload.messages.length > 0 
                        ? action.payload.messages[action.payload.messages.length - 1] 
                        : undefined
                }
            };
            
        default:
            return state;
    }
};

const initialState: ChatState = {
    usernameSet: "not set",
    activeChat: null,
    friends: [],
    dmFriends: [],
    servers: [],
    showFriends: false,
    showDmWindow: false,
    activeServer: null,
};

interface ChatContextType extends ChatState {
    // User actions
    setUsername: (username: string) => Promise<void>;
    checkUsername: () => Promise<void>;

    // Chat actions
    openDmWindow: (currentUser: User, friend: User) => void;
    closeDmWindow: () => void;
    setActiveChat: (friend: User) => Promise<void>; // Changed: now takes friend and loads messages
    sendMessage: (content: string) => void;

    // UI actions
    setShowFriends: (show: boolean) => void;
    setActiveServer: (serverid: string | null) => void;

    loadDmFriends: () => Promise<void>; 
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(ChatReducer, initialState);    
    const socketRef = useRef<Socket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { user, isAuthenticated } = useAuth();

    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const stateRef = useRef(state);
    const userRef = useRef(user);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Handle receive messages
    const handleReceiveMessage = useCallback((data: any) => {
        const currentUser = userRef.current;
        const currentState = stateRef.current;

        if(!currentUser) return;

        console.log("📨 Received message data:", data);

        const senderid = data.from;
        const msgData = data.message;

        if (!msgData || !senderid) {
            console.error("❌ Invalid message data received");
            return;
        }

        const timestamp = msgData.timeStamp 
            ? new Date(msgData.timeStamp) 
            : new Date();
        const isValidTimestamp = !isNaN(timestamp.getTime());

        const msg: Message = {
            id: msgData.id,
            from: senderid,
            to: msgData.to || currentUser._id,
            content: msgData.content,
            timeStamp: isValidTimestamp ? timestamp : new Date(),
        };

        console.log("📝 Processed message:", msg);

        // Only add to activeChat if it's the current conversation
        if (currentState.activeChat && currentState.activeChat.id === senderid) {
            dispatch({ type: "RECEIVE_MESSAGE", payload: msg });
        } else {
            // You can handle notifications for non-active chats here
            console.log("📨 Message from non-active chat, could show notification");
        }
    }, []);

    // Handle User Status change
    const handleUserStatusChange = useCallback(
        (data: { userid: string; status: "ONLINE" | "OFFLINE" | "AWAY" | "DO_NOT_DISTURB", lastSeen: Date }) => {
            console.log("Received User Status change data:", data);
            dispatch({ type: "UPDATE_USER_STATUS", payload: {
                ...data,
                lastSeen: new Date(data.lastSeen),
            } });
        }
    , []);

    // Initialize socket connection
    useEffect(() => {
        if(isAuthenticated && user) {
            const be_url = import.meta.env.VITE_BE_URL;

            // Clean up existing connection
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            socketRef.current = io(be_url, {
                withCredentials: true,
                transports: ["websocket", "polling"],
                timeout: 20000,
                forceNew: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            const socket = socketRef.current;

            // Connection events
            socket.on("connect", () => {
                console.log("Connected to server");
                setIsConnected(true);
                setConnectionError(null);
            });

            socket.on('connect_error', (error) => {
                console.error("Connection error:", error);
                setIsConnected(false);
                setConnectionError(error.message);

                if(reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                }

                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log("Retrying socket connection...", connectionError);
                    socket.connect();
                }, 3000);
            });

            socket.on("disconnect", (reason) => {
                console.log("Socket disconnected:", reason);
                setIsConnected(false);
                if(reason === "io client disconnect") {
                    socket.connect();
                }
            });  

            socket.on("reconnect", (attemptNumber) => {
                console.log("Socket reconnected after", attemptNumber, "attempts");
                setIsConnected(true);
                setConnectionError(null);
            });

            socket.on("reconnect_error", (error) => {
                console.error("Socket reconnection error:", error);
                setConnectionError(`Reconnection failed: ${error.message}`);
            });

            socket.on("connected", (data) => {
                console.log("Socket authenticated with data:", data);
            });

            // Event handlers
            socket.on("dm_message", handleReceiveMessage);
            socket.on("user_status_change", handleUserStatusChange);

            // Heartbeat to keep connection alive and update online status
            const heartbeatInterval = setInterval(() => {
                if(socket.connected) {
                    socket.emit("heartbeat");
                }
            }, 30000); // every 30 seconds

            // Clean up function
            return () => {
                if(reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                }
                clearInterval(heartbeatInterval);
                if(socket) {
                    console.log("Cleaning up Socket connection");
                    socket.disconnect();
                }
                setIsConnected(false);
            };

        } else {
            // User not authenticated, disconnect socket
            if(socketRef.current) {
                console.log("User not authenticated, disconnecting socket");
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        }
    }, [
        isAuthenticated,
        user?.id,
        handleReceiveMessage,
        handleUserStatusChange,
    ]);

    // Simplified loadDmFriends - just loads the list, no messages
    const loadDmFriends = useCallback(async () => {
        if (!user) return;
        
        try {
            // Get manually added DM friends
            const dmRes = await api.get('/api/users/getDm');
            const dmFriendsData = dmRes.data || [];
            
            // Get users who have sent messages to current user
            const messagesRes = await api.get(`/api/users/getMessageSenders/${user._id}`);
            const messageSenders = messagesRes.data || [];
            
            // Combine both lists and remove duplicates
            const allDmUsers = [...dmFriendsData];
            messageSenders.forEach((sender: any) => {
                const exists = dmFriendsData.find((friend: any) => friend._id === sender._id);
                if (!exists) {
                    allDmUsers.push(sender);
                }
            });
            
            dispatch({ type: 'SET_DM_FRIENDS', payload: allDmUsers });
            
            console.log('Loaded DM friends:', allDmUsers);
        } catch (error) {
            console.error('Failed to load dmFriends:', error);
        }
    }, [user]);

    // Check username on render
    const checkUsername = useCallback(async () => {
        try {
            const res = await api.get('/api/users/getUser');
            const userData = res.data;
                
            console.log("Username:", userData.username);

            if(userData.username === "not set") {
                dispatch({ type: 'SET_USERNAME_STATUS', payload: "not set" });
            } else {
                dispatch({ type: 'SET_USERNAME_STATUS', payload: userData.username });
            }
        } catch (error) {
            console.error('Failed to check username:', error);
        }
    }, []);

    // Initialize data on render
    useEffect(() => {
        if (isAuthenticated && user) {
            checkUsername();
            loadDmFriends();
        }
    }, [isAuthenticated, user, checkUsername, loadDmFriends]);

    // Updated setActiveChat - takes friend and loads their messages
    const setActiveChat = useCallback(async (friend: User) => {
        if (!user || !friend) {
            dispatch({ type: 'SET_ACTIVE_CHAT', payload: null});
            return;
        }

        console.log(`🎯 Setting active chat with ${friend.username} (ID: ${friend._id})`);

        // Create the chat structure first
        const newChat: Chat = {
            id: friend._id,
            participants: [user, friend],
            messages: [], // Will be loaded below
            unreadCount: 0,
        };

        // Set as active chat
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: newChat });

        // Load messages for this chat
        try {
            const res = await api.get(`/api/chats/${friend._id}/messages`);
            const messages = res.data.messages || [];
            
            console.log(`📥 Loaded ${messages.length} messages for ${friend.username}`);
            
            // Update activeChat with the loaded messages
            dispatch({ 
                type: 'LOAD_CHAT_MESSAGES', 
                payload: { messages } 
            });

            dispatch({
                type: 'SET_SHOW_DM_WINDOW',
                payload: true
            })

            dispatch({
                type: 'SET_SHOW_FRIENDS',
                payload: false
            })
            
        } catch (error) {
            console.error("Failed to load chat messages:", error);
            // Chat is still set, just without message history
        }
    }, [user]);

    // Send message
    const sendMessage = useCallback(
        (content: string) => {
            const currentState = stateRef.current;
            const currentUser = userRef.current;

            if(
                !currentState.activeChat ||
                !currentUser ||
                !socketRef.current ||
                !isConnected
            ) {
                console.warn("❌ Cannot send message:", {
                    hasActiveChat: !!currentState.activeChat,
                    hasUser: !!currentUser,
                    hasSocket: !!socketRef.current,
                    isConnected,
                });
                return;
            }

            const otherUser = currentState.activeChat.participants.find(
                (p) => p._id !== currentUser._id
            );

            console.log(currentUser);

            console.log(otherUser);

            if(!otherUser) {
                console.warn("❌ Cannot send message: no other user found");
                return;
            }

            const message: Message = {
                id: Date.now().toString(),
                from: currentUser._id,
                to: otherUser?._id,
                content,
                timeStamp: new Date(),
            };

            // Optimistically add message to UI
            dispatch({ type: "SEND_MESSAGE", payload: message });

            const socketData = {
                to: otherUser.username, // Send username to backend
                content: content,
                timeStamp: message.timeStamp.toISOString(),
            };

            console.log("📤 Sending message via socket:", socketData);
            socketRef.current.emit("dm_message", socketData);
        },
        [isConnected]
    );

    // Open DM Window - now uses setActiveChat
    const openDmWindow = useCallback(async (currentUser: User, friend: any) => {
        if (!currentUser) {
            console.error("Current user is null, cannot open DM window");
            return;
        }

        // Check if friend already exists in dmFriends
        console.log("Checking if", friend._id, "exists in dmFriends");
        const existingDmFriend = state.dmFriends.find(dmFriend => dmFriend._id === friend._id);
        
        if (!existingDmFriend) {
            // Friend doesn't exist in dmFriends, add them first
            try {
                const res = await api.post("/api/users/addDm", { friendid: friend._id });
                console.log(`Added ${friend.username} as DM friend`, res.data);

                // Add friend to dmFriends in state
                dispatch({ type: "ADD_DM_FRIEND", payload: friend });
            } catch (error) {
                console.error("Failed to add DM friend:", error);
            }
        }

        // Set as active chat and load messages
        await setActiveChat(friend);
        dispatch({ type: 'SET_SHOW_DM_WINDOW', payload: true });
        dispatch({ type: 'SET_SHOW_FRIENDS', payload: false });
    }, [state.dmFriends, setActiveChat]);

    const closeDmWindow = useCallback(() => {
        dispatch({ type: 'SET_SHOW_DM_WINDOW', payload: false });
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: null });
    }, []);

    const setUsername = useCallback(async (username: string) => {
        try {
            await api.post('/api/users/setUsername', { username });
            dispatch({ type: 'SET_USERNAME_STATUS', payload: username });
            
            // Update user with new username
            if (user) {
                user.username = username;
            }
        } catch (error) {
            console.error('Failed to set username:', error);
            throw error;
        }
    }, [user]);

    // UI action helpers
    const setShowFriends = useCallback((show: boolean) => {
        dispatch({ type: 'SET_SHOW_FRIENDS', payload: show });
    }, []);

    const setActiveServer = useCallback((serverid: string | null) => {
        dispatch({ type: 'SET_ACTIVE_SERVER', payload: serverid });
    }, []);

    return (
        <ChatContext.Provider value={{ 
            ...state, 
            setActiveChat, 
            sendMessage, 
            checkUsername,
            setUsername,
            openDmWindow,
            closeDmWindow,
            setShowFriends,
            setActiveServer,
            loadDmFriends
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat(): ChatContextType {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}