import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert, MenuItem } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', first_name: '', last_name: '', user_type: 'student' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const success = await register(formData);
        if (success) navigate('/login');
        else setError('Registration failed');
        setLoading(false);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>Create Account</Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                    Join MaryWebAppCampus maintenance support
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>Username</Typography>
                    <TextField fullWidth placeholder="Choose a username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required sx={{ mb: 2 }} autoComplete="username" />
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>Email</Typography>
                    <TextField fullWidth placeholder="Enter your email address" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required sx={{ mb: 2 }} autoComplete="email" />
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>Password</Typography>
                    <TextField fullWidth placeholder="Create a password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required sx={{ mb: 2 }} autoComplete="new-password" />
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>First name</Typography>
                    <TextField fullWidth placeholder="Enter your first name" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} sx={{ mb: 2 }} autoComplete="given-name" />
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>Last name</Typography>
                    <TextField fullWidth placeholder="Enter your last name" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} sx={{ mb: 2 }} autoComplete="family-name" />
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>User type</Typography>
                    <TextField select fullWidth value={formData.user_type} onChange={(e) => setFormData({...formData, user_type: e.target.value})}>
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="staff">Staff</MenuItem>
                    </TextField>
                    <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 3 }}>
                        {loading ? 'Creating...' : 'Register'}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}
