import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Use the backend URL. Default to localhost:8080 if not specified.
    const API_URL = 'http://localhost:8081/api/auth';

    useEffect(() => {
        // Session persistence disabled as per requirement: always start logged out.
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // The backend expects a User object with email and password
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
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
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
