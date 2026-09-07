import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import BackButton from '@/components/BackButton';

export default function InventoryModule() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]); const [error, setError] = useState('');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState({ code: '', name: '', category: '', quantity: '', unit: '', reorderLevel: '', unitCost: '', supplier: '' });
  const request = async (options: RequestInit = {}, id = '') => {
    const token = localStorage.getItem('token'); const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || !user.farmId) { router.push('/login'); throw new Error('Please log in again.'); }
    const response = await fetch(`/api/inventory?farmId=${encodeURIComponent(user.farmId)}${id ? `&id=${encodeURIComponent(id)}` : ''}`, { ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers } });
    const body = await response.json(); if (!response.ok || !body.success) throw new Error(body.error || 'Request failed'); return body.data;
  };
  const load = async () => { try { const data = await request(); setItems(data.data || []); } catch (requestError: any) { setError(requestError.message); } };
  useEffect(() => { load(); }, []);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError(''); try { await request({ method: editingId ? 'PUT' : 'POST', body: JSON.stringify({ ...form, quantity: Number(form.quantity), reorderLevel: Number(form.reorderLevel), unitCost: Number(form.unitCost) }) }, editingId); setEditingId(''); setForm({ code: '', name: '', category: '', quantity: '', unit: '', reorderLevel: '', unitCost: '', supplier: '' }); await load(); } catch (requestError: any) { setError(requestError.message); } };
  const remove = async (id: string) => { if (!window.confirm('Delete this inventory item?')) return; try { await request({ method: 'DELETE' }, id); await load(); } catch (requestError: any) { setError(requestError.message); } };
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BackButton />
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Inventory Management
        </Typography>
        <Typography color="textSecondary">
          Manage farm supplies and equipment inventory
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper component="form" onSubmit={submit} sx={{ p: 3, mb: 3, display: 'grid', gap: 2, gridTemplateColumns: { md: 'repeat(3, 1fr)' }}}>
        <TextField label="Code" required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} /><TextField label="Name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><TextField label="Category" required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /><TextField label="Quantity" type="number" required value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /><TextField label="Unit" required value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} /><TextField label="Reorder Level" type="number" required value={form.reorderLevel} onChange={(event) => setForm({ ...form, reorderLevel: event.target.value })} /><TextField label="Unit Cost" type="number" required value={form.unitCost} onChange={(event) => setForm({ ...form, unitCost: event.target.value })} /><TextField label="Supplier" value={form.supplier} onChange={(event) => setForm({ ...form, supplier: event.target.value })} /><Button type="submit" variant="contained">{editingId ? 'Update Inventory Item' : 'Save Inventory Item'}</Button>
      </Paper>
      <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Category</TableCell><TableCell align="right">Quantity</TableCell><TableCell>Unit</TableCell><TableCell align="right">Cost</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>{items.map((item) => <TableRow key={item.id}><TableCell>{item.code}</TableCell><TableCell>{item.name}</TableCell><TableCell>{item.category}</TableCell><TableCell align="right">{item.quantity}</TableCell><TableCell>{item.unit}</TableCell><TableCell align="right">{item.unitCost}</TableCell><TableCell align="right"><Button aria-label={`Edit inventory item ${item.id}`} onClick={() => { setEditingId(item.id); setForm({ code: item.code, name: item.name, category: item.category, quantity: item.quantity.toString(), unit: item.unit, reorderLevel: item.reorderLevel.toString(), unitCost: item.unitCost.toString(), supplier: item.supplier || '' }); }}><EditIcon /></Button><Button aria-label={`Delete inventory item ${item.id}`} color="error" onClick={() => remove(item.id)}><DeleteIcon /></Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>
    </Container>
  );
}
