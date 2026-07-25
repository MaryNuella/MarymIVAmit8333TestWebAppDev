import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setUsername('');
            setPassword('');
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const success = await login(username, password);
        if (success) {
            navigate('/dashboard');
        } else {
            setError('Invalid credentials');
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 3, sm: 4 },
                    width: '100%',
                    background: 'linear-gradient(135deg, #ffe4e6 0%, #fed7aa 18%, #fef3c7 34%, #dcfce7 50%, #dbeafe 68%, #e0e7ff 84%, #f3e8ff 100%)',
                    borderColor: '#ffffff',
                    boxShadow: '0 18px 50px rgba(76, 29, 149, 0.16)'
                }}
            >
                <Typography variant="h4" align="center" gutterBottom>MaryWebAppCampus</Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                    Maintenance request management
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit} autoComplete="off">
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                        Username or email
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="Enter your username or email"
                        name="marywebcampus-login-user"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="off"
                        sx={{ mb: 2.5, backgroundColor: '#ffffff', borderRadius: 1 }}
                    />
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                        Password
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="Enter your password"
                        name="marywebcampus-login-pass"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        sx={{ backgroundColor: '#ffffff', borderRadius: 1 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowPassword((value) => !value)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3 }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                    <Box textAlign="center" sx={{ mt: 2 }}>
                        <Button color="primary" onClick={() => navigate('/register')}>Create Account</Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}
