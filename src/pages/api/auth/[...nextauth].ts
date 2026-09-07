import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Singleton instance to prevent connection leaks during Next.js hot reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Fallback secret for development
export const secret = process.env.NEXTAUTH_SECRET || 'fallback-development-secret-key-12345';

const isProduction = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthOptions = {
  secret,
  // Enforce explicit cookie naming to eliminate HTTP vs HTTPS issues
  useSecureCookies: isProduction,
  cookies: {
    sessionToken: {
      name: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('[AUTH ERROR]: Missing email or password credentials');
            throw new Error('Missing email or password');
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            console.error(`[AUTH ERROR]: No user found for email: ${credentials.email}`);
            throw new Error('Invalid email or password');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.error(`[AUTH ERROR]: Password mismatch for user: ${credentials.email}`);
            throw new Error('Invalid email or password');
          }

          return {
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role,
            farmId: (user as any).farmId || 'default-farm',
          };
        } catch (error: any) {
          console.error('[AUTH AUTHORIZE CATCH]:', error.message || error);
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id;
          token.role = (user as any).role;
          token.farmId = (user as any).farmId || 'default-farm';
        }
        return token;
      } catch (error) {
        console.error('[AUTH JWT CALLBACK ERROR]:', error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          (session.user as any).id = token.id;
          (session.user as any).role = token.role;
          (session.user as any).farmId = token.farmId;
        }
        return session;
      } catch (error) {
        console.error('[AUTH SESSION CALLBACK ERROR]:', error);
        return session;
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  logger: {
    error(code, metadata) {
      console.error('[NEXTAUTH ERROR CODE]:', code, metadata);
    },
    warn(code) {
      console.warn('[NEXTAUTH WARN CODE]:', code);
    },
    debug(code, metadata) {
      console.log('[NEXTAUTH DEBUG]:', code, metadata);
    },
  },
};

export default NextAuth(authOptions);