import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import type { ApiResponse } from '@/types';

const prisma = new PrismaClient();

function farmIdFromRequest(req: NextApiRequest) {
  if (!req.headers.authorization?.startsWith('Bearer ')) return null;
  return req.query.farmId as string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<unknown>>) {
  const farmId = farmIdFromRequest(req);
  if (!farmId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const id = req.query.id as string;

  if (req.method === 'GET') {
    const records = await prisma.breedingRecord.findMany({
      where: { animal: { farmId } }, include: { animal: { select: { earTag: true, name: true, species: true } } }, orderBy: { dateOfBreeding: 'desc' },
    });
    return res.status(200).json({ success: true, data: records });
  }

  if (req.method === 'POST') {
    const { animalId, breedingType, dateOfBreeding, technician, semen, sireId, pregnancyStatus, expectedCalving, notes } = req.body;
    const animal = await prisma.animal.findFirst({ where: { farmId, OR: [{ id: animalId }, { earTag: animalId }] } });
    if (!animal || !breedingType || !dateOfBreeding) return res.status(400).json({ success: false, error: 'Animal, breeding type, and breeding date are required.' });
    if (breedingType === 'NATURAL_MATING') {
      const sire = await prisma.animal.findFirst({ where: { id: sireId, farmId, gender: 'MALE', status: 'ACTIVE' } });
      if (!sire) return res.status(400).json({ success: false, error: 'Select an active male animal from this farm for natural mating.' });
    }
    const breedingDate = new Date(dateOfBreeding);
    const gestationDays: Record<string, number> = { CATTLE: 283, COW: 283, GOAT: 150, SHEEP: 147, PIG: 114 };
    const dueDate = expectedCalving ? new Date(expectedCalving) : new Date(breedingDate.getTime() + (gestationDays[animal.species.toUpperCase()] || 150) * 86400000);
    const record = await prisma.breedingRecord.create({ data: { animalId: animal.id, breedingType, dateOfBreeding: breedingDate, technician, semen, sireId, pregnancyStatus: pregnancyStatus || 'UNKNOWN', expectedCalving: dueDate, notes }, include: { animal: { select: { earTag: true, name: true, species: true } } } });
    return res.status(201).json({ success: true, data: record });
  }

  if (req.method === 'PUT' && id) {
    const record = await prisma.breedingRecord.findFirst({ where: { id, animal: { farmId } } });
    if (!record) return res.status(404).json({ success: false, error: 'Breeding record not found.' });
    const { pregnancyStatus, expectedCalving, actualCalvingDate, calvesNumber, notes } = req.body;
    const updated = await prisma.breedingRecord.update({ where: { id }, data: { pregnancyStatus, expectedCalving: expectedCalving ? new Date(expectedCalving) : undefined, actualCalvingDate: actualCalvingDate ? new Date(actualCalvingDate) : undefined, calvesNumber: calvesNumber ? Number(calvesNumber) : undefined, notes } });
    return res.status(200).json({ success: true, data: updated });
  }

  if (req.method === 'DELETE' && id) {
    const record = await prisma.breedingRecord.findFirst({ where: { id, animal: { farmId } } });
    if (!record) return res.status(404).json({ success: false, error: 'Breeding record not found.' });
    await prisma.breedingRecord.delete({ where: { id } });
    return res.status(200).json({ success: true, data: null });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}