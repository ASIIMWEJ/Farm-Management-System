import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, TextField, Typography, Paper, Container, MenuItem } from '@mui/material';
import BackButton from '@/components/BackButton';

export default function RecordDairy() {
  const router = useRouter();
  const [form, setForm] = useState({
    animalId: '',
    morningMilk: '',
    eveningMilk: '',
    quality: 'GOOD',
    fat: '',
    protein: '',
    somatic: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const recordId = typeof router.query.id === 'string' ? router.query.id : '';

  useEffect(() => {
    if (!router.isReady || !recordId) return;

    const loadRecord = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      const res = await fetch(`/api/dairy?id=${encodeURIComponent(recordId)}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.success) {
        setForm({ animalId: data.data.animal?.earTag || data.data.animalId, morningMilk: data.data.morningMilk.toString(), eveningMilk: data.data.eveningMilk.toString(), quality: data.data.quality, fat: data.data.fat?.toString() || '', protein: data.data.protein?.toString() || '', somatic: data.data.somatic?.toString() || '' });
      }
    };

    loadRecord();
  }, [recordId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/dairy${recordId ? `?id=${encodeURIComponent(recordId)}` : ''}`, {
        method: recordId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push('/dairy');
      } else {
        alert('Failed to save record. Check Animal ID.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper sx={{ p: 4 }}>
        <BackButton fallback="/dairy" />
        <Typography variant="h5" mb={3} fontWeight="bold">
          {recordId ? 'Edit Daily Milk Yield' : 'Record Daily Milk Yield'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Animal ID or Ear Tag"
            required
            value={form.animalId}
            onChange={(e) => setForm({ ...form, animalId: e.target.value })}
            helperText="Enter the ID or tag of the animal"
          />
          <TextField
            label="Morning Milk (Liters)"
            type="number"
            required
            inputProps={{ step: '0.1' }}
            value={form.morningMilk}
            onChange={(e) => setForm({ ...form, morningMilk: e.target.value })}
          />
          <TextField
            label="Evening Milk (Liters)"
            type="number"
            required
            inputProps={{ step: '0.1' }}
            value={form.eveningMilk}
            onChange={(e) => setForm({ ...form, eveningMilk: e.target.value })}
          />
          <TextField
            select
            label="Quality Rating"
            value={form.quality}
            onChange={(e) => setForm({ ...form, quality: e.target.value })}
          >
            <MenuItem value="EXCELLENT">Excellent</MenuItem>
            <MenuItem value="GOOD">Good</MenuItem>
            <MenuItem value="FAIR">Fair</MenuItem>
            <MenuItem value="POOR">Poor</MenuItem>
          </TextField>
          <TextField label="Fat (%)" type="number" inputProps={{ step: '0.1', min: '0' }} value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} />
          <TextField label="Protein (%)" type="number" inputProps={{ step: '0.1', min: '0' }} value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} />
          <TextField label="Somatic Cell Count" type="number" inputProps={{ min: '0' }} value={form.somatic} onChange={(e) => setForm({ ...form, somatic: e.target.value })} />
          <Box display="flex" gap={2} mt={1}>
            <Button variant="outlined" fullWidth onClick={() => router.push('/dairy')}>
              Cancel
            </Button>
            <Button variant="contained" color="success" fullWidth type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : recordId ? 'Update Record' : 'Save Record'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}