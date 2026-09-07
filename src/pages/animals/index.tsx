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
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
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

export default function AnimalsList() {
  const router = useRouter();
  
  const [animals, setAnimals] = useState<AnimalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

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
    if (!window.confirm(`Remove ${animal.earTag}? This archives the animal record.`)) return;
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`/api/animals?id=${encodeURIComponent(animal.id)}&farmId=${encodeURIComponent(user.farmId)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to remove animal.');
      await fetchAnimals();
    } catch (requestError: any) { setError(requestError.message); }
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
                      <Tooltip title="Remove animal">
                        <IconButton
                          aria-label={`Remove ${animal.earTag}`}
                          color="error"
                          onClick={(e) => { e.stopPropagation(); deleteAnimal(animal); }}
                        >
                          <DeleteIcon />
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
    </Container>
  );
}