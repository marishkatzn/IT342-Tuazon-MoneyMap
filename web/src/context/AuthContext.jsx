import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();
const AUTH_STORAGE_KEY = 'moneymap_auth';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Use the backend URL. Default to localhost:8080 if not specified.
    const API_URL = 'http://localhost:8081/api/auth';

    useEffect(() => {
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

        if (storedUser) {
            try {
                const savedSession = JSON.parse(storedUser);
                if (savedSession?.user) {
                    setUser(savedSession.user);
                    setToken(savedSession.token || null);
                } else {
                    setUser(savedSession);
                }
            } catch (error) {
                console.error('Failed to restore saved session:', error);
                localStorage.removeItem(AUTH_STORAGE_KEY);
            }
        }

        setLoading(false);
    }, []);

    const persistSession = (authData) => {
        const sessionData = {
            ...authData,
            loginAt: authData.loginAt || new Date().toISOString()
        };
        setUser(sessionData.user);
        setToken(sessionData.token);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!storedUser) {
            return;
        }

        try {
            const savedSession = JSON.parse(storedUser);
            const nextSession = savedSession?.user
                ? { ...savedSession, user: updatedUser }
                : { user: updatedUser, token };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
        } catch (error) {
            console.error('Failed to persist updated user session:', error);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

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
            const response = await fetch(`${API_URL}/oauth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken }),
            });

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
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // The backend expects a User object
                body: JSON.stringify({ name, email, password }),
            });

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
    };

    return (
        <AuthContext.Provider value={{ user, token, login, googleLogin, register, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
