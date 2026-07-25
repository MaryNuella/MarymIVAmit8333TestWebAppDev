import React from 'react';
import { Alert, Container, Typography, Paper, Button, Box } from '@mui/material';
import { GetApp } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Reports() {
    const { user } = useAuth();

    const handleExport = async (format) => {
        try {
            const response = await api.get(`/requests/export_${format}/`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `requests.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(`Export to ${format} failed:`, err);
            alert(`Export to ${format} failed. Please try again.`);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            {user?.role_name !== 'admin' ? (
                <Alert severity="error">Only administrators can access reports.</Alert>
            ) : (
            <>
            <Typography variant="h4" gutterBottom>Reports</Typography>
            <Paper
                sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #ffe4e6 0%, #fed7aa 18%, #fef3c7 34%, #dcfce7 50%, #dbeafe 68%, #e0e7ff 84%, #f3e8ff 100%)',
                    borderColor: '#ffffff',
                    boxShadow: '0 14px 36px rgba(76, 29, 149, 0.12)'
                }}
            >
                <Typography variant="h6" gutterBottom>Export Service Requests</Typography>
                <Box display="flex" gap={2}>
                    <Button variant="contained" startIcon={<GetApp />} onClick={() => handleExport('csv')}>
                        Export CSV
                    </Button>
                    <Button variant="contained" startIcon={<GetApp />} onClick={() => handleExport('pdf')}>
                        Export PDF
                    </Button>
                </Box>
            </Paper>
            </>
            )}
        </Container>
    );
}
