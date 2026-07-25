import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Container, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Typography } from '@mui/material';

import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPanel() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tab, setTab] = useState(0);
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const rainbowCardSx = {
        background: 'linear-gradient(135deg, #ffe4e6 0%, #fed7aa 18%, #fef3c7 34%, #dcfce7 50%, #dbeafe 68%, #e0e7ff 84%, #f3e8ff 100%)',
        borderColor: '#ffffff',
        boxShadow: '0 14px 36px rgba(76, 29, 149, 0.12)'
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, requestsRes] = await Promise.all([
                api.get('/auth/users/'),
                api.get('/requests/')
            ]);
            setUsers(usersRes.data.results || usersRes.data || []);
            setRequests(requestsRes.data.results || requestsRes.data || []);
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (user?.role_name !== 'admin') {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">Only administrators can access this page.</Alert>
            </Container>
        );
    }

    if (loading) return <CircularProgress />;

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Typography variant="h4" gutterBottom>Admin Panel</Typography>
            <Paper sx={{ width: '100%', ...rainbowCardSx }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                    <Tab label="Users" />
                    <Tab label="All Requests" />
                </Tabs>
                <Box p={3}>
                    {tab === 0 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Username</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Role</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((u) => (
                                        <TableRow key={u.id}>
                                            <TableCell>{u.id}</TableCell>
                                            <TableCell>{u.username}</TableCell>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell><Chip label={u.role_name || 'N/A'} size="small" /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    {tab === 1 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Requester</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {requests.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell>#{r.id}</TableCell>
                                            <TableCell>{r.title}</TableCell>
                                            <TableCell><Chip label={r.status} size="small" /></TableCell>
                                            <TableCell>{r.requester_name}</TableCell>
                                            <TableCell>
                                                <Button size="small" onClick={() => navigate(`/requests/${r.id}`)}>View</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}
