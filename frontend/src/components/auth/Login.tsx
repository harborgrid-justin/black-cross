import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await dispatch(login({ email, password })).unwrap();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a1929 0%, #132f4c 100%)',
      }}
      role="main"
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={24} 
          sx={{ p: 4, borderRadius: 2 }}
          role="region"
          aria-label="login form"
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              BLACK-CROSS
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Enterprise Cyber Threat Intelligence Platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} role="alert" aria-live="assertive">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} aria-label="Login form">
            <TextField
              fullWidth
              id="email-input"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
              inputProps={{
                'aria-label': 'Email address',
                'aria-required': 'true',
              }}
            />
            <TextField
              fullWidth
              id="password-input"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              inputProps={{
                'aria-label': 'Password',
                'aria-required': 'true',
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
              aria-label={loading ? 'Signing in, please wait' : 'Sign in to your account'}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            Default credentials: admin@black-cross.io / admin
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
