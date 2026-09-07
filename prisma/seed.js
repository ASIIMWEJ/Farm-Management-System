// Seeding script for database
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before running the seed.');
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { farm: true },
  });

  // Create a farm only when the demo user is not already linked to one.
  const farm = existingUser?.farm || await prisma.farm.create({
    data: {
      name: 'Demo Farm',
      location: 'Countryside',
      address: '123 Farm Lane',
      phone: '+1234567890',
      email: adminEmail,
      farmSize: 50,
      farmType: 'MIXED',
      owner: 'John Farmer',
      ownerContact: '+1234567890',
      currency: 'USD',
    },
  });

  console.log('Farm created:', farm.id);

  // Create or refresh the demo user
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      fullName: 'Farm Manager',
      role: 'FARM_MANAGER',
      farmId: farm.id,
      active: true,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      fullName: 'Farm Manager',
      role: 'FARM_MANAGER',
      farmId: farm.id,
      active: true,
    },
  });

  console.log('User created:', user.email);

  // Create demo animals
  const animal1 = await prisma.animal.upsert({
    where: { earTag: 'COW001' },
    update: {
      farmId: farm.id,
      name: 'Bessie',
      species: 'cow',
      breed: 'Holstein',
      gender: 'female',
      dateOfBirth: new Date('2020-01-15'),
      status: 'ACTIVE',
      acquisitionDate: new Date('2020-01-15'),
      acquisitionCost: 1500,
    },
    create: {
      farmId: farm.id,
      earTag: 'COW001',
      name: 'Bessie',
      species: 'cow',
      breed: 'Holstein',
      gender: 'female',
      dateOfBirth: new Date('2020-01-15'),
      status: 'ACTIVE',
      acquisitionDate: new Date('2020-01-15'),
      acquisitionCost: 1500,
    },
  });

  const animal2 = await prisma.animal.upsert({
    where: { earTag: 'COW002' },
    update: {
      farmId: farm.id,
      name: 'Daisy',
      species: 'cow',
      breed: 'Jersey',
      gender: 'female',
      dateOfBirth: new Date('2021-03-20'),
      status: 'ACTIVE',
      acquisitionDate: new Date('2021-03-20'),
      acquisitionCost: 1200,
    },
    create: {
      farmId: farm.id,
      earTag: 'COW002',
      name: 'Daisy',
      species: 'cow',
      breed: 'Jersey',
      gender: 'female',
      dateOfBirth: new Date('2021-03-20'),
      status: 'ACTIVE',
      acquisitionDate: new Date('2021-03-20'),
      acquisitionCost: 1200,
    },
  });

  console.log('Animals created');

  // Create demo dairy records
  const dairyRecord = await prisma.dairyRecord.findFirst({
    where: { animalId: animal1.id },
  });
  if (!dairyRecord) {
    await prisma.dairyRecord.create({
      data: {
      animalId: animal1.id,
      recordDate: new Date(),
      morningMilk: 15.5,
      eveningMilk: 14.3,
      totalMilk: 29.8,
      quality: 'GOOD',
      fat: 3.8,
      protein: 3.2,
      },
    });
  }

  console.log('Dairy records created');

  // Create demo health records
  const healthRecord = await prisma.healthRecord.findFirst({
    where: { animalId: animal1.id, recordType: 'VACCINATION' },
  });
  if (!healthRecord) {
    await prisma.healthRecord.create({
      data: {
      animalId: animal1.id,
      recordType: 'VACCINATION',
      recordDate: new Date(),
      vaccineType: 'Foot and Mouth Disease',
      vaccinator: 'Dr. Smith',
      cost: 50,
      },
    });
  }

  console.log('Health records created');

  // Create demo employee
  await prisma.employee.upsert({
    where: { idNumber: 'EMP001' },
    update: {
      farmId: farm.id,
      name: 'John Worker',
      position: 'Farm Hand',
      department: 'Operations',
      phone: '+0987654321',
      hireDate: new Date('2022-01-01'),
      baseSalary: 800,
      status: 'ACTIVE',
    },
    create: {
      farmId: farm.id,
      name: 'John Worker',
      idNumber: 'EMP001',
      position: 'Farm Hand',
      department: 'Operations',
      phone: '+0987654321',
      hireDate: new Date('2022-01-01'),
      baseSalary: 800,
      status: 'ACTIVE',
    },
  });

  console.log('Employee created');

  // Create demo customer
  await prisma.customer.create({
    data: {
      name: 'Local Dairy Co.',
      type: 'BUSINESS',
      phone: '+1111111111',
      email: 'dairy@example.com',
      address: '456 Dairy Street',
      creditLimit: 5000,
    },
  });

  console.log('Customer created');

  // Create demo inventory item
  await prisma.inventoryItem.upsert({
    where: { code: 'FEED001' },
    update: {
      farmId: farm.id,
      name: 'Dairy Pellets',
      category: 'feed',
      quantity: 100,
      unit: 'bags',
      reorderLevel: 10,
      reorderQuantity: 50,
      unitCost: 25,
      supplier: 'Farm Supply Co',
    },
    create: {
      farmId: farm.id,
      code: 'FEED001',
      name: 'Dairy Pellets',
      category: 'feed',
      quantity: 100,
      unit: 'bags',
      reorderLevel: 10,
      reorderQuantity: 50,
      unitCost: 25,
      supplier: 'Farm Supply Co',
    },
  });

  console.log('Inventory items created');

  console.log('Database seeding completed!');
  console.log('Seed administrator created from SEED_ADMIN_EMAIL.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
