import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { InventoryItem } from '@prisma/client';
import { authenticateRequest } from '@/utils/auth';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PaginatedResponse<InventoryItem> | InventoryItem>>
) {
  const { method } = req;
  const { id } = req.query;

  try {
    const requester = await authenticateRequest(req);
    if (!requester) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const farmId = requester.farmId;

    switch (method) {
      case 'GET': {
        if (id) {
          const item = await prisma.inventoryItem.findUnique({
            where: { id: id as string },
            include: { movements: { take: 20, orderBy: { date: 'desc' } } },
          });

          if (!item || item.farmId !== farmId) {
            return res.status(404).json({ success: false, error: 'Item not found' });
          }

          return res.status(200).json({ success: true, data: item });
        }

        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;
        const skip = (page - 1) * pageSize;

        const [items, total] = await Promise.all([
          prisma.inventoryItem.findMany({
            where: { farmId },
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.inventoryItem.count({ where: { farmId } }),
        ]);

        return res.status(200).json({
          success: true,
          data: {
            data: items,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
          },
        });
      }

      case 'POST': {
        const {
          code,
          name,
          category,
          quantity,
          unit,
          reorderLevel,
          unitCost,
          supplier,
        } = req.body;

        const item = await prisma.inventoryItem.create({
          data: {
            farmId,
            code,
            name,
            category,
            quantity,
            unit,
            reorderLevel,
            reorderQuantity: quantity,
            unitCost,
            supplier,
          },
        });

        return res.status(201).json({ success: true, data: item });
      }

      case 'PUT': {
        if (!id) {
          return res.status(400).json({ success: false, error: 'Item ID is required' });
        }

        const item = await prisma.inventoryItem.update({
          where: { id: id as string },
          data: req.body,
        });

        return res.status(200).json({ success: true, data: item });
      }

      case 'DELETE': {
        if (!id) {
          return res.status(400).json({ success: false, error: 'Item ID is required' });
        }

        await prisma.inventoryItem.delete({
          where: { id: id as string },
        });

        return res.status(200).json({ success: true, message: 'Item deleted' });
      }

      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Inventory API error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred processing your request',
    });
  } finally {
    await prisma.$disconnect();
  }
}
