import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUnreadCount();
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/unread_count/');
            setUnreadCount(response.data.unread_count || 0);
        } catch (err) {
            // If the endpoint is missing, just set to 0 and log a warning
            if (err.response && err.response.status === 404) {
                console.warn('Unread count endpoint not found (404) – ignoring');
            } else {
                console.error('Failed to fetch unread count:', err);
            }
            setUnreadCount(0);
        }
    };

    return (
        <NotificationContext.Provider value={{ unreadCount, setUnreadCount, fetchUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};
