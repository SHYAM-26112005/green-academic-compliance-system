import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { googleLogout } from '@react-oauth/google';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTimestamp');
        
        try {
            googleLogout();
            if ((window as any).google?.accounts?.id?.disableAutoSelect) {
                (window as any).google.accounts.id.disableAutoSelect();
            }
        } catch (error) {
            console.error("Error clearing Google session:", error);
        }
    };

    const checkSessionExpiration = () => {
        const timestampStr = localStorage.getItem('loginTimestamp');
        if (timestampStr) {
            const loginTime = parseInt(timestampStr, 10);
            const currentTime = Date.now();
            const ONE_HOUR_MS = 60 * 60 * 1000;

            if (currentTime - loginTime > ONE_HOUR_MS) {
                console.log("Session expired. Logging out automatically.");
                logout();
                // We use window.location here since we aren't inside a Router strictly in context,
                // or we let the protected routes handle the redirect when user goes null.
                window.location.href = '/login';
            }
        }
    };

    useEffect(() => {
        // Before setting state, check if the session is already expired
        checkSessionExpiration();

        // If the checking didn't trigger a logout (meaning token is still there)
        const storedUser = localStorage.getItem('user');
        
        if (localStorage.getItem('token') && storedUser) {
            try {
                setToken(localStorage.getItem('token'));
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                logout();
            }
        }
        
        setLoading(false);

        // Periodically check expiration every 1 minute while the app is open
        const intervalId = setInterval(checkSessionExpiration, 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('loginTimestamp', Date.now().toString());
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
