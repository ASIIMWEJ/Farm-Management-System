import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import type { ApiResponse, DashboardStats } from '@/types';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<DashboardStats>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get authorization token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Get farm ID from query or token (simplified for now)
    const farmId = req.query.farmId as string;

    if (!farmId) {
      return res.status(400).json({ success: false, error: 'Farm ID is required' });
    }

    // Fetch dashboard statistics
    const totalAnimals = await prisma.animal.count({
      where: { farmId, status: 'ACTIVE' },
    });

    const animals = await prisma.animal.groupBy({
      by: ['species'],
      where: { farmId, status: 'ACTIVE' },
      _count: true,
    });

    const animalsByCategory: { [key: string]: number } = {};
    animals.forEach((item) => {
      animalsByCategory[item.species] = item._count;
    });

    // Get daily milk production (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dairyRecords = await prisma.dairyRecord.aggregate({
      where: {
        animal: { farmId },
        recordDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: {
        totalMilk: true,
      },
    });

    const dailyMilkProduction = dairyRecords._sum.totalMilk || 0;

    // Get active employees
    const activeEmployees = await prisma.employee.count({
      where: { farmId, status: 'ACTIVE' },
    });

    // Get monthly revenue and expenses
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const income = await prisma.transaction.aggregate({
      where: {
        farmId,
        transactionType: 'INCOME',
        date: {
          gte: currentMonth,
          lt: nextMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const expenses = await prisma.transaction.aggregate({
      where: {
        farmId,
        transactionType: 'EXPENSE',
        date: {
          gte: currentMonth,
          lt: nextMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const stats: DashboardStats = {
      totalAnimals,
      animalsByCategory,
      dailyMilkProduction,
      activeEmployees,
      monthlyRevenue: income._sum.amount || 0,
      monthlyExpenses: expenses._sum.amount || 0,
    };

    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
    });
  } finally {
    await prisma.$disconnect();
  }
}
