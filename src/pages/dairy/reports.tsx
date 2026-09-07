import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import BackButton from '@/components/BackButton';

type DairyRecord = { id: string; recordDate: string; totalMilk: number; animal?: { name?: string; earTag: string } };

export default function DairyReports() {
  const [records, setRecords] = useState<DairyRecord[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await fetch('/api/dairy?pageSize=1000', { headers: { Authorization: `Bearer ${token}` } });
        const body = await response.json();
        if (!response.ok || !body.success) throw new Error(body.error || 'Unable to load production records');
        setRecords(body.data.data || []);
      } catch (requestError: any) {
        setError(requestError.message);
      }
    };
    loadReports();
  }, []);

  const totalProduction = records.reduce((total, record) => total + Number(record.totalMilk), 0);
  const byAnimal = Object.values(records.reduce<Record<string, { name: string; total: number; entries: number }>>((summary, record) => {
    const name = record.animal ? `${record.animal.name || 'Unnamed'} (${record.animal.earTag})` : 'Unknown animal';
    const current = summary[name] || { name, total: 0, entries: 0 };
    current.total += Number(record.totalMilk);
    current.entries += 1;
    summary[name] = current;
    return summary;
  }, {})).sort((first, second) => second.total - first.total);

  return <Container maxWidth="md" sx={{ py: 4 }}>
    <BackButton fallback="/dairy" />
    <Typography variant="h4" gutterBottom>Production Reports</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>Recorded production across all available dairy logs.</Typography>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Paper sx={{ p: 3, mb: 3 }}><Typography variant="overline">Total Production</Typography><Typography variant="h3">{totalProduction.toFixed(1)} L</Typography><Typography color="text.secondary">{records.length} recorded milking sessions</Typography></Paper>
    {!error && records.length === 0 ? <Box textAlign="center" py={4}><CircularProgress /></Box> : <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Animal</TableCell><TableCell align="right">Sessions</TableCell><TableCell align="right">Total (L)</TableCell><TableCell align="right">Average (L)</TableCell></TableRow></TableHead><TableBody>{byAnimal.map((row) => <TableRow key={row.name}><TableCell>{row.name}</TableCell><TableCell align="right">{row.entries}</TableCell><TableCell align="right">{row.total.toFixed(1)}</TableCell><TableCell align="right">{(row.total / row.entries).toFixed(1)}</TableCell></TableRow>)}</TableBody></Table></TableContainer>}
  </Container>;
}