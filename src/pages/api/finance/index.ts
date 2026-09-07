import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { Transaction } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PaginatedResponse<Transaction> | Transaction>>
) {
  const { method } = req;
  const { id } = req.query;

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const farmId = req.query.farmId as string;
    if (!farmId) {
      return res.status(400).json({ success: false, error: 'Farm ID is required' });
    }

    switch (method) {
      case 'GET': {
        if (id) {
          const transaction = await prisma.transaction.findUnique({
            where: { id: id as string },
            include: { customer: true },
          });

          if (!transaction || transaction.farmId !== farmId) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
          }

          return res.status(200).json({ success: true, data: transaction });
        }

        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;
        const skip = (page - 1) * pageSize;

        const [transactions, total] = await Promise.all([
          prisma.transaction.findMany({
            where: { farmId },
            skip,
            take: pageSize,
            include: { customer: true },
            orderBy: { date: 'desc' },
          }),
          prisma.transaction.count({ where: { farmId } }),
        ]);

        return res.status(200).json({
          success: true,
          data: {
            data: transactions,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
          },
        });
      }

      case 'POST': {
        const {
          transactionType,
          category,
          description,
          amount,
          date,
          customerId,
        } = req.body;

        const transaction = await prisma.transaction.create({
          data: {
            farmId,
            transactionType,
            category,
            description,
            amount,
            date: new Date(date),
            customerId,
            status: 'COMPLETED',
          },
        });

        return res.status(201).json({ success: true, data: transaction });
      }

      case 'PUT': {
        if (!id) {
          return res.status(400).json({ success: false, error: 'Transaction ID is required' });
        }

        const existingTransaction = await prisma.transaction.findFirst({
          where: { id: id as string, farmId },
        });
        if (!existingTransaction) {
          return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        const { transactionType, category, description, amount, date, customerId } = req.body;
        const parsedAmount = Number(amount);
        const parsedDate = new Date(date);
        if (!['INCOME', 'EXPENSE'].includes(transactionType) || !category || !description || !Number.isFinite(parsedAmount) || parsedAmount < 0 || Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({ success: false, error: 'Provide a valid transaction type, category, description, amount, and date' });
        }

        const transaction = await prisma.transaction.update({
          where: { id: id as string },
          data: {
            transactionType,
            category,
            description,
            amount: parsedAmount,
            date: parsedDate,
            customerId: customerId || null,
          },
        });

        return res.status(200).json({ success: true, data: transaction });
      }

      case 'DELETE': {
        if (!id) {
          return res.status(400).json({ success: false, error: 'Transaction ID is required' });
        }

        await prisma.transaction.delete({
          where: { id: id as string },
        });

        return res.status(200).json({ success: true, message: 'Transaction deleted' });
      }

      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Finance API error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred processing your request',
    });
  } finally {
    await prisma.$disconnect();
  }
}
