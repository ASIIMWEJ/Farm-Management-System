import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Box, Button, Container, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import BackButton from '@/components/BackButton';

export default function HealthModule() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState({ animalId: '', recordType: 'VACCINATION', recordDate: new Date().toISOString().slice(0, 10), vaccineType: '', veterinarian: '', cost: '' });
  const request = async (path: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); throw new Error('Please log in again.'); }
    const response = await fetch(path, { ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers } });
    const body = await response.json();
    if (!response.ok || !body.success) throw new Error(body.error || 'Request failed');
    return body.data;
  };
  const loadRecords = async () => {
    try { const data = await request('/api/health'); setRecords(data.data || []); } catch (requestError: any) { setError(requestError.message); }
  };
  useEffect(() => { loadRecords(); }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    try { await request(`/api/health${editingId ? `?id=${encodeURIComponent(editingId)}` : ''}`, { method: editingId ? 'PUT' : 'POST', body: JSON.stringify({ ...form, cost: form.cost ? Number(form.cost) : undefined }) }); setEditingId(''); setForm({ ...form, animalId: '', vaccineType: '', veterinarian: '', cost: '' }); await loadRecords(); } catch (requestError: any) { setError(requestError.message); }
  };
  const remove = async (id: string) => { if (!window.confirm('Delete this health record?')) return; try { await request(`/api/health?id=${encodeURIComponent(id)}`, { method: 'DELETE' }); await loadRecords(); } catch (requestError: any) { setError(requestError.message); } };
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BackButton />
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Health Management
        </Typography>
        <Typography color="textSecondary">
          Track vaccinations, treatments, and health records
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper component="form" onSubmit={submit} sx={{ p: 3, mb: 3, display: 'grid', gap: 2, gridTemplateColumns: { md: 'repeat(3, 1fr)' } }}>
        <TextField label="Animal ID" required value={form.animalId} onChange={(event) => setForm({ ...form, animalId: event.target.value })} />
        <TextField select label="Record Type" value={form.recordType} onChange={(event) => setForm({ ...form, recordType: event.target.value })}><MenuItem value="VACCINATION">Vaccination</MenuItem><MenuItem value="DEWORMING">Deworming</MenuItem><MenuItem value="HEALTH_CHECK">Health Check</MenuItem><MenuItem value="VETERINARY_VISIT">Veterinary Visit</MenuItem></TextField>
        <TextField label="Date" type="date" required InputLabelProps={{ shrink: true }} value={form.recordDate} onChange={(event) => setForm({ ...form, recordDate: event.target.value })} />
        <TextField label="Vaccine or treatment" value={form.vaccineType} onChange={(event) => setForm({ ...form, vaccineType: event.target.value })} />
        <TextField label="Veterinarian" value={form.veterinarian} onChange={(event) => setForm({ ...form, veterinarian: event.target.value })} />
        <TextField label="Cost" type="number" value={form.cost} onChange={(event) => setForm({ ...form, cost: event.target.value })} />
        <Button type="submit" variant="contained">{editingId ? 'Update Health Record' : 'Save Health Record'}</Button>
      </Paper>
      <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Date</TableCell><TableCell>Animal</TableCell><TableCell>Type</TableCell><TableCell>Details</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>{records.map((record) => <TableRow key={record.id}><TableCell>{new Date(record.recordDate).toLocaleDateString()}</TableCell><TableCell>{record.animal?.earTag || record.animalId}</TableCell><TableCell>{record.recordType}</TableCell><TableCell>{record.vaccineType || record.treatment || '-'}</TableCell><TableCell align="right"><Button aria-label={`Edit health record ${record.id}`} onClick={() => { setEditingId(record.id); setForm({ animalId: record.animal?.earTag || record.animalId, recordType: record.recordType, recordDate: record.recordDate.slice(0, 10), vaccineType: record.vaccineType || record.treatment || '', veterinarian: record.veterinarian || '', cost: record.cost?.toString() || '' }); }}><EditIcon /></Button><Button aria-label={`Delete health record ${record.id}`} color="error" onClick={() => remove(record.id)}><DeleteIcon /></Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>
    </Container>
  );
}
