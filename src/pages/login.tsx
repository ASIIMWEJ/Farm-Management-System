import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  Container,
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { Agriculture as AgricultureIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BackButton from '@/components/BackButton';
import FarmBackground from '@/components/FarmBackground';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        setError(result.error || 'Invalid email or password');
        return;
      }

      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <FarmBackground />
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card
          sx={{
            p: 4,
            backdropFilter: 'blur(6px)',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            border: '1px solid rgba(31, 107, 79, 0.15)',
          }}
        >
          <BackButton fallback="/" />
          <Box display="flex" flexDirection="column" alignItems="center" mb={1}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mb: 1 }}>
              <AgricultureIcon fontSize="large" />
            </Avatar>
            <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
              FMIS Login
            </Typography>
            <Typography color="textSecondary" sx={{ textAlign: 'center' }}>
              Welcome back to your Farm Management Information System
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, py: 1.25 }}
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>

          <Button fullWidth variant="text" sx={{ mt: 1 }} onClick={() => router.push('/forgot-password')}>
            Forgot password?
          </Button>

          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 2 }}>
            Sign in with the administrator credentials configured for this farm.
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}