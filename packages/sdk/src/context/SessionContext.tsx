import { createContext, useContext } from "react";

type SessionContextType = {
  sessionId: string;
  isSampled: boolean;
};

const SessionContext = createContext<SessionContextType | null>(null);

interface SessionProviderProps {
    children: React.ReactNode;
    sessionId: string;
    isSampled: boolean;
}

export function SessionProvider({
    children,
    sessionId,
    isSampled,
}: SessionProviderProps) {
    return (
        <SessionContext.Provider value={{ sessionId, isSampled }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSessionContext(): SessionContextType {
    const context = useContext(SessionContext);

    if (!context) {
        throw new Error("useSessionContext must be used within a SessionProvider");
    }
    
    return context;
}