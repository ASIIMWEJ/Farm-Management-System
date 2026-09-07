import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, Container, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import BackButton from '@/components/BackButton';

export default function FinanceModule() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState({ transactionType: 'INCOME', category: '', description: '', amount: '', date: new Date().toISOString().slice(0, 10) });
  const request = async (options: RequestInit = {}, id = '') => {
    const token = localStorage.getItem('token'); const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || !user.farmId) { router.push('/login'); throw new Error('Please log in again.'); }
    const response = await fetch(`/api/finance?farmId=${encodeURIComponent(user.farmId)}${id ? `&id=${encodeURIComponent(id)}` : ''}`, { ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers } });
    const body = await response.json(); if (!response.ok || !body.success) throw new Error(body.error || 'Request failed'); return body.data;
  };
  const load = async () => { try { const data = await request(); setTransactions(data.data || []); } catch (requestError: any) { setError(requestError.message); } };
  useEffect(() => { load(); }, []);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError(''); try { await request({ method: editingId ? 'PUT' : 'POST', body: JSON.stringify({ ...form, amount: Number(form.amount) }) }, editingId); setEditingId(''); setForm({ ...form, category: '', description: '', amount: '' }); await load(); } catch (requestError: any) { setError(requestError.message); } };
  const remove = async (id: string) => { if (!window.confirm('Delete this transaction?')) return; try { await request({ method: 'DELETE' }, id); await load(); } catch (requestError: any) { setError(requestError.message); } };
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BackButton />
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Finance Management
        </Typography>
        <Typography color="textSecondary">
          Track income, expenses, and financial reports
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper component="form" onSubmit={submit} sx={{ p: 3, mb: 3, display: 'grid', gap: 2, gridTemplateColumns: { md: 'repeat(3, 1fr)' } }}>
        <TextField select label="Type" value={form.transactionType} onChange={(event) => setForm({ ...form, transactionType: event.target.value })}><MenuItem value="INCOME">Income</MenuItem><MenuItem value="EXPENSE">Expense</MenuItem></TextField><TextField label="Category" required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /><TextField label="Amount" type="number" required value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /><TextField label="Description" required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><TextField label="Date" type="date" required InputLabelProps={{ shrink: true }} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /><Button type="submit" variant="contained">{editingId ? 'Update Transaction' : 'Save Transaction'}</Button>
      </Paper>
      <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Date</TableCell><TableCell>Type</TableCell><TableCell>Category</TableCell><TableCell>Description</TableCell><TableCell align="right">Amount</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>{transactions.map((transaction) => <TableRow key={transaction.id}><TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell><TableCell>{transaction.transactionType}</TableCell><TableCell>{transaction.category}</TableCell><TableCell>{transaction.description}</TableCell><TableCell align="right">{transaction.amount}</TableCell><TableCell align="right"><Button aria-label={`Edit transaction ${transaction.id}`} onClick={() => { setEditingId(transaction.id); setForm({ transactionType: transaction.transactionType, category: transaction.category, description: transaction.description, amount: transaction.amount.toString(), date: transaction.date.slice(0, 10) }); }}><EditIcon /></Button><Button aria-label={`Delete transaction ${transaction.id}`} color="error" onClick={() => remove(transaction.id)}><DeleteIcon /></Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>
    </Container>
  );
}
