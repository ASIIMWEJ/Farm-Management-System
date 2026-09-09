import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import BackButton from '@/components/BackButton';

interface DairyRecord {
  id: string;
  recordDate: string;
  morningMilk: number;
  eveningMilk: number;
  totalMilk: number;
  quality: string;
}

interface HealthRecord {
  id: string;
  recordType: string;
  recordDate: string;
  disease?: string;
  vaccineType?: string;
  vaccineDate?: string;
  nextDueDate?: string;
  dewormType?: string;
  nextDewormDate?: string;
  veterinarian?: string;
  notes?: string;
}

interface BreedingRecord {
  id: string;
  breedingType: string;
  dateOfBreeding: string;
  pregnancyStatus: string;
  expectedCalving?: string;
  actualCalvingDate?: string;
}

interface WeightHistory {
  id: string;
  weight: number;
  date: string;
}

interface AnimalDetail {
  id: string;
  earTag: string;
  rfidTag?: string;
  name?: string;
  species: string;
  breed?: string;
  gender: string;
  dateOfBirth: string;
  color?: string;
  markings?: string;
  imageData?: string;
  status: string;
  acquisitionDate: string;
  acquisitionCost?: number;
  purchaseFrom?: string;
  disposalDate?: string;
  disposalReason?: string;
  recipient?: string;
  disposalValue?: number;
  weight?: number;
  height?: number;
  chest?: number;
  locationBuilding?: string;
  damAnimal?: { id: string; earTag: string; name?: string };
  sireAnimal?: { id: string; earTag: string; name?: string };
  dairyRecords: DairyRecord[];
  healthRecords: HealthRecord[];
  breedingRecords: BreedingRecord[];
  weightHistory: WeightHistory[];
}

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

