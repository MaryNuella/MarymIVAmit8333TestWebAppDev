import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api'
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => { checkAuth(); }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const response = await api.get('/auth/users/me/');
                setUser(response.data);
            } catch (error) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                delete api.defaults.headers.common['Authorization'];
            }
        }
        setLoading(false);
    };

    const login = async (username, password) => {
        try {
            const response = await api.post('/token/', { username, password });
            if (response.data.access) {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                const userResponse = await api.get('/auth/users/me/');
                setUser(userResponse.data);
                enqueueSnackbar('Login successful!', { variant: 'success' });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            enqueueSnackbar('Login failed', { variant: 'error' });
            return false;
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/auth/register/', userData);
            enqueueSnackbar('Registration successful!', { variant: 'success' });
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            enqueueSnackbar('Registration failed', { variant: 'error' });
            return false;
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
        enqueueSnackbar('Logged out', { variant: 'info' });
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
