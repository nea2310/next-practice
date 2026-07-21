import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } });
}

export async function createUser(username: string, password: string) {
  const hash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { username, passwordHash: hash },
  });
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: { id: string; username: string }) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}

export async function setAuthCookie(token: string) {
  (await cookies()).set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });
}

export async function clearAuthCookie() {
  (await cookies()).delete('token');
}

export async function getCurrentUser() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; username: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function getAuthToken() {
  return (await cookies()).get('token')?.value;
}

// ---- Проверка JWT (новая функция) ----
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; username: string };
  } catch {
    return null;
  }
}

// ---- Проверка авторизации (для Server Components) ----
export async function isAuthenticated() {
  const token = await getAuthToken();
  if (!token) return false;
  const decoded = verifyToken(token);
  return decoded !== null;
}