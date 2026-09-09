import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Alert,
  Avatar,
  Autocomplete,
} from '@mui/material';
import BackButton from '@/components/BackButton';

interface ParentOption {
  id: string;
  earTag: string;
  name?: string;
  gender: string;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function RegisterAnimal() {
  const router = useRouter();
  const [form, setForm] = useState({
    earTag: '',
    name: '',
    species: 'CATTLE',
    breed: '',
    gender: 'FEMALE',
    dateOfBirth: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    acquisitionCost: '',
    acquisitionType: 'PURCHASED',
    damId: '',
    sireId: '',
    imageData: '',
    rfidTag: '',
    color: '',
    markings: '',
    weight: '',
    height: '',
    chest: '',
    locationBuilding: '',
    purchaseFrom: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState<ParentOption[]>([]);
  const animalId = typeof router.query.id === 'string' ? router.query.id : '';
  const nameSuggestions = Array.from(
    new Set(parents.map((animal) => animal.name).filter((name): name is string => Boolean(name)))
  );
  const earTagSuggestions = Array.from(
    new Set(parents.map((animal) => animal.earTag).filter((earTag): earTag is string => Boolean(earTag)))
  );

  useEffect(() => {
    if (!router.isReady || !animalId) return;

    const loadAnimal = async () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!token || !user.farmId) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/animals?id=${encodeURIComponent(animalId)}&farmId=${encodeURIComponent(user.farmId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load animal record.');
        return;
      }

      const animal = data.data;
      setForm({
        earTag: animal.earTag,
        name: animal.name || '',
        species: animal.species,
        breed: animal.breed || '',
        gender: animal.gender,
        dateOfBirth: animal.dateOfBirth?.slice(0, 10) || '',
        acquisitionDate: animal.acquisitionDate?.slice(0, 10) || '',
        acquisitionCost: animal.acquisitionCost?.toString() || '',
        acquisitionType: animal.acquisitionType || 'PURCHASED',
        damId: animal.damId || '',
        sireId: animal.sireId || '',
        imageData: animal.imageData || '',
        rfidTag: animal.rfidTag || '',
        color: animal.color || '',
        markings: animal.markings || '',
        weight: animal.weight?.toString() || '',
        height: animal.height?.toString() || '',
        chest: animal.chest?.toString() || '',
        locationBuilding: animal.locationBuilding || '',
        purchaseFrom: animal.purchaseFrom || '',
      });
    };

    loadAnimal();
  }, [animalId, router]);

  useEffect(() => {
    if (!router.isReady) return;

    const loadParents = async () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!token || !user.farmId) return;

      const res = await fetch(`/api/animals?farmId=${encodeURIComponent(user.farmId)}&pageSize=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data?.data)) {
        setParents(data.data.data.filter((animal: ParentOption) => animal.id !== animalId));
      }
    };

    loadParents();
  }, [animalId, router.isReady]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/) || file.size > MAX_IMAGE_SIZE) {
      setError('Choose a PNG, JPEG, WebP, or GIF image smaller than 5 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, imageData: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!token || !user.farmId) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/animals?farmId=${encodeURIComponent(user.farmId)}${animalId ? `&id=${encodeURIComponent(animalId)}` : ''}`, {
        method: animalId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Redirect directly back to the Animal List page after saving
        router.push('/animals');
      } else {
        setError(data.error || 'Failed to save animal record.');
      }
    } catch (err) {
      setError('Network error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5, mb: 5 }}>
      <Paper sx={{ p: 4 }}>
        <BackButton fallback="/animals" />
        <Typography variant="h5" mb={3} fontWeight="bold">
          {animalId ? 'Edit Animal' : 'Register New Animal'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Autocomplete
            freeSolo
            options={earTagSuggestions}
            value={form.earTag}
            inputValue={form.earTag}
            onChange={(_e, value) => setForm({ ...form, earTag: value || '' })}
            onInputChange={(_e, value, reason) => {
              if (reason !== 'reset') setForm({ ...form, earTag: value });
            }}
            renderInput={(params) => (
              <TextField {...params} label="Ear Tag / Tag Number" required placeholder="e.g. TV123455" />
            )}
          />
          <Autocomplete
            freeSolo
            options={nameSuggestions}
            value={form.name}
            inputValue={form.name}
            onChange={(_e, value) => setForm({ ...form, name: value || '' })}
            onInputChange={(_e, value, reason) => {
              if (reason !== 'reset') setForm({ ...form, name: value });
            }}
            renderInput={(params) => (
              <TextField {...params} label="Animal Name" placeholder="e.g. Daisy" />
            )}
          />
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar src={form.imageData || undefined} variant="rounded" sx={{ width: 88, height: 88 }}>
              Animal
            </Avatar>
            <Box display="flex" flexDirection="column" gap={1}>
              <Button variant="outlined" component="label">
                Upload Picture
                <input hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} />
              </Button>
              {form.imageData && (
                <Button color="inherit" size="small" onClick={() => setForm({ ...form, imageData: '' })}>
                  Remove Picture
                </Button>
              )}
            </Box>
          </Box>
          <TextField
            select
            label="Species"
            value={form.species}
            onChange={(e) => setForm({ ...form, species: e.target.value })}
          >
            <MenuItem value="CATTLE">Cattle</MenuItem>
            <MenuItem value="GOAT">Goat</MenuItem>
            <MenuItem value="SHEEP">Sheep</MenuItem>
          </TextField>
          <TextField
            label="Breed"
            value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
            placeholder="e.g. Friesian"
          />
          <TextField
            label="RFID Tag"
            value={form.rfidTag}
            onChange={(e) => setForm({ ...form, rfidTag: e.target.value })}
            placeholder="e.g. RFID-00231"
          />
          <TextField
            label="Color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            placeholder="e.g. Black & White"
          />
          <TextField
            label="Markings"
            value={form.markings}
            onChange={(e) => setForm({ ...form, markings: e.target.value })}
            placeholder="e.g. White patch on forehead"
          />
          <TextField
            select
            label="Gender"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <MenuItem value="FEMALE">Female</MenuItem>
            <MenuItem value="MALE">Male</MenuItem>
          </TextField>
          <TextField
            label="Date of Birth"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
          />
          <TextField
            label="Weight (kg)"
            type="number"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
          />
          <TextField
            label="Height (cm)"
            type="number"
            value={form.height}
            onChange={(e) => setForm({ ...form, height: e.target.value })}
          />
          <TextField
            label="Chest Girth (cm)"
            type="number"
            value={form.chest}
            onChange={(e) => setForm({ ...form, chest: e.target.value })}
          />
          <TextField
            label="Location / Building"
            value={form.locationBuilding}
            onChange={(e) => setForm({ ...form, locationBuilding: e.target.value })}
            placeholder="e.g. Shed A"
          />
          <TextField
            select
            label="How Was This Animal Acquired?"
            value={form.acquisitionType}
            onChange={(e) => {
              const acquisitionType = e.target.value;
              const knowsParents = acquisitionType === 'BORN_ON_FARM' || acquisitionType === 'OTHER';
              setForm({
                ...form,
                acquisitionType,
                damId: knowsParents ? form.damId : '',
                sireId: knowsParents ? form.sireId : '',
              });
            }}
          >
            <MenuItem value="PURCHASED">Purchased</MenuItem>
            <MenuItem value="GIFTED">Gifted by a Friend / Relative</MenuItem>
            <MenuItem value="BORN_ON_FARM">Born on the Farm</MenuItem>
            <MenuItem value="OTHER">Other</MenuItem>
          </TextField>
          <TextField
            label="Acquisition Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.acquisitionDate}
            onChange={(e) => setForm({ ...form, acquisitionDate: e.target.value })}
          />
          {form.acquisitionType === 'GIFTED' ? (
            <TextField
              label="Given By (Friend's Name)"
              value={form.purchaseFrom}
              onChange={(e) => setForm({ ...form, purchaseFrom: e.target.value })}
              placeholder="e.g. James, a friend"
            />
          ) : form.acquisitionType === 'PURCHASED' ? (
            <TextField
              label="Purchased From"
              value={form.purchaseFrom}
              onChange={(e) => setForm({ ...form, purchaseFrom: e.target.value })}
              placeholder="e.g. Kampala Livestock Market"
            />
          ) : (
            <TextField
              label="Notes"
              value={form.purchaseFrom}
              onChange={(e) => setForm({ ...form, purchaseFrom: e.target.value })}
              placeholder="e.g. Born to Daisy on the farm"
            />
          )}
          {form.acquisitionType === 'PURCHASED' && (
            <TextField
              label="Acquisition Cost"
              type="number"
              value={form.acquisitionCost}
              onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
            />
          )}
          {(form.acquisitionType === 'BORN_ON_FARM' || form.acquisitionType === 'OTHER') && (
            <>
              <TextField
                select
                label="Mother (Dam)"
                value={form.damId}
                onChange={(e) => setForm({ ...form, damId: e.target.value })}
                helperText="Select a registered female animal, if known."
              >
                <MenuItem value="">Not recorded</MenuItem>
                {parents.filter((animal) => animal.gender.toUpperCase() === 'FEMALE').map((animal) => (
                  <MenuItem key={animal.id} value={animal.id}>{animal.earTag}{animal.name ? ` - ${animal.name}` : ''}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Father (Sire)"
                value={form.sireId}
                onChange={(e) => setForm({ ...form, sireId: e.target.value })}
                helperText="Select a registered male animal, if known."
              >
                <MenuItem value="">Not recorded</MenuItem>
                {parents.filter((animal) => animal.gender.toUpperCase() === 'MALE').map((animal) => (
                  <MenuItem key={animal.id} value={animal.id}>{animal.earTag}{animal.name ? ` - ${animal.name}` : ''}</MenuItem>
                ))}
              </TextField>
            </>
          )}
          <Box display="flex" gap={2} mt={2}>
            <Button variant="outlined" fullWidth type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="contained" color="success" fullWidth type="submit" disabled={loading}>
              {loading ? 'Saving...' : animalId ? 'Update Animal' : 'Save Animal'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}