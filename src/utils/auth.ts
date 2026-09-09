import jwt from 'jsonwebtoken';
import type { NextApiRequest } from 'next';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export interface AuthenticatedRequester {
  userId: string;
  email: string;
  role: string;
  farmId: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// Verifies the JWT signature/expiry and re-derives the requester's farm from the database,
// so a client can never impersonate another farm by supplying a different farmId.
export async function authenticateRequest(req: NextApiRequest): Promise<AuthenticatedRequester | null> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;

  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as TokenPayload;
  } catch {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.active || !user.farmId) return null;

  return { userId: user.id, email: user.email, role: user.role, farmId: user.farmId };
}
