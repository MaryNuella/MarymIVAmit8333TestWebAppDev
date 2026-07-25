import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, Alert, LinearProgress, Grid, Typography } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function RequestForm() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        building: '',
        room_number: ''
    });
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/requests/categories/');
            setCategories(response.data.results || response.data || []);
        } catch (err) {
            console.error('Failed to load categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setUploading(true);

        try {
            // Upload images if any
            let imageUrls = [];
            // For simplicity, we assume a file upload endpoint exists.
            // If not, we can just store the file names or skip.
            // For now, just send the request without images.
            const payload = { ...formData };
            const response = await api.post('/requests/', payload);
            setSuccess(true);
            setTimeout(() => navigate('/requests'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to submit request');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <LinearProgress />;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>Submit Service Request</Typography>
            {success && <Alert severity="success" sx={{ mb: 2 }}>Request submitted! Redirecting...</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Title" name="title" required value={formData.title} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Description" name="description" multiline rows={4} required value={formData.description} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select name="category" value={formData.category} onChange={handleChange} label="Category">
                                <MenuItem value="">None</MenuItem>
                                {categories.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select name="priority" value={formData.priority} onChange={handleChange} label="Priority">
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="urgent">Urgent</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField fullWidth label="Building" name="building" value={formData.building} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField fullWidth label="Room Number" name="room_number" value={formData.room_number} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <Button component="label" variant="outlined" startIcon={<CloudUpload />} disabled={uploading}>
                            Upload Evidence (Images)
                            <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                        </Button>
                        {files.length > 0 && <Typography variant="caption" display="block" sx={{ mt: 1 }}>{files.length} file(s) selected</Typography>}
                    </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" size="large" disabled={uploading}>Submit</Button>
                    </Grid>
                </Grid>
            </form>
        </Container>
    );
}

