import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, DeleteForever as DeleteForeverIcon } from '@mui/icons-material';
import BackButton from '@/components/BackButton';

interface AnimalRecord {
  id: string;
  earTag: string;
  name?: string;
  species: string;
  breed?: string;
  gender: string;
  status: string;
  imageData?: string;
}

const DISPOSAL_STATUSES = [
  { value: 'SOLD', label: 'Sold' },
  { value: 'DEAD', label: 'Died' },
  { value: 'TRANSFERRED', label: 'Given to Someone' },
  { value: 'MISSING', label: 'Missing' },
];

export default function AnimalsList() {
  const router = useRouter();
  
  const [animals, setAnimals] = useState<AnimalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [disposalTarget, setDisposalTarget] = useState<AnimalRecord | null>(null);
  const [disposalForm, setDisposalForm] = useState({
    status: 'SOLD',
    disposalDate: new Date().toISOString().split('T')[0],
    recipient: '',
    disposalValue: '',
    disposalReason: '',
  });
  const [disposalSaving, setDisposalSaving] = useState(false);

  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!token || !user.farmId) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/animals?farmId=${encodeURIComponent(user.farmId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
      });

      const responsePayload = await res.json();

      if (!res.ok || !responsePayload.success) {
        throw new Error(responsePayload.error || `Server responded with status ${res.status}`);
      }

      // 1. Unpack nested paginated response payload: { success: true, data: { data: [...animals] } }
      if (responsePayload.data && Array.isArray(responsePayload.data.data)) {
        setAnimals(responsePayload.data.data);
      } 
      // 2. Unpack flat array response fallback: { success: true, data: [...animals] }
      else if (Array.isArray(responsePayload.data)) {
        setAnimals(responsePayload.data);
      } 
      else {
        console.warn('[FRONTEND WARN]: Unrecognized response payload format:', responsePayload);
        setAnimals([]);
      }
    } catch (err: any) {
      console.error('[FETCH ANIMALS ERROR]:', err);
      setError(err.message || 'Failed to load animal records.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  const deleteAnimal = async (animal: AnimalRecord) => {
    setDisposalTarget(animal);
    setDisposalForm({
      status: 'SOLD',
      disposalDate: new Date().toISOString().split('T')[0],
      recipient: '',
      disposalValue: '',
      disposalReason: '',
    });
  };

  const submitDisposal = async () => {
    if (!disposalTarget) return;
    setDisposalSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(
        `/api/animals?id=${encodeURIComponent(disposalTarget.id)}&farmId=${encodeURIComponent(user.farmId)}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(disposalForm),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to update animal record.');
      setDisposalTarget(null);
      await fetchAnimals();
    } catch (requestError: any) {
      setError(requestError.message);
    } finally {
      setDisposalSaving(false);
    }
  };

  const deletePermanently = async (animal: AnimalRecord) => {
    if (!window.confirm(`Permanently delete ${animal.earTag}? This cannot be undone and removes all its records.`)) return;
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(
        `/api/animals?id=${encodeURIComponent(animal.id)}&farmId=${encodeURIComponent(user.farmId)}&permanent=true`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to permanently delete animal.');
      await fetchAnimals();
    } catch (requestError: any) {
      setError(requestError.message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <BackButton />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Animal Directory
          </Typography>
          <Typography color="textSecondary">
            All active and registered farm animals
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="outlined" onClick={fetchAnimals} disabled={loading}>
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/animals/register')}
          >
            Register New Animal
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Photo</strong></TableCell>
                <TableCell><strong>Ear Tag</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Species</strong></TableCell>
                <TableCell><strong>Breed</strong></TableCell>
                <TableCell><strong>Gender</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {animals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="textSecondary">
                      No animal records found in the database.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                animals.map((animal) => (
                  <TableRow
                    key={animal.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/animals/${animal.id}`)}
                  >
                    <TableCell>
                      <Avatar
                        src={animal.imageData || undefined}
                        alt={animal.name || animal.earTag}
                        variant="rounded"
                        sx={{ width: 48, height: 48 }}
                      >
                        {animal.name?.charAt(0) || animal.earTag.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">{animal.earTag}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        component="span"
                        color="primary"
                        sx={{ textDecoration: 'underline', fontWeight: 500 }}
                      >
                        {animal.name || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{animal.species}</TableCell>
                    <TableCell>{animal.breed || '—'}</TableCell>
                    <TableCell>{animal.gender}</TableCell>
                    <TableCell>
                      <Chip
                        label={animal.status}
                        color={animal.status === 'ACTIVE' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit animal">
                        <IconButton
                          aria-label={`Edit ${animal.earTag}`}
                          onClick={(e) => { e.stopPropagation(); router.push(`/animals/register?id=${animal.id}`); }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Record sold / died / given away">
                        <IconButton
                          aria-label={`Remove ${animal.earTag}`}
                          color="error"
                          onClick={(e) => { e.stopPropagation(); deleteAnimal(animal); }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete permanently">
                        <IconButton
                          aria-label={`Permanently delete ${animal.earTag}`}
                          color="error"
                          onClick={(e) => { e.stopPropagation(); deletePermanently(animal); }}
                        >
                          <DeleteForeverIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!disposalTarget} onClose={() => setDisposalTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Status for {disposalTarget?.earTag}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            select
            label="Outcome"
            value={disposalForm.status}
            onChange={(e) => setDisposalForm({ ...disposalForm, status: e.target.value })}
          >
            {DISPOSAL_STATUSES.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={disposalForm.disposalDate}
            onChange={(e) => setDisposalForm({ ...disposalForm, disposalDate: e.target.value })}
          />
          {(disposalForm.status === 'SOLD' || disposalForm.status === 'TRANSFERRED') && (
            <TextField
              label={disposalForm.status === 'SOLD' ? 'Buyer Name' : 'Given To'}
              value={disposalForm.recipient}
              onChange={(e) => setDisposalForm({ ...disposalForm, recipient: e.target.value })}
              placeholder="e.g. John Doe"
            />
          )}
          {disposalForm.status === 'SOLD' && (
            <TextField
              label="Sale Price"
              type="number"
              value={disposalForm.disposalValue}
              onChange={(e) => setDisposalForm({ ...disposalForm, disposalValue: e.target.value })}
            />
          )}
          <TextField
            label={disposalForm.status === 'DEAD' ? 'Cause of Death' : 'Notes'}
            multiline
            minRows={2}
            value={disposalForm.disposalReason}
            onChange={(e) => setDisposalForm({ ...disposalForm, disposalReason: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisposalTarget(null)} disabled={disposalSaving}>Cancel</Button>
          <Button variant="contained" color="error" onClick={submitDisposal} disabled={disposalSaving}>
            {disposalSaving ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}