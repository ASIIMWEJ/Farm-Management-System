import { useEffect, useState } from 'react';
import { Alert, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import BackButton from '@/components/BackButton';

type DairyRecord = { id: string; recordDate: string; quality: string; fat: number | null; protein: number | null; somatic: number | null; animal?: { name?: string; earTag: string } };

export default function DairyQualityAnalysis() {
  const [records, setRecords] = useState<DairyRecord[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQuality = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await fetch('/api/dairy?pageSize=1000', { headers: { Authorization: `Bearer ${token}` } });
        const body = await response.json();
        if (!response.ok || !body.success) throw new Error(body.error || 'Unable to load quality records');
        setRecords(body.data.data || []);
      } catch (requestError: any) {
        setError(requestError.message);
      }
    };
    loadQuality();
  }, []);

  return <Container maxWidth="lg" sx={{ py: 4 }}>
    <BackButton fallback="/dairy" />
    <Typography variant="h4" gutterBottom>Quality Analysis</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>Review quality ratings and laboratory measurements from recorded production.</Typography>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Date</TableCell><TableCell>Animal</TableCell><TableCell>Rating</TableCell><TableCell align="right">Fat (%)</TableCell><TableCell align="right">Protein (%)</TableCell><TableCell align="right">Somatic Cells</TableCell></TableRow></TableHead><TableBody>{records.map((record) => <TableRow key={record.id}><TableCell>{new Date(record.recordDate).toLocaleDateString()}</TableCell><TableCell>{record.animal ? `${record.animal.name || 'Unnamed'} (${record.animal.earTag})` : 'Unknown animal'}</TableCell><TableCell>{record.quality}</TableCell><TableCell align="right">{record.fat ?? '-'}</TableCell><TableCell align="right">{record.protein ?? '-'}</TableCell><TableCell align="right">{record.somatic ?? '-'}</TableCell></TableRow>)}{!error && records.length === 0 && <TableRow><TableCell colSpan={6} align="center">No quality records have been entered.</TableCell></TableRow>}</TableBody></Table></TableContainer>
  </Container>;
}