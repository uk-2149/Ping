import React, { createContext, useContext, useReducer, useCallback } from "react";
import api from "../lib/api";               
import { type Roles } from "../types";

interface ServerState {
    roles: Roles[];
}

type ServerAction =
    | { type: 'FETCH_ROLES'; payload: Roles[] }
    | { type: 'ADD_ROLE'; payload: Roles }
    | { type: 'UPDATE_ROLE'; payload: Roles }
    | { type: 'DELETE_ROLE'; payload: string };

const ServerContext = createContext<ServerContextType | undefined>(undefined);

interface ServerContextType extends ServerState {
    fetchRoles: (serverid: string) => Promise<void>;
}

const ServerReducer = (state: ServerState, action: ServerAction): ServerState => {
    switch (action.type) {
        case 'FETCH_ROLES':
            return { ...state, roles: [...action.payload] };
        case 'ADD_ROLE':
            return { ...state, roles: [...state.roles, action.payload] };
        case 'UPDATE_ROLE':
            return { ...state, roles: state.roles.map(role => role._id === action.payload._id ? action.payload : role) };
        case 'DELETE_ROLE':
            return { ...state, roles: state.roles.filter(role => role._id !== action.payload) };
        default:
            return state;
    }
};

const initialState: ServerState = {
    roles: [],
};

export function ServerProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(ServerReducer, initialState);

    const fetchRoles = useCallback(async (serverid: string) => {
        try {
            console.log("Fetching roles for server:", serverid);
            const res = await api.get(`/api/server/roles/${serverid}`);
            console.log("Roles fetched:", res.data);
            dispatch({ type: 'FETCH_ROLES', payload: res.data });
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    }, []);

    return (
        <ServerContext.Provider value={{ ...state, fetchRoles }}>
            {children}
        </ServerContext.Provider>
    );
}

export function useServer(): ServerContextType {
    const context = useContext(ServerContext);
    if (context === undefined) {
        throw new Error('useServer must be used within a ServerProvider');
    }
    return context;
}