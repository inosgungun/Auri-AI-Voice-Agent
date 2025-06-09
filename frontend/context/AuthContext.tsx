'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

interface User {
    username: string;
    email: string;
    phone?: string;
}

interface SignupData {
    username: string;
    email: string;
    password: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (userData: SignupData) => Promise<void>;
    logout: () => void;
    updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const login = async (email: string, password: string) => {
        const userData = await authService.login(email, password);
        setUser(userData);
        router.push('/dashboard');
    };

    const signup = async (userData: SignupData) => {
        const newUser = await authService.signup(userData);
        setUser(newUser);
        router.push('/dashboard');
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        router.push('/login');
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (!user?.email) {
            throw new Error('User email is required for profile update');
        }
        const updatedUser = await authService.updateProfile(user.email, updates);
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}