# Architecture & System Design

## System Overview

The Farm Management Information System (FMIS) is a full-stack web application designed to help farmers manage all aspects of farm operations from a centralized dashboard.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│                  (Next.js React App)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Login Page | Dashboard | Animals | Dairy | Health | Finance│ │
│  │                                                              │ │
│  │        Material-UI Components & TypeScript                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ HTTP/REST API
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│                     API Layer                                    │
│              (Next.js API Routes)                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ /api/auth      /api/animals     /api/dairy   /api/health  │ │
│  │ /api/finance   /api/inventory   /api/breeding             │ │
│  │                                                              │ │
│  │  JWT Authentication | RBAC | Input Validation             │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ Prisma ORM
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│                  Business Logic Layer                            │
│              (Services & Utilities)                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ AnimalService | DairyService | HealthService             │ │
│  │ FinanceService | InventoryService | ReportService        │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ SQL
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│                   Data Access Layer                             │
│              (Prisma Client)                                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│                   Persistence Layer                             │
│              (PostgreSQL Database)                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Users | Farms | Animals | DairyRecords | HealthRecords   │ │
│  │  Transactions | Inventory | Employees | Customers         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **UI Library**: Material-UI (MUI)
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **State Management**: React hooks + local storage
- **HTTP Client**: Axios
- **Styling**: CSS-in-JS (Emotion)

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Security**: Helmet, CORS

### Database
- **DBMS**: PostgreSQL 12+
- **ORM**: Prisma
- **Migration**: Prisma Migrate

### Deployment
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Web Server**: nginx (reverse proxy)
- **Process Manager**: PM2 (optional)

## Data Models

### Core Entities

#### User
- Manages system access and authentication
- Role-based access control
- Activity tracking with lastLogin

#### Farm
- Central entity representing a farm
- Contains all related data for that farm
- Multi-tenant support

#### Animal
- Core entity for livestock management
- Tracks identification, breed, status
- Links to dairy, health, and breeding records

#### DairyRecord
- Daily milk production tracking
- Quality metrics
- Linked to specific animal

#### HealthRecord
- Vaccination, deworming, treatment records
- Disease tracking
- Veterinary visit documentation

#### BreedingRecord
- Heat detection, insemination, mating records
- Pregnancy tracking
- Calving records

#### Transaction
- Income and expense tracking
- Financial reporting
- Customer-linked transactions

#### InventoryItem & InventoryMovement
- Stock tracking
- Movement history
- Low stock alerts

#### Employee
- Staff information
- Payroll tracking
- Status management

#### Customer
- Sales customer information
- Account balance tracking
- Invoice linking

## API Design

### RESTful Endpoints

```
Authentication
  POST   /api/auth/login              - User login
  POST   /api/auth/logout             - User logout
  GET    /api/auth/profile            - Get current user

Animals
  GET    /api/animals                 - List animals
  GET    /api/animals/:id             - Get animal details
  POST   /api/animals                 - Create animal
  PUT    /api/animals/:id             - Update animal
  DELETE /api/animals/:id             - Delete animal

Dairy
  GET    /api/dairy                   - List dairy records
  GET    /api/dairy/:id               - Get record details
  POST   /api/dairy                   - Create record
  PUT    /api/dairy/:id               - Update record
  DELETE /api/dairy/:id               - Delete record

Health
  GET    /api/health                  - List health records
  GET    /api/health/:id              - Get record details
  POST   /api/health                  - Create record
  PUT    /api/health/:id              - Update record
  DELETE /api/health/:id              - Delete record

Breeding
  GET    /api/breeding                - List breeding records
  POST   /api/breeding                - Create record
  PUT    /api/breeding/:id            - Update record

Finance
  GET    /api/finance                 - List transactions
  POST   /api/finance                 - Create transaction
  GET    /api/invoices                - List invoices
  POST   /api/invoices                - Create invoice

Inventory
  GET    /api/inventory               - List inventory items
  POST   /api/inventory               - Create item
  POST   /api/inventory/:id/movement  - Record movement

Dashboard
  GET    /api/dashboard/stats         - Get dashboard statistics
  GET    /api/reports/*               - Generate reports
```

### Request/Response Format

All endpoints follow REST conventions with JSON payloads:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description",
  "details": { /* additional error info */ }
}
```

## Authentication & Authorization

### JWT Flow

1. User logs in with credentials
2. Server validates credentials
3. Server generates JWT token with user info
4. Client stores token in localStorage
5. Client includes token in Authorization header for subsequent requests
6. Server validates token for each request

### Role-Based Access Control

- **Admin**: Full system access
- **Farm Owner**: All farm operations
- **Farm Manager**: Daily operations
- **Veterinarian**: Health records only
- **Accountant**: Financial records only
- **Farm Worker**: Limited to assigned tasks
- **Sales Officer**: Customer and sales

## Security Measures

1. **Authentication**: JWT-based with secure token storage
2. **Authorization**: Role-based access control
3. **Encryption**: Passwords hashed with bcryptjs
4. **Transport Security**: HTTPS/TLS required in production
5. **API Security**: 
   - CORS headers configured
   - Helmet security headers
   - Input validation with Zod
   - SQL injection protection via ORM
6. **Rate Limiting**: To be implemented
7. **Audit Logging**: Track all user activities
8. **Environment Variables**: Sensitive data in .env

## Database Design Principles

1. **Normalization**: Third-normal form (3NF)
2. **Referential Integrity**: Foreign keys with constraints
3. **Indexing**: On frequently queried columns
4. **Partitioning**: Large tables by date/farm
5. **Backup**: Regular automated backups
6. **Soft Deletes**: Using status fields where appropriate

## Performance Considerations

1. **Query Optimization**: Indexing, query planning
2. **Caching**: 
   - Redis for session data (future)
   - Browser caching for static assets
   - API response caching
3. **Pagination**: Large datasets paginated
4. **Connection Pooling**: Database connection optimization
5. **CDN**: Static assets served from CDN
6. **Lazy Loading**: Components and data loaded on demand

## Scalability

### Horizontal Scaling

1. **Stateless API**: No session state in server memory
2. **Load Balancing**: Multiple app instances
3. **Database Replication**: Read replicas for scaling

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Database performance tuning
3. Query optimization

### Future Considerations

1. Microservices architecture
2. Message queues (RabbitMQ, Redis)
3. Event-driven architecture
4. CQRS pattern for reporting

## Deployment Architecture

### Development
```
Developer Machine
  ↓
  Local Next.js (npm run dev)
  ↓
  Local PostgreSQL
```

### Production
```
Load Balancer (nginx)
  ↓
Docker Swarm / Kubernetes Cluster
  ├─ FMIS App Container 1
  ├─ FMIS App Container 2
  └─ FMIS App Container N
  ↓
PostgreSQL Master
  ↓
PostgreSQL Replicas
  ↓
Backup Storage
```

## Error Handling

- Structured error responses
- Proper HTTP status codes
- Client-side error recovery
- Logging and monitoring
- User-friendly error messages

## Monitoring & Logging

1. **Application Logging**: Winston/Pino (to be integrated)
2. **Error Tracking**: Sentry (to be integrated)
3. **Performance Monitoring**: APM tools (to be integrated)
4. **Database Monitoring**: Query performance analysis
5. **Infrastructure Monitoring**: Resource usage, uptime

---

**Document Version**: 1.0.0
**Last Updated**: 2024-01-20
