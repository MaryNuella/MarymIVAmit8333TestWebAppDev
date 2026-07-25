import React, { useState, useEffect } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Button, TextField, MenuItem, Select, FormControl, InputLabel, Pagination, Box, LinearProgress, Typography } from '@mui/material';
import { Visibility, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function RequestsList() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ status: '', priority: '' });
    const [search, setSearch] = useState('');
    const rainbowCardSx = {
        background: 'linear-gradient(135deg, #ffe4e6 0%, #fed7aa 18%, #fef3c7 34%, #dcfce7 50%, #dbeafe 68%, #e0e7ff 84%, #f3e8ff 100%)',
        borderColor: '#ffffff',
        boxShadow: '0 14px 36px rgba(76, 29, 149, 0.12)'
    };

    useEffect(() => {
        fetchRequests();
    }, [page, filters, search]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const params = { page, page_size: 10 };
            if (search) params.search = search;
            if (filters.status) params.status = filters.status;
            if (filters.priority) params.priority = filters.priority;
            const response = await api.get('/requests/', { params });
            const rawData = response.data.results || response.data;
            const requestsData = Array.isArray(rawData) ? rawData : [];
            setRequests(requestsData);
            setTotalPages(Math.ceil((response.data.count || requestsData.length) / 10));
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(1);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    if (loading) return <LinearProgress />;

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">My Requests</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/requests/new')}>
                    New Request
                </Button>
            </Box>

            <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                <TextField label="Search" variant="outlined" size="small" value={search} onChange={handleSearch} sx={{ minWidth: 200 }} />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select name="status" value={filters.status} onChange={handleFilterChange} label="Status">
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="assigned">Assigned</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select name="priority" value={filters.priority} onChange={handleFilterChange} label="Priority">
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper} sx={rainbowCardSx}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center">No requests found</TableCell></TableRow>
                        ) : (
                            requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>#{req.id}</TableCell>
                                    <TableCell>{req.title}</TableCell>
                                    <TableCell><Chip label={req.status} color={req.status === 'completed' ? 'success' : 'warning'} size="small" /></TableCell>
                                    <TableCell><Chip label={req.priority} color={req.priority === 'urgent' ? 'error' : 'default'} size="small" /></TableCell>
                                    <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => navigate(`/requests/${req.id}`)}>
                                            <Visibility />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" />
            </Box>
        </Container>
    );
}

