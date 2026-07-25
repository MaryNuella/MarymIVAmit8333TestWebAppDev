import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Grid, Typography, Box, Card, CardContent, Avatar, Button, LinearProgress } from '@mui/material';
import { Assignment, CheckCircle, Pending, Build, AddCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/requests/');
            let requests = [];
            if (response.data && response.data.requests) {
                requests = response.data.requests;
            } else if (Array.isArray(response.data)) {
                requests = response.data;
            } else if (response.data && response.data.results) {
                requests = response.data.results;
            }
            
            if (!Array.isArray(requests)) {
                requests = [];
            }
            
            setStats({
                total: requests.length,
                pending: requests.filter(function(r) { return r.status === 'pending'; }).length,
                inProgress: requests.filter(function(r) { return r.status === 'in_progress'; }).length,
                completed: requests.filter(function(r) { return r.status === 'completed'; }).length,
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setStats({ total: 0, pending: 0, inProgress: 0, completed: 0 });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LinearProgress />;
    }

    const roleName = user?.role_name || user?.role?.name || 'student';
    const rainbowCardSx = {
        background: 'linear-gradient(135deg, #ffe4e6 0%, #fed7aa 18%, #fef3c7 34%, #dcfce7 50%, #dbeafe 68%, #e0e7ff 84%, #f3e8ff 100%)',
        borderColor: '#ffffff',
        boxShadow: '0 14px 36px rgba(76, 29, 149, 0.12)'
    };

    const StudentDashboard = function() {
        return (
            <Box>
                <Typography variant="h4" gutterBottom>Welcome, {user?.first_name || user?.username}!</Typography>
                <Typography variant="body1" paragraph>Track and manage your service requests.</Typography>
                <Grid container spacing={3}>
                    {[
                        { title: 'Total', value: stats.total, icon: <Assignment />, color: '#1976d2' },
                        { title: 'Pending', value: stats.pending, icon: <Pending />, color: '#ff9800' },
                        { title: 'Completed', value: stats.completed, icon: <CheckCircle />, color: '#4caf50' }
                    ].map(function(stat, index) {
                        return (
                            <Grid item xs={12} sm={4} key={index}>
                                <Card sx={rainbowCardSx}>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between">
                                            <Box>
                                                <Typography color="textSecondary">{stat.title}</Typography>
                                                <Typography variant="h4">{stat.value}</Typography>
                                            </Box>
                                            <Avatar sx={{ bgcolor: stat.color }}>{stat.icon}</Avatar>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                    <Grid item xs={12}>
                        <Button variant="contained" startIcon={<AddCircle />} onClick={function() { navigate('/requests/new'); }}>
                            Submit New Request
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    const OfficerDashboard = function() {
        return (
            <Box>
                <Typography variant="h4" gutterBottom>Welcome, {user?.first_name || user?.username}!</Typography>
                <Typography variant="body1" paragraph>Manage your assigned maintenance tasks.</Typography>
                <Grid container spacing={3}>
                    {[
                        { title: 'Assigned', value: stats.pending, icon: <Assignment />, color: '#2196f3' },
                        { title: 'In Progress', value: stats.inProgress, icon: <Build />, color: '#ff9800' },
                        { title: 'Completed', value: stats.completed, icon: <CheckCircle />, color: '#4caf50' }
                    ].map(function(stat, index) {
                        return (
                            <Grid item xs={12} sm={4} key={index}>
                                <Card sx={rainbowCardSx}>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between">
                                            <Box>
                                                <Typography color="textSecondary">{stat.title}</Typography>
                                                <Typography variant="h4">{stat.value}</Typography>
                                            </Box>
                                            <Avatar sx={{ bgcolor: stat.color }}>{stat.icon}</Avatar>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                    <Grid item xs={12}>
                        <Button variant="contained" onClick={function() { navigate('/assignments'); }}>
                            View My Assignments
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    const AdminDashboard = function() {
        return (
            <Box>
                <Typography variant="h4" gutterBottom>Welcome, {user?.first_name || user?.username}!</Typography>
                <Typography variant="body1" paragraph>Manage users, requests, and system reports.</Typography>
                <Grid container spacing={3}>
                    {[
                        { title: 'Total', value: stats.total, icon: <Assignment />, color: '#1976d2' },
                        { title: 'Pending', value: stats.pending, icon: <Pending />, color: '#ff9800' },
                        { title: 'In Progress', value: stats.inProgress, icon: <Build />, color: '#2196f3' },
                        { title: 'Completed', value: stats.completed, icon: <CheckCircle />, color: '#4caf50' }
                    ].map(function(stat, index) {
                        return (
                            <Grid item xs={12} sm={3} key={index}>
                                <Card sx={rainbowCardSx}>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between">
                                            <Box>
                                                <Typography color="textSecondary">{stat.title}</Typography>
                                                <Typography variant="h4">{stat.value}</Typography>
                                            </Box>
                                            <Avatar sx={{ bgcolor: stat.color }}>{stat.icon}</Avatar>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                    <Grid item xs={12}>
                        <Button variant="contained" sx={{ mr: 2 }} onClick={function() { navigate('/admin'); }}>
                            Admin Panel
                        </Button>
                        <Button variant="contained" color="secondary" onClick={function() { navigate('/reports'); }}>
                            Reports
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    var DashboardComponent;
    if (roleName === 'admin') {
        DashboardComponent = AdminDashboard;
    } else if (roleName === 'officer') {
        DashboardComponent = OfficerDashboard;
    } else {
        DashboardComponent = StudentDashboard;
    }

    return (
        <Box sx={{ p: 3 }}>
            <DashboardComponent />
        </Box>
    );
}

