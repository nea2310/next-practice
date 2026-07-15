// lib/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { users } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const TOKEN_EXPIRY = '1h';

export function generateToken(user: { id: string; username: string }) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { id: string; username: string };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function findUserByUsername(username: string) {
  return users.find((u) => u.username === username);
}

// Установка httpOnly cookie с токеном
export async function setAuthCookie(token: string) {
  (await cookies()).set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 час
  });
}

// Удаление cookie (выход)
export async function clearAuthCookie() {
  (await cookies()).delete('token');
}

// Получение токена из cookie (на сервере)
export async function getAuthToken() {
  return (await cookies()).get('token')?.value;
}

// Проверка, авторизован ли пользователь (на сервере)
export async function isAuthenticated() {
  const token = await getAuthToken();
  if (!token) return false;
  try {
    verifyToken(token);
    return true;
  } catch {
    return false;
  }
}

export async function getCurrentUser() {
  const token = await getAuthToken();
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
