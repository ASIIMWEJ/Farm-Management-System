import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { HealthRecord } from '@prisma/client';
import { authenticateRequest } from '@/utils/auth';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PaginatedResponse<HealthRecord> | HealthRecord>>
) {
  const { method } = req;
  const { id } = req.query;

  try {
    const requester = await authenticateRequest(req);
    if (!requester) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    switch (method) {
      case 'GET': {
        if (id) {
          const record = await prisma.healthRecord.findUnique({
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
          prisma.healthRecord.findMany({
            where: animalId ? { animalId } : {},
            skip,
            take: pageSize,
            include: { animal: true },
            orderBy: { recordDate: 'desc' },
          }),
          prisma.healthRecord.count({
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
        const {
          animalId,
          recordType,
          recordDate,
          disease,
          diagnosis,
          treatment,
          vaccineType,
          veterinarian,
          cost,
        } = req.body;

        const record = await prisma.healthRecord.create({
          data: {
            animalId,
            recordType,
            recordDate: new Date(recordDate),
            disease,
            diagnosis,
            treatment,
            vaccineType,
            veterinarian,
            cost,
          },
        });

        return res.status(201).json({ success: true, data: record });
      }

      case 'PUT': {
        if (!id) {
          return res.status(400).json({ success: false, error: 'Record ID is required' });
        }

        const record = await prisma.healthRecord.update({
          where: { id: id as string },
          data: req.body,
        });

        return res.status(200).json({ success: true, data: record });
      }

      case 'DELETE': {
        if (!id) {
          return res.status(400).json({ success: false, error: 'Record ID is required' });
        }

        await prisma.healthRecord.delete({
          where: { id: id as string },
        });

        return res.status(200).json({ success: true, message: 'Record deleted' });
      }

      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Health API error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred processing your request',
    });
  } finally {
    await prisma.$disconnect();
  }
}
