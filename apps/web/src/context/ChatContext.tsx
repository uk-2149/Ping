import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

interface User {
  id: string;
  username: string;
  avatar?: string;
  status: "ONLINE" | "OFFLINE" | "AWAY" | "DO_NOT_DISTURB";
  lastSeen?: Date;
}

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

interface ChatState {
    chats: Chat[];
    activeChat: Chat | null;
    friends: User[];
    dmFriends: any[];
    showFriends: boolean;
    showDmWindow: boolean;
    activeServer: number | null;
    usernameSet: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

type ChatAction  = 
    | { type: 'SET_USERNAME_STATUS'; payload: string }
    | {
      type: "UPDATE_USER_STATUS";
      payload: { userId: string; status: "ONLINE" | "OFFLINE" | "AWAY" | "DO_NOT_DISTURB"; lastSeen: Date };
    }
    | { type: 'SET_CHATS'; payload: Chat[] }
    | { type: "ADD_NEW_CHAT"; payload: Chat }
    | { type: 'SET_ACTIVE_CHAT'; payload: Chat | null }
    | { type: 'SET_FRIENDS'; payload: User[] }
    | { type: 'SET_DM_FRIENDS'; payload: User[] }
    | { type: 'SET_SHOW_FRIENDS'; payload: boolean }
    | { type: 'SET_ACTIVE_SERVER'; payload: number | null }
    | { type: 'SET_SHOW_DM_WINDOW'; payload: boolean }
    | { type: 'SEND_MESSAGE'; payload: Message }
    | { type: 'RECEIVE_MESSAGE'; payload: Message }
    | { type: 'ADD_FRIEND'; payload: User }
    | { type: 'ADD_DM_FRIEND'; payload: User }
    | { type: 'CREATE_DM_CHAT'; payload: { currentUser: User, friend: User } };

const ChatReducer = (state: ChatState, action: ChatAction): ChatState => {
    switch (action.type) {
        case 'SET_USERNAME_STATUS':
            return { ...state, usernameSet: action.payload };

        case "UPDATE_USER_STATUS": {
            const { userId, status, lastSeen } = action.payload;
            console.log("🔄 Updating user status in reducer:", {
                userId,
                status,
                lastSeen,
            });

            // Update user status in chats
            const updatedChats = state.chats.map((chat) => ({
                ...chat,
                participants: chat.participants.map((participant) =>
                participant.id === userId
                    ? { ...participant, status, lastSeen }
                    : participant
                ),
            }));

            // Update user status in friends
            const updatedFriends = state.friends.map((friend) =>
                friend.id === userId ? { ...friend, status, lastSeen } : friend
            );

            // Update user status in dmFriends
            const updatedDmFriends = state.dmFriends.map((friend) =>
                friend.id === userId ? { ...friend, status, lastSeen } : friend
            );

            // Update active chat if it contains this user
            const updatedActiveChat = state.activeChat
                ? {
                    ...state.activeChat,
                    participants: state.activeChat.participants.map((participant) =>
                    participant.id === userId
                        ? { ...participant, status, lastSeen }
                        : participant
                    ),
                }
                : null;

            console.log("🔄 Updated chats, friends, dmFriends, and activeChat");
            return {
                ...state,
                chats: updatedChats,
                friends: updatedFriends,
                dmFriends: updatedDmFriends,
                activeChat: updatedActiveChat,
            };
        }

        case 'SET_CHATS':
            return { ...state, chats: action.payload };

        case 'ADD_NEW_CHAT':
            return { ...state, chats: [...state.chats, action.payload] };

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
        case 'RECEIVE_MESSAGE': {
            const message = action.payload;
            
            // Find the relevant chat by ID
            const chatIndex = state.chats.findIndex(chat => chat.id === message.to || chat.id === message.from);
            
            if (chatIndex !== -1) {
                const updatedChats = [...state.chats];
                const updatedChat = {
                    ...updatedChats[chatIndex],
                    messages: [...updatedChats[chatIndex].messages, message],
                    lastMessage: message,
                    unreadCount: action.type === 'RECEIVE_MESSAGE' && 
                                state.activeChat?.id !== updatedChats[chatIndex].id
                        ? updatedChats[chatIndex].unreadCount + 1
                        : updatedChats[chatIndex].unreadCount,
                };
                
                updatedChats[chatIndex] = updatedChat;
                
                // Update active chat if it's the same one
                const updatedActiveChat = state.activeChat?.id === updatedChat.id
                    ? updatedChat
                    : state.activeChat;
                
                return {
                    ...state,
                    chats: updatedChats,
                    activeChat: updatedActiveChat
                };
            }
            
            return state;
        }

        case 'CREATE_DM_CHAT': {
            const { currentUser, friend } = action.payload;
            
            // Check if chat already exists
            const existingChat = state.chats.find(chat => 
                chat.participants.some(p => p.id === friend.id) &&
                chat.participants.some(p => p.id === currentUser.id)
            );
            
            if (existingChat) {
                return {
                    ...state,
                    activeChat: existingChat,
                    showDmWindow: true,
                    showFriends: false
                };
            }
            
            // Create new chat with friend's ID as chat ID
            const newChat: Chat = {
                id: friend.id,
                participants: [currentUser, friend],
                messages: [],
                unreadCount: 0,
            };
            
            return {
                ...state,
                chats: [...state.chats, newChat],
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
            
        default:
            return state;
    }
};

const initialState: ChatState = {
    usernameSet: "not set",
    chats: [],
    activeChat: null,
    friends: [],
    dmFriends: [],
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
    setActiveChat: (chat: Chat | null) => void;
    sendMessage: (content: string) => void;

    // UI actions
    setShowFriends: (show: boolean) => void;
    setActiveServer: (serverId: number | null) => void;

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

        const senderId = data.from;
        const msgData = data.message;

        console.log("Incoming message:", msgData); 

        const timestamp = msgData.timestamp 
            ? new Date(msgData.timestamp) 
            : new Date();
        const isValidTimestamp = !isNaN(timestamp.getTime());

        const receiverId = data.to || msgData.to || currentUser.id;

        const msg: Message = {
            id: msgData.id,
            from: senderId,
            to: receiverId,
            content: msgData.content || msgData,
            timestamp: isValidTimestamp ? timestamp : new Date(),
        };

        // Use sender ID as chat ID for consistency
        const chatId = senderId === currentUser.id ? receiverId : senderId;

        console.log("Current Chats:", currentState.chats.map((c) => c.id));
        console.log("Incoming message:", msg);
        console.log("Chat ID:", chatId);

        const existingChat = currentState.chats.find(
            (chat) => chat.id === chatId
        );

        if(!existingChat) {
            // Create a new chat
            const newChat: Chat = {
                id: chatId,
                participants: [
                    { 
                        id: currentUser.id, 
                        username: currentUser.username, 
                        status: "OFFLINE", 
                        avatar: currentUser.avatar 
                    },
                    { 
                        id: chatId, 
                        username: data.senderName, 
                        status: "OFFLINE", 
                        avatar: data.senderAvatar 
                    }
                ],
                messages: [msg],
                lastMessage: msg,
                unreadCount: 1,
            };
            dispatch({ type: "ADD_NEW_CHAT", payload: newChat });
        } else {
            dispatch({ type: "RECEIVE_MESSAGE", payload: msg });
        }
    }, []);

    // Handle User Status change
    const handleUserStatusChange = useCallback(
        (data: { userId: string; status: "ONLINE" | "OFFLINE" | "AWAY" | "DO_NOT_DISTURB", lastSeen: Date }) => {
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
                    console.log("Retrying socket connection...");
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

    // Load DM friends on render
    const loadDmFriends = useCallback(async () => {
        if (!user) return;
        
        try {
            const res = await api.get('/api/users/getDm');
            const dmFriendsData = res.data || [];
            
            dispatch({ type: 'SET_DM_FRIENDS', payload: dmFriendsData });
            
            // Create chats for existing dmFriends
            const chatsFromDmFriends: Chat[] = dmFriendsData.map((friend: User) => ({
                id: friend.id, // friend ID as chat ID
                participants: [user, friend],
                messages: [],
                unreadCount: 0,
            }));
            
            dispatch({ type: 'SET_CHATS', payload: chatsFromDmFriends });
            
            console.log('Loaded dmFriends:', dmFriendsData);
            console.log('Created chats from dmFriends:', chatsFromDmFriends);
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

    const setActiveChat = useCallback(async (chat: Chat | null) => {
        if(!chat) {
            dispatch({ type: 'SET_ACTIVE_CHAT', payload: null});
            return;
        }

        try {
            const res = await api.get(`api/chats/${chat.id}/messages`);

            // Map backend messages to frontend Message type
            const mappedMessages = res.data.messages.map((msg: any) => ({
                id: msg._id,
                from: msg.from,
                to: msg.to,
                content: msg.content,
                timestamp: new Date(msg.timestamp),
            }));

            // Update the chat's messages in state and set activeChat to the updated chat object
            const updatedChats = stateRef.current.chats.map((c) =>
                c.id === chat.id ? { ...c, messages: mappedMessages } : c
            );

            const updatedActiveChat = updatedChats.find((c) => c.id === chat.id);

            dispatch({ type: "SET_CHATS", payload: updatedChats });
            dispatch({ type: "SET_ACTIVE_CHAT", payload: updatedActiveChat ?? null });
        } catch (error) {
            console.error("Failed to fetch chat history:", error);
            dispatch({ type: "SET_ACTIVE_CHAT", payload: chat }); // fallback
        }
    }, []);

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
                console.warn("Cannot send message: no active chat or user", {
                    hasActiveChat: !!currentState.activeChat,
                    hasUser: !!currentUser,
                    hasSocket: !!socketRef.current,
                    isConnected,
                });
                return;
            }

            const message: Message = {
                id: Date.now().toString(),
                from: currentUser.id,
                to: currentState.activeChat.id,
                content,
                timestamp: new Date(),
            };

            dispatch({ type: "SEND_MESSAGE", payload: message });

            const receiverUsername = currentState.activeChat.participants.find(
                (p) => p.id !== currentUser.id
            )?.username;

            if(receiverUsername) {
                console.log("Sending message to", receiverUsername);
                socketRef.current.emit("dm_message", {
                    from: currentUser.username,
                    to: receiverUsername,
                    content,
                    timestamp: new Date().toISOString(),
                    message: message
                });
            } else {
                console.warn("Cannot send message, no receiver username found");
            }
        },
        [isConnected]
    );

    // Open DM Window - Fixed logic
    const openDmWindow = useCallback(async (currentUser: User, friend: any) => {
        if (!currentUser) {
            console.error("Current user is null, cannot open DM window");
            return;
        }

        // Check if friend already exists in dmFriends
        console.log("Checking if", friend._id, "exists in dmFriends");
        console.log(state.dmFriends)
        const existingDmFriend = state.dmFriends.find(dmFriend => dmFriend._id === friend._id);
        
        if (existingDmFriend) {
            // Friend exists in dmFriends, just open existing chat
            console.log(`${friend.username} already exists in DM friends`);
            dispatch({ type: "CREATE_DM_CHAT", payload: { currentUser, friend } });
        } else {
            // Friend doesn't exist in dmFriends, add them first
            try {
                const res = await api.post("/api/users/addDm", { friendId: friend._id });
                console.log(`Added ${friend.username} as DM friend`, res.data);

                // Add friend to dmFriends in state
                dispatch({ type: "ADD_DM_FRIEND", payload: friend });
                
                // Then create the chat
                dispatch({ type: "CREATE_DM_CHAT", payload: { currentUser, friend } });
            } catch (error) {
                console.error("Failed to add DM friend:", error);
            }
        }
    }, [state.dmFriends]);

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

    const setActiveServer = useCallback((serverId: number | null) => {
        dispatch({ type: 'SET_ACTIVE_SERVER', payload: serverId });
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