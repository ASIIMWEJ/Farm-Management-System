import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Animal } from '@prisma/client';
import type { ApiResponse, PaginatedResponse } from '@/types';
import { authenticateRequest } from '@/utils/auth';

// Singleton instance to prevent connection leaks during Next.js hot reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
};

const MAX_IMAGE_DATA_LENGTH = 7_000_000;

function isValidImageData(imageData: unknown): imageData is string {
  return typeof imageData === 'string'
    && imageData.length <= MAX_IMAGE_DATA_LENGTH
    && /^data:image\/(jpeg|png|webp|gif);base64,/.test(imageData);
}

async function validateParentage(farmId: string, damId?: string, sireId?: string, animalId?: string) {
  if (animalId && (damId === animalId || sireId === animalId)) {
    return 'An animal cannot be its own parent.';
  }

  const parentIds = [damId, sireId].filter((parentId): parentId is string => Boolean(parentId));
  if (!parentIds.length) return null;

  const parents = await prisma.animal.findMany({
    where: { id: { in: parentIds }, farmId },
    select: { id: true, gender: true },
  });
  const parentsById = new Map(parents.map((parent) => [parent.id, parent]));

  if (damId && parentsById.get(damId)?.gender.toUpperCase() !== 'FEMALE') {
    return 'Please select a female animal from this farm as the mother.';
  }
  if (sireId && parentsById.get(sireId)?.gender.toUpperCase() !== 'MALE') {
    return 'Please select a male animal from this farm as the father.';
  }

  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PaginatedResponse<Animal> | Animal | null>>
) {
  const { method } = req;
  const { id } = req.query;

  try {
    const requester = await authenticateRequest(req);
    if (!requester) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Tenant identity resolution — always the authenticated user's own farm, never client-supplied
    const farmId = requester.farmId;

    // Standard relational include object for mother and father details
    const pedigreeIncludes = {
      damAnimal: { select: { id: true, earTag: true, name: true } },
      sireAnimal: { select: { id: true, earTag: true, name: true } },
    };

    // 2. HTTP Method Routing
    switch (method) {
      case 'GET': {
        try {
          if (id) {
            const animal = await prisma.animal.findUnique({
              where: { id: id as string },
              include: {
                ...pedigreeIncludes,
                dairyRecords: { take: 10, orderBy: { recordDate: 'desc' } },
                healthRecords: { take: 10, orderBy: { recordDate: 'desc' } },
                breedingRecords: { take: 5, orderBy: { dateOfBreeding: 'desc' } },
                weightHistory: { take: 10, orderBy: { date: 'desc' } },
              },
            });

            if (!animal) {
              return res.status(404).json({ success: false, error: 'Animal record not found' });
            }

            return res.status(200).json({ success: true, data: animal as any });
          }

          const page = Math.max(1, parseInt(req.query.page as string) || 1);
          const pageSize = Math.max(1, parseInt(req.query.pageSize as string) || 20);
          const skip = (page - 1) * pageSize;

          const [animals, total] = await Promise.all([
            prisma.animal.findMany({
              where: { farmId },
              skip,
              take: pageSize,
              include: pedigreeIncludes,
              orderBy: { createdAt: 'desc' },
            }),
            prisma.animal.count({ where: { farmId } }),
          ]);

          return res.status(200).json({
            success: true,
            data: {
              data: animals as any,
              total,
              page,
              pageSize,
              totalPages: Math.ceil(total / pageSize),
            },
          });
        } catch (dbError: any) {
          console.error('[DATABASE GET ERROR]:', dbError);
          return res.status(500).json({
            success: false,
            error: 'Failed to retrieve animal records from database.',
          });
        }
      }

      case 'POST': {
        try {
          const {
            earTag,
            name,
            species,
            breed,
            gender,
            dateOfBirth,
            acquisitionDate,
            acquisitionCost,
            damId,
            sireId,
            dam,
            sire,
            imageData,
            rfidTag,
            color,
            markings,
            weight,
            height,
            chest,
            locationBuilding,
            purchaseFrom,
          } = req.body;

          if (!earTag) {
            return res.status(400).json({ success: false, error: 'Ear Tag / ID is required' });
          }

          if (imageData && !isValidImageData(imageData)) {
            return res.status(400).json({ success: false, error: 'Upload a PNG, JPEG, WebP, or GIF image smaller than 5 MB.' });
          }

          const parentageError = await validateParentage(farmId, damId, sireId);
          if (parentageError) {
            return res.status(400).json({ success: false, error: parentageError });
          }

          const existingAnimal = await prisma.animal.findUnique({
            where: { earTag },
          });

          if (existingAnimal) {
            return res.status(400).json({
              success: false,
              error: `An animal with Ear Tag '${earTag}' is already registered.`,
            });
          }

          const animal = await prisma.animal.create({
            data: {
              farmId,
              earTag,
              name: name || undefined,
              species: species || 'CATTLE',
              breed: breed || undefined,
              gender: gender || 'FEMALE',
              status: 'ACTIVE',
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
              acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : new Date(),
              acquisitionCost: acquisitionCost ? parseFloat(acquisitionCost) : 0,
              damId: damId || undefined,
              sireId: sireId || undefined,
              dam: dam || undefined,
              sire: sire || undefined,
              imageData: imageData || undefined,
              rfidTag: rfidTag || undefined,
              color: color || undefined,
              markings: markings || undefined,
              weight: weight ? parseFloat(weight) : undefined,
              height: height ? parseFloat(height) : undefined,
              chest: chest ? parseFloat(chest) : undefined,
              locationBuilding: locationBuilding || undefined,
              purchaseFrom: purchaseFrom || undefined,
            },
            include: pedigreeIncludes,
          });

          return res.status(201).json({ success: true, data: animal as any });
        } catch (dbError: any) {
          console.error('[DATABASE POST ERROR]:', dbError);
          return res.status(500).json({
            success: false,
            error: 'Failed to create animal record.',
          });
        }
      }

      case 'PUT': {
        try {
          if (!id) {
            return res.status(400).json({ success: false, error: 'Animal ID is required' });
          }

          // Format incoming dates and optional relationships safely
          const { dateOfBirth, acquisitionDate, damId, sireId, imageData, ...rest } = req.body;

          if (imageData && !isValidImageData(imageData)) {
            return res.status(400).json({ success: false, error: 'Upload a PNG, JPEG, WebP, or GIF image smaller than 5 MB.' });
          }

          const parentageError = await validateParentage(farmId, damId, sireId, id as string);
          if (parentageError) {
            return res.status(400).json({ success: false, error: parentageError });
          }

          const updateData: any = { ...rest };
          if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
          if (acquisitionDate) updateData.acquisitionDate = new Date(acquisitionDate);
          if (updateData.acquisitionCost !== undefined) {
            updateData.acquisitionCost = updateData.acquisitionCost === '' ? null : parseFloat(updateData.acquisitionCost);
          }
          for (const numericField of ['weight', 'height', 'chest']) {
            if (updateData[numericField] !== undefined) {
              updateData[numericField] = updateData[numericField] === '' ? null : parseFloat(updateData[numericField]);
            }
          }
          if (imageData !== undefined) updateData.imageData = imageData || null;
          
          if (damId !== undefined) updateData.damId = damId || null;
          if (sireId !== undefined) updateData.sireId = sireId || null;

          const animal = await prisma.animal.update({
            where: { id: id as string },
            data: updateData,
            include: pedigreeIncludes,
          });

          return res.status(200).json({ success: true, data: animal as any });
        } catch (dbError: any) {
          console.error('[DATABASE PUT ERROR]:', dbError);
          return res.status(500).json({
            success: false,
            error: 'Failed to update animal record.',
          });
        }
      }

      case 'DELETE': {
        try {
          if (!id) {
            return res.status(400).json({ success: false, error: 'Animal ID is required' });
          }

          await prisma.animal.update({
            where: { id: id as string },
            data: { status: 'SOLD' },
          });

          return res.status(200).json({ success: true, data: null });
        } catch (dbError: any) {
          console.error('[DATABASE DELETE ERROR]:', dbError);
          return res.status(500).json({
            success: false,
            error: 'Failed to archive animal record.',
          });
        }
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
  } catch (globalError: any) {
    console.error('[SERVER API UNHANDLED FATAL ERROR]:', globalError);
    return res.status(500).json({
      success: false,
      error: globalError.message || 'An unexpected internal server error occurred.',
    });
  }
}