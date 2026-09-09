import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, Card, Container, TextField, Typography } from '@mui/material';
import BackButton from '@/components/BackButton';
import FarmBackground from '@/components/FarmBackground';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Unable to process request.');
      setMessage(result.message);
    } catch (requestError: any) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <FarmBackground />
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card sx={{ p: 4, backdropFilter: 'blur(6px)', backgroundColor: 'rgba(255, 255, 255, 0.92)' }}>
          <BackButton fallback="/login" />
          <Typography variant="h4" gutterBottom>Forgot Password</Typography>
          <Typography color="textSecondary" sx={{ mb: 3 }}>
            Enter your account email and we will send a password reset link.
          </Typography>
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={submit}>
            <TextField
              fullWidth
              required
              type="email"
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ mt: 3 }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
          <Button fullWidth variant="text" onClick={() => router.push('/login')} sx={{ mt: 1 }}>
            Back to Login
          </Button>
        </Card>
      </Container>
    </Box>
  );
}
