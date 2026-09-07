# Farm Management Information System (FMIS)

## Overview

A comprehensive, modern Farm Management Information System built with Next.js, Node.js, PostgreSQL, and Material-UI. FMIS enables farmers to manage all aspects of farm operations from a centralized, user-friendly dashboard.

## Features

### Core Modules

1. **Animal Management** - Register and track all farm animals with unique identification, breed information, and status tracking
2. **Dairy Management** - Record daily milk production, quality metrics, and generate production reports
3. **Health & Veterinary** - Track vaccinations, deworming, diseases, treatments, and veterinary visits
4. **Breeding & Reproduction** - Manage breeding records, heat detection, pregnancies, and calving events
5. **Feed & Nutrition** - Manage feed inventory, purchases, consumption tracking, and cost analysis
6. **Finance & Accounting** - Track income/expenses, invoices, payments, and generate financial reports
7. **Sales & Customers** - Manage customers, product sales, invoices, and outstanding balances
8. **Inventory & Store** - Manage farm supplies, equipment, and track stock movements
9. **Crop Management** - Track fields, crop cycles, planting, and harvest records
10. **Employee & Labor** - Manage employee records, attendance, and payroll
11. **Equipment & Machinery** - Track equipment inventory, maintenance schedules, and service history
12. **Notifications & Reminders** - Automated alerts for vaccinations, breeding, maintenance, and more

### Dashboard Features

- Total animals count by category
- Daily milk production tracking
- Monthly revenue and expense analysis
- Employee management
- Quick actions for common tasks
- Key performance indicators (KPIs)
- Real-time alerts and notifications

## Technology Stack

- **Frontend**: React with Next.js, Material-UI (MUI)
- **Backend**: Node.js with Next.js API routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT tokens
- **Deployment**: Docker containers

## Project Structure

```
fmis/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Next.js pages and API routes
│   │   ├── api/           # API endpoints
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── animals/       # Animal management pages
│   │   ├── dairy/         # Dairy management pages
│   │   ├── health/        # Health management pages
│   │   ├── finance/       # Finance pages
│   │   └── inventory/     # Inventory pages
│   ├── services/          # Business logic/services
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── styles/            # CSS and styling
├── prisma/
│   └── schema.prisma      # Database schema
├── public/                # Static assets
├── docs/                  # Documentation
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── next.config.js        # Next.js configuration
└── .env.example          # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn package manager
- Docker (optional, for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   cd fmis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your database credentials and settings.

4. **Setup database**
   ```bash
   npm run db:generate
  npm run db:push
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using Docker

1. **Start containers**
   ```bash
   docker-compose up -d
   ```

2. **Run migrations**
   ```bash
  docker-compose exec app npm run db:push
   docker-compose exec app npm run db:seed
   ```

3. **Access the application**
   - FMIS: http://localhost:3000
   - pgAdmin: http://localhost:5050

4. **Stop containers**
   ```bash
   docker-compose down
   ```

## User Roles

- **Admin** - Full system access
- **Farm Owner** - Complete farm management access
- **Farm Manager** - Manage daily operations
- **Veterinarian** - Access health and treatment records
- **Accountant** - Financial management and reporting
- **Farm Worker** - Record daily activities
- **Sales Officer** - Customer and sales management

## API Documentation

### Authentication

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "fullName": "Full Name",
      "role": "FARM_MANAGER",
      "farmId": "farm-id"
    }
  }
}
```

### Animal Management

**List Animals**
```
GET /api/animals?page=1&pageSize=20&farmId=farm-id
Authorization: Bearer {token}
```

**Create Animal**
```
POST /api/animals
Authorization: Bearer {token}
Content-Type: application/json

{
  "farmId": "farm-id",
  "earTag": "EAR001",
  "name": "Bessie",
  "species": "cow",
  "breed": "Holstein",
  "gender": "female",
  "dateOfBirth": "2020-01-15",
  "acquisitionDate": "2020-01-15",
  "acquisitionCost": 1500
}
```

### Dairy Records

**Create Dairy Record**
```
POST /api/dairy
Authorization: Bearer {token}
Content-Type: application/json

{
  "animalId": "animal-id",
  "recordDate": "2024-01-20",
  "morningMilk": 15.5,
  "eveningMilk": 14.3,
  "quality": "GOOD"
}
```

### Health Records

**Create Health Record**
```
POST /api/health
Authorization: Bearer {token}
Content-Type: application/json

