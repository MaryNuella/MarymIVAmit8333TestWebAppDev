import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Paper, Chip, IconButton, Box } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import api from '../services/api';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchNotifications(); }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications/');
            const rawData = response.data.results || response.data;
            setNotifications(Array.isArray(rawData) ? rawData : []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.post('/notifications/mark_read/', { notification_ids: [id] });
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    if (loading) return <Typography>Loading...</Typography>;

    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            <Typography variant="h4" gutterBottom>Notifications</Typography>
            <Paper>
                {notifications.length === 0 ? (
                    <Box p={3}><Typography>No notifications</Typography></Box>
                ) : (
                    <List>
                        {notifications.map(notif => (
                            <ListItem key={notif.id} divider>
                                <ListItemText primary={notif.title} secondary={notif.message} />
                                <Box display="flex" alignItems="center">
                                    {!notif.is_read && <Chip label="New" color="primary" size="small" sx={{ mr: 1 }} />}
                                    <IconButton onClick={() => markAsRead(notif.id)} disabled={notif.is_read}>
                                        <CheckCircle color={notif.is_read ? 'disabled' : 'action'} />
                                    </IconButton>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </Container>
    );
}
