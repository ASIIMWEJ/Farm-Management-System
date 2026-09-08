import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const genericMessage = 'If an account exists for that email, a password reset link has been sent.';

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function sendResetEmail(email: string, resetUrl: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP is not configured for password recovery.');
  }

  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER.trim(),
      pass: process.env.SMTP_PASS.replace(/\s+/g, ''),
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Reset your FMIS password',
    text: `Use this link to reset your FMIS password. It expires in one hour: ${resetUrl}`,
    html: `<p>Use the link below to reset your FMIS password. It expires in one hour.</p><p><a href="${resetUrl}">Reset password</a></p>`,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user && user.active) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
        await prisma.passwordResetToken.create({
          data: {
            tokenHash: hashToken(rawToken),
            userId: user.id,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        });

        const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
        await sendResetEmail(user.email, `${appUrl}/reset-password?token=${rawToken}`);
      }
    }

    return res.status(200).json({ success: true, message: genericMessage });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(200).json({ success: true, message: genericMessage });
  } finally {
    await prisma.$disconnect();
  }
}
