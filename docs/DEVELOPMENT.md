# FMIS Development Guide

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

3. **Update .env.local with your settings**
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/fmis_db"
   JWT_SECRET="your-secret-key"
   API_URL="http://localhost:3000"
   ```

4. **Setup database**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Visit http://localhost:3000

## Development Workflow

### Code Organization

```
src/
├── components/    # Reusable React components
├── pages/         # Next.js pages and API routes
├── services/      # Business logic
├── types/         # TypeScript interfaces
├── utils/         # Utility functions
└── styles/        # Global styles
```

### Creating a New Page

1. Create file in `src/pages/[module]/[page].tsx`
2. Import necessary components
3. Use Material-UI for styling
4. Add TypeScript types from `src/types/`

Example:
```typescript
// src/pages/animals/register.tsx
import { Box, Button, TextField, Card } from '@mui/material';
import type { Animal } from '@/types';

export default function RegisterAnimal() {
  // Component code
  return (
    <Card>
      {/* Component JSX */}
    </Card>
  );
}
```

### Creating an API Endpoint

1. Create file in `src/pages/api/[module]/[endpoint].ts`
2. Handle GET, POST, PUT, DELETE methods
3. Add authentication check
4. Validate input
5. Use Prisma for database operations

Example:
```typescript
// src/pages/api/animals/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Handle GET
        break;
      case 'POST':
        // Handle POST
        break;
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Database Operations

Using Prisma:

```typescript
// Create
const animal = await prisma.animal.create({
  data: {
    farmId: 'farm-123',
    earTag: 'EAR001',
    name: 'Bessie',
    // ... other fields
  },
});

// Read
const animal = await prisma.animal.findUnique({
  where: { id: 'animal-123' },
});

// Update
const animal = await prisma.animal.update({
  where: { id: 'animal-123' },
  data: { name: 'New Name' },
});

// Delete
await prisma.animal.delete({
  where: { id: 'animal-123' },
});

// List with pagination
const animals = await prisma.animal.findMany({
  where: { farmId: 'farm-123' },
  skip: 0,
  take: 20,
  orderBy: { createdAt: 'desc' },
});
```

### Form Handling

Using React Hook Form with Zod:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema
const animalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  species: z.string().min(1, 'Species is required'),
  breed: z.string().optional(),
});

type AnimalFormData = z.infer<typeof animalSchema>;

export default function AnimalForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
  });

  const onSubmit = async (data: AnimalFormData) => {
    // Submit form
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message}
      />
    </form>
  );
}
```

### Material-UI Usage

```typescript
import {
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';

// Spacing
<Box sx={{ p: 2, m: 1 }}>Content</Box>

// Grid Layout
<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
  <Box>Column 1</Box>
  <Box>Column 2</Box>
</Box>

// Flexbox
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <Box>Left</Box>
  <Box>Right</Box>
</Box>
```

## Git Workflow

### Branch Naming

```
feature/module-name        # New features
bugfix/issue-name          # Bug fixes
hotfix/critical-issue      # Production fixes
docs/documentation         # Documentation
```

### Commit Message Format

```
[FEAT/FIX/DOCS] [Module] Brief description

Detailed explanation of changes (optional)

Fixes #123
```

Example:
```
[FEAT] [animals] Add animal registration form

- Created registration form with validation
- Added API endpoint for creating animals
- Integrated with Prisma ORM

Fixes #45
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update

## Testing
Describe testing performed

## Screenshots (if applicable)
Add screenshots or GIFs

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added where needed
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
```

## Testing

### Unit Tests

```typescript
// src/__tests__/utils/helpers.test.ts
import { formatCurrency, calculateAge } from '@/utils/helpers';

describe('helpers', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result = formatCurrency(1234.56, 'USD');
      expect(result).toBe('$1,234.56');
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = new Date('2020-01-15');
      const age = calculateAge(birthDate);
      expect(age).toBeGreaterThan(0);
    });
  });
});
```

Run tests:
```bash
npm run test
npm run test:watch
```

## Performance Tips

1. **Optimize Database Queries**
   - Use proper indexing
   - Avoid N+1 queries
   - Use Prisma's `include` for relations

2. **Frontend Optimization**
   - Code splitting with Next.js dynamic imports
   - Image optimization
   - Remove unused dependencies
   - Implement proper error boundaries

3. **Caching**
   - HTTP caching headers
   - Database query caching
   - Session storage optimization

4. **Monitoring**
   - Use browser DevTools
   - Monitor bundle size
   - Check Lighthouse scores
   - Use profiling tools

## Common Issues & Solutions

### Database Connection Errors

**Problem**: `ECONNREFUSED`
**Solution**:
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env
3. Verify credentials
4. Check firewall

### Prisma Client Not Found

**Problem**: Cannot find Prisma client
**Solution**:
```bash
npm run db:generate
rm -rf node_modules
npm install
```

### Port Already in Use

**Problem**: Port 3000 already in use
**Solution**:
```bash
# Linux/Mac
kill -9 $(lsof -t -i:3000)

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run ESLint
npm run format          # Format code with Prettier

# Database
npm run db:migrate      # Run migrations
npm run db:generate     # Generate Prisma client
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio

# Testing
npm run test            # Run tests
npm run test:watch      # Watch mode

# Type checking
npm run type-check      # Check TypeScript types
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Material-UI Documentation](https://mui.com)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**Last Updated**: 2024-01-20
