import { useEffect, useState } from 'react';
import useRouter from 'next/router';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

export default function DairyManagement() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const deleteRecord = async (id: string) => {
    if (!window.confirm('Delete this milk production record?')) return;
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/dairy?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (response.ok) window.location.reload();
  };

  useEffect(() => {
    async function fetchDairyRecords() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }

        const res = await fetch('/api/dairy', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && json.data) {
          // Handles paginated array or flat array
          setRecords(Array.isArray(json.data) ? json.data : json.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch dairy records:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDairyRecords();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Dairy Management
          </Typography>
          <Typography color="textSecondary">
            Track milk production and quality metrics
          </Typography>
        </Box>
        <Link href="/dairy/record" passHref style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="success" size="large">
            Record Milk Production
          </Button>
        </Link>
      </Box>

      {/* Action Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Record Milk Production</Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Enter daily milk production records
              </Typography>
              <Link href="/dairy/record" passHref style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="success" fullWidth>
                  Record
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Production Reports</Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                View production reports and analytics
              </Typography>
              <Link href="/dairy/reports" passHref style={{ textDecoration: 'none' }}>
                <Button variant="contained" fullWidth>View Reports</Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Quality Analysis</Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Analyze milk quality metrics over time
              </Typography>
              <Link href="/dairy/quality" passHref style={{ textDecoration: 'none' }}>
                <Button variant="contained" fullWidth>View Analysis</Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Table */}
      <Typography variant="h6" mb={2}>
        Recent Production Logs
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Animal / Ear Tag</strong></TableCell>
              <TableCell align="right"><strong>Morning (L)</strong></TableCell>
              <TableCell align="right"><strong>Evening (L)</strong></TableCell>
              <TableCell align="right"><strong>Total (L)</strong></TableCell>
              <TableCell align="center"><strong>Quality</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  No milk records found. Click <strong>Record Milk Production</strong> to add one.
                </TableCell>
              </TableRow>
            ) : (
              records.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {new Date(row.recordDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {row.animal ? `${row.animal.name || ''} (${row.animal.earTag})` : row.animalId}
                  </TableCell>
                  <TableCell align="right">{row.morningMilk}</TableCell>
                  <TableCell align="right">{row.eveningMilk}</TableCell>
                  <TableCell align="right"><strong>{row.totalMilk}</strong></TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.quality || 'GOOD'}
                      color={row.quality === 'EXCELLENT' ? 'success' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit dairy record">
                      <IconButton aria-label={`Edit dairy record ${row.id}`} component={Link} href={`/dairy/record?id=${row.id}`}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                      <Tooltip title="Delete dairy record"><IconButton aria-label={`Delete dairy record ${row.id}`} color="error" onClick={() => deleteRecord(row.id)}><DeleteIcon /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}