import React, { createContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export const AuthContext = createContext();
const AUTH_STORAGE_KEY = 'moneymap_auth';

const sanitizeUserForStorage = (user) => {
    if (!user) {
        return user;
    }

    const { pictureUrl, ...safeUser } = user;
    return safeUser;
};

const buildStoredSession = (sessionData) => ({
    ...sessionData,
    user: sanitizeUserForStorage(sessionData.user)
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
        setToken(null);
        setLoading(false);
    }, []);

    const persistSession = (authData) => {
        const sessionData = {
            ...authData,
            loginAt: authData.loginAt || new Date().toISOString()
        };
        setUser(sessionData.user);
        setToken(sessionData.token);
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(buildStoredSession(sessionData)));
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        const storedUser = sessionStorage.getItem(AUTH_STORAGE_KEY);
        if (!storedUser) {
            return;
        }

        try {
            const savedSession = JSON.parse(storedUser);
            const nextSession = savedSession?.user
                ? { ...savedSession, user: sanitizeUserForStorage(updatedUser) }
                : { user: sanitizeUserForStorage(updatedUser), token };
            sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
        } catch (error) {
            console.error('Failed to persist updated user session:', error);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await apiFetch('/auth/login', {
                method: 'POST',
                body: { email, password },
            }, { auth: false });

            if (response.ok) {
                const authData = await response.json();
                persistSession(authData);
                return true;
            } else {
                console.error('Login failed');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const googleLogin = async (idToken) => {
        try {
            const response = await apiFetch('/auth/oauth/google', {
                method: 'POST',
                body: { idToken },
            }, { auth: false });

            if (response.ok) {
                const authData = await response.json();
                persistSession(authData);
                return true;
            }

            console.error('Google login failed');
            return false;
        } catch (error) {
            console.error('Google login error:', error);
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await apiFetch('/auth/register', {
                method: 'POST',
                body: { name, email, password },
            }, { auth: false });

            if (response.ok) {
                // Return true to indicate success, but do NOT log the user in automatically.
                // The component calling this (Register.jsx) should redirect to /login.
                return true;
            } else {
                console.error('Registration failed');
                return false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, googleLogin, register, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
