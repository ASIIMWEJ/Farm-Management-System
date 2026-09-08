import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Button, Card, Container, TextField, Typography } from '@mui/material';
import BackButton from '@/components/BackButton';

export default function ResetPassword() {
  const router = useRouter();
  const token = typeof router.query.token === 'string' ? router.query.token : '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Unable to reset password.');
      setMessage(result.message);
    } catch (requestError: any) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card sx={{ p: 4 }}>
        <BackButton fallback="/login" />
        <Typography variant="h4" gutterBottom>Reset Password</Typography>
        {message ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>
            <Button fullWidth variant="contained" onClick={() => router.push('/login')}>Go to Login</Button>
          </>
        ) : (
          <form onSubmit={submit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              fullWidth
              required
              type="password"
              label="New Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              required
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <Button fullWidth variant="contained" type="submit" disabled={loading || !token} sx={{ mt: 3 }}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        )}
      </Card>
    </Container>
  );
}
