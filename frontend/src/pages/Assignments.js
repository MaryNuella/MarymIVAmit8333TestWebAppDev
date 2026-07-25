import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Box, LinearProgress } from '@mui/material';
import api from '../services/api';

export default function Assignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const response = await api.get('/MaryWebAppAPI/my_assignments/');
            const rawData = response.data.results || response.data;
            setAssignments(Array.isArray(rawData) ? rawData : []);
        } catch (err) {
            console.error('Failed to fetch assignments:', err);
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await api.post(`/MaryWebAppAPI/${id}/act/`, { action: 'accept' });
            fetchAssignments();
        } catch (err) {
            alert('Failed to accept');
        }
    };

    const handleComplete = async (id) => {
        try {
            await api.post(`/MaryWebAppAPI/${id}/act/`, { action: 'complete' });
            fetchAssignments();
        } catch (err) {
            alert('Failed to complete');
        }
    };

    if (loading) return <LinearProgress />;

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Typography variant="h4" gutterBottom>My Assignments</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Request</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assignments.length === 0 ? (
                            <TableRow><TableCell colSpan={4} align="center">No assignments</TableCell></TableRow>
                        ) : (
                            assignments.map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell>#{a.id}</TableCell>
                                    <TableCell>{a.request?.title || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Chip label={a.assignment_status || a.status || 'Unknown'} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        {(a.assignment_status === 'pending' || a.status === 'pending') && (
                                            <Button size="small" color="primary" onClick={() => handleAccept(a.id)}>Accept</Button>
                                        )}
                                        {(a.assignment_status === 'accepted' || a.status === 'accepted' || a.status === 'assigned') && (
                                            <Button size="small" color="success" onClick={() => handleComplete(a.id)}>Complete</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}
