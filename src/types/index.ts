// User types
export type UserRole = 
  | 'ADMIN'
  | 'FARM_OWNER'
  | 'FARM_MANAGER'
  | 'VETERINARIAN'
  | 'ACCOUNTANT'
  | 'FARM_WORKER'
  | 'SALES_OFFICER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  farmId?: string;
  active: boolean;
  lastLogin?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Farm types
export interface Farm {
  id: string;
  name: string;
  location: string;
  address?: string;
  phone: string;
  email?: string;
  farmSize?: number;
  farmType: string;
  owner: string;
  currency: string;
}

// Animal types
export interface Animal {
  id: string;
  farmId: string;
  earTag: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  dateOfBirth: Date;
  status: string;
  weight?: number;
  acquisitionDate: Date;
  imageData?: string;
  damId?: string;
  sireId?: string;
}

// Dairy types
export interface DairyRecord {
  id: string;
  animalId: string;
  recordDate: Date;
  morningMilk: number;
  eveningMilk: number;
  totalMilk: number;
  quality: string;
  fat?: number;
  protein?: number;
}

// Health types
export interface HealthRecord {
  id: string;
  animalId: string;
  recordType: string;
  recordDate: Date;
  disease?: string;
  treatment?: string;
  veterinarian?: string;
  cost?: number;
}

// Breeding types
export interface BreedingRecord {
  id: string;
  animalId: string;
  breedingType: string;
  dateOfBreeding: Date;
  expectedCalving?: Date;
  actualCalvingDate?: Date;
  calvesNumber?: number;
}

// Finance types
export interface Transaction {
  id: string;
  farmId: string;
  transactionType: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  amount: number;
  date: Date;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  customerId: string;
  invoiceDate: Date;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  paidAmount: number;
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  type: string;
  phone: string;
  email?: string;
  address?: string;
  accountBalance: number;
}

// Inventory types
export interface InventoryItem {
  id: string;
  farmId: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  unitCost: number;
}

export interface InventoryMovement {
  id: string;
  inventoryItemId: string;
  movementType: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'DAMAGE';
  quantity: number;
  date: Date;
  reason?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form types
export interface FormError {
  field: string;
  message: string;
}

export interface FormState {
  errors: FormError[];
  isLoading: boolean;
  isSubmitting: boolean;
}

// Chart/Report types
export interface DailyMilkData {
  date: string;
  milk: number;
}

export interface MonthlyFinancials {
  month: string;
  income: number;
  expense: number;
  profit: number;
}

export interface DashboardStats {
  totalAnimals: number;
  animalsByCategory: { [key: string]: number };
  dailyMilkProduction: number;
  activeEmployees: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
}
