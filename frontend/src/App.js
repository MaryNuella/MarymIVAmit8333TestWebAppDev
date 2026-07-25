import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RequestsList from './pages/RequestsList';
import RequestForm from './pages/RequestForm';
import RequestDetail from './pages/RequestDetail';
import AdminPanel from './pages/AdminPanel';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Assignments from './pages/Assignments';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#6d28d9',
            light: '#a78bfa',
            dark: '#4c1d95',
            contrastText: '#ffffff'
        },
        secondary: {
            main: '#c084fc',
            light: '#e9d5ff',
            dark: '#7e22ce',
            contrastText: '#2e1065'
        },
        background: {
            default: '#e6f4ff',
            paper: '#ffffff'
        },
        info: { main: '#7c3aed' }
    },
    shape: { borderRadius: 8 },
    typography: {
        fontFamily: ['Inter', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'].join(','),
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 }
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(90deg, #4c1d95 0%, #6d28d9 62%, #8b5cf6 100%)',
                    boxShadow: '0 8px 24px rgba(76, 29, 149, 0.22)'
                }
            }
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: 'linear-gradient(180deg, #ffe4e6 0%, #fed7aa 18%, #fef3c7 34%, #dcfce7 52%, #dbeafe 70%, #e0e7ff 86%, #f3e8ff 100%)',
                    borderRight: '1px solid #ddd6fe',
                    color: '#1f2937'
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    border: '1px solid #ede9fe',
                    boxShadow: '0 10px 30px rgba(76, 29, 149, 0.08)'
                }
            }
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 700
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 700 }
            }
        }
    }
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider maxSnack={3}>
                <Router>
                    <AuthProvider><NotificationProvider>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route element={<PrivateRoute />}>
                                <Route element={<Layout />}>
                                    <Route path="/" element={<Navigate to="/dashboard" />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/requests" element={<RequestsList />} />
                                    <Route path="/requests/new" element={<RequestForm />} />
                                    <Route path="/requests/:id" element={<RequestDetail />} />
                                    <Route path="/assignments" element={<Assignments />} />
                                    <Route path="/admin" element={<AdminPanel />} />
                                    <Route path="/reports" element={<Reports />} />
                                    <Route path="/notifications" element={<Notifications />} />
                                </Route>
                            </Route>
                        </Routes>
                    </NotificationProvider></AuthProvider>
                </Router>
            </SnackbarProvider>
        </ThemeProvider>
    );
}

export default App;


