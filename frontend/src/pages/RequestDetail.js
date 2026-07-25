import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, Chip, Button, Grid, TextField, Divider, Alert, LinearProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function RequestDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [notes, setNotes] = useState('');
    const [officers, setOfficers] = useState([]);
    const [selectedOfficer, setSelectedOfficer] = useState('');
    const [nextStatus, setNextStatus] = useState('');

    useEffect(() => {
        fetchRequest();
        if (user?.role_name === 'admin') {
            fetchOfficers();
        }
    }, [id, user]);

    const fetchRequest = async () => {
        try {
            const response = await api.get(`/requests/${id}/`);
            setRequest(response.data);
            setNextStatus(response.data.status || '');
        } catch (err) {
            setError('Failed to load request');
        } finally {
            setLoading(false);
        }
    };

    const fetchOfficers = async () => {
        try {
            const response = await api.get('/auth/users/', { params: { role: 'officer' } });
            const rawData = response.data.results || response.data;
            setOfficers(Array.isArray(rawData) ? rawData : []);
        } catch (err) {
            console.error('Failed to fetch officers:', err);
        }
    };

    const handleAssign = async () => {
        if (!selectedOfficer) {
            setError('Please select an officer');
            return;
        }
        setUpdating(true);
        try {
            await api.post(`/requests/${id}/assign/`, { officer_id: selectedOfficer });
            setSuccess('Request assigned successfully');
            fetchRequest();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to assign');
        } finally {
            setUpdating(false);
        }
    };

    const handleComplete = async () => {
        setUpdating(true);
        try {
            await api.post(`/requests/${id}/complete/`, { notes });
            setSuccess('Request marked as completed');
            fetchRequest();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to complete');
        } finally {
            setUpdating(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!nextStatus) {
            setError('Please select a status');
            return;
        }
        setUpdating(true);
        setError('');
        try {
            const response = await api.post(`/requests/${id}/update_status/`, { status: nextStatus, notes });
            setRequest(response.data);
            setSuccess('Status updated successfully');
            setNotes('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <LinearProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!request) return <Typography>Request not found</Typography>;

    const isOfficer = user?.role_name === 'officer';
    const isAdmin = user?.role_name === 'admin';
    const canComplete = isOfficer && request.status !== 'completed' && request.assigned_to === user?.id;
    const canAssign = isAdmin && request.status === 'pending';
    const canUpdateStatus = (isAdmin || (isOfficer && request.assigned_to === user?.id)) && request.status !== 'completed';

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5">Request #{request.id}</Typography>
                    <Chip label={request.status} color={request.status === 'completed' ? 'success' : 'warning'} />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">{request.title}</Typography>
                <Typography variant="body1" paragraph>{request.description}</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="body2"><strong>Category:</strong> {request.category_name || request.category || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Box>
                            <Typography variant="body2" component="span"><strong>Priority:</strong> </Typography>
                            <Chip label={request.priority} size="small" color={request.priority === 'urgent' ? 'error' : 'default'} />
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2"><strong>Building:</strong> {request.building || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2"><strong>Room:</strong> {request.room_number || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2"><strong>Requester:</strong> {request.requester_name || 'Unknown'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2"><strong>Assigned To:</strong> {request.assigned_to_name || 'Not assigned'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2"><strong>Created:</strong> {new Date(request.created_at).toLocaleString()}</Typography>
                    </Grid>
                </Grid>

                {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                {canAssign && (
                    <Box mt={3}>
                        <FormControl fullWidth>
                            <InputLabel>Select Officer</InputLabel>
                            <Select value={selectedOfficer} onChange={(e) => setSelectedOfficer(e.target.value)} label="Select Officer">
                                {officers.map((o) => (
                                    <MenuItem key={o.id} value={o.id}>{o.username}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button variant="contained" color="primary" onClick={handleAssign} disabled={updating} sx={{ mt: 2 }}>
                            {updating ? 'Assigning...' : 'Assign to Officer'}
                        </Button>
                    </Box>
                )}

                {canComplete && (
                    <Box mt={3}>
                        <TextField label="Completion Notes" multiline rows={2} fullWidth value={notes} onChange={(e) => setNotes(e.target.value)} />
                        <Button variant="contained" color="success" onClick={handleComplete} disabled={updating} sx={{ mt: 2 }}>
                            {updating ? 'Completing...' : 'Mark Completed'}
                        </Button>
                    </Box>
                )}

                {canUpdateStatus && (
                    <Box mt={3}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Status</InputLabel>
                            <Select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} label="Status">
                                <MenuItem value="assigned">Assigned</MenuItem>
                                <MenuItem value="in_progress">In Progress</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                                <MenuItem value="cancelled">Cancelled</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField label="Status Notes" multiline rows={2} fullWidth value={notes} onChange={(e) => setNotes(e.target.value)} />
                        <Button variant="contained" onClick={handleStatusUpdate} disabled={updating} sx={{ mt: 2 }}>
                            {updating ? 'Updating...' : 'Update Status'}
                        </Button>
                    </Box>
                )}

                {request.status_updates?.length > 0 && (
                    <Box mt={4}>
                        <Typography variant="h6" gutterBottom>Status History</Typography>
                        {request.status_updates.map((log) => (
                            <Box key={log.id} sx={{ borderLeft: '3px solid', borderColor: 'secondary.main', pl: 2, py: 1, mb: 1 }}>
                                <Typography variant="body2" fontWeight={700}>{log.status}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {log.updated_by_name || 'System'} - {new Date(log.created_at).toLocaleString()}
                                </Typography>
                                {log.notes && <Typography variant="body2">{log.notes}</Typography>}
                            </Box>
                        ))}
                    </Box>
                )}
            </Paper>
        </Container>
    );
}
