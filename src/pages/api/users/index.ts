import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { ApiResponse } from '@/types';

const prisma = new PrismaClient();
const managers = new Set<UserRole>(['ADMIN', 'FARM_OWNER', 'FARM_MANAGER']);

type TokenPayload = { userId: string; role: UserRole };

function getRequester(req: NextApiRequest): TokenPayload | null {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as TokenPayload;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<unknown>>) {
  const requester = getRequester(req);
  if (!requester || !managers.has(requester.role)) {
    return res.status(403).json({ success: false, error: 'You do not have permission to manage users.' });
  }

  const requestingUser = await prisma.user.findUnique({ where: { id: requester.userId } });
  if (!requestingUser?.farmId) {
    return res.status(403).json({ success: false, error: 'A farm assignment is required to manage users.' });
  }

  if (req.method === 'GET') {
    const users = await prisma.user.findMany({
      where: { farmId: requestingUser.farmId },
      select: { id: true, fullName: true, email: true, role: true, active: true, lastLogin: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ success: true, data: users });
  }

  if (req.method === 'POST') {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Name, email, password, and role are required.' });
    }
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role.' });
    }
    if (role === 'ADMIN' && requester.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Only an administrator can create another administrator.' });
    }

    try {
      const user = await prisma.user.create({
        data: { fullName, email: email.toLowerCase(), password: await bcrypt.hash(password, 10), role, farmId: requestingUser.farmId },
        select: { id: true, fullName: true, email: true, role: true, active: true },
      });
      return res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      if (error.code === 'P2002') return res.status(409).json({ success: false, error: 'A user with this email already exists.' });
      throw error;
    }
  }

  if (req.method === 'PUT') {
    const userId = req.query.id as string;
    const { password, role } = req.body;
    if (!userId || (!password && !role)) {
      return res.status(400).json({ success: false, error: 'A user ID and an update are required.' });
    }
    if (password && password.length < 6) {
      return res.status(400).json({ success: false, error: 'The password must be at least 6 characters.' });
    }
    if (role && !Object.values(UserRole).includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role.' });
    }
    if (role === 'ADMIN' && requester.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Only an administrator can assign the administrator role.' });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, farmId: requestingUser.farmId },
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found for this farm.' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: password ? await bcrypt.hash(password, 10) : undefined,
        role: role || undefined,
      },
    });
    return res.status(200).json({ success: true, data: null, message: password ? 'Password reset successfully.' : 'User role updated successfully.' });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT']);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}