export default function AnimalProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [animal, setAnimal] = useState<AnimalDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchAnimal = useCallback(async () => {
    if (!id || typeof id !== 'string') return;
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!token || !user.farmId) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/animals?id=${encodeURIComponent(id)}&farmId=${encodeURIComponent(user.farmId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
      });

      const responsePayload = await res.json();

      if (!res.ok || !responsePayload.success) {
        throw new Error(responsePayload.error || `Server responded with status ${res.status}`);
      }

      setAnimal(responsePayload.data);
    } catch (err: any) {
      console.error('[FETCH ANIMAL DETAIL ERROR]:', err);
      setError(err.message || 'Failed to load animal record.');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchAnimal();
  }, [fetchAnimal]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !animal) {
    return (
      <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
        <BackButton />
        <Alert severity="error" sx={{ mt: 3 }}>
          {error || 'Animal record not found.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <BackButton />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} mt={1}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            src={animal.imageData || undefined}
            alt={animal.name || animal.earTag}
            variant="rounded"
            sx={{ width: 72, height: 72 }}
          >
            {animal.name?.charAt(0) || animal.earTag.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {animal.name || animal.earTag}
            </Typography>
            <Typography color="textSecondary">Ear Tag: {animal.earTag}</Typography>
          </Box>
          <Chip
            label={animal.status}
            color={animal.status === 'ACTIVE' ? 'success' : 'default'}
            size="small"
          />
        </Box>
        <Button variant="contained" onClick={() => router.push(`/animals/register?id=${animal.id}`)}>
          Edit Animal
        </Button>
      </Box>

      {/* Bio & Farm Data */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Bio Data</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Species</Typography><Typography>{animal.species}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Breed</Typography><Typography>{animal.breed || '—'}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Gender</Typography><Typography>{animal.gender}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Date of Birth</Typography><Typography>{formatDate(animal.dateOfBirth)}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Color</Typography><Typography>{animal.color || '—'}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Markings</Typography><Typography>{animal.markings || '—'}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">RFID Tag</Typography><Typography>{animal.rfidTag || '—'}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Location</Typography><Typography>{animal.locationBuilding || '—'}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Weight</Typography><Typography>{animal.weight ? `${animal.weight} kg` : '—'}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Height</Typography><Typography>{animal.height ? `${animal.height} cm` : '—'}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Chest Girth</Typography><Typography>{animal.chest ? `${animal.chest} cm` : '—'}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Acquisition Date</Typography><Typography>{formatDate(animal.acquisitionDate)}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Acquisition Cost</Typography><Typography>{animal.acquisitionCost ?? '—'}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Purchased From</Typography><Typography>{animal.purchaseFrom || '—'}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Dam (Mother)</Typography><Typography>{animal.damAnimal ? (animal.damAnimal.name || animal.damAnimal.earTag) : '—'}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Sire (Father)</Typography><Typography>{animal.sireAnimal ? (animal.sireAnimal.name || animal.sireAnimal.earTag) : '—'}</Typography></Grid>
        </Grid>
      </Paper>

      {animal.status !== 'ACTIVE' && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Outcome</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Status</Typography><Typography>{animal.status}</Typography></Grid>
            <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Date</Typography><Typography>{formatDate(animal.disposalDate)}</Typography></Grid>
            <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">{animal.status === 'SOLD' ? 'Buyer' : 'Given To'}</Typography><Typography>{animal.recipient || '—'}</Typography></Grid>
            <Grid item xs={6} sm={3}><Typography variant="body2" color="textSecondary">Sale Price</Typography><Typography>{animal.disposalValue ?? '—'}</Typography></Grid>
            <Grid item xs={12}><Typography variant="body2" color="textSecondary">{animal.status === 'DEAD' ? 'Cause of Death' : 'Notes'}</Typography><Typography>{animal.disposalReason || '—'}</Typography></Grid>
          </Grid>
        </Paper>
      )}

      {/* Milk / Dairy Records */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Milk Records</Typography>
        <Divider sx={{ mb: 2 }} />
        {animal.dairyRecords.length === 0 ? (
          <Typography color="textSecondary">No milk records available.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Morning (L)</TableCell>
                  <TableCell>Evening (L)</TableCell>
                  <TableCell>Total (L)</TableCell>
                  <TableCell>Quality</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {animal.dairyRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.recordDate)}</TableCell>
                    <TableCell>{record.morningMilk}</TableCell>
                    <TableCell>{record.eveningMilk}</TableCell>
                    <TableCell>{record.totalMilk}</TableCell>
                    <TableCell>{record.quality}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Health & Vaccination Records */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Health &amp; Vaccination Records</Typography>
        <Divider sx={{ mb: 2 }} />
        {animal.healthRecords.length === 0 ? (
          <Typography color="textSecondary">No health records available.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Next Due</TableCell>
                  <TableCell>Vet</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {animal.healthRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.recordType}</TableCell>
                    <TableCell>{formatDate(record.recordDate)}</TableCell>
                    <TableCell>
                      {record.disease || record.vaccineType || record.dewormType || record.notes || '—'}
                    </TableCell>
                    <TableCell>{formatDate(record.nextDueDate || record.nextDewormDate)}</TableCell>
                    <TableCell>{record.veterinarian || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Breeding Records */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Breeding Records</Typography>
        <Divider sx={{ mb: 2 }} />
        {animal.breedingRecords.length === 0 ? (
          <Typography color="textSecondary">No breeding records available.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Pregnancy Status</TableCell>
                  <TableCell>Expected Calving</TableCell>
                  <TableCell>Actual Calving</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {animal.breedingRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.breedingType}</TableCell>
                    <TableCell>{formatDate(record.dateOfBreeding)}</TableCell>
                    <TableCell>{record.pregnancyStatus}</TableCell>
                    <TableCell>{formatDate(record.expectedCalving)}</TableCell>
                    <TableCell>{formatDate(record.actualCalvingDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Weight History */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Weight History</Typography>
        <Divider sx={{ mb: 2 }} />
        {animal.weightHistory.length === 0 ? (
          <Typography color="textSecondary">No weight records available.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Weight (kg)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {animal.weightHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>{record.weight}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}
