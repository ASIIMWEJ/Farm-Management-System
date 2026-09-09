import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, DairyRecord } from '@prisma/client';
import type { ApiResponse, PaginatedResponse } from '@/types';
import { authenticateRequest } from '@/utils/auth';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PaginatedResponse<DairyRecord> | DairyRecord | null>>
) {
  const { method } = req;
  const { id } = req.query;

  try {
    const requester = await authenticateRequest(req);
    if (!requester) {
      return res.status(401).json({ success: false, error: 'Unauthorized access' });
    }

    switch (method) {
      case 'GET': {
        if (id) {
          const record = await prisma.dairyRecord.findUnique({
            where: { id: id as string },
            include: { animal: true },
          });

          if (!record) {
            return res.status(404).json({ success: false, error: 'Record not found' });
          }

          return res.status(200).json({ success: true, data: record });
        }

        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;
        const skip = (page - 1) * pageSize;
        const animalId = req.query.animalId as string;

        const [records, total] = await Promise.all([
          prisma.dairyRecord.findMany({
            where: animalId ? { animalId } : {},
            skip,
            take: pageSize,
            include: { animal: true },
            orderBy: { recordDate: 'desc' },
          }),
          prisma.dairyRecord.count({
            where: animalId ? { animalId } : {},
          }),
        ]);

        return res.status(200).json({
          success: true,
          data: {
            data: records,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
          },
        });
      }

      case 'POST': {
        const { animalId, recordDate, morningMilk, eveningMilk, quality, fat, protein, somatic } = req.body;

        if (!animalId) {
          return res.status(400).json({ success: false, error: 'Animal ID is required' });
        }

        const animal = await prisma.animal.findFirst({
          where: {
            OR: [{ id: animalId }, { earTag: animalId }],
          },
        });
        if (!animal) {
          return res.status(404).json({ success: false, error: 'Animal not found' });
        }

        // Parse numerical values to prevent string concatenation bugs
        const morning = parseFloat(morningMilk) || 0;
        const evening = parseFloat(eveningMilk) || 0;
        const totalMilk = morning + evening;

        const record = await prisma.dairyRecord.create({
          data: {
            animalId: animal.id,
            recordDate: recordDate ? new Date(recordDate) : new Date(),
            morningMilk: morning,
            eveningMilk: evening,
            totalMilk,
            quality: quality || 'GOOD',
            fat: fat === '' || fat === undefined ? null : parseFloat(fat),
            protein: protein === '' || protein === undefined ? null : parseFloat(protein),
            somatic: somatic === '' || somatic === undefined ? null : parseFloat(somatic),
          },
        });

        return res.status(201).json({ success: true, data: record });
      }

      case 'PUT': {
        if (!id) {
          return res.status(400).json({ success: false, error: 'Record ID is required' });
        }

        const { morningMilk, eveningMilk, quality, fat, protein, somatic } = req.body;
        const morning = parseFloat(morningMilk) || 0;
        const evening = parseFloat(eveningMilk) || 0;
        const totalMilk = morning + evening;

        const record = await prisma.dairyRecord.update({
          where: { id: id as string },
          data: {
            morningMilk: morning,
            eveningMilk: evening,
            totalMilk,
            quality,
            fat: fat === '' || fat === undefined ? null : parseFloat(fat),
            protein: protein === '' || protein === undefined ? null : parseFloat(protein),
            somatic: somatic === '' || somatic === undefined ? null : parseFloat(somatic),
          },
        });

        return res.status(200).json({ success: true, data: record });
      }

      case 'DELETE': {
        if (!id) {
          return res.status(400).json({ success: false, error: 'Record ID is required' });
        }

        await prisma.dairyRecord.delete({
          where: { id: id as string },
        });

        return res.status(200).json({ success: true, data: null });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Dairy API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred processing your request',
    });
  } finally {
    await prisma.$disconnect();
  }
}