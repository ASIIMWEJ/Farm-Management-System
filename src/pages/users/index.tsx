import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { Key as KeyIcon, ManageAccounts as ManageAccountsIcon } from '@mui/icons-material';
import BackButton from '@/components/BackButton';
import type { UserRole } from '@/types';

const roles: { value: UserRole; label: string }[] = [
  { value: 'FARM_OWNER', label: 'Farm Owner' },
  { value: 'FARM_MANAGER', label: 'Farm Manager' },
  { value: 'VETERINARIAN', label: 'Veterinarian' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'FARM_WORKER', label: 'Farm Worker' },
  { value: 'SALES_OFFICER', label: 'Sales Officer' },
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'FARM_WORKER' as UserRole });
  const [resetUser, setResetUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [roleUser, setRoleUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('FARM_WORKER');

  const request = async (options: RequestInit = {}, userId = '') => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); throw new Error('Please log in again.'); }
    const response = await fetch(`/api/users${userId ? `?id=${encodeURIComponent(userId)}` : ''}`, { ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers } });
    const body = await response.json();
    if (!response.ok || !body.success) throw new Error(body.error || 'Request failed');
    return body.data;
  };
  const load = async () => { try { setUsers(await request()); } catch (requestError: any) { setError(requestError.message); } };
  useEffect(() => { load(); }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    try { await request({ method: 'POST', body: JSON.stringify(form) }); setForm({ fullName: '', email: '', password: '', role: 'FARM_WORKER' }); await load(); } catch (requestError: any) { setError(requestError.message); }
  };
  const resetPassword = async () => {
    if (!resetUser) return;
    setError('');
    try {
      await request({ method: 'PUT', body: JSON.stringify({ password: newPassword }) }, resetUser.id);
      setMessage(`Password reset for ${resetUser.fullName}.`);
      setResetUser(null);
      setNewPassword('');
    } catch (requestError: any) { setError(requestError.message); }
  };
  const updateRole = async () => {
    if (!roleUser) return;
    setError('');
    try {
      await request({ method: 'PUT', body: JSON.stringify({ role: selectedRole }) }, roleUser.id);
      setMessage(`Role updated for ${roleUser.fullName}.`);
      setRoleUser(null);
      await load();
    } catch (requestError: any) { setError(requestError.message); }
  };

  return <Container maxWidth="lg" sx={{ py: 4 }}>
    <BackButton />
    <Typography variant="h4" fontWeight={700} gutterBottom>User Management</Typography>
    <Typography color="textSecondary" sx={{ mb: 3 }}>Create farm users and assign their role.</Typography>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
    <Paper component="form" onSubmit={submit} sx={{ p: 3, mb: 3, display: 'grid', gap: 2, gridTemplateColumns: { md: 'repeat(2, 1fr)' }, border: '1px solid', borderColor: 'divider' }}>
      <TextField label="Full Name" required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
      <TextField label="Email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
      <TextField label="Temporary Password" type="password" required inputProps={{ minLength: 6 }} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
      <TextField select label="Role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>{roles.map((role) => <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>)}</TextField>
      <Box><Button type="submit" variant="contained">Create User</Button></Box>
    </Paper>
    <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}><Table><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell>Status</TableCell><TableCell>Last Login</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>{users.map((user) => <TableRow key={user.id} hover><TableCell sx={{ fontWeight: 600 }}>{user.fullName}</TableCell><TableCell>{user.email}</TableCell><TableCell>{user.role.replace(/_/g, ' ')}</TableCell><TableCell>{user.active ? 'Active' : 'Inactive'}</TableCell><TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</TableCell><TableCell align="right"><Tooltip title="Change role"><IconButton aria-label={`Change role for ${user.email}`} onClick={() => { setRoleUser(user); setSelectedRole(user.role); }}><ManageAccountsIcon /></IconButton></Tooltip><Tooltip title="Reset password"><IconButton aria-label={`Reset password for ${user.email}`} onClick={() => { setResetUser(user); setNewPassword(''); }}><KeyIcon /></IconButton></Tooltip></TableCell></TableRow>)}</TableBody></Table></TableContainer>
    <Dialog open={Boolean(resetUser)} onClose={() => setResetUser(null)} fullWidth maxWidth="xs"><DialogTitle>Reset Password</DialogTitle><DialogContent><Typography sx={{ mb: 2 }}>Set a new password for {resetUser?.fullName}.</Typography><TextField autoFocus fullWidth label="New Password" type="password" inputProps={{ minLength: 6 }} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></DialogContent><DialogActions><Button onClick={() => setResetUser(null)}>Cancel</Button><Button variant="contained" onClick={resetPassword} disabled={newPassword.length < 6}>Reset Password</Button></DialogActions></Dialog>
    <Dialog open={Boolean(roleUser)} onClose={() => setRoleUser(null)} fullWidth maxWidth="xs"><DialogTitle>Change User Role</DialogTitle><DialogContent><Typography sx={{ mb: 2 }}>Choose the access role for {roleUser?.fullName}.</Typography><TextField select fullWidth label="Role" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as UserRole)}>{roles.map((role) => <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>)}</TextField></DialogContent><DialogActions><Button onClick={() => setRoleUser(null)}>Cancel</Button><Button variant="contained" onClick={updateRole}>Update Role</Button></DialogActions></Dialog>
  </Container>;
}