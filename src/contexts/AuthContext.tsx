'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { User, Role } from '@/types';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password?: string, rememberMe?: boolean) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for existing session
        const userCookie = getCookie('user_session');
        if (userCookie) {
            try {
                const parsedUser = JSON.parse(userCookie as string);
                setUser(parsedUser);
            } catch (error) {
                console.error('Failed to parse user cookie', error);
                deleteCookie('user_session');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password?: string, rememberMe: boolean = true) => {
        setLoading(true);
        try {
            // If password is provided, hash it. If not (legacy/mock calls), handle appropriately or enforce password.
            // For now, enforcing password as per requirements.
            if (!password) {
                alert('Senha é obrigatória');
                setLoading(false);
                return;
            }

            const MD5 = (await import('crypto-js/md5')).default;
            const passwordHash = MD5(password).toString();

            const loggedUser = await authService.login(email, passwordHash);

            if (loggedUser) {
                setUser(loggedUser);
                const options = rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {};
                setCookie('user_session', JSON.stringify(loggedUser), options);
                router.push('/');
            } else {
                alert('Login falhou. Verifique suas credenciais.');
            }
        } catch (error) {
            console.error('Login error', error);
            alert('Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        deleteCookie('user_session');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
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