{
  "animalId": "animal-id",
  "recordType": "VACCINATION",
  "recordDate": "2024-01-20",
  "vaccineType": "Foot and Mouth",
  "veterinarian": "Dr. Smith",
  "cost": 50
}
```

### Transactions

**Create Transaction**
```
POST /api/finance
Authorization: Bearer {token}
Content-Type: application/json

{
  "farmId": "farm-id",
  "transactionType": "INCOME",
  "category": "Milk Sales",
  "description": "Daily milk sales",
  "amount": 250,
  "date": "2024-01-20",
  "customerId": "customer-id"
}
```

### Inventory

**Create Inventory Item**
```
POST /api/inventory
Authorization: Bearer {token}
Content-Type: application/json

{
  "farmId": "farm-id",
  "code": "FEED001",
  "name": "Dairy Pellets",
  "category": "feed",
  "quantity": 100,
  "unit": "bags",
  "reorderLevel": 10,
  "unitCost": 25,
  "supplier": "Farm Supply Co"
}
```

## Reports & Analytics

Generate comprehensive reports including:
- Animal population reports
- Milk production reports
- Breeding performance reports
- Health reports
- Feed consumption reports
- Financial reports
- Sales reports
- Inventory reports
- Employee performance reports
- Crop yield reports
- Farm profitability analysis

## Database Schema

The system uses a comprehensive PostgreSQL schema with the following main entities:

- **Users** - System users with role-based access
- **Farms** - Farm information and configuration
- **Animals** - Animal registry with genealogy
- **DairyRecords** - Milk production records
- **HealthRecords** - Veterinary and health information
- **BreedingRecords** - Breeding and reproduction data
- **Transactions** - Financial records
- **Invoices** - Sales and customer invoices
- **Customers** - Customer information
- **InventoryItems** - Stock inventory
- **InventoryMovements** - Stock movements and adjustments
- **Fields** - Farm fields and crop zones
- **Employees** - Staff information
- **Equipment** - Machinery and equipment
- **Reminders** - Automated notifications

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Environment variable configuration
- SQL injection protection via ORM
- CORS configuration
- Helmet security headers
- Activity logging and audit trails

## Performance Optimization

- Database query optimization with Prisma
- Pagination for large datasets
- Caching strategies (to be implemented)
- Image optimization
- Code splitting
- Server-side rendering with Next.js

## Deployment

### Self-Hosted Server

1. **Install Node.js and PostgreSQL**
2. **Clone repository**
3. **Install dependencies**: `npm install`
4. **Configure environment variables**: Create `.env` file
5. **Setup database**: `npm run db:migrate`
6. **Build application**: `npm run build`
7. **Start application**: `npm start`
8. **Use reverse proxy** (nginx/Apache) for HTTPS

### Docker Deployment

1. Build image: `docker build -t fmis .`
2. Run container with docker-compose: `docker-compose up -d`
3. Configure reverse proxy for production

### Cloud Deployment (AWS/Azure/GCP)

- Use managed PostgreSQL database
- Deploy Docker containers to managed services (ECS, App Service, Cloud Run)
- Use CDN for static assets
- Configure auto-scaling
- Setup monitoring and alerting

## Development

### Code Style

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Following Next.js best practices

### Testing

```bash
npm run test           # Run all tests
npm run test:watch    # Run tests in watch mode
```

### Building

```bash
npm run build         # Build for production
npm start            # Start production server
```

## Maintenance

### Database Maintenance

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npm run db:studio
```

### Monitoring

- Setup application logging
- Monitor database performance
- Track system resource usage
- Setup error tracking (Sentry, etc.)
- Monitor API response times

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database credentials
- Check firewall rules

### API Errors

- Check JWT token validity
- Verify request headers
- Check request body format
- Review API logs

### Build Issues

- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Regenerate Prisma client: `npm run db:generate`

## Support & Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Material-UI Documentation](https://mui.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

## License

MIT

## Contributing

Contributions are welcome! Please follow the development guidelines and submit pull requests.

## Roadmap

- [ ] Mobile application (React Native)
- [ ] SMS notifications
- [ ] Email notifications
- [ ] Advanced reporting and analytics
- [ ] Machine learning for predictions
- [ ] Blockchain for supply chain tracking
- [ ] IoT integration for automated monitoring
- [ ] Multi-language support
- [ ] Multi-currency support
- [ ] Enhanced data visualization

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-20  
**Maintainer**: FMIS Team
