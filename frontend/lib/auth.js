'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { get, post } from './apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const data = await get('/auth/me');
                if (!cancelled) {
                    setUser(data.user || null);
                }
            } catch (err) {
                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    async function login(email, password) {
        const data = await post('/auth/login', { email, password });
        setUser(data.user || null);
        return data;
    }

    async function register(email, password) {
        const data = await post('/auth/register', { email, password });
        setUser(data.user || null);
        return data;
    }

    async function logout() {
        try {
            await post('/auth/logout', {});
        } catch (_) {}
        setUser(null);
    }

    const value = { user, loading, login, register, logout };

    return (
        <AuthContext.Provider value={value}>
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